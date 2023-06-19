import { useContext } from 'react';
import { AuthContext } from 'context/AuthContext';
import Head from 'next/head';
import Image from 'next/image';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import { FcGoogle } from 'react-icons/fc';
import ButtonGoogle from 'components/ButtonGoogle';
import { useRouter } from 'next/router';
import {
  Container,
  Header,
  Main,
  Grid,
  Footer,
  Copyright,
  Dummy,
  Vector,
  TopButtonArea,
} from './styles';

export const siteTitle = 'Balcão Virtual';

export default function Layout({
  children,
  noHeader,
  showLogoutButton,
  showBackgroundImage,
  showBackButton,
  showConfigButton,
}: {
  children: React.ReactNode;
  noHeader?: boolean;
  showLogoutButton?: boolean;
  showBackgroundImage?: boolean;
  showBackButton?: boolean;
  showConfigButton?: boolean;
}) {
  const { signOut } = useContext(AuthContext);
  const router = useRouter();

  return (
    <Container showBackgroundImage={showBackgroundImage}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Balcão Virtual" />
        <meta name="og:description" content="Balcão Virtual" />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <Grid>
        {noHeader ? (
          <Dummy />
        ) : (
          <Header>
            {showBackButton && (
              <TopButtonArea>
                <IconButton
                  onClick={() => {
                    router.replace('/atendente/fila');
                  }}
                >
                  <ArrowBackIcon style={{ color: 'white', fontSize: 80 }} />
                </IconButton>
              </TopButtonArea>
            )}

            {showConfigButton && (
              <TopButtonArea>
                <IconButton
                  onClick={() => {
                    router.replace('/admin/config');
                  }}
                >
                  <SettingsIcon style={{ color: 'white', fontSize: 80 }} />
                </IconButton>
              </TopButtonArea>
            )}
            <Image
              src="/images/logo-branco-horizontal-5.svg"
              alt="logo"
              width={503}
              height={116}
              draggable={false}
            />
          </Header>
        )}
        <Vector>
          <Image
            src="/images/vector-1.svg"
            alt="logo"
            width={164}
            height={238}
            draggable={false}
          />
        </Vector>
        <Main>{children}</Main>
        <Footer>
          <Copyright>Copyright © 2021 Safetec</Copyright>
          {showLogoutButton ? (
            <ButtonGoogle onClick={() => signOut()}>
              <FcGoogle size="2rem" />
              Sair
            </ButtonGoogle>
          ) : (
            <Dummy />
          )}
          <Dummy />
        </Footer>
      </Grid>
    </Container>
  );
}
