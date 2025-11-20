"""
Initialize Database with Sample Data
إنشاء قاعدة البيانات مع بيانات تجريبية
"""
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models import Company, Product, Budget, BudgetType, Quarter

def init_db():
    """Initialize database with sample data"""
    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(Company).first():
            print("Database already initialized!")
            return
        
        # Create Companies (5 companies)
        print("Creating companies...")
        companies_data = [
            {"name": "الشركة الأولى", "name_en": "First Company", "code": "COMP001", "description": "الشركة الأولى للتجارة والصناعة"},
            {"name": "الشركة الثانية", "name_en": "Second Company", "code": "COMP002", "description": "الشركة الثانية للاستثمار"},
            {"name": "الشركة الثالثة", "name_en": "Third Company", "code": "COMP003", "description": "الشركة الثالثة للخدمات"},
            {"name": "الشركة الرابعة", "name_en": "Fourth Company", "code": "COMP004", "description": "الشركة الرابعة للتطوير"},
            {"name": "الشركة الخامسة", "name_en": "Fifth Company", "code": "COMP005", "description": "الشركة الخامسة للتقنية"},
        ]
        
        companies = []
        for comp_data in companies_data:
            company = Company(**comp_data)
            db.add(company)
            companies.append(company)
        
        db.commit()
        print(f"Created {len(companies)} companies")
        
        # Create Products
        print("Creating products...")
        products_data = [
            {"name": "منتج A", "name_en": "Product A", "code": "PROD001", "unit_of_measurement": "قطعة"},
            {"name": "منتج B", "name_en": "Product B", "code": "PROD002", "unit_of_measurement": "كيلوجرام"},
            {"name": "منتج C", "name_en": "Product C", "code": "PROD003", "unit_of_measurement": "متر"},
            {"name": "منتج D", "name_en": "Product D", "code": "PROD004", "unit_of_measurement": "لتر"},
            {"name": "منتج E", "name_en": "Product E", "code": "PROD005", "unit_of_measurement": "صندوق"},
        ]
        
        products = []
        for prod_data in products_data:
            product = Product(**prod_data)
            db.add(product)
            products.append(product)
        
        db.commit()
        print(f"Created {len(products)} products")
        
        # Create Sample Budgets
        print("Creating sample budgets...")
        import random
        
        budget_count = 0
        for company in companies:
            for month in range(1, 13):  # 12 months
                quarter = f"Q{(month-1)//3 + 1}"
                
                # Create 2-3 budget entries per month per company
                for _ in range(random.randint(2, 3)):
                    product = random.choice(products)
                    
                    # Estimated budget
                    estimated_qty = random.randint(100, 1000)
                    estimated_price = random.randint(10, 100)
                    
                    estimated_budget = Budget(
                        year=2025,
                        quarter=Quarter[quarter],
                        month=month,
                        company_id=company.id,
                        product_id=product.id,
                        budget_type=BudgetType.ESTIMATED,
                        quantity=estimated_qty,
                        price=estimated_price,
                        notes="موازنة تقريبية تجريبية"
                    )
                    estimated_budget.calculate_total()
                    db.add(estimated_budget)
                    budget_count += 1
                    
                    # Actual budget (80-120% of estimated)
                    actual_qty = int(estimated_qty * random.uniform(0.8, 1.2))
                    actual_price = int(estimated_price * random.uniform(0.9, 1.1))
                    
                    actual_budget = Budget(
                        year=2025,
                        quarter=Quarter[quarter],
                        month=month,
                        company_id=company.id,
                        product_id=product.id,
                        budget_type=BudgetType.ACTUAL,
                        quantity=actual_qty,
                        price=actual_price,
                        notes="موازنة فعلية تجريبية"
                    )
                    actual_budget.calculate_total()
                    db.add(actual_budget)
                    budget_count += 1
        
        db.commit()
        print(f"Created {budget_count} budget entries")
        
        print("\n✅ Database initialized successfully!")
        print(f"   - {len(companies)} companies")
        print(f"   - {len(products)} products")
        print(f"   - {budget_count} budget entries")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

