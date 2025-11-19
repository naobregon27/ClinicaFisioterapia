/**
 * Modal de Detalle de Paciente para Sesiones
 * Muestra todos los datos del paciente y botón para registrar sesión
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
  Grid,
  Chip,
  Divider,
  Avatar,
  Button,
  Stack,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  ContactEmergency as EmergencyIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  EventNote as EventNoteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RegistrarSesionModal from './RegistrarSesionModal';

const DetallePacienteSesionesModal = ({ open, onClose, paciente }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [registrarSesionOpen, setRegistrarSesionOpen] = useState(false);

  if (!paciente) return null;

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activo: '#48bb78',
      inactivo: '#a0aec0',
      alta: '#0d4d61',
      derivado: '#f6ad55',
      abandono: '#f56565',
    };
    return colors[estado] || '#0d4d61';
  };

  const edad = calcularEdad(paciente.fechaNacimiento);

  const handleRegistrarSesion = () => {
    setRegistrarSesionOpen(true);
  };

  const handleRegistrarSesionClose = () => {
    setRegistrarSesionOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            maxHeight: { xs: '100%', sm: '90vh' },
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 600,
              }}
            >
              {paciente.nombre?.charAt(0) || ''}
              {paciente.apellido?.charAt(0) || ''}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {paciente.nombre} {paciente.apellido}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                DNI: {paciente.dni}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, maxHeight: { xs: 'calc(100vh - 200px)', sm: '70vh' }, overflowY: 'auto' }}>
          <Grid container spacing={3}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: '#f7fafc',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                }}
              >
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                  Información Personal
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <PersonIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Nombre completo
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {paciente.nombre} {paciente.apellido}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <CalendarIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Fecha de nacimiento
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {paciente.fechaNacimiento
                        ? format(new Date(paciente.fechaNacimiento), "dd 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })
                        : 'No especificada'}
                      {edad && ` (${edad} años)`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <PersonIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Género
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {paciente.genero || 'No especificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <PhoneIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {paciente.telefono || 'No especificado'}
                    </Typography>
                  </Grid>
                  {paciente.telefonoAlternativo && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <PhoneIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Teléfono alternativo
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {paciente.telefonoAlternativo}
                      </Typography>
                    </Grid>
                  )}
                  {paciente.email && (
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <EmailIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {paciente.email}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        label={paciente.estado}
                        size="small"
                        sx={{
                          bgcolor: getEstadoColor(paciente.estado),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Dirección */}
            {paciente.direccion && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f7fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                    Dirección
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                    <HomeIcon sx={{ color: '#0d4d61', fontSize: 20, mt: 0.5 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {paciente.direccion.calle} {paciente.direccion.numero}
                      {paciente.direccion.barrio && `, ${paciente.direccion.barrio}`}
                      {paciente.direccion.ciudad && `, ${paciente.direccion.ciudad}`}
                      {paciente.direccion.provincia && `, ${paciente.direccion.provincia}`}
                      {paciente.direccion.codigoPostal && ` (${paciente.direccion.codigoPostal})`}
                    </Typography>
                  </Stack>
                  {paciente.direccion.referencia && (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      Referencia: {paciente.direccion.referencia}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Obra Social */}
            {paciente.obraSocial && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f7fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                    Obra Social
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <HospitalIcon sx={{ color: '#0d4d61', fontSize: 20 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {paciente.obraSocial.nombre}
                    </Typography>
                  </Stack>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Número de afiliado
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {paciente.obraSocial.numeroAfiliado || 'No especificado'}
                      </Typography>
                    </Grid>
                    {paciente.obraSocial.plan && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Plan
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {paciente.obraSocial.plan}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Diagnóstico */}
            {paciente.diagnostico && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f7fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                    Diagnóstico
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Principal: {paciente.diagnostico.principal || 'No especificado'}
                  </Typography>
                  {paciente.diagnostico.secundarios &&
                    paciente.diagnostico.secundarios.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Secundarios:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {paciente.diagnostico.secundarios.map((sec, idx) => (
                            <Chip key={idx} label={sec} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  {paciente.diagnostico.observaciones && (
                    <Typography variant="body2" color="text.secondary">
                      {paciente.diagnostico.observaciones}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Tratamiento */}
            {paciente.tratamiento && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f7fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                    Tratamiento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Sesiones totales
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {paciente.tratamiento.cantidadTotalSesiones || 'No especificado'}
                      </Typography>
                    </Grid>
                    {paciente.tratamiento.fechaInicio && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Fecha de inicio
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {format(new Date(paciente.tratamiento.fechaInicio), "dd 'de' MMMM 'de' yyyy", {
                            locale: es,
                          })}
                        </Typography>
                      </Grid>
                    )}
                    {paciente.tratamiento.observaciones && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Observaciones
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {paciente.tratamiento.observaciones}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Estadísticas */}
            {paciente.estadisticas && (
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: '#f7fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2d3748' }}>
                    Estadísticas
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total sesiones
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0d4d61' }}>
                        {paciente.estadisticas.totalSesiones || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total abonado
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#48bb78' }}>
                        ${(paciente.estadisticas.totalAbonado || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Saldo pendiente
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f56565' }}>
                        ${(paciente.estadisticas.saldoPendiente || 0).toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        Última sesión
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {paciente.estadisticas.ultimaSesion
                          ? format(new Date(paciente.estadisticas.ultimaSesion), 'dd/MM/yyyy', {
                              locale: es,
                            })
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f7fafc',
          }}
        >
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cerrar
          </Button>
          <Button
            variant="contained"
            startIcon={<EventNoteIcon />}
            onClick={handleRegistrarSesion}
            sx={{
              background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #0b3c4d 0%, #6a4093 100%)',
              },
            }}
          >
            Registrar Sesión del Paciente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Registrar Sesión */}
      <RegistrarSesionModal
        open={registrarSesionOpen}
        onClose={handleRegistrarSesionClose}
        paciente={paciente}
        onSuccess={() => {
          handleRegistrarSesionClose();
          onClose();
        }}
      />
    </>
  );
};

export default DetallePacienteSesionesModal;

