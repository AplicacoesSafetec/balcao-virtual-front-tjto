import { useEffect, useRef, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { Form, ChatContainer, ChatFlow, ChatHeader, Dummy } from './styles';
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

export default function ChatRoom(props: any) {
  const db = props.db;
  const dummySpace: any = useRef();
  const { uid, displayName, photoURL, protocol } = props.user;
  const [messages, setMessages]: any = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const prot = protocol
      ? protocol
      : localStorage.getItem('@BalcaoVirtual:AttendanceProtocolId');

    const qry = query(collection(db, prot), orderBy('createdAt'), limit(100));

    onSnapshot(qry, (querySnapShot: any) => {
      const data = querySnapShot.docs.map((doc: any) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setMessages(data);

      dummySpace.current.scrollIntoView({ behavior: 'smooth' });
    });
  }, [db, protocol]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const messageRef = doc(db, protocol, uuid());
    setDoc(messageRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid,
      id: uuid(),
      displayName,
      photoURL,
      user: 'teste',
    });
    setNewMessage('');
  };

  return (
    <ChatContainer>
      <ChatHeader>Agente - Balcão Virtual</ChatHeader>
      <ChatFlow id={props.viewOnly === 'true' ? 'viewOnly' : null}>
        <ul>
          {messages.map((message: any) => (
            <li
              key={message.id}
              className={message.uid === uid ? 'sent' : 'received'}
            >
              <section>
                {message.document ? (
                  <a
                    id="link"
                    href={`${message.document.url}`}
                    download={message.document.name}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {message.document.name}
                    <FiDownload style={{ marginLeft: 5 }} />
                  </a>
                ) : (
                  <p>{message.text}</p>
                )}
              </section>
            </li>
          ))}
        </ul>
        <Dummy ref={dummySpace}></Dummy>
      </ChatFlow>

      {props.viewOnly === 'false' && (
        <Form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
            />

            <button type="submit" disabled={!newMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" id="sendIcon">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                <path d="M0 0h24v24H0z" fill="none"></path>
              </svg>
            </button>
          </div>
        </Form>
      )}
    </ChatContainer>
  );
}
