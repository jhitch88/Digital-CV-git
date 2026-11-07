const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectDir = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(projectDir, "app.js"), "utf8");

function renderLedger(ledger) {
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
  return nodes.get("#standings-body").innerHTML;
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
