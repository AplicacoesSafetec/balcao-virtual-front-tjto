import React, { useContext, useCallback, useMemo, useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select, {
  ActionMeta,
  InputActionMeta,
  MultiValue,
  OnChangeValue,
} from 'react-select';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { visuallyHidden } from '@mui/utils';
import { ActionButtons, CategorySpan, DeskSpan } from './styles';
import {
  Attendant,
  ConfigContext,
  DeskAttendantsMapValue,
} from 'context/ConfigContext';

export interface AttendantData {
  id: string;
  name: string;
  email: string;
  queues: string;
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
  id: keyof AttendantData;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Nome',
  },
  {
    id: 'email',
    numeric: false,
    disablePadding: false,
    label: 'E-mail',
  },
  {
    id: 'queues',
    numeric: false,
    disablePadding: false,
    label: 'Fila',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof AttendantData,
  ) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler =
    (property: keyof AttendantData) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all desserts',
            }}
          />
        </TableCell>
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
        <TableCell width={10}>Ações</TableCell>
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  selected: readonly string[];
  handleClickOpenRefresh: () => void;
  handleClickOpenDelete: () => void;
  handleClickOpenAdd: () => void;
  handleClickOpenUpdate: () => void;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const {
    selected,
    handleClickOpenRefresh,
    handleClickOpenDelete,
    handleClickOpenAdd,
    handleClickOpenUpdate,
  } = props;

  const numSelected = selected.length;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity,
            ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selecionado(s)
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Exibindo todos
        </Typography>
      )}
      {numSelected > 0 ? (
        <>
          <Tooltip title="Editar Selecionados">
            <IconButton onClick={handleClickOpenUpdate}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Deletar Selecionados">
            <IconButton onClick={handleClickOpenDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Tooltip title="Recarregar">
            <IconButton onClick={handleClickOpenRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Adicionar">
            <IconButton onClick={handleClickOpenAdd}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </Toolbar>
  );
};

interface Option {
  readonly label: string;
  readonly value: string;
}

interface TableRowsData {
  attendantsMap: Map<string, Attendant>;
  deskAttendantsMap: Map<string, DeskAttendantsMapValue>;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

const createData = ({
  attendantsMap,
  deskAttendantsMap,
}: TableRowsData): AttendantData[] => {
  const attendants = Array.from(attendantsMap.values());
  const deskAttendants = Array.from(deskAttendantsMap.values());

  return attendants.map((attendant) => {
    return {
      ...attendant,
      queues: deskAttendants
        .filter((deskAttendant) => deskAttendant.attendant?.id === attendant.id)
        .map((deskAttendant) => {
          const { desk } = deskAttendant;

          return `${desk.deskCategory.name}/${desk.name}`;
        })
        .sort((desk1, desk2) => desk1.localeCompare(desk2))
        .join('; '),
    };
  });
};

export default function EnhancedTable() {
  const {
    attendantsMap,
    deskAttendantsMap,
    desksMap,
    handleClickOpenRefresh,
    loadingDelete,
    openDelete,
    handleDeleteAttendants,
    handleClickOpenDelete,
    handleCloseDelete,
    loadingAdd,
    openAdd,
    handleAddAttendants,
    handleClickOpenAdd,
    handleCloseAdd,
    loadingUpdate,
    openUpdate,
    handleClickOpenUpdate,
    handleCloseUpdate,
    handleUpdateDeskAttendants,
  } = useContext(ConfigContext);

  const rows = createData({
    attendantsMap,
    deskAttendantsMap,
  });

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof AttendantData>('name');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [selectedDesks, setSelectedDesks] = useState<readonly string[]>([]);
  const [selectedSingle, setSelectedSingle] = useState<readonly string[]>([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [inputValueAddAttendant, setInputValueAddAttendant] = useState('');
  const [valuesAddAttendant, setValuesAddAttendant] = useState<
    readonly Option[]
  >([]);

  const handleChangeAddAttendant = (
    valuesAddAttendant: OnChangeValue<Option, true>,
  ) => {
    setValuesAddAttendant(valuesAddAttendant);
  };

  const filterDuplicatedEmailAsOptionArray = (emails: string[]) => {
    const emailSet = new Set<string>(emails);
    const emailArray = Array.from(emailSet);

    const newEmailsArray = emailArray.filter(
      (email) =>
        emailPattern.test(email.trim()) &&
        !valuesAddAttendant.find(
          (valueAddAttendant) => valueAddAttendant.value === email.trim(),
        ),
    );

    const emailsAsOptionArray = newEmailsArray.map((email) =>
      createOption(email),
    );

    return emailsAsOptionArray;
  };

  const handleInputChangeAddAttendant = (inputValueAddAttendant: string) => {
    if (inputValueAddAttendant.includes(',')) {
      const emailsAsOptionArray = filterDuplicatedEmailAsOptionArray(
        inputValueAddAttendant.split(','),
      );

      setValuesAddAttendant([
        ...valuesAddAttendant,
        ...emailsAsOptionArray,
      ]);

      setInputValueAddAttendant('');
    } else {
      setInputValueAddAttendant(inputValueAddAttendant);
    }
  };

  const handleKeyDownAddAttendant: React.KeyboardEventHandler<
    HTMLDivElement
  > = (event) => {
    if (!inputValueAddAttendant) return;
    switch (event.key) {
      case 'Enter':
      case ' ':
      case ',':
        setInputValueAddAttendant('');

        const inputTrimmed = inputValueAddAttendant.trim();

        if (
          emailPattern.test(inputValueAddAttendant) &&
          !valuesAddAttendant.find(
            (valueAddAttendant) => valueAddAttendant.value === inputTrimmed,
          )
        ) {
          setValuesAddAttendant([
            ...valuesAddAttendant,
            createOption(inputValueAddAttendant),
          ]);
        }
        event.preventDefault();
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof AttendantData,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  interface DeskAttendantsSelect {
    readonly value: string;
    readonly label: string;
  }

  const onChangeUpdateSelect = (
    newValue: MultiValue<DeskAttendantsSelect>,
    action: ActionMeta<DeskAttendantsSelect>,
  ) => {
    setSelectedDesks(newValue.map(({ value }) => value));
  };

  const onInputChangeUpdateSelect = (
    inputValue: string,
    { action, prevInputValue }: InputActionMeta,
  ) => {
    switch (action) {
      case 'input-change':
        return inputValue;
      default:
        return prevInputValue;
    }
  };

  const deskAttendantsSelectOptions = useMemo(
    () =>
      Array.from(desksMap.values())
        .map((desk) => ({
          value: desk.id,
          label: `${desk.deskCategory.name}/${desk.name}`,
        }))
        .sort((desk1, desk2) => desk1.label.localeCompare(desk2.label)),
    [desksMap],
  );

  const filterDeskAttendants = useCallback(
    (options: Option[], selectedDesks: readonly string[]) => {
      return options.filter((testando) =>
        selectedDesks.includes(testando.value),
      );
    },
    [],
  );

  return (
    <Box sx={{ width: '100%' }}>
      {/* Update modal */}
      <Dialog
        open={openUpdate}
        onClose={
          !loadingUpdate
            ? () => {
                setSelectedSingle([]);
                setSelectedDesks([]);
                handleCloseUpdate();
              }
            : () => {}
        }
        scroll={'paper'}
        fullWidth={true}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Atualizar Filas</DialogTitle>
        <DialogContent style={{ height: 500 }} dividers={true}>
          <Select
            isMulti
            defaultValue={
              selectedSingle.length
                ? filterDeskAttendants(
                    deskAttendantsSelectOptions,
                    selectedDesks,
                  )
                : null
            }
            isClearable
            isSearchable
            closeMenuOnSelect={false}
            onChange={onChangeUpdateSelect}
            onInputChange={onInputChangeUpdateSelect}
            name="deskAttendants"
            options={deskAttendantsSelectOptions}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disabled={loadingUpdate}
            onClick={() => {
              setSelectedSingle([]);
              setSelectedDesks([]);
              handleCloseUpdate();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={loadingUpdate}
            onClick={() =>
              handleUpdateDeskAttendants(
                selectedSingle.length ? selectedSingle : selected,
                selectedDesks,
              )
            }
          >
            {loadingUpdate ? (
              <CircularProgress size={24.5} style={{ color: '#fff' }} />
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete modal */}
      <Dialog
        open={openDelete}
        onClose={
          !loadingDelete
            ? () => {
                setSelectedSingle([]);
                handleCloseDelete();
              }
            : () => {}
        }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Excluir</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Você deseja prosseguir com a exclusão?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disabled={loadingDelete}
            onClick={() => {
              setSelectedSingle([]);
              handleCloseDelete();
            }}
          >
            Não
          </Button>
          <Button
            variant="contained"
            disabled={loadingDelete}
            onClick={() =>
              handleDeleteAttendants(
                selectedSingle.length ? selectedSingle : selected,
              )
            }
            color="error"
            autoFocus
          >
            {loadingDelete ? (
              <CircularProgress size={24.5} style={{ color: '#fff' }} />
            ) : (
              'Sim'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add modal */}
      <Dialog open={openAdd} onClose={!loadingAdd ? handleCloseAdd : () => {}}>
        <DialogTitle>Adicionar Atendentes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Para adicionar atendentes, basta digitar os emails nos campos
            abaixo.
          </DialogContentText>
          <br />
          <CreatableSelect
            components={{
              DropdownIndicator: null,
            }}
            inputValue={inputValueAddAttendant}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={handleChangeAddAttendant}
            onBlur={() => {
              const inputTrimmed = inputValueAddAttendant.trim();

              if (emailPattern.test(inputTrimmed)) {
                setValuesAddAttendant([
                  ...valuesAddAttendant,
                  {
                    value: inputTrimmed,
                    label: inputTrimmed,
                  },
                ]);
              }

              setInputValueAddAttendant('');
            }}
            onInputChange={handleInputChangeAddAttendant}
            onKeyDown={handleKeyDownAddAttendant}
            placeholder="Digite ou cole emails separados por vírgula"
            value={valuesAddAttendant}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disabled={loadingAdd}
            onClick={handleCloseAdd}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={loadingAdd || !valuesAddAttendant.length}
            onClick={() =>
              handleAddAttendants(valuesAddAttendant.map(({ value }) => value))
            }
          >
            {loadingAdd ? (
              <CircularProgress size={24.5} style={{ color: '#fff' }} />
            ) : (
              'Adicionar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          selected={selected}
          handleClickOpenRefresh={handleClickOpenRefresh}
          handleClickOpenDelete={handleClickOpenDelete}
          handleClickOpenAdd={handleClickOpenAdd}
          handleClickOpenUpdate={handleClickOpenUpdate}
        />
        <TableContainer>
          <Table
            sx={{ minWidth: 150 }}
            aria-labelledby="tableTitle"
            size="medium"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
              rows.slice().sort(getComparator(order, orderBy)) */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onClick={(event) => handleClick(event, row.id)}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        {row.name}
                      </TableCell>
                      <TableCell align="left">{row.email}</TableCell>
                      <TableCell align="left">
                        {row.queues &&
                          row.queues.split('; ').map((queue) => {
                            const splitQueue = queue.split('/');
                            return (
                              <React.Fragment key={queue}>
                                <CategorySpan>{`${splitQueue[0]}/`}</CategorySpan>
                                <DeskSpan>{`${splitQueue[1]}; `}</DeskSpan>
                              </React.Fragment>
                            );
                          })}
                      </TableCell>
                      <TableCell align="right">
                        <ActionButtons>
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => {
                                setSelectedSingle([row.id]);

                                setSelectedDesks(
                                  Array.from(desksMap.values())
                                    .filter(
                                      ({ deskCategory, name }) =>
                                        !!row.queues
                                          .split('; ')
                                          .find(
                                            (queueItem) =>
                                              queueItem ===
                                              `${deskCategory.name}/${name}`,
                                          ),
                                    )
                                    .map(({ id }) => id),
                                );

                                handleClickOpenUpdate();
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Deletar">
                            <IconButton
                              onClick={() => {
                                setSelectedSingle([row.id]);
                                handleClickOpenDelete();
                              }}
                            >
                              <DeleteIcon />
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
