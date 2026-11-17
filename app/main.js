// Hash router for the four surfaces. Leaderboard and profile code loads lazily with import(),
// so the first load stays small. window.__shotReady marks when a route's data has rendered.
const app = document.getElementById('app');

async function render() {
  window.__shotReady = false;
  app.innerHTML = '<p class="loading" role="status">Loading live data…</p>';
  const hash = location.hash || '#/';
  try {
    const bounty = hash.match(/^#\/bounty\/([^/]+)$/);
    const board = hash.match(/^#\/bounty\/([^/]+)\/leaderboard$/);
    const user = hash.match(/^#\/u\/([^/]+)$/);
    if (board) {
      const [{ getLeaderboard }, { leaderboard }] = await Promise.all([import('./api.js'), import('./views.js')]);
      const data = await getLeaderboard(decodeURIComponent(board[1]));
      document.title = `Leaderboard · ${data.competition?.title || board[1]} | make.fun`;
      app.innerHTML = leaderboard(data, decodeURIComponent(board[1]));
    } else if (bounty) {
      const [{ getBounty }, { bounty: view }] = await Promise.all([import('./api.js'), import('./views.js')]);
      const b = await getBounty(decodeURIComponent(bounty[1]));
      document.title = `${b.title} | make.fun`;
      app.innerHTML = view(b);
    } else if (user) {
      const [{ getProfile }, { profile }] = await Promise.all([import('./api.js'), import('./views.js')]);
      const p = await getProfile(decodeURIComponent(user[1]));
      document.title = `@${p.handle} | make.fun`;
      app.innerHTML = profile(p);
    } else {
      const [{ getBounties }, { board: view }] = await Promise.all([import('./api.js'), import('./views.js')]);
      document.title = 'make.fun — live bounties';
      app.innerHTML = view(await getBounties());
      wireFilter();
    }
  } catch (err) {
    const { errorView } = await import('./views.js');
    document.title = 'Error | make.fun';
    app.innerHTML = errorView(`Could not load this page. ${err.message}`);
  }
  app.focus({ preventScroll: true });
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function wireFilter() {
  const input = document.getElementById('q');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    let shown = 0;
    for (const card of document.querySelectorAll('#grid > li')) {
      const hit = card.textContent.toLowerCase().includes(q);
      card.hidden = !hit;
      if (hit) shown++;
    }
    document.getElementById('none').hidden = shown > 0;
  });
}

window.addEventListener('hashchange', render);
render();
