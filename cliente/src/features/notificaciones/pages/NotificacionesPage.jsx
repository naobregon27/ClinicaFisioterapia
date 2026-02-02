/**
 * Página de Notificaciones
 * Gestión completa de notificaciones del usuario
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Button,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  fetchNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  selectNotificaciones,
  selectPagination,
  selectLoading,
  selectError,
  selectFilters,
  setFilters,
  clearFilters,
} from '../slices/notificacionesSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const NotificacionesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notificaciones = useSelector(selectNotificaciones);
  const pagination = useSelector(selectPagination);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const filters = useSelector(selectFilters);

  const [currentTab, setCurrentTab] = useState('todas');

  useEffect(() => {
    cargarNotificaciones();
  }, [filters, pagination.page]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const cargarNotificaciones = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
    };

    // Filtrar valores nulos
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    dispatch(fetchNotificaciones(params));
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 'todas') {
      dispatch(clearFilters());
    } else if (newValue === 'noLeidas') {
      dispatch(setFilters({ leida: false }));
    } else if (newValue === 'leidas') {
      dispatch(setFilters({ leida: true }));
    }
  };

  const handleNotificationClick = async (notificacion) => {
    if (!notificacion.leida) {
      await dispatch(marcarNotificacionLeida(notificacion._id));
    }

    if (notificacion.datos?.url) {
      navigate(notificacion.datos.url);
    }
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(marcarTodasLeidas());
    toast.success('Todas las notificaciones marcadas como leídas');
    cargarNotificaciones();
  };

  const handleDeleteNotification = async (e, notifId) => {
    e.stopPropagation();
    await dispatch(eliminarNotificacion(notifId));
    toast.success('Notificación eliminada');
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handleRefresh = () => {
    cargarNotificaciones();
    toast.success('Notificaciones actualizadas');
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'urgente':
        return 'error';
      case 'alta':
        return 'warning';
      case 'media':
        return 'info';
      case 'baja':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      sesion_proxima: 'Sesión Próxima',
      pago_pendiente: 'Pago Pendiente',
      paciente_nuevo: 'Paciente Nuevo',
      sesion_cancelada: 'Sesión Cancelada',
      sesion_reprogramada: 'Sesión Reprogramada',
      alta_medica_pendiente: 'Alta Médica',
      recordatorio: 'Recordatorio',
      sistema: 'Sistema',
    };
    return tipos[tipo] || tipo;
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <NotificationsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestiona todas tus notificaciones
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh}>
              Actualizar
            </Button>
            <Button variant="contained" startIcon={<DoneAllIcon />} onClick={handleMarkAllAsRead}>
              Marcar todas
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} sx={{ px: 2 }}>
          <Tab label="Todas" value="todas" />
          <Tab label="No Leídas" value="noLeidas" />
          <Tab label="Leídas" value="leidas" />
        </Tabs>
      </Paper>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.tipo || ''}
                onChange={(e) => handleFilterChange('tipo', e.target.value || null)}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="sesion_proxima">Sesión Próxima</MenuItem>
                <MenuItem value="pago_pendiente">Pago Pendiente</MenuItem>
                <MenuItem value="paciente_nuevo">Paciente Nuevo</MenuItem>
                <MenuItem value="sesion_cancelada">Sesión Cancelada</MenuItem>
                <MenuItem value="sesion_reprogramada">Sesión Reprogramada</MenuItem>
                <MenuItem value="alta_medica_pendiente">Alta Médica</MenuItem>
                <MenuItem value="recordatorio">Recordatorio</MenuItem>
                <MenuItem value="sistema">Sistema</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={filters.prioridad || ''}
                onChange={(e) => handleFilterChange('prioridad', e.target.value || null)}
                label="Prioridad"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="urgente">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de Notificaciones */}
      <Paper>
        {loading ? (
          <LoadingSpinner message="Cargando notificaciones..." />
        ) : notificaciones.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No tienes notificaciones
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Cuando tengas nuevas notificaciones aparecerán aquí
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {notificaciones.map((notif, index) => (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {index > 0 && <Divider />}
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <IconButton edge="end" onClick={(e) => handleDeleteNotification(e, notif._id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                    sx={{
                      bgcolor: notif.leida ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    <ListItemButton onClick={() => handleNotificationClick(notif)} sx={{ py: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {!notif.leida && <CircleIcon sx={{ fontSize: 12, color: 'primary.main' }} />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: notif.leida ? 400 : 600, flex: 1, pr: 1 }}>
                              {notif.titulo}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Chip label={getTipoLabel(notif.tipo)} size="small" variant="outlined" />
                              <Chip label={notif.prioridad} size="small" color={getPrioridadColor(notif.prioridad)} />
                            </Box>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {notif.mensaje}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {format(new Date(notif.createdAt), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                            </Typography>
                          </>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </motion.div>
              ))}
            </List>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button
                  disabled={!pagination.hasPrevPage}
                  onClick={() => dispatch(setFilters({ page: pagination.page - 1 }))}
                >
                  Anterior
                </Button>
                <Typography variant="body2" sx={{ px: 2, py: 1 }}>
                  Página {pagination.page} de {pagination.totalPages}
                </Typography>
                <Button
                  disabled={!pagination.hasNextPage}
                  onClick={() => dispatch(setFilters({ page: pagination.page + 1 }))}
                >
                  Siguiente
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default NotificacionesPage;
