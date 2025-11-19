/**
 * Página de Login
 * Formulario de inicio de sesión
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login, clearError, selectAuth } from '../slices/authSlice';
import toast from 'react-hot-toast';
import config from '../../../config/config';
import { brandPalette, brandGradients } from '../../../theme/brand';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(selectAuth);
  const logoSrc = '/Sin título-1 (4).png';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Limpiar error al desmontar
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(login(formData)).unwrap();
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err?.message || err?.payload?.message || 'Error al iniciar sesión';
      toast.error(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: brandGradients.hero,
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={10} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Logo y Título */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  mx: 'auto',
                  mb: 1,
                  borderRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 260ms ease',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.05)',
                  },
                  '&:hover img': {
                    filter: `drop-shadow(0 18px 28px rgba(0,0,0,0.35)) drop-shadow(0 0 18px ${brandPalette.primary})`,
                  },
                }}
              >
                <Box
                  component="img"
                  src={logoSrc}
                  alt="Fundación de Fisioterapia Miguel de Azcuenága"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 12px 22px rgba(0,0,0,0.35))',
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Inicia sesión para continuar
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
                sx={{ mb: 2 }}
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Contraseña"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                sx={{ mb: 3 }}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 2,
                  py: 1.5,
                  background: brandGradients.primary,
                  boxShadow: '0 14px 25px rgba(7, 37, 47, 0.25)',
                  fontWeight: 600,
                  '&:hover': {
                    background: brandGradients.primaryInverse,
                    boxShadow: '0 18px 30px rgba(7, 37, 47, 0.35)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              {/* Enlaces */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    style={{
                      color: brandPalette.accent,
                      textDecoration: 'none',
                      fontWeight: 1000,
                    }}
                  >
                    Regístrate aquí
                  </Link>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="caption" sx={{ color: 'white' }}>
            © 2025 {config.appName}. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;


