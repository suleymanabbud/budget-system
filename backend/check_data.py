import sqlite3

conn = sqlite3.connect('budget_system.db')
cursor = conn.cursor()

# Check liabilities
cursor.execute('SELECT id, code, name, account_type FROM accounts WHERE company_id = 1 AND code LIKE "2-%" LIMIT 5')
rows = cursor.fetchall()
print('Liabilities:')
for row in rows:
    print(f'ID: {row[0]}, Code: {row[1]}, Name: {row[2]}, Type: {row[3]}')

# Check revenues
cursor.execute('SELECT id, code, name, account_type FROM accounts WHERE company_id = 1 AND code LIKE "4-%" LIMIT 5')
rows = cursor.fetchall()
print('\nRevenues:')
for row in rows:
    print(f'ID: {row[0]}, Code: {row[1]}, Name: {row[2]}, Type: {row[3]}')

# Check expenses
cursor.execute('SELECT id, code, name, account_type FROM accounts WHERE company_id = 1 AND code LIKE "5-%" LIMIT 5')
rows = cursor.fetchall()
print('\nExpenses:')
for row in rows:
    print(f'ID: {row[0]}, Code: {row[1]}, Name: {row[2]}, Type: {row[3]}')

conn.close()
