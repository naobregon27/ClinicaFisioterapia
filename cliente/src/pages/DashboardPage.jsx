/**
 * Página Dashboard Mejorada
 * Vista principal moderna con métricas del nuevo backend, gráficos y animaciones
 */

import React, { useEffect, useState } from 'react';
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
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  EventNote as EventNoteIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { selectUser } from '../features/auth/slices/authSlice';
import { 
  fetchDashboardMetricas, 
  selectMetricas, 
  selectProximasSesiones, 
  selectIngresosUltimos7Dias,
  selectDashboardLoading 
} from '../features/dashboard/slices/dashboardSlice';
import { selectCantidadNoLeidas } from '../features/notificaciones/slices/notificacionesSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../shared/components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Card de Estadística mejorado con animación
const StatCard = ({ title, value, icon, color, subtitle, loading = false, trend = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card
        elevation={3}
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: color,
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
                <>
                  <Typography
                    variant={isMobile ? 'h5' : 'h4'}
                    sx={{
                      fontWeight: 700,
                      color,
                      mt: 1,
                      mb: 0.5,
                    }}
                  >
                    {String(value ?? 0)}
                  </Typography>
                  {trend && (
                    <Chip
                      label={trend}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        bgcolor: trend.includes('+') ? '#48bb78' : '#f56565',
                        color: 'white',
                      }}
                    />
                  )}
                </>
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
              {icon || null}
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
  const metricas = useSelector(selectMetricas);
  const proximasSesiones = useSelector(selectProximasSesiones);
  const ingresosUltimos7Dias = useSelector(selectIngresosUltimos7Dias);
  const loading = useSelector(selectDashboardLoading);
  const cantidadNotificaciones = useSelector(selectCantidadNoLeidas);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      await dispatch(fetchDashboardMetricas()).unwrap();
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
    toast.success('Dashboard actualizado');
  };

  const getEstadoColor = (estado) => {
    const colors = {
      realizada: '#48bb78',
      programada: '#f6ad55',
      cancelada: '#f56565',
      ausente: '#a0aec0',
    };
    return colors[estado] || '#0d4d61';
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

  // Preparar datos para el gráfico
  const chartData = (ingresosUltimos7Dias || []).map(item => ({
    dia: item.dia,
    ingresos: item.ingresos,
    fecha: item.fecha,
  }));

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        pl: { xs: 1, sm: 1.5, md: 2 },
        pr: { xs: 1, sm: 1.5, md: 2 },
        pb: 2,
      }}
    >
      {/* Header con animación */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 700,
                mb: 1,
                background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
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
          <Tooltip title="Actualizar datos">
            <IconButton 
              onClick={handleRefresh} 
              disabled={refreshing}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <RefreshIcon className={refreshing ? 'rotating' : ''} />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

      {/* Estadísticas Principales - Grid Responsive */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sesiones Hoy"
            value={metricas?.sesionesHoy || 0}
            icon={<EventNoteIcon />}
            color="#0d4d61"
            subtitle={`${metricas?.pacientesActivosHoy || 0} pacientes`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos del Día"
            value={`$${(metricas?.ingresosHoy || 0).toLocaleString()}`}
            icon={<MoneyIcon />}
            color="#48bb78"
            subtitle="Cobrado hoy"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos del Mes"
            value={`$${(metricas?.ingresosMes || 0).toLocaleString()}`}
            icon={<TrendingUpIcon />}
            color="#667eea"
            subtitle={`${metricas?.sesionesRealizadasMes || 0} sesiones realizadas`}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pagos Pendientes"
            value={metricas?.pagosPendientes || 0}
            icon={<CancelIcon />}
            color="#f56565"
            subtitle="Por cobrar"
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Estadísticas Secundarias */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={6} md={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card elevation={2} sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#667eea', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea' }}>
                {metricas?.pacientesNuevosMes || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pacientes Nuevos
              </Typography>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={6} md={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card elevation={2} sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
              <CalendarIcon sx={{ fontSize: 40, color: '#f6ad55', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f6ad55' }}>
                ${(metricas?.ingresosSemana || 0).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Ingresos Semana
              </Typography>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={6} md={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card 
              elevation={2} 
              sx={{ textAlign: 'center', p: 2, borderRadius: 2, cursor: 'pointer' }}
              onClick={() => navigate('/notificaciones')}
            >
              <NotificationsIcon sx={{ fontSize: 40, color: '#f56565', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f56565' }}>
                {cantidadNotificaciones || metricas?.notificacionesNoLeidas || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Notificaciones
              </Typography>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={6} md={3}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card elevation={2} sx={{ textAlign: 'center', p: 2, borderRadius: 2 }}>
              <CancelIcon sx={{ fontSize: 40, color: '#a0aec0', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#a0aec0' }}>
                {metricas?.sesionesCanceladasMes || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Canceladas del Mes
              </Typography>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Gráfico de Ingresos y Contenido Principal */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Gráfico de Ingresos de la Semana */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#2d3748' }}>
                Ingresos de los Últimos 7 Días
              </Typography>
              {loading ? (
                <Box sx={{ py: 4 }}>
                  <LoadingSpinner />
                </Box>
              ) : chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="dia" 
                      stroke="#718096"
                      style={{ fontSize: '12px', textTransform: 'capitalize' }}
                    />
                    <YAxis 
                      stroke="#718096"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Ingresos']}
                      labelFormatter={(label) => `Día: ${label}`}
                    />
                    <Bar 
                      dataKey="ingresos" 
                      fill="#0d4d61"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay datos de ingresos disponibles
                  </Typography>
                </Box>
              )}
            </Card>
          </motion.div>
        </Grid>

        {/* Acciones Rápidas */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3, p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#2d3748' }}>
                Acciones Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        ℹ️ Para registrar sesiones:
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        1. Primero agregue el paciente aquí
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        2. Luego vaya a "Sesiones" en el menú
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        3. Busque el paciente y registre la sesión
                      </Typography>
                    </Box>
                  }
                  placement="left"
                  arrow
                >
                  <Button
                    variant="contained"
                    startIcon={<PersonIcon />}
                    fullWidth
                    onClick={() => {
                      toast('📝 Para registrar sesiones, primero agregue el paciente y luego vaya a "Sesiones"', {
                        duration: 4000,
                        icon: 'ℹ️',
                      });
                      navigate('/pacientes');
                    }}
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(13, 77, 97, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0b3c4d 0%, #5a8f96 100%)',
                        boxShadow: '0 6px 16px rgba(13, 77, 97, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Nuevo Paciente
                  </Button>
                </Tooltip>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
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
                      borderColor: '#0d4d61',
                      backgroundColor: '#0d4d6110',
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
                      borderColor: '#0d4d61',
                      backgroundColor: '#0d4d6110',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Pagos Pendientes
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>

        {/* Próximas Sesiones */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>
                  Próximas Sesiones del Día
                </Typography>
                <Button
                  size="small"
                  onClick={() => navigate('/planilla-diaria')}
                  sx={{ textTransform: 'none' }}
                >
                  Ver todas
                </Button>
              </Box>
              {loading ? (
                <Box sx={{ py: 4 }}>
                  <LoadingSpinner />
                </Box>
              ) : !proximasSesiones || proximasSesiones.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
                  <EventNoteIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    No hay sesiones programadas para hoy
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/sesiones')}
                    sx={{ mt: 2 }}
                  >
                    Agregar Sesión
                  </Button>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {(proximasSesiones || []).slice(0, 5).map((sesion, index) => {
                    const estadoColor = getEstadoColor(sesion.estado);
                    return (
                      <motion.div
                        key={sesion.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ListItem
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
                              {sesion.horaEntrada?.substring(0, 5) || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3748', mb: 0.5 }}>
                                {sesion.paciente?.nombre} {sesion.paciente?.apellido}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography component="span" variant="body2" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                  {sesion.horaEntrada} - {sesion.horaSalida || 'Sin hora de salida'}
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
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#48bb78', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                              ${sesion.monto?.toLocaleString() || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                              {sesion.pagado ? 'Pagado' : 'Pendiente'}
                            </Typography>
                          </Box>
                        </ListItem>
                      </motion.div>
                    );
                  })}
                </List>
              )}
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* CSS para animación de refresh */}
      <style>
        {`
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .rotating {
            animation: rotate 1s linear infinite;
          }
        `}
      </style>
    </Box>
  );
};

export default DashboardPage;
