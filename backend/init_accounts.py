"""
Initialize Chart of Accounts - تهيئة شجرة الحسابات
Create standard chart of accounts for companies
"""
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.account import Account, AccountType
from app.models.company import Company
from app.services.account_service import AccountService

def init_chart_of_accounts():
    """تهيئة شجرة الحسابات - Initialize chart of accounts"""
    db = SessionLocal()
    try:
        account_service = AccountService(db)
        
        # Get all companies
        companies = db.query(Company).all()
        
        # Standard Chart of Accounts structure
        chart_structure = [
            {
                "code": "1000",
                "name": "الأصول",
                "name_en": "Assets",
                "account_type": AccountType.ASSET,
                "level": 1,
                "is_leaf": False,
                "is_budgetable": False,
                "children": [
                    {
                        "code": "1100",
                        "name": "الأصول المتداولة",
                        "name_en": "Current Assets",
                        "account_type": AccountType.ASSET,
                        "level": 2,
                        "is_leaf": False,
                        "is_budgetable": False,
                        "children": [
                            {
                                "code": "1110",
                                "name": "النقدية",
                                "name_en": "Cash",
                                "account_type": AccountType.ASSET,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            },
                            {
                                "code": "1120",
                                "name": "البنوك",
                                "name_en": "Bank Accounts",
                                "account_type": AccountType.ASSET,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            },
                            {
                                "code": "1130",
                                "name": "العملاء",
                                "name_en": "Accounts Receivable",
                                "account_type": AccountType.ASSET,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            },
                            {
                                "code": "1140",
                                "name": "المخزون",
                                "name_en": "Inventory",
                                "account_type": AccountType.ASSET,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            }
                        ]
                    },
                    {
                        "code": "1200",
                        "name": "الأصول الثابتة",
                        "name_en": "Fixed Assets",
                        "account_type": AccountType.ASSET,
                        "level": 2,
                        "is_leaf": False,
                        "is_budgetable": False,
                        "children": [
                            {
                                "code": "1210",
                                "name": "المباني",
                                "name_en": "Buildings",
                                "account_type": AccountType.ASSET,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            },
                            {
                                "code": "1220",
                                "name": "المعدات",
                                "name_en": "Equipment",
                                "account_type": AccountType.ASSET,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            }
                        ]
                    }
                ]
            },
            {
                "code": "2000",
                "name": "الخصوم",
                "name_en": "Liabilities",
                "account_type": AccountType.LIABILITY,
                "level": 1,
                "is_leaf": False,
                "is_budgetable": False,
                "children": [
                    {
                        "code": "2100",
                        "name": "الخصوم المتداولة",
                        "name_en": "Current Liabilities",
                        "account_type": AccountType.LIABILITY,
                        "level": 2,
                        "is_leaf": False,
                        "is_budgetable": False,
                        "children": [
                            {
                                "code": "2110",
                                "name": "الموردين",
                                "name_en": "Accounts Payable",
                                "account_type": AccountType.LIABILITY,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            },
                            {
                                "code": "2120",
                                "name": "الرواتب المستحقة",
                                "name_en": "Accrued Salaries",
                                "account_type": AccountType.LIABILITY,
                                "level": 3,
                                "is_leaf": True,
                                "is_budgetable": True
                            }
                        ]
                    }
                ]
            },
            {
                "code": "3000",
                "name": "حقوق الملكية",
                "name_en": "Equity",
                "account_type": AccountType.EQUITY,
                "level": 1,
                "is_leaf": False,
                "is_budgetable": False,
                "children": [
                    {
                        "code": "3100",
                        "name": "رأس المال",
                        "name_en": "Capital",
                        "account_type": AccountType.EQUITY,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    },
                    {
                        "code": "3200",
                        "name": "الأرباح المحتجزة",
                        "name_en": "Retained Earnings",
                        "account_type": AccountType.EQUITY,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    }
                ]
            },
            {
                "code": "4000",
                "name": "الإيرادات",
                "name_en": "Revenue",
                "account_type": AccountType.REVENUE,
                "level": 1,
                "is_leaf": False,
                "is_budgetable": False,
                "children": [
                    {
                        "code": "4100",
                        "name": "إيرادات المبيعات",
                        "name_en": "Sales Revenue",
                        "account_type": AccountType.REVENUE,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    },
                    {
                        "code": "4200",
                        "name": "إيرادات الخدمات",
                        "name_en": "Service Revenue",
                        "account_type": AccountType.REVENUE,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    }
                ]
            },
            {
                "code": "5000",
                "name": "المصروفات",
                "name_en": "Expenses",
                "account_type": AccountType.EXPENSE,
                "level": 1,
                "is_leaf": False,
                "is_budgetable": False,
                "children": [
                    {
                        "code": "5100",
                        "name": "مصروفات التشغيل",
                        "name_en": "Operating Expenses",
                        "account_type": AccountType.EXPENSE,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    },
                    {
                        "code": "5200",
                        "name": "مصروفات الإدارة",
                        "name_en": "Administrative Expenses",
                        "account_type": AccountType.EXPENSE,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    },
                    {
                        "code": "5300",
                        "name": "مصروفات التسويق",
                        "name_en": "Marketing Expenses",
                        "account_type": AccountType.EXPENSE,
                        "level": 2,
                        "is_leaf": True,
                        "is_budgetable": True
                    }
                ]
            }
        ]
        
        def create_account_recursive(account_data, parent_id=None, company_id=None):
            """Create account and its children recursively"""
            # Create unique code for each company
            unique_code = f"{account_data['code']}_{company_id}" if company_id else account_data["code"]
            
            # Create current account
            account = Account(
                code=unique_code,
                name=account_data["name"],
                name_en=account_data["name_en"],
                account_type=account_data["account_type"],
                parent_id=parent_id,
                level=account_data["level"],
                is_leaf=account_data["is_leaf"],
                is_budgetable=account_data["is_budgetable"],
                company_id=company_id,
                is_active=True
            )
            
            db.add(account)
            db.flush()  # Get the ID
            
            # Create children if they exist
            if "children" in account_data and account_data["children"]:
                for child_data in account_data["children"]:
                    create_account_recursive(child_data, account.id, company_id)
            
            return account
        
        # Create chart of accounts for each company
        for company in companies:
            print(f"Creating chart of accounts for company {company.id}")
            
            for account_data in chart_structure:
                create_account_recursive(account_data, None, company.id)
        
        db.commit()
        print("Chart of accounts created successfully for all companies!")
        
    except Exception as e:
        print(f"Error creating chart of accounts: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_chart_of_accounts()
