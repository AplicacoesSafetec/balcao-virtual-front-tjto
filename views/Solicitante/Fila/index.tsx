import Chatbot from 'components/Chatbot';
import Layout from 'components/Layout';

import { Alert, IconButton, Collapse } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { Button, Container } from './styles';
import { useState, useEffect, useMemo, useContext } from 'react';
import api from 'service/Api';
import { useRouter } from 'next/router';
import { AuthContext } from 'context/AuthContext';
import { io, Socket } from 'socket.io-client';

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
const socket: Socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);

export default function Fila() {
  const [desks, setDesks] = useState<Desks[]>([]);
  const [desksTeste, setDesksTeste] = useState<Desk[]>([]);
  const [redirectTo, setRedirectTo] = useState('');
  const [alert, setAlert] = useState(true);
  const router = useRouter();

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

  function signOut() {
    localStorage.removeItem('@BalcaoVirtual:User');
    localStorage.removeItem('@BalcaoVirtual:AttendanceProtocolId');
    localStorage.removeItem('@BalcaoVirtual:ChatbotUserInteracted');

    router.push('/solicitante/login').then(() => {
      router.reload();
    });
  }

  useEffect(() => {
    if (socket) {
      socket.on('attendanceTransfered', () => {
        console.log("socket solicitante")
        router.push('/solicitante/chat');
      });
    }
  }, [socket]);

  return (
    <Layout>
      <Container>
        <Chatbot desks={desks} options={options} />
        <Button onClick={signOut}>Sair da Fila</Button>

        <Collapse in={alert}>
        <Alert color='info'
          action={
            <IconButton
              aria-label="close"
              color="info"
              size="small"
              onClick={() => {
                setAlert(false);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Os dados coletados ao longo do atendimento estão sendo armazenados e preservados conforme a Lei Geral de Proteção de Dados (LGPD).
        </Alert>
        </Collapse>
      </Container>
    </Layout>
  );
}
