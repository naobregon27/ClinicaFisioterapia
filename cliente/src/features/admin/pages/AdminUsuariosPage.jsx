import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  MenuItem,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Pagination,
  Divider,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  LockOpen as LockOpenIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import {
  fetchAdminUsuarios,
  createAdminUsuario,
  updateAdminUsuario,
  setAdminUsuariosFiltros,
  changeAdminUsuarioEstado,
  changeAdminUsuarioRol,
  resetAdminUsuarioPassword,
  desbloquearAdminUsuario,
  clearAdminUsuariosMessages,
  selectAdminUsuariosState,
} from '../slices/adminUsuariosSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

const schema = yup.object({
  nombre: yup.string().required('Nombre requerido'),
  apellido: yup.string().required('Apellido requerido'),
  email: yup.string().email('Email inválido').required('Email requerido'),
  telefono: yup.string().nullable(),
  password: yup.string().when('isEdit', {
    is: false,
    then: (schemaPwd) => schemaPwd.required('Contraseña requerida').min(8, 'Mínimo 8 caracteres'),
    otherwise: (schemaPwd) => schemaPwd.notRequired(),
  }),
  rol: yup.string().oneOf(['administrador', 'empleado', 'usuario']).required(),
});

const rolesOptions = [
  { value: '', label: 'Todos los roles' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'empleado', label: 'Empleado' },
  { value: 'usuario', label: 'Usuario' },
];

const estadoOptions = [
  { value: '', label: 'Todos los estados' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'suspendido', label: 'Suspendido' },
  { value: 'pendiente_verificacion', label: 'Pendiente' },
];

const AdminUsuariosPage = () => {
  const dispatch = useDispatch();
  const { usuarios, filtros, loading, pagination, successMessage, error } = useSelector(selectAdminUsuariosState);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      password: '',
      rol: 'empleado',
      isEdit: false,
    },
  });

  useEffect(() => {
    dispatch(fetchAdminUsuarios(filtros));
  }, [dispatch, filtros]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAdminUsuariosMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAdminUsuariosMessages());
    }
  }, [successMessage, error, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(
      setAdminUsuariosFiltros({
        ...filtros,
        [key]: value,
        page: key === 'page' ? value : 1,
      })
    );
  };

  const openModal = (usuario = null) => {
    setIsEdit(!!usuario);
    setUsuarioEdit(usuario);
    reset({
      nombre: usuario?.nombre || '',
      apellido: usuario?.apellido || '',
      email: usuario?.email || '',
      telefono: usuario?.telefono || '',
      password: '',
      rol: usuario?.rol || 'empleado',
      isEdit: !!usuario,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setUsuarioEdit(null);
  };

  const onSubmit = (data) => {
    const payload = { ...data };
    delete payload.isEdit;
    if (isEdit && usuarioEdit) {
      dispatch(updateAdminUsuario({ id: usuarioEdit.id || usuarioEdit._id, data: payload })).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          closeModal();
        }
      });
    } else {
      dispatch(createAdminUsuario(payload)).then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          closeModal();
        }
      });
    }
  };

  const handleRolChange = (usuario, nuevoRol) => {
    dispatch(changeAdminUsuarioRol({ id: usuario.id || usuario._id, rol: nuevoRol }));
  };

  const handleEstadoChange = (usuario, nuevoEstado) => {
    dispatch(changeAdminUsuarioEstado({ id: usuario.id || usuario._id, estado: nuevoEstado }));
  };

  const handleResetPassword = (usuario) => {
    const nuevaPassword = window.prompt('Nueva contraseña para el usuario');
    if (nuevaPassword) {
      dispatch(resetAdminUsuarioPassword({ id: usuario.id || usuario._id, password: nuevaPassword }));
    }
  };

  const handleDesbloquear = (usuario) => {
    dispatch(desbloquearAdminUsuario(usuario.id || usuario._id));
  };

  const estadoColor = useMemo(
    () => ({
      activo: 'success',
      inactivo: 'default',
      suspendido: 'warning',
      pendiente_verificacion: 'info',
    }),
    []
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Gestión de Usuarios
          </Typography>
          <Typography color="text.secondary">Administra todo el equipo, roles y accesos.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal()} sx={{ borderRadius: 2 }}>
          Nuevo Usuario
        </Button>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Buscar"
                value={filtros.busqueda}
                onChange={(e) => handleFilterChange('busqueda', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Rol"
                value={filtros.rol}
                onChange={(e) => handleFilterChange('rol', e.target.value)}
              >
                {rolesOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={filtros.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                {estadoOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ py: 6 }}>
              <LoadingSpinner fullScreen={false} message="Cargando usuarios..." />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Teléfono</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id || usuario._id} hover>
                        <TableCell>
                          <Stack direction="column">
                            <Typography fontWeight={600}>
                              {usuario.nombre} {usuario.apellido}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Último acceso: {usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleDateString() : '--'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>{usuario.telefono || '-'}</TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <InputLabel>Rol</InputLabel>
                            <Select
                              label="Rol"
                              value={usuario.rol}
                              onChange={(e) => handleRolChange(usuario, e.target.value)}
                            >
                              {rolesOptions
                                .filter((option) => option.value)
                                .map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={usuario.estado?.replace('_', ' ') || 'activo'}
                              color={estadoColor[usuario.estado] || 'default'}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                            <Select
                              size="small"
                              value={usuario.estado}
                              onChange={(e) => handleEstadoChange(usuario, e.target.value)}
                            >
                              {estadoOptions
                                .filter((option) => option.value)
                                .map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                            </Select>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton onClick={() => openModal(usuario)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Restablecer contraseña">
                            <IconButton onClick={() => handleResetPassword(usuario)}>
                              <RefreshIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Desbloquear">
                            <span>
                              <IconButton onClick={() => handleDesbloquear(usuario)} disabled={!usuario?.bloqueado}>
                                <LockOpenIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {usuarios.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                              No se encontraron usuarios con los filtros aplicados.
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination
                  color="primary"
                  page={pagination.page}
                  count={pagination.totalPages || 1}
                  onChange={(_, value) => handleFilterChange('page', value)}
                  shape="rounded"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Nombre" fullWidth {...register('nombre')} error={!!errors.nombre} helperText={errors.nombre?.message} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Apellido" fullWidth {...register('apellido')} error={!!errors.apellido} helperText={errors.apellido?.message} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Teléfono" fullWidth {...register('telefono')} error={!!errors.telefono} helperText={errors.telefono?.message} />
              </Grid>
              {!isEdit && (
                <Grid item xs={12}>
                  <TextField
                    label="Contraseña"
                    fullWidth
                    type="password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message || 'Mínimo 8 caracteres'}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField select label="Rol" fullWidth {...register('rol')} defaultValue="empleado">
                  {rolesOptions
                    .filter((option) => option.value)
                    .map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminUsuariosPage;






