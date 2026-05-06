let categories = [];
let currentCategoryId = null;
let currentPage = 1;

async function loadCategories() {
  try {
    categories = await apiFetch('/forums/categories');
    const statsData = await apiFetch('/auth/stats');

    document.getElementById('forum-stats').innerHTML = `
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text-secondary)">שרשורים:</span><strong>${statsData.threads}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text-secondary)">תגובות:</span><strong>${statsData.posts}</strong>
      </div>
      <div style="display:flex;justify-content:space-between;padding:0.4rem 0">
        <span style="color:var(--text-secondary)">חברים:</span><strong>${statsData.users}</strong>
      </div>
    `;

    const catEl = document.getElementById('categories-list');
    if (!categories.length) {
      catEl.innerHTML = '<div class="empty-state"><div class="icon">💬</div><p>אין קטגוריות עדיין</p></div>';
      return;
    }
    catEl.innerHTML = categories.map(c => `
      <div class="forum-category-card" onclick="showThreads(${c.id}, '${c.name}')">
        <div class="category-icon">${c.icon}</div>
        <div class="category-info">
          <div class="category-name">${c.name}</div>
          <div class="category-desc">${c.description}</div>
        </div>
        <div class="category-stats">
          <strong>${c.thread_count}</strong>
          שרשורים
        </div>
      </div>
    `).join('');

    loadRecentThreadsSidebar();
    setupNewThreadCatSelect();

    const urlCat = new URLSearchParams(location.search).get('cat');
    if (urlCat) {
      const cat = categories.find(c => c.id == urlCat);
      if (cat) showThreads(cat.id, cat.name);
    }
  } catch(e) {
    document.getElementById('categories-list').innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${e.message}</p></div>`;
  }
}

async function loadRecentThreadsSidebar() {
  try {
    const data = await apiFetch('/forums/threads?limit=5');
    const el = document.getElementById('recent-threads-sidebar');
    el.innerHTML = (data.threads || []).map(t => `
      <div style="padding:0.5rem 0;border-bottom:1px solid var(--border)">
        <a href="/thread?id=${t.id}" style="color:var(--text-primary);text-decoration:none;font-size:0.88rem;font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.title}</a>
        <div style="font-size:0.78rem;color:var(--text-secondary)">${t.username} · ${timeAgo(t.created_at)}</div>
      </div>
    `).join('') || '<p class="text-muted">אין שרשורים</p>';
  } catch {}
}

async function showThreads(categoryId, categoryName) {
  currentCategoryId = categoryId;
  currentPage = 1;
  document.getElementById('categories-view').classList.add('hidden');
  document.getElementById('threads-view').classList.remove('hidden');
  document.getElementById('current-category-name').textContent = categoryName;
  if (!Auth.isLoggedIn()) document.getElementById('new-thread-btn').classList.add('hidden');
  history.pushState({}, '', `?cat=${categoryId}`);
  await loadThreads();
}

function showCategories() {
  currentCategoryId = null;
  document.getElementById('threads-view').classList.add('hidden');
  document.getElementById('categories-view').classList.remove('hidden');
  history.pushState({}, '', '/forums');
}

async function loadThreads() {
  const listEl = document.getElementById('threads-list');
  listEl.innerHTML = '<div class="spinner"></div>';
  try {
    const data = await apiFetch(`/forums/threads?category_id=${currentCategoryId}&page=${currentPage}&limit=20`);
    document.getElementById('threads-count').textContent = `${data.total} שרשורים`;

    if (!data.threads.length) {
      listEl.innerHTML = '<div class="empty-state"><div class="icon">💬</div><p>אין שרשורים עדיין. היה הראשון!</p></div>';
      return;
    }

    listEl.innerHTML = data.threads.map(t => `
      <div class="thread-item ${t.is_pinned ? 'pinned' : ''}" onclick="location.href='/thread?id=${t.id}'" style="cursor:pointer">
        <div class="thread-icon">${t.is_locked ? '🔒' : t.is_pinned ? '📌' : '💬'}</div>
        <div class="thread-info">
          <div class="thread-title">
            ${t.is_pinned ? '<span class="badge-pinned">נעוץ</span> ' : ''}
            ${t.is_locked ? '<span class="badge-locked">נעול</span> ' : ''}
            ${t.title}
          </div>
          <div class="thread-meta">
            <span>${t.username}</span>
            <span>·</span>
            <span>${timeAgo(t.created_at)}</span>
            ${t.last_poster ? `<span>· תגובה אחרונה: ${t.last_poster}</span>` : ''}
          </div>
        </div>
        <div class="thread-stats">
          <div class="thread-stat"><strong>${t.views}</strong>צפיות</div>
          <div class="thread-stat"><strong>${t.post_count}</strong>תגובות</div>
        </div>
      </div>
    `).join('');

    renderPagination(data.pages, data.page);
  } catch(e) {
    listEl.innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${e.message}</p></div>`;
  }
}

function renderPagination(pages, current) {
  const el = document.getElementById('threads-pagination');
  if (pages <= 1) { el.innerHTML = ''; return; }
  el.innerHTML = Array.from({length: pages}, (_,i) => `
    <div class="page-btn ${i+1===current?'active':''}" onclick="goPage(${i+1})">${i+1}</div>
  `).join('');
}

function goPage(p) {
  currentPage = p;
  loadThreads();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function setupNewThreadCatSelect() {
  const sel = document.getElementById('new-thread-cat');
  sel.innerHTML = '<option value="">בחר קטגוריה...</option>' +
    categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  if (currentCategoryId) sel.value = currentCategoryId;
}

function openNewThread() {
  if (!Auth.isLoggedIn()) { window.location.href = '/login'; return; }
  setupNewThreadCatSelect();
  if (currentCategoryId) document.getElementById('new-thread-cat').value = currentCategoryId;
  openModal('new-thread-modal');
}

async function submitThread() {
  const category_id = document.getElementById('new-thread-cat').value;
  const title = document.getElementById('new-thread-title').value.trim();
  const content = document.getElementById('new-thread-content').value.trim();
  const errEl = document.getElementById('thread-error');
  errEl.classList.add('hidden');

  if (!category_id) { errEl.textContent = '⚠️ בחר קטגוריה'; errEl.classList.remove('hidden'); return; }
  if (!title || title.length < 5) { errEl.textContent = '⚠️ כותרת קצרה מדי'; errEl.classList.remove('hidden'); return; }
  if (!content || content.length < 10) { errEl.textContent = '⚠️ תוכן קצר מדי'; errEl.classList.remove('hidden'); return; }

  try {
    const data = await apiFetch('/forums/threads', { method: 'POST', body: { category_id: parseInt(category_id), title, content } });
    closeModal('new-thread-modal');
    showToast('שרשור פורסם!', 'success');
    document.getElementById('new-thread-title').value = '';
    document.getElementById('new-thread-content').value = '';
    window.location.href = `/thread?id=${data.id}`;
  } catch(e) {
    errEl.textContent = '⚠️ ' + e.message;
    errEl.classList.remove('hidden');
  }
}

loadCategories();
