import { SHOPS, TODAY } from './data.js';
import { runShopCheck } from './audit.js';
import { ruleTemplate, fill } from './narrate.js';

const $ = (id) => document.getElementById(id);
const el = (tag, props = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...kids.filter((k) => k !== null && k !== undefined));
  return node;
};
const screen = $('screen');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));

let shop = SHOPS[0];
let run = 0; // every restart gets a new number, so an old timer cannot draw over a new screen
let topLine = null; // { text, by }
let tab = 'pip';
let loaded = new Set();

const CHIP = { 'Checked': 'checked', 'Partly checked': 'partly', 'Still reading': 'reading', 'Not counted yet': 'not' };

function connectScreen() {
  screen.replaceChildren(
    el('div', { className: 'center' }, el('div', { className: 'pip' }), el('h2', { textContent: `Hi, ${shop.name}.` }),
      el('p', { className: 'muted', textContent: 'Connect your shop and I will check it. It takes about half a minute. I only read. I do not change your shop or message anyone.' })),
    el('button', { className: 'btn tape full', type: 'button', id: 'connect', textContent: 'Connect your TikTok Shop', onclick: () => waitingScreen() }),
    el('p', { className: 'muted center', style: 'margin-top:10px;font-size:12.5px', textContent: 'A demo: nothing connects to TikTok.' }));
}

async function waitingScreen() {
  const mine = ++run;
  const names = ['Shop connected', 'Orders', 'Products and stock', 'Samples', 'Report ready'];
  const items = names.map((n) => el('li', {}, el('span', { className: 'mark' }), el('span', { textContent: n }), el('span', { className: 'word', textContent: 'waiting' })));
  screen.replaceChildren(
    el('h2', { textContent: "We're reading your shop" }),
    el('p', { className: 'muted', textContent: 'This usually takes under a minute. In this demo it takes a few seconds.' }),
    el('div', { className: 'card' }, el('ul', { className: 'steps' }, ...items)));
  for (const item of items) {
    item.className = 'now';
    item.querySelector('.word').textContent = 'reading now';
    await wait(650);
    if (mine !== run) return;
    item.className = 'done';
    item.querySelector('.mark').textContent = '✓';
    item.querySelector('.word').textContent = 'done';
  }
  await wait(350);
  if (mine !== run) return;
  loaded = new Set(['chats'].filter((src) => !shop.arrivesLater.includes(src)));
  topLine = null;
  tab = 'pip';
  reportScreen();
  if (shop.arrivesLater.length) {
    await wait(6000);
    if (mine !== run) return;
    loaded = new Set(['chats']);
    if (topLine?.by === 'rules') topLine = null;
    if (screen.dataset.view === 'report') reportScreen(true);
  }
}

function rowsTable(rows) {
  const cols = Object.keys(rows[0]);
  return el('div', { className: 'rows' }, el('table', {},
    el('thead', {}, el('tr', {}, ...cols.map((c) => el('th', { textContent: c.replaceAll('_', ' ') })))),
    el('tbody', {}, ...rows.map((r) => el('tr', {}, ...cols.map((c) => el('td', { textContent: r[c] === null ? 'Not counted' : String(r[c]) })))))));
}

function actionButton(f) {
  return el('button', { className: 'btn plain', type: 'button', textContent: f.action.label, onclick: () => chatScreen(f) });
}

function reportScreen(keepScroll = false) {
  const at = keepScroll ? screen.scrollTop : 0;
  const report = runShopCheck(shop, TODAY, loaded);
  if (!topLine) topLine = { text: fill(ruleTemplate(report), report).text, by: 'rules' };
  screen.dataset.view = 'report';

  const tiles = el('div', { className: 'tiles' }, ...report.tiles.map((t) => el('div', { className: `tile ${t.state}` },
    el('div', { className: 'label', textContent: t.label }),
    el('div', { className: 'value num', textContent: t.display }),
    t.note ? el('div', { className: 'note', textContent: t.note }) : null)));

  const tabs = el('div', { className: 'tabs', role: 'tablist' },
    ...[['pip', 'Pip'], ['team', 'Your team']].map(([id, name]) => {
      const b = el('button', { type: 'button', role: 'tab', textContent: name, onclick: () => { tab = id; reportScreen(true); } });
      b.setAttribute('aria-selected', String(tab === id));
      return b;
    }));

  const body = el('div');
  if (tab === 'pip') {
    const n = report.problems.length;
    body.append(el('div', { className: 'who' }, el('div', { className: 'pip small' }), n ? `Pip · Top ${n === 1 ? 'problem' : `${n} problems`}` : 'Pip'));
    if (!n) body.append(el('div', { className: 'card' }, el('p', { className: 'muted', textContent: 'Nothing to fix here. I will check again in 30 days.' })));
    report.problems.forEach((f, i) => body.append(el('div', { className: `card problem${i === 0 ? ' first' : ''}` },
      el('span', { className: 'badge', textContent: i === 0 ? 'Needs attention' : 'Worth a look' }),
      el('div', { className: 'count', textContent: f.isRatio ? `Ad return ${f.count.toFixed(2)}, under target` : `${f.count} ${f.label}` }),
      el('div', { className: 'muted', style: 'font-size:12.5px', textContent: `As of ${TODAY}` }),
      el('p', { className: 'would', textContent: `What we'd do: ${f.wouldDo}` }),
      actionButton(f))));
    if (report.extras.length) {
      body.append(el('h3', { style: 'margin-top:18px', textContent: "What we'd add for your shop" }));
      report.extras.forEach((f) => body.append(el('div', { className: 'card extra' },
        el('p', { textContent: f.isRatio || f.isShare ? f.sentence : `${f.count} ${f.label}. ${f.wouldDo}` }), actionButton(f))));
    }
    body.append(el('div', { className: 'card center' }, el('h3', { textContent: 'Your next step' }),
      el('p', { className: 'muted', style: 'margin-top:4px', textContent: 'A free 15-minute call to walk through this report.' }),
      el('button', { className: 'btn tape full', type: 'button', textContent: 'Book your free call', onclick: (e) => { e.target.textContent = 'This is a demo. No call is booked.'; e.target.disabled = true; } })));
  } else {
    body.append(el('h3', { style: 'margin-top:16px', textContent: 'Your team found' }));
    report.agents.forEach((a) => body.append(el('div', { className: 'card agent' },
      el('header', {}, el('span', { className: 'avatar', textContent: a.initials }), el('b', { textContent: a.name }), el('span', { className: `chip ${CHIP[a.state]}`, textContent: a.state })),
      a.findings.length ? el('ul', {}, ...a.findings.map((f) => el('li', { className: f.good ? 'good' : '' }, f.sentence,
        f.rows.length && !f.good ? el('details', {}, el('summary', { textContent: `See all ${f.rows.length}` }), rowsTable(f.rows)) : null))) : null,
      a.pending ? el('p', { className: 'pending', textContent: a.pending }) : null)));
  }

  screen.replaceChildren(
    el('div', { className: 'center' }, el('div', { className: 'pip' }), el('p', { className: 'muted', textContent: 'Shop check summary' }), el('h2', { textContent: "Here's what we found" })),
    el('p', { style: 'margin-top:8px', id: 'top-line', textContent: topLine.text }),
    el('p', { className: 'muted', style: 'font-size:12.5px;margin-top:6px', textContent: `Last updated ${TODAY}, 3:43 pm Pacific. Nothing on this page changes your shop or messages anyone.` }),
    tiles, tabs, body);
  screen.scrollTop = at;
}

function chatScreen(f) {
  const agent = { creators: 'Creator Manager', service: 'Customer Service', ads: 'Ads Manager', monitoring: 'Monitoring' }[f.agent];
  screen.dataset.view = 'chat';
  const thread = el('div');
  const back = el('button', { className: 'btn plain', type: 'button', textContent: 'Back to the report', onclick: () => reportScreen() });
  const card = el('div', { className: 'card confirm' },
    el('h3', { textContent: `Shall I hand this to ${agent}?` }),
    el('p', { className: 'label', textContent: 'What will be sent' }), el('p', { textContent: f.action.sends }),
    el('p', { className: 'label', textContent: `Waiting for your OK. Nothing goes to ${agent} until you confirm.` }));
  const row = el('div', { className: 'row' },
    el('button', { className: 'btn', type: 'button', textContent: 'Confirm', onclick: () => {
      row.remove();
      thread.append(el('div', { className: 'bubble pip-says', textContent: `Handed over to ${agent} for drafting. Nothing has been sent. Each draft comes back here for your approval.` }), back);
      screen.scrollTop = screen.scrollHeight;
    } }),
    el('button', { className: 'btn plain', type: 'button', textContent: 'Cancel', onclick: () => {
      row.remove();
      thread.append(el('div', { className: 'bubble pip-says', textContent: 'Cancelled. Nothing was handed over.' }), back);
    } }));
  card.append(row);
  thread.append(el('div', { className: 'bubble me', textContent: f.action.label.replace(/^Have /, 'Please have ') + '.' }), card);
  screen.replaceChildren(el('div', { className: 'who' }, el('div', { className: 'pip small' }), 'Pip'), thread);
  screen.scrollTop = 0;
}

function pick(next) {
  shop = next;
  run++;
  $('sells').textContent = `${shop.sells}. ${shop.orders.length} orders in the last 30 days.`;
  [...$('shop-buttons').children].forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.shop === shop.id)));
  history.replaceState(null, '', `?shop=${shop.id}`);
  screen.dataset.view = 'connect';
  connectScreen();
}

SHOPS.forEach((s) => {
  const b = el('button', { type: 'button', textContent: s.name, onclick: () => pick(s) });
  b.dataset.shop = s.id;
  $('shop-buttons').append(b);
});
$('restart').addEventListener('click', () => pick(shop));

pick(SHOPS.find((s) => s.id === new URLSearchParams(location.search).get('shop')) || SHOPS[0]);
