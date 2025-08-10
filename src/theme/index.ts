import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  // Define responsive breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    // Responsive typography
    h4: {
      fontWeight: 600,
      fontSize: '2rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '0.875rem',
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          padding: '12px 24px',
          '@media (max-width:600px)': {
            minHeight: 40,
            padding: '10px 16px',
            fontSize: '0.875rem',
          },
        },
        containedPrimary: {
          boxShadow: '0 2px 4px rgba(25, 118, 210, 0.3)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(25, 118, 210, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
          '@media (max-width:600px)': {
            margin: '8px',
            borderRadius: '12px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            minHeight: 56,
            '@media (max-width:600px)': {
              minHeight: 48,
            },
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            fontSize: '0.75rem',
            height: '28px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '@media (max-width:960px)': {
            padding: '8px',
            fontSize: '0.875rem',
          },
          '@media (max-width:600px)': {
            padding: '6px 4px',
            fontSize: '0.8rem',
          },
        },
      },
    },
  },
}); 