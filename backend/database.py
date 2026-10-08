"""
Campus Assistant - Database layer (raw sqlite3, no ORM).
Provides a connection factory, schema bootstrap, and idempotent seeding.
"""
import sqlite3
import os
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash

from config import Config

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student','faculty','admin','cfro_staff','cfss_staff','student_dean')) DEFAULT 'student',
    department TEXT,
    year TEXT,
    college TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    intent TEXT,
    source TEXT DEFAULT 'faq',
    frustrated INTEGER DEFAULT 0,
    flagged INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS doc_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    uploaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER NOT NULL,
    rating TEXT CHECK(rating IN ('up','down')) NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(chat_id) REFERENCES chats(id)
);

CREATE TABLE IF NOT EXISTS fee_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course TEXT NOT NULL,
    convener_fee REAL DEFAULT 0,
    management_fee REAL DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS administration (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    email TEXT,
    phone TEXT
);

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    level TEXT,
    duration TEXT,
    intake INTEGER
);

CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course TEXT NOT NULL,
    subject TEXT NOT NULL,
    exam_date TEXT,
    exam_time TEXT
);

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    roll_number TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL,
    year_semester TEXT NOT NULL,
    section TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS faculty_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    faculty_id TEXT UNIQUE,
    faculty_name TEXT NOT NULL,
    department TEXT NOT NULL,
    designation TEXT NOT NULL,
    subject TEXT,
    email TEXT,
    phone TEXT,
    office_room TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    student_name TEXT,
    roll_number TEXT,
    subject TEXT NOT NULL,
    attended_classes INTEGER DEFAULT 0,
    total_classes INTEGER DEFAULT 0,
    percentage REAL DEFAULT 0,
    grade_points INTEGER DEFAULT 0,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS student_fees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    student_name TEXT,
    roll_number TEXT,
    fee_type TEXT NOT NULL,
    total_fee REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    pending_amount REAL DEFAULT 0,
    amount_due REAL DEFAULT 0,
    amount_paid REAL DEFAULT 0,
    status TEXT CHECK(status IN ('Unpaid', 'Partially Paid', 'Paid')) DEFAULT 'Unpaid',
    due_date TEXT,
    created_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS student_timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT,
    day_of_week TEXT,
    period TEXT,
    period_no INTEGER DEFAULT 1,
    period_time TEXT,
    subject TEXT NOT NULL,
    subject_code TEXT,
    faculty TEXT,
    room TEXT,
    section TEXT NOT NULL,
    branch TEXT DEFAULT 'CSE',
    department TEXT DEFAULT 'Computer Science & Engineering',
    year TEXT DEFAULT '3-1',
    year_semester TEXT DEFAULT '3rd Year - 1st Sem',
    batch_info TEXT,
    subject_type TEXT DEFAULT 'Theory'
);

CREATE TABLE IF NOT EXISTS library_catalog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    category TEXT,
    available_copies INTEGER DEFAULT 0,
    location TEXT
);

CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    deadline TEXT NOT NULL,
    status TEXT CHECK(status IN ('Pending', 'Submitted', 'Graded')) DEFAULT 'Pending',
    grade TEXT
);

CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    package TEXT,
    eligibility TEXT,
    status TEXT CHECK(status IN ('Open', 'Applied', 'Selected', 'Closed')) DEFAULT 'Open',
    drive_date TEXT
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TEXT NOT NULL,
    venue TEXT,
    category TEXT,
    organizer TEXT
);

CREATE TABLE IF NOT EXISTS grievances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK(status IN ('Open', 'In Progress', 'Resolved')) DEFAULT 'Open',
    submitted_at TEXT NOT NULL,
    resolution TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bus_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_no TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    timings TEXT NOT NULL,
    stops TEXT NOT NULL,
    driver_contact TEXT
);

CREATE TABLE IF NOT EXISTS lost_found (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    description TEXT NOT NULL,
    location_found TEXT,
    status TEXT CHECK(status IN ('Lost', 'Found', 'Claimed')) DEFAULT 'Lost',
    reported_at TEXT NOT NULL,
    contact TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hostel_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    block_name TEXT NOT NULL,
    room_no TEXT NOT NULL,
    room_type TEXT NOT NULL,
    warden_name TEXT NOT NULL,
    warden_contact TEXT NOT NULL,
    monthly_rent REAL DEFAULT 0,
    status TEXT DEFAULT 'Allocated'
);

CREATE TABLE IF NOT EXISTS hostel_maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    issue TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT CHECK(status IN ('Open', 'Resolved')) DEFAULT 'Open',
    submitted_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS food_menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_of_week TEXT NOT NULL,
    meal_type TEXT NOT NULL,
    items TEXT NOT NULL,
    timings TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS food_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    meal_id INTEGER NOT NULL,
    rating TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(meal_id) REFERENCES food_menu(id)
);

CREATE TABLE IF NOT EXISTS notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT,
    department TEXT DEFAULT 'All Departments',
    category TEXT DEFAULT 'General',
    posted_by TEXT NOT NULL DEFAULT 'Administration',
    attachment TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fee_structures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    department TEXT NOT NULL,
    course TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    tuition_fee REAL DEFAULT 0,
    exam_fee REAL DEFAULT 0,
    transport_fee REAL DEFAULT 0,
    hostel_fee REAL DEFAULT 0,
    other_fees REAL DEFAULT 0,
    total_fee REAL DEFAULT 0,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS fee_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    fee_type TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_mode TEXT DEFAULT 'Online (UPI / NetBanking)',
    transaction_ref TEXT NOT NULL,
    receipt_no TEXT NOT NULL,
    payment_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('Success', 'Pending', 'Failed')) DEFAULT 'Success',
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fee_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    amount_paid REAL NOT NULL,
    payment_date TEXT NOT NULL,
    fee_type TEXT NOT NULL,
    receipt_notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reimbursement_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    scheme_name TEXT NOT NULL,
    application_no TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    eligible_amount REAL DEFAULT 0,
    sanctioned_amount REAL DEFAULT 0,
    current_stage TEXT NOT NULL DEFAULT 'Application Submitted',
    thumb_auth_status TEXT DEFAULT 'Pending at CFSS Office',
    thumb_auth_notes TEXT,
    college_verification_status TEXT DEFAULT 'Verified',
    required_docs TEXT,
    uploaded_docs TEXT,
    remarks TEXT,
    updated_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS document_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    document_type TEXT NOT NULL,
    purpose TEXT NOT NULL,
    copies INTEGER DEFAULT 1,
    status TEXT CHECK(status IN ('Pending', 'Submitted', 'Under Verification', 'Approved', 'Ready', 'Completed')) DEFAULT 'Submitted',
    remarks TEXT,
    download_url TEXT,
    submitted_at TEXT NOT NULL,
    completed_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS student_support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal',
    status TEXT CHECK(status IN ('Open', 'In Progress', 'Waiting for Student', 'Resolved', 'Closed')) DEFAULT 'Open',
    response TEXT,
    assigned_to TEXT DEFAULT 'CFSS Desk Officer',
    submitted_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cfro_announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Fee Deadline',
    deadline_date TEXT,
    priority TEXT DEFAULT 'Normal',
    posted_by TEXT DEFAULT 'CFRO Office',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cfss_announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'Student Support',
    target_audience TEXT DEFAULT 'All Students',
    posted_by TEXT DEFAULT 'Student Dean Office',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cfss_dean_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dean_name TEXT NOT NULL,
    designation TEXT NOT NULL,
    office_location TEXT NOT NULL,
    office_timings TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    instructions TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    created_at TEXT NOT NULL
);
"""


def get_db():
    os.makedirs(os.path.dirname(Config.DB_PATH), exist_ok=True)
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def init_db():
    conn = get_db()
    conn.executescript(SCHEMA)
    conn.commit()

    # Migration: check if chats table has old restrictive CHECK constraint
    chat_sql = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='chats'").fetchone()
    if chat_sql and "CHECK" in (chat_sql["sql"] or "").upper():
        conn.execute("ALTER TABLE chats RENAME TO chats_old")
        conn.executescript(SCHEMA)
        conn.execute(
            "INSERT INTO chats (id, user_id, query, response, intent, source, frustrated, flagged, created_at) "
            "SELECT id, user_id, query, response, intent, source, frustrated, flagged, created_at FROM chats_old"
        )
        conn.execute("DROP TABLE chats_old")
        conn.commit()

    # Migration: check if users table has old role CHECK constraint without cfro_staff
    user_sql = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'").fetchone()
    if user_sql and "'cfro_staff'" not in (user_sql["sql"] or ""):
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("ALTER TABLE users RENAME TO users_old")
        conn.execute(
            """CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('student','faculty','admin','cfro_staff','cfss_staff','student_dean')) DEFAULT 'student',
                department TEXT,
                year TEXT,
                college TEXT,
                created_at TEXT NOT NULL
            )"""
        )
        conn.execute(
            "INSERT INTO users (id, name, email, password_hash, role, department, year, college, created_at) "
            "SELECT id, name, email, password_hash, role, department, year, college, created_at FROM users_old"
        )
        conn.execute("DROP TABLE users_old")
        conn.execute("PRAGMA foreign_keys = ON")
        conn.commit()

    # Migration: ensure no tables reference users_old
    conn.execute("PRAGMA foreign_keys = OFF")
    tables_with_old = [
        r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND sql LIKE '%users_old%'").fetchall()
    ]
    for t in tables_with_old:
        row = conn.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name=?", (t,)).fetchone()
        if row:
            new_sql = row[0].replace('users_old', 'users')
            data = conn.execute(f"SELECT * FROM {t}").fetchall()
            cols = [d[0] for d in conn.execute(f"PRAGMA table_info({t})").fetchall()]
            conn.execute(f"DROP TABLE {t}")
            conn.execute(new_sql)
            if data:
                placeholders = ','.join(['?'] * len(cols))
                conn.executemany(f"INSERT INTO {t} VALUES ({placeholders})", data)
    conn.execute("PRAGMA foreign_keys = ON")
    conn.commit()

    # Migration: ensure all users and records reflect QIS College of Engineering and Technology
    conn.execute("UPDATE users SET college = 'QIS College of Engineering and Technology' WHERE college LIKE '%Ridgeview%' OR college IS NULL")
    conn.commit()

    _migrate_columns(conn)
    _seed(conn)
    conn.close()


def _migrate_columns(conn):
    """Safely adds any missing columns across the 6 management tables."""
    cur = conn.cursor()

    # Helper to check and add column
    def add_col_if_missing(table, col_name, col_type):
        try:
            cols = [d[1] for d in cur.execute(f"PRAGMA table_info({table})").fetchall()]
            if col_name not in cols:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
        except Exception as e:
            print(f"Migration note for {table}.{col_name}: {e}")

    # 1. students table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        roll_number TEXT NOT NULL UNIQUE,
        department TEXT NOT NULL,
        year_semester TEXT NOT NULL,
        section TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
    """)

    # 2. faculty_members table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS faculty_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        faculty_id TEXT UNIQUE,
        faculty_name TEXT NOT NULL,
        department TEXT NOT NULL,
        designation TEXT NOT NULL,
        subject TEXT,
        email TEXT,
        phone TEXT,
        office_room TEXT,
        created_at TEXT NOT NULL
    )
    """)

    # 3. student_fees table columns
    add_col_if_missing("student_fees", "student_name", "TEXT")
    add_col_if_missing("student_fees", "roll_number", "TEXT")
    add_col_if_missing("student_fees", "total_fee", "REAL DEFAULT 0")
    add_col_if_missing("student_fees", "paid_amount", "REAL DEFAULT 0")
    add_col_if_missing("student_fees", "pending_amount", "REAL DEFAULT 0")
    add_col_if_missing("student_fees", "due_date", "TEXT")
    add_col_if_missing("student_fees", "created_at", "TEXT")

    # 4. attendance table columns
    add_col_if_missing("attendance", "user_id", "INTEGER")
    add_col_if_missing("attendance", "student_name", "TEXT")
    add_col_if_missing("attendance", "roll_number", "TEXT")
    add_col_if_missing("attendance", "updated_at", "TEXT")

    # 5. notices table columns
    add_col_if_missing("notices", "date", "TEXT")
    add_col_if_missing("notices", "department", "TEXT DEFAULT 'All Departments'")
    add_col_if_missing("notices", "attachment", "TEXT")

    # 6. student_timetable table columns
    add_col_if_missing("student_timetable", "day", "TEXT")
    add_col_if_missing("student_timetable", "period", "TEXT")
    add_col_if_missing("student_timetable", "department", "TEXT DEFAULT 'CSE'")
    add_col_if_missing("student_timetable", "year_semester", "TEXT DEFAULT '3-1'")

    conn.commit()


def _seed(conn):
    cur = conn.cursor()

    # --- Seed admin + demo accounts ---
    demo_users = [
        ("Campus Admin", "admin@college.edu", "admin123", "admin", "Administration", None, "QIS College of Engineering and Technology"),
        ("Campus Admin", "admin@qiscet.edu.in", "admin123", "admin", "Administration", None, "QIS College of Engineering and Technology"),
        ("Asha Rao", "asha.student@qiscet.edu.in", "student123", "student", "Computer Science", "3rd Year", "QIS College of Engineering and Technology"),
        ("Dr. Vara Prasad", "vara.prasad@qiscet.edu.in", "faculty123", "faculty", "Computer Science", None, "QIS College of Engineering and Technology"),
    ]
    for name, email, pw, role, dept, year, college in demo_users:
        existing = cur.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if not existing:
            cur.execute(
                "INSERT INTO users (name, email, password_hash, role, department, year, college, created_at) VALUES (?,?,?,?,?,?,?,?)",
                (name, email, generate_password_hash(pw), role, dept, year, college, now_iso()),
            )
        else:
            cur.execute(
                "UPDATE users SET password_hash = ?, role = ? WHERE email = ?",
                (generate_password_hash(pw), role, email)
            )

    # --- Seed Students (Student Information) ---
    cur.execute("SELECT COUNT(*) c FROM students")
    if cur.fetchone()["c"] == 0:
        students_seed = [
            (2, "Asha Rao", "24491A4225", "Computer Science & Engineering", "3rd Year - 1st Sem", "CSE-A", "asha.student@qiscet.edu.in", "+91 98480 12345", now_iso()),
            (None, "Rahul Varma", "24491A4226", "Computer Science & Engineering", "3rd Year - 1st Sem", "CSE-A", "rahul.varma@qiscet.edu.in", "+91 98480 12346", now_iso()),
            (None, "Divya Sri", "24491A4227", "Artificial Intelligence & Data Science", "3rd Year - 1st Sem", "AIML-B", "divya.sri@qiscet.edu.in", "+91 98480 12347", now_iso()),
            (None, "Sai Teja", "24491A4228", "Electronics & Communication", "2nd Year - 2nd Sem", "ECE-A", "sai.teja@qiscet.edu.in", "+91 98480 12348", now_iso()),
            (None, "Sneha Reddy", "24491A4229", "Computer Science & Engineering", "3rd Year - 1st Sem", "CSE-B", "sneha.reddy@qiscet.edu.in", "+91 98480 12349", now_iso()),
            (None, "Manoj Kumar", "24491A4230", "Management Studies", "2nd Year - 1st Sem", "MBA-A", "manoj.k@qiscet.edu.in", "+91 98480 12350", now_iso()),
        ]
        cur.executemany(
            "INSERT INTO students (user_id, name, roll_number, department, year_semester, section, email, phone, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            students_seed
        )

    # --- Seed Faculty Information (faculty_members) ---
    cur.execute("SELECT COUNT(*) c FROM faculty_members")
    if cur.fetchone()["c"] == 0:
        faculty_seed = [
            ("FAC-CSE-001", "Dr. Vara Prasad", "Computer Science & Engineering", "Head of Department (CSE & AIML)", "Machine Learning / Deep Learning", "vara.prasad@qiscet.edu.in", "+91 90000 22222", "CSE Block Room 201", now_iso()),
            ("FAC-CSE-002", "Dr. Bujji Babu", "Computer Science & Engineering", "Head of Department (CSE)", "Operating Systems / Cloud Computing", "hod.cse@qiscet.edu.in", "+91 90000 22223", "CSE Block Room 204", now_iso()),
            ("FAC-ACAD-003", "Dr. Challaram", "Computer Science & Engineering", "Dean of Academics", "Database Management Systems", "dean.academics@qiscet.edu.in", "+91 90000 55555", "Admin Block Room 105", now_iso()),
            ("FAC-STU-004", "Dr. Vasu Babu", "Student Affairs", "Dean of Students", "Professional Ethics & Social Values", "dean.students@qiscet.edu.in", "+91 90000 66666", "Student Affairs Room 104", now_iso()),
            ("FAC-MATH-005", "Prof. K. Ramesh", "Humanities & Sciences", "Associate Professor", "Discrete Mathematics & Graph Theory", "ramesh.math@qiscet.edu.in", "+91 90000 77788", "H&S Block Room 102", now_iso()),
            ("FAC-CSE-006", "Dr. S. Lakshmi", "Computer Science & Engineering", "Professor", "Computer Networks & Cyber Security", "lakshmi.cse@qiscet.edu.in", "+91 90000 88899", "CSE Block Room 205", now_iso()),
            ("FAC-CSM-001", "Bindu", "Computer Science & Machine Learning (CSM)", "Associate Professor", "Machine Learning & Deep Learning", "bindu.csm@qiscet.edu.in", "+91 90000 11101", "CSM Block Room 101", now_iso()),
            ("FAC-CSM-002", "Koteswar Rao", "Computer Science & Machine Learning (CSM)", "Assistant Professor", "Computer Networks & Protocols", "koteswarrao.csm@qiscet.edu.in", "+91 90000 11102", "CSM Block Room 102", now_iso()),
            ("FAC-CSM-003", "Nikhil", "Computer Science & Machine Learning (CSM)", "Assistant Professor", "Data Structures & Algorithms", "nikhil.csm@qiscet.edu.in", "+91 90000 11103", "CSM Block Room 103", now_iso()),
            ("FAC-CSM-004", "Bhaskar Rao", "Computer Science & Machine Learning (CSM)", "Associate Professor", "AI & Expert Systems", "bhaskarrao.csm@qiscet.edu.in", "+91 90000 11104", "CSM Block Room 104", now_iso()),
            ("FAC-AIDS-001", "Durga", "Artificial Intelligence & Data Science (AIDS)", "Associate Professor", "Artificial Intelligence & Data Mining", "durga.aids@qiscet.edu.in", "+91 90000 22201", "AIDS Block Room 201", now_iso()),
            ("FAC-AIDS-002", "Srinilai", "Artificial Intelligence & Data Science (AIDS)", "Assistant Professor", "Data Visualization & Analytics", "srinilai.aids@qiscet.edu.in", "+91 90000 22202", "AIDS Block Room 202", now_iso()),
            ("FAC-AIDS-003", "Rabbani Basha", "Artificial Intelligence & Data Science (AIDS)", "Assistant Professor", "Big Data Analytics & NLP", "rabbanibasha.aids@qiscet.edu.in", "+91 90000 22203", "AIDS Block Room 203", now_iso()),
        ]
        cur.executemany(
            "INSERT INTO faculty_members (faculty_id, faculty_name, department, designation, subject, email, phone, office_room, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
            faculty_seed
        )

    # --- Seed or update comprehensive FAQs (Student, Faculty, Admin) ---
    qiscet_faqs = [
        # Student-related FAQs
        ("What is the mandatory attendance requirement for students?", "Under QISCET Autonomous R23 regulations, students must maintain a minimum of 75% aggregate attendance. Condonation for medical reasons is permitted between 65% and 74% upon submission of verified medical records and payment of condonation fee. Students with attendance below 65% will be detained.", "attendance"),
        ("What is the last date to pay semester fees?", "Semester fees are due by the 10th of every semester's opening month. Payments can be made online via the QIS Billing Gateway on the e-CAP portal. A late fee of ₹500 per week applies after the deadline.", "fees"),
        ("Where can I find the academic calendar and exam schedule?", "The academic calendar and exam timetables are published on the Notice Board and Examinations tab of your e-CAP dashboard. Mid-Semester exams and Semester-End Theory & Lab exams are scheduled per the R23 Academic Scheme.", "academics"),
        ("What are the placement companies visiting QIS College?", "Top recruiters visiting QISCET include Google (32 LPA), Microsoft (18 LPA), Amazon (12 LPA), TCS (4.5 LPA), Wipro, and Infosys. Eligibility typically requires CGPA ≥ 7.5 or 8.0 with no active backlogs.", "placements"),
        ("What are the hostel facilities and monthly rent at QIS College?", "QISCET provides separate Boys Hostel (Block B) and Girls Hostel (Block A) with 2-share AC and non-AC rooms. Monthly rent is ₹7,500. Wardens: Mr. Shankar (+91 90000 88888) for Boys and Mrs. Lakshmi (+91 90000 77777) for Girls.", "hostel"),
        ("What are the college bus routes and timings?", "QISCET operates college buses across 4 major routes (Koti, Kukatpally, Uppal, LB Nagar and surrounding areas). Buses depart starting at 07:10 AM to 07:30 AM to ensure arrival on campus by 08:30 AM. Contact Transport Cell at +91 98765 43210.", "transport"),
        ("How do I submit assignments and check deadlines?", "Assignments are listed on the Assignments section of your e-CAP portal with subject codes, titles, and due dates. Completed assignments must be submitted before the deadline to receive grades.", "academics"),
        ("What are the library timings and borrowing rules?", "The Central Library is open Monday to Saturday from 08:00 AM to 08:00 PM. Students can borrow up to 4 books for a 14-day loan period using their Digital Student ID.", "library"),

        # Faculty-related FAQs
        ("Which subjects and sections are assigned to the faculty?", "Faculty teaching assignments for R23 include: 1) Machine Learning (Course ID 23AI501, Section AIML-2, II B.Tech, 50 students, Theory), 2) Deep Learning Lab (Course ID 23DS602, Section CSDS-3, III B.Tech, 50 students, Lab), and 3) Neural Networks (Course ID 23CS503, Section CSE-5, III B.Tech, 50 students, Theory). Total: 150 students across 3 sections.", "faculty_profile"),
        ("What is the faculty weekly timetable and periods?", "Faculty timetable: Monday (Period 1: Machine Learning AIML-2 Online, Period 3: Deep Learning Lab CSDS-3), Tuesday (Period 2: Neural Networks CSE-5, Period 4: ML AIML-2), Wednesday (Period 1: Deep Learning Lab, Period 3: Neural Networks), Thursday (Period 2: ML AIML-2, Period 4: Neural Networks), Friday (Period 1: Machine Learning, Period 2: Neural Networks).", "faculty_profile"),
        ("What is the designated online class day for faculty?", "Monday is the designated online class day for Section AIML-2 (Machine Learning). Faculty conduct lectures through the digital classroom portal.", "faculty_profile"),
        ("How many total students are assigned to the faculty?", "Faculty is assigned a total of 150 students across 3 sections (50 students each in AIML-2, CSDS-3, and CSE-5).", "faculty_profile"),
        ("How can faculty track pending assignment submissions?", "Faculty can view live submission percentages on the e-CAP Faculty Dashboard and send automated email reminders to students with pending submissions.", "faculty_profile"),
        ("Who is the HOD of Computer Science and Engineering?", "Dr. Bujji Babu is the Head of Department (HOD) for Computer Science & Engineering. Email: hod.cse@qiscet.edu.in, Office: CSE Department Block, Room 204. Dr. Vara Prasad is the HOD for Computer Science & AIML (CSE & AIML). Email: vara.prasad@qiscet.edu.in.", "faculty_profile"),

        # Admin & Governance FAQs
        ("Who is the Principal of QIS College of Engineering and Technology?", "Y.V.Hanumanthu Rao is the Principal of QIS College of Engineering and Technology (Autonomous). Email: principal@qiscet.edu.in, Phone: +91 90000 11111, Office: Principal's Secretariat, Administration Block.", "administration"),
        ("Who is the Examination Controller and where is the exam cell?", "Ramesh Naidu is the Controller of Examinations (COE). For transcript requests, hall tickets, revaluation, and mark sheets, visit the Examination Cell in Room 12 of the Administration Block, or email examcell@qiscet.edu.in (+91 90000 33333).", "administration"),
        ("Who is the Accounts Officer and how do I contact finance?", "Lena Fernandes is the Accounts Officer. For tuition fees, receipts, refunds, and scholarship verifications, contact the Accounts & Finance Office at accounts@qiscet.edu.in (+91 90000 44444).", "administration"),
        ("What is the fee structure for courses at QIS College?", "Annual tuition fee structure: B.Tech Computer Science: Convener ₹45,000, Management ₹1,20,000; B.Tech Electronics: Convener ₹45,000, Management ₹1,10,000; MBA: Convener ₹60,000, Management ₹2,50,000; B.Sc Data Science: Convener ₹40,000, Management ₹95,000.", "fees"),
        ("How do students or parents submit a grievance?", "Grievances can be registered through the Grievance Redressal portal in the e-CAP dashboard or emailed to grievance@qiscet.edu.in. Tickets are reviewed by the College Grievance Committee within 48 business hours.", "administration"),
        ("What are the college administration working hours?", "Administrative offices (Principal Office, Examination Cell, Accounts, Admissions, and Student Affairs) operate Monday through Saturday from 09:00 AM to 05:00 PM.", "administration"),
        ("How do I contact the Anti-Ragging Committee or emergency helpdesk?", "QISCET has a zero-tolerance policy against ragging. 24/7 Anti-Ragging Helpline: +91 90000 11111, Email: antiragging@qiscet.edu.in, or report in-person to the Proctorial Board.", "administration"),
        ("How do I reset my e-CAP portal password?", "Click 'Forgot password' on the login screen, or contact the IT Helpdesk at ithelpdesk@qiscet.edu.in or visit the Server Room, 2nd Floor, Admin Block.", "technical"),
    ]

    for q, a, c in qiscet_faqs:
        exists = cur.execute("SELECT id FROM faqs WHERE question = ?", (q,)).fetchone()
        if not exists:
            cur.execute("INSERT INTO faqs (question, answer, category, created_at) VALUES (?,?,?,?)", (q, a, c, now_iso()))
        else:
            cur.execute("UPDATE faqs SET answer = ?, category = ? WHERE id = ?", (a, c, exists["id"]))

    # --- Seed / update administration directory ---
    qiscet_admins = [
        ("Y.V.Hanumanthu Rao", "Principal", "Administration", "principal@qiscet.edu.in", "+91 90000 11111"),
        ("Dr. Vara Prasad", "Head of Department (CSE & AIML)", "Computer Science & Engineering", "vara.prasad@qiscet.edu.in", "+91 90000 22222"),
        ("Dr. Bujji Babu", "Head of Department (CSE)", "Computer Science & Engineering", "hod.cse@qiscet.edu.in", "+91 90000 22223"),
        ("Ramesh Naidu", "Exam Controller", "Examination Cell", "examcell@qiscet.edu.in", "+91 90000 33333"),
        ("Lena Fernandes", "Accounts Officer", "Finance & Accounts Section", "accounts@qiscet.edu.in", "+91 90000 44444"),
        ("Dr. Challaram", "Dean of Academics", "Academic Section", "dean.academics@qiscet.edu.in", "+91 90000 55555"),
        ("Dr. Vasu Babu", "Dean of Students", "Student Affairs", "dean.students@qiscet.edu.in", "+91 90000 66666"),
        ("Dr. M. Suresh", "Training & Placement Officer", "T&P Cell", "placements@qiscet.edu.in", "+91 90000 77777"),
    ]
    for name, desig, dept, email, phone in qiscet_admins:
        existing_admin = cur.execute("SELECT id FROM administration WHERE email = ?", (email,)).fetchone()
        if not existing_admin:
            cur.execute("INSERT INTO administration (name, designation, department, email, phone) VALUES (?,?,?,?,?)", (name, desig, dept, email, phone))

    # --- Seed courses ---
    cur.execute("SELECT COUNT(*) c FROM courses")
    if cur.fetchone()["c"] == 0:
        courses = [
            ("B.Tech Computer Science", "CSE101", "Undergraduate", "4 years", 120),
            ("B.Tech Electronics", "ECE101", "Undergraduate", "4 years", 90),
            ("MBA", "MBA01", "Postgraduate", "2 years", 60),
            ("B.Sc Data Science", "DS101", "Undergraduate", "3 years", 60),
        ]
        cur.executemany("INSERT INTO courses (name, code, level, duration, intake) VALUES (?,?,?,?,?)", courses)

    # --- Seed exams ---
    cur.execute("SELECT COUNT(*) c FROM exams")
    if cur.fetchone()["c"] == 0:
        exams = [
            ("B.Tech Computer Science", "Data Structures", "2026-11-04", "10:00 AM"),
            ("B.Tech Computer Science", "Operating Systems", "2026-11-07", "10:00 AM"),
            ("B.Tech Computer Science", "Discrete Mathematics", "2026-11-10", "02:00 PM"),
            ("MBA", "Financial Management", "2026-11-05", "09:00 AM"),
        ]
        cur.executemany("INSERT INTO exams (course, subject, exam_date, exam_time) VALUES (?,?,?,?)", exams)

    # --- Seed attendance ---
    cur.execute("SELECT COUNT(*) c FROM attendance")
    if cur.fetchone()["c"] == 0:
        attendance = [
            (2, "Asha Rao", "24491A4225", "Machine Learning", 42, 45, 93.3, 10, now_iso()),
            (2, "Asha Rao", "24491A4225", "Operating Systems", 38, 45, 84.4, 9, now_iso()),
            (2, "Asha Rao", "24491A4225", "Discrete Mathematics", 35, 40, 87.5, 9, now_iso()),
            (2, "Asha Rao", "24491A4225", "Database Management Systems", 43, 45, 95.5, 10, now_iso()),
            (None, "Rahul Varma", "24491A4226", "Machine Learning", 35, 45, 77.8, 8, now_iso()),
            (None, "Divya Sri", "24491A4227", "Python for AI", 38, 40, 95.0, 10, now_iso()),
        ]
        cur.executemany("INSERT INTO attendance (user_id, student_name, roll_number, subject, attended_classes, total_classes, percentage, grade_points, updated_at) VALUES (?,?,?,?,?,?,?,?,?)", attendance)

    # --- Seed library catalog ---
    cur.execute("SELECT COUNT(*) c FROM library_catalog")
    if cur.fetchone()["c"] == 0:
        library = [
            ("Introduction to Algorithms", "Cormen, Leiserson, Rivest, Stein", "978-0262033848", "Computer Science", 3, "Rack C-1"),
            ("Operating System Concepts", "Silberschatz, Galvin, Gagne", "978-1118063330", "Computer Science", 5, "Rack O-2"),
            ("Database System Concepts", "Silberschatz, Korth, Sudarshan", "978-0073523323", "Computer Science", 0, "Rack D-3"),
            ("Clean Code", "Robert C. Martin", "978-0132350884", "Software Engineering", 2, "Rack S-1"),
            ("The C Programming Language", "Kernighan, Ritchie", "978-0131103627", "Programming", 4, "Rack P-4"),
        ]
        cur.executemany("INSERT INTO library_catalog (title, author, isbn, category, available_copies, location) VALUES (?,?,?,?,?,?)", library)

    # --- Seed assignments ---
    cur.execute("SELECT COUNT(*) c FROM assignments")
    if cur.fetchone()["c"] == 0:
        assignments = [
            ("Data Structures", "Red-Black Tree Implementation", "2026-10-10", "Submitted", "A"),
            ("Operating Systems", "CPU Scheduling Simulation", "2026-09-05", "Pending", None),
            ("Discrete Mathematics", "Graph Theory Proofs", "2026-10-01", "Graded", "A+"),
            ("Database Systems", "SQL Query Optimization Lab", "2026-09-12", "Pending", None),
        ]
        cur.executemany("INSERT INTO assignments (subject, title, deadline, status, grade) VALUES (?,?,?,?,?)", assignments)

    # --- Seed placements ---
    cur.execute("SELECT COUNT(*) c FROM placements")
    if cur.fetchone()["c"] == 0:
        placements = [
            ("Google", "Software Engineer", "32 LPA", "CGPA >= 8.5, No Active Backlogs", "Open", "2026-10-15"),
            ("Microsoft", "Support Engineer", "18 LPA", "CGPA >= 8.0", "Applied", "2026-09-28"),
            ("TCS", "Systems Engineer", "4.5 LPA", "No backlogs", "Open", "2026-10-02"),
            ("Amazon", "SDE Intern", "12 LPA", "CGPA >= 7.5", "Selected", "Completed"),
        ]
        cur.executemany("INSERT INTO placements (company, role, package, eligibility, status, drive_date) VALUES (?,?,?,?,?,?)", placements)

    # --- Seed events ---
    cur.execute("SELECT COUNT(*) c FROM events")
    if cur.fetchone()["c"] == 0:
        events = [
            ("Daksh 2026", "Annual Techno-Cultural Fest with 3 days of music, dance, coding, and sports activities.", "2026-10-20 to 2026-10-22", "Main Ground & Auditorium", "Fest", "Student Council"),
            ("AI/ML Hackathon", "24-hour non-stop hackathon solving real-world campus problems using machine learning models.", "2026-09-15", "CSE Lab 3", "Technical", "CSI Student Branch"),
            ("National Sports Meet", "Inter-college athletics, basketball, football tournaments, and indoor chess matches.", "2026-11-01", "Sports Arena", "Sports", "Physical Education Dept"),
            ("Ethical Hacking Workshop", "Hands-on session on cybersecurity basics, network penetration testing, and secure coding.", "2026-09-08", "E-Classroom 1", "Workshop", "Cyber Security Club"),
        ]
        cur.executemany("INSERT INTO events (title, description, event_date, venue, category, organizer) VALUES (?,?,?,?,?,?)", events)

    # --- Seed bus routes ---
    cur.execute("SELECT COUNT(*) c FROM bus_routes")
    if cur.fetchone()["c"] == 0:
        bus = [
            ("Route 1", "Koti", "Campus", "07:30 AM", "Koti, Abids, Secunderabad, Campus", "+91 98765 43210"),
            ("Route 2", "Kukatpally", "Campus", "07:15 AM", "Kukatpally, Miyapur, Gachibowli, Campus", "+91 98765 43211"),
            ("Route 3", "Uppal", "Campus", "07:30 AM", "Uppal, Tarnaka, Habsiguda, Campus", "+91 98765 43212"),
            ("Route 4", "LB Nagar", "Campus", "07:10 AM", "LB Nagar, Dilsukhnagar, Malakpet, Campus", "+91 98765 43213"),
        ]
        cur.executemany("INSERT INTO bus_routes (route_no, source, destination, timings, stops, driver_contact) VALUES (?,?,?,?,?,?)", bus)

    # --- Seed lost & found ---
    cur.execute("SELECT COUNT(*) c FROM lost_found")
    if cur.fetchone()["c"] == 0:
        lost_found = [
            ("Black Laptop Charger", "Lenovo 65W USB-C charger found plugged in under the desk.", "Seminar Hall 2", "Found", "2026-08-26", "Admin Desk, Admin Block"),
            ("Scientific Calculator Casio", "Casio fx-991EX calculator with name sticker 'Asha Rao'.", "Canteen Area", "Lost", "2026-08-25", "Asha Rao (asha.student@college.edu)"),
            ("Keys with red keychain", "House keys with a rubber red Ferrari keychain.", "Sports Arena", "Claimed", "2026-08-24", "Physical Director Office"),
        ]
        cur.executemany("INSERT INTO lost_found (item_name, description, location_found, status, reported_at, contact) VALUES (?,?,?,?,?,?)", lost_found)

    # --- Seed hostel details ---
    cur.execute("SELECT COUNT(*) c FROM hostel_details")
    if cur.fetchone()["c"] == 0:
        hostel = [
            ("Boys Block B", "B-204", "2-Share AC", "Mr. Shankar", "+91 90000 88888", 7500.0, "Allocated"),
            ("Girls Block A", "A-102", "2-Share AC", "Mrs. Lakshmi", "+91 90000 77777", 7500.0, "Vacant"),
        ]
        cur.executemany("INSERT INTO hostel_details (block_name, room_no, room_type, warden_name, warden_contact, monthly_rent, status) VALUES (?,?,?,?,?,?,?)", hostel)

    # --- Seed food menu ---
    cur.execute("SELECT COUNT(*) c FROM food_menu")
    if cur.fetchone()["c"] == 0:
        food = [
            ("Monday", "Breakfast", "Idli (4), Vada (1), Sambhar, Coconut Chutney, Tea/Coffee", "07:30 AM - 09:00 AM"),
            ("Monday", "Lunch", "Rice, Roti, Tadka Dal, Mixed Veg Curry, Papad, Curd", "12:30 PM - 02:00 PM"),
            ("Monday", "Snacks", "Samosa (2), Mint Chutney, Tea/Coffee", "04:30 PM - 05:30 PM"),
            ("Monday", "Dinner", "Jeera Rice, Butter Roti, Paneer Butter Masala, Fruit Salad", "07:30 PM - 09:00 PM"),
            ("Tuesday", "Breakfast", "Puri (3), Potato Curry, Rava Kesari, Tea/Coffee", "07:30 AM - 09:00 AM"),
            ("Tuesday", "Lunch", "Rice, Roti, Sambhar, Bhindi Fry, Curd", "12:30 PM - 02:00 PM"),
            ("Tuesday", "Snacks", "Mirchi Bajji (3), Onion Salad, Tea", "04:30 PM - 05:30 PM"),
            ("Tuesday", "Dinner", "Rice, Roti, Chicken Curry / Paneer Tikka, Ice Cream", "07:30 PM - 09:00 PM"),
            ("Wednesday", "Breakfast", "Dosa (Plain/Masala), Sambhar, Ginger Chutney, Tea", "07:30 AM - 09:00 AM"),
            ("Wednesday", "Lunch", "Veg Biryani, Raita, Shahi Paneer, Double Ka Meetha", "12:30 PM - 02:00 PM"),
            ("Wednesday", "Snacks", "Aloo Bonda (2), Chutney, Tea/Coffee", "04:30 PM - 05:30 PM"),
            ("Wednesday", "Dinner", "Rice, Roti, Methi Chaman, Dal Fry, Curd", "07:30 PM - 09:00 PM"),
        ]
        cur.executemany("INSERT INTO food_menu (day_of_week, meal_type, items, timings) VALUES (?,?,?,?)", food)

    # --- Seed notices (Notices module) ---
    cur.execute("SELECT COUNT(*) c FROM notices")
    if cur.fetchone()["c"] == 0:
        notices = [
            ("Mid-Semester Examinations Schedule (R23 Autonomous)", "The Mid-Semester theory and practical examinations for B.Tech III Year will commence from Oct 15. Detailed timetable is published.", "2026-10-01", "Examination Cell", "Exams", "Ramesh Naidu (COE)", "mid_sem_timetable.pdf", now_iso()),
            ("Academic Fee Payment Fall 2026-27 Final Notice", "All students are instructed to clear their outstanding tuition and hostel fee dues for the fall semester before the due date.", "2026-09-28", "Finance & Accounts", "Fees", "Lena Fernandes (Accounts)", "fee_structure_r23.pdf", now_iso()),
            ("Daksh 2026 Annual Techno-Cultural Fest Registrations", "Registrations for technical hackathons, coding challenges, robotics competitions and cultural events at Daksh 2026 are open.", "2026-10-05", "Student Affairs", "Events", "Dr. Vasu Babu (Dean)", "daksh2026_brochure.pdf", now_iso()),
            ("Campus Placement Drive - Google & Microsoft", "Recruitment drive for B.Tech CSE & AIML with CGPA >= 8.0 and no active backlogs. Pre-placement talk at Central Auditorium.", "2026-10-02", "T&P Cell", "Placements", "Dr. M. Suresh (TPO)", "placement_guidelines.pdf", now_iso()),
        ]
        cur.executemany("INSERT INTO notices (title, content, date, department, category, posted_by, attachment, created_at) VALUES (?,?,?,?,?,?,?,?)", notices)

    # --- Seed student fees (Fee Details module) ---
    cur.execute("SELECT COUNT(*) c FROM student_fees")
    if cur.fetchone()["c"] == 0:
        fees = [
            (2, "Asha Rao", "24491A4225", "Tuition Fee", 45000.0, 45000.0, 0.0, 45000.0, 45000.0, "Paid", "2026-10-15", now_iso()),
            (2, "Asha Rao", "24491A4225", "Examination Fee", 2500.0, 2500.0, 0.0, 2500.0, 2500.0, "Paid", "2026-10-20", now_iso()),
            (2, "Asha Rao", "24491A4225", "Library & Lab Fee", 3000.0, 1500.0, 1500.0, 3000.0, 1500.0, "Partially Paid", "2026-11-01", now_iso()),
            (None, "Rahul Varma", "24491A4226", "Tuition Fee", 45000.0, 20000.0, 25000.0, 45000.0, 20000.0, "Partially Paid", "2026-10-15", now_iso()),
            (None, "Divya Sri", "24491A4227", "Tuition Fee", 48000.0, 0.0, 48000.0, 48000.0, 0.0, "Unpaid", "2026-10-15", now_iso()),
            (None, "Sai Teja", "24491A4228", "Transport Fee", 12000.0, 12000.0, 0.0, 12000.0, 12000.0, "Paid", "2026-10-05", now_iso()),
        ]
        cur.executemany("INSERT INTO student_fees (user_id, student_name, roll_number, fee_type, total_fee, paid_amount, pending_amount, amount_due, amount_paid, status, due_date, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", fees)

    # --- Seed student timetable (Timetable module) ---
    cur.execute("SELECT COUNT(*) c FROM student_timetable")
    if cur.fetchone()["c"] == 0:
        tt_seed = [
            ("Monday", "Monday", "Period 1 (09:00 - 10:00 AM)", 1, "09:00 - 10:00 AM", "Machine Learning", "23AI501", "Dr. Vara Prasad", "LH-201", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "All Batches", "Theory"),
            ("Monday", "Monday", "Period 2 (10:00 - 11:00 AM)", 2, "10:00 - 11:00 AM", "Operating Systems", "23CS502", "Dr. Bujji Babu", "LH-201", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "All Batches", "Theory"),
            ("Tuesday", "Tuesday", "Period 1 (09:00 - 10:00 AM)", 1, "09:00 - 10:00 AM", "Database Management Systems", "23CS503", "Dr. Challaram", "LH-201", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "All Batches", "Theory"),
            ("Tuesday", "Tuesday", "Period 3 (11:15 AM - 01:15 PM)", 3, "11:15 AM - 01:15 PM", "Deep Learning Lab", "23DS602", "Dr. Vara Prasad", "Lab 3", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "Batch B1 & B2", "Lab"),
            ("Wednesday", "Wednesday", "Period 2 (10:00 - 11:00 AM)", 2, "10:00 - 11:00 AM", "Discrete Mathematics", "23MA501", "Prof. K. Ramesh", "LH-201", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "All Batches", "Theory"),
            ("Thursday", "Thursday", "Period 1 (09:00 - 10:00 AM)", 1, "09:00 - 10:00 AM", "Machine Learning", "23AI501", "Dr. Vara Prasad", "LH-201", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "All Batches", "Theory"),
            ("Friday", "Friday", "Period 2 (10:00 - 11:00 AM)", 2, "10:00 - 11:00 AM", "Computer Networks", "23CS504", "Dr. S. Lakshmi", "LH-201", "CSE-A", "CSE", "Computer Science & Engineering", "3-1", "3rd Year - 1st Sem", "All Batches", "Theory"),
        ]
        cur.executemany(
            "INSERT INTO student_timetable (day, day_of_week, period, period_no, period_time, subject, subject_code, faculty, room, section, branch, department, year, year_semester, batch_info, subject_type) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            tt_seed
        )

    # --- Seed staff accounts for CFRO, CFSS, Student Dean ---
    staff_accounts = [
        ("CFRO Officer", "cfro.staff@qiscet.edu.in", "cfro123", "cfro_staff", "Finance & Accounts Section", None, "QIS College of Engineering and Technology"),
        ("CFSS Desk Officer", "cfss.staff@qiscet.edu.in", "cfss123", "cfss_staff", "Student Welfare & Support Section", None, "QIS College of Engineering and Technology"),
        ("Dr. P. Harish Babu", "dean.student@qiscet.edu.in", "dean123", "student_dean", "Student Affairs & Dean Office", None, "QIS College of Engineering and Technology"),
    ]
    for s_name, s_email, s_pw, s_role, s_dept, s_yr, s_col in staff_accounts:
        existing_staff = cur.execute("SELECT id FROM users WHERE email = ?", (s_email,)).fetchone()
        if not existing_staff:
            cur.execute(
                "INSERT INTO users (name, email, password_hash, role, department, year, college, created_at) VALUES (?,?,?,?,?,?,?,?)",
                (s_name, s_email, generate_password_hash(s_pw), s_role, s_dept, s_yr, s_col, now_iso()),
            )

    # --- Seed fee structures (CFRO) ---
    cur.execute("SELECT COUNT(*) c FROM fee_structures")
    if cur.fetchone()["c"] == 0:
        structures = [
            ("Computer Science & Engineering", "B.Tech CSE", "3rd Year", "1st Semester", "2026-2027", 45000.0, 2500.0, 12000.0, 7500.0, 3000.0, 70000.0, "Standard Autonomous R23 Regulation Fee Structure [SAMPLE DATA]"),
            ("Electronics & Communication", "B.Tech ECE", "3rd Year", "1st Semester", "2026-2027", 45000.0, 2500.0, 12000.0, 7500.0, 3000.0, 70000.0, "Standard Autonomous R23 Regulation Fee Structure [SAMPLE DATA]"),
            ("Artificial Intelligence & Data Science", "B.Tech AI&DS", "3rd Year", "1st Semester", "2026-2027", 48000.0, 2500.0, 12000.0, 7500.0, 3500.0, 73500.0, "Autonomous Specialization Program Fee [SAMPLE DATA]"),
            ("Management Studies", "MBA", "2nd Year", "1st Semester", "2026-2027", 60000.0, 3000.0, 12000.0, 7500.0, 5000.0, 87500.0, "Postgraduate Program Structure [SAMPLE DATA]"),
        ]
        cur.executemany(
            """INSERT INTO fee_structures 
               (department, course, year, semester, academic_year, tuition_fee, exam_fee, transport_fee, hostel_fee, other_fees, total_fee, notes)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
            structures
        )

    # --- Seed fee payments & receipts for student Asha Rao (user_id = 2) ---
    cur.execute("SELECT COUNT(*) c FROM fee_payments")
    if cur.fetchone()["c"] == 0:
        payments = [
            (2, "Tuition Fee", 45000.0, "Online (NetBanking)", "TXN-QIS-9823412", "QIS-REC-2026-0842", "2026-07-15", "Success", now_iso()),
            (2, "Examination Fee", 2500.0, "Online (UPI)", "TXN-QIS-9941032", "QIS-REC-2026-0911", "2026-08-01", "Success", now_iso()),
        ]
        cur.executemany(
            """INSERT INTO fee_payments 
               (user_id, fee_type, amount, payment_mode, transaction_ref, receipt_no, payment_date, status, created_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            payments
        )

    cur.execute("SELECT COUNT(*) c FROM fee_receipts")
    if cur.fetchone()["c"] == 0:
        receipts = [
            (2, "QIS-REC-2026-0842", "2026-2027", "3rd Year - 1st Sem", 45000.0, "2026-07-15", "Tuition Fee", "Paid in full via SBI NetBanking (Auth Ref: SBIN881249) [SAMPLE RECEIPT]", now_iso()),
            (2, "QIS-REC-2026-0911", "2026-2027", "3rd Year - 1st Sem", 2500.0, "2026-08-01", "Examination Fee", "Regular Mid-Sem & End-Sem Exam Fee [SAMPLE RECEIPT]", now_iso()),
        ]
        cur.executemany(
            """INSERT INTO fee_receipts 
               (user_id, receipt_no, academic_year, semester, amount_paid, payment_date, fee_type, receipt_notes, created_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            receipts
        )

    # --- Seed reimbursement applications (CFSS) ---
    cur.execute("SELECT COUNT(*) c FROM reimbursement_applications")
    if cur.fetchone()["c"] == 0:
        reimb = [
            (
                2,
                "Jagananna Vidya Deevena (JVD) - Post Matric Scholarship",
                "JVD-2026-AP-88491",
                "2026-2027",
                45000.0,
                45000.0,
                "Thumb/Authentication Required",
                "Action Required: Visit CFSS Office (Room A-102) for Biometric / Thumb verification",
                "Biometric window open Mon-Fri 10:00 AM - 04:00 PM at Student Support Desk",
                "College Level Verification Completed",
                "Income Certificate, Caste Certificate, Ration Card, Aadhaar Card, 10th Marks Memo",
                "All uploaded & verified by college nodal officer",
                "Thumb authentication must be completed before government disbursement cycle. Please bring Aadhaar card.",
                now_iso(),
                now_iso()
            )
        ]
        cur.executemany(
            """INSERT INTO reimbursement_applications
               (user_id, scheme_name, application_no, academic_year, eligible_amount, sanctioned_amount, current_stage, thumb_auth_status, thumb_auth_notes, college_verification_status, required_docs, uploaded_docs, remarks, updated_at, created_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            reimb
        )

    # --- Seed document requests (CFSS) ---
    cur.execute("SELECT COUNT(*) c FROM document_requests")
    if cur.fetchone()["c"] == 0:
        doc_reqs = [
            (2, "Bonafide Certificate", "Passport Application & Verification", 2, "Approved", "Digital certificate signed by Principal & Registrar [SAMPLE DATA]", "/downloads/sample-bonafide.pdf", "2026-08-10", "2026-08-11"),
            (2, "Study & Conduct Certificate", "Scholarship & Education Verification", 1, "Completed", "Original hardcopy collected from CFSS counter", None, "2026-08-15", "2026-08-16"),
            (2, "Fee Certificate", "Bank Education Loan Subsidy Claim", 1, "Under Verification", "Submitted to Accounts Desk for fee clearance", None, "2026-09-02", None),
        ]
        cur.executemany(
            """INSERT INTO document_requests
               (user_id, document_type, purpose, copies, status, remarks, download_url, submitted_at, completed_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            doc_reqs
        )

    # --- Seed student support tickets (CFSS) ---
    cur.execute("SELECT COUNT(*) c FROM student_support_tickets")
    if cur.fetchone()["c"] == 0:
        tickets = [
            (
                2,
                "Fee Reimbursement",
                "Clarification on JVD Biometric / Thumb Verification schedule",
                "Dear Support Team, could you please let me know the timing for biometric authentication for 3rd year CSE students at Room A-102?",
                "Normal",
                "In Progress",
                "Dear Asha, the biometric authentication counter in Room A-102 (CFSS Office) operates Monday to Friday between 10:00 AM and 04:00 PM. Please carry your original Aadhaar Card and College ID.",
                "CFSS Desk Officer",
                "2026-09-05 11:30:00",
                now_iso()
            ),
            (
                2,
                "Documents",
                "Urgent Fee Certificate for Vidyasiri scholarship verification",
                "I have submitted the request online. Requesting early approval as portal closes this Friday.",
                "High",
                "Open",
                None,
                "CFSS Desk Officer",
                "2026-09-12 09:15:00",
                now_iso()
            )
        ]
        cur.executemany(
            """INSERT INTO student_support_tickets
               (user_id, category, subject, description, priority, status, response, assigned_to, submitted_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            tickets
        )

    # --- Seed CFRO Announcements ---
    cur.execute("SELECT COUNT(*) c FROM cfro_announcements")
    if cur.fetchone()["c"] == 0:
        cfro_anns = [
            ("Final Date for Fall 2026-27 Semester Fee Payment", "Students are hereby informed that the last date to clear semester tuition & exam fees without penalty is October 15, 2026. Online gateway is active 24/7 on CFRO tab.", "Fee Deadline", "2026-10-15", "High", "CFRO Office", now_iso()[:10]),
            ("JVD Fee Reimbursement Adjustment Notice", "Students eligible for JVD Govt Scheme are exempt from paying tuition fees upfront upon verification of active JVD application. Remaining special fees must be cleared by November 1st.", "Reimbursement", "2026-11-01", "Normal", "CFRO Office", now_iso()[:10]),
            ("Hostel & Transport Fee Installment Facility", "Installment payment facility for annual transport and hostel fees is available on request. Apply at CFRO Desk (Admin Block Room 14).", "General", "2026-10-30", "Normal", "Finance Section", now_iso()[:10]),
        ]
        cur.executemany(
            """INSERT INTO cfro_announcements (title, content, category, deadline_date, priority, posted_by, created_at) VALUES (?,?,?,?,?,?,?)""",
            cfro_anns
        )

    # --- Seed CFSS Announcements ---
    cur.execute("SELECT COUNT(*) c FROM cfss_announcements")
    if cur.fetchone()["c"] == 0:
        cfss_anns = [
            ("Biometric Thumb Authentication Camp for Scholarship Students", "Govt scholarship biometric authentication drive is running daily from 10:00 AM to 04:00 PM at CFSS Counter, Room A-102. All shortlisted students must complete e-KYC.", "Scholarship", "All Scholarship Students", "CFSS Office", now_iso()[:10]),
            ("24-Hour Digital Issuance of Bonafide & Study Certificates", "Students can now apply for Bonafide, Study, and Fee Certificates directly through the CFSS Document Services portal and receive approved digital copies within 24 working hours.", "Document Services", "All Students", "Student Affairs", now_iso()[:10]),
            ("Student Welfare & Mentorship Cell Open Consultation Hours", "Student Dean Dr. P. Harish Babu is available for personal student counseling, grievance review, and academic assistance every afternoon between 02:30 PM and 04:30 PM in Room A-104.", "Student Welfare", "All Students", "Student Dean Office", now_iso()[:10]),
        ]
        cur.executemany(
            """INSERT INTO cfss_announcements (title, content, category, target_audience, posted_by, created_at) VALUES (?,?,?,?,?,?)""",
            cfss_anns
        )

    # --- Seed CFSS Student Dean Info ---
    cur.execute("SELECT COUNT(*) c FROM cfss_dean_info")
    if cur.fetchone()["c"] == 0:
        cur.execute(
            """INSERT INTO cfss_dean_info
               (dean_name, designation, office_location, office_timings, contact_email, contact_phone, responsibilities, instructions, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (
                "Dr. P. Harish Babu, Ph.D.",
                "Dean of Student Affairs & Welfare",
                "Room A-104, Student Affairs Complex, Ground Floor, Admin Block",
                "Monday to Friday: 10:00 AM – 01:00 PM & 02:30 PM – 04:30 PM",
                "studentdean@qiscet.edu.in",
                "+91 94400 12345",
                "Student Welfare, Scholarship & Fee Reimbursement Facilitation, Grievance Redressal, Anti-Ragging Enforcement, Student Council & Clubs Oversight, Academic Counseling & Mentorship",
                "Students visiting the Dean's Secretariat are requested to present their Digital Student ID. Prior appointment via CFSS Support Ticket is recommended for formal delegations.",
                now_iso()
            )
        )

    conn.commit()


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {Config.DB_PATH}")
