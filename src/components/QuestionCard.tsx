import {
  Card,
  CardContent,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Chip,
  useMediaQuery,
  useTheme,
  Stack,
} from '@mui/material';
import { useState } from 'react';
import MathRenderer from './MathRenderer';
import type { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (choiceIndex: number) => void;
  isSubmitting: boolean;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  isSubmitting,
}: QuestionCardProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = () => {
    if (selectedChoice !== null) {
      onSubmitAnswer(selectedChoice);
      setSelectedChoice(null); // Reset for next question
    }
  };

  const choiceLabels = ['A', 'B', 'C', 'D'];

  return (
    <Card 
      elevation={3} 
      sx={{ 
        maxWidth: { xs: '100%', sm: 600, md: 800 }, 
        mx: 'auto', 
        my: { xs: 2, sm: 3 },
        borderRadius: { xs: 2, sm: 3 },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Progress indicator */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Chip 
            label={`ข้อ ${questionNumber}/${totalQuestions}`}
            color="primary"
            variant="outlined"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              height: { xs: 28, sm: 32 }
            }}
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              textAlign: { xs: 'center', sm: 'right' }
            }}
          >
            ข้อสอบแบบฝึกหัดคณิตศาสตร์
          </Typography>
        </Box>

        {/* Question text */}
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          gutterBottom 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            lineHeight: 1.6,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            wordBreak: 'break-word'
          }}
        >
                      <MathRenderer>{question.promptText}</MathRenderer>
        </Typography>

        {/* Question image if exists */}
        {question.promptImageUrl && (
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 2, sm: 3 },
            position: 'relative'
          }}>
            <img
              src={question.promptImageUrl}
              alt="โจทย์ประกอบ"
              style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : isTablet ? '80%' : '70%',
                height: 'auto',
                maxHeight: isMobile ? 200 : isTablet ? 250 : 300,
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </Box>
        )}

        {/* Multiple choice options */}
        <RadioGroup
          value={selectedChoice?.toString() || ''}
          onChange={(e) => setSelectedChoice(parseInt(e.target.value))}
          sx={{ mb: { xs: 2, sm: 3 } }}
        >
          <Stack spacing={isMobile ? 1 : 1.5}>
          {question.choices.map((choice, index) => (
            <FormControlLabel
              key={index}
              value={index.toString()}
                control={
                  <Radio 
                    sx={{ 
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                      // Larger touch target for mobile
                      padding: { xs: '12px', sm: '9px' }
                    }} 
                  />
                }
              label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        minWidth: { xs: 20, sm: 24 },
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        textAlign: 'center'
                      }}
                    >
                    {choiceLabels[index]}.
                  </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          lineHeight: 1.5,
                          wordBreak: 'break-word'
                        }}
                      >
                                                  <MathRenderer>{choice.text}</MathRenderer>
                  </Typography>
                    </Box>
                </Box>
              }
              sx={{
                  alignItems: 'center',
                  mx: 0,
                  borderRadius: 1,
                  px: { xs: 1, sm: 2 },
                  py: { xs: 1, sm: 1.5 },
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                    borderColor: 'divider',
                },
                  '&.Mui-focusVisible': {
                    borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                  },
                  // Better touch target for mobile
                  minHeight: { xs: 48, sm: 'auto' },
              }}
            />
          ))}
          </Stack>
        </RadioGroup>

        {/* Submit button */}
        <Box sx={{ textAlign: 'center', mt: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            size={isMobile ? "medium" : "large"}
            onClick={handleSubmit}
            disabled={selectedChoice === null || isSubmitting}
            sx={{
              minWidth: { xs: 120, sm: 150 },
              py: { xs: 1.5, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 500,
            }}
          >
            {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำตอบ'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
} 