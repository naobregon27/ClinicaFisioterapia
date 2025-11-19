/**
 * Punto de entrada principal de la aplicación
 * Configura Redux, React Router y Material-UI
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './app/store';
import { router } from './app/router';
import './index.css';
import { brandPalette, brandGradients, brandShadows, brandAlpha } from './theme/brand';

// Configuración del tema de Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: brandPalette.primary,
      light: brandPalette.primaryLight,
      dark: brandPalette.primaryDark,
    },
    secondary: {
      main: brandPalette.accent,
      light: '#a8dfe4',
      dark: '#4f7e84',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    success: {
      main: brandPalette.primaryLight,
    },
    background: {
      default: brandPalette.neutral,
      paper: '#ffffff',
    },
    text: {
      primary: brandPalette.text,
      secondary: '#4a5c61',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: brandPalette.neutral,
          color: brandPalette.text,
          minHeight: '100vh',
          margin: 0,
          overflowX: 'hidden',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        a: {
          color: brandPalette.accent,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 999,
          paddingInline: 20,
        },
        containedPrimary: {
          background: brandGradients.primary,
          boxShadow: brandShadows.button,
          '&:hover': {
            background: brandGradients.primaryInverse,
            boxShadow: brandShadows.buttonHover,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: brandShadows.card,
          border: `1px solid ${brandAlpha(0.08)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          background: brandGradients.primary,
          borderBottom: '1px solid rgba(255,255,255,0.15)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: `${brandPalette.primary}22`,
          color: brandPalette.primaryDark,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
