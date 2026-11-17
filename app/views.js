// The four surfaces, each a function from API data to HTML: board, bounty, leaderboard, profile.
import { date, esc, isOpen, md, money, pot, timeLeft } from './format.js';

const fee = (b) => (b.entryFeeUsd ? money(b.entryFeeUsd) : 'Free');

export function board(data) {
  const items = [...(data.items ?? [])].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const totalPot = items.reduce((s, b) => s + Number(pot(b) || 0), 0);
  const cards = items.map((b) => `
    <li class="card">
      <div class="card-top"><span class="chip">${esc(b.category || 'Bounty')}</span>
      <span class="chip ${isOpen(b) ? 'open' : 'closed'}">${isOpen(b) ? 'Open' : 'Ended'}</span></div>
      <h2><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a></h2>
      <p class="sum">${esc(b.summary || '')}</p>
      <dl class="stats">
        <div><dt>Pot</dt><dd>${money(pot(b))}</dd></div>
        <div><dt>Entry fee</dt><dd>${fee(b)}</dd></div>
        <div><dt>Time left</dt><dd>${timeLeft(b.deadline)}</dd></div>
        <div><dt>Entries</dt><dd>${b.submissionCount ?? 0}</dd></div>
      </dl>
      <p class="links"><a href="#/bounty/${encodeURIComponent(b.slug)}">Bounty page</a> · <a href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">Leaderboard</a></p>
    </li>`).join('');
  return `<h1>Live bounties</h1>
  <p class="lede">${items.length} open bounties · ${money(totalPot)} in live pots · updated from the public API</p>
  <label class="search">Filter bounties <input id="q" type="search" placeholder="Type to filter by title or skill" autocomplete="off"></label>
  <ul class="grid" id="grid">${cards}</ul>
  <p id="none" hidden>No bounty matches that filter.</p>`;
}

export function bounty(b) {
  const rewards = (b.rewardsNow ?? []).map((r) =>
    `<tr><td>${r.place}</td><td>${money(r.amountUsd)}</td><td>${money(r.baseUsd)}</td><td>${money(r.feeShareUsd)}</td></tr>`).join('')
    || Object.entries(b.rewards ?? {}).map(([p, v]) => `<tr><td>${esc(p)}</td><td>${money(v)}</td><td>${money(v)}</td><td>—</td></tr>`).join('');
  const skills = (b.skills ?? []).map((s) => `<li class="chip">${esc(s)}</li>`).join('');
  return `<p><a href="#/">← All bounties</a></p>
  <h1>${esc(b.title)}</h1>
  <p class="lede">${esc(b.summary || '')}</p>
  <dl class="stats wide">
    <div><dt>Live pot</dt><dd>${money(pot(b))}</dd></div>
    <div><dt>Entry fee</dt><dd>${fee(b)}</dd></div>
    <div><dt>Deadline</dt><dd>${date(b.deadline)}</dd></div>
    <div><dt>Status</dt><dd>${isOpen(b) ? 'Open for entries' : 'Ended'} · ${timeLeft(b.deadline)}</dd></div>
    <div><dt>Entries</dt><dd>${b.submissionCount ?? 0}</dd></div>
    <div><dt>Category</dt><dd>${esc(b.category || '—')}</dd></div>
  </dl>
  ${skills ? `<h2>Skills</h2><ul class="chips">${skills}</ul>` : ''}
  <p class="links"><a class="btn" href="#/bounty/${encodeURIComponent(b.slug)}/leaderboard">View leaderboard</a></p>
  <h2>About this bounty</h2>
  <div class="prose">${md(b.description)}</div>
  <h2>Rewards — live pot split</h2>
  <div class="tablewrap"><table><caption>What each place wins now, including its share of entry fees</caption>
  <thead><tr><th scope="col">Place</th><th scope="col">Wins now</th><th scope="col">Base</th><th scope="col">Fee share</th></tr></thead>
  <tbody>${rewards}</tbody></table></div>
  ${b.rules ? `<h2>Rules</h2><div class="prose">${md(b.rules)}</div>` : ''}`;
}

export function leaderboard(data, slug) {
  const cols = (data.columns ?? []).filter((c) => !c.hidden);
  const head = cols.map((c) => `<th scope="col">${esc(c.title)}</th>`).join('');
  const rows = (data.entries ?? []).slice(0, 100).map((e) => {
    const cells = cols.map((c) => `<td>${esc(e.display?.[c.key] ?? e.values?.[c.key] ?? '—')}</td>`).join('');
    const who = e.handle ? `<a href="#/u/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a>` : '—';
    return `<tr><th scope="row">${e.rank ?? e.prize_rank ?? ''}</th><td>${who}</td><td class="title">${esc(e.title || '')}</td>${cells}</tr>`;
  }).join('');
  return `<p><a href="#/bounty/${encodeURIComponent(slug)}">← Bounty page</a></p>
  <h1>Leaderboard</h1>
  <p class="lede">${esc(data.competition?.title || slug)} · ${data.entries?.length ?? 0} entries shown (top 100) · placements ${esc(data.competition?.placements || '')}</p>
  <div class="tablewrap"><table><caption>Live leaderboard</caption>
  <thead><tr><th scope="col">#</th><th scope="col">Account</th><th scope="col">Entry</th>${head}</tr></thead>
  <tbody>${rows || '<tr><td colspan="9">No entries yet.</td></tr>'}</tbody></table></div>`;
}

export function profile(p) {
  const r = p.record ?? {};
  const img = p.avatar?.url_small || p.avatar?.url || p.image;
  const src = img ? (img.startsWith('http') ? img : `https://make.fun${img}`) : '';
  const rows = (p.solutions ?? []).map((s) => `<tr>
    <td><a href="#/bounty/${encodeURIComponent(s.competition.slug)}">${esc(s.competition.title)}</a></td>
    <td>${esc(s.title || '')}</td><td>${s.placement ? `#${s.placement}` : '—'}</td>
    <td>${s.prize_usd ? money(s.prize_usd) : '—'}</td><td>${date(s.entered_at)}</td></tr>`).join('');
  return `<p><a href="#/">← All bounties</a></p>
  <div class="profile-head">${src ? `<img crossorigin="anonymous" src="${esc(src)}" alt="" width="72" height="72">` : ''}
  <div><h1>${esc(p.display_name || p.handle)}</h1><p class="lede">@${esc(p.handle)}${p.joined_at ? ` · joined ${date(p.joined_at)}` : ''}</p>
  ${p.bio ? `<p>${esc(p.bio)}</p>` : ''}</div></div>
  <dl class="stats wide">
    <div><dt>Entered</dt><dd>${r.competitions_entered ?? 0}</dd></div>
    <div><dt>Placed</dt><dd>${r.competitions_placed ?? 0}</dd></div>
    <div><dt>Won</dt><dd>${r.competitions_won ?? 0}</dd></div>
    <div><dt>Best place</dt><dd>${r.best_placement ? `#${r.best_placement}` : '—'}</dd></div>
    <div><dt>Prizes</dt><dd>${money(r.prize_usd ?? 0)}</dd></div>
  </dl>
  <h2>Entries</h2>
  <div class="tablewrap"><table><caption>Public entries by this account</caption>
  <thead><tr><th scope="col">Bounty</th><th scope="col">Entry</th><th scope="col">Place</th><th scope="col">Prize</th><th scope="col">Entered</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="5">No public entries yet.</td></tr>'}</tbody></table></div>`;
}

export const errorView = (msg) => `<h1>Something went wrong</h1><p role="alert">${esc(msg)}</p><p><a href="#/">Back to the bounty board</a></p>`;
