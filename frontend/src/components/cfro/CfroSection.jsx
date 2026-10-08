import { useState, useEffect } from "react";
import { 
  CreditCard, Download, Printer, Search, AlertCircle, CheckCircle, 
  Clock, FileText, Calendar, Plus, RefreshCw, X, ShieldCheck, DollarSign 
} from "lucide-react";
import client from "../../api/client.js";
import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CfroSection() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "cfro_staff";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "structure" | "payments" | "staff"
  const [receiptModal, setReceiptModal] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    fee_type: "Tuition Fee",
    amount: "",
    payment_mode: "Online (UPI / NetBanking)",
    transaction_ref: "",
  });

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    category: "Fee Deadline",
    deadline_date: "",
    priority: "Normal"
  });

  useEffect(() => {
    fetchCfroData();
    fetchStructures();
    fetchPayments();
    if (isStaff) {
      fetchStudents();
    }
  }, [selectedStudentId]);

  async function fetchCfroData() {
    setLoading(true);
    try {
      const url = selectedStudentId 
        ? `/cfro/dashboard?student_id=${selectedStudentId}` 
        : "/cfro/dashboard";
      const res = await client.get(url);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching CFRO data", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStructures() {
    try {
      const res = await client.get("/cfro/structure");
      setStructures(res.data);
    } catch (err) {
      console.error("Error fetching fee structure", err);
    }
  }

  async function fetchPayments() {
    try {
      const url = selectedStudentId 
        ? `/cfro/payments?student_id=${selectedStudentId}` 
        : "/cfro/payments";
      const res = await client.get(url);
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments", err);
    }
  }

  async function fetchStudents() {
    try {
      const res = await client.get("/cfro/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students", err);
    }
  }

  async function handleViewReceipt(receiptNo) {
    try {
      const res = await client.get(`/cfro/receipt/${receiptNo}`);
      setReceiptModal(res.data);
    } catch (err) {
      alert("Could not load receipt details: " + (err.response?.data?.error || err.message));
    }
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    if (!paymentForm.amount || isNaN(paymentForm.amount)) {
      alert("Please enter a valid amount");
      return;
    }
    try {
      await client.post("/cfro/payments/record", {
        student_id: selectedStudentId || user.id,
        ...paymentForm,
        amount: parseFloat(paymentForm.amount)
      });
      alert("Payment recorded successfully!");
      setPaymentModalOpen(false);
      setPaymentForm({ fee_type: "Tuition Fee", amount: "", payment_mode: "Online (UPI / NetBanking)", transaction_ref: "" });
      fetchCfroData();
      fetchPayments();
    } catch (err) {
      alert("Failed to record payment: " + (err.response?.data?.error || err.message));
    }
  }

  async function handlePostAnnouncement(e) {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) {
      alert("Please enter title and content");
      return;
    }
    try {
      await client.post("/cfro/announcements", announcementForm);
      alert("Fee announcement published successfully!");
      setAnnouncementModalOpen(false);
      setAnnouncementForm({ title: "", content: "", category: "Fee Deadline", deadline_date: "", priority: "Normal" });
      fetchCfroData();
    } catch (err) {
      alert("Failed to post announcement: " + (err.response?.data?.error || err.message));
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-ink-soft">
        <RefreshCw className="animate-spin mr-2" size={18} />
        Loading CFRO Portal...
      </div>
    );
  }

  const sInfo = data?.student_info || {};
  const fSummary = data?.fee_summary || {};
  const breakdown = data?.fee_breakdown || [];
  const deadlines = data?.deadlines || [];
  const announcements = data?.announcements || [];

  return (
    <div className="space-y-6 animate-fade-in text-ink font-sans pb-12">
      {/* SECTION HEADER */}
      <div className="bg-paper-raised border border-rule rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brass/15 text-brass flex items-center justify-center font-bold shadow-inner">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-ink tracking-tight">
                  CFRO — College Fee Related Office
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brass/20 text-brass border border-brass/30">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                QIS College of Engineering and Technology · Academic Year {fSummary.academic_year || "2026-2027"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isStaff && (
              <select
                value={selectedStudentId || ""}
                onChange={(e) => setSelectedStudentId(e.target.value ? parseInt(e.target.value) : null)}
                className="text-xs bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
              >
                <option value="">👤 View My / Default Account</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roll_no} - {s.department})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => setPaymentModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} /> Record / Pay Fee
            </button>
            {isStaff && (
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-brass/20 text-brass border border-brass/40 hover:bg-brass/30 flex items-center gap-1.5 transition-all"
              >
                <Plus size={14} /> New Notice
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-rule/70 pt-4 overflow-x-auto text-xs">
          {[
            { id: "dashboard", label: "CFRO Dashboard", icon: CreditCard },
            { id: "statement", label: "Student Fee Statement", icon: FileText },
            { id: "structure", label: "College Fee Structure", icon: DollarSign },
            { id: "payments", label: "Payment History & Receipts", icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
                  active
                    ? "bg-ink text-paper shadow-sm"
                    : "text-ink-soft hover:text-ink hover:bg-canvas"
                }`}
              >
                <Icon size={14} className={active ? "text-brass" : "text-ink-soft"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-paper-raised border border-rule rounded-xl p-4 shadow-sm">
              <div className="text-xs text-ink-soft">Total Applicable Fee</div>
              <div className="text-2xl font-bold text-ink mt-1">₹{fSummary.total_due?.toLocaleString()}</div>
              <div className="text-[11px] text-ink-soft mt-1">Year {fSummary.academic_year}</div>
            </div>

            <div className="bg-paper-raised border border-rule rounded-xl p-4 shadow-sm">
              <div className="text-xs text-ink-soft">Total Paid Amount</div>
              <div className="text-2xl font-bold text-success mt-1">₹{fSummary.total_paid?.toLocaleString()}</div>
              <div className="text-[11px] text-success/80 mt-1 flex items-center gap-1">
                <CheckCircle size={12} /> Verified by Accounts
              </div>
            </div>

            <div className="bg-paper-raised border border-rule rounded-xl p-4 shadow-sm">
              <div className="text-xs text-ink-soft">Pending Balance Due</div>
              <div className={`text-2xl font-bold mt-1 ${fSummary.total_pending > 0 ? "text-warning" : "text-ink"}`}>
                ₹{fSummary.total_pending?.toLocaleString()}
              </div>
              <div className="text-[11px] text-ink-soft mt-1">
                {fSummary.total_pending > 0 ? "Due before semester exams" : "All cleared"}
              </div>
            </div>

            <div className="bg-paper-raised border border-rule rounded-xl p-4 shadow-sm">
              <div className="text-xs text-ink-soft">Account Status</div>
              <div className="mt-1.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  fSummary.payment_status === "Paid"
                    ? "bg-success/15 text-success border-success/30"
                    : fSummary.payment_status === "Partially Paid"
                    ? "bg-warning/15 text-warning border-warning/30"
                    : "bg-danger/15 text-danger border-danger/30"
                }`}>
                  {fSummary.payment_status}
                </span>
              </div>
              <div className="text-[11px] text-ink-soft mt-2">{fSummary.semester}</div>
            </div>
          </div>

          {/* Student Profile & Quick Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Info Box */}
            <div className="bg-paper-raised border border-rule rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="font-bold text-ink text-sm">Student Fee Profile</div>
                <Badge variant="neutral">Active</Badge>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Student Name</span>
                  <span className="font-semibold text-ink">{sInfo.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Roll Number</span>
                  <span className="font-mono font-bold text-brass">{sInfo.roll_no}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Department</span>
                  <span className="font-medium text-ink">{sInfo.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Year / Semester</span>
                  <span className="font-medium text-ink">{sInfo.year} - {sInfo.semester}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-soft">Institution</span>
                  <span className="font-medium text-ink text-right max-w-[180px]">{sInfo.college}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveTab("statement")}
                  className="w-full text-xs font-semibold py-2 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText size={13} /> View Full Fee Statement
                </button>
              </div>
            </div>

            {/* Live Fee Breakdown List */}
            <div className="lg:col-span-2 bg-paper-raised border border-rule rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="font-bold text-ink text-sm">Fee Breakdown by Category</div>
                <span className="text-xs text-ink-soft">{breakdown.length} Fee Heads</span>
              </div>

              <div className="space-y-3">
                {breakdown.map((item) => {
                  const pct = Math.min(100, Math.round((item.amount_paid / Math.max(1, item.amount_due)) * 100));
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-canvas border border-rule/70">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-xs text-ink">{item.fee_type}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-soft">
                            ₹{item.amount_paid.toLocaleString()} / ₹{item.amount_due.toLocaleString()}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            item.status === 'Paid'
                              ? 'bg-success/15 text-success border-success/30'
                              : item.status === 'Partially Paid'
                              ? 'bg-warning/15 text-warning border-warning/30'
                              : 'bg-danger/15 text-danger border-danger/30'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-paper rounded-full h-2 overflow-hidden border border-rule">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.status === 'Paid' ? 'bg-success' : item.status === 'Partially Paid' ? 'bg-warning' : 'bg-danger'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-ink-soft">
                        <span>{pct}% paid</span>
                        <span>Pending: ₹{item.pending_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Deadlines and Announcements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deadlines */}
            <div className="bg-paper-raised border border-rule rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-ink text-sm border-b border-rule pb-3">
                <Calendar size={16} className="text-brass" />
                <span>Important Fee Deadlines</span>
              </div>
              <div className="space-y-2.5">
                {deadlines.map((d) => (
                  <div key={d.id} className="p-3 rounded-lg bg-canvas border border-rule/70 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-xs text-ink">{d.fee_type}</div>
                      <div className="text-[11px] text-ink-soft mt-0.5">{d.penalty}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-brass flex items-center gap-1 justify-end">
                        <Clock size={12} /> {d.deadline}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper text-ink-soft border border-rule mt-1 inline-block">
                        {d.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fee Announcements */}
            <div className="bg-paper-raised border border-rule rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-bold text-ink text-sm border-b border-rule pb-3">
                <AlertCircle size={16} className="text-brass" />
                <span>CFRO Office Announcements</span>
              </div>
              <div className="space-y-2.5">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 rounded-lg bg-canvas border border-rule/70">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-ink">{a.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-brass/15 text-brass font-bold shrink-0">
                        {a.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-soft mt-1 leading-relaxed">{a.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-ink-soft mt-2 pt-1.5 border-t border-rule/50">
                      <span>Posted by: {a.posted_by}</span>
                      <span>{a.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CFRO Campus Physical Location & Contact Info Banner */}
          <div className="bg-paper-raised border border-brass/30 rounded-xl p-5 shadow-sm space-y-3 bg-gradient-to-r from-brass/5 to-canvas">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                <ShieldCheck size={18} className="text-brass" />
                <span>QISCET CFRO Physical Office Location & Contacts</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brass/20 text-brass">
                Block-A Ground Floor
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-ink-soft">
              <div className="space-y-1">
                <div className="font-bold text-ink flex items-center gap-1.5">
                  📍 Physical Office Location
                </div>
                <p className="leading-relaxed">
                  <strong>Main Administrative Building (Block-A)</strong><br />
                  Ground Floor, Fee Accounts & Cash Counter Wing (Counters 1 & 2)<br />
                  Next to Main Entrance Reception Desk
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-ink flex items-center gap-1.5">
                  🏫 Campus Address
                </div>
                <p className="leading-relaxed">
                  <strong>QIS College of Engineering & Technology</strong><br />
                  Vengamukkapalem, Pondur Road, Ongole, Prakasam District, AP - 523272<br />
                  *(Adjacent to NH-16 / NH-5 Highway)*
                </p>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-ink flex items-center gap-1.5">
                  ⏰ Office Hours & Contacts
                </div>
                <p className="leading-relaxed">
                  <strong>Timings:</strong> Mon – Sat: 09:30 AM – 04:30 PM (Lunch: 01:00 PM – 01:45 PM)<br />
                  <strong>Phone:</strong> +91 92464 19542 / Ext: 102<br />
                  <strong>Email:</strong> cfro@qiscet.edu.in
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATEMENT */}
      {activeTab === "statement" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Student Official Fee Statement</h2>
              <p className="text-xs text-ink-soft">Verified financial ledger for {sInfo.name} ({sInfo.roll_no})</p>
            </div>
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink flex items-center gap-1.5 self-start"
            >
              <Printer size={14} /> Print Statement
            </button>
          </div>

          {/* Statement Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-canvas text-ink-soft">
                  <th className="py-2.5 px-3 font-semibold">Fee Component</th>
                  <th className="py-2.5 px-3 font-semibold">Due Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Paid Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Pending Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {breakdown.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-ink">{item.fee_type}</td>
                    <td className="py-3 px-3 font-mono">₹{item.amount_due.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-success font-semibold">₹{item.amount_paid.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-warning font-semibold">₹{item.pending_amount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.status === 'Paid'
                          ? 'bg-success/15 text-success border-success/30'
                          : item.status === 'Partially Paid'
                          ? 'bg-warning/15 text-warning border-warning/30'
                          : 'bg-danger/15 text-danger border-danger/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-ink-soft">
                      {item.status === 'Paid' ? 'Receipt generated' : 'Pending payment'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-rule font-bold bg-canvas/70">
                  <td className="py-3 px-3 text-ink">Total Summary</td>
                  <td className="py-3 px-3 font-mono text-ink">₹{fSummary.total_due?.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-success">₹{fSummary.total_paid?.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-warning">₹{fSummary.total_pending?.toLocaleString()}</td>
                  <td className="py-3 px-3" colSpan={2}>
                    <span className="text-xs text-ink-soft">Overall: {fSummary.payment_status}</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STRUCTURE */}
      {activeTab === "structure" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Official College Fee Structure (2026-2027)</h2>
              <p className="text-xs text-ink-soft">Course-wise & Semester-wise breakdown approved by Governing Body</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-ink-soft" size={14} />
              <input
                type="text"
                placeholder="Search course or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-canvas border border-rule rounded-lg outline-none focus:border-brass"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-canvas text-ink-soft">
                  <th className="py-2.5 px-3 font-semibold">Course & Branch</th>
                  <th className="py-2.5 px-3 font-semibold">Year / Sem</th>
                  <th className="py-2.5 px-3 font-semibold">Tuition</th>
                  <th className="py-2.5 px-3 font-semibold">Exam</th>
                  <th className="py-2.5 px-3 font-semibold">Hostel</th>
                  <th className="py-2.5 px-3 font-semibold">Transport</th>
                  <th className="py-2.5 px-3 font-semibold">Other</th>
                  <th className="py-2.5 px-3 font-semibold font-bold text-ink">Total</th>
                  <th className="py-2.5 px-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {structures
                  .filter(s => 
                    !searchQuery || 
                    s.course.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    s.department.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((s) => (
                    <tr key={s.id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-ink">
                        <div>{s.course}</div>
                        <div className="text-[10px] text-ink-soft">{s.department}</div>
                      </td>
                      <td className="py-3 px-3 text-ink-soft">{s.year} - {s.semester}</td>
                      <td className="py-3 px-3 font-mono">₹{s.tuition_fee?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">₹{s.exam_fee?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">₹{s.hostel_fee?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">₹{s.transport_fee?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">₹{s.other_fees?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-brass">₹{s.total_fee?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-[11px] text-ink-soft max-w-[200px]">{s.notes}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENTS & RECEIPTS */}
      {activeTab === "payments" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Payment History & Digital Receipts</h2>
              <p className="text-xs text-ink-soft">Recorded transactions and verifiable CFRO electronic receipts</p>
            </div>
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center gap-1.5 self-start"
            >
              <Plus size={14} /> Make Payment
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-canvas text-ink-soft">
                  <th className="py-2.5 px-3 font-semibold">Receipt No</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Fee Type</th>
                  <th className="py-2.5 px-3 font-semibold">Mode</th>
                  <th className="py-2.5 px-3 font-semibold">Transaction Ref</th>
                  <th className="py-2.5 px-3 font-semibold">Amount</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Receipt Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-ink">{p.receipt_no}</td>
                    <td className="py-3 px-3 text-ink-soft">{p.payment_date}</td>
                    <td className="py-3 px-3 font-medium text-ink">{p.fee_type}</td>
                    <td className="py-3 px-3 text-ink-soft">{p.payment_mode}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-ink-soft">{p.transaction_ref}</td>
                    <td className="py-3 px-3 font-mono font-bold text-success">₹{p.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleViewReceipt(p.receipt_no)}
                        className="text-xs font-semibold px-2.5 py-1 rounded bg-canvas hover:bg-paper border border-rule text-brass flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Printer size={12} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-rule rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Receipt Header */}
            <div className="flex items-start justify-between border-b border-rule pb-4">
              <div>
                <div className="text-base font-bold text-ink leading-tight">{receiptModal.college_name}</div>
                <div className="text-[11px] text-ink-soft mt-0.5">{receiptModal.affiliation}</div>
                <div className="text-[10px] text-ink-soft">{receiptModal.campus_address}</div>
              </div>
              <button 
                onClick={() => setReceiptModal(null)}
                className="p-1.5 rounded-lg hover:bg-canvas text-ink-soft cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Title & Ref */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-canvas border border-rule/70 text-xs">
              <div>
                <div className="text-[10px] text-ink-soft">OFFICIAL RECEIPT NUMBER</div>
                <div className="font-mono font-bold text-brass text-sm">{receiptModal.receipt_no}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-ink-soft">PAYMENT DATE</div>
                <div className="font-semibold text-ink">{receiptModal.date}</div>
              </div>
            </div>

            {/* Student & Fee Details */}
            <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-lg border border-rule/60 bg-paper">
              <div>Student Name: <strong className="text-ink">{receiptModal.student_name}</strong></div>
              <div>Roll Number: <strong className="text-brass font-mono">{receiptModal.student_id}</strong></div>
              <div>Department: <span className="text-ink">{receiptModal.department}</span></div>
              <div>Year & Sem: <span className="text-ink">{receiptModal.year_semester}</span></div>
              <div>Academic Year: <span className="text-ink">{receiptModal.academic_year}</span></div>
              <div>Payment Mode: <span className="text-ink">{receiptModal.payment_mode}</span></div>
            </div>

            {/* Amount Box */}
            <div className="p-4 rounded-xl bg-canvas border border-rule text-center space-y-1">
              <div className="text-xs text-ink-soft">Fee Head: <strong>{receiptModal.fee_type}</strong></div>
              <div className="text-3xl font-bold text-success">₹{receiptModal.amount_paid?.toLocaleString()}</div>
              <div className="text-[11px] text-ink-soft italic">{receiptModal.amount_in_words}</div>
            </div>

            {/* Security Stamp / Disclaimer */}
            <div className="flex items-center justify-between text-[11px] text-ink-soft pt-2 border-t border-rule/60">
              <div className="flex items-center gap-1 text-success">
                <ShieldCheck size={14} />
                <span>{receiptModal.cashier_signature}</span>
              </div>
              <span className="font-mono text-[10px]">{receiptModal.transaction_ref}</span>
            </div>
            <p className="text-[10px] text-ink-soft text-center leading-tight">
              {receiptModal.disclaimer}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 text-xs font-semibold py-2.5 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer size={15} /> Print Receipt
              </button>
              <button
                onClick={() => setReceiptModal(null)}
                className="px-4 text-xs font-semibold py-2.5 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-rule rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="font-bold text-ink text-base">Record / Pay College Fee</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1 rounded hover:bg-canvas text-ink-soft">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ink-soft mb-1 font-medium">Fee Head</label>
                <select
                  value={paymentForm.fee_type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, fee_type: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                >
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Examination Fee">Examination Fee</option>
                  <option value="Hostel Fee">Hostel Fee</option>
                  <option value="Transport Fee">Transport Fee</option>
                  <option value="Library & Lab Fee">Library & Lab Fee</option>
                  <option value="Other Applicable Fee">Other Applicable Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Payment Mode</label>
                <select
                  value={paymentForm.payment_mode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                >
                  <option value="Online (UPI / NetBanking)">Online (UPI / NetBanking)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card</option>
                  <option value="Bank Challan / NEFT">Bank Challan / NEFT</option>
                  <option value="Cash at CFRO Desk">Cash at CFRO Desk</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Transaction / Challan Ref (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-9842104"
                  value={paymentForm.transaction_ref}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_ref: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 font-semibold py-2.5 rounded-lg bg-ink text-paper hover:bg-ink/90 cursor-pointer"
                >
                  Submit Payment
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 font-semibold py-2.5 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-rule rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="font-bold text-ink text-base">Publish Fee Announcement</h3>
              <button onClick={() => setAnnouncementModalOpen(false)} className="p-1 rounded hover:bg-canvas text-ink-soft">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ink-soft mb-1 font-medium">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Last Date for Exam Fee Registration"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Category</label>
                <select
                  value={announcementForm.category}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, category: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                >
                  <option value="Fee Deadline">Fee Deadline</option>
                  <option value="Concession / Scholarship">Concession / Scholarship</option>
                  <option value="Hostel & Transport">Hostel & Transport</option>
                  <option value="General Fee Policy">General Fee Policy</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Content / Notice Details</label>
                <textarea
                  rows={3}
                  placeholder="Detailed notification for students..."
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Deadline Date (Optional)</label>
                <input
                  type="date"
                  value={announcementForm.deadline_date}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, deadline_date: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 font-semibold py-2.5 rounded-lg bg-ink text-paper hover:bg-ink/90 cursor-pointer"
                >
                  Publish Notice
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-4 font-semibold py-2.5 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
