import sqlite3

conn = sqlite3.connect('budget_system.db')
cursor = conn.cursor()

# Check all accounts for company 1
cursor.execute('SELECT id, code, name, account_type, parent_id FROM accounts WHERE company_id = 1 ORDER BY id')
rows = cursor.fetchall()
print(f'Total accounts for company 1: {len(rows)}')
print('\nFirst 10 accounts:')
for i, row in enumerate(rows[:10]):
    print(f'{i+1}. ID: {row[0]}, Code: {row[1]}, Name: {row[2]}, Type: {row[3]}, Parent: {row[4]}')

# Check account types
cursor.execute('SELECT DISTINCT account_type FROM accounts WHERE company_id = 1')
types = cursor.fetchall()
print(f'\nAccount types: {[t[0] for t in types]}')

# Check parent-child relationships
cursor.execute('SELECT COUNT(*) FROM accounts WHERE company_id = 1 AND parent_id IS NOT NULL')
child_count = cursor.fetchone()[0]
print(f'Child accounts: {child_count}')

cursor.execute('SELECT COUNT(*) FROM accounts WHERE company_id = 1 AND parent_id IS NULL')
parent_count = cursor.fetchone()[0]
print(f'Parent accounts: {parent_count}')

conn.close()
