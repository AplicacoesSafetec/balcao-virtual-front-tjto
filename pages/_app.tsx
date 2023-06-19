import { Provider as NextAuthProvider } from 'next-auth/client';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import GlobalStyles from 'styles/global';
import { AuthProvider } from '../context/AuthContext';
import { ConfigProvider } from '../context/ConfigContext';
import { ChatbotProvider } from '../context/ChatbotContext';

import 'react-toastify/dist/ReactToastify.css';
import 'rsuite/dist/rsuite.min.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextAuthProvider session={pageProps.session}>
      {/* @ts-ignore */}
      <GlobalStyles />
      <ToastContainer newestOnTop />
      <AuthProvider>
        <ConfigProvider>
          <ChatbotProvider>
            <Head>
              <meta
                name="viewport"
                content="width=device-width, height=device-height, initial-scale=1"
              />
            </Head>
            {/* @ts-ignore */}
            <Component {...pageProps} />
          </ChatbotProvider>
        </ConfigProvider>
      </AuthProvider>
    </NextAuthProvider>
  );
}
