import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Wallet,
  BookOpen,
  ClipboardList,
  Megaphone,
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
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ThumbsUp,
  ThumbsDown,
  QrCode,
  ScrollText,
  Camera,
  UserCheck,
  ClipboardCheck,
  BookMarked,
  Users,
  GraduationCap,
  BarChart3,
  Star,
  Clock,
  XCircle,
  Bell,
  Check,
  X,
  Filter,
  MapPin,
  Menu,
  CreditCard,
  HeartHandshake,
} from "lucide-react";
import Sidebar, { NAV_ITEMS, FACULTY_NAV_ITEMS } from "../components/Sidebar.jsx";
import { Html5QrcodeScanner } from "html5-qrcode";
import Card from "../components/ui/Card.jsx";
import ChatWidget from "../components/ChatWidget.jsx";
import CollegeLocationView from "../components/CollegeLocationView.jsx";
import FacultyScheduleStudentView from "../components/FacultyScheduleStudentView.jsx";
import CfroSection from "../components/cfro/CfroSection.jsx";
import CfssSection from "../components/cfss/CfssSection.jsx";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { FACULTY_SECTIONS, FACULTY_STUDENTS_LIST, COURSE_SYLLABUS } from "../data/facultyStudents.js";

const SECTION_ICON = {
  cfro: CreditCard,
  cfss: HeartHandshake,
  fees: Wallet,
  calendar: CalendarDays,
  courses: BookOpen,
  exams: ClipboardList,
  notices: Megaphone,
  attendance: Percent,
  digital_id: Contact,
  faculty_schedule: CalendarDays,
  college_location: MapPin,
  library: Library,
  assignments: FileText,
  placements: Briefcase,
  events: Sparkles,
  grievances: Inbox,
  bus: Bus,
  lost_found: Search,
  hostel: Home,
  food: Utensils,
  administration: Building2,
  // Faculty sections
  faculty_timetable: CalendarDays,
  faculty_attendance: UserCheck,
  faculty_courses: BookMarked,
  faculty_assignments: ClipboardCheck,
  faculty_students: Users,
  faculty_grievances: Inbox,
};

export default function Dashboard({ initialTab }) {
  const { user } = useAuth();
  const isFaculty = user?.role === "faculty";
  const [active, setActive] = useState(initialTab || (isFaculty ? "faculty_timetable" : "cfro"));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function reloadSection(section) {
    if (section === "cfro" || section === "cfss" || section === "college_location" || section === "faculty_schedule") return;
    client
      .get(`/portal/${section}`)
      .then(({ data }) => setRows(data))
      .catch(() => setRows([]));
  }

  useEffect(() => {
    if (active === "cfro" || active === "cfss" || active === "college_location" || active === "faculty_schedule") {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    client
      .get(`/portal/${active}`)
      .then(({ data }) => !cancelled && setRows(data))
      .catch(() => !cancelled && setRows([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [active]);

  const allNavItems = isFaculty ? FACULTY_NAV_ITEMS : NAV_ITEMS;
  const activeLabel = allNavItems.find((n) => n.key === active)?.label;
  const Icon = SECTION_ICON[active];

  return (
    <div className="min-h-screen bg-canvas text-ink font-body flex flex-col md:flex-row">
      {/* Mobile Top App Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--ink)] text-[var(--paper)] border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <img src="/qis-logo.png" alt="QIS Logo" className="w-8 h-8 rounded-full border border-brass object-contain" />
          <div>
            <div className="font-display text-sm font-bold leading-tight">QISCET</div>
            <div className="font-mono text-[9px] text-brass tracking-wider">{activeLabel}</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-white/10 text-[var(--paper)] hover:text-brass transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </header>

      <Sidebar
        active={active}
        onSelect={setActive}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 max-w-5xl w-full">
        {/* e-CAP Classic Top Banner */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="mb-6 bg-[var(--ink)] text-[var(--paper)] rounded-2xl border-2 border-brass px-6 py-5 shadow-xl relative overflow-hidden card-interactive group"
        >
          <div className="absolute inset-0 ledger-rule opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brass/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-brass/15 transition-all duration-500" />
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-full border-2 border-brass bg-white/10 p-0.5 flex items-center justify-center shrink-0 glow-brass group-hover:scale-105 transition-transform duration-300 shadow-md">
                <img
                  src="/qis-logo.png"
                  alt="QIS College Logo"
                  className="w-12 h-12 object-contain rounded-full"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="font-display text-xl sm:text-2xl leading-none font-semibold tracking-wide">
                  QIS COLLEGE OF ENGINEERING & TECHNOLOGY
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 justify-center sm:justify-start">
                  <span className="font-mono text-[10px] text-brass uppercase tracking-widest font-bold bg-brass/15 px-2 py-0.5 rounded border border-brass/30">
                    Autonomous · NAAC &apos;A+&apos; Grade · NBA Accredited
                  </span>
                  <span className="font-mono text-[10px] text-[var(--paper)]/50 uppercase tracking-wider hidden md:inline">
                    e-CAP Live System
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <span className="font-mono text-xs text-[var(--paper)]/70 block">
                Academic Year: <span className="text-brass font-bold">2026-2027</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 mt-1.5 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Status: Fully Automated
              </span>
            </div>
          </div>
        </motion.div>

        {/* e-CAP Metadata Profile Box – Student */}
        {user?.role === "student" && (
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="mb-8 bg-paper-raised border border-rule/80 rounded-2xl px-6 py-4.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-sm hover:shadow-lg hover:border-brass/50 transition-all duration-300 relative card-interactive overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brass via-brass-soft to-brass rounded-l-2xl" />
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Student Name</span>
              <span className="font-semibold text-ink text-sm block truncate">{user?.name || "Divya"}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Roll No / ID</span>
              <span className="font-semibold text-ink text-sm font-mono block">
                {user?.roll_no || (user?.email?.includes("@") && user.email.split("@")[0].toUpperCase()) || "24491A4225"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Department / Branch</span>
              <span className="font-semibold text-ink text-sm block truncate">{user?.department || "Computer Science & Engineering"}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Regulation & Semester</span>
              <span className="font-semibold text-ink text-sm block">R23 · III-B.Tech I-Sem</span>
            </div>
          </motion.div>
        )}

        {/* e-CAP Faculty Profile Box */}
        {user?.role === "faculty" && (
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="mb-8 bg-paper-raised border border-rule/80 rounded-2xl px-6 py-4.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-sm hover:shadow-lg hover:border-brass/50 transition-all duration-300 relative card-interactive overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brass via-brass-soft to-brass rounded-l-2xl" />
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Faculty Name</span>
              <span className="font-semibold text-ink text-sm block truncate">{user?.name || "Prof. Mehta"}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Faculty ID</span>
              <span className="font-semibold text-ink text-sm font-mono block">
                FAC-{user?.department?.substring(0, 2).toUpperCase() || "CS"}-2024
              </span>
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Department</span>
              <span className="font-semibold text-ink text-sm block truncate">{user?.department || "Computer Science & Engineering"}</span>
            </div>
            <div className="space-y-1">
              <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70">Designation & Role</span>
              <span className="font-semibold text-ink text-sm block">HOD / Professor</span>
            </div>
          </motion.div>
        )}

        {/* Current Tab Heading */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between border-b border-rule pb-2">
          <h2 className="font-display text-2xl flex items-center gap-3 font-semibold">
            <Icon size={22} className="text-brass" />
            {activeLabel}
          </h2>
          <span className="font-mono text-[10px] text-ink-soft uppercase tracking-wider bg-canvas border border-rule/50 px-2 py-0.5 rounded">e-CAP Module v4.1</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <SkeletonRows />
            ) : active === "faculty_timetable" ? (
              <FacultyTimetableView user={user} />
            ) : active === "faculty_attendance" ? (
              <FacultyMarkAttendanceView user={user} />
            ) : active === "faculty_courses" ? (
              <FacultyCoursesView user={user} />
            ) : active === "faculty_assignments" ? (
              <FacultyAssignmentsView user={user} />
            ) : active === "faculty_students" ? (
              <FacultyStudentsView user={user} />
            ) : active === "faculty_grievances" ? (
              <FacultyGrievancesView rows={rows} />
            ) : active === "digital_id" ? (
              <DigitalIdView user={user} />
            ) : active === "college_location" ? (
              <CollegeLocationView />
            ) : active === "faculty_schedule" ? (
              <FacultyScheduleStudentView />
            ) : active === "cfro" ? (
              <CfroSection />
            ) : active === "cfss" ? (
              <CfssSection />
            ) : rows.length === 0 && active !== "hostel" && active !== "food" && active !== "fees" ? (
              <Card className="p-10 text-center text-ink-soft">Nothing to show here yet.</Card>
            ) : active === "fees" ? (
              <FeesLedgerView rows={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "courses" ? (
              <CoursesGrid rows={rows} />
            ) : active === "exams" ? (
              <ExamsTable rows={rows} />
            ) : active === "attendance" ? (
              <AttendanceView rows={rows} />
            ) : active === "library" ? (
              <LibraryView rows={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "assignments" ? (
              <AssignmentsView rows={rows} />
            ) : active === "placements" ? (
              <PlacementsView rows={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "events" ? (
              <EventsView rows={rows} />
            ) : active === "grievances" ? (
              <GrievanceView rows={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "bus" ? (
              <BusRoutesView rows={rows} />
            ) : active === "lost_found" ? (
              <LostFoundView rows={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "hostel" ? (
              <HostelView data={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "food" ? (
              <FoodMenuView data={rows} onUpdate={() => reloadSection(active)} />
            ) : active === "administration" ? (
              <AdminDirectoryView rows={rows} />
            ) : (
              <NoticeListView rows={rows} user={user} onUpdate={() => reloadSection(active)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <ChatWidget />
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-paper-raised border border-rule animate-pulse" />
      ))}
    </div>
  );
}

function FeesLedgerView({ rows, onUpdate }) {
  const [payFee, setPayFee] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("card"); // 'card' | 'upi'
  const [cardNum, setCardNum] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [upiId, setUpiId] = useState("");
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  function openPayModal(fee) {
    setPayFee(fee);
    setPayAmount(fee.amount_due - fee.amount_paid);
    setSuccess(false);
    setPaying(false);
  }

  async function handlePayment(e) {
    e.preventDefault();
    if (paying) return;
    setPaying(true);
    try {
      await client.post("/portal/fees/pay", { fee_id: payFee.id, amount: payAmount });
      setSuccess(true);
      setTimeout(() => {
        setPayFee(null);
        setCardNum("");
        setCardHolder("");
        setUpiId("");
        onUpdate();
      }, 2000);
    } catch {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule text-left font-mono text-xs uppercase tracking-wide text-ink-soft bg-canvas/40">
              <th className="px-5 py-3.5">Fee Particulars</th>
              <th className="px-5 py-3.5">Amount Due</th>
              <th className="px-5 py-3.5">Amount Paid</th>
              <th className="px-5 py-3.5">Balance Owed</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const balance = r.amount_due - r.amount_paid;
              return (
                <motion.tr
                  key={r.id}
                  whileHover={{ x: 3 }}
                  className="border-b border-rule last:border-0 hover:bg-brass/5 row-interactive cursor-pointer transition-all"
                >
                  <td className="px-5 py-4 font-medium">{r.fee_type}</td>
                  <td className="px-5 py-4 font-mono text-ink">₹{r.amount_due.toLocaleString()}</td>
                  <td className="px-5 py-4 font-mono text-success font-semibold">₹{r.amount_paid.toLocaleString()}</td>
                  <td className="px-5 py-4 font-mono text-brass font-bold">₹{balance.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] font-mono rounded-full px-2.5 py-0.5 uppercase font-bold shadow-xs ${
                      r.status === "Paid" ? "bg-success/15 text-success border border-success/30" : "bg-danger/15 text-danger border border-danger/30"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.94 }}
                      disabled={r.status === "Paid"}
                      onClick={() => openPayModal(r)}
                      className="px-3.5 py-1.5 rounded-lg bg-ink text-brass border border-brass text-xs hover:bg-brass hover:text-ink disabled:opacity-40 disabled:pointer-events-none transition-all font-mono uppercase tracking-wider btn-tactile shadow-xs font-bold"
                    >
                      Pay Bill
                    </motion.button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* e-CAP payment Modal */}
      <AnimatePresence>
        {payFee && (
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-paper-raised border-2 border-brass rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="bg-ink text-paper px-6 py-4 flex justify-between items-center border-b border-brass/35">
                <div>
                  <h3 className="font-display text-lg">e-CAP Payment Desk</h3>
                  <span className="font-mono text-[9px] text-brass uppercase tracking-widest">QIS Billing Gateway</span>
                </div>
                <button onClick={() => setPayFee(null)} className="text-paper/60 hover:text-danger font-mono text-xs uppercase">Close</button>
              </div>

              <div className="p-6 space-y-4">
                {success ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <CheckCircle2 size={48} className="text-success animate-bounce mb-3" />
                    <h4 className="font-display text-xl text-ink font-semibold">Payment Successful!</h4>
                    <p className="text-xs text-ink-soft mt-1">Updating fee ledger in database...</p>
                  </div>
                ) : (
                  <form onSubmit={handlePayment} className="space-y-4">
                    <div className="bg-canvas/50 p-3.5 rounded-lg border border-rule text-xs space-y-1">
                      <div><span className="font-mono text-ink-soft">Fee Type:</span> <span className="font-bold text-ink">{payFee.fee_type}</span></div>
                      <div><span className="font-mono text-ink-soft">Total Balance:</span> <span className="font-mono font-bold text-brass">₹{(payFee.amount_due - payFee.amount_paid).toLocaleString()}</span></div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1">Payment Amount (₹)</label>
                      <input
                        type="number"
                        required
                        max={payFee.amount_due - payFee.amount_paid}
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass font-mono"
                      />
                    </div>

                    <div className="flex gap-2 border-b border-rule pb-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMode("card")}
                        className={`flex-1 py-1.5 text-xs font-mono border rounded ${paymentMode === "card" ? "bg-ink text-brass border-brass" : "bg-transparent border-rule text-ink-soft"}`}
                      >
                        Credit/Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMode("upi")}
                        className={`flex-1 py-1.5 text-xs font-mono border rounded ${paymentMode === "upi" ? "bg-ink text-brass border-brass" : "bg-transparent border-rule text-ink-soft"}`}
                      >
                        UPI Payment
                      </button>
                    </div>

                    {paymentMode === "card" ? (
                      <div className="space-y-3">
                        <input
                          required
                          value={cardNum}
                          onChange={(e) => setCardNum(e.target.value.replace(/\D/g, '').substring(0, 16))}
                          placeholder="Card Number (16 digits)"
                          className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-xs outline-none focus:border-brass font-mono"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input required placeholder="MM/YY" className="bg-canvas border border-rule rounded-lg px-3 py-2 text-xs outline-none focus:border-brass font-mono" />
                          <input required type="password" placeholder="CVV" className="bg-canvas border border-rule rounded-lg px-3 py-2 text-xs outline-none focus:border-brass font-mono" />
                        </div>
                        <input
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="Cardholder Name"
                          className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-xs outline-none focus:border-brass"
                        />
                      </div>
                    ) : (
                      <div>
                        <input
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="Enter VPA / UPI ID (e.g. name@okaxis)"
                          className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-xs outline-none focus:border-brass font-mono"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={paying}
                      className="w-full mt-4 py-2.5 bg-ink text-brass border border-brass rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-brass hover:text-ink disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                    >
                      {paying ? <Loader2 size={14} className="animate-spin" /> : <Wallet size={12} />}
                      Authorize Payment
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CoursesGrid({ rows }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {rows.map((r, i) => (
        <Card
          key={r.id}
          delay={i * 0.05}
          className="p-6 border border-rule/80 hover:border-brass/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-brass px-2.5 py-0.5 rounded-full bg-brass/10 border border-brass/30 group-hover:bg-brass group-hover:text-ink transition-colors duration-200">
              {r.code}
            </span>
            <span className="font-mono text-[11px] text-ink-soft/80 uppercase tracking-wider bg-canvas/70 px-2 py-0.5 rounded">
              {r.level}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-brass transition-colors duration-200">
            {r.name}
          </h3>
          <div className="flex justify-between items-center text-xs text-ink-soft font-mono mt-4 pt-3.5 border-t border-rule/70">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brass" />
              Duration: {r.duration}
            </span>
            <span className="font-semibold text-ink bg-canvas px-2.5 py-1 rounded border border-rule/50">
              Intake: {r.intake} seats
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function ExamsTable({ rows }) {
  return (
    <Card className="overflow-hidden border border-rule/80 hover:border-brass/40 transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-rule bg-canvas/40 text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3.5">Course</th>
              <th className="px-5 py-3.5">Subject</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <motion.tr
                key={r.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-rule/70 last:border-0 hover:bg-brass/5 row-interactive transition-colors cursor-pointer"
              >
                <td className="px-5 py-4 font-medium">{r.course}</td>
                <td className="px-5 py-4 font-semibold text-ink">{r.subject}</td>
                <td className="px-5 py-4 font-mono text-brass font-bold">{r.exam_date}</td>
                <td className="px-5 py-4 font-mono text-ink-soft">{r.exam_time}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function NoticeListView({ rows, user, onUpdate }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const isStaff = user?.role === "admin" || user?.role === "faculty";

  async function handlePost(e) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || loading) return;
    setLoading(true);
    try {
      await client.post("/portal/notices/create", { title, content, category });
      setMsg("Notice broadcasted successfully!");
      setTitle("");
      setContent("");
      setCategory("General");
      onUpdate();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Notice broadcast failed");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {isStaff && (
        <Card className="p-6 border border-brass/60 bg-paper-raised relative">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brass rounded-l-2xl" />
          <h3 className="font-display text-lg mb-4 flex items-center gap-2">
            <Megaphone size={18} className="text-brass animate-pulse" /> Broadcast New Notice (e-CAP Notice Console)
          </h3>
          {msg && <div className="p-3 bg-brass/10 border border-brass/30 text-brass text-xs rounded-lg mb-4 font-mono">{msg}</div>}
          <form onSubmit={handlePost} className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1">Notice Title</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Mid-Term exams rescheduled"
                  className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brass transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brass transition-all"
                >
                  <option value="General">General</option>
                  <option value="Exams">Exams</option>
                  <option value="Fees">Fees</option>
                  <option value="Placements">Placements</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1">Message Content</label>
              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write notification details..."
                className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brass transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-ink text-brass border border-brass rounded-xl font-mono text-xs uppercase tracking-wide hover:bg-brass hover:text-ink disabled:opacity-40 transition-all btn-tactile flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Broadcast to e-CAP
            </button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {rows.map((r, i) => (
          <Card key={r.id} delay={i * 0.05} className="p-6 border-l-4 border-l-brass group">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
              <h3 className="font-display text-lg font-semibold group-hover:text-brass transition-colors">{r.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-brass uppercase font-bold bg-brass/10 px-2 py-0.5 rounded border border-brass/30">
                  {r.category || "General"}
                </span>
                <span className="font-mono text-[10px] text-ink-soft/60">{r.created_at?.slice(0, 10)}</span>
              </div>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed">{r.content}</p>
            <div className="mt-3 pt-3 border-t border-rule/50 flex justify-between items-center text-xs font-mono text-ink-soft/70">
              <span>Posted by: {r.posted_by || "Administration"}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AttendanceView({ rows }) {
  const totalAttended = rows.reduce((sum, r) => sum + r.attended_classes, 0);
  const totalClasses = rows.reduce((sum, r) => sum + r.total_classes, 0);
  const overallPercent = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : 0;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-6 flex flex-col items-center justify-center text-center glow-brass border-brass/40 stat-box-interactive">
          <span className="text-xs font-mono text-ink-soft uppercase tracking-wider mb-1">Overall CGPA</span>
          <span className="text-4xl font-display text-brass font-bold">9.35</span>
          <span className="font-mono text-[10px] text-ink-soft/60 mt-1.5 bg-brass/10 border border-brass/25 px-2.5 py-0.5 rounded-full">Grade: Outstanding (O)</span>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center text-center stat-box-interactive">
          <span className="text-xs font-mono text-ink-soft uppercase tracking-wider mb-1">Current SGPA</span>
          <span className="text-4xl font-display text-ink font-bold">9.42</span>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 mt-1.5 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-medium">Rank #2 in Section</span>
        </Card>
        <Card className={`p-6 flex flex-col items-center justify-center text-center stat-box-interactive ${overallPercent >= 75 ? "glow-success border-success/40" : "glow-danger border-danger/40"}`}>
          <span className="text-xs font-mono text-ink-soft uppercase tracking-wider mb-1">Overall Attendance</span>
          <span className={`text-4xl font-display font-bold ${overallPercent >= 75 ? "text-success" : "text-danger"}`}>{overallPercent}%</span>
          <span className={`font-mono text-[10px] mt-1.5 px-2.5 py-0.5 rounded-full font-bold ${overallPercent >= 75 ? "bg-success/15 text-success border border-success/30" : "bg-danger/15 text-danger border border-danger/30"}`}>
            {overallPercent >= 75 ? "✓ Eligible for Exams" : "⚠ Condonation Needed"}
          </span>
        </Card>
      </div>

      <Card className="p-7 border border-rule/80">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-semibold">Subject-Wise Attendance Breakdown</h3>
          <span className="font-mono text-[11px] text-ink-soft bg-canvas px-3 py-1 rounded-full border border-rule/60 font-semibold">
            Minimum Required: 75%
          </span>
        </div>
        <div className="space-y-6">
          {rows.map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.015, x: 3 }}
              className="space-y-2 p-3 rounded-xl hover:bg-canvas/60 transition-all cursor-default group"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-ink flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125 ${r.percentage >= 75 ? "bg-success" : "bg-danger"}`} />
                  {r.subject}
                </span>
                <span className="font-mono text-xs font-bold text-ink">
                  {r.attended_classes}/{r.total_classes} classes &nbsp;
                  <span className={r.percentage >= 75 ? "text-success font-extrabold" : "text-danger font-extrabold"}>
                    ({r.percentage}%)
                  </span>
                </span>
              </div>
              <div className="h-3 w-full bg-canvas rounded-full overflow-hidden border border-rule/70 p-[1px] shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.percentage}%` }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: "easeOut" }}
                  className={`h-full rounded-full transition-all group-hover:brightness-110 ${
                    r.percentage >= 75 ? "bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-sm" : "bg-gradient-to-r from-rose-400 to-rose-600 shadow-sm"
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DigitalIdView({ user }) {
  const [subTab, setSubTab] = useState("id"); // 'id' | 'scanner'
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Generate QR data
  const qrData = JSON.stringify({
    name: user?.name || "Asha Rao",
    roll: "RV2026CS409",
    dept: user?.department || "Computer Science",
    status: "Approved - Mid-Sem Exam Hall Ticket",
    seat: "CS-304B",
    valid: "July 2028"
  });
  
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

  useEffect(() => {
    if (subTab !== "scanner" || !scannerActive) return;

    let scanner;
    // Delay slightly to ensure DOM element #reader is mounted
    const timer = setTimeout(() => {
      try {
        scanner = new Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        }, /* verbose= */ false);

        scanner.render(
          (decodedText) => {
            try {
              const parsed = JSON.parse(decodedText);
              setScanResult(parsed);
            } catch {
              setScanResult({ raw: decodedText });
            }
            // Stop scanner on success
            setScannerActive(false);
            if (scanner) {
              scanner.clear().catch(err => console.error("Scanner clear failed", err));
            }
          },
          (error) => {
            // silent scan errors
          }
        );
      } catch (err) {
        console.error("Scanner init error", err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner clean failed", err));
      }
    };
  }, [subTab, scannerActive]);

  function simulateScan() {
    setScanResult({
      name: "Asha Rao",
      roll: "RV2026CS409",
      dept: "Computer Science",
      status: "Approved - Mid-Sem Exam Hall Ticket",
      seat: "CS-304B",
      valid: "July 2028"
    });
  }

  return (
    <div className="space-y-6">
      {/* Sub tabs selection */}
      <div className="flex gap-2 border-b border-rule pb-2">
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setSubTab("id"); setScannerActive(false); setScanResult(null); }}
          className={`px-4 py-2 font-mono text-xs uppercase border rounded-xl transition-all pill-interactive font-bold ${
            subTab === "id" ? "bg-ink text-brass border-brass shadow-sm glow-brass" : "bg-transparent border-rule text-ink-soft hover:text-ink hover:border-brass/40"
          }`}
        >
          View ID & Exam Ticket
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => { setSubTab("scanner"); setScanResult(null); }}
          className={`px-4 py-2 font-mono text-xs uppercase border rounded-xl transition-all pill-interactive font-bold ${
            subTab === "scanner" ? "bg-ink text-brass border-brass shadow-sm glow-brass" : "bg-transparent border-rule text-ink-soft hover:text-ink hover:border-brass/40"
          }`}
        >
          Verify QR Code Scanner
        </motion.button>
      </div>

      {subTab === "id" ? (
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Digital ID Card */}
          <Card className="p-6 border-2 border-brass bg-paper-raised relative overflow-hidden flex flex-col items-center shadow-xl card-interactive hover:glow-brass group">
            <div className="absolute top-0 left-0 w-full h-2 bg-brass" />
            <span className="font-mono text-[9px] text-brass uppercase tracking-widest mt-2 font-bold">QIS College of Engineering & Technology · Student ID</span>
            <div className="w-24 h-24 rounded-full border-2 border-brass/40 bg-canvas flex items-center justify-center my-4 font-display text-3xl text-ink font-semibold group-hover:scale-105 group-hover:border-brass transition-all duration-300 shadow-sm">
              {user?.name ? user.name.split(" ").map(n => n[0]).join("") : "QI"}
            </div>
            <h3 className="font-display text-xl mb-1 text-ink group-hover:text-brass transition-colors font-bold">{user?.name || "Divya"}</h3>
            <span className="font-mono text-xs text-brass uppercase tracking-wider font-semibold">{user?.department || "Artificial Intelligence & ML"}</span>
            <div className="grid grid-cols-2 gap-4 text-xs text-ink-soft w-full border-t border-rule mt-5 pt-4">
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70 font-semibold">Roll Number</span>
                <span className="font-bold text-ink font-mono">{user?.roll_no || (user?.email?.includes("@") && user.email.split("@")[0].toUpperCase()) || "24491A4225"}</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70 font-semibold">Year & Batch</span>
                <span className="font-bold text-ink">{user?.year || "3rd Year"} (B.Tech)</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70 font-semibold">Valid Thru</span>
                <span className="font-bold text-ink">July 2028</span>
              </div>
              <div>
                <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-soft/70 font-semibold">Status</span>
                <span className="font-bold text-success">Active</span>
              </div>
            </div>
            <div className="mt-5 text-ink-soft flex flex-col items-center gap-2 border-t border-rule w-full pt-4">
              <img src={qrImageUrl} alt="Verification QR Code" className="w-32 h-32 border border-rule p-1 bg-paper rounded-xl shadow-xs group-hover:scale-105 transition-transform duration-300" />
              <span className="font-mono text-[8px] tracking-widest text-ink-soft/60 font-bold">SCAN FOR VERIFICATION</span>
            </div>
          </Card>
          
          {/* Exam Hall Ticket Card */}
          <Card className="p-6 border border-rule bg-paper-raised relative overflow-hidden flex flex-col justify-between shadow-xl card-interactive hover:border-brass/50 group">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display text-lg leading-none mb-1 font-bold group-hover:text-brass transition-colors">Exam Hall Ticket</h3>
                  <span className="font-mono text-[9px] text-ink-soft uppercase tracking-wider font-semibold">MID-SEMESTER EXAMS (FALL 2026)</span>
                </div>
                <span className="font-mono text-[9px] uppercase bg-success/15 border border-success/30 text-success rounded-full px-2.5 py-0.5 font-bold shadow-xs">Approved</span>
              </div>
              <div className="space-y-3.5 text-xs text-ink-soft border-t border-rule pt-4">
                <div className="flex justify-between border-b border-rule/30 pb-1.5"><span className="font-mono text-ink-soft/70 font-semibold">Seat Number:</span><span className="font-bold text-ink font-mono">CS-304B</span></div>
                <div className="flex justify-between border-b border-rule/30 pb-1.5"><span className="font-mono text-ink-soft/70 font-semibold">Center:</span><span className="font-bold text-ink">Block C, CS Department</span></div>
                <div className="flex justify-between border-b border-rule/30 pb-1.5"><span className="font-mono text-ink-soft/70 font-semibold">Clearance:</span><span className="font-bold text-success">No Dues</span></div>
                <div className="flex justify-between"><span className="font-mono text-ink-soft/70 font-semibold">Reporting:</span><span className="font-bold text-ink font-mono">09:30 AM</span></div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full mt-6 py-2.5 rounded-xl bg-ink text-brass border border-brass hover:bg-brass hover:text-ink transition-all font-mono text-xs uppercase tracking-wider shadow-sm btn-tactile font-bold"
            >
              Download PDF Ticket
            </motion.button>
          </Card>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {/* QR Scanner Module */}
          <Card className="p-6 border border-rule bg-paper-raised flex flex-col items-center">
            <h3 className="font-display text-lg mb-3 flex items-center gap-2">
              <QrCode size={18} className="text-brass" /> e-CAP Verification Scanner
            </h3>
            <p className="text-xs text-ink-soft text-center mb-5 max-w-xs">
              Present your student Digital ID card QR code to verify details and exam ticket validation status.
            </p>

            <div className="w-full max-w-sm mb-4">
              {scannerActive ? (
                <div id="reader" className="overflow-hidden rounded-xl border-2 border-brass bg-canvas p-1" />
              ) : (
                <div className="aspect-square bg-canvas border border-dashed border-rule rounded-xl flex flex-col items-center justify-center p-6 text-center">
                  <Camera size={32} className="text-ink-soft mb-2" />
                  <span className="text-xs text-ink-soft">Camera scanner is currently offline</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full">
              {scannerActive ? (
                <button
                  onClick={() => setScannerActive(false)}
                  className="flex-1 py-2 rounded-lg bg-danger text-paper font-mono text-xs uppercase tracking-wider"
                >
                  Turn Camera Off
                </button>
              ) : (
                <button
                  onClick={() => { setScannerActive(true); setScanResult(null); }}
                  className="flex-1 py-2 rounded-lg bg-ink text-brass border border-brass font-mono text-xs uppercase tracking-wider hover:bg-brass hover:text-ink transition-colors"
                >
                  Start Camera Scan
                </button>
              )}
              <button
                onClick={simulateScan}
                className="px-4 py-2 rounded-lg border border-rule hover:border-brass text-ink font-mono text-xs uppercase tracking-wider transition-colors"
              >
                Simulate scan
              </button>
            </div>
          </Card>

          {/* Verification Results Console */}
          <Card className="p-6 border border-rule bg-paper-raised relative overflow-hidden flex flex-col justify-between">
            <div>
              <h3 className="font-display text-lg mb-3">Verification Details</h3>
              <div className="border-t border-rule pt-4">
                {scanResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-success/15 border border-success/30 rounded-lg p-3 text-success">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <div>
                        <span className="font-bold text-xs uppercase font-mono block">VERIFIED SUCCESSFULLY</span>
                        <span className="text-[10px] text-success/80 block mt-0.5">e-CAP Gate Entry Confirmed</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-ink-soft bg-canvas/40 border border-rule/50 rounded-lg p-4">
                      {scanResult.name && (
                        <div className="flex justify-between border-b border-rule/30 pb-1.5">
                          <span className="font-mono text-ink-soft/70">Student Name:</span>
                          <span className="font-semibold text-ink">{scanResult.name}</span>
                        </div>
                      )}
                      {scanResult.roll && (
                        <div className="flex justify-between border-b border-rule/30 pb-1.5">
                          <span className="font-mono text-ink-soft/70">Roll Number:</span>
                          <span className="font-semibold text-ink font-mono">{scanResult.roll}</span>
                        </div>
                      )}
                      {scanResult.dept && (
                        <div className="flex justify-between border-b border-rule/30 pb-1.5">
                          <span className="font-mono text-ink-soft/70">Branch:</span>
                          <span className="font-semibold text-ink">{scanResult.dept}</span>
                        </div>
                      )}
                      {scanResult.seat && (
                        <div className="flex justify-between border-b border-rule/30 pb-1.5">
                          <span className="font-mono text-ink-soft/70">Exam Seat:</span>
                          <span className="font-semibold text-ink">{scanResult.seat}</span>
                        </div>
                      )}
                      {scanResult.status && (
                        <div className="flex justify-between">
                          <span className="font-mono text-ink-soft/70">Clearance Status:</span>
                          <span className="font-semibold text-success">{scanResult.status}</span>
                        </div>
                      )}
                      {scanResult.raw && (
                        <div className="space-y-1">
                          <span className="font-mono text-ink-soft/70 block">Decoded Text:</span>
                          <pre className="p-2 bg-canvas border border-rule rounded text-[10px] font-mono whitespace-pre-wrap break-all text-ink">
                            {scanResult.raw}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-rule rounded-xl bg-canvas/20">
                    <AlertTriangle size={24} className="text-ink-soft/60 mb-2" />
                    <span className="text-xs text-ink-soft font-mono">Awaiting verification scan...</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setScanResult(null)}
              disabled={!scanResult}
              className="w-full mt-6 py-2 rounded-lg border border-rule hover:border-brass text-xs font-mono uppercase tracking-wider disabled:opacity-40 transition-colors"
            >
              Reset Reader Console
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

function LibraryView({ rows, onUpdate }) {
  const [search, setSearch] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const filtered = rows.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.author.toLowerCase().includes(search.toLowerCase()) ||
    (r.isbn && r.isbn.includes(search))
  );
  async function handleReserve(bookId) {
    try {
      const { data } = await client.post("/portal/library/reserve", { book_id: bookId });
      setStatusMsg("Book reserved successfully!");
      onUpdate();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch (err) {
      setStatusMsg(err.response?.data?.error || "Reservation failed");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  }
  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-brass/10 border border-brass/30 text-brass text-xs rounded-lg font-mono">{statusMsg}</div>}
      <div className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by Title, Author, or ISBN..."
          className="flex-1 bg-paper border border-rule rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brass transition-all"
        />
      </div>
      <Card className="overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule text-left font-mono text-xs uppercase tracking-wide text-ink-soft bg-canvas/40">
              <th className="px-5 py-3">Title & Author</th>
              <th className="px-5 py-3">ISBN</th>
              <th className="px-5 py-3">Shelf</th>
              <th className="px-5 py-3">Availability</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <motion.tr
                key={r.id}
                whileHover={{ x: 3 }}
                className="border-b border-rule last:border-0 hover:bg-brass/5 row-interactive cursor-pointer transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="font-medium text-ink">{r.title}</div>
                  <div className="text-xs text-ink-soft">{r.author}</div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{r.isbn}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-brass font-bold">{r.location}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-mono rounded-full px-2 py-0.5 font-bold shadow-xs ${r.available_copies > 0 ? "bg-success/15 text-success border border-success/30" : "bg-danger/15 text-danger border border-danger/30"}`}>
                    {r.available_copies > 0 ? `${r.available_copies} Available` : "Checked Out"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.94 }}
                    disabled={r.available_copies <= 0}
                    onClick={() => handleReserve(r.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-ink text-brass border border-brass text-xs disabled:opacity-40 disabled:pointer-events-none hover:bg-brass hover:text-ink transition-all font-mono btn-tactile font-bold shadow-xs"
                  >
                    Reserve
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function AssignmentsView({ rows }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-display text-lg border-b border-rule pb-2 flex items-center gap-2 font-bold">
          <AlertTriangle size={18} className="text-brass" /> Pending Tasks
        </h3>
        {rows.filter(r => r.status === "Pending").map((r, i) => (
          <Card key={i} className="p-4 relative border-l-4 border-l-brass card-interactive hover:border-brass/60 group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[9px] text-brass uppercase font-bold bg-brass/10 px-2 py-0.5 rounded border border-brass/25">{r.subject}</span>
              <span className="font-mono text-[9px] text-danger font-bold bg-danger/10 px-2 py-0.5 rounded border border-danger/25">Due: {r.deadline}</span>
            </div>
            <h4 className="font-medium text-sm mb-1 text-ink group-hover:text-brass transition-colors">{r.title}</h4>
            <div className="flex justify-end mt-3">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg bg-ink text-brass border border-brass text-[10px] hover:bg-brass hover:text-ink font-mono uppercase tracking-wider transition-all btn-tactile font-bold shadow-xs"
              >
                Submit Online
              </motion.button>
            </div>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <h3 className="font-display text-lg border-b border-rule pb-2 flex items-center gap-2 font-bold">
          <CheckCircle2 size={18} className="text-success" /> Completed / Graded
        </h3>
        {rows.filter(r => r.status !== "Pending").map((r, i) => (
          <Card key={i} className="p-4 border-l-4 border-l-success card-interactive hover:border-success/60 group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-mono text-[9px] text-ink-soft uppercase font-bold bg-canvas px-2 py-0.5 rounded border border-rule/50">{r.subject}</span>
              <span className={`font-mono text-[9px] uppercase rounded-full px-2.5 py-0.5 font-bold shadow-xs ${r.status === "Graded" ? "bg-success/15 text-success border border-success/30" : "bg-ink/15 text-ink border border-ink/30"}`}>
                {r.status}
              </span>
            </div>
            <h4 className="font-medium text-sm mb-1 text-ink group-hover:text-success transition-colors">{r.title}</h4>
            {r.grade && <div className="text-xs mt-2 text-ink-soft font-mono">Grade: <span className="font-bold text-success text-sm">{r.grade}</span></div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

function PlacementsView({ rows, onUpdate }) {
  const [statusMsg, setStatusMsg] = useState("");
  async function handleApply(id) {
    try {
      await client.post("/portal/placements/apply", { placement_id: id });
      setStatusMsg("Application submitted successfully!");
      onUpdate();
      setTimeout(() => setStatusMsg(""), 3000);
    } catch {
      setStatusMsg("Application submission failed");
      setTimeout(() => setStatusMsg(""), 3000);
    }
  }
  return (
    <div className="space-y-4">
      {statusMsg && <div className="p-3 bg-brass/10 border border-brass/30 text-brass text-xs rounded-lg font-mono">{statusMsg}</div>}
      <div className="grid sm:grid-cols-2 gap-4">
        {rows.map((r, i) => (
          <Card key={r.id} className="p-5 flex flex-col justify-between card-interactive hover:border-brass/60 group">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-lg leading-tight font-bold text-ink group-hover:text-brass transition-colors">{r.company}</h3>
                <span className="font-mono text-xs text-brass font-bold bg-brass/10 border border-brass/30 px-2.5 py-0.5 rounded-full shadow-xs group-hover:scale-105 transition-transform">{r.package}</span>
              </div>
              <div className="text-sm font-semibold text-ink/90 mb-3">{r.role}</div>
              <div className="text-xs text-ink-soft border-t border-rule pt-2.5 space-y-1">
                <div><span className="font-mono text-ink-soft/70 font-semibold">Eligibility:</span> {r.eligibility}</div>
                <div><span className="font-mono text-ink-soft/70 font-semibold">Drive Date:</span> {r.drive_date}</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-rule/55 pt-3">
              <span className={`text-[9px] font-mono uppercase rounded-full px-2.5 py-0.5 font-bold shadow-xs ${
                r.status === "Open" ? "bg-brass/15 text-brass border border-brass/30" :
                r.status === "Applied" ? "bg-success/15 text-success border border-success/30" :
                r.status === "Selected" ? "bg-success text-paper" : "bg-ink-soft/15 text-ink-soft border border-rule"
              }`}>{r.status}</span>
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.94 }}
                disabled={r.status !== "Open"}
                onClick={() => handleApply(r.id)}
                className="px-3.5 py-1.5 rounded-lg bg-ink text-brass border border-brass text-xs disabled:opacity-40 disabled:pointer-events-none hover:bg-brass hover:text-ink transition-all font-mono uppercase tracking-wider btn-tactile font-bold shadow-xs"
              >
                {r.status === "Applied" ? "Applied" : r.status === "Selected" ? "Selected" : "Apply Now"}
              </motion.button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EventsView({ rows }) {
  return (
    <div className="space-y-4">
      {rows.map((r, i) => (
        <Card key={r.id} className="p-5 flex gap-4 items-start card-interactive hover:border-brass/60 group">
          <div className="bg-ink text-brass rounded-xl p-3 w-20 text-center font-mono shrink-0 border border-brass/45 group-hover:scale-105 group-hover:glow-brass transition-all duration-300 shadow-md">
            <span className="block text-[8px] text-brass/70 uppercase tracking-widest font-semibold">Date</span>
            <span className="text-[11px] font-bold leading-tight block mt-0.5 whitespace-nowrap">{r.event_date.split(" ")[0]}</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-display text-lg leading-tight font-bold text-ink group-hover:text-brass transition-colors">{r.title}</h3>
              <span className="text-[9px] font-mono uppercase bg-brass/15 text-brass px-2 py-0.5 rounded-full border border-brass/25 font-bold shadow-xs">{r.category}</span>
            </div>
            <p className="text-sm text-ink-soft leading-relaxed">{r.description}</p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-ink-soft pt-2 border-t border-rule/30">
              <span>Venue · <strong className="text-ink">{r.venue}</strong></span>
              <span>Organized by · <strong className="text-ink">{r.organizer}</strong></span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function GrievanceView({ rows, onUpdate }) {
  const [subj, setSubj] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  async function handleSubmit(e) {
    e.preventDefault();
    if (!subj.trim() || !desc.trim() || loading) return;
    setLoading(true);
    try {
      await client.post("/portal/grievance", { subject: subj, description: desc });
      setMsg("Grievance logged successfully.");
      setSubj("");
      setDesc("");
      onUpdate();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to log grievance.");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <Card className="p-6 card-interactive shadow-sm border border-rule/80">
        <h3 className="font-display text-lg mb-4 font-bold flex items-center gap-2">
          <Inbox size={18} className="text-brass" /> Submit New Grievance
        </h3>
        {msg && <div className="p-3 bg-brass/10 border border-brass/30 text-brass text-xs rounded-xl mb-4 font-mono">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase mb-1.5 text-ink-soft font-semibold">Subject</label>
            <input
              required
              value={subj}
              onChange={(e) => setSubj(e.target.value)}
              placeholder="E.g. Classroom projector broken"
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brass transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase mb-1.5 text-ink-soft font-semibold">Description</label>
            <textarea
              required
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Describe your issue or feedback in detail..."
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brass transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ink text-brass border border-brass rounded-xl font-mono text-xs uppercase tracking-wider hover:bg-brass hover:text-ink disabled:opacity-40 transition-all flex items-center justify-center gap-2 btn-tactile font-bold shadow-xs"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
            Submit Grievance
          </motion.button>
        </form>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-display text-lg border-b border-rule pb-2 font-bold flex items-center gap-2">
          <ClipboardList size={18} className="text-brass" /> Active Grievances
        </h3>
        {rows.length === 0 ? (
          <Card className="p-6 text-center text-xs text-ink-soft">No grievances logged yet.</Card>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {rows.map((r, i) => (
              <Card key={r.id} className="p-4 border-l-4 border-l-ink card-interactive hover:border-l-brass group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm truncate pr-2 text-ink group-hover:text-brass transition-colors">{r.subject}</h4>
                  <span className={`text-[9px] font-mono uppercase rounded-full px-2.5 py-0.5 font-bold shadow-xs ${
                    r.status === "Open" ? "bg-brass/15 text-brass border border-brass/30" :
                    r.status === "Resolved" ? "bg-success/15 text-success border border-success/30" : "bg-ink-soft/15 text-ink-soft border border-rule"
                  }`}>{r.status}</span>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed line-clamp-3 mb-2">{r.description}</p>
                {r.resolution && <div className="text-[11px] bg-canvas/60 p-2.5 rounded-xl border border-rule mt-2 text-ink-soft"><span className="font-mono font-bold text-brass">Resolution:</span> {r.resolution}</div>}
                <span className="block font-mono text-[8px] text-ink-soft/50 text-right mt-1">{r.submitted_at.substring(0,10)}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BusRoutesView({ rows }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {rows.map((r, i) => (
        <Card key={r.id} className="p-5 flex flex-col justify-between card-interactive hover:border-brass/60 group shadow-sm">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span className="font-mono text-[9px] text-brass uppercase border border-brass/45 px-2.5 py-0.5 rounded-full font-bold bg-brass/10 group-hover:bg-brass group-hover:text-ink transition-colors">{r.route_no}</span>
              <span className="font-mono text-xs text-ink-soft font-semibold bg-canvas px-2 py-0.5 rounded-md border border-rule/50">{r.timings}</span>
            </div>
            <h3 className="font-display text-lg leading-tight mb-2 text-ink group-hover:text-brass transition-colors font-bold">{r.source} ➔ {r.destination}</h3>
            <div className="text-xs text-ink-soft mt-3 pt-3 border-t border-rule space-y-2">
              <div>
                <span className="font-mono text-[9px] block uppercase text-ink-soft/60 tracking-wider font-semibold">Major Stops</span>
                <p className="text-ink mt-0.5 font-medium leading-relaxed">{r.stops}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 border-t border-rule/55 pt-3 flex justify-between items-center text-xs">
            <span className="font-mono text-ink-soft font-semibold">Driver Contact</span>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`tel:${r.driver_contact}`}
              className="font-mono text-brass hover:underline flex items-center gap-1 font-bold btn-tactile bg-brass/10 border border-brass/30 px-2.5 py-1 rounded-lg shadow-xs"
            >
              <Phone size={11} className="animate-pulse" /> {r.driver_contact}
            </motion.a>
          </div>
        </Card>
      ))}
    </div>
  );
}

function LostFoundView({ rows, onUpdate }) {
  const [itemName, setItemName] = useState("");
  const [desc, setDesc] = useState("");
  const [loc, setLoc] = useState("");
  const [status, setStatus] = useState("Lost");
  const [contact, setContact] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!itemName.trim() || !desc.trim() || !contact.trim() || loading) return;
    setLoading(true);
    try {
      await client.post("/portal/lost_found", { item_name: itemName, description: desc, location: loc, status, contact });
      setMsg("Reported successfully!");
      setItemName("");
      setDesc("");
      setLoc("");
      setContact("");
      onUpdate();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to report item.");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <Card className="p-5 card-interactive shadow-sm border border-rule/80">
        <h3 className="font-display text-lg mb-4 font-bold flex items-center gap-2">
          <Search size={18} className="text-brass" /> Report Lost / Found Item
        </h3>
        {msg && <div className="p-3 bg-brass/10 border border-brass/30 text-brass text-xs rounded-xl mb-4 font-mono">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Item Name</label>
            <input
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="E.g. Casio fx-991EX Calculator"
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all font-mono"
            >
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Location Found/Lost</label>
            <input
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              placeholder="E.g. Near Canteen"
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Description</label>
            <textarea
              required
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Item specifics (e.g. scratches, color, label)..."
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Your Contact Info</label>
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Name & email or phone"
              className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-ink text-brass border border-brass rounded-xl font-mono text-xs uppercase tracking-wide hover:bg-brass hover:text-ink disabled:opacity-40 transition-all flex items-center justify-center gap-2 btn-tactile font-bold shadow-xs"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={12} />}
            Submit Report
          </motion.button>
        </form>
      </Card>
      
      <div className="space-y-4">
        <h3 className="font-display text-lg border-b border-rule pb-2 font-bold flex items-center gap-2">
          <ClipboardList size={18} className="text-brass" /> Active Board
        </h3>
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {rows.map((r, i) => (
            <Card key={r.id} className="p-4 border-l-4 border-l-brass card-interactive hover:border-brass/60 group shadow-xs">
              <div className="flex justify-between items-start mb-1.5">
                <h4 className="font-semibold text-sm text-ink group-hover:text-brass transition-colors">{r.item_name}</h4>
                <span className={`text-[9px] font-mono uppercase rounded-full px-2.5 py-0.5 font-bold shadow-xs ${
                  r.status === 'Lost' ? 'bg-danger/15 text-danger border border-danger/30' : 
                  r.status === 'Found' ? 'bg-success/15 text-success border border-success/30' : 'bg-ink-soft/15 text-ink-soft border border-rule'
                }`}>{r.status}</span>
              </div>
              <p className="text-xs text-ink-soft mb-2 leading-normal">{r.description}</p>
              <div className="text-[10px] text-ink-soft/80 font-mono space-y-0.5 border-t border-rule/55 pt-2">
                <div>📍 <span className="font-semibold text-ink-soft">Location:</span> {r.location_found || "N/A"}</div>
                <div>📞 <span className="font-semibold text-ink-soft">Contact:</span> {r.contact}</div>
              </div>
              <span className="block font-mono text-[8px] text-ink-soft/40 text-right mt-2">Reported: {r.reported_at}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function HostelView({ data, onUpdate }) {
  const details = data?.details?.[0] || {};
  const tickets = data?.tickets || [];
  const [issue, setIssue] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!issue.trim() || !detailsText.trim() || loading) return;
    setLoading(true);
    try {
      await client.post("/portal/hostel/maintenance", { issue, details: detailsText });
      setMsg("Maintenance request submitted successfully.");
      setIssue("");
      setDetailsText("");
      onUpdate();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Submission failed.");
      setTimeout(() => setMsg(""), 3000);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Card className="p-5 relative overflow-hidden border-2 border-brass bg-paper-raised shadow-md card-interactive hover:glow-brass group">
          <div className="absolute top-0 left-0 w-full h-2 bg-brass" />
          <h3 className="font-display text-lg mb-3 font-bold text-ink group-hover:text-brass transition-colors">Hostel Allocation</h3>
          <div className="grid grid-cols-2 gap-4 text-xs mt-3">
            <div>
              <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider font-semibold">Block Name</span>
              <span className="font-bold text-ink">{details.block_name || "Girls Block A"}</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider font-semibold">Room Number</span>
              <span className="font-bold text-ink font-mono">{details.room_no || "A-102"}</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider font-semibold">Room Type</span>
              <span className="font-bold text-ink">{details.room_type || "2-Share AC"}</span>
            </div>
            <div>
              <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider font-semibold">Monthly Rent</span>
              <span className="font-bold font-mono text-brass">₹{(details.monthly_rent || 7500).toLocaleString()}</span>
            </div>
            <div className="col-span-2 border-t border-rule/55 pt-3">
              <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider font-semibold">Warden Info</span>
              <span className="font-bold text-ink block">{details.warden_name || "Mrs. Lakshmi"}</span>
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={`tel:${details.warden_contact}`}
                className="font-mono text-[11px] text-brass hover:underline flex items-center gap-1 mt-1 font-bold"
              >
                <Phone size={11} className="animate-pulse" /> {details.warden_contact || "+91 90000 77777"}
              </motion.a>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 card-interactive shadow-sm border border-rule/80">
          <h3 className="font-display text-lg mb-4 font-bold flex items-center gap-2">
            <Home size={18} className="text-brass" /> Submit Maintenance Ticket
          </h3>
          {msg && <div className="p-3 bg-brass/10 border border-brass/30 text-brass text-xs rounded-xl mb-4 font-mono">{msg}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Issue</label>
              <input
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="E.g. AC leaking water"
                className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase mb-1 text-ink-soft font-semibold">Details</label>
              <textarea
                required
                rows={3}
                value={detailsText}
                onChange={(e) => setDetailsText(e.target.value)}
                placeholder="Specify dates, timings, room details..."
                className="w-full bg-canvas border border-rule rounded-xl px-3.5 py-2 text-sm outline-none focus:border-brass transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-ink text-brass border border-brass rounded-xl font-mono text-xs uppercase tracking-wide hover:bg-brass hover:text-ink disabled:opacity-40 transition-all flex items-center justify-center gap-2 btn-tactile font-bold shadow-xs"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={12} />}
              Submit Request
            </motion.button>
          </form>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-display text-lg border-b border-rule pb-2 font-bold flex items-center gap-2">
          <ClipboardList size={18} className="text-brass" /> Active Tickets
        </h3>
        {tickets.length === 0 ? (
          <Card className="p-6 text-center text-xs text-ink-soft">No maintenance tickets logged yet.</Card>
        ) : (
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {tickets.map((r, i) => (
              <Card key={r.id} className="p-4 border-l-4 border-l-ink card-interactive hover:border-brass/60 group shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm truncate pr-2 text-ink group-hover:text-brass transition-colors">{r.issue}</h4>
                  <span className={`text-[9px] font-mono uppercase rounded-full px-2.5 py-0.5 font-bold shadow-xs ${
                    r.status === 'Open' ? 'bg-brass/15 text-brass border border-brass/30' : 'bg-success/15 text-success border border-success/30'
                  }`}>{r.status}</span>
                </div>
                <p className="text-xs text-ink-soft leading-normal">{r.details}</p>
                <span className="block font-mono text-[8px] text-ink-soft/40 text-right mt-2 font-semibold">{r.submitted_at.substring(0,10)}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FoodMenuView({ data, onUpdate }) {
  const [day, setDay] = useState("Monday");
  const menuList = data?.menu || [];
  const ratings = data?.ratings || {};
  const filteredMenu = menuList.filter(m => m.day_of_week === day);
  async function handleRate(mealId, rating) {
    try {
      await client.post("/portal/food/rate", { meal_id: mealId, rating });
      onUpdate();
    } catch {
      /* ignore ratings errors */
    }
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-2 border-b border-rule pb-3">
        {["Monday", "Tuesday", "Wednesday"].map(d => (
          <motion.button
            key={d}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDay(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all pill-interactive font-bold ${
              day === d ? "bg-ink text-brass border-brass shadow-sm glow-brass" : "bg-paper text-ink-soft border-rule hover:border-brass/50"
            }`}
          >
            {d}
          </motion.button>
        ))}
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredMenu.map((m) => {
          const mealRates = ratings[m.id] || { ups: 0, downs: 0 };
          return (
            <Card key={m.id} className="p-5 flex flex-col justify-between card-interactive hover:border-brass/60 group shadow-sm">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-display text-lg text-brass leading-none font-bold group-hover:scale-105 transition-transform inline-block">{m.meal_type}</span>
                  <span className="font-mono text-[10px] text-ink-soft font-semibold bg-canvas px-2 py-0.5 rounded-md border border-rule/50">{m.timings}</span>
                </div>
                <p className="text-sm leading-relaxed mb-4 text-ink font-semibold">{m.items}</p>
              </div>
              <div className="border-t border-rule/55 pt-3 flex justify-between items-center text-xs">
                <span className="font-mono text-ink-soft font-semibold">Rate this meal</span>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRate(m.id, "up")}
                    className="flex items-center gap-1 font-mono text-ink-soft hover:text-success transition-colors btn-tactile bg-canvas px-2.5 py-1 rounded-lg border border-rule/50 hover:border-success/40"
                  >
                    <ThumbsUp size={13} className="text-success" /> <span className="text-[11px] font-bold">{mealRates.ups || 0}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRate(m.id, "down")}
                    className="flex items-center gap-1 font-mono text-ink-soft hover:text-danger transition-colors btn-tactile bg-canvas px-2.5 py-1 rounded-lg border border-rule/50 hover:border-danger/40"
                  >
                    <ThumbsDown size={13} className="text-danger" /> <span className="text-[11px] font-bold">{mealRates.downs || 0}</span>
                  </motion.button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AdminDirectoryView({ rows }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {rows.map((r, i) => (
        <Card key={r.id} className="p-5 flex gap-4 items-center card-interactive hover:border-brass/60 group shadow-sm">
          <div className="w-12 h-12 rounded-full bg-brass/20 text-brass flex items-center justify-center font-display text-lg border border-brass/45 shrink-0 font-bold shadow-inner group-hover:scale-110 group-hover:glow-brass transition-all duration-300">
            {r.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg leading-tight truncate text-ink font-bold group-hover:text-brass transition-colors">{r.name}</h3>
            <div className="text-xs text-brass font-mono mt-0.5 font-semibold">{r.designation} · {r.department}</div>
            <div className="text-xs text-ink-soft mt-2.5 space-y-0.5 border-t border-rule/30 pt-2">
              <div className="truncate"><span className="font-mono text-[9px] uppercase text-ink-soft/60 font-semibold">Email:</span> <span className="text-ink font-medium">{r.email}</span></div>
              <div><span className="font-mono text-[9px] uppercase text-ink-soft/60 font-semibold">Phone:</span> <span className="text-ink font-medium">{r.phone}</span></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Faculty timetable — 3 subjects, 4-5 periods/day, Monday = Online Day
// (Each faculty has a different online day so no clashes occur)
const FACULTY_ONLINE_DAY = "Monday"; // This faculty's online day

const TIMETABLE_DATA = [
  {
    day: "Monday", online: true,
    periods: [
      { time: "09:00–10:00", subject: "Machine Learning",  section: "AIML-2", room: "MS Teams", year: "II B.Tech",  online: true  },
      { time: "10:00–11:00", subject: "Neural Networks",   section: "CSE-5",  room: "MS Teams", year: "III B.Tech", online: true  },
      { time: "11:00–12:00", subject: "Machine Learning",  section: "AIML-2", room: "MS Teams", year: "II B.Tech",  online: true  },
      { time: "14:00–15:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "MS Teams", year: "III B.Tech", online: true  },
    ],
  },
  {
    day: "Tuesday", online: false,
    periods: [
      { time: "09:00–10:00", subject: "Neural Networks",   section: "CSE-5",  room: "CS-205", year: "III B.Tech", online: false },
      { time: "10:00–11:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
      { time: "11:00–12:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", year: "III B.Tech", online: false },
      { time: "14:00–15:00", subject: "Neural Networks",   section: "CSE-5",  room: "CS-205", year: "III B.Tech", online: false },
      { time: "15:00–16:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
    ],
  },
  {
    day: "Wednesday", online: false,
    periods: [
      { time: "09:00–10:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
      { time: "10:00–11:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", year: "III B.Tech", online: false },
      { time: "11:00–12:00", subject: "Neural Networks",   section: "CSE-5",  room: "CS-205", year: "III B.Tech", online: false },
      { time: "14:00–15:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
    ],
  },
  {
    day: "Thursday", online: false,
    periods: [
      { time: "09:00–10:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", year: "III B.Tech", online: false },
      { time: "10:00–11:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
      { time: "11:00–12:00", subject: "Neural Networks",   section: "CSE-5",  room: "CS-205", year: "III B.Tech", online: false },
      { time: "14:00–15:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", year: "III B.Tech", online: false },
      { time: "15:00–16:00", subject: "Neural Networks",   section: "CSE-5",  room: "CS-205", year: "III B.Tech", online: false },
    ],
  },
  {
    day: "Friday", online: false,
    periods: [
      { time: "09:00–10:00", subject: "Neural Networks",   section: "CSE-5",  room: "CS-205", year: "III B.Tech", online: false },
      { time: "10:00–11:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
      { time: "11:00–12:00", subject: "Deep Learning Lab", section: "CSDS-3", room: "Lab-A2", year: "III B.Tech", online: false },
      { time: "14:00–15:00", subject: "Machine Learning",  section: "AIML-2", room: "CS-301", year: "II B.Tech",  online: false },
    ],
  },
];

function FacultyTimetableView({ user }) {
  const [selDay, setSelDay] = useState("Monday");
  const dayData = TIMETABLE_DATA.find(d => d.day === selDay);
  const isOnlineDay = dayData?.online === true;

  const subjectColors = {
    "Machine Learning":  { base: "text-brass",    bg: "bg-brass/10 border-brass/40"    },
    "Deep Learning Lab": { base: "text-success",  bg: "bg-success/10 border-success/40"  },
    "Neural Networks":   { base: "text-[#6366f1]",bg: "bg-[#6366f1]/10 border-[#6366f1]/40" },
  };

  const totalPeriods = TIMETABLE_DATA.reduce((a, d) => a + d.periods.length, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Subjects Teaching", value: "3"               },
          { label: "Periods / Week",    value: totalPeriods       },
          { label: "Students Assigned", value: "150"             },
          { label: "Online Day",        value: FACULTY_ONLINE_DAY },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center stat-box-interactive card-interactive">
            <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider mb-1 font-semibold">{s.label}</span>
            <span className="font-display text-2xl text-brass font-bold">{s.value}</span>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 items-center text-xs font-mono">
        <span className="text-ink-soft/60 text-[10px] uppercase tracking-wider font-semibold">Subject Key:</span>
        {Object.entries(subjectColors).map(([name, cls]) => (
          <span key={name} className={`px-2.5 py-0.5 rounded-full border ${cls.bg} ${cls.base} text-[10px] font-bold shadow-xs`}>{name}</span>
        ))}
        <span className="px-2.5 py-0.5 rounded-full border bg-sky-500/10 border-sky-500/40 text-sky-500 text-[10px] font-bold flex items-center gap-1 shadow-xs">
          📶 Online
        </span>
      </div>

      {/* Day selector */}
      <div className="flex flex-wrap gap-2 border-b border-rule pb-3">
        {TIMETABLE_DATA.map(d => (
          <motion.button
            key={d.day}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelDay(d.day)}
            className={`relative px-4 py-1.5 rounded-full text-xs font-mono border transition-all pill-interactive font-bold ${
              selDay === d.day
                ? d.online ? "bg-sky-600 text-white border-sky-500 shadow-md glow-sky" : "bg-ink text-brass border-brass shadow-md glow-brass"
                : d.online ? "bg-sky-500/10 text-sky-500 border-sky-500/50 hover:bg-sky-500/20"
                           : "bg-paper text-ink-soft border-rule hover:border-brass/50"
            }`}
          >
            {d.day}
            {d.online && (
              <span className="absolute -top-1.5 -right-1 text-[8px] bg-sky-500 text-white rounded-full px-1 font-bold leading-none py-0.5 shadow-xs">
                ONLINE
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Online Day Banner */}
      {isOnlineDay && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 card-interactive shadow-sm glow-sky"
        >
          <span className="text-sky-500 text-xl animate-pulse">📶</span>
          <div>
            <span className="font-display text-sm text-sky-500 font-bold">Online Teaching Day — {FACULTY_ONLINE_DAY}</span>
            <p className="font-mono text-[10px] text-sky-500/80 mt-0.5">All periods conducted via MS Teams. Physical attendance not required.</p>
          </div>
        </motion.div>
      )}

      {/* Period cards */}
      <div className="space-y-3">
        {dayData?.periods.map((p, i) => {
          const colors = subjectColors[p.subject] || { base: "text-ink-soft", bg: "bg-ink-soft/10 border-ink-soft/40" };
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className={`p-0 overflow-hidden border card-interactive hover:border-brass/60 group shadow-sm ${p.online ? "border-sky-500/30 bg-sky-500/5 glow-sky" : ""}`}>
                <div className="flex items-stretch">
                  {/* Period number stripe */}
                  <div className={`shrink-0 w-1.5 ${p.online ? "bg-sky-500" : colors.base === "text-brass" ? "bg-brass" : colors.base === "text-success" ? "bg-success" : "bg-[#6366f1]"}`} />

                  {/* Time block */}
                  <div className="shrink-0 w-28 flex flex-col items-center justify-center px-3 py-4 border-r border-rule">
                    <span className="font-mono text-[11px] font-bold text-brass block">{p.time.split("–")[0]}</span>
                    <span className="font-mono text-[9px] text-ink-soft/50 mt-0.5">– {p.time.split("–")[1]}</span>
                    <span className="font-mono text-[8px] text-ink-soft/40 mt-2 uppercase tracking-wider">Period {i + 1}</span>
                  </div>

                  {/* Subject info */}
                  <div className="flex-1 min-w-0 px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className={`font-display text-lg leading-tight ${colors.base}`}>{p.subject}</h4>
                      <div className="font-mono text-xs text-ink-soft mt-1 flex items-center gap-2">
                        <span>{p.year}</span>
                        <span>·</span>
                        <span className="px-2 py-0.5 text-[9px] bg-brass/15 text-brass rounded font-bold border border-brass/30">
                          {p.section}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {p.online && (
                        <span className="text-[9px] font-mono border rounded-full px-2 py-0.5 bg-sky-500/10 border-sky-500/40 text-sky-500 font-bold flex items-center gap-1">
                          📶 Online
                        </span>
                      )}
                      <span className={`text-[10px] font-mono border rounded-full px-2.5 py-0.5 ${colors.bg} ${colors.base} font-semibold`}>
                        {p.room}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Total periods for selected day */}
      <div className="flex justify-end">
        <span className="font-mono text-[10px] text-ink-soft/50 uppercase tracking-wider">
          {selDay}: {dayData?.periods.length} periods &nbsp;·&nbsp; {isOnlineDay ? "🌐 Online Day" : "🏛️ In-Person Day"}
        </span>
      </div>
    </div>
  );
}


function FacultyMarkAttendanceView() {
  const [selSection, setSelSection]       = useState("AIML-2");
  const [selDate, setSelDate]             = useState(new Date().toISOString().slice(0, 10));
  const [statusFilter, setStatusFilter]   = useState("all"); // 'all' | 'present' | 'absent'
  const [search, setSearch]               = useState("");
  const [attendance, setAttendance]       = useState(
    Object.fromEntries(FACULTY_STUDENTS_LIST.map(s => [s.roll, s.present]))
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedData, setSubmittedData]     = useState(null);
  const [isSubmitting, setIsSubmitting]       = useState(false);

  // Active section info
  const activeSecInfo = FACULTY_SECTIONS.find(s => s.id === selSection) || {
    id: "All",
    name: "All Sections",
    course: "All Courses",
    courseId: "ALL-REG",
    regulation: "R23",
    count: FACULTY_STUDENTS_LIST.length
  };

  // Filter by section
  const sectionStudents = FACULTY_STUDENTS_LIST.filter(s =>
    selSection === "All" ? true : s.section === selSection
  );

  // Present / Absent counts for currently chosen section
  const currentPresentCount = sectionStudents.filter(s => !!attendance[s.roll]).length;
  const currentAbsentCount  = sectionStudents.length - currentPresentCount;

  // Final filtered list based on section, statusFilter (Presentees / Absentees), and search query
  const filteredStudents = sectionStudents.filter(s => {
    const isPresent = !!attendance[s.roll];
    if (statusFilter === "present" && !isPresent) return false;
    if (statusFilter === "absent" && isPresent) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q);
    }
    return true;
  });

  function toggle(roll) {
    setSubmittedData(null);
    setAttendance(prev => ({ ...prev, [roll]: !prev[roll] }));
  }

  // Master checkbox toggle for current visible list
  const isAllCurrentPresent = filteredStudents.length > 0 && filteredStudents.every(s => !!attendance[s.roll]);

  function toggleAllCurrent() {
    setSubmittedData(null);
    const targetState = !isAllCurrentPresent;
    setAttendance(prev => {
      const updated = { ...prev };
      filteredStudents.forEach(s => {
        updated[s.roll] = targetState;
      });
      return updated;
    });
  }

  function handleConfirmSubmit() {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSubmitModal(false);
      setSubmittedData({
        timestamp: new Date().toLocaleTimeString(),
        date: selDate,
        courseId: activeSecInfo.courseId,
        regulation: activeSecInfo.regulation,
        section: activeSecInfo.name,
        course: activeSecInfo.course,
        present: currentPresentCount,
        absent: currentAbsentCount,
        total: sectionStudents.length,
        receiptId: `ATT-${activeSecInfo.regulation}-${selDate.replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }, 600);
  }

  return (
    <div className="space-y-5">
      {/* Attendance Controls / Nav Bar */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Courses ID with Regulation Number option button / selector */}
          <div className="md:col-span-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-mono uppercase text-ink-soft font-semibold">
                Course ID & Regulation
              </label>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-brass/20 text-brass border border-brass/40">
                Reg: {activeSecInfo.regulation}
              </span>
            </div>
            <div className="relative">
              <select
                value={selSection}
                onChange={e => {
                  setSelSection(e.target.value);
                  setStatusFilter("all");
                  setSubmittedData(null);
                }}
                className="w-full bg-canvas border border-brass/40 rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-all font-mono font-semibold text-ink"
              >
                {FACULTY_SECTIONS.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.courseId} ({sec.regulation} Reg) · {sec.course} [{sec.name}]
                  </option>
                ))}
                <option value="All">All Courses · R23 Regulation (150 Students)</option>
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3">
            <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1 font-semibold">
              Attendance Date
            </label>
            <input
              type="date"
              value={selDate}
              onChange={e => {
                setSelDate(e.target.value);
                setSubmittedData(null);
              }}
              className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass font-mono transition-all"
            />
          </div>

          {/* Nav bar buttons: Presentees, Absentees & Submit Option Button */}
          <div className="md:col-span-5 flex gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter(f => f === "present" ? "all" : "present")}
              className={`flex-1 py-2 px-2.5 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === "present"
                  ? "bg-success text-white border-success shadow-sm ring-2 ring-success/30 font-bold"
                  : "border-success/50 text-success bg-success/5 hover:bg-success/15"
              }`}
            >
              <CheckCircle2 size={13} />
              <span>Presentees</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === "present" ? "bg-white/25 text-white" : "bg-success/20 text-success"
              }`}>
                {currentPresentCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter(f => f === "absent" ? "all" : "absent")}
              className={`flex-1 py-2 px-2.5 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                statusFilter === "absent"
                  ? "bg-danger text-white border-danger shadow-sm ring-2 ring-danger/30 font-bold"
                  : "border-danger/50 text-danger bg-danger/5 hover:bg-danger/15"
              }`}
            >
              <AlertTriangle size={13} />
              <span>Absentees</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === "absent" ? "bg-white/25 text-white" : "bg-danger/20 text-danger"
              }`}>
                {currentAbsentCount}
              </span>
            </button>

            {/* Submit button option */}
            {currentPresentCount > 0 && (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="px-3.5 py-2 rounded-lg bg-brass text-ink font-mono text-xs uppercase font-bold hover:bg-brass-dark hover:text-white transition-all flex items-center justify-center gap-1.5 shadow border border-brass shrink-0 animate-pulse"
                title="Submit Marked Attendance"
              >
                <Send size={12} />
                <span>Submit</span>
              </button>
            )}
          </div>
        </div>

        {/* Course ID with Regulation Pill Banner */}
        <div className="mt-3 pt-3 border-t border-rule flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-ink-soft/70 uppercase text-[10px]">Active Course:</span>
            <span className="px-2.5 py-0.5 rounded-md bg-paper border border-rule font-bold text-ink flex items-center gap-1.5">
              <span className="text-brass">ID: {activeSecInfo.courseId}</span>
              <span>·</span>
              <span className="text-success font-semibold">Reg: {activeSecInfo.regulation}</span>
              <span>·</span>
              <span className="text-ink-soft">{activeSecInfo.course}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span>Present: <span className="text-success font-bold">{currentPresentCount}</span></span>
            <span>Absent: <span className="text-danger font-bold">{currentAbsentCount}</span></span>
            <span>Total: <span className="text-brass font-bold">{sectionStudents.length}</span></span>
            <span>Rate: <span className={`font-bold ${(currentPresentCount / (sectionStudents.length || 1) * 100) >= 75 ? "text-success" : "text-danger"}`}>
              {((currentPresentCount / (sectionStudents.length || 1)) * 100).toFixed(0)}%
            </span></span>
          </div>
        </div>

        {/* Search Input */}
        <div className="mt-3 pt-2.5 border-t border-rule/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 w-full sm:w-80">
            <Search size={14} className="text-ink-soft shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or roll..."
              className="w-full bg-canvas/60 border border-rule/70 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brass transition-all font-mono"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-xs text-ink-soft hover:text-ink">✕</button>
            )}
          </div>

          {/* Status filter active indicator */}
          {statusFilter !== "all" && (
            <div className="px-3 py-1 rounded-lg bg-canvas border border-rule flex items-center gap-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${statusFilter === "present" ? "bg-success" : "bg-danger"}`} />
              <span>
                Filtering: <strong className={statusFilter === "present" ? "text-success" : "text-danger"}>
                  {statusFilter === "present" ? "Presentees Only" : "Absentees Only"}
                </strong> ({filteredStudents.length} students)
              </span>
              <button
                onClick={() => setStatusFilter("all")}
                className="text-[10px] text-brass hover:underline uppercase font-bold ml-1"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Submission Success Alert */}
      {submittedData && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-success/10 border-2 border-success/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-success shrink-0" />
            <div>
              <span className="font-bold text-success text-sm block">Attendance Successfully Submitted!</span>
              <span className="text-ink-soft mt-0.5 block">
                Course: <strong className="text-ink">{submittedData.courseId} ({submittedData.regulation})</strong> · Sec: {submittedData.section} · {submittedData.present} Presentees, {submittedData.absent} Absentees
              </span>
              <span className="text-[10px] text-ink-soft/70 block mt-1">Receipt ID: {submittedData.receiptId} · Submitted at {submittedData.timestamp}</span>
            </div>
          </div>
          <button
            onClick={() => setSubmittedData(null)}
            className="px-3 py-1 bg-success text-white rounded font-bold text-xs hover:bg-success/90 transition-all shrink-0"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Option: Submit Attendance Bar (Appears after ticking presentees) */}
      {currentPresentCount > 0 && !submittedData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 bg-brass/10 border-2 border-brass/50 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm"
        >
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="w-7 h-7 rounded-full bg-brass/25 border border-brass/50 text-brass flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-ink text-sm block">
                {currentPresentCount} Presentees Ticked ({currentAbsentCount} Absentees)
              </span>
              <span className="text-ink-soft text-[11px]">
                Ready for official submission to Examination Cell · Course ID: <strong className="text-brass">{activeSecInfo.courseId}</strong> (Reg: {activeSecInfo.regulation})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-ink text-brass border-2 border-brass hover:bg-brass hover:text-ink font-mono text-xs uppercase font-bold tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 shadow-ledger shrink-0"
          >
            <Send size={13} />
            <span>Submit Attendance</span>
          </button>
        </motion.div>
      )}

      {/* Attendance Students Table */}
      <Card className="overflow-hidden">
        <div className="max-h-[550px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-canvas/95 backdrop-blur z-10 border-b border-rule">
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 text-center w-16">
                  <div className="flex items-center justify-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPresent}
                      onChange={toggleAllCurrent}
                      title="Check / Uncheck all in current view"
                      className="w-4 h-4 rounded border-rule text-brass accent-brass focus:ring-brass cursor-pointer"
                    />
                  </div>
                </th>
                <th className="px-4 py-3">Roll No</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Subject & Course ID</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => {
                const isPresent = !!attendance[s.roll];
                const secInfo = FACULTY_SECTIONS.find(x => x.id === s.section);
                return (
                  <tr
                    key={s.roll}
                    onClick={() => toggle(s.roll)}
                    className={`border-b border-rule last:border-0 cursor-pointer transition-colors ${
                      isPresent ? "hover:bg-success/5" : "bg-danger/[0.03] hover:bg-danger/10"
                    }`}
                  >
                    {/* Checkbox item instead of toggle */}
                    <td className="px-5 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPresent}
                          onChange={() => toggle(s.roll)}
                          className="w-4 h-4 rounded border-rule text-brass accent-brass focus:ring-brass cursor-pointer transition-transform hover:scale-110"
                        />
                      </label>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-brass font-bold">{s.roll}</td>
                    <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-brass/15 text-brass border border-brass/30">
                        {s.section}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-soft">
                      <span>{s.subject}</span>
                      <span className="ml-2 font-mono text-[9px] text-ink-soft/70 font-semibold">
                        ({secInfo?.courseId || "AI501"} · {secInfo?.regulation || "R22"})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[10px] font-mono rounded-full px-2.5 py-0.5 uppercase font-bold inline-flex items-center gap-1 ${
                          isPresent ? "bg-success/15 text-success border border-success/30" : "bg-danger/15 text-danger border border-danger/30"
                        }`}
                      >
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ink-soft text-xs">
                    {statusFilter === "absent" ? (
                      <div>
                        <CheckCircle2 size={24} className="text-success mx-auto mb-2 opacity-80" />
                        <span className="font-semibold text-ink">No Absentees!</span>
                        <p className="text-ink-soft mt-1">All students in this section are currently marked present.</p>
                      </div>
                    ) : (
                      "No students match your filter or search query."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Submit Action Button */}
      <button
        onClick={() => setShowSubmitModal(true)}
        className="w-full py-3 bg-ink text-brass border-2 border-brass rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-brass hover:text-ink transition-all flex items-center justify-center gap-2 shadow-ledger font-bold"
      >
        <Send size={14} />
        <span>Submit Attendance ({currentPresentCount} Presentees · Course ID: {activeSecInfo.courseId} · Reg: {activeSecInfo.regulation})</span>
      </button>

      {/* Confirmation Submit Modal Dialog */}
      <AnimatePresence>
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-paper border-2 border-brass rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brass" />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brass/15 border border-brass flex items-center justify-center text-brass font-bold shrink-0">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">Submit Official Attendance</h3>
                  <span className="font-mono text-[10px] text-brass uppercase tracking-wider">
                    e-CAP Automated Academic Portal
                  </span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs border border-rule rounded-xl p-4 bg-canvas/40 mb-5">
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-ink-soft">Course ID & Code:</span>
                  <span className="font-bold text-brass">{activeSecInfo.courseId}</span>
                </div>
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-ink-soft">Curriculum Regulation:</span>
                  <span className="font-bold text-ink">{activeSecInfo.regulation} Regulation</span>
                </div>
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-ink-soft">Subject / Course:</span>
                  <span className="font-bold text-ink">{activeSecInfo.course}</span>
                </div>
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-ink-soft">Section & Year:</span>
                  <span className="font-bold text-ink">{activeSecInfo.name} ({activeSecInfo.year})</span>
                </div>
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-ink-soft">Date:</span>
                  <span className="font-bold text-ink">{selDate}</span>
                </div>
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-ink-soft">Total Students Enrolled:</span>
                  <span className="font-bold text-ink">{sectionStudents.length}</span>
                </div>
                <div className="flex justify-between border-b border-rule/50 pb-2">
                  <span className="text-success font-semibold">Ticked Presentees:</span>
                  <span className="font-bold text-success">{currentPresentCount} ({((currentPresentCount / (sectionStudents.length || 1)) * 100).toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-danger font-semibold">Absentees:</span>
                  <span className="font-bold text-danger">{currentAbsentCount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg border border-rule font-mono text-xs text-ink-soft hover:text-ink hover:border-brass transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg bg-ink text-brass border-2 border-brass font-mono text-xs uppercase font-bold hover:bg-brass hover:text-ink transition-all flex items-center justify-center gap-2 shadow"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>{isSubmitting ? "Submitting..." : "Confirm & Submit"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const FACULTY_COURSES_DATA = [
  { code: "23AI501", regulation: "R23", name: "Machine Learning",  section: "AIML-2", students: 50, credits: 4, year: "II B.Tech",  schedule: "Mon/Tue/Wed/Fri", status: "Active" },
  { code: "23DS602", regulation: "R23", name: "Deep Learning Lab", section: "CSDS-3", students: 50, credits: 2, year: "III B.Tech", schedule: "Mon/Wed/Thu/Fri", status: "Active" },
  { code: "23CS503", regulation: "R23", name: "Neural Networks",   section: "CSE-5",  students: 50, credits: 4, year: "III B.Tech", schedule: "Mon/Tue/Wed/Thu/Fri", status: "Active" },
];

function FacultyCoursesView() {
  const [activeSyllabus, setActiveSyllabus] = useState(null);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-4 mb-2">
        {[
          { label: "Courses Assigned", value: FACULTY_COURSES_DATA.length },
          { label: "Total Students",   value: FACULTY_COURSES_DATA.reduce((a,c) => a + c.students, 0) },
          { label: "Regulation",       value: "R23" },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center stat-box-interactive card-interactive">
            <span className="block font-mono text-[9px] uppercase text-ink-soft/70 tracking-wider mb-1 font-semibold">{s.label}</span>
            <span className="font-display text-2xl text-brass font-bold">{s.value}</span>
          </Card>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {FACULTY_COURSES_DATA.map((c, i) => (
          <motion.div key={c.code} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-5 border-l-4 border-l-brass h-full flex flex-col justify-between card-interactive hover:border-brass/60 group shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-[11px] text-brass font-bold">{c.code}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-brass/15 text-brass font-bold border border-brass/30">{c.regulation} Reg</span>
                  </div>
                  <span className="font-mono text-[9px] bg-success/15 text-success border border-success/30 rounded-full px-2.5 py-0.5 uppercase font-bold shadow-xs">{c.status}</span>
                </div>
                <h3 className="font-display text-xl mb-1 font-bold text-ink group-hover:text-brass transition-colors">{c.name}</h3>
                <div className="mb-3">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-brass/15 text-brass border border-brass/30">
                    Section {c.section}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-ink-soft font-mono border-t border-rule pt-3">
                  <div className="flex justify-between"><span className="text-ink-soft/70">Year:</span><span className="text-ink font-semibold">{c.year}</span></div>
                  <div className="flex justify-between"><span className="text-ink-soft/70">Schedule:</span><span className="text-ink font-semibold">{c.schedule}</span></div>
                  <div className="flex justify-between"><span className="text-ink-soft/70">Credits:</span><span className="text-brass font-bold">{c.credits}</span></div>
                  <div className="flex justify-between"><span className="text-ink-soft/70">Enrolled:</span><span className="text-ink font-bold">{c.students} students</span></div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setActiveSyllabus(COURSE_SYLLABUS[c.code] || null)}
                  className="w-full py-2.5 rounded-xl border border-brass text-xs font-mono text-brass hover:bg-brass hover:text-ink font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm btn-tactile"
                >
                  <BookOpen size={13} />
                  <span>View Syllabus</span>
                </motion.button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Syllabus Modal Dialog */}
      <AnimatePresence>
        {activeSyllabus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-paper border-2 border-brass rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brass" />

              {/* Header */}
              <div className="flex justify-between items-start mb-4 border-b border-rule pb-3">
                <div className="pr-4">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-brass font-bold px-2 py-0.5 rounded bg-brass/15 border border-brass/30">
                      {activeSyllabus.courseId}
                    </span>
                    <span className="font-mono text-[10px] text-success font-bold px-2 py-0.5 rounded bg-success/15 border border-success/30">
                      {activeSyllabus.regulation} Regulation
                    </span>
                    <span className="font-mono text-[10px] text-ink-soft px-2 py-0.5 rounded bg-canvas border border-rule">
                      {activeSyllabus.year} · {activeSyllabus.credits} Credits
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-ink">{activeSyllabus.name}</h2>
                  <span className="font-mono text-xs text-ink-soft block mt-0.5">
                    Department of {activeSyllabus.department}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSyllabus(null)}
                  className="w-8 h-8 rounded-full border border-rule hover:border-brass hover:text-brass flex items-center justify-center text-sm font-bold transition-all shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="overflow-y-auto pr-2 space-y-5 text-sm">
                {/* Course Overview */}
                <div className="bg-canvas/50 border border-rule rounded-xl p-4">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-brass tracking-wider mb-1">Course Description</h4>
                  <p className="text-ink text-xs leading-relaxed">{activeSyllabus.description}</p>
                </div>

                {/* Course Objectives */}
                <div>
                  <h4 className="font-display text-base font-bold text-ink mb-2 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-brass" /> Course Objectives
                  </h4>
                  <ul className="space-y-1.5 pl-2 text-xs text-ink">
                    {activeSyllabus.objectives?.map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-brass font-mono font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Units Syllabus */}
                <div>
                  <h4 className="font-display text-base font-bold text-ink mb-3 flex items-center gap-2">
                    <BookMarked size={15} className="text-brass" /> Unit-wise Detailed Curriculum (R23)
                  </h4>
                  <div className="space-y-3">
                    {activeSyllabus.units?.map((u, idx) => (
                      <div key={idx} className="border border-rule rounded-xl p-3.5 bg-paper hover:border-brass/50 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-[10px] font-bold text-brass uppercase px-2 py-0.5 rounded bg-brass/10 border border-brass/30">
                            {u.unit}
                          </span>
                          <span className="font-display text-sm font-semibold text-ink">{u.title}</span>
                        </div>
                        <p className="text-xs text-ink-soft leading-relaxed mt-2 pl-1 border-l-2 border-brass/30">
                          {u.topics}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Outcomes */}
                <div>
                  <h4 className="font-display text-base font-bold text-ink mb-2 flex items-center gap-2">
                    <GraduationCap size={15} className="text-brass" /> Course Outcomes (COs)
                  </h4>
                  <ul className="space-y-1.5 pl-2 text-xs text-ink">
                    {activeSyllabus.outcomes?.map((co, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-success font-mono font-bold font-mono">CO{idx + 1}:</span>
                        <span>{co}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Textbooks */}
                <div className="border-t border-rule pt-3">
                  <h4 className="font-mono text-[10px] uppercase font-bold text-ink-soft tracking-wider mb-2">Prescribed Textbooks & References</h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-ink-soft font-mono">
                    {activeSyllabus.textbooks?.map((tb, idx) => (
                      <li key={idx} className="text-ink">{tb}</li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-rule flex justify-between items-center gap-3">
                <span className="font-mono text-[10px] text-ink-soft">
                  QIS College of Engineering and Technology · Autonomous · R23 Academic Scheme
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSyllabus(null)}
                  className="px-5 py-2 bg-ink text-brass border border-brass rounded-lg font-mono text-xs uppercase font-bold hover:bg-brass hover:text-ink transition-all shadow-sm"
                >
                  Close Syllabus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const INITIAL_FACULTY_ASSIGNMENTS = [
  {
    id: 1,
    subject: "Machine Learning",
    section: "AIML-2",
    courseId: "23AI501",
    regulation: "R23",
    year: "II B.Tech",
    title: "SVM Classification & Hyperparameter Tuning on MNIST",
    deadline: "2026-09-22",
    status: "Active",
    maxMarks: 10,
    instructions: "Implement Linear and RBF kernel SVM on the MNIST handwritten digit dataset. Perform 5-fold cross-validation, plot hyperparameter curves, and output confusion matrix with classification report.",
  },
  {
    id: 2,
    subject: "Neural Networks",
    section: "CSE-5",
    courseId: "23CS503",
    regulation: "R23",
    year: "III B.Tech",
    title: "Backpropagation Algorithm from Scratch",
    deadline: "2026-09-20",
    status: "Active",
    maxMarks: 10,
    instructions: "Construct a 3-layer Feedforward Neural Network using pure NumPy without high-level ML frameworks. Derive and code backpropagation weight updates, gradient checking, and loss curves.",
  },
  {
    id: 3,
    subject: "Deep Learning Lab",
    section: "CSDS-3",
    courseId: "23DS602",
    regulation: "R23",
    year: "III B.Tech",
    title: "CNN Model for CIFAR-10 Image Classification",
    deadline: "2026-09-15",
    status: "Closed",
    maxMarks: 10,
    instructions: "Build and train a Convolutional Neural Network with Conv2D, MaxPooling, Batch Normalization, and Dropout layers. Achieve at least 80% test accuracy on CIFAR-10 test set.",
  },
  {
    id: 4,
    subject: "Machine Learning",
    section: "AIML-2",
    courseId: "23AI501",
    regulation: "R23",
    year: "II B.Tech",
    title: "Dimensionality Reduction with PCA & t-SNE",
    deadline: "2026-09-28",
    status: "Active",
    maxMarks: 10,
    instructions: "Implement Principal Component Analysis and t-SNE algorithms to reduce high-dimensional dataset (64 features) down to 2 components. Visualize cluster separations.",
  },
];

function seedInitialSubmissions() {
  const map = {};
  INITIAL_FACULTY_ASSIGNMENTS.forEach((assignment) => {
    const students = FACULTY_STUDENTS_LIST.filter((s) => s.section === assignment.section);
    map[assignment.id] = {};

    let completedCount = 42;
    if (assignment.id === 1) completedCount = 42;
    else if (assignment.id === 2) completedCount = 45;
    else if (assignment.id === 3) completedCount = 50;
    else if (assignment.id === 4) completedCount = 28;

    students.forEach((student, idx) => {
      const isCompleted = idx < completedCount;
      const day = 15 + (idx % 5);
      const hour = 10 + (idx % 8);
      const min = (idx * 7) % 60;
      const dateStr = `2026-09-${day < 10 ? "0" + day : day} ${hour < 10 ? "0" + hour : hour}:${min < 10 ? "0" + min : min}`;
      const marks = (8.2 + ((idx % 18) * 0.1)).toFixed(1);

      map[assignment.id][student.roll] = {
        completed: isCompleted,
        submittedAt: isCompleted ? dateStr : null,
        grade: isCompleted ? `${marks}/10` : "—",
        fileName: isCompleted ? `${student.roll}_${assignment.subject.replace(/\s+/g, "_")}.pdf` : null,
      };
    });
  });
  return map;
}

function FacultyAssignmentsView() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState(INITIAL_FACULTY_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState(seedInitialSubmissions);
  const [selectedId, setSelectedId] = useState(1);
  const [filter, setFilter] = useState("all"); // "all" | "completed" | "not_completed"
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success"); // "success" | "error" | "info"
  const [loading, setLoading] = useState(false);
  const [reminderSending, setReminderSending] = useState(false); // true while API call in flight

  // Form inputs
  const [title, setTitle] = useState("");
  const [subjectSection, setSubjectSection] = useState("Machine Learning|AIML-2|23AI501");
  const [deadline, setDeadline] = useState("");
  const [desc, setDesc] = useState("");

  const activeAssignment = assignments.find((a) => a.id === selectedId) || assignments[0];
  const assignedStudents = FACULTY_STUDENTS_LIST.filter((s) => s.section === activeAssignment.section);
  const currentSubmissions = submissions[activeAssignment.id] || {};

  const completedList = assignedStudents.filter((s) => currentSubmissions[s.roll]?.completed);
  const notCompletedList = assignedStudents.filter((s) => !currentSubmissions[s.roll]?.completed);

  const completedCount = completedList.length;
  const notCompletedCount = notCompletedList.length;
  const totalCount = assignedStudents.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered students according to filter mode & search query
  const displayedStudents = (
    filter === "completed"
      ? completedList
      : filter === "not_completed"
      ? notCompletedList
      : assignedStudents
  ).filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.toLowerCase().includes(search.toLowerCase())
  );

  function toggleStudentStatus(roll) {
    const isCurrentlyCompleted = currentSubmissions[roll]?.completed;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setSubmissions((prev) => ({
      ...prev,
      [activeAssignment.id]: {
        ...prev[activeAssignment.id],
        [roll]: {
          ...prev[activeAssignment.id]?.[roll],
          completed: !isCurrentlyCompleted,
          submittedAt: !isCurrentlyCompleted ? now : null,
          grade: !isCurrentlyCompleted ? "9.0/10" : "—",
        },
      },
    }));

    const student = assignedStudents.find((s) => s.roll === roll);
    setMsg(
      !isCurrentlyCompleted
        ? `Marked ${student?.name || roll} as Completed!`
        : `Marked ${student?.name || roll} as Not Completed.`
    );
    setTimeout(() => setMsg(""), 3000);
  }

  function showMsg(text, type = "success", duration = 5000) {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(""), duration);
  }

  async function handleSendReminder(studentName, roll, studentEmail) {
    if (reminderSending) return;
    setReminderSending(true);
    showMsg(`Sending reminder to ${studentName}…`, "info", 8000);
    try {
      const res = await client.post("/faculty/send-reminder", {
        assignment_title: activeAssignment.title,
        subject_name:     activeAssignment.subject,
        section:          activeAssignment.section,
        course_id:        activeAssignment.courseId,
        regulation:       activeAssignment.regulation,
        deadline:         activeAssignment.deadline,
        faculty_name:     user?.name || "Faculty",
        students: [{ name: studentName, email: studentEmail, roll }],
      });
      const { total_sent, total_failed, failed } = res.data;
      if (total_sent > 0) {
        showMsg(`✅ Reminder email sent successfully to ${studentName} (${roll})!`, "success");
      } else {
        const reason = failed?.[0]?.reason || "Unknown error";
        showMsg(`❌ Failed to send reminder to ${studentName}: ${reason}`, "error", 8000);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || err.message || "Network error";
      showMsg(`❌ Could not send reminder: ${detail}`, "error", 8000);
    } finally {
      setReminderSending(false);
    }
  }

  async function handleSendBroadcastReminders() {
    if (reminderSending) return;
    setReminderSending(true);
    const pending = notCompletedList;
    showMsg(`📨 Sending reminders to ${pending.length} students in ${activeAssignment.section}…`, "info", 30000);
    try {
      const res = await client.post("/faculty/send-reminder", {
        assignment_title: activeAssignment.title,
        subject_name:     activeAssignment.subject,
        section:          activeAssignment.section,
        course_id:        activeAssignment.courseId,
        regulation:       activeAssignment.regulation,
        deadline:         activeAssignment.deadline,
        faculty_name:     user?.name || "Faculty",
        students: pending.map((s) => ({ name: s.name, email: s.email, roll: s.roll })),
      });
      const { total_sent, total_failed } = res.data;
      if (total_sent === pending.length) {
        showMsg(`✅ Reminder emails sent to all ${total_sent} pending students in ${activeAssignment.section}!`, "success", 7000);
      } else if (total_sent > 0) {
        showMsg(`⚠ Sent ${total_sent}/${pending.length} reminders. ${total_failed} failed — check SMTP settings.`, "error", 8000);
      } else {
        showMsg(`❌ All ${total_failed} reminder emails failed. Check SMTP_USER and SMTP_PASSWORD in backend/.env.`, "error", 10000);
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.error || err.message || "Network error";
      showMsg(`❌ Could not send reminders: ${detail}`, "error", 8000);
    } finally {
      setReminderSending(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));

    const [subj, sec, cId] = subjectSection.split("|");
    const newId = Date.now();
    const newAssignment = {
      id: newId,
      subject: subj,
      section: sec,
      courseId: cId,
      regulation: "R23",
      year: sec === "AIML-2" ? "II B.Tech" : "III B.Tech",
      title,
      deadline,
      status: "Active",
      maxMarks: 10,
      instructions: desc,
    };

    const newStudents = FACULTY_STUDENTS_LIST.filter((s) => s.section === sec);
    const initialMap = {};
    newStudents.forEach((st) => {
      initialMap[st.roll] = {
        completed: false,
        submittedAt: null,
        grade: "—",
        fileName: null,
      };
    });

    setAssignments((prev) => [newAssignment, ...prev]);
    setSubmissions((prev) => ({ ...prev, [newId]: initialMap }));
    setSelectedId(newId);
    setFilter("all");
    setTitle("");
    setDeadline("");
    setDesc("");
    setLoading(false);
    setShowForm(false);
    setMsg(`Assignment created and broadcasted to 50 students in ${sec} under R23 Regulation!`);
    setTimeout(() => setMsg(""), 4000);
  }

  return (
    <div className="space-y-6">
      {/* Toast message – color changes by type: success=brass, error=red, info=blue */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 border text-xs rounded-lg font-mono flex items-center justify-between shadow-sm ${
              msgType === "error"
                ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                : msgType === "info"
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                : "bg-brass/10 border-brass/40 text-brass"
            }`}
          >
            <div className="flex items-center gap-2">
              {msgType === "error" ? (
                <XCircle size={14} className="text-rose-400 shrink-0" />
              ) : msgType === "info" ? (
                <Loader2 size={14} className="text-blue-400 shrink-0 animate-spin" />
              ) : (
                <CheckCircle2 size={14} className="text-brass shrink-0" />
              )}
              <span>{msg}</span>
            </div>
            <button
              onClick={() => setMsg("")}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-display text-xl font-semibold">Faculty Assigned Assignments</h3>
            <span className="px-2 py-0.5 rounded bg-brass/15 text-brass font-mono text-[10px] font-bold tracking-wider">
              R23 Regulation
            </span>
          </div>
          <p className="text-xs text-ink-soft mt-0.5">
            Select an assignment to monitor student completion status, view submissions, or send reminders.
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-brass border border-brass rounded-lg font-mono text-xs uppercase tracking-wider hover:bg-brass hover:text-ink transition-all shrink-0 shadow-sm"
        >
          <Plus size={13} /> Create Assignment
        </button>
      </div>

      {/* Create Assignment Modal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="p-6 border border-brass bg-paper-raised relative shadow-md">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brass rounded-l-lg" />
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-display text-lg font-semibold flex items-center gap-2">
                  <ClipboardCheck size={18} className="text-brass" /> Create Faculty Assignment (R23)
                </h4>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-ink-soft hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1 font-semibold">
                      Assigned Subject & Section (50 Students)
                    </label>
                    <select
                      value={subjectSection}
                      onChange={(e) => setSubjectSection(e.target.value)}
                      className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass font-mono text-xs"
                    >
                      <option value="Machine Learning|AIML-2|23AI501">
                        Machine Learning (AIML-2) — 23AI501 [R23]
                      </option>
                      <option value="Deep Learning Lab|CSDS-3|23DS602">
                        Deep Learning Lab (CSDS-3) — 23DS602 [R23]
                      </option>
                      <option value="Neural Networks|CSE-5|23CS503">
                        Neural Networks (CSE-5) — 23CS503 [R23]
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1 font-semibold">
                      Submission Deadline
                    </label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1 font-semibold">
                    Assignment Title
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g. Support Vector Classifier & Confusion Matrix Analysis"
                    className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-ink-soft mb-1 font-semibold">
                    Instructions & Deliverables
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe problem statement, format (Jupyter Notebook / PDF), rubric, and submission requirements..."
                    className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-ink text-brass border border-brass rounded-lg font-mono text-xs uppercase tracking-wide hover:bg-brass hover:text-ink disabled:opacity-40 transition-all flex items-center gap-2 font-bold shadow-sm"
                  >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}{" "}
                    Publish to Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-rule text-xs font-mono rounded-lg hover:border-danger/50 hover:text-danger transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment Selection Cards */}
      <div>
        <div className="flex justify-between items-center mb-2.5">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-soft font-semibold">
            Choose Assigned Subject Assignment
          </span>
          <span className="font-mono text-[11px] text-ink-soft">
            {assignments.length} assignments created
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {assignments.map((assignment) => {
            const isSelected = assignment.id === activeAssignment.id;
            const subMap = submissions[assignment.id] || {};
            const secStudents = FACULTY_STUDENTS_LIST.filter((s) => s.section === assignment.section);
            const doneCount = secStudents.filter((s) => subMap[s.roll]?.completed).length;
            const notDoneCount = secStudents.length - doneCount;
            const pct = secStudents.length > 0 ? Math.round((doneCount / secStudents.length) * 100) : 0;

            return (
              <motion.button
                key={assignment.id}
                whileHover={{ scale: 1.025, y: -3 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setSelectedId(assignment.id);
                  setSearch("");
                }}
                className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between card-interactive cursor-pointer ${
                  isSelected
                    ? "bg-brass/15 border-brass shadow-md glow-brass ring-1 ring-brass/40"
                    : "bg-paper-raised border-rule hover:border-brass/50 hover:bg-canvas/50 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-brass/15 text-brass font-mono text-[9px] font-bold border border-brass/30">
                      Sec {assignment.section}
                    </span>
                    <span className="font-mono text-[10px] text-ink-soft">
                      {assignment.courseId} ({assignment.regulation})
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs text-ink line-clamp-2 leading-snug mb-2 font-display">
                    {assignment.title}
                  </h4>
                </div>

                <div className="pt-2 border-t border-rule/50 mt-1">
                  <div className="flex justify-between items-center text-[10px] font-mono text-ink-soft mb-1">
                    <span className="text-emerald-500 font-bold">{doneCount} Done</span>
                    <span className="text-rose-500 font-bold">{notDoneCount} Pending</span>
                  </div>
                  <div className="w-full h-1.5 bg-canvas rounded-full overflow-hidden border border-rule/50 p-[0.5px]">
                    <div
                      className="h-full bg-brass rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-ink-soft/70 mt-1.5 font-semibold">
                    <span>Due {assignment.deadline}</span>
                    <span className="font-bold text-brass">{pct}%</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active Assignment Focus Detail & Statistics */}
      <Card className="p-5 border-brass/50 bg-paper-raised relative shadow-sm">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-brass rounded-l-lg" />
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-rule pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-brass/20 text-brass font-mono text-xs font-bold">
                {activeAssignment.section}
              </span>
              <span className="font-mono text-xs text-ink-soft">
                {activeAssignment.subject} · Course ID: <strong className="text-ink">{activeAssignment.courseId}</strong> ({activeAssignment.regulation} Regulation)
              </span>
              <span className={`text-[10px] font-mono rounded-full px-2 py-0.5 uppercase font-bold ${
                activeAssignment.status === "Active" ? "bg-emerald-500/15 text-emerald-400" : "bg-ink-soft/15 text-ink-soft"
              }`}>
                {activeAssignment.status}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">
              {activeAssignment.title}
            </h3>
            <p className="text-xs text-ink-soft mt-1 max-w-3xl leading-relaxed">
              {activeAssignment.instructions}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft block font-semibold">
              Submission Deadline
            </span>
            <span className="font-mono text-sm font-bold text-brass">
              {activeAssignment.deadline}
            </span>
          </div>
        </div>

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 bg-canvas rounded-2xl border border-rule stat-box-interactive card-interactive shadow-xs">
            <span className="block font-mono text-[10px] uppercase tracking-wider text-ink-soft font-semibold">
              Total Assigned Students
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-ink">{totalCount}</span>
              <span className="text-xs font-mono text-ink-soft font-medium">Section {activeAssignment.section}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 stat-box-interactive card-interactive shadow-xs">
            <div className="flex items-center justify-between">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                Completed Submissions
              </span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-emerald-400">{completedCount}</span>
              <span className="text-xs font-mono text-emerald-400/80 font-semibold">({completionPercentage}% completed)</span>
            </div>
          </div>

          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 stat-box-interactive card-interactive shadow-xs">
            <div className="flex items-center justify-between">
              <span className="block font-mono text-[10px] uppercase tracking-wider text-rose-400 font-bold">
                Not Completed (Pending)
              </span>
              <Clock size={16} className="text-rose-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-bold text-rose-400">{notCompletedCount}</span>
              <span className="text-xs font-mono text-rose-400/80 font-semibold">({100 - completionPercentage}% pending)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Complete / Not Complete / All buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-ink-soft mr-1 font-semibold">
              Filter List:
            </span>

            {/* Completed Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setFilter("completed")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border pill-interactive ${
                filter === "completed"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500 font-bold shadow-sm ring-1 ring-emerald-500/40"
                  : "bg-paper-raised text-ink-soft border-rule hover:border-emerald-500/40 hover:text-emerald-400"
              }`}
            >
              <CheckCircle2 size={14} className={filter === "completed" ? "text-emerald-400" : "text-emerald-500/70"} />
              <span>Completed ({completedCount})</span>
            </motion.button>

            {/* Not Completed Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setFilter("not_completed")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border pill-interactive ${
                filter === "not_completed"
                  ? "bg-rose-500/20 text-rose-400 border-rose-500 font-bold shadow-sm ring-1 ring-rose-500/40"
                  : "bg-paper-raised text-ink-soft border-rule hover:border-rose-500/40 hover:text-rose-400"
              }`}
            >
              <Clock size={14} className={filter === "not_completed" ? "text-rose-400" : "text-rose-500/70"} />
              <span>Not Completed ({notCompletedCount})</span>
            </motion.button>

            {/* All Students Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => setFilter("all")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all border pill-interactive ${
                filter === "all"
                  ? "bg-ink text-brass border-brass font-bold shadow-sm glow-brass"
                  : "bg-paper-raised text-ink-soft border-rule hover:border-brass/40 hover:text-ink"
              }`}
            >
              <Users size={14} />
            </motion.button>
          </div>

          {/* Broadcast Reminder Button if there are pending students */}
          {notCompletedCount > 0 && (
            <button
              type="button"
              onClick={handleSendBroadcastReminders}
              disabled={reminderSending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm disabled:opacity-50 disabled:cursor-wait"
            >
              {reminderSending
                ? <><Loader2 size={13} className="animate-spin" /> Sending Emails…</>
                : <><Bell size={13} /> Send Reminder to All ({notCompletedCount})</>
              }
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${filter === "completed" ? "completed" : filter === "not_completed" ? "not completed" : "assigned"} students by name or roll number...`}
            className="w-full bg-paper-raised border border-rule rounded-lg pl-9 pr-4 py-2 text-xs font-mono outline-none focus:border-brass"
          />
        </div>
      </div>

      {/* STUDENTS LIST TABLE */}
      <Card className="overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-rule bg-canvas/60 flex justify-between items-center text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">
              {filter === "completed" ? "Completed Students List" : filter === "not_completed" ? "Not Completed Students List" : "All Assigned Students List"}
            </span>
            <span className="text-ink-soft">
              (Showing {displayedStudents.length} of {assignedStudents.length} students)
            </span>
          </div>

          <span className="text-brass font-bold text-[11px]">
            Section: {activeAssignment.section} · {activeAssignment.subject}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-rule text-left font-mono text-xs uppercase tracking-wide text-ink-soft bg-canvas/40">
                <th className="px-5 py-3 w-12 text-center">#</th>
                <th className="px-5 py-3">Roll Number</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Subject & Section</th>
                <th className="px-5 py-3">Assignment Status</th>
                <th className="px-5 py-3">Submission Details</th>
                <th className="px-5 py-3">Marks / Grade</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-soft font-mono text-xs">
                    {search ? `No students found matching "${search}".` : `No students currently in the "${filter}" list.`}
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student, idx) => {
                  const sub = currentSubmissions[student.roll];
                  const isDone = sub?.completed;

                  return (
                    <motion.tr
                      key={student.roll}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                      className="border-b border-rule last:border-0 hover:bg-canvas/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-center font-mono text-xs text-ink-soft">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-brass">
                        {student.roll}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink">{student.name}</div>
                        <div className="text-[11px] font-mono text-ink-soft">
                          {student.year} · CGPA: {student.cgpa}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-xs text-ink-soft font-mono">
                        <span>{student.subject}</span>
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-brass/15 text-brass text-[10px] font-bold">
                          {student.section}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {isDone ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400" /> Completed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1.5">
                            <Clock size={12} className="text-rose-400" /> Not Completed
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">
                        {isDone ? (
                          <div>
                            <span className="text-ink font-semibold">{sub.submittedAt}</span>
                            {sub.fileName && (
                              <span className="block text-[10px] text-ink-soft/70 truncate max-w-[150px]">
                                {sub.fileName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-rose-400/80 italic">
                            Pending Submission (Due: {activeAssignment.deadline})
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-xs">
                        {isDone ? (
                          <span className="px-2 py-0.5 rounded bg-brass/15 text-brass font-bold">
                            {sub.grade}
                          </span>
                        ) : (
                          <span className="text-ink-soft/50">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDone ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSendReminder(student.name, student.roll, student.email)}
                                disabled={reminderSending}
                                title={`Send reminder email to ${student.email}`}
                                className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors font-mono text-[11px] flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait"
                              >
                                {reminderSending
                                  ? <Loader2 size={11} className="animate-spin" />
                                  : <Bell size={11} />} Reminder
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleStudentStatus(student.roll)}
                                title="Mark as Completed"
                                className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors font-mono text-[11px] flex items-center gap-1 font-bold"
                              >
                                <Check size={11} /> Mark Done
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => toggleStudentStatus(student.roll)}
                              title="Mark as Incomplete"
                              className="px-2.5 py-1 rounded border border-rule hover:border-danger/50 hover:text-danger text-ink-soft transition-colors font-mono text-[11px] flex items-center gap-1"
                            >
                              <X size={11} /> Revert
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FacultyStudentsView() {
  const [search, setSearch]             = useState("");
  const [filterSection, setFilterSection] = useState("All");
  const [filterSubject, setFilterSubject] = useState("All");

  const subjects = ["All", "Machine Learning", "Deep Learning Lab", "Neural Networks"];

  const filtered = FACULTY_STUDENTS_LIST.filter(s =>
    (filterSection === "All" || s.section === filterSection) &&
    (filterSubject === "All" || s.subject === filterSubject) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase()))
  );

  const lowAttendance = FACULTY_STUDENTS_LIST.filter(s => s.attendance < 75).length;
  const avgCgpa = (FACULTY_STUDENTS_LIST.reduce((a, s) => a + s.cgpa, 0) / FACULTY_STUDENTS_LIST.length).toFixed(2);

  return (
    <div className="space-y-5">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Assigned Students", value: `${FACULTY_STUDENTS_LIST.length}`, sub: "3 Sections", color: "text-brass" },
          { label: "AIML-2 (Machine Learning)", value: "50", sub: "II B.Tech", color: "text-brass" },
          { label: "CSDS-3 (Deep Learning Lab)", value: "50", sub: "III B.Tech", color: "text-success" },
          { label: "CSE-5 (Neural Networks)", value: "50", sub: "III B.Tech", color: "text-[#6366f1]" },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center stat-box-interactive card-interactive shadow-xs">
            <span className="block font-mono text-[9px] uppercase text-ink-soft/70 mb-1 truncate font-semibold">{s.label}</span>
            <span className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="block font-mono text-[9px] text-ink-soft/60 mt-0.5 font-semibold">{s.sub}</span>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center justify-between stat-box-interactive card-interactive shadow-xs">
          <span className="font-mono text-xs text-ink-soft font-semibold">Class Average CGPA</span>
          <span className="font-display text-2xl text-ink font-bold">{avgCgpa}</span>
        </Card>
        <Card className="p-4 flex items-center justify-between stat-box-interactive card-interactive shadow-xs">
          <span className="font-mono text-xs text-ink-soft font-semibold">Low Attendance Risk (&lt;75%)</span>
          <span className={`font-display text-2xl font-bold ${lowAttendance > 0 ? "text-danger" : "text-success"}`}>
            {lowAttendance} Students
          </span>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-3.5 text-ink-soft" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search 150 students by name or roll number..."
            className="w-full bg-paper border border-rule rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-brass transition-all font-mono"
          />
        </div>

        <select
          value={filterSection}
          onChange={e => setFilterSection(e.target.value)}
          className="bg-canvas border border-rule rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brass font-mono"
        >
          <option value="All">All Sections (150)</option>
          {FACULTY_SECTIONS.map(sec => (
            <option key={sec.id} value={sec.id}>
              Section {sec.name} ({sec.count})
            </option>
          ))}
        </select>

        <select
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          className="bg-canvas border border-rule rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brass font-mono"
        >
          {subjects.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Students Table */}
      <Card className="overflow-hidden shadow-sm">
        <div className="max-h-[550px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-canvas/95 backdrop-blur z-10 border-b border-rule">
              <tr className="text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Course / Subject</th>
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3 text-center">CGPA</th>
                <th className="px-5 py-3 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.roll}
                  className="border-b border-rule last:border-0 hover:bg-brass/5 row-interactive cursor-pointer transition-colors"
                >
                  <td className="px-5 py-3 font-mono text-xs text-brass font-bold">{s.roll}</td>
                  <td className="px-5 py-3 font-medium text-ink">{s.name}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-brass/15 text-brass border border-brass/30">
                      {s.section}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-ink-soft">{s.subject}</td>
                  <td className="px-5 py-3 text-xs text-ink-soft/70 font-mono">{s.year}</td>
                  <td className="px-5 py-3 text-center font-mono font-bold text-ink">{s.cgpa}</td>
                  <td className="px-5 py-3 text-center">
                    <span
                      className={`text-[10px] font-mono rounded-full px-2.5 py-0.5 font-bold shadow-xs ${
                        s.attendance >= 75 ? "bg-success/15 text-success border border-success/30" : "bg-danger/15 text-danger border border-danger/30"
                      }`}
                    >
                      {s.attendance}%
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-ink-soft text-xs">
                    No students found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="flex justify-between items-center text-xs font-mono text-ink-soft/60 px-1">
        <span>Showing {filtered.length} of {FACULTY_STUDENTS_LIST.length} assigned students</span>
        <span>Sections: AIML-2 (50) · CSDS-3 (50) · CSE-5 (50)</span>
      </div>
    </div>
  );
}

function FacultyGrievancesView({ rows }) {
  const mockGrievances = rows && rows.length > 0 ? rows : [
    { id: 1, subject: "Lab equipment not working",       description: "GPU workstations in Lab-A2 non-functional for 2 weeks, affecting practicals.", status: "Open",      submitted_at: "2026-09-05T10:00:00", student: "Ravi Kumar (RV2026AI102)",   resolution: null },
    { id: 2, subject: "Timetable clash – AI Ethics & ML",description: "AI Ethics (IV B.Tech) and Machine Learning (III B.Tech) overlap Thursday 10–11 AM.", status: "In Review", submitted_at: "2026-09-07T14:30:00", student: "Divya Sharma (RV2026AI103)", resolution: null },
    { id: 3, subject: "Assignment deadline conflict",    description: "Two major assignments due same day. Requesting staggered deadlines.", status: "Resolved",  submitted_at: "2026-09-01T09:00:00", student: "Kiran Nair (RV2026AI104)",    resolution: "Deadline for Neural Networks assignment extended by 3 days." },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open",      count: mockGrievances.filter(g => g.status === "Open").length,      color: "text-brass"    },
          { label: "In Review", count: mockGrievances.filter(g => g.status === "In Review").length,  color: "text-[#6366f1]" },
          { label: "Resolved",  count: mockGrievances.filter(g => g.status === "Resolved").length,  color: "text-success"  },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center stat-box-interactive card-interactive shadow-xs">
            <span className="block font-mono text-[9px] uppercase text-ink-soft/70 mb-1 font-semibold">{s.label}</span>
            <span className={`font-display text-2xl font-bold ${s.color}`}>{s.count}</span>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {mockGrievances.map((g, i) => (
          <motion.div key={g.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className={`p-5 border-l-4 card-interactive hover:border-brass/60 group shadow-xs ${
              g.status === "Open"      ? "border-l-brass" :
              g.status === "In Review" ? "border-l-[#6366f1]" : "border-l-success"
            }`}>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-base text-ink group-hover:text-brass transition-colors">{g.subject}</h4>
                <span className={`font-mono text-[9px] uppercase rounded-full px-2.5 py-0.5 font-bold shadow-xs ${
                  g.status === "Open"      ? "bg-brass/15 text-brass border border-brass/30" :
                  g.status === "In Review" ? "bg-[#6366f1]/15 text-[#6366f1] border border-[#6366f1]/30" :
                  "bg-success/15 text-success border border-success/30"
                }`}>{g.status}</span>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed mb-3">{g.description}</p>
              <div className="flex justify-between items-center text-[10px] font-mono text-ink-soft/60 border-t border-rule/35 pt-2">
                <span>From: <span className="text-ink-soft/90 font-semibold">{g.student}</span></span>
                <span>{g.submitted_at.substring(0,10)}</span>
              </div>
              {g.resolution && (
                <div className="mt-3 bg-canvas/60 border border-rule p-3 rounded-xl text-xs text-ink-soft">
                  <span className="font-mono font-bold text-brass">Resolution: </span>{g.resolution}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
