import { useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthContext, Rating } from 'context/AuthContext';
import axios from 'axios';
import Head from 'next/head';
import Layout, { siteTitle } from 'components/Layout';
import { useRouter } from 'next/router';
import Button from 'components/Button';
import {
  Container,
  CardData,
  Label,
  Data,
  Link,
  Title,
  WelcomeMessage,
} from './styles';

interface IAttendanceProps {
  attendance_protocol_id: string;
  attendance_meet_id: string;
  attendance_calendar_event_id: string;
  attendant_email: string;
  queue_user_name: string;
  queue_user_email: string;
  queue_user_phone: string;
  desk_id: string;
  desk_name: string;
  created_at: Date;
}

export default function Atendimento() {
  const {
    queue_user_name,
    queue_user_email,
    desk_id,
    queue_user_phone,
    socket,
    signIn,
    setTemporaryRating,
  } = useContext(AuthContext);

  const [attendance, setAttendance] = useState<IAttendanceProps>(null);
  const [redirectTo, setRedirectTo] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    if (!redirectTo) {
      if (attendance && socket) {
        socket.emit('connectToAttendance', attendance.attendance_protocol_id);

        const temporaryRating: Rating = { ...attendance };

        setTemporaryRating(temporaryRating);

        socket.on('attendanceEnded', () => {
          setLoading(true);

          setRedirectTo('/solicitante/avaliacao');
        });
      }
    }
  }, [redirectTo, attendance, socket, setTemporaryRating]);

  useEffect(() => {
    if (!redirectTo) {
      const loadAttendance = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/attendance`,
            {
              params: { queue_user_email },
            },
          );

          setAttendance(response.data);
          setLoading(false);
        } catch (e) {
          setRedirectTo('/solicitante/fila');
        }
      };

      if (queue_user_email) {
        loadAttendance();
      } else {
        setRedirectTo('/solicitante/login');
      }
    }
  }, [redirectTo, queue_user_email, setAttendance, setRedirectTo]);

  useEffect(() => {
    if (!redirectTo) {
      if (!socket) {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);

        signIn(
          {
            queue_user_email,
            desk_id,
            queue_user_name,
            queue_user_phone,
          },
          socket,
        );
      }
    }
  }, [
    desk_id,
    queue_user_email,
    queue_user_name,
    queue_user_phone,
    redirectTo,
    signIn,
    socket,
  ]);

  const handleClick = useCallback(async () => {
    setLoading(true);

    if (socket && attendance && queue_user_email) {
      socket.emit('endAttendance', {
        email: queue_user_email,
        is_attendant: false,
      });
    }
  }, [queue_user_email, socket, attendance]);

  return (
    <Layout>
      <Head>
        <title>{siteTitle} - Atendimento</title>
      </Head>
      <Container>
        <WelcomeMessage>
          Bem-vindo(a)
          {attendance?.queue_user_name && `, ${attendance?.queue_user_name}`}
        </WelcomeMessage>
        <CardData>
          <Title>Atendimento Iniciado</Title>
          <Label id="label-desk" htmlFor="desk">
            Balcão
          </Label>
          <Data aria-labelledby="label-desk" id="desk">
            {attendance?.desk_name || 'Carregando...'}
          </Data>
          <br />
          <Label id="label-protocol" htmlFor="protocol">
            Anote seu protocolo
          </Label>
          <Data aria-labelledby="label-protocol" id="protocol">
            {attendance?.attendance_protocol_id || 'Carregando...'}
          </Data>
          <Link
            href={
              !loading && attendance?.attendance_meet_id
                ? `https://meet.google.com/${attendance.attendance_meet_id}`
                : null
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {loading ? (
              <CircularProgress size={30} style={{ color: '#fff' }} />
            ) : (
              'Entrar na reunião'
            )}
          </Link>
        </CardData>
        <Button
          onClick={handleClick}
          color="secondary"
          layout="medium"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={30} style={{ color: '#777' }} />
          ) : (
            'Sair da Fila'
          )}
        </Button>
      </Container>
    </Layout>
  );
}
