const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectDir = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(projectDir, "app.js"), "utf8");

function renderPage(ledger, { reducedMotion = false } = {}) {
  const nodes = new Map();
  const timers = new Map();
  let nextTimer = 0;
  function makeNode() {
    return {
      innerHTML: "",
      textContent: "",
      children: [],
      style: { setProperty() {} },
      setAttribute() {},
      addEventListener() {},
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
