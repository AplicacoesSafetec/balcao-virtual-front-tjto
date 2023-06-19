import { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';

import api from 'service/Api';
import Button from 'components/Button';
import { AuthContext, SignInFormData } from '../../../context/AuthContext';
import {
  doc,
  setDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import 'firebase/firestore';
import { uuid } from 'uuidv4';
import {
  Container,
  SelectBalcao,
  CardQueue,
  Control,
  InputText,
  ButtonArea,
  Label,
} from './styles';
import { io, Socket } from 'socket.io-client';
import { randomUUID } from 'crypto';

interface Desk {
  text: string;
  value: string;
}

interface IDeskOption {
  value: string;
  label: string;
}
export default function Transfer({
  desks,
  user,
  socket,
  attendance,
  session,
  db,
  protocol,
}: {
  desks: Desk[];
  user?: any;
  socket: any;
  attendance: any;
  session: any;
  db: any;
  protocol: any;
}) {
  const aggregateOptions = (
    desk: Desk,
    desksOptions: Map<string, IDeskOption[]>,
    groupLabel: string,
    text: string,
  ): void => {
    const deskOptions = desksOptions.get(groupLabel);

    if (deskOptions) {
      deskOptions.push({
        value: desk.text,
        label: text,
      });
    } else {
      desksOptions.set(groupLabel, [
        {
          value: desk.text,
          label: text,
        },
      ]);
    }
  };

  const aggregateOptionsLabels = (
    desksOptions: Map<string, IDeskOption[]>,
  ): IDeskOption[] => {
    const desksOptionsLabels: IDeskOption[] = [];

    const desksOptionsIterator = desksOptions.keys();

    let deskCategory = desksOptionsIterator.next().value;

    do {
      if (deskCategory) {
        desksOptionsLabels.push({
          label: deskCategory,
          value: deskCategory,
        });
      }

      deskCategory = desksOptionsIterator.next().value;
    } while (deskCategory);

    return desksOptionsLabels;
  };

  const options = useMemo(() => {
    const desksOptions: Map<string, IDeskOption[]> = new Map<
      string,
      IDeskOption[]
    >();

    let desksOptionsLabels: IDeskOption[] = [];

    desks.forEach((desk) => {
      const separatedLabelAndOption = desk.text.split('/');

      if (separatedLabelAndOption.length > 1) {
        aggregateOptions(
          desk,
          desksOptions,
          separatedLabelAndOption.shift(),
          separatedLabelAndOption.join('/'),
        );
      } else {
        aggregateOptions(desk, desksOptions, 'Padrão', desk.value);
      }

      desksOptionsLabels = aggregateOptionsLabels(desksOptions);
    });

    return { desksCategories: desksOptionsLabels, deskOptions: desksOptions };
  }, [desks]);

  const [selectedDeskLevelOne, setSelectedDeskLevelOne] = useState(
    options.desksCategories[0],
  );

  const [selectedDeskLevelTwo, setSelectedDeskLevelTwo] = useState(
    options.deskOptions.get(selectedDeskLevelOne?.label)?.[0],
  );

  const [redirectTo, setRedirectTo] = useState('');
  const router = useRouter();
  const { signIn } = useContext(AuthContext);

  useEffect(() => {
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    const deskOptions = options.deskOptions.get(selectedDeskLevelOne?.label);

    setSelectedDeskLevelTwo(deskOptions?.[0]);
  }, [options.deskOptions, selectedDeskLevelOne]);

  const formSerialize = useCallback(
    (formElement: any) => {
      const values = {} as SignInFormData;
      const inputs = formElement.elements;

      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].id != '') {
          values[inputs[i].id] = inputs[i].value;
        }
      }
      values['desk_id'] = selectedDeskLevelTwo.value;

      return values;
    },
    [selectedDeskLevelTwo],
  );

  const transfer = useCallback(
    async (e) => {
      e.preventDefault();

      const {
        desk_id,
        desk_name,
        queue_user_email,
        queue_user_name,
        queue_user_phone,
      }: SignInFormData = formSerialize(e.target);

      const response = await api.post(`/attendant/transfer-attendance`, {
        email: queue_user_email,
        is_attendant: true,
        desk_id: desk_id,
      });

      console.log(response)

      // socket.emit(
      //   'transferAttendance',
      //   {
      //       email: 'chico@gmail.com',
      //       is_attendant: true,
      //       desk_id: desk_id
      //   },
      // );
      return false;

      // if (socket && attendance && session) {
      //   socket.emit('endAttendance', {
      //     email: session.user.email,
      //     is_attendant: true,
      //   });
      //   socket2.emit('attendanceTransfered');
      // }

      // socket.emit('connectToAttendance', attendance.attendance_protocol_id);

      // socket.emit('getQueuePosition', { queue_user_email, desk_id });

      // socket.emit('checkAttendance', {
      //   email: queue_user_email,
      //   is_attendant: false,
      // });

      // socket.on('attendanceNotStartedYet', () => {
      //   socket.emit('joinQueue', {
      //     desk_id,
      //     desk_name,
      //     queue_user_email,
      //     queue_user_name,
      //     queue_user_phone,
      //     attendance_type_is_chat: true,
      //   });
      // });

      // socket.on('failedJoinQueue', () => {
      //   socket.close();
      // });

      // socket.on('refreshQueue', () => {
      //   socket.emit('getQueuePosition', { queue_user_email, desk_id });
      // });

      // socket.emit('transferAttendance', {
      //   email: "chico@gmail.com",
      //   is_attendant: true,
      // },()=>{
      //   console.log('deu certo')
      // });
      // console.log("socket atendente ")

      setTimeout(() => {
        //;//setRedirectTo('/atendente/fila');
      }, 5000);
    },
    [
      redirectTo,
      formSerialize,
      selectedDeskLevelOne?.label,
      selectedDeskLevelTwo?.label,
      signIn,
    ],
  );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const messageRef = doc(db, protocol, uuid());
    setDoc(messageRef, {
      text: "Seu atendimento será transferido. Aguarde!",
      createdAt: serverTimestamp(),
      uid: 'skldjlksdjklsjdl',
      id: uuid(),
      displayName: user?.userName,
      photoURL : "",
      user: 'teste',
    });
  };

  const handleSubmit2 = (e: any) => {
    e.preventDefault();
    const messageRef = doc(db, protocol, uuid());
    setDoc(messageRef, {
      text: `Seu novo protocolo é : ${protocol}-02`,
      createdAt: serverTimestamp(),
      uid: 'skldjlksdjklsjdl',
      id: uuid(),
      displayName: user?.userName,
      photoURL : "",
      user: 'teste',
    });
  };


  const logar = useCallback(
    (e) => {
      if (!redirectTo) {
        e.preventDefault();

        const {
          desk_id,
          queue_user_email,
          queue_user_name,
          queue_user_phone,
        }: SignInFormData = formSerialize(e.target);

        signIn(
          {
            desk_id,
            desk_name: `${selectedDeskLevelOne.label}/${selectedDeskLevelTwo.label}`,
            queue_user_email,
            queue_user_name,
            queue_user_phone,
          },
          null,
        );
        router.push({
          pathname: '/atendente/fila', query: {
            isRedirect: true,
          },
        })
        handleSubmit(e);
        setTimeout(() => {
          handleSubmit2(e)
        }, 5000);
      }
    },
    [
      redirectTo,
      formSerialize,
      selectedDeskLevelOne?.label,
      selectedDeskLevelTwo?.label,
      signIn,
    ],
  );

  return (
    <Container>
      <CardQueue>
        <form id="login-form" onSubmit={logar}>
          <Control>
            <Label id="label-name" htmlFor="queue_user_name">
              Nome
            </Label>
            <InputText
              id="queue_user_name"
              aria-labelledby="label-name"
              variant="outlined"
              size="small"
              name="name"
              value={user?.userName}
              disabled
            />
            <Label id="label-email" htmlFor="queue_user_email">
              Email
            </Label>
            <InputText
              aria-labelledby="label-email"
              id="queue_user_email"
              variant="outlined"
              size="small"
              type="email"
              name="email"
              value={user?.userEmail}
              disabled
            />
            <Label id="label-phone" htmlFor="queue_user_phone">
              Telefone
            </Label>
            <InputText
              aria-labelledby="label-phone"
              id="queue_user_phone"
              type="tel"
              variant="outlined"
              size="small"
              name="phone"
              value={user?.userPhone}
              disabled
            />
            <Label id="label-category" htmlFor="category_id">
              Categoria
            </Label>
            <SelectBalcao
              aria-labelledby="label-category"
              inputId="category_id"
              options={options.desksCategories}
              value={selectedDeskLevelOne}
              onChange={(e: IDeskOption) => {
                setSelectedDeskLevelOne(
                  options.desksCategories.find(
                    (option) => option.label === e.value,
                  ),
                );
              }}
            />
            <Label id="label-balcao" htmlFor="desk_id">
              Escolher balcão
            </Label>
            <SelectBalcao
              aria-labelledby="label-balcao"
              inputId="desk_id"
              options={options.deskOptions.get(selectedDeskLevelOne?.label)}
              value={selectedDeskLevelTwo}
              onChange={(e: IDeskOption) => {
                const deskOptions = options.deskOptions.get(
                  selectedDeskLevelOne.label,
                );

                setSelectedDeskLevelTwo(
                  deskOptions.find((option) => option.value === e.value),
                );
              }}
            />
            <ButtonArea>
              <Button
                disabled={!selectedDeskLevelTwo}
                type="submit"
                color="primary"
              >
                Transferir atendimento
              </Button>
            </ButtonArea>
          </Control>
        </form>
      </CardQueue>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data: desks } = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/desks`,
    );

    return {
      props: {
        desks: desks.sort((desk1: Desk, desk2: Desk) =>
          desk1.value.localeCompare(desk2.value),
        ),
      },
    };
  } catch (e) {
    return {
      props: {
        desks: [],
      },
    };
  }
};
