import React, { createContext, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/client';
import { signOut as signOutGoogle } from 'next-auth/client';
import api from 'service/Api';

export interface SignInFormData {
  desk_id: string | string[];
  desk_name?: string;
  queue_user_email?: string;
  queue_user_name?: string;
  queue_user_phone?: string;
  attendanceType?: string;
}

export interface Rating {
  desk_id: string;
  desk_name: string;
  queue_user_email: string;
  queue_user_name: string;
  queue_user_phone: string;
  attendant_email: string;
  attendance_meet_id: string;
  attendance_calendar_event_id: string;
  attendance_protocol_id: string;
  rating_comment?: string;
  rating_value?: 0 | 1 | 2 | 3 | 4 | 5;
}

interface AuthContextState {
  attendance_protocol_id: string;
  desk_id: string | string[];
  desk_name?: string;
  queue_user_email?: string;
  queue_user_name?: string;
  queue_user_phone?: string;
  attendanceType?: string;
  socket?: Socket;
  rating?: Rating;
  currentDeskIndexToAttend: number;
  isAdmin: boolean;
  setAttendanceProtocolIdState(attendanceProtocolId: string): void;
  setCurrentDeskIndexToAttend(index: number): void;
  setTemporaryRating(temporaryRating: Rating): void;
  signIn(formData: SignInFormData, socket: Socket): void;
  signOut(): void;
  loadIsAdmin(): Promise<void>;
}

export const AuthContext = createContext<AuthContextState>(
  {} as AuthContextState,
);

export const AuthProvider: React.FC = ({ children }) => {
  const [session, loadingSession] = useSession();
  const [attendanceProtocolId, setAttendanceProtocolId] = useState<string>(
    () => {
      if (typeof window !== 'undefined') {
        const attendanceProtocolId = localStorage.getItem(
          '@BalcaoVirtual:AttendanceProtocolId',
        );

        return attendanceProtocolId;
      }

      return '';
    },
  );

  const [currentDeskIndex, setCurrentDeskIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const deskIndex = localStorage.getItem('@BalcaoVirtual:DeskIndex');

      return parseInt(deskIndex) || 0;
    }

    return 0;
  });

  const [isAdmin, setIsAdmin] = useState(null);

  const [data, setData] = useState<SignInFormData>(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('@BalcaoVirtual:AttendanceUser');

      if (user) {
        return JSON.parse(user);
      }
    }
    return {} as SignInFormData;
  });

  const [rating, setRating] = useState<Rating>(null);

  const [socket, setSocket] = useState<Socket>(null);

  const setTemporaryRating = useCallback((temporaryRating: Rating): void => {
    if (typeof window !== 'undefined') {
      setRating(temporaryRating);
    }
  }, []);

  const signIn = useCallback((formData: SignInFormData, socket: Socket) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('@BalcaoVirtual:AttendanceUser', JSON.stringify(formData));
      setData(formData);
      setSocket(socket);
    }
  }, []);

  const signOut = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@BalcaoVirtual:AttendanceUser');
      localStorage.removeItem('@BalcaoVirtual:DeskIndex');
      localStorage.removeItem('@BalcaoVirtual:AttendanceProtocolId');
      localStorage.removeItem('@BalcaoVirtual:ChatbotUserInteracted');
      setRating(null);
      signOutGoogle();
    }
  }, []);

  const setAttendanceProtocolIdState = useCallback(
    (attendanceProtocolId: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          '@BalcaoVirtual:AttendanceProtocolId',
          attendanceProtocolId,
        );
      }
      setAttendanceProtocolId(attendanceProtocolId);
    },
    [],
  );

  const setCurrentDeskIndexToAttend = useCallback(
    (index: number) => {
      localStorage.setItem('@BalcaoVirtual:DeskIndex', String(index));
      setCurrentDeskIndex(index);
    },
    [setCurrentDeskIndex],
  );

  const loadIsAdmin = useCallback(async () => {
    if (!loadingSession && session) {
      const response = await api.get(
        `/attendant/is-admin/${session?.user?.email}`,
      );

      setIsAdmin(response.data);
    }
  }, [loadingSession, session]);

  return (
    <AuthContext.Provider
      value={{
        attendance_protocol_id: attendanceProtocolId,
        queue_user_name: data.queue_user_name,
        queue_user_email: data.queue_user_email,
        queue_user_phone: data.queue_user_phone,
        attendanceType: data.attendanceType,
        desk_id: data.desk_id,
        desk_name: data.desk_name,
        socket,
        rating,
        currentDeskIndexToAttend: currentDeskIndex,
        isAdmin,
        setAttendanceProtocolIdState,
        setCurrentDeskIndexToAttend,
        setTemporaryRating,
        signIn,
        signOut,
        loadIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
