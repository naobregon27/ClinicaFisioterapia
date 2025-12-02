import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  PeopleAlt as PeopleAltIcon,
  Diversity3 as DiversityIcon,
  MonitorHeart as MonitorHeartIcon,
  ShowChart as ShowChartIcon,
  Payments as PaymentsIcon,
  Event as EventIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import {
  fetchAdminEstadisticas,
  fetchAdminUltimasAcciones,
  selectAdminEstadisticas,
  selectAdminEstadisticasLoading,
  selectAdminUltimasAcciones,
  selectAdminAccionesLoading,
} from '../slices/adminDashboardSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <Card
    elevation={0}
    sx={{
      height: '100%',
      borderRadius: 3,
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: `${color}25`,
            color,
            width: 56,
            height: 56,
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const estadisticas = useSelector(selectAdminEstadisticas);
  const statsLoading = useSelector(selectAdminEstadisticasLoading);
  const ultimasAcciones = useSelector(selectAdminUltimasAcciones);
  const accionesLoading = useSelector(selectAdminAccionesLoading);

  useEffect(() => {
    dispatch(fetchAdminEstadisticas());
    dispatch(fetchAdminUltimasAcciones({ limit: 8 }));
  }, [dispatch]);

  const stats = [
    {
      title: 'Usuarios Totales',
      value: estadisticas?.usuarios?.total || 0,
      subtitle: `${estadisticas?.usuarios?.activos || 0} activos`,
      icon: <PeopleAltIcon />,
      color: '#0d4d61',
    },
    {
      title: 'Pacientes',
      value: estadisticas?.pacientes?.total || 0,
      subtitle: `${estadisticas?.pacientes?.activos || 0} en tratamiento`,
      icon: <MonitorHeartIcon />,
      color: '#1d7c8a',
    },
    {
      title: 'Sesiones',
      value: estadisticas?.sesiones?.total || 0,
      subtitle: `${estadisticas?.sesiones?.mesActual || 0} este mes`,
      icon: <EventIcon />,
      color: '#f6ad55',
    },
    {
      title: 'Ingresos',
      value: `$${(estadisticas?.finanzas?.ingresosTotales || 0).toLocaleString()}`,
      subtitle: `${estadisticas?.finanzas?.ingresosMesActual || 0} este mes`,
      icon: <PaymentsIcon />,
      color: '#48bb78',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Panel del Administrador
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Control total de la operación, usuarios, pagos y auditoría.
        </Typography>
      </Box>

      {statsLoading ? (
        <LoadingSpinner fullScreen={false} message="Cargando estadísticas..." />
      ) : (
        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.title}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Distribución por Rol
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
                {['administrador', 'empleado', 'usuario'].map((rol) => (
                  <Box key={rol} sx={{ flex: '1 1 140px', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
                      {rol}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {estadisticas?.usuarios?.porRol?.[rol] || 0}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2}>
                <Chip icon={<DiversityIcon />} label={`${estadisticas?.usuarios?.activos || 0} activos`} color="success" variant="outlined" />
                <Chip icon={<SecurityIcon />} label={`${estadisticas?.usuarios?.suspendidos || 0} suspendidos`} color="warning" variant="outlined" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Distribución de Pagos del Mes
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 3, flexWrap: 'wrap' }}>
                {['farfan', 'mica', 'ffma'].map((key) => (
                  <Box key={key} sx={{ flex: '1 1 140px', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
                      {key}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      ${estadisticas?.finanzas?.distribucion?.[key]?.toLocaleString() || 0}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2}>
                <Chip icon={<PaymentsIcon />} label={`Total $${estadisticas?.finanzas?.ingresosMesActual?.toLocaleString() || 0}`} color="primary" variant="outlined" />
                <Chip icon={<ShowChartIcon />} label={`${estadisticas?.finanzas?.variacionMensual || 0}% vs mes prev.`} variant="outlined" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ mt: 3, borderRadius: 3, border: '1px solid rgba(13,77,97,0.1)' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Últimas acciones registradas
            </Typography>
            <Chip label="Auditoría en tiempo real" color="primary" variant="outlined" icon={<SecurityIcon />} />
          </Stack>
          {accionesLoading ? (
            <LoadingSpinner fullScreen={false} message="Cargando acciones..." />
          ) : (
            <List>
              {ultimasAcciones.map((accion) => (
                <React.Fragment key={accion._id || accion.id}>
                  <ListItem
                    sx={{
                      px: 0,
                      '& .MuiListItemText-primary': {
                        fontWeight: 600,
                      },
                    }}
                  >
                    <ListItemText
                      primary={`${accion.accion?.toUpperCase()} · ${accion.recurso?.tipo || 'recurso'} `}
                      secondary={
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} divider={<Divider orientation="vertical" flexItem />}>
                          <Typography variant="body2" color="text.secondary">
                            {accion.descripcion || accion.recurso?.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Por: {accion.usuario?.nombre || accion.usuarioNombre || 'Sistema'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(accion.createdAt).toLocaleString()}
                          </Typography>
                        </Stack>
                      }
                    />
                    <Tooltip title={`Estado ${accion.estado || 'exitoso'}`}>
                      <Chip
                        label={accion.estado || 'exitoso'}
                        size="small"
                        color={accion.estado === 'fallido' ? 'error' : 'success'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Tooltip>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
              {ultimasAcciones.length === 0 && (
                <Box sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Aún no hay acciones registradas.
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminDashboardPage;



