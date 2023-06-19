import React, { useContext, useMemo, useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import { ActionMeta, OnChangeValue } from 'react-select';
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
import { ActionButtons } from './styles';
import { ConfigContext, DeskMapValue, Option } from 'context/ConfigContext';
import { TextField } from '@mui/material';

export interface DesksData {
  id: string;
  name: string;
  deskCategoryName: string;
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
  id: keyof DesksData;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'deskCategoryName',
    numeric: false,
    disablePadding: false,
    label: 'Categoria',
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Nome',
  },
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof DesksData,
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
    (property: keyof DesksData) => (event: React.MouseEvent<unknown>) => {
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
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const {
    selected,
    handleClickOpenRefresh,
    handleClickOpenDelete,
    handleClickOpenAdd,
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
        <Tooltip title="Deletar Selecionados">
          <IconButton onClick={handleClickOpenDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
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

const createOption = (label: string) => ({
  label,
  value: label,
});

const createData = (desksMap: Map<string, DeskMapValue>): DesksData[] => {
  const desks = Array.from(desksMap.values());

  return desks.map((desk) => {
    return {
      id: desk.id,
      deskCategoryName: desk.deskCategory.name,
      name: desk.name,
    };
  });
};

export default function EnhancedTable() {
  const {
    desksMap,
    deskCategoriesMap,
    handleClickOpenRefresh,
    loadingDelete,
    openDelete,
    handleDeleteDesks,
    handleClickOpenDelete,
    handleCloseDelete,
    loadingAdd,
    loadingAddCategory,
    recentlyAddedCategory,
    resetRecentlyAddedCategory,
    handleAddCategory,
    openAdd,
    handleAddDesk,
    handleClickOpenAdd,
    handleCloseAdd,
    loadingUpdate,
    openUpdate,
    handleClickOpenUpdate,
    handleCloseUpdate,
    handleUpdateDesk,
  } = useContext(ConfigContext);

  const rows = createData(desksMap);

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DesksData>('deskCategoryName');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Option>(null);
  const [selectedSingle, setSelectedSingle] = useState<readonly string[]>([]);
  const [selectedDeskToUpdate, setSelectedDeskToUpdate] =
    useState<DeskMapValue>(null);

  useEffect(() => {
    if (recentlyAddedCategory) {
      setSelectedCategory(recentlyAddedCategory);
    }

    resetRecentlyAddedCategory();
  }, [recentlyAddedCategory, resetRecentlyAddedCategory]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [inputValueAddDesk, setInputValueAddDesk] = useState('');
  const [valuesAddDesk, setValuesAddDesk] = useState<readonly Option[]>([]);

  const handleChangeAddDesk = (valuesAddDesk: OnChangeValue<Option, true>) => {
    setValuesAddDesk(valuesAddDesk);
  };

  const filterDuplicatedDesksNamesAsOptionArray = (desksNames: string[]) => {
    const desksNamesSet = new Set<string>(desksNames);
    const desksNamesArray = Array.from(desksNamesSet);

    const newDesksNamesArray = desksNamesArray.filter(
      (deskName) =>
        !valuesAddDesk.find(
          (valueAddDesk) => valueAddDesk.value === deskName.trim(),
        ),
    );

    const desksNamesAsOptionArray = newDesksNamesArray.map((deskName) =>
      createOption(deskName),
    );

    return desksNamesAsOptionArray;
  };

  const handleInputChangeAddDesk = (inputValueAddDesk: string) => {
    if (inputValueAddDesk.includes(',')) {
      const splittedDesksNames = filterDuplicatedDesksNamesAsOptionArray(
        inputValueAddDesk.split(','),
      );

      setValuesAddDesk([...valuesAddDesk, ...splittedDesksNames]);

      setInputValueAddDesk('');
    } else {
      setInputValueAddDesk(inputValueAddDesk);
    }
  };

  const handleKeyDownAddAttendant: React.KeyboardEventHandler<
    HTMLDivElement
  > = (event) => {
    if (!inputValueAddDesk) return;
    switch (event.key) {
      case 'Enter':
      case ',':
        setInputValueAddDesk('');

        const inputTrimmed = inputValueAddDesk.trim();

        if (
          inputTrimmed &&
          !valuesAddDesk.find(
            (valueAddDesk) => valueAddDesk.value === inputTrimmed,
          )
        ) {
          setValuesAddDesk([...valuesAddDesk, createOption(inputValueAddDesk)]);
        }
        event.preventDefault();
    }
  };

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof DesksData,
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

  const deskCategoriesSelectOptions = useMemo(
    () =>
      Array.from(deskCategoriesMap.values())
        .map((deskCategory) => ({
          value: deskCategory.id,
          label: deskCategory.name,
        }))
        .sort((desk1, desk2) => desk1.label.localeCompare(desk2.label)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deskCategoriesMap.values()],
  );

  const handleChangeCategory = (
    newValue: OnChangeValue<Option, false>,
    actionMeta: ActionMeta<Option>,
  ) => {
    setSelectedCategory(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Update modal */}
      <Dialog
        open={openUpdate}
        onClose={
          !loadingUpdate
            ? () => {
                setSelectedCategory(null);
                setSelectedDeskToUpdate(null);
                handleCloseUpdate();
              }
            : () => {}
        }
      >
        <DialogTitle>Atualizar Balcão</DialogTitle>
        <DialogContent style={{ height: 500 }} dividers={true}>
          <DialogContentText>
            Para alterar este balcão, basta alterar os campos abaixo.
          </DialogContentText>
          <CreatableSelect
            isClearable
            isDisabled={loadingAddCategory || loadingUpdate}
            isLoading={loadingAddCategory || loadingUpdate}
            onChange={handleChangeCategory}
            onCreateOption={handleAddCategory}
            options={deskCategoriesSelectOptions}
            value={selectedCategory}
            autoFocus
          />
          <TextField
            disabled={loadingUpdate}
            margin="dense"
            id="deskName"
            label="Nome do balcão"
            fullWidth
            variant="standard"
            value={selectedDeskToUpdate?.name}
            onChange={(e) => {
              setSelectedDeskToUpdate({
                ...selectedDeskToUpdate,
                name: e.target.value,
              });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disabled={loadingAddCategory || loadingUpdate}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedDeskToUpdate(null);
              handleCloseUpdate();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={
              loadingAddCategory || loadingUpdate || !selectedDeskToUpdate?.name
            }
            onClick={() =>
              handleUpdateDesk(selectedCategory.value, selectedDeskToUpdate)
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
              handleDeleteDesks(
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
        <DialogTitle>Adicionar Balcões</DialogTitle>
        <DialogContent style={{ height: 300 }} dividers={true}>
          <DialogContentText>
            Para adicionar balcões, basta preencher os campos abaixo.
          </DialogContentText>
          <br />
          <CreatableSelect
            isClearable
            isDisabled={loadingAddCategory || loadingAdd}
            isLoading={loadingAddCategory || loadingAdd}
            onChange={handleChangeCategory}
            onCreateOption={handleAddCategory}
            options={deskCategoriesSelectOptions}
            value={selectedCategory}
          />
          <br />
          <CreatableSelect
            components={{
              DropdownIndicator: null,
            }}
            inputValue={inputValueAddDesk}
            isDisabled={!selectedCategory}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={handleChangeAddDesk}
            onBlur={() => {
              const inputTrimmed = inputValueAddDesk.trim();
              if (inputTrimmed) {
                setValuesAddDesk([
                  ...valuesAddDesk,
                  {
                    value: inputTrimmed,
                    label: inputTrimmed,
                  },
                ]);
              }

              setInputValueAddDesk('');
            }}
            onInputChange={handleInputChangeAddDesk}
            onKeyDown={handleKeyDownAddAttendant}
            placeholder="Digite ou cole nomes separados por vírgula"
            value={valuesAddDesk}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            disabled={loadingAdd || loadingAddCategory}
            onClick={handleCloseAdd}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={loadingAdd || loadingAddCategory || !valuesAddDesk.length}
            onClick={() =>
              handleAddDesk(
                selectedCategory.value,
                valuesAddDesk.map(({ value }) => value),
              )
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
                      <TableCell padding="none" align="left">
                        {row.deskCategoryName}
                      </TableCell>

                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="right" padding="none">
                        <ActionButtons>
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => {
                                const desk = desksMap.get(row.id);

                                if (desk) {
                                  setSelectedDeskToUpdate({ ...desk });

                                  const { deskCategory } = desk;

                                  setSelectedCategory({
                                    label: deskCategory.name,
                                    value: deskCategory.id,
                                  });

                                  handleClickOpenUpdate();
                                }
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
