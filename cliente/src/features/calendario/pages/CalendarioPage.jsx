/**
 * Página de Calendario
 * Vista de calendario interactiva con sesiones
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Divider,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarioPage.css';
import { motion } from 'framer-motion';
import {
  fetchSesionesCalendario,
  selectSesionesCalendario,
  selectCalendarioLoading,
  selectCurrentView,
  setCurrentView,
  setFilters,
  selectCalendarioFilters,
} from '../slices/calendarioSlice';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

moment.locale('es');
const localizer = momentLocalizer(moment);

const CalendarioPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const sesiones = useSelector(selectSesionesCalendario);
  const loading = useSelector(selectCalendarioLoading);
  const currentView = useSelector(selectCurrentView);
  const filters = useSelector(selectCalendarioFilters);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    cargarSesiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, currentView, filters]);

  const cargarSesiones = useCallback(() => {
    let fechaInicio, fechaFin;

    if (currentView === 'month') {
      const inicioMes = startOfMonth(selectedDate);
      const finMes = endOfMonth(selectedDate);
      fechaInicio = startOfWeek(inicioMes, { locale: es });
      fechaFin = endOfWeek(finMes, { locale: es });
    } else if (currentView === 'week') {
      fechaInicio = startOfWeek(selectedDate, { locale: es });
      fechaFin = endOfWeek(selectedDate, { locale: es });
    } else {
      fechaInicio = selectedDate;
      fechaFin = selectedDate;
    }

    const params = {
      fechaInicio: format(fechaInicio, 'yyyy-MM-dd'),
      fechaFin: format(fechaFin, 'yyyy-MM-dd'),
      ...(filters?.estado && { estado: filters.estado }),
      ...(filters?.profesionalId && { profesionalId: filters.profesionalId }),
      ...(filters?.pacienteId && { pacienteId: filters.pacienteId }),
    };

    dispatch(fetchSesionesCalendario(params));
  }, [dispatch, selectedDate, currentView, filters]);

  const handleNavigate = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleViewChange = (view) => {
    dispatch(setCurrentView(view));
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handlePrevMonth = () => {
    setSelectedDate(subMonths(selectedDate, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(addMonths(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleRefresh = () => {
    cargarSesiones();
    toast.success('Calendario actualizado');
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleNavigateToSesion = () => {
    if (selectedEvent?.extendedProps?.url) {
      navigate(selectedEvent.extendedProps.url);
      handleCloseModal();
    }
  };

  // Formatear eventos para react-big-calendar
  const eventos = (sesiones || [])
    .filter((sesion) => sesion && sesion.start && sesion.end)
    .map((sesion) => ({
      id: sesion.id || '',
      title: sesion.title || 'Sin título',
      start: new Date(sesion.start),
      end: new Date(sesion.end),
      allDay: Boolean(sesion.allDay),
      resource: sesion.extendedProps && typeof sesion.extendedProps === 'object' ? sesion.extendedProps : {},
    }));

  // Estilos para eventos
  const eventStyleGetter = (event) => {
    const color = event.resource?.color || '#0d4d61';
    return {
      style: {
        backgroundColor: color,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: isMobile ? '0.7rem' : '0.85rem',
        fontWeight: 600,
      },
    };
  };

  // Mensajes en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay sesiones en este rango de fechas',
    showMore: (total) => `+ Ver más (${total})`,
  };

  const getEstadoColor = (estado) => {
    const colors = {
      realizada: '#48bb78',
      programada: '#f6ad55',
      cancelada: '#f56565',
      ausente: '#a0aec0',
      reprogramada: '#f39c12',
    };
    return colors[estado] || '#0d4d61';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      realizada: 'Realizada',
      programada: 'Programada',
      cancelada: 'Cancelada',
      ausente: 'Ausente',
      reprogramada: 'Reprogramada',
    };
    return labels[estado] || estado || 'Sin estado';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Calendario de Sesiones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
              Actualizar
            </Button>
            <Button variant="contained" startIcon={<CalendarIcon />} onClick={() => navigate('/sesiones/nueva')}>
              Nueva Sesión
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Controles de Navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <IconButton onClick={handlePrevMonth} size="small">
                  <ChevronLeft />
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<TodayIcon />}
                  onClick={handleToday}
                  size="small"
                  sx={{ textTransform: 'none', minWidth: 100 }}
                >
                  Hoy
                </Button>
                <IconButton onClick={handleNextMonth} size="small">
                  <ChevronRight />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" textAlign="center" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {format(selectedDate, "MMMM 'de' yyyy", { locale: es })}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <ButtonGroup fullWidth size="small">
                <Button
                  variant={currentView === 'month' ? 'contained' : 'outlined'}
                  onClick={() => handleViewChange('month')}
                >
                  Mes
                </Button>
                <Button
                  variant={currentView === 'week' ? 'contained' : 'outlined'}
                  onClick={() => handleViewChange('week')}
                >
                  Semana
                </Button>
                <Button
                  variant={currentView === 'day' ? 'contained' : 'outlined'}
                  onClick={() => handleViewChange('day')}
                >
                  Día
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters?.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value || null)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="programada">Programada</MenuItem>
                  <MenuItem value="realizada">Realizada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                  <MenuItem value="ausente">Ausente</MenuItem>
                  <MenuItem value="reprogramada">Reprogramada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Leyenda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Leyenda:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label="Programada"
              sx={{ bgcolor: '#3498db', color: 'white' }}
            />
            <Chip
              size="small"
              label="Realizada"
              sx={{ bgcolor: '#27ae60', color: 'white' }}
            />
            <Chip
              size="small"
              label="Cancelada"
              sx={{ bgcolor: '#e74c3c', color: 'white' }}
            />
            <Chip
              size="small"
              label="Ausente"
              sx={{ bgcolor: '#95a5a6', color: 'white' }}
            />
            <Chip
              size="small"
              label="Reprogramada"
              sx={{ bgcolor: '#f39c12', color: 'white' }}
            />
          </Box>
        </Paper>
      </motion.div>

      {/* Calendario */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Paper sx={{ p: 2, height: isMobile ? 500 : 700 }}>
          {loading ? (
            <LoadingSpinner message="Cargando calendario..." />
          ) : (
            <Calendar
              localizer={localizer}
              events={eventos}
              startAccessor="start"
              endAccessor="end"
              titleAccessor="title"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              view={currentView}
              date={selectedDate}
              eventPropGetter={eventStyleGetter}
              messages={messages}
              popup
              selectable
            />
          )}
        </Paper>
      </motion.div>

      {/* Modal de Detalle de Sesión */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Detalle de Sesión
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {selectedEvent && (
            <Box>
              {/* Paciente */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Paciente
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {`${selectedEvent.resource?.paciente?.nombre || 'Sin nombre'} ${selectedEvent.resource?.paciente?.apellido || ''}`.trim()}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      DNI
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedEvent.resource?.paciente?.dni || 'Sin DNI'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedEvent.resource?.paciente?.telefono || 'Sin teléfono'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Horario */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Horario
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {`${selectedEvent.resource?.horaEntrada || 'Sin hora'} - ${selectedEvent.resource?.horaSalida || 'Sin hora'}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`Duración: ${selectedEvent.resource?.duracion || 0} minutos`}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Estado y Pago */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Estado
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={getEstadoLabel(selectedEvent.resource?.estado)}
                      sx={{
                        bgcolor: getEstadoColor(selectedEvent.resource?.estado),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Pago
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {`$${(selectedEvent.resource?.pago?.monto || 0).toLocaleString()}`}
                    </Typography>
                    <Chip
                      size="small"
                      label={selectedEvent.resource?.pago?.pagado ? 'Pagado' : 'Pendiente'}
                      color={selectedEvent.resource?.pago?.pagado ? 'success' : 'error'}
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Tipo de Sesión */}
              {selectedEvent.resource?.tipoSesion && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Tipo de Sesión
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {selectedEvent.resource?.tipoSesion || 'No especificado'}
                  </Typography>
                </Box>
              )}

              {/* Número de Sesión */}
              {selectedEvent.resource?.numeroSesion && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Número de Sesión
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {`Sesión #${selectedEvent.resource?.numeroSesion || 0}`}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal}>Cerrar</Button>
          <Button variant="contained" onClick={handleNavigateToSesion}>
            Ver Detalle Completo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarioPage;
