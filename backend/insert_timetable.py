"""
Insert real student timetable data from QISCET timetable sheets.
Branches: ECE, AID, AI/CSM (CSM), CSD, AID-7
Year: 3rd Year (3-1 semester) for ECE/CSM/CSD; 5th Batch for AID
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import get_db, init_db

# Period timings
PERIOD_TIMES = {
    1: "9:00 - 9:50 am",
    2: "9:50 - 10:40 am",
    3: "11:00 - 11:50 am",
    4: "11:50 - 12:40 pm",
    5: "1:20 - 2:10 pm",
    6: "2:10 - 3:00 pm",
    7: "3:20 - 4:10 pm",
    8: "4:10 - 5:00 pm",
}

# ============================================================
# TIMETABLE DATA
# Format: (year, branch, section, day, period_no, subject, subject_code, faculty, room, batch_info, subject_type)
# ============================================================

TIMETABLE_DATA = [

    # ================================================================
    # ECE - 3-1 SECTION ECE 1
    # ================================================================
    # Monday
    ("3-1", "ECE", "ECE 1", "Monday", 1, "Batch 7 CRT", "CRT", "", "C104", "Batch 7", "Theory"),
    ("3-1", "ECE", "ECE 1", "Monday", 3, "Digital Comm: Lab", "DC Lab", "Dr. K.C.K.Naik", "F103", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Monday", 5, "Technical Certification", "", "", "C184", "ECE 1, ECE 2, ECE 3, ECE 4", "Certification"),
    ("3-1", "ECE", "ECE 1", "Monday", 6, "Technical Certification", "", "", "C184", "ECE 1, ECE 2, ECE 3, ECE 4", "Certification"),
    ("3-1", "ECE", "ECE 1", "Monday", 7, "Batch 7 CRT", "CRT", "", "C104", "Batch 7", "Theory"),
    # Tuesday
    ("3-1", "ECE", "ECE 1", "Tuesday", 1, "Technical Certification", "", "", "", "ECE 1, ECE 2, ECE 3, ECE 4", "Certification"),
    ("3-1", "ECE", "ECE 1", "Tuesday", 2, "RMI (3)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Tuesday", 3, "OR (3)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Tuesday", 4, "Optical Comm (3)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Tuesday", 5, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "ECE", "ECE 1", "Tuesday", 6, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "ECE", "ECE 1", "Tuesday", 7, "Digi Comm", "", "Dr. K.C.K.Naik", "ECE 1", "", "Theory"),
    # Wednesday
    ("3-1", "ECE", "ECE 1", "Wednesday", 1, "Project", "", "K.Sumanajayudu & M.Dibbyajyoti", "H104", "", "Project"),
    ("3-1", "ECE", "ECE 1", "Wednesday", 2, "ADIC Lab", "", "K.Sanuthy", "G206", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Wednesday", 4, "Batch 7 CRT", "", "", "C184", "Batch 7", "Theory"),
    ("3-1", "ECE", "ECE 1", "Wednesday", 5, "Ant Wav Prep", "", "Dr. K.C.K.Naik", "G206", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Wednesday", 6, "Ant Wav Prep", "", "Dr. K.C.K.Naik", "G206", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Wednesday", 7, "Batch 7 CRT", "", "", "C184", "Batch 7", "Theory"),
    # Thursday
    ("3-1", "ECE", "ECE 1", "Thursday", 1, "ADIC", "", "K.Sanuthy", "Prache Kumar", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Thursday", 2, "Comm Skills", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Thursday", 3, "ADIC", "", "K.Sanuthy", "G206", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Thursday", 4, "OR (3)", "", "Dr. K.C.K.Naik", "Lav verry", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Thursday", 5, "Neo Tech", "", "", "G206", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Thursday", 6, "Ant Wav Prep", "", "V.Bhaskar reddy", "G206", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Thursday", 7, "Digi Comm", "", "Dr. K.C.K.Naik", "G206", "", "Theory"),
    # Friday
    ("3-1", "ECE", "ECE 1", "Friday", 1, "Batch 7 CRT", "", "", "C104", "Batch 7", "Theory"),
    ("3-1", "ECE", "ECE 1", "Friday", 2, "ADIC", "", "K.Sanuthy", "ECE 1", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Friday", 3, "Ant Wav Prep", "", "", "ECE 1", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Friday", 4, "Project", "", "K.Sumanajayudu & M.Dibbyajyoti", "H104", "", "Project"),
    ("3-1", "ECE", "ECE 1", "Friday", 5, "Design of Antennas Lab", "", "", "ECE 1", "", "Lab"),
    ("3-1", "ECE", "ECE 1", "Friday", 7, "Batch 7 CRT", "", "", "C104", "Batch 7", "Theory"),
    # Saturday
    ("3-1", "ECE", "ECE 1", "Saturday", 1, "PRIME - Tech", "", "", "D195", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Saturday", 2, "PRIME - Non Tech", "", "", "D102", "", "Theory"),
    ("3-1", "ECE", "ECE 1", "Saturday", 3, "PRIME - Tech", "", "", "D195", "", "Theory"),

    # ================================================================
    # ECE - 3-1 SECTION ECE 2
    # ================================================================
    # Monday
    ("3-1", "ECE", "ECE 2", "Monday", 1, "Project", "", "A.Alelkya & Dr.M.Charanjeevi", "ECE 2-2(71)", "", "Project"),
    ("3-1", "ECE", "ECE 2", "Monday", 3, "Digi Comm", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Monday", 4, "ADIC", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Monday", 5, "Technical Certification", "", "", "C184", "ECE 1,2,3,4", "Certification"),
    ("3-1", "ECE", "ECE 2", "Monday", 6, "Technical Certification", "", "", "C184", "ECE 1,2,3,4", "Certification"),
    ("3-1", "ECE", "ECE 2", "Monday", 7, "Batch 7 CRT", "", "", "C2(71)", "Batch 7, ECE 3:1-30", "Theory"),
    # Tuesday
    ("3-1", "ECE", "ECE 2", "Tuesday", 1, "Technical Certification", "", "", "C184", "", "Certification"),
    ("3-1", "ECE", "ECE 2", "Tuesday", 2, "RMI (3)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Tuesday", 3, "OR (3)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Tuesday", 4, "Optical Comm (3)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Tuesday", 5, "Applied Skilling", "", "", "", "ECE 1,2,3,4", "Skilling"),
    ("3-1", "ECE", "ECE 2", "Tuesday", 6, "Applied Skilling", "", "", "", "ECE 1,2,3,4", "Skilling"),
    ("3-1", "ECE", "ECE 2", "Tuesday", 7, "Non Tech", "", "", "ECE 2", "", "Theory"),
    # Wednesday
    ("3-1", "ECE", "ECE 2", "Wednesday", 1, "Technical Certification", "", "", "", "", "Certification"),
    ("3-1", "ECE", "ECE 2", "Wednesday", 2, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "ECE", "ECE 2", "Wednesday", 3, "Optical Comm (2)", "", "", "", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Wednesday", 5, "Digi Comm", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Wednesday", 6, "Soft Skill", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Wednesday", 7, "Optical Comm (2)", "", "", "ECE 2", "", "Theory"),
    # Thursday
    ("3-1", "ECE", "ECE 2", "Thursday", 1, "Ant Wav Prep", "", "", "ECE 2", "", "Lab"),
    ("3-1", "ECE", "ECE 2", "Thursday", 2, "V.Bhaskar reddy", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Thursday", 3, "ADIC", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Thursday", 4, "Ant Wav Prep", "", "", "ECE 2", "", "Lab"),
    ("3-1", "ECE", "ECE 2", "Thursday", 6, "Digi Comm: Lab", "", "", "F103", "", "Lab"),
    ("3-1", "ECE", "ECE 2", "Thursday", 7, "Computer Network Lab", "", "P.Koteswara rao", "", "", "Lab"),
    # Friday
    ("3-1", "ECE", "ECE 2", "Friday", 1, "ADIC", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Friday", 3, "Comm Skills", "", "Prashanth kumar", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Friday", 4, "Computer Network & Protocol", "", "", "ECE 2", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Friday", 5, "Design of Antennas Lab", "", "D.V.Ashok", "F103", "", "Lab"),
    ("3-1", "ECE", "ECE 2", "Friday", 6, "Computer Network & Protocol", "", "", "ECE 2", "", "Theory"),
    # Saturday
    ("3-1", "ECE", "ECE 2", "Saturday", 1, "PRIME - Soft Skill", "", "", "D105", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Saturday", 2, "PRIME - Non Tech", "", "", "J102", "", "Theory"),
    ("3-1", "ECE", "ECE 2", "Saturday", 3, "PRIME - Tech", "", "", "J102", "", "Theory"),

    # ================================================================
    # AID - BATCH 5 (AID 1, AID 2, AID 3) - 3-1 Year
    # ================================================================
    # AID 1 - Monday
    ("3-1", "AI&DS", "AID 1", "Monday", 1, "Batch 5 CRT AID 2", "CRT", "", "AID 2(69)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Monday", 3, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    ("3-1", "AI&DS", "AID 1", "Monday", 5, "Technical Certification", "", "", "D206", "AID 1,AID 2,AID 3", "Certification"),
    ("3-1", "AI&DS", "AID 1", "Monday", 6, "Technical Certification", "", "", "D206", "AID 1,AID 2,AID 3", "Certification"),
    ("3-1", "AI&DS", "AID 1", "Monday", 7, "Data Visualization Lab", "", "A.Suneetha", "H207", "", "Lab"),
    # AID 1 - Tuesday
    ("3-1", "AI&DS", "AID 1", "Tuesday", 1, "Technical Certification", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 1", "Tuesday", 2, "PE 1 AID 2,AID 3 IoT", "IoT", "S.Anumasi", "D102", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Tuesday", 3, "DWDM", "DWDM", "Dr.T.Sunitha", "D104", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Tuesday", 4, "Applied Skilling Batch 5 AID 1,2,3", "", "", "", "AID 1,2,3", "Skilling"),
    ("3-1", "AI&DS", "AID 1", "Tuesday", 5, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "AI&DS", "AID 1", "Tuesday", 7, "Non Tech", "M.S.R", "", "G103", "", "Theory"),
    # AID 1 - Wednesday
    ("3-1", "AI&DS", "AID 1", "Wednesday", 1, "DWDM Online", "DWDM", "Dr.T.Sunitha", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Wednesday", 3, "Data Visualization", "", "A.Suneetha", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Wednesday", 4, "Machine Learning", "ML", "T.Bhargavi", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Wednesday", 5, "IoT", "IoT", "S.Anumasi Online", "", "Online", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Wednesday", 6, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "Online", "", "Theory"),
    # AID 1 - Thursday
    ("3-1", "AI&DS", "AID 1", "Thursday", 1, "Soft skills", "Soft", "L.Surya vansi", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Thursday", 2, "DWDM", "DWDM", "Dr.T.Sunitha", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Thursday", 3, "Machine Learning", "ML", "T.Bhargavi", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Thursday", 4, "Data visualization", "", "A.Suneetha", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Thursday", 5, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Thursday", 7, "DWDM Lab", "DWDM Lab", "Dr.T.Sunitha", "C001", "", "Lab"),
    # AID 1 - Friday
    ("3-1", "AI&DS", "AID 1", "Friday", 1, "PE 1 IoT", "IoT", "S.Anumasi", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Friday", 2, "Data visualization", "", "A.Suneetha", "E104", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Friday", 3, "Batch 5 CRT", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Friday", 5, "Flutter App development", "", "", "H206", "", "Lab"),
    ("3-1", "AI&DS", "AID 1", "Friday", 7, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    # AID 1 - Saturday
    ("3-1", "AI&DS", "AID 1", "Saturday", 1, "DWDM", "DWDM", "Dr.T.Sunitha", "E203", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Saturday", 2, "Data visualization", "", "A.Suneetha", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Saturday", 3, "Machine Learning", "ML", "T.Bhargavi", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Saturday", 4, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Saturday", 6, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "", "", "Theory"),
    ("3-1", "AI&DS", "AID 1", "Saturday", 8, "P.E.T", "", "", "D001", "AID 1,AID 2,AID 3", "Theory"),

    # AID 2 - Monday
    ("3-1", "AI&DS", "AID 2", "Monday", 1, "Batch 5 CRT AID 2", "CRT", "", "AID 2(69)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Monday", 3, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    ("3-1", "AI&DS", "AID 2", "Monday", 5, "Technical Certification", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 2", "Monday", 6, "Technical Certification", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 2", "Monday", 7, "Data Visualization Lab AID 2", "", "A.Suneetha", "H207", "", "Lab"),
    # AID 2 - Tuesday
    ("3-1", "AI&DS", "AID 2", "Tuesday", 1, "Technical Certification", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 2", "Tuesday", 2, "PE 1 AID 2,AID 3 IoT", "IoT", "S.Anumasi", "D102", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Tuesday", 3, "DWDM", "DWDM", "Dr.T.Sunitha", "D104", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Tuesday", 4, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "AI&DS", "AID 2", "Tuesday", 5, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "AI&DS", "AID 2", "Tuesday", 7, "Comm Skills", "Comm.Skills", "Prashanth kumar", "E104", "", "Theory"),
    # AID 2 - Wednesday
    ("3-1", "AI&DS", "AID 2", "Wednesday", 1, "DWDM AID 2 Online", "DWDM", "Dr.T.Sunitha", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Wednesday", 3, "Data visualization AID 2", "", "A.Suneetha", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Wednesday", 4, "Machine Learning AID 2", "ML", "T.Bhargavi", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Wednesday", 5, "IoT AID 2", "IoT", "S.Anumasi", "Online/EDA", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Wednesday", 6, "OE 1 AID 2", "OE1", "T.Maheswaari", "Online", "", "Theory"),
    # AID 2 - Thursday
    ("3-1", "AI&DS", "AID 2", "Thursday", 1, "Soft skills", "Soft", "L.Surya vansi", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Thursday", 2, "DWDM", "DWDM", "Dr.T.Sunitha", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Thursday", 3, "Machine Learning", "ML", "T.Bhargavi", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Thursday", 4, "Data visualization", "", "A.Suneetha", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Thursday", 5, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Thursday", 7, "DWDM Lab", "DWDM Lab", "Dr.T.Sunitha", "C001", "", "Lab"),
    # AID 2 - Friday
    ("3-1", "AI&DS", "AID 2", "Friday", 1, "PE 1 IoT AID 2,AID 3", "IoT", "S.Anumasi", "E202", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Friday", 2, "Data visualization", "", "A.Suneetha", "E104", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Friday", 3, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Friday", 5, "Flutter App development AID 2", "", "", "H206", "", "Lab"),
    ("3-1", "AI&DS", "AID 2", "Friday", 7, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    # AID 2 - Saturday
    ("3-1", "AI&DS", "AID 2", "Saturday", 1, "DWDM", "DWDM", "Dr.T.Sunitha", "E203", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Saturday", 2, "Data visualization", "", "A.Suneetha", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Saturday", 3, "Machine Learning", "ML", "T.Bhargavi", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Saturday", 4, "OE 1", "OE1", "Dr.Ch.Venkata rao", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 2", "Saturday", 8, "P.E.T", "", "", "D001", "", "Theory"),

    # AID 3 - Monday
    ("3-1", "AI&DS", "AID 3", "Monday", 1, "Batch 5 CRT AID 2", "CRT", "", "AID 2(69)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Monday", 3, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    ("3-1", "AI&DS", "AID 3", "Monday", 5, "Technical Certification AID 1,2,3", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 3", "Monday", 6, "Technical Certification AID 1,2,3", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 3", "Monday", 7, "Data Visualization Lab", "", "A.Suneetha", "H207", "", "Lab"),
    # AID 3 - Tuesday
    ("3-1", "AI&DS", "AID 3", "Tuesday", 1, "Technical Certification", "", "", "D206", "", "Certification"),
    ("3-1", "AI&DS", "AID 3", "Tuesday", 2, "PE 1 AID 2,AID 3 IoT", "IoT", "S.Anumasi", "D102", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Tuesday", 3, "DWDM", "DWDM", "Dr.T.Sunitha", "D104", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Tuesday", 4, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "AI&DS", "AID 3", "Tuesday", 5, "Applied Skilling", "", "", "", "", "Skilling"),
    ("3-1", "AI&DS", "AID 3", "Tuesday", 7, "Non Tech", "M.S.R", "", "G103", "", "Theory"),
    # AID 3 - Wednesday (same as AID 2 online slots)
    ("3-1", "AI&DS", "AID 3", "Wednesday", 1, "DWDM Online", "DWDM", "Dr.T.Sunitha", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Wednesday", 3, "Data visualization", "", "A.Suneetha", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Wednesday", 4, "Machine Learning", "ML", "T.Bhargavi", "Online", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Wednesday", 5, "IoT", "IoT", "T.Maheswaari", "Online/EDA", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Wednesday", 6, "OE 1", "OE1", "Dr.Ch.Venkata rao", "Online", "", "Theory"),
    # AID 3 - Thursday
    ("3-1", "AI&DS", "AID 3", "Thursday", 1, "Soft skills", "Soft", "L.Surya vansi", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Thursday", 2, "DWDM", "DWDM", "Dr.T.Sunitha", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Thursday", 3, "Machine Learning", "ML", "T.Bhargavi", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Thursday", 4, "Data visualization", "", "A.Suneetha", "D003", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Thursday", 5, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Thursday", 7, "DWDM Lab", "DWDM Lab", "Dr.T.Sunitha", "C001", "", "Lab"),
    # AID 3 - Friday
    ("3-1", "AI&DS", "AID 3", "Friday", 1, "PE 1 AID 2,AID 3 IoT", "IoT", "S.Anumasi", "E202", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Friday", 2, "Data visualization", "", "A.Suneetha", "E104", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Friday", 3, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Friday", 5, "Flutter App development AID 2", "", "", "H206", "", "Lab"),
    ("3-1", "AI&DS", "AID 3", "Friday", 7, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    # AID 3 - Saturday
    ("3-1", "AI&DS", "AID 3", "Saturday", 1, "DWDM", "DWDM", "Dr.T.Sunitha", "E203", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Saturday", 2, "Data visualization", "", "A.Suneetha", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Saturday", 3, "Machine Learning", "ML", "T.Bhargavi", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Saturday", 4, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "E102", "", "Theory"),
    ("3-1", "AI&DS", "AID 3", "Saturday", 8, "P.E.T", "", "", "D001", "", "Theory"),

    # ================================================================
    # AI/CSM (CSM) - 3-1 - CSM 1
    # ================================================================
    # Monday
    ("3-1", "AI/CSM", "CSM 1", "Monday", 1, "OS AI Online", "OS", "H.Sumedha", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Monday", 2, "Deep learning AI Online", "DL", "Sk.Apurra", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Monday", 3, "Computer Network & Protocols", "CNP", "P.Koteswara rao", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Monday", 4, "PE 1 AI Online", "", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Monday", 5, "EDAVC AI Online", "EDAVC", "A.Narsimha rao", "", "", "Theory"),
    # Tuesday
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 1, "Comm Skills AI", "Comm", "Prashanth kumar", "E104", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 2, "Deep learning AI", "DL", "Sk.Apurra", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 3, "EDAVC AI", "EDAVC", "A.Narsimha rao", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 4, "Batch 3 CRT CSM 1", "CRT", "", "C3(169)", "Batch 3", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 5, "Flutter App development CSM 1", "", "", "", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 6, "CRT", "", "Dr.D.Ananda Babu & Dr.Y.Kavi Shanthi", "C3(169)", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Tuesday", 7, "Project", "", "Sk.Rahmon Books & Dr.M.Heri Babu", "H101", "", "Project"),
    # Wednesday
    ("3-1", "AI/CSM", "CSM 1", "Wednesday", 1, "Flutter App development AI", "", "", "", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 1", "Wednesday", 2, "OS AI", "OS", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Wednesday", 3, "Library", "", "", "", "", "Activity"),
    ("3-1", "AI/CSM", "CSM 1", "Wednesday", 4, "Soft Skill", "", "S.Yamini Upenki", "B105", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Wednesday", 5, "Non Tech", "M.S.R", "", "G107", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Wednesday", 6, "Computer Network & Protocols", "CNP", "P.Koteswara rao", "B195", "", "Theory"),
    # Thursday
    ("3-1", "AI/CSM", "CSM 1", "Thursday", 1, "Project", "", "Sk.Rahmon Books & Dr.M.Heri Babu", "E101", "", "Project"),
    ("3-1", "AI/CSM", "CSM 1", "Thursday", 2, "Technical Certification AI CSM 1,2,3", "", "", "", "", "Certification"),
    ("3-1", "AI/CSM", "CSM 1", "Thursday", 3, "Computer Network & Protocol Lab", "", "P.Koteswara rao", "C001", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 1", "Thursday", 4, "Batch 3 CRT", "CRT", "", "H101 - 45,CSM 2-25", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Thursday", 5, "Deep Learning Lab", "DL Lab", "Sk.Apurra", "C001", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 1", "Thursday", 6, "Computer Network", "", "P.Koteswara rao", "C001", "", "Theory"),
    # Friday
    ("3-1", "AI/CSM", "CSM 1", "Friday", 1, "Computer Networks & Protocol", "CNP", "P.Koteswara rao", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Friday", 2, "Computer Networks & Protocol", "CNP", "P.Koteswara rao", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Friday", 3, "Deep learning AI", "DL", "Sk.Apurra", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Friday", 4, "P.E.T", "PET", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Friday", 5, "Technical Certification AI CSM 1,2,3", "", "", "", "", "Certification"),
    ("3-1", "AI/CSM", "CSM 1", "Friday", 6, "PE 1 Deep learning", "DL", "Sk.Apurra", "E301", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Friday", 8, "EDAVC AI", "EDAVC", "A.Narsimha rao", "D104", "", "Theory"),
    # Saturday
    ("3-1", "AI/CSM", "CSM 1", "Saturday", 1, "Applied Skilling AI CSM 1,2,3", "", "", "", "", "Skilling"),
    ("3-1", "AI/CSM", "CSM 1", "Saturday", 2, "Deep learning AI", "DL", "Sk.Apurra", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Saturday", 3, "PE 1", "", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Saturday", 4, "Deep learning AI", "DL", "Sk.Apurra", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 1", "Saturday", 5, "CRT", "", "", "H101", "", "Theory"),

    # CSM 2 - Key entries
    ("3-1", "AI/CSM", "CSM 2", "Monday", 1, "PRIME - Tech CSM 1", "", "R.Caressa", "D106", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Monday", 2, "PRIME - Soft Skill", "", "", "D105", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Monday", 3, "PRIME - Tech", "", "", "J102", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Monday", 4, "PRIME - Non Tech", "", "", "J102", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Tuesday", 1, "OE 3", "OE3", "M.S.R", "C286", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Tuesday", 2, "EDAVC AI", "EDAVC", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Tuesday", 3, "Flutter App development CSM 1", "", "", "", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 2", "Tuesday", 4, "CRT CSM 1", "CRT", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Wednesday", 1, "Comm Skills", "Comm", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Wednesday", 2, "Library", "", "", "", "", "Activity"),
    ("3-1", "AI/CSM", "CSM 2", "Wednesday", 5, "Deep learning Lab", "DL Lab", "Sk.Apurra", "C001", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 2", "Wednesday", 7, "OS", "OS", "", "D104", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Wednesday", 8, "EDAVC AI", "EDAVC", "A.Narsimha rao", "D104", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Thursday", 1, "Project", "", "Dr.D.Ananda Babu & Dr.Y.Ravi Shankar", "E204", "", "Project"),
    ("3-1", "AI/CSM", "CSM 2", "Thursday", 2, "Technical Certification AI CSM 1,2,3", "", "", "", "", "Certification"),
    ("3-1", "AI/CSM", "CSM 2", "Thursday", 4, "Computer Network & Protocols Lab", "CNP Lab", "P.Koteswara rao", "C001", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 2", "Thursday", 5, "Deep Learning Lab", "DL Lab", "Sk.Apurra", "C001", "", "Lab"),
    ("3-1", "AI/CSM", "CSM 2", "Friday", 1, "PE 1", "", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Friday", 3, "Deep learning", "DL", "Sk.Apurra", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Friday", 5, "Technical Certification AI CSM 1,2,3", "", "", "", "", "Certification"),
    ("3-1", "AI/CSM", "CSM 2", "Friday", 6, "M.Mohana prasad", "", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Saturday", 1, "Applied Skilling AI CSM 1,2,3", "", "", "", "", "Skilling"),
    ("3-1", "AI/CSM", "CSM 2", "Saturday", 2, "Deep learning", "DL", "Sk.Apurra", "B204", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Saturday", 3, "PE 1", "", "", "", "", "Theory"),
    ("3-1", "AI/CSM", "CSM 2", "Saturday", 5, "CRT", "", "", "", "", "Theory"),

    # ================================================================
    # CSD - 3-1 - CSD 1 & CSD 2
    # ================================================================
    # CSD 1 - Monday
    ("3-1", "CSD", "CSD 1", "Monday", 1, "Technical Certification AI CSM 1,2,3", "", "", "", "", "Certification"),
    ("3-1", "CSD", "CSD 1", "Monday", 2, "OE 1", "OE1", "L.Amruswari", "G202", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Monday", 3, "Software Engg", "SE", "V.Suneetha", "G202", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Monday", 4, "Computer Network & Protocols Lab", "CNP Lab", "Dr.K.C.K.Naik", "G202", "", "Lab"),
    ("3-1", "CSD", "CSD 1", "Monday", 5, "Machine learning", "ML", "L.Murali krishan", "E303", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Monday", 6, "PE 1 OOAD", "OOAD", "V.Amuka", "E303", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Monday", 7, "Project", "", "Dr.Murali Krishna & M.Srean", "CSD 2(69)", "", "Project"),
    # CSD 1 - Tuesday
    ("3-1", "CSD", "CSD 1", "Tuesday", 1, "Flutter App development CSD 1", "", "", "D105", "", "Lab"),
    ("3-1", "CSD", "CSD 1", "Tuesday", 2, "Batch 4 CRT CSD 1", "CRT", "", "CSD 1(76)", "Batch 4", "Theory"),
    ("3-1", "CSD", "CSD 1", "Tuesday", 3, "Computer Network & Protocols", "CNP", "Sk.Network lkrikan", "", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Tuesday", 4, "OE ED&VC", "EDVC", "Sk.Network", "", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Tuesday", 5, "PE 3", "", "", "", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Tuesday", 6, "Computer Network & Protocols", "CNP", "Dr.K.C.K.Naik", "", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Tuesday", 7, "Computer Network & Protocols", "CNP", "Dr.K.C.K.Naik", "", "", "Theory"),
    # CSD 1 - Wednesday
    ("3-1", "CSD", "CSD 1", "Wednesday", 1, "OE ED&VC", "EDVC", "A.Narsimha rao Online", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Wednesday", 2, "PRIME - Non Tech", "", "", "J102", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Wednesday", 3, "PRIME - Tech", "", "", "D105", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Wednesday", 4, "PRIME - Soft Skill", "", "R.Caressa", "D105", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Wednesday", 5, "Machine learning Online", "ML", "M.Remalaswaari", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Wednesday", 6, "Software Engg Online", "SE", "V.Suneetha", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Wednesday", 7, "OOAD Online", "OOAD", "V.Amuka", "Online", "", "Theory"),
    # CSD 1 - Thursday
    ("3-1", "CSD", "CSD 1", "Thursday", 1, "Batch 4 CRT CSD 1", "CRT", "", "C002", "CSD 1,CSD 2,CSD 3", "Theory"),
    ("3-1", "CSD", "CSD 1", "Thursday", 2, "Project", "", "Dr.Murali Krishna & M.Srean", "C002", "", "Project"),
    ("3-1", "CSD", "CSD 1", "Thursday", 3, "Technical Certification AI CSM1,CSM2,CSM3", "", "", "", "", "Certification"),
    ("3-1", "CSD", "CSD 1", "Thursday", 4, "Machine learning Lab", "ML Lab", "L.Murali krishan", "H207", "", "Lab"),
    ("3-1", "CSD", "CSD 1", "Thursday", 5, "Computer Network & Protocols Lab", "CNP Lab", "M.Reena Rani", "C001", "", "Lab"),
    ("3-1", "CSD", "CSD 1", "Thursday", 6, "Library", "", "", "", "", "Activity"),
    # CSD 1 - Friday
    ("3-1", "CSD", "CSD 1", "Friday", 1, "Applied Skilling Batch 5 AID1,AID2,AID3", "", "", "", "", "Skilling"),
    ("3-1", "CSD", "CSD 1", "Friday", 2, "Comm Skills", "Comm", "Prashunth Kumar", "E164", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Friday", 3, "Library", "", "", "", "", "Activity"),
    ("3-1", "CSD", "CSD 1", "Friday", 4, "Machine learning", "ML", "L.Murali krishan", "E164", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Friday", 5, "Computer Network & Protocols", "CNP", "Dr.K.C.K.Naik", "E164", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Friday", 6, "Non Tech", "", "", "E164", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Friday", 7, "Soft skills", "", "", "CSD 3", "", "Theory"),
    # CSD 1 - Saturday
    ("3-1", "CSD", "CSD 1", "Saturday", 1, "Project", "", "Dr.Murali Krishna & M.Srean", "F160", "Batch 4 CSD 1", "Project"),
    ("3-1", "CSD", "CSD 1", "Saturday", 2, "Computer Network & Protocols", "CNP", "L.Murali krishan", "E101", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Saturday", 3, "Machine learning", "ML", "", "CSM 1,ANC 6,CSD 3", "", "Theory"),
    ("3-1", "CSD", "CSD 1", "Saturday", 4, "Batch 4 CRT", "CRT", "", "CSD 1(76)", "Batch 4", "Theory"),
    ("3-1", "CSD", "CSD 1", "Saturday", 5, "Machine learning Lab", "ML Lab", "T.Bhargavi", "H207", "", "Lab"),
    ("3-1", "CSD", "CSD 1", "Saturday", 6, "Machine learning", "ML", "", "Online", "", "Theory"),

    # CSD 2 - Key entries
    ("3-1", "CSD", "CSD 2", "Monday", 1, "Technical Certification", "", "", "", "", "Certification"),
    ("3-1", "CSD", "CSD 2", "Monday", 2, "PE 1", "", "L.Amruswari", "G202", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Monday", 4, "Flutter App development CSD 1", "", "", "D105", "", "Lab"),
    ("3-1", "CSD", "CSD 2", "Monday", 5, "Machine learning CSD 2", "ML", "M.Remalaswaari", "G103", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Monday", 6, "OOAD", "OOAD", "V.Amuka", "G103", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Monday", 7, "Project CSD 2", "", "Dr.Deena Devika & M.Srean", "D105", "", "Project"),
    ("3-1", "CSD", "CSD 2", "Tuesday", 1, "Project CSD 2", "", "Dr.Deena Devika & M.Srean", "D105", "", "Project"),
    ("3-1", "CSD", "CSD 2", "Tuesday", 2, "CRT CSD 2", "CRT", "", "", "Batch 4", "Theory"),
    ("3-1", "CSD", "CSD 2", "Tuesday", 3, "Computer Network & Protocols CSD 2", "CNP", "T.Bhargavi", "G103", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Tuesday", 4, "Computer Network & Protocols CSD 2", "CNP", "T.Bhargavi", "G103", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Wednesday", 1, "ED&VC CSD Online", "EDVC", "A.Narsimha rao", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Wednesday", 4, "Machine learning CSD 2 Online", "ML", "M.Remalaswaari", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Wednesday", 5, "Software Engg Online", "SE", "V.Suneetha", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Wednesday", 6, "OOAD Online", "OOAD", "V.Amuka", "Online", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Thursday", 1, "Machine learning Lab CSD 2", "ML Lab", "M.Mohana prasad", "H207", "", "Lab"),
    ("3-1", "CSD", "CSD 2", "Thursday", 4, "Computer Network & Protocols Lab CSD 2", "CNP Lab", "M.Reena Rani", "C001", "", "Lab"),
    ("3-1", "CSD", "CSD 2", "Friday", 1, "Software Engg CSD 2", "SE", "V.Suneetha", "F191", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Friday", 2, "Comm Skills", "Comm", "M.K.Rentelaswaari", "G103", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Friday", 4, "Non Tech", "", "", "F191", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Friday", 5, "Machine learning CSD 2", "ML", "T.Bhargavi", "F163", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Friday", 6, "Soft skills", "", "M.Remalaswaari", "F163", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Friday", 7, "OE 1 ED&VC", "EDVC", "A.Narsimha rao", "E301", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Saturday", 1, "Machine learning Lab CSD 2", "ML Lab", "T.Bhargavi", "H207", "", "Lab"),
    ("3-1", "CSD", "CSD 2", "Saturday", 3, "Software Engg CSD 2", "SE", "V.Suneetha", "", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Saturday", 4, "Batch 4 CRT CSD 2", "CRT", "", "CSD 1(76)", "Batch 4", "Theory"),
    ("3-1", "CSD", "CSD 2", "Saturday", 5, "Comm Skills", "Comm", "Prashanth Kumar", "", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Saturday", 6, "OOAD", "OOAD", "V.Amuka", "G103", "", "Theory"),
    ("3-1", "CSD", "CSD 2", "Saturday", 7, "Batch 4 CRT", "CRT", "", "CSD 2(69)", "Batch 4", "Theory"),

    # ================================================================
    # AID - 7-1 (7th batch, AID sections)
    # ================================================================
    # AID 1 7-1 Monday
    ("7-1", "AI&DS", "AID 1", "Monday", 1, "Batch 5 CRT AID 1", "CRT", "", "AID 1(79)", "Batch 5", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Monday", 2, "DWDM AID 2", "DWDM", "Dr.T.Sunitha", "A302", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Monday", 3, "Machine Learning", "ML", "T.Bhargavi", "", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Monday", 4, "Technical Certification", "", "", "", "", "Certification"),
    ("7-1", "AI&DS", "AID 1", "Monday", 5, "Technical Certification", "", "", "", "", "Certification"),
    ("7-1", "AI&DS", "AID 1", "Monday", 7, "Data visualization Lab", "", "A.Suneetha", "", "", "Lab"),
    # AID 1 7-1 Tuesday
    ("7-1", "AI&DS", "AID 1", "Tuesday", 1, "Technical Certification", "", "", "", "", "Certification"),
    ("7-1", "AI&DS", "AID 1", "Tuesday", 2, "Applied Skilling Batch 5 AID 1,2,3", "", "", "", "", "Skilling"),
    ("7-1", "AI&DS", "AID 1", "Tuesday", 3, "Applied Skilling", "", "", "", "", "Skilling"),
    ("7-1", "AI&DS", "AID 1", "Tuesday", 5, "Non Tech M.S.R", "M.S.R", "", "G103", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Tuesday", 7, "Comm Skills", "Comm", "Prashanth kumar", "E104", "", "Theory"),
    # AID 1 7-1 Wednesday (Online)
    ("7-1", "AI&DS", "AID 1", "Wednesday", 1, "DWDM Online", "DWDM", "Dr.T.Sunitha", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Wednesday", 2, "Data visualization", "", "A.Suneetha", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Wednesday", 3, "Machine Learning", "ML", "T.Bhargavi", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Wednesday", 5, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Wednesday", 7, "T.Maheswaari", "", "", "Online", "", "Theory"),
    # AID 1 7-1 Thursday
    ("7-1", "AI&DS", "AID 1", "Thursday", 1, "Soft skills", "Soft", "L.Surya vansi", "D003", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Thursday", 2, "DWDM", "DWDM", "Dr.T.Sunitha", "D003", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Thursday", 3, "Machine Learning", "ML", "T.Bhargavi", "D003", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Thursday", 4, "Data visualization", "", "A.Suneetha", "D003", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Thursday", 5, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Thursday", 7, "DWDM Lab", "DWDM Lab", "Dr.T.Sunitha", "C001", "", "Lab"),
    # AID 1 7-1 Friday
    ("7-1", "AI&DS", "AID 1", "Friday", 1, "Data visualization", "", "A.Suneetha", "E104", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Friday", 2, "Batch 5 CRT AID 2", "CRT", "", "AID 2(71)", "Batch 5", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Friday", 4, "Flutter App development AID 2", "", "", "H206", "", "Lab"),
    ("7-1", "AI&DS", "AID 1", "Friday", 5, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    # AID 1 7-1 Saturday
    ("7-1", "AI&DS", "AID 1", "Saturday", 1, "DWDM", "DWDM", "Dr.T.Sunitha", "E203", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Saturday", 2, "Data visualization", "", "A.Suneetha", "E102", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Saturday", 3, "Machine Learning", "ML", "T.Bhargavi", "E102", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Saturday", 4, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "E102", "", "Theory"),
    ("7-1", "AI&DS", "AID 1", "Saturday", 8, "P.E.T", "", "", "D001", "", "Theory"),

    # AID 2 7-1 (Abbreviated key slots)
    ("7-1", "AI&DS", "AID 2", "Monday", 1, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    ("7-1", "AI&DS", "AID 2", "Monday", 3, "DWDM", "DWDM", "Dr.T.Sunitha", "", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Monday", 5, "Technical Certification", "", "", "", "", "Certification"),
    ("7-1", "AI&DS", "AID 2", "Monday", 7, "Data visualization Lab", "", "A.Suneetha", "H207", "", "Lab"),
    ("7-1", "AI&DS", "AID 2", "Tuesday", 1, "Technical Certification", "", "", "", "", "Certification"),
    ("7-1", "AI&DS", "AID 2", "Tuesday", 3, "Applied Skilling", "", "", "", "", "Skilling"),
    ("7-1", "AI&DS", "AID 2", "Tuesday", 6, "Non Tech M.S.R", "M.S.R", "", "G103", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Wednesday", 1, "DWDM AID 2 Online", "DWDM", "Dr.T.Sunitha", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Wednesday", 3, "Machine Learning AID 2", "ML", "T.Bhargavi", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Wednesday", 5, "Operation Research OE 1", "OR", "Dr.Ch.Venkata rao", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Thursday", 1, "Soft skills", "Soft", "L.Surya vansi", "D003", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Thursday", 3, "Machine Learning", "ML", "T.Bhargavi", "D003", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Thursday", 7, "DWDM Lab", "DWDM Lab", "Dr.T.Sunitha", "C001", "", "Lab"),
    ("7-1", "AI&DS", "AID 2", "Friday", 2, "Data visualization", "", "A.Suneetha", "E104", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Friday", 4, "Flutter App development AID 2", "", "", "H206", "", "Lab"),
    ("7-1", "AI&DS", "AID 2", "Friday", 7, "Project", "", "Shaik Gonse John & Dr.A.Gnana Sagaya Raj", "E204", "", "Project"),
    ("7-1", "AI&DS", "AID 2", "Saturday", 1, "DWDM", "DWDM", "Dr.T.Sunitha", "E363", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Saturday", 3, "Machine Learning", "ML", "T.Bhargavi", "E102", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Saturday", 6, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Saturday", 7, "OE 1 Operation Research", "OR", "Dr.Ch.Venkata rao", "Online", "", "Theory"),
    ("7-1", "AI&DS", "AID 2", "Saturday", 8, "P.E.T", "", "", "D001", "", "Theory"),
]


def insert_timetable():
    init_db()
    conn = get_db()
    # Clear existing timetable
    conn.execute("DELETE FROM student_timetable")
    conn.commit()

    inserted = 0
    for row in TIMETABLE_DATA:
        year, branch, section, day, period_no, subject, subject_code, faculty, room, batch_info, subject_type = row
        period_time = PERIOD_TIMES.get(period_no, "")
        conn.execute(
            """INSERT INTO student_timetable 
               (year, branch, section, day_of_week, period_no, period_time, subject, subject_code, faculty, room, batch_info, subject_type)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (year, branch, section, day, period_no, period_time, subject, subject_code, faculty, room, batch_info, subject_type)
        )
        inserted += 1

    conn.commit()
    print(f"[OK] Inserted {inserted} timetable entries successfully!")

    # Verify
    cur = conn.cursor()
    cur.execute("SELECT year, branch, section, COUNT(*) as cnt FROM student_timetable GROUP BY year, branch, section ORDER BY branch, section")
    rows = cur.fetchall()
    print("\n[SUMMARY] Timetable Summary:")
    print(f"{'Year':<8} {'Branch':<10} {'Section':<10} {'Periods'}")
    print("-" * 45)
    for r in rows:
        print(f"{r[0]:<8} {r[1]:<10} {r[2]:<10} {r[3]}")
    conn.close()


if __name__ == "__main__":
    insert_timetable()
