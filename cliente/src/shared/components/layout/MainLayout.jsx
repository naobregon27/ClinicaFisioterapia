/**
 * Componente MainLayout
 * Layout principal responsive de la aplicación con Sidebar y TopBar
 */

import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { selectSidebarOpen } from '../../../features/ui/slices/uiSlice';

const DRAWER_WIDTH = 280;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useSelector(selectSidebarOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* TopBar y Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          // Sin margen izquierdo - totalmente pegado
          ml: 0,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* TopBar */}
        <TopBar />

        {/* Contenido */}
        <Box
          sx={{
            mt: { xs: 7.5, md: 8.5 },
            // Padding lateral uniforme para todas las páginas
            pl: { xs: 1, sm: 1.5, md: 2 },
            pr: { xs: 1, sm: 1.5, md: 2 },
            pb: 2,
            m: 0,
            minHeight: 'calc(100vh - 64px)',
            width: '100%',
            maxWidth: '100vw',
            overflowX: 'auto',
            overflowY: 'auto',
            boxSizing: 'border-box',
            '&::-webkit-scrollbar': {
              height: '8px',
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#0d4d61',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#0b3c4d',
            },
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
    </Box>
  );
};

export default MainLayout;
