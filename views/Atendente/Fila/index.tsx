import { useEffect, useState, useContext, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout, { siteTitle } from 'components/Layout';
import { io } from 'socket.io-client';
import CircularProgress from '@mui/material/CircularProgress';
import { useSession } from 'next-auth/client';
import Button from 'components/Button';
import { Number, Text } from 'components/Card';
import { AuthContext } from 'context/AuthContext';
import { Container, CardQueue, WelcomeMessage } from './styles';
import { toast } from 'react-toastify';
import Chatbot from 'components/Chatbot';

export default function Fila() {
  const {
    desk_id,
    socket,
    signIn,
    currentDeskIndexToAttend,
    setCurrentDeskIndexToAttend,
    loadIsAdmin,
    isAdmin,
  } = useContext(AuthContext);

  const router = useRouter();
  const [session, loadingSession] = useSession();

  const [queueSize, setQueueSize] = useState<number>(null);
  const [attendanceChecked, setAttendanceChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [redirectTo, setRedirectTo] = useState<string>(null);
  const { isRedirect } = router.query;

  useEffect(() => {
    loadIsAdmin();
  }, [loadIsAdmin]);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    if (!redirectTo) {
      if (!desk_id || !socket) {
        setRedirectTo('/atendente/login');
      } else if (!loadingSession) {
        if (!session) {
          setRedirectTo('/atendente/login');
        } else if (!attendanceChecked) {
          socket.emit('checkAttendance', {
            email: session.user.email,
            is_attendant: true,
          });

          setAttendanceChecked(true);
        }
      }
    }
  }, [
    attendanceChecked,
    setAttendanceChecked,
    loadingSession,
    socket,
    session,
    desk_id,
    redirectTo,
  ]);

  useEffect(() => {
    if (!redirectTo) {
      if (socket) {
        socket.on('attendance', (attendance: any) => {
          if (attendance) {
            const nextDeskIndexToAttend = currentDeskIndexToAttend + 1;

            if (desk_id[nextDeskIndexToAttend]) {
              setCurrentDeskIndexToAttend(nextDeskIndexToAttend);
            } else {
              setCurrentDeskIndexToAttend(0);
            }

            if (!isRedirect) {
              setRedirectTo('/atendente/atendimento');
            }
          } else {
            toast.error('Algo de inesperado aconteceu. Tente novamente!', {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });

            socket.emit('getQueueSize', desk_id);

            setLoading(false);
          }
        });
      }
    }
  }, [
    redirectTo,
    socket,
    currentDeskIndexToAttend,
    setCurrentDeskIndexToAttend,
    desk_id,
    isRedirect,
  ]);

  useEffect(() => {
    if (!redirectTo) {
      if (!socket && desk_id) {
        const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);

        signIn({ desk_id }, socket);
      }
    }
  }, [redirectTo, socket, desk_id, signIn]);

  useEffect(() => {
    if (!redirectTo) {
      if (desk_id && socket) {
        socket.on('attendanceStartedAlready', () => {
          if (!isRedirect) {
            setRedirectTo('/atendente/atendimento');
          }
        });

        socket.on('queueSize', (queueSize: number) => {
          setQueueSize(queueSize);
        });

        socket.on('attendanceNotStartedYet', () => {
          socket.emit('getQueueSize', desk_id);
        });

        socket.on('refreshQueueAttendant', () => {
          socket.emit('getQueueSize', desk_id);
        });
      }
    }
  }, [redirectTo, socket, desk_id, setQueueSize, setRedirectTo, isRedirect]);

  const handleClick = useCallback(() => {
    setLoading(true);

    socket.emit('attendNext', {
      email: session?.user?.email,
      name: session?.user?.name,
      desks: desk_id,
      nextDeskIndex: currentDeskIndexToAttend,
    });
  }, [socket, setLoading, session, desk_id, currentDeskIndexToAttend]);

  return (
    <Layout showLogoutButton showConfigButton={isAdmin}>
      <Head>
        <title>{siteTitle} - Fila</title>
      </Head>
      <Container>
        <WelcomeMessage>Bem-vindo(a), {session?.user?.name}</WelcomeMessage>
        <CardQueue>
          {queueSize != null ? (
            <>
              <Number>{queueSize}</Number>
              <Text>Pessoas na fila</Text>
            </>
          ) : (
            <CircularProgress style={{ color: '#FF7D63' }} />
          )}
        </CardQueue>
        <Button
          onClick={handleClick}
          color="primary"
          layout="medium"
          disabled={queueSize < 1 || loading}
        >
          {loading ? (
            <CircularProgress style={{ color: '#777' }} />
          ) : (
            'Atender próximo'
          )}
        </Button>
      </Container>
    </Layout>
  );
}
