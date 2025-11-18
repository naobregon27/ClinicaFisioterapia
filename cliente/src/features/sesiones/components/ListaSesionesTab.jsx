/**
 * Componente Lista de Todas las Sesiones
 * Muestra todas las sesiones ordenadas por fecha (menor a mayor)
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import sesionService from '../../../services/sesionService';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import DetalleSesionModal from './DetalleSesionModal';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const ListaSesionesTab = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [pagination, setPagination] = useState(null);
  const [detalleModal, setDetalleModal] = useState({ open: false, sesionId: null });
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarSesiones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, busqueda]);

  const cargarSesiones = async () => {
    try {
      setLoading(true);
      const filtros = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: 'fecha',
      };
      
      // Agregar búsqueda si existe
      if (busqueda.trim()) {
        filtros.busqueda = busqueda.trim();
      }
      
      const response = await sesionService.obtenerSesiones(filtros);
      
      if (response.success && response.data) {
        // Ordenar por fecha de menor a mayor (más antiguas primero)
        const sesionesOrdenadas = [...response.data].sort((a, b) => {
          const fechaA = new Date(a.fecha);
          const fechaB = new Date(b.fecha);
          return fechaA - fechaB;
        });
        setSesiones(sesionesOrdenadas);
        setPagination(response.pagination);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar sesiones');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        setBusqueda(searchTerm);
        setPage(0);
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handleVerDetalle = (sesionId) => {
    setDetalleModal({ open: true, sesionId });
  };

  const handleDetalleClose = () => {
    setDetalleModal({ open: false, sesionId: null });
  };

  const handleSesionActualizada = () => {
    cargarSesiones();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <>
      {/* Buscador */}
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
        <TextField
          placeholder="Buscar por fecha, paciente, DNI, obra social..."
          fullWidth
          value={busqueda}
          onChange={handleSearchChange}
          sx={{
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
      </Card>

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
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      )}
      
      {loading && sesiones.length === 0 ? (
        <Box sx={{ py: 6 }}>
          <LoadingSpinner />
        </Box>
      ) : sesiones.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
          <ScheduleIcon sx={{ fontSize: 64, color: '#cbd5e0', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No hay sesiones registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Las sesiones aparecerán aquí una vez que sean registradas
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              maxHeight: { xs: 'calc(100vh - 400px)', md: 'calc(100vh - 350px)' },
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
                  <TableCell>Fecha</TableCell>
                  <TableCell>Paciente</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>DNI</TableCell>
                      <TableCell>Obra Social</TableCell>
                    </>
                  )}
                  <TableCell>Hora</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell>Duración</TableCell>
                      <TableCell>N° Sesión</TableCell>
                    </>
                  )}
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Pago</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sesiones.map((sesion, index) => {
                  const estadoColor = getEstadoColor(sesion.estado);
                  return (
                    <TableRow
                      key={sesion._id || sesion.id}
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sesion.fecha
                            ? format(new Date(sesion.fecha), "dd 'de' MMMM 'de' yyyy", {
                                locale: es,
                              })
                            : '-'}
                        </Typography>
                        {sesion.fecha && (
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(sesion.fecha), 'EEEE', { locale: es })}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: '#667eea',
                              width: 32,
                              height: 32,
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            {sesion.paciente?.nombre?.charAt(0) || ''}
                            {sesion.paciente?.apellido?.charAt(0) || ''}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                              }}
                            >
                              {sesion.paciente?.nombreCompleto ||
                                `${sesion.paciente?.nombre || ''} ${sesion.paciente?.apellido || ''}`}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>{sesion.paciente?.dni || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={sesion.paciente?.obraSocial?.nombre || 'Particular'}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: '0.75rem',
                                borderColor: '#667eea',
                                color: '#667eea',
                              }}
                            />
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sesion.horaEntrada || '-'}
                        </Typography>
                        {sesion.horaSalida && (
                          <Typography variant="caption" color="text.secondary">
                            Salida: {sesion.horaSalida}
                          </Typography>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>
                            {sesion.duracion ? `${sesion.duracion} min` : '-'}
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: '#667eea',
                              }}
                            >
                              #{sesion.numeroSesion || sesion.numeroOrden || '-'}
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ${(sesion.pago?.monto || 0).toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={
                            sesion.pago?.pagado ? (
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <CancelIcon sx={{ fontSize: 16 }} />
                            )
                          }
                          label={sesion.pago?.pagado ? 'Pagado' : 'Pendiente'}
                          size="small"
                          sx={{
                            bgcolor: sesion.pago?.pagado ? '#48bb78' : '#f6ad55',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.75rem',
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
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => handleVerDetalle(sesion._id || sesion.id)}
                            sx={{
                              color: '#667eea',
                              '&:hover': {
                                bgcolor: '#667eea15',
                                transform: 'scale(1.15)',
                              },
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginación */}
          {pagination && pagination.total > 0 && (
            <TablePagination
              component="div"
              count={pagination.total}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
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
        </>
      )}
    </Card>

    {/* Modal de Detalle de Sesión */}
    <DetalleSesionModal
      open={detalleModal.open}
      onClose={handleDetalleClose}
      sesionId={detalleModal.sesionId}
      onUpdate={handleSesionActualizada}
    />
    </>
  );
};

export default ListaSesionesTab;

