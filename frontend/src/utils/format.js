export const SOURCE_LABELS = {
  faq: { label: "FAQ · Instant", variant: "success" },
  "rag+online": { label: "RAG · Online", variant: "brass" },
  "rag+ollama": { label: "RAG · Offline (Ollama)", variant: "neutral" },
  "rag+offline": { label: "RAG · Offline Fallback", variant: "danger" },
  student_timetable_db: { label: "Student Timetable · Live e-CAP", variant: "brass" },
};

export function sourceMeta(source) {
  return SOURCE_LABELS[source] || { label: source || "Unknown", variant: "neutral" };
}

export function timeAgo(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
