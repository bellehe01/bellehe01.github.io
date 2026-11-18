// Made-up shops for the demo. No real shop, brand, creator, customer or order appears here.
// A seeded generator builds the order rows, so every visitor sees the same numbers.

export const TODAY = '2026-11-16';
const DAY = 86400000;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

function makeOrders(cfg) {
  const rand = rng(cfg.seed);
  const end = Date.parse(TODAY);
  const orders = [];
  let n = 1;
  for (let back = 29; back >= 0; back--) {
    const placed = end - back * DAY;
    const count = Math.round(cfg.ordersPerDay * (0.7 + rand() * 0.6));
    for (let i = 0; i < count; i++) {
      const item = cfg.products[Math.floor(rand() * rand() * cfg.products.length)];
      const units = rand() < 0.8 ? 1 : 2;
      const slow = rand() < cfg.slowShare;
      const delay = slow ? 4 + Math.floor(rand() * 3) : Math.floor(rand() * 2);
      const shippedMs = placed + delay * DAY;
      orders.push({
        order: `${cfg.prefix}-${String(n++).padStart(4, '0')}`,
        product: item.name,
        units,
        amount: +(item.price * units).toFixed(2),
        placed_on: iso(placed),
        ship_by: iso(placed + 2 * DAY),
        shipped_on: shippedMs <= end ? iso(shippedMs) : null,
      });
    }
  }
  return orders;
}

function shop(cfg) {
  return { ...cfg, orders: makeOrders(cfg) };
}

// A source set to null has not been read. That is different from an empty list.
// `arrivesLater` names sources that finish reading a few seconds after the report opens.
export const SHOPS = [
  shop({
    id: 'juniper', seed: 11, prefix: 'JS', name: 'Juniper & Salt', sells: 'Skincare',
    ordersPerDay: 9, slowShare: 0.05, salesPartial: false, arrivesLater: [],
    products: [
      { name: 'Oat cleanser 150 ml', price: 24, stock: 4, rating: 4.7 },
      { name: 'Vitamin C serum 30 ml', price: 39, stock: 410, rating: 4.6 },
      { name: 'Daily SPF 50', price: 28, stock: 0, rating: 4.4 },
      { name: 'Clay mask 75 ml', price: 22, stock: 3, rating: 3.8 },
      { name: 'Lip balm trio', price: 15, stock: 520, rating: 4.8 },
    ],
    creators: [
      { creator: '@glowwithnia', waiting_days: 3, last_message: 'Can I get the SPF too for a routine video?', sample_days_ago: 34, posts_since_sample: 3, sales_90d: 6120, days_since_post: 6 },
      { creator: '@skinbyomar', waiting_days: 2, last_message: 'What is the commission on the serum?', sample_days_ago: 29, posts_since_sample: 1, sales_90d: 940, days_since_post: 41 },
      { creator: '@thelaylaedit', waiting_days: 5, last_message: 'Sample arrived damaged, can you resend?', sample_days_ago: 27, posts_since_sample: 0, sales_90d: 0, days_since_post: null },
      { creator: '@dewdropdani', waiting_days: null, last_message: 'Thanks, got it!', sample_days_ago: 25, posts_since_sample: 0, sales_90d: 0, days_since_post: null },
      { creator: '@pores.and.co', waiting_days: 1, last_message: 'Is there a brief for the video?', sample_days_ago: 12, posts_since_sample: 0, sales_90d: 0, days_since_post: null },
      { creator: '@minasroutine', waiting_days: null, last_message: 'Posting Friday.', sample_days_ago: 40, posts_since_sample: 2, sales_90d: 3310, days_since_post: 38 },
      { creator: '@barefacebea', waiting_days: 4, last_message: 'Do you ship samples to Canada?', sample_days_ago: null, posts_since_sample: 0, sales_90d: 0, days_since_post: null },
    ],
    chats: [
      { customer: 'Customer 1', topic: 'Where is my order?', replied: true, waiting_hours: 0 },
      { customer: 'Customer 2', topic: 'Is the mask safe for sensitive skin?', replied: true, waiting_hours: 0 },
      { customer: 'Customer 3', topic: 'Refund for a leaking bottle', replied: false, waiting_hours: 19 },
      { customer: 'Customer 4', topic: 'Change my address', replied: false, waiting_hours: 7 },
      { customer: 'Customer 5', topic: 'When is the SPF back?', replied: true, waiting_hours: 0 },
      { customer: 'Customer 6', topic: 'Wrong item in the box', replied: false, waiting_hours: 11 },
      { customer: 'Customer 7', topic: 'Discount code not working', replied: true, waiting_hours: 0 },
      { customer: 'Customer 8', topic: 'Is this vegan?', replied: true, waiting_hours: 0 },
    ],
    ads: { week: '2 to 8 Nov', spend: 1120, sales: 2016, target_return: 2.5 },
  }),
  shop({
    id: 'pocket', seed: 23, prefix: 'PT', name: 'Pocket Trail', sells: 'Outdoor gear',
    ordersPerDay: 6, slowShare: 0, salesPartial: false, arrivesLater: [],
    products: [
      { name: 'Steel flask 500 ml', price: 32, stock: 190, rating: 4.7 },
      { name: 'Clip headlamp', price: 27, stock: 85, rating: 4.5 },
      { name: 'Merino socks, 2 pairs', price: 21, stock: 300, rating: 4.6 },
      { name: 'Ultralight tarp', price: 64, stock: 45, rating: 4.3 },
    ],
    creators: [
      { creator: '@trailmixtom', waiting_days: null, last_message: 'Video is up!', sample_days_ago: 30, posts_since_sample: 2, sales_90d: 2480, days_since_post: 4 },
      { creator: '@campwithjo', waiting_days: null, last_message: 'Thanks for the flask.', sample_days_ago: 26, posts_since_sample: 2, sales_90d: 2105, days_since_post: 9 },
      { creator: '@peakpixels', waiting_days: 1, last_message: 'Can I get a second headlamp for a comparison?', sample_days_ago: 18, posts_since_sample: 1, sales_90d: 1760, days_since_post: 11 },
      { creator: '@slowhikesam', waiting_days: null, last_message: 'Received, filming this weekend.', sample_days_ago: 9, posts_since_sample: 0, sales_90d: 0, days_since_post: null },
    ],
    chats: [
      { customer: 'Customer 1', topic: 'Is the tarp waterproof?', replied: true, waiting_hours: 0 },
      { customer: 'Customer 2', topic: 'Flask lid size', replied: true, waiting_hours: 0 },
      { customer: 'Customer 3', topic: 'Delivery date', replied: true, waiting_hours: 0 },
      { customer: 'Customer 4', topic: 'Bulk order for a club', replied: true, waiting_hours: 0 },
    ],
    ads: { week: '2 to 8 Nov', spend: 640, sales: 2432, target_return: 2.5 },
  }),
  shop({
    id: 'mossback', seed: 37, prefix: 'MT', name: 'Mossback Tea', sells: 'Loose-leaf tea',
    ordersPerDay: 4, slowShare: 0.04, salesPartial: true, arrivesLater: ['chats'],
    products: [
      { name: 'Roasted oolong 100 g', price: 18, stock: 5, rating: 4.9 },
      { name: 'Jasmine pearls 80 g', price: 23, stock: null, rating: 4.6 },
      { name: 'Masala chai 120 g', price: 16, stock: 140, rating: 3.9 },
      { name: 'Sampler tin, 6 teas', price: 34, stock: null, rating: 4.5 },
    ],
    creators: [
      { creator: '@steepedinsteph', waiting_days: null, last_message: 'New video next week.', sample_days_ago: 31, posts_since_sample: 4, sales_90d: 3890, days_since_post: 35 },
      { creator: '@cuppawithkai', waiting_days: 6, last_message: 'Still happy to post, what should I focus on?', sample_days_ago: 28, posts_since_sample: 0, sales_90d: 0, days_since_post: null },
      { creator: '@leafandlore', waiting_days: 2, last_message: 'Could you send the chai as well?', sample_days_ago: 15, posts_since_sample: 1, sales_90d: 260, days_since_post: 8 },
    ],
    chats: [
      { customer: 'Customer 1', topic: 'How long does oolong keep?', replied: false, waiting_hours: 5 },
      { customer: 'Customer 2', topic: 'Gift wrapping', replied: true, waiting_hours: 0 },
      { customer: 'Customer 3', topic: 'Parcel says delivered, not here', replied: false, waiting_hours: 21 },
    ],
    // The ad account is not connected, so there is nothing to read.
    ads: null,
  }),
];
