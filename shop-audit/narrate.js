// The one-line summary at the top of the report.
// The writer (fixed rules, or Claude with the visitor's own key) may not type numbers.
// It writes placeholders such as {creators.waiting}; code fills them in from the report.
// If the text has a number of its own, or a placeholder that does not exist, it is thrown away.

export function facts(report) {
  const map = new Map([['sales', report.salesDisplay], ['orders', report.tiles.find((t) => t.id === 'orders').display]]);
  report.findings.forEach((f) => map.set(f.id, f.isShare ? `${f.count}%` : f.isRatio ? f.count.toFixed(2) : String(f.count)));
  return map;
}

const phrase = (f) => (f.isRatio ? `ad return of {${f.id}}, which is under the target` : `{${f.id}} ${f.label}`);

export function ruleTemplate(report) {
  const [first, second] = report.problems;
  const parts = [];
  if (first) parts.push(`Start with the ${phrase(first)}.`);
  if (second) parts.push(`Then look at the ${phrase(second)}.`);
  if (!first) parts.push('Nothing needs fixing today.');
  const unread = report.agents.filter((a) => a.state !== 'Checked').map((a) => a.name);
  if (unread.length) parts.push(`${unread.length < 3 ? unread.join(' and ') : `${unread.slice(0, -1).join(', ')} and ${unread.at(-1)}`} could not finish reading, so part of this report is still open.`);
  return parts.join(' ');
}

// Numbers that are part of fixed wording ("21 days", "4.0 stars") may appear as written.
function wordingNumbers(report) {
  return new Set(report.findings.flatMap((f) => f.label.match(/\d+(?:\.\d+)?/g) || []));
}

export function fill(template, report) {
  const known = facts(report);
  const unknown = [...template.matchAll(/\{([a-z.]+)\}/g)].map((m) => m[1]).filter((id) => !known.has(id));
  const allowed = wordingNumbers(report);
  const typed = (template.replace(/\{[a-z.]+\}/g, ' ').match(/\d+(?:\.\d+)?/g) || []).filter((n) => !allowed.has(n));
  if (unknown.length || typed.length) {
    return { ok: false, text: null, why: unknown.length ? `it used a number that does not exist (${unknown.join(', ')})` : `it typed its own number (${typed.join(', ')})` };
  }
  return { ok: true, text: template.replace(/\{([a-z.]+)\}/g, (_, id) => known.get(id)), why: null };
}

export function buildPrompt(report) {
  const rows = report.findings.map((f) => ({ placeholder: `{${f.id}}`, means: f.label, found_by: f.agent, needs_fixing: !f.good }));
  const open = report.agents.filter((a) => a.state !== 'Checked').map((a) => `${a.name}: ${a.state}. ${a.pending}`);
  return {
    system: [
      'You write the two-sentence summary at the top of a shop report for the owner of a small online shop.',
      'You are not given any numbers and you must not write any digits. Where a number belongs, write its placeholder exactly, for example {creators.waiting}.',
      'Use only placeholders from the list. Say what to fix first, then what to look at next.',
      'If part of the shop could not be read, say that it is not counted yet. Never describe missing data as zero or as fine.',
      'Plain words, no headings, no lists, at most 50 words.',
    ].join(' '),
    user: `Shop: ${report.shop.name}\n\nPlaceholders:\n${JSON.stringify(rows, null, 2)}\n\nNot fully read:\n${open.length ? open.join('\n') : 'Nothing. Everything was read.'}`,
  };
}

export async function claudeTemplate(report, apiKey, fetchImpl = fetch) {
  const { system, user } = buildPrompt(report);
  const res = await fetchImpl('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-sonnet-5-5', max_tokens: 300, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(res.status === 401 ? 'That key was not accepted. Check it and try again.' : `Claude did not answer: ${detail?.error?.message || `status ${res.status}`}`);
  }
  const data = await res.json();
  return data.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
}
