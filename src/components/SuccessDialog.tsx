import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Zoom,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import MathRenderer from './MathRenderer';

interface SuccessDialogProps {
  open: boolean;
  isFirstTry: boolean;
  explanationText?: string;
  explanationImageUrl?: string;
  onContinue: () => void;
  isLastQuestion: boolean;
}

export default function SuccessDialog({
  open,
  isFirstTry,
  explanationText,
  explanationImageUrl,
  onContinue,
  isLastQuestion,
}: SuccessDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [showPlusOne, setShowPlusOne] = useState(false);

  // Show +1 animation for first try
  useEffect(() => {
    if (open && isFirstTry) {
      const timer = setTimeout(() => {
        setShowPlusOne(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowPlusOne(false);
    }
  }, [open, isFirstTry]);

  // Hide +1 after animation
  useEffect(() => {
    if (showPlusOne) {
      const timer = setTimeout(() => {
        setShowPlusOne(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showPlusOne]);

  return (
    <Dialog
      open={open}
      onClose={onContinue}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: { xs: 2, sm: 3 },
          m: { xs: 1, sm: 2 },
          maxHeight: { xs: '90vh', sm: '80vh' },
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible'
        }
      }}
    >
      {/* +1 Animation for first try */}
      {isFirstTry && (
        <Zoom in={showPlusOne} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: 20,
              zIndex: 1000,
              backgroundColor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
              transform: showPlusOne ? 'translateY(-20px) scale(1.1)' : 'translateY(0) scale(1)',
              transition: 'all 0.5s ease-out',
            }}
          >
            +1
          </Box>
        </Zoom>
      )}

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
          <CheckCircle sx={{ 
            color: 'success.main', 
            fontSize: { xs: 24, sm: 28, md: 32 }
          }} />
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            color="success.main"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
              fontWeight: 600,
              mt: { xs: 0.5, sm: 0 }
            }}
          >
            {isFirstTry ? 'ถูกต้องครั้งแรก!' : 'ถูกต้องแล้ว!'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        textAlign: 'center', 
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        flex: 1,
        overflow: 'auto'
      }}>
        {explanationText ? (
          <>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2, 
                lineHeight: 1.6,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                color: 'text.primary'
              }}
              component="div"
            >
              <MathRenderer>{explanationText}</MathRenderer>
            </Typography>

            {explanationImageUrl && (
              <Box sx={{ 
                mt: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img
                  src={explanationImageUrl}
                  alt="คำอธิบายประกอบ"
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
          </>
        ) : (
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: 1.6
            }}
          >
            {isFirstTry ? 'เยี่ยมมาก! คำตอบถูกต้องในครั้งแรก' : 'เก่งมาก! ไปข้อถัดไปกันเลย'}
          </Typography>
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
          onClick={onContinue}
          size={isMobile ? "medium" : "large"}
          sx={{ 
            minWidth: { xs: 120, sm: 160 },
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 600,
            borderRadius: { xs: 1, sm: 2 },
            backgroundColor: 'success.main',
            '&:hover': {
              backgroundColor: 'success.dark',
            }
          }}
        >
          {isLastQuestion ? 'ดูผลสอบ' : 'ข้อถัดไป'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 