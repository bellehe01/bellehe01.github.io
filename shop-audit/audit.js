// The shop check. Code works out every number; a language model never does.
// Four helpers each read their own records. A helper that could not read something
// says so. It never reports a missing number as 0.

// Demo settings, not TikTok Shop policy.
export const LIMITS = {
  lowStockUnits: 5, // this many units or fewer counts as low; 0 is out of stock
  lowRating: 4.0,
  quietSampleDays: 21, // a sample sent this long ago with no post
  quietEarnerDays: 30, // a top earner with no post for this long
  topEarnerSales: 1000,
  goodReplyShare: 0.9,
};

export const AGENTS = {
  creators: { name: 'Creator Manager', initials: 'CM' },
  service: { name: 'Customer Service', initials: 'CS' },
  ads: { name: 'Ads Manager', initials: 'AM' },
  monitoring: { name: 'Monitoring', initials: 'MN' },
};

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
const s = (n, one, many) => (n === 1 ? one : many);

// One counted thing a helper found. `label(n)` is the words that follow the count.
function finding(agent, id, count, label, opts = {}) {
  return {
    id, agent, count,
    label: label(count),
    sentence: opts.sentence ?? (count === 0 ? `No ${label(2)}.` : `I found ${count} ${label(count)}.`),
    rows: opts.rows ?? [],
    good: opts.good ?? count === 0,
    wouldDo: opts.wouldDo ?? null,
    action: opts.action ?? null,
  };
}

function creatorManager(shop) {
  if (shop.creators === null) return { state: 'Not counted yet', findings: [], pending: 'Creator messages are not read yet.' };
  const waiting = shop.creators.filter((c) => c.waiting_days !== null);
  const noPost = shop.creators.filter((c) => c.sample_days_ago !== null && c.sample_days_ago > LIMITS.quietSampleDays && c.posts_since_sample === 0);
  const quietEarners = shop.creators.filter((c) => c.sales_90d >= LIMITS.topEarnerSales && c.days_since_post !== null && c.days_since_post > LIMITS.quietEarnerDays);
  const pick = (rows, cols) => rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c]])));
  return {
    state: 'Checked',
    findings: [
      finding('creators', 'creators.waiting', waiting.length, (n) => s(n, 'creator waiting for a reply', 'creators waiting for a reply'), {
        rows: pick([...waiting].sort((a, b) => b.waiting_days - a.waiting_days), ['creator', 'waiting_days', 'last_message']),
        wouldDo: 'Creator Manager drafts a reply to each one, oldest first.',
        action: { label: `Have Creator Manager draft ${waiting.length} ${s(waiting.length, 'reply', 'replies')}`, sends: `Draft a reply to each of the ${waiting.length} creators who are waiting, oldest first.` },
      }),
      finding('creators', 'creators.nopost', noPost.length, (n) => s(n, 'sample with no post after 21 days', 'samples with no post after 21 days'), {
        rows: pick(noPost, ['creator', 'sample_days_ago', 'posts_since_sample']),
        wouldDo: 'Creator Manager drafts a friendly check-in for each creator.',
        action: { label: 'Have Creator Manager draft check-ins', sends: `Draft a check-in message for the ${noPost.length} creators who got a sample and have not posted.` },
      }),
      finding('creators', 'creators.quiet', quietEarners.length, (n) => s(n, 'top earner with no post in 30 days', 'top earners with no post in 30 days'), {
        rows: pick(quietEarners, ['creator', 'sales_90d', 'days_since_post']),
        wouldDo: 'Creator Manager drafts a new offer to bring them back.',
        action: { label: 'Have Creator Manager draft a win-back note', sends: `Draft a win-back note for the ${quietEarners.length} top earners who stopped posting.` },
      }),
    ],
    pending: null,
  };
}

function customerService(shop, today, loaded) {
  const late = shop.orders.filter((o) => o.shipped_on === null && o.ship_by < today);
  const lateFinding = finding('service', 'orders.late', late.length, (n) => s(n, 'late order', 'late orders'), {
    sentence: late.length ? `I found ${late.length} ${s(late.length, 'order', 'orders')} at least one full day past the ship-by date and not shipped.` : 'No order is past its ship-by date.',
    rows: late.map(({ order, product, placed_on, ship_by }) => ({ order, product, placed_on, ship_by })),
    wouldDo: 'Customer Service drafts a delay notice for each buyer.',
    action: { label: 'Have Customer Service draft delay notices', sends: `Draft a delay notice for the buyers of the ${late.length} late orders.` },
  });
  if (shop.chats === null || !loaded.has('chats')) {
    return { state: 'Still reading', findings: [lateFinding], pending: 'Still reading: customer chats. This page updates by itself.' };
  }
  const waiting = shop.chats.filter((c) => !c.replied);
  const share = shop.chats.length ? (shop.chats.length - waiting.length) / shop.chats.length : null;
  const findings = [];
  if (share !== null) {
    findings.push({
      id: 'chats.replied', agent: 'service', count: Math.round(share * 100), label: 'percent of chats answered',
      sentence: `${Math.round(share * 100)}% of conversations in the last 24 hours got a reply from the shop.`,
      rows: shop.chats, good: share >= LIMITS.goodReplyShare, wouldDo: null, action: null, isShare: true,
    });
  }
  findings.push(finding('service', 'chats.waiting', waiting.length, (n) => s(n, 'customer waiting for a reply', 'customers waiting for a reply'), {
    rows: [...waiting].sort((a, b) => b.waiting_hours - a.waiting_hours),
    wouldDo: 'Customer Service drafts a reply to each one, longest wait first.',
    action: { label: `Have Customer Service draft replies to these ${waiting.length}`, sends: `Draft a reply to each of the ${waiting.length} customers who are waiting.` },
  }));
  findings.push(lateFinding);
  return { state: 'Checked', findings, pending: null };
}

function adsManager(shop) {
  if (shop.ads === null) return { state: 'Not counted yet', findings: [], pending: 'The ad account is not connected, so ad spend and return are unknown. They are not zero.' };
  const ret = shop.ads.sales / shop.ads.spend;
  const below = ret < shop.ads.target_return;
  return {
    state: 'Checked',
    findings: [{
      id: 'ads.return', agent: 'ads', count: +ret.toFixed(2), label: 'return on ad spend', isRatio: true,
      sentence: `Last complete week (${shop.ads.week}): ${money(shop.ads.spend)} spent, return ${ret.toFixed(2)} against a target of ${shop.ads.target_return.toFixed(2)}.`,
      rows: [{ week: shop.ads.week, spend: shop.ads.spend, sales: shop.ads.sales, return: +ret.toFixed(2), target_return: shop.ads.target_return }],
      good: !below,
      wouldDo: below ? 'Ads Manager lists the campaigns under target and proposes a budget change.' : null,
      action: below ? { label: 'Have Ads Manager propose a budget change', sends: 'List the campaigns under the target return and propose where to move the budget.' } : null,
    }],
    pending: null,
  };
}

function monitoring(shop) {
  const counted = shop.products.filter((p) => p.stock !== null);
  const unknown = shop.products.filter((p) => p.stock === null);
  const low = counted.filter((p) => p.stock <= LIMITS.lowStockUnits);
  const rated = shop.products.filter((p) => p.rating < LIMITS.lowRating);
  const findings = [];
  if (counted.length) {
    findings.push(finding('monitoring', 'stock.low', low.length, (n) => s(n, 'product low or out of stock', 'products low or out of stock'), {
      rows: low.map((p) => ({ product: p.name, stock: p.stock, state: p.stock === 0 ? 'Out of stock' : 'Low' })),
      wouldDo: 'Monitoring lists what to restock and how fast each one sells.',
      action: { label: 'Have Monitoring list products to restock', sends: 'List the products to restock, with units left and recent sales for each.' },
    }));
  }
  findings.push(finding('monitoring', 'ratings.low', rated.length, (n) => s(n, 'product rated under 4.0 stars', 'products rated under 4.0 stars'), {
    rows: rated.map((p) => ({ product: p.name, rating: p.rating })),
    wouldDo: 'Monitoring pulls the low reviews so you can see the pattern.',
    action: { label: 'Have Monitoring pull the low reviews', sends: 'Pull the low-star reviews for the products rated under 4.0 and group them by complaint.' },
  }));
  if (unknown.length === shop.products.length) return { state: 'Not counted yet', findings, pending: 'No product has a stock count yet.' };
  if (unknown.length) {
    return { state: 'Partly checked', findings, pending: `Not counted: ${unknown.length} ${s(unknown.length, 'product has', 'products have')} no stock count (${unknown.map((p) => p.name).join(', ')}).`, partial: ['stock.low'] };
  }
  return { state: 'Checked', findings, pending: null };
}

// `loaded` names the slow sources that have finished reading.
export function runShopCheck(shop, today, loaded = new Set(['chats'])) {
  const parts = {
    creators: creatorManager(shop),
    service: customerService(shop, today, loaded),
    ads: adsManager(shop),
    monitoring: monitoring(shop),
  };
  const agents = Object.entries(parts).map(([id, part]) => ({ id, ...AGENTS[id], ...part }));
  const all = agents.flatMap((a) => a.findings);
  const get = (id) => all.find((f) => f.id === id);

  const sales = shop.orders.reduce((sum, o) => sum + o.amount, 0);
  const tile = (id, label, f, partial) => {
    if (!f) return { id, label, state: 'missing', display: parts.service.state === 'Still reading' && id === 'chats' ? 'Still checking' : 'Not checked yet', note: null };
    if (f.count === 0) return { id, label, state: 'zero', display: '0', note: partial ? 'Partly checked' : 'Nothing to fix here' };
    return { id, label, state: partial ? 'partial' : 'counted', display: String(f.count), note: partial ? 'Partly checked' : `As of ${today}` };
  };
  const tiles = [
    { id: 'sales', label: 'Sales, last 30 days', state: shop.salesPartial ? 'partial' : 'counted', display: money(sales), note: 'From the daily sales report' + (shop.salesPartial ? '. Partial: the last 2 days are not in yet' : '') },
    { id: 'orders', label: 'Orders', state: 'counted', display: shop.orders.length.toLocaleString('en-US'), note: `As of ${today}` },
    tile('creators.nopost', 'Samples with no post', get('creators.nopost')),
    tile('stock.low', 'Products low or out of stock', get('stock.low'), parts.monitoring.partial?.includes('stock.low')),
    tile('orders.late', 'Late orders', get('orders.late')),
  ];

  // At most three problems, biggest count first. Shares and ratios are not counts, so they come last.
  const actionable = all.filter((f) => !f.good && f.action);
  const ranked = [...actionable].sort((a, b) => (a.isRatio || a.isShare ? 0 : a.count) < (b.isRatio || b.isShare ? 0 : b.count) ? 1 : -1);
  const problems = ranked.slice(0, 3);
  const extras = ranked.slice(3);

  return { shop: { id: shop.id, name: shop.name }, today, tiles, agents, problems, extras, findings: all, salesDisplay: money(sales) };
}
