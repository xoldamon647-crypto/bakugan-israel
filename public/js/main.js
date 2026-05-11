// ─── Auth helpers ───
const API = '/api';

const Auth = {
  getToken: () => localStorage.getItem('bakugan_token'),
  getUser:  () => { try { return JSON.parse(localStorage.getItem('bakugan_user')); } catch { return null; } },
  setAuth:  (token, user) => { localStorage.setItem('bakugan_token', token); localStorage.setItem('bakugan_user', JSON.stringify(user)); },
  clear:    () => { localStorage.removeItem('bakugan_token'); localStorage.removeItem('bakugan_user'); },
  isLoggedIn: () => !!localStorage.getItem('bakugan_token'),
  isAdmin:  () => { const u = Auth.getUser(); return u?.role === 'admin'; },
};

// ─── Fetch helpers ───
async function apiFetch(path, opts = {}) {
  const token = Auth.getToken();
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'שגיאת שרת');
  return data;
}

// ─── Toast notifications ───
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ─── Navbar render ───
function renderNavbar() {
  const user = Auth.getUser();
  const loggedIn = Auth.isLoggedIn();
  const path = window.location.pathname;

  const links = [
    { href: '/', label: 'ראשי', icon: '🌀' },
    { href: '/forums', label: 'פורום', icon: '💬' },
    { href: '/events', label: 'אירועים', icon: '🏆' },
    { href: '/wiki', label: 'ויקי', icon: '📖' },
    { href: '/episodes', label: 'פרקים', icon: '🎬' },
    { href: '/rules', label: 'חוקים', icon: '📜' },
    { href: '/store', label: 'חנות', icon: '🛒' },
    ...(loggedIn ? [{ href: '/messages', label: 'הודעות', icon: '💌', badgeId: 'messages-badge' }] : []),
  ];

  const navEl = document.getElementById('navbar');
  if (!navEl) return;

  navEl.innerHTML = `
    <a href="/" class="nav-brand">
      <div class="nav-logo">🌀</div>
      <div class="nav-title">בקוגן <span>ישראל</span></div>
    </a>
    <div class="nav-search">
      <input type="text" id="nav-search" placeholder="חיפוש בקהילה..." onkeypress="handleSearchKeypress(event)">
      <button onclick="performSearch()" class="search-btn">🔍</button>
    </div>
    <ul class="nav-links">
      ${links.map(l => `<li><a href="${l.href}" class="${path === l.href ? 'active' : ''}">${l.icon} ${l.label}${l.badgeId ? `<span id="${l.badgeId}" class="nav-badge hidden">0</span>` : ''}</a></li>`).join('')}
    </ul>
    <div class="nav-auth">
      ${loggedIn
        ? `<div class="nav-user" onclick="window.location='/profile'">
             <div class="avatar-sm">${user?.avatar ? `<img src="${user.avatar}" alt="">` : (user?.username?.[0] || 'U')}</div>
             <span>${user?.username || 'פרופיל'}</span>
           </div>
           ${Auth.isAdmin() ? `<a href="/admin" class="btn btn-sm btn-outline">מנהל</a>` : ''}
           <button class="btn btn-sm btn-secondary" onclick="logout()">יציאה</button>`
        : `<a href="/login" class="btn btn-sm btn-secondary">כניסה</a>
           <a href="/register" class="btn btn-sm btn-primary">הרשמה</a>`
      }
      <div class="hamburger" id="hamburger" onclick="toggleMobileMenu()">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;

  // Mobile menu must live on body, not inside navbar —
  // navbar's backdrop-filter traps position:fixed children on iOS Safari
  let mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu) {
    mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.className = 'mobile-menu';
    document.body.appendChild(mobileMenu);
  }
  mobileMenu.innerHTML =
    links.map(l => `<a href="${l.href}">${l.icon} ${l.label}</a>`).join('') +
    `<div class="divider"></div>` +
    (loggedIn
      ? `<a href="/profile">👤 הפרופיל שלי</a>
         ${Auth.isAdmin() ? `<a href="/admin">⚙️ לוח מנהל</a>` : ''}
         <a href="#" onclick="logout()">🚪 יציאה</a>`
      : `<a href="/login">🔑 כניסה</a><a href="/register">✨ הרשמה</a>`);

  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 30);
  });

  // Update notification badges
  if (loggedIn) updateNotificationBadges();
}

async function updateNotificationBadges() {
  try {
    const data = await apiFetch('/messages/unread/count');
    const badge = document.getElementById('messages-badge');
    if (badge) {
      badge.textContent = data.count;
      badge.classList.toggle('hidden', data.count === 0);
    }
  } catch(e) {
    // Silently fail for badges
  }
}

function toggleMobileMenu() {
  const m = document.getElementById('mobile-menu');
  if (!m) return;
  m.classList.toggle('open');
  // Close when tapping outside
  if (m.classList.contains('open')) {
    const close = (e) => {
      if (!m.contains(e.target) && !document.getElementById('hamburger')?.contains(e.target)) {
        m.classList.remove('open');
        document.removeEventListener('touchstart', close);
        document.removeEventListener('click', close);
      }
    };
    setTimeout(() => {
      document.addEventListener('touchstart', close, { passive: true });
      document.addEventListener('click', close);
    }, 50);
  }
}

// ─── Bottom nav (mobile app-style) ───
function renderBottomNav() {
  const path = window.location.pathname;
  const loggedIn = Auth.isLoggedIn();

  let nav = document.getElementById('bottom-nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';
    document.body.appendChild(nav);
  }

  const items = [
    { href: '/',        icon: '🌀', label: 'בית' },
    { href: '/forums',  icon: '💬', label: 'פורום' },
    { href: '/store',   icon: '🛒', label: 'חנות' },
    { href: '/events',  icon: '🏆', label: 'אירועים' },
    { href: '/wiki',    icon: '📖', label: 'ויקי' },
    { href: loggedIn ? '/profile' : '/login', icon: loggedIn ? '👤' : '🔑', label: loggedIn ? 'פרופיל' : 'כניסה' },
  ];

  nav.innerHTML = items.map(({ href, icon, label }) => {
    const active = path === href || (href !== '/' && path.startsWith(href));
    return `<a href="${href}" class="${active ? 'active' : ''}">
      <span class="bn-icon">${icon}</span>
      <span>${label}</span>
    </a>`;
  }).join('');
}

function logout() {
  Auth.clear();
  showToast('התנתקת בהצלחה', 'info');
  setTimeout(() => window.location.href = '/', 800);
}

function handleSearchKeypress(e) {
  if (e.key === 'Enter') performSearch();
}

async function performSearch() {
  const query = document.getElementById('nav-search')?.value?.trim();
  if (!query || query.length < 2) {
    showToast('הזן לפחות 2 תווים לחיפוש', 'warning');
    return;
  }

  try {
    const results = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
    showSearchResults(query, results.results);
  } catch(e) {
    showToast('שגיאת חיפוש: ' + e.message, 'error');
  }
}

function showSearchResults(query, results) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content search-modal">
      <div class="modal-header">
        <h3>תוצאות חיפוש: "${query}"</h3>
        <button onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>
      <div class="modal-body">
        ${results.length === 0
          ? '<div class="empty-state"><div class="icon">🔍</div><p>לא נמצאו תוצאות</p></div>'
          : results.map(r => `
              <div class="search-result" onclick="window.location='${r.url}'">
                <div class="search-result-type">${getTypeLabel(r.type)}</div>
                <div class="search-result-title">${highlightText(r.title || r.thread_title, query)}</div>
                <div class="search-result-meta">
                  ${r.username ? `👤 ${r.username}` : ''}
                  ${r.category_name ? ` • 📁 ${r.category_name}` : ''}
                  ${r.created_at ? ` • 📅 ${formatDate(r.created_at)}` : ''}
                </div>
                ${r.content ? `<div class="search-result-content">${highlightText(r.content.substring(0, 150), query)}...</div>` : ''}
              </div>
            `).join('')
        }
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.classList.add('open');
}

function getTypeLabel(type) {
  const labels = { thread: '💬 שרשור', post: '💬 תגובה', wiki: '📖 ויקי', event: '🏆 אירוע' };
  return labels[type] || type;
}

function highlightText(text, query) {
  if (!text) return '';
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// ─── Date formatting ───
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str.replace(' ', 'T'));
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDateTime(str) {
  if (!str) return '';
  const d = new Date(str.replace(' ', 'T'));
  return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function formatEventDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(str) {
  if (!str) return '';
  const diff = (Date.now() - new Date(str.replace(' ', 'T')).getTime()) / 1000;
  if (diff < 60) return 'לפני רגע';
  if (diff < 3600) return `לפני ${Math.floor(diff/60)} דקות`;
  if (diff < 86400) return `לפני ${Math.floor(diff/3600)} שעות`;
  return `לפני ${Math.floor(diff/86400)} ימים`;
}

// ─── Modal helpers ───
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
});

// ─── Particles for hero ───
function initParticles(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const colors = ['#FF4500', '#FF6600', '#0099FF', '#8B00FF', '#FFD700', '#00CC44'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 12 + 4;
    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      opacity: ${Math.random() * 0.5 + 0.1};
      animation-duration: ${Math.random() * 15 + 8}s;
      animation-delay: ${Math.random() * 10}s;
      filter: blur(${Math.random() > 0.7 ? 1 : 0}px);
    `;
    container.appendChild(p);
  }
}

// ─── Rich text display ───
function sanitizeHTML(html) {
  const allowed = ['p','br','b','strong','i','em','ul','ol','li','h2','h3','h4','a','span','div','code','pre'];
  const div = document.createElement('div');
  div.innerHTML = html;
  div.querySelectorAll('*').forEach(el => {
    if (!allowed.includes(el.tagName.toLowerCase())) {
      el.replaceWith(...el.childNodes);
    }
  });
  return div.innerHTML;
}

// ─── Proxy all bakugan.wiki images through /bkimg to bypass hotlink protection ───
function proxyBkImgs(root) {
  (root || document).querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') || '';
    if (src.includes('bakugan.wiki/images/')) {
      const p = src.split('/images/')[1];
      if (p) img.setAttribute('src', `/bkimg?p=${p}`);
    }
    // Fix onerror fallbacks too
    const oe = img.getAttribute('onerror') || '';
    if (oe.includes('bakugan.wiki/images/')) {
      img.setAttribute('onerror', oe.replace(/https:\/\/bakugan\.wiki\/images\/([^'"]+)/g, (_, p2) => `/bkimg?p=${p2}`));
    }
  });
}

// ─── On DOM load ───
document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  renderBottomNav();
  proxyBkImgs();
  // Watch for dynamically inserted content (wiki pages, etc.)
  new MutationObserver(muts => {
    muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) proxyBkImgs(n); }));
  }).observe(document.body, { childList: true, subtree: true });
});
