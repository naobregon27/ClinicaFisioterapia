/**
 * Componente Sidebar
 * Menú lateral de navegación principal - Responsive
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { toggleSidebar, selectSidebarOpen } from '../../../features/ui/slices/uiSlice';
import { selectUser } from '../../../features/auth/slices/authSlice';
import config from '../../../config/config';

const DRAWER_WIDTH = 280;

const Sidebar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useSelector(selectSidebarOpen);
  const user = useSelector(selectUser);

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['usuario', 'empleado', 'administrador'],
    },
    {
      text: 'Pacientes',
      icon: <PeopleIcon />,
      path: '/pacientes',
      roles: ['usuario', 'empleado', 'administrador'],
    },
    {
      text: 'Planilla Diaria',
      icon: <EventNoteIcon />,
      path: '/planilla-diaria',
      roles: ['usuario', 'empleado', 'administrador'],
    },
    {
      text: 'Sesiones',
      icon: <EventNoteIcon />,
      path: '/sesiones',
      roles: ['usuario', 'empleado', 'administrador'],
    },
    {
      text: 'Pagos Pendientes',
      icon: <PaymentIcon />,
      path: '/pagos-pendientes',
      roles: ['usuario', 'empleado', 'administrador'],
    },
    {
      text: 'Reportes',
      icon: <AssessmentIcon />,
      path: '/reportes',
      roles: ['empleado', 'administrador'],
    },
    {
      text: 'Usuarios',
      icon: <PersonIcon />,
      path: '/usuarios',
      roles: ['administrador'],
    },
    {
      text: 'Configuración',
      icon: <SettingsIcon />,
      path: '/configuracion',
      roles: ['usuario', 'empleado', 'administrador'],
    },
  ];

  // Filtrar items según el rol del usuario
  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.rol));

  const handleToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleClose = () => {
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={sidebarOpen}
      onClose={handleClose}
      ModalProps={{
        keepMounted: true, // Mejor rendimiento en móvil
      }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #0d4d61 0%, #6fb0b8 100%)',
          color: 'white',
          borderRight: 'none',
        },
      }}
    >
      {/* Header del Sidebar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 2,
          minHeight: 64,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
          }}
        >
          {config.appName}
        </Typography>
        <IconButton
          onClick={handleToggle}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          {isMobile ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

      {/* Menu Items */}
      <List sx={{ mt: 2, flex: 1, overflowY: 'auto' }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

          return (
            <ListItem key={item.text} disablePadding sx={{ px: 1, mb: 0.5 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={handleClose}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)',
                  },
                  color: 'white',
                  py: 1.5,
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer del Sidebar */}
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: { xs: '0.75rem', md: '0.8rem' },
            display: 'block',
            mb: 0.5,
            fontWeight: 500,
          }}
        >
          {user?.nombreCompleto || `${user?.nombre || ''} ${user?.apellido || ''}`.trim() || 'Usuario'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: { xs: '0.7rem', md: '0.75rem' },
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {user?.rol?.toUpperCase() || 'USUARIO'}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
