let allEvents = [];
let currentFilter = 'all';
let applyingEventId = null;

const eventTypeLabels = { tournament: 'טורניר', casual: 'ידידותי', league: 'ליגה', exhibition: 'תערוכה' };
const eventTypeEmojis = { tournament: '🏆', casual: '🎮', league: '⚔️', exhibition: '🎪' };

async function loadEvents() {
  try {
    allEvents = await apiFetch('/events');
    if (Auth.isAdmin()) document.getElementById('add-event-btn').classList.remove('hidden');
    renderEvents();
  } catch(e) {
    document.getElementById('events-grid').innerHTML = `<div class="empty-state"><div class="icon">❌</div><p>${e.message}</p></div>`;
  }
}

function renderEvents() {
  const filtered = currentFilter === 'all' ? allEvents : allEvents.filter(e => e.status === currentFilter);
  const grid = document.getElementById('events-grid');

  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">🏆</div><p>אין אירועים להצגה כרגע</p></div>';
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const pct = e.max_participants > 0 ? Math.min(100, (e.participant_count / e.max_participants) * 100) : 0;
    return `
      <div class="event-card" onclick="openEventDetail(${e.id})">
        <div class="event-banner">
          ${e.image ? `<img class="event-banner-img" src="${e.image}" alt="">` : ''}
          <div class="event-banner-overlay"></div>
          <div style="font-size:3rem;position:relative;z-index:1">${eventTypeEmojis[e.event_type] || '🏆'}</div>
          <div class="event-status status-${e.status}" style="position:absolute;top:0.75rem;right:0.75rem">
            ${{upcoming:'🟢 קרוב',ongoing:'🔥 פעיל',completed:'✅ הסתיים'}[e.status]||e.status}
          </div>
          <div class="event-type-badge">${eventTypeLabels[e.event_type] || e.event_type}</div>
        </div>
        <div class="event-body">
          <div class="event-title">${e.title}</div>
          <div class="event-meta">
            ${e.event_date ? `<div class="event-meta-item">📅 <strong>${formatEventDate(e.event_date)}</strong></div>` : ''}
            ${e.location ? `<div class="event-meta-item">📍 <strong>${e.location}</strong></div>` : ''}
            ${e.prize ? `<div class="event-meta-item">🏅 <strong>${e.prize}</strong></div>` : ''}
          </div>
          <div class="event-footer">
            ${e.max_participants > 0
              ? `<div class="participants-bar">
                   <div class="participants-text">${e.participant_count} / ${e.max_participants} נרשמו</div>
                   <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
                 </div>`
              : `<span class="text-sm text-muted">👥 ${e.participant_count} נרשמו</span>`
            }
            ${e.status !== 'completed'
              ? `<button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); openApply(${e.id}, '${e.title.replace(/'/g,"\\'")}')">הרשם</button>`
              : `<span class="text-sm" style="color:#888">הסתיים</span>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function openEventDetail(id) {
  const data = await apiFetch(`/events/${id}`);
  const { event: e, applications } = data;

  document.getElementById('modal-event-title').textContent = e.title;
  document.getElementById('modal-event-body').innerHTML = `
    <div style="margin-bottom:1.5rem">
      <div class="event-detail-grid">
        <div class="event-detail-item">
          <div class="event-detail-label">📅 תאריך</div>
          <div class="event-detail-value">${e.event_date ? formatEventDate(e.event_date) : 'לא צוין'}</div>
        </div>
        <div class="event-detail-item">
          <div class="event-detail-label">📍 מקום</div>
          <div class="event-detail-value">${e.location || 'לא צוין'}</div>
        </div>
        <div class="event-detail-item">
          <div class="event-detail-label">🏆 סוג</div>
          <div class="event-detail-value">${eventTypeLabels[e.event_type] || e.event_type}</div>
        </div>
        <div class="event-detail-item">
          <div class="event-detail-label">👥 משתתפים</div>
          <div class="event-detail-value">${e.participant_count}${e.max_participants > 0 ? ' / ' + e.max_participants : ''}</div>
        </div>
      </div>
      ${e.prize ? `<div class="event-detail-item" style="margin-bottom:1rem"><div class="event-detail-label">🏅 פרס</div><div class="event-detail-value">${e.prize}</div></div>` : ''}
      ${e.description ? `<div style="color:var(--text-secondary);line-height:1.8;margin-bottom:1.5rem">${e.description}</div>` : ''}
    </div>

    ${applications.length ? `
      <div style="margin-bottom:1rem">
        <div style="font-weight:700;margin-bottom:0.75rem">📋 רשומים (${applications.filter(a=>a.is_coming).length} מגיעים)</div>
        <div class="participants-list">
          ${applications.map(a => `
            <div class="participant-item">
              <span>${a.is_coming ? '✅' : '❓'}</span>
              <span>${a.name}</span>
              ${a.notes ? `<span class="text-muted text-sm">– ${a.notes}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : '<p class="text-muted">עדיין אין נרשמים</p>'}

    ${e.status !== 'completed' ? `
      <div style="text-align:center;margin-top:1.5rem">
        <button class="btn btn-primary" onclick="closeModal('event-detail-modal'); openApply(${e.id}, '${e.title.replace(/'/g,"\\'")}')">
          🏆 הרשם לאירוע
        </button>
      </div>
    ` : ''}
  `;
  openModal('event-detail-modal');
}

function openApply(eventId, eventTitle) {
  applyingEventId = eventId;
  document.getElementById('apply-event-name').textContent = eventTitle;
  document.getElementById('apply-name').value = Auth.getUser()?.username || '';
  document.getElementById('apply-error').classList.add('hidden');
  openModal('apply-modal');
}

async function submitApply() {
  const name = document.getElementById('apply-name').value.trim();
  const is_coming = document.getElementById('apply-coming').value === '1';
  const notes = document.getElementById('apply-notes').value.trim();
  const errEl = document.getElementById('apply-error');
  errEl.classList.add('hidden');

  if (!name) { errEl.textContent = '⚠️ שם נדרש'; errEl.classList.remove('hidden'); return; }

  try {
    await apiFetch(`/events/${applyingEventId}/apply`, { method: 'POST', body: { name, is_coming, notes } });
    closeModal('apply-modal');
    showToast(is_coming ? '✅ נרשמת לאירוע!' : '📝 תגובתך נשמרה', 'success');
    document.getElementById('apply-notes').value = '';
    loadEvents();
  } catch(e) {
    errEl.textContent = '⚠️ ' + e.message;
    errEl.classList.remove('hidden');
  }
}

async function createEvent() {
  const title = document.getElementById('ev-title').value.trim();
  const description = document.getElementById('ev-desc').value.trim();
  const event_date = document.getElementById('ev-date').value;
  const location = document.getElementById('ev-location').value.trim();
  const max_participants = parseInt(document.getElementById('ev-max').value) || 0;
  const event_type = document.getElementById('ev-type').value;
  const prize = document.getElementById('ev-prize').value.trim();
  const errEl = document.getElementById('create-ev-error');
  errEl.classList.add('hidden');

  if (!title || !event_date) { errEl.textContent = '⚠️ שם ותאריך נדרשים'; errEl.classList.remove('hidden'); return; }
  try {
    await apiFetch('/events', { method: 'POST', body: { title, description, event_date, location, max_participants, event_type, prize } });
    closeModal('create-event-modal');
    showToast('אירוע נוצר!', 'success');
    loadEvents();
  } catch(e) {
    errEl.textContent = '⚠️ ' + e.message;
    errEl.classList.remove('hidden');
  }
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderEvents();
  });
});

loadEvents();
