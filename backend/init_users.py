"""
Initialize Users - تهيئة المستخدمين
Create initial users for the system
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.company import Company
from app.core.security import get_password_hash


def init_users():
    """Initialize users - تهيئة المستخدمين"""
    db = SessionLocal()
    try:
        # Delete all existing users first
        print("Deleting all existing users...")
        db.query(User).delete()
        db.commit()
        print("All users deleted")
        
        # Create admin user
        print("\nCreating admin user...")
        admin = User(
            username="admin",
            email="admin@sareh.com",
            full_name="System Admin",
            password_hash=get_password_hash("admin"),
            role=UserRole.ADMIN,
            company_id=None,
            is_active=True,
            is_verified=True
        )
        db.add(admin)
        print("Admin user created: admin / admin")
        
        # Get all companies
        companies = db.query(Company).all()
        print(f"\nFound {len(companies)} companies")
        
        # Create users for each company
        for idx, company in enumerate(companies, 1):
            # Company Admin
            admin_user = User(
                username=f"admin{idx}",
                email=f"admin{idx}@sareh.com",
                full_name=f"Admin {company.name_en}",
                password_hash=get_password_hash("admin"),
                role=UserRole.COMPANY_ADMIN,
                company_id=company.id,
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)
            
            # Company User
            user = User(
                username=f"company{idx}",
                email=f"company{idx}@sareh.com",
                full_name=f"User {company.name_en}",
                password_hash=get_password_hash("123456"),
                role=UserRole.COMPANY_USER,
                company_id=company.id,
                is_active=True,
                is_verified=True
            )
            db.add(user)
            
            print(f"Created users for Company {idx}: admin{idx}/admin, company{idx}/123456")
        
        db.commit()
        
        print("\n" + "=" * 70)
        print("ALL USERS CREATED SUCCESSFULLY!")
        print("=" * 70)
        print("\nLOGIN ACCOUNTS:")
        print("-" * 70)
        print("System Admin:")
        print("  Username: admin")
        print("  Password: admin")
        print("  Role: Full System Access")
        print()
        
        for idx in range(1, len(companies) + 1):
            print(f"Company {idx}:")
            print(f"  Admin: admin{idx} / admin (Company Admin)")
            print(f"  User: company{idx} / 123456 (Company User)")
            print()
        
        print("=" * 70)
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_users()
