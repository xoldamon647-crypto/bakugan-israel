const http = require('http');

const BASE = 'http://localhost:3000';
let token = '';
let adminToken = '';
let testEventId = null;
let testThreadId = null;
let testPostId = null;

function req(method, path, body, tok) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const url = new URL(BASE + path);
    const options = {
      hostname: url.hostname, port: url.port, path: url.pathname + url.search,
      method, headers: {
        'Content-Type': 'application/json',
        ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
      }
    };
    const r = http.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function run() {
  let passed = 0, failed = 0;

  function assert(name, condition, actual) {
    if (condition) { console.log(`  ✅ ${name}`); passed++; }
    else { console.log(`  ❌ ${name}`, actual !== undefined ? `(got: ${JSON.stringify(actual)})` : ''); failed++; }
  }

  console.log('\n🌀 Bakugan Israel – Test Suite\n');

  // ─── Auth ───
  console.log('📋 Auth Tests');
  const reg = await req('POST', '/api/auth/register', { username: 'TestUser_' + Date.now(), email: `test_${Date.now()}@test.com`, password: 'pass123' });
  assert('Register new user', reg.status === 200 && reg.data.token);
  token = reg.data.token;

  const regDup = await req('POST', '/api/auth/register', { username: 'TestUser2', email: reg.data.user?.email, password: 'pass123' });
  assert('Reject duplicate email', regDup.status === 409);

  const login = await req('POST', '/api/auth/login', { email: 'admin@bakugan-israel.com', password: 'Admin123!' });
  assert('Admin login', login.status === 200 && login.data.token);
  adminToken = login.data.token;

  const badLogin = await req('POST', '/api/auth/login', { email: 'nobody@x.com', password: 'wrong' });
  assert('Reject bad login', badLogin.status === 401);

  const me = await req('GET', '/api/auth/me', null, token);
  assert('Get own profile', me.status === 200 && me.data.username);

  const stats = await req('GET', '/api/auth/stats');
  assert('Get site stats', stats.status === 200 && typeof stats.data.users === 'number');

  // ─── Forums ───
  console.log('\n💬 Forum Tests');
  const cats = await req('GET', '/api/forums/categories');
  assert('Get categories', cats.status === 200 && Array.isArray(cats.data) && cats.data.length > 0);

  const catId = cats.data[0]?.id;
  const newThread = await req('POST', '/api/forums/threads', { category_id: catId, title: 'שרשור בדיקה מהתסריט', content: 'תוכן בדיקה לשרשור זה' }, token);
  assert('Create thread', newThread.status === 200 && newThread.data.id);
  testThreadId = newThread.data.id;

  const badThread = await req('POST', '/api/forums/threads', { category_id: catId, title: 'קצר', content: 'x' }, token);
  assert('Reject short thread title', badThread.status === 400);

  const threads = await req('GET', `/api/forums/threads?category_id=${catId}`);
  assert('Get threads by category', threads.status === 200 && Array.isArray(threads.data.threads));

  const threadDetail = await req('GET', `/api/forums/threads/${testThreadId}`);
  assert('Get thread detail', threadDetail.status === 200 && threadDetail.data.thread?.id === testThreadId);

  const newPost = await req('POST', `/api/forums/threads/${testThreadId}/posts`, { content: 'תגובת בדיקה לשרשור' }, token);
  assert('Add reply to thread', newPost.status === 200 && newPost.data.id);
  testPostId = newPost.data.id;

  const delPost = await req('DELETE', `/api/forums/posts/${testPostId}`, null, token);
  assert('Delete own post', delPost.status === 200);

  // ─── Events ───
  console.log('\n🏆 Events Tests');
  const events = await req('GET', '/api/events');
  assert('Get all events', events.status === 200 && Array.isArray(events.data));

  const newEvent = await req('POST', '/api/events', { title: 'טורניר בדיקה', event_date: '2026-12-01T10:00', location: 'תל אביב', max_participants: 16, event_type: 'tournament' }, adminToken);
  assert('Admin create event', newEvent.status === 200 && newEvent.data.id);
  testEventId = newEvent.data.id;

  const noEvent = await req('POST', '/api/events', { title: 'טורניר', event_date: '2026-12-01T10:00' }, token);
  assert('Non-admin cannot create event', noEvent.status === 403);

  const apply = await req('POST', `/api/events/${testEventId}/apply`, { name: 'שחקן בדיקה', is_coming: true, notes: 'אגיע!' });
  assert('Apply to event (no auth required)', apply.status === 200 && apply.data.id);

  const eventDetail = await req('GET', `/api/events/${testEventId}`);
  assert('Get event detail with applications', eventDetail.status === 200 && eventDetail.data.applications?.length > 0);

  // ─── Wiki ───
  console.log('\n📖 Wiki Tests');
  const wiki = await req('GET', '/api/wiki');
  assert('Get wiki pages', wiki.status === 200 && Array.isArray(wiki.data) && wiki.data.length > 0);

  const season1 = await req('GET', '/api/wiki/season-1');
  assert('Get season 1 page', season1.status === 200 && season1.data.title);

  const newPage = await req('POST', '/api/wiki', { slug: 'test-page-' + Date.now(), title: 'דף בדיקה', content: '<p>תוכן</p>', season: 0, category: 'general' }, adminToken);
  assert('Admin create wiki page', newPage.status === 200);

  const noPage = await req('POST', '/api/wiki', { slug: 'test-unauth', title: 'x', content: 'y' }, token);
  assert('Non-admin cannot create wiki page', noPage.status === 403);

  // ─── Rules ───
  console.log('\n📜 Rules Tests');
  const rules = await req('GET', '/api/rules');
  assert('Get rules', rules.status === 200 && Array.isArray(rules.data));

  const newRule = await req('POST', '/api/rules', { season: 1, season_name: 'בדיקה', title: 'כלל בדיקה', content: '<p>תוכן</p>' }, adminToken);
  assert('Admin create rule', newRule.status === 200 && newRule.data.id);
  const delRule = await req('DELETE', `/api/rules/${newRule.data.id}`, null, adminToken);
  assert('Admin delete rule', delRule.status === 200);

  // ─── Admin ───
  console.log('\n⚙️ Admin Tests');
  const dashboard = await req('GET', '/api/admin/dashboard', null, adminToken);
  assert('Admin dashboard', dashboard.status === 200 && dashboard.data.stats);

  const noAdmin = await req('GET', '/api/admin/dashboard', null, token);
  assert('Non-admin blocked from admin routes', noAdmin.status === 403);

  const users = await req('GET', '/api/admin/users', null, adminToken);
  assert('Admin list users', users.status === 200 && Array.isArray(users.data));

  // ─── Cleanup ───
  if (testEventId) await req('DELETE', `/api/events/${testEventId}`, null, adminToken);
  if (testThreadId) { await req('DELETE', `/api/forums/threads/${testThreadId}`, null, adminToken); }

  // ─── Static pages ───
  console.log('\n🌐 Static Page Tests');
  for (const page of ['/', '/forums', '/events', '/wiki', '/rules', '/login', '/register']) {
    const r = await req('GET', page);
    assert(`Static page: ${page}`, r.status === 200);
  }

  // ─── Summary ───
  console.log(`\n${'─'.repeat(40)}`);
  console.log(`🏁 Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log('🎉 All tests passed!');
  else console.log(`⚠️  ${failed} test(s) failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Test runner error:', e.message); process.exit(1); });
