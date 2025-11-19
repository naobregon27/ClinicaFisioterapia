/**
 * Componente Lista de Pacientes para Sesiones
 * Muestra lista de pacientes con nombre, apellido, DNI y fecha de nacimiento
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import pacienteService from '../../../services/pacienteService';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import DetallePacienteSesionesModal from './DetallePacienteSesionesModal';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

const ListaPacientesSesiones = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pacientes, setPacientes] = useState([]);
  const [pacientesFiltrados, setPacientesFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarPacientes();
  }, []);

  useEffect(() => {
    filtrarPacientes();
  }, [busqueda, pacientes]);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const response = await pacienteService.obtenerPacientes({ limit: 100 });
      if (response.success && response.data) {
        setPacientes(response.data);
        setPacientesFiltrados(response.data);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error al cargar pacientes');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPacientes = () => {
    if (!busqueda.trim()) {
      setPacientesFiltrados(pacientes);
      return;
    }

    const termino = busqueda.toLowerCase().trim();
    const filtrados = pacientes.filter((paciente) => {
      const nombreCompleto = `${paciente.nombre || ''} ${paciente.apellido || ''}`.toLowerCase();
      const dni = paciente.dni?.toLowerCase() || '';
      const email = paciente.email?.toLowerCase() || '';
      const telefono = paciente.telefono?.toLowerCase() || '';
      const obraSocial = paciente.obraSocial?.nombre?.toLowerCase() || '';

      return (
        nombreCompleto.includes(termino) ||
        dni.includes(termino) ||
        email.includes(termino) ||
        telefono.includes(termino) ||
        obraSocial.includes(termino)
      );
    });

    setPacientesFiltrados(filtrados);
  };

  // Debounced search
  const debouncedSearch = React.useMemo(
    () =>
      debounce((searchTerm) => {
        setBusqueda(searchTerm);
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  const handlePacienteClick = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setPacienteSeleccionado(null);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const fecha = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad;
  };

  if (loading) {
    return (
      <Box sx={{ py: 6 }}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box>
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
          placeholder="Buscar por nombre, apellido, DNI, teléfono, email, obra social..."
          fullWidth
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

      {pacientesFiltrados.length === 0 && !loading ? (
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
          }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No se encontraron pacientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No hay pacientes registrados en el sistema
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {pacientesFiltrados.map((paciente, index) => {
            const edad = calcularEdad(paciente.fechaNacimiento);
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={paciente._id || paciente.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    elevation={3}
                    onClick={() => handlePacienteClick(paciente)}
                    sx={{
                      borderRadius: 3,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
                      border: '1px solid #e2e8f0',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                        borderColor: '#0d4d61',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#0d4d61',
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 },
                            fontSize: { xs: '1.2rem', sm: '1.4rem' },
                            fontWeight: 600,
                          }}
                        >
                          {paciente.nombre?.charAt(0) || ''}
                          {paciente.apellido?.charAt(0) || ''}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: '#2d3748',
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {paciente.nombre} {paciente.apellido}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.85rem',
                              mb: 0.5,
                            }}
                          >
                            DNI: {paciente.dni}
                          </Typography>
                          {paciente.fechaNacimiento && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.75rem',
                              }}
                            >
                              {format(new Date(paciente.fechaNacimiento), "dd 'de' MMMM 'de' yyyy", {
                                locale: es,
                              })}
                              {edad && ` (${edad} años)`}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal de Detalle de Paciente */}
      <DetallePacienteSesionesModal
        open={modalOpen}
        onClose={handleModalClose}
        paciente={pacienteSeleccionado}
      />
    </Box>
  );
};

export default ListaPacientesSesiones;

