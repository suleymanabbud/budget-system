"""
Excel Upload API Endpoints - نقاط نهاية رفع ملفات Excel
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import Dict, Any
import os
import tempfile
import shutil

from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User, UserRole
from app.services.excel_service import ExcelService
from app.models.company import Company

router = APIRouter()

# إنشاء مجلد مؤقت لرفع الملفات
UPLOAD_DIR = "temp_uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/validate-template")
async def validate_excel_template(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    التحقق من صحة قالب Excel
    """
    # التحقق من الصلاحيات
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لرفع ملفات Excel"
        )
    
    # التحقق من نوع الملف
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نوع الملف غير مدعوم. يرجى رفع ملف Excel (.xlsx أو .xls)"
        )
    
    try:
        # حفظ الملف مؤقتاً
        temp_file_path = os.path.join(UPLOAD_DIR, f"temp_{file.filename}")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # التحقق من صحة القالب
        excel_service = ExcelService(db)
        validation_result = excel_service.validate_excel_template(temp_file_path)
        
        # حذف الملف المؤقت
        os.remove(temp_file_path)
        
        return validation_result
        
    except Exception as e:
        # حذف الملف المؤقت في حالة الخطأ
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في معالجة الملف: {str(e)}"
        )

@router.post("/upload-accounts")
async def upload_accounts_excel(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    رفع شجرة الحسابات من ملف Excel
    """
    # التحقق من الصلاحيات
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لرفع ملفات Excel"
        )
    
    # تحديد company_id
    company_id = None
    if current_user.role == UserRole.ADMIN:
        # Admin يمكنه اختيار الشركة (سيتم إضافة هذه الميزة لاحقاً)
        company_id = 1  # افتراضي للشركة الأولى
    elif current_user.role == UserRole.COMPANY_ADMIN:
        company_id = current_user.company_id
    
    if not company_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="لم يتم تحديد الشركة"
        )
    
    # التحقق من وجود الشركة
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="الشركة غير موجودة"
        )
    
    # التحقق من نوع الملف
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="نوع الملف غير مدعوم. يرجى رفع ملف Excel (.xlsx أو .xls)"
        )
    
    try:
        # حفظ الملف مؤقتاً
        temp_file_path = os.path.join(UPLOAD_DIR, f"upload_{file.filename}")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # معالجة الملف وإنشاء الحسابات
        excel_service = ExcelService(db)
        result = excel_service.create_accounts_from_excel(temp_file_path, company_id)
        
        # حذف الملف المؤقت
        os.remove(temp_file_path)
        
        return result
        
    except Exception as e:
        # حذف الملف المؤقت في حالة الخطأ
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في معالجة الملف: {str(e)}"
        )

@router.get("/template")
async def download_excel_template(
    current_user: User = Depends(get_current_user)
):
    """
    تحميل قالب Excel للحسابات
    """
    # التحقق من الصلاحيات
    if current_user.role not in [UserRole.ADMIN, UserRole.COMPANY_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ليس لديك صلاحية لتحميل القوالب"
        )
    
    try:
        import pandas as pd
        from io import BytesIO
        from fastapi.responses import Response
        
        # إنشاء قالب Excel بالأعمدة العربية (بدون عمود الشرح)
        template_data = {
            'رقم الحساب': ['1000', '1100', '1110', '1120', '2000', '2100', '2110', '3000', '3100', '4000', '4100', '5000', '5100'],
            'اسم الحساب': ['الأصول', 'الأصول المتداولة', 'النقدية', 'البنوك', 'الخصوم', 'الخصوم المتداولة', 'الموردين', 'حقوق الملكية', 'رأس المال', 'الإيرادات', 'إيرادات المبيعات', 'المصروفات', 'مصروفات التشغيل'],
            'مستوى الحساب': [1, 2, 3, 3, 1, 2, 3, 1, 2, 1, 2, 1, 2],
            'القائمة المالية': ['أصول', 'أصول', 'أصول', 'أصول', 'خصوم', 'خصوم', 'خصوم', 'حقوق الملكية', 'حقوق الملكية', 'إيرادات', 'إيرادات', 'مصروفات', 'مصروفات'],
            'نوع الحساب الأب': ['', 'أصول', 'أصول', 'أصول', '', 'خصوم', 'خصوم', '', 'حقوق الملكية', '', 'إيرادات', '', 'مصروفات']
        }
        
        df = pd.DataFrame(template_data)
        
        # إنشاء ملف Excel في الذاكرة
        output = BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Accounts', index=False)
        
        output.seek(0)
        
        return Response(
            content=output.getvalue(),
            media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            headers={'Content-Disposition': 'attachment; filename=chart_of_accounts_template.xlsx'}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"خطأ في إنشاء القالب: {str(e)}"
        )
