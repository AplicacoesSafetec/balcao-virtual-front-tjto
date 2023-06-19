import { useContext, useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

import Layout, { siteTitle } from 'components/Layout';
import Button from 'components/Button';

import {
  Container,
  CardData,
  DataArea,
  Title,
  RatingComponent,
  InputText,
} from './styles';
import { AuthContext } from 'context/AuthContext';
import { toast } from 'react-toastify';

export default function Avaliacao() {
  const { rating } = useContext(AuthContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [starValue, setStarValue] = useState<number | null>(null);
  const [redirectTo, setRedirectTo] = useState<string>(null);


  const router = useRouter();

  useEffect(() => {
    if (redirectTo) {
      setLoading(true);
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);
  useEffect(() => {
        toast.info('Atendimento encerrado!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
  }, [redirectTo, rating]);


  const signOut = useCallback(() => {
    localStorage.removeItem('@BalcaoVirtual:User');
    localStorage.removeItem('@BalcaoVirtual:AttendanceProtocolId');
    localStorage.removeItem('@BalcaoVirtual:ChatbotUserInteracted');

    router.push('/solicitante/login').then(() => {
      router.reload();
    })
  }, [router])


  const handleClick = useCallback(async () => {
    if(starValue < 1) {
      toast.warn('Você precisa definir sua nota clicando nas estrelinhas!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      setLoading(true);

      try {
        // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/rating`, {
        //   ...rating,
        //   rating_comment: ratingComment,
        //   rating_value: starValue || 0,
        // });

        toast.success('Avaliação registrada com sucesso!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        signOut();

      } catch (e) {
        signOut();
      }
    }
  }, [signOut, starValue]);

  return (
    <Layout>
      <Head>
        <title>{siteTitle} - Avaliação</title>
      </Head>
      <Container>
        <CardData>
          <Title>Avalie o atendimento</Title>
          <DataArea>
            <RatingComponent
              name="simple-controlled"
              value={starValue}
              size="large"
              onChange={(_, newValue) => {
                setStarValue(newValue);
              }}
              disabled={loading}
            />
          </DataArea>
          <InputText
            id="outlined-multiline-static"
            multiline
            rows={4}
            variant="outlined"
            value={ratingComment}
            onChange={(event) => {
              setRatingComment(event.target.value);
            }}
            disabled={loading}
          />
          <Button
            onClick={handleClick}
            color="primary"
            layout="medium"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={30} style={{ color: '#777' }} />
            ) : (
              'Avaliar'
            )}
          </Button>
        </CardData>
      </Container>
    </Layout>
  );
}
