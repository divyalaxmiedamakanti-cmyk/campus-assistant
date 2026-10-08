import sqlite3

conn = sqlite3.connect('campus_assistant.db')
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
print('Tables:', [t[0] for t in tables])

for t in tables:
    tname = t[0]
    count = conn.execute(f'SELECT COUNT(*) FROM "{tname}"').fetchone()[0]
    print(f'  {tname}: {count} rows')
    # Print first 3 rows of each table
    rows = conn.execute(f'SELECT * FROM "{tname}" LIMIT 3').fetchall()
    for r in rows:
        print('   ', r)

conn.close()
