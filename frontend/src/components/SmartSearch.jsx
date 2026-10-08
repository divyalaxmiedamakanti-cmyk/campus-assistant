import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  Sparkles,
  BookOpen,
  UserCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  History,
  Layers,
  MapPin,
  CheckCircle2,
  Code2,
  HelpCircle,
  CornerDownLeft,
} from "lucide-react";
import axios from "axios";

// Local heuristic ontology fallback (for instantaneous offline / zero-latency typing)
const CLIENT_ONTOLOGY = {
  python: {
    exact: ["Python Programming", "Python Functions", "Python Loops"],
    topics: [
      { title: "Python Programming", desc: "Core syntax, data structures & algorithms", type: "course" },
      { title: "Python Functions", desc: "Def syntax, arguments, lambdas & scope", type: "topic" },
      { title: "Python Loops", desc: "For/while loops, comprehensions & generators", type: "topic" },
      { title: "Python for Data Science", desc: "Pandas, NumPy, Matplotlib & data processing", type: "course" },
      { title: "Python Machine Learning", desc: "Scikit-Learn, models & pipelines", type: "topic" },
      { title: "Python Projects", desc: "Capstone web apps, automation & AI scripts", type: "project" },
    ],
    similar: ["Data Structures in Python", "Python Django / Flask"],
  },
  "machine learning": {
    exact: ["Machine Learning", "Course 23AI501 (Machine Learning)"],
    topics: [
      { title: "Supervised Learning", desc: "Labeled datasets, regression & classification", type: "topic" },
      { title: "Unsupervised Learning", desc: "Clustering, PCA & anomaly detection", type: "topic" },
      { title: "Deep Learning", desc: "Multi-layer artificial neural networks", type: "topic" },
      { title: "Neural Networks", desc: "Perceptrons, backpropagation & transformers (23CS503)", type: "course" },
      { title: "Classification", desc: "SVM, Decision Trees, Random Forest & Naive Bayes", type: "topic" },
      { title: "Regression", desc: "Linear & polynomial model predictions", type: "topic" },
    ],
    similar: ["Deep Learning Lab", "Dr. Vara Prasad ML"],
  },
  fee: {
    exact: ["CFRO College Fee Related Office", "Fee Structure 2026-2027", "Pay Tuition Fee"],
    topics: [
      { title: "CFRO Fee Portal", desc: "View total, paid, and pending fee breakdown", type: "section", tab: "cfro" },
      { title: "Tuition & Exam Fees", desc: "Autonomous R23 Regulation fee heads", type: "fee", tab: "cfro" },
      { title: "Fee Receipts & Challan", desc: "Download electronic fee receipts", type: "receipt", tab: "cfro" },
    ],
    similar: ["JVD Fee Reimbursement", "Vasathi Deevena", "Hostel Fee"],
  },
  cfro: {
    exact: ["CFRO Office", "College Fee Related Office"],
    topics: [
      { title: "CFRO Dashboard", desc: "Official fees and student financial ledger", type: "section", tab: "cfro" },
      { title: "Fee Deadlines", desc: "Semester exam and tuition payment due dates", type: "deadline", tab: "cfro" },
    ],
    similar: ["Fee Receipts", "CFSS Section"],
  },
  cfss: {
    exact: ["CFSS Student Support Section", "Fee Reimbursement Tracker", "Bonafide Certificate"],
    topics: [
      { title: "CFSS Student Support", desc: "Academic info, documents, and Dean office", type: "section", tab: "cfss" },
      { title: "JVD Fee Reimbursement", desc: "Multi-stage tracking & Room A-102 thumb auth", type: "reimbursement", tab: "cfss" },
      { title: "Document Services", desc: "Request Bonafide, Study, and Loan certificates", type: "document", tab: "cfss" },
      { title: "Student Dean Office", desc: "Room A-101, Dr. Vasu Babu", type: "dean", tab: "cfss" },
    ],
    similar: ["Scholarships", "Support Tickets", "Dean Guidelines"],
  },
  reimbursement: {
    exact: ["Jagananna Vidya Deevena (JVD)", "Biometric Thumb Authentication Room A-102"],
    topics: [
      { title: "Reimbursement Pipeline", desc: "College verification to Treasury disbursement", type: "reimbursement", tab: "cfss" },
      { title: "Room A-102 Biometric Auth", desc: "Physical thumb impression for JVD e-KYC", type: "notice", tab: "cfss" },
    ],
    similar: ["CFSS Section", "Income Certificate", "Scholarship Desk"],
  },
};

const DEFAULT_POPULAR = [
  { title: "CFRO Fee Portal", category: "Accounts", desc: "Breakdown, receipts & payment deadlines", icon: "wallet" },
  { title: "JVD Fee Reimbursement", category: "CFSS Support", desc: "Multi-stage tracker & Room A-102 biometric", icon: "sparkles" },
  { title: "Python Programming", category: "Curriculum", desc: "Core syntax, functions & data science", icon: "code" },
  { title: "Machine Learning", category: "Course 23AI501", desc: "Supervised, unsupervised & neural nets", icon: "sparkles" },
  { title: "Dr. Vara Prasad", category: "Faculty HOD", desc: "Cabin 204, CSE & AIML HOD, Machine Learning", icon: "user" },
  { title: "Dr. Bujji Babu", category: "Faculty HOD", desc: "CSE HOD, CSE Department Block", icon: "user" },
  { title: "Supervised Learning", category: "AI Topic", desc: "Classification & regression algorithms", icon: "sparkles" },
  { title: "Neural Networks", category: "Course 23CS503", desc: "Room CS-205 · Deep neural networks", icon: "layers" },
  { title: "Attendance 75% Rule", category: "Policy", desc: "R23 autonomous academic regulations", icon: "book" },
];

export default function SmartSearch({
  placeholder = "Search topics (e.g. Python, Machine Learning), faculty, or rooms…",
  onSelect,
  className = "",
  initialValue = "",
  compact = false,
  autoFocus = false,
}) {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState({
    exact_matches: [],
    related_topics: [],
    related_keywords: [],
    similar_searches: [],
    popular_searches: DEFAULT_POPULAR,
    suggestions: DEFAULT_POPULAR,
    corrected_query: null,
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("qiscet_smart_recent_searches");
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not read recent searches:", e);
    }
  }, []);

  function saveRecentSearch(itemTitle) {
    if (!itemTitle) return;
    try {
      const updated = [itemTitle, ...recentSearches.filter((s) => s !== itemTitle)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("qiscet_smart_recent_searches", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not persist recent search:", e);
    }
  }

  function clearRecentSearches(e) {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem("qiscet_smart_recent_searches");
    } catch (err) {
      console.warn(err);
    }
  }

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions from Backend API with local fallback
  const fetchSuggestions = useCallback(async (searchWord) => {
    const trimmed = searchWord.trim();
    if (!trimmed) {
      setSuggestionsData({
        exact_matches: [],
        related_topics: [],
        related_keywords: [],
        similar_searches: [],
        popular_searches: DEFAULT_POPULAR,
        suggestions: DEFAULT_POPULAR,
        corrected_query: null,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setActiveIndex(-1);

    try {
      const resp = await axios.get(`/api/smart-search?q=${encodeURIComponent(trimmed)}&limit=10`);
      if (resp.data && resp.data.suggestions) {
        setSuggestionsData(resp.data);
      }
    } catch (err) {
      // Local client heuristic fallback if backend API is unreachable or offline
      const lower = trimmed.toLowerCase();
      let matchedOntology = null;
      for (const [k, v] of Object.entries(CLIENT_ONTOLOGY)) {
        if (lower.includes(k) || k.includes(lower)) {
          matchedOntology = v;
          break;
        }
      }

      if (matchedOntology) {
        setSuggestionsData({
          exact_matches: matchedOntology.exact.map((e) => ({ title: e, category: "Exact Match", desc: `Direct match for ${e}`, icon: "check" })),
          related_topics: matchedOntology.topics.map((t) => ({ ...t, category: "Related Topic", icon: "sparkles" })),
          similar_searches: matchedOntology.similar.map((s) => ({ title: s, category: "Similar Search", icon: "layers" })),
          suggestions: [
            ...matchedOntology.exact.map((e) => ({ title: e, category: "Exact Match", desc: `Direct match for ${e}`, icon: "check" })),
            ...matchedOntology.topics.map((t) => ({ ...t, category: "Related Topic", icon: "sparkles" })),
          ],
          corrected_query: null,
        });
      } else {
        setSuggestionsData({
          exact_matches: [{ title: trimmed, category: "Search Query", desc: `Explore results for "${trimmed}"`, icon: "search" }],
          related_topics: [
            { title: `${trimmed} in Faculty Schedules`, desc: "Find related professors and class timings", icon: "clock" },
            { title: `${trimmed} Syllabus Modules`, desc: "View syllabus details in R23 Autonomous scheme", icon: "book" },
          ],
          similar_searches: [],
          suggestions: [
            { title: trimmed, category: "Search Query", desc: `Explore results for "${trimmed}"`, icon: "search" },
            { title: `${trimmed} in Faculty Schedules`, desc: "Find related professors and class timings", icon: "clock" },
          ],
          corrected_query: null,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced input change
  function handleInputChange(e) {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 180);
  }

  function handleClear() {
    setQuery("");
    setIsOpen(true);
    fetchSuggestions("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (onSelect) {
      onSelect({ title: "", cleared: true });
    }
  }

  function handleSelectSuggestion(item) {
    const title = typeof item === "string" ? item : item.title;
    setQuery(title);
    setIsOpen(false);
    saveRecentSearch(title);

    if (onSelect) {
      onSelect(typeof item === "string" ? { title: item } : item);
    }
  }

  // Keyboard navigation
  const allSuggestions = suggestionsData.suggestions || [];

  function handleKeyDown(e) {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < allSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : allSuggestions.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < allSuggestions.length) {
        handleSelectSuggestion(allSuggestions[activeIndex]);
      } else if (allSuggestions.length > 0) {
        // Default to first most relevant result
        handleSelectSuggestion(allSuggestions[0]);
      } else if (query.trim()) {
        handleSelectSuggestion({ title: query.trim() });
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  // Helper to highlight matching text
  function renderHighlightedText(text, highlight) {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    const cleanHighlight = highlight.trim();
    const parts = text.split(new RegExp(`(${cleanHighlight.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === cleanHighlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-brass/20 text-brass font-semibold px-0.5 rounded border-b border-brass/40"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  }

  // Category icon mapping
  function getCategoryIcon(type, category) {
    const c = (category || "").toLowerCase();
    const t = (type || "").toLowerCase();
    if (t === "course" || c.includes("course") || t === "code") return <BookOpen size={14} className="text-brass" />;
    if (t === "faculty" || c.includes("faculty") || c.includes("user")) return <UserCheck size={14} className="text-emerald-500" />;
    if (t === "classroom" || c.includes("classroom") || c.includes("room")) return <MapPin size={14} className="text-rose-500" />;
    if (t === "policy" || c.includes("policy")) return <CheckCircle2 size={14} className="text-sky-500" />;
    if (t === "similar" || c.includes("similar")) return <Layers size={14} className="text-purple-500" />;
    if (t === "project") return <Code2 size={14} className="text-indigo-500" />;
    return <Sparkles size={14} className="text-brass" />;
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div
        className={`relative flex items-center rounded-2xl bg-paper border transition-all duration-200 shadow-sm
          ${isOpen ? "border-brass ring-2 ring-brass/20 shadow-md" : "border-rule hover:border-brass/60"}
          ${compact ? "py-1 px-3" : "py-2 px-3.5"}`}
      >
        {/* Search / Status Icon */}
        <div className="mr-2 text-ink-soft shrink-0 flex items-center">
          {loading ? (
            <Loader2 size={compact ? 15 : 18} className="animate-spin text-brass" />
          ) : (
            <Search size={compact ? 15 : 18} className="text-brass" />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="Smart Search"
          className="w-full bg-transparent text-ink placeholder:text-ink-soft/70 outline-none text-xs sm:text-sm font-body tracking-wide"
        />

        {/* Action icons: Clear button & Enter badge */}
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {query && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-ink-soft hover:text-ink hover:bg-brass/10 transition-colors"
              title="Clear search"
            >
              <X size={14} />
            </motion.button>
          )}

          <span className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono uppercase text-ink-soft/60 bg-paper-raised px-1.5 py-0.5 rounded border border-rule/50">
            <CornerDownLeft size={10} /> Enter
          </span>
        </div>
      </div>

      {/* Intelligent Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-paper-raised/95 backdrop-blur-xl border border-rule shadow-2xl overflow-hidden max-h-[440px] overflow-y-auto"
            style={{
              boxShadow: "0 18px 38px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(169, 118, 31, 0.15)",
            }}
          >
            {/* Typo Correction Banner if query was misspelled */}
            {suggestionsData.corrected_query && (
              <div className="px-4 py-2.5 bg-brass/10 border-b border-brass/20 flex items-center justify-between text-xs">
                <span className="text-ink-soft flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brass" />
                  Showing results for{" "}
                  <strong className="text-ink font-semibold">{suggestionsData.corrected_query}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion({ title: suggestionsData.corrected_query })}
                  className="text-brass text-[11px] font-mono hover:underline font-semibold"
                >
                  Search exact ↗
                </button>
              </div>
            )}

            {/* Empty Query State: Recent Searches + Popular Topics */}
            {!query.trim() && (
              <div className="p-3 space-y-3">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-2 pb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft font-semibold flex items-center gap-1">
                        <History size={12} className="text-brass" />
                        Recent Searches
                      </span>
                      <button
                        type="button"
                        onClick={clearRecentSearches}
                        className="text-[10px] font-mono text-ink-soft/70 hover:text-danger hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 px-2">
                      {recentSearches.map((rec, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectSuggestion({ title: rec })}
                          className="px-2.5 py-1 rounded-xl bg-paper hover:bg-brass/15 border border-rule hover:border-brass/40 text-xs text-ink transition-all flex items-center gap-1.5"
                        >
                          <History size={11} className="text-ink-soft" />
                          <span>{rec}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="px-2 pb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft font-semibold flex items-center gap-1">
                      <TrendingUp size={12} className="text-brass" />
                      Popular / Recommended Searches
                    </span>
                  </div>
                  <div className="divide-y divide-rule/40">
                    {DEFAULT_POPULAR.map((pop, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(pop)}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-brass/10 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-brass/15 flex items-center justify-center text-brass shrink-0">
                            {getCategoryIcon(pop.type, pop.category)}
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-ink group-hover:text-brass transition-colors">
                              {pop.title}
                            </div>
                            <div className="text-[11px] text-ink-soft leading-tight">{pop.desc}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-brass/80 bg-brass/10 px-2 py-0.5 rounded-full border border-brass/20 shrink-0 ml-2">
                          {pop.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Query Suggestions */}
            {query.trim() && (
              <div className="p-2 space-y-2">
                {/* Related Topics & Autocomplete Items */}
                {allSuggestions.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-2.5 py-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-ink-soft font-semibold flex items-center gap-1">
                        <Sparkles size={11} className="text-brass" />
                        AI Autocomplete &amp; Related Topics ({allSuggestions.length})
                      </span>
                      <span className="text-[10px] font-mono text-ink-soft/60">Use ↑ ↓ to navigate</span>
                    </div>

                    <div className="divide-y divide-rule/30">
                      {allSuggestions.map((item, index) => {
                        const isSelected = index === activeIndex;
                        return (
                          <motion.button
                            key={index}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between group
                              ${isSelected ? "bg-brass/20 text-ink shadow-sm ring-1 ring-brass/40" : "hover:bg-brass/10 text-ink"}`}
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                  ${isSelected ? "bg-brass text-paper" : "bg-brass/15 text-brass"}`}
                              >
                                {getCategoryIcon(item.type, item.category)}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs sm:text-sm font-semibold truncate text-ink">
                                  {renderHighlightedText(item.title, query)}
                                </div>
                                {item.desc && (
                                  <div className="text-[11px] text-ink-soft truncate leading-tight mt-0.5">
                                    {item.desc}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {item.category && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-paper border border-rule text-ink-soft group-hover:border-brass/40 group-hover:text-brass transition-colors">
                                  {item.category}
                                </span>
                              )}
                              <ArrowRight
                                size={13}
                                className={`transition-transform duration-150 ${isSelected ? "text-brass translate-x-1" : "text-ink-soft/40 group-hover:text-brass"}`}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ) : !loading ? (
                  /* Friendly Not Found state */
                  <div className="p-6 text-center">
                    <HelpCircle size={28} className="mx-auto text-ink-soft/50 mb-2" />
                    <h4 className="text-sm font-semibold text-ink">No related results found for "{query}"</h4>
                    <p className="text-xs text-ink-soft mt-1 max-w-xs mx-auto">
                      Try searching by subject name (Python, Machine Learning), professor (Prof. Mehta, Dr. Avinash), or classroom code.
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                      {["Python", "Machine Learning", "Neural Networks", "Prof. Mehta"].map((term, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectSuggestion({ title: term })}
                          className="px-2.5 py-1 text-xs rounded-xl bg-paper hover:bg-brass/15 border border-rule hover:border-brass/40 text-brass transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
