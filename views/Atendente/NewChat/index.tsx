import { useRouter } from 'next/router';
import Head from 'next/head';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout, { siteTitle } from 'components/Layout';
import { TopButtonArea } from 'components/Layout/styles';
import ChatRoom from 'components/NewChat';
import { Container, CardData, SidePanel, ChatArea } from './styles';
import { db } from 'service/firebase';
import Stack from '@mui/material/Stack';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Dialog } from '@mui/material';
import Transfer from '../Transfer';
import ButtonTransfer from 'components/Button';
import Button from 'components/Button';
import api from 'service/Api';
import { AuthContext } from 'context/AuthContext';
import { getSession, useSession } from 'next-auth/client';
import { GetServerSideProps } from 'next';

interface Desk {
  fieldName: string;
  displayName: string;
}

export type IDeskOption = {
  value: string;
  text: string;
};

export type Desks = {
  text: string;
  value: string;
};

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
}

interface IUserAttendance {
  userName: string;
  userEmail: string;
  userPhone: string;
}

export default function NewChat(attendance: IAttendanceProps) {
  const [desks, setDesks] = useState<Desks[]>([]);
  const [desksTeste, setDesksTeste] = useState<Desk[]>([]);
  const [redirectTo, setRedirectTo] = useState('');
  const router = useRouter();
  const { desk_id, socket } = useContext(AuthContext);
  const [session] = useSession();
  const { protocol, viewOnly, userData } = router.query;
  const [loading, setLoading] = useState<boolean>(false);

  const userAttendance: IUserAttendance = userData
    ? JSON.parse(userData as any)
    : {};

  const handleClick = useCallback(async () => {
    setLoading(true);

    if (socket && attendance && session) {
      socket.emit('endAttendance', {
        email: session.user.email,
        is_attendant: true,
      });
      setRedirectTo('fila');
    }
  }, [session, socket, attendance]);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  const aggregateOptionsLabels = (
    desksOptions: Map<string, IDeskOption[]>,
  ): IDeskOption[] => {
    const desksOptionsLabels: IDeskOption[] = [];

    const desksOptionsIterator = desksOptions.keys();

    let deskCategory = desksOptionsIterator.next().value;

    do {
      if (deskCategory) {
        desksOptionsLabels.push({
          text: deskCategory,
          value: deskCategory,
        });
      }

      deskCategory = desksOptionsIterator.next().value;
    } while (deskCategory);

    return desksOptionsLabels;
  };

  const aggregateOptions = (
    desk: Desk,
    desksOptions: Map<string, IDeskOption[]>,
    groupLabel: string,
    displayName: string,
  ): void => {
    const deskOptions = desksOptions.get(groupLabel);

    if (deskOptions) {
      deskOptions.push({
        value: desk.fieldName,
        text: displayName,
      });
    } else {
      desksOptions.set(groupLabel, [
        {
          value: desk.fieldName,
          text: displayName,
        },
      ]);
    }
  };

  async function loadDesks() {
    try {
      const { data } = await api.get('desks');
      const desks: Desks[] = data.map(
        (desk: { displayName: string; fieldName: string }) => {
          return {
            text: desk.displayName,
            value: desk.fieldName,
          };
        },
      );

      const teste = data.sort((desk1: Desk, desk2: Desk) =>
        desk1.displayName.localeCompare(desk2.displayName),
      );

      setDesksTeste(teste);

      setDesks(desks);
    } catch (error) {
      console.error(error);
    }
  }

  const options = useMemo(() => {
    const desksOptions: Map<string, IDeskOption[]> = new Map<
      string,
      IDeskOption[]
    >();

    let desksOptionsLabels: IDeskOption[] = [];

    desksTeste.forEach((desk) => {
      const separatedLabelAndOption = desk.displayName.split('/');

      if (separatedLabelAndOption.length > 1) {
        aggregateOptions(
          desk,
          desksOptions,
          separatedLabelAndOption.shift(),
          separatedLabelAndOption.join('/'),
        );
      } else {
        aggregateOptions(desk, desksOptions, 'Padrão', desk.displayName);
      }

      desksOptionsLabels = aggregateOptionsLabels(desksOptions);
    });

    return { desksCategories: desksOptionsLabels, deskOptions: desksOptions };
  }, [desksTeste]);

  useEffect(() => {
    loadDesks();
  }, []);

  const user = {
    displayName: session?.user?.name,
    email: session?.user?.email,
    phoneNumber: '',
    photoURL: session?.user?.image,
    providerId: 'dusiudsiduisduidsui',
    uid: '123',
    user: 'aleatorio',
    id: '123',
    protocol,
  };

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Layout>
      <Head>
        <title>{siteTitle} - Atendimento</title>
      </Head>
      <Container>
        {viewOnly === 'true' && (
          <TopButtonArea>
            <IconButton
              onClick={() => {
                router.replace('/admin/config');
              }}
            >
              <ArrowBackIcon style={{ color: 'white', fontSize: 80 }} />
            </IconButton>
          </TopButtonArea>
        )}
        <ChatArea>
          <CardData>
            <nav id="sign_out"></nav>
            <ChatRoom user={user} db={db} viewOnly={viewOnly} />
          </CardData>
          <SidePanel>
            <p className="header">Dados do Solicitante</p>

            <p className="topic">Nome</p>
            <p className="data">{userAttendance.userName}</p>

            <p className="topic">E-mail</p>
            <p className="data">{userAttendance.userEmail}</p>

            <p className="topic">Telefone</p>
            <p className="data">{userAttendance.userPhone}</p>

            <p className="topic">Protocolo</p>
            <p className="data">{protocol}</p>
          </SidePanel>
        </ChatArea>
        {viewOnly === 'false' && (
          <Stack spacing={2} direction="row">
            {/* <ButtonTransfer
              onClick={() => handleClickOpen()}
              color="secondary"
              style={{ backgroundColor: '#312fc2' }}
            >
              Transferir atendimento
            </ButtonTransfer> */}
            <Button onClick={() => handleClick()}>Encerrar atendimento</Button>
          </Stack>
        )}
      </Container>
      <Dialog open={open} onClose={handleClose}>
        <Transfer
          desks={desks}
          user={userAttendance}
          protocol={protocol}
          socket={socket}
          attendance={attendance}
          session={session}
          db={db}
        />
      </Dialog>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession(ctx);
  try {
    const response = await api.get(
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
  } catch (e) {}
};
