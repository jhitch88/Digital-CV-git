const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectDir = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(projectDir, "app.js"), "utf8");

function renderPage(ledger) {
  const nodes = new Map();
  const document = {
    querySelector(selector) {
      if (!nodes.has(selector)) {
        nodes.set(selector, {
          innerHTML: "",
          textContent: "",
          setAttribute() {},
          addEventListener() {},
          replaceChildren() {},
          querySelectorAll() { return []; }
        });
      }
      return nodes.get(selector);
    }
  };
  const context = vm.createContext({ document, window: {}, Intl, setTimeout, clearTimeout });
  vm.runInContext(`${ledger}\n${app}`, context);
  return { nodes, context };
}

function renderLedger(ledger) {
  return renderPage(ledger).nodes.get("#standings-body").innerHTML;
}

function playerRow(html, player) {
  const row = html.split("</tr>").find((entry) => entry.includes(`</span>${player}`));
  assert.ok(row, `Missing standings row for ${player}`);
  return row;
}

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

test("published November 9 ledger contains three submissions and two pending zeros", () => {
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
    { date: "2026-11-09", player: "Chris", points: 0, pending: true },
    { date: "2026-11-09", player: "Steven", points: 0, pending: true }
  ]);
});
