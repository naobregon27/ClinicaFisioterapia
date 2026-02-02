/**
 * Componente NotificationBell
 * Icono de notificaciones con badge de contador y menú desplegable
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import {
  fetchNotificacionesNoLeidas,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  eliminarNotificacion,
  selectNoLeidas,
  selectCantidadNoLeidas,
} from '../../../features/notificaciones/slices/notificacionesSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const noLeidas = useSelector(selectNoLeidas);
  const cantidadNoLeidas = useSelector(selectCantidadNoLeidas);

  const open = Boolean(anchorEl);

  // Cargar notificaciones al montar y cada 30 segundos
  useEffect(() => {
    dispatch(fetchNotificacionesNoLeidas());
    
    const interval = setInterval(() => {
      dispatch(fetchNotificacionesNoLeidas());
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notificacion) => {
    // Marcar como leída
    await dispatch(marcarNotificacionLeida(notificacion._id));
    
    // Navegar si tiene URL
    if (notificacion.datos?.url) {
      navigate(notificacion.datos.url);
    }
    
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(marcarTodasLeidas());
    handleClose();
  };

  const handleViewAll = () => {
    navigate('/notificaciones');
    handleClose();
  };

  const handleDeleteNotification = async (e, notifId) => {
    e.stopPropagation();
    await dispatch(eliminarNotificacion(notifId));
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

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <Badge badgeContent={cantidadNoLeidas} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notificaciones
            </Typography>
            {cantidadNoLeidas > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon />}
                onClick={handleMarkAllAsRead}
                sx={{ fontSize: '0.75rem' }}
              >
                Marcar todas
              </Button>
            )}
          </Box>
        </Box>

        <Divider />

        {/* Lista de notificaciones */}
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {noLeidas.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No tienes notificaciones nuevas
              </Typography>
            </Box>
          ) : (
            noLeidas.map((notif) => (
              <MenuItem
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                sx={{
                  py: 2,
                  px: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-start',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <CircleIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
                        {notif.titulo}
                      </Typography>
                      <Chip
                        label={notif.prioridad}
                        size="small"
                        color={getPrioridadColor(notif.prioridad)}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {notif.mensaje}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {format(new Date(notif.createdAt), "d 'de' MMMM, HH:mm", { locale: es })}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleDeleteNotification(e, notif._id)}
                  sx={{ ml: 1, mt: 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </MenuItem>
            ))
          )}
        </Box>

        {/* Footer */}
        {noLeidas.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button fullWidth onClick={handleViewAll} size="small">
                Ver todas las notificaciones
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
