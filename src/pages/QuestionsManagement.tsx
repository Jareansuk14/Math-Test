import { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Image,
  ExpandMore,
  Save,
  Cancel,
  Visibility,
  CloudUpload,

  DeleteForever,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { examAPI } from '../api/exam';
import { adminAPI, type QuestionCreateRequest, type UploadUrlRequest } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import AdminLayout from '../components/AdminLayout';
import MathRenderer from '../components/MathRenderer';
import MathInput from '../components/MathInput';
import type { Question } from '../types';

interface QuestionFormData {
  promptText: string;
  promptImageUrl?: string;
  choices: { text: string }[];
  correctIndex: number;
  hints: { level: 1 | 2 | 3; text: string; imageUrl?: string }[];
  firstTryExplanation?: { text: string; imageUrl?: string };
}

const initialFormData: QuestionFormData = {
  promptText: '',
  promptImageUrl: '',
  choices: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  correctIndex: 0,
  hints: [
    { level: 1, text: '', imageUrl: '' },
    { level: 2, text: '', imageUrl: '' },
    { level: 3, text: '', imageUrl: '' }
  ],
  firstTryExplanation: { text: '', imageUrl: '' },
};



export default function QuestionsManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, role } = useAuthStore();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(initialFormData);
  const [uploading, setUploading] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, role, navigate]);

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['questions', 'active'],
    queryFn: examAPI.getActiveQuestions,
    enabled: isAuthenticated && role === 'admin',
  });

  const publishMutation = useMutation({
    mutationFn: adminAPI.publishQuestionSet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setSnackbar({ open: true, message: 'บันทึกข้อสอบสำเร็จ!', severity: 'success' });
    },
    onError: () => {
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการบันทึก', severity: 'error' });
    }
  });

  if (!isAuthenticated || role !== 'admin') {
    return null;
  }

  const questions = questionsData?.items || [];

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData(initialFormData);
    setOpenDialog(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      promptText: question.promptText,
      promptImageUrl: question.promptImageUrl || '',
      choices: question.choices,
      correctIndex: question.correctIndex,
      hints: question.hints,
      firstTryExplanation: question.firstTryExplanation || { text: '', imageUrl: '' },
    });
    setOpenDialog(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm('คุณแน่ใจว่าต้องการลบข้อสอบนี้?')) {
      const updatedQuestions = questions.filter(q => q._id !== questionId);
      
      const questionRequests: QuestionCreateRequest[] = updatedQuestions.map((q, index) => ({
        index: index + 1,
        promptText: q.promptText,
        promptImageUrl: q.promptImageUrl || undefined,
        choices: q.choices,
        correctIndex: q.correctIndex,
        hints: q.hints.map(hint => ({
          level: hint.level,
          text: hint.text,
          imageUrl: hint.imageUrl || undefined,
        })),
        firstTryExplanation: q.firstTryExplanation ? {
          text: q.firstTryExplanation.text,
          imageUrl: q.firstTryExplanation.imageUrl || undefined,
        } : undefined,
      }));
      
      try {
        await publishMutation.mutateAsync({ 
          version: (questionsData?.setVersion || 0) + 1,
          questions: questionRequests 
        });
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleImageUpload = async (file: File, field: string, index?: number) => {
    try {
      setUploading(field + (index !== undefined ? `-${index}` : ''));
      
      // Get presigned URL
      const uploadRequest: UploadUrlRequest = {
        key: `questions/${Date.now()}-${file.name}`,
        contentType: file.type
      };
      const { url: uploadUrl } = await adminAPI.getUploadUrl(uploadRequest);
      
      // Upload to S3
      await adminAPI.uploadFile(uploadUrl, file);
      
      // The URL is the upload URL without query parameters
      const fileUrl = uploadUrl.split('?')[0];
      
      // Update form data
      if (field === 'promptImageUrl') {
        setFormData(prev => ({ ...prev, promptImageUrl: fileUrl }));
      } else if (field === 'firstTryExplanationImageUrl') {
        setFormData(prev => ({
          ...prev,
          firstTryExplanation: {
            text: prev.firstTryExplanation?.text || '',
            imageUrl: fileUrl
          }
        }));
      } else if (field === 'hintImageUrl' && index !== undefined) {
        setFormData(prev => ({
          ...prev,
          hints: prev.hints.map((hint, i) => 
            i === index ? { ...hint, imageUrl: fileUrl } : hint
          )
        }));
      }
      
      setSnackbar({ open: true, message: 'อัปโหลดรูปภาพสำเร็จ!', severity: 'success' });
    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({ open: true, message: 'เกิดข้อผิดพลาดในการอัปโหลดรูป', severity: 'error' });
    } finally {
      setUploading(null);
    }
  };

  const handleSaveQuestion = async () => {
    // Validate required fields
    if (!formData.promptText.trim() || 
        formData.choices.some(choice => !choice.text.trim()) || 
        !formData.firstTryExplanation?.text.trim() ||
        formData.hints.some(hint => !hint.text.trim())) {
      setSnackbar({ open: true, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (Hintทั้ง 3 Level)', severity: 'error' });
      return;
    }

    try {
      let updatedQuestions;
      
      if (editingQuestion) {
        // Update existing question
        updatedQuestions = questions.map(q => 
          q._id === editingQuestion._id 
            ? { 
                ...q, 
                promptText: formData.promptText,
                promptImageUrl: formData.promptImageUrl,
                choices: formData.choices,
                correctIndex: formData.correctIndex,
                hints: formData.hints,
                firstTryExplanation: formData.firstTryExplanation,
              }
            : q
        );
      } else {
        // Add new question
        if (questions.length >= 20) {
          setSnackbar({ open: true, message: 'สามารถมีข้อสอบได้สูงสุด 20 ข้อเท่านั้น', severity: 'error' });
          return;
        }
        
        const newQuestion: Question = {
          _id: `temp_${Date.now()}`, // Temporary ID
          setVersion: (questionsData?.setVersion || 0) + 1,
          index: questions.length + 1,
          promptText: formData.promptText,
          promptImageUrl: formData.promptImageUrl,
          choices: formData.choices,
          correctIndex: formData.correctIndex,
          hints: formData.hints,
          firstTryExplanation: formData.firstTryExplanation,
        };
        updatedQuestions = [...questions, newQuestion];
      }

      const questionRequests: QuestionCreateRequest[] = updatedQuestions.map((q, index) => ({
        index: index + 1,
        promptText: q.promptText,
        promptImageUrl: q.promptImageUrl || undefined,
        choices: q.choices,
        correctIndex: q.correctIndex,
        hints: q.hints.map(hint => ({
          level: hint.level,
          text: hint.text,
          imageUrl: hint.imageUrl || undefined,
        })),
        firstTryExplanation: q.firstTryExplanation ? {
          text: q.firstTryExplanation.text,
          imageUrl: q.firstTryExplanation.imageUrl || undefined,
        } : undefined,
      }));

      await publishMutation.mutateAsync({ 
        version: (questionsData?.setVersion || 0) + 1,
        questions: questionRequests 
      });
      setOpenDialog(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleImageDelete = (field: string, index?: number) => {
    // Update form data to remove the image URL
    if (field === 'promptImageUrl') {
      setFormData(prev => ({ ...prev, promptImageUrl: '' }));
    } else if (field === 'firstTryExplanationImageUrl') {
      setFormData(prev => ({
        ...prev,
        firstTryExplanation: {
          text: prev.firstTryExplanation?.text || '',
          imageUrl: ''
        }
      }));
    } else if (field === 'hintImageUrl' && index !== undefined) {
      setFormData(prev => ({
        ...prev,
        hints: prev.hints.map((hint, i) => 
          i === index ? { ...hint, imageUrl: '' } : hint
        )
      }));
    }
    
    setSnackbar({ open: true, message: 'ลบรูปภาพสำเร็จ!', severity: 'success' });
  };

  const renderImageUpload = (
    label: string,
    currentUrl: string,
    field: string,
    index?: number
  ) => {
    const uploadId = field + (index !== undefined ? `-${index}` : '');
    const isUploading = uploading === uploadId;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!currentUrl ? (
            <Button
              variant="outlined"
              component="label"
              startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUpload />}
              disabled={isUploading}
            >
              {isUploading ? 'กำลังอัปโหลด...' : 'เลือกรูป'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, field, index);
                  }
                }}
              />
            </Button>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Image color="success" />
                <Typography variant="body2" color="success.main">
                  มีรูปภาพแล้ว
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => window.open(currentUrl, '_blank')}
                >
                  <Visibility />
                </IconButton>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteForever />}
                onClick={() => handleImageDelete(field, index)}
                size="small"
              >
                ลบรูป
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <AdminLayout>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          จัดการข้อสอบ
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            label={`${questions.length}/20 ข้อ`} 
            color={questions.length > 0 ? 'success' : 'error'}
            variant="outlined"
          />
          {questions.length === 0 && (
            <Typography variant="body2" color="error">
              ต้องมีอย่างน้อย 1 ข้อ
            </Typography>
          )}
          {questions.length === 20 && (
            <Typography variant="body2" color="success.main">
              ข้อสอบครบแล้ว (สูงสุด 20 ข้อ)
            </Typography>
          )}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ลำดับ</TableCell>
                      <TableCell>โจทย์</TableCell>
                      <TableCell>รูปภาพ</TableCell>
                      <TableCell align="center">จัดการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={question._id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Box sx={{ 
                            maxHeight: 60, 
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            <MathRenderer>
                              {question.promptText}
                            </MathRenderer>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {question.promptImageUrl ? (
                            <Chip icon={<Image />} label="มีรูป" size="small" color="info" />
                          ) : (
                            <Chip label="ไม่มีรูป" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleEditQuestion(question)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteQuestion(question._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {questions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">
                            ยังไม่มีข้อสอบ คลิกปุ่ม + เพื่อเพิ่มข้อสอบใหม่
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {questions.length < 20 && (
            <Fab
              color="primary"
              sx={{ position: 'fixed', bottom: 24, right: 24 }}
              onClick={handleAddQuestion}
            >
              <Add />
            </Fab>
          )}
        </>
      )}

      {/* Question Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingQuestion ? 'แก้ไขข้อสอบ' : 'เพิ่มข้อสอบใหม่'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Question Prompt */}
            <MathInput
              fullWidth
              label="โจทย์"
              multiline
              rows={3}
              value={formData.promptText}
              onChange={(value) => setFormData(prev => ({ ...prev, promptText: value }))}
              sx={{ mb: 2 }}
              required
            />

            {/* Question Image */}
            {renderImageUpload('รูปประกอบโจทย์ (ถ้ามี)', formData.promptImageUrl || '', 'promptImageUrl')}

            {/* Choices */}
            <Typography variant="h6" gutterBottom>
              ตัวเลือก
            </Typography>
            {formData.choices.map((choice, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  ตัวเลือก {index + 1}:
                </Typography>
                <MathInput
                  fullWidth
                  placeholder={`ตัวเลือกที่ ${index + 1}`}
                  value={choice.text}
                  onChange={(value) => {
                    const newChoices = [...formData.choices];
                    newChoices[index] = { text: value };
                    setFormData(prev => ({ ...prev, choices: newChoices }));
                  }}
                  required
                />
              </Box>
            ))}

            {/* Correct Answer */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>คำตอบที่ถูกต้อง</InputLabel>
              <Select
                value={formData.correctIndex}
                onChange={(e) => setFormData(prev => ({ ...prev, correctIndex: Number(e.target.value) }))}
                label="คำตอบที่ถูกต้อง"
              >
                {formData.choices.map((_, index) => (
                  <MenuItem key={index} value={index}>
                    ข้อ {index + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Hints */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Hint 3 Level</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {formData.hints.map((hint, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      HintLevel {index + 1}
                    </Typography>
                    <MathInput
                      fullWidth
                      multiline
                      rows={2}
                      placeholder={`คำใบ้ระดับ ${index + 1}`}
                      value={hint.text}
                      onChange={(value) => {
                        const newHints = [...formData.hints];
                        newHints[index] = { ...newHints[index], text: value };
                        setFormData(prev => ({ ...prev, hints: newHints }));
                      }}
                      sx={{ mb: 2 }}
                    />
                    {renderImageUpload(
                      `รูปประกอบHintLevel ${index + 1} (ถ้ามี)`,
                      hint.imageUrl || '',
                      'hintImageUrl',
                      index
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            {/* First Try Explanation */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              เฉลยเมื่อตอบถูกครั้งแรก
            </Typography>
            <MathInput
              fullWidth
              multiline
              rows={3}
              label="ข้อความเฉลย"
              placeholder="คำอธิบายการแก้โจทย์"
              value={formData.firstTryExplanation?.text || ''}
              onChange={(value) => setFormData(prev => ({ 
                ...prev, 
                firstTryExplanation: { 
                  text: value, 
                  imageUrl: prev.firstTryExplanation?.imageUrl || '' 
                } 
              }))}
              sx={{ mb: 2 }}
              required
            />
            {renderImageUpload(
              'รูปประกอบเฉลย (ถ้ามี)',
              formData.firstTryExplanation?.imageUrl || '',
              'firstTryExplanationImageUrl'
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} startIcon={<Cancel />}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSaveQuestion}
            variant="contained"
            startIcon={<Save />}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
} 