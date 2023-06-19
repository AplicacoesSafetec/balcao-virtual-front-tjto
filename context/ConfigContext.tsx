import { useSession } from 'next-auth/client';
import { startOfDay, endOfDay, format } from 'date-fns';
import { useRouter } from 'next/router';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import api from 'service/Api';

interface DatastoreKeyJson {
  kind: string;
  name: string;
  path: string[];
}

export interface Attendant {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
}
export interface Option {
  readonly label: string;
  readonly value: string;
}

interface Desk {
  id: string;
  deskCategory: DatastoreKeyJson;
  name: string;
  isActive: boolean;
}

interface DeskCategory {
  id: string;
  isActive: boolean;
  name: string;
}

interface DeskAttendants {
  id: string;
  attendant: DatastoreKeyJson;
  desk: DatastoreKeyJson;
}

export interface DeskMapValue {
  id: string;
  deskCategory: DeskCategory;
  name: string;
  isActive: boolean;
}

export interface DeskAttendantsMapValue {
  id: string;
  attendant: Attendant;
  desk: DeskMapValue;
}

interface ConfigContextState {
  loadConfig: () => void;
  loadAttendancesRegistry: (from: Date, to: Date) => void;
  loading: boolean;
  // maps
  attendantsMap: Map<string, Attendant>;
  attendancesRegistryMap: Map<string, any>;
  deskAttendantsMap: Map<string, DeskAttendantsMapValue>;
  desksMap: Map<string, DeskMapValue>;
  deskCategoriesMap: Map<string, DeskCategory>;
  handleClickOpenRefresh: () => void;
  //chat
  chatbotMessages: any[];
  loadingChat: boolean;
  openChat: boolean;
  handleClickOpenChat: () => void;
  handleCloseChat: () => void;
  handleGetChat: (attendance_protocol_id: string) => void;
  // delete
  loadingDelete: boolean;
  openDelete: boolean;
  handleClickOpenDelete: () => void;
  handleCloseDelete: () => void;
  handleDeleteAttendants: (ids?: readonly string[]) => void;
  handleDeleteDesks: (ids?: readonly string[]) => void;
  // add
  loadingAdd: boolean;
  loadingAddCategory: boolean;
  recentlyAddedCategory: Option;
  resetRecentlyAddedCategory: () => void;
  openAdd: boolean;
  handleClickOpenAdd: () => void;
  handleCloseAdd: () => void;
  handleAddAttendants: (emails?: readonly string[]) => void;
  handleAddCategory: (name: string) => void;
  handleAddDesk: (deskCategoryId: string, names: readonly string[]) => void;
  // update
  loadingUpdate: boolean;
  openUpdate: boolean;
  handleClickOpenUpdate: () => void;
  handleCloseUpdate: () => void;
  handleUpdateDeskAttendants: (
    attendantsIds: readonly string[],
    desksIds: readonly string[],
  ) => void;
  handleUpdateDesk: (categoryId: string, desk: DeskMapValue) => void;
}

export const ConfigContext = createContext<ConfigContextState>(
  {} as ConfigContextState,
);

export const ConfigProvider: React.FC = ({ children }) => {
  const [session, loadingSession] = useSession();
  const router = useRouter();

  const [deskCategoriesState, setDeskCategoriesState] = useState<
    DeskCategory[]
  >([]);
  const [desksState, setDesksState] = useState<Desk[]>([]);
  const [attendantsState, setAttendantsState] = useState<Attendant[]>([]);
  const [deskAttendantsState, setDeskAttendantsState] = useState<
    DeskAttendants[]
  >([]);
  const [attendancesRegistry, setAttendancesRegistry] = useState([]);
  const [loading, setLoading] = useState(true);

  const [loadingChat, setLoadingChat] = useState(true);
  const [openChat, setOpenChat] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState(null);

  const [loadingDelete, setLoadingDelete] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingAddCategory, setLoadingAddCategory] = useState(false);
  const [recentlyAddedCategory, setRecentlyAddedCategory] =
    useState<Option>(null);
  const [openAdd, setOpenAdd] = useState(false);

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);

  const resetRecentlyAddedCategory = () => {
    setRecentlyAddedCategory(null);
  };

  const handleClickOpenRefresh = () => {
    loadConfig();
  };

  const handleClickOpenChat = () => {
    setOpenChat(true);
  };

  const handleCloseChat = () => {
    setChatbotMessages(null);
    setOpenChat(false);
  };

  const handleClickOpenAdd = () => {
    setOpenAdd(true);
  };

  const handleCloseAdd = () => {
    setOpenAdd(false);
  };

  const handleClickOpenDelete = () => {
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
  };

  const createOption = (label: string, value: string) => ({
    label,
    value,
  });

  const deskCategoriesMap = useMemo(() => {
    const map = new Map<string, DeskCategory>();

    deskCategoriesState.forEach((deskCategory) => {
      map.set(deskCategory.id, deskCategory);
    });

    return map;
  }, [deskCategoriesState]);

  const desksMap = useMemo(() => {
    const map = new Map<string, DeskMapValue>();

    desksState.forEach((desk) => {
      map.set(desk.id, {
        ...desk,
        deskCategory: deskCategoriesMap.get(desk.deskCategory.name),
      });
    });

    return map;
  }, [deskCategoriesMap, desksState]);

  const attendantsMap = useMemo(() => {
    const map = new Map<string, Attendant>();

    attendantsState.forEach((attendant) => {
      map.set(attendant.id, attendant);
    });

    return map;
  }, [attendantsState]);

  const attendancesRegistryMap = useMemo(() => {
    const map = new Map<string, any>();

    attendancesRegistry.forEach((attendanceRegistry) => {
      map.set(attendanceRegistry.attendance_protocol_id, attendanceRegistry);
    });

    return map;
  }, [attendancesRegistry]);

  const deskAttendantsMap = useMemo(() => {
    const map = new Map<string, DeskAttendantsMapValue>();

    deskAttendantsState.forEach((deskAttendant) => {
      map.set(deskAttendant.id, {
        ...deskAttendant,
        attendant: attendantsMap.get(deskAttendant.attendant.name),
        desk: desksMap.get(deskAttendant.desk.name),
      });
    });

    return map;
  }, [attendantsMap, deskAttendantsState, desksMap]);

  const handleApiCall = useCallback(
    (
      method: 'delete' | 'post' | 'put' | 'get',
      endpoint: string,
      data?: any,
    ) => {
      return api(endpoint, {
        method,
        data,
      });
    },
    [],
  );

  const sendToast = useCallback((type: string, message: string) => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []);

  const loadAttendancesRegistry = useCallback(
    async (from: Date, to: Date) => {
      if (!loadingSession && session) {
        try {
          const [responseAttendantIsAdmin, responseAttendanceRegistry] =
            await Promise.all([
              api.get(`/attendant/is-admin/${session?.user?.email}`),
              api.get(`/attendance/registry`, {
                params: {
                  from: startOfDay(from),
                  to: endOfDay(to),
                },
              }),
            ]);

          if (responseAttendantIsAdmin.data) {
            setAttendancesRegistry(responseAttendanceRegistry.data);

            sendToast('success', 'Atendimentos carregados com sucesso!');
          } else {
            router.replace('/atendente/fila');
          }
        } catch (e) {
          setAttendancesRegistry([]);

          sendToast('warn', 'Erro ao carregar atendimentos.');
        }
      } else if (!loadingSession) {
        router.replace('/atendente/fila');
      }
    },
    [loadingSession, router, sendToast, session],
  );

  const loadConfig = useCallback(async () => {
    if (!loadingSession && session) {
      try {
        setLoading(true);

        const [
          responseDeskCategories,
          responseDesks,
          responseAttendants,
          responseDeskAttendants,
          responseAttendantIsAdmin,
        ] = await Promise.all([
          api.get('/desk-category'),
          api.get('/desk'),
          api.get('/attendant'),
          api.get('/desk-attendants'),
          api.get(`/attendant/is-admin/${session?.user?.email}`),
        ]);

        if (responseAttendantIsAdmin.data) {
          setDeskCategoriesState(responseDeskCategories.data);
          setDesksState(responseDesks.data);
          setAttendantsState(responseAttendants.data);
          setDeskAttendantsState(responseDeskAttendants.data);

          sendToast('success', 'Atendentes carregados com sucesso!');
        } else {
          router.replace('/atendente/fila');
        }
      } catch (e) {
        setDeskCategoriesState([]);
        setDesksState([]);
        setAttendantsState([]);
        setDeskAttendantsState([]);
        setAttendancesRegistry([]);

        sendToast('warn', 'Erro ao carregar atendentes.');
      }

      setLoading(false);
    } else if (!loadingSession) {
      router.replace('/atendente/fila');
    }
  }, [loadingSession, router, sendToast, session]);

  const formatChatbotMessages = useCallback((messages: any[]) => {
    return messages.map((message) => {
      return {
        sender: `${format(
          new Date(message.created_at),
          '[dd/MM/yyyy HH:mm:ss]',
        )} (${message.is_sender_agent ? 'Agente' : 'Solicitante'}) ${
          message.sender
        }`,
        content: message.content,
      };
    });
  }, []);

  const handleGetChat = useCallback(
    (attendance_protocol_id: string = null) => {
      const callApiToGetChat = async () => {
        try {
          const res = await handleApiCall(
            'get',
            `/attendance/${attendance_protocol_id}/chat`,
          );
          setChatbotMessages(formatChatbotMessages(res.data));
        } catch (e) {
          sendToast('warn', 'Falha ao buscar conversa.');
        } finally {
          setLoadingChat(false);
        }
      };

      setLoadingChat(true);
      callApiToGetChat();
    },
    [formatChatbotMessages, handleApiCall, sendToast],
  );

  const handleUpdateDeskAttendants = useCallback(
    (attendantsIds: readonly string[], desksIds: readonly string[]) => {
      const deskAttendantsIdsToDelete = Array.from(deskAttendantsMap.values())
        .filter(({ attendant }) => attendantsIds.includes(attendant.id))
        .map(({ id }) => id);

      const callApiToUpdate = async () => {
        setLoadingUpdate(true);

        try {
          await handleApiCall(
            'delete',
            '/desk-attendants',
            deskAttendantsIdsToDelete,
          );

          await handleApiCall('post', '/desk-attendants', {
            attendantsIds,
            desksIds,
          });

          sendToast('success', 'Filas configuradas com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha ao configurar filas.');
        }

        setLoadingUpdate(false);
        handleCloseUpdate();
        loadConfig();
      };

      callApiToUpdate();
    },
    [deskAttendantsMap, handleApiCall, loadConfig, sendToast],
  );

  const handleUpdateDesk = useCallback(
    (categoryId: string, desk: DeskMapValue) => {
      const callApiToUpdate = async () => {
        setLoadingUpdate(true);

        try {
          const { isActive, name, id } = desk;

          await handleApiCall('put', `/desk/${id}`, {
            isActive,
            name,
            deskCategoryId: categoryId,
          });

          sendToast('success', 'Balcão atualizado com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha ao atualizar balcão');
        }

        setLoadingUpdate(false);
        handleCloseUpdate();
        loadConfig();
      };

      callApiToUpdate();
    },
    [handleApiCall, loadConfig, sendToast],
  );

  const handleDeleteAttendants = useCallback(
    (ids: readonly string[] = []) => {
      const deskAttendantsIdsToDelete = Array.from(deskAttendantsMap.values())
        .filter(({ attendant }) => ids.includes(attendant.id))
        .map(({ id }) => id);

      const callApiToDelete = async () => {
        setLoadingDelete(true);

        try {
          await handleApiCall(
            'delete',
            '/desk-attendants',
            deskAttendantsIdsToDelete,
          );

          await handleApiCall('delete', '/attendant', ids);

          sendToast('success', 'Atendentes excluídos com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha ao excluir atendentes.');
        }

        setLoadingDelete(false);
        handleCloseDelete();
        loadConfig();
      };

      callApiToDelete();
    },
    [deskAttendantsMap, handleApiCall, loadConfig, sendToast],
  );

  const handleDeleteDesks = useCallback(
    (ids: readonly string[] = []) => {
      const deskAttendantsIdsToDelete = Array.from(deskAttendantsMap.values())
        .filter(({ desk }) => ids.includes(desk.id))
        .map(({ id }) => id);

      const callApiToDelete = async () => {
        setLoadingDelete(true);

        try {
          await handleApiCall(
            'delete',
            '/desk-attendants',
            deskAttendantsIdsToDelete,
          );

          await handleApiCall('delete', '/desk', ids);

          sendToast('success', 'Exclusão de balcões realizada com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha na exclusão de balcões');
        }

        setLoadingDelete(false);
        handleCloseDelete();
        loadConfig();
      };

      callApiToDelete();
    },
    [deskAttendantsMap, handleApiCall, loadConfig, sendToast],
  );

  const handleAddAttendants = useCallback(
    (emails: readonly string[] = []) => {
      const callApiToAdd = async () => {
        setLoadingAdd(true);

        try {
          await handleApiCall('post', '/attendant/add-multiple', emails);

          sendToast('success', 'Atendente(s) adicionado(s) com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha ao adicionar atendente(s).');
        }

        setLoadingAdd(false);
        handleCloseAdd();

        loadConfig();
      };

      callApiToAdd();
    },
    [handleApiCall, loadConfig, sendToast],
  );

  const handleAddDesk = useCallback(
    (deskCategoryId: string, names: readonly string[]) => {
      const callApiToAdd = async () => {
        setLoadingAdd(true);

        try {
          await handleApiCall('post', '/desk', {
            names,
            deskCategoryId,
          });

          sendToast('success', 'Adição de balcões realizada com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha na adição de balcões');
        }

        setLoadingAdd(false);
        handleCloseAdd();

        loadConfig();
      };

      callApiToAdd();
    },
    [handleApiCall, loadConfig, sendToast],
  );

  const handleAddCategory = useCallback(
    (name: string) => {
      const callApiToAdd = async () => {
        setLoadingAddCategory(true);

        try {
          const responseAddCategory = await handleApiCall(
            'post',
            '/desk-category',
            { name },
          );

          setRecentlyAddedCategory(
            createOption(name, responseAddCategory.data),
          );

          deskCategoriesMap.set(responseAddCategory.data, {
            id: responseAddCategory.data,
            isActive: true,
            name,
          });

          sendToast('success', 'Categoria adicionada com sucesso!');
        } catch (e) {
          sendToast('warn', 'Falha ao adicionar categoria.');
        }

        setLoadingAddCategory(false);
      };

      callApiToAdd();
    },
    [deskCategoriesMap, handleApiCall, sendToast],
  );

  return (
    <ConfigContext.Provider
      value={{
        loadConfig,
        loadAttendancesRegistry,
        loading,
        attendantsMap,
        deskAttendantsMap,
        attendancesRegistryMap,
        desksMap,
        deskCategoriesMap,
        handleClickOpenRefresh,
        // chat
        chatbotMessages,
        loadingChat,
        openChat,
        handleClickOpenChat,
        handleCloseChat,
        handleGetChat,
        // delete
        loadingDelete,
        openDelete,
        handleClickOpenDelete,
        handleCloseDelete,
        handleDeleteAttendants,
        handleDeleteDesks,
        // add
        loadingAdd,
        loadingAddCategory,
        recentlyAddedCategory,
        resetRecentlyAddedCategory,
        openAdd,
        handleClickOpenAdd,
        handleCloseAdd,
        handleAddAttendants,
        handleAddCategory,
        handleAddDesk,
        // update
        loadingUpdate,
        openUpdate,
        handleClickOpenUpdate,
        handleCloseUpdate,
        handleUpdateDeskAttendants,
        handleUpdateDesk,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};
