import test from 'node:test';
import assert from 'node:assert/strict';
import { runShopCheck } from '../audit.js';
import { ruleTemplate, fill, facts, buildPrompt, claudeTemplate } from '../narrate.js';
import { SHOPS, TODAY } from '../data.js';

const base = () => ({
  id: 't', name: 'Test shop', salesPartial: false, arrivesLater: [],
  orders: [{ order: 'T-1', product: 'A', units: 1, amount: 10, placed_on: '2026-11-01', ship_by: '2026-11-03', shipped_on: '2026-11-02' }],
  products: [{ name: 'A', price: 10, stock: 50, rating: 4.5 }],
  creators: [], chats: [], ads: { week: 'w', spend: 100, sales: 400, target_return: 2.5 },
});
const check = (over, loaded) => runShopCheck({ ...base(), ...over }, '2026-11-16', loaded);
const get = (r, id) => r.findings.find((f) => f.id === id);
const tile = (r, id) => r.tiles.find((t) => t.id === id);
const agent = (r, id) => r.agents.find((a) => a.id === id);

test('a clean shop: zeros read "Nothing to fix here" and there are no problems', () => {
  const r = check({});
  assert.equal(r.problems.length, 0);
  assert.deepEqual([tile(r, 'orders.late').display, tile(r, 'orders.late').note], ['0', 'Nothing to fix here']);
  assert.ok(r.agents.every((a) => a.state === 'Checked'));
});

test('late orders: only unshipped orders past the ship-by date', () => {
  const o = (order, ship_by, shipped_on) => ({ ...base().orders[0], order, ship_by, shipped_on });
  const r = check({ orders: [o('T-1', '2026-11-03', '2026-11-09'), o('T-2', '2026-11-10', null), o('T-3', '2026-11-20', null)] });
  assert.equal(get(r, 'orders.late').count, 1);
  assert.equal(get(r, 'orders.late').rows[0].order, 'T-2');
});

test('stock: 5 units or fewer is low, 0 is out of stock', () => {
  const r = check({ products: [{ name: 'A', price: 1, stock: 5, rating: 5 }, { name: 'B', price: 1, stock: 0, rating: 5 }, { name: 'C', price: 1, stock: 6, rating: 5 }] });
  assert.equal(get(r, 'stock.low').count, 2);
  assert.deepEqual(get(r, 'stock.low').rows.map((x) => x.state), ['Low', 'Out of stock']);
});

test('stock with no count is "Partly checked", and the tile never claims a clean zero', () => {
  const r = check({ products: [{ name: 'A', price: 1, stock: null, rating: 5 }, { name: 'B', price: 1, stock: 80, rating: 5 }] });
  assert.equal(agent(r, 'monitoring').state, 'Partly checked');
  assert.match(agent(r, 'monitoring').pending, /1 product has no stock count \(A\)/);
  assert.deepEqual([tile(r, 'stock.low').display, tile(r, 'stock.low').note], ['0', 'Partly checked']);
});

test('no stock counts at all: the tile says "Not checked yet", not 0', () => {
  const r = check({ products: [{ name: 'A', price: 1, stock: null, rating: 5 }] });
  assert.equal(agent(r, 'monitoring').state, 'Not counted yet');
  assert.equal(tile(r, 'stock.low').display, 'Not checked yet');
});

test('ads not connected: no finding, and the note says unknown is not zero', () => {
  const r = check({ ads: null });
  assert.equal(agent(r, 'ads').state, 'Not counted yet');
  assert.equal(agent(r, 'ads').findings.length, 0);
  assert.match(agent(r, 'ads').pending, /not zero/);
});

test('ads under target become a problem with a proposal action', () => {
  const r = check({ ads: { week: 'w', spend: 100, sales: 180, target_return: 2.5 } });
  assert.equal(get(r, 'ads.return').count, 1.8);
  assert.ok(r.problems.some((p) => p.id === 'ads.return'));
});

test('customer chats still loading: "Still reading", then the numbers arrive', () => {
  const chats = [{ customer: 'C1', topic: 'x', replied: false, waiting_hours: 3 }, { customer: 'C2', topic: 'y', replied: true, waiting_hours: 0 }];
  const before = check({ chats }, new Set());
  assert.equal(agent(before, 'service').state, 'Still reading');
  assert.equal(get(before, 'chats.waiting'), undefined);
  const after = check({ chats }, new Set(['chats']));
  assert.equal(get(after, 'chats.waiting').count, 1);
  assert.equal(get(after, 'chats.replied').count, 50);
});

test('creators: waiting, samples with no post, quiet top earners', () => {
  const c = (creator, o) => ({ creator, waiting_days: null, last_message: '', sample_days_ago: null, posts_since_sample: 0, sales_90d: 0, days_since_post: null, ...o });
  const r = check({ creators: [c('@a', { waiting_days: 2 }), c('@b', { sample_days_ago: 30 }), c('@c', { sample_days_ago: 10 }), c('@d', { sales_90d: 5000, days_since_post: 45 })] });
  assert.deepEqual([get(r, 'creators.waiting').count, get(r, 'creators.nopost').count, get(r, 'creators.quiet').count], [1, 1, 1]);
});

test('problems: at most three, biggest count first', () => {
  const r = runShopCheck(SHOPS.find((x) => x.id === 'juniper'), TODAY);
  assert.equal(r.problems.length, 3);
  assert.ok(r.problems[0].count >= r.problems[1].count);
  assert.ok(r.extras.length > 0);
});

test('demo shops: one busy, one calm, one with gaps', () => {
  const states = (id) => Object.fromEntries(runShopCheck(SHOPS.find((x) => x.id === id), TODAY, new Set()).agents.map((a) => [a.id, a.state]));
  assert.equal(runShopCheck(SHOPS.find((x) => x.id === 'pocket'), TODAY).problems.length, 1);
  assert.deepEqual(states('mossback'), { creators: 'Checked', service: 'Still reading', ads: 'Not counted yet', monitoring: 'Partly checked' });
});

test('summary: the rule writer passes the check for every shop', () => {
  for (const shop of SHOPS) {
    const r = runShopCheck(shop, TODAY);
    const out = fill(ruleTemplate(r), r);
    assert.ok(out.ok, `${shop.id}: ${out.why}`);
    assert.doesNotMatch(out.text, /\{/);
  }
});

test('summary: a typed number or an unknown placeholder is rejected', () => {
  const r = runShopCheck(SHOPS[0], TODAY);
  assert.equal(fill('You have 12 creators waiting.', r).ok, false);
  assert.equal(fill('Sales grew by {sales.growth}.', r).ok, false);
  const good = fill('Reply to the {creators.waiting} creators first.', r);
  assert.equal(good.text, `Reply to the ${facts(r).get('creators.waiting')} creators first.`);
});

test('prompt: carries no numbers from the shop, only placeholders', () => {
  const r = runShopCheck(SHOPS[0], TODAY);
  const { system, user } = buildPrompt(r);
  assert.match(system, /must not write any digits/);
  assert.doesNotMatch(user, new RegExp(`\\b${facts(r).get('creators.waiting')} creators`));
  assert.match(user, /\{creators\.waiting\}/);
});

test('claude call: sends the browser header and reports a bad key plainly', async () => {
  const r = runShopCheck(SHOPS[0], TODAY);
  let seen;
  const ok = async (url, init) => { seen = init; return { ok: true, json: async () => ({ content: [{ type: 'text', text: 'Fix {orders.late} first.' }] }) }; };
  assert.equal(await claudeTemplate(r, 'k', ok), 'Fix {orders.late} first.');
  assert.equal(seen.headers['anthropic-dangerous-direct-browser-access'], 'true');
  await assert.rejects(() => claudeTemplate(r, 'k', async () => ({ ok: false, status: 401, json: async () => ({}) })), /not accepted/);
});
