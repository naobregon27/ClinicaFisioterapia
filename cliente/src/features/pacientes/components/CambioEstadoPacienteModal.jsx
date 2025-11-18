import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Stack,
  Chip,
} from '@mui/material';

const CambioEstadoPacienteModal = ({ open, paciente, onClose, onSubmit, loading = false }) => {
  const [motivo, setMotivo] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setMotivo('');
      setTouched(false);
    }
  }, [open, paciente]);

  if (!paciente) {
    return null;
  }

  const estadoActual = paciente.estado || 'activo';
  const proximoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
  const titulo =
    proximoEstado === 'inactivo' ? 'Desactivar paciente temporalmente' : 'Reactivar paciente';
  const descripcion =
    proximoEstado === 'inactivo'
      ? 'Seleccioná un motivo para pausar el tratamiento de este paciente.'
      : 'Registrá el motivo por el que vuelve a estar activo.';

  const motivoError = touched && motivo.trim().length < 5;

  const handleConfirm = () => {
    setTouched(true);
    if (motivoError) return;
    onSubmit({ estado: proximoEstado, motivo: motivo.trim() });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, p: { xs: 1, sm: 2 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {titulo}
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: '#edf2f7' }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              Estado actual:
            </Typography>
            <Chip
              label={estadoActual.toUpperCase()}
              size="small"
              color={estadoActual === 'activo' ? 'success' : 'default'}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              Nuevo estado:
            </Typography>
            <Chip
              label={proximoEstado.toUpperCase()}
              size="small"
              color={proximoEstado === 'activo' ? 'success' : 'default'}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {descripcion}
          </Typography>
          <TextField
            label="Motivo"
            placeholder="Ej: Paciente suspendió el tratamiento temporalmente"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            onBlur={() => setTouched(true)}
            multiline
            minRows={3}
            fullWidth
            error={motivoError}
            helperText={
              motivoError
                ? 'Ingresá al menos 5 caracteres para detallar el motivo'
                : 'Este texto se registrará en la historia del paciente'
            }
            InputProps={{
              sx: { borderRadius: 3, bgcolor: '#f7fafc' },
            }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            background:
              proximoEstado === 'inactivo'
                ? 'linear-gradient(135deg, #f56565 0%, #f6ad55 100%)'
                : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
          }}
        >
          {proximoEstado === 'inactivo' ? 'Desactivar' : 'Reactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CambioEstadoPacienteModal;




