// Bakugan Israel – All Episodes
// Source: https://www.youtube.com/playlist?list=PLZIlBv3nBuXfdluVi9Aun2dH4b45C8tNK

const SEASONS = [
  {
    num: 1,
    title: 'Battle Brawlers',
    titleHe: 'לוחמי הבקוגן',
    totalEps: 52,
    color: '#FF4500',
    icon: '🔥',
    description: 'עונה 1 – דן קוסו ו-Drago מתגלים כבקוגן בראלרס ונאבקים נגד סילנט נאגה שרוצה לשלוט בבקוגן אינטר-דימנשן',
    episodes: [
      { id: 'ukaEdx2DZug', ep: 1, title: 'פרק 1' },
      { id: 'X62FxGR50tA', ep: 2, title: 'פרק 2' },
      { id: 'Zt6kg71_gM0', ep: 4, title: 'פרק 4' },
      { id: 'qzKM-GwoKtY', ep: 5, title: 'פרק 5' },
      { id: 'VrwYPw4syw4', ep: 6, title: 'פרק 6' },
      { id: 'kTpz_2fHg1M', ep: 7, title: 'פרק 7 – Bakugan Idol' },
      { id: 'nPcJxKZqYqc', ep: 8, title: 'פרק 8' },
      { id: '7kWTbBZSRlY', ep: 9, title: 'פרק 9' },
      { id: 'uazKAsVmIK0', ep: 10, title: 'פרק 10' },
      { id: 'V74-x35a8sU', ep: 11, title: 'פרק 11' },
      { id: 'VKDde1UJaew', ep: 12, title: 'פרק 12' },
      { id: 'PdZVXmvWah4', ep: 13, title: 'פרק 13' },
      { id: 'IL9dLOeZ-30', ep: 14, title: 'פרק 14' },
      { id: '702YEFKdFp4', ep: 15, title: 'פרק 15' },
      { id: '38dkufvGcfw', ep: 16, title: 'פרק 16' },
      { id: 'tSk6y1aD-iU', ep: 18, title: 'פרק 18' },
      { id: 'uQ1T_W6ZrCY', ep: 19, title: 'פרק 19' },
      { id: 'M_oeUpAQkkQ', ep: 20, title: 'פרק 20' },
      { id: 'wga6byKXWg0', ep: 21, title: 'פרק 21' },
      { id: 'mSxy8zK8ur8', ep: 22, title: 'פרק 22' },
      { id: 'ahfmd8-PU_k', ep: 23, title: 'פרק 23' },
      { id: '7Y24vTgrWuk', ep: 24, title: 'פרק 24' },
      { id: 'emXo1t7gutU', ep: 25, title: 'פרק 25' },
      { id: 'DBDD29w4BHk', ep: 26, title: 'פרק 26' },
      { id: 'Om2HltB77yo', ep: 27, title: 'פרק 27' },
      { id: 'WwSEwdJhKwU', ep: 28, title: 'פרק 28' },
      { id: 'PNpk_J0gV9s', ep: 29, title: 'פרק 29' },
      { id: 'yY6I2RKwpjI', ep: 30, title: 'פרק 30' },
      { id: '_9uZqZ_kEwU', ep: 31, title: 'פרק 31' },
      { id: '30PMF0LbPoQ', ep: 32, title: 'פרק 32' },
      { id: 'cTUlNq-B2f0', ep: 33, title: 'פרק 33' },
      { id: 'uqQ5tqSBRDo', ep: 34, title: 'פרק 34' },
      { id: 'p_F5V7kOxIE', ep: 35, title: 'פרק 35' },
      { id: 'PABt2hy0Rs8', ep: 36, title: 'פרק 36' },
      { id: 'IiJGQYfOwwI', ep: 37, title: 'פרק 37' },
      { id: '5WW8-RrmGLo', ep: 38, title: 'פרק 38' },
      { id: 'zHKlDFeZMOk', ep: 39, title: 'פרק 39' },
      { id: 'ui9CBk7t0EQ', ep: 40, title: 'פרק 40' },
      { id: '9JVyKglmlMQ', ep: 41, title: 'פרק 41' },
      { id: 'kiTrcdJ1LUE', ep: 42, title: 'פרק 42' },
      { id: 'NuXO_sAIv0M', ep: 43, title: 'פרק 43' },
      { id: 'gtD_gg6FxTw', ep: 45, title: 'פרק 45' },
      { id: 'DMRCXrdvXXE', ep: 46, title: 'פרק 46' },
      { id: 'k0FTiGeJpqI', ep: 47, title: 'פרק 47' },
      { id: 'zb8Ea39lbsw', ep: 48, title: 'פרק 48' },
      { id: 'i8FyTH3MdeE', ep: 49, title: 'פרק 49 – Showdown in Wardington' },
      { id: 'GfzyLdZm4T0', ep: 50, title: 'פרק 50' },
      { id: 'aQmFm6E4zSU', ep: 51, title: 'פרק 51' },
      { id: '38uf3CShN0s', ep: 52, title: 'פרק 52' },
    ]
  },
  {
    num: 2,
    title: 'New Vestroia',
    titleHe: 'וסטרויה החדשה',
    totalEps: 52,
    color: '#0099FF',
    icon: '💧',
    description: 'עונה 2 – דן חוזר לוסטרויה שנכבשה על ידי הוסטלים. Spectra Phantom ו-Viper Helios מאתגרים את הבראולרס',
    episodes: [
      { id: 'KRz87f7JYd4', ep: 1, title: 'פרק 1' },
      { id: '-hrkPmQVqno', ep: 2, title: 'פרק 2' },
      { id: '8OFfPx4gakk', ep: 3, title: 'פרק 3' },
      { id: 'e9lu_xmZw5A', ep: 4, title: 'פרק 4' },
      { id: '4Zq1TW-fIFU', ep: 5, title: 'פרק 5' },
      { id: 'LtlfwWERx58', ep: 6, title: 'פרק 6' },
      { id: 'IGvHc8j3t_k', ep: 7, title: 'פרק 7' },
      { id: '6lydKLWZqKA', ep: 9, title: 'פרק 9' },
      { id: '9RdDCGri_aM', ep: 10, title: 'פרק 10' },
      { id: 'nlhodzHqBAI', ep: 11, title: 'פרק 11' },
      { id: 'gk-2mLmXtSE', ep: 12, title: 'פרק 12' },
      { id: 'Lfn2u26JxPU', ep: 13, title: 'פרק 13' },
      { id: 'VU2sfhhq5kQ', ep: 14, title: 'פרק 14' },
      { id: '0t2BOkEBbW0', ep: 15, title: 'פרק 15' },
      { id: 'ZPjv9ZbhOQo', ep: 16, title: 'פרק 16' },
      { id: 'q3kVH-BCbvU', ep: 17, title: 'פרק 17' },
      { id: '1vZ5THu5TH8', ep: 18, title: 'פרק 18' },
      { id: 'vcQyypT_8VM', ep: 19, title: 'פרק 19' },
      { id: '5JKDz1aEGo8', ep: 20, title: 'פרק 20' },
      { id: 'P4VHgJ0qruc', ep: 21, title: 'פרק 21' },
      { id: 'n26pRF8GPkc', ep: 22, title: 'פרק 22' },
      { id: 'A5WN9TEGS3c', ep: 23, title: 'פרק 23' },
      { id: 'Ji87pqxOZXE', ep: 24, title: 'פרק 24' },
      { id: 'nMG_h7roh3Q', ep: 25, title: 'פרק 25' },
      { id: 'ICcGAMfBMQQ', ep: 26, title: 'פרק 26' },
      { id: 'MtAaPRmH2wI', ep: 27, title: 'פרק 27' },
      { id: 'k0rITqkHpJk', ep: 28, title: 'פרק 28' },
      { id: '0PqqgpF_JEc', ep: 29, title: 'פרק 29' },
      { id: 'mtO7Ta0XZSk', ep: 30, title: 'פרק 30' },
      { id: 'pi-sUP1IhDc', ep: 31, title: 'פרק 31' },
      { id: 'MXStYQSLd_M', ep: 32, title: 'פרק 32' },
      { id: 'xJSBH5rB9Oc', ep: 33, title: 'פרק 33' },
      { id: 'puAWndxkSfM', ep: 34, title: 'פרק 34' },
      { id: 'PdKSVLU5wOo', ep: 35, title: 'פרק 35' },
      { id: 'Z9g0VsLD6v8', ep: 36, title: 'פרק 36' },
      { id: 'thLmJJoy_BM', ep: 37, title: 'פרק 37' },
      { id: '2NH8xwRJLdE', ep: 39, title: 'פרק 39' },
      { id: 'K_6zchAMpoQ', ep: 40, title: 'פרק 40' },
      { id: '6G7vAJreBM4', ep: 41, title: 'פרק 41' },
      { id: 'FDBbGiu3yAQ', ep: 43, title: 'פרק 43' },
      { id: 'Y1GFV431Ars', ep: 44, title: 'פרק 44' },
      { id: 'Yujbu3AKRhI', ep: 45, title: 'פרק 45' },
      { id: 'gy7A_ILz7jE', ep: 46, title: 'פרק 46' },
      { id: 'H7g59YD8b6k', ep: 47, title: 'פרק 47' },
      { id: 'AzNreYSwxu8', ep: 48, title: 'פרק 48' },
      { id: 'GiHWJP_2rRw', ep: 49, title: 'פרק 49' },
      { id: 'mzmxjFU8gKw', ep: 50, title: 'פרק 50' },
      { id: 'yQJFtrGnM_w', ep: 51, title: 'פרק 51' },
      { id: 'SDws9aUjGnE', ep: 52, title: 'פרק 52' },
    ]
  },
  {
    num: 3,
    title: 'Gundalian Invaders',
    titleHe: 'פולשי גונדאליה',
    totalEps: 39,
    color: '#8B00FF',
    icon: '⚡',
    description: 'עונה 3 – הבקוגן בראולרס נגד צבא הגונדאלים בהנהגת הקיסר Barodius ו-Kazarina האכזרית',
    episodes: [
      { id: '-Gae-wBQu0U', ep: 1, title: 'פרק 1 – A New Beginning' },
      { id: 'aXbwaoS-uVI', ep: 2, title: 'פרק 2' },
      { id: 'cbKpMeqj85Y', ep: 3, title: 'פרק 3' },
      { id: 'Wos5trleKlc', ep: 4, title: 'פרק 4' },
      { id: 'CZlYrzdnN8Y', ep: 5, title: 'פרק 5' },
      { id: 'Hnh7GsR7Ouo', ep: 6, title: 'פרק 6' },
      { id: 'eru4xwtaYwg', ep: 7, title: 'פרק 7' },
      { id: 're2Hk9WwpdY', ep: 8, title: 'פרק 8' },
      { id: 'R-bF4AO-zIw', ep: 9, title: 'פרק 9' },
      { id: 'UImeKTxmJhk', ep: 10, title: 'פרק 10' },
      { id: 'pqpI9ZScYPc', ep: 11, title: 'פרק 11' },
      { id: 'U_-dBTqSGEA', ep: 12, title: 'פרק 12' },
      { id: 'DOcmrwjYhBI', ep: 13, title: 'פרק 13' },
      { id: 'AsjAYQFBvpE', ep: 14, title: 'פרק 14' },
      { id: 'gedeDHllC2Q', ep: 15, title: 'פרק 15' },
      { id: 'OLUt_2XXBeE', ep: 16, title: 'פרק 16' },
      { id: '-APrPuYvD9w', ep: 17, title: 'פרק 17 – Battle for the Second Shield' },
      { id: '232_sG_7zkA', ep: 18, title: 'פרק 18 – Curtain Call' },
      { id: 'BI6zBuQ8NJ4', ep: 19, title: 'פרק 19 – The Secret of the Orb' },
      { id: 'VaYF5UxsxQw', ep: 20, title: 'פרק 20 – Partners till the End' },
      { id: '86CmcRoodoI', ep: 21, title: 'פרק 21 – Divide and Conquer' },
      { id: 'ltYpm-tLSGo', ep: 22, title: 'פרק 22 – Mobile Assault' },
      { id: '-qEIItCyVnY', ep: 23, title: 'פרק 23 – Sid Returns' },
      { id: '2QZc_jyrOdU', ep: 24, title: 'פרק 24 – Colossus Dharak' },
      { id: 'fyTCEEyGLuU', ep: 25, title: 'פרק 25 – Dragonoid Colossus' },
      { id: 'O9G8wqo7yQY', ep: 26, title: 'פרק 26 – Forgiveness' },
      { id: 'hX4O8_5QBkw', ep: 27, title: 'פרק 27 – Into the Storm' },
      { id: 'wv_euq2Z3H8', ep: 28, title: 'פרק 28 – Jake Returns' },
      { id: 'Ty61IspKXj4', ep: 29, title: 'פרק 29 – Genesis' },
      { id: '0DFLthYfX-s', ep: 30, title: 'פרק 30 (חלק 1)', part: 1 },
      { id: 'FA-iFX8AXkQ', ep: 30, title: 'פרק 30 (חלק 2)', part: 2 },
      { id: '2b4qDXFsT9M', ep: 32, title: 'פרק 32 – Redemption' },
      { id: 's3s-HTDm3N8', ep: 33, title: 'פרק 33 – Jake\'s Last Stand' },
      { id: '_zU94BPnwNU', ep: 34, title: 'פרק 34 – Final Strike' },
      { id: 'HhHnE6SpcUc', ep: 35, title: 'פרק 35 – Dream Escape' },
      { id: 'i-17ygWNEtw', ep: 36, title: 'פרק 36 (חלק 1)', part: 1 },
      { id: 'FgDT0o63Gb4', ep: 36, title: 'פרק 36 (חלק 2)', part: 2 },
      { id: 'eXs5XiiTVqY', ep: 37, title: 'פרק 37 – Broken Spell' },
      { id: '6KJPHyJAB08', ep: 38, title: 'פרק 38 – Code Eve' },
      { id: 'S30VXdSMETo', ep: 39, title: 'פרק 39 – Destiny Revealed' },
    ]
  },
  {
    num: 4,
    title: 'Mechtanium Surge',
    titleHe: 'גל המכטניום',
    totalEps: 46,
    color: '#FFD700',
    icon: '⚙️',
    description: 'עונה 4 – Mag Mel וחיית הכאוס Razenoid מאיימים לפרוץ לעולם. דן ו-Drago נאבקים בנבואה אפוקליפטית',
    episodes: [
      { id: 'YDTN3NLzclY', ep: 1, title: 'פרק 1 – Interspace Showdown', part: 1 },
      { id: 'FdOHl6wX_cM', ep: 1, title: 'פרק 1 – Interspace Showdown', part: 2 },
      { id: 'EXtNePqESNw', ep: 2, title: 'פרק 2 – Mechtogan Mayhem', part: 1 },
      { id: 'MnXrMxa8eQo', ep: 2, title: 'פרק 2 – Mechtogan Mayhem', part: 2 },
      { id: 'CGYp7JSzcCo', ep: 3, title: 'פרק 3 – Disconnect', part: 1 },
      { id: 'HTGivjlutqQ', ep: 3, title: 'פרק 3 – Disconnect', part: 2 },
      { id: 'zR_t2qyAky8', ep: 4, title: 'פרק 4 – Fall From Grace', part: 1 },
      { id: 'AE9OKwLesvc', ep: 4, title: 'פרק 4 – Fall From Grace', part: 2 },
      { id: 'pqVbngiUd80', ep: 5, title: 'פרק 5 – Tri-Twister Take Down', part: 1 },
      { id: 'LHFlnwr32Es', ep: 5, title: 'פרק 5 – Tri-Twister Take Down', part: 2 },
      { id: 'MpdrBIa4RW0', ep: 6, title: 'פרק 6 – Agony of Defeat', part: 1 },
      { id: 'JRpkBopV3Ow', ep: 6, title: 'פרק 6 – Agony of Defeat', part: 2 },
      { id: 'dvh_3rX94fk', ep: 7, title: 'פרק 7 – BakuNano Explosion', part: 1 },
      { id: 'TUnUvlUzVVU', ep: 7, title: 'פרק 7 – BakuNano Explosion', part: 2 },
      { id: 'eruleESvOgU', ep: 8, title: 'פרק 8 – Return to New Vestroia', part: 1 },
      { id: 'zOM01OLioDA', ep: 8, title: 'פרק 8 – Return to New Vestroia', part: 2 },
      { id: 'rAtmUKgNQU8', ep: 9, title: 'פרק 9 – Chaos Control', part: 1 },
      { id: 'IGO4_TqgWFU', ep: 9, title: 'פרק 9 – Chaos Control', part: 2 },
      { id: '1blqwIrOriw', ep: 10, title: 'פרק 10 – A Royale Pain', part: 1 },
      { id: 'tF9apoB4ets', ep: 10, title: 'פרק 10 – A Royale Pain', part: 2 },
      { id: 'JKEhRdhNWew', ep: 11, title: 'פרק 11 – Back in Sync', part: 1 },
      { id: 'q_ZRBWLokUY', ep: 11, title: 'פרק 11 – Back in Sync', part: 2 },
      { id: 'Y73ddoKkQoY', ep: 12, title: 'פרק 12 – Mind Search', part: 1 },
      { id: 'XbLE-t5Qw8g', ep: 12, title: 'פרק 12 – Mind Search', part: 2 },
      { id: 'HJKsKlA-UQM', ep: 13, title: 'פרק 13 – Re-Connection', part: 1 },
      { id: '6GeKL9DYhuw', ep: 13, title: 'פרק 13 – Re-Connection', part: 2 },
      { id: 'JuH25MHIVnk', ep: 14, title: 'פרק 14 – Triple Threat', part: 1 },
      { id: 'JUOWx9oAOSQ', ep: 14, title: 'פרק 14 – Triple Threat', part: 2 },
      { id: 'I7oNdjMBC2w', ep: 15, title: 'פרק 15 – Interspace Under Siege', part: 1 },
      { id: 'FCnY9igNe1M', ep: 15, title: 'פרק 15 – Interspace Under Siege', part: 2 },
      { id: 'RiNHrI37N8k', ep: 16, title: 'פרק 16 – A Hero Returns', part: 1 },
      { id: 'p8QuBQs09z0', ep: 16, title: 'פרק 16 – A Hero Returns', part: 2 },
      { id: 'DZ4nlJ_jyOs', ep: 17, title: 'פרק 17 – Gundalia Under Fire', part: 1 },
      { id: 'zP8VW-V05Ys', ep: 17, title: 'פרק 17 – Gundalia Under Fire', part: 2 },
      { id: 'oAchS5y8dKs', ep: 18, title: 'פרק 18 – Battle Lines', part: 1 },
      { id: 'c84nnrkstJY', ep: 18, title: 'פרק 18 – Battle Lines', part: 2 },
      { id: 'a5cE5qHCFvE', ep: 19, title: 'פרק 19 – Unlocking the Gate', part: 1 },
      { id: 'qAS-mZtw2OI', ep: 19, title: 'פרק 19 – Unlocking the Gate', part: 2 },
      { id: 'pvwiQuTA4NQ', ep: 20, title: 'פרק 20 – True Colours', part: 1 },
      { id: 'QNtI5qZb-TE', ep: 20, title: 'פרק 20 – True Colours', part: 2 },
      { id: 'l45x2131YVc', ep: 21, title: 'פרק 21 – Dangerous Beauty', part: 1 },
      { id: 'u6rxR984hVY', ep: 21, title: 'פרק 21 – Dangerous Beauty', part: 2 },
      { id: 'GyGxKcMcK6c', ep: 22, title: 'פרק 22 – Unfinished Business', part: 1 },
      { id: 'h1nB8bNs6_g', ep: 22, title: 'פרק 22 – Unfinished Business', part: 2 },
      { id: 'U-XBP1ouV2c', ep: 23, title: 'פרק 23 – Behind the Mask', part: 1 },
      { id: 'BIkpaX4fT-g', ep: 23, title: 'פרק 23 – Behind the Mask', part: 2 },
      { id: 'oXK37k7pu4Q', ep: 24, title: 'פרק 24 – Interspace Armageddon', part: 1 },
      { id: 'Bbp_I-JJi4Y', ep: 24, title: 'פרק 24 – Interspace Armageddon', part: 2 },
      { id: 'O9cS8m-8EdE', ep: 25, title: 'פרק 25 – Dark Moon', part: 1 },
      { id: 'mPx3AyF5Mb4', ep: 25, title: 'פרק 25 – Dark Moon', part: 2 },
      { id: 'aAw1EEUSaj4', ep: 26, title: 'פרק 26 – The Final Takedown', part: 1 },
      { id: 'Bfki8njKmUs', ep: 26, title: 'פרק 26 – The Final Takedown', part: 2 },
      { id: 'CNF_oGA9UVg', ep: 27, title: 'פרק 27 – Evil Arrival', part: 1 },
      { id: '9Vkw4919vbo', ep: 27, title: 'פרק 27 – Evil Arrival', part: 2 },
      { id: '71kzxZt9isM', ep: 28, title: 'פרק 28 – Wiseman Cometh', part: 1 },
      { id: '0A-JxbzZJ2A', ep: 28, title: 'פרק 28 – Wiseman Cometh', part: 2 },
      { id: 'wOw4qx_YjlM', ep: 29, title: 'פרק 29 – Mysterious Bond' },
      { id: 'iEYcroR0S8Q', ep: 30, title: 'פרק 30 – The Prodigal Bakugan' },
      { id: '36PXKPV8FMo', ep: 31, title: 'פרק 31 – Combination Impossible' },
      { id: 'lzy7TIrXUDg', ep: 32, title: 'פרק 32 – Enemy Allies' },
      { id: 'nIXAYY6HK64', ep: 33, title: 'פרק 33 – Battle for Bakugan Land' },
      { id: 'dL5Dshl434M', ep: 34, title: 'פרק 34', part: 1 },
      { id: 'uNTnFYyEHVU', ep: 34, title: 'פרק 34', part: 2 },
      { id: 'aztN87JCN1M', ep: 35, title: 'פרק 35 – Battle Suit Bash' },
      { id: 'sTJbcoGz2a4', ep: 36, title: 'פרק 36', part: 1 },
      { id: 'cd4WKZsWrCE', ep: 36, title: 'פרק 36', part: 2 },
      { id: 'P4msQMkL-C0', ep: 37, title: 'פרק 37 – The Eve of Extermination' },
      { id: 'LsCnuoTmPT4', ep: 38, title: 'פרק 38 – Jump to Victory' },
      { id: 'B0RykbMRmzg', ep: 39, title: 'פרק 39', part: 1 },
      { id: 'IzaBMLMOYOY', ep: 39, title: 'פרק 39', part: 2 },
      { id: '2K6HlEqE0kQ', ep: 40, title: 'פרק 40', part: 1 },
      { id: 'WlWkTuaDYVw', ep: 40, title: 'פרק 40', part: 2 },
      { id: 'U7KknIvHge0', ep: 41, title: 'פרק 41 – Evil Evolution' },
      { id: 'up6Ga4zcvMg', ep: 42, title: 'פרק 42', part: 1 },
      { id: 'TWn7uXosJ6Q', ep: 42, title: 'פרק 42', part: 2 },
      { id: 'OEM9RMwMcu8', ep: 43, title: 'פרק 43 – Doom Dimension Throwdown' },
      { id: 'L6ALUu8x5XM', ep: 44, title: 'פרק 44', part: 1 },
      { id: '7jfiPBQQkOU', ep: 44, title: 'פרק 44', part: 2 },
      { id: 'GhsBLC9K_XI', ep: 45, title: 'פרק 45' },
      { id: 'jU5mX0FjjAE', ep: 46, title: 'פרק 46 – Endings' },
    ]
  }
];

let currentSeason = 1;
let epPlayer = null;

function initEpisodes() {
  renderSeasonTabs();
  showSeason(1);
}

function renderSeasonTabs() {
  const tabs = document.getElementById('season-tabs');
  tabs.innerHTML = SEASONS.map(s => `
    <button class="ep-season-tab ${s.num === 1 ? 'active' : ''}"
      onclick="showSeason(${s.num})"
      id="tab-s${s.num}"
      style="--tab-color:${s.color}">
      <span class="tab-icon">${s.icon}</span>
      <span class="tab-label">עונה ${s.num}</span>
      <span class="tab-name">${s.titleHe}</span>
    </button>
  `).join('');
}

function showSeason(num) {
  currentSeason = num;
  SEASONS.forEach(s => {
    const tab = document.getElementById(`tab-s${s.num}`);
    if (tab) tab.classList.toggle('active', s.num === num);
  });

  const season = SEASONS.find(s => s.num === num);
  if (!season) return;

  const info = document.getElementById('season-info');
  info.style.borderColor = season.color;
  info.innerHTML = `
    <div class="season-info-icon">${season.icon}</div>
    <div>
      <div class="season-info-title" style="color:${season.color}">${season.icon} עונה ${season.num} – ${season.titleHe}</div>
      <div class="season-info-sub">${season.description}</div>
      <div class="season-info-stats">
        <span>📺 ${season.totalEps} פרקים</span>
        <span>🎬 ${season.episodes.length} קטעי וידאו</span>
      </div>
    </div>
  `;

  const grid = document.getElementById('episodes-grid');
  const byEp = {};
  season.episodes.forEach(e => {
    if (!byEp[e.ep]) byEp[e.ep] = [];
    byEp[e.ep].push(e);
  });

  grid.innerHTML = Object.entries(byEp)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([epNum, parts]) => {
      const epTitle = parts[0].title.replace(/ \(חלק \d+\)/, '').replace(/ part \d+$/i, '');
      if (parts.length === 1) {
        const e = parts[0];
        return `
          <div class="ep-card" onclick="playEpisode('${e.id}','${epTitle.replace(/'/g, "\\'")}',${season.num})" style="--ep-color:${season.color}">
            <div class="ep-thumb">
              <img src="https://img.youtube.com/vi/${e.id}/mqdefault.jpg" alt="" loading="lazy">
              <div class="ep-play-btn">▶</div>
              <div class="ep-num-badge" style="background:${season.color}">${epNum}</div>
            </div>
            <div class="ep-card-body">
              <div class="ep-card-title">${epTitle.replace(/פרק \d+ – ?/, '') || 'פרק ' + epNum}</div>
              <div class="ep-card-meta">פרק ${epNum}</div>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="ep-card ep-card-split" style="--ep-color:${season.color}">
            <div class="ep-thumb">
              <img src="https://img.youtube.com/vi/${parts[0].id}/mqdefault.jpg" alt="" loading="lazy">
              <div class="ep-num-badge" style="background:${season.color}">${epNum}</div>
            </div>
            <div class="ep-card-body">
              <div class="ep-card-title">${epTitle.replace(/פרק \d+ – ?/, '') || 'פרק ' + epNum}</div>
              <div class="ep-card-meta">פרק ${epNum}</div>
              <div class="ep-parts">
                ${parts.map(p => `
                  <button class="ep-part-btn" onclick="playEpisode('${p.id}','${epTitle.replace(/'/g,"\\'")} חלק ${p.part || parts.indexOf(p)+1}',${season.num})" style="--btn-color:${season.color}">
                    ▶ חלק ${p.part || parts.indexOf(p) + 1}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');
}

function playEpisode(videoId, title, seasonNum) {
  const season = SEASONS.find(s => s.num === seasonNum);
  const color = season?.color || '#FF6600';

  document.getElementById('player-title').textContent = title;
  document.getElementById('player-title').style.color = color;
  document.getElementById('player-season-label').textContent = `עונה ${seasonNum} – ${season?.titleHe || ''}`;
  document.getElementById('player-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  buildEpPlayer(videoId);
}

function buildEpPlayer(videoId) {
  const container = document.getElementById('yt-ep-player');
  container.innerHTML = '<div id="yt-ep-inner"></div>';

  if (window.YT && window.YT.Player) {
    createEpPlayer(videoId);
  } else {
    window._pendingEpVideo = videoId;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }
}

function createEpPlayer(videoId) {
  epPlayer = new YT.Player('yt-ep-inner', {
    host: 'https://www.youtube-nocookie.com',
    videoId,
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      cc_load_policy: 1,
      cc_lang_pref: 'iw',
      hl: 'iw',
      enablejsapi: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: e => e.target.playVideo(),
    }
  });
}

window.onYouTubeIframeAPIReady = function () {
  if (window._pendingEpVideo) {
    createEpPlayer(window._pendingEpVideo);
    window._pendingEpVideo = null;
  }
};

function closePlayer() {
  const modal = document.getElementById('player-modal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = '';
  if (epPlayer && typeof epPlayer.stopVideo === 'function') {
    try { epPlayer.stopVideo(); epPlayer.destroy(); epPlayer = null; } catch (e) {}
  }
  const container = document.getElementById('yt-ep-player');
  if (container) container.innerHTML = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePlayer();
});

// Run when DOM is ready — works whether script runs mid-parse or after
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEpisodes);
} else {
  initEpisodes();
}
