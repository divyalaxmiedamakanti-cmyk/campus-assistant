import { useCallback, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Library, HelpCircle, MessagesSquare, UploadCloud, Trash2, Plus,
  Wifi, WifiOff, Sun, Moon, LogOut, ScrollText, AlertTriangle,
  Building2, Pencil, Save, X, UserPlus, Phone, Mail, Briefcase, MapPin,
  GraduationCap, CreditCard, Percent, Megaphone, CalendarDays, Search,
  CheckCircle2, AlertCircle, Filter, RefreshCw, FileText, Clock, UserCheck,
  ChevronDown, ChevronUp, Download, Eye, DollarSign
} from "lucide-react";
import client from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";
import { sourceMeta, timeAgo } from "../utils/format.js";

const TABS = [
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "fees", label: "Fee Details", icon: CreditCard },
  { key: "attendance", label: "Attendance", icon: Percent },
  { key: "notices", label: "Notices", icon: Megaphone },
  { key: "timetable", label: "Timetable", icon: CalendarDays },
  { key: "faculty", label: "Faculty Info", icon: Building2 },
  { key: "analytics", label: "Analytics", icon: LayoutDashboard },
  { key: "knowledge", label: "Knowledge Base", icon: Library },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
  { key: "logs", label: "Chat Logs", icon: MessagesSquare },
];

export default function Admin() {
  const [tab, setTab] = useState("students");
  const [bulkDomain, setBulkDomain] = useState(null);
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-canvas text-ink font-body">
      <header className="sticky top-0 z-30 bg-[var(--ink)] text-[var(--paper)] border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-brass bg-white/10 p-0.5 flex items-center justify-center shrink-0 glow-brass shadow-md">
              <img src="/qis-logo.png" alt="QIS Logo" className="w-8 h-8 object-contain rounded-full" />
            </div>
            <div>
              <div className="font-display text-lg font-bold leading-tight flex items-center gap-2">
                QISCET Admin Portal
                <span className="text-[10px] font-mono bg-brass/20 text-brass border border-brass/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live Management
                </span>
              </div>
              <div className="font-mono text-[10px] text-[var(--paper)]/60 tracking-wider">
                AUTONOMOUS e-CAP SYSTEM · SECURE DATABASE ACCESS
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggle}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--paper)]/70 hover:text-brass transition-colors"
              title="Toggle theme"
            >
              {dark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-[var(--paper)]">{user?.name || "System Administrator"}</span>
              <span className="text-[10px] font-mono text-brass">{user?.email || "admin@qiscet.edu.in"}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white transition-all text-xs font-mono font-medium"
              title="Sign out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-none border-t border-white/5">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="relative flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-medium shrink-0 transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="adminTab"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-brass"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={16} className={active ? "text-brass" : "text-[var(--paper)]/50"} />
                <span className={active ? "text-[var(--paper)] font-bold" : "text-[var(--paper)]/70 hover:text-[var(--paper)]"}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "students" && <StudentsTab onBulkImport={() => setBulkDomain("students")} />}
            {tab === "fees" && <FeesTab onBulkImport={() => setBulkDomain("fees")} />}
            {tab === "attendance" && <AttendanceTab onBulkImport={() => setBulkDomain("attendance")} />}
            {tab === "notices" && <NoticesTab onBulkImport={() => setBulkDomain("notices")} />}
            {tab === "timetable" && <TimetableTab onBulkImport={() => setBulkDomain("timetable")} />}
            {tab === "faculty" && <FacultyTab onBulkImport={() => setBulkDomain("faculty")} />}
            {tab === "analytics" && <AnalyticsTab />}
            {tab === "knowledge" && <KnowledgeTab />}
            {tab === "faqs" && <FaqsTab onBulkImport={() => setBulkDomain("faqs")} />}
            {tab === "logs" && <LogsTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BulkImportModal
        isOpen={!!bulkDomain}
        domain={bulkDomain}
        onClose={() => setBulkDomain(null)}
      />
    </div>
  );
}

/* ================================================================== */
/* BULK CSV IMPORT TEMPLATES & MODAL                                   */
/* ================================================================== */
const BULK_TEMPLATES = {
  students: {
    title: "Students Bulk CSV Import",
    fields: "Student Name, Roll Number, Department, Year/Semester, Section, Email, Phone",
    sample: `Student Name,Roll Number,Department,Year/Semester,Section,Email,Phone
K. Rajesh,22MC1A0501,Computer Science & Engineering,3rd Year - 1st Sem,CSE-A,rajesh.k@qiscet.edu.in,9876543210
P. Anusha,22MC1A0502,Computer Science & Engineering,3rd Year - 1st Sem,CSE-A,anusha.p@qiscet.edu.in,9876543211
M. Sai Teja,22MC1A0401,Electronics & Communication Engineering,3rd Year - 1st Sem,ECE-A,saiteja.m@qiscet.edu.in,9876543212`,
  },
  fees: {
    title: "Fee Details Bulk CSV Import",
    fields: "Student Name, Roll Number, Fee Type, Total Fee, Paid Amount",
    sample: `Student Name,Roll Number,Fee Type,Total Fee,Paid Amount
K. Rajesh,22MC1A0501,Tuition Fee,85000,85000
P. Anusha,22MC1A0502,Tuition Fee,85000,50000
M. Sai Teja,22MC1A0401,Hostel & Mess Fee,65000,65000`,
  },
  attendance: {
    title: "Attendance Bulk CSV Import",
    fields: "Student Name, Roll Number, Subject, Attended Classes, Total Classes",
    sample: `Student Name,Roll Number,Subject,Attended Classes,Total Classes
K. Rajesh,22MC1A0501,Data Structures & Algorithms,42,48
P. Anusha,22MC1A0502,Operating Systems,38,45
M. Sai Teja,22MC1A0401,VLSI Design,44,48`,
  },
  notices: {
    title: "Notices Bulk CSV Import",
    fields: "Notice Title, Notice Description, Department, Category",
    sample: `Notice Title,Notice Description,Department,Category
Mid-1 Exam Time Table Released,The Mid-1 examinations for 3rd Year B.Tech students will start from October 15.,All Departments,Examinations
Annual Sports Meet Registration,Register your names with the Physical Education Department before Oct 10.,All Departments,Events
Campus Placement Drive by TCS,TCS CodeVita hiring drive for CSE & IT final year students on Oct 20.,Computer Science & Engineering,Placements`,
  },
  timetable: {
    title: "Timetable Bulk CSV Import",
    fields: "Day, Period, Subject, Faculty, Room Number, Section",
    sample: `Day,Period,Subject,Faculty,Room Number,Section
Monday,09:30 AM - 10:30 AM,Data Structures,Dr. R. Sharma,NB-302,CSE-A
Monday,10:30 AM - 11:30 AM,Operating Systems,Prof. V. Lakshmi,NB-302,CSE-A
Tuesday,02:00 PM - 04:00 PM,Database Systems Lab,Dr. M. K. Rao,CL-02,CSE-B`,
  },
  faculty: {
    title: "Faculty Information Bulk CSV Import",
    fields: "Faculty Name, Faculty ID, Department, Designation, Subject, Email, Phone, Room Number",
    sample: `Faculty Name,Faculty ID,Department,Designation,Subject,Email,Phone,Room Number
Dr. R. Sharma,FAC-CS-01,Computer Science & Engineering,Professor,Data Structures,sharma.r@qiscet.edu.in,9848012345,NB-301
Prof. V. Lakshmi,FAC-CS-02,Computer Science & Engineering,Associate Professor,Operating Systems,lakshmi.v@qiscet.edu.in,9848054321,NB-305
Dr. M. K. Rao,FAC-EC-01,Electronics & Communication Engineering,Professor,VLSI Design,rao.mk@qiscet.edu.in,9848099887,ECE-102`,
  },
  faqs: {
    title: "FAQs Knowledge Bulk CSV Import",
    fields: "Question, Answer, Category",
    sample: `Question,Answer,Category
What are the college library timings?,The central library is open from 8:00 AM to 8:00 PM on all working days.,academics
What is the process for fee payment?,Fee can be paid online via the SBI Collect portal or at the college accounts counter.,fees
How can I apply for college bus transport?,Submit the transport application along with 2 passport photos to the transport in-charge.,transport`,
  },
};

function BulkImportModal({ isOpen, domain, onClose }) {
  const [csvText, setCsvText] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [mode, setMode] = useState("file");

  useEffect(() => {
    if (isOpen) {
      setCsvText("");
      setFile(null);
      setStatus({ type: "", text: "" });
      setMode("file");
    }
  }, [isOpen]);

  if (!isOpen || !domain || !BULK_TEMPLATES[domain]) return null;

  const template = BULK_TEMPLATES[domain];

  function downloadSample() {
    const blob = new Blob([template.sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sample_${domain}_import.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleFileSelect(e) {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setStatus({ type: "info", text: `Selected file: ${selected.name} (${(selected.size / 1024).toFixed(1)} KB)` });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "info", text: "Processing batch dataset import..." });

    try {
      let res;
      if (mode === "file" && file) {
        const formData = new FormData();
        formData.append("file", file);
        res = await client.post(`/admin/bulk-import/${domain}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (csvText.trim()) {
        res = await client.post(`/admin/bulk-import/${domain}`, { csv_text: csvText });
      } else {
        setStatus({ type: "error", text: "Please select a CSV file or paste CSV text." });
        setLoading(false);
        return;
      }

      setStatus({
        type: "success",
        text: `✅ ${res.data.message || `Successfully imported ${res.data.inserted_count} records!`}`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setStatus({
        type: "error",
        text: `❌ Import failed: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-paper-raised border-2 border-brass/60 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 text-ink"
      >
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brass/15 border border-brass/40 flex items-center justify-center shrink-0">
              <UploadCloud size={18} className="text-brass" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold">{template.title}</h3>
              <p className="text-[11px] font-mono text-ink-soft">Centralized Batch Import Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-soft hover:bg-canvas hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Expected Fields Banner */}
        <div className="bg-canvas p-3 rounded-xl border border-rule space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono font-bold text-brass uppercase text-[10px] tracking-wider">Required Header Fields:</span>
            <button
              onClick={downloadSample}
              type="button"
              className="flex items-center gap-1 text-brass text-[11px] font-mono hover:underline"
            >
              <Download size={12} /> Download Sample CSV
            </button>
          </div>
          <p className="text-xs font-mono text-ink-soft break-words bg-paper/60 p-2 rounded border border-rule/50">
            {template.fields}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 border-b border-rule pb-2">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              mode === "file" ? "bg-brass text-ink font-bold" : "bg-canvas text-ink-soft hover:text-ink"
            }`}
          >
            📁 Upload CSV File
          </button>
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              mode === "paste" ? "bg-brass text-ink font-bold" : "bg-canvas text-ink-soft hover:text-ink"
            }`}
          >
            📋 Paste CSV Raw Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "file" ? (
            <div className="border-2 border-dashed border-brass/30 hover:border-brass rounded-xl p-6 text-center bg-canvas/50 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <UploadCloud size={28} className="text-brass" />
                <span className="text-xs font-mono text-ink font-semibold">
                  {file ? file.name : "Click to browse or drop file here"}
                </span>
                <span className="text-[10px] text-ink-soft font-mono">
                  Supports CSV (.csv) and Excel (.xlsx, .xls) files
                </span>
              </label>
            </div>
          ) : (
            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">
                Paste Raw CSV Data Below:
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder={template.sample}
                className="w-full bg-canvas border border-rule rounded-xl p-3 text-xs font-mono outline-none focus:border-brass transition-colors leading-relaxed"
              />
            </div>
          )}

          {status.text && (
            <div
              className={`text-xs font-mono p-3 rounded-lg border ${
                status.type === "success"
                  ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                  : status.type === "error"
                  ? "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                  : "bg-brass/10 text-brass-dark dark:text-brass border-brass/30"
              }`}
            >
              {status.text}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-rule">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono rounded-lg border border-rule hover:bg-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-brass text-ink hover:bg-brass/90 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              {loading ? "Importing Data..." : "Upload & Save to DB"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ================================================================== */
/* CONFIRMATION MODAL                                                  */
/* ================================================================== */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-ink/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-paper-raised border-2 border-brass/60 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3 text-danger">
          <div className="w-10 h-10 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-danger" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-ink">{title || "Confirm Action"}</h3>
            <p className="text-xs text-ink-soft">Database modification warning</p>
          </div>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed">{message}</p>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-rule">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 text-xs font-mono rounded-lg border border-rule hover:bg-canvas transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-mono font-bold rounded-lg bg-danger text-white hover:bg-red-700 transition-colors flex items-center gap-1.5"
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ================================================================== */
/* BATCH ACTION BAR                                                   */
/* ================================================================== */
function BatchActionBar({ selectedCount, totalCount, onSelectAll, onClearAll, onDeleteSelected, loading }) {
  if (selectedCount === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="bg-brass/15 border border-brass/40 rounded-xl p-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono mb-3"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brass animate-pulse" />
        <span className="font-bold text-ink">
          {selectedCount} of {totalCount} record{totalCount === 1 ? "" : "s"} selected
        </span>
      </div>
      <div className="flex items-center gap-2">
        {selectedCount < totalCount ? (
          <button
            type="button"
            onClick={onSelectAll}
            className="px-2.5 py-1 rounded-lg bg-canvas border border-rule hover:border-brass text-ink transition-colors text-[11px]"
          >
            Select All ({totalCount})
          </button>
        ) : (
          <button
            type="button"
            onClick={onClearAll}
            className="px-2.5 py-1 rounded-lg bg-canvas border border-rule hover:border-brass text-ink transition-colors text-[11px]"
          >
            Deselect All
          </button>
        )}
        <button
          type="button"
          disabled={loading}
          onClick={onDeleteSelected}
          className="px-3 py-1 rounded-lg bg-danger text-white hover:bg-red-700 transition-colors flex items-center gap-1.5 font-bold shadow-xs text-[11px]"
        >
          <Trash2 size={12} />
          {loading ? "Deleting..." : `Delete Selected (${selectedCount})`}
        </button>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/* 1. STUDENTS TAB                                                     */
/* ================================================================== */
const EMPTY_STUDENT = {
  name: "",
  roll_number: "",
  department: "Computer Science & Engineering",
  year_semester: "3rd Year - 1st Sem",
  section: "CSE-A",
  email: "",
  phone: "",
};

function StudentsTab({ onBulkImport }) {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(EMPTY_STUDENT);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(
    () => client.get("/admin/students").then((r) => setStudents(r.data)).catch(() => setStudents([])),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  function startEdit(st) {
    setEditId(st.id);
    setForm({
      name: st.name || "",
      roll_number: st.roll_number || "",
      department: st.department || "Computer Science & Engineering",
      year_semester: st.year_semester || "3rd Year - 1st Sem",
      section: st.section || "CSE-A",
      email: st.email || "",
      phone: st.phone || "",
    });
    setMsg({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_STUDENT);
    setMsg({ type: "", text: "" });
  }

  async function save(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.roll_number.trim() || !form.department.trim()) {
      setMsg({ type: "error", text: "Please fill in all mandatory fields." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (editId === null) {
        await client.post("/admin/students", form);
        setMsg({ type: "success", text: "✅ Student profile created & saved to database!" });
      } else {
        await client.put(`/admin/students/${editId}`, form);
        setMsg({ type: "success", text: "✅ Student profile updated successfully!" });
      }
      setForm(EMPTY_STUDENT);
      setEditId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + (err.response?.data?.error || "Failed to save student.") });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/students/${deleteTarget.id}`);
      setMsg({ type: "success", text: `Deleted student ${deleteTarget.name} (${deleteTarget.roll_number})` });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Delete failed: " + (err.response?.data?.error || err.message) });
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await client.post("/admin/bulk-delete/students", { ids: bulkDeleteTarget });
      setMsg({ type: "success", text: `✅ ${res.data.message || `Deleted ${bulkDeleteTarget.length} students`}` });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Bulk delete failed: " + (err.response?.data?.error || err.message) });
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.roll_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.section || "").toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === "ALL" || s.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [students, search, deptFilter]);

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((s) => s.id));
    }
  }

  const fieldCls = "w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-colors";

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={students.length} delay={0} />
        <StatCard
          label="CSE & AIML Dept"
          value={students.filter((s) => (s.department || "").includes("Computer") || (s.department || "").includes("AI")).length}
          delay={0.05}
        />
        <StatCard
          label="Active Sections"
          value={new Set(students.map((s) => s.section)).size || 1}
          delay={0.1}
        />
        <StatCard
          label="e-CAP Status"
          value="Live Sync"
          delay={0.15}
        />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.7fr] gap-6 items-start">
        {/* Left: Add / Edit Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              {editId === null ? (
                <>
                  <UserPlus size={18} className="text-brass" /> Add Student Information
                </>
              ) : (
                <>
                  <Pencil size={18} className="text-brass" /> Edit Student Details
                </>
              )}
            </h3>
            {editId !== null && (
              <Badge variant="brass">Editing #{editId}</Badge>
            )}
          </div>
          <p className="text-xs text-ink-soft mb-4">
            {editId === null
              ? "Add a student to the central database. Information syncs directly to the student dashboard."
              : "Update student particulars. Saved changes reflect immediately."}
          </p>

          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Student Full Name *</label>
              <input
                id="std-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Asha Rao"
                className={fieldCls}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Roll Number *</label>
                <input
                  id="std-roll"
                  value={form.roll_number}
                  onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value.toUpperCase() }))}
                  placeholder="e.g. 24491A4225"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Section *</label>
                <input
                  id="std-sec"
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CSE-A"
                  className={fieldCls}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Department / Branch *</label>
              <select
                id="std-dept"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className={fieldCls}
                required
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Management Studies">Management Studies (MBA)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Year / Semester *</label>
              <select
                id="std-year"
                value={form.year_semester}
                onChange={(e) => setForm((f) => ({ ...f, year_semester: e.target.value }))}
                className={fieldCls}
                required
              >
                <option value="1st Year - 1st Sem">1st Year - 1st Sem</option>
                <option value="1st Year - 2nd Sem">1st Year - 2nd Sem</option>
                <option value="2nd Year - 1st Sem">2nd Year - 1st Sem</option>
                <option value="2nd Year - 2nd Sem">2nd Year - 2nd Sem</option>
                <option value="3rd Year - 1st Sem">3rd Year - 1st Sem</option>
                <option value="3rd Year - 2nd Sem">3rd Year - 2nd Sem</option>
                <option value="4th Year - 1st Sem">4th Year - 1st Sem</option>
                <option value="4th Year - 2nd Sem">4th Year - 2nd Sem</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Email (Optional)</label>
                <input
                  id="std-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. asha@qiscet.edu.in"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Phone (Optional)</label>
                <input
                  id="std-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 98480 12345"
                  className={fieldCls}
                />
              </div>
            </div>

            {msg.text && (
              <div
                className={`text-xs font-mono p-3 rounded-lg border ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50 font-mono font-bold"
              >
                <Save size={15} />
                {saving ? "Saving to DB..." : editId === null ? "Add Student Record" : "Save Changes"}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-rule rounded-lg text-sm hover:border-danger hover:text-danger transition-colors font-mono"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Live List + Filter Bar */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-2.5 text-ink-soft" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, roll, section..."
                  className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-rule rounded-lg text-xs outline-none focus:border-brass font-mono"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-ink-soft" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-canvas border border-rule rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brass font-mono"
                >
                  <option value="ALL">All Departments</option>
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Artificial Intelligence & Data Science">AI & DS</option>
                  <option value="Electronics & Communication">ECE</option>
                  <option value="Management Studies">MBA</option>
                </select>
                <button
                  onClick={refresh}
                  title="Refresh data from DB"
                  className="p-1.5 border border-rule rounded-lg hover:border-brass hover:text-brass text-ink-soft transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                {onBulkImport && (
                  <button
                    type="button"
                    onClick={onBulkImport}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-lg transition-colors shrink-0"
                    title="Bulk import CSV spreadsheet"
                  >
                    <UploadCloud size={14} /> Bulk CSV
                  </button>
                )}
              </div>
            </div>
          </Card>

          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onSelectAll={() => setSelectedIds(filtered.map((s) => s.id))}
            onClearAll={() => setSelectedIds([])}
            onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
            loading={bulkDeleting}
          />

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rule bg-canvas/60 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                    <th className="px-3 py-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={toggleSelectAll}
                        className="rounded accent-brass cursor-pointer"
                        title="Select/Deselect All"
                      />
                    </th>
                    <th className="px-3 py-3">Student Name</th>
                    <th className="px-3 py-3">Roll Number</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Year/Sem</th>
                    <th className="px-3 py-3">Section</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filtered.map((st) => {
                    const isSelected = selectedIds.includes(st.id);
                    return (
                      <motion.tr
                        key={st.id}
                        className={`hover:bg-brass/5 transition-colors ${
                          isSelected ? "bg-brass/10" : editId === st.id ? "bg-brass/10 font-medium" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(st.id)}
                            className="rounded accent-brass cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3 font-semibold text-ink">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-brass/15 border border-brass/30 flex items-center justify-center font-display text-xs text-brass font-bold">
                              {st.name?.charAt(0) || "S"}
                            </div>
                            <div>
                              <div>{st.name}</div>
                              {st.email && <div className="text-[10px] text-ink-soft font-mono font-normal">{st.email}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono font-bold text-brass">{st.roll_number}</td>
                        <td className="px-3 py-3 text-ink-soft truncate max-w-[150px]">{st.department}</td>
                        <td className="px-3 py-3 font-mono">{st.year_semester}</td>
                        <td className="px-3 py-3">
                          <span className="font-mono text-[10px] bg-paper-raised border border-rule px-2 py-0.5 rounded font-bold">
                            {st.section}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(st)}
                              title="Edit student"
                              className="p-1.5 rounded-lg border border-rule hover:border-brass hover:text-brass text-ink-soft transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(st)}
                              title="Delete student"
                              className="p-1.5 rounded-lg border border-rule hover:border-danger hover:text-danger text-ink-soft transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Student Record"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}" (Roll: ${deleteTarget?.roll_number}) from the database? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Students"
        message={`Are you sure you want to permanently delete ${bulkDeleteTarget?.length || 0} selected student records from the database?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 2. FEE DETAILS TAB                                                 */
/* ================================================================== */
const EMPTY_FEE = {
  student_name: "",
  roll_number: "",
  fee_type: "Tuition Fee",
  total_fee: "",
  paid_amount: "",
  pending_amount: "",
  status: "Unpaid",
  due_date: "2026-10-15",
};

function FeesTab({ onBulkImport }) {
  const [fees, setFees] = useState([]);
  const [form, setForm] = useState(EMPTY_FEE);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(
    () => client.get("/admin/fees").then((r) => setFees(r.data)).catch(() => setFees([])),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  // Auto calculate pending amount and status on input change
  function handleTotalOrPaidChange(field, val) {
    const next = { ...form, [field]: val };
    const total = parseFloat(next.total_fee) || 0;
    const paid = parseFloat(next.paid_amount) || 0;
    const pending = Math.max(0, total - paid);
    next.pending_amount = pending;

    if (total > 0 && paid >= total) {
      next.status = "Paid";
    } else if (paid > 0) {
      next.status = "Partially Paid";
    } else {
      next.status = "Unpaid";
    }
    setForm(next);
  }

  function startEdit(f) {
    setEditId(f.id);
    const total = f.total_fee || f.amount_due || 0;
    const paid = f.paid_amount || f.amount_paid || 0;
    const pending = f.pending_amount !== undefined ? f.pending_amount : Math.max(0, total - paid);
    setForm({
      student_name: f.student_name || "Asha Rao",
      roll_number: f.roll_number || "24491A4225",
      fee_type: f.fee_type || "Tuition Fee",
      total_fee: total,
      paid_amount: paid,
      pending_amount: pending,
      status: f.status || "Unpaid",
      due_date: f.due_date || "2026-10-15",
    });
    setMsg({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FEE);
    setMsg({ type: "", text: "" });
  }

  async function save(e) {
    e.preventDefault();
    if (!form.student_name.trim() || !form.roll_number.trim() || !form.fee_type.trim()) {
      setMsg({ type: "error", text: "Please enter Student Name, Roll Number, and Fee Type." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (editId === null) {
        await client.post("/admin/fees", form);
        setMsg({ type: "success", text: "✅ Fee ledger entry added to database!" });
      } else {
        await client.put(`/admin/fees/${editId}`, form);
        setMsg({ type: "success", text: "✅ Fee details updated successfully!" });
      }
      setForm(EMPTY_FEE);
      setEditId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + (err.response?.data?.error || "Save failed.") });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/fees/${deleteTarget.id}`);
      setMsg({ type: "success", text: `Deleted fee entry #${deleteTarget.id}` });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Delete failed: " + (err.response?.data?.error || err.message) });
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await client.post("/admin/bulk-delete/fees", { ids: bulkDeleteTarget });
      setMsg({ type: "success", text: `✅ ${res.data.message || `Deleted ${bulkDeleteTarget.length} fee records`}` });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Bulk delete failed: " + (err.response?.data?.error || err.message) });
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  const totalFeeSum = fees.reduce((sum, f) => sum + (f.total_fee || f.amount_due || 0), 0);
  const paidFeeSum = fees.reduce((sum, f) => sum + (f.paid_amount || f.amount_paid || 0), 0);
  const pendingFeeSum = Math.max(0, totalFeeSum - paidFeeSum);

  const filtered = useMemo(() => {
    return fees.filter((f) => {
      const matchSearch =
        (f.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.roll_number || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.fee_type || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || f.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [fees, search, statusFilter]);

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((f) => f.id));
    }
  }

  const fieldCls = "w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-colors font-mono";

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Invoiced" value={`₹${totalFeeSum.toLocaleString()}`} delay={0} />
        <StatCard label="Total Collected" value={`₹${paidFeeSum.toLocaleString()}`} delay={0.05} />
        <StatCard label="Outstanding Dues" value={`₹${pendingFeeSum.toLocaleString()}`} delay={0.1} />
        <StatCard label="Total Fee Records" value={fees.length} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.7fr] gap-6 items-start">
        {/* Left: Add / Edit Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              {editId === null ? (
                <>
                  <DollarSign size={18} className="text-brass" /> Create Fee Record
                </>
              ) : (
                <>
                  <Pencil size={18} className="text-brass" /> Edit Fee Record #{editId}
                </>
              )}
            </h3>
            {editId !== null && <Badge variant="brass">Modifying</Badge>}
          </div>
          <p className="text-xs text-ink-soft mb-4">
            Manage tuition, examination, hostel, transport and library fees for students.
          </p>

          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Student Name *</label>
                <input
                  id="fee-name"
                  value={form.student_name}
                  onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                  placeholder="e.g. Asha Rao"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Roll Number *</label>
                <input
                  id="fee-roll"
                  value={form.roll_number}
                  onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value.toUpperCase() }))}
                  placeholder="e.g. 24491A4225"
                  className={fieldCls}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Fee Type *</label>
              <select
                id="fee-type"
                value={form.fee_type}
                onChange={(e) => setForm((f) => ({ ...f, fee_type: e.target.value }))}
                className={fieldCls}
                required
              >
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Examination Fee">Examination Fee</option>
                <option value="Hostel Fee">Hostel Fee</option>
                <option value="Transport Fee">Transport Fee</option>
                <option value="Library & Lab Fee">Library & Lab Fee</option>
                <option value="Special Autonomous Fee">Special Autonomous Fee</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Total Fee (₹) *</label>
                <input
                  id="fee-total"
                  type="number"
                  min="0"
                  step="100"
                  value={form.total_fee}
                  onChange={(e) => handleTotalOrPaidChange("total_fee", e.target.value)}
                  placeholder="45000"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Paid Amount (₹)</label>
                <input
                  id="fee-paid"
                  type="number"
                  min="0"
                  step="100"
                  value={form.paid_amount}
                  onChange={(e) => handleTotalOrPaidChange("paid_amount", e.target.value)}
                  placeholder="0"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Pending (₹)</label>
                <input
                  id="fee-pending"
                  type="number"
                  readOnly
                  value={form.pending_amount}
                  className={`${fieldCls} bg-paper-raised text-brass font-bold`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Payment Status *</label>
                <select
                  id="fee-status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className={fieldCls}
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Due Date</label>
                <input
                  id="fee-duedate"
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  className={fieldCls}
                />
              </div>
            </div>

            {msg.text && (
              <div
                className={`text-xs font-mono p-3 rounded-lg border ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50 font-mono font-bold"
              >
                <Save size={15} />
                {saving ? "Updating Database..." : editId === null ? "Add Fee Entry" : "Save Fee Record"}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-rule rounded-lg text-sm hover:border-danger hover:text-danger transition-colors font-mono"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Table + Search */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3 top-2.5 text-ink-soft" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fee by student, roll, type..."
                  className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-rule rounded-lg text-xs outline-none focus:border-brass font-mono"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-ink-soft" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-canvas border border-rule rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brass font-mono"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                <button
                  onClick={refresh}
                  title="Refresh fees"
                  className="p-1.5 border border-rule rounded-lg hover:border-brass hover:text-brass text-ink-soft transition-colors"
                >
                  <RefreshCw size={14} />
                </button>
                {onBulkImport && (
                  <button
                    type="button"
                    onClick={onBulkImport}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-lg transition-colors shrink-0"
                    title="Bulk import CSV spreadsheet"
                  >
                    <UploadCloud size={14} /> Bulk CSV
                  </button>
                )}
              </div>
            </div>
          </Card>

          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onSelectAll={() => setSelectedIds(filtered.map((f) => f.id))}
            onClearAll={() => setSelectedIds([])}
            onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
            loading={bulkDeleting}
          />

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rule bg-canvas/60 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                    <th className="px-3 py-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={toggleSelectAll}
                        className="rounded accent-brass cursor-pointer"
                        title="Select/Deselect All"
                      />
                    </th>
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Fee Particular</th>
                    <th className="px-3 py-3">Total</th>
                    <th className="px-3 py-3">Paid</th>
                    <th className="px-3 py-3">Pending</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filtered.map((f) => {
                    const total = f.total_fee || f.amount_due || 0;
                    const paid = f.paid_amount || f.amount_paid || 0;
                    const pending = f.pending_amount !== undefined ? f.pending_amount : Math.max(0, total - paid);
                    const isSelected = selectedIds.includes(f.id);
                    return (
                      <motion.tr
                        key={f.id}
                        className={`hover:bg-brass/5 transition-colors ${
                          isSelected ? "bg-brass/10" : editId === f.id ? "bg-brass/10 font-medium" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(f.id)}
                            className="rounded accent-brass cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-ink">{f.student_name || "Asha Rao"}</div>
                          <div className="text-[10px] font-mono text-brass font-bold">{f.roll_number || "24491A4225"}</div>
                        </td>
                        <td className="px-3 py-3 font-medium text-ink">{f.fee_type}</td>
                        <td className="px-3 py-3 font-mono">₹{total.toLocaleString()}</td>
                        <td className="px-3 py-3 font-mono text-success font-semibold">₹{paid.toLocaleString()}</td>
                        <td className="px-3 py-3 font-mono text-brass font-bold">₹{pending.toLocaleString()}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              f.status === "Paid"
                                ? "bg-success/15 text-success border border-success/30"
                                : f.status === "Partially Paid"
                                ? "bg-brass/15 text-brass border border-brass/30"
                                : "bg-danger/15 text-danger border border-danger/30"
                            }`}
                          >
                            {f.status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(f)}
                              title="Edit fee"
                              className="p-1.5 rounded-lg border border-rule hover:border-brass hover:text-brass text-ink-soft transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(f)}
                              title="Delete fee"
                              className="p-1.5 rounded-lg border border-rule hover:border-danger hover:text-danger text-ink-soft transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-ink-soft">
                        No fee records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Fee Record"
        message={`Are you sure you want to delete this ${deleteTarget?.fee_type} record of ₹${(deleteTarget?.total_fee || deleteTarget?.amount_due || 0).toLocaleString()}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Fee Records"
        message={`Are you sure you want to delete ${bulkDeleteTarget?.length || 0} selected fee records from the database?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 3. ATTENDANCE TAB                                                  */
/* ================================================================== */
const EMPTY_ATT = {
  student_name: "Asha Rao",
  roll_number: "24491A4225",
  subject: "",
  total_classes: "45",
  attended_classes: "40",
  percentage: "88.9",
};

function AttendanceTab({ onBulkImport }) {
  const [attendance, setAttendance] = useState([]);
  const [form, setForm] = useState(EMPTY_ATT);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(
    () => client.get("/admin/attendance").then((r) => setAttendance(r.data)).catch(() => setAttendance([])),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  function handleClassesChange(field, val) {
    const next = { ...form, [field]: val };
    const total = parseInt(next.total_classes, 10) || 0;
    const attended = parseInt(next.attended_classes, 10) || 0;
    const pct = total > 0 ? ((attended / total) * 100).toFixed(1) : "0.0";
    next.percentage = pct;
    setForm(next);
  }

  function startEdit(att) {
    setEditId(att.id);
    setForm({
      student_name: att.student_name || "Asha Rao",
      roll_number: att.roll_number || "24491A4225",
      subject: att.subject || "",
      total_classes: String(att.total_classes || 0),
      attended_classes: String(att.attended_classes || 0),
      percentage: String(att.percentage || 0),
    });
    setMsg({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_ATT);
    setMsg({ type: "", text: "" });
  }

  async function save(e) {
    e.preventDefault();
    if (!form.subject.trim()) {
      setMsg({ type: "error", text: "Subject name is required." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (editId === null) {
        await client.post("/admin/attendance", form);
        setMsg({ type: "success", text: "✅ Attendance record saved to database!" });
      } else {
        await client.put(`/admin/attendance/${editId}`, form);
        setMsg({ type: "success", text: "✅ Attendance updated successfully!" });
      }
      setForm(EMPTY_ATT);
      setEditId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + (err.response?.data?.error || "Save failed.") });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/attendance/${deleteTarget.id}`);
      setMsg({ type: "success", text: `Deleted attendance for ${deleteTarget.subject}` });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Delete failed: " + (err.response?.data?.error || err.message) });
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await client.post("/admin/bulk-delete/attendance", { ids: bulkDeleteTarget });
      setMsg({ type: "success", text: `✅ ${res.data.message || `Deleted ${bulkDeleteTarget.length} attendance records`}` });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Bulk delete failed: " + (err.response?.data?.error || err.message) });
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  const totalClassesSum = attendance.reduce((s, a) => s + (a.total_classes || 0), 0);
  const attendedClassesSum = attendance.reduce((s, a) => s + (a.attended_classes || 0), 0);
  const aggregatePct = totalClassesSum > 0 ? ((attendedClassesSum / totalClassesSum) * 100).toFixed(1) : "0.0";

  const filtered = useMemo(() => {
    return attendance.filter((a) => {
      return (
        (a.subject || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.roll_number || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [attendance, search]);

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((a) => a.id));
    }
  }

  const fieldCls = "w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-colors font-mono";

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Aggregate Attendance" value={`${aggregatePct}%`} delay={0} />
        <StatCard label="Total Class Hours" value={totalClassesSum} delay={0.05} />
        <StatCard label="Attended Hours" value={attendedClassesSum} delay={0.1} />
        <StatCard label="Subject Records" value={attendance.length} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.7fr] gap-6 items-start">
        {/* Left: Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              {editId === null ? (
                <>
                  <UserCheck size={18} className="text-brass" /> Log Subject Attendance
                </>
              ) : (
                <>
                  <Pencil size={18} className="text-brass" /> Edit Attendance #{editId}
                </>
              )}
            </h3>
            {editId !== null && <Badge variant="brass">Modifying</Badge>}
          </div>
          <p className="text-xs text-ink-soft mb-4">
            Record class hours and attendance percentage for autonomous curriculum subjects.
          </p>

          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Student Name</label>
                <input
                  id="att-name"
                  value={form.student_name}
                  onChange={(e) => setForm((f) => ({ ...f, student_name: e.target.value }))}
                  placeholder="e.g. Asha Rao"
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Roll Number</label>
                <input
                  id="att-roll"
                  value={form.roll_number}
                  onChange={(e) => setForm((f) => ({ ...f, roll_number: e.target.value.toUpperCase() }))}
                  placeholder="e.g. 24491A4225"
                  className={fieldCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Subject Name *</label>
              <input
                id="att-subj"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Machine Learning"
                className={fieldCls}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Total Classes *</label>
                <input
                  id="att-total"
                  type="number"
                  min="1"
                  value={form.total_classes}
                  onChange={(e) => handleClassesChange("total_classes", e.target.value)}
                  placeholder="45"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Attended *</label>
                <input
                  id="att-attended"
                  type="number"
                  min="0"
                  value={form.attended_classes}
                  onChange={(e) => handleClassesChange("attended_classes", e.target.value)}
                  placeholder="40"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Calculated %</label>
                <input
                  id="att-pct"
                  type="text"
                  readOnly
                  value={`${form.percentage}%`}
                  className={`${fieldCls} bg-paper-raised ${
                    parseFloat(form.percentage) >= 75 ? "text-success font-bold" : "text-danger font-bold"
                  }`}
                />
              </div>
            </div>

            {msg.text && (
              <div
                className={`text-xs font-mono p-3 rounded-lg border ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50 font-mono font-bold"
              >
                <Save size={15} />
                {saving ? "Saving..." : editId === null ? "Add Attendance Record" : "Save Attendance"}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-rule rounded-lg text-sm hover:border-danger hover:text-danger transition-colors font-mono"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Table */}
        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-ink-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject or student..."
                className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-rule rounded-lg text-xs outline-none focus:border-brass font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                title="Refresh attendance"
                className="p-1.5 border border-rule rounded-lg hover:border-brass hover:text-brass text-ink-soft transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              {onBulkImport && (
                <button
                  type="button"
                  onClick={onBulkImport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-lg transition-colors shrink-0"
                  title="Bulk import CSV spreadsheet"
                >
                  <UploadCloud size={14} /> Bulk CSV
                </button>
              )}
            </div>
          </Card>

          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onSelectAll={() => setSelectedIds(filtered.map((a) => a.id))}
            onClearAll={() => setSelectedIds([])}
            onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
            loading={bulkDeleting}
          />

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-rule bg-canvas/60 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
                    <th className="px-3 py-3 w-8 text-center">
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={toggleSelectAll}
                        className="rounded accent-brass cursor-pointer"
                        title="Select/Deselect All"
                      />
                    </th>
                    <th className="px-3 py-3">Subject Name</th>
                    <th className="px-3 py-3">Student / Roll</th>
                    <th className="px-3 py-3">Attended / Total</th>
                    <th className="px-3 py-3">Percentage</th>
                    <th className="px-3 py-3">Eligibility</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {filtered.map((att) => {
                    const pct = att.percentage || (att.total_classes > 0 ? ((att.attended_classes / att.total_classes) * 100).toFixed(1) : 0);
                    const eligible = parseFloat(pct) >= 75;
                    const isSelected = selectedIds.includes(att.id);
                    return (
                      <motion.tr
                        key={att.id}
                        className={`hover:bg-brass/5 transition-colors ${
                          isSelected ? "bg-brass/10" : editId === att.id ? "bg-brass/10 font-medium" : ""
                        }`}
                      >
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(att.id)}
                            className="rounded accent-brass cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-3 font-semibold text-ink">{att.subject}</td>
                        <td className="px-3 py-3">
                          <div className="font-mono text-ink">{att.student_name || "Asha Rao"}</div>
                          <div className="font-mono text-[10px] text-brass font-bold">{att.roll_number || "24491A4225"}</div>
                        </td>
                        <td className="px-3 py-3 font-mono">
                          <span className="text-ink font-semibold">{att.attended_classes}</span> / {att.total_classes}
                        </td>
                        <td className="px-3 py-3 font-mono font-bold">
                          <span className={eligible ? "text-success" : "text-danger"}>{pct}%</span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              eligible
                                ? "bg-success/15 text-success border border-success/30"
                                : "bg-danger/15 text-danger border border-danger/30"
                            }`}
                          >
                            {eligible ? "Eligible" : "Shortage"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => startEdit(att)}
                              title="Edit attendance"
                              className="p-1.5 rounded-lg border border-rule hover:border-brass hover:text-brass text-ink-soft transition-colors"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(att)}
                              title="Delete attendance"
                              className="p-1.5 rounded-lg border border-rule hover:border-danger hover:text-danger text-ink-soft transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Attendance Record"
        message={`Are you sure you want to delete the attendance entry for "${deleteTarget?.subject}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Attendance Records"
        message={`Are you sure you want to delete ${bulkDeleteTarget?.length || 0} selected attendance records from the database?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 4. NOTICES TAB                                                     */
/* ================================================================== */
const EMPTY_NOTICE = {
  title: "",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  department: "All Departments",
  category: "General",
  posted_by: "Administration Office",
  attachment: "",
};

function NoticesTab({ onBulkImport }) {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(EMPTY_NOTICE);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(
    () => client.get("/admin/notices").then((r) => setNotices(r.data)).catch(() => setNotices([])),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  function startEdit(n) {
    setEditId(n.id);
    setForm({
      title: n.title || "",
      content: n.content || "",
      date: n.date || (n.created_at ? n.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10)),
      department: n.department || "All Departments",
      category: n.category || "General",
      posted_by: n.posted_by || "Administration Office",
      attachment: n.attachment || "",
    });
    setMsg({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_NOTICE);
    setMsg({ type: "", text: "" });
  }

  async function save(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setMsg({ type: "error", text: "Notice Title and Description are required." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (editId === null) {
        await client.post("/admin/notices", form);
        setMsg({ type: "success", text: "✅ Notice published to e-CAP Student Portal!" });
      } else {
        await client.put(`/admin/notices/${editId}`, form);
        setMsg({ type: "success", text: "✅ Notice updated successfully!" });
      }
      setForm(EMPTY_NOTICE);
      setEditId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + (err.response?.data?.error || "Publish failed.") });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/notices/${deleteTarget.id}`);
      setMsg({ type: "success", text: `Notice "${deleteTarget.title}" deleted.` });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Delete failed: " + (err.response?.data?.error || err.message) });
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await client.post("/admin/bulk-delete/notices", { ids: bulkDeleteTarget });
      setMsg({ type: "success", text: `✅ ${res.data.message || `Deleted ${bulkDeleteTarget.length} notices`}` });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Bulk delete failed: " + (err.response?.data?.error || err.message) });
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    return notices.filter((n) => {
      const matchSearch =
        (n.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (n.content || "").toLowerCase().includes(search.toLowerCase()) ||
        (n.department || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "ALL" || n.category === catFilter;
      return matchSearch && matchCat;
    });
  }, [notices, search, catFilter]);

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((n) => n.id));
    }
  }

  const fieldCls = "w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-colors";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Published Notices" value={notices.length} delay={0} />
        <StatCard label="Exam Circulars" value={notices.filter((n) => n.category === "Exams").length} delay={0.05} />
        <StatCard label="Fee Circulars" value={notices.filter((n) => n.category === "Fees").length} delay={0.1} />
        <StatCard label="Broadcast Scope" value="Campus-Wide" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.7fr] gap-6 items-start">
        {/* Left: Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              {editId === null ? (
                <>
                  <Megaphone size={18} className="text-brass" /> Broadcast New Notice
                </>
              ) : (
                <>
                  <Pencil size={18} className="text-brass" /> Edit Circular #{editId}
                </>
              )}
            </h3>
            {editId !== null && <Badge variant="brass">Editing</Badge>}
          </div>
          <p className="text-xs text-ink-soft mb-4">
            Broadcast official notices to students, faculty, and examination desks.
          </p>

          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Notice Title *</label>
              <input
                id="notice-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Mid-Semester Examinations Schedule (R23)"
                className={fieldCls}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Category *</label>
                <select
                  id="notice-cat"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className={fieldCls}
                  required
                >
                  <option value="General">General</option>
                  <option value="Exams">Exams</option>
                  <option value="Fees">Fees</option>
                  <option value="Placements">Placements</option>
                  <option value="Events">Events</option>
                  <option value="Scholarships">Scholarships</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Target Department</label>
                <select
                  id="notice-dept"
                  value={form.department}
                  onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                  className={fieldCls}
                >
                  <option value="All Departments">All Departments</option>
                  <option value="Examination Cell">Examination Cell</option>
                  <option value="Finance & Accounts">Finance & Accounts</option>
                  <option value="Computer Science & Engineering">CSE Department</option>
                  <option value="Student Affairs">Student Affairs</option>
                  <option value="T&P Cell">T&P Cell</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Notice Date</label>
                <input
                  id="notice-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Posted By</label>
                <input
                  id="notice-postedby"
                  value={form.posted_by}
                  onChange={(e) => setForm((f) => ({ ...f, posted_by: e.target.value }))}
                  placeholder="e.g. Principal's Secretariat"
                  className={fieldCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Notice Description *</label>
              <textarea
                id="notice-desc"
                rows={4}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Write full circular details and instructions for students..."
                className={fieldCls}
                required
              />
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Attachment (Optional File / URL)</label>
              <input
                id="notice-attach"
                value={form.attachment}
                onChange={(e) => setForm((f) => ({ ...f, attachment: e.target.value }))}
                placeholder="e.g. mid_sem_timetable_r23.pdf"
                className={fieldCls}
              />
            </div>

            {msg.text && (
              <div
                className={`text-xs font-mono p-3 rounded-lg border ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50 font-mono font-bold"
              >
                <Save size={15} />
                {saving ? "Publishing..." : editId === null ? "Publish to Notice Board" : "Save Changes"}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-rule rounded-lg text-sm hover:border-danger hover:text-danger transition-colors font-mono"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Notices Cards List */}
        <div className="space-y-4">
          <Card className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-ink-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notices..."
                className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-rule rounded-lg text-xs outline-none focus:border-brass font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="bg-canvas border border-rule rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-brass font-mono"
              >
                <option value="ALL">All Categories</option>
                <option value="Exams">Exams</option>
                <option value="Fees">Fees</option>
                <option value="Events">Events</option>
                <option value="Placements">Placements</option>
                <option value="General">General</option>
              </select>
              <button
                onClick={refresh}
                title="Refresh notices"
                className="p-1.5 border border-rule rounded-lg hover:border-brass hover:text-brass text-ink-soft transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              {onBulkImport && (
                <button
                  type="button"
                  onClick={onBulkImport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-lg transition-colors shrink-0"
                  title="Bulk import CSV spreadsheet"
                >
                  <UploadCloud size={14} /> Bulk CSV
                </button>
              )}
            </div>
          </Card>

          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onSelectAll={() => setSelectedIds(filtered.map((n) => n.id))}
            onClearAll={() => setSelectedIds([])}
            onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
            loading={bulkDeleting}
          />

          <div className="space-y-3">
            {filtered.map((n) => {
              const isSelected = selectedIds.includes(n.id);
              return (
                <motion.div
                  key={n.id}
                  layout
                  className={`p-5 rounded-xl border bg-paper-raised transition-all relative ${
                    isSelected ? "border-brass bg-brass/10" : editId === n.id ? "border-brass bg-brass/5" : "border-rule hover:border-brass/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(n.id)}
                        className="rounded accent-brass cursor-pointer shrink-0"
                      />
                      <h4 className="font-display text-base font-bold text-ink flex items-center gap-2">
                        <Megaphone size={16} className="text-brass shrink-0" />
                        {n.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] uppercase font-bold bg-brass/15 text-brass border border-brass/30 px-2 py-0.5 rounded">
                        {n.category || "General"}
                      </span>
                      <span className="font-mono text-[10px] text-ink-soft bg-canvas border border-rule px-2 py-0.5 rounded">
                        {n.date || (n.created_at ? n.created_at.slice(0, 10) : "Today")}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-ink-soft leading-relaxed mb-3">{n.content}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-rule/60 text-[11px] font-mono text-ink-soft">
                    <div className="flex items-center gap-3">
                      <span>Dept: <strong className="text-ink">{n.department || "All"}</strong></span>
                      <span>By: <strong className="text-ink">{n.posted_by || "Admin"}</strong></span>
                      {n.attachment && (
                        <span className="text-brass flex items-center gap-1">
                          <FileText size={11} /> {n.attachment}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEdit(n)}
                        className="px-2.5 py-1 rounded-lg border border-rule hover:border-brass hover:text-brass text-ink-soft transition-colors flex items-center gap-1 text-xs"
                      >
                        <Pencil size={11} /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(n)}
                        className="px-2.5 py-1 rounded-lg border border-rule hover:border-danger hover:text-danger text-ink-soft transition-colors flex items-center gap-1 text-xs"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-ink-soft text-sm">
                No notices found.
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Notice"
        message={`Are you sure you want to delete notice "${deleteTarget?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Notices"
        message={`Are you sure you want to permanently delete ${bulkDeleteTarget?.length || 0} selected notices?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 5. TIMETABLE TAB                                                   */
/* ================================================================== */
const EMPTY_TT = {
  day: "Monday",
  period: "Period 1 (09:00 - 10:00 AM)",
  subject: "",
  faculty: "Dr. Vara Prasad",
  room: "LH-201",
  section: "CSE-A",
  department: "Computer Science & Engineering",
  year_semester: "3rd Year - 1st Sem",
  subject_type: "Theory",
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function TimetableTab({ onBulkImport }) {
  const [timetable, setTimetable] = useState([]);
  const [form, setForm] = useState(EMPTY_TT);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(
    () => client.get("/admin/timetable").then((r) => setTimetable(r.data)).catch(() => setTimetable([])),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  function startEdit(tt) {
    setEditId(tt.id);
    setForm({
      day: tt.day || tt.day_of_week || "Monday",
      period: tt.period || tt.period_time || "Period 1 (09:00 - 10:00 AM)",
      subject: tt.subject || "",
      faculty: tt.faculty || "",
      room: tt.room || "LH-201",
      section: tt.section || "CSE-A",
      department: tt.department || tt.branch || "Computer Science & Engineering",
      year_semester: tt.year_semester || tt.year || "3rd Year - 1st Sem",
      subject_type: tt.subject_type || "Theory",
    });
    setMsg({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_TT);
    setMsg({ type: "", text: "" });
  }

  async function save(e) {
    e.preventDefault();
    if (!form.day || !form.period || !form.subject.trim() || !form.faculty.trim() || !form.room.trim() || !form.section.trim()) {
      setMsg({ type: "error", text: "Please fill in all timetable details." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (editId === null) {
        await client.post("/admin/timetable", form);
        setMsg({ type: "success", text: "✅ Timetable slot added successfully!" });
      } else {
        await client.put(`/admin/timetable/${editId}`, form);
        setMsg({ type: "success", text: "✅ Timetable slot updated successfully!" });
      }
      setForm(EMPTY_TT);
      setEditId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + (err.response?.data?.error || "Save failed.") });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/timetable/${deleteTarget.id}`);
      setMsg({ type: "success", text: `Deleted timetable slot for ${deleteTarget.subject}` });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Delete failed: " + (err.response?.data?.error || err.message) });
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await client.post("/admin/bulk-delete/timetable", { ids: bulkDeleteTarget });
      setMsg({ type: "success", text: `✅ ${res.data.message || `Deleted ${bulkDeleteTarget.length} timetable slots`}` });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Bulk delete failed: " + (err.response?.data?.error || err.message) });
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((tt) => tt.id));
    }
  }

  const filtered = useMemo(() => {
    return timetable.filter((tt) => (tt.day || tt.day_of_week) === selectedDay);
  }, [timetable, selectedDay]);

  const fieldCls = "w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-colors";

  return (
    <div className="space-y-6">
      {/* Day Selector Pill Tabs & Bulk Import */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedDay === d
                  ? "bg-ink text-brass border border-brass shadow-md glow-brass"
                  : "bg-paper-raised border border-rule text-ink-soft hover:text-ink"
              }`}
            >
              {d} ({timetable.filter((t) => (t.day || t.day_of_week) === d).length})
            </button>
          ))}
        </div>
        {onBulkImport && (
          <button
            type="button"
            onClick={onBulkImport}
            className="flex items-center gap-1.5 px-3 py-2 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-xl transition-colors shrink-0"
            title="Bulk import Timetable CSV"
          >
            <UploadCloud size={14} /> Bulk CSV
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.7fr] gap-6 items-start">
        {/* Left: Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              {editId === null ? (
                <>
                  <CalendarDays size={18} className="text-brass" /> Schedule Class Slot
                </>
              ) : (
                <>
                  <Pencil size={18} className="text-brass" /> Edit Schedule Slot #{editId}
                </>
              )}
            </h3>
            {editId !== null && <Badge variant="brass">Editing</Badge>}
          </div>
          <p className="text-xs text-ink-soft mb-4">
            Assign class periods, faculty instructors, lecture halls, and sections.
          </p>

          <form onSubmit={save} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Day *</label>
                <select
                  id="tt-day"
                  value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                  className={fieldCls}
                  required
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Period / Timing *</label>
                <select
                  id="tt-period"
                  value={form.period}
                  onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                  className={fieldCls}
                  required
                >
                  <option value="Period 1 (09:00 - 10:00 AM)">Period 1 (09:00 - 10:00 AM)</option>
                  <option value="Period 2 (10:00 - 11:00 AM)">Period 2 (10:00 - 11:00 AM)</option>
                  <option value="Period 3 (11:15 AM - 12:15 PM)">Period 3 (11:15 AM - 12:15 PM)</option>
                  <option value="Period 3 (11:15 AM - 01:15 PM)">Period 3 Lab (11:15 AM - 01:15 PM)</option>
                  <option value="Period 4 (01:15 - 02:15 PM)">Period 4 (01:15 - 02:15 PM)</option>
                  <option value="Period 5 (02:15 - 03:15 PM)">Period 5 (02:15 - 03:15 PM)</option>
                  <option value="Period 6 (03:15 - 04:15 PM)">Period 6 (03:15 - 04:15 PM)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Subject Name *</label>
              <input
                id="tt-subject"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Machine Learning"
                className={fieldCls}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Faculty In-charge *</label>
                <input
                  id="tt-faculty"
                  value={form.faculty}
                  onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value }))}
                  placeholder="e.g. Dr. Vara Prasad"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Room Number *</label>
                <input
                  id="tt-room"
                  value={form.room}
                  onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                  placeholder="e.g. LH-201 or Lab 3"
                  className={fieldCls}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Section *</label>
                <input
                  id="tt-section"
                  value={form.section}
                  onChange={(e) => setForm((f) => ({ ...f, section: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CSE-A"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Type</label>
                <select
                  id="tt-type"
                  value={form.subject_type}
                  onChange={(e) => setForm((f) => ({ ...f, subject_type: e.target.value }))}
                  className={fieldCls}
                >
                  <option value="Theory">Theory</option>
                  <option value="Lab">Lab / Practical</option>
                  <option value="Online Class">Online Class</option>
                </select>
              </div>
            </div>

            {msg.text && (
              <div
                className={`text-xs font-mono p-3 rounded-lg border ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50 font-mono font-bold"
              >
                <Save size={15} />
                {saving ? "Scheduling..." : editId === null ? "Add Class Slot" : "Save Slot Changes"}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-rule rounded-lg text-sm hover:border-danger hover:text-danger transition-colors font-mono"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Day Timetable Slots */}
        <div className="space-y-3">
          <Card className="p-4 flex items-center justify-between">
            <h4 className="font-display text-base font-bold text-ink flex items-center gap-2">
              <CalendarDays size={18} className="text-brass" />
              Schedule for {selectedDay}
            </h4>
            <span className="text-xs font-mono text-brass font-bold bg-brass/15 px-2.5 py-1 rounded-full border border-brass/30">
              {filtered.length} slots assigned
            </span>
          </Card>

          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onSelectAll={() => setSelectedIds(filtered.map((tt) => tt.id))}
            onClearAll={() => setSelectedIds([])}
            onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
            loading={bulkDeleting}
          />

          {filtered.map((tt) => {
            const isSelected = selectedIds.includes(tt.id);
            return (
              <motion.div
                key={tt.id}
                layout
                className={`p-4 rounded-xl border bg-paper-raised flex items-center justify-between gap-4 transition-all ${
                  isSelected ? "border-brass bg-brass/10" : editId === tt.id ? "border-brass bg-brass/5" : "border-rule hover:border-brass/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(tt.id)}
                    className="rounded accent-brass cursor-pointer shrink-0"
                  />
                  <div className="w-10 h-10 rounded-xl bg-ink text-brass border border-brass/30 flex flex-col items-center justify-center shrink-0 font-mono">
                    <span className="text-[9px] uppercase">Period</span>
                    <span className="text-sm font-bold leading-none">{tt.period_no || "1"}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-ink text-sm truncate">{tt.subject}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-canvas border border-rule text-ink-soft">
                        {tt.subject_type || "Theory"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-soft mt-0.5">
                      <span>Faculty: <strong className="text-ink">{tt.faculty}</strong></span>
                      <span>Room: <strong className="text-brass">{tt.room}</strong></span>
                      <span>Sec: <strong className="text-ink">{tt.section}</strong></span>
                      <span className="text-[10px] text-ink-soft/70">({tt.period || tt.period_time})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => startEdit(tt)}
                    title="Edit slot"
                    className="p-1.5 rounded-lg border border-rule hover:border-brass hover:text-brass text-ink-soft transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(tt)}
                    title="Delete slot"
                    className="p-1.5 rounded-lg border border-rule hover:border-danger hover:text-danger text-ink-soft transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <Card className="p-8 text-center text-ink-soft text-sm">
              No timetable slots scheduled for {selectedDay}. Add one using the form.
            </Card>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Timetable Slot"
        message={`Delete schedule slot for "${deleteTarget?.subject}" on ${deleteTarget?.day || deleteTarget?.day_of_week}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Timetable Slots"
        message={`Are you sure you want to delete ${bulkDeleteTarget?.length || 0} selected timetable slots?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 6. FACULTY INFORMATION TAB                                         */
/* ================================================================== */
const EMPTY_FAC = {
  faculty_name: "",
  faculty_id: "",
  department: "Computer Science & Engineering",
  designation: "Professor",
  subject: "",
  email: "",
  phone: "",
  office_room: "",
};

function FacultyTab({ onBulkImport }) {
  const [faculty, setFaculty] = useState([]);
  const [form, setForm] = useState(EMPTY_FAC);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(
    () => client.get("/admin/faculty").then((r) => setFaculty(r.data)).catch(() => setFaculty([])),
    []
  );
  useEffect(() => { refresh(); }, [refresh]);

  function startEdit(f) {
    setEditId(f.id);
    setForm({
      faculty_name: f.faculty_name || f.name || "",
      faculty_id: f.faculty_id || `FAC-CSE-${f.id}`,
      department: f.department || "Computer Science & Engineering",
      designation: f.designation || "Professor",
      subject: f.subject || "",
      email: f.email || "",
      phone: f.phone || "",
      office_room: f.office_room || f.room || "",
    });
    setMsg({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FAC);
    setMsg({ type: "", text: "" });
  }

  async function save(e) {
    e.preventDefault();
    if (!form.faculty_name.trim() || !form.faculty_id.trim() || !form.department.trim() || !form.email.trim()) {
      setMsg({ type: "error", text: "Faculty Name, ID, Department, and Email are required." });
      return;
    }
    setSaving(true);
    setMsg({ type: "", text: "" });
    try {
      if (editId === null) {
        await client.post("/admin/faculty", form);
        setMsg({ type: "success", text: "✅ Faculty profile added to database!" });
      } else {
        await client.put(`/admin/faculty/${editId}`, form);
        setMsg({ type: "success", text: "✅ Faculty profile updated successfully!" });
      }
      setForm(EMPTY_FAC);
      setEditId(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "❌ " + (err.response?.data?.error || "Save failed.") });
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/faculty/${deleteTarget.id}`);
      setMsg({ type: "success", text: `Deleted faculty ${deleteTarget.faculty_name || deleteTarget.name}` });
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Delete failed: " + (err.response?.data?.error || err.message) });
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await client.post("/admin/bulk-delete/faculty", { ids: bulkDeleteTarget });
      setMsg({ type: "success", text: `✅ ${res.data.message || `Deleted ${bulkDeleteTarget.length} faculty records`}` });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      setMsg({ type: "error", text: "Bulk delete failed: " + (err.response?.data?.error || err.message) });
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((f) => f.id));
    }
  }

  const filtered = useMemo(() => {
    return faculty.filter((f) => {
      const name = f.faculty_name || f.name || "";
      const id = f.faculty_id || "";
      const dept = f.department || "";
      const subj = f.subject || "";
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase()) ||
        dept.toLowerCase().includes(search.toLowerCase()) ||
        subj.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [faculty, search]);

  const fieldCls = "w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass transition-colors";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Faculty" value={faculty.length} delay={0} />
        <StatCard
          label="Professors & HODs"
          value={faculty.filter((f) => (f.designation || "").includes("Professor") || (f.designation || "").includes("HOD") || (f.designation || "").includes("Head")).length}
          delay={0.05}
        />
        <StatCard label="CSE Faculty" value={faculty.filter((f) => (f.department || "").includes("Computer")).length} delay={0.1} />
        <StatCard label="Directory Sync" value="Synchronized" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-[1.1fr_1.7fr] gap-6 items-start">
        {/* Left: Form */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              {editId === null ? (
                <>
                  <UserPlus size={18} className="text-brass" /> Register Faculty Member
                </>
              ) : (
                <>
                  <Pencil size={18} className="text-brass" /> Edit Faculty #{editId}
                </>
              )}
            </h3>
            {editId !== null && <Badge variant="brass">Modifying</Badge>}
          </div>
          <p className="text-xs text-ink-soft mb-4">
            Manage academic professors, HODs, deans, and teaching staff details.
          </p>

          <form onSubmit={save} className="space-y-3">
            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Faculty Full Name *</label>
              <input
                id="fac-name"
                value={form.faculty_name}
                onChange={(e) => setForm((f) => ({ ...f, faculty_name: e.target.value }))}
                placeholder="e.g. Dr. Vara Prasad"
                className={fieldCls}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Faculty ID *</label>
                <input
                  id="fac-id"
                  value={form.faculty_id}
                  onChange={(e) => setForm((f) => ({ ...f, faculty_id: e.target.value.toUpperCase() }))}
                  placeholder="e.g. FAC-CSE-001"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Designation *</label>
                <input
                  id="fac-desig"
                  value={form.designation}
                  onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="e.g. Head of Department (HOD)"
                  className={fieldCls}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Department *</label>
              <select
                id="fac-dept"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                className={fieldCls}
                required
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Humanities & Sciences">Humanities & Sciences</option>
                <option value="Administration">Administration & Governance</option>
                <option value="Student Affairs">Student Affairs</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Specialization / Subject</label>
              <input
                id="fac-subj"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder="e.g. Machine Learning / Deep Learning"
                className={fieldCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Email *</label>
                <input
                  id="fac-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. vara.prasad@qiscet.edu.in"
                  className={fieldCls}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Phone Number</label>
                <input
                  id="fac-phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 90000 22222"
                  className={fieldCls}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-ink-soft uppercase tracking-wide mb-1 block">Office / Cabin Room</label>
              <input
                id="fac-room"
                value={form.office_room}
                onChange={(e) => setForm((f) => ({ ...f, office_room: e.target.value }))}
                placeholder="e.g. CSE Block Room 201"
                className={fieldCls}
              />
            </div>

            {msg.text && (
              <div
                className={`text-xs font-mono p-3 rounded-lg border ${
                  msg.type === "success"
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                }`}
              >
                {msg.text}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50 font-mono font-bold"
              >
                <Save size={15} />
                {saving ? "Saving to DB..." : editId === null ? "Add Faculty Profile" : "Save Profile Changes"}
              </button>
              {editId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 flex items-center gap-1.5 border border-rule rounded-lg text-sm hover:border-danger hover:text-danger transition-colors font-mono"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
          </form>
        </Card>

        {/* Right: Faculty Cards Grid */}
        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-2.5 text-ink-soft" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, ID, subject..."
                className="w-full pl-9 pr-3 py-1.5 bg-canvas border border-rule rounded-lg text-xs outline-none focus:border-brass font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                title="Refresh faculty directory"
                className="p-1.5 border border-rule rounded-lg hover:border-brass hover:text-brass text-ink-soft transition-colors"
              >
                <RefreshCw size={14} />
              </button>
              {onBulkImport && (
                <button
                  type="button"
                  onClick={onBulkImport}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-lg transition-colors shrink-0"
                  title="Bulk import CSV spreadsheet"
                >
                  <UploadCloud size={14} /> Bulk CSV
                </button>
              )}
            </div>
          </Card>

          <BatchActionBar
            selectedCount={selectedIds.length}
            totalCount={filtered.length}
            onSelectAll={() => setSelectedIds(filtered.map((f) => f.id))}
            onClearAll={() => setSelectedIds([])}
            onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
            loading={bulkDeleting}
          />

          <div className="space-y-3">
            {filtered.map((fac) => {
              const name = fac.faculty_name || fac.name || "";
              const id = fac.faculty_id || `FAC-${fac.id}`;
              const isSelected = selectedIds.includes(fac.id);
              return (
                <motion.div
                  key={fac.id}
                  layout
                  className={`p-4 rounded-xl border bg-paper-raised flex items-start justify-between gap-4 transition-all ${
                    isSelected ? "border-brass bg-brass/10" : editId === fac.id ? "border-brass bg-brass/5" : "border-rule hover:border-brass/50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(fac.id)}
                      className="rounded accent-brass cursor-pointer shrink-0 mt-1"
                    />
                    <div className="w-10 h-10 rounded-full bg-brass/20 border border-brass/40 flex items-center justify-center font-display text-sm text-brass font-bold shrink-0">
                      {name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink text-sm truncate">{name}</span>
                        <span className="font-mono text-[10px] text-brass font-bold bg-brass/10 px-2 py-0.5 rounded border border-brass/30">
                          {id}
                        </span>
                      </div>
                      <div className="text-xs text-brass font-medium mt-0.5">{fac.designation}</div>
                      <div className="space-y-0.5 text-xs text-ink-soft mt-2">
                        {fac.department && (
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={11} className="shrink-0" />
                            <span>{fac.department}</span>
                          </div>
                        )}
                        {fac.subject && (
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink">
                            <FileText size={11} className="shrink-0 text-brass" />
                            <span>Subject: {fac.subject}</span>
                          </div>
                        )}
                        {fac.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} className="shrink-0" />
                            <span className="truncate">{fac.email}</span>
                          </div>
                        )}
                        {fac.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="shrink-0" />
                            <span>{fac.phone}</span>
                          </div>
                        )}
                        {fac.office_room && (
                          <div className="flex items-center gap-1.5 text-brass">
                            <MapPin size={11} className="shrink-0" />
                            <span>Cabin: {fac.office_room}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(fac)}
                      title="Edit faculty"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-rule hover:border-brass hover:text-brass text-ink-soft transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(fac)}
                      title="Delete faculty"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-rule hover:border-danger hover:text-danger text-ink-soft transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-ink-soft text-sm">
                No faculty members found.
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Faculty Profile"
        message={`Are you sure you want to delete "${deleteTarget?.faculty_name || deleteTarget?.name}" (${deleteTarget?.faculty_id || ""})?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Faculty Profiles"
        message={`Are you sure you want to permanently delete ${bulkDeleteTarget?.length || 0} selected faculty profiles?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 7. ANALYTICS TAB                                                   */
/* ================================================================== */
function StatCard({ label, value, delay }) {
  return (
    <Card delay={delay} className="p-5">
      <div className="font-mono text-xs text-ink-soft uppercase tracking-wide mb-2">{label}</div>
      <div className="font-display text-2xl sm:text-3xl font-bold text-ink">{value}</div>
    </Card>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [engine, setEngine] = useState(null);

  useEffect(() => {
    client.get("/admin/analytics").then((r) => setData(r.data));
    client.get("/admin/engine-status").then((r) => setEngine(r.data));
    const poll = setInterval(() => client.get("/admin/engine-status").then((r) => setEngine(r.data)), 15000);
    return () => clearInterval(poll);
  }, []);

  if (!data) return <SkeletonGrid />;

  const maxIntent = Math.max(...data.intent_mix.map((i) => i.count), 1);
  const maxKeyword = Math.max(...data.top_keywords.map((k) => k.count), 1);
  const sourceTotal = Object.values(data.source_mix).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Chats" value={data.total_chats} delay={0} />
        <StatCard label="Registered Users" value={data.total_users} delay={0.05} />
        <StatCard label="Thumbs Down" value={data.thumbs_down} delay={0.1} />
        <StatCard label="Flagged" value={data.flagged} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card delay={0.1} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Engine status</h3>
            {engine && (
              <Badge variant={engine.online ? "success" : "danger"}>
                {engine.online ? <Wifi size={11} className="inline mr-1" /> : <WifiOff size={11} className="inline mr-1" />}
                {engine.active_engine.replace("_", " ")}
              </Badge>
            )}
          </div>
          {engine ? (
            <div className="space-y-2 text-sm">
              <StatusRow label="Internet connectivity" ok={engine.online} />
              <StatusRow label="Ollama (offline model)" ok={engine.ollama_available} />
            </div>
          ) : (
            <div className="text-ink-soft text-sm">Checking…</div>
          )}
        </Card>

        <Card delay={0.15} className="p-5">
          <h3 className="font-display text-lg mb-4">Online / offline mix</h3>
          {Object.entries(data.source_mix).map(([src, count]) => (
            <ProgressBar key={src} label={sourceMeta(src).label} value={count} max={sourceTotal} />
          ))}
          {sourceTotal === 1 && Object.keys(data.source_mix).length === 0 && (
            <p className="text-ink-soft text-sm">No conversations logged yet.</p>
          )}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card delay={0.2} className="p-5">
          <h3 className="font-display text-lg mb-4">Top intents</h3>
          {data.intent_mix.map((i) => (
            <ProgressBar key={i.intent} label={i.intent} value={i.count} max={maxIntent} />
          ))}
        </Card>
        <Card delay={0.25} className="p-5">
          <h3 className="font-display text-lg mb-4">Top query keywords</h3>
          {data.top_keywords.map((k) => (
            <ProgressBar key={k.word} label={k.word} value={k.count} max={maxKeyword} />
          ))}
        </Card>
      </div>
    </div>
  );
}

function StatusRow({ label, ok }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-rule last:border-0">
      <span className="text-ink-soft">{label}</span>
      <span className={`flex items-center gap-1.5 font-mono text-xs ${ok ? "text-success" : "text-danger"}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-success" : "bg-danger"}`} />
        {ok ? "Reachable" : "Unreachable"}
      </span>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-xl bg-paper-raised border border-rule animate-pulse" />
      ))}
    </div>
  );
}

/* ================================================================== */
/* 8. KNOWLEDGE BASE TAB                                              */
/* ================================================================== */
function KnowledgeTab() {
  const [docs, setDocs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(() => client.get("/admin/docs").then((r) => setDocs(r.data)), []);
  useEffect(() => { refresh(); }, [refresh]);

  async function uploadFile(file) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await client.post("/admin/docs", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await refresh();
    } catch (err) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function confirmSingleDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/docs/${encodeURIComponent(deleteTarget)}`);
      setSelectedDocs((prev) => prev.filter((d) => d !== deleteTarget));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || err.message));
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      await client.post("/admin/bulk-delete/docs", { ids: bulkDeleteTarget });
      setSelectedDocs([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      alert("Bulk delete failed: " + (err.response?.data?.error || err.message));
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelect(fn) {
    setSelectedDocs((prev) => (prev.includes(fn) ? prev.filter((x) => x !== fn) : [...prev, fn]));
  }

  function toggleSelectAll() {
    if (selectedDocs.length === docs.length && docs.length > 0) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(docs.map((d) => d.filename));
    }
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          uploadFile(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer
          ${dragging ? "border-brass bg-brass/5" : "border-rule bg-paper-raised"}`}
        onClick={() => document.getElementById("kb-file-input").click()}
      >
        <input
          id="kb-file-input"
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => uploadFile(e.target.files?.[0])}
        />
        <UploadCloud size={32} className="mx-auto text-brass mb-3" />
        <div className="font-display text-lg mb-1">
          {uploading ? "Indexing document…" : "Drop a document here or click to browse"}
        </div>
        <p className="text-xs text-ink-soft font-mono">PDF, TXT, or Markdown up to 16 MB</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Indexed documents ({docs.length})</h3>
          {docs.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-xs font-mono text-brass hover:underline"
            >
              {selectedDocs.length === docs.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        <BatchActionBar
          selectedCount={selectedDocs.length}
          totalCount={docs.length}
          onSelectAll={() => setSelectedDocs(docs.map((d) => d.filename))}
          onClearAll={() => setSelectedDocs([])}
          onDeleteSelected={() => setBulkDeleteTarget(selectedDocs)}
          loading={bulkDeleting}
        />

        {docs.length === 0 && <p className="text-ink-soft text-sm">No documents in the knowledge base.</p>}
        {docs.map((d) => {
          const isSelected = selectedDocs.includes(d.filename);
          return (
            <Card key={d.filename} className={`p-4 flex items-center justify-between transition-colors ${isSelected ? "border-brass bg-brass/10" : ""}`}>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(d.filename)}
                  className="rounded accent-brass cursor-pointer"
                />
                <div>
                  <div className="font-semibold text-sm">{d.filename}</div>
                  <div className="font-mono text-xs text-ink-soft">
                    {d.chunks} chunk{d.chunks === 1 ? "" : "s"} · {d.size_kb} KB · uploaded {timeAgo(d.uploaded_at)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(d.filename)}
                className="text-ink-soft hover:text-danger p-2 transition-colors"
                title="Delete document"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Knowledge Document"
        message={`Are you sure you want to delete "${deleteTarget}" and purge all its indexed embeddings?`}
        onConfirm={confirmSingleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected Documents"
        message={`Are you sure you want to delete ${bulkDeleteTarget?.length || 0} selected documents and purge their vector index embeddings?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 9. FAQS TAB                                                        */
/* ================================================================== */
function FaqsTab({ onBulkImport }) {
  const [faqs, setFaqs] = useState([]);
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [category, setCategory] = useState("general");
  const [adding, setAdding] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const refresh = useCallback(() => client.get("/admin/faqs").then((r) => setFaqs(r.data)), []);
  useEffect(() => { refresh(); }, [refresh]);

  async function submit(e) {
    e.preventDefault();
    if (!q || !a) return;
    setAdding(true);
    try {
      await client.post("/admin/faqs", { question: q, answer: a, category });
      setQ("");
      setA("");
      refresh();
    } finally {
      setAdding(false);
    }
  }

  async function confirmSingleDelete() {
    if (!deleteTarget) return;
    try {
      await client.delete(`/admin/faqs/${deleteTarget.id}`);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
      setDeleteTarget(null);
      await refresh();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.error || err.message));
      setDeleteTarget(null);
    }
  }

  async function confirmBulkDelete() {
    if (!bulkDeleteTarget || bulkDeleteTarget.length === 0) return;
    setBulkDeleting(true);
    try {
      await client.post("/admin/bulk-delete/faqs", { ids: bulkDeleteTarget });
      setSelectedIds([]);
      setBulkDeleteTarget(null);
      await refresh();
    } catch (err) {
      alert("Bulk delete failed: " + (err.response?.data?.error || err.message));
      setBulkDeleteTarget(null);
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    if (selectedIds.length === faqs.length && faqs.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(faqs.map((f) => f.id));
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_1.5fr] gap-6">
      <Card className="p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg">Add FAQ</h3>
          {onBulkImport && (
            <button
              type="button"
              onClick={onBulkImport}
              className="flex items-center gap-1.5 px-3 py-1 bg-brass/15 border border-brass/40 text-brass-dark dark:text-brass hover:bg-brass hover:text-ink font-mono font-bold text-xs rounded-lg transition-colors"
              title="Bulk import FAQs from CSV"
            >
              <UploadCloud size={13} /> Bulk CSV
            </button>
          )}
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-mono text-ink-soft uppercase block mb-1">Question</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. What are the library hours?"
              className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-ink-soft uppercase block mb-1">Answer</label>
            <textarea
              rows={3}
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="The library is open 8am-8pm Mon-Sat."
              className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-ink-soft uppercase block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 text-sm outline-none focus:border-brass"
            >
              <option value="general">General</option>
              <option value="admissions">Admissions</option>
              <option value="academics">Academics</option>
              <option value="faculty_profile">Faculty Profile</option>
              <option value="administration">Administration</option>
              <option value="fees">Fees</option>
              <option value="placements">Placements</option>
              <option value="hostel">Hostel</option>
              <option value="transport">Transport</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full flex items-center justify-center gap-2 bg-ink text-paper rounded-lg py-2.5 text-sm font-medium hover:bg-brass hover:text-ink transition-colors disabled:opacity-50"
          >
            <Plus size={15} /> Add FAQ
          </button>
        </form>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Current FAQs ({faqs.length})</h3>
          {faqs.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-xs font-mono text-brass hover:underline"
            >
              {selectedIds.length === faqs.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        <BatchActionBar
          selectedCount={selectedIds.length}
          totalCount={faqs.length}
          onSelectAll={() => setSelectedIds(faqs.map((f) => f.id))}
          onClearAll={() => setSelectedIds([])}
          onDeleteSelected={() => setBulkDeleteTarget(selectedIds)}
          loading={bulkDeleting}
        />

        {faqs.map((f) => {
          const isSelected = selectedIds.includes(f.id);
          return (
            <Card key={f.id} className={`p-4 transition-colors ${isSelected ? "border-brass bg-brass/10" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(f.id)}
                    className="rounded accent-brass cursor-pointer mt-1"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="brass">{f.category}</Badge>
                      <span className="font-semibold text-sm">{f.question}</span>
                    </div>
                    <p className="text-xs text-ink-soft leading-relaxed">{f.answer}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteTarget(f)}
                  className="text-ink-soft hover:text-danger p-1 shrink-0 transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete FAQ"
        message={`Are you sure you want to delete the FAQ: "${deleteTarget?.question}"?`}
        onConfirm={confirmSingleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        isOpen={!!bulkDeleteTarget}
        title="Delete Selected FAQs"
        message={`Are you sure you want to delete ${bulkDeleteTarget?.length || 0} selected FAQ items from the database?`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteTarget(null)}
        loading={bulkDeleting}
      />
    </div>
  );
}

/* ================================================================== */
/* 10. CHAT LOGS TAB                                                  */
/* ================================================================== */
function LogsTab() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    client.get("/admin/logs").then((r) => setLogs(r.data));
  }, []);

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-rule bg-canvas/40 font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            <th className="px-5 py-3">Time</th>
            <th className="px-5 py-3">User</th>
            <th className="px-5 py-3">Query</th>
            <th className="px-5 py-3">Source</th>
            <th className="px-5 py-3">Frustrated</th>
            <th className="px-5 py-3">Flagged</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-rule font-mono">
          {logs.map((l, i) => (
            <motion.tr key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
              <td className="px-5 py-3.5 text-ink-soft">{timeAgo(l.created_at)}</td>
              <td className="px-5 py-3.5">{l.user_name || l.user_email}</td>
              <td className="px-5 py-3.5 max-w-xs truncate font-body" title={l.query}>
                {l.query}
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={sourceMeta(l.source).variant}>{sourceMeta(l.source).label}</Badge>
              </td>
              <td className="px-5 py-3.5">
                {l.frustrated ? (
                  <Badge variant="danger" stamp>
                    <AlertTriangle size={10} /> Frustrated
                  </Badge>
                ) : (
                  <span className="text-ink-soft text-xs">—</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                {l.flagged ? (
                  <Badge variant="danger" stamp>
                    <AlertTriangle size={10} /> Flagged
                  </Badge>
                ) : (
                  <span className="text-ink-soft text-xs">—</span>
                )}
              </td>
            </motion.tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-ink-soft font-body">
                No conversations logged yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
