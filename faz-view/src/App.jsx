import React, { useEffect, useState } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

// STYLED MASCOT LOGO
const FreddyDinerIcon = () => (
  <svg className="w-10 h-10 text-[#eb5437] transition-transform duration-300 hover:rotate-6 shrink-0 block" viewBox="0 0 100 100" fill="currentColor">
    <ellipse cx="50" cy="46" rx="34" ry="7" />
    <path d="M 30 44 L 34 16 L 66 16 L 70 44 Z" />
    <path d="M 32 36 L 33 44 L 67 44 L 68 36 Z" fill="#faf4ea" />
    <circle cx="22" cy="48" r="9" />
    <circle cx="78" cy="48" r="9" />
    <polygon points="36,64 64,64 50,74" fill="#eb5437" />
    <polygon points="36,84 64,84 50,74" fill="#eb5437" />
    <circle cx="50" cy="74" r="3.5" fill="#f59e0b" />
  </svg>
);

const TABLES = [
  { id: 1, name: "Table 1 (Center Stage Banquet)", type: "Banquet Bench", shape: "banquet", capacity: 8, x: "50%", y: "28%", isSensorySafe: false, zone: "Stage View", desc: "Front-row center party bench directly facing Freddy. Maximum immersion and volume." },
  { id: 2, name: "Table 2 (Stage Left Banquet)", type: "Banquet Bench", shape: "banquet", capacity: 8, x: "24%", y: "28%", isSensorySafe: false, zone: "Stage View", desc: "Front-row party bench directly beneath Bonnie's guitar audio stack." },
  { id: 3, name: "Table 3 (Stage Right Banquet)", type: "Banquet Bench", shape: "banquet", capacity: 8, x: "76%", y: "28%", isSensorySafe: false, zone: "Stage View", desc: "Front-row party bench facing Chica and Mr. Cupcake." },
  { id: 4, name: "Table 4 (Family Circle West)", type: "Family Circle", shape: "circle", capacity: 5, x: "35%", y: "52%", isSensorySafe: false, zone: "Stage View", desc: "Mid-tier circular table with direct sightline to the performance." },
  { id: 5, name: "Table 5 (Family Circle East)", type: "Family Circle", shape: "circle", capacity: 5, x: "65%", y: "52%", isSensorySafe: false, zone: "Stage View", desc: "Mid-tier circular table with unobstructed sound balance." },
  { id: 6, name: "Table 6 (West Wall Quiet Booth)", type: "Acoustic Booth", shape: "booth", capacity: 4, x: "12%", y: "78%", isSensorySafe: true, zone: "Low-Sensory", desc: "Acoustically insulated booth against west wall. Shielded from direct stage strobes." },
  { id: 7, name: "Table 7 (Rear Quiet Booth)", type: "Acoustic Booth", shape: "booth", capacity: 4, x: "50%", y: "80%", isSensorySafe: true, zone: "Low-Sensory", desc: "Rear booth with dimmed warm lighting, tailored for sensory-sensitive families." },
  { id: 8, name: "Table 8 (East Wall Quiet Booth)", type: "Acoustic Booth", shape: "booth", capacity: 4, x: "88%", y: "78%", isSensorySafe: true, zone: "Low-Sensory", desc: "Quiet dining booth shielded from primary loudspeaker reverberation." },
];

const SHOWS = {
  "12:00 PM": { title: "Freddy's Grand Welcome Jam", desc: "Full animatronic trio live overture with confetti burst." },
  "1:00 PM": { title: "Bonnie's Rockin' Solo", desc: "Electric guitar solo (High acoustic energy)." },
  "2:00 PM": { title: "Chica's Pizza Party Singalong", desc: "Interactive dining singalong for young guests." },
  "3:00 PM": { title: "Foxy's Pirate Cove Storyline", desc: "Low-volume acoustic performance (Sensory-friendly)." },
};

function createTicketId(date) {
  const datePart = String(date || new Date().toISOString().slice(0, 10)).replaceAll("-", "");
  const randomPart = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()
    : `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  return `FZ-${datePart}-${randomPart}`;
}

// Normalize reservations so every entry contains required schema fields
function normalizeReservations(rawReservations) {
  const normalized = {};
  let changed = false;

  Object.entries(rawReservations && typeof rawReservations === "object" ? rawReservations : {}).forEach(([date, timeSlots]) => {
    normalized[date] = {};
    Object.entries(timeSlots && typeof timeSlots === "object" ? timeSlots : {}).forEach(([time, entries]) => {
      if (!Array.isArray(entries)) {
        changed = true;
        return;
      }
      normalized[date][time] = entries.map((entry) => {
        const oldFormat = typeof entry === "number";
        const booking = oldFormat ? { tableId: entry } : { ...(entry || {}) };
        if (!booking.ticketId) {
          booking.ticketId = createTicketId(date);
          changed = true;
        }
        if (oldFormat || !booking.guestName) {
          booking.guestName = booking.guestName || "Guest name not recorded";
          changed = true;
        }
        if (booking.date !== date || booking.time !== time) {
          booking.date = date;
          booking.time = time;
          changed = true;
        }
        if (!booking.reservationType) {
          booking.reservationType = SHOWS[time] ? "show" : "custom";
          changed = true;
        }
        return booking;
      });
    });
    if (Object.keys(normalized[date]).length === 0) delete normalized[date];
  });

  return { reservations: normalized, changed };
}

// ==================== GLOBAL FOOTER WITH FEEDBACK SYSTEM ====================
function GlobalFooter() {
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
  };

  return (
    <footer className="bg-[#ede1d1] border-t-2 border-[#eb5437]/20 pt-12 pb-8 px-6 text-stone-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-xs">
        
        {/* Col 1: Brand & Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <FreddyDinerIcon />
            <span className="text-xl font-black tracking-tighter text-[#eb5437] font-serif leading-none">FAZBEAR'S</span>
          </div>
          <p className="text-[11px] font-medium text-stone-600 leading-relaxed">
            Family entertainment, arcade thrills, and live animatronic performances. Redefining dining safety and customer experience since 1983.
          </p>
          <p className="text-[10px] font-mono font-bold text-stone-500">
            "Keep the System Running: Code Through the Fear."
          </p>
        </div>

        {/* Col 2: Operating Hours & Shows */}
        <div className="space-y-2">
          <h4 className="font-black uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-1">
            Operating Hours
          </h4>
          <div className="text-[11px] space-y-1 text-stone-700">
            <p className="flex justify-between"><span>Mon - Thu:</span> <strong className="font-mono">10 AM - 9 PM</strong></p>
            <p className="flex justify-between"><span>Fri - Sat:</span> <strong className="font-mono">10 AM - 11 PM</strong></p>
            <p className="flex justify-between"><span>Sunday:</span> <strong className="font-mono">11 AM - 8 PM</strong></p>
            <div className="pt-2 text-[10px] font-bold text-[#eb5437]">
              ★ Live Animatronic Sets: 12 PM, 1 PM, 2 PM, 3 PM
            </div>
          </div>
        </div>

        {/* Col 3: Location & Support */}
        <div className="space-y-2">
          <h4 className="font-black uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-1">
            Location & Contact
          </h4>
          <div className="text-[11px] space-y-1.5 text-stone-700">
            <p><strong>Main Venue:</strong> Norbert Auditorium & Grounds</p>
            <p>Cor Jesu College, Digos City</p>
            <p className="pt-1"><strong>Guest Inquiries:</strong> 1-800-FAZ-BEAR</p>
            <p><strong>Support:</strong> reservations@fazbear2.0.cjc</p>
          </div>
        </div>

        {/* Col 4: Interactive Guest Feedback Form */}
        <div className="space-y-2 bg-[#faf4ea] p-3.5 rounded-lg border border-[#eb5437]/30 shadow-sm">
          <h4 className="font-black uppercase tracking-wider text-[#eb5437] text-[11px] flex justify-between items-center">
            <span>Guest Feedback</span>
            <span className="text-[9px] font-mono text-stone-500 font-bold">THANK YOU!</span>
          </h4>

          {feedbackSubmitted ? (
            <div className="p-3 bg-emerald-100 border border-emerald-400 rounded text-center text-emerald-900 font-bold text-[11px]">
              ✓ Thank you! Feedback transmitted to Freddy's floor manager.
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-stone-700">
                <span>Rating:</span>
                <div className="flex gap-1 text-amber-500 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className={`text-sm ${star <= feedbackRating ? "text-[#eb5437]" : "text-stone-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="How was your stage view or dining experience?"
                className="w-full p-1.5 text-[10px] bg-white border border-stone-300 rounded resize-none focus:outline-[#eb5437] text-stone-800"
                rows="2"
                required
              />

              <button
                type="submit"
                className="w-full py-1.5 bg-[#eb5437] hover:bg-[#d64327] text-white font-black text-[10px] uppercase tracking-wider rounded shadow transition-all cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Bottom Credits */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-stone-300/80 flex flex-col sm:flex-row justify-between items-center text-[10px] text-stone-600 font-mono gap-2">
        <span>© 2026 Fazbear Entertainment, Inc. • Developed by Marquis & Andrei</span>
        <span>Cor Jesu College — College of Computing & Information Sciences</span>
      </div>
    </footer>
  );
}

// ==================== STAFF DASHBOARD VIEW ====================
function StaffDashboard() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("faz-view-scheduled-reservations") || "{}");
    } catch {
      return {};
    }
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const refresh = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("faz-view-scheduled-reservations") || "{}");
        const result = normalizeReservations(raw);
        setReservations(result.reservations);
        if (result.changed) {
          localStorage.setItem("faz-view-scheduled-reservations", JSON.stringify(result.reservations));
        }
      } catch {
        setReservations({});
      }
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const allBookings = Object.entries(reservations).flatMap(([date, timeSlots]) =>
    Object.entries(timeSlots || {}).flatMap(([time, entries]) =>
      (Array.isArray(entries) ? entries : []).map((entry, index) => {
        const booking = typeof entry === "number"
          ? {
              tableId: entry,
              guestName: "Guest name not recorded",
              ticketId: createTicketId(date),
              reservationType: SHOWS[time] ? "show" : "custom",
            }
          : entry;

        return {
          key: booking.ticketId || `${date}-${time}-${booking.tableId}-${index}`,
          date,
          time,
          tableId: booking.tableId,
          guestName: booking.guestName || "Guest name not recorded",
          ticketId: booking.ticketId || createTicketId(date),
          reservationType: booking.reservationType || (SHOWS[time] ? "show" : "custom"),
          table: TABLES.find((item) => item.id === booking.tableId),
          show: SHOWS[time],
        };
      })
    )
  ).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const today = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();

  const upcomingBookings = allBookings.filter((booking) => booking.date >= today);
  const filteredBookings = allBookings.filter((booking) => {
    const matchesDate = !selectedDate || booking.date === selectedDate;
    const searchable = `${booking.ticketId} ${booking.guestName} ${booking.date} ${booking.time} ${booking.table?.name || `Table ${booking.tableId}`} ${booking.show?.title || ""}`.toLowerCase();
    return matchesDate && searchable.includes(search.toLowerCase());
  });

  const cancelBooking = (booking) => {
    const updated = { ...reservations };
    const dateSlots = { ...(updated[booking.date] || {}) };
    dateSlots[booking.time] = (dateSlots[booking.time] || []).filter((entry) => {
      const entryTicketId = typeof entry === "number" ? null : entry.ticketId;
      const entryTableId = typeof entry === "number" ? entry : entry.tableId;
      if (booking.ticketId && entryTicketId) return entryTicketId !== booking.ticketId;
      return entryTableId !== booking.tableId;
    });

    if (dateSlots[booking.time].length === 0) delete dateSlots[booking.time];
    if (Object.keys(dateSlots).length === 0) delete updated[booking.date];
    else updated[booking.date] = dateSlots;

    setReservations(updated);
    try {
      localStorage.setItem("faz-view-scheduled-reservations", JSON.stringify(updated));
      setNotice(`Cancelled ticket ${booking.ticketId} for ${booking.guestName}.`);
    } catch {
      setNotice("Could not save the change. Please check browser storage settings.");
    }
  };

  const statCard = (label, value, description) => (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">{label}</p>
      <p className="text-3xl font-black text-[#eb5437] mt-2">{value}</p>
      <p className="text-xs text-stone-500 mt-1">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf4ea] text-stone-900 font-sans">
      <header className="sticky top-0 z-40 bg-[#faf4ea]/95 backdrop-blur border-b-2 border-[#eb5437]/20">
        <div className="max-w-7xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FreddyDinerIcon />
            <div>
              <p className="text-lg font-black tracking-tight text-[#eb5437] font-serif">FAZBEAR'S</p>
              <p className="text-[9px] font-mono font-bold tracking-widest text-stone-500">STAFF OPERATIONS</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-xs font-bold hover:border-[#eb5437]">Guest Home</button>
            <button onClick={() => navigate('/reserve')} className="px-4 py-2 bg-[#eb5437] text-white rounded-lg text-xs font-black hover:bg-[#d64327]">New Reservation</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#eb5437] uppercase">Management // Reservations</p>
            <h1 className="text-3xl sm:text-4xl font-black font-serif uppercase mt-2">Staff Dashboard</h1>
            <p className="text-sm text-stone-500 mt-2">Review upcoming bookings and manage the dining schedule.</p>
          </div>
          <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 bg-white border border-stone-200 rounded-full text-[10px] font-bold text-stone-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> LOCAL RESERVATION DATA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCard("Total bookings", allBookings.length, "All saved reservations")}
          {statCard("Upcoming", upcomingBookings.length, "Today and future dates")}
          {statCard("Dates scheduled", new Set(upcomingBookings.map((booking) => booking.date)).size, "Dates with upcoming visits")}
          {statCard("Tables available", TABLES.length, "Tables in the floor plan")}
        </div>

        <section className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-stone-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-black text-lg uppercase">Reservation Schedule</h2>
              <p className="text-xs text-stone-500 mt-1">Filter the schedule or cancel a reservation.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full lg:max-w-xl">
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#faf4ea] focus:outline-none focus:border-[#eb5437]" aria-label="Filter by date" />
              <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guest, ticket, table..." className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm bg-[#faf4ea] focus:outline-none focus:border-[#eb5437]" aria-label="Search reservations" />
            </div>
          </div>

          {notice && <div role="status" className="mx-5 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">{notice}</div>}

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-black text-stone-800">No reservations found</h3>
              <p className="text-sm text-stone-500 mt-2">Try another date, guest name, or ticket ID, or create a booking from the guest reservation page.</p>
              <button onClick={() => navigate('/reserve')} className="mt-5 px-5 py-3 bg-[#eb5437] text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#d64327]">Create Reservation</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1050px]">
                <thead className="bg-[#faf4ea] text-[10px] uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="px-5 py-4">Ticket ID</th>
                    <th className="px-5 py-4">Guest</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Time / Show</th>
                    <th className="px-5 py-4">Table</th>
                    <th className="px-5 py-4">Zone</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.key} className="hover:bg-[#faf4ea]/60">
                      <td className="px-5 py-4">
                        <span title={booking.ticketId} className="inline-block rounded bg-[#faf4ea] border border-[#eb5437]/30 px-2 py-1 font-mono text-[10px] font-black text-[#eb5437] whitespace-nowrap select-all">{booking.ticketId}</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold">{booking.guestName}</td>
                      <td className="px-5 py-4 text-sm font-bold whitespace-nowrap">{booking.date}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-black">{booking.time}</p>
                        <p className="text-xs text-stone-500 mt-1">{booking.reservationType === "custom" ? "Dining only · no show" : (booking.show?.title || "Scheduled show")}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold">{booking.table?.name || `Table ${booking.tableId}`}</p>
                        <p className="text-xs text-stone-500 mt-1">Capacity: {booking.table?.capacity ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-stone-600">{booking.table?.zone || "—"}</td>
                      <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${booking.date < today ? "bg-stone-100 text-stone-500" : "bg-emerald-100 text-emerald-800"}`}>{booking.date < today ? "Past" : "Scheduled"}</span></td>
                      <td className="px-5 py-4"><button onClick={() => cancelBooking(booking)} className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-black uppercase">Cancel</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-stone-200 p-4 text-[10px] text-stone-500">Prototype note: bookings are stored in this browser's localStorage, not a shared server database.</div>
        </section>
      </main>
      <GlobalFooter />
    </div>
  );
}

// ==================== MAIN APP (LANDING & SPATIAL RESERVATION) ====================
function MainApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname === '/reserve' ? 'booking' : 'landing';

  const getLocalDate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedTable, setSelectedTable] = useState(TABLES[0]);
  const [scheduledDate, setScheduledDate] = useState(() => getLocalDate());
  const [scheduledTime, setScheduledTime] = useState("12:00 PM");
  const [reservationType, setReservationType] = useState("show");
  const [customTime, setCustomTime] = useState("16:00");
  const [sensoryFilter, setSensoryFilter] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [scheduledBookingMessage, setScheduledBookingMessage] = useState("");
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const formatCustomTime = (timeValue) => {
    if (!timeValue) return "";
    const [hoursText, minutesText] = timeValue.split(":");
    let hours = Number(hoursText);
    const minutes = minutesText || "00";
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  };

  const [scheduledReservations, setScheduledReservations] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("faz-view-scheduled-reservations") || "{}");
      return normalizeReservations(raw).reservations;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("faz-view-scheduled-reservations") || "{}");
        setScheduledReservations(normalizeReservations(raw).reservations);
      } catch {
        setScheduledReservations({});
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const openBookingView = () => {
    navigate('/reserve');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLandingView = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAvailableShowTimes = (date) => {
    const times = Object.keys(SHOWS);
    if (date !== getLocalDate()) return times;

    return times.filter((time) => {
      const [clock, period] = time.split(" ");
      let [hours, minutes] = clock.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;

      const slotDate = new Date();
      slotDate.setHours(hours, minutes, 0, 0);
      return slotDate > new Date();
    });
  };

  const isSelectedTimeValid = reservationType === "custom"
    ? Boolean(customTime) && (scheduledDate !== getLocalDate() || (() => {
        const [hours, minutes] = customTime.split(":").map(Number);
        const slotDate = new Date();
        slotDate.setHours(hours, minutes, 0, 0);
        return slotDate > new Date();
      })())
    : getAvailableShowTimes(scheduledDate).includes(scheduledTime);

  const currentScheduledBookings = scheduledReservations[scheduledDate]?.[scheduledTime] || [];

  const isScheduledTableBooked = Boolean(selectedTable) && currentScheduledBookings.some((entry) =>
    (typeof entry === "number" ? entry : entry.tableId) === selectedTable.id
  );

  // Available tables list for sidebar view
  const availableTables = TABLES.filter((table) => {
    const isBooked = currentScheduledBookings.some(
      (entry) => (typeof entry === "number" ? entry : entry.tableId) === table.id
    );
    if (isBooked) return false;
    if (sensoryFilter && !table.isSensorySafe) return false;
    return true;
  });

  const handleSensoryToggle = (checked) => {
    setSensoryFilter(checked);
    if (checked && selectedTable && !selectedTable.isSensorySafe) {
      const firstSafe = TABLES.find((t) => {
        const isBooked = currentScheduledBookings.some(
          (entry) => (typeof entry === "number" ? entry : entry.tableId) === t.id
        );
        return t.isSensorySafe && !isBooked;
      });
      if (firstSafe) setSelectedTable(firstSafe);
    }
  };

  const handleScheduledBooking = () => {
    const trimmedGuestName = guestName.trim();
    if (!trimmedGuestName || !selectedTable || isScheduledTableBooked || !scheduledDate || !scheduledTime) return;
    if (scheduledDate < getLocalDate() || !isSelectedTimeValid) return;

    const uniquePart = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()
      : `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const ticketId = `FZ-${scheduledDate.replaceAll("-", "")}-${uniquePart}`;
    const reservation = {
      ticketId,
      guestName: trimmedGuestName,
      tableId: selectedTable.id,
      date: scheduledDate,
      time: scheduledTime,
      reservationType,
      createdAt: new Date().toISOString(),
    };

    const updatedReservations = {
      ...scheduledReservations,
      [scheduledDate]: {
        ...(scheduledReservations[scheduledDate] || {}),
        [scheduledTime]: [
          ...((scheduledReservations[scheduledDate] || {})[scheduledTime] || []),
          reservation,
        ],
      },
    };

    setScheduledReservations(updatedReservations);
    setConfirmedTicket(reservation);
    setScheduledBookingMessage(`Reservation confirmed for ${trimmedGuestName}. Your ticket ID is ${ticketId}.`);

    try {
      localStorage.setItem("faz-view-scheduled-reservations", JSON.stringify(updatedReservations));
    } catch (error) {
      console.error("Unable to save scheduled reservation:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4ea] text-stone-900 font-sans select-none flex flex-col overflow-x-hidden">
      
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#faf4ea]/95 backdrop-blur-md border-b-2 border-[#eb5437]/20 shadow-sm">
        <div 
          className="h-2.5 w-full border-b border-[#eb5437]/30" 
          style={{ backgroundImage: "repeating-conic-gradient(#eb5437 0% 25%, #faf4ea 0% 50%) 50% / 14px 14px" }}
        />
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={openLandingView}>
            <FreddyDinerIcon />
            <div className="flex flex-col justify-center">
              <span className="text-2xl md:text-3xl font-black tracking-tighter text-[#eb5437] font-serif leading-none block">
                FAZBEAR'S
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-stone-700 uppercase mt-0.5 block leading-none">
                By Marquis & Andrei
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-wider text-stone-800">
            <button onClick={openLandingView} className={`hover:text-[#eb5437] transition-colors cursor-pointer ${currentView === 'landing' ? 'text-[#eb5437] font-black' : ''}`}>Home</button>
            <a href="#menu-deals" onClick={() => currentView !== 'landing' && navigate('/')} className="hover:text-[#eb5437] transition-colors">Menu Deals</a>
            
            <span className="text-stone-400">|</span>
            <span className="text-[11px] font-mono font-bold text-stone-700">PIZZERIA & SHOWROOM WITH AN ARCADE!</span>
          </div>

          <button 
            onClick={currentView === 'landing' ? openBookingView : openLandingView}
            className="px-5 py-2.5 bg-[#eb5437] hover:bg-[#d64327] active:scale-95 text-[#faf4ea] font-black text-xs uppercase tracking-wider rounded shadow transition-all duration-200 cursor-pointer"
          >
            {currentView === 'landing' ? "Reserve Table ↓" : "← Back to Diner Menu"}
          </button>
        </nav>
      </header>

      {/* 2. CONDITIONAL VIEW: LANDING OR BOOKING */}
      {currentView === 'landing' ? (
        /* ==================== VIEW 1: LANDING PAGE ==================== */
        <div className="flex-1 flex flex-col">
          
          {/* HERO SECTION */}
          <section className="max-w-7xl w-full mx-auto px-6 py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h1 className="text-6xl md:text-7xl font-black tracking-tight text-[#eb5437] uppercase leading-[0.9] font-serif">
                    SINGING <br />
                    <span className="bg-[#eb5437] text-[#faf4ea] px-3 py-1 inline-block mt-2 shadow-sm rounded-sm">
                      EVERY NIGHT
                    </span>
                  </h1>
                  <p className="text-sm font-semibold text-stone-700 mt-5 max-w-lg leading-relaxed">
                    Authentic American pan pizza, cold sodas, and synchronized animatronic musical revues featuring Freddy, Bonnie, and Chica. Guaranteed safe family dining since 1983.
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-4">
                    <button 
                      onClick={openBookingView}
                      className="px-8 py-3.5 bg-[#eb5437] hover:bg-[#d64327] active:scale-95 text-[#faf4ea] font-black text-xs uppercase tracking-widest rounded shadow-lg transition-all duration-200 cursor-pointer"
                    >
                      Select Show Seating →
                    </button>
                    <a 
                      href="#menu-deals"
                      className="px-8 py-3.5 bg-white border-2 border-[#eb5437] text-[#eb5437] hover:bg-[#faf4ea] font-black text-xs uppercase tracking-widest rounded shadow transition-all duration-200"
                    >
                      View Value Deals ↓
                    </a>
                  </div>
                </div>

                {/* BEST SELLER BOX */}
                <div className="border-2 border-[#eb5437] rounded-lg p-4 relative pt-5 mt-4 bg-white/80 shadow-sm">
                  <span className="absolute -top-3 left-4 bg-[#faf4ea] px-2 text-xs font-black uppercase tracking-wider text-[#eb5437]">
                    ★ Pizzeria Best Sellers
                  </span>
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-900 uppercase">Freddy's Meat Feast</span>
                          <span className="text-xs font-black font-mono text-[#eb5437]">$11.99</span>
                        </div>
                        <p className="text-[11px] font-medium text-stone-700 leading-tight">Pepperoni, Italian sausage, smoked bacon, savory marinara.</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-stone-900 uppercase">Bonnie's Combo Basket</span>
                          <span className="text-xs font-black font-mono text-[#eb5437]">$14.99</span>
                        </div>
                        <p className="text-[11px] font-medium text-stone-700 leading-tight">40 Game Tokens, Large 1-Topping Pizza, and 4 sodas.</p>
                      </div>
                    </div>

                    <div className="border-l-2 border-dashed border-[#eb5437]/40 pl-4 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl animate-bounce">🎟️</span>
                      <span className="text-[11px] font-black text-[#eb5437] uppercase tracking-wider mt-1">Free Game Tokens</span>
                      <span className="text-[10px] font-bold text-stone-700 font-mono">Included With Every Deal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* USER IMAGE CONTAINER WITH SEQUENTIAL FALLBACKS */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md aspect-square bg-[#eb5437] rounded-2xl p-4 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{ background: "repeating-conic-gradient(from 0deg, #faf4ea 0deg 15deg, transparent 15deg 30deg)" }}
                  />

                  <div className="relative z-10 w-full h-full bg-[#faf4ea] rounded-xl border-4 border-[#faf4ea] overflow-hidden shadow-inner flex flex-col">
                    <img 
                      src="/resto.webp" 
                      alt="Freddy Fazbear Pizzeria Stage" 
                      onError={(e) => {
                        if (!e.target.dataset.triedPng) {
                          e.target.dataset.triedPng = "true";
                          e.target.src = "/hero.png";
                        } else if (!e.target.dataset.triedJpg) {
                          e.target.dataset.triedJpg = "true";
                          e.target.src = "/hero.jpg";
                        } else {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    
                    <div className="hidden w-full h-full flex-col items-center justify-center text-center p-6 bg-[#faf4ea]">
                      <span className="text-5xl">🐻</span>
                      <h3 className="text-base font-black text-[#eb5437] mt-3 font-serif uppercase">YOUR IMAGE HERE</h3>
                      <p className="text-[11px] font-bold text-stone-700 mt-1 max-w-[200px]">
                        Place your image inside <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-900">public/resto.webp</code>
                      </p>
                    </div>

                    <div className="absolute top-3 left-3 bg-[#faf4ea]/95 backdrop-blur border border-stone-300 px-3 py-1 rounded text-[10px] font-mono font-black text-[#eb5437] uppercase shadow-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      OPEN 24/7!
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* RETRO MENU DEALS SECTION */}
          <section id="menu-deals" className="border-t-2 border-[#eb5437]/20 bg-[#f5efe4] py-16 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
              
              <div className="text-center space-y-1">
                <span className="text-xs font-mono font-bold tracking-widest text-[#eb5437] uppercase">1983 DINER SPECIALS</span>
                <h2 className="text-4xl font-black text-stone-900 font-serif uppercase tracking-tight">
                  FAZBEAR VALUE DEALS & MENU
                </h2>
                <p className="text-xs font-semibold text-stone-700 max-w-md mx-auto">
                  Every meal comes with complimentary animatronic showtime access and tokens.
                </p>
              </div>

              {/* 4 Value Deals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 1, tokens: "20 Game Tokens", pizza: "1 Med 1-Topping Pizza", drinks: "2 Soft Drinks", price: "$3.99" },
                  { id: 2, tokens: "40 Game Tokens", pizza: "2 Med 1-Topping Pizzas", drinks: "4 Soft Drinks", price: "$5.99" },
                  { id: 3, tokens: "80 Game Tokens", pizza: "1 Large 1-Topping Pizza", drinks: "4 Soft Drinks", price: "$8.99" },
                  { id: 4, tokens: "120 Game Tokens", pizza: "2 Large 1-Topping Pizzas", drinks: "6 Soft Drinks", price: "$10.99" },
                ].map((deal) => (
                  <div 
                    key={deal.id} 
                    className="bg-white border-2 border-[#eb5437] p-4 rounded-lg shadow-sm hover:-translate-y-1 transition-transform duration-200 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between border-b border-[#eb5437]/20 pb-2 mb-2">
                      <span className="text-xs font-black uppercase text-[#eb5437] tracking-wider font-serif">★ DEAL #{deal.id}</span>
                      <span className="text-lg font-black font-mono text-stone-900">{deal.price}</span>
                    </div>
                    <div className="text-[11px] font-bold text-stone-800 space-y-1 uppercase leading-tight">
                      <p className="text-[#eb5437] font-black">• {deal.tokens}</p>
                      <p>• {deal.pizza}</p>
                      <p>• {deal.drinks}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bonnie's Family Special Banner */}
              <div className="bg-[#eb5437] text-[#faf4ea] border-2 border-[#eb5437] p-5 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-lg gap-4">
                <div>
                  <span className="bg-[#faf4ea] text-[#eb5437] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-block mb-1">
                    MOST POPULAR
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-wider font-serif">BONNIE'S FAMILY SPECIAL</h3>
                  <p className="text-xs font-bold text-amber-100 uppercase mt-1">
                    120 Game Tokens • 4 Large 1-Topping Pizzas • 2 Large Fries • 10 Soft Drinks
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-4xl font-black font-mono text-white">$14.99</span>
                </div>
              </div>

              {/* Two-Column Category Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border-2 border-[#eb5437] rounded-xl p-6 shadow-sm space-y-4">
                  <div className="border-b-2 border-[#eb5437]/20 pb-2 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-wider text-[#eb5437] font-serif">★ FREDDY'S PIZZAS</h3>
                    <span className="text-[11px] font-mono font-bold text-stone-700">Pan Baked Daily</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-black uppercase text-stone-900">
                        <span>All Meat Combo</span>
                        <span className="text-[#eb5437] font-mono text-sm">$11.99</span>
                      </div>
                      <p className="text-[11px] font-medium text-stone-700">Pepperoni, Italian sausage, smoked bacon, savory marinara.</p>
                    </div>
                    <div>
                      <div className="flex justify-between font-black uppercase text-stone-900">
                        <span>Veggie Lovers</span>
                        <span className="text-[#eb5437] font-mono text-sm">$9.99</span>
                      </div>
                      <p className="text-[11px] font-medium text-stone-700">Tomatoes, black olives, green peppers, onions, fresh mushrooms.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-[#eb5437] rounded-xl p-6 shadow-sm space-y-4">
                  <div className="border-b-2 border-[#eb5437]/20 pb-2 flex justify-between items-center">
                    <h3 className="text-lg font-black uppercase tracking-wider text-[#eb5437] font-serif">★ CHICA'S CRISPY WINGS</h3>
                    <span className="text-[11px] font-mono font-bold text-stone-700">BBQ & Buffalo</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-[#faf4ea] rounded border border-stone-300">
                      <span className="block text-[10px] uppercase font-bold text-stone-700">Small (3 Pcs)</span>
                      <strong className="text-sm font-mono text-[#eb5437]">$2.99</strong>
                    </div>
                    <div className="p-2.5 bg-[#faf4ea] rounded border border-stone-300">
                      <span className="block text-[10px] uppercase font-bold text-stone-700">Family (8 Pcs)</span>
                      <strong className="text-sm font-mono text-[#eb5437]">$8.99</strong>
                    </div>
                    <div className="p-2.5 bg-[#faf4ea] rounded border border-stone-300">
                      <span className="block text-[10px] uppercase font-bold text-stone-700">Party (12 Pcs)</span>
                      <strong className="text-sm font-mono text-[#eb5437]">$4.99</strong>
                    </div>
                    <div className="p-2.5 bg-[#faf4ea] rounded border border-stone-300">
                      <span className="block text-[10px] uppercase font-bold text-stone-700">XL Party (15 Pcs)</span>
                      <strong className="text-sm font-mono text-[#eb5437]">$6.99</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* BOTTOM FINAL CTA BANNER */}
          <section className="bg-[#eb5437] text-[#faf4ea] py-14 px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-black font-serif uppercase tracking-tight">
                READY TO JOIN FREDDY & THE BAND?
              </h2>
              <p className="text-xs md:text-sm font-bold text-amber-100 max-w-lg mx-auto leading-relaxed">
                Book your arrival slot, inspect real-time stage line-of-sight, and claim your table on the floor plan.
              </p>
              <div className="pt-2">
                <button
                  onClick={openBookingView}
                  className="px-10 py-4 bg-[#faf4ea] hover:bg-white active:scale-95 text-[#eb5437] font-black text-sm uppercase tracking-widest rounded-lg shadow-2xl transition-all cursor-pointer"
                >
                  RESERVE YOUR TABLE NOW →
                </button>
              </div>
            </div>
          </section>

        </div>
      ) : (
        /* ==================== VIEW 2: FAZ-VIEW SPATIAL SCHEDULER ==================== */
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eb5437]/20 mb-6">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#eb5437] uppercase">
                FAZ-VIEW: 
              </span>
              <h2 className="text-2xl font-black text-stone-900 font-serif uppercase">
                RESERVATION SCHEDULER
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Choose a date and table, then select a showtime or your own reservation time.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 mb-12">

            {/* LEFT 4 COLS: CONTROLS & TABLE SELECTION */}
            <div className="lg:col-span-4 bg-white border-2 border-[#eb5437]/30 rounded-xl p-5 shadow-sm flex flex-col">
              <div className="border-b border-stone-200 pb-3 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#eb5437] block">
                  Step 1
                </span>
                <h3 className="text-sm font-black uppercase text-stone-900">
                  Schedule Your Visit
                </h3>
              </div>

              {/* Guest name */}
              <div className="mb-4">
                <label htmlFor="faz-guest-name" className="block text-xs font-bold text-stone-800 mb-1">
                  Guest Full Name <span className="text-[#eb5437]">*</span>
                </label>
                <input
                  id="faz-guest-name"
                  type="text"
                  autoComplete="name"
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    setScheduledBookingMessage("");
                    setConfirmedTicket(null);
                  }}
                  maxLength={100}
                  placeholder="Enter the guest's full name"
                  required
                  className="w-full rounded-lg border-2 border-stone-300 bg-[#faf4ea] px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-[#eb5437]"
                />
              </div>

              {/* Date picker */}
              <div className="mb-4">
                <label htmlFor="faz-reservation-date" className="block text-xs font-bold text-stone-800 mb-1">
                  Reservation Date
                </label>
                <input
                  id="faz-reservation-date"
                  type="date"
                  min={getLocalDate()}
                  value={scheduledDate}
                  onChange={(e) => {
                    const nextDate = e.target.value;
                    setScheduledDate(nextDate);
                    setScheduledBookingMessage("");
                    setConfirmedTicket(null);

                    if (reservationType === "show") {
                      const validTimes = getAvailableShowTimes(nextDate);
                      if (validTimes.length > 0 && !validTimes.includes(scheduledTime)) {
                        setScheduledTime(validTimes[0]);
                      }
                    }
                  }}
                  className="w-full rounded-lg border-2 border-stone-300 bg-[#faf4ea] px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-[#eb5437]"
                />
              </div>

              {/* Reservation Type Toggle */}
              <div className="mb-4">
                <span className="block text-xs font-bold text-stone-800 mb-1.5">
                  Reservation Type
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReservationType("show");
                      const validTimes = getAvailableShowTimes(scheduledDate);
                      if (validTimes.length > 0 && !validTimes.includes(scheduledTime)) {
                        setScheduledTime(validTimes[0]);
                      }
                      setScheduledBookingMessage("");
                      setConfirmedTicket(null);
                    }}
                    className={`rounded-lg border-2 px-3 py-2 text-xs font-black transition-colors ${reservationType === "show" ? "bg-[#eb5437] text-white border-[#eb5437]" : "bg-[#faf4ea] border-stone-300 text-stone-700 hover:border-[#eb5437]"}`}
                  >
                    Showtimes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReservationType("custom");
                      setScheduledTime(formatCustomTime(customTime));
                      setScheduledBookingMessage("");
                      setConfirmedTicket(null);
                    }}
                    className={`rounded-lg border-2 px-3 py-2 text-xs font-black transition-colors ${reservationType === "custom" ? "bg-[#eb5437] text-white border-[#eb5437]" : "bg-[#faf4ea] border-stone-300 text-stone-700 hover:border-[#eb5437]"}`}
                  >
                    Custom Time
                  </button>
                </div>
              </div>

              {/* Showtimes / Custom Time Selectors */}
              <div className="mb-4">
                {reservationType === "show" ? (
                  <>
                    <span className="block text-xs font-bold text-stone-800 mb-1.5">
                      Available Showtimes
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {getAvailableShowTimes(scheduledDate).map((time) => {
                        const bookedEntries = scheduledReservations[scheduledDate]?.[time] || [];
                        const availableCount = TABLES.filter(
                          (table) => !bookedEntries.some((entry) =>
                            (typeof entry === "number" ? entry : entry.tableId) === table.id
                          )
                        ).length;

                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              setScheduledTime(time);
                              setScheduledBookingMessage("");
                              setConfirmedTicket(null);
                            }}
                            className={`py-2 px-2.5 text-left rounded-lg border-2 transition-all ${
                              scheduledTime === time
                                ? "bg-[#eb5437] text-white border-[#eb5437] shadow-sm"
                                : "bg-[#faf4ea] border-stone-300 hover:border-[#eb5437] text-stone-700"
                            }`}
                          >
                            <span className="block text-xs font-black">{time}</span>
                            <span className={`block text-[9px] mt-0.5 ${scheduledTime === time ? "text-white/80" : "text-stone-500"}`}>
                              {availableCount} tables free
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {getAvailableShowTimes(scheduledDate).length === 0 && (
                      <p className="text-xs text-stone-600 bg-stone-100 rounded-lg p-3 mt-2">
                        Today's showtimes have passed. Select a future date or choose Custom Time.
                      </p>
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-[#eb5437]/30 bg-[#faf4ea] p-3">
                    <label htmlFor="faz-custom-time" className="block text-xs font-bold text-stone-800 mb-1">
                      Choose Your Reservation Time
                    </label>
                    <input
                      id="faz-custom-time"
                      type="time"
                      value={customTime}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomTime(value);
                        setScheduledTime(formatCustomTime(value));
                        setScheduledBookingMessage("");
                        setConfirmedTicket(null);
                      }}
                      className="w-full rounded-lg border-2 border-stone-300 bg-white px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-[#eb5437]"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Dining reservation only. No synchronized performance running.
                    </p>
                    {scheduledDate === getLocalDate() && customTime && !isSelectedTimeValid && (
                      <p className="text-xs text-red-600 mt-1 font-bold">Choose a time later than right now.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Performance Description Card */}
              <div className="p-2.5 bg-[#faf4ea] border border-[#eb5437]/30 rounded-lg mb-3">
                <span className="text-[9px] font-black uppercase text-[#eb5437] block">
                  {reservationType === "show" ? "Synchronized Routine" : "Dining Reservation"}
                </span>
                <p className="text-xs font-black text-stone-900 mt-0.5">
                  {reservationType === "show" ? (SHOWS[scheduledTime]?.title || "No showtime selected") : "Standard Dining Session"}
                </p>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {reservationType === "show" ? (SHOWS[scheduledTime]?.desc || "Select a showtime above.") : "Full diner menu and arcade access available."}
                </p>
              </div>

              {/* Sensory Mode Toggle */}
              <div className="p-2.5 bg-stone-50 border border-stone-300 rounded-lg mb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">Sensory-Friendly Mode</span>
                  <span className="text-[10px] font-medium text-stone-700">Dim stage noise & isolate booths</span>
                </div>
                <input
                  type="checkbox"
                  checked={sensoryFilter}
                  onChange={(e) => handleSensoryToggle(e.target.checked)}
                  className="w-4 h-4 accent-[#eb5437] cursor-pointer"
                />
              </div>

              {/* AVAILABLE TABLES LIST SIDEBAR WIDGET */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-700 block">
                    Available Tables ({availableTables.length})
                  </span>
                  {sensoryFilter && (
                    <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      Sensory-Filtered
                    </span>
                  )}
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 border border-stone-300 rounded-lg p-2 bg-[#faf4ea]/40">
                  {availableTables.length === 0 ? (
                    <p className="text-[11px] font-bold text-stone-700 text-center py-2">
                      No matching tables available for this time.
                    </p>
                  ) : (
                    availableTables.map((table) => {
                      const isSelected = selectedTable?.id === table.id;
                      return (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => {
                            setSelectedTable(table);
                            setScheduledBookingMessage("");
                            setConfirmedTicket(null);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#eb5437] text-white shadow-sm scale-[1.01]"
                              : "bg-white hover:bg-stone-50 text-stone-900 border border-stone-300"
                          }`}
                        >
                          <span className="truncate">T-{table.id}: {table.type}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded ml-1 shrink-0 ${
                              isSelected ? "text-amber-200" : "text-stone-700 font-bold"
                            }`}
                          >
                            {table.capacity} Seats • {table.zone}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Selected Table Inspection Card */}
              {selectedTable && (
                <div className="p-3 bg-[#faf4ea] border border-stone-300 rounded-lg mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#eb5437] uppercase">{selectedTable.type}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isScheduledTableBooked ? "bg-stone-300 text-stone-800" : "bg-emerald-100 text-emerald-900"
                    }`}>
                      {isScheduledTableBooked ? "Occupied" : "Available"}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-stone-900">{selectedTable.name}</h4>
                  <p className="text-[11px] font-medium text-stone-700 mt-0.5">{selectedTable.desc}</p>
                  <p className="text-[11px] font-mono font-bold text-stone-800 mt-1">Capacity: {selectedTable.capacity} Seats • {selectedTable.zone}</p>
                </div>
              )}

              {scheduledBookingMessage && (
                <div role="status" className="mb-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800">
                  ✓ {scheduledBookingMessage}
                </div>
              )}

              {confirmedTicket && (
                <div className="mb-3 rounded-xl border-2 border-dashed border-[#eb5437] bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#eb5437]">Reservation Ticket</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black uppercase text-emerald-800">Confirmed</span>
                  </div>
                  <p className="mt-2 text-lg font-black font-mono text-stone-900">{confirmedTicket.ticketId}</p>
                  <p className="mt-1 text-xs text-stone-600 font-bold">{confirmedTicket.guestName}</p>
                  <p className="mt-1 text-[10px] text-stone-500">{confirmedTicket.date} · {confirmedTicket.time} · Table {confirmedTicket.tableId}</p>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2 text-[10px] font-black uppercase text-stone-700 hover:border-[#eb5437]"
                  >
                    Print Ticket
                  </button>
                </div>
              )}

              {/* Confirm CTA */}
              <div className="pt-2 border-t border-stone-200">
                {isScheduledTableBooked ? (
                  <div className="p-2.5 bg-stone-300 text-stone-800 text-center text-xs font-black rounded-lg">
                    ✕ Occupied for {scheduledTime}
                  </div>
                ) : (
                  <button
                    onClick={handleScheduledBooking}
                    disabled={
                      !guestName.trim() ||
                      !selectedTable ||
                      !scheduledDate ||
                      scheduledDate < getLocalDate() ||
                      !isSelectedTimeValid
                    }
                    className="w-full py-2.5 bg-[#eb5437] hover:bg-[#d64327] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-lg shadow transition-all cursor-pointer"
                  >
                    {reservationType === "show" ? "Confirm Show Reservation" : "Confirm Dining Reservation"}
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT 8 COLS: BLUEPRINT CANVAS */}
            <div className="lg:col-span-8 bg-white border-2 border-[#eb5437]/30 rounded-xl p-5 shadow-sm flex flex-col h-[560px]">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-stone-700 mb-2">
                <span className="text-[#eb5437] font-black">AUDIENCE DINING FLOOR</span>
                <span>{scheduledDate} · {scheduledTime}</span>
              </div>

              <div className="relative flex-1 border-2 border-stone-300 bg-[#faf4ea] rounded-lg overflow-hidden flex flex-col">
                {/* Stage Header */}
                <div className="w-full h-16 bg-[#eb5437] text-white flex flex-col items-center justify-center shrink-0 shadow-sm text-center px-2">
                  <span className="text-xs font-black tracking-widest uppercase">★ MAIN ANIMATRONIC STAGE ★</span>
                  <span className="text-[10px] font-mono text-amber-200 mt-0.5">FREDDY • BONNIE • CHICA • FOXY</span>
                </div>

                {/* Interactive Floor Canvas */}
                <div className="relative flex-1 w-full">
                  {TABLES.map((table) => {
                    const isSelected = selectedTable?.id === table.id;
                    const isBooked = currentScheduledBookings.some((entry) =>
                      (typeof entry === "number" ? entry : entry.tableId) === table.id
                    );
                    const isDimmed = sensoryFilter && !table.isSensorySafe;

                    const shapeClasses = 
                      table.shape === "banquet" 
                        ? "w-28 h-12 rounded-md" 
                        : table.shape === "circle" 
                        ? "w-16 h-16 rounded-full" 
                        : "w-20 h-14 rounded-lg border-dashed";

                    return (
                      <button
                        key={table.id}
                        disabled={isBooked}
                        onClick={() => {
                          setSelectedTable(table);
                          setScheduledBookingMessage("");
                          setConfirmedTicket(null);
                        }}
                        style={{ top: table.y, left: table.x }}
                        title={`${table.name} — ${table.capacity} guests`}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-2 border-2 transition-all cursor-pointer z-20 flex flex-col items-center justify-center ${shapeClasses} ${
                          isBooked
                            ? "bg-stone-300 border-stone-400 text-stone-700 opacity-60 cursor-not-allowed font-bold"
                            : isDimmed
                            ? "bg-stone-200 border-stone-300 text-stone-400 opacity-20 scale-90"
                            : table.zone === "Stage View"
                            ? "bg-[#eb5437] border-[#eb5437] text-white shadow-sm"
                            : "bg-teal-700 border-teal-700 text-white shadow-sm"
                        } ${
                          isSelected && !isBooked 
                            ? "ring-4 ring-amber-400 scale-110 shadow-xl z-30" 
                            : !isBooked 
                            ? "hover:scale-105" 
                            : ""
                        }`}
                      >
                        <span className="text-[11px] font-black font-mono leading-none">T-{table.id}</span>
                        <span className="text-[8px] font-black uppercase mt-0.5 tracking-tight">
                          {isBooked ? "TAKEN" : `${table.capacity} SEATS`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* High-Contrast Legend */}
                <div className="absolute bottom-2 left-3 bg-white/95 border border-stone-400 px-3 py-1 rounded flex gap-4 text-[10px] font-mono font-bold text-stone-800 shadow-sm">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2 bg-[#eb5437] rounded-sm"></span> Stage View</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2 bg-teal-700 rounded-sm"></span> Sensory Safe</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2 bg-stone-400 rounded-sm"></span> Occupied</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. UNIVERSAL FOOTER */}
      <GlobalFooter />

      {/* 4. BOTTOM CHECKERBOARD */}
      <div 
        className="h-2.5 w-full shrink-0 border-t border-[#eb5437]/30" 
        style={{ backgroundImage: "repeating-conic-gradient(#eb5437 0% 25%, #faf4ea 0% 50%) 50% / 14px 14px" }}
      />
    </div>
  );
}

// ==================== APP ROOT WITH ROUTING ====================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  );
}