/**
 * Modal para Editar Paciente
 * Diseño moderno, futurista, profesional e interactivo
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  MenuItem,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  Slide,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Assignment as AssignmentIcon,
  ContactEmergency as EmergencyIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchPacienteById,
  updatePaciente,
  selectPacienteActual,
  selectPacientesLoading,
  clearPacienteActual,
} from '../slices/pacientesSlice';
import toast from 'react-hot-toast';

const steps = [
  { label: 'Datos Personales', icon: <PersonIcon /> },
  { label: 'Dirección', icon: <HomeIcon /> },
  { label: 'Obra Social', icon: <HospitalIcon /> },
  { label: 'Diagnóstico', icon: <AssignmentIcon /> },
  { label: 'Antecedentes', icon: <EmergencyIcon /> },
  { label: 'Contacto & Pago', icon: <PaymentIcon /> },
];

const EditarPacienteModal = ({ open, onClose, pacienteId }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const loading = useSelector(selectPacientesLoading);
  const paciente = useSelector(selectPacienteActual);

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    genero: 'no_especifica',
    telefono: '',
    telefonoAlternativo: '',
    email: '',
    direccion: {
      calle: '',
      numero: '',
      barrio: '',
      ciudad: 'San Miguel de Tucumán',
      provincia: 'Tucumán',
      codigoPostal: '',
      referencia: '',
    },
    obraSocial: {
      nombre: 'Particular',
      numeroAfiliado: '',
      plan: '',
      vigenciaDesde: '',
      vigenciaHasta: '',
    },
    diagnostico: {
      principal: '',
      secundarios: [],
      observaciones: '',
    },
    medicoDerivante: {
      nombre: '',
      matricula: '',
      telefono: '',
      especialidad: '',
    },
    antecedentes: {
      patologicos: '',
      quirurgicos: '',
      alergias: '',
      medicacion: '',
    },
    contactoEmergencia: {
      nombre: '',
      relacion: '',
      telefono: '',
    },
    estado: 'activo',
    modalidadPago: 'efectivo',
    valorSesion: 0,
    observaciones: '',
    tratamiento: {
      cantidadTotalSesiones: '',
      fechaInicio: '',
      fechaFinEstimada: '',
      observaciones: '',
    },
  });

  const [secundarioInput, setSecundarioInput] = useState('');

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (open && pacienteId) {
      cargarPaciente();
    } else if (!open) {
      dispatch(clearPacienteActual());
      setActiveStep(0);
    }
  }, [open, pacienteId, dispatch]);

  // Cargar datos en el formulario cuando se obtiene el paciente
  useEffect(() => {
    if (paciente) {
      cargarDatosEnFormulario();
    }
  }, [paciente]);

  const cargarPaciente = async () => {
    try {
      await dispatch(fetchPacienteById(pacienteId)).unwrap();
    } catch (error) {
      toast.error(error?.message || 'Error al cargar los datos del paciente');
      onClose();
    }
  };

  const cargarDatosEnFormulario = () => {
    if (!paciente) return;

    const fechaNacimiento = paciente.fechaNacimiento
      ? new Date(paciente.fechaNacimiento).toISOString().split('T')[0]
      : '';

    const vigenciaDesde = paciente.obraSocial?.vigenciaDesde
      ? new Date(paciente.obraSocial.vigenciaDesde).toISOString().split('T')[0]
      : '';

    const vigenciaHasta = paciente.obraSocial?.vigenciaHasta
      ? new Date(paciente.obraSocial.vigenciaHasta).toISOString().split('T')[0]
      : '';

    setFormData({
      nombre: paciente.nombre || '',
      apellido: paciente.apellido || '',
      dni: paciente.dni || '',
      fechaNacimiento,
      genero: paciente.genero || 'no_especifica',
      telefono: paciente.telefono || '',
      telefonoAlternativo: paciente.telefonoAlternativo || '',
      email: paciente.email || '',
      direccion: {
        calle: paciente.direccion?.calle || '',
        numero: paciente.direccion?.numero || '',
        barrio: paciente.direccion?.barrio || '',
        ciudad: paciente.direccion?.ciudad || 'San Miguel de Tucumán',
        provincia: paciente.direccion?.provincia || 'Tucumán',
        codigoPostal: paciente.direccion?.codigoPostal || '',
        referencia: paciente.direccion?.referencia || '',
      },
      obraSocial: {
        nombre: paciente.obraSocial?.nombre || 'Particular',
        numeroAfiliado: paciente.obraSocial?.numeroAfiliado || '',
        plan: paciente.obraSocial?.plan || '',
        vigenciaDesde,
        vigenciaHasta,
      },
      diagnostico: {
        principal: paciente.diagnostico?.principal || '',
        secundarios: paciente.diagnostico?.secundarios || [],
        observaciones: paciente.diagnostico?.observaciones || '',
      },
      medicoDerivante: {
        nombre: paciente.medicoDerivante?.nombre || '',
        matricula: paciente.medicoDerivante?.matricula || '',
        telefono: paciente.medicoDerivante?.telefono || '',
        especialidad: paciente.medicoDerivante?.especialidad || '',
      },
      antecedentes: {
        patologicos: paciente.antecedentes?.patologicos || '',
        quirurgicos: paciente.antecedentes?.quirurgicos || '',
        alergias: paciente.antecedentes?.alergias || '',
        medicacion: paciente.antecedentes?.medicacion || '',
      },
      contactoEmergencia: {
        nombre: paciente.contactoEmergencia?.nombre || '',
        relacion: paciente.contactoEmergencia?.relacion || '',
        telefono: paciente.contactoEmergencia?.telefono || '',
      },
      estado: paciente.estado || 'activo',
      modalidadPago: paciente.modalidadPago || 'efectivo',
      valorSesion: paciente.valorSesion || 0,
      observaciones: paciente.observaciones || '',
      tratamiento: {
        cantidadTotalSesiones: paciente.tratamiento?.cantidadTotalSesiones || '',
        fechaInicio: paciente.tratamiento?.fechaInicio
          ? new Date(paciente.tratamiento.fechaInicio).toISOString().split('T')[0]
          : '',
        fechaFinEstimada: paciente.tratamiento?.fechaFinEstimada
          ? new Date(paciente.tratamiento.fechaFinEstimada).toISOString().split('T')[0]
          : '',
        observaciones: paciente.tratamiento?.observaciones || '',
      },
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleChange = (field, value, section = null) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddSecundario = () => {
    if (secundarioInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        diagnostico: {
          ...prev.diagnostico,
          secundarios: [...prev.diagnostico.secundarios, secundarioInput.trim()],
        },
      }));
      setSecundarioInput('');
    }
  };

  const handleRemoveSecundario = (index) => {
    setFormData((prev) => ({
      ...prev,
      diagnostico: {
        ...prev.diagnostico,
        secundarios: prev.diagnostico.secundarios.filter((_, i) => i !== index),
      },
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!formData.nombre || !formData.apellido || !formData.dni || !formData.fechaNacimiento || !formData.genero || !formData.telefono) {
          toast.error('Por favor complete todos los campos obligatorios');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        valorSesion: formData.valorSesion ? parseFloat(formData.valorSesion) : 0,
      };

      // Limpiar campos vacíos pero mantener valores por defecto
      const cleanObject = (obj) => {
        const cleaned = {};
        Object.keys(obj).forEach((key) => {
          const value = obj[key];

          if (key === 'estado' && value) {
            cleaned[key] = value;
            return;
          }
          if (key === 'modalidadPago' && value) {
            cleaned[key] = value;
            return;
          }
          if (key === 'genero' && value) {
            cleaned[key] = value;
            return;
          }
          if (key === 'valorSesion' && (value !== '' && value !== null && value !== undefined)) {
            cleaned[key] = typeof value === 'number' ? value : parseFloat(value) || 0;
            return;
          }

          if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
            const cleanedNested = cleanObject(value);
            if (key === 'direccion' || key === 'obraSocial' || key === 'diagnostico' ||
                key === 'medicoDerivante' || key === 'antecedentes' || key === 'contactoEmergencia') {
              if (Object.keys(cleanedNested).length > 0 ||
                  (key === 'direccion' && (value.ciudad || value.provincia)) ||
                  (key === 'obraSocial' && value.nombre)) {
                cleaned[key] = cleanedNested;
              }
            } else if (Object.keys(cleanedNested).length > 0) {
              cleaned[key] = cleanedNested;
            }
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              cleaned[key] = value;
            }
          } else if (value !== '' && value !== null && value !== undefined) {
            cleaned[key] = value;
          }
        });
        return cleaned;
      };

      const cleanedData = cleanObject(dataToSend);

      // Asegurar valores por defecto
      if (!cleanedData.estado) cleanedData.estado = 'activo';
      if (!cleanedData.modalidadPago) cleanedData.modalidadPago = 'efectivo';
      if (cleanedData.valorSesion === undefined || cleanedData.valorSesion === null) {
        cleanedData.valorSesion = 0;
      }
      if (!cleanedData.genero) cleanedData.genero = 'no_especifica';

      if (cleanedData.direccion) {
        if (!cleanedData.direccion.ciudad) cleanedData.direccion.ciudad = 'San Miguel de Tucumán';
        if (!cleanedData.direccion.provincia) cleanedData.direccion.provincia = 'Tucumán';
      }

      if (cleanedData.obraSocial) {
        if (!cleanedData.obraSocial.nombre) cleanedData.obraSocial.nombre = 'Particular';
      }

      if (cleanedData.diagnostico && cleanedData.diagnostico.secundarios && cleanedData.diagnostico.secundarios.length === 0) {
        delete cleanedData.diagnostico.secundarios;
      }

      // Procesar tratamiento: convertir cantidadTotalSesiones a número y fechas a formato ISO
      if (cleanedData.tratamiento) {
        if (cleanedData.tratamiento.cantidadTotalSesiones) {
          cleanedData.tratamiento.cantidadTotalSesiones = parseInt(cleanedData.tratamiento.cantidadTotalSesiones) || 0;
        }
        if (cleanedData.tratamiento.fechaInicio) {
          // Convertir fecha YYYY-MM-DD a ISO string en UTC (00:00:00.000Z)
          const fechaInicio = new Date(cleanedData.tratamiento.fechaInicio + 'T00:00:00.000Z');
          if (!isNaN(fechaInicio.getTime())) {
            cleanedData.tratamiento.fechaInicio = fechaInicio.toISOString();
          }
        }
        if (cleanedData.tratamiento.fechaFinEstimada) {
          // Convertir fecha YYYY-MM-DD a ISO string en UTC (00:00:00.000Z)
          const fechaFin = new Date(cleanedData.tratamiento.fechaFinEstimada + 'T00:00:00.000Z');
          if (!isNaN(fechaFin.getTime())) {
            cleanedData.tratamiento.fechaFinEstimada = fechaFin.toISOString();
          }
        }
        // Si tratamiento está vacío, eliminarlo
        if (!cleanedData.tratamiento.cantidadTotalSesiones && !cleanedData.tratamiento.fechaInicio && 
            !cleanedData.tratamiento.fechaFinEstimada && !cleanedData.tratamiento.observaciones) {
          delete cleanedData.tratamiento;
        }
      }

      await dispatch(updatePaciente({ id: pacienteId, datos: cleanedData })).unwrap();
      toast.success('¡Paciente actualizado exitosamente!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      toast.error(error?.message || 'Error al actualizar el paciente');
    }
  };

  const handleCloseModal = () => {
    if (!loading) {
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido *"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DNI *"
                value={formData.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                required
                inputProps={{ maxLength: 8 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento *"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Género *"
                value={formData.genero}
                onChange={(e) => handleChange('genero', e.target.value)}
                required
              >
                <MenuItem value="masculino">Masculino</MenuItem>
                <MenuItem value="femenino">Femenino</MenuItem>
                <MenuItem value="otro">Otro</MenuItem>
                <MenuItem value="no_especifica">No Especifica</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono *"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono Alternativo"
                value={formData.telefonoAlternativo}
                onChange={(e) => handleChange('telefonoAlternativo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Calle"
                value={formData.direccion.calle}
                onChange={(e) => handleChange('calle', e.target.value, 'direccion')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Número"
                value={formData.direccion.numero}
                onChange={(e) => handleChange('numero', e.target.value, 'direccion')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Barrio"
                value={formData.direccion.barrio}
                onChange={(e) => handleChange('barrio', e.target.value, 'direccion')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ciudad"
                value={formData.direccion.ciudad}
                onChange={(e) => handleChange('ciudad', e.target.value, 'direccion')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provincia"
                value={formData.direccion.provincia}
                onChange={(e) => handleChange('provincia', e.target.value, 'direccion')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Código Postal"
                value={formData.direccion.codigoPostal}
                onChange={(e) => handleChange('codigoPostal', e.target.value, 'direccion')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Referencia"
                multiline
                rows={2}
                value={formData.direccion.referencia}
                onChange={(e) => handleChange('referencia', e.target.value, 'direccion')}
                placeholder="Ej: Entre Maipú y Muñecas"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de Obra Social"
                value={formData.obraSocial.nombre}
                onChange={(e) => handleChange('nombre', e.target.value, 'obraSocial')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Afiliado"
                value={formData.obraSocial.numeroAfiliado}
                onChange={(e) => handleChange('numeroAfiliado', e.target.value, 'obraSocial')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plan"
                value={formData.obraSocial.plan}
                onChange={(e) => handleChange('plan', e.target.value, 'obraSocial')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vigencia Desde"
                type="date"
                value={formData.obraSocial.vigenciaDesde}
                onChange={(e) => handleChange('vigenciaDesde', e.target.value, 'obraSocial')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vigencia Hasta"
                type="date"
                value={formData.obraSocial.vigenciaHasta}
                onChange={(e) => handleChange('vigenciaHasta', e.target.value, 'obraSocial')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnóstico Principal"
                value={formData.diagnostico.principal}
                onChange={(e) => handleChange('principal', e.target.value, 'diagnostico')}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Diagnósticos Secundarios
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {formData.diagnostico.secundarios.map((sec, index) => (
                    <Chip
                      key={index}
                      label={sec}
                      onDelete={() => handleRemoveSecundario(index)}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Agregar diagnóstico secundario"
                    value={secundarioInput}
                    onChange={(e) => setSecundarioInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSecundario();
                      }
                    }}
                  />
                  <Button variant="outlined" onClick={handleAddSecundario}>
                    Agregar
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={3}
                value={formData.diagnostico.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value, 'diagnostico')}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Médico Derivante
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.medicoDerivante.nombre}
                onChange={(e) => handleChange('nombre', e.target.value, 'medicoDerivante')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Matrícula"
                value={formData.medicoDerivante.matricula}
                onChange={(e) => handleChange('matricula', e.target.value, 'medicoDerivante')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.medicoDerivante.telefono}
                onChange={(e) => handleChange('telefono', e.target.value, 'medicoDerivante')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Especialidad"
                value={formData.medicoDerivante.especialidad}
                onChange={(e) => handleChange('especialidad', e.target.value, 'medicoDerivante')}
              />
            </Grid>
          </Grid>
        );

      case 4:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Antecedentes Patológicos"
                multiline
                rows={2}
                value={formData.antecedentes.patologicos}
                onChange={(e) => handleChange('patologicos', e.target.value, 'antecedentes')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Antecedentes Quirúrgicos"
                multiline
                rows={2}
                value={formData.antecedentes.quirurgicos}
                onChange={(e) => handleChange('quirurgicos', e.target.value, 'antecedentes')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alergias"
                multiline
                rows={2}
                value={formData.antecedentes.alergias}
                onChange={(e) => handleChange('alergias', e.target.value, 'antecedentes')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medicación Actual"
                multiline
                rows={2}
                value={formData.antecedentes.medicacion}
                onChange={(e) => handleChange('medicacion', e.target.value, 'antecedentes')}
              />
            </Grid>
          </Grid>
        );

      case 5:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Contacto de Emergencia
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={formData.contactoEmergencia.nombre}
                onChange={(e) => handleChange('nombre', e.target.value, 'contactoEmergencia')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relación"
                value={formData.contactoEmergencia.relacion}
                onChange={(e) => handleChange('relacion', e.target.value, 'contactoEmergencia')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.contactoEmergencia.telefono}
                onChange={(e) => handleChange('telefono', e.target.value, 'contactoEmergencia')}
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Información de Pago
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Estado"
                value={formData.estado}
                onChange={(e) => handleChange('estado', e.target.value)}
              >
                <MenuItem value="activo">Activo</MenuItem>
                <MenuItem value="inactivo">Inactivo</MenuItem>
                <MenuItem value="alta">Con Alta</MenuItem>
                <MenuItem value="derivado">Derivado</MenuItem>
                <MenuItem value="abandono">Abandono</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Modalidad de Pago"
                value={formData.modalidadPago}
                onChange={(e) => handleChange('modalidadPago', e.target.value)}
              >
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="transferencia">Transferencia</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="obra_social">Obra Social</MenuItem>
                <MenuItem value="mixto">Mixto</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Valor de Sesión"
                type="number"
                value={formData.valorSesion}
                onChange={(e) => handleChange('valorSesion', e.target.value || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                inputProps={{
                  min: 0,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones Generales"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value)}
                placeholder="Ej: Prefiere turno por la mañana"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Información de Tratamiento
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cantidad Total de Sesiones"
                type="number"
                value={formData.tratamiento.cantidadTotalSesiones}
                onChange={(e) => handleChange('cantidadTotalSesiones', e.target.value, 'tratamiento')}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Inicio"
                type="date"
                value={formData.tratamiento.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value, 'tratamiento')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha Fin Estimada"
                type="date"
                value={formData.tratamiento.fechaFinEstimada}
                onChange={(e) => handleChange('fechaFinEstimada', e.target.value, 'tratamiento')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones del Tratamiento"
                multiline
                rows={3}
                value={formData.tratamiento.observaciones}
                onChange={(e) => handleChange('observaciones', e.target.value, 'tratamiento')}
                placeholder="Ej: Tratamiento de rehabilitación para lumbalgia crónica. Sesiones 2 veces por semana."
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="md"
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
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' }}
    >
      <DialogTitle
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          {paciente && (
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                width: 56,
                height: 56,
                fontSize: '1.5rem',
                fontWeight: 700,
                border: '2px solid rgba(255,255,255,0.3)',
              }}
            >
              {paciente.nombre?.charAt(0)}
              {paciente.apellido?.charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Editar Paciente
            </Typography>
            {paciente && (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                {paciente.nombreCompleto || `${paciente.nombre} ${paciente.apellido}`}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          onClick={handleCloseModal}
          disabled={loading}
          sx={{
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            position: 'relative',
            zIndex: 1,
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, background: '#f7fafc' }}>
        {loading && !paciente ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: index <= activeStep ? '#667eea' : '#e2e8f0',
                          color: index <= activeStep ? 'white' : '#a0aec0',
                          transition: 'all 0.3s ease',
                          boxShadow: index <= activeStep ? '0 4px 12px rgba(102,126,234,0.4)' : 'none',
                        }}
                      >
                        {index < activeStep ? <CheckCircleIcon /> : step.icon}
                      </Box>
                    )}
                  >
                    <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid #e2e8f0',
          background: 'white',
        }}
      >
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Atrás
        </Button>
        <Box sx={{ flex: 1 }} />
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1,
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4093 100%)',
                boxShadow: '0 6px 16px rgba(102,126,234,0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
              py: 1,
              boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4093 100%)',
                boxShadow: '0 6px 16px rgba(102,126,234,0.5)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditarPacienteModal;

