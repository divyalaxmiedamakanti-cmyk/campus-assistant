import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, ScrollText, Maximize2, Minimize2, Calendar } from "lucide-react";
import client from "../api/client.js";
import Badge from "./ui/Badge.jsx";
import { sourceMeta } from "../utils/format.js";
import { useAuth } from "../context/AuthContext.jsx";
import TimetableBoxCard from "./TimetableBoxCard.jsx";
import CampusBoxCard from "./CampusBoxCard.jsx";

const STUDENT_QUICK_REPLIES = [
  "ECE 1 timetable show me",
  "AID 1 Monday lo ela class vuntundi?",
  "Examinations schedule show me",
  "Attendance entha undi?",
  "Mess lo food menu emundi?",
  "Hostel room allocation details",
  "Library catalog books",
  "College fee structure entha?",
  "Where is Dr. Vara Prasad right now?",
];

const FACULTY_QUICK_REPLIES = [
  "Which subjects am I teaching?",
  "Which section am I teaching Machine Learning?",
  "How many students do I have in total?",
  "What is my timetable for this week?",
  "How many students submitted the assignment?",
  "What is my online class day?",
];

const ADMIN_QUICK_REPLIES = [
  "Who is the Principal and how to contact?",
  "Who is the Exam Controller and where is the exam cell?",
  "What is the college fee structure for B.Tech?",
  "Show college administration directory",
  "How do students submit grievances?",
];

const STUDENT_WELCOME = "Hi! I'm your QISCET Campus Assistant. Ask me anything about student information (fees, attendance, exams, placements, hostel), faculty information (subjects, timetable, professors), or administration details!";
const FACULTY_WELCOME = "Hi! I'm your QISCET Assistant. Ask me anything about your teaching profile, sections, timetable, students, or campus administration!";
const ADMIN_WELCOME = "Hi! I'm your QISCET Assistant. Ask me about administration, faculty workloads, student statistics, fee structures, or campus governance!";

export default function ChatWidget() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const quickReplies = role === "faculty" ? FACULTY_QUICK_REPLIES : (role === "admin" ? ADMIN_QUICK_REPLIES : STUDENT_QUICK_REPLIES);

  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([{
    id: "welcome",
    role: "assistant",
    text: role === "faculty" ? FACULTY_WELCOME : (role === "admin" ? ADMIN_WELCOME : STUDENT_WELCOME),
    source: null,
  }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  async function sendMessage(text) {
    const query = (text ?? input).trim();
    if (!query || typing) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", text: query };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const { data } = await client.post("/query", { query });
      setMessages((m) => [
        ...m,
        {
          id: data.chat_id,
          role: "assistant",
          text: data.answer,
          source: data.source,
          intent: data.intent,
          frustrated: data.frustrated,
          timetable: data.timetable,
          structured_card: data.structured_card,
          feedback: null,
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: err.response?.data?.error || "Something went wrong reaching the assistant. Please try again.",
          source: "rag+offline",
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  async function rate(msg, rating) {
    if (msg.feedback || !msg.id) return;
    setMessages((m) => m.map((x) => (x.id === msg.id ? { ...x, feedback: rating } : x)));
    try {
      await client.post("/feedback", { chat_id: msg.id, rating });
    } catch {
      /* non-blocking */
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {!open && <div className="absolute inset-0 rounded-full bg-brass/35 pulse-ring pointer-events-none" />}
        <motion.button
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.1, boxShadow: "0 0 28px rgba(169, 118, 31, 0.5)" }}
          whileTap={{ scale: 0.92 }}
          className="relative w-14 h-14 rounded-full bg-ink text-brass shadow-2xl border-2 border-brass flex items-center justify-center transition-all cursor-pointer"
          aria-label="Open Campus Assistant chat"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "chat"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {open ? <X size={22} /> : <MessageCircle size={22} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className={`fixed bottom-24 right-4 sm:right-6 z-40 transition-all duration-300 rounded-3xl border-2 border-brass
              bg-paper shadow-[0_16px_50px_-8px_rgba(15,30,54,0.4)] flex flex-col overflow-hidden ${
                isExpanded
                  ? "w-[96vw] sm:w-[580px] md:w-[680px] h-[38rem] max-h-[88vh]"
                  : "w-[94vw] sm:w-[460px] md:w-[500px] h-[35rem] max-h-[80vh]"
              }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--ink)] text-[var(--paper)] border-b border-brass/20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full border border-brass/60 bg-brass/10 flex items-center justify-center glow-brass shrink-0">
                  <ScrollText size={15} className="text-brass" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold leading-none flex items-center gap-1.5 truncate">
                    <span>QISCET Campus Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  </div>
                  <div className="text-[10px] text-[var(--paper)]/50 mt-1 truncate">Student · Faculty · Admin Helpdesk</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsExpanded((e) => !e)}
                  className="w-7 h-7 rounded-lg text-paper/70 hover:text-brass hover:bg-paper/10 flex items-center justify-center transition-colors cursor-pointer"
                  title={isExpanded ? "Collapse width" : "Expand width"}
                >
                  {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg text-paper/70 hover:text-paper hover:bg-paper/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close chat"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-canvas/40">
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} onRate={rate} />
              ))}
              {typing && <TypingBubble />}
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 pt-2 bg-canvas/40 flex flex-wrap gap-2">
                {quickReplies.map((q) => (
                  <motion.button
                    key={q}
                    onClick={() => sendMessage(q)}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-rule/80 bg-paper text-ink-soft hover:border-brass hover:text-brass hover:shadow-md transition-all font-medium cursor-pointer shadow-sm"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 px-3 py-3 border-t border-rule bg-paper-raised"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={role === "faculty" ? "Ask about your subjects, sections, students…" : "Ask: ECE 1 timetable, AID 1 Monday class, DWDM class…"}
                className="flex-1 bg-canvas border border-rule rounded-full px-4 py-2 text-sm outline-none focus:border-brass transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!input.trim() || typing}
                className="w-9 h-9 rounded-full bg-ink text-brass flex items-center justify-center disabled:opacity-40 shrink-0 cursor-pointer"
              >
                <Send size={15} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ msg, onRate }) {
  const isUser = msg.role === "user";
  const meta = msg.source ? sourceMeta(msg.source) : null;
  const hasStructuredCard = !!msg.structured_card;
  const hasTimetable = !!msg.timetable || (typeof msg.text === "string" && (msg.text.includes("┌─") || msg.text.includes("### 📅") || msg.text.includes("### 📚") || msg.text.includes("### 🔍")));
  const isWideCard = hasStructuredCard || hasTimetable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
    >
      <div className={`${isWideCard ? "w-full max-w-[98%]" : "max-w-[85%]"} ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`w-full px-4 py-2.5 text-sm leading-relaxed rounded-2xl border ${
            isUser
              ? "bg-ink text-paper border-ink rounded-br-sm"
              : "bg-paper text-ink border-rule rounded-bl-sm shadow-xs"
          }`}
        >
          {hasStructuredCard ? (
            <CampusBoxCard card={msg.structured_card} />
          ) : hasTimetable ? (
            <TimetableBoxCard timetable={msg.timetable} rawText={msg.text} />
          ) : (
            <FormattedText text={msg.text} />
          )}
        </div>

        {!isUser && meta && (
          <div className="flex items-center gap-2 px-1">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onRate(msg, "up")}
                className={`p-1 rounded transition-colors ${msg.feedback === "up" ? "text-success" : "text-ink-soft hover:text-success"}`}
              >
                <ThumbsUp size={13} />
              </button>
              <button
                onClick={() => onRate(msg, "down")}
                className={`p-1 rounded transition-colors ${msg.feedback === "down" ? "text-danger" : "text-ink-soft hover:text-danger"}`}
              >
                <ThumbsDown size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
      <div className="bg-paper border border-rule rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-soft animate-blink"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function FormattedText({ text }) {
  if (!text) return null;
  if (typeof text !== "string") return String(text);

  const cleaned = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?ul>/gi, "\n")
    .replace(/<\/?ol>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n");

  const lines = cleaned.split("\n");

  return (
    <div className="space-y-1.5 break-words">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        const formatted = renderInlineMarkdown(trimmed);

        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("*")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-brass shrink-0 mt-0.5 font-bold">•</span>
              <span className="flex-1">{renderInlineMarkdown(trimmed.replace(/^[-*•]\s*/, ""))}</span>
            </div>
          );
        }

        return <div key={idx}>{formatted}</div>;
      })}
    </div>
  );
}

function renderInlineMarkdown(str) {
  if (!str) return null;
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      parts.push(str.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index} className="font-semibold">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 text-xs bg-canvas/80 text-brass rounded font-mono border border-rule/50">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < str.length) {
    parts.push(str.substring(lastIdx));
  }
  return parts.length > 0 ? parts : str;
}
