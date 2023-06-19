import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import Script from 'next/script';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

import Layout, { siteTitle } from 'components/Layout';

import { AuthContext } from '../../../context/AuthContext';

import {
  Container,
  CardQueue,
  Button
} from './styles';

interface DfMessenger extends Element {
  renderCustomCard: (payload: unknown) => {};
  renderCustomText: (text: string) => {};
}

interface Desks {
  text: string;
  value: string;
}

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

export default function Login({ desks }: { desks: Desks[] }) {
  const [redirectTo, setRedirectTo] = useState('');
  const router = useRouter();
 
  useEffect(() => {
  if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  function handleFila() {
    setRedirectTo('/solicitante/fila');
  }
  return (
    <Layout showBackgroundImage>
      <Head>
        <title>{siteTitle} - Login</title>
      </Head>
      <Container>
        <CardQueue>
<Button onClick={handleFila}>Iniciar Atendimento</Button>
        </CardQueue>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/desks`,
    );

    const desks: Desks[] = data.map((desk: { displayName: string; fieldName: string }) => {
      return {
        text: desk.displayName,
        value: desk.fieldName
      }
    })

    return {
      props: {
        desks
      }
    };
  } catch (e) {
    return {
      props: {
        desks: [],
      },
    };
  }
};
