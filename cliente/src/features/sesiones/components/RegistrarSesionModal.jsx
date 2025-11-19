/**
 * Modal para Registrar Sesión
 * Formulario completo para registrar una nueva sesión
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Stack,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import sesionService from '../../../services/sesionService';
import toast from 'react-hot-toast';

const RegistrarSesionModal = ({ open, onClose, paciente, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '',
    horaEntrada: '',
    horaSalida: '',
    monto: '',
    metodoPago: 'efectivo',
    pagado: false,
    tipoSesion: 'presencial',
    estado: 'programada',
    observaciones: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.horaEntrada || !formData.horaSalida) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      
      // Formatear fecha y hora
      const fechaHora = new Date(`${formData.fecha}T${formData.horaEntrada}:00`);
      
      const dataSesion = {
        paciente: paciente._id || paciente.id,
        fecha: fechaHora.toISOString(),
        horaEntrada: formData.horaEntrada,
        horaSalida: formData.horaSalida,
        pago: {
          monto: parseFloat(formData.monto) || 0,
          metodoPago: formData.metodoPago,
          pagado: formData.pagado,
        },
        tipoSesion: formData.tipoSesion,
        estado: formData.estado,
        observaciones: formData.observaciones || undefined,
      };

      const response = await sesionService.registrarSesion(dataSesion);
      
      if (response.success) {
        toast.success('Sesión registrada exitosamente');
        // Reset form
        setFormData({
          fecha: '',
          horaEntrada: '',
          horaSalida: '',
          monto: '',
          metodoPago: 'efectivo',
          pagado: false,
          tipoSesion: 'presencial',
          estado: 'programada',
          observaciones: '',
        });
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Error al registrar la sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  // Obtener fecha actual en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
        },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EventNoteIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registrar Sesión
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: 'white',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {paciente && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: '#f7fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Paciente
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {paciente.nombre} {paciente.apellido} - DNI: {paciente.dni}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo de Sesión"
                name="tipoSesion"
                select
                value={formData.tipoSesion}
                onChange={handleChange}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="presencial">Presencial</MenuItem>
                <MenuItem value="domicilio">Domicilio</MenuItem>
                <MenuItem value="virtual">Virtual</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Entrada"
                name="horaEntrada"
                type="time"
                value={formData.horaEntrada}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Salida"
                name="horaSalida"
                type="time"
                value={formData.horaSalida}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monto"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Método de Pago"
                name="metodoPago"
                select
                value={formData.metodoPago}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="obra_social">Obra Social</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Estado"
                name="estado"
                select
                value={formData.estado}
                onChange={handleChange}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="programada">Programada</MenuItem>
                <MenuItem value="realizada">Realizada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="ausente">Ausente</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pagado"
                name="pagado"
                select
                value={formData.pagado ? 'si' : 'no'}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    pagado: e.target.value === 'si',
                  }));
                }}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="si">Sí</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observaciones"
                name="observaciones"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f7fafc',
          }}
        >
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EventNoteIcon />}
            sx={{
              background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #0b3c4d 0%, #6a4093 100%)',
              },
              '&:disabled': {
                background: '#cbd5e0',
              },
            }}
          >
            {loading ? 'Registrando...' : 'Registrar Sesión'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegistrarSesionModal;

