/* =====================================================================
   TWINLΞSS – UPCOMING GIGS
   ---------------------------------------------------------------------
   This is the ONLY place you need to edit to update the gigs list.

   ADD a gig:    copy one line { ... }, paste it in the list, change it.
   REMOVE a gig: delete its whole line.
   Order does not matter – the website sorts gigs by date.
   Past gigs are hidden automatically the day after they happen.

   date   → "YYYY-MM-DD"   (year-month-day, e.g. "2026-12-04")
   venue  → club / place name
   event  → name of the night (can be "")
   city   → city
   link   → ticket or event link (use "" if there is none)

   Keep the quotes "..." and the comma at the end of each line.
   ===================================================================== */

const GIGS = [
  { date: "2026-12-12", venue: "LAP Coffee",     event: "Glüh Up before Christmas", city: "Cologne", link: "" },
  { date: "2026-12-19", venue: "Black Coffee",   event: "Night Session",            city: "Cologne", link: "" },
];

/* ---------- no need to edit anything below this line ---------- */
(function () {
  const list = document.getElementById("gig-list");
  if (!list) return;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const esc = (s) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const upcoming = GIGS
    .map((g) => ({ ...g, d: new Date(g.date + "T00:00:00") }))
    .filter((g) => !isNaN(g.d) && g.d >= today)
    .sort((a, b) => a.d - b.d);

  if (!upcoming.length) {
    list.innerHTML = '<li class="gig gig--empty">New dates coming soon – <a href="#booking">book us</a> for yours.</li>';
    return;
  }

  list.innerHTML = upcoming.map((g) => {
    const day = String(g.d.getDate()).padStart(2, "0");
    const action = g.link
      ? `<a class="gig__cta" href="${esc(g.link)}" target="_blank" rel="noopener">Tickets ↗</a>`
      : `<span class="gig__cta gig__cta--muted">Info soon</span>`;
    return `<li class="gig">
      <time class="gig__date" datetime="${esc(g.date)}"><span class="gig__day">${day}</span><span class="gig__mon">${months[g.d.getMonth()]} · ${days[g.d.getDay()]}</span></time>
      <div class="gig__what"><strong>${esc(g.venue)}</strong>${g.event ? `<span>${esc(g.event)}</span>` : ""}</div>
      <span class="gig__city">${esc(g.city)}</span>
      ${action}
    </li>`;
  }).join("");
})();
