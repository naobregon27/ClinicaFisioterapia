/**
 * Componente GlobalSearch
 * Búsqueda global con autocompletado y resultados agrupados
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  buscarGlobal,
  clearResultados,
  selectResultados,
  selectTotal,
  selectBusquedaLoading,
  selectSearchOpen,
  toggleSearch,
  closeSearch,
} from '../../../features/busqueda/slices/busquedaSlice';
import { debounce } from 'lodash';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const GlobalSearch = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const resultados = useSelector(selectResultados);
  const total = useSelector(selectTotal);
  const loading = useSelector(selectBusquedaLoading);
  const open = useSelector(selectSearchOpen);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim().length >= 2) {
        dispatch(buscarGlobal({ q: term, options: { limit: 5 } }));
      } else {
        dispatch(clearResultados());
      }
    }, 300),
    [dispatch]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const handleOpen = () => {
    dispatch(toggleSearch());
  };

  const handleClose = () => {
    dispatch(closeSearch());
    setSearchTerm('');
    dispatch(clearResultados());
  };

  const handleResultClick = (url) => {
    navigate(url);
    handleClose();
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
      case 'realizada':
        return 'success';
      case 'inactivo':
      case 'cancelada':
        return 'error';
      case 'programada':
        return 'info';
      case 'alta':
        return 'default';
      default:
        return 'default';
    }
  };

  const renderPacientes = () => {
    if (resultados.pacientes.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Pacientes ({resultados.pacientes.length})
        </Typography>
        <List dense>
          {resultados.pacientes.map((paciente) => (
            <ListItem key={paciente.id} disablePadding>
              <ListItemButton onClick={() => handleResultClick(paciente.url)}>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={paciente.nombre}
                  secondary={`DNI: ${paciente.dni} | Tel: ${paciente.telefono}`}
                />
                <Chip label={paciente.estado} size="small" color={getEstadoColor(paciente.estado)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderSesiones = () => {
    if (resultados.sesiones.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Sesiones ({resultados.sesiones.length})
        </Typography>
        <List dense>
          {resultados.sesiones.map((sesion) => (
            <ListItem key={sesion.id} disablePadding>
              <ListItemButton onClick={() => handleResultClick(sesion.url)}>
                <ListItemIcon>
                  <EventNoteIcon color="secondary" />
                </ListItemIcon>
                <ListItemText
                  primary={`${sesion.paciente} - ${sesion.horaEntrada}`}
                  secondary={`${format(new Date(sesion.fecha), "d 'de' MMMM", { locale: es })} | ${
                    sesion.pagado ? 'Pagado' : 'Pendiente'
                  }`}
                />
                <Chip label={sesion.estado} size="small" color={getEstadoColor(sesion.estado)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderUsuarios = () => {
    if (resultados.usuarios.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1, fontWeight: 600 }}>
          Usuarios ({resultados.usuarios.length})
        </Typography>
        <List dense>
          {resultados.usuarios.map((usuario) => (
            <ListItem key={usuario.id} disablePadding>
              <ListItemButton onClick={() => handleResultClick(usuario.url)}>
                <ListItemIcon>
                  <AccountCircleIcon />
                </ListItemIcon>
                <ListItemText primary={usuario.nombre} secondary={`${usuario.email} | ${usuario.rol}`} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{
          '&:hover': {
            bgcolor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        <SearchIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'fixed',
            top: 80,
            m: 0,
          },
        }}
      >
        <Box sx={{ p: 2, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              fullWidth
              autoFocus
              placeholder="Buscar pacientes, sesiones, usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, px: 1 }}>
              Escribe al menos 2 caracteres para buscar
            </Typography>
          )}
        </Box>

        <DialogContent sx={{ pt: 2 }}>
          {searchTerm.length >= 2 && !loading && total === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No se encontraron resultados para &quot;{searchTerm}&quot;
              </Typography>
            </Box>
          )}

          {searchTerm.length >= 2 && total > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ px: 2, mb: 2, display: 'block' }}>
                {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </Typography>

              {renderPacientes()}
              {resultados.pacientes.length > 0 && (resultados.sesiones.length > 0 || resultados.usuarios.length > 0) && (
                <Divider sx={{ my: 1 }} />
              )}

              {renderSesiones()}
              {resultados.sesiones.length > 0 && resultados.usuarios.length > 0 && <Divider sx={{ my: 1 }} />}

              {renderUsuarios()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalSearch;
