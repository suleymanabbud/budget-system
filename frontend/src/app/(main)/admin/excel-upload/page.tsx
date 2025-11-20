'use client'

import { useState, useRef } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material'
import {
  CloudUpload,
  Download,
  CheckCircle,
  Error,
  Info,
  Close,
  FileUpload,
  DeleteForever,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { useIsAdmin } from '@/hooks/usePermissions'
import { excelService, ExcelValidationResponse, ExcelUploadResponse } from '@/services/excelService'
import { accountService } from '@/services/accountService'
import { toast } from 'react-toastify'

export default function ExcelUploadPage() {
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<ExcelValidationResponse | null>(null)
  const [uploadResult, setUploadResult] = useState<ExcelUploadResponse | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showValidationDialog, setShowValidationDialog] = useState(false)

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          ليس لديك صلاحية للوصول إلى هذه الصفحة
        </Alert>
      </Box>
    )
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // التحقق من نوع الملف
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('يرجى اختيار ملف Excel (.xlsx أو .xls)')
        return
      }
      
      setSelectedFile(file)
      setValidationResult(null)
      setUploadResult(null)
    }
  }

  const handleValidateFile = async () => {
    if (!selectedFile) return

    setIsValidating(true)
    try {
      const result = await excelService.validateTemplate(selectedFile)
      setValidationResult(result)
      setShowValidationDialog(true)
      
      if (result.valid) {
        toast.success('الملف صحيح ويمكن رفعه')
      } else {
        toast.error(`تم العثور على ${result.errors?.length || 0} خطأ في الملف`)
      }
    } catch (error) {
      console.error('خطأ في التحقق من الملف:', error)
      toast.error('فشل في التحقق من الملف')
    } finally {
      setIsValidating(false)
    }
  }

  const handleUploadFile = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      const result = await excelService.uploadAccounts(selectedFile)
      setUploadResult(result)
      
      if (result.success) {
        toast.success(`تم رفع الملف بنجاح! تم إنشاء ${result.created_count} حساب`)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('خطأ في رفع الملف:', error)
      toast.error('فشل في رفع الملف')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await excelService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'chart_of_accounts_template.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('تم تحميل القالب بنجاح')
    } catch (error) {
      console.error('خطأ في تحميل القالب:', error)
      toast.error('فشل في تحميل القالب')
    }
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setValidationResult(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearAllAccounts = async () => {
    const confirmed = window.confirm('هل أنت متأكد من حذف جميع الحسابات؟ لا يمكن التراجع عن هذه العملية.')
    if (!confirmed) return
    try {
      const res = await accountService.clearAllAccounts()
      toast.success(res?.message || 'تم حذف جميع الحسابات بنجاح')
    } catch (e: any) {
      console.error('خطأ في حذف جميع الحسابات:', e)
      const msg = e?.response?.data?.detail || 'فشل في حذف جميع الحسابات'
      toast.error(msg)
    }
  }
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        رفع شجرة الحسابات من Excel
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        يمكنك رفع شجرة الحسابات من ملف Excel باستخدام القالب المرفق
      </Typography>

      <Grid container spacing={3}>
        {/* تحميل القالب */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                تحميل قالب Excel
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                قم بتحميل القالب واملأه بالحسابات المطلوبة
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadTemplate}
                fullWidth
              >
                تحميل القالب
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* رفع الملف */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                رفع ملف Excel
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                اختر ملف Excel المحتوي على شجرة الحسابات
              </Typography>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => fileInputRef.current?.click()}
                fullWidth
                sx={{ mb: 2 }}
              >
                اختيار ملف
              </Button>

              {selectedFile && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    الملف المحدد: {selectedFile.name}
                  </Alert>
                  
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleValidateFile}
                      disabled={isValidating}
                      startIcon={<CheckCircle />}
                    >
                      {isValidating ? 'جاري التحقق...' : 'التحقق من الملف'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleUploadFile}
                      disabled={isUploading || !validationResult?.valid}
                      startIcon={<FileUpload />}
                    >
                      {isUploading ? 'جاري الرفع...' : 'رفع الملف'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleClearFile}
                      startIcon={<Close />}
                    >
                      إلغاء
                    </Button>
                  </Stack>
                </Box>
              )}

              {(isValidating || isUploading) && (
                <LinearProgress sx={{ mt: 2 }} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* حذف جميع الحسابات */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    حذف جميع حسابات شجرة الحسابات
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    سيؤدي ذلك إلى مسح كامل شجرة الحسابات من قاعدة البيانات. الإجراء متاح للمسؤول فقط.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteForever />}
                  onClick={handleClearAllAccounts}
                >
                  حذف جميع الحسابات
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* نتائج الرفع */}
        {uploadResult && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  نتائج الرفع
                </Typography>
                
                <Alert 
                  severity={uploadResult.success ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {uploadResult.message}
                </Alert>

                {uploadResult.success && (
                  <Typography variant="body2" color="text.secondary">
                    تم إنشاء {uploadResult.created_count} حساب بنجاح
                  </Typography>
                )}

                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      الأخطاء:
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>الخطأ</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {uploadResult.errors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography variant="body2" color="error">
                                  {error}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* حوار التحقق من الملف */}
      <Dialog 
        open={showValidationDialog} 
        onClose={() => setShowValidationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          نتائج التحقق من الملف
          <IconButton
            onClick={() => setShowValidationDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {validationResult && (
            <Box>
              <Alert 
                severity={validationResult.valid ? 'success' : 'error'}
                sx={{ mb: 2 }}
              >
                {validationResult.message}
              </Alert>

              <Typography variant="subtitle2" gutterBottom>
                عدد الصفوف: {validationResult.row_count}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                الأعمدة المطلوبة: {validationResult.required_columns.join(', ')}
              </Typography>

              <Typography variant="subtitle2" gutterBottom>
                الأعمدة الموجودة: {validationResult.found_columns.join(', ')}
              </Typography>

              {validationResult.errors && validationResult.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    الأخطاء:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>الخطأ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {validationResult.errors.map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" color="error">
                                {error}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowValidationDialog(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
