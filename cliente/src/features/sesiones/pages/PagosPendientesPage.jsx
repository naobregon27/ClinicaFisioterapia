/**
 * Página de Pagos Pendientes
 * Vista moderna, responsive y profesional para gestionar pagos pendientes
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import sesionService from '../../../services/sesionService';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import DetalleSesionModal from '../components/DetalleSesionModal';
import RegistrarPagoModal from '../components/RegistrarPagoModal';
import toast from 'react-hot-toast';

const PagosPendientesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pagosPendientes, setPagosPendientes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detalleSesion, setDetalleSesion] = useState({ open: false, sesionId: null });
  const [dialogPago, setDialogPago] = useState({ open: false, sesion: null });

  useEffect(() => {
    cargarPagosPendientes();
  }, []);

  const cargarPagosPendientes = async () => {
    try {
      setLoading(true);
      const response = await sesionService.obtenerPagosPendientes(100);
      if (response.success && response.data) {
        setPagosPendientes(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar pagos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handlePagoRegistrado = () => {
    cargarPagosPendientes();
  };

  const getDiasDesdeSesion = (fecha) => {
    if (!fecha) return null;
    const fechaSesion = new Date(fecha);
    const hoy = new Date();
    return differenceInDays(hoy, fechaSesion);
  };

  const getEstadoColor = (estado) => {
    const colors = {
      programada: '#f6ad55',
      realizada: '#48bb78',
      cancelada: '#f56565',
      ausente: '#a0aec0',
    };
    return colors[estado] || '#0d4d61';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      programada: 'Programada',
      realizada: 'Realizada',
      cancelada: 'Cancelada',
      ausente: 'Ausente',
    };
    return labels[estado] || estado;
  };

  const sesiones = pagosPendientes?.sesiones || [];
  const resumen = pagosPendientes?.resumen || {};
  const totalPendiente = pagosPendientes?.totalPendiente || 0;
  const cantidad = pagosPendientes?.cantidad || 0;
  const tableViewportHeight = {
    xs: 'calc(100vh - 400px)',
    md: 'calc(100vh - 350px)',
  };
  const shouldLimitTableHeight = sesiones.length > (isMobile ? 4 : 8);

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
              }}
            >
              Pagos Pendientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cantidad} {cantidad === 1 ? 'pago pendiente' : 'pagos pendientes'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarPagosPendientes}
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Actualizar
          </Button>
        </Box>
      </motion.div>

      {/* Resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #f5656515 0%, #f5656505 100%)',
              border: '1px solid #f5656520',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <MoneyIcon sx={{ color: '#f56565', fontSize: 28 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Pendiente
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f56565' }}>
                ${totalPendiente.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #0d4d6115 0%, #0d4d6105 100%)',
              border: '1px solid #0d4d6120',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <ScheduleIcon sx={{ color: '#0d4d61', fontSize: 28 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Cantidad de Sesiones
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#0d4d61' }}>
                {cantidad}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {resumen.montoPromedio && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              elevation={3}
              sx={{
                background: 'linear-gradient(135deg, #f6ad5515 0%, #f6ad5505 100%)',
                border: '1px solid #f6ad5520',
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <MoneyIcon sx={{ color: '#f6ad55', fontSize: 28 }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Monto Promedio
                  </Typography>
                </Stack>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f6ad55' }}>
                  ${resumen.montoPromedio.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Tabla de Pagos Pendientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          {loading ? (
            <Box sx={{ py: 6 }}>
              <LoadingSpinner />
            </Box>
          ) : sesiones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#48bb78', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No hay pagos pendientes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todas las sesiones están al día con sus pagos
              </Typography>
            </Box>
          ) : (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    ...(shouldLimitTableHeight && {
                      maxHeight: tableViewportHeight,
                      minHeight: tableViewportHeight,
                    }),
                    overflowX: 'auto',
                  }}
                >
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: '#f7fafc',
                      '& .MuiTableCell-head': {
                        fontWeight: 700,
                        color: '#2d3748',
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        py: 2,
                        borderBottom: '2px solid #e2e8f0',
                      },
                    }}
                  >
                    <TableCell>Paciente</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>DNI</TableCell>
                        <TableCell>Obra Social</TableCell>
                      </>
                    )}
                    <TableCell>Fecha Sesión</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>Hora</TableCell>
                        <TableCell>N° Sesión</TableCell>
                      </>
                    )}
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    {!isMobile && <TableCell>Días</TableCell>}
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sesiones.map((sesion, index) => {
                    const diasDesde = getDiasDesdeSesion(sesion.fecha);
                    const estadoColor = getEstadoColor(sesion.estado);
                    return (
                      <TableRow
                        key={sesion.id || sesion._id}
                        component={motion.tr}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.02 }}
                        hover
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#f7fafc',
                            transform: 'scale(1.005)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          },
                          borderLeft: `4px solid ${estadoColor}`,
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor: '#0d4d61',
                                width: { xs: 36, sm: 40 },
                                height: { xs: 36, sm: 40 },
                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                fontWeight: 600,
                              }}
                            >
                              {sesion.paciente?.nombre?.charAt(0) || ''}
                              {sesion.paciente?.apellido?.charAt(0) || ''}
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: '#2d3748',
                                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                                }}
                              >
                                {sesion.paciente?.nombreCompleto ||
                                  `${sesion.paciente?.nombre || ''} ${sesion.paciente?.apellido || ''}`}
                              </Typography>
                              {sesion.paciente?.telefono && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <PhoneIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    {sesion.paciente.telefono}
                                  </Typography>
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>{sesion.paciente?.dni || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={sesion.paciente?.obraSocial || 'Particular'}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.75rem',
                                  borderColor: '#0d4d61',
                                  color: '#0d4d61',
                                }}
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sesion.fecha
                              ? format(new Date(sesion.fecha), "dd 'de' MMMM 'de' yyyy", {
                                  locale: es,
                                })
                              : '-'}
                          </Typography>
                          {sesion.fechaFormateada && (
                            <Typography variant="caption" color="text.secondary">
                              {sesion.fechaFormateada}
                            </Typography>
                          )}
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>
                              {sesion.horaEntrada || '-'}
                              {sesion.horaSalida && ` - ${sesion.horaSalida}`}
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: '#0d4d61',
                                }}
                              >
                                #{sesion.numeroSesion || '-'}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell align="right" sx={{ fontWeight: 700, color: '#f56565' }}>
                          ${(sesion.pago?.monto || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getEstadoLabel(sesion.estado)}
                            size="small"
                            sx={{
                              bgcolor: estadoColor,
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            {diasDesde !== null && (
                              <Chip
                                label={diasDesde === 0 ? 'Hoy' : diasDesde > 0 ? `Hace ${diasDesde} días` : `En ${Math.abs(diasDesde)} días`}
                                size="small"
                                sx={{
                                  bgcolor: diasDesde > 30 ? '#f56565' : diasDesde > 15 ? '#f6ad55' : '#48bb78',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
                                }}
                              />
                            )}
                          </TableCell>
                        )}
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDetalleSesion({
                                    open: true,
                                    sesionId: sesion.id || sesion._id,
                                  });
                                }}
                                sx={{
                                  color: '#0d4d61',
                                  '&:hover': {
                                    bgcolor: '#0d4d6115',
                                    transform: 'scale(1.15)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Registrar pago">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDialogPago({ open: true, sesion });
                                }}
                                sx={{
                                  color: '#48bb78',
                                  '&:hover': {
                                    bgcolor: '#48bb7815',
                                    transform: 'scale(1.15)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <MoneyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </motion.div>

      {/* Modal de detalle de sesión */}
      <DetalleSesionModal
        open={detalleSesion.open}
        onClose={() => setDetalleSesion({ open: false, sesionId: null })}
        sesionId={detalleSesion.sesionId}
        onUpdate={handlePagoRegistrado}
      />

      {/* Modal para registrar pago */}
      <RegistrarPagoModal
        open={dialogPago.open}
        onClose={() => setDialogPago({ open: false, sesion: null })}
        sesion={dialogPago.sesion}
        onSuccess={handlePagoRegistrado}
      />
    </Box>
  );
};

export default PagosPendientesPage;
