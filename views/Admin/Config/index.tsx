import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import CircularProgress from '@mui/material/CircularProgress';
import Layout, { siteTitle } from 'components/Layout';
import AttendantsTable from 'components/AttendantsTable';
import AttendancesTable from 'components/AttendancesTable';
import DesksTable from 'components/DesksTable';
import { ConfigContext } from 'context/ConfigContext';
import { Container, SideMenu, Button } from './styles';
import { Typography } from '@mui/material';

type SelectedConfig = 'desks' | 'attendants' | 'attendances';

export default function Config() {
  const { loading, loadConfig } = useContext(ConfigContext);

  const [selectedConfig, setSelectedConfig] = useState<SelectedConfig>('desks');

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <Layout showBackButton showLogoutButton>
      <Head>
        <title>{siteTitle} - Configurações</title>
      </Head>
      <Container isLoading={loading}>
        {loading && <CircularProgress style={{ color: '#fff' }} />}
        {!loading && (
          <SideMenu>
            <Button
              active={selectedConfig === 'desks'}
              onClick={() => {
                setSelectedConfig('desks');
              }}
            >
              <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                component="div"
              >
                Balcões
              </Typography>
            </Button>
            <Button
              active={selectedConfig === 'attendants'}
              onClick={() => {
                setSelectedConfig('attendants');
              }}
            >
              <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                component="div"
              >
                Atendentes
              </Typography>
            </Button>

            <Button
              active={selectedConfig === 'attendances'}
              onClick={() => {
                setSelectedConfig('attendances');
              }}
            >
              <Typography
                sx={{ flex: '1 1 100%' }}
                variant="h6"
                component="div"
              >
                Atendimentos
              </Typography>
            </Button>
          </SideMenu>
        )}
        {!loading && selectedConfig === 'desks' && <DesksTable />}
        {!loading && selectedConfig === 'attendances' && <AttendancesTable />}
        {!loading && selectedConfig === 'attendants' && <AttendantsTable />}
      </Container>
    </Layout>
  );
}
