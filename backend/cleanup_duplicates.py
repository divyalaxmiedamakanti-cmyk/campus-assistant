"""Fix duplicate administration records and update FAQs."""
import sqlite3

conn = sqlite3.connect('data/campus_assistant.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# Remove duplicate principal (keep id=5 which has the more specific designation)
cur.execute("DELETE FROM administration WHERE id = 1")
cur.execute("DELETE FROM administration WHERE id = 2")
cur.execute("DELETE FROM administration WHERE id = 3")
cur.execute("DELETE FROM administration WHERE id = 4")
print(f"Removed old duplicate records")

# Update FAQs if they exist
cur.execute("SELECT id, question, answer FROM faqs WHERE answer LIKE '%Principal%' OR answer LIKE '%principal%' LIMIT 10")
rows = cur.fetchall()
print(f"\nFAQs with principal mentions: {len(rows)}")
for r in rows:
    print(f"  id={r['id']}: {r['answer'][:80]}...")

conn.commit()

# Final state
print("\nFinal administration records:")
rows = cur.execute("SELECT * FROM administration ORDER BY id").fetchall()
for r in rows:
    print(f"  id={r['id']} | {r['name']} | {r['designation']}")

conn.close()
print("\nDone!")
