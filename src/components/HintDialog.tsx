import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import MathRenderer from './MathRenderer';

interface HintDialogProps {
  open: boolean;
  hintLevel: 1 | 2 | 3;
  hintText: string;
  hintImageUrl?: string;
  onClose: () => void;
}

export default function HintDialog({
  open,
  hintLevel,
  hintText,
  hintImageUrl,
  onClose,
}: HintDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const hintColors = {
    1: 'info',
    2: 'warning', 
    3: 'error',
  } as const;

  const hintTitles = {
    1: 'Hint Level 1',
    2: 'Hint Level 2', 
    3: 'Hint Level 3',
  } as const;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: { xs: 2, sm: 3 },
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: '90vh', sm: '80vh' },
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 1,
        pt: { xs: 2, sm: 2 },
        px: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpOutline color="primary" fontSize={isMobile ? "medium" : "large"} />
            <Typography 
              variant={isMobile ? "body1" : "h6"}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
            คำตอบไม่ถูกต้อง
          </Typography>
        </Box>
        <Chip
          label={hintTitles[hintLevel]}
          color={hintColors[hintLevel]}
          variant="outlined"
            sx={{ 
              mt: { xs: 1, sm: 0 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              height: { xs: 28, sm: 32 }
            }}
        />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        textAlign: 'center', 
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        flex: 1,
        overflow: 'auto'
      }}>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2, 
            lineHeight: 1.6,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
          component="div"
        >
          <MathRenderer>{hintText}</MathRenderer>
        </Typography>

        {hintImageUrl && (
          <Box sx={{ 
            mt: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src={hintImageUrl}
              alt="คำใบ้ประกอบ"
              style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : isTablet ? '80%' : '70%',
                height: 'auto',
                maxHeight: isMobile ? '200px' : 250,
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ 
        justifyContent: 'center', 
        pb: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        pt: { xs: 1, sm: 1 }
      }}>
        <Button
          variant="contained"
          onClick={onClose}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            minWidth: { xs: 120, sm: 160 },
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            borderRadius: { xs: 1, sm: 2 }
          }}
        >
          ลองใหม่อีกครั้ง
        </Button>
      </DialogActions>
    </Dialog>
  );
} 