/**
 * Página Dashboard
 * Vista principal moderna, responsive y profesional con estadísticas y resumen del día
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Paper,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { selectUser } from '../features/auth/slices/authSlice';
import { fetchPlanillaDiaria, selectPlanillaDiaria, selectSesionesLoading } from '../features/sesiones/slices/sesionesSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../shared/components/ui/LoadingSpinner';

// Card de Estadística mejorado
const StatCard = ({ title, value, icon, color, subtitle, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        elevation={3}
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 8px 24px ${color}30`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.7rem',
                }}
              >
                {title}
              </Typography>
              {loading ? (
                <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
              ) : (
                <Typography
                  variant={isMobile ? 'h5' : 'h4'}
                  sx={{
                    fontWeight: 700,
                    color,
                    mt: 1,
                    mb: 0.5,
                  }}
                >
                  {value}
                </Typography>
              )}
              {subtitle && !loading && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}20`,
                color,
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const user = useSelector(selectUser);
  const planilla = useSelector(selectPlanillaDiaria);
  const loading = useSelector(selectSesionesLoading);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const fechaHoy = format(new Date(), 'yyyy-MM-dd');
      await dispatch(fetchPlanillaDiaria(fechaHoy)).unwrap();
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    }
  };

  const resumen = planilla?.resumen || {
    totalSesiones: 0,
    sesionesRealizadas: 0,
    sesionesProgramadas: 0,
    totalRecaudado: 0,
    totalPendiente: 0,
  };

  const proximasSesiones = planilla?.sesiones?.slice(0, 5) || [];

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

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header con animación */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ¡Hola, {user?.nombre}! 👋
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              textTransform: 'capitalize',
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </Typography>
        </Box>
      </motion.div>

      {/* Estadísticas - Responsive Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sesiones del Día"
            value={resumen.totalSesiones}
            icon={<EventNoteIcon />}
            color="#667eea"
            subtitle={`${resumen.sesionesRealizadas} realizadas`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Programadas"
            value={resumen.sesionesProgramadas}
            icon={<ScheduleIcon />}
            color="#f6ad55"
            subtitle="Pendientes de realizar"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Recaudado Hoy"
            value={`$${resumen.totalRecaudado.toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#48bb78"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pendiente"
            value={`$${resumen.totalPendiente.toLocaleString()}`}
            icon={<TrendingUpIcon />}
            color="#f56565"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Acciones Rápidas y Próximas Sesiones - Responsive */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Acciones Rápidas */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card
              elevation={3}
              sx={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: '#2d3748',
                  }}
                >
                  Acciones Rápidas
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => navigate('/sesiones')}
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #6a4093 100%)',
                        boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Nueva Sesión
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonIcon />}
                    fullWidth
                    onClick={() => navigate('/pacientes')}
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#e2e8f0',
                      color: '#4a5568',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: '#667eea10',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Nuevo Paciente
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EventNoteIcon />}
                    fullWidth
                    onClick={() => navigate('/planilla-diaria')}
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#e2e8f0',
                      color: '#4a5568',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: '#667eea10',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Ver Planilla Diaria
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MoneyIcon />}
                    fullWidth
                    onClick={() => navigate('/pagos-pendientes')}
                    size="large"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      borderColor: '#e2e8f0',
                      color: '#4a5568',
                      '&:hover': {
                        borderColor: '#667eea',
                        backgroundColor: '#667eea10',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Pagos Pendientes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Próximas Sesiones */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card
              elevation={3}
              sx={{
                height: '100%',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: '#2d3748',
                  }}
                >
                  Sesiones de Hoy
                </Typography>
                {loading ? (
                  <Box sx={{ py: 4 }}>
                    <LoadingSpinner />
                  </Box>
                ) : proximasSesiones.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 6,
                      px: 2,
                    }}
                  >
                    <EventNoteIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                      No hay sesiones programadas para hoy
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/sesiones/nueva')}
                      sx={{ mt: 2 }}
                    >
                      Agregar Sesión
                    </Button>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {proximasSesiones.map((sesion) => {
                      const estadoColor = getEstadoColor(sesion.estado);
                      return (
                        <ListItem
                          key={sesion.id || sesion._id}
                          component={motion.div}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          sx={{
                            borderLeft: `4px solid ${estadoColor}`,
                            mb: 1.5,
                            bgcolor: '#f7fafc',
                            borderRadius: 2,
                            p: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#edf2f7',
                              transform: 'translateX(4px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: estadoColor,
                                width: { xs: 40, md: 48 },
                                height: { xs: 40, md: 48 },
                                fontWeight: 700,
                              }}
                            >
                              {sesion.numeroOrden || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  color: '#2d3748',
                                  mb: 0.5,
                                }}
                              >
                                {sesion.paciente?.nombreCompleto || 'Paciente sin nombre'}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  sx={{
                                    color: 'text.secondary',
                                    display: 'block',
                                    mb: 0.5,
                                  }}
                                >
                                  {sesion.horaEntrada || 'Sin hora'} - {sesion.paciente?.obraSocial?.nombre || 'Sin obra social'}
                                </Typography>
                                <Chip
                                  label={getEstadoLabel(sesion.estado)}
                                  size="small"
                                  sx={{
                                    bgcolor: estadoColor,
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    height: 22,
                                    fontWeight: 600,
                                  }}
                                />
                              </Box>
                            }
                          />
                          <Box sx={{ textAlign: 'right', ml: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: sesion.pago?.pagado ? '#48bb78' : '#f56565',
                                fontSize: { xs: '0.9rem', md: '1rem' },
                              }}
                            >
                              ${sesion.pago?.monto?.toLocaleString() || 0}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                              }}
                            >
                              {sesion.pago?.pagado ? 'Pagado' : 'Pendiente'}
                            </Typography>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
