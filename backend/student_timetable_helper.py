"""
Student Timetable Helper for QISCET Campus Assistant.
Handles queries about student timetables, sections, days, timings, rooms, and subjects
in both English and Telugu/Hinglish.
Returns both structured box text and JSON payload for rich React card rendering.
"""
import re
import sqlite3
from typing import Optional, Dict, Any, List
from config import Config

DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

DAYS_MAP = {
    "monday": "Monday",
    "somavaram": "Monday",
    "mon": "Monday",
    "tuesday": "Tuesday",
    "mangalavaram": "Tuesday",
    "tue": "Tuesday",
    "wednesday": "Wednesday",
    "budhavaram": "Wednesday",
    "wed": "Wednesday",
    "thursday": "Thursday",
    "guruvaram": "Thursday",
    "thu": "Thursday",
    "friday": "Friday",
    "sukravaram": "Friday",
    "fri": "Friday",
    "saturday": "Saturday",
    "sanivaram": "Saturday",
    "sat": "Saturday",
}

SECTIONS = [
    "ECE 1", "ECE 2",
    "AID 1", "AID 2", "AID 3",
    "CSM 1", "CSM 2",
    "CSD 1", "CSD 2"
]

SUBJECT_ALIASES = [
    ("dwdm", "DWDM"),
    ("data warehousing", "DWDM"),
    ("data warehouse", "DWDM"),
    ("machine learning", "Machine Learning"),
    ("deep learning", "Deep Learning"),
    ("ml", "Machine Learning"),
    ("dl", "Deep Learning"),
    ("computer networks", "Computer Network"),
    ("computer network", "Computer Network"),
    ("cnp", "Computer Network"),
    ("operating system", "OS"),
    ("os", "OS"),
    ("data visualization", "Data Visualization"),
    ("edavc", "EDAVC"),
    ("adic", "ADIC"),
    ("digi comm", "Digi Comm"),
    ("digital communication", "Digi Comm"),
    ("optical comm", "Optical Comm"),
    ("applied skilling", "Applied Skilling"),
    ("soft skill", "Soft skill"),
    ("soft skills", "Soft skills"),
    ("comm skills", "Comm Skills"),
    ("communication skills", "Comm Skills"),
    ("iot", "IoT"),
    ("project", "Project"),
    ("crt", "CRT"),
]


SECTION_PATTERNS = [
    # AIML / CSM mappings (AIML-1 -> CSM 1, AIML-2 -> CSM 2)
    (r"\b(aiml\s*[-_]?\s*1|csm\s*[-_]?\s*1|ai\s*ml\s*1|ai\s*&\s*ml\s*1)\b", "CSM 1"),
    (r"\b(aiml\s*[-_]?\s*2|csm\s*[-_]?\s*2|ai\s*ml\s*2|ai\s*&\s*ml\s*2)\b", "CSM 2"),
    (r"\b(aiml\s*[-_]?\s*3|csm\s*[-_]?\s*3|ai\s*ml\s*3|ai\s*&\s*ml\s*3)\b", "CSM 1"),
    # AID / AIDS mappings
    (r"\b(aid\s*[-_]?\s*1|aids\s*[-_]?\s*1|ai\s*ds\s*1|ai\s*&\s*ds\s*1)\b", "AID 1"),
    (r"\b(aid\s*[-_]?\s*2|aids\s*[-_]?\s*2|ai\s*ds\s*2|ai\s*&\s*ds\s*2)\b", "AID 2"),
    (r"\b(aid\s*[-_]?\s*3|aids\s*[-_]?\s*3|ai\s*ds\s*3|ai\s*&\s*ds\s*3)\b", "AID 3"),
    # ECE mappings
    (r"\b(ece\s*[-_]?\s*1)\b", "ECE 1"),
    (r"\b(ece\s*[-_]?\s*2)\b", "ECE 2"),
    # CSD mappings
    (r"\b(csd\s*[-_]?\s*1)\b", "CSD 1"),
    (r"\b(csd\s*[-_]?\s*2)\b", "CSD 2"),
    # CSE mappings
    (r"\b(cse\s*[-_]?\s*a|csea)\b", "CSE-A"),
    (r"\b(cse\s*[-_]?\s*1)\b", "CSE-A"),
    (r"\b(cse\s*[-_]?\s*2)\b", "CSE-A"),
]


BRANCH_PATTERNS = [
    # AIML / CSM mappings
    (r"\b(aiml|csm|ai\s*ml|ai\s*&\s*ml)\b", "AI/CSM", "CSM 1"),
    # AID / AIDS mappings
    (r"\b(aid|aids|ai\s*ds|ai\s*&\s*ds)\b", "AI&DS", "AID 1"),
    # ECE mappings
    (r"\b(ece)\b", "ECE", "ECE 1"),
    # CSD mappings
    (r"\b(csd)\b", "CSD", "CSD 1"),
    # CSE mappings
    (r"\b(cse)\b", "Computer Science & Engineering", "CSE-A"),
]


def parse_query(query: str) -> Dict[str, Any]:
    q_clean = query.strip()
    q_lower = q_clean.lower()

    # 1. Section matching with alias regexes
    detected_section = None
    for pattern, canonical_sec in SECTION_PATTERNS:
        if re.search(pattern, q_lower):
            detected_section = canonical_sec
            break

    if not detected_section:
        for sec in SECTIONS:
            sec_pattern = r"\b" + sec.lower().replace(" ", r"\s*") + r"\b"
            if re.search(sec_pattern, q_lower):
                detected_section = sec
                break

    # 2. Branch matching if no specific section was detected
    detected_branch = None
    if not detected_section:
        for b_pattern, canonical_branch, default_sec in BRANCH_PATTERNS:
            if re.search(b_pattern, q_lower):
                detected_branch = canonical_branch
                detected_section = default_sec
                break

    # 3. Day matching
    detected_day = None
    for k, v in DAYS_MAP.items():
        if re.search(r"\b" + k + r"\b", q_lower) or (k in q_lower and ("lo" in q_lower or "roju" in q_lower)):
            detected_day = v
            break

    # 4. Subject matching
    detected_subject = None
    for alias, canonical in SUBJECT_ALIASES:
        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, q_lower):
            detected_subject = canonical
            break

    # 5. Year matching
    detected_year = "7-1" if ("7-1" in q_lower or "7th batch" in q_lower) else "3-1"

    # 6. Check if timetable intent applies
    tt_triggers = [
        "timetable", "time table", "schedule", "period", "periods",
        "ela class", "ela vuntundi", "elanti time", "ekkada vuntundi",
        "ekkada", "time lo", "yeppudu", "eppudu", "vuntundi", "untundi",
        "class timing", "class time", "show me", "class", "classes"
    ]
    is_tt_query = (
        detected_section is not None or
        detected_branch is not None or
        detected_subject is not None or
        any(t in q_lower for t in tt_triggers)
    )

    return {
        "is_timetable_query": is_tt_query,
        "section": detected_section,
        "branch": detected_branch,
        "day": detected_day,
        "subject": detected_subject,
        "year": detected_year,
        "raw_query": query
    }


def get_db_connection():
    conn = sqlite3.connect(Config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _clean_val(val: Optional[str], default: str = "-") -> str:
    if not val or val.strip().lower() in ("", "none", "null"):
        return default
    return val.strip()


def query_timetable(parsed: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Executes targeted query against student_timetable in SQLite.
    Returns structured dict with sections, days, periods, and formatted box markdown.
    """
    conn = get_db_connection()
    section = parsed.get("section")
    day = parsed.get("day")
    subject = parsed.get("subject")
    year = parsed.get("year", "3-1")

    try:
        cur = conn.cursor()

        # Case 1: Specific Section + Specific Day (e.g., "AID 1 Monday lo ela class vuntundi?", "CSM 1 Thursday schedule")
        if section and day:
            cur.execute(
                """SELECT year, branch, section, day_of_week, period_no, period_time,
                          subject, subject_code, faculty, room, batch_info, subject_type
                   FROM student_timetable
                   WHERE section = ? AND day_of_week = ? AND year = ?
                   ORDER BY period_no""",
                (section, day, year)
            )
            rows = [dict(r) for r in cur.fetchall()]
            if not rows:
                # Fallback without year filter if needed
                cur.execute(
                    """SELECT year, branch, section, day_of_week, period_no, period_time,
                              subject, subject_code, faculty, room, batch_info, subject_type
                       FROM student_timetable
                       WHERE section = ? AND day_of_week = ?
                       ORDER BY period_no""",
                    (section, day)
                )
                rows = [dict(r) for r in cur.fetchall()]

            if not rows:
                return None

            return _format_single_day_result(section, day, rows)

        # Case 2: Specific Section, All Days (e.g., "ECE 1 timetable show me")
        if section and not day and not subject:
            cur.execute(
                """SELECT year, branch, section, day_of_week, period_no, period_time,
                          subject, subject_code, faculty, room, batch_info, subject_type
                   FROM student_timetable
                   WHERE section = ? AND year = ?
                   ORDER BY CASE day_of_week 
                       WHEN 'Monday' THEN 1 
                       WHEN 'Tuesday' THEN 2 
                       WHEN 'Wednesday' THEN 3 
                       WHEN 'Thursday' THEN 4 
                       WHEN 'Friday' THEN 5 
                       WHEN 'Saturday' THEN 6 
                   END, period_no""",
                (section, year)
            )
            rows = [dict(r) for r in cur.fetchall()]
            if not rows:
                cur.execute(
                    """SELECT year, branch, section, day_of_week, period_no, period_time,
                              subject, subject_code, faculty, room, batch_info, subject_type
                       FROM student_timetable
                       WHERE section = ?
                       ORDER BY CASE day_of_week 
                           WHEN 'Monday' THEN 1 
                           WHEN 'Tuesday' THEN 2 
                           WHEN 'Wednesday' THEN 3 
                           WHEN 'Thursday' THEN 4 
                           WHEN 'Friday' THEN 5 
                           WHEN 'Saturday' THEN 6 
                       END, period_no""",
                    (section,)
                )
                rows = [dict(r) for r in cur.fetchall()]

            if not rows:
                return None

            return _format_full_section_result(section, rows)

        # Case 3: Subject Query (e.g., "DWDM class elanti time lo vuntundi?", "Machine learning class ekkada vuntundi?")
        if subject:
            query_cond = "WHERE (subject LIKE ? OR subject_code LIKE ?)"
            params = [f"%{subject}%", f"%{subject}%"]
            if section:
                query_cond += " AND section = ?"
                params.append(section)
            if day:
                query_cond += " AND day_of_week = ?"
                params.append(day)
            
            # Default to year 3-1 to keep it crisp unless 7-1 requested
            if year:
                query_cond += " AND year = ?"
                params.append(year)

            cur.execute(
                f"""SELECT year, branch, section, day_of_week, period_no, period_time,
                           subject, subject_code, faculty, room, batch_info, subject_type
                    FROM student_timetable
                    {query_cond}
                    ORDER BY section, CASE day_of_week 
                        WHEN 'Monday' THEN 1 
                        WHEN 'Tuesday' THEN 2 
                        WHEN 'Wednesday' THEN 3 
                        WHEN 'Thursday' THEN 4 
                        WHEN 'Friday' THEN 5 
                        WHEN 'Saturday' THEN 6 
                    END, period_no""",
                params
            )
            rows = [dict(r) for r in cur.fetchall()]
            if not rows:
                # Retry without year filter
                params_fallback = [f"%{subject}%", f"%{subject}%"]
                query_cond_fallback = "WHERE (subject LIKE ? OR subject_code LIKE ?)"
                if section:
                    query_cond_fallback += " AND section = ?"
                    params_fallback.append(section)
                if day:
                    query_cond_fallback += " AND day_of_week = ?"
                    params_fallback.append(day)
                cur.execute(
                    f"""SELECT year, branch, section, day_of_week, period_no, period_time,
                               subject, subject_code, faculty, room, batch_info, subject_type
                        FROM student_timetable
                        {query_cond_fallback}
                        ORDER BY section, CASE day_of_week 
                            WHEN 'Monday' THEN 1 
                            WHEN 'Tuesday' THEN 2 
                            WHEN 'Wednesday' THEN 3 
                            WHEN 'Thursday' THEN 4 
                            WHEN 'Friday' THEN 5 
                            WHEN 'Saturday' THEN 6 
                        END, period_no""",
                    params_fallback
                )
                rows = [dict(r) for r in cur.fetchall()]

            if not rows:
                return None

            return _format_subject_result(subject, rows, section_filter=section, day_filter=day)

        # Case 4: Branch only without section (e.g. "AIML timetable", "ECE department timetable")
        branch = parsed.get("branch")
        if branch and not day and not subject:
            cur.execute(
                """SELECT year, branch, section, day_of_week, period_no, period_time,
                          subject, subject_code, faculty, room, batch_info, subject_type
                   FROM student_timetable
                   WHERE branch = ?
                   ORDER BY section, CASE day_of_week 
                       WHEN 'Monday' THEN 1 
                       WHEN 'Tuesday' THEN 2 
                       WHEN 'Wednesday' THEN 3 
                       WHEN 'Thursday' THEN 4 
                       WHEN 'Friday' THEN 5 
                       WHEN 'Saturday' THEN 6 
                   END, period_no""",
                (branch,)
            )
            rows = [dict(r) for r in cur.fetchall()]
            if rows:
                return _format_branch_result(branch, rows)

        # Case 5: Day only (e.g. "Monday schedule")
        if day and not section:
            cur.execute(
                """SELECT year, branch, section, day_of_week, period_no, period_time,
                          subject, subject_code, faculty, room, batch_info, subject_type
                   FROM student_timetable
                   WHERE day_of_week = ? AND year = ?
                   ORDER BY branch, section, period_no""",
                (day, year)
            )
            rows = [dict(r) for r in cur.fetchall()]
            if not rows:
                return None
            return _format_day_all_sections_result(day, rows)

        # Case 6: Completely generic query without any section, branch, or subject
        return {
            "view_type": "prompt_selection",
            "title": "Select Your Department / Section Timetable",
            "markdown_answer": (
                "### 📅 **Please Specify Your Department or Section**\n\n"
                "To see your exact timetable, please specify your Section or Department, for example:\n\n"
                "• **AIML / CSM:** `AIML 1 timetable` or `AIML 2 timetable`\n"
                "• **AI&DS:** `AID 1 timetable`, `AID 2 timetable`, or `AID 3 timetable`\n"
                "• **ECE:** `ECE 1 timetable` or `ECE 2 timetable`\n"
                "• **CSD:** `CSD 1 timetable` or `CSD 2 timetable`\n"
                "• **CSE:** `CSE-A timetable`\n\n"
                "*Tip: You can also specify a day, e.g., 'AIML 1 Monday class' or 'ECE 2 Tuesday schedule'.*"
            ),
            "cards": []
        }
    finally:
        conn.close()


def _format_single_day_result(section: str, day: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Formats a single day's schedule for a section into cards and a clean Markdown Grid Table."""
    cards_data = []

    title = f"{section} — {day} Class Schedule"
    markdown_lines = [
        f"### 📅 **{title}**",
        f"**Section:** {section} | **Day:** {day} | **Total Periods:** {len(rows)}\n",
        "| Period | Time | Subject | Type | Faculty | Room / Venue | Batch Info |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ]

    for r in rows:
        p_no = r["period_no"]
        time = r["period_time"]
        subj = r["subject"]
        fac = _clean_val(r["faculty"], "Assigned Faculty")
        rm = _clean_val(r["room"], "Classroom")
        stype = r["subject_type"] or "Theory"
        batch = _clean_val(r["batch_info"], "All Batches")

        cards_data.append({
            "period_no": p_no,
            "period_time": time,
            "subject": subj,
            "faculty": fac,
            "room": rm,
            "subject_type": stype,
            "batch_info": batch,
            "section": section,
            "day": day
        })

        markdown_lines.append(f"| Period {p_no} | {time} | **{subj}** | {stype} | {fac} | {rm} | {batch} |")

    answer_text = "\n".join(markdown_lines)

    return {
        "view_type": "single_day",
        "title": title,
        "section": section,
        "day": day,
        "cards": [
            {
                "day": day,
                "section": section,
                "periods": cards_data
            }
        ],
        "markdown_answer": answer_text
    }


def _format_full_section_result(section: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Formats full weekly timetable for a section into Markdown Grid Tables."""
    days_grouped = {}
    for r in rows:
        d = r["day_of_week"]
        if d not in days_grouped:
            days_grouped[d] = []
        days_grouped[d].append(r)

    title = f"{section} — Complete Weekly Timetable"
    text_lines = [
        f"### 📚 **{title}**",
        f"**Section:** {section} | **Weekly Periods:** {len(rows)} | **Days:** Monday to Saturday\n"
    ]
    cards_grouped = []

    for day in DAYS_ORDER:
        if day not in days_grouped:
            continue
        day_rows = days_grouped[day]
        text_lines.append(f"#### 🗓️ **{day} Schedule** ({len(day_rows)} Periods)")
        text_lines.append("| Period | Time | Subject | Type | Faculty | Room / Venue | Batch Info |")
        text_lines.append("| :--- | :--- | :--- | :--- | :--- | :--- | :--- |")

        day_cards = []
        for r in day_rows:
            p_no = r["period_no"]
            time = r["period_time"]
            subj = r["subject"]
            fac = _clean_val(r["faculty"], "Staff")
            rm = _clean_val(r["room"], "Classroom")
            stype = r["subject_type"] or "Theory"
            batch = _clean_val(r["batch_info"], "All Batches")

            day_cards.append({
                "period_no": p_no,
                "period_time": time,
                "subject": subj,
                "faculty": fac,
                "room": rm,
                "subject_type": stype,
                "batch_info": batch,
                "section": section,
                "day": day
            })

            text_lines.append(f"| Period {p_no} | {time} | **{subj}** | {stype} | {fac} | {rm} | {batch} |")

        text_lines.append("")

        cards_grouped.append({
            "day": day,
            "section": section,
            "periods": day_cards
        })

    return {
        "view_type": "weekly",
        "title": title,
        "section": section,
        "cards": cards_grouped,
        "markdown_answer": "\n".join(text_lines)
    }


def _format_branch_result(branch: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Formats full weekly timetable for all sections within a specific branch into Grid Tables."""
    sections_grouped = {}
    for r in rows:
        sec = r["section"]
        if sec not in sections_grouped:
            sections_grouped[sec] = []
        sections_grouped[sec].append(r)

    title = f"{branch} — Department Timetable"
    text_boxes = [f"### 📚 **{title}**"]
    text_boxes.append(f"**Department:** {branch} | **Sections Included:** {', '.join(sections_grouped.keys())}\n")

    cards = []
    for sec, sec_rows in sections_grouped.items():
        res = _format_full_section_result(sec, sec_rows)
        text_boxes.append(res["markdown_answer"])
        cards.extend(res["cards"])

    return {
        "view_type": "branch_schedule",
        "title": title,
        "branch": branch,
        "cards": cards,
        "markdown_answer": "\n\n".join(text_boxes)
    }


def _format_subject_result(subject: str, rows: List[Dict[str, Any]], section_filter: Optional[str] = None, day_filter: Optional[str] = None) -> Dict[str, Any]:
    """Formats subject timing & room search result into Markdown Grid Table."""
    title = f"Class Timings & Rooms for {subject}"
    if section_filter:
        title += f" ({section_filter})"
    if day_filter:
        title += f" on {day_filter}"

    text_lines = [
        f"### 🔍 **{title}**",
        f"**Found {len(rows)} scheduled sessions:**\n",
        "| Section | Day | Period | Time | Subject | Type | Faculty | Room / Venue |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ]
    cards_data = []

    for r in rows:
        sec = r["section"]
        day = r["day_of_week"]
        p_no = r["period_no"]
        time = r["period_time"]
        subj = r["subject"]
        fac = _clean_val(r["faculty"], "Assigned Faculty")
        rm = _clean_val(r["room"], "Online/Classroom")
        stype = r["subject_type"] or "Theory"

        cards_data.append({
            "section": sec,
            "day": day,
            "period_no": p_no,
            "period_time": time,
            "subject": subj,
            "faculty": fac,
            "room": rm,
            "subject_type": stype
        })

        text_lines.append(f"| **{sec}** | {day} | Period {p_no} | {time} | **{subj}** | {stype} | {fac} | {rm} |")

    return {
        "view_type": "subject_search",
        "title": title,
        "cards": cards_data,
        "markdown_answer": "\n".join(text_lines)
    }

    # Group cards by section and day
    grouped = {}
    for c in cards_data:
        k = f"{c['section']} — {c['day']}"
        if k not in grouped:
            grouped[k] = []
        grouped[k].append(c)

    formatted_cards = []
    for k, p_list in grouped.items():
        parts = k.split(" — ")
        formatted_cards.append({
            "section": parts[0],
            "day": parts[1],
            "periods": p_list
        })

    return {
        "view_type": "subject_search",
        "title": title,
        "subject": subject,
        "cards": formatted_cards,
        "markdown_answer": "\n".join(text_boxes)
    }


def _format_day_all_sections_result(day: str, rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Formats schedule for a day across all sections."""
    title = f"All Sections Schedule — {day}"
    text_boxes = [f"### 📅 **{title}**\n"]

    sec_grouped = {}
    for r in rows:
        sec = r["section"]
        if sec not in sec_grouped:
            sec_grouped[sec] = []
        sec_grouped[sec].append(r)

    cards_grouped = []
    for sec, srows in sec_grouped.items():
        text_boxes.append(f"#### 🎓 **Section {sec}**")
        day_cards = []
        for r in srows:
            p_no = r["period_no"]
            time = r["period_time"]
            subj = r["subject"]
            fac = _clean_val(r["faculty"], "Staff")
            rm = _clean_val(r["room"], "Classroom")
            stype = r["subject_type"] or "Theory"

            day_cards.append({
                "period_no": p_no,
                "period_time": time,
                "subject": subj,
                "faculty": fac,
                "room": rm,
                "subject_type": stype,
                "section": sec,
                "day": day
            })

            text_boxes.append(
                f"┌────────────────────────────────────────────────────────┐\n"
                f"│ 🕒 **Period {p_no}** ({time}) • 🏷️ {stype}\n"
                f"│ 📖 **Subject:** {subj}\n"
                f"│ 👨‍🏫 **Faculty:** {fac}  •  📍 **Room:** {rm}\n"
                f"└────────────────────────────────────────────────────────┘"
            )
        text_boxes.append("")
        cards_grouped.append({
            "day": day,
            "section": sec,
            "periods": day_cards
        })

    return {
        "view_type": "day_overview",
        "title": title,
        "day": day,
        "cards": cards_grouped,
        "markdown_answer": "\n".join(text_boxes)
    }
