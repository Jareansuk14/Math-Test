import { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Stack,
  Collapse,
  AppBar,
  Toolbar,
  Slide,
  Container,
} from '@mui/material';

import {
  Search,
  Close,
  Visibility,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  ArrowBack,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import AdminLayout from '../components/AdminLayout';
import type { Student, ExamResult } from '../types';
import { forwardRef } from 'react';

interface EnhancedStudent extends Student {
  examResultsCount: number;
  latestExamDate?: string;
  averageScore?: number;
}

interface EnhancedExamResult extends ExamResult {
  timeTaken: string;
}

// Slide transition for full screen dialogs
const Transition = forwardRef(function Transition(props: any, ref: any) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Mobile-friendly Student Card Component
function StudentCard({ 
  student, 
  onViewHistory 
}: { 
  student: EnhancedStudent; 
  onViewHistory: (studentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '1rem' }}>
              {student.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
              รหัส: {student.studentId}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ ml: 1 }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.875rem' }}>
          {student.school}
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  จำนวนครั้งที่สอบ
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {student.examResultsCount} ครั้ง
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  คะแนนเฉลี่ย
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {student.averageScore ? `${student.averageScore.toFixed(1)}` : '-'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => onViewHistory(student.id)}
                sx={{ fontSize: '0.75rem' }}
              >
                ดูประวัติการสอบ
              </Button>
              <Chip
                size="small"
                label={new Date(student.createdAt).toLocaleDateString('th-TH')}
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

// Mobile-friendly Exam History Card
function ExamHistoryCard({ 
  result, 
  index, 
  totalCount,
  onViewDetails,
  formatDate 
}: { 
  result: EnhancedExamResult; 
  index: number;
  totalCount: number;
  onViewDetails: (result: EnhancedExamResult) => void;
  formatDate: (dateString: string) => string;
}) {
  return (
    <Card sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            ครั้งที่ {totalCount - index}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(result.completedAt)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              คะแนน
            </Typography>
            <Chip
              label={`${result.realScore}/${result.perQuestion.length}`}
              color={result.realScore >= result.perQuestion.length * 0.8 ? 'success' : 
                     result.realScore >= result.perQuestion.length * 0.6 ? 'warning' : 'error'}
              size="small"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              เวลาที่ใช้
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {result.timeTaken}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<Visibility />}
          onClick={() => onViewDetails(result)}
          fullWidth
          sx={{ fontSize: '0.875rem' }}
        >
          ดูรายละเอียด
        </Button>
      </CardContent>
    </Card>
  );
}

// Mobile-friendly Question Result Card
function QuestionResultCard({ 
  question, 
  index 
}: { 
  question: any; 
  index: number;
}) {
  const choiceLabels = ['A', 'B', 'C', 'D'];
  const wrongAttempts = question.attempts?.filter((a: any) => !a.isCorrect) || [];
  
  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            ข้อ {index + 1}
          </Typography>
          {question.firstAttemptCorrect ? (
            <CheckCircle color="success" />
          ) : (
            <Cancel color="error" />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              จำนวนครั้งที่ผิด
            </Typography>
            <Chip
              label={question.wrongAttemptsCount || 0}
              size="small"
              color={(question.wrongAttemptsCount || 0) === 0 ? 'success' : 
                     (question.wrongAttemptsCount || 0) <= 2 ? 'warning' : 'error'}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              ความพยายามทั้งหมด
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {question.attempts?.length || 0} ครั้ง
            </Typography>
          </Box>
        </Box>

        {wrongAttempts.length > 0 && (
          <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              รายละเอียดการตอบผิด:
            </Typography>
            {wrongAttempts.map((attempt: any, attemptIdx: number) => (
              <Typography key={attemptIdx} variant="body2" sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                • ผิดครั้งที่ {attemptIdx + 1}: เลือกข้อ {choiceLabels[attempt.choiceIndex]}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentsManagement() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'studentId' | 'school' | 'createdAt' | 'latestExamDate'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [examHistoryOpen, setExamHistoryOpen] = useState(false);
  const [selectedExamResult, setSelectedExamResult] = useState<EnhancedExamResult | null>(null);
  const [examResultDetailsOpen, setExamResultDetailsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || role !== 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, role, navigate]);

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: adminAPI.getStudents,
    enabled: isAuthenticated && role === 'admin',
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['admin', 'results'],
    queryFn: adminAPI.getResults,
    enabled: isAuthenticated && role === 'admin',
  });

  const { data: studentExamHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['admin', 'student-results', selectedStudentId],
    queryFn: () => adminAPI.getResults(),
    enabled: !!selectedStudentId && examHistoryOpen,
    select: (data) => {
      if (!selectedStudentId) return [];
      return data.filter((result: ExamResult) => result.studentId === selectedStudentId)
        .map((result: ExamResult) => {
          const timeDiff = new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime();
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          return {
            ...result,
            timeTaken: `${minutes} นาที ${seconds} วินาที`
          };
        })
        .sort((a: EnhancedExamResult, b: EnhancedExamResult) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
    },
  });

  const isLoading = studentsLoading || resultsLoading;

  const enhancedStudents: EnhancedStudent[] = useMemo(() => {
    if (!studentsData || !resultsData) return [];

    return studentsData.map((student: Student) => {
      const studentResults = resultsData.filter((result: ExamResult) => result.studentId === student.id);
      const examResultsCount = studentResults.length;
      const latestExamDate = studentResults.length > 0 
        ? studentResults.reduce((latest, current) => 
            new Date(current.completedAt) > new Date(latest.completedAt) ? current : latest
          ).completedAt
        : undefined;
      
      const averageScore = studentResults.length > 0
        ? studentResults.reduce((sum, result) => sum + result.realScore, 0) / studentResults.length
        : undefined;

      return {
        ...student,
        examResultsCount,
        latestExamDate,
        averageScore,
      };
    });
  }, [studentsData, resultsData]);

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = enhancedStudents;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower) ||
        student.school.toLowerCase().includes(searchLower)
      );
    }

    // Filter by school
    if (selectedSchool !== 'all') {
      filtered = filtered.filter(student => student.school === selectedSchool);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'latestExamDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [enhancedStudents, searchTerm, selectedSchool, sortBy, sortOrder]);

  const stats = useMemo(() => {
    const schoolStats = enhancedStudents.reduce((acc, student) => {
      acc[student.school] = (acc[student.school] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      schoolStats,
    };
  }, [enhancedStudents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewExamHistory = (studentId: string) => {
    setSelectedStudentId(studentId);
    setExamHistoryOpen(true);
  };

  const handleCloseExamHistory = () => {
    setExamHistoryOpen(false);
    setSelectedStudentId(null);
  };

  const handleViewExamResultDetails = (result: EnhancedExamResult) => {
    setSelectedExamResult(result);
    setExamResultDetailsOpen(true);
  };

  const handleCloseExamResultDetails = () => {
    setExamResultDetailsOpen(false);
    setSelectedExamResult(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const selectedStudent = enhancedStudents.find(s => s.id === selectedStudentId);

  return (
    <AdminLayout>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
      >
        จัดการนักเรียน
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Search and Filter */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                ค้นหาและกรองข้อมูล
              </Typography>
              
              <Stack spacing={2}>
                <TextField
                  placeholder="ค้นหาชื่อหรือรหัสนักเรียน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth={isMobile}
                  sx={{ 
                    minWidth: isMobile ? 'auto' : 250,
                    '& .MuiOutlinedInput-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }
                  }}
                />

                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexDirection: { xs: 'column', sm: 'row' },
                  flexWrap: 'wrap'
                }}>
                  <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      โรงเรียน
                    </InputLabel>
                    <Select
                      value={selectedSchool}
                      label="โรงเรียน"
                      onChange={(e) => setSelectedSchool(e.target.value)}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      <MenuItem value="all">ทั้งหมด</MenuItem>
                      {Object.keys(stats.schoolStats).map((school) => (
                        <MenuItem key={school} value={school}>
                          {school} ({stats.schoolStats[school]})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      เรียงตาม
                    </InputLabel>
                    <Select
                      value={sortBy}
                      label="เรียงตาม"
                      onChange={(e) => setSortBy(e.target.value as any)}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                    >
                      <MenuItem value="createdAt">วันที่สมัคร</MenuItem>
                      <MenuItem value="name">ชื่อ</MenuItem>
                      <MenuItem value="studentId">รหัสนักเรียน</MenuItem>
                      <MenuItem value="school">โรงเรียน</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    onClick={toggleSortOrder}
                    sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                  >
                    {sortOrder === 'asc' ? '' : ''} {sortOrder === 'asc' ? 'น้อย→มาก' : 'มาก→น้อย'}
                  </Button>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  ทั้งหมด {filteredAndSortedStudents.length} คน
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Students List */}
          {isMobile ? (
            // Mobile Card Layout
            <Box>
              {filteredAndSortedStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onViewHistory={handleViewExamHistory}
                />
              ))}
            </Box>
          ) : (
            // Desktop Table Layout  
            <Card>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ชื่อ-นามสกุล</TableCell>
                      <TableCell>รหัสนักเรียน</TableCell>
                      <TableCell>โรงเรียน</TableCell>
                      <TableCell align="center">จำนวนครั้งที่สอบ</TableCell>
                      <TableCell align="center">คะแนนเฉลี่ย</TableCell>
                      <TableCell align="center">วันที่สมัคร</TableCell>
                      <TableCell align="center">การดำเนินการ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        <TableCell>{student.school}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${student.examResultsCount} ครั้ง`}
                            size="small"
                            color={student.examResultsCount > 0 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {student.averageScore ? (
                            <Chip
                              label={`${student.averageScore.toFixed(1)}`}
                              size="small"
                              color={student.averageScore >= 80 ? 'success' : 
                                     student.averageScore >= 60 ? 'warning' : 'error'}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {formatDate(student.createdAt)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewExamHistory(student.id)}
                            color="primary"
                          >
                            <Visibility />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}

          {/* Exam History Dialog */}
          <Dialog 
            open={examHistoryOpen} 
            onClose={handleCloseExamHistory}
            maxWidth={isMobile ? false : "md"}
            fullWidth={!isMobile}
            fullScreen={isMobile}
            TransitionComponent={isMobile ? Transition : undefined}
            PaperProps={{
              sx: isMobile ? undefined : {
                minHeight: '70vh',
                maxHeight: '90vh',
              }
            }}
          >
            {isMobile ? (
              // Mobile Full Screen Layout
              <>
                <AppBar sx={{ position: 'relative' }}>
                  <Toolbar>
                    <IconButton
                      edge="start"
                      color="inherit"
                      onClick={handleCloseExamHistory}
                      aria-label="close"
                    >
                      <ArrowBack />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                      ประวัติการสอบ
                    </Typography>
                  </Toolbar>
                </AppBar>
                <Container maxWidth="sm" sx={{ py: 2 }}>
                  {selectedStudent && (
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {selectedStudent.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          รหัสนักเรียน: {selectedStudent.studentId}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          โรงเรียน: {selectedStudent.school}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              จำนวนครั้งที่สอบ
                            </Typography>
                            <Typography variant="h6" color="primary">
                              {selectedStudent.examResultsCount} ครั้ง
                            </Typography>
                          </Box>
                          {selectedStudent.averageScore !== undefined && (
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                คะแนนเฉลี่ย
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {selectedStudent.averageScore.toFixed(1)} คะแนน
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  {historyLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {studentExamHistory && studentExamHistory.length > 0 ? (
                        <Box>
                          {studentExamHistory.map((result: EnhancedExamResult, index: number) => (
                            <ExamHistoryCard
                              key={result._id}
                              result={result}
                              index={index}
                              totalCount={studentExamHistory.length}
                              onViewDetails={handleViewExamResultDetails}
                              formatDate={formatDate}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                          <Typography color="text.secondary">
                            ยังไม่มีประวัติการสอบ
                          </Typography>
                        </Paper>
                      )}
                    </>
                  )}
                </Container>
              </>
            ) : (
              // Desktop Dialog Layout
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      ประวัติการสอบ - {selectedStudent?.name}
                    </Typography>
                    <IconButton onClick={handleCloseExamHistory}>
                      <Close />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                  {historyLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {selectedStudent && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="body1" gutterBottom>
                            <strong>รหัสนักเรียน:</strong> {selectedStudent.studentId}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            <strong>โรงเรียน:</strong> {selectedStudent.school}
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            <strong>จำนวนครั้งที่สอบ:</strong> {selectedStudent.examResultsCount} ครั้ง
                          </Typography>
                          {selectedStudent.averageScore !== undefined && (
                            <Typography variant="body1" gutterBottom>
                              <strong>คะแนนเฉลี่ย:</strong> {selectedStudent.averageScore.toFixed(1)} คะแนน
                            </Typography>
                          )}
                          <Divider sx={{ my: 2 }} />
                        </Box>
                      )}

                      {studentExamHistory && studentExamHistory.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>ครั้งที่</TableCell>
                                <TableCell>วันที่สอบ</TableCell>
                                <TableCell align="center">คะแนน</TableCell>
                                <TableCell align="center">เวลาที่ใช้</TableCell>
                                <TableCell align="center">จำนวนข้อสอบ</TableCell>
                                <TableCell align="center">รายละเอียด</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {studentExamHistory.map((result: EnhancedExamResult, index: number) => (
                                <TableRow key={result._id} hover>
                                  <TableCell>{studentExamHistory.length - index}</TableCell>
                                  <TableCell>
                                    {formatDate(result.completedAt)}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={`${result.realScore}/${result.perQuestion.length}`}
                                      color={result.realScore >= result.perQuestion.length * 0.8 ? 'success' : 
                                             result.realScore >= result.perQuestion.length * 0.6 ? 'warning' : 'error'}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    {result.timeTaken}
                                  </TableCell>
                                  <TableCell align="center">
                                    {result.perQuestion.length} ข้อ
                                  </TableCell>
                                  <TableCell align="center">
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Visibility />}
                                      onClick={() => handleViewExamResultDetails(result)}
                                    >
                                      ดูรายละเอียด
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography color="text.secondary" align="center">
                          ยังไม่มีประวัติการสอบ
                        </Typography>
                      )}
                    </>
                  )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={handleCloseExamHistory}>ปิด</Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Exam Result Details Dialog */}
          <Dialog
            open={examResultDetailsOpen}
            onClose={handleCloseExamResultDetails}
            maxWidth={isMobile ? false : "md"}
            fullWidth={!isMobile}
            fullScreen={isMobile}
            TransitionComponent={isMobile ? Transition : undefined}
            PaperProps={{
              sx: isMobile ? undefined : {
                minHeight: '70vh',
                maxHeight: '90vh',
              }
            }}
          >
            {isMobile ? (
              // Mobile Full Screen Layout
              <>
                <AppBar sx={{ position: 'relative' }}>
                  <Toolbar>
                    <IconButton
                      edge="start"
                      color="inherit"
                      onClick={handleCloseExamResultDetails}
                      aria-label="close"
                    >
                      <ArrowBack />
                    </IconButton>
                    <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                      รายละเอียดผลสอบ
                    </Typography>
                  </Toolbar>
                </AppBar>
                <Container maxWidth="sm" sx={{ py: 2 }}>
                  {selectedExamResult ? (
                    <>
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            ข้อมูลการสอบ
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box sx={{ minWidth: '120px' }}>
                              <Typography variant="caption" color="text.secondary">
                                วันที่สอบ
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {formatDate(selectedExamResult.completedAt)}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: '80px' }}>
                              <Typography variant="caption" color="text.secondary">
                                เวลาที่ใช้
                              </Typography>
                              <Typography variant="body2" fontWeight={500}>
                                {selectedExamResult.timeTaken}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: '80px' }}>
                              <Typography variant="caption" color="text.secondary">
                                คะแนนที่ได้
                              </Typography>
                              <Typography variant="h6" color="primary">
                                {selectedExamResult.realScore}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: '80px' }}>
                              <Typography variant="caption" color="text.secondary">
                                คะแนนเต็ม
                              </Typography>
                              <Typography variant="h6" color="text.secondary">
                                {selectedExamResult.perQuestion.length}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>

                      <Typography variant="h6" gutterBottom sx={{ px: 1 }}>
                        ผลละเอียดแต่ละข้อ
                      </Typography>
                      
                      {selectedExamResult.perQuestion.map((question: any, index: number) => (
                        <QuestionResultCard
                          key={question.questionId || index}
                          question={question}
                          index={index}
                        />
                      ))}
                    </>
                  ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        ไม่พบผลสอบที่เลือก
                      </Typography>
                    </Paper>
                  )}
                </Container>
              </>
            ) : (
              // Desktop Dialog Layout
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      รายละเอียดผลสอบ - {selectedExamResult?.studentId}
                    </Typography>
                    <IconButton onClick={handleCloseExamResultDetails}>
                      <Close />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ px: 3 }}>
                  {selectedExamResult ? (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        <strong>วันที่สอบ:</strong> {formatDate(selectedExamResult.completedAt)}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>เวลาที่ใช้:</strong> {selectedExamResult.timeTaken}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>คะแนนที่ได้:</strong> {selectedExamResult.realScore} คะแนน
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        <strong>คะแนนที่ควรได้:</strong> {selectedExamResult.perQuestion.length} คะแนน
                      </Typography>
                      <Divider sx={{ my: 2 }} />

                      <Typography variant="h6" gutterBottom>
                        ผลละเอียดแต่ละข้อ
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ข้อ</TableCell>
                              <TableCell align="center">ถูกครั้งแรก</TableCell>
                              <TableCell align="center">จำนวนครั้งที่ผิด</TableCell>
                              <TableCell align="center">ความพยายามทั้งหมด</TableCell>
                              <TableCell>รายละเอียดการตอบผิด</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedExamResult.perQuestion.map((question: any, index: number) => {
                              const choiceLabels = ['A', 'B', 'C', 'D'];
                              const wrongAttempts = question.attempts?.filter((a: any) => !a.isCorrect) || [];
                              
                              return (
                                <TableRow key={question.questionId || index} hover>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                      ข้อ {index + 1}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="center">
                                    {question.firstAttemptCorrect ? (
                                      <CheckCircle color="success" />
                                    ) : (
                                      <Cancel color="error" />
                                    )}
                                  </TableCell>
                                  <TableCell align="center">
                                    <Chip
                                      label={question.wrongAttemptsCount || 0}
                                      size="small"
                                      color={(question.wrongAttemptsCount || 0) === 0 ? 'success' : 
                                             (question.wrongAttemptsCount || 0) <= 2 ? 'warning' : 'error'}
                                    />
                                  </TableCell>
                                  <TableCell align="center">
                                    <Typography variant="body2">
                                      {question.attempts?.length || 0} ครั้ง
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {wrongAttempts.length > 0 ? (
                                      <Box>
                                        {wrongAttempts.map((attempt: any, attemptIdx: number) => (
                                          <Typography key={attemptIdx} variant="body2" sx={{ fontSize: '0.875rem' }}>
                                            ผิดครั้งที่ {attemptIdx + 1}: เลือกข้อ {choiceLabels[attempt.choiceIndex]}
                                          </Typography>
                                        ))}
                                      </Box>
                                    ) : (
                                      <Typography variant="body2" color="text.secondary">
                                        -
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ) : (
                    <Typography color="text.secondary" align="center">
                      ไม่พบผลสอบที่เลือก
                    </Typography>
                  )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button onClick={handleCloseExamResultDetails}>ปิด</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </>
      )}
    </AdminLayout>
  );
}