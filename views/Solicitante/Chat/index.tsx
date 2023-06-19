import { useRouter } from 'next/router';
import Head from 'next/head';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout, { siteTitle } from 'components/Layout';
import { TopButtonArea } from 'components/Layout/styles';
import ChatRoom from 'components/NewChat';
import { Container, CardData } from './styles';
import { db, storage } from 'service/firebase';
import Stack from '@mui/material/Stack';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from 'service/Api';
import { AuthContext } from 'context/AuthContext';
import { getSession, useSession } from 'next-auth/client';
import { GetServerSideProps } from 'next';
import {
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { uuid } from 'uuidv4';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { ChatbotSolicitante } from 'components/ChatSolicitante';

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

type userData = {
  desk_id: string;
  desk_name: string;
  queue_user_email: string;
  queue_user_name: string;
  queue_user_phone: string;
  attendanceType: string;
};

type SendMessageFirebase = {
  message?: string;
  document?: {
    name: string;
    url: string;
  };
};

export default function Chat() {
  const [desks, setDesks] = useState<Desks[]>([]);
  const [desksTeste, setDesksTeste] = useState<Desk[]>([]);
  const [redirectTo, setRedirectTo] = useState('');
  const router = useRouter();
  const { desk_id, socket } = useContext(AuthContext);
  const [session] = useSession();
  const { protocol, viewOnly } = router.query;
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<any>();
  const [userData, setUserData] = useState<userData>();
  const [percent, setPercent] = useState(0);
  const [chatProtocol, setChatProtocol] = useState('');
  const [userProtocolChat, setUserProtocolChat] = useState('');

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

  function handleUploadFile() {
    if (!file) {
      alert('Escolha um arquivo primeiro!');
    }

    const storageRef = ref(storage, `/files/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        // update progress
        setPercent(percent);
      },
      (err) => console.log(err),
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          sendMessageToFirebase({
            document: {
              name: file.name,
              url: url,
            },
          });
          setPercent(percent);

          toast.success('Documento enviado!', {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          setPercent(0);
          setFile(null);
        });
      },
    );
  }

  const sendMessageToFirebase = useCallback(
    ({ message, document }: SendMessageFirebase) => {
      const prot = chatProtocol
        ? chatProtocol
        : localStorage.getItem('@BalcaoVirtual:AttendanceProtocolId');

      const messageRef = doc(db, prot, uuid());

      if (document) {
        setDoc(messageRef, {
          id: uuid(),
          user: userProtocolChat,
          createdAt: serverTimestamp(),
          displayName: userData?.queue_user_name,
          document,
        });
      } else {
        setDoc(messageRef, {
          id: uuid(),
          text: message,
          user: userProtocolChat,
          createdAt: serverTimestamp(),
          displayName: userData?.queue_user_name,
        });
      }
    },
    [userData?.queue_user_name, userProtocolChat],
  );

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

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  return (
    <Layout>
      <Head>
        <title>{siteTitle} - Atendimento</title>
      </Head>
      <Container>
        <ChatbotSolicitante desks={desks} options={options} />
      </Container>
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
