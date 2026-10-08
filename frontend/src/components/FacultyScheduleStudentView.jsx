import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  Phone,
  Mail,
  Search,
  BookOpen,
  UserCheck,
  Sparkles,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ChevronRight,
  Laptop,
} from "lucide-react";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";
import { FACULTY_DIRECTORY, getClientLiveFacultyStatus } from "../data/facultyDirectory.js";
import SmartSearch from "./SmartSearch.jsx";

export default function FacultyScheduleStudentView() {
  const [selectedFacultyId, setSelectedFacultyId] = useState("mehta");
  const [selectedDay, setSelectedDay] = useState("Thursday");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date());

  // Time-finder interactive query
  const [customDay, setCustomDay] = useState("Thursday");
  const [customTime, setCustomTime] = useState("11:00");
  const [simulatedStatus, setSimulatedStatus] = useState(null);

  // Update clock every 10 seconds
  useEffect(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    setSelectedDay(days[now.getDay()] === "Sunday" || days[now.getDay()] === "Saturday" ? "Monday" : days[now.getDay()]);
    setCustomDay(days[now.getDay()] === "Sunday" || days[now.getDay()] === "Saturday" ? "Monday" : days[now.getDay()]);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const selectedFaculty = FACULTY_DIRECTORY.find((f) => f.id === selectedFacultyId) || FACULTY_DIRECTORY[0];
  const liveStatus = getClientLiveFacultyStatus(selectedFaculty);

  // Filter faculty list by search
  const filteredFaculty = FACULTY_DIRECTORY.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.department.toLowerCase().includes(q) ||
      f.subjects.some((s) => s.toLowerCase().includes(q)) ||
      f.cabin.toLowerCase().includes(q)
    );
  });

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const daySchedule = selectedFaculty.timetable[selectedDay] || [];

  function handleCheckCustomTime(e) {
    e.preventDefault();
    const res = getClientLiveFacultyStatus(selectedFaculty, customDay, customTime);
    setSimulatedStatus(res);
  }

  const subjectColors = {
    "Machine Learning": "bg-brass/15 text-brass border-brass/40",
    "Neural Networks": "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/40",
    "Deep Learning Lab": "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
    "Operating Systems": "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40",
    "Cloud Computing": "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    "Cloud Computing Lab": "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/40",
    "Database Management Systems": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
    "DBMS Lab": "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40",
    "Python Programming": "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40",
    "Microprocessors": "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40",
    "IoT & Embedded Systems": "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40",
  };

  function handleSearchSelect(item) {
    if (!item) return;
    const title = item.title || "";
    setSearchQuery(title);

    // If item explicitly has faculty_id or matches a faculty name
    const matchedFac = FACULTY_DIRECTORY.find(
      (f) =>
        (item.faculty_id && f.id === item.faculty_id) ||
        f.name.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(f.name.toLowerCase())
    );
    if (matchedFac) {
      setSelectedFacultyId(matchedFac.id);
      return;
    }

    // If item matched a subject, find faculty teaching it
    const facBySubject = FACULTY_DIRECTORY.find((f) =>
      f.subjects.some(
        (s) => s.toLowerCase().includes(title.toLowerCase()) || title.toLowerCase().includes(s.toLowerCase())
      )
    );
    if (facBySubject) {
      setSelectedFacultyId(facBySubject.id);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <Card className="p-6 bg-gradient-to-r from-[var(--paper-raised)] via-paper to-[var(--paper-raised)] border border-brass/30 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brass/15 text-brass border border-brass/40 font-semibold flex items-center gap-1.5">
                <CalendarDays size={13} />
                Student Academic Guide
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Teacher Tracker Active
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-ink font-bold leading-tight">
              Faculty Timetable &amp; Real-Time Location
            </h1>
            <p className="text-xs md:text-sm text-ink-soft mt-1 max-w-2xl leading-relaxed">
              Check which classroom or laboratory any faculty member is currently teaching in, view their office cabins, and inspect full weekly period schedules.
            </p>
          </div>

          {/* Current Live Time Badge */}
          <div className="px-4 py-3 rounded-2xl bg-ink text-paper border border-brass/40 shadow-md text-right shrink-0">
            <span className="font-mono text-[10px] text-brass uppercase tracking-widest block font-semibold">
              Live College Clock
            </span>
            <span className="font-mono text-lg font-bold text-paper block">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span className="text-[10px] font-mono text-paper/70">
              {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
            </span>
          </div>
        </div>
      </Card>

      {/* Faculty Selection Carousel / Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-mono text-xs uppercase tracking-wider text-ink-soft font-semibold flex items-center gap-1.5">
            <UserCheck size={14} className="text-brass" />
            <span>Select Professor / Teacher</span>
          </h2>

          <div className="w-full sm:w-96">
            <SmartSearch
              placeholder="Search faculty, ML, Python, rooms…"
              compact={true}
              initialValue={searchQuery}
              onSelect={handleSearchSelect}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredFaculty.map((faculty) => {
            const isSelected = faculty.id === selectedFacultyId;
            const status = getClientLiveFacultyStatus(faculty);

            return (
              <motion.div
                key={faculty.id}
                onClick={() => setSelectedFacultyId(faculty.id)}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer card-interactive relative ${
                  isSelected
                    ? "bg-paper-raised border-brass shadow-md glow-brass ring-1 ring-brass"
                    : "bg-paper border-rule hover:border-brass/50 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-brass/15 border border-brass/40 flex items-center justify-center font-display font-bold text-brass text-sm shrink-0">
                    {faculty.name.split(" ").pop()?.slice(0, 2).toUpperCase()}
                  </div>

                  {status.isInClass ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      In Class: {status.location}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In Cabin
                    </span>
                  )}
                </div>

                <h3 className="font-display text-sm font-bold text-ink leading-tight">{faculty.name}</h3>
                <p className="text-[11px] text-ink-soft mt-0.5">{faculty.designation}</p>
                <p className="text-[10px] font-mono text-brass mt-0.5 truncate">{faculty.department}</p>

                <div className="mt-2.5 pt-2.5 border-t border-rule/60 flex items-center justify-between text-[10px] text-ink-soft">
                  <span className="truncate" title={faculty.cabin}>📍 {faculty.cabin.split("(")[0]}</span>
                  <ChevronRight size={12} className={isSelected ? "text-brass" : "text-ink-soft"} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE FACULTY SPOTLIGHT & REAL-TIME LOCATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: FULL WEEKLY TIMETABLE GRID (7 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 border border-rule/80 card-interactive shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rule/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-ink">{selectedFaculty.name}&apos;s Timetable</h3>
                  <Badge variant="outline" className="text-[10px]">{selectedFaculty.department}</Badge>
                </div>
                <p className="text-[11px] text-ink-soft mt-0.5">
                  Designated Online Teaching Day: <b className="text-sky-600 dark:text-sky-400">{selectedFaculty.onlineDay} (via MS Teams)</b>
                </p>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {weekDays.map((day) => {
                  const isDaySelected = selectedDay === day;
                  const isOnline = selectedFaculty.onlineDay === day;
                  return (
                    <motion.button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 border ${
                        isDaySelected
                          ? isOnline
                            ? "bg-sky-600 text-white border-sky-500 shadow-md"
                            : "bg-ink text-brass border-brass shadow-md glow-brass"
                          : isOnline
                          ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/20"
                          : "bg-paper text-ink-soft border-rule hover:border-brass/50"
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                      {isOnline && <span className="ml-1 text-[9px]">📶</span>}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Timetable Periods for the selected day */}
            <div className="space-y-2.5">
              {daySchedule.length > 0 ? (
                daySchedule.map((slot, index) => {
                  const subCls = subjectColors[slot.subject] || "bg-brass/10 text-brass border-brass/30";
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3.5 rounded-xl border border-rule bg-canvas/40 hover:bg-canvas/80 transition-all row-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="px-2.5 py-1.5 rounded-lg bg-paper border border-rule font-mono text-center shrink-0">
                          <span className="block text-[9px] uppercase tracking-wider text-ink-soft font-bold">
                            Period {slot.period}
                          </span>
                          <span className="font-bold text-xs text-ink">{slot.start} – {slot.end}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-ink">{slot.subject}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${subCls} font-bold`}>
                              Section {slot.section}
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-soft block mt-0.5">
                            Target: {slot.section} Students · Academic Scheme R23
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:self-center shrink-0">
                        {slot.online ? (
                          <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-300 text-xs font-mono font-bold flex items-center gap-1.5">
                            <Laptop size={13} />
                            <span>MS Teams Online</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                            <MapPin size={13} />
                            <span>{slot.room}</span>
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-ink-soft bg-canvas/30 rounded-xl border border-rule">
                  No scheduled classes for {selectedDay}. Faculty is available for mentoring and office hours.
                </div>
              )}
            </div>

            {/* Subjects Teaching Summary */}
            <div className="pt-3 border-t border-rule/60 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-ink-soft font-semibold">Subjects Handled:</span>
              {selectedFaculty.subjects.map((sub, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-paper border border-rule text-ink font-medium">
                  {sub}
                </span>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT SIDE: LIVE WHERE IS TEACHER NOW + TIME FINDER (5 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* 1. REAL-TIME LOCATION RADAR */}
          <Card className="p-5 border border-brass/40 card-interactive shadow-md bg-gradient-to-b from-paper to-[var(--paper-raised)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brass/15 border border-brass/40 flex items-center justify-center text-brass">
                  <MapPin size={16} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-ink">Live Teacher Location</h3>
                  <div className="text-[10px] font-mono text-ink-soft">Real-time Class Locator</div>
                </div>
              </div>

              {liveStatus.isInClass ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold animate-pulse">
                  LIVE IN CLASS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[9px] font-bold">
                  CABIN AVAILABLE
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-canvas/80 border border-brass/30 space-y-3">
              <div>
                <span className="text-[10px] font-mono text-ink-soft uppercase tracking-wider block">Where is {selectedFaculty.name} right now?</span>
                <div className="text-base font-bold text-brass mt-0.5 flex items-center gap-1.5">
                  <span>📍 {liveStatus.location}</span>
                </div>
              </div>

              <p className="text-xs text-ink leading-relaxed border-t border-rule/60 pt-2">
                {liveStatus.description}
              </p>

              {liveStatus.nextClass && (
                <div className="p-2.5 rounded-lg bg-paper border border-rule/80 text-[11px] text-ink-soft">
                  <span className="font-semibold text-ink block">Next Class Today:</span>
                  <span>{liveStatus.nextClass.start} – {liveStatus.nextClass.subject} ({liveStatus.nextClass.room})</span>
                </div>
              )}
            </div>

            {/* Permanent Cabin and Contact */}
            <div className="mt-4 pt-3 border-t border-rule/60 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Building2 size={14} className="text-brass shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-ink block">Permanent Office Cabin:</span>
                  <span className="text-ink-soft text-[11px]">{selectedFaculty.cabin}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={14} className="text-brass shrink-0" />
                <span className="text-ink-soft text-[11px]">Visiting Hours: {selectedFaculty.officeHours}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={14} className="text-brass shrink-0" />
                <a href={`tel:${selectedFaculty.phone}`} className="text-ink hover:text-brass text-[11px]">
                  {selectedFaculty.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={14} className="text-brass shrink-0" />
                <a href={`mailto:${selectedFaculty.email}`} className="text-ink hover:text-brass text-[11px] truncate">
                  {selectedFaculty.email}
                </a>
              </div>
            </div>
          </Card>

          {/* 2. TIME-FINDER: CHECK ANY DAY & HOUR */}
          <Card className="p-5 border border-rule/80 card-interactive shadow-sm space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-ink-soft font-semibold flex items-center gap-1.5">
              <Search size={13} className="text-brass" />
              <span>Check Future Slot Location</span>
            </h4>
            <p className="text-[11px] text-ink-soft leading-relaxed">
              Wondering where this teacher will be at a specific period or time? Select day and time below:
            </p>

            <form onSubmit={handleCheckCustomTime} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-ink-soft block mb-1">Day of Week</label>
                  <select
                    value={customDay}
                    onChange={(e) => setCustomDay(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-paper border border-rule text-ink outline-none"
                  >
                    {weekDays.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-ink-soft block mb-1">Time (24h)</label>
                  <select
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-paper border border-rule text-ink outline-none"
                  >
                    <option value="09:15">09:15 AM (Period 1)</option>
                    <option value="10:30">10:30 AM (Period 2)</option>
                    <option value="11:30">11:30 AM (Period 3)</option>
                    <option value="13:00">01:00 PM (Lunch)</option>
                    <option value="14:30">02:30 PM (Period 4)</option>
                    <option value="15:30">03:30 PM (Period 5)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-ink text-brass border border-brass text-xs font-semibold hover:bg-brass hover:text-ink transition-colors cursor-pointer"
              >
                Find Teacher Location
              </button>
            </form>

            {simulatedStatus && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-canvas border border-brass/30 text-xs space-y-1.5"
              >
                <div className="font-semibold text-brass flex items-center gap-1">
                  <MapPin size={13} />
                  <span>{customDay} at {customTime}: {simulatedStatus.location}</span>
                </div>
                <p className="text-[11px] text-ink-soft leading-relaxed">{simulatedStatus.description}</p>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
