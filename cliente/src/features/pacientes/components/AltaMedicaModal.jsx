/**
 * Modal para Dar Alta Médica
 * Diseño moderno, futurista, profesional e interactivo
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Avatar,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalHospital as HospitalIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { darAltaMedica, selectPacientesLoading } from '../slices/pacientesSlice';
import toast from 'react-hot-toast';

const AltaMedicaModal = ({ open, onClose, paciente }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loading = useSelector(selectPacientesLoading);

  const [formData, setFormData] = useState({
    motivoAlta: '',
    observaciones: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.motivoAlta.trim()) {
      toast.error('El motivo del alta es obligatorio');
      return;
    }

    try {
      await dispatch(
        darAltaMedica({
          id: paciente?.id || paciente?._id,
          datosAlta: {
            motivoAlta: formData.motivoAlta,
            observaciones: formData.observaciones || undefined,
          },
        })
      ).unwrap();
      toast.success('¡Alta médica registrada exitosamente!');
      resetForm();
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Error al registrar el alta médica');
    }
  };

  const resetForm = () => {
    setFormData({
      motivoAlta: '',
      observaciones: '',
    });
  };

  const handleCloseModal = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!paciente) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
          maxHeight: isMobile ? '100vh' : 'auto',
          overflow: 'hidden',
        },
      }}
      TransitionComponent={motion.div}
      TransitionProps={{
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.3 },
      }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              width: 56,
              height: 56,
              border: '2px solid rgba(255,255,255,0.3)',
            }}
          >
            <HospitalIcon sx={{ fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Dar Alta Médica
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
              {paciente.nombreCompleto || `${paciente.nombre} ${paciente.apellido}`}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleCloseModal}
          disabled={loading}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: '#f7fafc' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(72,187,120,0.1) 0%, rgba(56,161,105,0.05) 100%)',
              border: '2px solid rgba(72,187,120,0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(72,187,120,0.4)',
                }}
              >
                <CheckCircleIcon sx={{ color: 'white', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2d3748', mb: 0.5 }}>
                  Confirmar Alta Médica
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  El paciente será marcado como dado de alta. Esta acción puede revertirse editando el paciente.
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Motivo del Alta *"
              value={formData.motivoAlta}
              onChange={(e) => handleChange('motivoAlta', e.target.value)}
              required
              multiline
              rows={3}
              placeholder="Ej: Tratamiento completado satisfactoriamente"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                },
              }}
            />
          </Box>

          <Box>
            <TextField
              fullWidth
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              multiline
              rows={4}
              placeholder="Ej: El paciente ha recuperado completamente su movilidad"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                },
              }}
            />
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid #e2e8f0',
          background: 'white',
        }}
      >
        <Button
          onClick={handleCloseModal}
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !formData.motivoAlta.trim()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          sx={{
            background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1,
            boxShadow: '0 4px 12px rgba(72,187,120,0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)',
              boxShadow: '0 6px 16px rgba(72,187,120,0.5)',
              transform: 'translateY(-2px)',
            },
            '&:disabled': {
              background: '#cbd5e0',
            },
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Registrando...' : 'Confirmar Alta Médica'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AltaMedicaModal;

