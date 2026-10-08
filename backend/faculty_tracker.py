"""
QIS College of Engineering and Technology (Autonomous)
Faculty Directory, Master Timetables & Real-Time Location Tracker
"""
from datetime import datetime, timezone, timedelta

# India Standard Time (UTC+5:30)
IST_OFFSET = timedelta(hours=5, minutes=30)

FACULTY_MASTER_DIRECTORY = [
    {
        "id": "vara_prasad",
        "name": "Dr. Vara Prasad",
        "aliases": ["vara prasad", "dr vara prasad", "vara prasad sir", "hod cse aiml", "cse aiml hod", "aiml hod", "vara"],
        "designation": "Professor & Head of Department (HOD)",
        "department": "Computer Science & AIML",
        "cabin": "Room 204, CSE Block (HOD Cabin, Ground Floor)",
        "email": "vara.prasad@qiscet.edu.in",
        "phone": "+91 90000 22222",
        "office_hours": "02:00 PM – 04:00 PM (Monday – Friday)",
        "online_day": "Monday",
        "subjects": ["Machine Learning (23AI501)", "Neural Networks (23CS503)", "Deep Learning Lab (23DS602)"],
        "timetable": {
            "Monday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Machine Learning", "section": "AIML-2", "room": "MS Teams (Online Lecture)", "online": True},
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Neural Networks", "section": "CSE-5", "room": "MS Teams (Online Lecture)", "online": True},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Machine Learning", "section": "AIML-2", "room": "MS Teams (Online Lecture)", "online": True},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Deep Learning Lab", "section": "CSDS-3", "room": "MS Teams (Online Session)", "online": True},
            ],
            "Tuesday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Neural Networks", "section": "CSE-5", "room": "Classroom CS-205", "online": False},
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Deep Learning Lab", "section": "CSDS-3", "room": "CSE Lab-A2", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Neural Networks", "section": "CSE-5", "room": "Classroom CS-205", "online": False},
                {"period": 5, "start": "15:00", "end": "16:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
            ],
            "Wednesday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Deep Learning Lab", "section": "CSDS-3", "room": "CSE Lab-A2", "online": False},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Neural Networks", "section": "CSE-5", "room": "Classroom CS-205", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
            ],
            "Thursday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Deep Learning Lab", "section": "CSDS-3", "room": "CSE Lab-A2", "online": False},
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Neural Networks", "section": "CSE-5", "room": "Classroom CS-205", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Deep Learning Lab", "section": "CSDS-3", "room": "CSE Lab-A2", "online": False},
                {"period": 5, "start": "15:00", "end": "16:00", "subject": "Neural Networks", "section": "CSE-5", "room": "Classroom CS-205", "online": False},
            ],
            "Friday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Neural Networks", "section": "CSE-5", "room": "Classroom CS-205", "online": False},
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Deep Learning Lab", "section": "CSDS-3", "room": "CSE Lab-A2", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Machine Learning", "section": "AIML-2", "room": "Classroom CS-301", "online": False},
                {"period": 5, "start": "15:00", "end": "16:30", "subject": "Department Meeting & Mentoring", "section": "All Faculty", "room": "CSE Conference Hall 202", "online": False},
            ],
        }
    },
    {
        "id": "avinash",
        "name": "Dr. K. Avinash",
        "aliases": ["dr avinash", "avinash", "k avinash", "avinash sir"],
        "designation": "Associate Professor",
        "department": "Computer Science & Data Science",
        "cabin": "Room 208, CSE Block (Faculty Cabin 4)",
        "email": "avinash@qiscet.edu.in",
        "phone": "+91 90000 33334",
        "office_hours": "11:00 AM – 01:00 PM (Tuesday – Friday)",
        "online_day": "Wednesday",
        "subjects": ["Operating Systems (23CS302)", "Cloud Computing (23CS604)"],
        "timetable": {
            "Monday": [
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Operating Systems", "section": "CSE-2", "room": "Classroom CS-102", "online": False},
                {"period": 4, "start": "14:00", "end": "16:00", "subject": "Cloud Computing Lab", "section": "CSDS-2", "room": "CSE Lab-B1", "online": False},
            ],
            "Tuesday": [
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Operating Systems", "section": "CSE-2", "room": "Classroom CS-102", "online": False},
                {"period": 5, "start": "15:00", "end": "16:00", "subject": "Cloud Computing", "section": "CSDS-2", "room": "Classroom CS-204", "online": False},
            ],
            "Wednesday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Operating Systems", "section": "CSE-2", "room": "MS Teams (Online Lecture)", "online": True},
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Cloud Computing", "section": "CSDS-2", "room": "MS Teams (Online Lecture)", "online": True},
            ],
            "Thursday": [
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Cloud Computing", "section": "CSDS-2", "room": "Classroom CS-204", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Operating Systems", "section": "CSE-2", "room": "Classroom CS-102", "online": False},
            ],
            "Friday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Operating Systems", "section": "CSE-2", "room": "Classroom CS-102", "online": False},
                {"period": 3, "start": "11:00", "end": "13:00", "subject": "Systems Programming Lab", "section": "CSE-2", "room": "CSE Lab-B1", "online": False},
            ],
        }
    },
    {
        "id": "sunitha",
        "name": "Dr. P. Sunitha",
        "aliases": ["dr sunitha", "sunitha", "p sunitha", "sunitha mam", "sunitha madam"],
        "designation": "Associate Professor",
        "department": "Information Technology & AI",
        "cabin": "Room 105, IT Block (1st Floor)",
        "email": "sunitha.it@qiscet.edu.in",
        "phone": "+91 90000 44445",
        "office_hours": "03:00 PM – 05:00 PM (Monday – Thursday)",
        "online_day": "Friday",
        "subjects": ["Database Management Systems (23CS401)", "Python Programming (23AI302)"],
        "timetable": {
            "Monday": [
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Database Management Systems", "section": "CSE-3", "room": "Classroom CS-201", "online": False},
                {"period": 4, "start": "14:00", "end": "16:00", "subject": "DBMS Lab", "section": "CSE-3", "room": "IT Lab-A1", "online": False},
            ],
            "Tuesday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Database Management Systems", "section": "CSE-3", "room": "Classroom CS-201", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Python Programming", "section": "AIML-1", "room": "Classroom CS-304", "online": False},
            ],
            "Wednesday": [
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Python Programming", "section": "AIML-1", "room": "Classroom CS-304", "online": False},
                {"period": 4, "start": "14:00", "end": "15:00", "subject": "Database Management Systems", "section": "CSE-3", "room": "Classroom CS-201", "online": False},
            ],
            "Thursday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Python Programming", "section": "AIML-1", "room": "Classroom CS-304", "online": False},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Database Management Systems", "section": "CSE-3", "room": "Classroom CS-201", "online": False},
            ],
            "Friday": [
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Database Management Systems", "section": "CSE-3", "room": "MS Teams (Online Lecture)", "online": True},
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Python Programming", "section": "AIML-1", "room": "MS Teams (Online Lecture)", "online": True},
            ],
        }
    },
    {
        "id": "ramesh_babu",
        "name": "Dr. V. Ramesh Babu",
        "aliases": ["dr ramesh babu", "ramesh babu", "ramesh ece", "ramesh sir"],
        "designation": "Professor",
        "department": "Electronics & Communication Engineering",
        "cabin": "Room 310, ECE Block (3rd Floor)",
        "email": "ramesh.ece@qiscet.edu.in",
        "phone": "+91 90000 55556",
        "office_hours": "10:00 AM – 12:00 PM (Mon–Wed)",
        "online_day": "Thursday",
        "subjects": ["Microprocessors & Interfacing (23EC403)", "IoT & Embedded Systems (23EC601)"],
        "timetable": {
            "Monday": [
                {"period": 1, "start": "09:00", "end": "10:00", "subject": "Microprocessors", "section": "ECE-1", "room": "Classroom EC-101", "online": False},
                {"period": 3, "start": "11:00", "end": "13:00", "subject": "Embedded IoT Lab", "section": "ECE-2", "room": "ECE Lab-EC3", "online": False},
            ],
            "Tuesday": [
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "IoT & Embedded Systems", "section": "ECE-2", "room": "Classroom EC-104", "online": False},
            ],
            "Wednesday": [
                {"period": 3, "start": "11:00", "end": "12:00", "subject": "Microprocessors", "section": "ECE-1", "room": "Classroom EC-101", "online": False},
            ],
            "Thursday": [
                {"period": 1, "start": "09:00", "end": "11:00", "subject": "IoT & Embedded Systems", "section": "ECE-2", "room": "MS Teams (Online Lecture)", "online": True},
            ],
            "Friday": [
                {"period": 2, "start": "10:00", "end": "11:00", "subject": "Microprocessors", "section": "ECE-1", "room": "Classroom EC-101", "online": False},
                {"period": 4, "start": "14:00", "end": "16:00", "subject": "Microcontroller Lab", "section": "ECE-1", "room": "ECE Lab-EC1", "online": False},
            ],
        }
    },
    {
        "id": "bindu",
        "name": "Bindu",
        "aliases": ["bindu", "bindu mam", "csm bindu"],
        "designation": "Associate Professor",
        "department": "Computer Science & Machine Learning (CSM)",
        "cabin": "CSM Block Room 101",
        "email": "bindu.csm@qiscet.edu.in",
        "phone": "+91 90000 11101",
        "office_hours": "10:00 AM – 12:00 PM (Monday – Friday)",
        "online_day": "Wednesday",
        "subjects": ["Machine Learning (23CSM501)", "Deep Learning (23CSM502)"],
        "timetable": {}
    },
    {
        "id": "koteswar_rao",
        "name": "Koteswar Rao",
        "aliases": ["koteswar rao", "p koteswara rao", "koteswar rao sir", "csm koteswar rao"],
        "designation": "Assistant Professor",
        "department": "Computer Science & Machine Learning (CSM)",
        "cabin": "CSM Block Room 102",
        "email": "koteswarrao.csm@qiscet.edu.in",
        "phone": "+91 90000 11102",
        "office_hours": "11:00 AM – 01:00 PM (Monday – Friday)",
        "online_day": "Thursday",
        "subjects": ["Computer Networks & Protocols (23CSM503)"],
        "timetable": {}
    },
    {
        "id": "nikhil",
        "name": "Nikhil",
        "aliases": ["nikhil", "nikhil sir", "csm nikhil"],
        "designation": "Assistant Professor",
        "department": "Computer Science & Machine Learning (CSM)",
        "cabin": "CSM Block Room 103",
        "email": "nikhil.csm@qiscet.edu.in",
        "phone": "+91 90000 11103",
        "office_hours": "02:00 PM – 04:00 PM (Monday – Friday)",
        "online_day": "Tuesday",
        "subjects": ["Data Structures & Algorithms (23CSM301)"],
        "timetable": {}
    },
    {
        "id": "bhaskar_rao",
        "name": "Bhaskar Rao",
        "aliases": ["bhaskar rao", "bhaskar rao sir", "csm bhaskar rao"],
        "designation": "Associate Professor",
        "department": "Computer Science & Machine Learning (CSM)",
        "cabin": "CSM Block Room 104",
        "email": "bhaskarrao.csm@qiscet.edu.in",
        "phone": "+91 90000 11104",
        "office_hours": "09:00 AM – 11:00 AM (Monday – Friday)",
        "online_day": "Friday",
        "subjects": ["AI & Expert Systems (23CSM601)"],
        "timetable": {}
    },
    {
        "id": "durga",
        "name": "Durga",
        "aliases": ["durga", "durga mam", "aids durga"],
        "designation": "Associate Professor",
        "department": "Artificial Intelligence & Data Science (AIDS)",
        "cabin": "AIDS Block Room 201",
        "email": "durga.aids@qiscet.edu.in",
        "phone": "+91 90000 22201",
        "office_hours": "10:00 AM – 12:00 PM (Monday – Friday)",
        "online_day": "Monday",
        "subjects": ["Artificial Intelligence & Data Mining (23AID501)"],
        "timetable": {}
    },
    {
        "id": "srinilai",
        "name": "Srinilai",
        "aliases": ["srinilai", "srinilai mam", "aids srinilai"],
        "designation": "Assistant Professor",
        "department": "Artificial Intelligence & Data Science (AIDS)",
        "cabin": "AIDS Block Room 202",
        "email": "srinilai.aids@qiscet.edu.in",
        "phone": "+91 90000 22202",
        "office_hours": "11:00 AM – 01:00 PM (Monday – Friday)",
        "online_day": "Tuesday",
        "subjects": ["Data Visualization & Analytics (23AID502)"],
        "timetable": {}
    },
    {
        "id": "rabbani_basha",
        "name": "Rabbani Basha",
        "aliases": ["rabbani basha", "rabbani basha sir", "aids rabbani basha", "rabbani"],
        "designation": "Assistant Professor",
        "department": "Artificial Intelligence & Data Science (AIDS)",
        "cabin": "AIDS Block Room 203",
        "email": "rabbanibasha.aids@qiscet.edu.in",
        "phone": "+91 90000 22203",
        "office_hours": "02:00 PM – 04:00 PM (Monday – Friday)",
        "online_day": "Wednesday",
        "subjects": ["Big Data Analytics & NLP (23AID601)"],
        "timetable": {}
    }
]


def get_current_ist_time():
    """Returns the current datetime in India Standard Time (UTC+5:30)."""
    utc_now = datetime.now(timezone.utc)
    return utc_now + IST_OFFSET


def find_faculty_by_query(query: str):
    """Finds matching faculty from query text."""
    q = query.lower()
    for f in FACULTY_MASTER_DIRECTORY:
        if f["name"].lower() in q or f["id"] in q:
            return f
        for alias in f.get("aliases", []):
            if alias in q:
                return f
    # If query specifically mentions machine learning / neural networks -> default Prof. Mehta
    if "machine learning" in q or "neural network" in q or "deep learning" in q:
        return FACULTY_MASTER_DIRECTORY[0]
    if "operating system" in q or "cloud computing" in q:
        return FACULTY_MASTER_DIRECTORY[1]
    if "dbms" in q or "database" in q or "python" in q:
        return FACULTY_MASTER_DIRECTORY[2]
    if "microprocessor" in q or "iot" in q or "embedded" in q:
        return FACULTY_MASTER_DIRECTORY[3]
    return None


def get_live_faculty_status(faculty: dict, current_dt: datetime = None):
    """
    Computes where a faculty member is right now based on day of week and time.
    """
    if current_dt is None:
        current_dt = get_current_ist_time()

    day_name = current_dt.strftime("%A")  # Monday, Tuesday...
    curr_time_str = current_dt.strftime("%H:%M") # e.g. "11:05"

    day_schedule = faculty["timetable"].get(day_name, [])

    # If weekend
    if day_name in ("Saturday", "Sunday"):
        return {
            "status": "Weekend",
            "location": "Off-Campus / Available on Monday",
            "current_class": None,
            "next_class": "Next classes resume on Monday at 09:00 AM",
            "cabin": faculty["cabin"],
            "day": day_name,
            "time": curr_time_str,
            "description": f"It is currently {day_name} (Weekend). Academic classes are not in session. {faculty['name']} will next be on campus on Monday."
        }

    # Search for active class period
    active_slot = None
    next_slot = None

    for slot in day_schedule:
        s_start = slot["start"]
        s_end = slot["end"]
        if s_start <= curr_time_str < s_end:
            active_slot = slot
        elif curr_time_str < s_start and next_slot is None:
            next_slot = slot

    if active_slot:
        mode_str = "Online (MS Teams)" if active_slot.get("online") else f"In-Person in {active_slot['room']}"
        desc = (
            f"Currently ({day_name} {curr_time_str}), {faculty['name']} is conducting "
            f"**{active_slot['subject']}** for **Section {active_slot['section']}** "
            f"at **{active_slot['room']}** (Period: {active_slot['start']} – {active_slot['end']})."
        )
        return {
            "status": "In Class",
            "location": active_slot["room"],
            "current_class": active_slot,
            "next_class": next_slot,
            "cabin": faculty["cabin"],
            "day": day_name,
            "time": curr_time_str,
            "description": desc
        }
    else:
        # Not in class right now: either lunch, free period, or after/before hours
        if curr_time_str < "09:00":
            status = "Before Class Hours"
            loc = f"Available in {faculty['cabin']} from 08:30 AM"
            desc = f"Classes start at 09:00 AM. {faculty['name']} is expected in {faculty['cabin']}."
        elif "12:00" <= curr_time_str < "14:00":
            status = "Lunch / Faculty Cabin"
            loc = faculty["cabin"]
            desc = f"Currently in Lunch Break / Faculty Consultation period. {faculty['name']} can be found in their office: **{faculty['cabin']}**."
        elif curr_time_str >= "16:00":
            status = "Class Hours Concluded"
            loc = f"Office hours concluded. Available in {faculty['cabin']} or via email."
            desc = f"Scheduled classes for {day_name} have ended. You can meet {faculty['name']} during office hours ({faculty['office_hours']}) in **{faculty['cabin']}** or email at `{faculty['email']}`."
        else:
            status = "Free Period / Cabin"
            loc = faculty["cabin"]
            desc = f"Currently between class periods. {faculty['name']} is in their department cabin: **{faculty['cabin']}**."

        return {
            "status": status,
            "location": loc,
            "current_class": None,
            "next_class": next_slot,
            "cabin": faculty["cabin"],
            "day": day_name,
            "time": curr_time_str,
            "description": desc
        }


def format_all_faculty_live_status():
    """Returns a consolidated Markdown Grid Table of all faculty members' current locations."""
    now = get_current_ist_time()
    day_name = now.strftime("%A")
    time_str = now.strftime("%I:%M %p")

    lines = [
        f"### 📍 **QISCET Faculty Live Locations & Status** ({day_name}, {time_str} IST)\n",
        "| Faculty Name | Department | Current Status / Period | Location / Room | Office Cabin | Contact Phone |",
        "| :--- | :--- | :--- | :--- | :--- | :--- |"
    ]

    for f in FACULTY_MASTER_DIRECTORY:
        st = get_live_faculty_status(f, now)
        if st["current_class"]:
            cls = st["current_class"]
            status_text = f"🔴 In Class ({cls['subject']} - {cls['section']})"
            loc_text = cls['room']
        else:
            status_text = f"🟢 {st['status']}"
            loc_text = st['location']

        lines.append(f"| **{f['name']}** | {f['department']} | {status_text} | {loc_text} | {f['cabin']} | {f['phone']} |")

    return "\n".join(lines)


def get_faculty_timetable_context(faculty_name: str = None):
    """Returns full weekly timetable for a given faculty or all faculty in Markdown Grid Table format."""
    target_list = [f for f in FACULTY_MASTER_DIRECTORY if faculty_name.lower() in f["name"].lower()] if faculty_name else FACULTY_MASTER_DIRECTORY

    lines = ["### 📅 **Faculty Weekly Period Timetable (R23 Scheme)**\n"]

    for f in target_list:
        lines.append(f"#### 👨‍🏫 **{f['name']}** ({f['designation']} — {f['department']})")
        lines.append(f"**Cabin:** {f['cabin']} | **Online Day:** {f['online_day']} | **Contact:** `{f['email']}` ({f['phone']})\n")
        lines.append("| Day | Start Time | End Time | Subject | Section | Room / Mode | Online |")
        lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

        for day, periods in f["timetable"].items():
            for p in periods:
                online_str = "Yes (Online)" if p.get("online") else "No (Offline)"
                lines.append(f"| {day} | {p['start']} | {p['end']} | **{p['subject']}** | {p['section']} | {p['room']} | {online_str} |")

        lines.append("")

    return "\n".join(lines)
