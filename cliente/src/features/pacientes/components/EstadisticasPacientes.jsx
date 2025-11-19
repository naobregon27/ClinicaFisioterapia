/**
 * Componente de Estadísticas de Pacientes
 * Muestra resumen y estadísticas de pacientes
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fetchEstadisticas, selectEstadisticas, selectPacientesLoading } from '../slices/pacientesSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EstadisticasPacientes = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const estadisticas = useSelector(selectEstadisticas);
  const loading = useSelector(selectPacientesLoading);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      await dispatch(fetchEstadisticas()).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Error al cargar estadísticas');
    }
  };

  const StatCard = ({ title, value, icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        elevation={3}
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `2px solid ${color}30`,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 32px ${color}25`,
            borderColor: `${color}60`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  fontSize: '0.75rem',
                  display: 'block',
                  mb: 1,
                }}
              >
                {title}
              </Typography>
              {loading ? (
                <CircularProgress size={24} sx={{ color }} />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color,
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  }}
                >
                  {value || 0}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${color}40`,
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading && !estadisticas) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <LoadingSpinner />
      </Box>
    );
  }

  const resumen = estadisticas?.resumen || {};
  const porObraSocial = estadisticas?.porObraSocial || [];

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Pacientes"
            value={resumen.totalPacientes}
            icon={<PeopleIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />}
            color="#0d4d61"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Activos"
            value={resumen.activos}
            icon={<CheckCircleIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />}
            color="#48bb78"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Con Alta"
            value={resumen.altas}
            icon={<CheckCircleIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />}
            color="#0d4d61"
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Inactivos"
            value={resumen.inactivos}
            icon={<CancelIcon sx={{ color: 'white', fontSize: { xs: 28, sm: 32 } }} />}
            color="#a0aec0"
            delay={0.4}
          />
        </Grid>
      </Grid>

      {porObraSocial.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
              border: '1px solid #e2e8f0',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                  pb: 2,
                  borderBottom: '2px solid #0d4d6120',
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
                  }}
                >
                  <HospitalIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2d3748' }}>
                  Distribución por Obra Social
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {porObraSocial.map((item, index) => (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  >
                    <Chip
                      label={`${item._id}: ${item.cantidad}`}
                      sx={{
                        bgcolor: '#0d4d6115',
                        color: '#0d4d61',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        px: 1,
                        py: 2.5,
                        border: '1px solid #0d4d6130',
                        '&:hover': {
                          bgcolor: '#0d4d6125',
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default EstadisticasPacientes;

