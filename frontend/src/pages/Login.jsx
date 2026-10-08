import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, BookUser, ShieldCheck, ScrollText, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import SmartSearch from "../components/SmartSearch.jsx";

const ROLE_TABS = [
  { key: "student", label: "Student", icon: GraduationCap },
  { key: "faculty", label: "Faculty", icon: BookUser },
  { key: "admin", label: "Admin", icon: ShieldCheck },
];

const DEMO_CREDENTIALS = {
  student: { email: "asha.student@qiscet.edu.in", password: "student123" },
  faculty: { email: "vara.prasad@qiscet.edu.in", password: "faculty123" },
  admin: { email: "admin@qiscet.edu.in", password: "admin123" },
};

export default function Login() {
  const [role, setRole] = useState("student");
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "", year: "" });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function selectRole(key) {
    setRole(key);
    setMode("login");
    setError("");
    setForm({ name: "", email: "", password: "", department: "", year: "" });
  }

  function fillDemo() {
    setForm((f) => ({ ...f, email: DEMO_CREDENTIALS[role].email, password: DEMO_CREDENTIALS[role].password }));
  }

  function triggerError(message) {
    setError(message);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      triggerError("Please fill in both email and password.");
      return;
    }
    if (mode === "register" && !form.name) {
      triggerError("Please tell us your full name.");
      return;
    }

    setLoading(true);
    try {
      let user;
      if (mode === "login") {
        user = await login(form.email, form.password);
      } else {
        user = await register({ ...form, role });
      }
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      triggerError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-canvas text-ink font-body">
      {/* --- Left: Ledger cover panel --- */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-[var(--ink)] text-[var(--paper)] flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 ledger-rule opacity-[0.06] pointer-events-none" />
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, var(--brass) 0%, transparent 70%)", opacity: 0.18 }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 p-12 flex items-center gap-3.5">
          <img
            src="/qis-logo.png"
            alt="QIS College of Engineering and Technology Logo"
            className="w-12 h-12 rounded-full object-contain bg-white/10 p-1 border-2 border-brass shadow-md glow-brass shrink-0"
          />
          <div>
            <div className="font-display text-xl tracking-wide font-bold">QISCET</div>
            <div className="font-mono text-[10px] text-brass uppercase tracking-wider">Campus Assistant</div>
          </div>
        </div>

        <div className="relative z-10 px-12 pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl leading-[1.1] mb-6"
          >
            Every question,<br />entered in the<br /><span className="text-brass italic">ledger.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-[var(--paper)]/70 max-w-sm leading-relaxed"
          >
            Fees, exam schedules, faculty contacts, and campus notices — answered
            instantly, whether you're online in the library or offline in the hostel.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex gap-6 font-mono text-xs text-[var(--paper)]/50"
          >
            <div>QIS College of Engineering and Technology</div>
            <div>Autonomous · Est. 1998</div>
            <div>Volume XLI</div>
          </motion.div>
        </div>
      </div>

      {/* --- Right: Sign-in card --- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Mobile institution header */}
          <div className="lg:hidden flex flex-col items-center mb-5 text-center">
            <img
              src="/qis-logo.png"
              alt="QIS College Logo"
              className="w-14 h-14 rounded-full object-contain bg-white/20 p-1 border-2 border-brass shadow-md glow-brass mb-1.5"
            />
            <h2 className="font-display text-base font-bold text-ink">QIS College of Engineering & Technology</h2>
            <span className="text-[10px] font-mono text-brass">Autonomous · Est. 1998 · Ongole</span>
          </div>

          {/* Folder tabs */}
          <div className="flex gap-1 mb-0 relative">
            {ROLE_TABS.map(({ key, label, icon: Icon }) => {
              const active = role === key;
              return (
                <button
                  key={key}
                  onClick={() => selectRole(key)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-3 rounded-t-lg text-sm font-medium transition-colors
                    ${active ? "text-ink bg-paper-raised" : "text-ink-soft bg-transparent hover:text-ink"}`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-t-lg bg-paper-raised border border-b-0 border-rule -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="bg-paper-raised border border-rule rounded-b-xl rounded-tr-xl p-8 shadow-ledger"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={role + mode}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="font-display text-2xl mb-1 capitalize">
                  {mode === "login" ? `${role} sign-in` : `Create ${role} account`}
                </h2>
                <p className="text-ink-soft text-sm mb-4">
                  {mode === "login" ? "Enter your credentials to open your dashboard." : "A few details and you're in."}
                </p>

                {role === "faculty" && (
                  <div className="mb-5 p-3 rounded-2xl bg-paper border border-brass/30 shadow-sm relative">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-brass font-semibold flex items-center gap-1.5">
                        <Sparkles size={12} className="text-brass" />
                        Faculty Smart AI Search
                      </span>
                      <span className="text-[10px] font-mono text-ink-soft/70">Curriculum &amp; Directory</span>
                    </div>
                    <SmartSearch
                      placeholder="Search Python, ML, faculty, cabins…"
                      compact={true}
                      onSelect={(item) => {
                        if (!item || !item.title) return;
                        const t = item.title.toLowerCase();
                        if (t.includes("vara prasad") || t.includes("vara")) {
                          setForm((f) => ({ ...f, email: "vara.prasad@qiscet.edu.in", password: "faculty123" }));
                        } else if (t.includes("bujji babu") || t.includes("bujji")) {
                          setForm((f) => ({ ...f, email: "hod.cse@qiscet.edu.in", password: "faculty123" }));
                        } else if (t.includes("avinash")) {
                          setForm((f) => ({ ...f, email: "avinash@qiscet.edu.in", password: "faculty123" }));
                        } else if (t.includes("sunitha")) {
                          setForm((f) => ({ ...f, email: "sunitha@qiscet.edu.in", password: "faculty123" }));
                        }
                      }}
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {mode === "register" && (
                    <Field label="Full name">
                      <input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="ledger-input"
                        placeholder="e.g. Asha Rao"
                      />
                    </Field>
                  )}

                  <Field label="Email address">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="ledger-input"
                      placeholder="you@college.edu"
                    />
                  </Field>

                  <Field label="Password">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="ledger-input pr-10"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-brass transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Field>

                  {mode === "register" && role !== "admin" && (
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Department">
                        <input
                          value={form.department}
                          onChange={(e) => updateField("department", e.target.value)}
                          className="ledger-input"
                          placeholder="Computer Science"
                        />
                      </Field>
                      {role === "student" && (
                        <Field label="Year">
                          <input
                            value={form.year}
                            onChange={(e) => updateField("year", e.target.value)}
                            className="ledger-input"
                            placeholder="3rd Year"
                          />
                        </Field>
                      )}
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-danger text-sm mt-4 overflow-hidden"
                    >
                      <AlertCircle size={15} className="shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 py-3 rounded-lg bg-ink text-paper font-medium tracking-wide
                    hover:bg-brass hover:text-ink transition-colors duration-300 disabled:opacity-60"
                >
                  {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </motion.button>

                {/* Autofill demo button removed as requested */}

                {role !== "admin" && (
                  <p className="text-center text-sm text-ink-soft mt-5">
                    {mode === "login" ? "New here? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode((m) => (m === "login" ? "register" : "login"));
                        setError("");
                      }}
                      className="text-brass font-medium hover:underline"
                    >
                      {mode === "login" ? "Create an account" : "Sign in instead"}
                    </button>
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.form>
        </motion.div>
      </div>

      <style>{`
        .ledger-input {
          width: 100%;
          background: var(--paper);
          border: 1px solid var(--rule);
          color: var(--ink);
          border-radius: 0.5rem;
          padding: 0.65rem 0.85rem;
          font-size: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ledger-input::placeholder { color: var(--ink-soft); opacity: 0.6; }
        .ledger-input:focus {
          outline: none;
          border-color: var(--brass);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--brass) 20%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">{label}</span>
      {children}
    </label>
  );
}
