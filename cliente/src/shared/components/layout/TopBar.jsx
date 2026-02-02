/**
 * Componente TopBar
 * Barra superior responsive con menú de usuario, notificaciones, etc.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { toggleSidebar, selectSidebarOpen } from '../../../features/ui/slices/uiSlice';
import { logout, selectUser } from '../../../features/auth/slices/authSlice';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { brandGradients, brandPalette } from '../../../theme/brand';
import NotificationBell from '../ui/NotificationBell';
import GlobalSearch from '../ui/GlobalSearch';

const DRAWER_WIDTH = 280;

const TopBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useSelector(selectSidebarOpen);
  const user = useSelector(selectUser);

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await dispatch(logout());
    navigate('/login');
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/perfil');
  };

  const handleSettings = () => {
    handleCloseUserMenu();
    navigate('/configuracion');
  };

  // Fecha actual formateada
  const fechaActual = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <AppBar
      position="fixed"
      sx={{
        width: '100%',
        // Sin margen - totalmente pegado al borde izquierdo
        ml: 0,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        background: brandGradients.primary,
        color: '#fff',
        boxShadow: '0 12px 30px rgba(7,37,47,0.18)',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 1.5, md: 2 }, minHeight: { xs: 56, sm: 64 } }}>
        {/* Botón Menu para abrir/cerrar sidebar */}
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={handleToggleSidebar}
          sx={{
            mr: { xs: 1, sm: 2 },
            ml: { xs: -0.5, sm: -0.75, md: -1 },
            color: 'inherit',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.12)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Fecha actual */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              textTransform: 'capitalize',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
            }}
          >
            {fechaActual}
          </Typography>
        </Box>

        {/* Búsqueda Global */}
        <GlobalSearch />

        {/* Notificaciones */}
        <NotificationBell />

        {/* Avatar y Menú de Usuario */}
        <IconButton
          onClick={handleOpenUserMenu}
          sx={{
            p: 0,
            ml: { xs: 0.5, sm: 1 },
          }}
        >
          <Avatar
            alt={user?.nombre}
            src={user?.avatar}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: brandPalette.primary,
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {user?.nombre?.charAt(0) || ''}
            {user?.apellido?.charAt(0) || ''}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
          PaperProps={{
            sx: {
              width: { xs: 200, sm: 220 },
              mt: 1.5,
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email}
            </Typography>
          </Box>
          <Divider />

          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Mi Perfil</Typography>
          </MenuItem>

          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>Configuración</Typography>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="error" sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              Cerrar Sesión
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
