// Tools I use at work. `icon` is a Simple Icons slug; without one, the tile shows letters.
const STACK = [
  ['Claude Code', 'AI coding agent', 'claude'],
  ['Cursor', 'AI coding', 'cursor', 'Cu'],
  ['Python', 'Analysis and scripts', 'python'],
  ['SQL', 'Data', null, 'SQL'],
  ['TikTok Shop API', 'Integrations', 'tiktok'],
  ['Lark Open API', 'Bots and cards', null, 'Lk'],
  ['GitHub', 'Review and delivery', 'github'],
  ['Tableau', 'Dashboards', null, 'Tb'],
  ['Power BI', 'Dashboards', null, 'BI'],
  ['BigQuery', 'Warehouse', 'googlebigquery'],
  ['Snowflake', 'Warehouse', 'snowflake'],
  ['Google Analytics', 'Product analytics', 'googleanalytics'],
  ['Figma', 'Design', 'figma'],
  ['Jira', 'Planning', 'jira'],
  ['React + Laravel', 'Built with AI help', 'react'],
];

document.getElementById('stack').replaceChildren(...STACK.map(([name, use, icon, letters]) => {
  const tile = document.createElement('div');
  tile.className = 'tool';
  const logo = document.createElement('div');
  logo.className = 'logo';
  const fallback = letters || name.slice(0, 2);
  if (icon) {
    const img = new Image();
    img.alt = '';
    img.src = `https://cdn.simpleicons.org/${icon}`;
    img.onerror = () => { logo.textContent = fallback; };
    logo.append(img);
  } else {
    logo.textContent = fallback;
  }
  const b = document.createElement('b');
  b.textContent = name;
  const s = document.createElement('span');
  s.textContent = use;
  tile.append(logo, b, s);
  return tile;
}));
