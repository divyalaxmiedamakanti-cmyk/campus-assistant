import sqlite3
conn = sqlite3.connect('campus_assistant.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [r[0] for r in cursor.fetchall()]
print("TABLES:", tables)
for t in tables:
    cursor.execute(f"PRAGMA table_info({t})")
    cols = cursor.fetchall()
    print(f"\n--- {t} ---")
    for c in cols:
        print(c)
conn.close()
