import { useState, useEffect } from "react";
import { 
  HeartHandshake, Award, FileCheck, HelpCircle, Shield, User, Clock, 
  MapPin, Phone, Mail, ChevronRight, Plus, RefreshCw, X, AlertTriangle, 
  CheckCircle2, Download, Printer, Send, MessageSquare 
} from "lucide-react";
import client from "../../api/client.js";
import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CfssSection() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "cfss_staff" || user?.role === "student_dean";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "reimbursement" | "documents" | "dean" | "tickets" | "faqs"
  
  // Modals
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [certPreviewModal, setCertPreviewModal] = useState(null);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [ticketReplyModal, setTicketReplyModal] = useState(null);

  // Forms
  const [docForm, setDocForm] = useState({
    document_type: "Bonafide Certificate",
    purpose: "",
    copies: 1,
    remarks: ""
  });

  const [ticketForm, setTicketForm] = useState({
    category: "Scholarship & Reimbursement",
    subject: "",
    description: "",
    priority: "Normal"
  });

  const [reimbUpdateForm, setReimbUpdateForm] = useState({
    current_stage: "Biometric / Thumb Authentication",
    thumb_auth_status: "Verified at Room A-102",
    remarks: ""
  });

  const [ticketReplyText, setTicketReplyText] = useState("");

  useEffect(() => {
    fetchCfssData();
  }, []);

  async function fetchCfssData() {
    setLoading(true);
    try {
      const res = await client.get("/cfss/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching CFSS data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestDoc(e) {
    e.preventDefault();
    if (!docForm.purpose) {
      alert("Please specify the purpose of the certificate");
      return;
    }
    try {
      await client.post("/cfss/documents/request", docForm);
      alert("Certificate request submitted successfully!");
      setDocModalOpen(false);
      setDocForm({ document_type: "Bonafide Certificate", purpose: "", copies: 1, remarks: "" });
      fetchCfssData();
    } catch (err) {
      alert("Failed to submit request: " + (err.response?.data?.error || err.message));
    }
  }

  async function handleCreateTicket(e) {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.description) {
      alert("Please fill in subject and description");
      return;
    }
    try {
      await client.post("/cfss/tickets", ticketForm);
      alert("Support ticket submitted to CFSS Desk!");
      setTicketModalOpen(false);
      setTicketForm({ category: "Scholarship & Reimbursement", subject: "", description: "", priority: "Normal" });
      fetchCfssData();
    } catch (err) {
      alert("Failed to raise ticket: " + (err.response?.data?.error || err.message));
    }
  }

  async function handleViewCertificate(docCode) {
    try {
      const res = await client.get(`/cfss/documents/download/${docCode}`);
      setCertPreviewModal(res.data);
    } catch (err) {
      alert("Could not preview certificate: " + (err.response?.data?.error || err.message));
    }
  }

  async function handleUpdateReimbursement(e) {
    e.preventDefault();
    if (!data?.reimbursement?.id) return;
    try {
      await client.post("/cfss/reimbursement/status-update", {
        application_id: data.reimbursement.id,
        ...reimbUpdateForm
      });
      alert("Reimbursement status updated!");
      setStatusUpdateModal(false);
      fetchCfssData();
    } catch (err) {
      alert("Update failed: " + (err.response?.data?.error || err.message));
    }
  }

  async function handleReplyTicket(ticketId) {
    if (!ticketReplyText) return;
    try {
      await client.post(`/cfss/tickets/${ticketId}/reply`, {
        response: ticketReplyText,
        status: "Resolved"
      });
      alert("Response recorded!");
      setTicketReplyModal(null);
      setTicketReplyText("");
      fetchCfssData();
    } catch (err) {
      alert("Reply failed: " + (err.response?.data?.error || err.message));
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-ink-soft">
        <RefreshCw className="animate-spin mr-2" size={18} />
        Loading CFSS Portal...
      </div>
    );
  }

  const acad = data?.student_academic_info || {};
  const reimb = data?.reimbursement || {};
  const docs = data?.document_requests || [];
  const tickets = data?.support_tickets || [];
  const dean = data?.dean_info || {};
  const announcements = data?.announcements || [];
  const bioNotice = data?.biometric_notice || {};

  const stages = [
    { num: 1, label: "Application Submitted", desc: "Submitted online via JVD portal" },
    { num: 2, label: "College Verification", desc: "Principal Office verified documents" },
    { num: 3, label: "Biometric / Thumb Auth", desc: "Physical e-KYC in Room A-102" },
    { num: 4, label: "Welfare Dept Scrutiny", desc: "Government verification & treasury" },
    { num: 5, label: "Disbursed to College", desc: "Fee credited to student account" },
  ];

  const currentStageIndex = stages.findIndex(s => s.label.toLowerCase().includes((reimb.current_stage || "").toLowerCase()));
  const activeStageIdx = currentStageIndex >= 0 ? currentStageIndex : 2;

  return (
    <div className="space-y-6 animate-fade-in text-ink font-sans pb-12">
      {/* SECTION HEADER */}
      <div className="bg-paper-raised border border-rule rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brass/15 text-brass flex items-center justify-center font-bold shadow-inner">
              <HeartHandshake size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-ink tracking-tight">
                  CFSS — College Student Support Section
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brass/20 text-brass border border-brass/30">
                  Student Welfare
                </span>
              </div>
              <p className="text-xs text-ink-soft mt-0.5">
                Academic Support · Fee Reimbursement Tracker · Certificate Services · Student Dean Office
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setDocModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} /> Request Certificate
            </button>
            <button
              onClick={() => setTicketModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-brass/20 text-brass border border-brass/40 hover:bg-brass/30 flex items-center gap-1.5 transition-all"
            >
              <MessageSquare size={14} /> Raise Support Ticket
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-rule/70 pt-4 overflow-x-auto text-xs">
          {[
            { id: "dashboard", label: "CFSS Overview", icon: HeartHandshake },
            { id: "reimbursement", label: "Fee Reimbursement (JVD)", icon: Award },
            { id: "documents", label: "Document Services", icon: FileCheck },
            { id: "dean", label: "Student Dean Office", icon: Shield },
            { id: "tickets", label: "Support Tickets", icon: MessageSquare },
            { id: "faqs", label: "Student FAQs", icon: HelpCircle },
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

      {/* TAB 1: OVERVIEW */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Student Academic Info Card */}
          <div className="bg-paper-raised border border-rule rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-rule pb-3 mb-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-brass" />
                <h2 className="font-bold text-ink text-sm">Student Academic Information</h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                {acad.academic_status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-canvas border border-rule/60">
                <div className="text-ink-soft text-[11px]">Student Name</div>
                <div className="font-bold text-ink text-sm mt-0.5">{acad.student_name}</div>
                <div className="text-[10px] text-ink-soft mt-1 font-mono text-brass">{acad.student_id}</div>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-rule/60">
                <div className="text-ink-soft text-[11px]">Branch & Year</div>
                <div className="font-semibold text-ink text-sm mt-0.5">{acad.department}</div>
                <div className="text-[10px] text-ink-soft mt-1">{acad.year} ({acad.section})</div>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-rule/60">
                <div className="text-ink-soft text-[11px]">Cumulative GPA</div>
                <div className="font-bold text-brass text-lg mt-0.5">{acad.cgpa} / 10.0</div>
                <div className="text-[10px] text-ink-soft mt-1">{acad.credits_earned} / {acad.total_credits} Credits</div>
              </div>

              <div className="p-3 rounded-lg bg-canvas border border-rule/60">
                <div className="text-ink-soft text-[11px]">Faculty Mentor</div>
                <div className="font-semibold text-ink text-xs mt-0.5">{acad.mentor_name}</div>
                <div className="text-[10px] text-brass mt-1 truncate">{acad.mentor_contact}</div>
              </div>
            </div>
          </div>

          {/* Quick Reimbursement Alert & Biometric Notice */}
          <div className="bg-brass/10 border border-brass/30 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-ink font-bold text-xs">
              <AlertTriangle size={16} className="text-brass shrink-0" />
              <span>{bioNotice.title || "Physical Biometric Authentication Notice"}</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              {bioNotice.message}
            </p>
            <div className="flex items-center justify-between text-[11px] text-ink-soft pt-1">
              <span>📍 Location: <strong>{bioNotice.room}</strong></span>
              <span>⏰ Timings: <strong>{bioNotice.timings}</strong></span>
            </div>
          </div>

          {/* Two Columns: Reimbursement Snapshot & Active Support Tickets */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reimbursement Snapshot */}
            <div className="bg-paper-raised border border-rule rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                  <Award size={16} className="text-brass" />
                  <span>Fee Reimbursement Snapshot</span>
                </div>
                <span className="text-xs font-bold text-brass">{reimb.application_no}</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Scheme</span>
                  <span className="font-semibold text-ink text-right">{reimb.scheme_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Eligible Amount</span>
                  <span className="font-bold text-success">₹{reimb.eligible_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rule/50">
                  <span className="text-ink-soft">Current Stage</span>
                  <span className="font-semibold text-brass">{reimb.current_stage}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-ink-soft">Thumb Auth Status</span>
                  <span className="font-semibold text-warning">{reimb.thumb_auth_status}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("reimbursement")}
                className="w-full text-xs font-semibold py-2 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink flex items-center justify-center gap-1.5 transition-colors"
              >
                View Full Reimbursement Pipeline <ChevronRight size={13} />
              </button>
            </div>

            {/* Document Services Snapshot */}
            <div className="bg-paper-raised border border-rule rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                  <FileCheck size={16} className="text-brass" />
                  <span>Certificate Requests</span>
                </div>
                <span className="text-xs text-ink-soft">{docs.length} Requests</span>
              </div>

              <div className="space-y-2">
                {docs.slice(0, 3).map((d) => (
                  <div key={d.id} className="p-2.5 rounded-lg bg-canvas border border-rule/60 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-ink">{d.document_type}</div>
                      <div className="text-[10px] text-ink-soft">{d.purpose}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setActiveTab("documents")}
                className="w-full text-xs font-semibold py-2 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink flex items-center justify-center gap-1.5 transition-colors"
              >
                Manage All Certificates <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REIMBURSEMENT PIPELINE */}
      {activeTab === "reimbursement" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Fee Reimbursement Tracker (Jagananna Vidya Deevena)</h2>
              <p className="text-xs text-ink-soft">State Government Post-Matric Scholarship & Fee Reimbursement Progress</p>
            </div>
            {isStaff && (
              <button
                onClick={() => setStatusUpdateModal(true)}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-brass/20 text-brass border border-brass/40 hover:bg-brass/30 flex items-center gap-1.5 self-start cursor-pointer"
              >
                <Plus size={14} /> Update Application Stage
              </button>
            )}
          </div>

          {/* Application Details Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs p-4 rounded-xl bg-canvas border border-rule">
            <div>Application No: <strong className="text-brass font-mono">{reimb.application_no}</strong></div>
            <div>Academic Year: <strong className="text-ink">{reimb.academic_year}</strong></div>
            <div>Sanctioned Fee: <strong className="text-success">₹{reimb.sanctioned_amount?.toLocaleString()}</strong></div>
            <div>College Status: <strong className="text-success">{reimb.college_verification_status}</strong></div>
          </div>

          {/* 5-Stage Visual Progress Tracker */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Multi-Stage Approval Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {stages.map((stage, idx) => {
                const isPassed = idx <= activeStageIdx;
                const isCurrent = idx === activeStageIdx;
                return (
                  <div 
                    key={stage.num}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? "bg-brass/15 border-brass shadow-xs"
                        : isPassed
                        ? "bg-success/10 border-success/30 text-ink"
                        : "bg-canvas border-rule text-ink-soft opacity-60"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isPassed ? "bg-success text-paper" : "bg-rule text-ink-soft"
                        }`}>
                          {isPassed ? <CheckCircle2 size={14} /> : stage.num}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-brass text-paper font-bold uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-xs text-ink leading-tight">{stage.label}</div>
                    </div>
                    <div className="text-[10px] text-ink-soft mt-2 pt-1 border-t border-rule/50">{stage.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Physical Thumb Auth Requirement Notice */}
          <div className="p-4 rounded-xl bg-canvas border border-rule space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-brass">
              <Shield size={16} />
              <span>Biometric / Thumb Authentication Step (Room A-102)</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              As per State Social Welfare Department regulations, student biometric authentication is mandatory.
              Please visit <strong>Room A-102 (CFSS Counter, Administrative Block)</strong> between 10:00 AM and 4:00 PM with your original Aadhaar Card.
            </p>
            <div className="p-2.5 rounded-lg bg-paper border border-rule text-[11px] text-ink flex items-center justify-between">
              <span>Current Auth Status: <strong className="text-warning">{reimb.thumb_auth_status}</strong></span>
              <span className="text-ink-soft">{reimb.thumb_auth_notes}</span>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Required Supporting Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {[
                { name: "AP EAPCET / ICET Allotment Order", status: "Verified" },
                { name: "MRO Income Certificate (Valid for 2026)", status: "Verified" },
                { name: "Integrated Caste Certificate", status: "Verified" },
                { name: "Student Aadhaar Card Copy", status: "Verified" },
                { name: "Mother / Guardian Bank Passbook Copy", status: "Verified" },
                { name: "Previous Semester Marks Memo", status: "Pending Verification" },
              ].map((doc, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-canvas border border-rule/70 flex items-center justify-between">
                  <span className="font-medium text-ink">{doc.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.status === 'Verified' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT SERVICES */}
      {activeTab === "documents" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">College Document & Certificate Services</h2>
              <p className="text-xs text-ink-soft">Request official Bonafide, Study, Conduct, Fee Estimate, and Scholarship certificates</p>
            </div>
            <button
              onClick={() => setDocModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus size={14} /> Request New Certificate
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-rule bg-canvas text-ink-soft">
                  <th className="py-2.5 px-3 font-semibold">Certificate Type</th>
                  <th className="py-2.5 px-3 font-semibold">Purpose</th>
                  <th className="py-2.5 px-3 font-semibold">Copies</th>
                  <th className="py-2.5 px-3 font-semibold">Date Requested</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Remarks / Instructions</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {docs.map((d) => (
                  <tr key={d.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-ink">{d.document_type}</td>
                    <td className="py-3 px-3 text-ink-soft max-w-[200px] truncate">{d.purpose}</td>
                    <td className="py-3 px-3 font-mono">{d.copies}</td>
                    <td className="py-3 px-3 text-ink-soft">{d.submitted_at?.slice(0, 10)}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        d.status === 'Approved' || d.status === 'Ready'
                          ? 'bg-success/15 text-success border-success/30'
                          : 'bg-warning/15 text-warning border-warning/30'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-ink-soft text-[11px] max-w-[220px]">{d.remarks}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleViewCertificate(d.id)}
                        className="text-xs font-semibold px-2.5 py-1 rounded bg-canvas hover:bg-paper border border-rule text-brass flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Download size={12} /> Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT DEAN OFFICE */}
      {activeTab === "dean" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="border-b border-rule pb-4">
            <h2 className="text-base font-bold text-ink">Student Affairs & Welfare Directorate</h2>
            <p className="text-xs text-ink-soft">Office of the Dean, Student Affairs — QIS College of Engineering and Technology</p>
          </div>

          {/* Dean Profile Banner */}
          <div className="p-5 rounded-2xl bg-canvas border border-rule flex flex-col md:flex-row gap-5 items-start">
            <div className="w-16 h-16 rounded-2xl bg-brass/20 text-brass flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
              <User size={32} />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-ink">{dean.dean_name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brass/15 text-brass">
                  Student Affairs
                </span>
              </div>
              <div className="text-xs font-semibold text-brass">{dean.designation}</div>
              <p className="text-xs text-ink-soft leading-relaxed pt-1">
                {dean.responsibilities}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-3 mt-2 border-t border-rule/60">
                <div className="flex items-center gap-1.5 text-ink-soft">
                  <MapPin size={13} className="text-brass shrink-0" />
                  <span>{dean.office_location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-soft">
                  <Clock size={13} className="text-brass shrink-0" />
                  <span>{dean.office_timings}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-soft">
                  <Mail size={13} className="text-brass shrink-0" />
                  <span>{dean.contact_email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Guidelines */}
          <div className="p-4 rounded-xl bg-paper border border-rule space-y-2">
            <div className="font-bold text-xs text-ink flex items-center gap-1.5">
              <Shield size={14} className="text-brass" />
              <span>Guidelines for Meeting the Dean of Student Affairs</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              {dean.instructions}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setTicketModalOpen(true)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare size={13} /> Schedule Consultation / Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT TICKETS */}
      {activeTab === "tickets" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rule pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">Student Support Helpdesk (CFSS)</h2>
              <p className="text-xs text-ink-soft">Direct student inquiries, scholarship assistance, and welfare support tickets</p>
            </div>
            <button
              onClick={() => setTicketModalOpen(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Plus size={14} /> Open Support Ticket
            </button>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-canvas border border-rule/70 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brass">#{t.id}</span>
                    <span className="font-bold text-xs text-ink">{t.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-paper text-ink-soft border border-rule">
                      {t.category}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    t.status === 'Resolved' || t.status === 'Closed'
                      ? 'bg-success/15 text-success border-success/30'
                      : 'bg-warning/15 text-warning border-warning/30'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <p className="text-xs text-ink-soft leading-relaxed">{t.description}</p>

                {t.response && (
                  <div className="p-3 rounded-lg bg-paper border border-rule text-xs space-y-1">
                    <div className="font-bold text-ink text-[11px] flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-success" />
                      <span>Response from {t.assigned_to}:</span>
                    </div>
                    <p className="text-ink-soft leading-relaxed">{t.response}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-ink-soft pt-1 border-t border-rule/50">
                  <span>Submitted: {t.submitted_at?.slice(0, 10)}</span>
                  {isStaff && !t.response && (
                    <button
                      onClick={() => setTicketReplyModal(t.id)}
                      className="text-brass hover:underline font-semibold cursor-pointer"
                    >
                      Reply to Ticket
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAQS */}
      {activeTab === "faqs" && (
        <div className="bg-paper-raised border border-rule rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-rule pb-3">
            <h2 className="text-base font-bold text-ink">Student Support Section (CFSS) FAQs</h2>
            <p className="text-xs text-ink-soft">Common queries regarding certificates, fee reimbursement, and student welfare</p>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { q: "How do I complete biometric thumb authentication for JVD fee reimbursement?", a: "Visit Room A-102 (CFSS Helpdesk) in the Administrative Block between 10:00 AM and 4:00 PM with your original Aadhaar card. College operators will initiate the UIDAI e-KYC prompt." },
              { q: "How many days does it take to obtain a Bonafide Certificate?", a: "Standard requests submitted via CFSS portal are verified within 24 working hours. You can download the verified digital copy or collect the embossed hardcopy from Room A-102." },
              { q: "Can I meet the Dean of Student Affairs without prior appointment?", a: "For urgent matters, students may visit during open office hours (2:30 PM – 4:30 PM). However, booking a token via the CFSS counter ensures immediate consultation." },
              { q: "What should I do if my attendance falls below 75%?", a: "Students with attendance between 65% and 75% due to valid medical reasons must submit authentic medical certificates to the Dean Office within 3 days for condonation review." }
            ].map((faq, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-canvas border border-rule/70 space-y-1">
                <div className="font-bold text-ink">{faq.q}</div>
                <div className="text-ink-soft leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REQUEST CERTIFICATE MODAL */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-rule rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="font-bold text-ink text-base">Request Official Certificate</h3>
              <button onClick={() => setDocModalOpen(false)} className="p-1 rounded hover:bg-canvas text-ink-soft">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRequestDoc} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ink-soft mb-1 font-medium">Certificate Type</label>
                <select
                  value={docForm.document_type}
                  onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                >
                  <option value="Bonafide Certificate">Bonafide Certificate</option>
                  <option value="Study & Conduct Certificate">Study & Conduct Certificate</option>
                  <option value="Fee Estimate Certificate (Bank Loan)">Fee Estimate Certificate (Bank Loan)</option>
                  <option value="Scholarship Endorsement Certificate">Scholarship Endorsement Certificate</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Passport Application / Education Loan / Internship"
                  value={docForm.purpose}
                  onChange={(e) => setDocForm({ ...docForm, purpose: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Number of Copies</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={docForm.copies}
                  onChange={(e) => setDocForm({ ...docForm, copies: parseInt(e.target.value) || 1 })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass font-mono"
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Additional Remarks (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Any specific department or sponsor details..."
                  value={docForm.remarks}
                  onChange={(e) => setDocForm({ ...docForm, remarks: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 font-semibold py-2.5 rounded-lg bg-ink text-paper hover:bg-ink/90 cursor-pointer"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 font-semibold py-2.5 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SUPPORT TICKET MODAL */}
      {ticketModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-rule rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="font-bold text-ink text-base">Open Support Ticket (CFSS)</h3>
              <button onClick={() => setTicketModalOpen(false)} className="p-1 rounded hover:bg-canvas text-ink-soft">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ink-soft mb-1 font-medium">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                >
                  <option value="Scholarship & Reimbursement">Scholarship & Reimbursement (JVD)</option>
                  <option value="Examination & Hall Ticket">Examination & Hall Ticket</option>
                  <option value="Fee & Accounts Clearance">Fee & Accounts Clearance</option>
                  <option value="Hostel & Food Facilities">Hostel & Food Facilities</option>
                  <option value="Academic & Attendance Support">Academic & Attendance Support</option>
                  <option value="General Student Grievance">General Student Grievance</option>
                </select>
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  placeholder="Summary of the issue..."
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                  required
                />
              </div>

              <div>
                <label className="block text-ink-soft mb-1 font-medium">Detailed Description</label>
                <textarea
                  rows={4}
                  placeholder="Explain your request or issue in detail..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full bg-canvas border border-rule rounded-lg px-3 py-2 outline-none focus:border-brass"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 font-semibold py-2.5 rounded-lg bg-ink text-paper hover:bg-ink/90 cursor-pointer"
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={() => setTicketModalOpen(false)}
                  className="px-4 font-semibold py-2.5 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {certPreviewModal && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper-raised border border-rule rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-3">
              <h3 className="font-bold text-ink text-base">Certificate Preview</h3>
              <button onClick={() => setCertPreviewModal(null)} className="p-1 rounded hover:bg-canvas text-ink-soft">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 rounded-xl bg-canvas border-2 border-brass/30 text-center space-y-4 font-serif">
              <div className="text-xs tracking-wider text-brass uppercase font-bold">
                {certPreviewModal.institution}
              </div>
              <div className="text-[10px] text-ink-soft">
                {certPreviewModal.affiliation}
              </div>
              <div className="text-sm font-bold text-ink underline tracking-wide pt-2">
                {certPreviewModal.certificate_title}
              </div>
              <p className="text-xs text-ink leading-relaxed text-justify px-2 font-sans">
                {certPreviewModal.content}
              </p>
              <div className="flex justify-between items-end pt-6 text-[10px] text-ink-soft font-sans border-t border-rule/50">
                <div>Date: {certPreviewModal.issued_date}</div>
                <div className="text-right">
                  <div className="font-bold text-ink">{certPreviewModal.authorized_signatory}</div>
                  <div className="text-success font-semibold">Digitally Verified</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 font-semibold py-2.5 rounded-lg bg-ink text-paper hover:bg-ink/90 flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Printer size={14} /> Print Certificate
              </button>
              <button
                onClick={() => setCertPreviewModal(null)}
                className="px-4 font-semibold py-2.5 rounded-lg bg-canvas hover:bg-paper border border-rule text-ink cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
