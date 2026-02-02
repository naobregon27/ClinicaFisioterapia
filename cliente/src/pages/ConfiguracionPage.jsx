/**
 * Página de Configuración
 * Permite cambiar contraseña y configurar preferencias
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
  Divider,
  Alert,
  LinearProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Security as SecurityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  VpnKey as VpnKeyIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  selectAuthLoading,
  selectAuthError,
  changePassword,
  clearError,
  clearSuccessMessage,
} from '../features/auth/slices/authSlice';

const ConfiguracionPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
  });
  const [showPasswordRules, setShowPasswordRules] = useState(false);

  // Mostrar errores del backend
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calcular fortaleza de la contraseña
  useEffect(() => {
    if (formData.newPassword) {
      const strength = calculatePasswordStrength(formData.newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [formData.newPassword]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    const strengths = {
      0: { label: '', color: '' },
      1: { label: 'Muy débil', color: '#f44336' },
      2: { label: 'Débil', color: '#ff9800' },
      3: { label: 'Regular', color: '#ffc107' },
      4: { label: 'Buena', color: '#8bc34a' },
      5: { label: 'Fuerte', color: '#4caf50' },
      6: { label: 'Muy fuerte', color: '#2e7d32' },
    };

    return strengths[score] || strengths[0];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePassword = (password) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    };

    return requirements;
  };

  const validateForm = () => {
    const errors = {};

    // Validar contraseña actual
    if (!formData.currentPassword) {
      errors.currentPassword = 'La contraseña actual es obligatoria';
    }

    // Validar nueva contraseña
    if (!formData.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria';
    } else {
      const requirements = validatePassword(formData.newPassword);
      const allRequirementsMet = Object.values(requirements).every((val) => val === true);

      if (!allRequirementsMet) {
        errors.newPassword = 'La contraseña no cumple con todos los requisitos';
      }
    }

    // Validar confirmación
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar que sea diferente
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      errors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      await dispatch(
        changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        })
      ).unwrap();

      toast.success('Contraseña actualizada exitosamente');
      
      // Limpiar formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormErrors({});
      dispatch(clearSuccessMessage());
    } catch (err) {
      // El error ya se maneja en el useEffect
    }
  };

  const passwordRequirements = formData.newPassword ? validatePassword(formData.newPassword) : null;

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
            Configuración
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra la seguridad de tu cuenta
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Información de Seguridad */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <ShieldIcon sx={{ fontSize: 60, color: '#0d4d61', mb: 2 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Seguridad de la Cuenta
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mantén tu cuenta segura con una contraseña fuerte
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InfoIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Requisitos de Contraseña
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mínimo 8 caracteres"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Al menos una mayúscula"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Al menos una minúscula"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Al menos un número"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckIcon fontSize="small" color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Al menos un carácter especial (@$!%*?&)"
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Formulario de Cambio de Contraseña */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <VpnKeyIcon sx={{ mr: 1, color: '#0d4d61' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Cambiar Contraseña
                  </Typography>
                </Box>

                {loading && <LinearProgress sx={{ mb: 2 }} />}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Contraseña Actual */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Contraseña Actual"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!formErrors.currentPassword}
                        helperText={formErrors.currentPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
                                edge="end"
                              >
                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>

                    {/* Nueva Contraseña */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Nueva Contraseña"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!formErrors.newPassword}
                        helperText={formErrors.newPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('new')}
                                edge="end"
                              >
                                {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Indicador de Fortaleza */}
                    {formData.newPassword && (
                      <Grid item xs={12}>
                        <Box sx={{ px: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Fortaleza de la contraseña
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600, color: passwordStrength.color }}
                            >
                              {passwordStrength.label}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(passwordStrength.score / 6) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 1,
                              bgcolor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: passwordStrength.color,
                              },
                            }}
                          />

                          {/* Requisitos */}
                          {passwordRequirements && (
                            <Box sx={{ mt: 2 }}>
                              <List dense>
                                {Object.entries({
                                  minLength: 'Mínimo 8 caracteres',
                                  hasUpperCase: 'Una mayúscula',
                                  hasLowerCase: 'Una minúscula',
                                  hasNumber: 'Un número',
                                  hasSpecialChar: 'Un carácter especial',
                                }).map(([key, label]) => (
                                  <ListItem key={key} sx={{ py: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                      {passwordRequirements[key] ? (
                                        <CheckIcon fontSize="small" color="success" />
                                      ) : (
                                        <CloseIcon fontSize="small" color="error" />
                                      )}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={label}
                                      primaryTypographyProps={{
                                        variant: 'body2',
                                        color: passwordRequirements[key] ? 'success.main' : 'text.secondary',
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    )}

                    {/* Confirmar Nueva Contraseña */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirmar Nueva Contraseña"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('confirm')}
                                edge="end"
                              >
                                {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {/* Botón */}
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={loading}
                          startIcon={<VpnKeyIcon />}
                          sx={{
                            background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                          }}
                        >
                          {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConfiguracionPage;
