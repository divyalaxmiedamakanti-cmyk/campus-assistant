import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, User, BookOpen, Layers, Sparkles, CheckCircle } from "lucide-react";

function getTypeStyle(type = "") {
  const t = type.toLowerCase();
  if (t.includes("lab")) {
    return {
      badge: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30",
      accent: "border-l-4 border-l-emerald-500",
      label: "Lab"
    };
  }
  if (t.includes("project")) {
    return {
      badge: "bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30",
      accent: "border-l-4 border-l-purple-500",
      label: "Project"
    };
  }
  if (t.includes("cert") || t.includes("skill")) {
    return {
      badge: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      accent: "border-l-4 border-l-amber-500",
      label: "Certification"
    };
  }
  if (t.includes("online")) {
    return {
      badge: "bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/30",
      accent: "border-l-4 border-l-cyan-500",
      label: "Online"
    };
  }
  return {
    badge: "bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30",
    accent: "border-l-4 border-l-blue-500",
    label: "Theory"
  };
}

export default function TimetableBoxCard({ timetable, rawText }) {
  if (!timetable || !timetable.cards || timetable.cards.length === 0) {
    // Fallback: If raw text has box characters, render clean formatted monospace block
    return (
      <div className="font-mono text-[12px] leading-relaxed whitespace-pre overflow-x-auto p-3 rounded-xl bg-canvas border border-rule/80 text-ink">
        {rawText}
      </div>
    );
  }

  const { view_type, title, cards, section, day, subject } = timetable;

  // For weekly view, allow switching days
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Active day group
  const activeGroup = view_type === "weekly" ? cards[selectedDayIdx] || cards[0] : null;

  return (
    <div className="w-full flex flex-col gap-2.5 my-1">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-paper-raised border border-brass/30 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center shrink-0">
            <Calendar size={15} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-ink truncate leading-tight">
              {title || "Class Timetable"}
            </div>
            <div className="text-[10px] text-ink-soft flex items-center gap-1.5">
              {section && <span className="font-semibold text-brass">{section}</span>}
              {day && <span>• {day}</span>}
              {subject && <span>• {subject}</span>}
            </div>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-brass/10 text-brass text-[10px] font-bold shrink-0 border border-brass/20">
          Verified e-CAP
        </div>
      </div>

      {/* If Weekly: Day Tabs */}
      {view_type === "weekly" && (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {cards.map((grp, idx) => {
            const isSelected = idx === selectedDayIdx;
            const shortDay = grp.day ? grp.day.slice(0, 3) : `D${idx + 1}`;
            return (
              <button
                key={grp.day || idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-ink text-paper shadow-sm font-semibold border border-ink"
                    : "bg-paper text-ink-soft hover:bg-canvas hover:text-ink border border-rule"
                }`}
              >
                <span>{shortDay}</span>
                <span className={`text-[9px] px-1 rounded-full ${isSelected ? "bg-brass text-ink font-bold" : "bg-rule text-ink-soft"}`}>
                  {grp.periods?.length || 0}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Period Boxes */}
      <div className="flex flex-col gap-2">
        {view_type === "weekly" ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDayIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-2"
            >
              {activeGroup?.periods?.map((p, pIdx) => (
                <PeriodBox key={pIdx} period={p} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : view_type === "subject_search" ? (
          // Grouped search results
          <div className="flex flex-col gap-3">
            {cards.map((grp, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-1.5">
                <div className="text-[11px] font-bold text-ink-soft uppercase tracking-wider flex items-center gap-1 px-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brass" />
                  {grp.section} — {grp.day}
                </div>
                {grp.periods?.map((p, pIdx) => (
                  <PeriodBox key={pIdx} period={p} showSection={false} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          // Single day view
          cards[0]?.periods?.map((p, pIdx) => (
            <PeriodBox key={pIdx} period={p} />
          ))
        )}
      </div>
    </div>
  );
}

function PeriodBox({ period, showSection = false }) {
  const pNo = period.period_no;
  const time = period.period_time;
  const subj = period.subject;
  const fac = period.faculty;
  const rm = period.room;
  const stype = period.subject_type || "Theory";
  const batch = period.batch_info;
  const style = getTypeStyle(stype);

  const isOnline = rm && rm.toLowerCase().includes("online");

  return (
    <div
      className={`rounded-xl border border-rule bg-paper p-3 shadow-xs hover:border-brass/60 transition-all flex flex-col gap-1.5 ${style.accent}`}
    >
      {/* Top row: Period #, Timing, Type Pill */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ink text-paper">
            P{pNo}
          </span>
          <span className="text-[11px] font-mono text-ink-soft flex items-center gap-1">
            <Clock size={11} className="text-brass shrink-0" />
            {time}
          </span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge}`}>
          {style.label}
        </span>
      </div>

      {/* Subject Title */}
      <div className="text-sm font-bold text-ink leading-tight flex items-start justify-between gap-2">
        <span>{subj}</span>
        {showSection && period.section && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-canvas text-ink-soft border border-rule shrink-0">
            {period.section}
          </span>
        )}
      </div>

      {/* Bottom row: Faculty, Room, Batch */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink-soft pt-0.5 border-t border-rule/50">
        {fac && fac !== "Staff" && fac !== "Faculty not assigned" && (
          <div className="flex items-center gap-1">
            <User size={11} className="text-ink-soft/70 shrink-0" />
            <span className="truncate max-w-[170px]" title={fac}>{fac}</span>
          </div>
        )}

        <div className="flex items-center gap-1 font-medium">
          <MapPin size={11} className={isOnline ? "text-cyan-600 shrink-0" : "text-brass shrink-0"} />
          <span className={isOnline ? "text-cyan-700 font-semibold" : "text-ink"}>
            {rm || "Classroom TBA"}
          </span>
        </div>

        {batch && (
          <div className="text-[10px] text-ink-soft/80 italic">
            ({batch})
          </div>
        )}
      </div>
    </div>
  );
}
