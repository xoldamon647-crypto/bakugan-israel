const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const dbPath = process.env.DB_PATH || './bakugan.db';
const db = new DatabaseSync(dbPath);

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      avatar TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      last_seen TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS forum_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '💬',
      order_num INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS forum_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      reply_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES forum_categories(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS forum_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      event_date TEXT,
      location TEXT DEFAULT '',
      max_participants INTEGER DEFAULT 0,
      event_type TEXT DEFAULT 'tournament',
      image TEXT DEFAULT '',
      status TEXT DEFAULT 'upcoming',
      prize TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS event_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      user_id TEXT,
      name TEXT NOT NULL,
      is_coming INTEGER DEFAULT 1,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (event_id) REFERENCES events(id)
    );

    CREATE TABLE IF NOT EXISTS wiki_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      season INTEGER DEFAULT 0,
      category TEXT DEFAULT 'general',
      cover_image TEXT DEFAULT '',
      created_by TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id TEXT NOT NULL,
      receiver_id TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      related_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      season INTEGER NOT NULL,
      season_name TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      order_num INTEGER DEFAULT 0
    );
  `);

  seedData();
}

function seedData() {
  const adminCheck = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (adminCheck) return;

  const adminId = uuidv4();
  const adminHash = bcrypt.hashSync('Admin123!', 10);
  db.prepare(`INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)`).run(
    adminId, 'מנהל', 'admin@bakugan-israel.com', adminHash, 'admin'
  );

  const categories = [
    { name: 'דיון כללי', description: 'שיחות כלליות על בקוגן', icon: '🌀', order: 1 },
    { name: 'סיפורים ופנפיקשן', description: 'פנפיקשן ויצירות של הקהילה', icon: '📖', order: 2 },
    { name: 'עסקאות וסחר', description: 'קנה, מכור והחלף כרטיסי בקוגן', icon: '🔄', order: 3 },
    { name: 'בניית חפיסות', description: 'טיפים ואסטרטגיות לבניית חפיסה', icon: '🃏', order: 4 },
    { name: 'טורנירים ואירועים', description: 'דיון בטורנירים ואירועים', icon: '🏆', order: 5 },
    { name: 'שאלות ועזרה', description: 'שאל שאלות וקבל עזרה', icon: '❓', order: 6 },
  ];

  const catInsert = db.prepare(`INSERT INTO forum_categories (name, description, icon, order_num) VALUES (?, ?, ?, ?)`);
  for (const c of categories) catInsert.run(c.name, c.description, c.icon, c.order);

  const wikiInsert = db.prepare(`INSERT INTO wiki_pages (slug, title, content, season, category, cover_image, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`);

  wikiInsert.run('season-1', 'עונה 1 – Battle Brawlers', `
<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem">
  <div style="flex:1;min-width:220px">
    <h2 style="margin-bottom:0.4rem">🔥 Bakugan: Battle Brawlers</h2>
    <p style="color:var(--text-secondary);font-size:0.85rem">2007–2008 · 52 פרקים · TMS Entertainment / Nelvana</p>
  </div>
  <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
    <span style="background:rgba(255,69,0,0.15);border:1px solid rgba(255,69,0,0.4);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#FF4500">עונה 1</span>
    <span style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#FFD700">קלאסי</span>
  </div>
</div>
<p>הסדרה שהתחילה הכל. דן קוסו וחבריו מגלים שקלפי הבקוגן הם יצורים חיים ממימד מקביל – <strong>Vestroia</strong>. כשהאיזון בין ה-<strong>Silent Core</strong> וה-<strong>Infinity Core</strong> נשבר, שני העולמות בסכנה קיומית.</p>

<h2>🌌 עולם Vestroia</h2>
<p>Vestroia הוא מימד מקביל שבו חיים הבקוגן כיצורים חיים ובעלי תודעה. המימד מחולק לשני כוחות:</p>
<ul>
  <li><strong>Infinity Core</strong> – ליבת האנרגיה החיובית, שומרת על חיים ואיזון</li>
  <li><strong>Silent Core</strong> – ליבת האנרגיה השלילית, מייצגת כוח ושליטה</li>
</ul>
<p>כש-<strong>Naga</strong>, בקוגן ה-Haos, ניסה לספוג את שתי הליבות, הוא נבלע על ידי ה-Silent Core ונהפך לכוח אפל. כתוצאה מכך, בקוגן ממימד Vestroia הופצו לכדור הארץ ונהפכו לקלפי הבקוגן.</p>

<h2>👥 לוחמי הבקוגן – Battle Brawlers</h2>
<div class="char-grid-wiki">
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-pyrus"></div>
      <img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Drago" loading="lazy">
    </div>
    <div class="char-mini-name">PYRUS</div>
    <div class="char-mini-owner">דן קוסו</div>
    <div class="char-mini-gp">Drago · G: 640→1300+</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-haos"></div>
      <img src="https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Tigrerra" loading="lazy">
    </div>
    <div class="char-mini-name">HAOS</div>
    <div class="char-mini-owner">ראונו</div>
    <div class="char-mini-gp">Tigrerra · G: 450→1000</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-ventus"></div>
      <img src="https://bakugan.wiki/images/c/c4/BK_CD_Skyress.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Skyress" loading="lazy">
    </div>
    <div class="char-mini-name">VENTUS</div>
    <div class="char-mini-owner">שון</div>
    <div class="char-mini-gp">Skyress · G: 510→1050</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-aquos"></div>
      <img src="https://bakugan.wiki/images/a/a4/BK_CD_Preyas.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Preyas" loading="lazy">
    </div>
    <div class="char-mini-name">AQUOS</div>
    <div class="char-mini-owner">מרוסה</div>
    <div class="char-mini-gp">Preyas · G: 490→900</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-subterra"></div>
      <img src="https://bakugan.wiki/images/c/cf/BK_CD_Gorem.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Gorem" loading="lazy">
    </div>
    <div class="char-mini-name">SUBTERRA</div>
    <div class="char-mini-owner">ג'ולי</div>
    <div class="char-mini-gp">Gorem · G: 600→1000</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-darkus"></div>
      <img src="https://bakugan.wiki/images/0/0d/BK_CD_Hydranoid.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Hydranoid" loading="lazy">
    </div>
    <div class="char-mini-name">DARKUS</div>
    <div class="char-mini-owner">אליס</div>
    <div class="char-mini-gp">Hydranoid · G: 600→1100</div>
  </div>
</div>

<h2>🐉 הבקוגנים המפורסמים</h2>

<h3>🔥 Dragonoid (Drago) – Pyrus</h3>
<img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="Drago" loading="lazy" style="max-width:100%;border-radius:8px;margin-bottom:0.6rem;border:2px solid rgba(255,100,0,0.4)">
<p><strong>בעלים:</strong> דן קוסו | <strong>G-Power התחלתי:</strong> 640 | <strong>G-Power סופי:</strong> 1300+</p>
<p>הבקוגן האייקוני ביותר בסדרה. Drago הוא שומר הדרגון הפירוסי שמגיע מ-Vestroia. לאורך הסדרה הוא עובר אבולוציות רבות: Pyrus Dragonoid → Delta Dragonoid → Ultimate Dragonoid → Infinity Dragonoid.</p>
<p><strong>כוחות מיוחדים:</strong> Dragon Blade, Burning Dragon, Pyrus Fusion – מתקפות אש עוצמתיות שמכוון ישירות ללב האויב.</p>

<h3>✨ Tigrerra – Haos</h3>
<img src="https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg" onerror="this.style.display='none'" alt="Tigrerra" loading="lazy" style="max-width:100%;border-radius:8px;margin-bottom:0.6rem;border:2px solid rgba(255,220,0,0.4)">
<p><strong>בעלים:</strong> ראונו | <strong>G-Power:</strong> 450→1000</p>
<p>חתולת Haos לבנה ואצילה. בעונה הראשונה Tigrerra מתפתחת ל-Blade Tigrerra עם להבים מבריקים. היא ידועה בנאמנות המוחלטת לראונו.</p>

<h3>🌪️ Skyress – Ventus</h3>
<img src="https://bakugan.wiki/images/c/c4/BK_CD_Skyress.jpg" onerror="this.style.display='none'" alt="Skyress" loading="lazy" style="max-width:100%;border-radius:8px;margin-bottom:0.6rem;border:2px solid rgba(0,200,0,0.4)">
<p><strong>בעלים:</strong> שון | <strong>G-Power:</strong> 510→1050</p>
<p>ציפור ה-Ventus הגאה. Storm Skyress היא האבולוציה שלה – ציפור ענק עם כנפיים שסוחפות כל מה שנמצא בדרכן.</p>

<h3>💧 Preyas – Aquos</h3>
<p><strong>בעלים:</strong> מרוסה | <strong>G-Power:</strong> 490→900</p>
<p>הבקוגן המיוחד ביותר – יכול לשנות את האלמנט שלו! Preyas Angelo/Diablo הם שני הצדדים שלו – טוב ורע.</p>

<h3>🪨 Gorem – Subterra</h3>
<p><strong>בעלים:</strong> ג'ולי ושון | <strong>G-Power:</strong> 600→1000</p>
<p>ענק האדמה – בקוגן גדול ועמיד. Stone Gorem הוא האבולוציה שלו, הקשיח ביותר בקבוצה.</p>

<h3>🌑 Hydranoid – Darkus</h3>
<p><strong>בעלים:</strong> אליס (ולאחר מכן Masquerade) | <strong>G-Power:</strong> 600→1100</p>
<p>ההידרה האפלה. Dual Hydranoid ולאחר מכן Alpha Hydranoid – שלוש ראשים ושלוש פעמים יותר קטלני.</p>

<h2>🦹 האנטגוניסטים</h2>
<div class="char-grid-wiki" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-haos"></div>
      <img src="https://bakugan.wiki/images/1/1b/BK_CD_Naga_2.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Naga" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FFD700">NAGA</div>
    <div class="char-mini-owner">האנטגוניסט הראשי</div>
    <div class="char-mini-gp">HAOS · Ultimate Power</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-darkus"></div>
      <img src="https://bakugan.wiki/images/7/78/S1Masquerade.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Masquerade" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#9B00FF">MASQUERADE</div>
    <div class="char-mini-owner">השחקן המסתורי</div>
    <div class="char-mini-gp">DARKUS · Hydranoid</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-darkus"></div>
      <img src="https://bakugan.wiki/images/3/38/Hal-G.png" class="char-mini-img" onerror="this.style.display='none'" alt="Hal-G" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#9B00FF">HAL-G</div>
    <div class="char-mini-owner">שלוחת Naga</div>
    <div class="char-mini-gp">מדען שנשלט על ידי Naga</div>
  </div>
</div>

<h3>💀 Naga – האיום הגדול ביותר</h3>
<img src="https://bakugan.wiki/images/1/1b/BK_CD_Naga_2.jpg" onerror="this.style.display='none'" alt="Naga" loading="lazy" style="max-width:280px;width:100%;border-radius:10px;margin-bottom:0.75rem;border:2px solid rgba(255,215,0,0.4);display:block">
<p>Naga היה בקוגן Haos שביצע ניסוי נואש – ניסה לספוג את כוח ה-Silent Core כדי להפוך לבקוגן החזק ביותר. הניסוי נכשל, Naga נבלע על ידי ה-Silent Core והפך לישות של כוח טהור ואפל. מטרתו: להשיג גם את ה-Infinity Core ולשלוט בשניהם – מה שיתן לו שליטה מוחלטת על שני העולמות ועל כל הבקוגן.</p>

<h3>🎭 Masquerade – המסכה מסתירה סוד</h3>
<p>Masquerade הוא השחקן המסתורי שמשתמש ב-Darkus Hydranoid ומשלח בקוגן של שחקנים אחרים ל-Doom Dimension. הוא פועל בשליחות Naga ומתמודד מול כל Battle Brawler. <strong>הסוד הגדול:</strong> מאחורי המסכה מסתתרת אליס גאינס עצמה – אישיות שנייה שנוצרה מהקשר של אביה עם Naga. כשהסוד נחשף, הידרנואיד עובר לצד הטוב.</p>

<h2>📖 ארבעת קשתות העלילה</h2>
<ol>
  <li><strong>Arc 1 – הגילוי:</strong> דן וחבריו מגלים שבקוגן הם יצורים חיים. Masquerade מתחיל לאיים ולשלוח בקוגן ל-Doom Dimension.</li>
  <li><strong>Arc 2 – המשבר:</strong> הקבוצה מתפרקת. דן מתמודד לבד. Masquerade שולח כל Battle Brawler לקרב ומנצח.</li>
  <li><strong>Arc 3 – הסוד נחשף:</strong> זהותו האמיתית של Masquerade נחשפת. הקבוצה מתאחדת מחדש.</li>
  <li><strong>Arc 4 – Vestroia:</strong> הבקוגן מוסרים את עצמם לבעליהם כשותפים שוויוניים. הקבוצה נוסעת ל-Vestroia ונלחמת ב-Naga. Drago הופך ל-Infinity Dragonoid ומחסל את Naga.</li>
</ol>

<h2>🏆 עובדות מעניינות</h2>
<ul>
  <li>הסדרה יצאה בישראל בערוץ דיסני ובעברית מלאה</li>
  <li>בקוגן המשחק נמכר ב-40+ מדינות ברחבי העולם</li>
  <li>Drago הוא אחד מבקוגן הנדירים ביותר – Guardian Bakugan</li>
  <li>לראונו ולדן יש רומנטיקה שמתפתחת לאורך הסדרה</li>
  <li>ה-Doom Dimension הוא מימד שלישי שבו בקוגן שנוצחו נשלחים</li>
</ul>

<h2>🎲 Special Treatment – גרסאות אספנות עונה 1</h2>
<p>Special Treatment הן גרסאות מיוחדות של כדורי הבקוגן שיצאו כאיטמי אספנות מוגבלים. כל גרסה שונה בצבע, חומר ו-G-Power.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(200,200,200,0.1);border:1px solid rgba(200,200,200,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem"><strong style="color:#CCCCCC">🔵 Clear</strong><br><span style="font-size:0.72rem">שקוף לגמרי – נדיר</span></div>
  <div style="background:rgba(100,150,255,0.1);border:1px solid rgba(100,150,255,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem"><strong style="color:#6496FF">B1 Clear</strong><br><span style="font-size:0.72rem">גרסה שקופה ראשונה</span></div>
  <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem"><strong style="color:#FFD700">✨ Pearl</strong><br><span style="font-size:0.72rem">מבהיק כפנינה</span></div>
  <div style="background:rgba(150,200,150,0.1);border:1px solid rgba(150,200,150,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem"><strong style="color:#96C896">Dual Attribute</strong><br><span style="font-size:0.72rem">שתי תכונות על כדור אחד</span></div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem"><strong style="color:#64C8FF">🔄 Flip</strong><br><span style="font-size:0.72rem">משנה תכונה בפתיחה</span></div>
  <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.8rem"><strong style="color:#FFFFFF">White Naga</strong><br><span style="font-size:0.72rem">גרסה לבנה מיוחדת של Naga</span></div>
</div>
`, 1, 'seasons', 'https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg', adminId);

  wikiInsert.run('season-2', 'עונה 2 – New Vestroia', `
<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem">
  <div style="flex:1;min-width:220px">
    <h2 style="margin-bottom:0.4rem">💧 Bakugan: New Vestroia</h2>
    <p style="color:var(--text-secondary);font-size:0.85rem">2009 · 52 פרקים · TMS Entertainment / Nelvana</p>
  </div>
  <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
    <span style="background:rgba(0,136,255,0.15);border:1px solid rgba(0,136,255,0.4);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#0088FF">עונה 2</span>
    <span style="background:rgba(155,0,255,0.1);border:1px solid rgba(155,0,255,0.3);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#9B00FF">Vexos</span>
  </div>
</div>
<p>שנתיים לאחר Battle Brawlers, ממד הבקוגן התחדש כ-<strong>New Vestroia</strong>. אך כוח רשע חדש – <strong>ה-Vexos</strong> – השתלט על הממד וכלא את הבקוגן. דן וחבריו חוזרים לפעולה יחד עם לוחמים חדשים מ-New Vestroia עצמה.</p>

<h2>👥 ה-Resistance – לוחמי ההתנגדות</h2>
<div class="char-grid-wiki">
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-pyrus"></div>
      <img src="https://bakugan.wiki/images/6/6d/Dan_large.png" class="char-mini-img" onerror="this.style.display='none'" alt="Dan" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FF4500">PYRUS</div>
    <div class="char-mini-owner">דן קוסו</div>
    <div class="char-mini-gp">Neo Dragonoid</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-darkus"></div>
      <img src="https://bakugan.wiki/images/1/11/Bk_cd_percival.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Percival" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#9B00FF">DARKUS</div>
    <div class="char-mini-owner">שון קאזאמי</div>
    <div class="char-mini-gp">Knight Percival</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-ventus"></div>
      <img src="https://bakugan.wiki/images/1/17/BK_CD_Ingram.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Ingram" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#00CC44">VENTUS</div>
    <div class="char-mini-owner">Shun / Mira</div>
    <div class="char-mini-gp">Master Ingram</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-subterra"></div>
      <img src="https://bakugan.wiki/images/c/cf/BK_CD_Gorem.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Wilda" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#CC6600">SUBTERRA</div>
    <div class="char-mini-owner">Ace Grit</div>
    <div class="char-mini-gp">Knight Percival / Wilda</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-haos"></div>
      <img src="https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Nemus" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FFD700">HAOS</div>
    <div class="char-mini-owner">Baron Leltoy</div>
    <div class="char-mini-gp">Nemus · G: 700</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-pyrus"></div>
      <img src="https://bakugan.wiki/images/d/d3/Viper_helios.png" class="char-mini-img" onerror="this.style.display='none'" alt="Helios" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FF4500">PYRUS (Vexos)</div>
    <div class="char-mini-owner">Spectra Phantom</div>
    <div class="char-mini-gp">Helios · G: 900→1600</div>
  </div>
</div>

<h2>🐉 שרשרת האבולוציה – Drago בעונה 2</h2>
<div style="background:rgba(255,69,0,0.07);border:1px solid rgba(255,69,0,0.2);border-radius:12px;padding:1rem;margin-bottom:1rem">
  <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;font-family:'Orbitron',sans-serif;font-size:0.75rem;letter-spacing:0.05em">
    <span style="color:#FF4500">Pyrus Dragonoid</span>
    <span style="color:var(--text-secondary)">→</span>
    <span style="color:#FF4500">Neo Dragonoid</span>
    <span style="color:var(--text-secondary)">→</span>
    <span style="color:#FF6600">Cross Dragonoid</span>
    <span style="color:var(--text-secondary)">→</span>
    <span style="color:#FF8800">Helix Dragonoid</span>
    <span style="color:var(--text-secondary)">→</span>
    <span style="color:#FFB700">Lumino Dragonoid</span>
  </div>
</div>
<p>Drago ממשיך להתפתח לאורך כל העונה. Neo Dragonoid, האבולוציה הראשונה, מציגה גוף גדול יותר ועוצמה רבה יותר. Cross Dragonoid מוסיפה שיריון כבד. Helix Dragonoid – אבולוציה ספירלית עם כנפיים מפוארות.</p>

<h2>⚡ Helios – הבקוגן הקיברנטי</h2>
<img src="https://bakugan.wiki/images/d/d3/Viper_helios.png" onerror="this.style.display='none'" alt="Helios" loading="lazy" style="max-width:280px;width:100%;border-radius:10px;margin-bottom:0.75rem;border:2px solid rgba(255,100,0,0.4);display:block">
<p><strong>בעלים:</strong> Spectra Phantom (Keith Clay) | <strong>G-Power:</strong> 900→1600</p>
<p>Helios הוא הבקוגן האייקוני של העונה השנייה – יריבו הנצחי של Drago. Viper Helios הוא האבולוציה הקיברנטית שלו עם שינויים טכנולוגיים שמעניקים לו כוחות חדשים. Cyborg Helios MK2 הוא השיא. בסוף הסדרה, Keith עובר לצד הטוב ו-Helios הופך לשותף אמיתי.</p>

<h2>🦹 ה-Vexos – ארגון הנבלים</h2>
<div class="char-grid-wiki" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-pyrus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">SPECTRA</div>
    <div class="char-mini-owner" style="font-size:0.75rem">Spectra Phantom</div>
    <div class="char-mini-gp">PYRUS · Helios</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-subterra" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">GUS GRAV</div>
    <div class="char-mini-owner" style="font-size:0.75rem">עוזרו של Spectra</div>
    <div class="char-mini-gp">SUBTERRA · Vulcan</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-darkus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">SHADOW PROVE</div>
    <div class="char-mini-owner" style="font-size:0.75rem">אכזרי</div>
    <div class="char-mini-gp">DARKUS · Hades</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-haos" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">VOLT LUSTER</div>
    <div class="char-mini-owner" style="font-size:0.75rem">חסר רחמים</div>
    <div class="char-mini-gp">HAOS · Boriates</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-ventus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">LYNC VOLAN</div>
    <div class="char-mini-owner" style="font-size:0.75rem">צעיר ומתלבט</div>
    <div class="char-mini-gp">VENTUS · Aluze</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-aquos" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">PRINCE HYDRON</div>
    <div class="char-mini-owner" style="font-size:0.75rem">נסיך Vexos</div>
    <div class="char-mini-gp">אוסף בקוגן אבן</div>
  </div>
</div>
<p><strong>King Zenoheld</strong> – מלך ה-Vexos ואביו של Prince Hydron. יצר את ה-Alternative Weapon System כדי להשמיד את כדור הארץ אם הבקוגן יסרבו לשתף פעולה.</p>

<h2>💡 הטוויסט הגדול של העונה</h2>
<div style="background:rgba(255,102,0,0.08);border:1px solid rgba(255,102,0,0.3);border-radius:12px;padding:1rem;margin:1rem 0">
  <strong style="color:var(--accent)">⚠️ ספוילר:</strong>
  <p style="margin-top:0.4rem">Spectra Phantom הוא <strong>Keith Clay</strong> – האח הגדול של Mira! הוא עזב את ה-Resistance ועבד עם ה-Vexos כדי להשיג את Helios ולפתח טכנולוגיה לשיפור בקוגן. בסוף הסדרה הוא מבין את טעותו וחוזר לצד הטוב.</p>
</div>

<h2>📖 קשתות העלילה</h2>
<ol>
  <li><strong>Arc 1 – הגילוי:</strong> דן מוצא את עצמו ב-New Vestroia ומצטרף ל-Resistance. הבקוגן החדשים (Percival, Ingram, Wilda, Nemus) מצטרפים לקבוצה.</li>
  <li><strong>Arc 2 – ה-Perfect Core:</strong> ה-Vexos מחפשים את Perfect Core כדי לאחד את כל האנרגיה. Spectra עוזב את ה-Vexos ופועל עצמאית.</li>
  <li><strong>Arc 3 – Alternative Weapon:</strong> King Zenoheld בונה נשק המוני. הקבוצה המאוחדת (כולל Spectra) נלחמת למנוע את השמדת כדור הארץ.</li>
</ol>

<h2>🎲 Special Treatment – גרסאות אספנות עונה 2</h2>
<p>עונה 2 הביאה את ה-Special Treatment System המורחב – גרסאות עם חומרים, זוהר ומנגנונים חדשים.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(100,200,255,0.12);border:1px solid rgba(100,200,255,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#64C8FF">BakuCore</strong><br><span style="font-size:0.7rem">ליבה מתכתית פנימית</span></div>
  <div style="background:rgba(180,100,50,0.12);border:1px solid rgba(180,100,50,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#B46432">Bronze</strong><br><span style="font-size:0.7rem">ציפוי ברונזה מוצק</span></div>
  <div style="background:rgba(160,80,40,0.12);border:1px solid rgba(160,80,40,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#A05028">Bronze Attack</strong><br><span style="font-size:0.7rem">ברונזה + מנגנון קפיצה</span></div>
  <div style="background:rgba(150,230,255,0.12);border:1px solid rgba(150,230,255,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#96E6FF">Crystal</strong><br><span style="font-size:0.7rem">קריסטל שקוף גבישי</span></div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#64C8FF">Flip</strong><br><span style="font-size:0.7rem">משנה תכונה</span></div>
  <div style="background:rgba(200,230,255,0.12);border:1px solid rgba(200,230,255,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#C8E6FF">Frost</strong><br><span style="font-size:0.7rem">כחול-קרחי קפוא</span></div>
  <div style="background:rgba(255,255,100,0.1);border:1px solid rgba(255,255,100,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#FFFF64">Glow</strong><br><span style="font-size:0.7rem">זוהר בחושך</span></div>
  <div style="background:rgba(200,200,150,0.1);border:1px solid rgba(200,200,150,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#C8C896">Lyte</strong><br><span style="font-size:0.7rem">קל במיוחד</span></div>
  <div style="background:rgba(0,200,50,0.1);border:1px solid rgba(0,200,50,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#00C832">BakuMutation</strong><br><span style="font-size:0.7rem">צבע משתנה</span></div>
  <div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#00F0FF">Neon</strong><br><span style="font-size:0.7rem">ניאון זוהר</span></div>
  <div style="background:rgba(150,150,200,0.12);border:1px solid rgba(150,150,200,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#9696C8">Steel</strong><br><span style="font-size:0.7rem">ציפוי פלדה מבריק</span></div>
  <div style="background:rgba(255,180,0,0.1);border:1px solid rgba(255,180,0,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#FFB400">Solar</strong><br><span style="font-size:0.7rem">צבעי שמש-לבה</span></div>
</div>
`, 2, 'seasons', 'https://bakugan.wiki/images/d/d3/Viper_helios.png', adminId);

  wikiInsert.run('season-3', 'עונה 3 – Gundalian Invaders', `
<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem">
  <div style="flex:1;min-width:220px">
    <h2 style="margin-bottom:0.4rem">⚡ Bakugan: Gundalian Invaders</h2>
    <p style="color:var(--text-secondary);font-size:0.85rem">2010 · 39 פרקים · TMS Entertainment / Nelvana</p>
  </div>
  <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
    <span style="background:rgba(155,0,255,0.15);border:1px solid rgba(155,0,255,0.4);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#9B00FF">עונה 3</span>
    <span style="background:rgba(0,136,255,0.1);border:1px solid rgba(0,136,255,0.3);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#0088FF">גלקטי</span>
  </div>
</div>
<p>המלחמה מגיעה לגלקסיה. שני כוכבי לכת זרים – <strong>Neathia</strong> (שלום) ו-<strong>Gundalia</strong> (מלחמה) – נלחמים זה בזה. גייסות גונדליה מגיעים לכדור הארץ ומגייסים ילדים אנושיים ללא ידיעתם. ה-Battle Brawlers נלחמים לצד ה-Neathians.</p>

<h2>👥 הדמויות</h2>
<div class="char-grid-wiki">
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-pyrus"></div>
      <img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Lumino Dragonoid" loading="lazy">
    </div>
    <div class="char-mini-name">PYRUS</div>
    <div class="char-mini-owner">דן קוסו</div>
    <div class="char-mini-gp">Lumino Dragonoid</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-subterra"></div>
      <img src="https://bakugan.wiki/images/a/a6/BK_CD_Coredem.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Coredem" loading="lazy">
    </div>
    <div class="char-mini-name">SUBTERRA</div>
    <div class="char-mini-owner">ג'ייק</div>
    <div class="char-mini-gp">Coredem · G: 900</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-darkus"></div>
      <img src="https://bakugan.wiki/images/d/de/BK_Linehalt.png" class="char-mini-img" onerror="this.style.display='none'" alt="Linehalt" loading="lazy">
    </div>
    <div class="char-mini-name">DARKUS</div>
    <div class="char-mini-owner">Fabia</div>
    <div class="char-mini-gp">Linehalt · G: 800</div>
  </div>
</div>

<h2>👥 הדמויות החדשות</h2>
<div class="char-grid-wiki">
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-pyrus"></div>
      <img src="https://bakugan.wiki/images/6/6d/Dan_large.png" class="char-mini-img" onerror="this.style.display='none'" alt="Dan" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FF4500">PYRUS</div>
    <div class="char-mini-owner">דן קוסו</div>
    <div class="char-mini-gp">Lumino Dragonoid</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-subterra"></div>
      <img src="https://bakugan.wiki/images/a/a6/BK_CD_Coredem.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Coredem" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#CC6600">SUBTERRA</div>
    <div class="char-mini-owner">Jake Vallory</div>
    <div class="char-mini-gp">Coredem · G: 900</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-haos"></div>
      <img src="https://bakugan.wiki/images/c/c4/BK_CD_Skyress.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Aranaut" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FFD700">HAOS</div>
    <div class="char-mini-owner">Fabia Sheen</div>
    <div class="char-mini-gp">Aranaut · G: 850</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-darkus"></div>
      <img src="https://bakugan.wiki/images/d/de/BK_Linehalt.png" class="char-mini-img" onerror="this.style.display='none'" alt="Linehalt" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#9B00FF">DARKUS</div>
    <div class="char-mini-owner">Ren Krawler</div>
    <div class="char-mini-gp">Linehalt · G: 800</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-ventus"></div>
      <img src="https://bakugan.wiki/images/6/66/ShunCN.png" class="char-mini-img" onerror="this.style.display='none'" alt="Shun" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#00CC44">VENTUS</div>
    <div class="char-mini-owner">שון קאזאמי</div>
    <div class="char-mini-gp">Hawktor · G: 800</div>
  </div>
</div>

<h2>🐉 הבקוגנים</h2>

<h3>🔥 Lumino Dragonoid → Blitz Dragonoid</h3>
<p><strong>G-Power:</strong> 1100→1200+ | דן קוסו</p>
<p>Drago עם כוחות אור ואש משולבים. כנפיים גדולות ואור מסנוור. Blitz Dragonoid – גרסה מהירה וחזקה עוד יותר. ה-Sacred Orb מעניק לו את הכוח הסופי.</p>

<h3>🌑 Linehalt – Darkus ו-Forbidden Power</h3>
<img src="https://bakugan.wiki/images/d/de/BK_Linehalt.png" onerror="this.style.display='none'" alt="Linehalt" loading="lazy" style="max-width:220px;width:100%;border-radius:10px;margin-bottom:0.6rem;border:2px solid rgba(155,0,255,0.4);display:block">
<p><strong>G-Power:</strong> 800 | Ren Krawler</p>
<p>Linehalt הוא בקוגן ה-Darkus הייחודי ביותר. הוא מחזיק ב-<strong>Forbidden Power</strong> – כוח שכל כך אדיר עד שמשתמש בו מסכן את עצמו. Bairagon הוא הבקוגן הנוסף של Ren.</p>

<h3>✨ Aranaut – Haos (Fabia)</h3>
<p><strong>G-Power:</strong> 850 | Fabia Sheen – נסיכת Neathia</p>
<p>Aranaut הוא שומר של Neathia. הוא לוחם חזק ונאמן שמגן על המלכה ועל העם שלו. טיפוס אצילי ורציני.</p>

<h2>🦹 שנים-עשר הפקודות – Twelve Orders</h2>
<div class="char-grid-wiki" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-darkus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">BARODIUS</div>
    <div class="char-mini-owner" style="font-size:0.75rem">מלך גונדליה</div>
    <div class="char-mini-gp">DARKUS · Dharak</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-haos" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">KAZARINA</div>
    <div class="char-mini-owner" style="font-size:0.75rem">מדענית רשעה</div>
    <div class="char-mini-gp">HAOS · Lumagrowl</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-aquos" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">STOICA</div>
    <div class="char-mini-owner" style="font-size:0.75rem">אכזרי</div>
    <div class="char-mini-gp">AQUOS · Lythirus</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-pyrus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">GILL</div>
    <div class="char-mini-owner" style="font-size:0.75rem">גנרל Pyrus</div>
    <div class="char-mini-gp">PYRUS · Krakix</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-ventus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">AIRZEL</div>
    <div class="char-mini-owner" style="font-size:0.75rem">גנרל Ventus</div>
    <div class="char-mini-gp">VENTUS · Strikeflier</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-darkus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="font-size:0.65rem">REN KRAWLER</div>
    <div class="char-mini-owner" style="font-size:0.75rem">סייל כפול</div>
    <div class="char-mini-gp">DARKUS · Linehalt</div>
  </div>
</div>

<h2>💡 הטוויסט הגדול</h2>
<div style="background:rgba(155,0,255,0.08);border:1px solid rgba(155,0,255,0.3);border-radius:12px;padding:1rem;margin:1rem 0">
  <strong style="color:#9B00FF">⚠️ ספוילר:</strong>
  <p style="margin-top:0.4rem">Ren Krawler הגיע לכדור הארץ בתואנה שבקוגן Neathia הם האויבים. האמת: הוא עבד עבור Barodius ואמצעי שקרי לגייס את ה-Battle Brawlers. כשהוא מגלה שמשפחתו על Gundalia בסכנה ושBarodius משקר לכולם – הוא עובר לצד Neathia.</p>
</div>

<h2>📖 קשתות העלילה</h2>
<ol>
  <li><strong>Arc 1 – גיוס:</strong> Ren מגייס שחקנים אנושיים לצבא גונדליה תוך שקר. Jake, חבר של דן, נגוע בשליטה מנטלית.</li>
  <li><strong>Arc 2 – Neathia:</strong> Fabia חושפת את האמת. ה-Battle Brawlers נוסעים ל-Neathia ומגנים על ה-Sacred Orb.</li>
  <li><strong>Arc 3 – גמר:</strong> הקרב הסופי מול Barodius ו-Dharak על Sacred Orb. Code Eve מתגלה כישות שמחזיקה בכוח של כל הבקוגן.</li>
</ol>

<h2>🎲 Special Treatment – גרסאות אספנות עונה 3</h2>
<p>עונה 3 הציגה את ה-Baku prefix system – שמות מיוחדים לכל סוג גרסה.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(0,100,255,0.12);border:1px solid rgba(0,100,255,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#0064FF">BakuBlue</strong><br><span style="font-size:0.7rem">גרסה כחולה מיוחדת</span></div>
  <div style="background:rgba(100,120,80,0.12);border:1px solid rgba(100,120,80,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#647850">BakuCamo</strong><br><span style="font-size:0.7rem">צבעי הסוואה</span></div>
  <div style="background:rgba(150,100,50,0.12);border:1px solid rgba(150,100,50,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#966432">BakuExo-Skin</strong><br><span style="font-size:0.7rem">עור חיצוני מיוחד</span></div>
  <div style="background:rgba(120,100,80,0.12);border:1px solid rgba(120,100,80,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#786450">BakuGranite</strong><br><span style="font-size:0.7rem">טקסטורת גרניט</span></div>
  <div style="background:rgba(150,150,200,0.12);border:1px solid rgba(150,150,200,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#9696C8">BakuMetalix</strong><br><span style="font-size:0.7rem">ציפוי מתכתי</span></div>
  <div style="background:rgba(50,0,80,0.2);border:1px solid rgba(100,0,150,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#AA00CC">BakuShadow</strong><br><span style="font-size:0.7rem">גרסת צל חשוכה</span></div>
  <div style="background:rgba(100,200,100,0.1);border:1px solid rgba(100,200,100,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#64C864">BakuStand</strong><br><span style="font-size:0.7rem">עם בסיס עמידה</span></div>
  <div style="background:rgba(180,50,50,0.12);border:1px solid rgba(180,50,50,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#B43232">Crimson &amp; Pearl</strong><br><span style="font-size:0.7rem">ארגמן ופנינה</span></div>
  <div style="background:rgba(100,0,150,0.15);border:1px solid rgba(150,0,200,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#AA00EE">Evil Twin</strong><br><span style="font-size:0.7rem">תאום רשע – חבילה כפולה</span></div>
  <div style="background:rgba(200,200,200,0.08);border:1px solid rgba(200,200,200,0.2);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#DDDDDD">Translucent</strong><br><span style="font-size:0.7rem">שקוף למחצה</span></div>
</div>
`, 3, 'seasons', 'https://bakugan.wiki/images/1/1b/BK_CD_Naga_2.jpg', adminId);

  wikiInsert.run('season-4', 'עונה 4 – Mechtanium Surge', `
<div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem">
  <div style="flex:1;min-width:220px">
    <h2 style="margin-bottom:0.4rem">⚙️ Bakugan: Mechtanium Surge</h2>
    <p style="color:var(--text-secondary);font-size:0.85rem">2011–2012 · 46 פרקים · TMS Entertainment / Nelvana</p>
  </div>
  <div style="display:flex;gap:0.6rem;flex-wrap:wrap">
    <span style="background:rgba(255,215,0,0.15);border:1px solid rgba(255,215,0,0.4);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#FFD700">עונה 4</span>
    <span style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:20px;padding:0.2rem 0.7rem;font-size:0.78rem;color:#FF4500">סיום</span>
  </div>
</div>
<p>העונה הרביעית והסופית של הסדרה הקלאסית. מוצגות ישויות ענק חדשות – <strong>Mechtogan</strong> – שנולדות מהרגש של הבקוגן. האנטגוניסט Mag Mel מאיים על כל היקום.</p>

<h2>🤖 מהו Mechtogan?</h2>
<div style="background:rgba(255,102,0,0.07);border:1px solid rgba(255,102,0,0.25);border-radius:12px;padding:1rem;margin-bottom:1rem">
  <p>כשבקוגן חזק מאוד לוחם בתשוקה וברגש עז, הוא משחרר אנרגיה כה אדירה עד שנולדת ישות עצמאית – <strong>Mechtogan</strong>. ה-Mechtogan הוא ענק קרבי שפועל לפי רצון הבקוגן שלו, אך לפעמים יוצא משליטה.</p>
</div>
<div class="char-grid-wiki" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-pyrus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="color:#FF4500">ZENTHON</div>
    <div class="char-mini-owner">של Titanium Dragonoid</div>
    <div class="char-mini-gp">ענק כנפי דרקון</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-ventus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="color:#00CC44">JAAKOR</div>
    <div class="char-mini-owner">של Taylean</div>
    <div class="char-mini-gp">מהיר וחד</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-darkus" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="color:#9B00FF">SILENT STRIKE</div>
    <div class="char-mini-owner">Mag Mel</div>
    <div class="char-mini-gp">Chaos Mechtogan</div>
  </div>
  <div class="char-mini">
    <div class="ball-mini bk-ball bk-ball-subterra" style="width:50px;height:50px;margin:0 auto 0.4rem"></div>
    <div class="char-mini-name" style="color:#CC6600">TREMBLAR</div>
    <div class="char-mini-owner">של Boulderon</div>
    <div class="char-mini-gp">קרקע ורעידות</div>
  </div>
</div>

<h2>👥 הדמויות – עונה 4</h2>
<div class="char-grid-wiki">
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-pyrus"></div>
      <img src="https://bakugan.wiki/images/6/6d/Dan_large.png" class="char-mini-img" onerror="this.style.display='none'" alt="Dan" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FF4500">PYRUS</div>
    <div class="char-mini-owner">דן קוסו</div>
    <div class="char-mini-gp">Titanium Dragonoid</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-ventus"></div>
      <img src="https://bakugan.wiki/images/6/66/ShunCN.png" class="char-mini-img" onerror="this.style.display='none'" alt="Shun" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#00CC44">VENTUS</div>
    <div class="char-mini-owner">שון קאזאמי</div>
    <div class="char-mini-gp">Taylean · G: 1000</div>
  </div>
  <div class="char-mini">
    <div class="char-mini-img-wrap">
      <div class="ball-mini bk-ball bk-ball-haos"></div>
      <img src="https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg" class="char-mini-img" onerror="this.style.display='none'" alt="Runo" loading="lazy">
    </div>
    <div class="char-mini-name" style="color:#FFD700">HAOS</div>
    <div class="char-mini-owner">מרוסה</div>
    <div class="char-mini-gp">Krowll · G: 950</div>
  </div>
</div>

<h2>🐉 Titanium Dragonoid → Fusion Dragonoid</h2>
<img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="Fusion Dragonoid" loading="lazy" style="max-width:280px;width:100%;border-radius:10px;margin-bottom:0.75rem;border:2px solid rgba(255,100,0,0.5);display:block">
<p><strong>G-Power:</strong> 1200→1500+ | דן קוסו</p>
<p>שיא האבולוציה של Drago – <strong>Titanium Dragonoid</strong> משוריין בטיטניום עם כוחות האש החזקים ביותר. <strong>Fusion Dragonoid</strong> היא האבולוציה הסופית והאחרונה שלו – מאחד את כל כוחות הקודמות ומסמל את הסיום של הסדרה.</p>

<div style="background:rgba(255,69,0,0.07);border:1px solid rgba(255,69,0,0.2);border-radius:12px;padding:1rem;margin-bottom:1rem">
  <div style="font-family:'Orbitron',sans-serif;font-size:0.72rem;letter-spacing:0.05em;margin-bottom:0.5rem;color:var(--accent)">שרשרת האבולוציה המלאה של Drago</div>
  <div style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;font-size:0.75rem">
    <span style="color:#FF4500">Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Delta Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Ultimate Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Infinity Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Neo Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Cross Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Helix Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Lumino Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Blitz Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span>Titanium Dragonoid</span><span style="color:var(--text-muted)">→</span>
    <span style="color:#FFD700;font-weight:700">Fusion Dragonoid</span>
  </div>
</div>

<h2>🦹 Mag Mel ו-Razenoid</h2>
<div style="background:rgba(155,0,255,0.08);border:1px solid rgba(155,0,255,0.3);border-radius:12px;padding:1rem;margin:1rem 0">
  <p><strong style="color:#9B00FF">Mag Mel</strong> הוא ישות עתיקה שנוצרה מה-Sacred Orb. הוא ניזון מהקשר בין דן ל-Drago – כל פעם שהם לוחמים, Mag Mel מתחזק. <strong>Razenoid</strong> הוא הבקוגן שלו – אחד החזקים בכל הסדרה.</p>
  <p style="margin-top:0.4rem"><strong>הסוד הגדול:</strong> Mag Mel הוא למעשה <strong>Emperor Barodius</strong> מהעונה השלישית – לאחר שנגע ב-Sacred Orb ב-Arc 2, הוא נמחק ואוחזר כישות כוח טהורה.</p>
</div>

<h2>📖 קשתות העלילה</h2>
<ol>
  <li><strong>Arc 1 – Chaos Bakugan:</strong> בקוגן כאוטי בלתי נשלט מפציעים מכל מקום. דן מתמודד לבד כי הוא חושש לפגוע בחבריו. Zenthon יוצא משליטה.</li>
  <li><strong>Arc 2 – Mag Mel:</strong> Mag Mel מתחזק. דן מגלה את הקשר ביניהם. הקבוצה המאוחדת יוצאת לקרב הסופי. Fusion Dragonoid מחסל את Mag Mel לנצח.</li>
</ol>

<h2>🎬 סיום הסדרה</h2>
<p>בסצנה הסופית, דן ו-Drago נפרדים לזמן מה – Drago חוזר ל-Vestroia עם בקוגן נוספים כדי לשמור על האיזון. דן ממשיך בחייו, ידוע שחברו שם תמיד. זהו אחד הסיומים הנוגעים ביותר בהיסטוריה של אנימה לילדים.</p>

<h2>🏆 הירושה של הסדרה</h2>
<ul>
  <li>4 עונות, 154 פרקים סה"כ (מקורי + Mechtanium Surge)</li>
  <li>המשחק נמכר ב-600+ מיליון יחידות ברחבי העולם</li>
  <li>הסדרה חזרה ב-2018 כ-Bakugan Battle Planet (Reboot)</li>
  <li>בישראל הסדרה הוקרנה בערוץ דיסני עם דיבוב מלא לעברית</li>
  <li>Drago הוא אחד הדמויות האהובות ביותר בקרב ילדי שנות ה-2000</li>
</ul>

<h2>🎲 Special Treatment – גרסאות אספנות עונה 4</h2>
<p>העונה הסופית הביאה גרסאות דרמטיות ביותר – שמות כמו Lava Storm ו-Cyclone Strike שמשקפים את אופי הסדרה.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(100,120,80,0.12);border:1px solid rgba(100,120,80,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#647850">Baku Camo Surge</strong><br><span style="font-size:0.7rem">גל הסוואה</span></div>
  <div style="background:rgba(0,150,255,0.12);border:1px solid rgba(0,150,255,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#0096FF">Baku Cyclone Strike</strong><br><span style="font-size:0.7rem">מכת ציקלון</span></div>
  <div style="background:rgba(20,0,40,0.2);border:1px solid rgba(80,0,120,0.4);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#AA44FF">BakuEclipse</strong><br><span style="font-size:0.7rem">ליקוי חמה מסתורי</span></div>
  <div style="background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#FFD700">BakuGold</strong><br><span style="font-size:0.7rem">ציפוי זהב יוקרתי</span></div>
  <div style="background:rgba(255,80,0,0.12);border:1px solid rgba(255,80,0,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#FF5000">Baku Lava Storm</strong><br><span style="font-size:0.7rem">סופת לבה</span></div>
  <div style="background:rgba(60,60,80,0.2);border:1px solid rgba(100,100,150,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#AAAACC">BakuPhantom</strong><br><span style="font-size:0.7rem">גרסת רוח רפאים</span></div>
  <div style="background:rgba(255,255,0,0.1);border:1px solid rgba(255,255,0,0.3);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#FFFF00">BakuSpark</strong><br><span style="font-size:0.7rem">ניצוץ חשמלי</span></div>
  <div style="background:rgba(200,50,50,0.12);border:1px solid rgba(200,50,50,0.35);border-radius:8px;padding:0.6rem;text-align:center;font-size:0.79rem"><strong style="color:#C83232">Combat</strong><br><span style="font-size:0.7rem">גרסת קרב מיוחדת</span></div>
</div>
`, 4, 'seasons', 'https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg', adminId);

  // ═══════════════════════════════════════
  //  CHARACTER WIKI PAGES
  // ═══════════════════════════════════════

  // ──── Season 1 ────

  wikiInsert.run('char-dan', 'דן קוסו – הלוחם הראשי', `
<img src="https://bakugan.wiki/images/f/f7/Bakugan_Dan.png" onerror="this.src='https://bakugan.wiki/images/6/6d/Dan_large.png';this.onerror=null" alt="דן קוסו" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FF4500">🔥 Pyrus – אש</td></tr>
    <tr><td>🐉 בקוגן</td><td>Dragonoid (Drago)</td></tr>
    <tr><td>⚔️ תפקיד</td><td>גיבור ראשי</td></tr>
    <tr><td>📺 עונות</td><td>1, 2, 3, 4</td></tr>
    <tr><td>💪 G-Power</td><td>640 → 1500+</td></tr>
    <tr><td>🏠 מוצא</td><td>יפן, כדור הארץ</td></tr>
  </table>
</div>
<p>דן קוסו הוא גיבור הסדרה – נער חם-לב, אימפולסיבי ונלהב מ-Bakugan. הוא מגלה שהבקוגן שלו, <strong>Drago</strong>, הוא יצור חי ממד מקביל בשם Vestroia, וזאת תחילתה של הרפתקאה אפית שתשנה את חייו לנצח.</p>
<p>דן לומד מכל קרב ולא מוותר גם כשהמצב נראה אבוד. הכוח שלו נובע מהקשר העמוק עם Drago – שניהם גדלים יחד כשותפים שוויוניים.</p>
<h2>🔥 Drago – הבקוגן שלו</h2>
<img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="Drago" loading="lazy" class="wiki-char-img" style="max-width:260px">
<p>שרשרת האבולוציה של Drago לאורך 4 עונות:</p>
<div style="background:rgba(255,69,0,0.07);border:1px solid rgba(255,69,0,0.2);border-radius:10px;padding:0.75rem;font-size:0.79rem;margin:0.75rem 0;font-family:'Orbitron',sans-serif;letter-spacing:0.02em;line-height:2">
  Dragonoid → Delta Dragonoid → Ultimate Dragonoid → Infinity Dragonoid (S1)<br>
  → Neo → Cross → Helix → Lumino → Blitz (S2-S3)<br>
  → <strong style="color:#FFD700">Titanium → Fusion Dragonoid</strong> (S4)
</div>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מגלה ש-Drago הוא יצור חי בפרק הפתיחה</li>
  <li>מוביל את ה-Battle Brawlers נגד Masquerade ו-Naga</li>
  <li>נוסע ל-New Vestroia ומקים את ה-Resistance</li>
  <li>נלחם מול Barodius בעונה 3 ומגן על Sacred Orb</li>
  <li>הפרידה הנוגעת ביותר מ-Drago בסצנה הסופית</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Drago</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Drago קיבל גרסאות Special Treatment בכל דורות הסדרה – מ-Clear S1 ועד BakuGold S4.
  <a href="/wiki?page=char-drago" style="color:var(--accent);font-weight:700">← ראה דף Drago</a>
</div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/6/6d/Dan_large.png', adminId);

  wikiInsert.run('char-drago', 'Dragonoid – Drago', `
<img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="Drago" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FF4500">🔥 Pyrus – אש</td></tr>
    <tr><td>👤 בעלים</td><td>דן קוסו</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>1, 2, 3, 4</td></tr>
    <tr><td>💪 G-Power</td><td>640 → 1500+</td></tr>
    <tr><td>🏠 מוצא</td><td>Vestroia</td></tr>
  </table>
</div>
<p><strong>Drago</strong> (Dragonoid) הוא הבקוגן האייקוני ביותר בכל הסדרה – שומר הדרגון ממד Vestroia. נשמה אצילית ונחושה שמסרבת לאפשר לרוע לנצח. הקשר שלו עם דן הוא לב ורוח הסדרה כולה.</p>
<h2>🔥 שרשרת האבולוציה המלאה</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:0.4rem;margin-bottom:1rem">
  <div style="background:rgba(255,69,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FF4500">1. Pyrus Dragonoid</strong><br>G: 640 · עונה 1</div>
  <div style="background:rgba(255,80,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FF5500">2. Delta Dragonoid</strong><br>G: 800 · עונה 1</div>
  <div style="background:rgba(255,90,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FF6600">3. Ultimate Dragonoid</strong><br>G: 1000 · עונה 1</div>
  <div style="background:rgba(255,100,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FF8800">4. Infinity Dragonoid</strong><br>G: 1200 · עונה 1</div>
  <div style="background:rgba(255,120,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FF9900">5. Neo Dragonoid</strong><br>G: 1000 · עונה 2</div>
  <div style="background:rgba(255,140,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FFAA00">6. Helix Dragonoid</strong><br>G: 1100 · עונה 2</div>
  <div style="background:rgba(255,160,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FFBB00">7. Lumino Dragonoid</strong><br>G: 1200 · עונה 3</div>
  <div style="background:rgba(255,180,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FFCC00">8. Blitz Dragonoid</strong><br>G: 1300 · עונה 3</div>
  <div style="background:rgba(255,200,0,0.1);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FFDD00">9. Titanium Dragonoid</strong><br>G: 1400 · עונה 4</div>
  <div style="background:rgba(255,215,0,0.15);border:1px solid rgba(255,215,0,0.5);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.76rem"><strong style="color:#FFD700">✨ Fusion Dragonoid</strong><br>G: 1500+ · עונה 4</div>
</div>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Dragon Blade</strong> – חרב אש מבהיקה</li>
  <li><strong>Burning Dragon</strong> – גל אש ישיר</li>
  <li><strong>Pyrus Fusion</strong> – פיוז'ן של כל כוחות האש</li>
  <li><strong>Fire Tornado</strong> – סופת-אש ספירלית</li>
</ul>
<h2>🌟 הקשר עם דן</h2>
<p>מ-Drago שלא מאמין בבני-אדם בתחילת עונה 1, ועד הפרידה הנוגעת בסיום עונה 4 – הם גדלו יחד כשותפים אמיתיים. הקשר הזה הוא מה שנותן לכל הסדרה את המשמעות שלה.</p>

<h2>🃏 קלפי כוח (Ability Cards)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(255,69,0,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Fire Wall</td><td style="padding:0.35rem 0.7rem">חומת אש – מגן מפני מתקפות</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Fire Tornado</td><td style="padding:0.35rem 0.7rem">סופת-אש – +200 G</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Dragon Blade</td><td style="padding:0.35rem 0.7rem">חרב דרקון – +300 G</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Ultimate Dragon</td><td style="padding:0.35rem 0.7rem">+200 G, מבטל את קלף ה-Gate של היריב</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Dextra Attack</td><td style="padding:0.35rem 0.7rem">שילוב שש-תכונות – עוצמת-על</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Dragon Astral</td><td style="padding:0.35rem 0.7rem">+500 G (Fusion Dragonoid)</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Dragon Eternal Force</td><td style="padding:0.35rem 0.7rem">מבטל את כל כוחות היריב</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<p>Special Treatment הן גרסאות אספנות מיוחדות של Dragonoid שיצאו לאורך כל דורות הסדרה. כל גרסה שונה בצבע, חומר, או G-Power מהמהדורה הרגילה.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">Clear</strong><br>שקוף · Pyrus · 450G</div>
  <div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFAA00">Pearl</strong><br>פנינה מבהיקה · 480G</div>
  <div style="background:rgba(200,200,200,0.1);border:1px solid rgba(200,200,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#CCCCCC">Translucent</strong><br>שקוף למחצה · 500G</div>
  <div style="background:rgba(255,69,0,0.08);border:1px solid rgba(255,69,0,0.2);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF6600">Dual Attribute</strong><br>שני צבעים · נדיר</div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>ליבה מתכתית · S2</div>
  <div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>גרסת פלדה · S2</div>
  <div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#B46432">Bronze</strong><br>גרסת ברונזה · S2</div>
  <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">BakuGold</strong><br>גרסת זהב · S4</div>
</div>
<div style="clear:both"></div>
`, 1, 'bakugan', 'https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg', adminId);

  wikiInsert.run('char-runo', 'ראונו מיסאקי', `
<img src="https://bakugan.wiki/images/c/cc/Image3.png" onerror="this.style.display='none'" alt="ראונו מיסאקי" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FFD700">✨ Haos – אור</td></tr>
    <tr><td>🐉 בקוגן</td><td>Tigrerra / Blade Tigrerra</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Battle Brawler</td></tr>
    <tr><td>📺 עונות</td><td>1, 2, 4</td></tr>
    <tr><td>💪 G-Power</td><td>450 → 1000</td></tr>
    <tr><td>🏠 מוצא</td><td>יפן</td></tr>
  </table>
</div>
<p>ראונו מיסאקי היא אחת הלוחמות החזקות ביותר ב-Battle Brawlers – ישירה, נחרצת ולא מפחדת לומר מה היא חושבת, אפילו כשזה לדן. היא עובדת בבית הקפה של הוריה ולוחמת בכל ליבה.</p>
<p>הרומנטיקה בין ראונו לדן מתפתחת לאורך הסדרה ומוסיפה ממד רגשי חשוב לעלילה.</p>
<h2>✨ Tigrerra – Blade Tigrerra</h2>
<img src="https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg" onerror="this.style.display='none'" alt="Tigrerra" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Tigrerra היא חתולת Haos – ייצוג של אמונה ונאמנות. <strong>Blade Tigrerra</strong> – האבולוציה עם להבים מבריקים. G-Power 450→1000. הנאמנות של Tigrerra לראונו אין כמוה.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מגינה על עצמה ועל דן מ-Masquerade בקרבות קריטיים</li>
  <li>Tigrerra מתפתחת ל-Blade Tigrerra בקרב שבו ראונו מסרבת לסגת</li>
  <li>ראונו מוסרת את Tigrerra כדי לעזור לדן להגיע ל-Vestroia – קרבן גדול</li>
  <li>חוזרת ב-Mechtanium Surge עם Krowll</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Tigrerra</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Tigrerra קיבלה גרסאות BakuCore, BakuGlow, BakuFrost ו-Clear לאורך עונה 1.
  <a href="/wiki?page=char-tigrerra" style="color:var(--accent);font-weight:700">← ראה דף Tigrerra</a>
</div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg', adminId);

  wikiInsert.run('char-marucho', 'מרוסה מארוקורה', `
<img src="https://bakugan.wiki/images/9/9c/Marucho_2.jpg" onerror="this.style.display='none'" alt="מרוסה מארוקורה" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#0088FF">💧 Aquos – מים</td></tr>
    <tr><td>🐉 בקוגן</td><td>Preyas / Elfin / Akwimos</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Battle Brawler – האסטרטג</td></tr>
    <tr><td>📺 עונות</td><td>1, 2, 3, 4</td></tr>
    <tr><td>💪 G-Power</td><td>490 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>יפן</td></tr>
  </table>
</div>
<p>מרוסה מארוקורה הוא הצעיר והחכם ביותר בקבוצה – ממשפחה עשירה מאוד, אך פשוט ולא מתנשא. הוא האסטרטג של ה-Battle Brawlers – מנתח כל קרב בקור-רוח וחושב כמה צעדים קדימה.</p>
<p>לאורך הסדרה, מרוסה גדל מנער צעיר וחסר-ביטחון ללוחם מנוסה ובטוח בעצמו – אחת הצמיחות האישיות הבולטות ביותר בסדרה.</p>
<h2>💧 Preyas – הבקוגן הייחודי</h2>
<img src="https://bakugan.wiki/images/6/66/BK_CD_Preyas.jpg" onerror="this.style.display='none'" alt="Preyas" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Preyas הוא הבקוגן הייחודי שמסוגל לשנות תכונה! <strong>Preyas Angelo</strong> (Haos) ו-<strong>Preyas Diablo</strong> (Darkus). ב-New Vestroia – <strong>Elfin</strong> (Aquos), ובגונדליה – <strong>Akwimos</strong>.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מחכה לדן ולרוסה בעוד שנסעו ל-Vestroia</li>
  <li>הופך למנהיג ה-Battle Brawlers ב-New Vestroia</li>
  <li>מוביל הגנה כשדן לא זמין</li>
  <li>מציל חברים מסכנה קריטית בעונה 3</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Preyas</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Preyas קיבל גרסאות Aquos מיוחדות כולל Angelo/Diablo Split Preyas.
  <a href="/wiki?page=char-preyas" style="color:var(--accent);font-weight:700">← ראה דף Preyas</a>
</div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/6/66/BK_CD_Preyas.jpg', adminId);

  wikiInsert.run('char-shun', 'שון קאזאמי', `
<img src="https://bakugan.wiki/images/6/66/ShunCN.png" onerror="this.style.display='none'" alt="שון קאזאמי" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#00CC44">🌪️ Ventus – רוח</td></tr>
    <tr><td>🐉 בקוגן</td><td>Skyress / Ingram / Hawktor / Taylean</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Battle Brawler – הנינג'ה</td></tr>
    <tr><td>📺 עונות</td><td>1, 2, 3, 4</td></tr>
    <tr><td>💪 G-Power</td><td>510 → 1100+</td></tr>
    <tr><td>🏠 מוצא</td><td>יפן</td></tr>
  </table>
</div>
<p>שון קאזאמי הוא הנינג'ה השקט של הקבוצה – Sprinting Master ולוחם מיומן ביותר. שמרן ואסטרטגי, לעתים נוקט עמדה עצמאית. מהיר, מדויק ובלתי צפוי – בדיוק כמו הרוח.</p>
<p>שון גדל תחת הדרכת סבו, נינג'ה עתיק. הכמיהה לחופש ואי-תלות משתקפת בכל Ventus Bakugan שמלווה אותו.</p>
<h2>🌪️ הבקוגן של שון לאורך הסדרה</h2>
<img src="https://bakugan.wiki/images/c/c4/BK_CD_Skyress.jpg" onerror="this.style.display='none'" alt="Skyress" loading="lazy" class="wiki-char-img" style="max-width:240px">
<ul>
  <li><strong>Storm Skyress</strong> (עונה 1) – ציפור Ventus גאה. G: 510→1050</li>
  <li><strong>Master Ingram</strong> (עונה 2) – Ventus נינג'ה. G: 800→1050</li>
  <li><strong>Hawktor</strong> (עונה 3) – G: 800</li>
  <li><strong>Taylean</strong> (עונה 4) – G: 1000</li>
</ul>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>עוזב את הקבוצה בעונה 1 בעקבות ויכוח עם דן – ואז חוזר</li>
  <li><strong>Skyress מוסרת את עצמה</strong> כדי להציל שון – סצנה נוגעת ביותר</li>
  <li>מנהיג את הקבוצה בהיעדר דן</li>
  <li>Taylean מ-Vestroia מגיע לשון בעונה 4</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Skyress</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Skyress וMaster Ingram קיבלו גרסאות BakuCore, BakuGlow ו-BakuWing מיוחדות.
  <a href="/wiki?page=char-skyress" style="color:var(--accent);font-weight:700">← ראה דף Skyress</a>
</div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/6/66/ShunCN.png', adminId);

  wikiInsert.run('char-julie', 'ג\'ולי מקימוטו', `
<img src="https://bakugan.wiki/images/c/c3/Julie.png" onerror="this.style.display='none'" alt="ג'ולי מקימוטו" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#CC6600">🪨 Subterra – אדמה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Gorem / Stone Gorem</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Battle Brawler</td></tr>
    <tr><td>📺 עונות</td><td>1, 4</td></tr>
    <tr><td>💪 G-Power</td><td>600 → 1000</td></tr>
    <tr><td>🏠 מוצא</td><td>אוסטרליה</td></tr>
  </table>
</div>
<p>ג'ולי מקימוטו היא הקולנית והאנרגטית ביותר בקבוצה – נערה אוסטרלית עם חיוך תמידי ושאיפות להיות מודל. קולנית, חמימה ומצחיקה, אך בקרב – קשה כסלע בדיוק כמו Gorem שלה.</p>
<h2>🪨 Stone Gorem</h2>
<img src="https://bakugan.wiki/images/c/cf/BK_CD_Gorem.jpg" onerror="this.style.display='none'" alt="Gorem" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Gorem הוא ענק האדמה – הגדול ביותר בקבוצה. <strong>Stone Gorem</strong> – האבולוציה עם שריון כבד. G-Power 1000. ישיר ועצמתי, ממש כמו ג'ולי.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מצטרפת לקבוצה דרך קשר אינטרנטי עם דן</li>
  <li>נלחמת כנגד Billy (חברה) שנמצא תחת שליטת Masquerade</li>
  <li>Gorem ו-Tigrerra בקרב Tag Battle נגד שני נבלים</li>
  <li>חוזרת ב-Mechtanium Surge</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Gorem</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Gorem קיבל גרסאות Subterra מיוחדות כולל Bronze ו-BakuCore.
  <a href="/wiki?page=char-gorem" style="color:var(--accent);font-weight:700">← ראה דף Gorem</a>
</div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/c/cf/BK_CD_Gorem.jpg', adminId);

  wikiInsert.run('char-alice', 'אליס גהביץ\' / Masquerade', `
<img src="https://bakugan.wiki/images/c/c3/AliceTransparentSmall.png" onerror="this.style.display='none'" alt="אליס גהביץ'" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Alpha Hydranoid</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Battle Brawler / Masquerade</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>600 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>רוסיה</td></tr>
  </table>
</div>
<p>אליס גהביץ' היא הסוד הגדול ביותר של עונה 1. מבחוץ – נערה רוסייה רגישה ורגועה, חברה טובה לקבוצה. אבל בתוכה מסתתרת אישיות שנייה – <strong>Masquerade</strong> – שנוצרה ממגע עם אנרגיית Naga.</p>
<p>אביה, הפרופסור Micheal, ניסה ניסוי עם כוח Naga. ה-Darkus energy חדרה לאליס ויצרה לוחמת-צל חסרת-רחמים.</p>
<h2>🎭 Masquerade – האישיות השנייה</h2>
<img src="https://bakugan.wiki/images/7/78/S1Masquerade.jpg" onerror="this.style.display='none'" alt="Masquerade" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Masquerade שולחת בקוגן ל-Doom Dimension – מימד הכליה. פועלת בשליחות Naga. כשהסוד נחשף, אליס מתמודדת עם עברה.</p>
<h2>🌑 Alpha Hydranoid</h2>
<img src="https://bakugan.wiki/images/d/d3/BK_CD_HMAlphaHydranoid.jpg" onerror="this.style.display='none'" alt="Alpha Hydranoid" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>הבקוגן של Masquerade. <strong>Dual Hydranoid</strong> (שתי ראשים) → <strong>Alpha Hydranoid</strong> (שלוש ראשים). G-Power 1100. לאחר חשיפת הסוד – עובר לצד הטוב.</p>
<div style="background:rgba(155,0,255,0.08);border:1px solid rgba(155,0,255,0.3);border-radius:12px;padding:1rem;margin-top:1rem">
  <strong style="color:#9B00FF">⚠️ ספוילר:</strong>
  <p style="margin-top:0.3rem">Masquerade = <strong>אליס גהביץ'</strong>. אישיות שנייה שנוצרה מאנרגיית Naga. כשנחשף – אליס מקבלת חזרה את גופה ו-Hydranoid הופך לבן-ברית.</p>
</div>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,0,200,0.1);border:1px solid rgba(100,0,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#8200E6">Alpha Hydranoid BakuCore</strong><br>Darkus · 600G</div><div style="background:rgba(0,200,255,0.1);border:1px solid rgba(0,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C8FF">Alpha Hydranoid BakuGlow</strong><br>זוהר · 550G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">Alpha Hydranoid Clear</strong><br>שקוף · 500G</div><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">Alpha Hydranoid Bronze</strong><br>ברונזה · 580G</div></div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/d/d3/BK_CD_HMAlphaHydranoid.jpg', adminId);

  wikiInsert.run('char-naga', 'Naga – האנטגוניסט הגדול', `
<img src="https://bakugan.wiki/images/1/1b/BK_CD_Naga_2.jpg" onerror="this.style.display='none'" alt="Naga" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FFD700">✨ Haos (שנהפך לאפל)</td></tr>
    <tr><td>⚔️ תפקיד</td><td>אנטגוניסט ראשי – עונה 1</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>UNLIMITED</td></tr>
    <tr><td>🏠 מוצא</td><td>Vestroia – Silent Core</td></tr>
  </table>
</div>
<p>Naga היה בקוגן Haos ממד Vestroia שביצע ניסוי נואש – ניסה לספוג את כוח ה-<strong>Silent Core</strong> כדי להיות הבקוגן החזק ביותר. הניסוי נכשל: Naga נבלע לתוך ה-Silent Core עצמו.</p>
<p>מתוך ה-Silent Core, Naga קיבל כוח בלתי מוגבל – אך איבד את גופו. הוא שולח שלוחות לשיג גם את ה-Infinity Core, מה שיתן לו שליטה מלאה על שני העולמות.</p>
<h2>🎭 Hal-G – שלוחתו בעולם</h2>
<img src="https://bakugan.wiki/images/3/38/Hal-G.png" onerror="this.style.display='none'" alt="Hal-G" loading="lazy" class="wiki-char-img" style="max-width:200px">
<p>Hal-G הוא הפרופסור Michael – אביה של אליס – שNaga השתלט על גופו. הוא כלי של Naga בעולם הפיזי, מכוון את Masquerade ומתכנן את השלטת Naga.</p>
<h2>📖 הסוף</h2>
<p>בקרב הסופי, דן ו-Drago מגיעים ל-Silent Core. Drago הופך ל-<strong>Infinity Dragonoid</strong> ומחסל את Naga לנצח, משחרר את Vestroia ומחזיר את האיזון.</p>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem"><p><strong>Naga</strong> לא יצא מעולם כצעצוע מסחרי – הוא אנטגוניסט ייחודי לסדרה האנימה בלבד. אין גרסאות Special Treatment קנויות. מי שמוצא Naga-דמוי בכדורי בקוגן – כנראה זיוף.</p></div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/1/1b/BK_CD_Naga_2.jpg', adminId);

  // ──── Season 2 ────

  wikiInsert.run('char-spectra', 'Spectra Phantom – קית\' קליי', `
<img src="https://bakugan.wiki/images/7/72/SpectraPh.png" onerror="this.style.display='none'" alt="Spectra Phantom" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FF4500">🔥 Pyrus – אש</td></tr>
    <tr><td>🐉 בקוגן</td><td>Viper Helios / Cyborg Helios</td></tr>
    <tr><td>⚔️ תפקיד</td><td>ראש Vexos / בסוף – בן ברית</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1600</td></tr>
    <tr><td>🏠 מוצא</td><td>כדור הארץ / Vexos</td></tr>
  </table>
</div>
<p>Spectra Phantom הוא אחד הדמויות המורכבות ביותר בסדרה. נראה כנבל קר ומחושב, אך מסתתר מאחוריו <strong>קית' קליי</strong> – האח הגדול של Mira Clay. הוא עזב את משפחתו כדי לפתח טכנולוגיה לשיפור בקוגן.</p>
<p>לבסוף, כשמבין שמשפחה חשובה יותר מכוח, עובר לצד ה-Resistance ונלחם יחד עם הגיבורים.</p>
<h2>🔥 Viper Helios – Cyborg Helios MK2</h2>
<img src="https://bakugan.wiki/images/d/d3/Viper_helios.png" onerror="this.style.display='none'" alt="Viper Helios" loading="lazy" class="wiki-char-img" style="max-width:260px">
<p>Helios הוא הבקוגן הקיברנטי החזק ביותר. קית' שיפר אותו טכנולוגית – <strong>Cyborg Helios MK2</strong>. היריבות בין Helios ו-Drago היא מהדינמיות הטובות ביותר בסדרה.</p>
<div style="background:rgba(255,102,0,0.08);border:1px solid rgba(255,102,0,0.3);border-radius:12px;padding:1rem;margin-top:1rem">
  <strong style="color:var(--accent)">⚠️ ספוילר:</strong>
  <p style="margin-top:0.3rem">Spectra Phantom = <strong>Keith Clay</strong> = <strong>האח הגדול של Mira</strong>! נחשף באמצע עונה 2 ומשנה לחלוטין את הדינמיקה.</p>
</div>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מנהיג את ה-Vexos בהחרמת בקוגן מ-Resistance</li>
  <li>עוזב את ה-Vexos כשמגלה ש-King Zenoheld לא אכפת לו</li>
  <li>איחוד עם אחותו Mira – רגע אמוציונלי</li>
  <li>נלחם לצד ה-Resistance בקרב הסופי מול ה-Alternative Weapon</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>ליבה פיריוס · 1050G</div><div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">BakuRaider</strong><br>פלישה · 1100G</div><div style="background:rgba(80,80,80,0.2);border:1px solid rgba(100,100,100,0.4);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#AAAAAA">BakuStealth</strong><br>סוואה · 980G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>פלדה קרירה · 950G</div><div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Neon</strong><br>ניאון · 1020G</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/7/72/SpectraPh.png', adminId);

  wikiInsert.run('char-ace', 'Ace Grit', `
<img src="https://bakugan.wiki/images/5/5b/Image29.png" onerror="this.style.display='none'" alt="Ace Grit" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Percival / Knight Percival</td></tr>
    <tr><td>⚔️ תפקיד</td><td>ה-Resistance</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>750 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>New Vestroia</td></tr>
  </table>
</div>
<p>Ace Grit הוא לוחם Darkus מ-New Vestroia – מרדני, ישיר ולא חסר עזות. לא סומך על אנשים בקלות, אך מפתח כבוד לדן לאורך הסדרה. לא מחפש שבחים – פשוט לוחם.</p>
<h2>🌑 Knight Percival</h2>
<img src="https://bakugan.wiki/images/1/11/Bk_cd_percival.jpg" onerror="this.style.display='none'" alt="Percival" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p><strong>Percival</strong> → <strong>Knight Percival</strong> – שריון כבד ורמח. G-Power 1100. ייצוג מושלם של אישיות Ace: חזק, נחוש, לא מוותר.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מתנגד לדן בתחילה – אך לאט-לאט הכבוד גדל</li>
  <li>חשף ריגול בשורות ה-Resistance</li>
  <li>Tag Battle מול Vexos עם Mira</li>
  <li>Knight Percival בקרב הסופי מול ה-Alternative Weapon</li>
</ul>

<h2>🃏 קלפי כוח – Knight Percival</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(155,0,255,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Tri-Gunner</td><td style="padding:0.35rem 0.7rem">+300 G – ירי שלוש-פנים</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Night Explorer</td><td style="padding:0.35rem 0.7rem">-300 G מהיריב</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Misty Shadow</td><td style="padding:0.35rem 0.7rem">מאפס את G היריב ל-Base Power</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Darkus Driver</td><td style="padding:0.35rem 0.7rem">+200 G</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Black Maiden</td><td style="padding:0.35rem 0.7rem">מבטל את יכולת היריב</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Darkus Thunder</td><td style="padding:0.35rem 0.7rem">-200 G מיריב + 300 G לPercival</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>ליבה מתכתית · S2</div>
  <div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#B46432">Bronze</strong><br>ברונזה · Darkus</div>
  <div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>גרסת פלדה</div>
  <div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Neon</strong><br>ניאון · S2</div>
</div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/1/11/Bk_cd_percival.jpg', adminId);

  wikiInsert.run('char-baron', 'Baron Leltoy', `
<img src="https://bakugan.wiki/images/4/40/Image28.png" onerror="this.style.display='none'" alt="Baron Leltoy" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FFD700">✨ Haos – אור</td></tr>
    <tr><td>🐉 בקוגן</td><td>Nemus / Saint Nemus</td></tr>
    <tr><td>⚔️ תפקיד</td><td>ה-Resistance</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>700 → 900</td></tr>
    <tr><td>🏠 מוצא</td><td>New Vestroia</td></tr>
  </table>
</div>
<p>Baron Leltoy הוא הצעיר והמתלהב ביותר ב-Resistance – מעריץ גדול של דן קוסו. מלא אנרגיה ואופטימיות, תמיד מוכן להגן. לפעמים יותר מדי נלהב – מה שמוביל לטעויות שממנן הוא לומד.</p>
<h2>✨ Saint Nemus</h2>
<p>Nemus הוא Haos Bakugan מהיר. <strong>Saint Nemus</strong> – האבולוציה. G-Power 900.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>רואה בדן גיבור-על ומנסה לחקות אותו</li>
  <li>לומד שצריך לבנות את הדרך שלו, לא לחקות</li>
  <li>נלחם בקרב ה-Alternative Weapon ומוכיח את שוויו</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">BakuCore</strong><br>Haos · 570G</div><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">BakuBronze</strong><br>ברונזה · 570G</div><div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Neon</strong><br>שקוף · 505G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>פלדה · S2</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/4/40/Image28.png', adminId);

  wikiInsert.run('char-mira', 'Mira Clay – מייסדת ה-Resistance', `
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#CC6600">🪨 Subterra – אדמה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Wilda</td></tr>
    <tr><td>⚔️ תפקיד</td><td>מייסדת ה-Resistance</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>800 → 1000</td></tr>
    <tr><td>🏠 מוצא</td><td>New Vestroia</td></tr>
  </table>
</div>
<p>Mira Clay היא אחת המייסדות של ה-Resistance ב-New Vestroia – מנהיגה טבעית, חזקה ונחושה. הסיפור שלה הוא אחד הרגשיים בעונה 2: <strong>Spectra Phantom הוא Keith Clay – אחיה הגדול</strong>.</p>
<p>Mira מנסה להאמין שאחיה לא רע לחלוטין, ופועלת לעצור את ה-Vexos מבלי לפגוע בו. הדילמה הזו מוסיפה עומק רב לדמות.</p>
<h2>🪨 Wilda</h2>
<p>Wilda היא Subterra Bakugan חזקה – דמות נשית עוצמתית. G-Power 1000.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>גייסה את Ace, Baron ואחרים להקים את ה-Resistance</li>
  <li>הגילוי ש-Spectra = Keith אחיה – שבר לבבות</li>
  <li>מנסה לדבר עם אחיה ולהחזירו לצד הטוב</li>
  <li>האיחוד עם אחיה בסוף הסדרה – רגע נוגע ביותר</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>Subterra · 570G</div><div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">BakuNeon</strong><br>ניאון · 530G</div><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">BakuBronze</strong><br>ברונזה · 670G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Translucent</strong><br>שקוף · 515G</div><div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Baku-Legacy</strong><br>750G · מהדורה מוגבלת</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/d/d3/Viper_helios.png', adminId);

  // ──── Season 3 ────

  wikiInsert.run('char-jake', 'Jake Vallory', `
<img src="https://bakugan.wiki/images/7/78/Jakex.jpg" onerror="this.style.display='none'" alt="Jake Vallory" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#CC6600">🪨 Subterra – אדמה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Coredem</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Battle Brawler</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>כדור הארץ</td></tr>
  </table>
</div>
<p>Jake Vallory הוא ספורטאי מ-Battle Brawlers בעונה 3 – נאמן, מתוק ועז-כוח. חבר ישן של דן. הוא מאמין בנאמנות ובשמירת חברים מעל הכל.</p>
<p>הטוויסט: Jake נפל תחת <strong>שליטה מנטלית של גונדליה</strong> ונלחם כנגד חבריו. זהו אחד הרגעים הרגשיים ביותר של עונה 3.</p>
<h2>🪨 Coredem</h2>
<img src="https://bakugan.wiki/images/a/a6/BK_CD_Coredem.jpg" onerror="this.style.display='none'" alt="Coredem" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Coredem – Subterra Bakugan ענק בצורת לוחם-סלע. G-Power 900→1100.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>Jake מגוייס לגונדליה ונלחם מול חבריו תחת שליטה מנטלית</li>
  <li>חבריו שוברים את השליטה המנטלית – הרגע הנוגע ביותר</li>
  <li>מצטרף לקרב הסופי מול Barodius</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Coredem</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Coredem יצא במגוון גרסאות Subterra כולל BakuNano ו-BakuTriad.
  <a href="/wiki?page=char-coredem" style="color:var(--accent);font-weight:700">← ראה דף Coredem</a>
</div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/a/a6/BK_CD_Coredem.jpg', adminId);

  wikiInsert.run('char-fabia', 'Fabia Sheen – נסיכת Neathia', `
<img src="https://bakugan.wiki/images/9/95/Fabia_sheen.png" onerror="this.style.display='none'" alt="Fabia Sheen" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FFD700">✨ Haos – אור</td></tr>
    <tr><td>🐉 בקוגן</td><td>Aranaut</td></tr>
    <tr><td>⚔️ תפקיד</td><td>נסיכת Neathia / Battle Brawler</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>850 → 1050</td></tr>
    <tr><td>🏠 מוצא</td><td>Neathia</td></tr>
  </table>
</div>
<p>Fabia Sheen היא נסיכת Neathia שהגיעה לכדור הארץ לגייס עזרה. Neathia תחת מתקפה מ-Gundalia. חזקה ונחושה, לא מפחדת לפגוע. חושפת את האמת על Ren Krawler.</p>
<h2>✨ Aranaut – שומר Neathia</h2>
<img src="https://bakugan.wiki/images/e/ee/BK_Aranaut.png" onerror="this.style.display='none'" alt="Aranaut" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Aranaut – Haos Bakugan אציל ורציני. שומר ממלכת Neathia. G-Power 850→1050.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מתגנבת לכדור הארץ לחפש Battle Brawlers</li>
  <li>חושפת את שקרי Ren Krawler בפני כל הקבוצה</li>
  <li>מחזירה את ה-Brawlers ל-Neathia לקרב הסופי</li>
  <li>עומדת בפני Barodius – לא נסוגה</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(30,30,30,0.2);border:1px solid rgba(80,80,80,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#888888">BakuStealth</strong><br>Darkus · 810G</div><div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Standard Haos</strong><br>850G</div><div style="background:rgba(0,153,255,0.1);border:1px solid rgba(0,153,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0099FF">Aquos</strong><br>800G</div><div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">Pyrus</strong><br>780G · S3</div></div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/e/ee/BK_Aranaut.png', adminId);

  wikiInsert.run('char-ren', 'Ren Krawler – העמיל הכפול', `
<img src="https://bakugan.wiki/images/b/b5/Ren_GI.png" onerror="this.style.display='none'" alt="Ren Krawler" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Linehalt</td></tr>
    <tr><td>⚔️ תפקיד</td><td>גונדלי שעובר צד</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>800 → 1000</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Ren Krawler הגיע לכדור הארץ בשקר – טען שבקוגן Neathia הם האויבים, גייס Battle Brawlers לצד Gundalia. האמת: עבד עבור Barodius כדי להציל את משפחתו שנחטפה.</p>
<p>כשRen מגלה שBarodius משקר לכולם – הוא עובר לצד Neathia. אחד ממסעות הגאולה הטובים ביותר בסדרה.</p>
<h2>🌑 Linehalt – Forbidden Power</h2>
<img src="https://bakugan.wiki/images/d/de/BK_Linehalt.png" onerror="this.style.display='none'" alt="Linehalt" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Linehalt – Darkus Bakugan ייחודי עם <strong>Forbidden Power</strong> – כוח כה אדיר שמסכן את המשתמש. G-Power 800→1000.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מגייס שחקנים אנושיים ע"י שקרים משוכללים</li>
  <li>Fabia חושפת את האמת על Ren</li>
  <li>עובר לצד Neathia – רגע גאולה אמוציונלי</li>
  <li>Linehalt מגלה Forbidden Power בקרב הסופי</li>
</ul>
<h2>🎲 Special Treatment</h2>
<div style="background:rgba(255,102,0,0.06);border:1px solid var(--border-accent);border-radius:10px;padding:1rem;font-size:0.9rem">
  גרסאות Special Treatment של <strong>Linehalt</strong> מפורטות בדף הבקוגן הייעודי.<br>
  Linehalt קיבל גרסאות Darkus נדירות כולל BakuNano ו-BakuGranite.
  <a href="/wiki?page=char-linehalt" style="color:var(--accent);font-weight:700">← ראה דף Linehalt</a>
</div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/d/de/BK_Linehalt.png', adminId);

  wikiInsert.run('char-barodius', 'Emperor Barodius – מלך גונדליה', `
<img src="https://bakugan.wiki/images/d/db/BarodiusGI.png" onerror="this.style.display='none'" alt="Emperor Barodius" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Dharak / Phantom Dharak</td></tr>
    <tr><td>⚔️ תפקיד</td><td>אנטגוניסט ראשי – עונה 3</td></tr>
    <tr><td>📺 עונות</td><td>3, (4 כ-Mag Mel)</td></tr>
    <tr><td>💪 G-Power</td><td>1100 → 1400</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Emperor Barodius הוא מלך גונדליה – שלטן אכזרי ואמביציוזי שרוצה את ה-<strong>Sacred Orb</strong> כדי לשלוט בכל הגלקסיה. לא מתחשב בחיי אפילו הפקודים שלו.</p>
<p><strong>הטוויסט:</strong> לאחר שנגע ב-Sacred Orb, Barodius שוחזר כ-<strong>Mag Mel</strong> בעונה 4 – ישות כוח טהורה ואפלה.</p>
<h2>🌑 Dharak</h2>
<img src="https://bakugan.wiki/images/c/c6/BC_Dharak.png" onerror="this.style.display='none'" alt="Dharak" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Dharak – Darkus Bakugan ענק ועוצמתי. G-Power 1100→1400. <strong>Phantom Dharak</strong> – שיא האבולוציה.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>שולח את ה-Twelve Orders לאסוף כוח Sacred Orb</li>
  <li>כופה שליטה מנטלית על שחקנים דרך Kazarina</li>
  <li>הקרב הסופי מול דן ו-Lumino Dragonoid</li>
  <li>נוגע ב-Sacred Orb → הופך ל-Mag Mel בעונה 4</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,80,60,0.1);border:1px solid rgba(120,100,80,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#786450">BakuGranite</strong><br>Haos · 750G</div><div style="background:rgba(0,153,255,0.1);border:1px solid rgba(0,153,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0099FF">BakuBlue</strong><br>Ventus · 870G · Walmart</div><div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">Crimson & Pearl</strong><br>Pyrus · 770G</div><div style="background:rgba(0,200,100,0.1);border:1px solid rgba(0,200,100,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C864">BakuBoost</strong><br>Aquos · 720G</div><div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF9600">BakuTriad</strong><br>660–750G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">Clear</strong><br>שקוף · 780G</div></div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/c/c6/BC_Dharak.png', adminId);

  wikiInsert.run('char-kazarina', 'Kazarina', `
<img src="https://bakugan.wiki/images/3/3b/Kazarina_GI.png" onerror="this.style.display='none'" alt="Kazarina" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FFD700">✨ Haos – אור</td></tr>
    <tr><td>🐉 בקוגן</td><td>Lumagrowl</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Twelve Orders – מדענית</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Kazarina היא המדענית הרשעה של Twelve Orders – אחראית על שליטה מנטלית בלוחמים וניסויים על בקוגן. קרה, מחושבת ומסוכנת ביותר בגלל הכוחות הנפשיים שלה.</p>
<h2>✨ Lumagrowl</h2>
<p>Lumagrowl – Haos Bakugan בצורת חתול/זאב מסוכן. G-Power 900→1100.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>שולטת מנטלית ב-Jake Vallory</li>
  <li>מנסה לשלוט ב-Battle Brawlers</li>
  <li>נבגדת ע"י Gill כשBarodius מחליט שאינה שימושית</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">BakuClear</strong><br>Haos · 780G</div><div style="background:rgba(30,30,30,0.2);border:1px solid rgba(80,80,80,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#888888">BakuCamo</strong><br>הסוואה · 790G</div><div style="background:rgba(0,200,100,0.1);border:1px solid rgba(0,200,100,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C864">BakuBoost</strong><br>Pyrus · 800G</div><div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF9600">BakuTriad</strong><br>630–680G</div></div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/3/3b/Kazarina_GI.png', adminId);

  // ──── Season 4 ────

  wikiInsert.run('char-magmel', 'Mag Mel – אנטגוניסט עונה 4', `
<img src="https://bakugan.wiki/images/9/9f/Bak_magmel_174x252.png" onerror="this.style.display='none'" alt="Mag Mel" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Razenoid</td></tr>
    <tr><td>⚔️ תפקיד</td><td>אנטגוניסט ראשי – עונה 4</td></tr>
    <tr><td>📺 עונות</td><td>4</td></tr>
    <tr><td>💪 G-Power</td><td>1400 → UNLIMITED</td></tr>
    <tr><td>🏠 מוצא</td><td>Sacred Orb</td></tr>
  </table>
</div>
<p>Mag Mel הוא ישות שנוצרה כאשר Emperor Barodius נגע ב-Sacred Orb. הוא ניזון מהקשר בין דן ל-Drago – כל קרב מזין את כוחו. ככל שדן ו-Drago חזקים יותר, כך Mag Mel מתחזק.</p>
<div style="background:rgba(155,0,255,0.08);border:1px solid rgba(155,0,255,0.3);border-radius:12px;padding:1rem;margin:1rem 0">
  <strong style="color:#9B00FF">⚠️ ספוילר:</strong>
  <p style="margin-top:0.3rem">Mag Mel = <strong>Emperor Barodius</strong> מעונה 3! נמחק כשנגע ב-Sacred Orb ושוחזר כישות כוח טהורה ואפלה.</p>
</div>
<h2>🌑 Razenoid</h2>
<p>Razenoid – ה-Darkus Bakugan של Mag Mel. אחד החזקים בכל הסדרה. G-Power UNLIMITED.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מתחזק בכל קרב של דן ו-Drago</li>
  <li>משחרר Chaos Bakugan על העולם</li>
  <li>הקרב הסופי – Fusion Dragonoid מחסל את Mag Mel לנצח</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,0,200,0.1);border:1px solid rgba(100,0,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#8200E6">Razenoid Standard</strong><br>Darkus · 1200G · S4</div><div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF9600">Razenoid BakuTrinity</strong><br>S4 · 1000–1200G</div><div style="background:rgba(80,0,0,0.2);border:1px solid rgba(80,0,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#CC0000">Razenoid BakuSolo</strong><br>S4 · 1150G</div><div style="background:rgba(155,0,255,0.1);border:1px solid rgba(155,0,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9B00FF">Evolved Razenoid</strong><br>G: UNLIMITED · אנימה</div></div>
<div style="clear:both"></div>
`, 4, 'characters', 'https://bakugan.wiki/images/9/9f/Bak_magmel_174x252.png', adminId);

  wikiInsert.run('char-anubias', 'Anubias', `
<img src="https://bakugan.wiki/images/5/5c/Bak_anubias_174x252.png" onerror="this.style.display='none'" alt="Anubias" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Horridian</td></tr>
    <tr><td>⚔️ תפקיד</td><td>שלוחה של Mag Mel</td></tr>
    <tr><td>📺 עונות</td><td>4</td></tr>
    <tr><td>💪 G-Power</td><td>1000 → 1300</td></tr>
    <tr><td>🏠 מוצא</td><td>Interspace</td></tr>
  </table>
</div>
<p>Anubias הוא שלוחה של Mag Mel ב-Interspace – המתחרה הישיר של דן. יוצר Chaos Bakugan ומגייס שחקנים לצד Mag Mel. נראה עצמאי אך בסוף הוא סתם כלי.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מנצח את דן בתחרות Interspace</li>
  <li>חושף ש-Mag Mel הוא מקור ה-Chaos Bakugan</li>
  <li>נזרק ע"י Mag Mel כשלא מועיל יותר</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(0,150,255,0.1);border:1px solid rgba(0,150,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0096FF">Baku Cyclone Strike</strong><br>Aquos · 1020G</div><div style="background:rgba(0,150,255,0.1);border:1px solid rgba(0,150,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0096FF">Baku Lava Storm</strong><br>Ventus · 1040G</div><div style="background:rgba(255,50,0,0.12);border:1px solid rgba(255,50,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF3200">Baku Lava Storm</strong><br>Subterra · 1010G</div><div style="background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Standard Haos</strong><br>830G · S4</div></div>
<div style="clear:both"></div>
`, 4, 'characters', 'https://bakugan.wiki/images/5/5c/Bak_anubias_174x252.png', adminId);

  wikiInsert.run('char-sellon', 'Sellon', `
<img src="https://bakugan.wiki/images/thumb/e/e2/Sellon.png" onerror="this.style.display='none'" alt="Sellon" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#0088FF">💧 Aquos – מים</td></tr>
    <tr><td>🐉 בקוגן</td><td>Spatterix</td></tr>
    <tr><td>⚔️ תפקיד</td><td>שלוחה של Mag Mel</td></tr>
    <tr><td>📺 עונות</td><td>4</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1200</td></tr>
    <tr><td>🏠 מוצא</td><td>Interspace</td></tr>
  </table>
</div>
<p>Sellon היא שלוחה של Mag Mel – אסטרטגית ומניפולטיבית. בניגוד ל-Anubias הישיר, Sellon פועלת מאחורי הקלעים בתחבולה וחכמה.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>הובילה פעולות נגד ה-Battle Brawlers ב-Interspace</li>
  <li>בריתות זמניות עם Anubias בקרבות נגד הגיבורים</li>
  <li>נזרקה ע"י Mag Mel כשלא מועילה יותר</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(0,150,255,0.1);border:1px solid rgba(0,150,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0096FF">BakuTrinity</strong><br>Aquos · 760–850G</div><div style="background:rgba(0,150,255,0.1);border:1px solid rgba(0,150,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0096FF">BakuSolo</strong><br>Aquos · 810G</div><div style="background:rgba(0,153,255,0.1);border:1px solid rgba(0,153,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0099FF">Standard</strong><br>Aquos · 690G · S4</div></div>
<div style="clear:both"></div>
`, 4, 'characters', 'https://bakugan.wiki/images/5/5c/Bak_anubias_174x252.png', adminId);

  wikiInsert.run('char-helios', 'Viper Helios – Cyborg Helios', `
<img src="https://bakugan.wiki/images/d/d3/Viper_helios.png" onerror="this.style.display='none'" alt="Viper Helios" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FF4500">🔥 Pyrus – אש</td></tr>
    <tr><td>👤 בעלים</td><td>Spectra Phantom (Keith Clay)</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan – Vexos</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1600</td></tr>
    <tr><td>🏠 מוצא</td><td>New Vestroia</td></tr>
  </table>
</div>
<p>Helios הוא הבקוגן הקיברנטי הייחודי של Spectra Phantom – יריבו הנצחי של Drago לאורך כל עונה 2. Spectra שיפר את Helios עם טכנולוגיה ביו-מכנית.</p>
<h2>🔥 שרשרת האבולוציה</h2>
<div style="background:rgba(255,69,0,0.07);border:1px solid rgba(255,69,0,0.2);border-radius:10px;padding:0.75rem;font-size:0.82rem;margin-bottom:0.75rem;font-family:'Orbitron',sans-serif">
  Pyrus Helios → Viper Helios → Cyborg Helios MK2 (G: 1600)
</div>
<p><strong>Cyborg Helios MK2</strong> – הגרסה הסופית עם שיפורים טכנולוגיים מלאים. מחצית דרקון, מחצית מכונה.</p>
<h2>⚔️ Helios vs Drago</h2>
<p>היריבות בין Helios ל-Drago היא מהדינמיות הטובות ביותר בסדרה. שניהם Pyrus, שניהם חזקים, שניהם שייכים לאדונים בצדדים מנוגדים – עד שהכל מתהפך.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מנצח את Drago בקרב הראשון</li>
  <li>מקבל שיפורים קיברנטיים שהופכים אותו לחצי-מכונה</li>
  <li>כשKeith עובר לצד הטוב – Helios לוחם לצד Drago</li>
  <li>קרב גמר ל-Alternative Weapon לצד Resistance</li>
</ul>

<h2>🃏 קלפי כוח – Helios</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(255,69,0,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Pyrus Slayer</td><td style="padding:0.35rem 0.7rem">+400 G · Pyrus Helios</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Cyber Slash</td><td style="padding:0.35rem 0.7rem">מתקפה קיברנטית · -300 G מיריב</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Metal Drive</td><td style="padding:0.35rem 0.7rem">+300 G · Viper Helios בלבד</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Maximum Helios</td><td style="padding:0.35rem 0.7rem">+500 G · Cyborg Helios MK2</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>ליבה מתכתית</div>
  <div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>גרסת פלדה</div>
  <div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">Solar</strong><br>גרסת שמש · Pyrus</div>
  <div style="background:rgba(0,200,80,0.1);border:1px solid rgba(0,200,80,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C850">BakuMutation</strong><br>מוטציה · S2</div>
</div>
<div style="clear:both"></div>
`, 2, 'bakugan', 'https://bakugan.wiki/images/d/d3/Viper_helios.png', adminId);

  // ──── Season 1 extra bakugan ────

  wikiInsert.run('char-tigrerra', 'Tigrerra – Blade Tigrerra', `
<img src="https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg" onerror="this.style.display='none'" alt="Tigrerra" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FFD700">✨ Haos – אור</td></tr>
    <tr><td>👤 בעלים</td><td>ראונו מיסאקי</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>450 → 1000</td></tr>
    <tr><td>🏠 מוצא</td><td>Vestroia</td></tr>
  </table>
</div>
<p>Tigrerra היא חתולת Haos לבנה ואצילה – הבקוגן הנאמן של ראונו מיסאקי. מהירה, חדה ועם להבים שמסוגלים לחתוך כל דבר. הנאמנות של Tigrerra לראונו אין כמוה בכל הסדרה.</p>
<h2>⚔️ Blade Tigrerra – האבולוציה</h2>
<p>כשראונו סירבה לסגת מקרב בלתי-אפשרי, Tigrerra ספגה את האנרגיה והתפתחה ל-<strong>Blade Tigrerra</strong> – עם להבים ענקיים בכנפיה ועל גופה. G-Power: 1000.</p>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Tiger Claw</strong> – מתקפת טפרים מהירה</li>
  <li><strong>Haos Shield</strong> – מגן אור שמחזיר מתקפות</li>
  <li><strong>Blade Storm</strong> – גל להבים ספירלי</li>
</ul>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מגינה על ראונו בקרב קריטי מול Masquerade</li>
  <li>הופכת ל-Blade Tigrerra כשראונו מסרבת לסגת</li>
  <li>ראונו מוסרת את Tigrerra כקרבן כדי לעזור לדן להגיע ל-Vestroia</li>
</ul>

<h2>🃏 קלפי כוח (Ability Cards)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(255,215,0,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Crystal Fang</td><td style="padding:0.35rem 0.7rem">+80 G לTigrerra</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Cut in Saber</td><td style="padding:0.35rem 0.7rem">מביא את Tigrerra לקרב ישירות</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Cut in Slayer</td><td style="padding:0.35rem 0.7rem">מאחד G מכל הבקוגן, מוציא אותם מהמשחק</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Pure Light</td><td style="padding:0.35rem 0.7rem">מחיה כל בקוגן שנוצח</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Haos Freeze</td><td style="padding:0.35rem 0.7rem">עוצר זמן, מבטל יכולות יריב, מאפשר כניסת בקוגן נוסף</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Pearl</strong><br>פנינה מבהיקה · 510G</div>
  <div style="background:rgba(200,200,200,0.1);border:1px solid rgba(200,200,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#CCCCCC">Clear</strong><br>שקוף · 450G</div>
  <div style="background:rgba(200,200,200,0.08);border:1px solid rgba(200,200,200,0.2);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#DDDDDD">Translucent</strong><br>שקוף למחצה · מהדורה מוגבלת</div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">Flip</strong><br>משנה תכונה בפתיחה</div>
</div>
<div style="clear:both"></div>
`, 1, 'bakugan', 'https://bakugan.wiki/images/5/58/BK_CD_Tigrerra.jpg', adminId);

  wikiInsert.run('char-skyress', 'Storm Skyress – Ventus', `
<img src="https://bakugan.wiki/images/c/c4/BK_CD_Skyress.jpg" onerror="this.style.display='none'" alt="Skyress" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#00CC44">🌪️ Ventus – רוח</td></tr>
    <tr><td>👤 בעלים</td><td>שון קאזאמי</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>510 → 1050</td></tr>
    <tr><td>🏠 מוצא</td><td>Vestroia</td></tr>
  </table>
</div>
<p>Skyress היא ציפור ה-Ventus הגאה של שון – עצמאית, אצילית ועוצמתית. כנפיה מסוגלות לייצר סופות ורוחות שמפילות כל מה שנמצא בדרכן. הגאווה שלה מתאימה בדיוק לשון.</p>
<h2>🌪️ Storm Skyress</h2>
<p><strong>Storm Skyress</strong> היא האבולוציה – ציפור ענק עם כנפיים שמייצרות סופת-רוח מלאה. G-Power 1050. מהירה, אדירה ובלתי ניתנת לעצירה.</p>
<h2>💔 הסיום הנוגע</h2>
<p>בסצנה אחת הנוגעות ביותר בעונה 1 – <strong>Skyress מוסרת את עצמה</strong> כדי לפתוח את הגישה ל-Vestroia ולהציל את שון ואת הקבוצה. שון לא יוצר איתה שוב.</p>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Green Tornado</strong> – סופת ירוק מסחררת</li>
  <li><strong>Tempest Winder</strong> – לכידת האויב בסופה</li>
  <li><strong>Sky Guardian</strong> – הגנה מוחלטת</li>
</ul>

<h2>🃏 קלפי כוח (Ability Cards)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(0,204,68,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Green Nobility – Soar Violent Winds</td><td style="padding:0.35rem 0.7rem">+100 G לSkyress</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Winds of Fury</td><td style="padding:0.35rem 0.7rem">עם 3 בקוגן Ventus – מנצח אוטומטית</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Destruction Meteor Storm</td><td style="padding:0.35rem 0.7rem">Storm Skyress: +450 G, מחסל הכל</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Tempest Winder</td><td style="padding:0.35rem 0.7rem">לוכד את היריב בסופה, מבטל יכולות</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Pearl</strong><br>פנינה · 510G · Ventus</div>
  <div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#B46432">Bronze</strong><br>ברונזה · S2</div>
  <div style="background:rgba(200,200,200,0.08);border:1px solid rgba(200,200,200,0.2);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#DDDDDD">Translucent</strong><br>שקוף · מהדורה מוגבלת</div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">Flip</strong><br>בקוגן קפיצה מיוחד</div>
</div>
<div style="clear:both"></div>
`, 1, 'bakugan', 'https://bakugan.wiki/images/c/c4/BK_CD_Skyress.jpg', adminId);

  wikiInsert.run('char-gorem', 'Stone Gorem – Subterra', `
<img src="https://bakugan.wiki/images/c/cf/BK_CD_Gorem.jpg" onerror="this.style.display='none'" alt="Gorem" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#CC6600">🪨 Subterra – אדמה</td></tr>
    <tr><td>👤 בעלים</td><td>ג'ולי מקימוטו</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>600 → 1000</td></tr>
    <tr><td>🏠 מוצא</td><td>Vestroia</td></tr>
  </table>
</div>
<p>Gorem הוא ענק האדמה – הבקוגן הגדול והכבד ביותר בקבוצה. גוף אבן מוצק שאפשר לעמוד עליו. איטי אבל כמעט בלתי ניתן לעצירה כשהוא בתנועה. ממש כמו ג'ולי בעלת-הרוח.</p>
<h2>🪨 Stone Gorem</h2>
<p><strong>Stone Gorem</strong> – האבולוציה עם שריון-סלע מלא. G-Power 1000. לוחם שנבנה כולו מסלע ואדמה. אי אפשר לשבור אותו בכוח – צריך חוכמה.</p>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Hammer Impact</strong> – אגרוף ענק שרוטט את הקרקע</li>
  <li><strong>Earth Shaker</strong> – רעידת אדמה מקומית</li>
  <li><strong>Rock Wall</strong> – חומת סלע שמגינה</li>
</ul>

<h2>🃏 קלפי כוח (Ability Cards)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(180,100,50,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Hammer Impact</td><td style="padding:0.35rem 0.7rem">+200 G, מוסיף G מ-Gate Card</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Earth Shaker</td><td style="padding:0.35rem 0.7rem">-300 G מהיריב, מבטל Gate Card</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Rock Wall</td><td style="padding:0.35rem 0.7rem">חוסם את כל יכולות היריב לסיבוב</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Subterra Malice</td><td style="padding:0.35rem 0.7rem">+400 G (Stone Gorem בלבד)</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(200,200,200,0.1);border:1px solid rgba(200,200,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#CCCCCC">Clear</strong><br>שקוף · 600G</div>
  <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Pearl</strong><br>פנינה · 600G</div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">Flip</strong><br>בקוגן-הפיכה</div>
  <div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#B46432">Bronze</strong><br>ברונזה · S2</div>
</div>
<div style="clear:both"></div>
`, 1, 'bakugan', 'https://bakugan.wiki/images/c/cf/BK_CD_Gorem.jpg', adminId);

  wikiInsert.run('char-preyas', 'Preyas – הבקוגן המשתנה', `
<img src="https://bakugan.wiki/images/6/66/BK_CD_Preyas.jpg" onerror="this.style.display='none'" alt="Preyas" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#0088FF">💧 Aquos (+ שינוי תכונה)</td></tr>
    <tr><td>👤 בעלים</td><td>מרוסה מארוקורה</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>490 → 900</td></tr>
    <tr><td>🏠 מוצא</td><td>Vestroia</td></tr>
  </table>
</div>
<p>Preyas הוא הבקוגן הייחודי ביותר בסדרה – מסוגל לשנות את התכונה שלו באמצע קרב! הכוח הזה הופך אותו לאחד הבקוגן המסוכנים ביותר, כי האויב לא יכול לצפות מה יהיה הצעד הבא.</p>
<h2>💧 Preyas Angelo & Preyas Diablo</h2>
<p>שתי הצורות המיוחדות של Preyas:</p>
<ul>
  <li><strong>Preyas Angelo</strong> – Haos · הצד הטוב, לבן ומבהיק. G: 900</li>
  <li><strong>Preyas Diablo</strong> – Darkus · הצד הרע, שחור ומסוכן. G: 900</li>
</ul>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Aquos Whirlpool</strong> – מערבולת מים</li>
  <li><strong>Element Shift</strong> – שינוי תכונה מיידי</li>
  <li><strong>Angel Storm / Devil Blast</strong> – תקיפה כפולה</li>
</ul>

<h2>🃏 קלפי כוח (Ability Cards)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(0,136,255,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Aquos Whirlpool</td><td style="padding:0.35rem 0.7rem">מערבולת מים – מבטל גייט קארד</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Blue Stealth</td><td style="padding:0.35rem 0.7rem">+200 G, Preyas בלתי נראה</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Element Shift</td><td style="padding:0.35rem 0.7rem">משנה תכונה מיידית באמצע קרב</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Haos Halo (Angelo)</td><td style="padding:0.35rem 0.7rem">+300 G בגרסת Haos</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Darkus Doom (Diablo)</td><td style="padding:0.35rem 0.7rem">-300 G מהיריב בגרסת Darkus</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<p>Preyas הוא אחד הבקוגן הנדירים ביותר לאספנות – בגלל יכולת שינוי התכונה שלו, גרסאות ה-ST שלו ייצגו צבעים של תכונות שונות.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(200,200,200,0.1);border:1px solid rgba(200,200,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#CCCCCC">Clear</strong><br>שקוף · Aquos · 490G</div>
  <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Pearl</strong><br>פנינה · 490G</div>
  <div style="background:rgba(200,200,200,0.08);border:1px solid rgba(200,200,200,0.2);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#DDDDDD">Translucent</strong><br>שקוף למחצה</div>
  <div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Neon</strong><br>ניאון זוהר · S2</div>
  <div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">Flip</strong><br>משנה תכונה בפתיחה</div>
</div>
<div style="clear:both"></div>
`, 1, 'bakugan', 'https://bakugan.wiki/images/6/66/BK_CD_Preyas.jpg', adminId);

  wikiInsert.run('char-masquerade', 'Masquerade – הלוחם המסתורי', `
<img src="https://bakugan.wiki/images/7/78/S1Masquerade.jpg" onerror="this.style.display='none'" alt="Masquerade" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Alpha Hydranoid</td></tr>
    <tr><td>⚔️ תפקיד</td><td>אנטגוניסט – עונה 1</td></tr>
    <tr><td>📺 עונות</td><td>1</td></tr>
    <tr><td>💪 G-Power</td><td>1100</td></tr>
    <tr><td>🏠 מוצא</td><td>כדור הארץ (בתוך אליס)</td></tr>
  </table>
</div>
<p>Masquerade הוא הלוחם המסתורי של עונה 1 – לובש מסכה, מדבר בקור-רוח ושולח בקוגן של אחרים ל-Doom Dimension. כל Battle Brawler פחד ממנו. הכוח שלו היה אדיר, הטקטיקה שלו היתה ברורה – ניצחון בכל מחיר.</p>
<div style="background:rgba(155,0,255,0.08);border:1px solid rgba(155,0,255,0.3);border-radius:12px;padding:1rem;margin:1rem 0">
  <strong style="color:#9B00FF">⚠️ ספוילר גדול:</strong>
  <p style="margin-top:0.3rem">Masquerade = <strong>אליס גהביץ'</strong>! אישיות שנייה שנוצרה מאנרגיית Naga. אחד הטוויסטים הגדולים ביותר בסדרה.</p>
</div>
<h2>🌑 Alpha Hydranoid</h2>
<img src="https://bakugan.wiki/images/d/d3/BK_CD_HMAlphaHydranoid.jpg" onerror="this.style.display='none'" alt="Alpha Hydranoid" loading="lazy" class="wiki-char-img" style="max-width:240px">
<p>Hydranoid התפתח ל-Dual Hydranoid (שתי ראשים) ואחר כך ל-<strong>Alpha Hydranoid</strong> עם שלוש ראשים. G-Power 1100. לאחר חשיפת הסוד – עובר לצד הטוב.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מנצח כל Battle Brawler ושולח בקוגן שלהם ל-Doom Dimension</li>
  <li>מתמודד מול דן פעמים רבות – תמיד עם יתרון</li>
  <li>המסכה נחשפת – אליס מקבלת חזרה שליטה</li>
  <li>Hydranoid נהיה חלק מהצד הטוב בקרב הסופי</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,0,200,0.12);border:1px solid rgba(130,0,230,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#8200E6">BakuCore</strong><br>Darkus · 600G</div><div style="background:rgba(0,200,255,0.1);border:1px solid rgba(0,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C8FF">BakuGlow</strong><br>זוהר כחול · 550G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">BakuFrost</strong><br>קפוא · 500G</div><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">BakuBronze</strong><br>ברונזה · 580G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">Clear</strong><br>שקוף · S1</div></div>
<div style="clear:both"></div>
`, 1, 'characters', 'https://bakugan.wiki/images/7/78/S1Masquerade.jpg', adminId);

  // ──── Season 2 extra ────

  wikiInsert.run('char-lync', 'Lync Volan – Vexos', `
<img src="https://bakugan.wiki/images/0/06/Image22.png" onerror="this.style.display='none'" alt="Lync Volan" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#00CC44">🌪️ Ventus – רוח</td></tr>
    <tr><td>🐉 בקוגן</td><td>Aluze / Percival</td></tr>
    <tr><td>⚔️ תפקיד</td><td>חבר Vexos</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>750 → 1050</td></tr>
    <tr><td>🏠 מוצא</td><td>New Vestroia / Vexos</td></tr>
  </table>
</div>
<p>Lync Volan הוא הצעיר ב-Vexos – נראה שטחי ומנוסח, אך בפנים הוא המתלבט ביותר בארגון. הוא לא בטוח שהדרך של ה-Vexos נכונה, ולאורך הסדרה הוא חוקר את ספקותיו.</p>
<p>כ-Ventus Brawler, הוא מהיר ובלתי-צפוי – בדיוק כמו הרוח. הקרב שלו נגד שון הוא אחד הקרבות הדינמיים ביותר בעונה 2.</p>
<h2>🌪️ Aluze ו-Mac Spider</h2>
<p>הבקוגנים העיקריים של Lync. <strong>Aluze</strong> – Ventus מהיר ומתחמק. <strong>Mac Spider</strong> – אסטרטגי עם רשת שמלכד אויבים. G-Power 1050.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מחפש את Perfect Core עבור Vexos</li>
  <li>מתמודד מול שון בקרב Ventus vs Ventus</li>
  <li>ספקות לגבי שיטות ה-Vexos גדלים עם הזמן</li>
  <li>גורלו מתקשר לגורל ה-Alternative Weapon</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>Ventus · 570G</div><div style="background:rgba(255,200,0,0.12);border:1px solid rgba(255,200,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFC800">BakuSolar</strong><br>זוהר שמשי · 730G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>פלדה · 710G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">Clear</strong><br>שקוף יפני · 500G</div><div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Translucent</strong><br>שקיפות · 650G</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/0/06/Image22.png', adminId);

  wikiInsert.run('char-shadow', 'Shadow Prove – Vexos', `
<img src="https://bakugan.wiki/images/9/9f/Image18.png" onerror="this.style.display='none'" alt="Shadow Prove" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Hades / MAC Spider</td></tr>
    <tr><td>⚔️ תפקיד</td><td>חבר Vexos – האכזרי</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1150</td></tr>
    <tr><td>🏠 מוצא</td><td>Vexos</td></tr>
  </table>
</div>
<p>Shadow Prove הוא אחד הנבלים האכזריים ביותר ב-Vexos. הוא אוהב ללחום, לא מגלה רחמים ורוצה לראות כל Resistance Member מובס. אדיש לכאב של אחרים – זאת הנורמה שלו.</p>
<p>הקרב שלו נגד Ace Grit הוא Darkus vs Darkus קלאסי – שני לוחמים חשוכים שמתנגשים.</p>
<h2>🌑 Hades</h2>
<p><strong>Hades</strong> – Darkus Bakugan עצום עם כוח מוחץ. G-Power 1150. מהיר למרות גודלו, ומסוגל לספוג מתקפות שיש בהן כוח עצום.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>שורף את הגשר בין Resistance ל-Perfect Core</li>
  <li>מנצח Ace פעמים בקרבות אלימים</li>
  <li>מפסיד לBattle Brawlers בקרב הסופי</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(80,0,0,0.2);border:1px solid rgba(120,0,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#CC0000">Anime Only</strong><br>MAC Spider – אנימה בלבד</div><div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">Hades BakuCore</strong><br>Darkus · 750G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Hades Steel</strong><br>פלדה · 700G</div><div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Hades Neon</strong><br>ניאון · 730G</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/9/9f/Image18.png', adminId);

  wikiInsert.run('char-gus', 'Gus Grav – עוזרו של Spectra', `
<img src="https://bakugan.wiki/images/6/6d/Image26.png" onerror="this.style.display='none'" alt="Gus Grav" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#CC6600">🪨 Subterra – אדמה</td></tr>
    <tr><td>🐉 בקוגן</td><td>Vulcan / Rex Vulcan</td></tr>
    <tr><td>⚔️ תפקיד</td><td>עוזר Spectra Phantom</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1200</td></tr>
    <tr><td>🏠 מוצא</td><td>New Vestroia / Vexos</td></tr>
  </table>
</div>
<p>Gus Grav הוא העוזר הנאמן של Spectra Phantom – פועל לפי פקודות Spectra ללא עוררין. הנאמנות שלו מוחלטת. Subterra Brawler חזק שמעדיף כוח גולמי על פני אסטרטגיה.</p>
<p>כשSpectra עוזב את Vexos, Gus הוא הראשון שעוקב אחריו. הנאמנות שלו היא אחד הדברים הקבועים בסדרה.</p>
<h2>🪨 Rex Vulcan</h2>
<p><strong>Vulcan</strong> → <strong>Rex Vulcan</strong> – Subterra Bakugan ענק עם כוח השמדה. G-Power 1200. מסוגל לחצות כל הגנה פיזית.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>עוזר לSpectra לחטוף את Drago</li>
  <li>עוזב את Vexos אחרי Spectra</li>
  <li>נלחם לצד Resistance בקרב הסופי</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">BakuCore</strong><br>Subterra · 550G</div><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">BakuBronze</strong><br>ברונזה · 670G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Steel</strong><br>פלדה · S2</div><div style="background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00F0FF">Translucent</strong><br>שקוף · 600G</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/6/6d/Image26.png', adminId);

  wikiInsert.run('char-hydron', 'Prince Hydron – נסיך ה-Vexos', `
<img src="https://bakugan.wiki/images/0/0a/Chara_hydron.png" onerror="this.style.display='none'" alt="Prince Hydron" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#0088FF">💧 Aquos – מים</td></tr>
    <tr><td>🐉 בקוגן</td><td>Dryoid / Farbros</td></tr>
    <tr><td>⚔️ תפקיד</td><td>נסיך ה-Vexos</td></tr>
    <tr><td>📺 עונות</td><td>2</td></tr>
    <tr><td>💪 G-Power</td><td>1000 → 1400</td></tr>
    <tr><td>🏠 מוצא</td><td>Vexos</td></tr>
  </table>
</div>
<p>Prince Hydron הוא בנו של King Zenoheld – נסיך ה-Vexos ש-אביו לא מעריך אותו. הוא אסף 6 בקוגן ממד Vestroia והפך אותם לאבן כדי להוכיח את עצמו לאביו. אך אביו לא אכפת לו ממנו.</p>
<p>הטרגדיה של Hydron היא ניסיון תמידי לזכות באהבת אב שלא יכול לאהוב. אחת הדמויות הטרגיות ביותר בסדרה.</p>
<h2>💧 Dryoid ו-Farbros</h2>
<p><strong>Dryoid</strong> – Aquos Bakugan חזק. <strong>Farbros</strong> – מכונת קרב ענקית. G-Power 1400.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>אוסף את בקוגן ה-Resistance ומפסיל אותם לאבן</li>
  <li>מנסה ומנסה לקבל הכרה מאביו</li>
  <li>גורלו הטרגי בסיום הסדרה</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(0,100,200,0.15);border:1px solid rgba(0,130,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0082FF">Anime Only</strong><br>Dryoid – אנימה בלבד; לא יצא כצעצוע</div><div style="background:rgba(100,200,255,0.1);border:1px solid rgba(100,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#64C8FF">Farbros BakuCore</strong><br>Aquos · 900G</div><div style="background:rgba(150,150,200,0.1);border:1px solid rgba(150,150,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9696C8">Farbros Steel</strong><br>פלדה · 870G</div></div>
<div style="clear:both"></div>
`, 2, 'characters', 'https://bakugan.wiki/images/0/0a/Chara_hydron.png', adminId);

  // ──── Season 3 extra ────

  wikiInsert.run('char-nurzak', 'Nurzak – חכם Neathia', `
<img src="https://bakugan.wiki/images/3/39/Nurzak_GI.png" onerror="this.style.display='none'" alt="Nurzak" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#0088FF">💧 Aquos – מים</td></tr>
    <tr><td>🐉 בקוגן</td><td>Sabator</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Twelve Orders → עובר לצד Neathia</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>950 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Nurzak הוא הזקן החכם ב-Twelve Orders של Barodius. שלא כמו שאר הפקודים, הוא שואל שאלות ולא מסכים עם שיטות האכזריות של Barodius. הוא מייצג את הגונדליים שרוצים שלום.</p>
<p>כשNurzak מגלה שBarodius מקריב גם את עמו לשם כוח – הוא עובר לצד Neathia יחד עם Kazarina. אחד מסעות הגאולה הטובים בעונה 3.</p>
<h2>💧 Sabator</h2>
<p>Sabator – Subterra Bakugan חזק ועצמתי. G-Power 1100. נאמן לNurzak בכל מצב.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מסרב להרוג שחקנים אנושיים ללא סיבה</li>
  <li>עובר לצד Neathia לאחר שחשף את אמת Barodius</li>
  <li>מסייע בהגנה על Sacred Orb</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">Pyrus</strong><br>770–880G</div><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">Subterra</strong><br>630G</div><div style="background:rgba(0,200,100,0.1);border:1px solid rgba(0,200,100,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C864">Ventus</strong><br>760–800G</div><div style="background:rgba(100,0,200,0.12);border:1px solid rgba(130,0,230,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#8200E6">Darkus</strong><br>760G</div><div style="background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FFD700">Haos</strong><br>650G</div></div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/3/39/Nurzak_GI.png', adminId);

  wikiInsert.run('char-stoica', 'Stoica – Twelve Orders', `
<img src="https://bakugan.wiki/images/7/74/Stoica_GI.png" onerror="this.style.display='none'" alt="Stoica" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#0088FF">💧 Aquos – מים</td></tr>
    <tr><td>🐉 בקוגן</td><td>Lythirus</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Twelve Orders – האכזרי</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>950 → 1150</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Stoica הוא אחד הנבלים האכזריים ב-Twelve Orders – נהנה מסבל של אחרים ולא מגלה רחמים. מנהל קרבות בסטייל שמשדר כוח מוחלט.</p>
<p>כ-Aquos Brawler, הוא חזק במים ובסביבות לחות. Lythirus הוא הבקוגן שלו – מהיר ומסוכן.</p>
<h2>💧 Lythirus</h2>
<p>Lythirus – Aquos Bakugan בצורת נחש-ים ענק. G-Power 1150. מהיר כמים ועוקב אחר האויב ללא הרף.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>פועל בשליחות Barodius בכוח ואכזריות</li>
  <li>מתנגש עם Ren כשהוא עובר צד</li>
  <li>מנצח כמה Battle Brawlers בקרבות ביניים</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(0,153,255,0.1);border:1px solid rgba(0,153,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0099FF">Aquos</strong><br>Lythirus · 900G</div><div style="background:rgba(0,200,100,0.1);border:1px solid rgba(0,200,100,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#00C864">BakuBoost</strong><br>Aquos · 950G</div><div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF9600">BakuTriad</strong><br>Aquos · 800G</div><div style="background:rgba(0,153,255,0.1);border:1px solid rgba(0,153,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0099FF">Standard</strong><br>950–1150G · S3</div></div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/7/74/Stoica_GI.png', adminId);

  wikiInsert.run('char-gill', 'Gill – גנרל Pyrus', `
<img src="https://bakugan.wiki/images/6/64/Gil.png" onerror="this.style.display='none'" alt="Gill" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#FF4500">🔥 Pyrus – אש</td></tr>
    <tr><td>🐉 בקוגן</td><td>Krakix</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Twelve Orders – גנרל</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>1000 → 1200</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Gill הוא הגנרל של Twelve Orders – לוחם Pyrus חסר-פחד שרוצה רק ניצחון. הוא ישר לנקודה, לא מבזבז מילים, ולא מוכן לקבל תבוסה. אחד הנבלים החזקים ביותר בעונה 3.</p>
<p>הבגידה שלו בKazarina מוכיחה שגם בין הנבלים אין נאמנות – כולם מאבקים על מעמד אצל Barodius.</p>
<h2>🔥 Krakix</h2>
<p>Krakix – Pyrus Bakugan ענק ועוצמתי בצורת לוחם-שריון. G-Power 1200. מתקפות אש שמסוגלות לשרוף כל דבר.</p>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>מוביל מתקפות ראשיות על Neathia</li>
  <li>בוגד בKazarina כשBarodius מחליט שהיא מיותרת</li>
  <li>מתמודד מול דן בקרבות אש מול אש</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF9600">BakuTriad</strong><br>Pyrus · 620–650G</div><div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">BakuBoost</strong><br>Pyrus · 800G</div><div style="background:rgba(30,30,30,0.2);border:1px solid rgba(80,80,80,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#888888">BakuStealth</strong><br>Darkus · 790G</div><div style="background:rgba(100,80,60,0.1);border:1px solid rgba(120,100,80,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#786450">BakuGranite</strong><br>Darkus · 790G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">Clear</strong><br>שקוף · 780G</div></div>
<div style="clear:both"></div>
`, 3, 'characters', 'https://bakugan.wiki/images/6/64/Gil.png', adminId);

  wikiInsert.run('char-linehalt', 'Linehalt – Forbidden Power', `
<img src="https://bakugan.wiki/images/d/de/BK_Linehalt.png" onerror="this.style.display='none'" alt="Linehalt" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#9B00FF">🌑 Darkus – חשכה</td></tr>
    <tr><td>👤 בעלים</td><td>Ren Krawler</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>800 → 1000+</td></tr>
    <tr><td>🏠 מוצא</td><td>Gundalia</td></tr>
  </table>
</div>
<p>Linehalt הוא בקוגן ה-Darkus הייחודי ביותר בעונה 3 – מחזיק ב-<strong>Forbidden Power</strong>, כוח כה אדיר שגם הבקוגן שמחזיק בו עלול להיפגע. הכוח הזה מסוגל לשנות את מהלך קרב בשנייה אחת.</p>
<h2>🌑 Forbidden Power</h2>
<div style="background:rgba(155,0,255,0.08);border:1px solid rgba(155,0,255,0.3);border-radius:12px;padding:1rem;margin:1rem 0">
  <p><strong>Forbidden Power</strong> הוא כוח שנאסר על שימוש בגלל עוצמתו הבלתי נשלטת. Linehalt אוגר את הכוח הזה בתוכו – וכשמשחרר אותו, הוא יכול להשמיד כל אויב, אך גם לפגוע בRen עצמו.</p>
</div>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Dark Pulse</strong> – גל Darkus מוחץ</li>
  <li><strong>Shadow Saber</strong> – חרב חשכה</li>
  <li><strong>Forbidden Burst</strong> – שחרור Forbidden Power המלא</li>
</ul>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>שותף לRen בגיוס שחקנים – גם כשRen משקר</li>
  <li>עוברים יחד לצד Neathia</li>
  <li>Forbidden Power מגיע לשיא בקרב הסופי מול Barodius</li>
</ul>

<h2>🃏 קלפי כוח (Ability Cards)</h2>
<table style="width:100%;border-collapse:collapse;font-size:0.82rem;margin-bottom:1rem">
  <tr style="background:rgba(155,0,255,0.12)"><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">קלף</th><th style="padding:0.4rem 0.7rem;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1)">אפקט</th></tr>
  <tr><td style="padding:0.35rem 0.7rem">Dark Saber</td><td style="padding:0.35rem 0.7rem">-300 G מהיריב</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Razen Breaker</td><td style="padding:0.35rem 0.7rem">+400 G לLinehalt</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Dark Javelin</td><td style="padding:0.35rem 0.7rem">מעביר 400 G מהיריב לLinehalt</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Gigarth Ray</td><td style="padding:0.35rem 0.7rem">-400 G מהיריב</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Bolting Vibra</td><td style="padding:0.35rem 0.7rem">מבטל יכולת יריב ו-300 G</td></tr>
  <tr style="background:rgba(255,255,255,0.03)"><td style="padding:0.35rem 0.7rem">Darkness Blizzard</td><td style="padding:0.35rem 0.7rem">מבטל את יכולת היריב לחלוטין</td></tr>
  <tr><td style="padding:0.35rem 0.7rem">Ice Crasher</td><td style="padding:0.35rem 0.7rem">מבטל את ה-Gate Card של היריב</td></tr>
</table>

<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0">
  <div style="background:rgba(155,0,255,0.1);border:1px solid rgba(155,0,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#9B00FF">BakuShadow</strong><br>גרסת צל · Darkus</div>
  <div style="background:rgba(50,50,80,0.2);border:1px solid rgba(100,100,150,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#AAAACC">BakuMetalix</strong><br>גרסה מתכתית · S3</div>
  <div style="background:rgba(200,200,200,0.08);border:1px solid rgba(200,200,200,0.2);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#DDDDDD">Translucent</strong><br>שקוף למחצה · S3</div>
  <div style="background:rgba(100,0,150,0.15);border:1px solid rgba(150,0,200,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#AA00EE">Evil Twin</strong><br>תאום רשע · חבילה כפולה</div>
</div>
<div style="clear:both"></div>
`, 3, 'bakugan', 'https://bakugan.wiki/images/d/de/BK_Linehalt.png', adminId);

  wikiInsert.run('char-coredem', 'Coredem – Subterra Titan', `
<img src="https://bakugan.wiki/images/d/d1/BC_Coredem_3.png" onerror="this.style.display='none'" alt="Coredem" loading="lazy" class="wiki-char-img">
<div class="wiki-infobox">
  <table>
    <tr><td>🎨 תכונה</td><td style="color:#CC6600">🪨 Subterra – אדמה</td></tr>
    <tr><td>👤 בעלים</td><td>Jake Vallory</td></tr>
    <tr><td>⚔️ תפקיד</td><td>Guardian Bakugan</td></tr>
    <tr><td>📺 עונות</td><td>3</td></tr>
    <tr><td>💪 G-Power</td><td>900 → 1100</td></tr>
    <tr><td>🏠 מוצא</td><td>Neathia</td></tr>
  </table>
</div>
<p>Coredem הוא הבקוגן הסובטרה של Jake Vallory – ענק בצורת לוחם-סלע עם ידיים כמו פטישים. גדול, כבד ועוצמתי – ממש כמו Jake עצמו.</p>
<p>גוף האדמה שלו מסוגל לספוג מכות ישירות שהיו מפילות בקוגן אחרים, וכוחו נמדד בטונות של כוח גולמי.</p>
<h2>⚡ כוחות מיוחדים</h2>
<ul>
  <li><strong>Rock Hammer</strong> – מכת פטיש סלע ישירה</li>
  <li><strong>Subterra Quake</strong> – גל רעידת אדמה</li>
  <li><strong>Stone Shield</strong> – מגן סלע בלתי ניתן לחדירה</li>
</ul>
<h2>📖 רגעים מרכזיים</h2>
<ul>
  <li>נלחם ביחד עם Jake תחת שליטה מנטלית גונדלית</li>
  <li>כשJake משוחרר – Coredem חוזר לנאמנות מלאה</li>
  <li>שותף לקרב הסופי מול Barodius ו-Dharak</li>
</ul>
<h2>🎲 Special Treatment – גרסאות אספנות</h2>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem;margin:0.75rem 0"><div style="background:rgba(180,100,50,0.1);border:1px solid rgba(180,100,50,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C87840">Subterra Standard</strong><br>900G · GI</div><div style="background:rgba(100,80,60,0.1);border:1px solid rgba(100,80,60,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#786450">BakuNano</strong><br>חיבור קטן · S3</div><div style="background:rgba(255,150,0,0.1);border:1px solid rgba(255,150,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF9600">BakuTriad</strong><br>Subterra · 800G</div><div style="background:rgba(255,69,0,0.1);border:1px solid rgba(255,69,0,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#FF4500">BakuBoost</strong><br>Pyrus · 880G</div><div style="background:rgba(200,200,255,0.1);border:1px solid rgba(200,200,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#C8C8FF">Clear</strong><br>שקוף · 850G</div><div style="background:rgba(0,136,255,0.1);border:1px solid rgba(0,136,255,0.3);border-radius:8px;padding:0.5rem;text-align:center;font-size:0.78rem"><strong style="color:#0088FF">Aquos</strong><br>650G · גרסה נדירה</div></div>
<div style="clear:both"></div>
`, 3, 'bakugan', 'https://bakugan.wiki/images/d/d1/BC_Coredem_3.png', adminId);

  const rulesInsert = db.prepare(`INSERT INTO rules (season, season_name, title, content, order_num) VALUES (?, ?, ?, ?, ?)`);

  /* ── עונה 1 – Battle Brawlers ── */
  rulesInsert.run(1, 'עונה 1 – Battle Brawlers', 'ציוד נדרש לכל שחקן', `
<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1rem">
  <img src="https://bakugan.wiki/images/6/6d/Dan_large.png" onerror="this.style.display='none'" alt="דן קוסו" style="width:120px;border-radius:10px;border:2px solid rgba(255,100,0,0.4);object-fit:cover">
  <div>
    <p style="margin-bottom:0.75rem">כל שחקן מצייד את עצמו לפני תחילת המשחק:</p>
    <ul>
      <li><strong>3 כדורי Bakugan</strong> – כל הבקוגנים בחפיסה חייבים להיות עד G-Power מקסימלי של <strong>1500G</strong> בסך הכול</li>
      <li><strong>3 Gate Cards</strong> – קלפי שדה המשחק</li>
      <li><strong>3 Ability Cards</strong> – קלפי יכולת שניתן להפעיל במהלך קרב</li>
      <li>❌ אין אביזרים (Accessories) בעונה זו</li>
    </ul>
  </div>
</div>
`, 1);

  rulesInsert.run(1, 'עונה 1 – Battle Brawlers', 'תחילת המשחק', `
<p>לפני שמתחילים:</p>
<ol>
  <li>כל שחקן בוחר את שלושת הבקוגנים שלו ושם אותם בצד כדורים סגורים</li>
  <li><strong>הטלת מטבע</strong> – המנצח בהטלה בוחר מי מניח קלף שדה (Gate Card) ראשון</li>
  <li>השחקן שהניח את קלף השדה הראשון מתחיל את הסיבוב הראשון</li>
  <li>שחקן יכול להניח את קלף השדה <strong>כרטיס פנוי למטה</strong> (בסתר) ולהפוך אותו רק כשקרב מתחיל עליו</li>
</ol>
`, 2);

  rulesInsert.run(1, 'עונה 1 – Battle Brawlers', 'מהלך תור', `
<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1rem">
  <img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="קרב בקוגן" style="width:140px;border-radius:10px;border:2px solid rgba(255,100,0,0.4);object-fit:cover">
  <div>
    <p>בכל תור, שחקן פועל לפי הסדר הבא:</p>
    <ol>
      <li><strong>הנחת Gate Card (אופציונלי)</strong> – אם יש בידך Gate Cards, תוכל להניח אחד על הרצפה לפני הגלגול</li>
      <li><strong>גלגול Bakugan</strong> – גלגל כדור Bakugan לכיוון Gate Card כלשהו. הכדור חייב לגלגל מרחק של לפחות שני קלפי שדה</li>
      <li>אם הכדור נפל על Gate Card ואין שם בקוגן של יריב – הכדור פשוט נח שם</li>
      <li>אם הכדור נפל על Gate Card <strong>שיש שם כבר בקוגן של יריב</strong> – מתחיל <strong>קרב!</strong></li>
      <li>אם הכדור החטיא – קח אותו חזרה ליד שלך</li>
    </ol>
  </div>
</div>
`, 3);

  rulesInsert.run(1, 'עונה 1 – Battle Brawlers', 'מערכת הקרב', `
<p>כאשר שני בקוגנים נפגשים על Gate Card:</p>
<ol>
  <li>שני השחקנים הופכים את הקלף פנים-למעלה (אם היה כרטיס פנוי למטה)</li>
  <li>כל שחקן בודק את ה-<strong>G-Power</strong> הבסיסי של הבקוגן שלו</li>
  <li>מוסיפים את <strong>בונוס האלמנט</strong> של Gate Card (לשחקן עם האלמנט התואם)</li>
  <li>כל שחקן יכול לשחק עד <strong>Ability Card אחד</strong> (בתנאי שהתנאים עליו מתקיימים)</li>
  <li><strong>סדר עדיפות Ability Cards:</strong>
    <ul>
      <li>שחקן הלוחם (זה שגלגל ונחת) מפעיל כרטיס יכולת ראשון</li>
      <li>לאחר מכן, שחקן ההגנה יכול להגיב עם כרטיס יכולת</li>
    </ul>
  </li>
  <li>השחקן עם ה-G-Power <strong>הגבוה ביותר</strong> מנצח את הקרב ולוקח את ה-Gate Card</li>
  <li>הבקוגן המנצח חוזר ליד שלו כ"כדור" (stand-by). הבקוגן המפסיד עובר ל<strong>Used Pile</strong> (ערמת שימוש)</li>
</ol>
<p style="margin-top:0.75rem;color:var(--accent)"><strong>⚠️ Used Pile:</strong> בקוגן שנכנס ל-Used Pile לא יכול לחזור לשימוש עד סוף הסיבוב הנוכחי</p>
`, 4);

  rulesInsert.run(1, 'עונה 1 – Battle Brawlers', 'תנאי ניצחון וכללים נוספים', `
<ul>
  <li>🏆 <strong>ניצחון:</strong> השחקן הראשון שאוסף <strong>3 Gate Cards</strong> מנצח במשחק</li>
  <li>📦 <strong>אזילת Bakugan:</strong> אם שחקן איבד את כל הבקוגנים שלו ב-Used Pile לפני שאסף 3 Gate Cards – המשחק ממשיך; השחקן פשוט לא יכול לגלגל עוד עד שסיבוב חדש יתחיל</li>
  <li>🔄 <strong>סיום סיבוב:</strong> כאשר כל Gate Cards שבשטח נלקחו, מתחיל סיבוב חדש. שחקנים מחזירים Bakugan מה-Used Pile ליד שלהם</li>
  <li>🎯 <strong>Gate Card ריקה:</strong> שחקן יכול להניח Gate Card שנייה מעל Gate Card ריקה (שאין עליה בקוגן) – מותר!</li>
</ul>
`, 5);

  rulesInsert.run(1, 'עונה 1 – Battle Brawlers', 'Special Treatment (יחס מיוחד)', `
<p>כמה מהבקוגנים בעלי כללים מיוחדים המשנים את אופן המשחק:</p>
<ul>
  <li><strong>Dual Attribute Bakugan</strong> – בקוגן עם שתי אלמנטים; מקבל בונוס Gate Card משני האלמנטים</li>
  <li><strong>Clear Bakugan</strong> – בקוגן שקוף ללא אלמנט; מועיל ביחוד עם Gate Cards שמשפיעים על כל האלמנטים</li>
  <li><strong>Special Evolution</strong> – בקוגן שיכול להתפתח במהלך קרב אם מתקיים תנאי מסוים שרשום על Ability Card</li>
  <li><strong>Opened Bakugan:</strong> כמה בקוגנים כשהם נפתחים ועומדים על Gate Card נותנים בונוס G-Power אוטומטי</li>
</ul>
`, 6);

  /* ── עונה 2 – New Vestroia ── */
  rulesInsert.run(2, 'עונה 2 – New Vestroia', 'ציוד נדרש לכל שחקן', `
<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1rem">
  <img src="https://bakugan.wiki/images/6/6d/Dan_large.png" onerror="this.style.display='none'" alt="דן קוסו NV" style="width:120px;border-radius:10px;border:2px solid rgba(0,180,255,0.4);object-fit:cover">
  <div>
    <p>עונה 2 מוסיפה את ה-<strong>Trap Bakugan</strong> לחפיסה:</p>
    <ul>
      <li><strong>3 כדורי Bakugan (Guardian)</strong> – G-Power מקסימלי של <strong>1700G</strong> בסך הכול</li>
      <li><strong>Trap Bakugan אחד</strong> – חייב להיות <strong>אותו אלמנט</strong> כמו אחד הבקוגנים הגארדיין שלך. ה-Trap מגיע בנפרד בלי G-Power בסיסי</li>
      <li><strong>3 Gate Cards</strong></li>
      <li><strong>3 Ability Cards</strong></li>
    </ul>
  </div>
</div>
`, 1);

  rulesInsert.run(2, 'עונה 2 – New Vestroia', 'כללי Trap Bakugan', `
<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1rem">
  <img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="Trap Bakugan" style="width:130px;border-radius:10px;border:2px solid rgba(0,180,255,0.4);object-fit:cover">
  <div>
    <p>ה-<strong>Trap Bakugan</strong> הוא בקוגן עזר שניתן לפרוס בקרב:</p>
    <ol>
      <li>בזמן קרב (לאחר שנפתחו הבקוגנים), שחקן יכול להכריז על שימוש ב-Trap</li>
      <li>ה-Trap נגלל ישירות לתוך Gate Card שבה מתרחש הקרב</li>
      <li>ה-G-Power של ה-Trap מתווסף ל-G-Power של ה-Guardian שלך</li>
      <li>גם היריב יכול להפעיל Trap משלו באותו קרב</li>
      <li>ה-Trap חייב לשייך לאותו אלמנט כמו ה-Guardian בקרב זה</li>
    </ol>
  </div>
</div>
`, 2);

  rulesInsert.run(2, 'עונה 2 – New Vestroia', 'מהלך המשחק (זהה לעונה 1 עם שינויים)', `
<p>כללי הבסיס זהים לעונה 1 עם ההבדלים הבאים:</p>
<ul>
  <li>לפני גלגול Bakugan ניתן גם לגלגל <strong>Trap</strong> לשדה המשחק כחלק מהתור</li>
  <li>ה-Trap נוחת ב-Gate Card ולא מצטרף לקרב עד שה-Guardian שלו נמצא גם הוא שם</li>
  <li>ה-G-Power הכולל של Trap + Guardian נספרים ביחד בקרב</li>
  <li>אם ה-Trap הופסד בקרב – גם הוא עובר ל-Used Pile</li>
  <li>🏆 <strong>ניצחון:</strong> 3 Gate Cards (זהה לעונה 1)</li>
</ul>
`, 3);

  rulesInsert.run(2, 'עונה 2 – New Vestroia', 'Special Treatment (יחס מיוחד)', `
<ul>
  <li><strong>Subterra Trap (Baliton):</strong> בקוגן Trap מסוג Subterra שמסוגל לפרוס אפקט Gate Card נוסף</li>
  <li><strong>Mechanical Bakugan:</strong> בקוגנים מכניים (כמו Shadow Wing) פועלים בכללי Trap – ניתן לחבר אותם לגארדיין ולהוסיף G-Power</li>
  <li><strong>Evolution Bakugan:</strong> בקוגנים שהתפתחו (כמו Neo Dragonoid) יכולים לפתוח מחדש את הלחימה עם G-Power גבוה יותר</li>
  <li><strong>BakuNano (בחלק מהקבוצות):</strong> בחלק מגרסאות השחקן יכול לצרף BakuNano שמוסיף G-Power קבוע בקרב</li>
</ul>
`, 4);

  /* ── עונה 3 – Gundalian Invaders ── */
  rulesInsert.run(3, 'עונה 3 – Gundalian Invaders', 'ציוד נדרש לכל שחקן', `
<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1rem">
  <img src="https://bakugan.wiki/images/f/fb/Fusion_Dragonoid_Appears.jpg" onerror="this.style.display='none'" alt="GI בקוגן" style="width:130px;border-radius:10px;border:2px solid rgba(150,50,255,0.4);object-fit:cover">
  <div>
    <p>עונה 3 מוסיפה <strong>2 אביזרים</strong> ומערכת <strong>Power Level</strong>:</p>
    <ul>
      <li><strong>3 כדורי Bakugan (Guardian)</strong> – G-Power מקסימלי של <strong>2300G</strong> בסך הכול</li>
      <li><strong>2 אביזרים</strong> – שילוב אפשרי: 1 Trap + 1 BakuGear, 2 Traps, או 1 Trap + 1 BakuNano</li>
      <li><strong>3 Gate Cards</strong></li>
      <li><strong>3 Ability Cards</strong></li>
      <li><strong>2 Reference Cards</strong> – קלפי עזר שמגדירים את G-Power של הבקוגן בכל שלב</li>
    </ul>
  </div>
</div>
`, 1);

  rulesInsert.run(3, 'עונה 3 – Gundalian Invaders', 'מערכת Power Level', `
<p>עונה 3 מציגה מערכת <strong>Power Level</strong> – שחקנים עוקבים אחרי רמת הכוח בזמן קרב:</p>
<ol>
  <li>בתחילת קרב – כל שחקן מניח את ה-<strong>Reference Card</strong> שלו לצד הבקוגן ומציין את נקודת ה-G-Power ההתחלתית</li>
  <li>כל Ability Card ששחקן מפעיל <strong>מוסיף או מוריד G-Power</strong> – מסמנים את השינוי על Reference Card</li>
  <li>לאחר שכל הכרטיסים הופעלו – בודקים מי עם G-Power גבוה יותר</li>
  <li>אם יש שוויון ב-G-Power – <strong>שני הבקוגנים חוזרים ליד שלהם</strong> ואין מנצח</li>
</ol>
`, 2);

  rulesInsert.run(3, 'עונה 3 – Gundalian Invaders', 'כלל ה-Evolve', `
<div style="display:flex;gap:1.5rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:1rem">
  <img src="https://bakugan.wiki/images/6/6d/Dan_large.png" onerror="this.style.display='none'" alt="Evolve" style="width:110px;border-radius:10px;border:2px solid rgba(150,50,255,0.4);object-fit:cover">
  <div>
    <p>בעונה 3, כמה בקוגנים יכולים <strong>להתפתח (Evolve)</strong> למצב גבוה יותר:</p>
    <ol>
      <li>כדי להפעיל Evolve – שחקן מחליף את כדור הבקוגן הנוכחי בגרסה המפותחת שלו</li>
      <li><strong>ההתפתחות מבזבזת תור!</strong> – השחקן שהפעיל Evolve <strong>מדלג על התור הבא</strong> שלו</li>
      <li>הבקוגן המפותח מתחיל עם G-Power הגבוה מהבקוגן המקורי</li>
      <li>ניתן לבצע Evolve רק פעם אחת למשחק לכל בקוגן</li>
    </ol>
  </div>
</div>
`, 3);

  rulesInsert.run(3, 'עונה 3 – Gundalian Invaders', 'כללי אביזרים ו-BakuGear', `
<p>ה-<strong>BakuGear</strong> הוא סוג חדש של אביזר שהוצג בעונה 3:</p>
<ul>
  <li><strong>BakuGear</strong> מתחבר ישירות לבקוגן ה-Guardian ומוסיף G-Power קבוע</li>
  <li>ניתן לצרף BakuGear לבקוגן <strong>לפני גלגולו</strong> – הוא ייסע ביחד עם הבקוגן</li>
  <li>אם BakuGear מצורף – הוא נלחם יחד עם הבקוגן ב-G-Power המשולב</li>
  <li>אם הבקוגן עם BakuGear מפסיד – גם ה-BakuGear עובר ל-Used Pile</li>
  <li>כל שחקן יכול להחזיק עד <strong>2 אביזרים בסך הכול</strong> (Trap + BakuGear, שני Traps, וכו')</li>
</ul>
`, 4);

  rulesInsert.run(3, 'עונה 3 – Gundalian Invaders', 'Special Treatment (יחס מיוחד)', `
<ul>
  <li><strong>Mobile Assault Vehicles (MAV):</strong> בקוגנים גדולים מיוחדים שדורשים מרחב פתיחה של 4 קלפים; יכולים להכיל בקוגנים נוספים בתוכם</li>
  <li><strong>BakuTriad:</strong> שלושה בקוגנים שיחד יוצרים יצור ענק – ה-G-Power הוא סכום שלושתם</li>
  <li><strong>DNA Bakugan:</strong> בקוגן מיוחד שמקבל +X לכל G-Power מ-Ability Card שמופעל נגדו</li>
  <li><strong>Mechtogan:</strong> יצור מיוחד שמופעל אוטומטית כשה-Guardian שלו גולל 6 פעמים רצופות על אותה Gate Card</li>
</ul>
`, 5);

  const eventInsert = db.prepare(`INSERT INTO events (title, description, event_date, location, max_participants, event_type, status, prize, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  eventInsert.run(
    'טורניר פתיחת העונה 2026',
    'הטורניר הראשון של השנה! מגרש חינמי לכולם. הביאו את החפיסות הטובות ביותר שלכם!',
    '2026-06-15T10:00',
    'תל אביב – מרכז הנוער',
    32,
    'tournament',
    'upcoming',
    'גביע + סט כרטיסי מהדורה מוגבלת',
    adminId
  );

  eventInsert.run(
    'ערב שחקנים ירושלים',
    'ערב אתגרים ידידותיים בירושלים. מתאים לכל הרמות!',
    '2026-05-20T18:00',
    'ירושלים – בית הנוער',
    20,
    'casual',
    'upcoming',
    '',
    adminId
  );

  const threadInsert = db.prepare(`INSERT INTO forum_threads (category_id, user_id, title, content, is_pinned) VALUES (?, ?, ?, ?, ?)`);
  threadInsert.run(1, adminId, 'ברוכים הבאים לפורום בקוגן ישראל! 🎉', 'שלום לכולם וברוכים הבאים לפורום הקהילה שלנו! כאן תוכלו לדון, לשתף ולהתחבר עם שחקנים אחרים בישראל.', 1);
  threadInsert.run(4, adminId, 'טיפים לבניית חפיסה מנצחת', 'אשמח לשמוע את הטיפים שלכם לבניית חפיסה. מה הבקוגנים המועדפים עליכם?', 0);
}

module.exports = { db, initDB };
