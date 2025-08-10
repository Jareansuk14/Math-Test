import { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../api/exam';
import { useExamStore } from '../store/examStore';
import { useAuthStore } from '../store/authStore';
import HeaderBar from '../components/HeaderBar';
import QuestionCard from '../components/QuestionCard';
import HintDialog from '../components/HintDialog';
import SuccessDialog from '../components/SuccessDialog';

export default function ExamPage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const {
    currentSession,
    questions,
    currentQuestionIndex,
    setSession,
    setQuestions,
    setCurrentIndex,
    addAnswer,
    setHint,
    markComplete,
    resetExam,
  } = useExamStore();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [showHint, setShowHint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentHint, setCurrentHint] = useState<{
    level: 1 | 2 | 3;
    text: string;
    imageUrl?: string;
  } | null>(null);
  const [isFirstTryCorrect, setIsFirstTryCorrect] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated as student
  useEffect(() => {
    if (!isAuthenticated || role !== 'student') {
      navigate('/');
    } else {
      // Reset exam state when entering exam page for fresh start
      if (!currentSession && questions.length === 0) {
        resetExam();
      }
    }
  }, [isAuthenticated, role, navigate, currentSession, questions.length, resetExam]);

  // Load questions
  const { data: questionsData, isLoading: loadingQuestions } = useQuery({
    queryKey: ['questions', 'active'],
    queryFn: examAPI.getActiveQuestions,
    enabled: isAuthenticated && role === 'student',
  });

  // Start exam session
  const startExamMutation = useMutation({
    mutationFn: examAPI.startExam,
    onSuccess: (data) => {
      setSession(data);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'ไม่สามารถเริ่มการสอบได้');
    },
  });

  // Submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) =>
      examAPI.submitAnswer(sessionId, data),
    onSuccess: (response, variables) => {
      const { questionId, choiceIndex } = variables.data;

      if (response.isCorrect) {
        // Check if this is first try BEFORE adding the answer
        const currentQuestion = questions[currentQuestionIndex];
        const currentAnswers = useExamStore.getState().answers[currentQuestion._id] || [];
        const isFirstTry = currentAnswers.length === 0; // No previous answers
        
        // Now add the answer
        addAnswer(questionId, choiceIndex);
        
        setIsFirstTryCorrect(isFirstTry);
        setShowSuccess(true);
      } else {
        // Add wrong answer first
        addAnswer(questionId, choiceIndex);
        
        // Show hint if wrong
        if (response.hintLevel) {
          const currentQuestion = questions[currentQuestionIndex];
          const hint = currentQuestion.hints.find(h => h.level === response.hintLevel);
          if (hint) {
            setCurrentHint(hint);
            setHint(currentQuestion._id, hint);
            setShowHint(true);
          }
        }
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำตอบ');
    },
  });

  // Complete exam
  const completeExamMutation = useMutation({
    mutationFn: () => examAPI.completeExam(currentSession!.sessionId),
    onSuccess: (data) => {
      markComplete();
      navigate(`/summary/${data.resultId}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'ไม่สามารถจบการสอบได้');
    },
  });

  // Initialize exam
  useEffect(() => {
    if (questionsData && !currentSession) {
      setQuestions(questionsData.items);
      startExamMutation.mutate();
    }
  }, [questionsData, currentSession]);

  const handleSubmitAnswer = (choiceIndex: number) => {
    if (!currentSession || !questions[currentQuestionIndex]) return;

    const currentQuestion = questions[currentQuestionIndex];
    submitAnswerMutation.mutate({
      sessionId: currentSession.sessionId,
      data: {
        questionId: currentQuestion._id,
        choiceIndex,
      },
    });
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentIndex(currentQuestionIndex + 1);
    } else {
      // Complete exam
      completeExamMutation.mutate();
    }
  };

  const handleHintClose = () => {
    setShowHint(false);
  };

  if (loadingQuestions || startExamMutation.isPending) {
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
              กำลังเตรียมข้อสอบ...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
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
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!questions.length || !currentSession) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <HeaderBar />
        <Container sx={{ 
          mt: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 }
        }}>
          <Alert 
            severity="warning"
            sx={{ 
              borderRadius: { xs: 1, sm: 2 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            ไม่พบข้อสอบ กรุณาติดต่อผู้ดูแลระบบ
          </Alert>
        </Container>
      </Box>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <HeaderBar />
      <Container sx={{ 
        py: { xs: 1, sm: 2 },
        px: { xs: 1, sm: 3 },
        maxWidth: { xs: '100%', sm: 'lg' }
      }}>
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onSubmitAnswer={handleSubmitAnswer}
          isSubmitting={submitAnswerMutation.isPending}
        />

        {/* Hint Dialog */}
        {currentHint && (
          <HintDialog
            open={showHint}
            hintLevel={currentHint.level}
            hintText={currentHint.text}
            hintImageUrl={currentHint.imageUrl}
            onClose={handleHintClose}
          />
        )}

        {/* Success Dialog */}
        <SuccessDialog
          open={showSuccess}
          isFirstTry={isFirstTryCorrect}
          explanationText={currentQuestion.firstTryExplanation?.text}
          explanationImageUrl={currentQuestion.firstTryExplanation?.imageUrl}
          onContinue={handleSuccessContinue}
          isLastQuestion={currentQuestionIndex === questions.length - 1}
        />
      </Container>
    </Box>
  );
} 