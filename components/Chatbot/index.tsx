import Script from 'next/script';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { uuid } from 'uuidv4';

import axios from 'axios';
import { Desks, IDeskOption } from 'views/Solicitante/Fila';
import { useRouter } from 'next/router';
import { db, storage } from 'service/firebase';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  FieldValue,
  serverTimestamp,
  orderBy,
  query,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Container, FilesArea, UploadFiles, UploadFilesArea } from './styles';
import { toast } from 'react-toastify';
import { FiDownload } from 'react-icons/fi';
import { session, useSession } from 'next-auth/client';
import { AuthContext } from 'context/AuthContext';

interface ChatbotProps {
  desks: Desks[];
  options: {
    desksCategories: IDeskOption[];
    deskOptions: Map<string, IDeskOption[]>;
  };
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

interface DfMessenger extends Element {
  renderCustomCard: (payload: unknown) => {};
  renderCustomText: (text: string) => {};
}

type userData = {
  desk_id: string;
  desk_name: string;
  queue_user_email: string;
  queue_user_name: string;
  queue_user_phone: string;
  attendanceType: string;
};

type MessagesFromFirebase = {
  id: string;
  text?: string;
  user?: string;
  createdAt: FieldValue | Date;
  displayName?: string;
  showInDialogflow?: boolean;
};

type Document = {
  name: string;
  url: string;
};

type SendMessageFirebase = {
  message?: string;
  document?: Document;
};

export function Chatbot({ desks, options }: ChatbotProps) {
  const [attendance, setAttendance] = useState<IAttendanceProps>(null);
  const [userPosition, setUserPosition] = useState(0);
  const [shouldHideInput, setShoudHideInput] = useState(false);
  const [isChatbotLoaded, setIsChatbotLoaded] = useState(false);
  const [userData, setUserData] = useState<userData>();
  const [attendanceProtocoll, setAttendanceProtocoll] = useState('');
  const [currentAttendanceProtocoll, setCurrentAttendanceProtocoll] =
    useState('');
  const [currentMeetLink, setCurrentMeetLink] = useState('');
  const [socket, setSocket] = useState<Socket>(null);
  const [position, setPosition] = useState<number>();
  const [oldPosition, setOldPosition] = useState<number>();
  const [messagesFromFirebase, setMessagesFromFirebase] = useState<
    MessagesFromFirebase[]
  >([]);
  const [lastMessageId, setLastMessageId] = useState('');
  const [userProtocolChat, setUserProtocolChat] = useState('');
  const [chatProtocol, setChatProtocol] = useState('');
  const [file, setFile] = useState<any>();
  const [percent, setPercent] = useState(0);
  const [documentsSent, setDocumentsSent] = useState<Document[]>([]);
  const [session] = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState();

  const [redirectTo, setRedirectTo] = useState('');
  const router = useRouter();

  const [messagesHistory, setMessagesHistory] = useState<
    MessagesFromFirebase[]
  >([
    {
      createdAt: new Date(),
      displayName: 'Agente - Balcão Virtual',
      id: uuid(),
      showInDialogflow: false,
      text: 'Olá, seja bem-vindo(a) ao balcão virtual! Para iniciarmos o seu atendimento, preciso da confirmação de alguns dados, podemos iniciar?',
    },
  ]);

  const saveMEssagesHistoryInFirebase = useCallback(() => {
    const messagesFromDialogflow: MessagesFromFirebase[] =
      messagesHistory.filter(
        (message) => message.displayName === 'Agente - Balcão Virtual',
      );
    const messagesFromRequester: MessagesFromFirebase[] =
      messagesHistory.filter(
        (message) => message.displayName !== 'Agente - Balcão Virtual',
      );

    const messagesFromRequestWithAllData: MessagesFromFirebase[] =
      messagesFromRequester.map((message) => ({
        ...message,
        displayName: userData.queue_user_name,
        user: `user-protocol${attendanceProtocoll}`,
      }));

    const messages: MessagesFromFirebase[] = [
      ...messagesFromDialogflow,
      ...messagesFromRequestWithAllData,
    ];

    messages.map((message) => {
      const messageRef = doc(db, chatProtocol, uuid());
      return setDoc(messageRef, message);
    });
  }, [attendanceProtocoll, chatProtocol, messagesHistory, userData]);

  useEffect(() => {
    if (
      userData?.attendanceType === 'Quero conversar com alguém via Chat' &&
      chatProtocol &&
      userProtocolChat
    ) {
      setTimeout(() => {
        saveMEssagesHistoryInFirebase();
      }, 800);
    }
  }, [chatProtocol, saveMEssagesHistoryInFirebase, userData, userProtocolChat]);

  const saveMessageInHistory = useCallback((message: MessagesFromFirebase) => {
    setMessagesHistory((oldMessages) => [...oldMessages, message]);
  }, []);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleUploadFile() {
    if (!file) {
      alert('Escolha um arquivo primeiro!');
    }

    const storageRef = ref(storage, `/${chatProtocol}/${file.name}`);
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

          setDocumentsSent((oldArray) => [
            ...oldArray,
            { name: file.name, url },
          ]);

          setPercent(0);
          setFile(null);
        });
      },
    );
  }

  const sendMessageToFirebase = useCallback(
    ({ message, document }: SendMessageFirebase) => {
      const messageRef = doc(db, chatProtocol, uuid());

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
    [chatProtocol, userData?.queue_user_name, userProtocolChat],
  );

  const getMessagesFromFirebase = useCallback(() => {
    const q = query(collection(db, chatProtocol), orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
      let messages = [];
      snapshot?.forEach((doc) => {
        if (
          doc.data().user !== userProtocolChat &&
          doc.data().showInDialogflow !== false
        ) {
          messages.push(doc.data());

          setMessagesFromFirebase(messages);
        }
      });
    });
  }, [chatProtocol, userProtocolChat]);

  useEffect(() => {
    if (
      userData?.attendanceType === 'Quero conversar com alguém via Chat' &&
      chatProtocol &&
      userProtocolChat
    ) {
      getMessagesFromFirebase();
    }
  }, [chatProtocol, getMessagesFromFirebase, userData, userProtocolChat]);

  const firstMessage =
    'Bem vindo, como vai? Para um atendimento rápido, é importante que tenha em mãos o número do seu CPF, o número do processo e o setor onde quer falar. Os dados desse atendimento serão armazenados e preservados de acordo com a LGPD';

  const loadAttendance = useCallback(async (email: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/attendance`,
        {
          params: { queue_user_email: email },
        },
      );

      setAttendance(response.data);
    } catch (e) {
      null;
    }
  }, []);

  async function loadLocalStorage() {
    const attendanceProtocolId = localStorage.getItem(
      '@BalcaoVirtual:AttendanceProtocolId',
    );

    if (attendanceProtocolId) {
      setAttendanceProtocoll(attendanceProtocolId);

      const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);

      setSocket(socket);
    }

    const user = localStorage.getItem('@BalcaoVirtual:User');

    if (user) {
      const userStorage: userData = JSON.parse(user);
      setUserData(userStorage);

      if (
        userStorage.attendanceType === 'Quero conversar com alguém via Chat'
      ) {
        setChatProtocol(attendanceProtocolId);
        setUserProtocolChat(`user-protocol${attendanceProtocolId}`);
      }
    }
  }

  useEffect(() => {
    loadLocalStorage();
  }, []);

  useEffect(() => {
    const dfMessenger = document.querySelector('df-messenger') as DfMessenger;

    const messengerLoaded = () => {
      setIsChatbotLoaded(true);

      const dfMessengerChat =
        dfMessenger.shadowRoot.querySelector('df-messenger-chat');

      dfMessenger.shadowRoot
        .querySelector('button#widgetIcon')
        .setAttribute(
          'style',
          'background-color: transparent; bottom: 0px; position: static; width: 90%; padding: 5%;',
        );

      dfMessenger.shadowRoot
        .querySelector('button#widgetIcon')
        .setAttribute('style', 'display: none;');

      dfMessengerChat.shadowRoot
        .querySelector('.chat-wrapper')
        .setAttribute(
          'style',
          'height:350px; width: 110%;  position: static;   margin-top: 2%; margin-bottom: 30px;',
        );

      if (shouldHideInput) {
        dfMessenger.shadowRoot
          .querySelector('df-messenger-chat')
          .shadowRoot.querySelector('df-messenger-user-input')
          .setAttribute('style', 'display:none');
      }
    };

    dfMessenger.addEventListener('df-messenger-loaded', messengerLoaded);

    return () => {
      dfMessenger.removeEventListener('df-messenger-loaded', messengerLoaded);
    };
  }, [shouldHideInput]);

  const sendPositionToChat = useCallback(
    (position: number) => {
      const dfMessenger = document.querySelector('df-messenger') as DfMessenger;
      if (position > 0 && position !== userPosition && isChatbotLoaded) {
        setUserPosition(position);

        dfMessenger.renderCustomText(`sua posição na fila é a ${position}`);
      }
    },
    [isChatbotLoaded, userPosition],
  );

  // start flow
  useEffect(() => {
    const dfMessenger = document.querySelector('df-messenger') as DfMessenger;
    if (
      isChatbotLoaded &&
      !userData &&
      !currentMeetLink &&
      !currentAttendanceProtocoll
    ) {
      dfMessenger.renderCustomText(firstMessage);

      const balloon = [
        {
          type: 'chips',
          options: [
            {
              text: 'Sim, podemos seguir.',
            },
          ],
        },
      ];

      dfMessenger?.renderCustomCard(balloon);
    }
  }, [currentAttendanceProtocoll, currentMeetLink, isChatbotLoaded, userData]);

  const showCategory = useCallback(
    async (dfMessenger: DfMessenger) => {
      const payload = [
        {
          type: 'chips',
          options: options.desksCategories,
        },
      ];

      dfMessenger?.renderCustomCard(payload);
    },
    [options.desksCategories],
  );

  const showDesks = useCallback(
    async (dfMessenger: DfMessenger, event: { detail: any } & Event) => {
      const { category } = event.detail.response.queryResult.parameters;

      const payload = [
        {
          type: 'chips',
          options: options.deskOptions.get(category),
        },
      ];

      dfMessenger?.renderCustomCard(payload);
    },
    [options.deskOptions],
  );

  const showStakeholder = useCallback(async (dfMessenger: DfMessenger) => {
    const stakeholders = [
      {
        text: 'Parte autora',
      },
      {
        text: 'Parte ré',
      },
      {
        text: 'Terceiro interessado',
      },
      {
        text: 'Advogado',
      },
    ];
    const payload = [
      {
        type: 'chips',
        options: stakeholders,
      },
    ];

    dfMessenger?.renderCustomCard(payload);
  }, []);

  // const finish = useCallback(async () => {
  //   setLoading(true);

  //   if (socket) {
  //     socket.emit('endAttendance', {
  //       is_attendant: true,
  //     });
  //     setRedirectTo('fila');
  //   }
  // }, [socket]);

  const showDoubt = useCallback(async (dfMessenger: DfMessenger) => {
    const doubt = [
      {
        text: 'Extrato do processo',
      },
      {
        text: 'Solicitar andamento do processo',
      },
      {
        text: 'Solicitar certidão',
      },
      {
        text: 'Tirar dúvida',
      },
    ];
    const payload = [
      {
        type: 'chips',
        options: doubt,
      },
    ];

    dfMessenger?.renderCustomCard(payload);
  }, []);

  const showAttendance = useCallback(async (dfMessenger: DfMessenger) => {
    const attendance = [
      {
        text: 'Quero conversar com alguém via Chat',
      },
      {
        text: 'Quero conversar com alguém via Videoconferência',
      },
    ];

    const payload = [
      {
        type: 'chips',
        options: attendance,
      },
    ];

    dfMessenger?.renderCustomCard(payload);
  }, []);

  const showMeetLink = useCallback(
    async (dfMessenger: DfMessenger, meetLink: string) => {
      dfMessenger?.renderCustomText('Seu atendimento foi iniciado!');

      const payload = [
        {
          type: 'info',
          actionLink: `https://meet.google.com/${meetLink}`,
          title: 'Ir para a sala de videoconferência do atendimento',
        },
      ];

      dfMessenger?.renderCustomCard(payload);
    },
    [],
  );

  const sendUserData = useCallback(
    (event: { detail: any } & Event) => {
      setShoudHideInput(true);
      const {
        attendanceType,
        category,
        deskName,
        email,
        name,
        stakeholder,
        phone,
      } = event.detail.response.queryResult.parameters;

      let desk_id = '';
      setEmail(email);
      desks.map((desk) =>
        desk.text === `${category}/${deskName}` ? (desk_id = desk.value) : '',
      );

      const userData = {
        attendanceType,
        desk_id,
        desk_name: deskName,
        queue_user_email: email,
        queue_user_name: name,
        queue_user_phone: phone,
      };
      const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);

      setSocket(socket);

      setUserData(userData);

      localStorage.setItem('@BalcaoVirtual:User', JSON.stringify(userData));
    },
    [desks],
  );

  useEffect(() => {
    if (userData && socket) {
      const {
        desk_id,
        desk_name,
        queue_user_email,
        queue_user_name,
        queue_user_phone,
        attendanceType,
      } = userData;

      if (attendance) {
        socket.emit('connectToAttendance', attendance.attendance_protocol_id);

        socket.on('attendanceEnded', () => {
          setRedirectTo('/solicitante/avaliacao');
          setUserData(null);
          setAttendance(null);
          socket.close();
        });
      } else {
        socket.emit('getQueuePosition', { queue_user_email, desk_id });

        socket.on('sendQueue', (position: number) => {
          // Se a posição for diferente de 0, ele está na fila
          if (position) {
            setPosition(position);
            // Se a posição é 0, ele está em atendimento ou fora da fila
          } else {
            socket.emit('checkAttendance', {
              email: queue_user_email,
              is_attendant: false,
            });
          }
        });

        socket.on('attendanceStartedAlready', () => {
          setTimeout(() => {
            loadAttendance(queue_user_email);
          }, 800);
        });

        socket.on('attendanceNotStartedYet', () => {
          socket.emit('joinQueue', {
            desk_id,
            desk_name,
            queue_user_email,
            queue_user_name,
            queue_user_phone,
            attendance_type_is_chat:
              attendanceType === 'Quero conversar com alguém via Chat'
                ? true
                : false,
          });
        });

        socket.on('failedJoinQueue', () => {
          socket.close();
        });

        socket.on('refreshQueue', () => {
          socket.emit('getQueuePosition', { queue_user_email, desk_id });
        });

        socket.on('sendProtocol', (attendance_protocol_id: string) => {
          setAttendanceProtocoll(attendance_protocol_id);
          localStorage.setItem(
            '@BalcaoVirtual:AttendanceProtocolId',
            attendance_protocol_id,
          );

          if (
            userData.attendanceType === 'Quero conversar com alguém via Chat'
          ) {
            setChatProtocol(attendance_protocol_id);
            setUserProtocolChat(`user-protocol${attendance_protocol_id}`);
          }
        });

        socket.on('leftTheQueue', () => {
          socket.close();
        });
      }
    }
  }, [attendance, loadAttendance, sendPositionToChat, socket, userData]);

  function encerrarAtendimento() {
    console.log(userData);
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/fila`);
    if (socket) {
      socket.emit('endAttendance', {
        email: email,
        is_attendant: true,
      });
      setRedirectTo('/solicitante/avaliacao');
      router.push('/solicitante/avaliacao').then(() => {
        router.reload();
      });
      socket.on('attendanceEnded', () => {
        console.log('Atendimento encerrado com sucesso!');
        socket.close();
      });
    }
  }

  const showMessagesFromFirebase = useCallback(
    (dfMessenger: DfMessenger, message: MessagesFromFirebase) => {
      setLastMessageId(message?.id);

      setTimeout(() => {
        if (message?.id !== lastMessageId) {
          dfMessenger?.renderCustomText(message?.text);
        }
      }, 800);
    },
    [lastMessageId],
  );

  useEffect(() => {
    if (
      messagesFromFirebase &&
      userData &&
      userData.attendanceType === 'Quero conversar com alguém via Chat'
    ) {
      const dfMessenger = document.querySelector('df-messenger') as DfMessenger;
      const message = messagesFromFirebase[0];

      showMessagesFromFirebase(dfMessenger, message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesFromFirebase, userData]);

  function getServerTimestamp() {
    return new Date();
  }

  useEffect(() => {
    const dfMessenger = document.querySelector('df-messenger') as DfMessenger;
    const responseReceived = (event: { detail: any } & Event) => {
      const dialogMessage = event.detail.response.queryResult.fulfillmentText;
      const requesterMessage = event.detail.response.queryResult.queryText;

      if (userData?.attendanceType !== 'Quero conversar com alguém via Chat') {
        saveMessageInHistory({
          createdAt: getServerTimestamp(),
          id: uuid(),
          text: requesterMessage,
        });

        setTimeout(() => {
          saveMessageInHistory({
            createdAt: getServerTimestamp(),
            displayName: 'Agente - Balcão Virtual',
            id: uuid(),
            showInDialogflow: false,
            text: dialogMessage,
          });
        }, 1000);
      }

      if (
        userData &&
        userData.attendanceType === 'Quero conversar com alguém via Chat'
      ) {
        const message = event.detail.response.queryResult.queryText;
        sendMessageToFirebase({
          message,
        });
      }

      if (
        event.detail.response.queryResult.fulfillmentText?.includes(
          'Clique abaixo para escolher qual categoria deseja ser atendido',
        )
      ) {
        setTimeout(() => {
          showCategory(dfMessenger);
        }, 800);
      }

      if (
        event.detail.response.queryResult.fulfillmentText?.includes(
          'Clique abaixo para escolher por qual balcão deseja ser atendido',
        )
      ) {
        setTimeout(() => {
          showDesks(dfMessenger, event);
        }, 800);
      }

      if (
        event.detail.response.queryResult.fulfillmentText?.includes(
          'Clique abaixo em qual é parte interessada',
        )
      ) {
        setTimeout(() => {
          showStakeholder(dfMessenger);
        }, 800);
      }
      if (
        event.detail.response.queryResult.fulfillmentText ===
        'Clique abaixo na opção que mais se adequa a sua dúvida'
      ) {
        setTimeout(() => {
          showDoubt(dfMessenger);
        }, 800);
      }

      if (
        event.detail.response.queryResult.fulfillmentText?.includes(
          'Como você deseja seguir com o seu atendimento',
        )
      ) {
        setTimeout(() => {
          showAttendance(dfMessenger);
        }, 800);
      }
      if (
        event.detail.response.queryResult.fulfillmentText ===
        'A sua solicitação foi encaminhada para a equipe responsável e ela será respondida por e-mail dentro de 24h'
      ) {
        setTimeout(async () => {
          await sendUserData(event);

          console.log(userData);
          dfMessenger.renderCustomText(
            'Agradecemos pelo contato seu chat será finalizado !',
          );
          encerrarAtendimento();
        }, 12000);
      }

      if (
        event.detail.response.queryResult.fulfillmentText?.includes(
          'aguarde um instante',
        )
      ) {
        setTimeout(() => {
          sendUserData(event);
        }, 1000);
      }
    };

    if (position && position !== oldPosition && isChatbotLoaded) {
      setTimeout(() => {
        setOldPosition(position);
        dfMessenger.renderCustomText(`sua posição na fila é a ${position}`);
      }, 800);
    }

    if (
      !!attendanceProtocoll &&
      attendanceProtocoll !== currentAttendanceProtocoll &&
      isChatbotLoaded
    ) {
      setCurrentAttendanceProtocoll(attendanceProtocoll);

      setTimeout(() => {
        dfMessenger.renderCustomText(
          `Protocolo do atendimento: ${attendanceProtocoll}`,
        );
      }, 800);
    }

    if (
      !!attendance?.attendance_meet_id &&
      attendance?.attendance_meet_id !== currentMeetLink &&
      isChatbotLoaded &&
      userData?.attendanceType !== 'Quero conversar com alguém via Chat'
    ) {
      setCurrentMeetLink(attendance?.attendance_meet_id);

      setTimeout(() => {
        showMeetLink(dfMessenger, attendance.attendance_meet_id);
      }, 800);
    }

    dfMessenger.addEventListener('df-response-received', responseReceived);

    return () => {
      dfMessenger.removeEventListener('df-response-received', responseReceived);
    };
  }, [
    attendance,
    attendanceProtocoll,
    currentAttendanceProtocoll,
    currentMeetLink,
    isChatbotLoaded,
    oldPosition,
    position,
    sendMessageToFirebase,
    sendPositionToChat,
    sendUserData,
    setUserData,
    showAttendance,
    showCategory,
    showDesks,
    showMeetLink,
    showStakeholder,
    userData,
    messagesHistory,
    saveMessageInHistory,
    showDoubt,
    encerrarAtendimento,
  ]);

  useEffect(() => {
    const dfMessenger = document.querySelector('df-messenger') as DfMessenger;

    const messengerLoaded = () => {
      setIsChatbotLoaded(true);

      const dfMessengerChat =
        dfMessenger.shadowRoot.querySelector('df-messenger-chat');

      dfMessenger.shadowRoot
        .querySelector('.df-messenger-wrapper')
        .setAttribute(
          'style',
          'background-color: transparent; bottom: 0px; position: static; width: 90%; padding: 5%;',
        );

      dfMessengerChat.shadowRoot
        .querySelector('.chat-wrapper')
        .setAttribute(
          'style',
          'height:350px; width: 110%;  position: static; margin-left: -20px;  margin-top: -3%',
        );

      if (shouldHideInput) {
        dfMessenger.shadowRoot
          .querySelector('df-messenger-chat')
          .shadowRoot.querySelector('df-messenger-user-input')
          .setAttribute('style', 'display:none');
      }
    };

    dfMessenger.addEventListener('df-messenger-loaded', messengerLoaded);

    return () => {
      dfMessenger.removeEventListener('df-messenger-loaded', messengerLoaded);
    };
  }, [shouldHideInput]);

  return (
    <Container>
      <Script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1" />
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <df-messenger
            agent-id="a70bc358-0320-4dee-b0f1-9609b8d29bd6"
            chat-title="Agente - Balcão Virtual"
            language-code="pt-br"
            expand="true"
            >
          </df-messenger>
            `,
        }}
      />

      {userData?.attendanceType === 'Quero conversar com alguém via Chat' && (
        <FilesArea>
          <UploadFilesArea>
            <h1>Documentos enviados</h1>

            <div>
              {documentsSent.map((doc) => (
                <a
                  key={doc.url}
                  href={doc.url}
                  download={doc.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {doc.name}
                  <FiDownload style={{ marginLeft: 5 }} />
                </a>
              ))}
            </div>
          </UploadFilesArea>

          <UploadFiles>
            <div>
              <h1>{file?.name}</h1>
              {file && <button onClick={() => setFile(null)}>X</button>}
            </div>
            <label
              htmlFor="inputTag"
              onClick={() => file && handleUploadFile()}
            >
              {percent !== 0
                ? `${percent < 10 ? `0${percent}%` : percent}%`
                : file
                ? 'Enviar'
                : 'Selecionar Arquivo'}
              <input
                disabled={!!file}
                id="inputTag"
                type="file"
                onChange={(event) => handleChange(event)}
              />
            </label>
          </UploadFiles>
        </FilesArea>
      )}
    </Container>
  );
}

export default Chatbot;
function setLoading(arg0: boolean) {
  throw new Error('Function not implemented.');
}
