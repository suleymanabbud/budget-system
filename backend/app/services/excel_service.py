"""
Excel Service - خدمة معالجة ملفات Excel
"""
import pandas as pd
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.account import Account, AccountType
from app.models.company import Company
from app.schemas.account import AccountCreate
import logging

logger = logging.getLogger(__name__)

class ExcelService:
    def __init__(self, db: Session):
        self.db = db
    
    def _convert_financial_statement_to_account_type(self, financial_statement: str, parent_type: str = None) -> str:
        """
        تحويل القائمة المالية إلى نوع الحساب
        """
        # استخدام parent_type إذا كان موجود (له الأولوية)
        if parent_type:
            parent_type_lower = parent_type.strip().lower()
            
            # تحويل بناءً على اسم الحساب الأب
            if '1-' in parent_type or 'أصول' in parent_type_lower or 'assets' in parent_type_lower:
                return 'ASSET'
            elif '2-' in parent_type or 'خصوم' in parent_type_lower or 'liabilities' in parent_type_lower:
                return 'LIABILITY'
            elif '3-' in parent_type or 'حقوق الملكية' in parent_type_lower or 'equity' in parent_type_lower or 'ملكية' in parent_type_lower:
                return 'EQUITY'
            elif '4-' in parent_type or ('إيرادات' in parent_type_lower and 'تكلفة' not in parent_type_lower) or ('revenue' in parent_type_lower and 'cost' not in parent_type_lower):
                return 'REVENUE'
            elif '5-' in parent_type or 'تكلفة' in parent_type_lower or 'cost' in parent_type_lower:
                return 'EXPENSE'
            elif '6-' in parent_type or 'مصروفات تشغيلية' in parent_type_lower or 'operating expenses' in parent_type_lower:
                return 'EXPENSE'
            elif '7-' in parent_type or ('إيرادات والمصروفات' in parent_type_lower or 'other income' in parent_type_lower):
                return 'EXPENSE'
            elif '8-' in parent_type or 'ضريبة' in parent_type_lower or 'tax' in parent_type_lower:
                return 'EXPENSE'
        
        # تحويل القائمة المالية إلى نوع الحساب (خيار احتياطي)
        financial_statement_lower = financial_statement.strip().lower()
        if 'أصول' in financial_statement_lower or 'assets' in financial_statement_lower:
            return 'ASSET'
        elif 'خصوم' in financial_statement_lower or 'liabilities' in financial_statement_lower:
            return 'LIABILITY'
        elif 'حقوق الملكية' in financial_statement_lower or 'equity' in financial_statement_lower or 'ملكية' in financial_statement_lower:
            return 'EQUITY'
        elif 'إيرادات' in financial_statement_lower or 'revenue' in financial_statement_lower or 'إيراد' in financial_statement_lower:
            return 'REVENUE'
        elif 'مصروفات' in financial_statement_lower or 'expenses' in financial_statement_lower or 'مصروف' in financial_statement_lower or 'تكلفة' in financial_statement_lower:
            return 'EXPENSE'
        
        # افتراضي - لن يصل هنا إلا إذا لم يتم العثور على تطابق
        logger.warning(f"لم يتم التعرف على القائمة المالية: {financial_statement}, نوع الأب: {parent_type}")
        return 'ASSET'  # افتراضي
    
    def parse_accounts_excel(self, file_path: str, company_id: int) -> List[Dict[str, Any]]:
        """
        قراءة ملف Excel وتحويله إلى قائمة حسابات
        """
        try:
            # قراءة ملف Excel مع تحديد نوع عمود رقم الحساب كنص
            df = pd.read_excel(file_path, dtype={'رقم الحساب': str})
            
            # التحقق من وجود الأعمدة المطلوبة (بالعربية)
            required_columns = ['رقم الحساب', 'اسم الحساب', 'مستوى الحساب', 'القائمة المالية']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"الأعمدة المطلوبة مفقودة: {missing_columns}")
            
            accounts = []
            
            for index, row in df.iterrows():
                try:
                    # تنظيف البيانات
                    code = str(row['رقم الحساب']).strip()
                    
                    # معالجة التواريخ المحولة (مثل "2000-02-01 00:00:00" -> "2-2000")
                    if ' ' in code and ':' in code:
                        # إزالة الوقت والتاريخ، نأخذ فقط الجزء الأول
                        code = code.split(' ')[0]
                    
                    name = str(row['اسم الحساب']).strip()
                    financial_statement = str(row['القائمة المالية']).strip()
                    level = int(row['مستوى الحساب']) if pd.notna(row['مستوى الحساب']) else 1
                    
                    # تحويل القائمة المالية إلى نوع الحساب
                    parent_type_raw = str(row.get('نوع الحساب الاب', '')).strip() if pd.notna(row.get('نوع الحساب الاب')) else None
                    account_type = self._convert_financial_statement_to_account_type(financial_statement, parent_type_raw)
                    
                    # الحقول الاختيارية
                    parent_type = str(row.get('نوع الحساب الاب', '')).strip() if pd.notna(row.get('نوع الحساب الاب')) else None
                    is_budgetable = True  # افتراضي
                    
                    # التحقق من صحة نوع الحساب
                    if account_type not in ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']:
                        logger.warning(f"نوع حساب غير صحيح في الصف {index + 1}: {account_type}")
                        continue
                    
                    account_data = {
                        'code': f"{code}_{company_id}",  # إضافة company_id للكود
                        'name': name,
                        'name_en': None,  # لا يوجد عمود اسم إنجليزي
                        'description': None,  # لا يوجد عمود الشرح
                        'account_type': account_type,
                        'financial_statement': financial_statement,  # حفظ القائمة المالية كما هي
                        'level': level,
                        'is_budgetable': is_budgetable,
                        'company_id': company_id,
                        'parent_type': parent_type,  # نوع الحساب الأب
                        'original_code': code  # حفظ الكود الأصلي لإنشاء العلاقات
                    }
                    
                    accounts.append(account_data)
                    
                except Exception as e:
                    logger.error(f"خطأ في معالجة الصف {index + 1}: {str(e)}")
                    continue
            
            # إنشاء العلاقات الهرمية
            accounts = self._create_hierarchical_relationships(accounts)
            
            return accounts
            
        except Exception as e:
            logger.error(f"خطأ في قراءة ملف Excel: {str(e)}")
            raise Exception(f"فشل في قراءة ملف Excel: {str(e)}")
    
    def _create_hierarchical_relationships(self, accounts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """إنشاء العلاقات الهرمية بين الحسابات"""
        # ترتيب الحسابات حسب المستوى
        accounts.sort(key=lambda x: x['level'])
        
        # إنشاء قاموس لربط أسماء الحسابات بأكوادها
        name_to_code = {}
        
        # أولاً: نحدد الحسابات الرئيسية (المستوى 1)
        for account in accounts:
            if account['level'] == 1:
                # الحسابات الرئيسية ليس لها أب
                account['parent_code'] = None
                # حفظ العلاقة بين اسم الحساب الرئيسي وكوده
                # مثل "1- الأصول (Assets)" -> "1-0000"
                parent_type = account.get('parent_type', '')
                if parent_type:
                    name_to_code[parent_type] = account['code']
        
        # ثانياً: نحدد الحسابات الفرعية
        for account in accounts:
            if account['level'] > 1:
                # البحث عن الحساب الأب باستخدام parent_type
                parent_type = account.get('parent_type', '')
                if parent_type and parent_type in name_to_code:
                    account['parent_code'] = name_to_code[parent_type]
                else:
                    # إذا لم نجد، نستخدم منطق الكود
                    parent_code = self._find_parent_code(account['original_code'])
                    if parent_code:
                        account['parent_code'] = f"{parent_code}_{account['company_id']}"
                    else:
                        account['parent_code'] = None
        
        return accounts
    
    def _find_parent_code(self, code: str) -> str:
        """البحث عن كود الحساب الأب"""
        # إذا كان الكود مثل "1-1000" فالأب هو "1-0000"
        # إذا كان الكود مثل "1-1100" فالأب هو "1-1000"
        # إذا كان الكود مثل "1-1110" فالأب هو "1-1100"
        
        parts = code.split('-')
        if len(parts) >= 2:
            prefix = parts[0]  # مثل "1"
            number = parts[1]  # مثل "1100"
            
            if len(number) >= 4:
                # تحويل إلى رقم
                num_value = int(number)
                
                # إزالة آخر رقم غير صفري
                # 1100 -> 1000, 1110 -> 1100, 1234 -> 1230
                # نبحث عن آخر رقم غير صفري ونحوله لصفر
                
                # تحويل إلى نص لمعالجة كل رقم
                num_str = str(num_value).zfill(4)
                
                # البحث عن آخر رقم غير صفري من اليمين
                for i in range(len(num_str) - 1, -1, -1):
                    if num_str[i] != '0':
                        # نحول هذا الرقم وما بعده إلى صفر
                        parent_str = num_str[:i] + '0' * (len(num_str) - i)
                        parent_num = int(parent_str)
                        
                        if parent_num == 0:
                            # الأب هو الرئيسي
                            return f"{prefix}-0000"
                        else:
                            return f"{prefix}-{parent_str}"
                
                # إذا كل الأرقام أصفار، الأب هو None
                return None
        
        return None
    
    def create_accounts_from_excel(self, file_path: str, company_id: int) -> Dict[str, Any]:
        """
        إنشاء الحسابات من ملف Excel
        """
        try:
            # قراءة البيانات من Excel
            accounts_data = self.parse_accounts_excel(file_path, company_id)
            
            if not accounts_data:
                return {
                    'success': False,
                    'message': 'لا توجد بيانات صحيحة في الملف',
                    'created_count': 0,
                    'errors': []
                }
            
            created_count = 0
            errors = []
            
            # إنشاء قاموس للعثور على الحسابات الأب
            parent_map = {}
            
            # ترتيب الحسابات حسب المستوى
            accounts_data.sort(key=lambda x: x['level'])
            
            for account_data in accounts_data:
                try:
                    # البحث عن الحساب الأب إذا كان موجود
                    parent_id = None
                    if account_data.get('parent_code'):
                        parent_key = account_data['parent_code']  # الكود جاهز مع company_id
                        logger.info(f"البحث عن الأب: {parent_key} للحساب: {account_data['code']}")
                        if parent_key in parent_map:
                            parent_id = parent_map[parent_key]
                            logger.info(f"تم العثور على الأب في parent_map: {parent_id}")
                        else:
                            # البحث في قاعدة البيانات
                            parent_account = self.db.query(Account).filter(
                                Account.code == parent_key,
                                Account.company_id == company_id
                            ).first()
                            if parent_account:
                                parent_id = parent_account.id
                                parent_map[parent_key] = parent_id
                                logger.info(f"تم العثور على الأب في قاعدة البيانات: {parent_id}")
                            else:
                                logger.warning(f"لم يتم العثور على الأب: {parent_key}")
                    
                    # إنشاء الحساب
                    account = Account(
                        code=account_data['code'],
                        name=account_data['name'],
                        name_en=account_data.get('name_en'),
                        description=account_data.get('description'),
                        account_type=account_data['account_type'],
                        financial_statement=account_data.get('financial_statement'),
                        parent_id=parent_id,
                        level=account_data['level'],
                        is_leaf=True,  # سيتم تحديثه لاحقاً
                        is_budgetable=account_data['is_budgetable'],
                        company_id=company_id,
                        is_active=True
                    )
                    
                    self.db.add(account)
                    self.db.flush()  # للحصول على ID
                    
                    # حفظ في الخريطة للعثور عليه لاحقاً (باستخدام الكود مع company_id)
                    parent_map[account_data['code']] = account.id
                    logger.info(f"تم إنشاء الحساب: {account_data['code']} -> ID: {account.id}, Parent ID: {parent_id}")
                    
                    created_count += 1
                    
                except Exception as e:
                    error_msg = f"خطأ في إنشاء الحساب {account_data.get('name', 'غير محدد')}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(error_msg)
                    continue
            
            # تحديث is_leaf للحسابات
            self._update_leaf_status(company_id)
            
            self.db.commit()
            
            return {
                'success': True,
                'message': f'تم إنشاء {created_count} حساب بنجاح',
                'created_count': created_count,
                'errors': errors
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"خطأ في إنشاء الحسابات: {str(e)}")
            return {
                'success': False,
                'message': f'فشل في إنشاء الحسابات: {str(e)}',
                'created_count': 0,
                'errors': [str(e)]
            }
    
    def _update_leaf_status(self, company_id: int):
        """
        تحديث حالة is_leaf للحسابات
        """
        try:
            # الحصول على جميع الحسابات للشركة
            accounts = self.db.query(Account).filter(Account.company_id == company_id).all()
            
            # إنشاء قاموس للعثور على الحسابات الأب
            parent_children = {}
            for account in accounts:
                if account.parent_id:
                    if account.parent_id not in parent_children:
                        parent_children[account.parent_id] = []
                    parent_children[account.parent_id].append(account)
            
            # تحديث is_leaf
            for account in accounts:
                if account.id in parent_children:
                    account.is_leaf = False
                else:
                    account.is_leaf = True
            
            self.db.commit()
            
        except Exception as e:
            logger.error(f"خطأ في تحديث حالة is_leaf: {str(e)}")
    
    def validate_excel_template(self, file_path: str) -> Dict[str, Any]:
        """
        التحقق من صحة قالب Excel
        """
        try:
            df = pd.read_excel(file_path)
            
            # التحقق من الأعمدة المطلوبة (بالعربية)
            required_columns = ['رقم الحساب', 'اسم الحساب', 'مستوى الحساب', 'القائمة المالية']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return {
                    'valid': False,
                    'message': f'الأعمدة المطلوبة مفقودة: {missing_columns}',
                    'errors': [f'الأعمدة المطلوبة مفقودة: {missing_columns}'],
                    'required_columns': required_columns,
                    'found_columns': list(df.columns),
                    'row_count': len(df)
                }
            
            # التحقق من وجود بيانات
            if df.empty:
                return {
                    'valid': False,
                    'message': 'الملف فارغ',
                    'required_columns': required_columns,
                    'found_columns': list(df.columns)
                }
            
            # التحقق من صحة البيانات
            errors = []
            for index, row in df.iterrows():
                if pd.isna(row['رقم الحساب']) or str(row['رقم الحساب']).strip() == '':
                    errors.append(f"الصف {index + 1}: رقم الحساب مطلوب")
                
                if pd.isna(row['اسم الحساب']) or str(row['اسم الحساب']).strip() == '':
                    errors.append(f"الصف {index + 1}: اسم الحساب مطلوب")
                
                if pd.isna(row['القائمة المالية']):
                    errors.append(f"الصف {index + 1}: القائمة المالية مطلوبة")
                else:
                    financial_statement = str(row['القائمة المالية']).strip()
                    account_type = self._convert_financial_statement_to_account_type(financial_statement)
                    if account_type not in ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']:
                        errors.append(f"الصف {index + 1}: القائمة المالية غير صحيحة ({financial_statement})")
                
                if pd.isna(row['مستوى الحساب']):
                    errors.append(f"الصف {index + 1}: مستوى الحساب مطلوب")
                else:
                    try:
                        level = int(row['مستوى الحساب'])
                        if level < 1:
                            errors.append(f"الصف {index + 1}: مستوى الحساب يجب أن يكون أكبر من 0")
                    except ValueError:
                        errors.append(f"الصف {index + 1}: مستوى الحساب يجب أن يكون رقماً")
            
            return {
                'valid': len(errors) == 0,
                'message': 'الملف صحيح' if len(errors) == 0 else f'تم العثور على {len(errors)} خطأ',
                'errors': errors,
                'required_columns': required_columns,
                'found_columns': list(df.columns),
                'row_count': len(df)
            }
            
        except Exception as e:
            return {
                'valid': False,
                'message': f'خطأ في قراءة الملف: {str(e)}',
                'required_columns': ['code', 'name', 'account_type', 'level'],
                'found_columns': []
            }
