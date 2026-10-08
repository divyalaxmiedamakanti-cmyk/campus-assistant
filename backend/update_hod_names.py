import sqlite3
conn = sqlite3.connect('data/campus_assistant.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Show all Mehta users
mehta_users = cur.execute("SELECT id,name,email FROM users WHERE name LIKE '%Mehta%'").fetchall()
print("Mehta users found:")
for r in mehta_users: print(f"  id={r['id']} {r['name']} {r['email']}")

# Delete all duplicate/old Mehta faculty users - keep only one and rename it
for i, r in enumerate(mehta_users):
    if i == 0:
        # First one: update name only, keep or change email if not taken
        vara_exists = cur.execute("SELECT id FROM users WHERE email='vara.prasad@qiscet.edu.in'").fetchone()
        if vara_exists:
            cur.execute("DELETE FROM users WHERE id=?", (r['id'],))
            print(f"Deleted dup id={r['id']}")
        else:
            cur.execute("UPDATE users SET name='Dr. Vara Prasad', email='vara.prasad@qiscet.edu.in' WHERE id=?", (r['id'],))
            print(f"Updated id={r['id']} -> Dr. Vara Prasad")
    else:
        cur.execute("DELETE FROM users WHERE id=?", (r['id'],))
        print(f"Deleted duplicate id={r['id']}")

# Ensure vara.prasad@qiscet.edu.in user has right name
cur.execute("UPDATE users SET name='Dr. Vara Prasad' WHERE email='vara.prasad@qiscet.edu.in'")

# Admin directory - update Mehta entries
cur.execute("UPDATE administration SET name='Dr. Vara Prasad', email='vara.prasad@qiscet.edu.in' WHERE name LIKE '%Mehta%'")
print(f"Admin: {cur.rowcount}")

# Add Bujji Babu if not there
if not cur.execute("SELECT id FROM administration WHERE name LIKE '%Bujji%'").fetchone():
    cur.execute("INSERT INTO administration (name, designation, department, email, phone) VALUES (?,?,?,?,?)",
                ("Dr. Bujji Babu", "Head of Department (CSE)", "Computer Science & Engineering", "hod.cse@qiscet.edu.in", "+91 90000 22223"))
    print("Inserted Dr. Bujji Babu")

cur.execute("UPDATE faqs SET answer=REPLACE(answer,'Prof. Mehta','Dr. Vara Prasad') WHERE answer LIKE '%Prof. Mehta%'")
cur.execute("UPDATE notices SET posted_by='Dr. Vara Prasad' WHERE posted_by LIKE '%Mehta%'")
conn.commit()

print("\n=== Final State ===")
print("Faculty users:")
for r in cur.execute("SELECT id,name,email FROM users WHERE role='faculty'").fetchall():
    print(f"  {r['id']} | {r['name']} | {r['email']}")
print("Admin directory:")
for r in cur.execute("SELECT id,name,designation FROM administration ORDER BY id").fetchall():
    print(f"  {r['id']} | {r['name']} | {r['designation']}")
conn.close()
print("Done!")
