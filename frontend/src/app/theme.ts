import { createTheme } from '@mui/material/styles'

// صرح القابضة - Brand Colors
export const brandColors = {
  primary: '#708472',      // PANTONE 5625 C - الأخضر الرئيسي
  primaryLight: '#A3B1A4', // PANTONE 5645 C - أخضر فاتح
  black: '#1D1D1B',        // PANTONE Black C - أسود
  darkGray: '#3D3935',     // PANTONE Black 7 C - رمادي غامق
  gray: '#898A8D',         // PANTONE Cool gray 8 C - رمادي
  lightGray: '#C8C8C8',    // PANTONE 420 C - رمادي فاتح
}

// صرح القابضة Theme
export const sarehTheme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: brandColors.primary,
      light: brandColors.primaryLight,
      dark: '#5a6b5d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: brandColors.darkGray,
      light: brandColors.gray,
      dark: brandColors.black,
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: brandColors.black,
      secondary: brandColors.gray,
    },
    divider: '#e0e0e0',
    success: {
      main: '#2e7d32',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography: {
    // Body: Cairo (Arabic) + Inter (Latin)
    fontFamily: [
      'Cairo',
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontSize: 14,
    // Headlines: Playfair Display for titles with Cairo fallback
    h1: { fontWeight: 800, fontFamily: '"Playfair Display", Cairo', fontSize: '2.75rem' },
    h2: { fontWeight: 800, fontFamily: '"Playfair Display", Cairo', fontSize: '2.25rem' },
    h3: { fontWeight: 700, fontFamily: '"Playfair Display", Cairo', fontSize: '1.9rem' },
    h4: { fontWeight: 700, fontFamily: '"Playfair Display", Cairo', fontSize: '1.6rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 500, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem' },
  },
  components: {
    // لا نطبق فروض اتجاه/محاذاة عامة؛ نترك RTL يعمل عبر html[dir="rtl"] وEmotion
    MuiCssBaseline: {},
    MuiTypography: {},
    MuiListItem: {},
    MuiListItemText: {},
    MuiMenuItem: {},
    MuiTextField: {},
    MuiInputBase: {},
    MuiFormControl: {},
    MuiSelect: {},
    MuiChip: {},
    MuiAlert: {},
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(112, 132, 114, 0.3)',
          },
        },
        sizeSmall: {
          padding: '4px 10px',
          fontSize: '0.8125rem',
        },
        sizeMedium: {
          padding: '6px 16px',
        },
        sizeLarge: {
          padding: '8px 22px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: 'none',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: brandColors.black,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: brandColors.black,
          color: '#ffffff',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#fafafa',
        },
      },
    },
    MuiDialog: {},
    MuiDialogTitle: {},
    MuiDialogContent: {},
    MuiDialogActions: {},
  },
})

