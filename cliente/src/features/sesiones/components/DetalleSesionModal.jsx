/**
 * Modal de Detalle de Sesión
 * Muestra todos los detalles de una sesión y permite cancelarla
 */

import React, { useEffect, useState } from 'react';
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
  TextField,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import sesionService from '../../../services/sesionService';
import toast from 'react-hot-toast';

const DetalleSesionModal = ({ open, onClose, sesionId, onUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sesion, setSesion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCancelar, setLoadingCancelar] = useState(false);
  const [loadingEstado, setLoadingEstado] = useState(false);
  const [cancelarDialog, setCancelarDialog] = useState({ open: false, motivo: '' });

  useEffect(() => {
    if (open && sesionId) {
      cargarDetalle();
    } else {
      setSesion(null);
    }
  }, [open, sesionId]);

  const cargarDetalle = async () => {
    try {
      setLoading(true);
      const response = await sesionService.obtenerSesionPorId(sesionId);
      if (response.success && response.data) {
        setSesion(response.data.sesion || response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar los detalles de la sesión');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!cancelarDialog.motivo.trim()) {
      toast.error('Debe ingresar un motivo de cancelación');
      return;
    }

    try {
      setLoadingCancelar(true);
      const response = await sesionService.cancelarSesion(sesionId, cancelarDialog.motivo);
      if (response.success) {
        toast.success('Sesión cancelada exitosamente');
        setCancelarDialog({ open: false, motivo: '' });
        if (response.data?.sesion) {
          setSesion(response.data.sesion);
        }
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cancelar la sesión');
    } finally {
      setLoadingCancelar(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!sesion || !sesionId) return;

    // Si el nuevo estado es cancelada, abrir el diálogo de cancelación
    if (nuevoEstado === 'cancelada') {
      setCancelarDialog({ open: true, motivo: '' });
      return;
    }

    try {
      setLoadingEstado(true);
      const response = await sesionService.actualizarSesion(sesionId, { estado: nuevoEstado });
      if (response.success) {
        toast.success(`Estado cambiado a ${getEstadoLabel(nuevoEstado)} exitosamente`);
        if (response.data?.sesion) {
          setSesion(response.data.sesion);
        }
        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cambiar el estado de la sesión');
    } finally {
      setLoadingEstado(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      realizada: '#48bb78',
      programada: '#f6ad55',
      cancelada: '#f56565',
      ausente: '#a0aec0',
    };
    return colors[estado] || '#667eea';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      realizada: 'Realizada',
      programada: 'Programada',
      cancelada: 'Cancelada',
      ausente: 'Ausente',
    };
    return labels[estado] || estado;
  };

  if (!sesion && !loading) return null;

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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ScheduleIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Detalle de Sesión
            </Typography>
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
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : sesion ? (
            <Grid container spacing={3}>
              {/* Información del Paciente */}
              {sesion.paciente && (
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
                      Información del Paciente
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: '#667eea',
                          width: 56,
                          height: 56,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                        }}
                      >
                        {sesion.paciente.nombre?.charAt(0) || ''}
                        {sesion.paciente.apellido?.charAt(0) || ''}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {sesion.paciente.nombreCompleto ||
                            `${sesion.paciente.nombre || ''} ${sesion.paciente.apellido || ''}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          DNI: {sesion.paciente.dni || 'N/A'}
                        </Typography>
                        {sesion.paciente.telefono && (
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {sesion.paciente.telefono}
                            </Typography>
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                    {sesion.paciente.obraSocial && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <HospitalIcon sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {sesion.paciente.obraSocial.nombre || sesion.paciente.obraSocial}
                        </Typography>
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Información de la Sesión */}
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
                    Información de la Sesión
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <CalendarIcon sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Fecha
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {sesion.fecha
                          ? format(new Date(sesion.fecha), "EEEE, d 'de' MMMM 'de' yyyy", {
                              locale: es,
                            })
                          : 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <ScheduleIcon sx={{ color: '#667eea', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Horario
                        </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {sesion.horaEntrada || 'N/A'} - {sesion.horaSalida || 'N/A'}
                        {sesion.duracion && ` (${sesion.duracion} min)`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Tipo de Sesión
                      </Typography>
                      <Chip
                        label={sesion.tipoSesion || 'N/A'}
                        size="small"
                        sx={{
                          bgcolor: '#667eea20',
                          color: '#667eea',
                          fontWeight: 600,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Estado
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={getEstadoLabel(sesion.estado)}
                          size="small"
                          sx={{
                            bgcolor: getEstadoColor(sesion.estado),
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <InputLabel>Cambiar estado</InputLabel>
                          <Select
                            value=""
                            label="Cambiar estado"
                            onChange={(e) => handleCambiarEstado(e.target.value)}
                            disabled={loadingEstado}
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#e2e8f0',
                              },
                            }}
                          >
                            {sesion.estado !== 'programada' && (
                              <MenuItem value="programada">Programada</MenuItem>
                            )}
                            {sesion.estado !== 'realizada' && (
                              <MenuItem value="realizada">Realizada</MenuItem>
                            )}
                            {sesion.estado !== 'cancelada' && (
                              <MenuItem value="cancelada">Cancelada</MenuItem>
                            )}
                            {sesion.estado !== 'ausente' && (
                              <MenuItem value="ausente">Ausente</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Stack>
                    </Grid>
                    {sesion.numeroSesion && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Número de Sesión
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#667eea' }}>
                          #{sesion.numeroSesion}
                        </Typography>
                      </Grid>
                    )}
                    {sesion.observaciones && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Observaciones
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {sesion.observaciones}
                        </Typography>
                      </Grid>
                    )}
                    {sesion.motivoCancelacion && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Motivo de Cancelación
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: '#f56565',
                            fontStyle: 'italic',
                          }}
                        >
                          {sesion.motivoCancelacion}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>

              {/* Detalles de Tratamiento */}
              {sesion.detallesTratamiento && (
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
                      Detalles de Tratamiento
                    </Typography>
                    <Grid container spacing={2}>
                      {sesion.detallesTratamiento.intensidad && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Intensidad
                          </Typography>
                          <Chip
                            label={sesion.detallesTratamiento.intensidad}
                            size="small"
                            sx={{
                              bgcolor: '#667eea20',
                              color: '#667eea',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                        </Grid>
                      )}
                      {sesion.detallesTratamiento.tecnicas && sesion.detallesTratamiento.tecnicas.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Técnicas Aplicadas
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {sesion.detallesTratamiento.tecnicas.map((tecnica, index) => (
                              <Chip
                                key={index}
                                label={tecnica}
                                size="small"
                                sx={{
                                  bgcolor: '#48bb7820',
                                  color: '#48bb78',
                                  fontWeight: 500,
                                }}
                              />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                      {sesion.detallesTratamiento.areas && sesion.detallesTratamiento.areas.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Áreas Tratadas
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {sesion.detallesTratamiento.areas.map((area, index) => (
                              <Chip
                                key={index}
                                label={area}
                                size="small"
                                sx={{
                                  bgcolor: '#f6ad5520',
                                  color: '#f6ad55',
                                  fontWeight: 500,
                                }}
                              />
                            ))}
                          </Stack>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Evolución */}
              {sesion.evolucion && (
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
                      Evolución
                    </Typography>
                    <Grid container spacing={2}>
                      {sesion.evolucion.estadoGeneral && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Estado General
                          </Typography>
                          <Chip
                            label={sesion.evolucion.estadoGeneral}
                            size="small"
                            sx={{
                              bgcolor: '#48bb7820',
                              color: '#48bb78',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                        </Grid>
                      )}
                      {sesion.evolucion.dolor !== undefined && sesion.evolucion.dolor !== null && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Nivel de Dolor
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f56565' }}>
                              {sesion.evolucion.dolor}/10
                            </Typography>
                            <Box
                              sx={{
                                flex: 1,
                                height: 8,
                                bgcolor: '#e2e8f0',
                                borderRadius: 1,
                                overflow: 'hidden',
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${(sesion.evolucion.dolor / 10) * 100}%`,
                                  height: '100%',
                                  bgcolor: sesion.evolucion.dolor <= 3 ? '#48bb78' : sesion.evolucion.dolor <= 6 ? '#f6ad55' : '#f56565',
                                }}
                              />
                            </Box>
                          </Box>
                        </Grid>
                      )}
                      {sesion.evolucion.movilidad && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Movilidad
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {sesion.evolucion.movilidad}
                          </Typography>
                        </Grid>
                      )}
                      {sesion.evolucion.observaciones && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Observaciones de Evolución
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {sesion.evolucion.observaciones}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {/* Indicaciones */}
              {sesion.indicaciones && (
                <Grid item xs={12}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: '#edf2f7',
                      borderRadius: 2,
                      border: '1px solid #cbd5e0',
                      borderLeft: '4px solid #667eea',
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#2d3748' }}>
                      Indicaciones
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#4a5568' }}>
                      {sesion.indicaciones}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              {/* Información del Profesional */}
              {sesion.profesional && (
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
                      Profesional a Cargo
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: '#764ba2',
                          width: 48,
                          height: 48,
                          fontSize: '1rem',
                          fontWeight: 600,
                        }}
                      >
                        {sesion.profesional.nombre?.charAt(0) || ''}
                        {sesion.profesional.apellido?.charAt(0) || ''}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {sesion.profesional.nombre} {sesion.profesional.apellido}
                        </Typography>
                        {sesion.profesional.email && (
                          <Typography variant="caption" color="text.secondary">
                            {sesion.profesional.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              )}

              {/* Información de Pago */}
              {sesion.pago && (
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
                      Información de Pago
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <MoneyIcon sx={{ color: '#667eea', fontSize: 20 }} />
                          <Typography variant="body2" color="text.secondary">
                            Monto
                          </Typography>
                        </Stack>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                          ${(sesion.pago.monto || 0).toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Estado de Pago
                        </Typography>
                        <Chip
                          icon={
                            sesion.pago.pagado ? (
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <CancelIcon sx={{ fontSize: 16 }} />
                            )
                          }
                          label={sesion.pago.pagado ? 'Pagado' : 'Pendiente'}
                          size="small"
                          sx={{
                            bgcolor: sesion.pago.pagado ? '#48bb78' : '#f6ad55',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Grid>
                      {sesion.pago.metodoPago && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Método de Pago
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                            {sesion.pago.metodoPago}
                          </Typography>
                        </Grid>
                      )}
                      {sesion.pago.fechaPago && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Fecha de Pago
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {format(new Date(sesion.pago.fechaPago), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                              locale: es,
                            })}
                          </Typography>
                        </Grid>
                      )}
                      {sesion.pago.comprobante && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Comprobante
                          </Typography>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              Número: {sesion.pago.comprobante.numero || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                              Tipo: {sesion.pago.comprobante.tipo || 'N/A'}
                            </Typography>
                            {sesion.pago.comprobante.url && (
                              <Button
                                size="small"
                                href={sesion.pago.comprobante.url}
                                target="_blank"
                                sx={{ mt: 1, textTransform: 'none' }}
                              >
                                Ver Comprobante
                              </Button>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: '1px solid #e2e8f0',
            bgcolor: '#f7fafc',
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cerrar
          </Button>
          {sesion && (
            <Stack direction="row" spacing={1}>
              {sesion.estado !== 'cancelada' && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleCambiarEstado('cancelada')}
                  disabled={loadingEstado}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#f56565',
                    color: '#f56565',
                    '&:hover': {
                      borderColor: '#e53e3e',
                      bgcolor: '#f5656515',
                    },
                  }}
                >
                  Cancelar Sesión
                </Button>
              )}
            </Stack>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog para confirmar cancelación */}
      <Dialog
        open={cancelarDialog.open}
        onClose={() => setCancelarDialog({ open: false, motivo: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancelar Sesión</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ¿Está seguro de que desea cancelar esta sesión? Esta acción no se puede deshacer.
            </Typography>
            <TextField
              label="Motivo de Cancelación"
              multiline
              rows={3}
              fullWidth
              value={cancelarDialog.motivo}
              onChange={(e) => setCancelarDialog({ ...cancelarDialog, motivo: e.target.value })}
              placeholder="Ej: Paciente canceló por motivos personales"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelarDialog({ open: false, motivo: '' })}
            disabled={loadingCancelar}
            sx={{ textTransform: 'none' }}
          >
            Volver
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelar}
            disabled={loadingCancelar || !cancelarDialog.motivo.trim()}
            startIcon={loadingCancelar ? <CircularProgress size={16} color="inherit" /> : <CancelIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#f56565',
              '&:hover': { bgcolor: '#e53e3e' },
            }}
          >
            {loadingCancelar ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DetalleSesionModal;

