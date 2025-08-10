import { useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Stack,
  Paper,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Cancel, Home, Refresh } from '@mui/icons-material';
import { examAPI } from '../api/exam';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useExamStore } from '../store/examStore';
import HeaderBar from '../components/HeaderBar';
import { useMutation } from '@tanstack/react-query';

// Mobile-friendly Question Result Card
function QuestionResultCard({ 
  questionIndex, 
  result 
}: { 
  questionIndex: number; 
  result: any;
}) {
  return (
    <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" fontWeight={600}>
          ข้อ {questionIndex + 1}
        </Typography>
        {result.firstAttemptCorrect ? (
          <CheckCircle color="success" fontSize="small" />
        ) : (
          <Cancel color="error" fontSize="small" />
        )}
      </Box>
      
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          size="small"
          label={result.firstAttemptCorrect ? 'ถูกครั้งแรก' : 'ผิดครั้งแรก'}
          color={result.firstAttemptCorrect ? 'success' : 'error'}
          variant="outlined"
        />
        {result.wrongAttemptsCount > 0 && (
          <Chip
            size="small"
            label={`ผิด ${result.wrongAttemptsCount} ครั้ง`}
            color="warning"
            variant="outlined"
          />
        )}
        <Chip
          size="small"
          label={`รวม ${result.attempts?.length || 0} ครั้ง`}
          variant="outlined"
        />
      </Stack>
    </Paper>
  );
}

export default function SummaryPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, role, clearAuth } = useAuthStore();
  const { resetExam } = useExamStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      resetExam(); // Reset exam state first
      clearAuth(); // Then clear auth
      navigate('/');
    },
  });

  // Redirect if not authenticated as student
  useEffect(() => {
    if (!isAuthenticated || role !== 'student') {
      navigate('/');
    }
  }, [isAuthenticated, role, navigate]);

  // Load exam result
  const { data: result, isLoading, error } = useQuery({
    queryKey: ['exam-result', resultId],
    queryFn: () => examAPI.getSummary(resultId!),
    enabled: !!resultId && isAuthenticated && role === 'student',
  });

  // Log error for debugging
  useEffect(() => {
    if (error) {
      console.error('Error loading exam result:', error);
      console.error('Result ID:', resultId);
      console.error('Error response:', (error as any)?.response?.data);
    }
  }, [error, resultId]);

  const handleStartNewExam = () => {
    resetExam();
    navigate('/exam');
  };

  const handleGoHome = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <HeaderBar />
        <Container sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: { xs: 'calc(100vh - 120px)', sm: '60vh' },
          px: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={isMobile ? 50 : 60} />
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                mt: 2,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              กำลังโหลดผลสอบ...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !result) {
    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถโหลดผลสอบได้';
    const statusCode = (error as any)?.response?.status;
    const errorDetail = (error as any)?.response?.data?.message;
    
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <HeaderBar />
        <Container sx={{ 
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 }
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              borderRadius: { xs: 1, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {statusCode === 404 ? 'ไม่พบผลสอบที่ต้องการ' : 
             statusCode === 403 ? 'ไม่มีสิทธิ์เข้าถึงผลสอบนี้' :
             statusCode === 401 ? 'กรุณาเข้าสู่ระบบใหม่' :
             errorDetail || errorMessage}
          </Alert>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/exam')} 
              startIcon={<Refresh />}
              fullWidth={isMobile}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              ลองทำแบบทดสอบใหม่
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleGoHome} 
              startIcon={<Home />}
              fullWidth={isMobile}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              กลับไปหน้าหลัก
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  const score = result.realScore;
  const totalQuestions = result.perQuestion.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const firstAttemptCorrect = result.perQuestion.filter((q: any) => q.firstAttemptCorrect).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <HeaderBar />
      <Container sx={{ 
        py: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 }
      }}>
        {/* Score Summary Card */}
        <Card 
          elevation={3} 
          sx={{ 
            mb: 3,
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              background: percentage >= 80 ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)' :
                         percentage >= 60 ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' :
                         'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              p: { xs: 3, sm: 4 },
              textAlign: 'center'
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              gutterBottom
              sx={{
                fontSize: { xs: '1.5rem', sm: '2rem' },
                fontWeight: 700
              }}
            >
              🎉 ผลสอบของคุณ
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 4 },
              mt: 2
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  sx={{ 
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', sm: '3.5rem' }
                  }}
                >
                  {score}/{totalQuestions}
                </Typography>
                <Typography 
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  คะแนนที่ได้
                </Typography>
              </Box>
              
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant={isMobile ? "h4" : "h3"} 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem' }
                  }}
                >
                  {percentage}%
                </Typography>
                <Typography 
                  variant={isMobile ? "body1" : "h6"}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  เปอร์เซ็นต์
                </Typography>
              </Box>
            </Box>
            
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              sx={{ 
                mt: 2,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                opacity: 0.9
              }}
            >
              ถูกครั้งแรก {firstAttemptCorrect} ข้อ จาก {totalQuestions} ข้อ
            </Typography>
          </Box>
        </Card>

        {/* Question Details */}
        <Card sx={{ mb: 3, borderRadius: { xs: 2, sm: 3 } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.5rem' },
                fontWeight: 600,
                mb: { xs: 2, sm: 3 }
              }}
            >
              รายละเอียดแต่ละข้อ
            </Typography>
            
            {isMobile ? (
              // Mobile Card Layout
              <Box>
                {result.perQuestion.map((questionResult: any, index: number) => (
                  <QuestionResultCard
                    key={index}
                    questionIndex={index}
                    result={questionResult}
                  />
                ))}
              </Box>
            ) : (
              // Desktop Table Layout
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ข้อ</TableCell>
                    <TableCell align="center">ถูกครั้งแรก</TableCell>
                    <TableCell align="center">จำนวนครั้งที่ผิด</TableCell>
                    <TableCell align="center">ความพยายามทั้งหมด</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.perQuestion.map((questionResult: any, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          ข้อ {index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {questionResult.firstAttemptCorrect ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel color="error" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={questionResult.wrongAttemptsCount || 0}
                          size="small"
                          color={(questionResult.wrongAttemptsCount || 0) === 0 ? 'success' : 
                                 (questionResult.wrongAttemptsCount || 0) <= 2 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {questionResult.attempts?.length || 0} ครั้ง
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card sx={{ borderRadius: { xs: 2, sm: 3 } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
            >
              <Button
                variant="contained"
                size={isMobile ? "medium" : "large"}
                startIcon={<Refresh />}
                onClick={handleStartNewExam}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 3, sm: 4 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  borderRadius: { xs: 1, sm: 2 }
                }}
              >
                ทำแบบทดสอบใหม่
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 3, sm: 4 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  borderRadius: { xs: 1, sm: 2 }
                }}
              >
                กลับไปหน้าหลัก
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
} 