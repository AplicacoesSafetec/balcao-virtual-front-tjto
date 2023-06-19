import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout, { siteTitle } from 'components/Layout';
import ChatRoom from 'components/NewChat';
import {
  Container,
  CardData,
  ChatArea
} from './styles';
import { db } from 'service/firebase';
import Stack from '@mui/material/Stack';
import React from 'react'
import Button from 'components/Button';
import { useSession } from 'next-auth/client';

export default function NewChat() {
  const router = useRouter();
  const [session] = useSession();
  const { protocol } = router.query;

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

  return (
    <Layout>
      <Head>
        <title>{siteTitle} - Atendimento</title>
      </Head>
      <Container>
          <ChatArea>
            <CardData>
              <nav id="sign_out"></nav>
              <ChatRoom user={user} db={db} viewOnly={false} />
            </CardData>
          </ChatArea>
          <Stack spacing={2} direction="row">
            <Button>Sair do Atendimento</Button>
          </Stack>
      </Container>
    </Layout>
  );
}
