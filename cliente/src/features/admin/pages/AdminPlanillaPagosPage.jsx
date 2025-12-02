import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Stack,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  fetchPagosPlanilla,
  createPagoRegistro,
  updatePagoRegistro,
  setAdminPagosFiltros,
  clearAdminPagosMessages,
  selectAdminPagosState,
  fetchPagosColaboradores,
} from '../slices/adminPagosSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

const todayIso = format(new Date(), 'yyyy-MM-dd');

const monthOptions = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const estadoPagoOptions = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'procesado', label: 'Procesado' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'cancelado', label: 'Cancelado' },
];

const turnoOptions = [
  { value: 'mañana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];

const AdminPlanillaPagosPage = () => {
  const dispatch = useDispatch();
  const { registros, planillas, filtros, loading, successMessage, error, colaboradores, colaboradoresLoading } =
    useSelector(selectAdminPagosState);
  const [modalOpen, setModalOpen] = useState(false);
  const [registroEdit, setRegistroEdit] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fecha: todayIso,
      empleadoId: '',
      turno: 'mañana',
      horasTrabajadas: '',
      monto: '',
      farfan: '',
      mica: '',
      ffma: '',
      estado: 'pendiente',
      observaciones: '',
    },
  });

  useEffect(() => {
    dispatch(fetchPagosPlanilla());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPagosColaboradores());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAdminPagosMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAdminPagosMessages());
    }
  }, [successMessage, error, dispatch]);

  const handleFilterChange = (key, value) => {
    dispatch(setAdminPagosFiltros({ ...filtros, [key]: value }));
  };

  const openModal = (registro = null) => {
    setRegistroEdit(registro);
    reset({
      fecha: registro?.fecha ? format(new Date(registro.fecha), 'yyyy-MM-dd') : todayIso,
      empleadoId: registro?.empleadoId || registro?.empleado?._id || '',
      turno: registro?.turno || 'mañana',
      horasTrabajadas: registro?.horasTrabajadas?.toString() || '',
      monto: registro?.monto?.toString() || '',
      farfan: registro?.distribucion?.farfan?.toString() || '',
      mica: registro?.distribucion?.mica?.toString() || '',
      ffma: registro?.distribucion?.ffma?.toString() || '',
      estado: registro?.estado || 'pendiente',
      observaciones: registro?.observaciones || '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setRegistroEdit(null);
  };

  const onSubmit = (data) => {
    const distribucion = ['farfan', 'mica', 'ffma'].reduce((acc, key) => {
      if (data[key]) acc[key] = Number(data[key]);
      return acc;
    }, {});

    const payload = {
      fecha: data.fecha,
      empleadoId: data.empleadoId,
      turno: data.turno,
      horasTrabajadas: data.horasTrabajadas ? Number(data.horasTrabajadas) : undefined,
      monto: Number(data.monto),
      estado: data.estado,
      observaciones: data.observaciones,
    };

    if (Object.keys(distribucion).length > 0) {
      payload.distribucion = distribucion;
    }

    if (!payload.horasTrabajadas) delete payload.horasTrabajadas;

    const thunk = registroEdit
      ? updatePagoRegistro({ id: registroEdit.id || registroEdit._id, data: payload })
      : createPagoRegistro(payload);

    dispatch(thunk).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') closeModal();
    });
  };

  const colaboradoresMap = useMemo(() => {
    const map = {};
    colaboradores.forEach((colaborador) => {
      map[colaborador.id] = colaborador;
    });
    return map;
  }, [colaboradores]);

  const planillaSeleccionada = useMemo(() => {
    if (!planillas || planillas.length === 0) return null;
    const match = planillas.find(
      (planillaItem) =>
        (!filtros.mes || planillaItem.mes === Number(filtros.mes)) &&
        (!filtros.año || planillaItem.año === Number(filtros.año))
    );
    return match || planillas[0];
  }, [planillas, filtros]);

  const registrosFiltrados = useMemo(() => {
    if (!registros) return [];
    return registros.filter((registro) => {
      const fecha = registro.fecha ? new Date(registro.fecha) : null;
      const monthMatches =
        !filtros.mes || registro.mes === Number(filtros.mes) || (fecha ? fecha.getMonth() + 1 === Number(filtros.mes) : false);
      const yearMatches =
        !filtros.año || registro.año === Number(filtros.año) || (fecha ? fecha.getFullYear() === Number(filtros.año) : false);
      const stateMatches = !filtros.estado || registro.estado === filtros.estado;
      const weekMatches = !filtros.semana || String(registro.semana) === String(filtros.semana);
      return monthMatches && yearMatches && stateMatches && weekMatches;
    });
  }, [registros, filtros]);

  const registrosOrdenados = useMemo(() => {
    if (!registrosFiltrados) return [];
    return [...registrosFiltrados].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
  }, [registrosFiltrados]);

  const totalesMes = useMemo(() => {
    if (registrosFiltrados && registrosFiltrados.length) {
      return registrosFiltrados.reduce(
        (acc, registro) => {
          acc.total += registro.monto || 0;
          acc.distribucion.farfan += registro.distribucion?.farfan || 0;
          acc.distribucion.mica += registro.distribucion?.mica || 0;
          acc.distribucion.ffma += registro.distribucion?.ffma || 0;
          return acc;
        },
        { total: 0, distribucion: { farfan: 0, mica: 0, ffma: 0 } }
      );
    }
    return planillaSeleccionada?.totales || { total: 0, distribucion: { farfan: 0, mica: 0, ffma: 0 } };
  }, [registrosFiltrados, planillaSeleccionada]);

  const estadisticasPorEstado = useMemo(() => {
    if (registrosFiltrados && registrosFiltrados.length) {
      return registrosFiltrados.reduce((acc, registro) => {
        const estado = registro.estado || 'desconocido';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});
    }
    if (!planillaSeleccionada) return {};
    const registrosPlanilla = Object.values(planillaSeleccionada.semanas || {}).flatMap((semana) =>
      Object.values(semana.dias || {})
    );
    return registrosPlanilla.reduce((acc, dia) => {
      const estado = dia.estado || 'desconocido';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
  }, [registrosFiltrados, planillaSeleccionada]);

  const formatColaborador = (registro) => {
    if (registro.colaborador?.nombreCompleto) return registro.colaborador.nombreCompleto;
    if (registro.colaboradorNombre) return registro.colaboradorNombre;
    if (registro.empleado?.nombreCompleto) return registro.empleado.nombreCompleto;
    if (registro.empleadoNombre) return registro.empleadoNombre;
    if (registro.empleado) {
      return `${registro.empleado.nombre || ''} ${registro.empleado.apellido || ''}`.trim();
    }
    if (registro.empleadoId && colaboradoresMap[registro.empleadoId]) {
      const colab = colaboradoresMap[registro.empleadoId];
      return colab.nombreCompleto || `${colab.nombre || ''} ${colab.apellido || ''}`.trim();
    }
    return '—';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Planilla de Pagos del Personal
          </Typography>
          <Typography color="text.secondary">Control diario automatizado con distribución personalizada.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal()} sx={{ borderRadius: 2 }}>
          Registrar pago diario
        </Button>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)', mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Mes"
                fullWidth
                value={filtros.mes}
                onChange={(e) => handleFilterChange('mes', Number(e.target.value))}
              >
                {monthOptions.map((label, index) => (
                  <MenuItem key={label} value={index + 1}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField label="Año" type="number" fullWidth value={filtros.año} onChange={(e) => handleFilterChange('año', Number(e.target.value))} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                label="Estado"
                fullWidth
                value={filtros.estado}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
              >
                {estadoPagoOptions.map((option) => (
                  <MenuItem key={option.value || 'todos'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="Semana (1-5)"
                type="number"
                fullWidth
                value={filtros.semana}
                onChange={(e) => handleFilterChange('semana', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Cargando planilla..." />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total del mes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    ${totalesMes.total?.toLocaleString() || 0}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} divider={<Typography color="text.disabled">·</Typography>}>
                    <Chip label={`Farfan $${totalesMes.distribucion?.farfan?.toLocaleString() || 0}`} />
                    <Chip label={`Mica $${totalesMes.distribucion?.mica?.toLocaleString() || 0}`} />
                    <Chip label={`FFMA $${totalesMes.distribucion?.ffma?.toLocaleString() || 0}`} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estadísticas
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {estadoPagoOptions
                      .filter((option) => option.value)
                      .map((option) => (
                        <Grid item xs={6} md={3} key={option.value}>
                          <Typography variant="body2" color="text.secondary">
                            {option.label}
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            {estadisticasPorEstado?.[option.value] || 0}
                          </Typography>
                        </Grid>
                      ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)', mt: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Semana</TableCell>
                    <TableCell>Día</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Colaborador</TableCell>
                    <TableCell>Turno</TableCell>
                    <TableCell>Monto</TableCell>
                    <TableCell>Distribución</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Observaciones</TableCell>
                    <TableCell>Registro</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrosOrdenados.map((registro) => (
                    <TableRow key={String(registro.id || registro._id || registro.fecha || Math.random())}>
                      <TableCell>{registro.semana || '—'}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{registro.diaSemana || '—'}</TableCell>
                      <TableCell>{registro.fecha ? format(new Date(registro.fecha), 'dd/MM/yyyy') : '—'}</TableCell>
                      <TableCell>{formatColaborador(registro)}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{registro.turno || '—'}</TableCell>
                      <TableCell>${registro.monto?.toLocaleString() || 0}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} divider={<Typography color="text.disabled">·</Typography>}>
                          <Typography variant="caption">F:{registro.distribucion?.farfan ?? '-'}</Typography>
                          <Typography variant="caption">M:{registro.distribucion?.mica ?? '-'}</Typography>
                          <Typography variant="caption">FF:{registro.distribucion?.ffma ?? '-'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={registro.estado}
                          size="small"
                          color={registro.estado === 'pagado' ? 'success' : registro.estado === 'cancelado' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{registro.observaciones || '—'}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            Creado: {registro.creadoPor ? `${registro.creadoPor.nombre} ${registro.creadoPor.apellido}` : '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Modificado:{' '}
                            {registro.modificadoPor ? `${registro.modificadoPor.nombre} ${registro.modificadoPor.apellido}` : '—'}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openModal(registro)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {registrosOrdenados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No se encontraron registros para el periodo seleccionado.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle>{registroEdit ? 'Editar registro' : 'Registrar pago diario'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="fecha"
                  rules={{ required: 'Fecha requerida' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Fecha"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.fecha}
                      helperText={errors.fecha?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="empleadoId"
                  rules={{ required: 'Seleccione el personal' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Personal"
                      fullWidth
                      error={!!errors.empleadoId}
                      helperText={errors.empleadoId?.message}
                    >
                      {colaboradoresLoading && (
                        <MenuItem value="" disabled>
                          Cargando personal...
                        </MenuItem>
                      )}
                      {!colaboradoresLoading && colaboradores.length === 0 && (
                        <MenuItem value="" disabled>
                          No hay colaboradores activos
                        </MenuItem>
                      )}
                      {colaboradores.map((colaborador) => (
                        <MenuItem key={String(colaborador.id)} value={colaborador.id}>
                          {colaborador.nombreCompleto || `${colaborador.nombre} ${colaborador.apellido}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  control={control}
                  name="turno"
                  rules={{ required: 'Seleccione un turno' }}
                  render={({ field }) => (
                    <TextField {...field} select label="Turno" fullWidth error={!!errors.turno} helperText={errors.turno?.message}>
                      {turnoOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  control={control}
                  name="horasTrabajadas"
                  render={({ field }) => <TextField {...field} label="Horas trabajadas" type="number" fullWidth />}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="monto"
                  rules={{ required: 'Monto requerido' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Monto total"
                      type="number"
                      fullWidth
                      error={!!errors.monto}
                      helperText={errors.monto?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller control={control} name="farfan" render={({ field }) => <TextField {...field} label="Farfan" type="number" fullWidth />} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller control={control} name="mica" render={({ field }) => <TextField {...field} label="Mica" type="number" fullWidth />} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller control={control} name="ffma" render={({ field }) => <TextField {...field} label="FFMA" type="number" fullWidth />} />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="estado"
                  render={({ field }) => (
                    <TextField {...field} select label="Estado" fullWidth>
                      {estadoPagoOptions
                        .filter((option) => option.value)
                        .map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  control={control}
                  name="observaciones"
                  render={({ field }) => <TextField {...field} label="Observaciones" multiline rows={3} fullWidth />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {registroEdit ? 'Guardar cambios' : 'Registrar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminPlanillaPagosPage;

