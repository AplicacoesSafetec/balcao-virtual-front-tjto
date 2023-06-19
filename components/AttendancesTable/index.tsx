import ChatIcon from '@mui/icons-material/Chat';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { visuallyHidden } from '@mui/utils';
import { addSeconds, endOfDay, format, startOfDay, subDays } from 'date-fns';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import { DateRangePicker } from 'rsuite';

import { ConfigContext } from 'context/ConfigContext';
import {
  ActionButtons,
  CategorySpan,
  DeskSpan,
  OrangeSwitch,
  QueueUserLink,
} from './styles';
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';

export interface AttendanceRegistryData {
  attendance_protocol_id: string;
  desk_name: string;
  attendant_name: string;
  attendant_email: string;
  started_at: Date;
  finished_at: Date;
  attendance_duration_seconds?: number;
  process_number?: string;
  has_process_leveraged: boolean;
  process_leveraged_at: Date;
  queue_user_name: string;
  queue_user_email: string;
  has_chatbot_conversation?: boolean;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: string }, b: { [key in Key]: string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number,
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof AttendanceRegistryData;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'attendance_protocol_id',
    numeric: false,
    disablePadding: false,
    label: 'Protocolo',
  },
  {
    id: 'desk_name',
    numeric: false,
    disablePadding: false,
    label: 'Balcão',
  },
  {
    id: 'attendant_email',
    numeric: false,
    disablePadding: false,
    label: 'Atendente',
  },
  {
    id: 'queue_user_name',
    numeric: false,
    disablePadding: false,
    label: 'Solicitante',
  },
  ,
  {
    id: 'started_at',
    numeric: false,
    disablePadding: false,
    label: 'Início',
  },
  {
    id: 'finished_at',
    numeric: false,
    disablePadding: false,
    label: 'Fim',
  },
  {
    id: 'attendance_duration_seconds',
    numeric: false,
    disablePadding: false,
    label: 'Duração',
  },
  {
    id: 'process_number',
    numeric: false,
    disablePadding: false,
    label: 'Número do Processo',
  },
  {
    id: 'has_process_leveraged',
    numeric: false,
    disablePadding: true,
    label: 'Impulsionado',
  },
];

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof AttendanceRegistryData,
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof AttendanceRegistryData) =>
    (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" style={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell width={10}>Chat</TableCell>
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  handleChangeShowOnlyLeveraged: (
    _: unknown,
    showOnlyLeveraged: boolean,
  ) => void;
  showOnlyLeveraged: boolean;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const [startedAt, setStartedAt] = useState(new Date());
  const [finishedAt, setFinishedAt] = useState(new Date());

  const { handleChangeShowOnlyLeveraged, showOnlyLeveraged } = props;

  const { loadAttendancesRegistry, handleClickOpenRefresh } =
    useContext(ConfigContext);

  useEffect(() => {
    loadAttendancesRegistry(startedAt, finishedAt);
  }, [finishedAt, loadAttendancesRegistry, startedAt]);

  const { allowedRange } = DateRangePicker;
  const dateNow = new Date();

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%', padding: '15px 0px' }}
        variant="h6"
        id="tableTitle"
        component="div"
      >
        Registros de atendimento
      </Typography>
      <Tooltip title="Exibir apenas processos impulsionados">
        <FormGroup
          sx={{
            flex: '1 1 100%',
            alignItems: 'flex-end',
          }}
        >
          <FormControlLabel
            control={
              <OrangeSwitch
                checked={showOnlyLeveraged}
                onChange={handleChangeShowOnlyLeveraged}
              />
            }
            label="Exibir apenas processos impulsionados"
          />
        </FormGroup>
      </Tooltip>
      <Tooltip title="Filtro de data de intervalo de datas dos atendimentos">
        <>
          <DateRangePicker
            placement="autoVerticalEnd"
            defaultValue={[startedAt, finishedAt]}
            ranges={[
              {
                label: 'Hoje',
                value: [startOfDay(new Date()), endOfDay(new Date())],
              },
              {
                label: 'Últimos 7 dias',
                value: [
                  startOfDay(subDays(new Date(), 6)),
                  endOfDay(new Date()),
                ],
              },
              {
                label: 'Últimos 30 dias',
                value: [
                  startOfDay(subDays(new Date(), 29)),
                  endOfDay(new Date()),
                ],
              },
            ]}
            onChange={(filterDateChanged) => {
              if (filterDateChanged) {
                const [started, finished] = filterDateChanged;

                setStartedAt(started);
                setFinishedAt(finished);
              }
            }}
            appearance="subtle"
            placeholder="Filtrar data"
            disabledDate={allowedRange(subDays(dateNow, 29), dateNow)}
            showOneCalendar
            format="yyyy-MM-dd"
          />
        </>
      </Tooltip>
      <Tooltip title="Recarregar">
        <IconButton onClick={handleClickOpenRefresh}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
};

export default function EnhancedTable() {
  const {
    attendancesRegistryMap,
    chatbotMessages,
    loadingChat,
    handleClickOpenChat,
    openChat,
    handleCloseChat,
    handleGetChat,
  } = useContext(ConfigContext);

  const [rows, setRows] = useState(Array.from(attendancesRegistryMap.values()));
  const [showOnlyLeveraged, setShowOnlyLeveraged] = useState(false);

  useEffect(() => {
    setRows(Array.from(attendancesRegistryMap.values()));
  }, [attendancesRegistryMap]);

  useEffect(() => {
    const rows = Array.from(attendancesRegistryMap.values());

    if (showOnlyLeveraged) {
      setRows(
        rows.filter((row) => row.has_process_leveraged === showOnlyLeveraged),
      );
    } else {
      setRows(rows);
    }
  }, [attendancesRegistryMap, showOnlyLeveraged]);

  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof AttendanceRegistryData>(
    'attendance_protocol_id',
  );
  const [selectedSingle, setSelectedSingle] = useState<readonly string[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof AttendanceRegistryData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeShowOnlyLeveraged = (_, showOnlyLeveraged: boolean) => {
    setShowOnlyLeveraged(showOnlyLeveraged);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const oneHourSeconds = 1 * 60 * 60;
  const oneDaySeconds = 24 * oneHourSeconds;
  const router = useRouter();
  const navigateToChat = (att: any) => {
    router.push({
      pathname: '/atendente/newChat/', query: {
        protocol: att.attendance_protocol_id,
        viewOnly: true,
        userData: JSON.stringify({
        userName: att.queue_user_name,
        userEmail: att.queue_user_email,
        userPhone: att.queue_user_phone
      })
      },
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Chat modal */}
      <Dialog open={openChat} onClose={handleCloseChat}>
        <DialogTitle>Conversa</DialogTitle>
        <DialogContent>
          {loadingChat ? (
            <CircularProgress size={30} style={{ color: '#777' }} />
          ) : (
            chatbotMessages?.map((chatbotMessage) => (
              <>
                <DialogContentText fontSize={'0.8rem'}>
                  <strong>{chatbotMessage.sender}:</strong>{' '}
                  {chatbotMessage.content}
                </DialogContentText>
                <br />
              </>
            ))
          )}
        </DialogContent>
      </Dialog>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          handleChangeShowOnlyLeveraged={handleChangeShowOnlyLeveraged}
          showOnlyLeveraged={showOnlyLeveraged}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 150 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={row.attendance_protocol_id}
                    >
                      <TableCell component="th" scope="row" padding="normal">
                        {row.attendance_protocol_id}
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        <>
                          {row.desk_name?.split('/').map((item, index) => {
                            if (!index) {
                              return (
                                <CategorySpan
                                  key={row.attendance_protocol_id + item}
                                >{`${item}/`}</CategorySpan>
                              );
                            }
                            return (
                              <DeskSpan
                                key={row.attendance_protocol_id + item}
                              >{`${item}; `}</DeskSpan>
                            );
                          })}
                        </>
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        {row.attendant_email &&
                          (row.attendant_name || 'Sem nome')}
                        <br />
                        {row.attendant_email}
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        <Link href={`tel:${row.queue_user_phone}`} passHref>
                          <QueueUserLink>{row.queue_user_name}</QueueUserLink>
                        </Link>
                        <br />
                        <Link href={`mailto:${row.queue_user_email}`} passHref>
                          <QueueUserLink>{row.queue_user_email}</QueueUserLink>
                        </Link>
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        {format(
                          new Date(row.started_at || row.created_at),
                          `dd/MM/yyyy HH:mm`,
                        )}
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        {format(new Date(row.finished_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        {format(
                          addSeconds(
                            new Date('1970-01-01T00:00'),
                            row.attendance_duration_seconds,
                          ),
                          `${
                            oneDaySeconds <= row.attendance_duration_seconds
                              ? "D'd'"
                              : ''
                          }${
                            oneHourSeconds <= row.attendance_duration_seconds
                              ? "H'h'"
                              : ''
                          }mm'm'ss's'`,
                          { useAdditionalDayOfYearTokens: true },
                        )}
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        {row.process_number}
                      </TableCell>
                      <TableCell align="left" padding="normal">
                        {row.has_process_leveraged ? 'Sim' : 'Não'}
                      </TableCell>

                      <TableCell align="right" padding="none">
                        <ActionButtons>
                          <Tooltip title="Abrir chat">
                            <IconButton
                              onClick={() => {
                                setSelectedSingle([row.attendance_protocol_id]);
                                // handleClickOpenChat();
                                // handleGetChat(row.attendance_protocol_id);
                                navigateToChat(row)
                              }}
                              // disabled={!row.has_chatbot_conversation}
                            >
                              <ChatIcon />
                            </IconButton>
                          </Tooltip>
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          labelRowsPerPage="Linhas por página:"
          rowsPerPageOptions={[5, 10, 25]}
          labelDisplayedRows={({ from, to, count }) => {
            return `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`;
          }}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
