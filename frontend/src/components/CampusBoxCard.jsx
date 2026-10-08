import React from "react";
import { 
  Calendar, CheckCircle, Clock, AlertTriangle, BookOpen, Utensils, 
  Home, Library, CreditCard, ChevronRight, MapPin, User, ShieldAlert 
} from "lucide-react";

export default function CampusBoxCard({ card, onNavigate }) {
  if (!card) return null;

  const { card_type, title, subtitle, badge, items, notice } = card;

  // 1. EXAMINATIONS
  if (card_type === "examinations") {
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
              <Calendar size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass/20 text-brass border border-brass/30">
              {badge}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-3">
          {(items || []).map((exam, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-canvas/70 border border-rule/70 hover:border-brass/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-ink text-xs">{exam.subject}</div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper text-ink-soft border border-rule shrink-0">
                  {exam.course}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] text-ink-soft">
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-brass shrink-0" />
                  <span>{exam.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-brass shrink-0" />
                  <span>{exam.time}</span>
                </div>
                <div className="flex items-center gap-1 col-span-2">
                  <MapPin size={12} className="text-brass shrink-0" />
                  <span>{exam.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-brass/10 border border-brass/20 text-[11px] text-ink-soft flex items-start gap-1.5">
            <AlertTriangle size={13} className="text-brass shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. ATTENDANCE
  if (card_type === "attendance") {
    const overallPct = card.overall_percentage || 82.5;
    const isSafe = overallPct >= 75;
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-success/15 text-success flex items-center justify-center font-bold">
              <CheckCircle size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
            isSafe ? "bg-success/15 text-success border-success/30" : "bg-danger/15 text-danger border-danger/30"
          }`}>
            {overallPct}% Overall
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {(items || []).map((sub, idx) => {
            const isSubSafe = sub.percentage >= 75;
            return (
              <div key={idx} className="p-2.5 rounded-lg bg-canvas/70 border border-rule/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-ink">{sub.subject}</span>
                  <span className={`font-bold ${isSubSafe ? "text-success" : "text-danger"}`}>
                    {sub.percentage}%
                  </span>
                </div>
                <div className="w-full bg-paper rounded-full h-1.5 overflow-hidden border border-rule">
                  <div 
                    className={`h-full rounded-full ${isSubSafe ? "bg-success" : "bg-danger"}`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-ink-soft">
                  <span>Classes: {sub.attended} / {sub.total}</span>
                  <span className={isSubSafe ? "text-success font-medium" : "text-danger font-medium"}>
                    {sub.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {notice && (
          <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft flex items-center gap-1.5">
            <ShieldAlert size={13} className="text-brass shrink-0" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. COURSES
  if (card_type === "courses") {
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
              <BookOpen size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass/20 text-brass border border-brass/30">
              {badge}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {(items || []).map((c, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-canvas/70 border border-rule/70 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-[11px]">{c.code}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brass/15 text-brass font-medium">
                    {c.level}
                  </span>
                </div>
                <div className="font-medium text-ink mt-0.5 line-clamp-1">{c.name}</div>
              </div>
              <div className="mt-2 pt-1.5 border-t border-rule/60 flex items-center justify-between text-[10px] text-ink-soft">
                <span>Duration: {c.duration}</span>
                <span>Intake: {c.intake} seats</span>
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft">
            ℹ️ {notice}
          </div>
        )}
      </div>
    );
  }

  // 4. FOOD & MESS
  if (card_type === "food_mess") {
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-warning/15 text-warning flex items-center justify-center font-bold">
              <Utensils size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-success/20 text-success border border-success/30">
            {badge || "Daily Menu"}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {(items || []).map((meal, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-canvas/70 border border-rule/70">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-ink text-xs flex items-center gap-1.5">
                  🍲 {meal.meal}
                </span>
                <span className="text-[10px] text-ink-soft flex items-center gap-1">
                  <Clock size={11} className="text-brass" />
                  {meal.timings}
                </span>
              </div>
              <div className="text-[11px] text-ink-soft mt-1 leading-relaxed bg-paper/60 p-1.5 rounded border border-rule/50">
                {meal.items}
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft">
            ✨ {notice}
          </div>
        )}
      </div>
    );
  }

  // 5. ROOM ALLOCATION / HOSTEL
  if (card_type === "room_allocation") {
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
              <Home size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass/20 text-brass border border-brass/30">
            {badge}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {(items || []).map((room, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-canvas/70 border border-rule/70">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-xs">
                  🏢 {room.block} — Room {room.room_no}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-paper text-ink border border-rule font-medium">
                  {room.type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2 text-[11px] text-ink-soft">
                <div>Warden: <strong className="text-ink">{room.warden}</strong></div>
                <div>Contact: <span className="text-brass">{room.contact}</span></div>
                <div>Rent/Fee: <strong className="text-ink">{room.rent}</strong></div>
                <div>Status: <span className="text-success font-medium">{room.status}</span></div>
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft">
            ℹ️ {notice}
          </div>
        )}
      </div>
    );
  }

  // 6. LIBRARY CATALOG
  if (card_type === "library") {
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
              <Library size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass/20 text-brass border border-brass/30">
            {badge}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {(items || []).map((book, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-canvas/70 border border-rule/70">
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-ink text-xs line-clamp-1">📚 {book.title}</div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success font-bold shrink-0">
                  {book.copies} available
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-ink-soft">
                <span>Author: {book.author}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-paper rounded border border-rule">{book.location}</span>
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft">
            📖 {notice}
          </div>
        )}
      </div>
    );
  }

  // 7. FEE STRUCTURE / CFRO
  if (card_type === "fee_structure") {
    const isPaid = (card.total_pending || 0) === 0;
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
              <CreditCard size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
            isPaid ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"
          }`}>
            {badge}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-2.5 mb-2.5 rounded-lg bg-canvas border border-rule text-center">
          <div>
            <div className="text-[10px] text-ink-soft">Total Due</div>
            <div className="font-bold text-ink text-xs mt-0.5">₹{(card.total_due || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-ink-soft">Paid</div>
            <div className="font-bold text-success text-xs mt-0.5">₹{(card.total_paid || 0).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-[10px] text-ink-soft">Pending</div>
            <div className="font-bold text-warning text-xs mt-0.5">₹{(card.total_pending || 0).toLocaleString()}</div>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          {(items || []).map((f, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-canvas/60 border border-rule/60 text-[11px]">
              <span className="font-medium text-ink">{f.fee_type}</span>
              <div className="flex items-center gap-2">
                <span className="text-ink-soft">Due: ₹{f.due.toLocaleString()}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  f.status === 'Paid' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                }`}>
                  {f.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft mb-2.5">
            💳 {notice}
          </div>
        )}
      </div>
    );
  }

  // 8. PHYSICAL OFFICE LOCATIONS (CFRO & CFSS)
  if (card_type === "office_location") {
    const offices = card.offices || [];
    return (
      <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-rule/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
              <MapPin size={15} />
            </div>
            <div>
              <div className="font-semibold text-ink text-sm leading-tight">{title}</div>
              <div className="text-[11px] text-ink-soft">{subtitle}</div>
            </div>
          </div>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass/20 text-brass border border-brass/30">
              {badge}
            </span>
          )}
        </div>

        {card.campus_address && (
          <div className="p-2.5 rounded-lg bg-canvas border border-rule/70 flex items-start gap-2 text-[11px] text-ink-soft">
            <MapPin size={14} className="text-brass shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-ink block mb-0.5">QISCET Campus Address:</span>
              <span>{card.campus_address} (Adjacent to NH-16, Ongole)</span>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {offices.map((off, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-canvas/70 border border-rule/70 space-y-1.5">
              <div className="font-bold text-ink text-xs flex items-center justify-between">
                <span>{off.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-brass/15 text-brass font-semibold">
                  {off.block}
                </span>
              </div>
              <div className="text-[11px] text-ink-soft space-y-1">
                {off.floor && <div>📍 <strong>Floor / Wing:</strong> {off.floor}</div>}
                {off.room_helpdesk && <div>🚪 <strong>Helpdesk Room:</strong> {off.room_helpdesk}</div>}
                {off.room_dean && <div>🏛 <strong>Dean Office:</strong> {off.room_dean}</div>}
                {off.landmark && <div>📌 <strong>Landmark:</strong> {off.landmark}</div>}
                {off.timings && <div>⏰ <strong>Office Hours:</strong> {off.timings}</div>}
                {off.phone && <div>📞 <strong>Phone:</strong> {off.phone}</div>}
                {off.services && <div>📋 <strong>Key Services:</strong> {off.services}</div>}
              </div>
            </div>
          ))}
        </div>

        {notice && (
          <div className="p-2 rounded bg-brass/10 border border-brass/20 text-[11px] text-ink-soft flex items-start gap-1.5">
            <AlertTriangle size={13} className="text-brass shrink-0 mt-0.5" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    );
  }

  // 9. UNIVERSAL FALLBACK CARD RENDERER (For reimbursement, documents, tickets, notices, etc.)
  return (
    <div className="w-full my-2 bg-paper-raised/95 border border-rule rounded-xl p-3.5 shadow-sm text-ink text-xs font-sans space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-rule/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brass/15 text-brass flex items-center justify-center font-bold">
            <BookOpen size={15} />
          </div>
          <div>
            <div className="font-semibold text-ink text-sm leading-tight">{title || "QISCET Campus Portal"}</div>
            <div className="text-[11px] text-ink-soft">{subtitle || "Live Information"}</div>
          </div>
        </div>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brass/20 text-brass border border-brass/30">
            {badge}
          </span>
        )}
      </div>

      {card.markdown_answer ? (
        <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-ink bg-canvas/60 p-2.5 rounded-lg border border-rule/60">
          {card.markdown_answer}
        </div>
      ) : items && items.length > 0 ? (
        <div className="space-y-1.5">
          {items.map((it, idx) => (
            <div key={idx} className="p-2 rounded bg-canvas/60 border border-rule/60 text-[11px]">
              <div className="font-semibold text-ink">{it.title || it.subject || it.name || JSON.stringify(it)}</div>
              {it.desc || it.content ? <div className="text-ink-soft mt-0.5">{it.desc || it.content}</div> : null}
            </div>
          ))}
        </div>
      ) : null}

      {notice && (
        <div className="p-2 rounded bg-paper border border-rule text-[11px] text-ink-soft">
          ℹ️ {notice}
        </div>
      )}
    </div>
  );
}
