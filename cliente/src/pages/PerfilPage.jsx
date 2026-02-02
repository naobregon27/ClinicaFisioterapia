/**
 * Página de Perfil de Usuario
 * Permite ver y editar información personal del usuario
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedIcon,
  AdminPanelSettings as AdminIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  selectUser,
  selectAuthLoading,
  selectAuthError,
  updateProfile,
  clearError,
  clearSuccessMessage,
} from '../features/auth/slices/authSlice';

const PerfilPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    direccion: {
      calle: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      pais: 'Argentina',
    },
  });
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos del usuario al montar
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: {
          calle: user.direccion?.calle || '',
          ciudad: user.direccion?.ciudad || '',
          provincia: user.direccion?.provincia || '',
          codigoPostal: user.direccion?.codigoPostal || '',
          pais: user.direccion?.pais || 'Argentina',
        },
      });
    }
  }, [user]);

  // Mostrar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('direccion.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        direccion: {
          ...prev.direccion,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre)) {
      errors.nombre = 'El nombre solo puede contener letras';
    }

    // Validar apellido
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.apellido)) {
      errors.apellido = 'El apellido solo puede contener letras';
    }

    // Validar teléfono (opcional)
    if (formData.telefono && !/^\+?\d{10,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      errors.telefono = 'El teléfono debe ser válido (ej: +5491123456789)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
      dispatch(clearSuccessMessage());
    } catch (err) {
      // El error ya se maneja en el useEffect
    }
  };

  const handleCancel = () => {
    // Restaurar datos originales
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        direccion: {
          calle: user.direccion?.calle || '',
          ciudad: user.direccion?.ciudad || '',
          provincia: user.direccion?.provincia || '',
          codigoPostal: user.direccion?.codigoPostal || '',
          pais: user.direccion?.pais || 'Argentina',
        },
      });
    }
    setFormErrors({});
    setIsEditing(false);
  };

  const getRolLabel = (rol) => {
    const roles = {
      administrador: { label: 'Administrador', color: 'error', icon: <AdminIcon fontSize="small" /> },
      empleado: { label: 'Empleado', color: 'primary', icon: <WorkIcon fontSize="small" /> },
      usuario: { label: 'Usuario', color: 'default', icon: <PersonIcon fontSize="small" /> },
    };
    return roles[rol] || roles.usuario;
  };

  const getEstadoLabel = (estado) => {
    const estados = {
      activo: { label: 'Activo', color: 'success' },
      inactivo: { label: 'Inactivo', color: 'default' },
      suspendido: { label: 'Suspendido', color: 'error' },
      pendiente_verificacion: { label: 'Pendiente Verificación', color: 'warning' },
    };
    return estados[estado] || estados.inactivo;
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  const rolInfo = getRolLabel(user.rol);
  const estadoInfo = getEstadoLabel(user.estado);

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2d3748',
              mb: 1,
              fontSize: isMobile ? '1.75rem' : '2.125rem',
            }}
          >
            Mi Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gestiona tu información personal y preferencias
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Tarjeta de Información General */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  sx={{
                    width: isMobile ? 100 : 120,
                    height: isMobile ? 100 : 120,
                    margin: '0 auto',
                    mb: 2,
                    bgcolor: '#0d4d61',
                    fontSize: isMobile ? '2.5rem' : '3rem',
                    fontWeight: 700,
                  }}
                >
                  {user.nombre?.[0]?.toUpperCase() || 'U'}
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {user.nombre} {user.apellido}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                  <Chip
                    icon={rolInfo.icon}
                    label={rolInfo.label}
                    color={rolInfo.color}
                    size="small"
                  />
                  <Chip
                    label={estadoInfo.label}
                    color={estadoInfo.color}
                    size="small"
                  />
                  {user.emailVerificado && (
                    <Chip
                      icon={<VerifiedIcon fontSize="small" />}
                      label="Email Verificado"
                      color="success"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Miembro desde
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {new Date(user.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>

                  {user.ultimoAcceso && (
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Último acceso
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {new Date(user.ultimoAcceso).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Tarjeta de Formulario */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Información Personal
                  </Typography>
                  {!isEditing ? (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={loading}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                          textTransform: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {loading ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </Box>
                  )}
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <Grid container spacing={2}>
                  {/* Nombre */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      error={!!formErrors.nombre}
                      helperText={formErrors.nombre}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Apellido */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Apellido"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      error={!!formErrors.apellido}
                      helperText={formErrors.apellido}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Email (solo lectura) */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="El email no se puede modificar"
                    />
                  </Grid>

                  {/* Teléfono */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Teléfono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      error={!!formErrors.telefono}
                      helperText={formErrors.telefono || 'Formato: +5491123456789'}
                      placeholder="+5491123456789"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Dirección
                    </Typography>
                  </Grid>

                  {/* Calle */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Calle"
                      name="direccion.calle"
                      value={formData.direccion.calle}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      placeholder="Av. Corrientes 1234"
                    />
                  </Grid>

                  {/* Ciudad */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Ciudad"
                      name="direccion.ciudad"
                      value={formData.direccion.ciudad}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      placeholder="Buenos Aires"
                    />
                  </Grid>

                  {/* Provincia */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Provincia"
                      name="direccion.provincia"
                      value={formData.direccion.provincia}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      placeholder="CABA"
                    />
                  </Grid>

                  {/* Código Postal */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Código Postal"
                      name="direccion.codigoPostal"
                      value={formData.direccion.codigoPostal}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      placeholder="1043"
                    />
                  </Grid>

                  {/* País */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="País"
                      name="direccion.pais"
                      value={formData.direccion.pais}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      placeholder="Argentina"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerfilPage;
