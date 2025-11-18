/**
 * Modal de Detalle de Paciente
 * Diseño moderno, futurista, profesional e interactivo
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Tabs,
  Tab,
  Fade,
  Zoom,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  ContactEmergency as EmergencyIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Badge as BadgeIcon,
  LocalPhone as LocalPhoneIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  MedicalServices as MedicalIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  fetchPacienteById,
  selectPacienteActual,
  selectPacientesLoading,
  clearPacienteActual,
} from '../slices/pacientesSlice';
import LoadingSpinner from '../../../shared/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const DetallePacienteModal = ({ open, onClose, pacienteId, onEdit }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loading = useSelector(selectPacientesLoading);
  const paciente = useSelector(selectPacienteActual);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (open && pacienteId) {
      cargarDetalle();
      setActiveTab(0);
    } else if (!open) {
      dispatch(clearPacienteActual());
    }
  }, [open, pacienteId, dispatch]);

  const cargarDetalle = async () => {
    try {
      await dispatch(fetchPacienteById(pacienteId)).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Error al cargar los detalles del paciente');
      onClose();
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      activo: '#48bb78',
      inactivo: '#a0aec0',
      alta: '#667eea',
      derivado: '#f6ad55',
      abandono: '#f56565',
    };
    return colors[estado] || '#667eea';
  };

  const getGeneroLabel = (genero) => {
    const labels = {
      masculino: 'Masculino',
      femenino: 'Femenino',
      otro: 'Otro',
      no_especifica: 'No Especifica',
    };
    return labels[genero] || genero;
  };

  const getModalidadPagoLabel = (modalidad) => {
    const labels = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      obra_social: 'Obra Social',
      mixto: 'Mixto',
    };
    return labels[modalidad] || modalidad;
  };

  const InfoCard = ({ title, icon, children, color = '#667eea', delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,250,252,0.9) 100%)',
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2.5,
              pb: 2,
              borderBottom: `2px solid ${color}20`,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: `0 4px 12px ${color}40`,
              }}
            >
              {icon}
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#2d3748',
                fontSize: '1.1rem',
              }}
            >
              {title}
            </Typography>
          </Box>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );

  const InfoRow = ({ label, value, icon, color = '#667eea' }) => (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.5)',
          transition: 'all 0.2s ease',
          '&:hover': {
            background: `${color}08`,
            transform: 'translateX(4px)',
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            display: 'block',
            mb: 1,
          }}
        >
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                color,
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#2d3748',
              fontSize: '0.95rem',
            }}
          >
            {value || '-'}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );

  const StatCard = ({ value, label, color, icon }) => (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `2px solid ${color}30`,
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: `${color}60`,
            boxShadow: `0 8px 24px ${color}25`,
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            boxShadow: `0 4px 12px ${color}40`,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color,
            mb: 0.5,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          {value}
        </Typography>
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
          {label}
        </Typography>
      </Paper>
    </motion.div>
  );

  const tabs = [
    { label: 'Información General', icon: <InfoIcon /> },
    { label: 'Médica', icon: <MedicalIcon /> },
    { label: 'Historial', icon: <HistoryIcon /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Información General
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoCard title="Datos Personales" icon={<PersonIcon sx={{ color: 'white', fontSize: 24 }} />} color="#667eea" delay={0.1}>
                <InfoRow label="Nombre" value={paciente.nombre} color="#667eea" />
                <InfoRow label="Apellido" value={paciente.apellido} color="#667eea" />
                <InfoRow
                  label="DNI"
                  value={paciente.dni}
                  icon={<BadgeIcon />}
                  color="#667eea"
                />
                <InfoRow
                  label="Fecha de Nacimiento"
                  value={
                    paciente.fechaNacimiento
                      ? format(new Date(paciente.fechaNacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })
                      : '-'
                  }
                  icon={<CalendarIcon />}
                  color="#667eea"
                />
                <InfoRow
                  label="Edad"
                  value={paciente.edadCalculada || paciente.edad ? `${paciente.edadCalculada || paciente.edad} años` : '-'}
                  color="#667eea"
                />
                <InfoRow label="Género" value={getGeneroLabel(paciente.genero)} color="#667eea" />
                <InfoRow
                  label="Teléfono"
                  value={paciente.telefono}
                  icon={<PhoneIcon />}
                  color="#667eea"
                />
                {paciente.telefonoAlternativo && (
                  <InfoRow
                    label="Teléfono Alternativo"
                    value={paciente.telefonoAlternativo}
                    icon={<LocalPhoneIcon />}
                    color="#667eea"
                  />
                )}
                {paciente.email && (
                  <InfoRow
                    label="Email"
                    value={paciente.email}
                    icon={<EmailIcon />}
                    color="#667eea"
                  />
                )}
              </InfoCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <InfoCard title="Dirección" icon={<HomeIcon sx={{ color: 'white', fontSize: 24 }} />} color="#48bb78" delay={0.2}>
                {paciente.direccion ? (
                  <>
                    <InfoRow
                      label="Calle y Número"
                      value={
                        paciente.direccion.calle && paciente.direccion.numero
                          ? `${paciente.direccion.calle} ${paciente.direccion.numero}`
                          : paciente.direccion.calle || paciente.direccion.numero || '-'
                      }
                      color="#48bb78"
                    />
                    <InfoRow label="Barrio" value={paciente.direccion.barrio} color="#48bb78" />
                    <InfoRow label="Ciudad" value={paciente.direccion.ciudad} color="#48bb78" />
                    <InfoRow label="Provincia" value={paciente.direccion.provincia} color="#48bb78" />
                    <InfoRow label="Código Postal" value={paciente.direccion.codigoPostal} color="#48bb78" />
                    {paciente.direccion.referencia && (
                      <InfoRow label="Referencia" value={paciente.direccion.referencia} color="#48bb78" />
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay dirección registrada
                  </Typography>
                )}
              </InfoCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <InfoCard title="Obra Social" icon={<HospitalIcon sx={{ color: 'white', fontSize: 24 }} />} color="#f6ad55" delay={0.3}>
                {paciente.obraSocial ? (
                  <>
                    <InfoRow label="Nombre" value={paciente.obraSocial.nombre} color="#f6ad55" />
                    <InfoRow label="Número de Afiliado" value={paciente.obraSocial.numeroAfiliado} color="#f6ad55" />
                    <InfoRow label="Plan" value={paciente.obraSocial.plan} color="#f6ad55" />
                    {paciente.obraSocial.vigenciaDesde && (
                      <InfoRow
                        label="Vigencia Desde"
                        value={format(new Date(paciente.obraSocial.vigenciaDesde), 'dd/MM/yyyy', { locale: es })}
                        color="#f6ad55"
                      />
                    )}
                    {paciente.obraSocial.vigenciaHasta && (
                      <InfoRow
                        label="Vigencia Hasta"
                        value={format(new Date(paciente.obraSocial.vigenciaHasta), 'dd/MM/yyyy', { locale: es })}
                        color="#f6ad55"
                      />
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay obra social registrada
                  </Typography>
                )}
              </InfoCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <InfoCard title="Información de Pago" icon={<PaymentIcon sx={{ color: 'white', fontSize: 24 }} />} color="#f56565" delay={0.4}>
                <InfoRow label="Modalidad de Pago" value={getModalidadPagoLabel(paciente.modalidadPago)} color="#f56565" />
                <InfoRow
                  label="Valor de Sesión"
                  value={paciente.valorSesion ? `$${paciente.valorSesion.toLocaleString()}` : '$0'}
                  icon={<MoneyIcon />}
                  color="#f56565"
                />
                {paciente.observaciones && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#f5656510', border: '1px solid #f5656530' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}>
                      Observaciones
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                      {paciente.observaciones}
                    </Typography>
                  </Box>
                )}
              </InfoCard>
            </Grid>
          </Grid>
        );

      case 1: // Médica
        return (
          <Grid container spacing={3}>
            {paciente.diagnostico && (
              <Grid item xs={12} md={6}>
                <InfoCard title="Diagnóstico" icon={<AssignmentIcon sx={{ color: 'white', fontSize: 24 }} />} color="#9f7aea" delay={0.1}>
                  <InfoRow label="Diagnóstico Principal" value={paciente.diagnostico.principal} color="#9f7aea" />
                  {paciente.diagnostico.secundarios && paciente.diagnostico.secundarios.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 1.5,
                        }}
                      >
                        Diagnósticos Secundarios
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {paciente.diagnostico.secundarios.map((sec, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Chip
                              label={sec}
                              size="medium"
                              sx={{
                                bgcolor: '#9f7aea20',
                                color: '#9f7aea',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                border: '1px solid #9f7aea40',
                                '&:hover': {
                                  bgcolor: '#9f7aea30',
                                },
                              }}
                            />
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>
                  )}
                  {paciente.diagnostico.observaciones && (
                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#9f7aea10', border: '1px solid #9f7aea30' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 1,
                        }}
                      >
                        Observaciones
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                        {paciente.diagnostico.observaciones}
                      </Typography>
                    </Box>
                  )}
                </InfoCard>
              </Grid>
            )}

            {paciente.medicoDerivante && Object.values(paciente.medicoDerivante).some((v) => v) && (
              <Grid item xs={12} md={6}>
                <InfoCard title="Médico Derivante" icon={<HospitalIcon sx={{ color: 'white', fontSize: 24 }} />} color="#ed8936" delay={0.2}>
                  <InfoRow label="Nombre" value={paciente.medicoDerivante.nombre} color="#ed8936" />
                  <InfoRow label="Matrícula" value={paciente.medicoDerivante.matricula} color="#ed8936" />
                  <InfoRow label="Especialidad" value={paciente.medicoDerivante.especialidad} color="#ed8936" />
                  {paciente.medicoDerivante.telefono && (
                    <InfoRow
                      label="Teléfono"
                      value={paciente.medicoDerivante.telefono}
                      icon={<PhoneIcon />}
                      color="#ed8936"
                    />
                  )}
                </InfoCard>
              </Grid>
            )}

            {paciente.antecedentes && Object.values(paciente.antecedentes).some((v) => v) && (
              <Grid item xs={12} md={6}>
                <InfoCard title="Antecedentes" icon={<EmergencyIcon sx={{ color: 'white', fontSize: 24 }} />} color="#38b2ac" delay={0.3}>
                  <InfoRow label="Patológicos" value={paciente.antecedentes.patologicos} color="#38b2ac" />
                  <InfoRow label="Quirúrgicos" value={paciente.antecedentes.quirurgicos} color="#38b2ac" />
                  <InfoRow label="Alergias" value={paciente.antecedentes.alergias} color="#38b2ac" />
                  <InfoRow label="Medicación" value={paciente.antecedentes.medicacion} color="#38b2ac" />
                </InfoCard>
              </Grid>
            )}

            {paciente.contactoEmergencia && Object.values(paciente.contactoEmergencia).some((v) => v) && (
              <Grid item xs={12} md={6}>
                <InfoCard title="Contacto de Emergencia" icon={<EmergencyIcon sx={{ color: 'white', fontSize: 24 }} />} color="#e53e3e" delay={0.4}>
                  <InfoRow label="Nombre" value={paciente.contactoEmergencia.nombre} color="#e53e3e" />
                  <InfoRow label="Relación" value={paciente.contactoEmergencia.relacion} color="#e53e3e" />
                  {paciente.contactoEmergencia.telefono && (
                    <InfoRow
                      label="Teléfono"
                      value={paciente.contactoEmergencia.telefono}
                      icon={<PhoneIcon />}
                      color="#e53e3e"
                    />
                  )}
                </InfoCard>
              </Grid>
            )}

            {paciente.tratamiento && Object.values(paciente.tratamiento).some((v) => v) && (
              <Grid item xs={12} md={6}>
                <InfoCard title="Tratamiento" icon={<MedicalIcon sx={{ color: 'white', fontSize: 24 }} />} color="#805ad5" delay={0.5}>
                  {paciente.tratamiento.cantidadTotalSesiones && (
                    <InfoRow
                      label="Cantidad Total de Sesiones"
                      value={paciente.tratamiento.cantidadTotalSesiones}
                      color="#805ad5"
                    />
                  )}
                  {paciente.tratamiento.fechaInicio && (
                    <InfoRow
                      label="Fecha de Inicio"
                      value={format(new Date(paciente.tratamiento.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      icon={<CalendarIcon />}
                      color="#805ad5"
                    />
                  )}
                  {paciente.tratamiento.fechaFinEstimada && (
                    <InfoRow
                      label="Fecha Fin Estimada"
                      value={format(new Date(paciente.tratamiento.fechaFinEstimada), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      icon={<CalendarIcon />}
                      color="#805ad5"
                    />
                  )}
                  {paciente.tratamiento.observaciones && (
                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: '#805ad510', border: '1px solid #805ad530' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          display: 'block',
                          mb: 1,
                        }}
                      >
                        Observaciones
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#2d3748', fontWeight: 500 }}>
                        {paciente.tratamiento.observaciones}
                      </Typography>
                    </Box>
                  )}
                </InfoCard>
              </Grid>
            )}
          </Grid>
        );

      case 2: // Historial
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <InfoCard title="Estadísticas" icon={<TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />} color="#667eea" delay={0.1}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      value={paciente.estadisticas?.totalSesiones || 0}
                      label="Total Sesiones"
                      color="#667eea"
                      icon={<CalendarIcon sx={{ color: 'white', fontSize: 28 }} />}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      value={`$${(paciente.estadisticas?.totalAbonado || 0).toLocaleString()}`}
                      label="Total Abonado"
                      color="#48bb78"
                      icon={<MoneyIcon sx={{ color: 'white', fontSize: 28 }} />}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      value={`$${(paciente.estadisticas?.saldoPendiente || 0).toLocaleString()}`}
                      label="Saldo Pendiente"
                      color="#f56565"
                      icon={<TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard
                      value={
                        paciente.estadisticas?.ultimaSesion
                          ? format(new Date(paciente.estadisticas.ultimaSesion), 'dd/MM/yyyy', { locale: es })
                          : '-'
                      }
                      label="Última Sesión"
                      color="#f6ad55"
                      icon={<HistoryIcon sx={{ color: 'white', fontSize: 28 }} />}
                    />
                  </Grid>
                </Grid>
              </InfoCard>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 3,
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
                  border: '1px solid rgba(102,126,234,0.2)',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Creado por
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                    {paciente.creadoPor?.nombreCompleto ||
                      `${paciente.creadoPor?.nombre || ''} ${paciente.creadoPor?.apellido || ''}`.trim() ||
                      'Sistema'}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Fecha de Alta
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                    {paciente.fechaAlta
                      ? format(new Date(paciente.fechaAlta), "d 'de' MMMM 'de' yyyy", { locale: es })
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (!paciente && !loading) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
          maxHeight: isMobile ? '100vh' : '90vh',
          overflow: 'hidden',
        },
      }}
      TransitionComponent={motion.div}
      TransitionProps={{
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 },
        transition: { duration: 0.3 },
      }}
    >
      {loading ? (
        <Box sx={{ p: 6, textAlign: 'center', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner />
        </Box>
      ) : paciente ? (
        <>
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              p: 0,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flex: 1 }}>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      width: 72,
                      height: 72,
                      fontSize: '2rem',
                      fontWeight: 700,
                      border: '3px solid rgba(255,255,255,0.3)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}
                  >
                    {paciente.nombre?.charAt(0)}
                    {paciente.apellido?.charAt(0)}
                  </Avatar>
                </motion.div>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '1.3rem', sm: '1.5rem' },
                      textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                  >
                    {paciente.nombreCompleto || `${paciente.nombre} ${paciente.apellido}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Chip
                        label={paciente.estado}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                    </motion.div>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.95)',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                      }}
                    >
                      DNI: {paciente.dni}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onEdit && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      onClick={() => {
                        onClose();
                        onEdit();
                      }}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.3)',
                          transform: 'rotate(15deg)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={onClose}
                    sx={{
                      color: 'white',
                      bgcolor: 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        transform: 'rotate(90deg)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </motion.div>
              </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)', px: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    minHeight: 56,
                    '&.Mui-selected': {
                      color: 'white',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 3, overflowY: 'auto', background: '#f7fafc' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </DialogContent>
        </>
      ) : null}
    </Dialog>
  );
};

export default DetallePacienteModal;
