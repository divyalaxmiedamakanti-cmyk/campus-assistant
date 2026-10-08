import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  CalendarDays,
  BookOpen,
  ClipboardList,
  Megaphone,
  Sun,
  Moon,
  LogOut,
  ScrollText,
  Percent,
  Contact,
  Library,
  FileText,
  Briefcase,
  Sparkles,
  Inbox,
  Bus,
  Search,
  Home,
  Utensils,
  Building2,
  UserCheck,
  ClipboardCheck,
  BookMarked,
  Users,
  MapPin,
  X,
  CreditCard,
  HeartHandshake,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { initials } from "../utils/format.js";

export const NAV_ITEMS = [
  { key: "cfro", label: "CFRO — Fee Office", icon: CreditCard },
  { key: "cfss", label: "CFSS — Student Support", icon: HeartHandshake },
  { key: "fees", label: "Fee Structure", icon: Wallet },
  { key: "attendance", label: "Attendance & CGPA", icon: Percent },
  { key: "digital_id", label: "Digital ID & Ticket", icon: Contact },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "faculty_schedule", label: "Faculty Timetable", icon: CalendarDays },
  { key: "college_location", label: "College Location", icon: MapPin },
  { key: "exams", label: "Examinations", icon: ClipboardList },
  { key: "library", label: "Library Catalog", icon: Library },
  { key: "assignments", label: "Assignments", icon: FileText },
  { key: "placements", label: "Placements", icon: Briefcase },
  { key: "events", label: "Events & Fests", icon: Sparkles },
  { key: "grievances", label: "Grievance Box", icon: Inbox },
  { key: "bus", label: "Bus Routes", icon: Bus },
  { key: "lost_found", label: "Lost & Found", icon: Search },
  { key: "hostel", label: "Hostel", icon: Home },
  { key: "food", label: "Food & Mess", icon: Utensils },
  { key: "administration", label: "Administration", icon: Building2 },
  { key: "notices", label: "Notices", icon: Megaphone },
];

export const FACULTY_NAV_ITEMS = [
  { key: "faculty_timetable", label: "My Timetable", icon: CalendarDays },
  { key: "faculty_attendance", label: "Mark Attendance", icon: UserCheck },
  { key: "faculty_courses", label: "My Courses", icon: BookMarked },
  { key: "faculty_assignments", label: "Students Assignments", icon: ClipboardCheck },
  { key: "faculty_students", label: "My Students", icon: Users },
  { key: "faculty_grievances", label: "Student Grievances", icon: Inbox },
  { key: "college_location", label: "College Location", icon: MapPin },
  { key: "notices", label: "Notices", icon: Megaphone },
  { key: "events", label: "Events & Fests", icon: Sparkles },
  { key: "placements", label: "Placements", icon: Briefcase },
  { key: "bus", label: "Bus Routes", icon: Bus },
  { key: "administration", label: "Administration", icon: Building2 },
];

export default function Sidebar({ active, onSelect, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  function handleSelect(key) {
    onSelect(key);
    if (onCloseMobile) onCloseMobile();
  }

  const navContent = (
    <div className="h-full bg-[var(--ink)] text-[var(--paper)] flex flex-col w-64 border-r border-white/10 shadow-2xl">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/qis-logo.png"
            alt="QIS College Logo"
            className="w-10 h-10 rounded-full object-contain bg-white/10 p-0.5 border-2 border-brass shrink-0 shadow-md glow-brass"
          />
          <div>
            <div className="font-display text-base font-bold leading-tight text-[var(--paper)]">QISCET</div>
            <div className="font-mono text-[9px] text-[var(--paper)]/60 tracking-wider">CAMPUS PORTAL</div>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[var(--paper)]/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin">
        {(user?.role === "faculty" ? FACULTY_NAV_ITEMS : NAV_ITEMS).map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <motion.button
              key={key}
              onClick={() => handleSelect(key)}
              whileHover={{ x: 4, transition: { duration: 0.18 } }}
              whileTap={{ scale: 0.97 }}
              className="relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActive"
                  className="absolute inset-0 bg-brass/20 border border-brass/50 rounded-xl shadow-sm glow-brass"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={17}
                className={`relative z-10 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-brass" : "text-[var(--paper)]/60 group-hover:text-[var(--paper)]"
                }`}
              />

              <span
                className={`relative z-10 font-medium transition-colors duration-200 ${
                  isActive ? "text-[var(--paper)] font-semibold" : "text-[var(--paper)]/70 group-hover:text-[var(--paper)]"
                }`}
              >
                {label}
              </span>
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 pb-3">
        <motion.button
          onClick={toggle}
          whileHover={{ x: 3, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-[var(--paper)]/70 transition-all duration-200"
        >
          {dark ? <Sun size={16} className="text-brass" /> : <Moon size={16} />}
          {dark ? "Light mode" : "Dark mode"}
        </motion.button>
      </div>

      <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-brass/20 border border-brass/40 flex items-center justify-center font-mono text-xs text-brass shrink-0">
          {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm truncate">{user?.name}</div>
          <div className="text-[11px] text-[var(--paper)]/50 capitalize truncate">{user?.role} · {user?.department || "—"}</div>
        </div>
        <button onClick={logout} title="Sign out" className="text-[var(--paper)]/50 hover:text-danger transition-colors">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Slide-Over */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 md:hidden flex"
            >
              {navContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
