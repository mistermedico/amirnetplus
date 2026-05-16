import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions, Platform, Alert, Switch,
  TextInput, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');

// ─── IN-MEMORY STORAGE ──────────────────────────────────────────────────────
const _mem = {};
const Storage = {
  get: (k) => Promise.resolve(_mem[k] ?? null),
  set: (k, v) => { _mem[k] = v; return Promise.resolve(); },
};

// ─── THEME ──────────────────────────────────────────────────────────────────
const C = {
  primary:   '#1e40af',
  primaryLt: '#3b82f6',
  success:   '#15803d',
  warning:   '#d97706',
  danger:    '#dc2626',
  purple:    '#7c3aed',
  cyan:      '#0891b2',
  bg:        '#f1f5f9',
  card:      '#ffffff',
  text:      '#0f172a',
  muted:     '#64748b',
  border:    '#e2e8f0',
  fill:      '#f8fafc',
};

// ─── TOPICS ─────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: 'networking',       name: 'רשתות תקשורת',     icon: '🌐', color: C.primary,  desc: 'מודל OSI, TCP/IP, ניתוב, Subnetting' },
  { id: 'security',         name: 'אבטחת מידע',        icon: '🔒', color: C.danger,   desc: 'חומות אש, הצפנה, VPN, איומי סייבר' },
  { id: 'operatingSystems', name: 'מערכות הפעלה',      icon: '💻', color: C.success,  desc: 'Windows Server, Linux, ניהול שרתים' },
  { id: 'cloud',            name: 'ענן ווירטואליזציה', icon: '☁️', color: C.cyan,     desc: 'AWS, Azure, VMware, Docker' },
  { id: 'itManagement',     name: 'ניהול IT',           icon: '👥', color: C.warning,  desc: 'ITIL, SLA, Change Management' },
  { id: 'protocols',        name: 'פרוטוקולים',         icon: '🔄', color: C.purple,   desc: 'HTTP, DNS, DHCP, TCP/UDP, FTP' },
];
const topicById = id => TOPICS.find(t => t.id === id);

// ─── QUESTIONS ───────────────────────────────────────────────────────────────
const QS = [
  { id:'n1', q:'כמה שכבות יש במודל OSI?', opts:['5','6','7','8'], a:2, exp:'מודל OSI מורכב מ-7 שכבות: פיזית, קישור נתונים, רשת, תחבורה, סשן, מצגת ויישום.', topic:'networking', diff:'easy' },
  { id:'n2', q:'באיזו שכבת OSI פועל פרוטוקול IP?', opts:['שכבה 2 - קישור נתונים','שכבה 3 - רשת','שכבה 4 - תחבורה','שכבה 5 - סשן'], a:1, exp:'פרוטוקול IP פועל בשכבה 3 (שכבת הרשת) ואחראי על הניתוב בין רשתות.', topic:'networking', diff:'easy' },
  { id:'n3', q:'מה הוא ה-Subnet Mask לרשת Class C?', opts:['255.0.0.0','255.255.0.0','255.255.255.0','255.255.255.255'], a:2, exp:'רשת Class C משתמשת ב-255.255.255.0 (/24), עד 254 מארחים.', topic:'networking', diff:'easy' },
  { id:'n4', q:'מה ההבדל בין Router ל-Switch?', opts:['Router שכבה 2, Switch שכבה 3','Router מנתב בין רשתות (שכבה 3), Switch מחבר בתוך רשת (שכבה 2)','אין הבדל','Switch מהיר יותר תמיד'], a:1, exp:'Router פועל בשכבה 3 ומנתב בין רשתות. Switch פועל בשכבה 2 ומחבר מכשירים באותה רשת.', topic:'networking', diff:'medium' },
  { id:'n5', q:'מה המשמעות של CIDR /24?', opts:['24 מארחים ברשת','24 סיביות לרשת, 8 למארח','Subnet Mask 255.255.0.0','24 נתבים ברשת'], a:1, exp:'/24 = 24 סיביות לרשת, Subnet Mask 255.255.255.0, עד 254 מארחים.', topic:'networking', diff:'medium' },
  { id:'n6', q:'מהו טווח כתובות IP פרטיות Class A?', opts:['172.16.0.0–172.31.255.255','192.168.0.0–192.168.255.255','10.0.0.0–10.255.255.255','169.254.0.0–169.254.255.255'], a:2, exp:'Class A פרטי: 10.0.0.0–10.255.255.255.', topic:'networking', diff:'medium' },
  { id:'n7', q:'מה תפקיד פרוטוקול ARP?', opts:['הקצאת IP דינמית','תרגום שם דומיין ל-IP','תרגום IP לכתובת MAC','הצפנת תנועת רשת'], a:2, exp:'ARP ממפה כתובת IP לכתובת MAC ברשת מקומית.', topic:'networking', diff:'medium' },
  { id:'n8', q:'מה הפורט הסטנדרטי של HTTPS?', opts:['80','443','8080','8443'], a:1, exp:'HTTPS פועל על פורט 443. HTTP על פורט 80.', topic:'networking', diff:'easy' },
  { id:'n9', q:'מה ההבדל בין Half-Duplex ל-Full-Duplex?', opts:['Half-Duplex מהיר יותר','Full-Duplex שליחה וקבלה בו-זמנית; Half-Duplex כיוון אחד בכל פעם','Half-Duplex ל-Wireless בלבד','Full-Duplex זול יותר'], a:1, exp:'Full-Duplex = תקשורת דו-כיוונית. Half-Duplex = כיוון אחד בכל פעם.', topic:'networking', diff:'easy' },
  { id:'n10', q:'רשת 192.168.1.0/26 – כמה מארחים?', opts:['30','62','126','254'], a:1, exp:'/26 = 6 סיביות למארח → 2^6-2 = 62 מארחים.', topic:'networking', diff:'hard' },
  { id:'s1', q:'מה ההבדל בין Symmetric ל-Asymmetric Encryption?', opts:['Symmetric מהיר, מפתח אחד; Asymmetric זוג מפתחות','Asymmetric מהיר יותר','Symmetric שני מפתחות','אין הבדל'], a:0, exp:'Symmetric = מפתח אחד (AES). Asymmetric = זוג ציבורי/פרטי (RSA).', topic:'security', diff:'medium' },
  { id:'s2', q:'מה הוא מתקפת Man-in-the-Middle?', opts:['מתקפה על DNS','תוקף מיירט תקשורת בין שני צדדים','הצפת שרת','פרצה בחומת אש'], a:1, exp:'MITM: תוקף מיירט ומסוגל לקרוא/לשנות את התקשורת בין שני צדדים.', topic:'security', diff:'easy' },
  { id:'s3', q:'מהי מתקפת DoS לעומת DDoS?', opts:['DoS ממחשב אחד; DDoS ממחשבים רבים (Botnet)','DDoS מסוכן פחות','זהים לחלוטין','DoS לנתונים, DDoS לרשת'], a:0, exp:'DoS = מחשב אחד. DDoS = אלפי מחשבים (Botnet), קשה יותר לעצירה.', topic:'security', diff:'easy' },
  { id:'s4', q:'מה הוא Stateful Firewall?', opts:['בוחן רק כותרות','עוקב אחר מצב חיבורים ובוחן הקשר','מסנן לפי MAC','ללא תצורה'], a:1, exp:'Stateful Firewall עוקב אחר מצב כל חיבור ומאפשר החלטות מבוססות הקשר.', topic:'security', diff:'medium' },
  { id:'s5', q:'מה ההבדל בין IDS ל-IPS?', opts:['IDS מגיב אוטומטית; IPS רק מזהה','IDS רק מזהה ומתריע; IPS גם חוסם','זהים','IPS ב-Cloud בלבד'], a:1, exp:'IDS = מזהה ומתריע. IPS = מזהה + חוסם באופן אקטיבי.', topic:'security', diff:'medium' },
  { id:'s6', q:'מהו SSL/TLS?', opts:['פרוטוקול ניתוב','פרוטוקול הצפנה לאבטחת תקשורת','מנגנון זיהוי משתמשים','DNS מאובטח'], a:1, exp:'TLS מאבטח תקשורת ברשת (HTTPS). TLS = גרסה מעודכנת של SSL.', topic:'security', diff:'easy' },
  { id:'s7', q:'מה הוא Phishing?', opts:['תוכנה שמצפינה קבצים','הונאה לגניבת פרטים דרך הודעות מזויפות','Brute Force על סיסמאות','ניצול חולשה ב-TCP'], a:1, exp:'Phishing = הנדסה חברתית לגניבת פרטים רגישים דרך הודעות מזויפות.', topic:'security', diff:'easy' },
  { id:'s8', q:'מה הוא VPN?', opts:['רשת וירטואלית פרטית המצפינה תנועה ויוצרת מנהרה מאובטחת','סוג חומת אש','פרוטוקול ניתוב','שירות אנטי-וירוס'], a:0, exp:'VPN = מנהרה מוצפנת ברשת ציבורית, גישה מאובטחת למשאבים פרטיים.', topic:'security', diff:'easy' },
  { id:'o1', q:'מה הוא Active Directory?', opts:['אנטי-וירוס של Microsoft','שירות ספריה לניהול משתמשים, קבוצות ומשאבים ברשת','פרוטוקול ניתוב','מנגנון גיבוי'], a:1, exp:'Active Directory = ניהול מרכזי של משתמשים, מחשבים ומדיניות אבטחה.', topic:'operatingSystems', diff:'easy' },
  { id:'o2', q:'מה ההבדל בין Domain Controller ל-Member Server?', opts:['DC מנהל AD; Member Server חבר בדומיין','Member Server חזק יותר','DC ל-Linux בלבד','אין הבדל'], a:0, exp:'DC = מריץ AD DS. Member Server = חבר בדומיין, לא מריץ AD DS.', topic:'operatingSystems', diff:'medium' },
  { id:'o3', q:'יתרון NTFS על FAT32?', opts:['NTFS מהיר אך לא תומך בקבצים גדולים','NTFS תומך בהרשאות, הצפנה, דחיסה, קבצים מעל 4GB','FAT32 מתקדם יותר','זהים'], a:1, exp:'NTFS = הרשאות, EFS הצפנה, דחיסה, ללא הגבלת 4GB. FAT32 מוגבל ל-4GB לקובץ.', topic:'operatingSystems', diff:'medium' },
  { id:'o4', q:'פקודת בדיקת IP ב-Windows?', opts:['ipconfig','ifconfig','netstat','ping'], a:0, exp:'Windows: ipconfig. Linux/macOS: ifconfig או ip addr.', topic:'operatingSystems', diff:'easy' },
  { id:'o5', q:'מה הוא Group Policy (GPO)?', opts:['מדיניות קבוצתית ב-AD לניהול הגדרות מחשבים ומשתמשים','תוכנת גיבוי','פרוטוקול אבטחה','שירות DHCP'], a:0, exp:'GPO = ניהול מרכזי של הגדרות בדומיין: סיסמאות, אבטחה, מיפוי כוננים.', topic:'operatingSystems', diff:'medium' },
  { id:'o6', q:'פקודת Linux להצגת כל הקבצים כולל מוסתרים?', opts:['ls -a','ls -l','dir /a','show all'], a:0, exp:'ls -a מציגה קבצים כולל מוסתרים (קבצים המתחילים בנקודה).', topic:'operatingSystems', diff:'easy' },
  { id:'o7', q:'מה הוא RAID 5?', opts:['גיבוי לדיסק חיצוני','Striping עם Parity על 3+ דיסקים, עמיד לכשל דיסק אחד','שיקוף בין 2 דיסקים','ללא הגנה'], a:1, exp:'RAID 5 = Striping + Parity מפוזר על 3+ דיסקים. עמיד לכשל דיסק אחד.', topic:'operatingSystems', diff:'medium' },
  { id:'o8', q:'מה הוא Hyper-V?', opts:['אנטי-וירוס','פלטפורמת וירטואליזציה של Microsoft ב-Windows Server','שירות ענן','פרוטוקול גיבוי'], a:1, exp:'Hyper-V = וירטואליזציה מובנית ב-Windows Server ליצירת VMs.', topic:'operatingSystems', diff:'easy' },
  { id:'c1', q:'מה ההבדל בין IaaS, PaaS ו-SaaS?', opts:['זהים, שמות שונים','IaaS=תשתית; PaaS=פלטפורמה; SaaS=תוכנה מוכנה','SaaS מאובטח יותר','PaaS לחברות גדולות'], a:1, exp:'IaaS=EC2 (תשתית). PaaS=App Service (פיתוח). SaaS=Office365 (מוכן).', topic:'cloud', diff:'medium' },
  { id:'c2', q:'מה הוא S3 ב-AWS?', opts:['שירות מחשוב','אחסון אובייקטים (Object Storage)','שירות רשת','מסד נתונים'], a:1, exp:'Amazon S3 = אחסון אובייקטים בענן, זמינות גבוהה, ניתן להרחבה.', topic:'cloud', diff:'easy' },
  { id:'c3', q:'מה הוא VPC ב-AWS?', opts:['מסד נתונים','רשת וירטואלית פרטית עם שליטה מלאה','שירות Backup','DNS ב-AWS'], a:1, exp:'VPC = רשת וירטואלית מבודדת ב-AWS עם שליטה ב-IP, Subnets, Routing.', topic:'cloud', diff:'medium' },
  { id:'c4', q:'ההבדל בין Public Cloud ל-Private Cloud?', opts:['Public מאובטח יותר','Public=תשתית משותפת; Private=תשתית ייעודית לארגון','Private תמיד זול','אין הבדל'], a:1, exp:'Public (AWS/Azure) = שירותים משותפים. Private = תשתית ייעודית, אבטחה גבוהה.', topic:'cloud', diff:'easy' },
  { id:'c5', q:'מה הוא Docker?', opts:['מערכת הפעלה','פלטפורמת Containerization להרצת אפליקציות מבודדות','שפת תכנות','כלי גיבוי'], a:1, exp:'Docker = אריזת אפליקציה ב-Container עם יחסי תלות, ריצה אחידה בכל סביבה.', topic:'cloud', diff:'medium' },
  { id:'c6', q:'ההבדל בין Virtualization ל-Containerization?', opts:['Container כבד יותר','VM מריץ OS מלא; Container חולק Kernel ויעיל יותר','אין הבדל','VM מהיר יותר'], a:1, exp:'VM = OS מלא לכל מכונה (כבד). Container = חולק Kernel, קל ומהיר.', topic:'cloud', diff:'medium' },
  { id:'c7', q:'מה הוא Auto Scaling?', opts:['הגדלה ידנית','הוספה/הסרה אוטומטית של משאבים לפי עומס','גיבוי אוטומטי','עדכון תוכנה'], a:1, exp:'Auto Scaling = הוספת/הסרת משאבים אוטומטית לפי עומס, ביצועים + חיסכון.', topic:'cloud', diff:'easy' },
  { id:'i1', q:'מה הוא ITIL?', opts:['שפת תכנות','מסגרת Best Practices לניהול שירותי IT','פרוטוקול רשת','מוצר Microsoft'], a:1, exp:'ITIL = Information Technology Infrastructure Library, מסגרת לניהול שירותי IT.', topic:'itManagement', diff:'easy' },
  { id:'i2', q:'ההבדל בין Incident ל-Problem ב-ITIL?', opts:['זהים','Incident=שיבוש בשירות; Problem=גורם שורשי לאירועים חוזרים','Problem קל לפתרון','Incident מטופל אחרי Problem'], a:1, exp:'Incident = שיבוש לא מתוכנן. Problem = Root Cause Analysis למניעת הישנות.', topic:'itManagement', diff:'medium' },
  { id:'i3', q:'מה הוא SLA?', opts:['חוזה חומרה','הסכם רמת שירות: זמינות, זמן תגובה','תוכנת ניהול','תקן אבטחה'], a:1, exp:'SLA = הסכם רשמי הגדרת ציפיות שירות: זמינות, זמן תגובה, זמן שיקום.', topic:'itManagement', diff:'easy' },
  { id:'i4', q:'מה הוא Change Management ב-ITIL?', opts:['ניהול שינויים ארגוניים','ניהול מבוקר של שינויים ב-IT למניעת שיבושים','עדכונים אוטומטיים','ניהול גרסאות'], a:1, exp:'Change Management = RFC, הערכת סיכונים, אישור, ביצוע ותיעוד שינויים ב-IT.', topic:'itManagement', diff:'medium' },
  { id:'i5', q:'מה הם RTO ו-RPO?', opts:['RTO=זמן שיקום מקסימלי; RPO=כמות נתונים מקסימלית שניתן לאבד','שניהם זמן שיקום','RPO מדד ביצועים','RTO לענן בלבד'], a:0, exp:'RTO = זמן שיקום מקסימלי. RPO = כמות נתונים מקסימלית שניתן לאבד (מהגיבוי האחרון).', topic:'itManagement', diff:'hard' },
  { id:'i6', q:'ההבדל בין Help Desk ל-Service Desk?', opts:['זהים','Help Desk=תקלות; Service Desk=נקודת קשר רחבה + בקשות שירות','Service Desk ללקוחות חיצוניים','Help Desk יקר יותר'], a:1, exp:'Help Desk = פתרון תקלות. Service Desk (ITIL) = נקודת קשר יחידה רחבה יותר.', topic:'itManagement', diff:'medium' },
  { id:'p1', q:'הפורט הסטנדרטי של DNS?', opts:['53','80','443','25'], a:0, exp:'DNS פועל על פורט 53 (UDP לשאילתות, TCP להעברות אזור).', topic:'protocols', diff:'easy' },
  { id:'p2', q:'תפקיד פרוטוקול DHCP?', opts:['תרגום שמות דומיין','הקצאה אוטומטית של IP ופרמטרי רשת','הצפנת תקשורת','ניהול ניתוב'], a:1, exp:'DHCP = הקצאה אוטומטית: IP, Subnet Mask, Default Gateway, DNS Server.', topic:'protocols', diff:'easy' },
  { id:'p3', q:'ההבדל בין TCP ל-UDP?', opts:['TCP מהיר; UDP אמין','TCP מבוסס חיבור ואמין; UDP ללא חיבור ומהיר','זהים','UDP תומך הצפנה'], a:1, exp:'TCP = מסירה מסודרת (Handshake). UDP = מהיר, ללא ערבות (DNS, VoIP, Streaming).', topic:'protocols', diff:'easy' },
  { id:'p4', q:'תפקיד SMTP?', opts:['קבלת מיילים','שליחת מיילים בין שרתי דואר','גלישה','העברת קבצים'], a:1, exp:'SMTP = שליחת מיילים, פורט 25/587. IMAP/POP3 = קבלת מיילים.', topic:'protocols', diff:'easy' },
  { id:'p5', q:'HTTP ה-Method הנפוץ ביותר?', opts:['ENCRYPT','GET','ROUTE','QUERY'], a:1, exp:'HTTP = פרוטוקול האינטרנט. GET לבקשת נתונים. POST/PUT/DELETE לפעולות אחרות.', topic:'protocols', diff:'easy' },
  { id:'p6', q:'FTP ועל איזה פורט?', opts:['File Transfer Protocol, פורט 21','File Transfer Protocol, פורט 22','Fast Transfer, פורט 80','File Transfer, פורט 443'], a:0, exp:'FTP = פורט 21 (control), 20 (data). SFTP על 22 מאובטח יותר.', topic:'protocols', diff:'easy' },
  { id:'p7', q:'מהו Three-Way Handshake?', opts:['סגירת חיבור','יצירת חיבור TCP: SYN → SYN-ACK → ACK','שליחת נתונים','בדיקת שגיאות'], a:1, exp:'Three-Way: 1) Client→SYN, 2) Server→SYN-ACK, 3) Client→ACK. חיבור נוצר.', topic:'protocols', diff:'medium' },
  { id:'p8', q:'ההבדל בין IMAP ל-POP3?', opts:['IMAP מסנכרן ושומר בשרת; POP3 מוריד ומוחק','POP3 מודרני יותר','IMAP רק לשליחה','זהים'], a:0, exp:'IMAP (143/993) = מסנכרן, גישה ממכשירים מרובים. POP3 (110/995) = מוריד ומוחק.', topic:'protocols', diff:'medium' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function getQuestions(topicId, count) {
  const pool = topicId ? QS.filter(q => q.topic === topicId) : QS;
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}
function countByTopic(id) { return QS.filter(q => q.topic === id).length; }

// ─── STATE ───────────────────────────────────────────────────────────────────
const INIT = {
  totalAnswered: 0, totalCorrect: 0, topicProgress: {},
  streakDays: 0, lastStudyDate: null, quizHistory: [],
  bookmarkedIds: [], dailyGoal: 20, userName: '', onboarded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...INIT, ...action.payload };
    case 'RECORD': {
      const { questions, answers, startTime } = action.payload;
      let correct = 0;
      const tp = { ...state.topicProgress };
      questions.forEach((q, i) => {
        const ok = answers[i] === q.a;
        if (ok) correct++;
        const p = tp[q.topic] || { answered: 0, correct: 0 };
        tp[q.topic] = { answered: p.answered + 1, correct: p.correct + (ok ? 1 : 0) };
      });
      const secs = (Date.now() - startTime) / 1000;
      const entry = { date: Date.now(), score: correct, total: questions.length, topic: questions[0]?.topic, secs };
      const today = new Date().toDateString();
      const last = state.lastStudyDate ? new Date(state.lastStudyDate).toDateString() : null;
      const diff = last ? Math.floor((new Date(today) - new Date(last)) / 86400000) : -1;
      const streak = diff === 0 ? state.streakDays : diff === 1 ? state.streakDays + 1 : 1;
      return { ...state, totalAnswered: state.totalAnswered + questions.length, totalCorrect: state.totalCorrect + correct, topicProgress: tp, quizHistory: [entry, ...state.quizHistory].slice(0, 100), streakDays: streak, lastStudyDate: Date.now() };
    }
    case 'BOOKMARK': {
      const ids = state.bookmarkedIds.includes(action.id) ? state.bookmarkedIds.filter(x => x !== action.id) : [...state.bookmarkedIds, action.id];
      return { ...state, bookmarkedIds: ids };
    }
    case 'SETTINGS': return { ...state, ...action.payload };
    case 'RESET': return { ...INIT, dailyGoal: state.dailyGoal, userName: state.userName, onboarded: state.onboarded };
    default: return state;
  }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function fmtTime(secs) {
  const m = Math.floor(secs / 60), s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function pct(c, t) { return t > 0 ? Math.round(c / t * 100) : 0; }
function gradeLabel(p) {
  if (p >= 90) return { text: 'מצוין!', color: C.success };
  if (p >= 75) return { text: 'טוב מאוד', color: C.success };
  if (p >= 70) return { text: 'עבר ✓', color: C.success };
  if (p >= 60) return { text: 'כמעט...', color: C.warning };
  return { text: 'נכשל', color: C.danger };
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function Card({ children, style, onPress }) {
  if (onPress) return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[S.card, style]}>{children}</TouchableOpacity>
  );
  return <View style={[S.card, style]}>{children}</View>;
}

function Row({ children, style }) {
  return <View style={[S.row, style]}>{children}</View>;
}

function Pill({ label, color, small }) {
  return (
    <View style={[S.pill, { backgroundColor: color + '20' }]}>
      <Text style={[S.pillTxt, { color, fontSize: small ? 10 : 12 }]}>{label}</Text>
    </View>
  );
}

function Bar({ value, total = 100, color = C.primary, h = 7 }) {
  const w = total > 0 ? Math.min(value / total, 1) * 100 : 0;
  return (
    <View style={[S.barTrack, { height: h }]}>
      <View style={[S.barFill, { width: `${w}%`, backgroundColor: color, height: h }]} />
    </View>
  );
}

function Section({ title }) {
  return <Text style={S.section}>{title}</Text>;
}

function Icon({ name, size = 20, color = C.text }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function CircleScore({ value, color, size = 130 }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * value / 100;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 10, borderColor: C.border, position: 'absolute' }} />
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 10, borderColor: color, position: 'absolute', borderTopColor: 'transparent', borderRightColor: value > 25 ? color : 'transparent', borderBottomColor: value > 50 ? color : 'transparent', borderLeftColor: value > 75 ? color : 'transparent', transform: [{ rotate: '-45deg' }] }} />
      <Text style={{ fontSize: 28, fontWeight: '900', color }}>{value}%</Text>
    </View>
  );
}

// Timer component — keeps its own interval
function ExamTimer({ totalSeconds, onTimeUp }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current); onTimeUp(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);

  const warn = remaining < 120;
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  return (
    <View style={[S.timerBox, { backgroundColor: warn ? C.danger + '15' : C.primary + '10', borderColor: warn ? C.danger : C.primary + '40' }]}>
      <Icon name={warn ? 'warning' : 'time-outline'} size={14} color={warn ? C.danger : C.primary} />
      <Text style={[S.timerTxt, { color: warn ? C.danger : C.primary }]}>
        {mins}:{String(secs).padStart(2, '0')}
      </Text>
    </View>
  );
}

// Animated answer option
function AnswerOption({ text, index, selected, correctIdx, studyMode, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const letters = ['א', 'ב', 'ג', 'ד'];
  const isSelected = selected === index;
  const answered = selected !== null;
  const isCorrect = correctIdx === index;
  const isWrong = isSelected && !isCorrect;

  function handlePress() {
    if (answered) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
    onPress(index);
  }

  let bg = C.card, border = C.border, txtColor = C.text;
  if (answered && studyMode) {
    if (isCorrect) { bg = C.success + '15'; border = C.success; }
    else if (isWrong) { bg = C.danger + '15'; border = C.danger; }
  } else if (isSelected && !studyMode) { bg = C.primary + '12'; border = C.primary; }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} disabled={answered}
        style={[S.option, { backgroundColor: bg, borderColor: border }]} activeOpacity={0.8}>
        <Row>
          {answered && studyMode && isCorrect && <Icon name="checkmark-circle" size={18} color={C.success} />}
          {answered && studyMode && isWrong && <Icon name="close-circle" size={18} color={C.danger} />}
          <Text style={[S.optionTxt, { color: txtColor, flex: 1, textAlign: 'right', marginHorizontal: 8 }]}>{text}</Text>
          <View style={[S.optLetter, { backgroundColor: isSelected ? (isWrong ? C.danger : C.primary) : C.fill }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#fff' : C.muted }}>{letters[index]}</Text>
          </View>
        </Row>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Answer review row in results
function ReviewRow({ q, idx, sel }) {
  const [open, setOpen] = useState(false);
  const ok = sel === q.a;
  return (
    <Card style={{ marginBottom: 8 }}>
      <TouchableOpacity onPress={() => setOpen(o => !o)}>
        <Row>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={14} color={C.muted} />
          <Row style={{ flex: 0 }}>
            <Icon name={ok ? 'checkmark-circle' : 'close-circle'} size={16} color={ok ? C.success : C.danger} />
            <View style={[S.numBadge, { marginRight: 6 }]}><Text style={S.numBadgeTxt}>{idx + 1}</Text></View>
          </Row>
          <Text style={{ flex: 1, textAlign: 'right', fontSize: 13, color: C.text, marginHorizontal: 8 }} numberOfLines={open ? undefined : 2}>{q.q}</Text>
        </Row>
      </TouchableOpacity>
      {open && (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
          {sel !== undefined && sel !== q.a && (
            <Text style={{ textAlign: 'right', fontSize: 12, color: C.danger, marginBottom: 3 }}>תשובתך: {q.opts[sel]}</Text>
          )}
          <Text style={{ textAlign: 'right', fontSize: 12, fontWeight: '700', color: C.success, marginBottom: 3 }}>✓ תשובה נכונה: {q.opts[q.a]}</Text>
          <Text style={{ textAlign: 'right', fontSize: 12, color: C.muted }}>{q.exp}</Text>
        </View>
      )}
    </Card>
  );
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function OnboardingScreen({ onDone }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('20');
  const [step, setStep] = useState(0);

  function finish() {
    onDone({ userName: name.trim() || 'לומד', dailyGoal: parseInt(goal) || 20 });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.primary }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, justifyContent: 'center', padding: 32 }}>
        {step === 0 ? (
          <>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ fontSize: 64, marginBottom: 16 }}>🌐</Text>
              <Text style={{ fontSize: 30, fontWeight: '900', color: '#fff', textAlign: 'center' }}>AmirNet Plus</Text>
              <Text style={{ fontSize: 16, color: '#bfdbfe', textAlign: 'center', marginTop: 8 }}>הכנה מקצועית לבחינת אמירנט</Text>
            </View>
            <View style={{ gap: 12 }}>
              {['49 שאלות ב-6 נושאים', 'בחינות מדומות עם טיימר', 'מעקב התקדמות מפורט', 'מצב לימוד עם הסברים'].map(f => (
                <Row key={f} style={{ alignSelf: 'flex-end' }}>
                  <Text style={{ color: '#bfdbfe', textAlign: 'right', fontSize: 15, marginRight: 8 }}>{f}</Text>
                  <Icon name="checkmark-circle" size={20} color="#4ade80" />
                </Row>
              ))}
            </View>
            <TouchableOpacity style={[S.startBtn, { backgroundColor: '#fff', marginTop: 48 }]} onPress={() => setStep(1)}>
              <Text style={[S.startBtnTxt, { color: C.primary }]}>בוא נתחיל ←</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#fff', textAlign: 'right', marginBottom: 8 }}>ספר לנו קצת</Text>
            <Text style={{ fontSize: 14, color: '#bfdbfe', textAlign: 'right', marginBottom: 32 }}>המידע יעזור לנו להתאים את הלמידה שלך</Text>
            <Text style={{ color: '#bfdbfe', textAlign: 'right', marginBottom: 6, fontSize: 14 }}>מה שמך?</Text>
            <TextInput style={S.onboardInput} value={name} onChangeText={setName} placeholder="הכנס שם..." placeholderTextColor="#93c5fd" textAlign="right" />
            <Text style={{ color: '#bfdbfe', textAlign: 'right', marginTop: 20, marginBottom: 6, fontSize: 14 }}>יעד יומי (שאלות)</Text>
            <Row style={{ gap: 10, alignSelf: 'flex-end' }}>
              {['10','20','30','50'].map(n => (
                <TouchableOpacity key={n} onPress={() => setGoal(n)}
                  style={{ backgroundColor: goal === n ? '#fff' : 'transparent', borderWidth: 1.5, borderColor: '#fff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
                  <Text style={{ color: goal === n ? C.primary : '#fff', fontWeight: '700' }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </Row>
            <TouchableOpacity style={[S.startBtn, { backgroundColor: '#fff', marginTop: 48 }]} onPress={finish}>
              <Text style={[S.startBtnTxt, { color: C.primary }]}>כניסה לאפליקציה ←</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function HomeScreen({ prog, dispatch, onQuiz }) {
  const tp = prog.topicProgress || {};
  const overall = pct(prog.totalCorrect, prog.totalAnswered);
  const todayAns = (prog.quizHistory || []).filter(h => new Date(h.date).toDateString() === new Date().toDateString()).reduce((s, h) => s + h.total, 0);
  const goalDone = todayAns >= prog.dailyGoal;
  const weakTopics = TOPICS.filter(t => { const p = tp[t.id]; return p && p.answered >= 3 && pct(p.correct, p.answered) < 70; });
  const lastTopic = prog.quizHistory?.[0]?.topic ? topicById(prog.quizHistory[0].topic) : null;

  return (
    <ScrollView style={S.screen} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={{ paddingTop: 8, paddingBottom: 16 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={[S.streakBadge]}>
            <Text style={{ fontSize: 13 }}>🔥</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.warning, marginRight: 3 }}>{prog.streakDays || 0} ימים</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 22, fontWeight: '900', color: C.text }}>שלום, {prog.userName || 'לומד'} 👋</Text>
            <Text style={{ fontSize: 13, color: C.muted }}>הכנה לבחינת אמירנט</Text>
          </View>
        </Row>
      </View>

      {/* Daily Goal Card */}
      <Card style={goalDone ? { borderWidth: 1.5, borderColor: C.success + '66', backgroundColor: '#f0fdf4' } : {}}>
        <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <Row style={{ flex: 0 }}>
            <Icon name={goalDone ? 'checkmark-circle' : 'today-outline'} size={15} color={goalDone ? C.success : C.primary} />
            <Text style={{ fontSize: 13, color: goalDone ? C.success : C.primary, fontWeight: '700', marginRight: 4 }}>
              {goalDone ? 'יעד הושג! 🎯' : 'יעד יומי'}
            </Text>
          </Row>
          <Text style={{ fontSize: 20, fontWeight: '900', color: goalDone ? C.success : C.primary }}>{todayAns}/{prog.dailyGoal}</Text>
        </Row>
        <Bar value={todayAns} total={prog.dailyGoal} color={goalDone ? C.success : C.primary} h={9} />
        <Text style={{ textAlign: 'right', fontSize: 11, color: C.muted, marginTop: 6 }}>שאלות שנענו היום</Text>
      </Card>

      {/* Stats Row */}
      <Row style={{ gap: 10, marginBottom: 4 }}>
        {[
          { icon: 'help-circle', val: prog.totalAnswered || 0, lbl: 'שאלות', c: C.primary },
          { icon: 'trophy',      val: overall > 0 ? `${overall}%` : '–', lbl: 'הצלחה', c: overall >= 70 ? C.success : C.warning },
          { icon: 'flame',       val: prog.streakDays || 0, lbl: 'ימי רצף', c: C.warning },
          { icon: 'bookmark',    val: prog.bookmarkedIds?.length || 0, lbl: 'שמורות', c: C.purple },
        ].map(s => (
          <Card key={s.lbl} style={{ flex: 1, alignItems: 'center', padding: 12, marginBottom: 0 }}>
            <Icon name={s.icon} size={20} color={s.c} />
            <Text style={{ fontSize: 18, fontWeight: '900', color: s.c, marginTop: 4 }}>{s.val}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.lbl}</Text>
          </Card>
        ))}
      </Row>

      {/* Quick Actions */}
      <Section title="פעולות מהירות" />
      <Row style={{ gap: 10 }}>
        <Card style={{ flex: 1, alignItems: 'center', padding: 16 }} onPress={() => onQuiz({ count: 10, topic: null, mode: 'exam', timer: 0 })}>
          <Icon name="play-circle" size={32} color={C.primary} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary, marginTop: 6 }}>בחינה מהירה</Text>
          <Text style={{ fontSize: 11, color: C.muted }}>10 שאלות</Text>
        </Card>
        <Card style={{ flex: 1, alignItems: 'center', padding: 16 }} onPress={() => onQuiz({ count: 40, topic: null, mode: 'exam', timer: 45 * 60 })}>
          <Icon name="school" size={32} color={C.danger} />
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.danger, marginTop: 6 }}>בחינה מלאה</Text>
          <Text style={{ fontSize: 11, color: C.muted }}>40 שאלות • 45 דק׳</Text>
        </Card>
        {weakTopics.length > 0 && (
          <Card style={{ flex: 1, alignItems: 'center', padding: 16 }} onPress={() => onQuiz({ count: 10, topic: weakTopics[0].id, mode: 'study', timer: 0 })}>
            <Icon name="fitness" size={32} color={C.warning} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.warning, marginTop: 6 }}>חזק חולשות</Text>
            <Text style={{ fontSize: 11, color: C.muted }}>{weakTopics[0].name}</Text>
          </Card>
        )}
      </Row>

      {/* Last topic resume */}
      {lastTopic && (
        <>
          <Section title="המשך מאיפה שהפסקת" />
          <Card onPress={() => onQuiz({ count: 10, topic: lastTopic.id, mode: 'study', timer: 0 })}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ flex: 0 }}>
                <Icon name="arrow-forward-circle" size={18} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: '700', fontSize: 13, marginRight: 4 }}>המשך</Text>
              </Row>
              <Row style={{ flex: 0 }}>
                <Text style={{ fontWeight: '700', fontSize: 15, marginRight: 6 }}>{lastTopic.name}</Text>
                <Text style={{ fontSize: 22 }}>{lastTopic.icon}</Text>
              </Row>
            </Row>
          </Card>
        </>
      )}

      {/* Weak topics warning */}
      {weakTopics.length > 0 && (
        <>
          <Section title="⚠️ נושאים שדורשים חיזוק" />
          {weakTopics.slice(0, 2).map(t => {
            const p = tp[t.id];
            const p2 = pct(p.correct, p.answered);
            return (
              <Card key={t.id} style={{ marginBottom: 8, borderWidth: 1, borderColor: C.warning + '40' }} onPress={() => onQuiz({ count: 10, topic: t.id, mode: 'study', timer: 0 })}>
                <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <Pill label={`${p2}%`} color={C.warning} />
                  <Row style={{ flex: 0 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14 }}>{t.name}</Text>
                    <Text style={{ fontSize: 20, marginRight: 6 }}>{t.icon}</Text>
                  </Row>
                </Row>
                <Bar value={p2} total={100} color={C.warning} h={5} />
              </Card>
            );
          })}
        </>
      )}

      {/* Topics overview */}
      <Section title="סקירת נושאים" />
      {TOPICS.map(t => {
        const p = tp[t.id];
        const p2 = p ? pct(p.correct, p.answered) : 0;
        return (
          <Card key={t.id} style={{ marginBottom: 8 }} onPress={() => onQuiz({ count: countByTopic(t.id), topic: t.id, mode: 'exam', timer: 0 })}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, color: C.muted }}>{p?.answered || 0} שאלות</Text>
              <Row style={{ flex: 0 }}>
                {p2 > 0 && <Pill label={`${p2}%`} color={p2 >= 70 ? C.success : C.warning} small />}
                <Text style={{ fontWeight: '700', fontSize: 14, marginRight: 6 }}>{t.name}</Text>
                <Text style={{ fontSize: 20 }}>{t.icon}</Text>
              </Row>
            </Row>
            <Bar value={p2} total={100} color={t.color} h={5} />
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ─── TOPICS SCREEN ───────────────────────────────────────────────────────────
function TopicsScreen({ prog, onQuiz }) {
  const tp = prog.topicProgress || {};
  return (
    <ScrollView style={S.screen} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Text style={S.pageTitle}>נושאים</Text>
      {TOPICS.map(t => {
        const p = tp[t.id];
        const p2 = p ? pct(p.correct, p.answered) : 0;
        const total = countByTopic(t.id);
        const easy = QS.filter(q => q.topic === t.id && q.diff === 'easy').length;
        const med = QS.filter(q => q.topic === t.id && q.diff === 'medium').length;
        const hard = QS.filter(q => q.topic === t.id && q.diff === 'hard').length;
        return (
          <Card key={t.id} style={{ marginBottom: 14, borderTopWidth: 3, borderTopColor: t.color }} onPress={() => onQuiz({ count: total, topic: t.id, mode: 'exam', timer: 0 })}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 12, color: C.muted }}>{p?.answered || 0}/{total} שאלות</Text>
                {p2 > 0 && <Text style={{ fontSize: 12, fontWeight: '700', color: p2 >= 70 ? C.success : C.warning, marginTop: 2 }}>{p2}% הצלחה</Text>}
              </View>
              <Row style={{ flex: 0 }}>
                <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: C.text }}>{t.name}</Text>
                  <Text style={{ fontSize: 12, color: C.muted, textAlign: 'right', maxWidth: W * 0.5 }}>{t.desc}</Text>
                </View>
                <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: t.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 26 }}>{t.icon}</Text>
                </View>
              </Row>
            </Row>
            <Bar value={p2} total={100} color={t.color} h={7} />
            <Row style={{ justifyContent: 'space-between', marginTop: 10 }}>
              <Row style={{ flex: 0, gap: 6 }}>
                {[['קל', C.success, easy], ['בינוני', C.warning, med], ['קשה', C.danger, hard]].map(([l, c, n]) => (
                  <Pill key={l} label={`${n} ${l}`} color={c} small />
                ))}
              </Row>
              <Row style={{ flex: 0 }}>
                <Text style={{ fontSize: 12, color: C.primary, fontWeight: '700' }}>התחל </Text>
                <Icon name="arrow-back" size={14} color={C.primary} />
              </Row>
            </Row>
          </Card>
        );
      })}
    </ScrollView>
  );
}

// ─── QUIZ SETUP ──────────────────────────────────────────────────────────────
function QuizSetupScreen({ onStart }) {
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState(null);
  const [mode, setMode] = useState('exam');
  const [timerMin, setTimerMin] = useState(0);

  return (
    <ScrollView style={S.screen} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={S.pageTitle}>הגדרות בחינה</Text>

      {/* Header banner */}
      <Card style={{ backgroundColor: C.primary, marginBottom: 20 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Icon name="school" size={42} color="#bfdbfe" />
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: '#fff' }}>בחינת אמירנט</Text>
            <Text style={{ fontSize: 13, color: '#bfdbfe', textAlign: 'right' }}>הגדר והתחל להתכונן</Text>
          </View>
        </Row>
      </Card>

      {/* Question Count */}
      <Section title="מספר שאלות" />
      <Row style={{ gap: 8, marginBottom: 20 }}>
        {[10, 20, 30, 50].map(n => (
          <TouchableOpacity key={n} style={[S.countBtn, count === n && S.countBtnOn]} onPress={() => setCount(n)}>
            <Text style={[S.countBtnTxt, count === n && { color: '#fff' }]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </Row>

      {/* Mode */}
      <Section title="מצב בחינה" />
      <Row style={{ gap: 10, marginBottom: 20 }}>
        {[
          { v: 'exam', icon: 'timer-outline', title: 'מצב בחינה', sub: 'תוצאות בסוף' },
          { v: 'study', icon: 'bulb-outline', title: 'מצב לימוד', sub: 'הסבר אחרי כל שאלה' },
        ].map(m => (
          <TouchableOpacity key={m.v} style={[S.modeBtn, mode === m.v && S.modeBtnOn]} onPress={() => setMode(m.v)}>
            <Icon name={m.icon} size={28} color={mode === m.v ? C.primary : C.muted} />
            <Text style={[S.modeBtnTitle, mode === m.v && { color: C.primary }]}>{m.title}</Text>
            <Text style={S.modeBtnSub}>{m.sub}</Text>
          </TouchableOpacity>
        ))}
      </Row>

      {/* Timer (only exam mode) */}
      {mode === 'exam' && (
        <>
          <Section title="טיימר (אופציונלי)" />
          <Row style={{ gap: 8, marginBottom: 20 }}>
            {[0, 10, 20, 30, 45].map(n => (
              <TouchableOpacity key={n} style={[S.countBtn, timerMin === n && S.countBtnOn]} onPress={() => setTimerMin(n)}>
                <Text style={[S.countBtnTxt, timerMin === n && { color: '#fff' }]}>{n === 0 ? 'ללא' : `${n}′`}</Text>
              </TouchableOpacity>
            ))}
          </Row>
        </>
      )}

      {/* Topic */}
      <Section title="נושא" />
      {[null, ...TOPICS].map((t, i) => {
        const isAll = t === null;
        const selected = topic === (isAll ? null : t.id);
        return (
          <TouchableOpacity key={i} style={[S.topicOpt, selected && S.topicOptOn]} onPress={() => setTopic(isAll ? null : t.id)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ flex: 0 }}>
                {selected && <Icon name="checkmark-circle" size={18} color={C.primary} />}
              </Row>
              <Row style={{ flex: 0 }}>
                <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14 }}>{isAll ? 'כל הנושאים' : t.name}</Text>
                  <Text style={{ fontSize: 12, color: C.muted }}>{isAll ? 'שאלות מעורבות' : `${countByTopic(t.id)} שאלות`}</Text>
                </View>
                <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: isAll ? C.primary + '20' : t.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: isAll ? 18 : 22 }}>{isAll ? '🔲' : t.icon}</Text>
                </View>
              </Row>
            </Row>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={S.startBtn} onPress={() => onStart({ count, topic, mode, timer: mode === 'exam' ? timerMin * 60 : 0 })}>
        <Icon name="play" size={18} color="#fff" />
        <Text style={[S.startBtnTxt, { marginRight: 8 }]}>התחל בחינה</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── QUIZ SCREEN ─────────────────────────────────────────────────────────────
function QuizScreen({ config, dispatch, onFinish }) {
  const [questions] = useState(() => getQuestions(config.topic, config.count));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime] = useState(Date.now());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if (questions.length === 0) return (
    <SafeAreaView style={S.center}>
      <Text style={S.pageTitle}>אין שאלות</Text>
      <TouchableOpacity style={S.startBtn} onPress={onFinish}><Text style={S.startBtnTxt}>חזור</Text></TouchableOpacity>
    </SafeAreaView>
  );

  function animateNext(fn) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      fn();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  function handleSelect(i) {
    if (selected !== null) return;
    const newAnswers = { ...answers, [idx]: i };
    setSelected(i);
    setAnswers(newAnswers);
    if (config.mode === 'study') setShowExp(true);
  }

  function handleNext() {
    if (idx === questions.length - 1) {
      dispatch({ type: 'RECORD', payload: { questions, answers: { ...answers, [idx]: selected }, startTime } });
      setDone(true);
    } else {
      animateNext(() => { setIdx(i => i + 1); setSelected(null); setShowExp(false); });
    }
  }

  function handleTimeUp() {
    Alert.alert('הזמן נגמר!', 'הבחינה הסתיימה אוטומטית.', [{ text: 'ראה תוצאות', onPress: () => {
      dispatch({ type: 'RECORD', payload: { questions, answers, startTime } });
      setDone(true);
    }}]);
  }

  if (done) {
    const finalAnswers = { ...answers, [idx]: selected };
    const score = questions.filter((q, i) => finalAnswers[i] === q.a).length;
    return <ResultsScreen questions={questions} answers={finalAnswers} score={score} secs={(Date.now() - startTime) / 1000} onDismiss={onFinish} onRetry={() => onFinish()} />;
  }

  const q = questions[idx];
  const topic = topicById(q.topic);
  const diffColor = { easy: C.success, medium: C.warning, hard: C.danger };
  const diffName = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />
      {/* Top bar */}
      <View style={S.quizBar}>
        <TouchableOpacity onPress={onFinish} style={{ padding: 4 }}>
          <Icon name="close-circle" size={24} color={C.danger} />
        </TouchableOpacity>
        <Row style={{ flex: 0, gap: 8 }}>
          {config.timer > 0 && <ExamTimer totalSeconds={config.timer} onTimeUp={handleTimeUp} />}
          <Text style={{ fontWeight: '700', fontSize: 15 }}>{idx + 1} / {questions.length}</Text>
        </Row>
      </View>
      {/* Progress bar */}
      <View style={S.quizProgressTrack}>
        <View style={[S.quizProgressFill, { width: `${(idx / questions.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Question card */}
          <Card style={{ marginBottom: 14, borderTopWidth: 3, borderTopColor: topic?.color || C.primary }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 10 }}>
              <Pill label={diffName[q.diff]} color={diffColor[q.diff]} />
              <Text style={{ fontSize: 12, color: C.muted }}>{topic?.icon} {topic?.name}</Text>
            </Row>
            <Text style={{ fontSize: 17, fontWeight: '700', textAlign: 'right', color: C.text, lineHeight: 27 }}>{q.q}</Text>
          </Card>
          {/* Options */}
          {q.opts.map((opt, i) => (
            <AnswerOption key={i} text={opt} index={i} selected={selected} correctIdx={q.a} studyMode={config.mode === 'study'} onPress={handleSelect} />
          ))}
          {/* Explanation */}
          {config.mode === 'study' && showExp && (
            <Card style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: C.warning + '50', marginTop: 8 }}>
              <Row style={{ justifyContent: 'flex-end', marginBottom: 6 }}>
                <Text style={{ fontWeight: '700', color: C.warning, fontSize: 13 }}>הסבר 💡</Text>
              </Row>
              <Text style={{ textAlign: 'right', color: C.text, fontSize: 14, lineHeight: 22 }}>{q.exp}</Text>
            </Card>
          )}
        </Animated.View>
      </ScrollView>

      {/* Next button */}
      {selected !== null && (
        <View style={S.quizBottom}>
          <TouchableOpacity style={S.startBtn} onPress={handleNext}>
            <Icon name={idx === questions.length - 1 ? 'checkmark' : 'arrow-back'} size={18} color="#fff" />
            <Text style={[S.startBtnTxt, { marginRight: 8 }]}>{idx === questions.length - 1 ? 'סיים וראה תוצאות' : 'הבא'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function ResultsScreen({ questions, answers, score, secs, onDismiss, onRetry }) {
  const [detail, setDetail] = useState(false);
  const total = questions.length;
  const p = pct(score, total);
  const grade = gradeLabel(p);
  const pass = p >= 70;

  const byTopic = {};
  questions.forEach((q, i) => {
    if (!byTopic[q.topic]) byTopic[q.topic] = { total: 0, correct: 0 };
    byTopic[q.topic].total++;
    if (answers[i] === q.a) byTopic[q.topic].correct++;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />
      <View style={S.quizBar}>
        <TouchableOpacity onPress={onDismiss}><Icon name="close" size={22} color={C.muted} /></TouchableOpacity>
        <Text style={{ fontWeight: '800', fontSize: 16 }}>תוצאות הבחינה</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* Score circle + pass/fail */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <CircleScore value={p} color={grade.color} />
          <View style={[S.passFailBadge, { backgroundColor: pass ? C.success + '15' : C.danger + '15', borderColor: pass ? C.success : C.danger, marginTop: 16 }]}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: grade.color }}>{grade.text}</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 14, marginTop: 8 }}>{score} מתוך {total} תשובות נכונות</Text>
          {p >= 70
            ? <Text style={{ color: C.success, fontSize: 13, marginTop: 4, fontWeight: '700' }}>✓ עברת את הסף (70%)</Text>
            : <Text style={{ color: C.danger, fontSize: 13, marginTop: 4 }}>נדרש {70 - p}% נוסף לעבור</Text>
          }
        </View>

        {/* Stats row */}
        <Card style={{ flexDirection: 'row-reverse', marginBottom: 14 }}>
          {[
            { v: score, l: 'נכון', c: C.success, i: 'checkmark-circle' },
            { v: total - score, l: 'שגוי', c: C.danger, i: 'close-circle' },
            { v: fmtTime(secs), l: 'זמן', c: C.primary, i: 'time' },
          ].map((s, i, arr) => (
            <View key={s.l} style={[{ flex: 1, alignItems: 'center', paddingVertical: 10 }, i < arr.length - 1 && { borderRightWidth: 1, borderRightColor: C.border }]}>
              <Icon name={s.i} size={20} color={s.c} />
              <Text style={{ fontSize: 22, fontWeight: '900', color: s.c, marginTop: 4 }}>{s.v}</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{s.l}</Text>
            </View>
          ))}
        </Card>

        {/* Topic breakdown */}
        {Object.keys(byTopic).length > 1 && (
          <>
            <Section title="ביצועים לפי נושא" />
            {Object.entries(byTopic).map(([tid, tp]) => {
              const t = topicById(tid);
              const p2 = pct(tp.correct, tp.total);
              return (
                <Card key={tid} style={{ marginBottom: 8 }}>
                  <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                    <Pill label={`${p2}%`} color={p2 >= 70 ? C.success : C.warning} small />
                    <Row style={{ flex: 0 }}>
                      <Text style={{ fontWeight: '700', fontSize: 13 }}>{t?.name}</Text>
                      <Text style={{ fontSize: 18, marginRight: 6 }}>{t?.icon}</Text>
                    </Row>
                  </Row>
                  <Bar value={p2} total={100} color={t?.color || C.primary} h={5} />
                  <Text style={{ textAlign: 'right', fontSize: 11, color: C.muted, marginTop: 4 }}>{tp.correct}/{tp.total} נכון</Text>
                </Card>
              );
            })}
          </>
        )}

        {/* Answer detail toggle */}
        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <Switch value={detail} onValueChange={setDetail} trackColor={{ false: C.border, true: C.primary }} thumbColor="#fff" />
            <Row style={{ flex: 0 }}>
              <Icon name="list" size={16} color={C.text} />
              <Text style={{ fontWeight: '700', fontSize: 14, marginRight: 6 }}>פירוט תשובות</Text>
            </Row>
          </Row>
        </Card>

        {detail && questions.map((q, i) => (
          <ReviewRow key={q.id} q={q} idx={i} sel={answers[i]} />
        ))}
      </ScrollView>

      <View style={S.quizBottom}>
        <Row style={{ gap: 10 }}>
          <TouchableOpacity style={[S.outlineBtn, { flex: 1 }]} onPress={onRetry}>
            <Icon name="refresh" size={16} color={C.primary} />
            <Text style={[S.startBtnTxt, { color: C.primary, marginRight: 6 }]}>נסה שוב</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.startBtn, { flex: 1 }]} onPress={onDismiss}>
            <Icon name="home" size={16} color="#fff" />
            <Text style={[S.startBtnTxt, { marginRight: 6 }]}>בית</Text>
          </TouchableOpacity>
        </Row>
      </View>
    </SafeAreaView>
  );
}

// ─── PROGRESS ────────────────────────────────────────────────────────────────
function ProgressScreen({ prog, dispatch }) {
  const [userName, setUserName] = useState(prog.userName || '');
  const [goal, setGoal] = useState(String(prog.dailyGoal || 20));
  const tp = prog.topicProgress || {};
  const history = (prog.quizHistory || []).slice(0, 15);
  const overall = pct(prog.totalCorrect, prog.totalAnswered);

  const achievements = [
    { id: 'a1', icon: '🥉', label: '10 שאלות',   done: prog.totalAnswered >= 10 },
    { id: 'a2', icon: '🥈', label: '50 שאלות',   done: prog.totalAnswered >= 50 },
    { id: 'a3', icon: '🥇', label: '100 שאלות',  done: prog.totalAnswered >= 100 },
    { id: 'a4', icon: '🏆', label: 'ציון 80%+',  done: prog.totalAnswered >= 20 && overall >= 80 },
    { id: 'a5', icon: '🔥', label: 'רצף 3 ימים', done: prog.streakDays >= 3 },
    { id: 'a6', icon: '⚡', label: 'רצף שבוע',   done: prog.streakDays >= 7 },
    { id: 'a7', icon: '🎯', label: 'עבר בחינה',  done: (prog.quizHistory || []).some(h => pct(h.score, h.total) >= 70 && h.total >= 20) },
    { id: 'a8', icon: '📚', label: 'כל הנושאים', done: TOPICS.every(t => (tp[t.id]?.answered || 0) > 0) },
  ];

  function save() {
    dispatch({ type: 'SETTINGS', payload: { userName: userName.trim(), dailyGoal: parseInt(goal) || 20 } });
    Alert.alert('✓', 'הגדרות נשמרו');
  }

  function reset() {
    Alert.alert('איפוס', 'כל ההתקדמות תימחק. בטוח?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'איפוס', style: 'destructive', onPress: () => dispatch({ type: 'RESET' }) },
    ]);
  }

  // 7-day activity bars
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toDateString();
    const qs = (prog.quizHistory || []).filter(h => new Date(h.date).toDateString() === ds).reduce((s, h) => s + h.total, 0);
    return { label: ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'][d.getDay()], qs };
  });
  const maxQs = Math.max(...last7.map(d => d.qs), 1);

  return (
    <ScrollView style={S.screen} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <Text style={S.pageTitle}>התקדמות</Text>

      {/* Overall summary */}
      <Card style={{ backgroundColor: C.primary, marginBottom: 16 }}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <CircleScore value={overall} color="#fff" size={100} />
          <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 16 }}>
            <Text style={{ color: '#bfdbfe', fontSize: 12, marginBottom: 4 }}>ציון כללי</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{prog.totalAnswered || 0} שאלות</Text>
            <Text style={{ color: '#bfdbfe', fontSize: 13 }}>{prog.totalCorrect || 0} נכונות</Text>
            <Row style={{ marginTop: 8 }}>
              <Text style={{ color: '#fde68a', fontSize: 13, fontWeight: '700', marginRight: 4 }}>🔥 {prog.streakDays || 0} ימי רצף</Text>
            </Row>
          </View>
        </Row>
      </Card>

      {/* 7-day chart */}
      <Card>
        <Text style={{ textAlign: 'right', fontWeight: '700', fontSize: 14, marginBottom: 14 }}>פעילות שבועית</Text>
        <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between', height: 80 }}>
          {last7.map((d, i) => (
            <View key={i} style={{ alignItems: 'center', flex: 1 }}>
              <View style={{ flex: 1, justifyContent: 'flex-end', width: '70%' }}>
                <View style={{ height: `${Math.max(d.qs / maxQs * 100, d.qs > 0 ? 10 : 4)}%`, backgroundColor: d.qs > 0 ? C.primary : C.fill, borderRadius: 4, minHeight: d.qs > 0 ? 6 : 3 }} />
              </View>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>{d.label}</Text>
              {d.qs > 0 && <Text style={{ fontSize: 9, color: C.primary, fontWeight: '700' }}>{d.qs}</Text>}
            </View>
          ))}
        </Row>
      </Card>

      {/* Topic breakdown */}
      <Section title="ביצועים לפי נושא" />
      {TOPICS.map(t => {
        const p = tp[t.id];
        const p2 = p ? pct(p.correct, p.answered) : 0;
        return (
          <Card key={t.id} style={{ marginBottom: 8 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: p2 >= 70 ? C.success : p2 > 0 ? C.warning : C.muted, fontWeight: '700' }}>
                {p ? `${p2}%` : 'לא התחיל'}
              </Text>
              <Row style={{ flex: 0 }}>
                <Text style={{ fontWeight: '700', fontSize: 13 }}>{t.name}</Text>
                <Text style={{ fontSize: 18, marginRight: 6 }}>{t.icon}</Text>
              </Row>
            </Row>
            <Bar value={p2} total={100} color={t.color} h={6} />
            {p && <Text style={{ textAlign: 'right', fontSize: 11, color: C.muted, marginTop: 4 }}>{p.correct}/{p.answered} נכון</Text>}
          </Card>
        );
      })}

      {/* Achievements */}
      <Section title="הישגים" />
      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        {achievements.map(a => (
          <View key={a.id} style={[S.achievement, !a.done && { opacity: 0.3 }]}>
            <Text style={{ fontSize: 28 }}>{a.icon}</Text>
            <Text style={{ fontSize: 11, color: C.text, marginTop: 4, textAlign: 'center' }}>{a.label}</Text>
            {a.done && <Icon name="checkmark-circle" size={14} color={C.success} />}
          </View>
        ))}
      </View>

      {/* History */}
      {history.length > 0 && (
        <>
          <Section title="היסטוריית בחינות" />
          {history.map((h, i) => {
            const p2 = pct(h.score, h.total);
            const t = h.topic ? topicById(h.topic) : null;
            return (
              <Card key={i} style={{ marginBottom: 8 }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Row style={{ flex: 0, gap: 6 }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>{new Date(h.date).toLocaleDateString('he-IL')}</Text>
                    <Pill label={`${p2}%`} color={p2 >= 70 ? C.success : C.warning} small />
                  </Row>
                  <Text style={{ fontWeight: '700', fontSize: 13 }}>{t ? `${t.icon} ${t.name}` : '🔲 כל הנושאים'}</Text>
                </Row>
                <Text style={{ textAlign: 'right', fontSize: 11, color: C.muted, marginTop: 4 }}>{h.score}/{h.total} נכון • {fmtTime(h.secs)}</Text>
              </Card>
            );
          })}
        </>
      )}

      {/* Settings */}
      <Section title="הגדרות" />
      <Card>
        <Text style={{ textAlign: 'right', fontSize: 13, color: C.muted, marginBottom: 6 }}>שם</Text>
        <TextInput style={S.input} value={userName} onChangeText={setUserName} placeholder="שמך..." textAlign="right" placeholderTextColor={C.muted} />
        <Text style={{ textAlign: 'right', fontSize: 13, color: C.muted, marginTop: 14, marginBottom: 6 }}>יעד יומי (שאלות)</Text>
        <Row style={{ gap: 8 }}>
          {['10','20','30','50'].map(n => (
            <TouchableOpacity key={n} style={[S.countBtn, goal === n && S.countBtnOn]} onPress={() => setGoal(n)}>
              <Text style={[S.countBtnTxt, goal === n && { color: '#fff' }]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </Row>
        <TouchableOpacity style={[S.startBtn, { marginTop: 16 }]} onPress={save}>
          <Icon name="save-outline" size={16} color="#fff" />
          <Text style={[S.startBtnTxt, { marginRight: 6 }]}>שמור</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.outlineBtn, { borderColor: C.danger + '60', marginTop: 10 }]} onPress={reset}>
          <Icon name="trash-outline" size={16} color={C.danger} />
          <Text style={{ color: C.danger, fontWeight: '700', marginRight: 6 }}>איפוס כל ההתקדמות</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'home', label: 'בית', icon: 'home', iconActive: 'home' },
    { id: 'topics', label: 'נושאים', icon: 'book-outline', iconActive: 'book' },
    { id: 'quiz', label: 'בחינה', icon: 'pencil-outline', iconActive: 'pencil' },
    { id: 'progress', label: 'התקדמות', icon: 'bar-chart-outline', iconActive: 'bar-chart' },
  ];
  return (
    <View style={S.tabBar}>
      {tabs.map(t => {
        const active = tab === t.id;
        return (
          <TouchableOpacity key={t.id} style={S.tabItem} onPress={() => setTab(t.id)}>
            {active && <View style={S.tabIndicator} />}
            <Icon name={active ? t.iconActive : t.icon} size={22} color={active ? C.primary : C.muted} />
            <Text style={[S.tabLabel, active && { color: C.primary, fontWeight: '700' }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [prog, dispatch] = useReducer(reducer, INIT);
  const [tab, setTab] = useState('home');
  const [quiz, setQuiz] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Storage.get('amirnet_v2').then(raw => {
      if (raw) { try { dispatch({ type: 'LOAD', payload: JSON.parse(raw) }); } catch (_e) { /* ignore */ } }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) Storage.set('amirnet_v2', JSON.stringify(prog));
  }, [prog, loaded]);

  const go = useCallback((action) => dispatch(action), []);

  if (!loaded) return (
    <SafeAreaView style={S.center}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>🌐</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: C.primary }}>AmirNet Plus</Text>
    </SafeAreaView>
  );

  if (!prog.onboarded) return (
    <OnboardingScreen onDone={({ userName, dailyGoal }) => dispatch({ type: 'SETTINGS', payload: { userName, dailyGoal, onboarded: true } })} />
  );

  if (quiz) return <QuizScreen config={quiz} dispatch={go} onFinish={() => setQuiz(null)} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />
      {tab === 'home'     && <HomeScreen    prog={prog} dispatch={go} onQuiz={setQuiz} />}
      {tab === 'topics'   && <TopicsScreen  prog={prog} onQuiz={setQuiz} />}
      {tab === 'quiz'     && <QuizSetupScreen onStart={setQuiz} />}
      {tab === 'progress' && <ProgressScreen prog={prog} dispatch={go} />}
      <TabBar tab={tab} setTab={setTab} />
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  pageTitle: { fontSize: 26, fontWeight: '900', textAlign: 'right', color: C.text, marginBottom: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  section: { fontSize: 14, fontWeight: '800', textAlign: 'right', color: C.text, marginTop: 8, marginBottom: 8 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt: { fontWeight: '700' },
  barTrack: { backgroundColor: C.fill, borderRadius: 10, overflow: 'hidden', width: '100%' },
  barFill: { borderRadius: 10 },
  streakBadge: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: C.warning + '40' },
  timerBox: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, gap: 4 },
  timerTxt: { fontSize: 14, fontWeight: '900' },
  option: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  optionTxt: { fontSize: 15, lineHeight: 22 },
  optLetter: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.fill, alignItems: 'center', justifyContent: 'center' },
  numBadgeTxt: { fontSize: 11, fontWeight: '700', color: C.muted },
  quizBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  quizProgressTrack: { height: 4, backgroundColor: C.fill },
  quizProgressFill: { height: 4, backgroundColor: C.primary },
  quizBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  startBtn: { flexDirection: 'row-reverse', backgroundColor: C.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  startBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  outlineBtn: { flexDirection: 'row-reverse', borderWidth: 1.5, borderColor: C.primary + '60', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  countBtn: { flex: 1, backgroundColor: C.fill, borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  countBtnOn: { backgroundColor: C.primary, borderColor: C.primary },
  countBtnTxt: { fontSize: 15, fontWeight: '700', color: C.text },
  modeBtn: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  modeBtnOn: { borderColor: C.primary, backgroundColor: C.primary + '0a' },
  modeBtnTitle: { fontSize: 14, fontWeight: '800', color: C.text, marginTop: 6 },
  modeBtnSub: { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 3 },
  topicOpt: { backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1.5, borderColor: C.border },
  topicOptOn: { borderColor: C.primary, backgroundColor: C.primary + '08' },
  passFailBadge: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 30, borderWidth: 2 },
  achievement: { width: (W - 56) / 4, backgroundColor: C.card, borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  input: { backgroundColor: C.fill, borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: C.border, color: C.text },
  onboardInput: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)', color: '#fff', marginBottom: 4 },
  tabBar: { flexDirection: 'row-reverse', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 20 : 6, paddingTop: 6 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 4, position: 'relative' },
  tabLabel: { fontSize: 11, color: C.muted, marginTop: 3 },
  tabIndicator: { position: 'absolute', top: 0, left: '20%', right: '20%', height: 2.5, backgroundColor: C.primary, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
});
