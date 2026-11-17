const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectDir = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(projectDir, "app.js"), "utf8");

function renderPage(ledger, { reducedMotion = false, today = "2026-11-15T12:00:00" } = {}) {
  const nodes = new Map();
  const timers = new Map();
  let nextTimer = 0;
  const RealDate = Date;
  class MockDate extends RealDate {
    constructor(...args) {
      super(...(args.length ? args : [today]));
    }
  }
  function makeNode() {
    return {
      innerHTML: "",
      textContent: "",
      children: [],
      attributes: {},
      listeners: {},
      style: { setProperty() {} },
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(name, callback) { this.listeners[name] = callback; },
      append(...children) { this.children.push(...children); },
      replaceChildren(...children) { this.children = children; },
      querySelectorAll() { return []; }
    };
  }
  const document = {
    createElement() { return makeNode(); },
    querySelector(selector) {
      if (!nodes.has(selector)) {
        nodes.set(selector, makeNode());
      }
      return nodes.get(selector);
    }
  };
  const context = vm.createContext({
    document,
    Date: MockDate,
    window: { matchMedia: () => ({ matches: reducedMotion }) },
    Intl,
    setTimeout(callback, delay) {
      const id = ++nextTimer;
      timers.set(id, { callback: () => { timers.delete(id); callback(); }, delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); }
  });
  vm.runInContext(`${ledger}\n${app}`, context);
  return { nodes, context, timers };
}

test("weekly tide report is available only on Sundays", () => {
  const ledger = `const scores = ${JSON.stringify(weeklyLedger())};`;
  for (const today of ["2026-11-16T12:00:00", "2026-11-17T12:00:00", "2026-11-18T12:00:00", "2026-11-19T12:00:00", "2026-11-20T12:00:00", "2026-11-21T12:00:00"]) {
    const { nodes, timers } = renderPage(ledger, { today });
    assert.equal(nodes.get("#weekly").hidden, true);
    assert.equal(nodes.get("#weekly-detail").innerHTML, "");
    assert.equal(nodes.get("#weekly-celebration").hidden, true);
    assert.equal(timers.size, 0);
  }
  const sunday = renderPage(ledger, { today: "2026-11-22T12:00:00" });
  assert.equal(sunday.nodes.get("#weekly").hidden, false);
  assert.match(sunday.nodes.get("#weekly-detail").innerHTML, /Week wrapped/);
});

function renderLedger(ledger) {
  return renderPage(ledger).nodes.get("#standings-body").innerHTML;
}

function playerRow(html, player) {
  const row = html.split("</tr>").find((entry) => entry.includes(`</span>${player}`));
  assert.ok(row, `Missing standings row for ${player}`);
  return row;
}

test("Krillion celebration showcases the golden shrimp and cleans up", () => {
  const { nodes, context, timers } = renderPage(`const scores = [
    { date: "2026-11-01", player: "Jimmy", points: 400, event: "krillion" }
  ];`);
  const particles = nodes.get("#celebration-particles");
  const announcements = nodes.get("#celebration-announcements");
  assert.equal(particles.children.length, 1);
  assert.equal(particles.children[0].className, "krillion-shrine");
  assert.match(particles.children[0].innerHTML, /src="images\/goldkrill\.png" alt=""/);
  assert.ok(fs.existsSync(path.join(projectDir, "images", "goldkrill.png")));
  assert.match(announcements.children[0].children[0].textContent, /ONE IN A KRILLION/);
  assert.match(announcements.children[0].children[1].textContent, /Jimmy · Nov 1/);
  const timer = [...timers.values()][0];
  assert.equal(timer.delay, 4500);
  timer.callback();
  assert.equal(particles.children.length, 0);
  assert.equal(announcements.children.length, 0);
  vm.runInContext('celebrateRound("2026-11-01"); celebrateRound("2026-11-02")', context);
  assert.equal(particles.children.length, 0);
  assert.equal(announcements.children.length, 0);
  assert.equal(timers.size, 0);
});

test("mixed celebrations retain squid particles and one shrine, with a still shrine for reduced motion", () => {
  const ledger = `const scores = [
    { date: "2026-11-01", player: "Jimmy", points: 400, event: "krillion" },
    { date: "2026-11-01", player: "Steven", points: 390, event: "krillion" },
    { date: "2026-11-01", player: "Chris", points: 300, event: "squid" }
  ];`;
  for (const reducedMotion of [false, true]) {
    const { nodes } = renderPage(ledger, { reducedMotion });
    const particles = nodes.get("#celebration-particles").children;
    assert.equal(particles.filter((node) => node.className === "krillion-shrine").length, 1);
    assert.equal(particles.filter((node) => node.className === "celebration-particle squid").length, reducedMotion ? 0 : 28);
    assert.equal(nodes.get("#celebration-announcements").children.length, 3);
  }
});

test("latest round shows season rank movement from the prior round", () => {
  const html = renderLedger(`const scores = [
    { date: "2026-11-05", player: "Steven", points: 1820 },
    { date: "2026-11-05", player: "Jimmy", points: 1810 },
    { date: "2026-11-05", player: "Kasra", points: 1625 },
    { date: "2026-11-05", player: "Chris", points: 1515 },
    { date: "2026-11-05", player: "Brady", points: 1285 },
    { date: "2026-11-06", player: "Steven", points: 355 },
    { date: "2026-11-06", player: "Jimmy", points: 215 },
    { date: "2026-11-06", player: "Kasra", points: 410 },
    { date: "2026-11-06", player: "Chris", points: 325 },
    { date: "2026-11-06", player: "Brady", points: 385 }
  ];`);
  assert.match(playerRow(html, "Kasra"), /class="rank-movement up" aria-label="Up 1 place since the previous round"/);
  assert.match(playerRow(html, "Jimmy"), /class="rank-movement down" aria-label="Down 1 place since the previous round"/);
  assert.match(playerRow(html, "Steven"), /class="rank-movement steady" aria-label="No change since the previous round"/);
});

test("ties use shared ranks and a new player has no prior movement", () => {
  const html = renderLedger(`const scores = [
    { date: "2026-11-01", player: "Kasra", points: 100 },
    { date: "2026-11-01", player: "Jimmy", points: 90 },
    { date: "2026-11-01", player: "Steven", points: 50 },
    { date: "2026-11-02", player: "Jimmy", points: 10 },
    { date: "2026-11-02", player: "Chris", points: 200 }
  ];`);
  assert.match(playerRow(html, "Chris"), /class="rank-movement new"/);
  assert.match(playerRow(html, "Kasra"), /class="rank-movement down" aria-label="Down 1 place/);
  assert.match(playerRow(html, "Jimmy"), /class="rank-movement steady"/);
  assert.match(playerRow(html, "Steven"), /class="rank-movement down" aria-label="Down 1 place/);
  assert.doesNotMatch(playerRow(html, "Brady"), /rank-movement/);
});

test("first round marks players as new rather than inventing previous ranks", () => {
  const html = renderLedger('const scores = [{ date: "2026-11-01", player: "Jimmy", points: 10 }];');
  assert.match(playerRow(html, "Jimmy"), /class="rank-movement new" aria-label="No previous standing"/);
  assert.doesNotMatch(playerRow(html, "Kasra"), /rank-movement/);
});

test("a new sole leader gets a crown-change subtitle on the latest finalized round", () => {
  const { nodes } = renderPage(`const scores = [
    { date: "2026-11-01", player: "Steven", points: 100 },
    { date: "2026-11-02", player: "Kasra", points: 150 }
  ];`);
  assert.equal(nodes.get("#champion-name").textContent, "Kasra");
  assert.equal(nodes.get("#champion-subtitle").textContent, "Kasra takes the crown today. Who's coming for it?");
});

test("provisional rounds do not trigger a new-champion subtitle", () => {
  const { nodes } = renderPage(`const scores = [
    { date: "2026-11-01", player: "Steven", points: 100 },
    { date: "2026-11-02", player: "Kasra", points: 150 },
    { date: "2026-11-03", player: "Steven", points: 0, pending: true }
  ];`);
  assert.equal(nodes.get("#champion-name").textContent, "Kasra");
  assert.notEqual(nodes.get("#champion-subtitle").textContent, "Kasra takes the crown today. Who's coming for it?");
});

const partialLedger = `const scores = [
  { date: "2026-11-08", player: "Brady", points: 100 },
  { date: "2026-11-08", player: "Jimmy", points: 200 },
  { date: "2026-11-09", player: "Brady", points: 360 },
  { date: "2026-11-09", player: "Jimmy", points: 295 },
  { date: "2026-11-09", player: "Kasra", points: 390 },
  { date: "2026-11-09", player: "Chris", points: 0, pending: true },
  { date: "2026-11-09", player: "Steven", points: 0, pending: true }
];`;

test("pending zeros display provisionally without changing official results", () => {
  const baseline = renderPage(`const scores = [
    { date: "2026-11-08", player: "Brady", points: 100 },
    { date: "2026-11-08", player: "Jimmy", points: 200 }
  ];`);
  const { nodes, context } = renderPage(partialLedger);
  for (const selector of [
    "#standings-body", "#most-wins", "#biggest-score", "#squid-count", "#rank-chart"
  ]) {
    assert.equal(nodes.get(selector).innerHTML, baseline.nodes.get(selector).innerHTML, selector);
  }
  assert.equal(nodes.get("#champion-total").textContent, "200");
  assert.match(nodes.get("#round-selector").innerHTML, /Nov 9<small>Provisional/);
  const detail = nodes.get("#round-detail").innerHTML;
  assert.match(detail, /Provisional: 3 of 5 submitted/);
  for (const player of ["Chris", "Steven"]) {
    const card = detail.split("</article>").find((entry) => entry.includes(`>${player}</span>`));
    assert.match(card, /0 <small>pts \(pending\)/);
    assert.match(card, /class="round-result-rank"><\/span>/);
  }
  assert.match(detail, /390 <small>pts/);
  vm.runInContext("renderChart(getDays())", context);
  assert.equal(nodes.get("#rank-chart").innerHTML, baseline.nodes.get("#rank-chart").innerHTML);
});

test("round stays provisional until the last pending entry is resolved", () => {
  const { nodes } = renderPage(partialLedger.replace(
    'player: "Chris", points: 0, pending: true',
    'player: "Chris", points: 410'
  ));
  assert.match(nodes.get("#round-detail").innerHTML, /Provisional: 4 of 5 submitted/);
  assert.equal(nodes.get("#champion-total").textContent, "200");
});

test("removing pending finalizes the round, including confirmed zeros", () => {
  const { nodes, context } = renderPage(partialLedger.replaceAll(", pending: true", ""));
  assert.doesNotMatch(nodes.get("#round-detail").innerHTML, /Provisional|pending/);
  assert.equal(nodes.get("#champion-name").textContent, "Jimmy");
  assert.equal(nodes.get("#champion-total").textContent, "495");
  assert.match(nodes.get("#biggest-score").innerHTML, /Kasra.*390 pts/);
  assert.match(nodes.get("#rank-chart").innerHTML, /Nov 9/);
  assert.equal(vm.runInContext('getStandings().find(({ name }) => name === "Kasra").wins', context), 1);
  assert.equal(vm.runInContext('getStandings().find(({ name }) => name === "Chris").daysPlayed', context), 1);
});

test("invalid pending markers cannot masquerade as confirmed scores", () => {
  for (const entry of [
    '{ date: "2026-11-09", player: "Chris", points: 0, pending: "true" }',
    '{ date: "2026-11-09", player: "Chris", points: 10, pending: true }',
    '{ date: "2026-11-09", player: "Chris", points: 0, pending: true, event: "squid" }'
  ]) {
    assert.throws(() => renderPage(`const scores = [${entry}];`), /ledger could not be loaded/);
  }
});

test("published November 9 ledger counts Chris and Steven's confirmed zero scores", () => {
  const ledger = fs.readFileSync(path.join(projectDir, "scores.js"), "utf8");
  const context = vm.createContext({});
  vm.runInContext(ledger, context);
  const today = JSON.parse(vm.runInContext(
    'JSON.stringify(scores.filter(({ date }) => date === "2026-11-09"))', context
  ));
  assert.deepEqual(today, [
    { date: "2026-11-09", player: "Brady", points: 360 },
    { date: "2026-11-09", player: "Jimmy", points: 295 },
    { date: "2026-11-09", player: "Kasra", points: 390 },
    { date: "2026-11-09", player: "Chris", points: 0 },
    { date: "2026-11-09", player: "Steven", points: 0 }
  ]);

  const { nodes, context: pageContext } = renderPage(ledger);
  vm.runInContext('renderRoundDetail("2026-11-09")', pageContext);
  const detail = nodes.get("#round-detail").innerHTML;
  assert.doesNotMatch(detail, /Provisional|pending/);
  for (const player of ["Chris", "Steven"]) {
    const card = detail.split("</article>").find((entry) => entry.includes(`>${player}</span>`));
    assert.match(card, /class="round-result-rank">04<\/span>/);
    assert.match(card, /0 <small>pts<\/small>/);
  }
  for (const player of ["Chris", "Steven"]) {
    assert.equal(
      vm.runInContext(`getStandings(getDays().filter((date) => date <= "2026-11-09")).find(({ name }) => name === "${player}").daysPlayed`, pageContext),
      9
    );
  }
});

function changeSelect(nodes, selector, value) {
  const node = nodes.get(selector);
  node.value = value;
  node.listeners.change({ target: node });
}

test("daily chart caps each range at seven finalized rounds and keeps all recaps", () => {
  const ledger = fs.readFileSync(path.join(projectDir, "scores.js"), "utf8");
  const { nodes } = renderPage(`${ledger}
    scores.splice(0, scores.length, ...scores.filter(({ date }) => date >= "2026-11-01" && date <= "2026-11-12"));
  `);
  const chart = () => nodes.get("#rank-chart").innerHTML;
  assert.equal((chart().match(/class="chart-dot"/g) || []).length, 35);
  assert.equal((chart().match(/class="chart-x-label"/g) || []).length, 7);
  assert.match(chart(), /Nov 6/);
  assert.doesNotMatch(chart(), />Nov 5</);
  assert.match(nodes.get("#chart-range").innerHTML, /Latest: Nov 6–12/);
  assert.equal((nodes.get("#round-selector").innerHTML.match(/class="round-button"/g) || []).length, 12);
  const total = nodes.get("#champion-total").textContent;
  changeSelect(nodes, "#chart-range", "1");
  assert.equal((chart().match(/class="chart-dot"/g) || []).length, 25);
  assert.match(chart(), /Nov 1/);
  assert.doesNotMatch(chart(), /Nov 6/);
  assert.equal(nodes.get("#champion-total").textContent, total);
  nodes.get("#chart-legend").listeners.click({
    target: { closest: () => ({ dataset: { player: "Jimmy" } }) }
  });
  assert.match(chart(), /fill="#648b66" style="display:none"/);
  assert.doesNotMatch(chart(), /Nov 6/);
  changeSelect(nodes, "#chart-view", "weekly");
  assert.equal((chart().match(/class="chart-x-label"/g) || []).length, 3);
  assert.equal((chart().match(/class="chart-dot"/g) || []).length, 15);
  assert.equal(nodes.get("#chart-range").hidden, true);
  assert.match(chart(), /fill="#648b66" style="display:none"/);
  changeSelect(nodes, "#chart-view", "daily");
  assert.equal(nodes.get("#chart-range").hidden, false);
  assert.doesNotMatch(chart(), /Nov 6/);
});

test("weekly ranks use point totals, shared ties and Monday boundaries, excluding provisional rounds", () => {
  const { nodes, context } = renderPage(`const scores = [
    { date: "2026-11-01", player: "Jimmy", points: 100 },
    { date: "2026-11-02", player: "Jimmy", points: 10 },
    { date: "2026-11-02", player: "Steven", points: 100 },
    { date: "2026-11-08", player: "Jimmy", points: 90 },
    { date: "2026-11-08", player: "Steven", points: 0 },
    { date: "2026-11-08", player: "Kasra", points: 95 },
    { date: "2026-11-09", player: "Jimmy", points: 1 },
    { date: "2026-11-10", player: "Steven", points: 900 },
    { date: "2026-11-10", player: "Jimmy", points: 0, pending: true }
  ];`);
  const periods = JSON.parse(vm.runInContext(
    "JSON.stringify(getWeeklyPeriods(getFinalDays(getSeasonDays())))", context
  ));
  assert.deepEqual(periods.map(({ days }) => days), [
    ["2026-11-01"], ["2026-11-02", "2026-11-08"], ["2026-11-09"]
  ]);
  assert.deepEqual(periods[1].scores, [
    { player: "Steven", points: 100 }, { player: "Jimmy", points: 100 }, { player: "Kasra", points: 95 }
  ]);
  changeSelect(nodes, "#chart-view", "weekly");
  const chart = nodes.get("#rank-chart").innerHTML;
  assert.match(chart, /Jimmy: Nov 2–8, place 1, 100 points across 2 finalized rounds/);
  assert.match(chart, /Steven: Nov 2–8, place 1, 100 points across 2 finalized rounds/);
  assert.match(chart, /Kasra: Nov 2–8, place 3, 95 points/);
  assert.doesNotMatch(chart, /900 points|Nov 10/);
});

test("monthly seasons isolate all results and allow archive and current-month navigation", () => {
  const { nodes } = renderPage(`const scores = [
    { date: "2026-11-30", player: "Steven", points: 440, event: "squid" },
    { date: "2026-12-01", player: "Jimmy", points: 100 },
    { date: "2026-12-02", player: "Steven", points: 200 },
    { date: "2026-12-03", player: "Jimmy", points: 0, pending: true }
  ];`);
  assert.equal(nodes.get("#season-select").value, "2026-12");
  assert.match(nodes.get("#season-select").innerHTML, /November 2026 \(archive\)/);
  assert.equal(nodes.get("#champion-name").textContent, "Steven");
  assert.equal(nodes.get("#champion-total").textContent, "200");
  assert.match(nodes.get("#biggest-score").innerHTML, /200 pts/);
  assert.match(nodes.get("#squid-count").innerHTML, /^0 /);
  assert.match(playerRow(nodes.get("#standings-body").innerHTML, "Steven"), /<strong>1<\/strong> win/);
  assert.equal(nodes.get("#days-logged").textContent, "3 DAYS LOGGED");
  assert.doesNotMatch(nodes.get("#round-selector").innerHTML, /Nov 30/);
  changeSelect(nodes, "#chart-view", "weekly");
  assert.doesNotMatch(nodes.get("#rank-chart").innerHTML, /Nov 30|440 points/);
  changeSelect(nodes, "#season-select", "2026-11");
  assert.equal(nodes.get("#champion-total").textContent, "440");
  assert.equal(nodes.get("#champion-name").textContent, "Steven");
  assert.match(nodes.get("#biggest-score").innerHTML, /440 pts/);
  assert.match(nodes.get("#squid-count").innerHTML, /^1 /);
  assert.equal(nodes.get("#round-count").textContent, "1 ROUND");
  assert.equal(nodes.get("#season-label").textContent, "NOV '26");
  assert.equal(nodes.get("#season-stamp-label").textContent, "ARCHIVED SEASON");
  assert.match(nodes.get("#season-description").textContent, /archived/);
  assert.doesNotMatch(nodes.get("#champion-subtitle").textContent, /today/);
  assert.match(playerRow(nodes.get("#standings-body").innerHTML, "Steven"), /rank-movement new/);
  assert.doesNotMatch(nodes.get("#rank-chart").innerHTML, /Dec/);
  assert.match(nodes.get("#round-detail").innerHTML, /November 30/);
  assert.equal(nodes.get("#celebration-announcements").children.length, 1);
  changeSelect(nodes, "#season-select", "2026-12");
  assert.equal(nodes.get("#champion-total").textContent, "200");
  assert.equal(nodes.get("#season-stamp-label").textContent, "CURRENT SEASON");
  assert.match(nodes.get("#round-detail").innerHTML, /December 3/);
  assert.equal(nodes.get("#celebration-announcements").children.length, 0);
});

test("a new month with only provisional scores does not inherit an archived crown or highlights", () => {
  const { nodes } = renderPage(`const scores = [
    { date: "2026-11-30", player: "Steven", points: 440, event: "squid" },
    { date: "2026-12-01", player: "Jimmy", points: 0, pending: true }
  ];`);
  assert.equal(nodes.get("#champion-name").textContent, "Nobody");
  assert.equal(nodes.get("#champion-total").textContent, "0");
  assert.equal(nodes.get("#champion-lead").textContent, "NO SCORES YET");
  assert.doesNotMatch(nodes.get("#standings-body").innerHTML, /champion-crown/);
  assert.match(nodes.get("#biggest-score").innerHTML, /no scores yet/);
  assert.match(nodes.get("#most-wins").innerHTML, /no wins yet/);
  assert.match(nodes.get("#squid-count").innerHTML, /^0 /);
  assert.match(nodes.get("#chart-description").textContent, /No finalized rounds/);
  assert.equal(nodes.get("#chart-range").disabled, true);
  assert.doesNotMatch(nodes.get("#rank-chart").innerHTML, /class="chart-dot"/);
  changeSelect(nodes, "#chart-view", "weekly");
  assert.doesNotMatch(nodes.get("#rank-chart").innerHTML, /class="chart-dot"/);
  changeSelect(nodes, "#season-select", "2026-11");
  assert.equal(nodes.get("#champion-total").textContent, "440");
});

test("daily ranges remain capped for a full month and handle empty data", () => {
  const { nodes, context } = renderPage(`const scores = Array.from({ length: 31 }, (_, index) => ({
    date: "2026-12-" + String(index + 1).padStart(2, "0"), player: "Jimmy", points: 100
  }));`);
  const ranges = JSON.parse(vm.runInContext(
    "JSON.stringify(getDailyRanges(getFinalDays(getSeasonDays())))", context
  ));
  assert.deepEqual(ranges.map((range) => range.length), [7, 7, 7, 7, 3]);
  assert.equal(new Set(ranges.flat()).size, 31);
  changeSelect(nodes, "#chart-range", "4");
  assert.equal((nodes.get("#rank-chart").innerHTML.match(/class="chart-dot"/g) || []).length, 3);
  changeSelect(nodes, "#chart-view", "weekly");
  assert.equal((nodes.get("#rank-chart").innerHTML.match(/class="chart-dot"/g) || []).length, 5);
  const empty = renderPage("const scores = [];").nodes;
  assert.equal(empty.get("#season-select").disabled, true);
  assert.equal(empty.get("#season-label").textContent, "NO SEASON");
  assert.match(empty.get("#round-detail").innerHTML, /No rounds published/);
  assert.match(empty.get("#chart-description").textContent, /No finalized rounds/);
});

function weeklyLedger(rounds = 7) {
  const players = ["Jimmy", "Steven", "Kasra", "Chris", "Brady"];
  return Array.from({ length: rounds }, (_, index) => players.map((player, playerIndex) => ({
    date: `2026-11-${String(index + 9).padStart(2, "0")}`,
    player,
    points: 100 - playerIndex * 10,
    ...(index === 0 && player === "Jimmy" ? { event: "krillion" } : {}),
    ...(index === 1 && player === "Steven" ? { event: "squid" } : {})
  }))).flat();
}

test("Saturday report is live, summarizes only this week and compares season ranks to before Monday", () => {
  const previous = ["Jimmy", "Steven", "Kasra", "Chris", "Brady"].map((player, index) => ({
    date: "2026-11-08", player, points: [0, 20, 15, 10, 5][index]
  }));
  const { nodes } = renderPage(`const scores = ${JSON.stringify([...previous, ...weeklyLedger(6)])};`);
  const detail = nodes.get("#weekly-detail").innerHTML;
  assert.match(detail, /Weekend watch — week in progress/);
  assert.match(detail, /Jimmy leads the week by 60 points/);
  assert.match(detail, /1 round still needs confirmation/);
  assert.match(detail, /6 of 7 rounds complete/);
  assert.match(detail, /Jimmy<\/strong><span>600 pts · 6 daily wins/);
  assert.match(detail, /100 pts/);
  assert.match(detail, /1 squid party · 1 Krillion catch/);
  assert.match(detail, /Jimmy: up 4 places/);
  assert.match(detail, /Steven: down 1 place/);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
  assert.equal(nodes.get("#week-select").value, "2026-11-09");
  const seasonTotal = nodes.get("#champion-total").textContent;
  changeSelect(nodes, "#week-select", "2026-11-02");
  assert.match(nodes.get("#weekly-detail").innerHTML, /Steven leads the week by 5 points/);
  assert.match(nodes.get("#weekly-detail").innerHTML, /Missing rounds: Nov 2/);
  assert.doesNotMatch(nodes.get("#weekly-detail").innerHTML, /600 pts/);
  assert.equal(nodes.get("#champion-total").textContent, seasonTotal);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
});

test("Sunday wraps complete weeks, handles tied crowns and wins, and celebrates only once per page", () => {
  const entries = weeklyLedger().map((entry) => entry.player === "Steven" ? { ...entry, points: 100 } : entry);
  entries.find(({ date, player }) => date === "2026-11-15" && player === "Steven").event = "squid";
  const { nodes, context, timers } = renderPage(`const scores = ${JSON.stringify(entries)};`, { reducedMotion: true });
  const detail = nodes.get("#weekly-detail").innerHTML;
  assert.match(detail, /Week wrapped/);
  assert.match(detail, /Jimmy and Steven share the weekly crown at 700 points/);
  assert.match(detail, /7 of 7 rounds complete/);
  assert.equal((detail.match(/PLACE 1/g) || []).length, 2);
  assert.match(detail, /MOST DAILY WINS<\/small><strong>Jimmy and Steven/);
  assert.match(detail, /Kasra<\/strong><span>560 pts/);
  assert.doesNotMatch(detail, /SO FAR|still need/);
  assert.equal(nodes.get("#weekly-celebration").hidden, false);
  assert.match(nodes.get("#weekly-celebration").textContent, /Jimmy and Steven share/);
  assert.equal(nodes.get("#celebration-announcements").children.length, 1);
  assert.equal(nodes.get("#celebration-particles").children.length, 0);
  assert.equal(timers.size, 2);
  for (const timer of [...timers.values()]) timer.callback();
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
  vm.runInContext("renderWeeklyReport(getSeasonDays())", context);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
  assert.equal(timers.size, 0);
});

test("missing dates, missing player submissions and provisional Sunday prevent a weekly wrap", () => {
  const entries = weeklyLedger();
  const variants = [
    { entries: entries.filter(({ date }) => date !== "2026-11-11"), notice: /Missing rounds: Nov 11/ },
    { entries: entries.filter(({ date, player }) => date !== "2026-11-11" || player !== "Chris"), notice: /Missing player submissions: Nov 11/ },
    { entries: entries.map((entry) => entry.date === "2026-11-15" && entry.player === "Jimmy"
      ? { ...entry, points: 0, pending: true }
      : entry.date === "2026-11-15" && entry.player === "Steven" ? { ...entry, points: 900, event: "squid" } : entry),
      notice: /Provisional rounds excluded: Nov 15/ }
  ];
  for (const variant of variants) {
    const { nodes } = renderPage(`const scores = ${JSON.stringify(variant.entries)};`);
    const detail = nodes.get("#weekly-detail").innerHTML;
    assert.match(detail, /Week incomplete/);
    assert.match(detail, /6 of 7 rounds complete/);
    assert.match(detail, variant.notice);
    assert.doesNotMatch(detail, /wins the week|Week wrapped|900 pts/);
    assert.equal(nodes.get("#weekly-celebration").hidden, true);
  }
  const resolved = variants[2].entries.map(({ pending, ...entry }) => entry);
  const { nodes } = renderPage(`const scores = ${JSON.stringify(resolved)};`);
  assert.match(nodes.get("#weekly-detail").innerHTML, /Steven wins the week by 840 points/);
  assert.match(nodes.get("#weekly-detail").innerHTML, /900 pts/);
  assert.equal(nodes.get("#weekly-celebration").hidden, false);
});

test("month-edge reports stay partial and archive navigation never celebrates older weeks", () => {
  const entries = weeklyLedger().map((entry) => ({
    ...entry, date: entry.date === "2026-11-09" ? "2026-11-30"
      : `2026-12-${String(Number(entry.date.slice(-2)) - 9).padStart(2, "0")}`
  }));
  const { nodes } = renderPage(`const scores = ${JSON.stringify([...weeklyLedger(), ...entries])};`);
  assert.equal(nodes.get("#week-select").value, "2026-11-30");
  assert.match(nodes.get("#weekly-detail").innerHTML, /Partial week — month boundary/);
  assert.match(nodes.get("#weekly-detail").innerHTML, /6 of 6 rounds complete/);
  assert.match(nodes.get("#weekly-detail").innerHTML, /Jimmy<\/strong><span>600 pts/);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
  changeSelect(nodes, "#season-select", "2026-11");
  assert.match(nodes.get("#weekly-detail").innerHTML, /1 of 1 rounds complete/);
  assert.match(nodes.get("#weekly-detail").innerHTML, /100 pts/);
  changeSelect(nodes, "#week-select", "2026-11-09");
  assert.match(nodes.get("#weekly-detail").innerHTML, /Week wrapped/);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
  changeSelect(nodes, "#season-select", "2026-12");
  assert.equal(nodes.get("#week-select").value, "2026-11-30");
  assert.match(nodes.get("#weekly-detail").innerHTML, /600 pts/);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
});

test("weekly reports handle empty and entirely provisional data without inventing awards", () => {
  const empty = renderPage("const scores = [];").nodes;
  assert.equal(empty.get("#week-select").disabled, true);
  assert.match(empty.get("#weekly-detail").innerHTML, /No weekly scores/);
  assert.equal(empty.get("#weekly-celebration").hidden, true);
  const entries = weeklyLedger(1).map(({ event, ...entry }) => ({ ...entry, points: 0, pending: true }));
  const { nodes } = renderPage(`const scores = ${JSON.stringify(entries)};`);
  const detail = nodes.get("#weekly-detail").innerHTML;
  assert.match(detail, /waiting for finalized scores/);
  assert.match(detail, /No wins yet|No scores yet/);
  assert.doesNotMatch(detail, /PLACE 1|wins the week/);
  assert.equal(nodes.get("#weekly-celebration").hidden, true);
});

test("announcer recap stays under 60 words and distinguishes a tight live race from a wrapped finish", () => {
  for (const rounds of [6, 7]) {
    const entries = weeklyLedger(rounds).map((entry) =>
      entry.player === "Steven" ? { ...entry, points: 99 } : entry);
    const previous = entries.filter(({ date }) => date === "2026-11-09")
      .map((entry) => ({ ...entry, date: "2026-11-08" }));
    const { nodes, context } = renderPage(`const scores = ${JSON.stringify([...previous, ...entries])};`);
    const copy = JSON.parse(vm.runInContext(
      "JSON.stringify(getWeekAnnouncement(getWeekReview(getWeeklyPeriods(getSeasonDays()).slice(-1)[0], getSeasonDays())))",
      context
    ));
    assert.ok(`${copy.headline} ${copy.commentary}`.split(/\s+/).length <= 60);
    assert.match(copy.commentary, /The season order hasn't budged/);
    if (rounds === 6) {
      assert.equal(copy.headline, "Jimmy holds the lead!");
      assert.match(copy.commentary, /Just 6 points of breathing room/);
      assert.match(copy.commentary, /Sunday's still in play/);
      assert.doesNotMatch(copy.commentary, /next week|photo finish/);
    } else {
      assert.equal(copy.headline, "Jimmy takes the week!");
      assert.match(copy.commentary, /Just 7 points.*photo finish/);
      assert.match(copy.commentary, /Who's stealing the crown next week/);
      assert.doesNotMatch(copy.commentary, /could flip this|Sunday's still in play/);
    }
    const detail = nodes.get("#weekly-detail").innerHTML;
    const scorecard = detail.indexOf('<details class="weekly-scorecard">');
    assert.ok(scorecard > detail.indexOf('class="weekly-announcer"'));
    assert.ok(scorecard < detail.indexOf('class="weekly-podium"'));
    assert.doesNotMatch(detail, /<details[^>]*\bopen\b/);
  }
});

test("announcer reflects actual season movement, ties and incomplete weeks without calling a false winner", () => {
  const previous = ["Jimmy", "Steven", "Kasra", "Chris", "Brady"].map((player, index) => ({
    date: "2026-11-08", player, points: [0, 20, 15, 10, 5][index]
  }));
  const entries = weeklyLedger();
  const cases = [
    { entries: [...previous, ...entries], headline: /Jimmy takes the week!/, commentary: /Jimmy climbs 4 places/ },
    { entries: entries.map((entry) => entry.player === "Steven" ? { ...entry, points: 100 } : entry),
      headline: /Jimmy and Steven: a shared crown!/, commentary: /No daylight between them/ },
    { entries: entries.filter(({ date }) => date !== "2026-11-11"),
      headline: /Jimmy holds the lead!/, commentary: /No final crown yet/ }
  ];
  for (const scenario of cases) {
    const { context } = renderPage(`const scores = ${JSON.stringify(scenario.entries)};`);
    const copy = JSON.parse(vm.runInContext(
      "JSON.stringify(getWeekAnnouncement(getWeekReview(getWeeklyPeriods(getSeasonDays()).slice(-1)[0], getSeasonDays())))",
      context
    ));
    assert.match(copy.headline, scenario.headline);
    assert.match(copy.commentary, scenario.commentary);
    assert.ok(`${copy.headline} ${copy.commentary}`.split(/\s+/).length <= 60);
    if (scenario.commentary.source.includes("No final")) {
      assert.doesNotMatch(copy.headline, /takes the week|shared crown/);
      assert.doesNotMatch(copy.commentary, /next week/);
    }
  }
});
