"""Update existing administration records directly in the SQLite DB."""
import sqlite3

conn = sqlite3.connect('data/campus_assistant.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Check current records
rows = cur.execute("SELECT * FROM administration").fetchall()
print("Current records:")
for r in rows:
    print(f"  id={r['id']} name={r['name']} designation={r['designation']}")

# Update Principal
cur.execute("UPDATE administration SET name = ? WHERE designation = ?",
            ("Y.V.Hanumanthu Rao", "Principal"))
print(f"\nPrincipal rows updated: {cur.rowcount}")

# Update Dean of Academics
cur.execute("UPDATE administration SET name = ? WHERE designation = ?",
            ("Dr. Challaram", "Dean of Academics"))
print(f"Dean of Academics rows updated: {cur.rowcount}")

# Update Dean of Students (if exists)
cur.execute("UPDATE administration SET name = ? WHERE designation IN (?, ?)",
            ("Dr. Vasu Babu", "Dean of Students", "Dean of Student Affairs & Student Welfare"))
print(f"Dean of Students rows updated: {cur.rowcount}")

# Insert Dean of Students if not present
existing = cur.execute("SELECT id FROM administration WHERE designation = ?",
                       ("Dean of Students",)).fetchone()
if not existing:
    cur.execute("INSERT INTO administration (name, designation, department, email, phone) VALUES (?,?,?,?,?)",
                ("Dr. Vasu Babu", "Dean of Students", "Student Affairs",
                 "dean.students@qiscet.edu.in", "+91 90000 66666"))
    print("Inserted Dean of Students record")

# Update FAQs - Principal name
cur.execute("""UPDATE faqs SET answer = REPLACE(answer, 'Dr. Kavitha Iyer', 'Y.V.Hanumanthu Rao')
               WHERE answer LIKE '%Dr. Kavitha Iyer%'""")
print(f"FAQ rows updated (principal): {cur.rowcount}")

# Update FAQs - Dean of Academics
cur.execute("""UPDATE faqs SET answer = REPLACE(answer, 'Dr. K. Venkateswarlu', 'Dr. Challaram')
               WHERE answer LIKE '%Dr. K. Venkateswarlu%'""")
print(f"FAQ rows updated (dean academics): {cur.rowcount}")

conn.commit()

# Verify
print("\nUpdated records:")
rows = cur.execute("SELECT * FROM administration").fetchall()
for r in rows:
    print(f"  id={r['id']} name={r['name']} designation={r['designation']}")

conn.close()
print("\nDone!")
