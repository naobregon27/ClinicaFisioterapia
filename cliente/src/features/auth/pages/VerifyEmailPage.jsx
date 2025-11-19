import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Box, Card, CardContent, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { verifyEmail } from '../slices/authSlice';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(verifyEmail({ email, code })).unwrap();
      toast.success('Email verificado exitosamente');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)' }}>
      <Container maxWidth="sm">
        <Card elevation={10}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <LocalHospital sx={{ fontSize: 60, color: '#0d4d61', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Verificar Email</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresa el código de 6 dígitos enviado a {email}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField fullWidth label="Código de verificación" value={code} onChange={(e) => setCode(e.target.value)} required disabled={loading} inputProps={{ maxLength: 6 }} sx={{ mb: 3 }} />
              <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)' }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Verificar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default VerifyEmailPage;


