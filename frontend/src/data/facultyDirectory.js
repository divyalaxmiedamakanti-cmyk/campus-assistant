// ==============================================================================
// QIS COLLEGE OF ENGINEERING AND TECHNOLOGY - FACULTY DIRECTORY & TIMETABLES
// ==============================================================================

export const FACULTY_DIRECTORY = [
  {
    id: "vara_prasad",
    name: "Dr. Vara Prasad",
    title: "Dr. Vara Prasad",
    designation: "Professor & Head of Department (HOD - CSE & AIML)",
    department: "Computer Science & AIML",
    cabin: "Room 204, CSE Block (HOD Cabin, Ground Floor)",
    email: "vara.prasad@qiscet.edu.in",
    phone: "+91 90000 22222",
    officeHours: "02:00 PM – 04:00 PM (Mon–Fri)",
    onlineDay: "Monday",
    subjects: ["Machine Learning (23AI501)", "Neural Networks (23CS503)", "Deep Learning Lab (23DS602)"],
    timetable: {
      Monday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Machine Learning", section: "AIML-2", room: "MS Teams", online: true },
        { period: 2, start: "10:00", end: "11:00", subject: "Neural Networks", section: "CSE-5", room: "MS Teams", online: true },
        { period: 3, start: "11:00", end: "12:00", subject: "Machine Learning", section: "AIML-2", room: "MS Teams", online: true },
        { period: 4, start: "14:00", end: "15:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "MS Teams", online: true },
      ],
      Tuesday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Neural Networks", section: "CSE-5", room: "CS-205", online: false },
        { period: 2, start: "10:00", end: "11:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
        { period: 3, start: "11:00", end: "12:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Neural Networks", section: "CSE-5", room: "CS-205", online: false },
        { period: 5, start: "15:00", end: "16:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
      ],
      Wednesday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
        { period: 2, start: "10:00", end: "11:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", online: false },
        { period: 3, start: "11:00", end: "12:00", subject: "Neural Networks", section: "CSE-5", room: "CS-205", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
      ],
      Thursday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", online: false },
        { period: 2, start: "10:00", end: "11:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
        { period: 3, start: "11:00", end: "12:00", subject: "Neural Networks", section: "CSE-5", room: "CS-205", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", online: false },
        { period: 5, start: "15:00", end: "16:00", subject: "Neural Networks", section: "CSE-5", room: "CS-205", online: false },
      ],
      Friday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Neural Networks", section: "CSE-5", room: "CS-205", online: false },
        { period: 2, start: "10:00", end: "11:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
        { period: 3, start: "11:00", end: "12:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Machine Learning", section: "AIML-2", room: "CS-301", online: false },
        { period: 5, start: "15:00", end: "16:30", subject: "Department Meeting & Mentoring", section: "All Faculty", room: "Conference Hall 202", online: false },
      ],
    },
  },
  {
    id: "avinash",
    name: "Dr. K. Avinash",
    title: "Dr. K. Avinash",
    designation: "Associate Professor",
    department: "Computer Science & Data Science",
    cabin: "Room 208, CSE Block (Faculty Cabin 4)",
    email: "avinash@qiscet.edu.in",
    phone: "+91 90000 33334",
    officeHours: "11:00 AM – 01:00 PM (Tue–Fri)",
    onlineDay: "Wednesday",
    subjects: ["Operating Systems (23CS302)", "Cloud Computing (23CS604)"],
    timetable: {
      Monday: [
        { period: 2, start: "10:00", end: "11:00", subject: "Operating Systems", section: "CSE-2", room: "CS-102", online: false },
        { period: 4, start: "14:00", end: "16:00", subject: "Cloud Computing Lab", section: "CSDS-2", room: "Lab-B1", online: false },
      ],
      Tuesday: [
        { period: 3, start: "11:00", end: "12:00", subject: "Operating Systems", section: "CSE-2", room: "CS-102", online: false },
        { period: 5, start: "15:00", end: "16:00", subject: "Cloud Computing", section: "CSDS-2", room: "CS-204", online: false },
      ],
      Wednesday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Operating Systems", section: "CSE-2", room: "MS Teams", online: true },
        { period: 2, start: "10:00", end: "11:00", subject: "Cloud Computing", section: "CSDS-2", room: "MS Teams", online: true },
      ],
      Thursday: [
        { period: 2, start: "10:00", end: "11:00", subject: "Cloud Computing", section: "CSDS-2", room: "CS-204", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Operating Systems", section: "CSE-2", room: "CS-102", online: false },
      ],
      Friday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Operating Systems", section: "CSE-2", room: "CS-102", online: false },
        { period: 3, start: "11:00", end: "13:00", subject: "Systems Programming Lab", section: "CSE-2", room: "Lab-B1", online: false },
      ],
    },
  },
  {
    id: "sunitha",
    name: "Dr. P. Sunitha",
    title: "Dr. P. Sunitha",
    designation: "Associate Professor",
    department: "Information Technology & AI",
    cabin: "Room 105, IT Block (1st Floor)",
    email: "sunitha.it@qiscet.edu.in",
    phone: "+91 90000 44445",
    officeHours: "03:00 PM – 05:00 PM (Mon–Thu)",
    onlineDay: "Friday",
    subjects: ["Database Management Systems (23CS401)", "Python Programming (23AI302)"],
    timetable: {
      Monday: [
        { period: 3, start: "11:00", end: "12:00", subject: "Database Management Systems", section: "CSE-3", room: "CS-201", online: false },
        { period: 4, start: "14:00", end: "16:00", subject: "DBMS Lab", section: "CSE-3", room: "Lab-A1", online: false },
      ],
      Tuesday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Database Management Systems", section: "CSE-3", room: "CS-201", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Python Programming", section: "AIML-1", room: "CS-304", online: false },
      ],
      Wednesday: [
        { period: 2, start: "10:00", end: "11:00", subject: "Python Programming", section: "AIML-1", room: "CS-304", online: false },
        { period: 4, start: "14:00", end: "15:00", subject: "Database Management Systems", section: "CSE-3", room: "CS-201", online: false },
      ],
      Thursday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Python Programming", section: "AIML-1", room: "CS-304", online: false },
        { period: 3, start: "11:00", end: "12:00", subject: "Database Management Systems", section: "CSE-3", room: "CS-201", online: false },
      ],
      Friday: [
        { period: 2, start: "10:00", end: "11:00", subject: "Database Management Systems", section: "CSE-3", room: "MS Teams", online: true },
        { period: 3, start: "11:00", end: "12:00", subject: "Python Programming", section: "AIML-1", room: "MS Teams", online: true },
      ],
    },
  },
  {
    id: "ramesh_babu",
    name: "Dr. V. Ramesh Babu",
    title: "Dr. V. Ramesh Babu",
    designation: "Professor",
    department: "Electronics & Communication Engineering",
    cabin: "Room 310, ECE Block (3rd Floor)",
    email: "ramesh.ece@qiscet.edu.in",
    phone: "+91 90000 55556",
    officeHours: "10:00 AM – 12:00 PM (Mon–Wed)",
    onlineDay: "Thursday",
    subjects: ["Microprocessors & Interfacing (23EC403)", "IoT & Embedded Systems (23EC601)"],
    timetable: {
      Monday: [
        { period: 1, start: "09:00", end: "10:00", subject: "Microprocessors", section: "ECE-1", room: "EC-101", online: false },
        { period: 3, start: "11:00", end: "13:00", subject: "Embedded IoT Lab", section: "ECE-2", room: "Lab-EC3", online: false },
      ],
      Tuesday: [
        { period: 2, start: "10:00", end: "11:00", subject: "IoT & Embedded Systems", section: "ECE-2", room: "EC-104", online: false },
      ],
      Wednesday: [
        { period: 3, start: "11:00", end: "12:00", subject: "Microprocessors", section: "ECE-1", room: "EC-101", online: false },
      ],
      Thursday: [
        { period: 1, start: "09:00", end: "11:00", subject: "IoT & Embedded Systems", section: "ECE-2", room: "MS Teams", online: true },
      ],
      Friday: [
        { period: 2, start: "10:00", end: "11:00", subject: "Microprocessors", section: "ECE-1", room: "EC-101", online: false },
        { period: 4, start: "14:00", end: "16:00", subject: "Microcontroller Lab", section: "ECE-1", room: "Lab-EC1", online: false },
      ],
    },
  },
  {
    id: "bindu",
    name: "Bindu",
    title: "Bindu",
    designation: "Associate Professor",
    department: "Computer Science & Machine Learning (CSM)",
    cabin: "CSM Block Room 101",
    email: "bindu.csm@qiscet.edu.in",
    phone: "+91 90000 11101",
    officeHours: "10:00 AM – 12:00 PM (Mon–Fri)",
    onlineDay: "Wednesday",
    subjects: ["Machine Learning (23CSM501)", "Deep Learning (23CSM502)"],
    timetable: {},
  },
  {
    id: "koteswar_rao",
    name: "Koteswar Rao",
    title: "Koteswar Rao",
    designation: "Assistant Professor",
    department: "Computer Science & Machine Learning (CSM)",
    cabin: "CSM Block Room 102",
    email: "koteswarrao.csm@qiscet.edu.in",
    phone: "+91 90000 11102",
    officeHours: "11:00 AM – 01:00 PM (Mon–Fri)",
    onlineDay: "Thursday",
    subjects: ["Computer Networks & Protocols (23CSM503)"],
    timetable: {},
  },
  {
    id: "nikhil",
    name: "Nikhil",
    title: "Nikhil",
    designation: "Assistant Professor",
    department: "Computer Science & Machine Learning (CSM)",
    cabin: "CSM Block Room 103",
    email: "nikhil.csm@qiscet.edu.in",
    phone: "+91 90000 11103",
    officeHours: "02:00 PM – 04:00 PM (Mon–Fri)",
    onlineDay: "Tuesday",
    subjects: ["Data Structures & Algorithms (23CSM301)"],
    timetable: {},
  },
  {
    id: "bhaskar_rao",
    name: "Bhaskar Rao",
    title: "Bhaskar Rao",
    designation: "Associate Professor",
    department: "Computer Science & Machine Learning (CSM)",
    cabin: "CSM Block Room 104",
    email: "bhaskarrao.csm@qiscet.edu.in",
    phone: "+91 90000 11104",
    officeHours: "09:00 AM – 11:00 AM (Mon–Fri)",
    onlineDay: "Friday",
    subjects: ["AI & Expert Systems (23CSM601)"],
    timetable: {},
  },
  {
    id: "durga",
    name: "Durga",
    title: "Durga",
    designation: "Associate Professor",
    department: "Artificial Intelligence & Data Science (AIDS)",
    cabin: "AIDS Block Room 201",
    email: "durga.aids@qiscet.edu.in",
    phone: "+91 90000 22201",
    officeHours: "10:00 AM – 12:00 PM (Mon–Fri)",
    onlineDay: "Monday",
    subjects: ["Artificial Intelligence & Data Mining (23AID501)"],
    timetable: {},
  },
  {
    id: "srinilai",
    name: "Srinilai",
    title: "Srinilai",
    designation: "Assistant Professor",
    department: "Artificial Intelligence & Data Science (AIDS)",
    cabin: "AIDS Block Room 202",
    email: "srinilai.aids@qiscet.edu.in",
    phone: "+91 90000 22202",
    officeHours: "11:00 AM – 01:00 PM (Mon–Fri)",
    onlineDay: "Tuesday",
    subjects: ["Data Visualization & Analytics (23AID502)"],
    timetable: {},
  },
  {
    id: "rabbani_basha",
    name: "Rabbani Basha",
    title: "Rabbani Basha",
    designation: "Assistant Professor",
    department: "Artificial Intelligence & Data Science (AIDS)",
    cabin: "AIDS Block Room 203",
    email: "rabbanibasha.aids@qiscet.edu.in",
    phone: "+91 90000 22203",
    officeHours: "02:00 PM – 04:00 PM (Mon–Fri)",
    onlineDay: "Wednesday",
    subjects: ["Big Data Analytics & NLP (23AID601)"],
    timetable: {},
  },
];

export function getClientLiveFacultyStatus(faculty, targetDay = null, targetTime = null) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const now = new Date();
  const dayName = targetDay || days[now.getDay()];

  let timeStr = targetTime;
  if (!timeStr) {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    timeStr = `${hh}:${mm}`;
  }

  const daySchedule = faculty.timetable[dayName] || [];

  if (dayName === "Saturday" || dayName === "Sunday") {
    return {
      status: "Weekend",
      location: "Off-Campus / Resumes Monday",
      isInClass: false,
      currentClass: null,
      nextClass: "Next scheduled class on Monday at 09:00 AM",
      cabin: faculty.cabin,
      day: dayName,
      time: timeStr,
      description: `Academic classes are not in session on ${dayName}. Faculty resumes on Monday at 09:00 AM.`,
    };
  }

  let activeSlot = null;
  let nextSlot = null;

  for (const slot of daySchedule) {
    if (slot.start <= timeStr && timeStr < slot.end) {
      activeSlot = slot;
    } else if (timeStr < slot.start && !nextSlot) {
      nextSlot = slot;
    }
  }

  if (activeSlot) {
    return {
      status: "In Class",
      location: activeSlot.room,
      isInClass: true,
      currentClass: activeSlot,
      nextClass: nextSlot,
      cabin: faculty.cabin,
      day: dayName,
      time: timeStr,
      description: `Currently conducting ${activeSlot.subject} for Section ${activeSlot.section} in ${activeSlot.room} (${activeSlot.start}–${activeSlot.end}).`,
    };
  }

  let status = "Free Period / Cabin";
  let loc = faculty.cabin;
  let desc = `Currently between lectures. Available in office cabin: ${faculty.cabin}.`;

  if (timeStr < "09:00") {
    status = "Before Class Hours";
    loc = `Cabin ${faculty.cabin} (from 08:30 AM)`;
    desc = `Classes commence at 09:00 AM. Available in ${faculty.cabin}.`;
  } else if (timeStr >= "12:00" && timeStr < "14:00") {
    status = "Lunch / Consultation";
    loc = faculty.cabin;
    desc = `Lunch break / student consultation period in ${faculty.cabin}.`;
  } else if (timeStr >= "16:00") {
    status = "Classes Concluded";
    loc = `Office hours concluded (${faculty.cabin})`;
    desc = `Scheduled classes have concluded for today. Available via email or during office hours tomorrow.`;
  }

  return {
    status,
    location: loc,
    isInClass: false,
    currentClass: null,
    nextClass: nextSlot,
    cabin: faculty.cabin,
    day: dayName,
    time: timeStr,
    description: desc,
  };
}
