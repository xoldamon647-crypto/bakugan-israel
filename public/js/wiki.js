let allPages = [];
let currentPage = null;

const seasonColors = {
  1: { gradient: 'linear-gradient(135deg,rgba(255,69,0,0.2),rgba(255,69,0,0.05))', num: '#FF4500', icon: '🔥' },
  2: { gradient: 'linear-gradient(135deg,rgba(0,153,255,0.2),rgba(0,153,255,0.05))', num: '#0099FF', icon: '💧' },
  3: { gradient: 'linear-gradient(135deg,rgba(139,0,255,0.2),rgba(139,0,255,0.05))', num: '#8B00FF', icon: '⚡' },
  4: { gradient: 'linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,215,0,0.05))', num: '#FFD700', icon: '⚙️' },
};

// Muted ambient YouTube clip IDs per season (Bakugan battle/opening scenes)
const seasonVideos = {
  1: 'EKneFMFSL6k', // Bakugan Battle Brawlers opening
  2: 'Fm0cIfRWe7I', // New Vestroia opening
  3: 'CkCEu4E0oUs', // Gundalian Invaders opening
  4: 'j8HfxS7DJXA', // Mechtanium Surge opening
};

const seasonBanners = {
  1: {
    bg: '/bkimg?p=f/fb/Fusion_Dragonoid_Appears.jpg',
    floats: [
      '/bkimg?p=f/fb/Fusion_Dragonoid_Appears.jpg',
      '/bkimg?p=5/58/BK_CD_Tigrerra.jpg',
      '/bkimg?p=c/c4/BK_CD_Skyress.jpg',
      '/bkimg?p=7/78/S1Masquerade.jpg',
    ],
    tint: 'rgba(255,69,0,0.15)',
  },
  2: {
    bg: '/bkimg?p=d/d3/Viper_helios.png',
    floats: [
      '/bkimg?p=d/d3/Viper_helios.png',
      '/bkimg?p=1/11/Bk_cd_percival.jpg',
      '/bkimg?p=1/17/BK_CD_Ingram.jpg',
      '/bkimg?p=c/cf/BK_CD_Gorem.jpg',
    ],
    tint: 'rgba(0,136,255,0.12)',
  },
  3: {
    bg: '/bkimg?p=d/de/BK_Linehalt.png',
    floats: [
      '/bkimg?p=d/de/BK_Linehalt.png',
      '/bkimg?p=e/ee/BK_Aranaut.png',
      '/bkimg?p=d/d3/BK_CD_HMAlphaHydranoid.jpg',
      '/bkimg?p=c/c8/BC_Lumagrowl.png',
    ],
    tint: 'rgba(139,0,255,0.12)',
  },
  4: {
    bg: '/bkimg?p=d/d4/Dan_in_Mechtanium_Surge.png',
    floats: [
      '/bkimg?p=d/d4/Dan_in_Mechtanium_Surge.png',
      '/bkimg?p=f/fb/Fusion_Dragonoid_Appears.jpg',
      '/bkimg?p=d/dc/BK_Krakix.png',
      '/bkimg?p=c/c8/BC_Lumagrowl.png',
    ],
    tint: 'rgba(255,215,0,0.10)',
  },
};

function setPageBackground(page) {
  const bannerBg = document.getElementById('wiki-banner-bg');
  const floatBg  = document.getElementById('wiki-float-bg');
  const bannerTitle = document.getElementById('wiki-banner-title');
  const bannerSub   = document.getElementById('wiki-banner-sub');
  if (!bannerBg) return;

  const sData = seasonBanners[page.season];
  const sCols = seasonColors[page.season];
  const icon  = sCols ? sCols.icon : '📖';
  const color = sCols ? sCols.num : 'var(--accent)';

  // Banner bg: prefer character's own cover image, fall back to season banner
  const bgImg = page.cover_image || (sData ? sData.bg : '/bkimg?p=f/fb/Fusion_Dragonoid_Appears.jpg');
  bannerBg.style.backgroundImage = `url('${bgImg}')`;
  if (sData) bannerBg.style.boxShadow = `inset 0 0 120px ${sData.tint}`;

  // Banner text
  if (bannerTitle) bannerTitle.innerHTML = `${icon} <span style="color:${color}">${page.title}</span>`;
  if (bannerSub)   bannerSub.textContent = page.category === 'seasons' ? `עונה ${page.season} – מידע מלא` : (page.category === 'bakugan' ? 'דף בקוגן – ויקי' : 'דף דמות – ויקי');

  // Floating images
  if (floatBg && sData) {
    floatBg.style.display = 'block';
    sData.floats.forEach((src, i) => {
      const img = document.getElementById(`wfb-${i+1}`);
      if (img) { img.src = src; img.style.display = ''; }
    });
  }

  // Ambient muted YouTube video in banner
  const ambientWrap = document.getElementById('wiki-ambient-video');
  if (ambientWrap && page.season && seasonVideos[page.season]) {
    const vid = seasonVideos[page.season];
    ambientWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0" allow="autoplay" frameborder="0"></iframe>`;
  } else if (ambientWrap) {
    ambientWrap.innerHTML = '';
  }
}

function resetPageBackground() {
  const bannerBg = document.getElementById('wiki-banner-bg');
  const floatBg  = document.getElementById('wiki-float-bg');
  const bannerTitle = document.getElementById('wiki-banner-title');
  const bannerSub   = document.getElementById('wiki-banner-sub');
  if (bannerBg) {
    bannerBg.style.backgroundImage = "url('/bkimg?p=f/fb/Fusion_Dragonoid_Appears.jpg')";
    bannerBg.style.boxShadow = '';
  }
  if (floatBg) floatBg.style.display = 'none';
  const av = document.getElementById('wiki-ambient-video');
  if (av) av.innerHTML = '';
  if (bannerTitle) bannerTitle.innerHTML = '📖 <span style="color:var(--ventus)">ויקי</span> בקוגן';
  if (bannerSub)   bannerSub.textContent = 'מידע מקיף על עונות, בקוגן ודמויות';
}

const attrColors = {
  pyrus:    '#FF4500', aquos: '#0088FF', darkus: '#9B00FF',
  haos:     '#FFD700', ventus:'#00CC44', subterra:'#CC6600',
};

const catLabels = { characters: 'דמויות', bakugan: 'בקוגן', general: 'כללי', seasons: 'עונות' };

async function loadWiki() {
  if (Auth.isAdmin()) document.getElementById('admin-wiki-btn').classList.remove('hidden');

  const urlParams = new URLSearchParams(location.search);
  const pageSlug = urlParams.get('page');

  try {
    allPages = await apiFetch('/wiki');
    renderSeasonCards();
    renderCharacterSections();
    buildNavItems();
    if (pageSlug) openPage(pageSlug);
  } catch(e) {
    document.getElementById('seasons-grid').innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${e.message}</p></div>`;
  }
}

function renderSeasonCards() {
  const seasons = allPages.filter(p => p.category === 'seasons' && p.season > 0).sort((a,b) => a.season - b.season);
  const grid = document.getElementById('seasons-grid');

  if (!seasons.length) {
    grid.innerHTML = '<p class="text-muted">אין עמודי עונות עדיין</p>';
    return;
  }

  grid.innerHTML = seasons.map(p => {
    const colors = seasonColors[p.season] || { gradient: 'linear-gradient(135deg,rgba(255,102,0,0.2),rgba(255,102,0,0.05))', num: 'var(--accent)', icon: '🌀' };
    const bgStyle = p.cover_image ? `background-image:url('${p.cover_image}');background-size:cover;background-position:center top;` : '';
    return `
      <div class="wiki-season-card" onclick="openPage('${p.slug}')" style="--season-gradient:${colors.gradient};${bgStyle}">
        <div class="wiki-season-card-overlay"></div>
        <div class="wiki-season-card-body">
          <div class="wiki-season-num" style="color:${colors.num}">${colors.icon} עונה ${p.season}</div>
          <div class="wiki-season-title">${p.title}</div>
          <div class="wiki-season-sub">לחץ לקריאה</div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCharacterSections() {
  const container = document.getElementById('all-pages-grid');
  const chars = allPages.filter(p => p.category === 'characters' || p.category === 'bakugan');

  if (!chars.length) { container.innerHTML = ''; return; }

  // Group by season
  const bySeason = {};
  chars.forEach(p => {
    const key = p.season > 0 ? p.season : 0;
    if (!bySeason[key]) bySeason[key] = [];
    bySeason[key].push(p);
  });

  const seasonOrder = Object.keys(bySeason).map(Number).sort((a,b) => a - b);

  container.innerHTML = seasonOrder.map(s => {
    const pages = bySeason[s];
    const seasonInfo = seasonColors[s] || { num: 'var(--accent)', icon: '📄' };
    const label = s > 0
      ? `${seasonInfo.icon} עונה ${s} – דמויות ובקוגן`
      : '📄 כללי';

    return `
      <div class="wiki-chars-season" style="grid-column:1/-1">
        <div class="wiki-chars-season-header" style="color:${seasonInfo.num}">${label}</div>
        <div class="wiki-char-grid">
          ${pages.map(p => renderCharCard(p)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderCharCard(p) {
  const img = p.cover_image
    ? `<img class="wiki-char-card-img" src="${p.cover_image}" onerror="this.style.display='none'" alt="${p.title}" loading="lazy">`
    : `<div class="wiki-char-card-img" style="background:linear-gradient(135deg,rgba(255,102,0,0.15),rgba(155,0,255,0.1));display:flex;align-items:center;justify-content:center;font-size:2.5rem">🌀</div>`;

  const catLabel = catLabels[p.category] || p.category;
  const sColor = seasonColors[p.season]?.num || 'var(--accent)';

  return `
    <div class="wiki-char-card" onclick="openPage('${p.slug}')">
      ${img}
      <div class="wiki-char-card-body">
        <div class="wiki-char-card-attr" style="color:${sColor}">${catLabel}${p.season > 0 ? ` · עונה ${p.season}` : ''}</div>
        <div class="wiki-char-card-name">${p.title}</div>
      </div>
    </div>
  `;
}

function buildNavItems() {
  const nav = document.getElementById('wiki-nav-items');

  // Group by category for better nav
  const seasons = allPages.filter(p => p.category === 'seasons').sort((a,b) => a.season - b.season);
  const chars   = allPages.filter(p => p.category === 'characters' || p.category === 'bakugan');
  const other   = allPages.filter(p => !['seasons','characters','bakugan'].includes(p.category));

  let html = '';
  if (seasons.length) {
    html += `<div style="font-size:0.68rem;letter-spacing:0.1em;color:var(--text-muted);padding:0.3rem 0.75rem;margin-top:0.5rem">עונות</div>`;
    html += seasons.map(p => navItem(p)).join('');
  }
  if (chars.length) {
    html += `<div style="font-size:0.68rem;letter-spacing:0.1em;color:var(--text-muted);padding:0.3rem 0.75rem;margin-top:0.75rem">דמויות ובקוגן</div>`;
    html += chars.map(p => navItem(p)).join('');
  }
  if (other.length) {
    html += `<div style="font-size:0.68rem;letter-spacing:0.1em;color:var(--text-muted);padding:0.3rem 0.75rem;margin-top:0.75rem">כללי</div>`;
    html += other.map(p => navItem(p)).join('');
  }

  nav.innerHTML = html;
}

function navItem(p) {
  const icon = p.category === 'seasons' ? (seasonColors[p.season]?.icon || '📄') : (p.category === 'bakugan' ? '🐉' : '👤');
  return `<div class="wiki-nav-item ${currentPage?.slug === p.slug ? 'active' : ''}" onclick="openPage('${p.slug}')" id="nav-${p.slug}">${icon} ${p.title}</div>`;
}

async function openPage(slug) {
  try {
    const page = await apiFetch(`/wiki/${slug}`);
    currentPage = page;
    history.pushState({}, '', `?page=${slug}`);
    document.title = `${page.title} – ויקי בקוגן ישראל`;

    document.getElementById('wiki-home').classList.add('hidden');
    document.getElementById('wiki-page-view').classList.remove('hidden');
    document.getElementById('page-title').textContent = page.title;
    document.getElementById('page-meta').innerHTML = `
      עודכן: ${formatDate(page.updated_at)}
      ${page.author ? ` · נכתב על ידי: ${page.author}` : ''}
      <span style="margin-right:0.75rem;font-size:0.8rem;padding:0.15rem 0.55rem;border-radius:12px;background:rgba(255,102,0,0.1);color:var(--accent)">${catLabels[page.category] || page.category}</span>
    `;

    let extraContent = '';
    // Auto-append character grid at the bottom of season pages
    if (page.category === 'seasons' && page.season > 0) {
      const seasonChars = allPages.filter(p =>
        (p.category === 'characters' || p.category === 'bakugan') && p.season === page.season
      );
      if (seasonChars.length) {
        const sColor = seasonColors[page.season]?.num || 'var(--accent)';
        extraContent = `
          <hr style="border:none;border-top:1px solid var(--border);margin:2rem 0">
          <h2 style="font-family:'Orbitron',sans-serif;font-size:1rem;letter-spacing:0.08em;color:${sColor};margin-bottom:1rem">👥 דמויות ובקוגן – עונה ${page.season}</h2>
          <div class="wiki-char-grid">
            ${seasonChars.map(p => renderCharCard(p)).join('')}
          </div>
        `;
      }
    }

    document.getElementById('page-content').innerHTML = page.content + extraContent;
    if (Auth.isAdmin()) document.getElementById('edit-page-btn').classList.remove('hidden');

    setPageBackground(page);
    buildNavItems();
    document.querySelectorAll('.wiki-nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`nav-${slug}`)?.classList.add('active');
    window.scrollTo({top: 0, behavior: 'smooth'});
  } catch(e) {
    showToast(e.message, 'error');
  }
}

function showHome() {
  currentPage = null;
  document.getElementById('wiki-home').classList.remove('hidden');
  document.getElementById('wiki-page-view').classList.add('hidden');
  resetPageBackground();
  history.pushState({}, '', '/wiki');
  document.title = 'ויקי – בקוגן ישראל';
}

function openEditModal() {
  if (!currentPage) return;
  const modal = document.getElementById('create-page-modal');
  document.querySelector('.modal-title').textContent = '✏️ עריכת דף';
  document.getElementById('page-slug').value = currentPage.slug;
  document.getElementById('page-slug').disabled = true;
  document.getElementById('page-title-input').value = currentPage.title;
  document.getElementById('page-season').value = currentPage.season;
  document.getElementById('page-category').value = currentPage.category;
  document.getElementById('page-content-input').value = currentPage.content;
  openModal('create-page-modal');
}

async function createPage() {
  const slug = document.getElementById('page-slug').value.trim();
  const title = document.getElementById('page-title-input').value.trim();
  const content = document.getElementById('page-content-input').value.trim();
  const season = parseInt(document.getElementById('page-season').value) || 0;
  const category = document.getElementById('page-category').value;
  const errEl = document.getElementById('page-error');
  errEl.classList.add('hidden');

  if (!slug || !title || !content) { errEl.textContent = '⚠️ כל השדות נדרשים'; errEl.classList.remove('hidden'); return; }

  const isEdit = document.getElementById('page-slug').disabled;
  try {
    if (isEdit) {
      await apiFetch(`/wiki/${slug}`, { method: 'PUT', body: { title, content, season, category } });
    } else {
      await apiFetch('/wiki', { method: 'POST', body: { slug, title, content, season, category } });
    }
    closeModal('create-page-modal');
    document.getElementById('page-slug').disabled = false;
    showToast('דף נשמר!', 'success');
    allPages = await apiFetch('/wiki');
    renderSeasonCards(); renderCharacterSections(); buildNavItems();
    openPage(slug);
  } catch(e) {
    errEl.textContent = '⚠️ ' + e.message;
    errEl.classList.remove('hidden');
  }
}

loadWiki();
