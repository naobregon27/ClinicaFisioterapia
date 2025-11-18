/**
 * Página Planilla Diaria
 * Vista moderna, responsive y profesional para gestionar las sesiones del día
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Paper,
  Grid,
  Tooltip,
  Stack,
  useTheme,
  useMediaQuery,
  Popover,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  format,
  addDays,
  subDays,
  addMonths,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  fetchPlanillaDiaria,
  selectPlanillaDiaria,
  selectSesionesLoading,
} from '../slices/sesionesSlice';
import DetalleSesionModal from '../components/DetalleSesionModal';
import RegistrarPagoModal from '../components/RegistrarPagoModal';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import sesionService from '../../../services/sesionService';
import toast from 'react-hot-toast';

const getMonthKey = (date) => format(date, 'yyyy-MM');

const unwrapEstadisticasPayload = (payload) => {
  if (!payload) return null;
  if (payload.estadisticas) return payload.estadisticas;
  if (payload.data?.estadisticas) return payload.data.estadisticas;
  if (payload.data) return payload.data;
  return payload;
};

const normalizeFechaIso = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) {
    return format(valor, 'yyyy-MM-dd');
  }
  if (typeof valor === 'string') {
    return valor.split('T')[0];
  }
  if (valor.fecha) {
    return normalizeFechaIso(valor.fecha);
  }
  if (valor.dia) {
    return normalizeFechaIso(valor.dia);
  }
  return null;
};

const extractDiasConSesiones = (payload) => {
  if (!payload) return [];

  const resolved = unwrapEstadisticasPayload(payload) || {};

  const candidateLists = [
    resolved?.diasConSesiones,
    resolved?.generales?.diasConSesiones,
    resolved?.sesiones?.diasConSesiones,
    payload?.generales?.diasConSesiones,
    payload?.data?.diasConSesiones,
    payload?.diasConSesiones,
  ];

  const directList = candidateLists.find((list) => Array.isArray(list));

  if (directList) {
    return [
      ...new Set(
        directList
          .map((item) => (typeof item === 'string' ? item : normalizeFechaIso(item)))
          .filter(Boolean)
          .map((fecha) => normalizeFechaIso(fecha))
      ),
    ];
  }

  const evolutionList =
    resolved?.evolucionDiaria ||
    resolved?.generales?.evolucionDiaria ||
    resolved?.sesiones?.evolucionDiaria ||
    payload?.generales?.evolucionDiaria ||
    payload?.data?.evolucionDiaria ||
    payload?.evolucionDiaria;

  if (Array.isArray(evolutionList)) {
    return [
      ...new Set(
        evolutionList
          .filter((item) => {
            const conteo =
              item?.sesiones ??
              item?.totalSesiones ??
              item?.cantidad ??
              item?.realizadas ??
              0;
            return conteo > 0;
          })
          .map((item) => normalizeFechaIso(item?.fecha || item?.dia))
          .filter(Boolean)
      ),
    ];
  }

  return [];
};

const extractSesionesCalendario = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.sesiones)) return payload.sesiones;
  if (Array.isArray(payload.data?.sesiones)) return payload.data.sesiones;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
};

const obtenerFechaIsoDeSesion = (sesion) => {
  if (!sesion) return null;
  return (
    normalizeFechaIso(sesion.fecha) ||
    normalizeFechaIso(sesion.dia) ||
    normalizeFechaIso(sesion.fechaProgramada) ||
    normalizeFechaIso(sesion.fechaSesion) ||
    normalizeFechaIso(sesion)
  );
};

const PlanillaDiariaPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const planilla = useSelector(selectPlanillaDiaria);
  const loading = useSelector(selectSesionesLoading);

  const [fecha, setFecha] = useState(new Date());
  const [dialogPago, setDialogPago] = useState({ open: false, sesion: null });
  const [detalleSesion, setDetalleSesion] = useState({ open: false, sesionId: null });
  const [estadisticas, setEstadisticas] = useState(null);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState(null);
  const [mesVisible, setMesVisible] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [diasConSesionesPorMes, setDiasConSesionesPorMes] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);

  const registrarDiasCalendario = (sesionesProgramadas = []) => {
    if (!Array.isArray(sesionesProgramadas) || sesionesProgramadas.length === 0) {
      return;
    }

    setDiasConSesionesPorMes((prev) => {
      const actualizado = { ...prev };

      sesionesProgramadas.forEach((sesion) => {
        const fechaIso = obtenerFechaIsoDeSesion(sesion);
        if (!fechaIso) {
          return;
        }

        const [year, month, day] = fechaIso.split('-').map(Number);
        if (!year || !month || !day) {
          return;
        }

        const fechaSesion = new Date(year, month - 1, day);
        const mesKey = getMonthKey(fechaSesion);
        const diasSet = new Set(actualizado[mesKey] || []);
        diasSet.add(fechaIso);
        actualizado[mesKey] = Array.from(diasSet).sort();
      });

      return actualizado;
    });
  };

  const cargarSesionesCalendario = async () => {
    setCalendarLoading(true);
    try {
      const response = await sesionService.obtenerSesionesProgramadasCalendario();
      const sesionesProgramadas = extractSesionesCalendario(response);
      registrarDiasCalendario(sesionesProgramadas);
    } catch (error) {
      console.error('Error al cargar sesiones para el calendario:', error);
      toast.error(error?.response?.data?.message || 'No se pudo cargar el calendario de sesiones');
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    cargarPlanilla();
    cargarEstadisticas(fecha);
  }, [fecha]);

  useEffect(() => {
    setMesVisible(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
  }, [fecha]);

  const cargarPlanilla = async () => {
    try {
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      await dispatch(fetchPlanillaDiaria(fechaStr)).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Error al cargar planilla diaria');
    }
  };

  const cargarEstadisticas = async (fechaReferencia = fecha, { actualizarResumen = true } = {}) => {
    try {
      const inicioMes = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
      const finMes = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 1, 0);
      const fechaInicio = format(inicioMes, 'yyyy-MM-dd');
      const fechaFin = format(finMes, 'yyyy-MM-dd');
      const response = await sesionService.obtenerEstadisticas(fechaInicio, fechaFin);

      if (response?.success) {
        const estadisticasData = unwrapEstadisticasPayload(response) || {};

        if (actualizarResumen && Object.keys(estadisticasData).length > 0) {
          const resumenFuente = estadisticasData.generales || estadisticasData.sesiones || estadisticasData;
          const financieroFuente =
            estadisticasData.financiero || resumenFuente.financiero || {};

          setEstadisticas({
            totalSesiones: resumenFuente.totalSesiones ?? 0,
            sesionesRealizadas:
              resumenFuente.sesionesRealizadas ?? resumenFuente.realizadas ?? resumenFuente.totalRealizadas ?? 0,
            sesionesProgramadas: resumenFuente.sesionesProgramadas ?? resumenFuente.programadas ?? 0,
            sesionesCanceladas:
              resumenFuente.sesionesCanceladas ?? resumenFuente.canceladas ?? resumenFuente.totalCanceladas ?? 0,
            totalRecaudado: financieroFuente.totalRecaudado ?? resumenFuente.totalRecaudado ?? 0,
            totalPendiente: financieroFuente.totalPendiente ?? resumenFuente.totalPendiente ?? 0,
          });
        }

        const diasMarcados = extractDiasConSesiones(response);
        const mesKey = getMonthKey(fechaReferencia);

        setDiasConSesionesPorMes((prev) => ({
          ...prev,
          [mesKey]: diasMarcados,
        }));
      }
      return true;
    } catch (error) {
      if (actualizarResumen) {
        console.error('Error al cargar estadísticas:', error);
      }
      return false;
    }
  };

  const cambiarFecha = (nuevaFecha) => {
    setFecha(nuevaFecha);
  };

  const irHoy = () => {
    setFecha(new Date());
  };

  const handlePagoRegistrado = () => {
    cargarPlanilla();
    cargarEstadisticas();
  };

  const handleSesionActualizada = () => {
    cargarPlanilla();
    cargarEstadisticas();
  };

  const handleAbrirCalendario = async (event) => {
    setCalendarAnchorEl(event.currentTarget);
    await cargarSesionesCalendario();
  };

  const handleCerrarCalendario = () => {
    setCalendarAnchorEl(null);
  };

  const handleCambiarMes = (offset) => () => {
    setMesVisible((prev) => addMonths(prev, offset));
  };

  const handleSeleccionarDia = (dia) => {
    cambiarFecha(dia);
    handleCerrarCalendario();
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

  // Usar estadísticas del mes si están disponibles, sino usar resumen del día
  const resumen = estadisticas
    ? {
        totalSesiones: estadisticas.totalSesiones || 0,
        sesionesRealizadas: estadisticas.sesionesRealizadas ?? estadisticas.realizadas ?? 0,
        sesionesProgramadas:
          estadisticas.sesionesProgramadas ?? planilla?.resumen?.sesionesProgramadas ?? 0,
        sesionesCanceladas: estadisticas.sesionesCanceladas ?? estadisticas.canceladas ?? 0,
        totalRecaudado: estadisticas.totalRecaudado ?? 0,
        totalPendiente: estadisticas.totalPendiente ?? 0,
      }
    : planilla?.resumen || {
        totalSesiones: 0,
        sesionesRealizadas: 0,
        sesionesProgramadas: 0,
        sesionesCanceladas: 0,
        totalRecaudado: 0,
        totalPendiente: 0,
      };

  const sesiones = planilla?.sesiones || [];
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const diasCalendario = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesVisible), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mesVisible), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: inicio, end: fin });
  }, [mesVisible]);

  const diasMarcadosSet = useMemo(() => {
    const lista = diasConSesionesPorMes[getMonthKey(mesVisible)] || [];
    return new Set(lista);
  }, [diasConSesionesPorMes, mesVisible]);

  useEffect(() => {
    if (!sesiones.length) return;
    const mesKey = getMonthKey(fecha);
    const dia = format(fecha, 'yyyy-MM-dd');

    setDiasConSesionesPorMes((prev) => {
      const actuales = prev[mesKey] || [];
      if (actuales.includes(dia)) {
        return prev;
      }
      return {
        ...prev,
        [mesKey]: [...actuales, dia],
      };
    });
  }, [sesiones.length, fecha]);

  return (
    <Box sx={{ width: '100%', maxWidth: '1600px', mx: 'auto', px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header con navegación de fechas */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <IconButton
              onClick={() => cambiarFecha(subDays(fecha, 1))}
              sx={{
                bgcolor: '#f7fafc',
                '&:hover': { bgcolor: '#edf2f7' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>

            <Box sx={{ textAlign: 'center', minWidth: { xs: 200, sm: 300 } }}>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textTransform: 'capitalize',
                }}
              >
                {format(fecha, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </Typography>
              {isToday(fecha) && (
                <Chip
                  label="Hoy"
                  size="small"
                  sx={{
                    mt: 0.5,
                    bgcolor: '#48bb78',
                    color: 'white',
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </Box>

            <IconButton
              onClick={() => cambiarFecha(addDays(fecha, 1))}
              sx={{
                bgcolor: '#f7fafc',
                '&:hover': { bgcolor: '#edf2f7' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>

            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={irHoy}
              size="small"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                textTransform: 'none',
              }}
            >
              Hoy
            </Button>
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={handleAbrirCalendario}
              size="small"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                textTransform: 'none',
              }}
            >
              Calendario
            </Button>
            <Tooltip title="Abrir calendario">
              <IconButton
                onClick={handleAbrirCalendario}
                sx={{
                  display: { xs: 'inline-flex', sm: 'none' },
                  bgcolor: '#f7fafc',
                  '&:hover': { bgcolor: '#edf2f7' },
                }}
              >
                <CalendarMonthIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarPlanilla}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              Actualizar
            </Button>
          </Stack>
        </Box>
      </motion.div>

      <Popover
        open={Boolean(calendarAnchorEl)}
        anchorEl={calendarAnchorEl}
        onClose={handleCerrarCalendario}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        TransitionComponent={Fade}
        keepMounted
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 3,
            boxShadow: '0 18px 45px rgba(0,0,0,0.15)',
            minWidth: { xs: 280, sm: 320 },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              gap: 1,
            }}
          >
            <IconButton size="small" onClick={handleCambiarMes(-1)}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                {format(mesVisible, "MMMM yyyy", { locale: es })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Seleccioná un día para ver su planilla
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleCambiarMes(1)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
          {calendarLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <CircularProgress size={18} />
            </Box>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
            }}
          >
            {diasSemana.map((dia) => (
              <Typography
                key={dia}
                variant="caption"
                align="center"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                {dia}
              </Typography>
            ))}
            {diasCalendario.map((dia) => {
              const fechaStr = format(dia, 'yyyy-MM-dd');
              const esSeleccionado = isSameDay(dia, fecha);
              const esMesActual = isSameMonth(dia, mesVisible);
              const tieneSesiones = diasMarcadosSet.has(fechaStr);
              const esDiaActual = isToday(dia);

              return (
                <Box
                  key={fechaStr}
                  onClick={() => handleSeleccionarDia(dia)}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    background: esSeleccionado
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : tieneSesiones
                      ? '#667eea15'
                      : 'transparent',
                    color: esSeleccionado ? 'white' : esMesActual ? '#2d3748' : '#a0aec0',
                    border: esDiaActual && !esSeleccionado ? '1px solid #667eea' : '1px solid transparent',
                    boxShadow: esSeleccionado ? '0 10px 20px rgba(102,126,234,0.35)' : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      background: esSeleccionado
                        ? 'linear-gradient(135deg, #5568d3 0%, #6a4093 100%)'
                        : '#edf2f7',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {format(dia, 'd')}
                  </Typography>
                  {tieneSesiones && !esSeleccionado && (
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#764ba2',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bottom: 6,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Popover>

      {/* Resumen del día */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #667eea15 0%, #667eea05 100%)',
              border: '1px solid #667eea20',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Sesiones
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea', mt: 0.5 }}>
                {resumen.totalSesiones}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #48bb7815 0%, #48bb7805 100%)',
              border: '1px solid #48bb7820',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Realizadas
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#48bb78', mt: 0.5 }}>
                {resumen.sesionesRealizadas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #f6ad5515 0%, #f6ad5505 100%)',
              border: '1px solid #f6ad5520',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Programadas
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f6ad55', mt: 0.5 }}>
                {resumen.sesionesProgramadas}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #f5656515 0%, #f5656505 100%)',
              border: '1px solid #f5656520',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Canceladas
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#f56565', mt: 0.5 }}>
                {resumen.sesionesCanceladas || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #48bb7815 0%, #48bb7805 100%)',
              border: '1px solid #48bb7820',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Recaudado
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#48bb78', mt: 0.5 }}>
                ${resumen.totalRecaudado.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card
            elevation={3}
            sx={{
              background: 'linear-gradient(135deg, #f5656515 0%, #f5656505 100%)',
              border: '1px solid #f5656520',
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Pendiente
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f56565', mt: 0.5 }}>
                ${resumen.totalPendiente.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de sesiones */}
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
          }}
        >
          {loading ? (
            <Box sx={{ py: 6 }}>
              <LoadingSpinner />
            </Box>
          ) : sesiones.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
              <ScheduleIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                No hay sesiones programadas para este día
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gestioná nuevas sesiones desde la sección Sesiones.
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: { xs: 'calc(100vh - 500px)', md: 'calc(100vh - 450px)' },
                overflowX: 'auto',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f7fafc' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Paciente</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>DNI</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Obra Social</TableCell>
                      </>
                    )}
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Entrada</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Salida</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#2d3748' }}>Duración</TableCell>
                      </>
                    )}
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }} align="right">
                      Monto
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }} align="center">
                      Pago
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }} align="center">
                      Estado
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#2d3748' }} align="center">
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sesiones.map((sesion) => {
                    const estadoColor = getEstadoColor(sesion.estado);
                    return (
                      <TableRow
                        key={sesion.id || sesion._id}
                        hover
                        sx={{
                          borderLeft: `4px solid ${estadoColor}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: '#f7fafc',
                            transform: 'scale(1.01)',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: estadoColor }}>
                          {sesion.numeroOrden || '?'}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {sesion.paciente?.nombreCompleto || 'Sin nombre'}
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>{sesion.paciente?.dni || '-'}</TableCell>
                            <TableCell>{sesion.paciente?.obraSocial?.nombre || 'Particular'}</TableCell>
                          </>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sesion.horaEntrada || '-'}
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell>{sesion.horaSalida || '-'}</TableCell>
                            <TableCell>
                              {sesion.duracion ? `${sesion.duracion} min` : '-'}
                            </TableCell>
                          </>
                        )}
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ${sesion.pago?.monto?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={sesion.pago?.pagado ? 'Pagado' : 'Pendiente'}
                            size="small"
                            sx={{
                              bgcolor: sesion.pago?.pagado ? '#48bb78' : '#f6ad55',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getEstadoLabel(sesion.estado)}
                            size="small"
                            sx={{
                              bgcolor: estadoColor,
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
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
                                  color: '#667eea',
                                  '&:hover': { bgcolor: '#667eea15' },
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={sesion.pago?.pagado ? 'Ver pago' : 'Registrar pago'}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDialogPago({ open: true, sesion });
                                }}
                                sx={{
                                  color: sesion.pago?.pagado ? '#48bb78' : '#f6ad55',
                                  '&:hover': {
                                    bgcolor: sesion.pago?.pagado ? '#48bb7815' : '#f6ad5515',
                                  },
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

      {/* Modal para registrar pago */}
      <RegistrarPagoModal
        open={dialogPago.open}
        onClose={() => setDialogPago({ open: false, sesion: null })}
        sesion={dialogPago.sesion}
        onSuccess={handlePagoRegistrado}
      />

      {/* Modal de detalle de sesión */}
      <DetalleSesionModal
        open={detalleSesion.open}
        onClose={() => setDetalleSesion({ open: false, sesionId: null })}
        sesionId={detalleSesion.sesionId}
        onUpdate={handleSesionActualizada}
      />
    </Box>
  );
};

export default PlanillaDiariaPage;
