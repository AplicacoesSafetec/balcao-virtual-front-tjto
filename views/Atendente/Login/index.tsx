import { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axios from 'axios';
import { FcGoogle } from 'react-icons/fc';
import Layout, { siteTitle } from 'components/Layout';
import ButtonGoogle from 'components/ButtonGoogle';
import { AuthContext } from 'context/AuthContext';
import {
  signIn as signInGoogle,
  signOut as signOutGoogle,
  useSession,
} from 'next-auth/client';
import { Container, WelcomeMessage, CardData } from './styles';
import { toast } from 'react-toastify';
import { CircularProgress } from '@mui/material';

export default function Login() {
  const { signIn, desk_id, loadIsAdmin, isAdmin } = useContext(AuthContext);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    loadIsAdmin();
  }, [loadIsAdmin]);

  useEffect(() => {
    if (session && desk_id) {
      router.replace('/atendente/fila');
    }
  }, [session, desk_id, router]);

  useEffect(() => {
    const loadDesks = async () => {
      setLoadingLogin(true);

      try {
        const { email } = session.user;

        const desksIds = [];

        const { data: desksFromUser } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/desks`,
          {
            params: {
              email,
            },
          },
        );

        if (desksFromUser) {
          Object.entries(desksFromUser).reduce(
            (accDesksIds, currentDeskFromUser) => {
              if (currentDeskFromUser[1]) {
                accDesksIds.push(currentDeskFromUser[0]);
              }

              return accDesksIds;
            },
            desksIds,
          );
        }

        if (desksIds.length > 0) {
          signIn({ desk_id: desksIds }, null);
          setLoadingLogin(false);
        } else if (isAdmin) {
          router.replace('/admin/config');
          setLoadingLogin(false);
        } else if (!isAdmin) {
          setLoadingLogin(false);

          toast.error(
            'Você não está cadastrado como atendente de nenhum balcão!',
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            },
          );
        }
      } catch (error) {
        if (isAdmin) {
          router.replace('/admin/config');
          setLoadingLogin(false);
        } else {
          setTimeout(() => {
            signOutGoogle();
          }, 5000);

          toast.error(
            'Você não está cadastrado como atendente de nenhum balcão!',
            {
              position: 'top-right',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            },
          );
        }
      }
    };

    if (session && !desk_id && isAdmin !== null) {
      loadDesks();
    }
  }, [session, desk_id, signIn, isAdmin, router]);

  return (
    <Layout noHeader>
      <Head>
        <title>{siteTitle} - Login</title>
      </Head>
      <Container>
        <Image
          src="/images/logo-branco-vertical-1.svg"
          alt="logo"
          width={394}
          height={299}
          layout="fixed"
        />
        <WelcomeMessage>Bem-vindo ao Balcão Virtual!</WelcomeMessage>
        <CardData>
          {loadingLogin ? (
            <CircularProgress style={{ color: '#FF7D63' }} />
          ) : (
            <ButtonGoogle
              onClick={() => {
                setLoadingLogin(true);
                signInGoogle('google');
              }}
            >
              <FcGoogle size="18" />
              Logar com Google
            </ButtonGoogle>
          )}
        </CardData>
      </Container>
    </Layout>
  );
}
