/**
 * Modal para Registrar Pago de Sesión
 * Formulario completo con todos los campos incluyendo comprobante
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
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import sesionService from '../../../services/sesionService';
import toast from 'react-hot-toast';

const RegistrarPagoModal = ({ open, onClose, sesion, onSuccess }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monto: '',
    metodoPago: 'efectivo',
    pagado: true,
    comprobante: {
      numero: '',
      tipo: 'recibo',
      url: '',
    },
  });

  React.useEffect(() => {
    if (open && sesion) {
      setFormData({
        monto: sesion.pago?.monto?.toString() || '',
        metodoPago: sesion.pago?.metodoPago || 'efectivo',
        pagado: true,
        comprobante: {
          numero: sesion.pago?.comprobante?.numero || '',
          tipo: sesion.pago?.comprobante?.tipo || 'recibo',
          url: sesion.pago?.comprobante?.url || '',
        },
      });
    }
  }, [open, sesion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('comprobante.')) {
      const comprobanteField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        comprobante: {
          ...prev.comprobante,
          [comprobanteField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      toast.error('Debe ingresar un monto válido');
      return;
    }

    try {
      setLoading(true);

      const datosPago = {
        monto: parseFloat(formData.monto),
        metodoPago: formData.metodoPago,
        pagado: formData.pagado,
      };

      // Agregar comprobante solo si tiene número
      if (formData.comprobante.numero.trim()) {
        datosPago.comprobante = {
          numero: formData.comprobante.numero,
          tipo: formData.comprobante.tipo,
          url: formData.comprobante.url || undefined,
        };
      }

      const sesionId = sesion.id || sesion._id;
      const response = await sesionService.registrarPago(sesionId, datosPago);

      if (response.success) {
        toast.success('Pago registrado exitosamente');
        // Reset form
        setFormData({
          monto: '',
          metodoPago: 'efectivo',
          pagado: true,
          comprobante: {
            numero: '',
            tipo: 'recibo',
            url: '',
          },
        });
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || 'Error al registrar el pago'
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MoneyIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Registrar Pago
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
          {sesion && (
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
                {sesion.paciente?.nombreCompleto ||
                  `${sesion.paciente?.nombre || ''} ${sesion.paciente?.apellido || ''}`}
              </Typography>
              {sesion.fecha && (
                <Typography variant="caption" color="text.secondary">
                  Sesión del{' '}
                  {new Date(sesion.fecha).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Typography>
              )}
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Monto"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                fullWidth
                required
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
                required
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
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.pagado}
                    onChange={(e) => setFormData({ ...formData, pagado: e.target.checked })}
                    color="primary"
                  />
                }
                label="Marcar como pagado"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                Comprobante (Opcional)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Número de Comprobante"
                name="comprobante.numero"
                value={formData.comprobante.numero}
                onChange={handleChange}
                fullWidth
                placeholder="Ej: 0001-00012345"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tipo de Comprobante"
                name="comprobante.tipo"
                select
                value={formData.comprobante.tipo}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem value="recibo">Recibo</MenuItem>
                <MenuItem value="factura">Factura</MenuItem>
                <MenuItem value="ticket">Ticket</MenuItem>
                <MenuItem value="comprobante">Comprobante</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="URL del Comprobante (Opcional)"
                name="comprobante.url"
                value={formData.comprobante.url}
                onChange={handleChange}
                fullWidth
                placeholder="https://..."
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
          <Button onClick={handleClose} disabled={loading} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <MoneyIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4093 100%)',
              },
              '&:disabled': {
                background: '#cbd5e0',
              },
            }}
          >
            {loading ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegistrarPagoModal;

