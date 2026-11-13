const PLAYERS = [
  { name: "Steven", color: "#e96945", tint: "#f8e2d9" },
  { name: "Jimmy", color: "#648b66", tint: "#e3eee2" },
  { name: "Kasra", color: "#d0a539", tint: "#f7efcf" },
  { name: "Chris", color: "#6685a1", tint: "#e2ebf1" },
  { name: "Brady", color: "#9b79a5", tint: "#eee5f0" }
];

const elements = {
  championName: document.querySelector("#champion-name"),
  championTotal: document.querySelector("#champion-total"),
  championLead: document.querySelector("#champion-lead"),
  championSubtitle: document.querySelector("#champion-subtitle"),
  standingsBody: document.querySelector("#standings-body"),
  chart: document.querySelector("#rank-chart"),
  legend: document.querySelector("#chart-legend"),
  roundSelector: document.querySelector("#round-selector"),
  roundDetail: document.querySelector("#round-detail"),
  seasonLabel: document.querySelector("#season-label"),
  daysLogged: document.querySelector("#days-logged"),
  roundCount: document.querySelector("#round-count"),
  seasonSelect: document.querySelector("#season-select"),
  seasonStampLabel: document.querySelector("#season-stamp-label"),
  seasonDescription: document.querySelector("#season-description"),
  crownLabel: document.querySelector("#crown-label"),
  chartView: document.querySelector("#chart-view"),
  chartRange: document.querySelector("#chart-range"),
  chartRangeLabel: document.querySelector("#chart-range-label"),
  chartDescription: document.querySelector("#chart-description"),
  celebrationParticles: document.querySelector("#celebration-particles"),
  celebrationAnnouncements: document.querySelector("#celebration-announcements")
};

let selectedDate = "";
let selectedMonth = "";
let chartView = "daily";
let chartRange = 0;
let visiblePlayers = new Set(PLAYERS.map(({ name }) => name));
let celebrationTimeout;

function celebrateRound(date) {
  clearTimeout(celebrationTimeout);
  elements.celebrationParticles.replaceChildren();
  elements.celebrationAnnouncements.replaceChildren();
  const achievements = getDayScores(date).filter(({ event }) => event);
  if (!achievements.length) return;

  for (const { player, event } of achievements) {
    const announcement = document.createElement("div");
    announcement.className = `celebration-card ${event}`;
    const title = document.createElement("strong");
    title.textContent = event === "squid" ? "🦑 SQUID PARTY!" : "🦐 ONE IN A KRILLION!";
    const detail = document.createElement("span");
    detail.textContent = `${player} · ${formatDate(date)} · ${event === "squid" ? "A quorum of squids. Let the party begin!" : "A Krillion pick. Legendary catch!"}`;
    announcement.append(title, detail);
    elements.celebrationAnnouncements.append(announcement);
  }

  if (achievements.some(({ event }) => event === "krillion")) {
    const shrine = document.createElement("div");
    shrine.className = "krillion-shrine";
    shrine.innerHTML = `
      <div class="krillion-rays"></div>
      <div class="krillion-halo"></div>
      <span class="krillion-sparkle">✦</span><span class="krillion-sparkle">✧</span>
      <span class="krillion-sparkle">✦</span><span class="krillion-sparkle">✧</span>
      <span class="krillion-sparkle">✦</span><span class="krillion-sparkle">✧</span>
      <img class="krillion-shrimp" src="images/goldkrill.png" alt="">
    `;
    elements.celebrationParticles.append(shrine);
  }

  if (achievements.some(({ event }) => event === "squid")
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    for (let index = 0; index < 28; index += 1) {
      const particle = document.createElement("span");
      particle.className = "celebration-particle squid";
      particle.textContent = "🦑";
      particle.style.setProperty("--left", `${3 + Math.random() * 94}%`);
      particle.style.setProperty("--delay", `${Math.random() * .7}s`);
      particle.style.setProperty("--drift", `${Math.random() * 100 - 50}px`);
      elements.celebrationParticles.append(particle);
    }
  }

  celebrationTimeout = setTimeout(() => {
    elements.celebrationParticles.replaceChildren();
    elements.celebrationAnnouncements.replaceChildren();
  }, 4500);
}

function isValidEntry(entry) {
  if (!entry || typeof entry.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return false;
  const [year, month, day] = entry.date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return parsedDate.getUTCFullYear() === year
    && parsedDate.getUTCMonth() === month - 1
    && parsedDate.getUTCDate() === day
    && PLAYERS.some(({ name }) => name === entry.player)
    && Number.isInteger(entry.points)
    && entry.points >= 0
    && (entry.pending === undefined || typeof entry.pending === "boolean")
    && (!entry.pending || (entry.points === 0 && !entry.event))
    && ["", "krillion", "squid"].includes(entry.event || "");
}

function playerInfo(name) {
  return PLAYERS.find((player) => player.name === name);
}

function formatNumber(number) {
  return new Intl.NumberFormat("en-US").format(number);
}

function formatDate(date, options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options })
    .format(new Date(`${date}T12:00:00Z`));
}

function getDays() {
  return [...new Set(scores.map(({ date }) => date))].sort();
}

function getSeasonDays() {
  return getDays().filter((date) => date.slice(0, 7) === selectedMonth);
}

function dateRangeLabel(days) {
  const first = days[0];
  const last = days[days.length - 1];
  return first === last ? formatDate(first)
    : `${formatDate(first)}–${formatDate(last, { day: "numeric" })}`;
}

function getDailyRanges(days) {
  const ranges = [];
  for (let end = days.length; end > 0; end -= 7) {
    ranges.push(days.slice(Math.max(0, end - 7), end));
  }
  return ranges;
}

function getWeeklyPeriods(days) {
  const weeks = new Map();
  for (const date of days) {
    const monday = new Date(`${date}T12:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7);
    const key = monday.toISOString().slice(0, 10);
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key).push(date);
  }
  return [...weeks.values()].map((weekDays) => ({
    days: weekDays,
    label: dateRangeLabel(weekDays),
    scores: getStandings(weekDays).filter(({ daysPlayed }) => daysPlayed)
      .map(({ name, total }) => ({ player: name, points: total }))
  }));
}

function getDayScores(date) {
  return scores
    .filter((entry) => entry.date === date)
    .sort((a, b) => b.points - a.points || PLAYERS.findIndex(({ name }) => name === a.player) - PLAYERS.findIndex(({ name }) => name === b.player));
}

function isProvisional(date) {
  return getDayScores(date).some(({ pending }) => pending);
}

function getFinalDays(days = getDays()) {
  return days.filter((date) => !isProvisional(date));
}

function rankFor(scoresForDay, index) {
  if (index > 0 && scoresForDay[index].points === scoresForDay[index - 1].points) {
    return rankFor(scoresForDay, index - 1);
  }
  return index + 1;
}

function getStandings(days = getDays()) {
  const totals = new Map(PLAYERS.map(({ name }) => [name, { name, total: 0, wins: 0, daysPlayed: 0 }]));
  for (const date of getFinalDays(days)) {
    const dayScores = getDayScores(date);
    if (dayScores.length) {
      const topScore = dayScores[0].points;
      for (const entry of dayScores) {
        const total = totals.get(entry.player);
        total.total += entry.points;
        total.daysPlayed += 1;
        if (entry.points === topScore) total.wins += 1;
      }
    }
  }
  return [...totals.values()].sort((a, b) => b.total - a.total || b.wins - a.wins || a.name.localeCompare(b.name));
}

function standingRank(standings, index) {
  return index > 0 && standings[index].total === standings[index - 1].total
    ? standingRank(standings, index - 1)
    : index + 1;
}

function renderStandings(standings, previousStandings) {
  const leader = standings[0]?.total || 0;
  elements.standingsBody.innerHTML = standings.map((player, index) => {
    const info = playerInfo(player.name);
    const rank = standingRank(standings, index);
    const previousIndex = previousStandings.findIndex((previous) => previous.name === player.name);
    const previousPlayer = previousStandings[previousIndex];
    let movement = "";
    if (player.daysPlayed && previousPlayer?.daysPlayed) {
      const change = standingRank(previousStandings, previousIndex) - rank;
      const direction = change > 0 ? "up" : change < 0 ? "down" : "steady";
      const label = change === 0 ? "No change since the previous round"
        : `${change > 0 ? "Up" : "Down"} ${Math.abs(change)} ${Math.abs(change) === 1 ? "place" : "places"} since the previous round`;
      movement = `<span class="rank-movement ${direction}" aria-label="${label}"><span aria-hidden="true">${change > 0 ? "▲" : change < 0 ? "▼" : "−"}${change ? Math.abs(change) : ""}</span></span>`;
    } else if (player.daysPlayed) {
      movement = '<span class="rank-movement new" aria-label="No previous standing">NEW</span>';
    }
    const gap = leader - player.total;
    const progress = leader ? Math.round((player.total / leader) * 100) : 0;
    return `<tr>
      <td><span class="rank-number ${rank === 1 && player.daysPlayed ? "first" : ""}">${player.daysPlayed ? String(rank).padStart(2, "0") : "—"}</span></td>
      <td><span class="player-cell"><span class="player-avatar" style="background:${info.tint};color:${info.color}">${player.name[0]}</span>${player.name}${rank === 1 && player.daysPlayed ? '<span class="champion-crown" aria-label="season leader">👑</span>' : ""}${movement}</span></td>
      <td class="wins-cell"><strong>${player.wins}</strong> ${player.wins === 1 ? "win" : "wins"}</td>
      <td class="points-cell">${formatNumber(player.total)}</td>
      <td class="lead-cell"><span class="lead-track" aria-hidden="true"><span style="width:${progress}%"></span></span><span class="lead-value">${gap === 0 ? "—" : `−${formatNumber(gap)}`}</span></td>
    </tr>`;
  }).join("");
}

function renderChampion(standings, previousStandings, championChangedToday, days = getSeasonDays()) {
  const leader = standings[0];
  const second = standings[1];
  if (!leader || !getFinalDays(days).length) {
    elements.championName.textContent = "Nobody";
    elements.championTotal.textContent = "0";
    elements.championLead.textContent = "NO SCORES YET";
    elements.championSubtitle.textContent = "The rivalry begins when the first scores arrive.";
    document.querySelector("#most-wins").innerHTML = "— <span>· no wins yet</span>";
    document.querySelector("#biggest-score").innerHTML = "— <span>· no scores yet</span>";
    document.querySelector("#squid-count").innerHTML = "0 <span>so far</span>";
    return;
  }
  elements.championName.textContent = leader.name;
  elements.championTotal.textContent = formatNumber(leader.total);
  const newlyCrowned = championChangedToday
    && previousStandings[0]
    && leader.name !== previousStandings[0].name
    && (!second || leader.total > second.total);
  if (newlyCrowned) {
    elements.championLead.textContent = second ? `+${formatNumber(leader.total - second.total)} AHEAD` : "OUT IN FRONT";
    elements.championSubtitle.textContent = `${leader.name} takes the crown today. Who's coming for it?`;
  } else if (second && leader.total === second.total) {
    elements.championLead.textContent = "ALL TIED UP";
    elements.championSubtitle.textContent = `${leader.name} and ${second.name} are neck and neck.`;
  } else {
    const gap = leader.total - (second?.total || 0);
    elements.championLead.textContent = second ? `+${formatNumber(gap)} AHEAD` : "OUT IN FRONT";
    elements.championSubtitle.textContent = second
      ? gap <= 10 ? `Just ${formatNumber(gap)} point${gap === 1 ? "" : "s"} ahead of ${second.name}. Anything can happen.`
        : "A commanding lead. The rest of the crew is plotting a comeback."
      : "The first score is on the board. Who's next?";
  }

  const topWins = [...standings].sort((a, b) => b.wins - a.wins || b.total - a.total)[0];
  document.querySelector("#most-wins").innerHTML = `${topWins.name} <span>· ${topWins.wins} ${topWins.wins === 1 ? "win" : "wins"}</span>`;
  const finalDays = new Set(getFinalDays(days));
  const finalScores = scores.filter(({ date }) => finalDays.has(date));
  const biggest = [...finalScores].sort((a, b) => b.points - a.points)[0];
  document.querySelector("#biggest-score").innerHTML = biggest
    ? `${biggest.player} <span>· ${formatNumber(biggest.points)} pts</span>`
    : "— <span>· no scores yet</span>";
  const squidParties = finalScores.filter(({ event }) => event === "squid").length;
  document.querySelector("#squid-count").innerHTML = `${squidParties} <span>${squidParties === 1 ? "so far" : "so far"}</span>`;
}

function renderChart(days) {
  days = getFinalDays(days);
  const ranges = getDailyRanges(days);
  if (chartRange >= ranges.length) chartRange = 0;
  elements.chartView.value = chartView;
  elements.chartRange.hidden = chartView === "weekly";
  elements.chartRangeLabel.hidden = chartView === "weekly";
  elements.chartRange.disabled = !ranges.length;
  elements.chartRange.innerHTML = ranges.map((range, index) =>
    `<option value="${index}">${index === 0 ? "Latest: " : ""}${dateRangeLabel(range)}</option>`
  ).join("");
  elements.chartRange.value = String(chartRange);
  const periods = chartView === "weekly" ? getWeeklyPeriods(days)
    : (ranges[chartRange] || []).map((date) => ({ days: [date], label: formatDate(date), scores: getDayScores(date) }));
  elements.chartDescription.textContent = !periods.length
    ? "No finalized rounds in this month yet. Provisional rounds stay off the chart."
    : chartView === "weekly"
      ? "Rank by total points each Monday–Sunday week, within this month. Weeks may be partial. First place is at the top; provisional rounds are excluded."
      : `${chartRange === 0 ? "Latest" : "Earlier"} ${periods.length} finalized ${periods.length === 1 ? "round" : "rounds"}: ${dateRangeLabel(periods.flatMap(({ days }) => days))}. First place is at the top; provisional rounds are excluded. Choose a range for older rounds; toggle players below.`;
  const width = 500;
  const height = 190;
  const margin = { top: 10, right: 13, bottom: 28, left: 36 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = (index) => margin.left + (periods.length < 2 ? plotWidth / 2 : (index * plotWidth) / (periods.length - 1));
  const y = (rank) => margin.top + ((rank - 1) * plotHeight) / 4;
  const daysScores = periods.map(({ scores }) => scores);
  let svg = `<title id="chart-title">${chartView === "weekly" ? "Weekly" : "Daily"} player rankings</title><desc id="chart-desc">${elements.chartDescription.textContent} Ties share a place. Fifth place is at the bottom.</desc>`;
  if (!periods.length) svg += `<text class="chart-x-label" x="${width / 2}" y="${height / 2}">No finalized rounds yet</text>`;
  for (let rank = 1; rank <= 5; rank += 1) {
    svg += `<line class="chart-grid" x1="${margin.left}" y1="${y(rank)}" x2="${width - margin.right}" y2="${y(rank)}"></line>`;
    svg += `<text class="chart-y-label" x="0" y="${y(rank) + 3}">${rank}${rank === 1 ? "ST" : rank === 2 ? "ND" : rank === 3 ? "RD" : "TH"}</text>`;
  }
  periods.forEach((period, index) => {
    svg += `<text class="chart-x-label" x="${x(index)}" y="${height - 5}">${period.label}</text>`;
  });

  for (const player of PLAYERS) {
    const points = [];
    for (const [dayIndex, dayScores] of daysScores.entries()) {
      const playerIndex = dayScores.findIndex(({ player: name }) => name === player.name);
      if (playerIndex !== -1) points.push({ x: x(dayIndex), y: y(rankFor(dayScores, playerIndex)), period: periods[dayIndex], rank: rankFor(dayScores, playerIndex), score: dayScores[playerIndex].points });
    }
    if (!points.length) continue;
    const hidden = visiblePlayers.has(player.name) ? "" : ' style="display:none"';
    const path = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
    svg += `<path class="chart-line" d="${path}" stroke="${player.color}"${hidden}></path>`;
    svg += points.map((point) => `<circle class="chart-dot" cx="${point.x}" cy="${point.y}" r="3.5" fill="${player.color}"${hidden}><title>${player.name}: ${point.period.label}, place ${point.rank}, ${formatNumber(point.score)} points${chartView === "weekly" ? ` across ${point.period.days.length} finalized ${point.period.days.length === 1 ? "round" : "rounds"}` : ""}</title></circle>`).join("");
  }
  elements.chart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  elements.chart.innerHTML = svg;
  elements.legend.innerHTML = PLAYERS.map((player) => `
    <button class="legend-button" type="button" data-player="${player.name}" aria-pressed="${visiblePlayers.has(player.name)}">
      <span class="legend-swatch" style="background:${player.color}"></span>${player.name}
    </button>`).join("");
}

function renderRounds(days) {
  elements.roundSelector.innerHTML = days.slice().reverse().map((date) => `
    <button class="round-button" type="button" data-date="${date}" aria-pressed="${date === selectedDate}">
      ${formatDate(date)}<small>${isProvisional(date) ? "Provisional" : `${getDayScores(date).length} scores`}</small>
    </button>`).join("");
  if (!selectedDate || !days.includes(selectedDate)) selectedDate = days[days.length - 1] || "";
  elements.roundSelector.querySelectorAll(".round-button").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.date === selectedDate));
  });
  renderRoundDetail(selectedDate);
  celebrateRound(selectedDate);
}

function renderRoundDetail(date) {
  const dayScores = getDayScores(date);
  if (!date) {
    elements.roundDetail.innerHTML = '<p class="round-empty">No rounds published yet. Check back for the first scores.</p>';
    return;
  }
  const dateParts = date.split("-");
  const provisional = isProvisional(date);
  const submittedCount = dayScores.filter(({ pending }) => !pending).length;
  const events = dayScores.filter(({ event }) => event);
  const eventLabel = (event) => event === "krillion" ? "🦐 KRILLION! MAX SCORE!" : "🦑 SQUID PARTY!";
  const eventType = (event) => event === "squid" ? "squid" : "";
  elements.roundDetail.innerHTML = `
    <div class="round-summary">
      <span class="round-date-mark">${dateParts[2]}</span>
      <div><strong>${formatDate(date, { weekday: "long", month: "long", day: "numeric" })}</strong><small>${provisional ? `Provisional: ${submittedCount} of ${PLAYERS.length} submitted. Not counted in standings, wins or the chart yet.` : dayScores.length ? `${dayScores.length} ${dayScores.length === 1 ? "score" : "scores"} on the board` : "No scores logged for this day yet"}</small></div>
      ${events.map(({ event, player }) => `<span class="round-event ${eventType(event)}">${eventLabel(event)} · ${player}</span>`).join("")}
    </div>
    <div class="round-results">${dayScores.map((entry, index) => `
      <article class="round-result">
        <div class="round-result-top"><span class="round-result-name">${entry.player}</span><span class="round-result-rank">${entry.pending ? "" : String(rankFor(dayScores, index)).padStart(2, "0")}</span></div>
        <strong class="round-result-points">${formatNumber(entry.points)} <small>${entry.pending ? "pts (pending)" : "pts"}</small></strong>
        ${entry.event ? `<div class="round-event-player ${eventType(entry.event)}">${eventLabel(entry.event)}</div>` : ""}
      </article>`).join("")}</div>`;
}

function render() {
  const months = [...new Set(getDays().map((date) => date.slice(0, 7)))].reverse();
  if (!months.includes(selectedMonth)) selectedMonth = months[0] || "";
  elements.seasonSelect.innerHTML = months.map((month, index) =>
    `<option value="${month}">${formatDate(`${month}-01`, { month: "long", year: "numeric" })}${index === 0 ? " (current)" : " (archive)"}</option>`
  ).join("");
  elements.seasonSelect.value = selectedMonth;
  elements.seasonSelect.disabled = !months.length;
  const archived = months.length > 0 && selectedMonth !== months[0];
  elements.seasonStampLabel.textContent = archived ? "ARCHIVED SEASON" : "CURRENT SEASON";
  elements.crownLabel.textContent = archived ? "THIS MONTH'S CROWN" : "CURRENTLY WEARING THE CROWN";
  elements.seasonDescription.textContent = `${archived ? "Viewing an archived month. " : ""}Each month is a fresh season. Previous months stay available here.`;
  const days = getSeasonDays();
  const finalDays = getFinalDays(days);
  const standings = getStandings(days);
  const previousStandings = getStandings(finalDays.slice(0, -1));
  const latestDate = days[days.length - 1];
  renderChampion(standings, previousStandings, !archived && latestDate === finalDays[finalDays.length - 1], days);
  renderStandings(standings, previousStandings);
  renderChart(days);
  renderRounds(days);
  elements.daysLogged.textContent = `${days.length} ${days.length === 1 ? "DAY" : "DAYS"} LOGGED`;
  elements.roundCount.textContent = `${days.length} ${days.length === 1 ? "ROUND" : "ROUNDS"}`;
  if (latestDate) {
    const [year, month] = latestDate.split("-");
    elements.seasonLabel.textContent = `${new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(new Date(`${year}-${month}-01T12:00:00Z`)).toUpperCase()} '${year.slice(-2)}`;
  } else {
    elements.seasonLabel.textContent = "NO SEASON";
  }
}

elements.roundSelector.addEventListener("click", (event) => {
  const button = event.target.closest("[data-date]");
  if (!button || button.dataset.date === selectedDate) return;
  selectedDate = button.dataset.date;
  renderRounds(getSeasonDays());
});

elements.legend.addEventListener("click", (event) => {
  const button = event.target.closest("[data-player]");
  if (!button) return;
  const player = button.dataset.player;
  if (visiblePlayers.has(player)) visiblePlayers.delete(player);
  else visiblePlayers.add(player);
  renderChart(getSeasonDays());
});

elements.seasonSelect.addEventListener("change", (event) => {
  selectedMonth = event.target.value;
  selectedDate = "";
  chartRange = 0;
  render();
});

elements.chartView.addEventListener("change", (event) => {
  chartView = event.target.value;
  renderChart(getSeasonDays());
});

elements.chartRange.addEventListener("change", (event) => {
  chartRange = Number(event.target.value);
  renderChart(getSeasonDays());
});

if (typeof scores === "undefined" || !Array.isArray(scores) || !scores.every(isValidEntry)) {
  const message = "The score ledger could not be loaded. Please contact the site owner.";
  elements.roundDetail.textContent = message;
  elements.roundDetail.setAttribute("role", "alert");
  throw new Error(message);
}

render();
