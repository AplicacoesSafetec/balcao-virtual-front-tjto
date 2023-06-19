import { useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSession, useSession } from 'next-auth/client';
import { AuthContext } from 'context/AuthContext';
import Layout, { siteTitle } from 'components/Layout';
import Button from 'components/Button';
import {
  Container,
  CardAtendimento,
  CardData,
  DataAreaAtendimento,
  DataArea,
  Label,
  Data,
  LinkMeetChat,
  Title,
} from './styles';
import { GetServerSideProps } from 'next';
import axios from 'axios';
import { toast } from 'react-toastify';
import Chatbot from 'components/Chatbot';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from 'service/firebase';
import { uuid } from 'uuidv4';

interface IAttendanceProps {
  attendance_protocol_id: string;
  attendance_meet_id: string;
  attendance_calendar_event_id: string;
  attendant_email: string;
  queue_user_email: string;
  queue_user_name: string;
  queue_user_phone: string;
  desk_id: string;
  desk_name: string;
  created_at: Date;
  attendance_type_is_chat: boolean;
}

export default function Atendimento(attendance: IAttendanceProps) {
  const { desk_id, socket, signIn, setAttendanceProtocolIdState } =
    useContext(AuthContext);

  setAttendanceProtocolIdState(attendance.attendance_protocol_id);

  const router = useRouter();
  const [session] = useSession();

  const [loading, setLoading] = useState<boolean>(false);
  const [redirectTo, setRedirectTo] = useState<string>(null);

const startService = () => {
  const messageRef = doc(db, attendance.attendance_protocol_id, uuid());
  
  setDoc(messageRef, {
    text: `Seu atendimento foi iniciado por ${session.user.name}`,
    createdAt: serverTimestamp(),
    id: uuid(),
    displayName: session.user.name,
    user: 'teste',
  });
  
  router.push({
    pathname: '/atendente/newChat/', query: {
      protocol: attendance.attendance_protocol_id,
      viewOnly: false,
      userData: JSON.stringify({
        userName: attendance.queue_user_name,
        userEmail: attendance.queue_user_email,
        userPhone: attendance.queue_user_phone
      })
    },
  })
}

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    if (!redirectTo) {
      if (attendance && socket) {
        socket.emit('connectToAttendance', attendance.attendance_protocol_id);

        socket.on('attendanceEnded', () => {
          toast.info('Atendimento encerrado!', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        });
      }
    }
  }, [attendance, socket, redirectTo]);

  useEffect(() => {
    if (!redirectTo) {
      if (!attendance) {
        setRedirectTo('/atendente/fila');
      }

      if (typeof window !== 'undefined' && (!session || !desk_id)) {
        setRedirectTo('/atendente/login');
      }
    }
  }, [redirectTo, attendance, session, desk_id]);

  useEffect(() => {
    if (!redirectTo) {
      if (!socket) {
        const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);

        signIn({ desk_id }, socket);
      }
    }
  }, [socket, redirectTo, signIn, desk_id]);

  const navigateToChat = () => {
   
  }

  const handleClick = useCallback(async () => {
    setLoading(true);

    if (socket && attendance && session) {
      socket.emit('endAttendance', {
        email: session.user.email,
        is_attendant: true,
      });
    }
  }, [session, socket, attendance]);

  return (
    <Layout>
      <Head>
        <title>{siteTitle} - Atendimento</title>
      </Head>
      <Container>
        {/* <Chatbot shouldHideInput /> */}

        <CardData>
          <Title style={{ width: '100%' }}>Dados do solicitante</Title>
          <DataAreaAtendimento>
            <DataArea>
              <Label id="label-name" htmlFor="name">
                Nome
              </Label>
              <Data aria-labelledby="label-name" id="name">
                {attendance.queue_user_name}
              </Data>
            </DataArea>

            <DataArea>
              <Label id="label-email" htmlFor="email">
                Email
              </Label>
              <Data aria-labelledby="label-email" id="email">
                {attendance.queue_user_email}
              </Data>
            </DataArea>

            <DataArea>
              <Label id="label-phone" htmlFor="phone">
                Telefone
              </Label>
              <Data aria-labelledby="label-phone" id="phone">
                {attendance.queue_user_phone}
              </Data>
            </DataArea>
          </DataAreaAtendimento>
        </CardData>
        {attendance.attendance_type_is_chat ? (
          <LinkMeetChat
          rel="noopener noreferrer"
          onClick={startService}
          target="_blank"
        >
          Falar via Chat
        </LinkMeetChat>
        ) : (
          <LinkMeetChat
          href={
            attendance?.attendance_meet_id
              ? `https://meet.google.com/${attendance.attendance_meet_id}`
              : null
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          Link do meet
        </LinkMeetChat>
        )}
        
        <CardAtendimento>
          <Title>Atendimento</Title>
          <DataAreaAtendimento>
            <DataArea>
              <Label id="label-desk" htmlFor="desk">
                Balcão
              </Label>
              <Data aria-labelledby="label-desk" id="desk">
                {attendance.desk_name}
              </Data>
            </DataArea>
            <DataArea>
              <Label id="label-protocol" htmlFor="protocol">
                Protocolo
              </Label>
              <Data aria-labelledby="label-protocol" id="protocol">
                {attendance.attendance_protocol_id}
              </Data>
            </DataArea>
          </DataAreaAtendimento>
          <Button
            onClick={handleClick}
            color="secondary"
            layout="medium"
            disabled={loading}
          >
            Encerrar
          </Button>
        </CardAtendimento>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/attendance`,
      {
        params: { attendant_email: session.user.email },
      },
    );

    return {
      props: {
        ...response.data,
      },
    };
  } catch (e) {
    return {
      redirect: {
        permanent: false,
        destination: '/atendente/fila',
      },
    };
  }
};
