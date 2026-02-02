/**
 * Página de Evolución del Paciente
 * Muestra gráficos de evolución y estadísticas del paciente
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  useTheme,
  useMediaQuery,
  TextField,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  TrendingDown as TrendingDownIcon,
  LocalHospital as LocalHospitalIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  fetchEvolucionPaciente,
  selectEvolucionPaciente,
  selectEvolucionSesiones,
  selectEvolucionGraficos,
  selectEvolucionEstadisticas,
  selectEvolucionLoading,
  selectEvolucionError,
  setFilters,
  selectEvolucionFilters,
} from '../slices/evolucionSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Card de Estadística
const StatCard = ({ title, value, subtitle, icon, color, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card elevation={2} sx={{ height: '100%', borderLeft: `4px solid ${color}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color, mt: 1 }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              )}
              {trend && (
                <Box sx={{ mt: 1 }}>
                  {trend.includes('↑') || trend.includes('+') || trend.includes('mejora') ? (
                    <Chip
                      size="small"
                      icon={<TrendingUpIcon />}
                      label={trend}
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      icon={<TrendingDownIcon />}
                      label={trend}
                      color="error"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
              )}
            </Box>
            <Avatar sx={{ bgcolor: `${color}20`, color }}>
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const EvolucionPacientePage = () => {
  const { pacienteId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const paciente = useSelector(selectEvolucionPaciente);
  const sesiones = useSelector(selectEvolucionSesiones);
  const graficos = useSelector(selectEvolucionGraficos);
  const estadisticas = useSelector(selectEvolucionEstadisticas);
  const loading = useSelector(selectEvolucionLoading);
  const error = useSelector(selectEvolucionError);
  const filters = useSelector(selectEvolucionFilters);

  useEffect(() => {
    if (pacienteId) {
      cargarDatos();
    }
  }, [pacienteId, filters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const cargarDatos = () => {
    const params = { ...filters };
    
    // Filtrar valores nulos
    Object.keys(params).forEach((key) => {
      if (params[key] === null || params[key] === '') {
        delete params[key];
      }
    });

    dispatch(fetchEvolucionPaciente({ pacienteId, params }));
  };

  const handleRefresh = () => {
    cargarDatos();
    toast.success('Datos actualizados');
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const getMovilidadLabel = (valor) => {
    const labels = {
      1: 'Limitada',
      2: 'Parcial',
      3: 'Completa',
    };
    return labels[valor] || 'Desconocido';
  };

  const getEstadoGeneralLabel = (valor) => {
    const labels = {
      1: 'Empeorado',
      2: 'Estable',
      3: 'Mejorado',
    };
    return labels[valor] || 'Desconocido';
  };

  if (loading && !paciente) {
    return <LoadingSpinner fullScreen message="Cargando evolución del paciente..." />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate(`/pacientes/${pacienteId}`)}>
              <ArrowBackIcon />
            </IconButton>
            <TimelineIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Evolución del Paciente
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {paciente?.nombre} - DNI: {paciente?.dni}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton onClick={handleRefresh} color="primary">
                <RefreshIcon />
              </IconButton>
              <IconButton color="primary">
                <DownloadIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Filtros de Fecha */}
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.fechaInicio || ''}
                  onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Fecha Fin"
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.fechaFin || ''}
                  onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </motion.div>

      {/* Estadísticas Generales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Sesiones"
            value={estadisticas?.totalSesiones || 0}
            icon={<LocalHospitalIcon />}
            color="#0d4d61"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dolor Inicial"
            value={estadisticas?.dolor?.inicial || '-'}
            subtitle={`Actual: ${estadisticas?.dolor?.final || '-'}/10`}
            icon={<TrendingUpIcon />}
            color="#f56565"
            trend={
              estadisticas?.dolor?.mejora
                ? `↓ ${estadisticas.dolor.mejora} puntos (${estadisticas.dolor.mejoraPorcentual}%)`
                : null
            }
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Movilidad"
            value={getMovilidadLabel(estadisticas?.movilidad?.inicial)}
            subtitle={`Actual: ${getMovilidadLabel(estadisticas?.movilidad?.final)}`}
            icon={<TrendingUpIcon />}
            color="#48bb78"
            trend={estadisticas?.movilidad?.mejora ? '↑ Mejoró' : 'Sin cambios'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Estado General"
            value={getEstadoGeneralLabel(estadisticas?.estadoGeneral?.inicial)}
            subtitle={`Actual: ${getEstadoGeneralLabel(estadisticas?.estadoGeneral?.final)}`}
            icon={<CheckCircleIcon />}
            color="#667eea"
            trend={estadisticas?.estadoGeneral?.mejora ? '↑ Mejoró' : 'Sin cambios'}
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Gráfico de Dolor */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingDownIcon color="error" />
                  Evolución del Dolor (0-10)
                </Typography>
                {graficos.dolor?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={graficos.dolor}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="label" 
                        stroke="#718096"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#718096"
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#f56565" 
                        strokeWidth={3}
                        dot={{ fill: '#f56565', r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay datos de dolor registrados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Gráfico de Movilidad */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon color="success" />
                  Evolución de la Movilidad
                </Typography>
                {graficos.movilidad?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={graficos.movilidad}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="label" 
                        stroke="#718096"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#718096"
                        domain={[0, 3]}
                        ticks={[0, 1, 2, 3]}
                        tickFormatter={(value) => getMovilidadLabel(value)}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [getMovilidadLabel(value), 'Movilidad']}
                      />
                      <Bar 
                        dataKey="valor" 
                        fill="#48bb78"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay datos de movilidad registrados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Gráfico de Estado General */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="primary" />
                  Evolución del Estado General
                </Typography>
                {graficos.estadoGeneral?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={graficos.estadoGeneral}>
                      <defs>
                        <linearGradient id="colorEstado" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#667eea" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="label" 
                        stroke="#718096"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis 
                        stroke="#718096"
                        domain={[0, 3]}
                        ticks={[0, 1, 2, 3]}
                        tickFormatter={(value) => getEstadoGeneralLabel(value)}
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                        }}
                        formatter={(value) => [getEstadoGeneralLabel(value), 'Estado']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#667eea"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorEstado)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay datos de estado general registrados
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Historial de Sesiones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
              Historial de Sesiones
            </Typography>
            {sesiones?.length > 0 ? (
              <TableContainer>
                <Table size={isMobile ? 'small' : 'medium'}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Sesión #</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dolor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Movilidad</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sesiones.map((sesion, index) => (
                      <TableRow 
                        key={index}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(13, 77, 97, 0.05)',
                          },
                        }}
                      >
                        <TableCell>
                          {format(new Date(sesion.fecha), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>{sesion.numeroSesion}</TableCell>
                        <TableCell>
                          <Chip 
                            label={sesion.dolor || 'N/A'}
                            size="small"
                            sx={{
                              bgcolor: sesion.dolor >= 7 ? '#f56565' : sesion.dolor >= 4 ? '#f6ad55' : '#48bb78',
                              color: 'white',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sesion.movilidad || 'N/A'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={sesion.estadoGeneral || 'N/A'}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {sesion.observaciones || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No hay sesiones registradas
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default EvolucionPacientePage;
