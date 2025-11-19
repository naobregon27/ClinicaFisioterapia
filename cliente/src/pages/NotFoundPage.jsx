import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: 'center', mt: 10 }}>
        <SearchOffIcon sx={{ fontSize: 100, color: '#0d4d61', mb: 2 }} />
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          404 - Página No Encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          La página que buscas no existe.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          sx={{ background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)' }}
        >
          Volver al Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;


