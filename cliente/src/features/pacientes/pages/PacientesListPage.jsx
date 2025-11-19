/**
 * Página de Lista de Pacientes
 * Vista moderna, responsive y profesional con tabla mejorada de pacientes
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Typography,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  Tooltip,
  Stack,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Block as BlockIcon,
  LocalHospital as HospitalIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  fetchPacientes,
  setFiltros,
  selectPacientes,
  selectPacientesLoading,
  selectPacientesPagination,
  selectPacientesFiltros,
  cambiarEstadoPaciente,
} from '../slices/pacientesSlice';
import NuevoPacienteModal from '../components/NuevoPacienteModal';
import DetallePacienteModal from '../components/DetallePacienteModal';
import EditarPacienteModal from '../components/EditarPacienteModal';
import AltaMedicaModal from '../components/AltaMedicaModal';
import EstadisticasPacientes from '../components/EstadisticasPacientes';
import CambioEstadoPacienteModal from '../components/CambioEstadoPacienteModal';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const PacientesListPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const pacientes = useSelector(selectPacientes);
  const loading = useSelector(selectPacientesLoading);
  const pagination = useSelector(selectPacientesPagination);
  const filtros = useSelector(selectPacientesFiltros);

  const tableViewportHeight = {
    xs: 'calc(100vh - 400px)',
    md: 'calc(100vh - 350px)',
  };
  const shouldLimitTableHeight =
    (pagination?.total || pacientes.length) > (pagination?.limit || 10);

  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [editarModalOpen, setEditarModalOpen] = useState(false);
  const [altaMedicaModalOpen, setAltaMedicaModalOpen] = useState(false);
  const [pacienteSeleccionadoId, setPacienteSeleccionadoId] = useState(null);
  const [pacienteParaAlta, setPacienteParaAlta] = useState(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  const [estadoModal, setEstadoModal] = useState({ open: false, paciente: null });

  // Cargar pacientes al montar y cuando cambian los filtros
  useEffect(() => {
    cargarPacientes();
  }, [filtros]);

  // Recargar cuando se cierra el modal (por si se creó o editó un paciente)
  const handleModalClose = () => {
    setModalOpen(false);
    cargarPacientes();
  };

  const handleEditarModalClose = () => {
    setEditarModalOpen(false);
    setPacienteSeleccionadoId(null);
    cargarPacientes();
  };

  const handleCambioEstado = (paciente) => {
    setEstadoModal({ open: true, paciente });
  };

  const handleEstadoModalClose = () => {
    setEstadoModal({ open: false, paciente: null });
  };

  const handleEstadoSubmit = async ({ estado, motivo }) => {
    if (!estadoModal.paciente) return;
    try {
      await dispatch(
        cambiarEstadoPaciente({
          id: estadoModal.paciente.id || estadoModal.paciente._id,
          estado,
          motivo,
        })
      ).unwrap();
      toast.success('Estado del paciente actualizado');
      handleEstadoModalClose();
      cargarPacientes();
    } catch (error) {
      toast.error(error?.message || 'No se pudo actualizar el estado');
    }
  };

  const handleAltaMedica = (paciente) => {
    setPacienteParaAlta(paciente);
    setAltaMedicaModalOpen(true);
  };

  const handleAltaMedicaClose = () => {
    setAltaMedicaModalOpen(false);
    setPacienteParaAlta(null);
    cargarPacientes();
  };

  const cargarPacientes = async () => {
    try {
      await dispatch(fetchPacientes(filtros)).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Error al cargar pacientes');
    }
  };

  // Debounced search
  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        dispatch(setFiltros({ busqueda: searchTerm, page: 1 }));
      }, 500),
    [dispatch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setBusquedaLocal(value);
    debouncedSearch(value);
  };

  const handleEstadoChange = (e) => {
    dispatch(setFiltros({ estado: e.target.value, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setFiltros({ page: newPage + 1 }));
  };

  const handleLimitChange = (event) => {
    dispatch(setFiltros({ limit: parseInt(event.target.value, 10), page: 1 }));
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activo: 'success',
      inactivo: 'default',
      alta: 'info',
      derivado: 'warning',
      abandono: 'error',
    };
    return colors[estado] || 'default';
  };

  const getEstadoBgColor = (estado) => {
    const colors = {
      activo: '#48bb7820',
      inactivo: '#a0aec020',
      alta: '#0d4d6120',
      derivado: '#f6ad5520',
      abandono: '#f5656520',
    };
    return colors[estado] || '#e2e8f0';
  };

  const getTotalSesionesPlan = (paciente) =>
    paciente.tratamiento?.cantidadTotalSesiones || 0;

  const getSesionesProgramadas = (paciente) =>
    paciente.resumenSesiones?.sesionesTotales ??
    paciente.estadisticas?.totalSesiones ??
    0;

  const getSaldoInfo = (paciente) => {
    const valorSesion = paciente.valorSesion || paciente.tratamiento?.valorSesion || 0;
    const totalSesionesPlan = getTotalSesionesPlan(paciente);
    const totalPlan = valorSesion * totalSesionesPlan;
    const pagado =
      paciente.resumenSesiones?.montoPagado ??
      paciente.estadisticas?.totalAbonado ??
      0;
    const adeudado =
      paciente.resumenSesiones?.montoAdeudado ??
      paciente.estadisticas?.saldoPendiente;
    const saldoPendiente =
      adeudado !== undefined && adeudado !== null
        ? adeudado
        : Math.max(totalPlan - pagado, 0);
    return {
      totalPlan,
      pagado,
      saldoPendiente,
    };
  };

  const formatMonto = (valor) => Number(valor || 0).toLocaleString('es-AR');

  const getMotivoInactividad = (paciente) => {
    if (!paciente || paciente.estado !== 'inactivo') return null;
    
    // Buscar en campos directos comunes
    const posiblesMotivos = [
      paciente.motivoEstado,
      paciente.motivoInactivo,
      paciente.motivo,
      paciente.detalleEstado,
      paciente.estadoDetalle,
      paciente.estadoMotivo,
      paciente.motivoCambioEstado,
      paciente.ultimoMotivoEstado,
      paciente.motivoDesactivacion,
      paciente.razonInactivo,
      paciente.estadoInfo?.motivo,
      paciente.estadoActual?.motivo,
      paciente.estadoDetalle?.motivo,
    ];

    // Buscar en el historial de estados (el último que tenga estado inactivo)
    if (Array.isArray(paciente.historialEstados) && paciente.historialEstados.length > 0) {
      // Buscar el último cambio a inactivo
      const ultimoInactivo = [...paciente.historialEstados]
        .reverse()
        .find((h) => h.estado === 'inactivo' && h.motivo);
      if (ultimoInactivo?.motivo) {
        posiblesMotivos.push(ultimoInactivo.motivo);
      }
    }

    // Buscar en cambios de estado recientes
    if (Array.isArray(paciente.cambiosEstado) && paciente.cambiosEstado.length > 0) {
      const ultimoCambioInactivo = [...paciente.cambiosEstado]
        .reverse()
        .find((c) => c.estado === 'inactivo' && c.motivo);
      if (ultimoCambioInactivo?.motivo) {
        posiblesMotivos.push(ultimoCambioInactivo.motivo);
      }
    }

    // Buscar dinámicamente en todas las propiedades que contengan "motivo" en su nombre
    for (const key in paciente) {
      if (key.toLowerCase().includes('motivo') && typeof paciente[key] === 'string' && paciente[key].trim().length > 0) {
        posiblesMotivos.push(paciente[key]);
      }
    }

    // Buscar en objetos anidados que puedan contener el motivo
    if (paciente.estadoInfo && typeof paciente.estadoInfo === 'object') {
      for (const key in paciente.estadoInfo) {
        if (key.toLowerCase().includes('motivo') && typeof paciente.estadoInfo[key] === 'string' && paciente.estadoInfo[key].trim().length > 0) {
          posiblesMotivos.push(paciente.estadoInfo[key]);
        }
      }
    }

    const motivoEncontrado = posiblesMotivos.find(
      (mot) => typeof mot === 'string' && mot.trim().length > 0
    );

    // Debug temporal: si no se encuentra motivo, loguear el paciente para ver su estructura
    if (!motivoEncontrado && paciente.estado === 'inactivo') {
      console.log('Paciente inactivo sin motivo encontrado:', {
        id: paciente.id || paciente._id,
        nombre: paciente.nombreCompleto,
        estado: paciente.estado,
        campos: Object.keys(paciente).filter(k => k.toLowerCase().includes('motivo') || k.toLowerCase().includes('estado')),
        pacienteCompleto: paciente
      });
    }

    return motivoEncontrado;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', mx: 0, px: 0 }}>
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
              Pacientes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pagination?.total || 0} {pagination?.total === 1 ? 'paciente' : 'pacientes'} registrados
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#0d4d61',
                color: '#0d4d61',
                '&:hover': {
                  borderColor: '#0b3c4d',
                  bgcolor: '#0d4d6110',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {mostrarEstadisticas ? 'Ocultar' : 'Estadísticas'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setModalOpen(true)}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0b3c4d 0%, #6a4093 100%)',
                  boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Nuevo Paciente
            </Button>
          </Stack>
        </Box>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card
          elevation={3}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
            border: '1px solid #e2e8f0',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <TextField
              placeholder="Buscar por nombre, apellido o DNI..."
              value={busquedaLocal}
              onChange={handleSearchChange}
              fullWidth={isMobile}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 300 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Estado"
              value={filtros.estado}
              onChange={handleEstadoChange}
              sx={{
                minWidth: { xs: '100%', sm: 150 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'white',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
              <MenuItem value="alta">Con Alta</MenuItem>
              <MenuItem value="derivado">Derivado</MenuItem>
              <MenuItem value="abandono">Abandono</MenuItem>
            </TextField>
          </Stack>
        </Card>
      </motion.div>

      {/* Estadísticas */}
      {mostrarEstadisticas && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ mb: 3 }}>
            <EstadisticasPacientes />
          </Box>
        </motion.div>
      )}

      {/* Tabla Mejorada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
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
          {loading && (
            <LinearProgress
              sx={{
                height: 3,
                background: 'linear-gradient(90deg, #0d4d61 0%, #6fb0b8 100%)',
              }}
            />
          )}
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
                      <TableCell>Contacto</TableCell>
                      <TableCell>Obra Social</TableCell>
                    </>
                  )}
                  <TableCell align="center">Estado</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell align="center">Sesiones</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                    </>
                  )}
                  <TableCell align="center">Acciones</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell align="center">Desactivar</TableCell>
                      <TableCell align="center">Alta Médica</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && pacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 9} sx={{ py: 4 }}>
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : pacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMobile ? 3 : 9} align="center" sx={{ py: 6 }}>
                      <Box>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                          No se encontraron pacientes
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {busquedaLocal
                            ? `No hay resultados para "${busquedaLocal}"`
                            : 'Comienza agregando tu primer paciente'}
                        </Typography>
                        {!busquedaLocal && (
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setModalOpen(true)}
                            sx={{
                              background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                            }}
                          >
                            Agregar Paciente
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  pacientes.map((paciente, index) => {
                    const sesionesPlan = getTotalSesionesPlan(paciente);
                    const sesionesProgramadas = getSesionesProgramadas(paciente);
                    const sesionesTotalesVisibles =
                      sesionesPlan || sesionesProgramadas || 0;
                    const saldoInfo = getSaldoInfo(paciente);
                    const motivoInactivo = getMotivoInactividad(paciente);
                    return (
                    <TableRow
                      key={paciente.id || paciente._id}
                      component={motion.tr}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      hover
                      sx={{
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f7fafc',
                          transform: 'scale(1.005)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        borderLeft: `4px solid ${getEstadoBgColor(paciente.estado)}`,
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              bgcolor: '#0d4d61',
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 },
                              fontSize: { xs: '0.9rem', sm: '1rem' },
                              fontWeight: 600,
                            }}
                          >
                            {paciente.nombre?.charAt(0) || ''}
                            {paciente.apellido?.charAt(0) || ''}
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
                              {paciente.nombreCompleto || `${paciente.nombre} ${paciente.apellido}`}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                              }}
                            >
                              DNI: {paciente.dni}
                            </Typography>
                            {paciente.estado === 'inactivo' && (
                              <Typography
                                variant="caption"
                                sx={{
                                  mt: 0.5,
                                  px: 1,
                                  py: 0.3,
                                  borderRadius: 1.5,
                                  backgroundColor: '#fed7d740',
                                  color: '#c53030',
                                  fontStyle: motivoInactivo ? 'normal' : 'italic',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  maxWidth: { xs: 220, sm: 260 },
                                }}
                              >
                                {motivoInactivo
                                  ? `Motivo: ${motivoInactivo}`
                                  : 'Motivo pendiente de especificar'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>
                            <Stack spacing={0.5}>
                              {paciente.telefono && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                                    {paciente.telefono}
                                  </Typography>
                                </Box>
                              )}
                              {paciente.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                                    {paciente.email}
                                  </Typography>
                                </Box>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={paciente.obraSocial?.nombre || 'Particular'}
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
                      <TableCell align="center">
                        <Chip
                          label={paciente.estado}
                          size="small"
                          color={getEstadoColor(paciente.estado)}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            minWidth: 80,
                          }}
                        />
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell align="center">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: '#0d4d61',
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                              }}
                            >
                              {`${sesionesProgramadas}/${sesionesTotalesVisibles}`}
                            </Typography>
                            {sesionesPlan > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                {`${Math.max(sesionesPlan - sesionesProgramadas, 0)} restantes`}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                                color: saldoInfo.saldoPendiente > 0 ? '#f56565' : '#48bb78',
                              }}
                            >
                              {`${formatMonto(saldoInfo.saldoPendiente)} / ${formatMonto(
                                saldoInfo.totalPlan
                              )}`}
                            </Typography>
                            {saldoInfo.pagado > 0 && (
                              <Typography variant="caption" color="text.secondary">
                                Pagado: ${formatMonto(saldoInfo.pagado)}
                              </Typography>
                            )}
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Ver detalles">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPacienteSeleccionadoId(paciente.id || paciente._id);
                                setDetalleModalOpen(true);
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
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPacienteSeleccionadoId(paciente.id || paciente._id);
                                setEditarModalOpen(true);
                              }}
                              sx={{
                                color: '#f6ad55',
                                '&:hover': {
                                  bgcolor: '#f6ad5515',
                                  transform: 'scale(1.15)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell align="center">
                            <Tooltip
                              title={
                                paciente.estado === 'activo'
                                  ? 'Desactivar paciente'
                                  : 'Reactivar paciente'
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleCambioEstado(paciente)}
                                  disabled={
                                    paciente.estado !== 'activo' && paciente.estado !== 'inactivo'
                                  }
                                  sx={{
                                    color:
                                      paciente.estado === 'activo'
                                        ? '#f56565'
                                        : paciente.estado === 'inactivo'
                                        ? '#48bb78'
                                        : '#cbd5e0',
                                    '&:hover': {
                                      bgcolor:
                                        paciente.estado === 'activo'
                                          ? '#f5656515'
                                          : paciente.estado === 'inactivo'
                                          ? '#48bb7815'
                                          : 'transparent',
                                      transform:
                                        paciente.estado === 'activo' || paciente.estado === 'inactivo'
                                          ? 'scale(1.15)'
                                          : 'none',
                                    },
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <BlockIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Dar alta médica">
                              <IconButton
                                size="small"
                                onClick={() => handleAltaMedica(paciente)}
                                disabled={paciente.estado === 'alta'}
                                sx={{
                                  color: paciente.estado === 'alta' ? '#cbd5e0' : '#48bb78',
                                  '&:hover': {
                                    bgcolor: paciente.estado === 'alta' ? 'transparent' : '#48bb7815',
                                    transform: 'scale(1.15)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <HospitalIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          {pagination && pagination.total > 0 && (
            <TablePagination
              component="div"
              count={pagination.total}
              page={pagination.page - 1}
              onPageChange={handlePageChange}
              rowsPerPage={pagination.limit}
              onRowsPerPageChange={handleLimitChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
              sx={{
                borderTop: '1px solid #e2e8f0',
                bgcolor: '#f7fafc',
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  gap: 1,
                },
              }}
            />
          )}
        </Card>
      </motion.div>

      {/* Modal de Nuevo Paciente */}
      <NuevoPacienteModal open={modalOpen} onClose={handleModalClose} />

      {/* Modal de Detalle de Paciente */}
      <DetallePacienteModal
        open={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setPacienteSeleccionadoId(null);
        }}
        pacienteId={pacienteSeleccionadoId}
        onEdit={() => {
          setDetalleModalOpen(false);
          setEditarModalOpen(true);
        }}
      />

      {/* Modal de Editar Paciente */}
      <EditarPacienteModal
        open={editarModalOpen}
        onClose={handleEditarModalClose}
        pacienteId={pacienteSeleccionadoId}
      />

      {/* Modal de Alta Médica */}
      <AltaMedicaModal
        open={altaMedicaModalOpen}
        onClose={handleAltaMedicaClose}
        paciente={pacienteParaAlta}
      />

      <CambioEstadoPacienteModal
        open={estadoModal.open}
        paciente={estadoModal.paciente}
        onClose={handleEstadoModalClose}
        onSubmit={handleEstadoSubmit}
        loading={loading}
      />
    </Box>
  );
};

export default PacientesListPage;
