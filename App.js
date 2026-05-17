import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  Dimensions, Platform, Alert, Switch, TextInput, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');
const _mem = {};
const Store = { get: k => Promise.resolve(_mem[k] ?? null), set: (k,v) => { _mem[k]=v; } };

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = { primary:'#1e40af', blue:'#3b82f6', success:'#15803d', warning:'#d97706',
  danger:'#dc2626', purple:'#7c3aed', cyan:'#0891b2', orange:'#ea580c',
  bg:'#f1f5f9', card:'#fff', text:'#0f172a', muted:'#64748b', border:'#e2e8f0', fill:'#f8fafc' };

// ─── DIFFICULTY → THETA MAP ──────────────────────────────────────────────────
const DIFF_THETA = { beginner:-1, intermediate:0, advanced:1, expert:2 };
const THETA_DIFF = t => t < -0.5 ? 'beginner' : t < 0.5 ? 'intermediate' : t < 1.5 ? 'advanced' : 'expert';
const DIFF_COLOR = { beginner:C.success, intermediate:C.warning, advanced:C.orange, expert:C.danger };
const DIFF_LABEL = { beginner:'קל', intermediate:'בינוני', advanced:'מתקדם', expert:'מומחה' };

// ─── TOPICS / SECTIONS ───────────────────────────────────────────────────────
const TOPICS = [
  { id:'networking',       name:'רשתות תקשורת',     icon:'🌐', color:C.primary },
  { id:'security',         name:'אבטחת מידע',        icon:'🔒', color:C.danger  },
  { id:'operatingSystems', name:'מערכות הפעלה',      icon:'💻', color:C.success },
  { id:'cloud',            name:'ענן ווירטואליזציה', icon:'☁️', color:C.cyan   },
  { id:'itManagement',     name:'ניהול IT',           icon:'👥', color:C.warning },
  { id:'protocols',        name:'פרוטוקולים',         icon:'🔄', color:C.purple  },
];
const topicById = id => TOPICS.find(t => t.id === id);

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
// type: 'mc' = multiple choice, 'reading' = passage + question, 'restatement' = match equivalent
const QS = [
  // ── NETWORKING mc ──
  { id:'n1', type:'mc', topic:'networking', diff:'beginner',     vs:0.72,
    q:'כמה שכבות יש במודל OSI?', opts:['5','6','7','8'], a:2,
    exp:'מודל OSI = 7 שכבות: פיזית, קישור נתונים, רשת, תחבורה, סשן, מצגת, יישום.' },
  { id:'n2', type:'mc', topic:'networking', diff:'beginner',     vs:0.68,
    q:'באיזו שכבת OSI פועל IP?', opts:['שכבה 2','שכבה 3','שכבה 4','שכבה 5'], a:1,
    exp:'IP פועל בשכבה 3 (רשת) ואחראי על ניתוב בין רשתות.' },
  { id:'n3', type:'mc', topic:'networking', diff:'beginner',     vs:0.75,
    q:'Subnet Mask של Class C?', opts:['255.0.0.0','255.255.0.0','255.255.255.0','255.255.255.255'], a:2,
    exp:'Class C = 255.255.255.0 (/24), עד 254 מארחים.' },
  { id:'n4', type:'mc', topic:'networking', diff:'intermediate', vs:0.58,
    q:'ההבדל בין Router ל-Switch?', opts:['Router שכבה 2','Router ניתוב בין רשתות (שכבה 3), Switch מחבר בתוך רשת (שכבה 2)','זהים','Switch מהיר יותר'], a:1,
    exp:'Router = שכבה 3, מנתב בין רשתות. Switch = שכבה 2, מחבר בתוך רשת.' },
  { id:'n5', type:'mc', topic:'networking', diff:'intermediate', vs:0.55,
    q:'CIDR /24 — מה המשמעות?', opts:['24 מארחים','24 סיביות לרשת, 8 למארח','Mask 255.255.0.0','24 נתבים'], a:1,
    exp:'/24 = 24 סיביות לרשת → Mask 255.255.255.0 → 254 מארחים.' },
  { id:'n6', type:'mc', topic:'networking', diff:'intermediate', vs:0.52,
    q:'Class A פרטי?', opts:['172.16.0.0–172.31','192.168.0.0–192.168','10.0.0.0–10.255.255.255','169.254.0.0'], a:2,
    exp:'Class A פרטי = 10.0.0.0–10.255.255.255.' },
  { id:'n7', type:'mc', topic:'networking', diff:'intermediate', vs:0.60,
    q:'תפקיד ARP?', opts:['הקצאת IP','תרגום שם→IP','תרגום IP→MAC','הצפנה'], a:2,
    exp:'ARP ממפה IP לכתובת MAC ברשת מקומית.' },
  { id:'n8', type:'mc', topic:'networking', diff:'beginner',     vs:0.80,
    q:'פורט HTTPS?', opts:['80','443','8080','8443'], a:1,
    exp:'HTTPS = פורט 443. HTTP = פורט 80.' },
  { id:'n9', type:'mc', topic:'networking', diff:'beginner',     vs:0.78,
    q:'Full-Duplex לעומת Half-Duplex?', opts:['Half מהיר','Full=שליחה+קבלה בו-זמנית; Half=כיוון אחד','Half=Wireless בלבד','Full זול יותר'], a:1,
    exp:'Full-Duplex = תקשורת דו-כיוונית בו-זמנית. Half = כיוון אחד בכל פעם.' },
  { id:'n10', type:'mc', topic:'networking', diff:'advanced',    vs:0.38,
    q:'192.168.1.0/26 — כמה מארחים?', opts:['30','62','126','254'], a:1,
    exp:'/26 = 6 סיביות למארח → 2^6−2 = 62 מארחים.' },
  { id:'n11', type:'mc', topic:'networking', diff:'expert',      vs:0.25,
    q:'VLSM — מה התועלת?', opts:['מאפשר שימוש חוזר ב-IP','מאפשר חלוקת רשת למשנה-רשתות בגדלים שונים','מחליף NAT','מצפין תנועה'], a:1,
    exp:'VLSM (Variable Length Subnet Masking) = חלוקת Subnet בגדלים שונים לניצול יעיל של כתובות IP.' },
  // ── SECURITY mc ──
  { id:'s1', type:'mc', topic:'security', diff:'intermediate', vs:0.55,
    q:'Symmetric לעומת Asymmetric?', opts:['Symmetric מהיר, מפתח אחד; Asymmetric זוג מפתחות','Asymmetric מהיר','Symmetric שני מפתחות','אין הבדל'], a:0,
    exp:'Symmetric = מפתח אחד (AES). Asymmetric = ציבורי+פרטי (RSA).' },
  { id:'s2', type:'mc', topic:'security', diff:'beginner',     vs:0.70,
    q:'Man-in-the-Middle?', opts:['מתקפה על DNS','תוקף מיירט תקשורת בין שני צדדים','הצפת שרת','פרצה בFW'], a:1,
    exp:'MITM = תוקף מיירט ויכול לקרוא/לשנות את התקשורת.' },
  { id:'s3', type:'mc', topic:'security', diff:'beginner',     vs:0.72,
    q:'DoS לעומת DDoS?', opts:['DoS=מחשב אחד; DDoS=Botnet','DDoS פחות מסוכן','זהים','DoS לנתונים'], a:0,
    exp:'DoS = מחשב אחד. DDoS = אלפי מחשבים (Botnet).' },
  { id:'s4', type:'mc', topic:'security', diff:'intermediate', vs:0.58,
    q:'Stateful Firewall?', opts:['בוחן כותרות בלבד','עוקב אחר מצב חיבורים','מסנן לפי MAC','ללא תצורה'], a:1,
    exp:'Stateful FW עוקב אחר מצב חיבור ומחליט לפי הקשר.' },
  { id:'s5', type:'mc', topic:'security', diff:'intermediate', vs:0.56,
    q:'IDS לעומת IPS?', opts:['IDS=מגיב; IPS=מזהה בלבד','IDS=מזהה; IPS=מזהה+חוסם','זהים','IPS בענן בלבד'], a:1,
    exp:'IDS = זיהוי+התראה בלבד. IPS = זיהוי+חסימה אקטיבית.' },
  { id:'s6', type:'mc', topic:'security', diff:'beginner',     vs:0.76,
    q:'SSL/TLS?', opts:['ניתוב','הצפנה לאבטחת תקשורת','זיהוי משתמשים','DNS מאובטח'], a:1,
    exp:'TLS מאבטח תקשורת (HTTPS). TLS = גרסה מעודכנת של SSL.' },
  { id:'s7', type:'mc', topic:'security', diff:'beginner',     vs:0.80,
    q:'Phishing?', opts:['מצפין קבצים','הונאה לגניבת פרטים דרך הודעות מזויפות','Brute Force','ניצול TCP'], a:1,
    exp:'Phishing = הנדסה חברתית לגניבת פרטים רגישים.' },
  { id:'s8', type:'mc', topic:'security', diff:'beginner',     vs:0.82,
    q:'VPN?', opts:['מנהרה מוצפנת ברשת ציבורית','חומת אש','פרוטוקול ניתוב','אנטי-וירוס'], a:0,
    exp:'VPN = מנהרה מוצפנת, גישה מאובטחת למשאבים פרטיים.' },
  { id:'s9', type:'mc', topic:'security', diff:'advanced',     vs:0.40,
    q:'Zero Trust Architecture?', opts:['מאמין לכולם בתוך הרשת','לא מאמין לאף ישות, בדיקה תמידית','ביטול סיסמאות','VPN לכולם'], a:1,
    exp:'Zero Trust = "Never trust, always verify" — בדיקת כל גישה ללא קשר למיקום ברשת.' },
  // ── OS mc ──
  { id:'o1', type:'mc', topic:'operatingSystems', diff:'beginner',     vs:0.74,
    q:'Active Directory?', opts:['אנטי-וירוס','שירות ספריה לניהול משתמשים וקבוצות','פרוטוקול','גיבוי'], a:1,
    exp:'AD = ניהול מרכזי משתמשים, מחשבים ומדיניות אבטחה.' },
  { id:'o2', type:'mc', topic:'operatingSystems', diff:'intermediate', vs:0.58,
    q:'Domain Controller לעומת Member Server?', opts:['DC מנהל AD; Member חבר בדומיין','Member חזק יותר','DC=Linux','זהים'], a:0,
    exp:'DC מריץ AD DS. Member Server חבר בדומיין, לא מריץ AD DS.' },
  { id:'o3', type:'mc', topic:'operatingSystems', diff:'intermediate', vs:0.55,
    q:'NTFS לעומת FAT32?', opts:['NTFS מהיר אך לא גדולים','NTFS=הרשאות, הצפנה, קבצים >4GB','FAT32 מתקדם','זהים'], a:1,
    exp:'NTFS = הרשאות, EFS, דחיסה, ללא מגבלת 4GB. FAT32 מוגבל.' },
  { id:'o4', type:'mc', topic:'operatingSystems', diff:'beginner',     vs:0.85,
    q:'בדיקת IP ב-Windows?', opts:['ipconfig','ifconfig','netstat','ping'], a:0,
    exp:'Windows = ipconfig. Linux/macOS = ifconfig / ip addr.' },
  { id:'o5', type:'mc', topic:'operatingSystems', diff:'intermediate', vs:0.60,
    q:'Group Policy (GPO)?', opts:['מדיניות קבוצתית ב-AD','גיבוי','אבטחת רשת','DHCP'], a:0,
    exp:'GPO = ניהול מרכזי הגדרות בדומיין: סיסמאות, אבטחה, מיפוי כוננים.' },
  { id:'o6', type:'mc', topic:'operatingSystems', diff:'beginner',     vs:0.88,
    q:'Linux — קבצים כולל מוסתרים?', opts:['ls -a','ls -l','dir /a','show all'], a:0,
    exp:'ls -a = כל הקבצים כולל מוסתרים (מתחילים בנקודה).' },
  { id:'o7', type:'mc', topic:'operatingSystems', diff:'intermediate', vs:0.52,
    q:'RAID 5?', opts:['גיבוי לדיסק חיצוני','Striping+Parity על 3+ דיסקים, עמיד לכשל דיסק אחד','שיקוף 2 דיסקים','ללא הגנה'], a:1,
    exp:'RAID 5 = Striping+Parity מפוזר, עמיד לכשל דיסק אחד.' },
  { id:'o8', type:'mc', topic:'operatingSystems', diff:'beginner',     vs:0.75,
    q:'Hyper-V?', opts:['אנטי-וירוס','וירטואליזציה של Microsoft ב-Windows Server','ענן','גיבוי'], a:1,
    exp:'Hyper-V = וירטואליזציה מובנית ב-Windows Server.' },
  // ── CLOUD mc ──
  { id:'c1', type:'mc', topic:'cloud', diff:'intermediate', vs:0.58,
    q:'IaaS / PaaS / SaaS?', opts:['זהים','IaaS=תשתית; PaaS=פלטפורמה; SaaS=תוכנה מוכנה','SaaS מאובטח יותר','PaaS לחברות גדולות'], a:1,
    exp:'IaaS=EC2, PaaS=App Service, SaaS=Office365.' },
  { id:'c2', type:'mc', topic:'cloud', diff:'beginner',     vs:0.72,
    q:'S3 ב-AWS?', opts:['מחשוב','אחסון אובייקטים','רשת','DB'], a:1,
    exp:'Amazon S3 = Object Storage, זמינות גבוהה.' },
  { id:'c3', type:'mc', topic:'cloud', diff:'intermediate', vs:0.55,
    q:'VPC ב-AWS?', opts:['DB','רשת וירטואלית פרטית עם שליטה מלאה','Backup','DNS'], a:1,
    exp:'VPC = רשת מבודדת ב-AWS, שליטה ב-Subnet, Routing, SG.' },
  { id:'c4', type:'mc', topic:'cloud', diff:'beginner',     vs:0.70,
    q:'Public Cloud לעומת Private?', opts:['Public מאובטח יותר','Public=משותף; Private=ייעודי לארגון','Private תמיד זול','זהים'], a:1,
    exp:'Public = משאבים משותפים. Private = ייעודי, אבטחה גבוהה.' },
  { id:'c5', type:'mc', topic:'cloud', diff:'intermediate', vs:0.60,
    q:'Docker?', opts:['OS','Containerization לאפליקציות מבודדות','שפה','גיבוי'], a:1,
    exp:'Docker = Container עם יחסי תלות, ריצה אחידה בכל סביבה.' },
  { id:'c6', type:'mc', topic:'cloud', diff:'intermediate', vs:0.55,
    q:'VM לעומת Container?', opts:['Container כבד יותר','VM=OS מלא; Container=חולק Kernel, יעיל יותר','זהים','VM מהיר יותר'], a:1,
    exp:'VM = OS מלא (כבד). Container = חולק Kernel (קל+מהיר).' },
  { id:'c7', type:'mc', topic:'cloud', diff:'beginner',     vs:0.78,
    q:'Auto Scaling?', opts:['הגדלה ידנית','הוספה/הסרה אוטומטית לפי עומס','גיבוי','עדכונים'], a:1,
    exp:'Auto Scaling = מוסיף/מסיר משאבים אוטומטית לפי עומס.' },
  { id:'c8', type:'mc', topic:'cloud', diff:'advanced',    vs:0.38,
    q:'Kubernetes?', opts:['DB','תזמור Containers בקנה מידה','מערכת הפעלה','שירות DNS'], a:1,
    exp:'Kubernetes = תזמור ואוטומציה של פריסת Containers בקנה מידה.' },
  // ── IT MANAGEMENT mc ──
  { id:'i1', type:'mc', topic:'itManagement', diff:'beginner',     vs:0.72,
    q:'ITIL?', opts:['שפת תכנות','מסגרת Best Practices לניהול שירותי IT','פרוטוקול','מוצר Microsoft'], a:1,
    exp:'ITIL = Information Technology Infrastructure Library, ניהול שירותי IT.' },
  { id:'i2', type:'mc', topic:'itManagement', diff:'intermediate', vs:0.55,
    q:'Incident לעומת Problem?', opts:['זהים','Incident=שיבוש; Problem=גורם שורשי','Problem קל','Incident אחרי Problem'], a:1,
    exp:'Incident = שיבוש לא מתוכנן. Problem = Root Cause Analysis.' },
  { id:'i3', type:'mc', topic:'itManagement', diff:'beginner',     vs:0.70,
    q:'SLA?', opts:['חוזה חומרה','הסכם רמת שירות: זמינות, זמן תגובה','תוכנה','תקן אבטחה'], a:1,
    exp:'SLA = הסכם המגדיר ציפיות שירות (זמינות, זמן תגובה, שיקום).' },
  { id:'i4', type:'mc', topic:'itManagement', diff:'intermediate', vs:0.58,
    q:'Change Management ב-ITIL?', opts:['שינויים ארגוניים','ניהול מבוקר שינויים ב-IT','עדכונים אוטומטיים','גרסאות קוד'], a:1,
    exp:'Change Management = RFC, הערכת סיכונים, אישור, ביצוע, תיעוד.' },
  { id:'i5', type:'mc', topic:'itManagement', diff:'advanced',    vs:0.40,
    q:'RTO ו-RPO?', opts:['RTO=זמן שיקום מקסימלי; RPO=כמות נתונים שניתן לאבד','שניהם זמן שיקום','RPO=ביצועים','RTO לענן'], a:0,
    exp:'RTO = זמן שיקום מקסימלי. RPO = כמות נתונים מקסימלית שניתן לאבד.' },
  { id:'i6', type:'mc', topic:'itManagement', diff:'intermediate', vs:0.56,
    q:'Help Desk לעומת Service Desk?', opts:['זהים','Help=תקלות; Service=נקודת קשר רחבה + בקשות שירות','Service לחיצוניים','Help יקר'], a:1,
    exp:'Help Desk = פתרון תקלות. Service Desk = נקודת קשר יחידה רחבה.' },
  { id:'i7', type:'mc', topic:'itManagement', diff:'advanced',    vs:0.42,
    q:'CMDB?', opts:['תוכנת אנטי-וירוס','מאגר מידע של רכיבי תשתית ויחסיהם','שירות גיבוי','DB למשתמשים'], a:1,
    exp:'CMDB (Configuration Management Database) = מאגר כל Configuration Items ויחסיהם ב-IT.' },
  // ── PROTOCOLS mc ──
  { id:'p1', type:'mc', topic:'protocols', diff:'beginner',     vs:0.80,
    q:'פורט DNS?', opts:['53','80','443','25'], a:0,
    exp:'DNS = פורט 53 (UDP לשאילתות, TCP להעברות אזור).' },
  { id:'p2', type:'mc', topic:'protocols', diff:'beginner',     vs:0.76,
    q:'DHCP?', opts:['תרגום שם→IP','הקצאה אוטומטית IP+פרמטרים','הצפנה','ניתוב'], a:1,
    exp:'DHCP = הקצאה אוטומטית: IP, Mask, Gateway, DNS.' },
  { id:'p3', type:'mc', topic:'protocols', diff:'beginner',     vs:0.78,
    q:'TCP לעומת UDP?', opts:['TCP מהיר; UDP אמין','TCP=חיבור+אמין; UDP=ללא חיבור+מהיר','זהים','UDP=הצפנה'], a:1,
    exp:'TCP = Handshake, מסירה מובטחת. UDP = מהיר, ללא ערבות (DNS, VoIP).' },
  { id:'p4', type:'mc', topic:'protocols', diff:'beginner',     vs:0.82,
    q:'SMTP?', opts:['קבלת מיילים','שליחת מיילים בין שרתים','גלישה','קבצים'], a:1,
    exp:'SMTP = שליחת מיילים, פורט 25/587. IMAP/POP3 לקבלה.' },
  { id:'p5', type:'mc', topic:'protocols', diff:'beginner',     vs:0.84,
    q:'HTTP Method נפוץ?', opts:['ENCRYPT','GET','ROUTE','QUERY'], a:1,
    exp:'HTTP = פרוטוקול האינטרנט. GET לקבלת נתונים.' },
  { id:'p6', type:'mc', topic:'protocols', diff:'beginner',     vs:0.80,
    q:'FTP על פורט?', opts:['פורט 21','פורט 22','פורט 80','פורט 443'], a:0,
    exp:'FTP = פורט 21 (control), 20 (data). SFTP = פורט 22, מאובטח.' },
  { id:'p7', type:'mc', topic:'protocols', diff:'intermediate', vs:0.60,
    q:'Three-Way Handshake?', opts:['סגירת חיבור','SYN→SYN-ACK→ACK','שליחת נתונים','בדיקת שגיאות'], a:1,
    exp:'TCP Handshake: Client→SYN, Server→SYN-ACK, Client→ACK.' },
  { id:'p8', type:'mc', topic:'protocols', diff:'intermediate', vs:0.55,
    q:'IMAP לעומת POP3?', opts:['IMAP=מסנכרן+שומר בשרת; POP3=מוריד+מוחק','POP3 מודרני','IMAP=שליחה','זהים'], a:0,
    exp:'IMAP (143/993) = מסנכרן ממכשירים מרובים. POP3 (110/995) = מוריד ומוחק.' },
  { id:'p9', type:'mc', topic:'protocols', diff:'advanced',    vs:0.38,
    q:'BGP?', opts:['פרוטוקול ניתוב פנימי','פרוטוקול ניתוב בין-מערכות אוטונומיות (AS)','פרוטוקול הצפנה','שירות DNS מורחב'], a:1,
    exp:'BGP (Border Gateway Protocol) = ניתוב בין Autonomous Systems, עמוד השדרה של האינטרנט.' },
  // ── READING TYPE (passage + question) ──
  { id:'r1', type:'reading', topic:'networking', diff:'intermediate', vs:0.52,
    passage:'רשת ה-LAN של חברת XYZ כוללת 3 VLAN: VLAN 10 לניהול, VLAN 20 לעובדים, VLAN 30 לאורחים. הראוטר מחובר ל-Switch בחיבור Trunk המעביר את כל ה-VLANs. כל VLAN מקבל כתובות IP מ-DHCP נפרד, ו-Firewall חוסם תנועה בין VLAN 30 לשאר הרשת.',
    q:'מדוע הAorG-VLAN מבודד ב-Firewall?', opts:['לחסוך IP','למנוע גישה של אורחים לרשת הפנימית','VLAN 30 איטי יותר','הגדרת ברירת מחדל'], a:1,
    exp:'VLAN לאורחים מבודד כדי למנוע גישה לנתונים פנימיים — עיקרון Zero Trust ל-Guest Networks.' },
  { id:'r2', type:'reading', topic:'security', diff:'advanced', vs:0.38,
    passage:'ארגון גדול גילה שמישהו ניגש לשרת ה-DB הפנימי מכתובת IP חיצונית. בדיקת הלוגים מראה שהגישה הייתה דרך פורט 3389 שנותר פתוח בטעות בFW. הגישה נעשתה בשעות הלילה עם פרטי כניסה של עובד שהתפטר לפני 3 חודשים.',
    q:'אילו כשלי אבטחה מוצגים בתרחיש? (בחר הכי מקיף)', opts:['רק פורט פתוח','רק חשבון לא נמחק','פורט פתוח שלא לצורך + ניהול גישה לקוי (חשבון לא בוטל) + חוסר ניטור','רק חוסר ניטור'], a:2,
    exp:'3 כשלים: 1) פורט 3389 (RDP) פתוח לאינטרנט 2) חשבון עובד שעזב לא בוטל 3) אין ניטור בזמן אמת.' },
  { id:'r3', type:'reading', topic:'cloud', diff:'intermediate', vs:0.50,
    passage:'צוות DevOps פורס אפליקציה ב-AWS. הם משתמשים ב-ECS (Elastic Container Service) עם Fargate להרצת Containers, S3 לאחסון קבצים סטטיים, RDS (PostgreSQL) ל-Database, ו-CloudFront כ-CDN. ה-Load Balancer מחלק תנועה בין 3 AZs.',
    q:'מה התועלת של 3 Availability Zones?', opts:['חיסכון בעלויות','זמינות גבוהה — אם AZ אחד נכשל, שניים אחרים ממשיכים','מהירות גבוהה יותר','הדרישה של RDS'], a:1,
    exp:'Multi-AZ = High Availability. כשל באחד מ-3 AZs לא משבית את השירות — עיקרון ה-Fault Tolerance.' },
  { id:'r4', type:'reading', topic:'operatingSystems', diff:'beginner', vs:0.65,
    passage:'מנהל רשת מגדיר GPO חדש בActive Directory. ה-GPO מחייב: סיסמה מינימום 12 תווים, נעילת חשבון אחרי 5 נסיונות, שינוי סיסמה כל 90 יום, ומניעת שימוש ב-10 הסיסמאות האחרונות. ה-GPO מוחל על כל ה-Domain Users OU.',
    q:'מה מטרת הגדרת "מניעת שימוש ב-10 הסיסמאות האחרונות"?', opts:['לחסוך מקום DB','למנוע שימוש חוזר בסיסמאות ישנות שעלולות להיות חשופות','לחסוך זמן','הדרישה של NTFS'], a:1,
    exp:'Password History = מניעת שימוש חוזר בסיסמאות ישנות שייתכן שנחשפו או ידועות.' },
  // ── RESTATEMENT TYPE (match equivalent statement) ──
  { id:'rs1', type:'restatement', topic:'networking', diff:'intermediate', vs:0.52,
    q:'באיזו הצהרה מכוונת הכי נכון את המשמעות של "חוק ה-Subnet Mask הוא 255.255.255.0"?',
    opts:['הרשת תומכת עד 254 מארחים ומסומנת /24','הרשת תומכת 255 מארחים','ה-Subnet Mask מורכב מ-8 סיביות','זו רשת Class B'], a:0,
    exp:'255.255.255.0 = /24 = 24 סיביות לרשת, 8 למארח → 2^8−2 = 254 מארחים.' },
  { id:'rs2', type:'restatement', topic:'security', diff:'advanced', vs:0.38,
    q:'מהי ההצהרה השקולה ל: "IPS פועל inline ברשת"?',
    opts:['IPS מנטר תנועה ממרחק','IPS ממוקם בנתיב התנועה ויכול לחסום בזמן אמת','IPS פועל רק כשיש התקפה','IPS הוא סוג של FW'], a:1,
    exp:'Inline = בנתיב התנועה. זה מה שמאפשר ל-IPS לחסום (לא רק להתריע) בזמן אמת.' },
  { id:'rs3', type:'restatement', topic:'itManagement', diff:'intermediate', vs:0.55,
    q:'מהי ההצהרה הנכונה ביותר ל: "RTO = 4 שעות"?',
    opts:['מותר לאבד 4 שעות של נתונים','השירות חייב לחזור לפעולה תוך 4 שעות מרגע הכשל','הגיבוי נעשה כל 4 שעות','4 שעות זמן עבודה יומי'], a:1,
    exp:'RTO (Recovery Time Objective) = הזמן המקסימלי המוסכם לשיקום השירות לאחר כשל.' },
];

// ─── ADAPTIVE ENGINE ─────────────────────────────────────────────────────────
const AdaptiveEngine = {
  startTheta: () => 0,
  updateTheta(theta, isCorrect, diffLevel) {
    const b = DIFF_THETA[diffLevel] ?? 0;
    const delta = isCorrect ? Math.abs(b - theta + 1) * 0.35 : -Math.abs(theta - b + 1) * 0.35;
    return Math.max(-2.5, Math.min(2.5, theta + delta));
  },
  selectNext(theta, usedIds, allQuestions, topicFilter) {
    const target = THETA_DIFF(theta);
    const pool = allQuestions.filter(q =>
      !usedIds.includes(q.id) &&
      (!topicFilter || q.topic === topicFilter)
    );
    if (!pool.length) return null;
    const exact = pool.filter(q => q.diff === target);
    const fallback = pool.sort((a,b) =>
      Math.abs(DIFF_THETA[a.diff]-theta) - Math.abs(DIFF_THETA[b.diff]-theta)
    );
    const candidates = exact.length ? exact : fallback;
    return candidates[Math.floor(Math.random() * Math.min(candidates.length, 3))];
  },
  thetaToLevel(theta) {
    if (theta < -0.5) return 'beginner';
    if (theta < 0.5)  return 'intermediate';
    if (theta < 1.5)  return 'advanced';
    return 'expert';
  },
};

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
const Scoring = {
  compute(questions, answers, startTime) {
    let correct = 0, diffScore = 0;
    const topicMap = {};
    questions.forEach((q, i) => {
      const ok = answers[i] === q.a;
      if (ok) { correct++; diffScore += DIFF_THETA[q.diff] + 2; }
      if (!topicMap[q.topic]) topicMap[q.topic] = { total:0, correct:0 };
      topicMap[q.topic].total++;
      if (ok) topicMap[q.topic].correct++;
    });
    const total = questions.length;
    const base = total > 0 ? Math.round(correct / total * 100) : 0;
    const weighted = total > 0 ? Math.round(diffScore / (total * 3) * 100) : 0;
    const pass = base >= 70;
    const secs = (Date.now() - startTime) / 1000;
    return { correct, total, base, weighted, pass, secs, topicMap };
  },
};

// ─── STATE ────────────────────────────────────────────────────────────────────
const INIT_PROG = {
  userName:'', onboarded:false, dailyGoal:20,
  totalAnswered:0, totalCorrect:0, topicProgress:{},
  streakDays:0, lastStudyDate:null,
  quizHistory:[], bookmarkedIds:[],
  adaptiveLog:[],  // [{date, theta_start, theta_end, questions_count}]
};

function reducer(state, action) {
  switch(action.type) {
    case 'LOAD': return {...INIT_PROG,...action.payload};
    case 'SETTINGS': return {...state,...action.payload};
    case 'RECORD': {
      const {questions, answers, startTime} = action.payload;
      const result = Scoring.compute(questions, answers, startTime);
      const tp = {...state.topicProgress};
      Object.entries(result.topicMap).forEach(([tid,tm]) => {
        const p = tp[tid]||{answered:0,correct:0};
        tp[tid] = {answered:p.answered+tm.total, correct:p.correct+tm.correct};
      });
      const today = new Date().toDateString();
      const last = state.lastStudyDate ? new Date(state.lastStudyDate).toDateString() : null;
      const diff = last ? Math.floor((new Date(today)-new Date(last))/86400000) : -1;
      const streak = diff===0?state.streakDays:diff===1?state.streakDays+1:1;
      const entry = {date:Date.now(), score:result.correct, total:result.total,
        base:result.base, weighted:result.weighted, pass:result.pass,
        topic:questions[0]?.topic||null, secs:result.secs};
      return {...state, totalAnswered:state.totalAnswered+result.total,
        totalCorrect:state.totalCorrect+result.correct, topicProgress:tp,
        quizHistory:[entry,...state.quizHistory].slice(0,150),
        streakDays:streak, lastStudyDate:Date.now()};
    }
    case 'RECORD_ADAPTIVE': {
      const log = [{date:Date.now(),...action.payload},...(state.adaptiveLog||[])].slice(0,50);
      return {...state, adaptiveLog:log};
    }
    case 'BOOKMARK': {
      const ids = state.bookmarkedIds.includes(action.id)
        ? state.bookmarkedIds.filter(x=>x!==action.id)
        : [...state.bookmarkedIds, action.id];
      return {...state, bookmarkedIds:ids};
    }
    case 'RESET': return {...INIT_PROG, userName:state.userName, onboarded:state.onboarded, dailyGoal:state.dailyGoal};
    default: return state;
  }
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function pct(c,t) { return t>0?Math.round(c/t*100):0; }
function fmtTime(s) { const m=Math.floor(s/60); return `${m}:${String(Math.floor(s%60)).padStart(2,'0')}`; }
function getQsByTopic(tid) { return QS.filter(q=>q.topic===tid); }
function getPool(tid,count) { return shuffle(tid?QS.filter(q=>q.topic===tid):QS).slice(0,count); }

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function Row({children,style}) { return <View style={[{flexDirection:'row-reverse',alignItems:'center'},style]}>{children}</View>; }
function Col({children,style}) { return <View style={[{alignItems:'flex-end'},style]}>{children}</View>; }
function Card({children,style,onPress}) {
  if(onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[S.card,style]}>{children}</TouchableOpacity>;
  return <View style={[S.card,style]}>{children}</View>;
}
function Pill({label,color,small}) {
  return <View style={{backgroundColor:color+'22',paddingHorizontal:8,paddingVertical:3,borderRadius:20}}>
    <Text style={{color,fontWeight:'700',fontSize:small?10:12}}>{label}</Text>
  </View>;
}
function Bar({value,total=100,color=C.primary,h=7}) {
  const w = total>0?Math.min(value/total,1)*100:0;
  return <View style={{height:h,backgroundColor:C.fill,borderRadius:10,overflow:'hidden',width:'100%'}}>
    <View style={{width:`${w}%`,height:h,backgroundColor:color,borderRadius:10}}/>
  </View>;
}
function Icon({name,size=20,color=C.text}) { return <Ionicons name={name} size={size} color={color}/>; }
function Sec({title}) { return <Text style={S.sec}>{title}</Text>; }

// Animated answer option
function AnswerOpt({text,index,selected,correctIdx,studyMode,onPress}) {
  const scale = useRef(new Animated.Value(1)).current;
  const letters = ['א','ב','ג','ד'];
  const isSelected = selected===index;
  const answered = selected!==null;
  const isCorrect = correctIdx===index;
  const isWrong = isSelected&&!isCorrect;

  function tap() {
    if(answered)return;
    Animated.sequence([
      Animated.spring(scale,{toValue:.96,useNativeDriver:true,speed:50}),
      Animated.spring(scale,{toValue:1,useNativeDriver:true,speed:50}),
    ]).start();
    onPress(index);
  }
  let bg=C.card, border=C.border;
  if(answered&&studyMode) { if(isCorrect){bg=C.success+'18';border=C.success;} else if(isWrong){bg=C.danger+'18';border=C.danger;} }
  else if(isSelected&&!studyMode){bg=C.primary+'12';border=C.primary;}

  return <Animated.View style={{transform:[{scale}]}}>
    <TouchableOpacity onPress={tap} disabled={answered}
      style={[S.opt,{backgroundColor:bg,borderColor:border}]} activeOpacity={0.85}>
      <Row>
        {answered&&studyMode&&isCorrect&&<Icon name="checkmark-circle" size={18} color={C.success}/>}
        {answered&&studyMode&&isWrong&&<Icon name="close-circle" size={18} color={C.danger}/>}
        <Text style={{flex:1,textAlign:'right',fontSize:15,color:C.text,marginHorizontal:8,lineHeight:22}}>{text}</Text>
        <View style={[S.optLetter,{backgroundColor:isSelected?(isWrong?C.danger:C.primary):C.fill}]}>
          <Text style={{fontSize:12,fontWeight:'700',color:isSelected?'#fff':C.muted}}>{letters[index]}</Text>
        </View>
      </Row>
    </TouchableOpacity>
  </Animated.View>;
}

// Reading passage renderer
function PassageCard({passage}) {
  const [expanded,setExpanded] = useState(false);
  return <Card style={{backgroundColor:'#eff6ff',borderWidth:1,borderColor:C.primary+'40',marginBottom:10}}>
    <Row style={{justifyContent:'space-between',marginBottom:6}}>
      <TouchableOpacity onPress={()=>setExpanded(e=>!e)} style={{flexDirection:'row-reverse',alignItems:'center'}}>
        <Icon name={expanded?'chevron-up':'chevron-down'} size={14} color={C.primary}/>
        <Text style={{color:C.primary,fontWeight:'700',fontSize:12,marginRight:4}}>{expanded?'כווץ':'הרחב'}</Text>
      </TouchableOpacity>
      <Text style={{fontWeight:'700',color:C.primary,fontSize:13}}>📄 קטע קריאה</Text>
    </Row>
    <Text style={{textAlign:'right',fontSize:13,color:C.text,lineHeight:21}} numberOfLines={expanded?undefined:3}>{passage}</Text>
  </Card>;
}

// Timer
function ExamTimer({totalSeconds,onTimeUp}) {
  const [rem,setRem] = useState(totalSeconds);
  useEffect(()=>{
    const iv = setInterval(()=>setRem(r=>{ if(r<=1){clearInterval(iv);onTimeUp();return 0;} return r-1; }),1000);
    return ()=>clearInterval(iv);
  },[]);
  const warn=rem<120;
  return <View style={[S.timerBox,{backgroundColor:warn?C.danger+'15':C.primary+'10',borderColor:warn?C.danger:C.primary+'40'}]}>
    <Icon name={warn?'warning':'time-outline'} size={14} color={warn?C.danger:C.primary}/>
    <Text style={{fontSize:14,fontWeight:'900',color:warn?C.danger:C.primary,marginRight:4}}>{fmtTime(rem)}</Text>
  </View>;
}

// Review row in results
function ReviewRow({q,idx,sel}) {
  const [open,setOpen] = useState(false);
  const ok = sel===q.a;
  return <Card style={{marginBottom:8}}>
    <TouchableOpacity onPress={()=>setOpen(o=>!o)}>
      <Row>
        <Icon name={open?'chevron-up':'chevron-down'} size={14} color={C.muted}/>
        <Row style={{flex:0,gap:4}}>
          <Icon name={ok?'checkmark-circle':'close-circle'} size={16} color={ok?C.success:C.danger}/>
          <View style={{width:22,height:22,borderRadius:11,backgroundColor:C.fill,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontSize:11,fontWeight:'700',color:C.muted}}>{idx+1}</Text>
          </View>
        </Row>
        <Text style={{flex:1,textAlign:'right',fontSize:13,marginHorizontal:8}} numberOfLines={open?undefined:2}>{q.q}</Text>
      </Row>
    </TouchableOpacity>
    {open&&<View style={{marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:C.border}}>
      {q.type==='reading'&&<Text style={{textAlign:'right',fontSize:11,color:C.muted,marginBottom:6,fontStyle:'italic'}}>{q.passage}</Text>}
      {sel!==undefined&&sel!==q.a&&<Text style={{textAlign:'right',fontSize:12,color:C.danger,marginBottom:3}}>תשובתך: {q.opts[sel]}</Text>}
      <Text style={{textAlign:'right',fontSize:12,fontWeight:'700',color:C.success,marginBottom:3}}>✓ {q.opts[q.a]}</Text>
      <Text style={{textAlign:'right',fontSize:12,color:C.muted}}>{q.exp}</Text>
    </View>}
  </Card>;
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function OnboardingScreen({onDone}) {
  const [step,setStep]=useState(0);
  const [name,setName]=useState('');
  const [goal,setGoal]=useState('20');
  return <SafeAreaView style={{flex:1,backgroundColor:C.primary}}>
    <StatusBar barStyle="light-content"/>
    <View style={{flex:1,justifyContent:'center',padding:32}}>
      {step===0?<>
        <View style={{alignItems:'center',marginBottom:40}}>
          <Text style={{fontSize:72,marginBottom:12}}>🌐</Text>
          <Text style={{fontSize:30,fontWeight:'900',color:'#fff',textAlign:'center'}}>AmirNet Plus</Text>
          <Text style={{fontSize:15,color:'#bfdbfe',textAlign:'center',marginTop:6}}>הכנה מקצועית לבחינת אמירנט</Text>
        </View>
        {['57 שאלות ב-6 נושאים + קריאה','מנוע אדפטיבי המתאים לרמתך','ניתוח מיומנויות מפורט','מצב לימוד ומבחן מלא'].map(f=>(
          <Row key={f} style={{alignSelf:'flex-end',marginBottom:12}}>
            <Text style={{color:'#bfdbfe',fontSize:14,marginRight:8}}>{f}</Text>
            <Icon name="checkmark-circle" size={18} color="#4ade80"/>
          </Row>
        ))}
        <TouchableOpacity style={[S.btn,{backgroundColor:'#fff',marginTop:40}]} onPress={()=>setStep(1)}>
          <Text style={[S.btnTxt,{color:C.primary}]}>בוא נתחיל ←</Text>
        </TouchableOpacity>
      </>:<>
        <Text style={{fontSize:24,fontWeight:'800',color:'#fff',textAlign:'right',marginBottom:24}}>קצת עליך</Text>
        <Text style={{color:'#bfdbfe',textAlign:'right',marginBottom:6}}>שמך</Text>
        <TextInput style={S.onbInput} value={name} onChangeText={setName} placeholder="הכנס שם..." placeholderTextColor="#93c5fd" textAlign="right"/>
        <Text style={{color:'#bfdbfe',textAlign:'right',marginTop:20,marginBottom:10}}>יעד יומי (שאלות)</Text>
        <Row style={{gap:8,alignSelf:'flex-end'}}>
          {['10','20','30','50'].map(n=>(
            <TouchableOpacity key={n} onPress={()=>setGoal(n)}
              style={{backgroundColor:goal===n?'#fff':'transparent',borderWidth:1.5,borderColor:'#fff',borderRadius:10,paddingHorizontal:14,paddingVertical:9}}>
              <Text style={{color:goal===n?C.primary:'#fff',fontWeight:'700'}}>{n}</Text>
            </TouchableOpacity>
          ))}
        </Row>
        <TouchableOpacity style={[S.btn,{backgroundColor:'#fff',marginTop:40}]}
          onPress={()=>onDone({userName:name.trim()||'לומד',dailyGoal:parseInt(goal)||20})}>
          <Text style={[S.btnTxt,{color:C.primary}]}>כניסה ←</Text>
        </TouchableOpacity>
      </>}
    </View>
  </SafeAreaView>;
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function HomeScreen({prog,onQuiz,announcements=[],currentUser,onLogout}) {
  const tp = prog.topicProgress||{};
  const overall = pct(prog.totalCorrect,prog.totalAnswered);
  const todayAns = (prog.quizHistory||[]).filter(h=>new Date(h.date).toDateString()===new Date().toDateString()).reduce((s,h)=>s+h.total,0);
  const goalDone = todayAns>=prog.dailyGoal;
  const weak = TOPICS.filter(t=>{ const p=tp[t.id]; return p&&p.answered>=3&&pct(p.correct,p.answered)<70; });
  const lastH = prog.quizHistory?.[0];
  const lastTopic = lastH?.topic?topicById(lastH.topic):null;

  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:24}} showsVerticalScrollIndicator={false}>
    {/* Header */}
    <Row style={{justifyContent:'space-between',paddingVertical:10}}>
      <View style={{flexDirection:'row-reverse',alignItems:'center',backgroundColor:'#fff7ed',paddingHorizontal:10,paddingVertical:5,borderRadius:20,borderWidth:1,borderColor:C.warning+'40'}}>
        <Text style={{fontSize:13}}>🔥</Text>
        <Text style={{fontSize:12,fontWeight:'700',color:C.warning,marginRight:3}}>{prog.streakDays||0} ימים</Text>
      </View>
      <Col>
        <Text style={{fontSize:21,fontWeight:'900',color:C.text}}>שלום, {prog.userName} 👋</Text>
        <Text style={{fontSize:13,color:C.muted}}>הכנה לבחינת אמירנט</Text>
      </Col>
    </Row>

    {/* Announcements */}
    {announcements.length>0&&announcements.slice(0,3).map(a=>{
      const pCfg={info:{c:C.cyan,i:'information-circle'},warning:{c:C.warning,i:'warning'},urgent:{c:C.danger,i:'alert-circle'}};
      const cfg=pCfg[a.priority]||pCfg.info;
      return <View key={a.id} style={{backgroundColor:cfg.c+'12',borderRadius:12,padding:12,marginBottom:8,borderRightWidth:3,borderRightColor:cfg.c}}>
        <Row style={{justifyContent:'space-between',marginBottom:3}}>
          <Icon name={cfg.i} size={14} color={cfg.c}/>
          <Text style={{fontWeight:'700',fontSize:13,color:cfg.c}}>{a.title}</Text>
        </Row>
        <Text style={{textAlign:'right',fontSize:12,color:C.text,lineHeight:18}}>{a.body}</Text>
      </View>;
    })}

    {/* Daily Goal */}
    <Card style={goalDone?{borderWidth:1.5,borderColor:C.success+'55',backgroundColor:'#f0fdf4'}:{}}>
      <Row style={{justifyContent:'space-between',marginBottom:8}}>
        <Row style={{flex:0,gap:4}}>
          <Icon name={goalDone?'checkmark-circle':'today-outline'} size={15} color={goalDone?C.success:C.primary}/>
          <Text style={{fontSize:13,color:goalDone?C.success:C.primary,fontWeight:'700'}}>{goalDone?'יעד הושג 🎯':'יעד יומי'}</Text>
        </Row>
        <Text style={{fontSize:20,fontWeight:'900',color:goalDone?C.success:C.primary}}>{todayAns}/{prog.dailyGoal}</Text>
      </Row>
      <Bar value={todayAns} total={prog.dailyGoal} color={goalDone?C.success:C.primary} h={9}/>
    </Card>

    {/* Stats */}
    <Row style={{gap:8,marginBottom:4}}>
      {[
        {i:'help-circle',v:prog.totalAnswered||0,l:'שאלות',c:C.primary},
        {i:'trophy',v:overall>0?`${overall}%`:'–',l:'הצלחה',c:overall>=70?C.success:C.warning},
        {i:'flame',v:prog.streakDays||0,l:'רצף',c:C.warning},
        {i:'bookmark',v:prog.bookmarkedIds?.length||0,l:'שמורות',c:C.purple},
      ].map(s=><Card key={s.l} style={{flex:1,alignItems:'center',padding:10,marginBottom:0}}>
        <Icon name={s.i} size={18} color={s.c}/>
        <Text style={{fontSize:17,fontWeight:'900',color:s.c,marginTop:3}}>{s.v}</Text>
        <Text style={{fontSize:11,color:C.muted,marginTop:2}}>{s.l}</Text>
      </Card>)}
    </Row>

    {/* Quick Actions */}
    <Sec title="בחינות"/>
    <Row style={{gap:10}}>
      <Card style={{flex:1,alignItems:'center',padding:14}} onPress={()=>onQuiz({count:10,topic:null,mode:'exam',timer:0,adaptive:false})}>
        <Icon name="play-circle" size={30} color={C.primary}/>
        <Text style={{fontWeight:'700',color:C.primary,marginTop:4,fontSize:13}}>בחינה מהירה</Text>
        <Text style={{fontSize:11,color:C.muted}}>10 שאלות</Text>
      </Card>
      <Card style={{flex:1,alignItems:'center',padding:14}} onPress={()=>onQuiz({count:40,topic:null,mode:'exam',timer:45*60,adaptive:false})}>
        <Icon name="school" size={30} color={C.danger}/>
        <Text style={{fontWeight:'700',color:C.danger,marginTop:4,fontSize:13}}>בחינה מלאה</Text>
        <Text style={{fontSize:11,color:C.muted}}>40 שאלות • 45′</Text>
      </Card>
      <Card style={{flex:1,alignItems:'center',padding:14}} onPress={()=>onQuiz({count:20,topic:null,mode:'exam',timer:0,adaptive:true})}>
        <Icon name="analytics" size={30} color={C.purple}/>
        <Text style={{fontWeight:'700',color:C.purple,marginTop:4,fontSize:13}}>אדפטיבי</Text>
        <Text style={{fontSize:11,color:C.muted}}>מתאים לרמתך</Text>
      </Card>
    </Row>

    {weak.length>0&&<>
      <Sec title="⚠️ חולשות"/>
      {weak.slice(0,2).map(t=>{
        const p=tp[t.id], p2=pct(p.correct,p.answered);
        return <Card key={t.id} style={{marginBottom:8,borderWidth:1,borderColor:C.warning+'44'}}
          onPress={()=>onQuiz({count:10,topic:t.id,mode:'study',timer:0,adaptive:false})}>
          <Row style={{justifyContent:'space-between',marginBottom:6}}>
            <Pill label={`${p2}%`} color={C.warning}/>
            <Row style={{flex:0,gap:6}}><Text style={{fontWeight:'700',fontSize:14}}>{t.name}</Text><Text style={{fontSize:20}}>{t.icon}</Text></Row>
          </Row>
          <Bar value={p2} total={100} color={C.warning} h={5}/>
        </Card>;
      })}
    </>}

    {lastTopic&&<>
      <Sec title="המשך מאיפה שהפסקת"/>
      <Card onPress={()=>onQuiz({count:10,topic:lastTopic.id,mode:'study',timer:0,adaptive:false})}>
        <Row style={{justifyContent:'space-between'}}>
          <Row style={{flex:0,gap:4}}><Icon name="arrow-forward-circle" size={18} color={C.primary}/><Text style={{color:C.primary,fontWeight:'700',fontSize:13}}>המשך</Text></Row>
          <Row style={{flex:0,gap:6}}><Text style={{fontWeight:'700',fontSize:15}}>{lastTopic.name}</Text><Text style={{fontSize:22}}>{lastTopic.icon}</Text></Row>
        </Row>
      </Card>
    </>}

    <Sec title="נושאים"/>
    {TOPICS.map(t=>{
      const p=tp[t.id], p2=p?pct(p.correct,p.answered):0;
      return <Card key={t.id} style={{marginBottom:8}} onPress={()=>onQuiz({count:getQsByTopic(t.id).length,topic:t.id,mode:'exam',timer:0,adaptive:false})}>
        <Row style={{justifyContent:'space-between',marginBottom:6}}>
          <Text style={{fontSize:12,color:C.muted}}>{p?.answered||0} שאלות</Text>
          <Row style={{flex:0,gap:6}}>{p2>0&&<Pill label={`${p2}%`} color={p2>=70?C.success:C.warning} small/>}
            <Text style={{fontWeight:'700',fontSize:14}}>{t.name}</Text><Text style={{fontSize:20}}>{t.icon}</Text></Row>
        </Row>
        <Bar value={p2} total={100} color={t.color} h={5}/>
      </Card>;
    })}
  </ScrollView>;
}

// ─── QUIZ SETUP ───────────────────────────────────────────────────────────────
function QuizSetupScreen({onStart}) {
  const [count,setCount]=useState(10);
  const [topic,setTopic]=useState(null);
  const [mode,setMode]=useState('exam');
  const [timerMin,setTimerMin]=useState(0);
  const [adaptive,setAdaptive]=useState(false);
  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:40}} showsVerticalScrollIndicator={false}>
    <Text style={S.pgTitle}>הגדרות בחינה</Text>
    <Card style={{backgroundColor:C.primary,marginBottom:16}}>
      <Row style={{justifyContent:'space-between'}}>
        <Icon name="school" size={42} color="#bfdbfe"/>
        <Col style={{alignItems:'flex-end'}}><Text style={{fontSize:19,fontWeight:'800',color:'#fff'}}>בחינת אמירנט</Text>
          <Text style={{fontSize:13,color:'#bfdbfe'}}>הגדר והתחל</Text></Col>
      </Row>
    </Card>

    <Sec title="מספר שאלות"/>
    <Row style={{gap:8,marginBottom:16}}>
      {[10,20,30,50].map(n=><TouchableOpacity key={n} style={[S.cntBtn,count===n&&S.cntBtnOn]} onPress={()=>setCount(n)}>
        <Text style={[S.cntTxt,count===n&&{color:'#fff'}]}>{n}</Text>
      </TouchableOpacity>)}
    </Row>

    <Sec title="מצב"/>
    <Row style={{gap:10,marginBottom:16}}>
      {[{v:'exam',icon:'timer-outline',t:'בחינה',s:'תוצאות בסוף'},
        {v:'study',icon:'bulb-outline',t:'לימוד',s:'הסבר אחרי כל שאלה'}].map(m=>
        <TouchableOpacity key={m.v} style={[S.modeBtn,mode===m.v&&S.modeBtnOn]} onPress={()=>setMode(m.v)}>
          <Icon name={m.icon} size={26} color={mode===m.v?C.primary:C.muted}/>
          <Text style={{fontWeight:'800',fontSize:13,color:mode===m.v?C.primary:C.text,marginTop:5}}>{m.t}</Text>
          <Text style={{fontSize:11,color:C.muted,textAlign:'center',marginTop:2}}>{m.s}</Text>
        </TouchableOpacity>
      )}
    </Row>

    {/* Adaptive toggle */}
    <Card style={{marginBottom:12}}>
      <Row style={{justifyContent:'space-between'}}>
        <Switch value={adaptive} onValueChange={setAdaptive} trackColor={{false:C.border,true:C.purple}} thumbColor="#fff"/>
        <Col style={{alignItems:'flex-end'}}>
          <Row style={{flex:0,gap:4}}><Icon name="analytics" size={16} color={C.purple}/><Text style={{fontWeight:'700',color:C.purple,fontSize:14}}>מצב אדפטיבי</Text></Row>
          <Text style={{fontSize:11,color:C.muted}}>קושי מתאים אוטומטית לרמתך</Text>
        </Col>
      </Row>
    </Card>

    {mode==='exam'&&<>
      <Sec title="טיימר"/>
      <Row style={{gap:8,marginBottom:16}}>
        {[0,10,20,30,45].map(n=><TouchableOpacity key={n} style={[S.cntBtn,timerMin===n&&S.cntBtnOn]} onPress={()=>setTimerMin(n)}>
          <Text style={[S.cntTxt,timerMin===n&&{color:'#fff'}]}>{n===0?'ללא':`${n}′`}</Text>
        </TouchableOpacity>)}
      </Row>
    </>}

    <Sec title="נושא"/>
    {[null,...TOPICS].map((t,i)=>{
      const isAll=t===null; const sel=topic===(isAll?null:t?.id);
      return <TouchableOpacity key={i} style={[S.topicOpt,sel&&S.topicOptOn]} onPress={()=>setTopic(isAll?null:t.id)}>
        <Row style={{justifyContent:'space-between'}}>
          <Row style={{flex:0}}>{sel&&<Icon name="checkmark-circle" size={18} color={C.primary}/>}</Row>
          <Row style={{flex:0,gap:10}}>
            <Col style={{alignItems:'flex-end'}}>
              <Text style={{fontWeight:'700',fontSize:14}}>{isAll?'כל הנושאים':t.name}</Text>
              <Text style={{fontSize:11,color:C.muted}}>{isAll?'שאלות מעורבות':`${getQsByTopic(t.id).length} שאלות`}</Text>
            </Col>
            <View style={{width:38,height:38,borderRadius:19,backgroundColor:(isAll?C.primary:t.color)+'22',alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:isAll?18:22}}>{isAll?'🔲':t.icon}</Text>
            </View>
          </Row>
        </Row>
      </TouchableOpacity>;
    })}
    <TouchableOpacity style={[S.btn,{marginTop:8}]} onPress={()=>onStart({count,topic,mode,timer:mode==='exam'?timerMin*60:0,adaptive})}>
      <Icon name="play" size={17} color="#fff"/>
      <Text style={[S.btnTxt,{marginRight:8}]}>התחל בחינה</Text>
    </TouchableOpacity>
  </ScrollView>;
}

// ─── QUIZ ENGINE SCREEN ───────────────────────────────────────────────────────
function QuizScreen({config,dispatch,onFinish}) {
  const [questions,setQuestions] = useState(()=>config.adaptive?[AdaptiveEngine.selectNext(0,[],QS,config.topic)].filter(Boolean):getPool(config.topic,config.count));
  const [idx,setIdx] = useState(0);
  const [answers,setAnswers] = useState({});
  const [selected,setSelected] = useState(null);
  const [showExp,setShowExp] = useState(false);
  const [done,setDone] = useState(false);
  const [theta,setTheta] = useState(0);
  const [flagged,setFlagged] = useState(new Set());
  const [startTime] = useState(Date.now());
  const fadeAnim = useRef(new Animated.Value(1)).current;

  if(!questions.length) return <SafeAreaView style={S.center}><Text style={S.pgTitle}>אין שאלות</Text><TouchableOpacity style={S.btn} onPress={onFinish}><Text style={S.btnTxt}>חזור</Text></TouchableOpacity></SafeAreaView>;

  function animNext(fn) {
    Animated.timing(fadeAnim,{toValue:0,duration:140,useNativeDriver:true}).start(()=>{fn();Animated.timing(fadeAnim,{toValue:1,duration:180,useNativeDriver:true}).start();});
  }

  function handleSelect(i) {
    if(selected!==null)return;
    const newAns = {...answers,[idx]:i};
    setSelected(i); setAnswers(newAns);
    if(config.mode==='study') setShowExp(true);
    if(config.adaptive) {
      const isOk = i===questions[idx].a;
      const newTheta = AdaptiveEngine.updateTheta(theta,isOk,questions[idx].diff);
      setTheta(newTheta);
    }
  }

  function handleNext() {
    const finalAns = {...answers,[idx]:selected};
    const isLast = config.adaptive ? questions.length>=config.count : idx===questions.length-1;
    if(isLast) {
      dispatch({type:'RECORD',payload:{questions,answers:finalAns,startTime}});
      if(config.adaptive) dispatch({type:'RECORD_ADAPTIVE',payload:{theta_start:0,theta_end:theta,questions_count:questions.length}});
      setAnswers(finalAns); setDone(true);
    } else if(config.adaptive) {
      const usedIds = questions.map(q=>q.id);
      const next = AdaptiveEngine.selectNext(theta,usedIds,QS,config.topic);
      if(next) { animNext(()=>{ setQuestions(qs=>[...qs,next]); setIdx(i=>i+1); setSelected(null); setShowExp(false); }); }
      else { dispatch({type:'RECORD',payload:{questions,answers:finalAns,startTime}}); setAnswers(finalAns); setDone(true); }
    } else {
      animNext(()=>{ setIdx(i=>i+1); setSelected(null); setShowExp(false); });
    }
  }

  function handleTimeUp() {
    Alert.alert('הזמן נגמר!','הבחינה הסתיימה.',[{text:'תוצאות',onPress:()=>{
      dispatch({type:'RECORD',payload:{questions,answers,startTime}});
      setDone(true);
    }}]);
  }

  if(done) {
    const result = Scoring.compute(questions,answers,startTime);
    return <ResultsScreen questions={questions} answers={answers} result={result} theta={config.adaptive?theta:null} onDismiss={onFinish}/>;
  }

  const q = questions[idx];
  const t = topicById(q.topic);
  const maxIdx = config.adaptive?config.count-1:questions.length-1;

  return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
    <StatusBar barStyle="dark-content"/>
    <View style={S.qBar}>
      <Row style={{flex:0,gap:8}}>
        {config.timer>0&&<ExamTimer totalSeconds={config.timer} onTimeUp={handleTimeUp}/>}
        <TouchableOpacity onPress={()=>setFlagged(f=>{const n=new Set(f);n.has(q.id)?n.delete(q.id):n.add(q.id);return n;})}>
          <Icon name={flagged.has(q.id)?'flag':'flag-outline'} size={20} color={flagged.has(q.id)?C.warning:C.muted}/>
        </TouchableOpacity>
        <Text style={{fontWeight:'700',fontSize:14}}>{idx+1}/{config.adaptive?config.count:questions.length}</Text>
      </Row>
      <TouchableOpacity onPress={onFinish}><Icon name="close-circle" size={24} color={C.danger}/></TouchableOpacity>
    </View>
    <View style={{height:4,backgroundColor:C.fill}}>
      <View style={{width:`${(idx/Math.max(maxIdx,1))*100}%`,height:4,backgroundColor:config.adaptive?C.purple:C.primary}}/>
    </View>
    {config.adaptive&&<View style={{backgroundColor:C.purple+'10',paddingHorizontal:16,paddingVertical:4}}>
      <Row style={{justifyContent:'space-between'}}>
        <Pill label={`θ = ${theta.toFixed(2)}`} color={C.purple} small/>
        <Text style={{fontSize:11,color:C.purple,fontWeight:'700'}}>רמה: {DIFF_LABEL[AdaptiveEngine.thetaToLevel(theta)]}</Text>
      </Row>
    </View>}

    <ScrollView contentContainerStyle={{padding:16,paddingBottom:110}} showsVerticalScrollIndicator={false}>
      <Animated.View style={{opacity:fadeAnim}}>
        {q.type==='reading'&&<PassageCard passage={q.passage}/>}
        <Card style={{marginBottom:14,borderTopWidth:3,borderTopColor:t?.color||C.primary}}>
          <Row style={{justifyContent:'space-between',marginBottom:8}}>
            <Pill label={DIFF_LABEL[q.diff]} color={DIFF_COLOR[q.diff]}/>
            <Row style={{flex:0,gap:4}}><Text style={{fontSize:12,color:C.muted}}>{t?.name}</Text><Text style={{fontSize:16}}>{t?.icon}</Text></Row>
          </Row>
          {q.type==='restatement'&&<Text style={{fontSize:12,color:C.purple,fontWeight:'700',textAlign:'right',marginBottom:6}}>🔁 בחר את ההצהרה השקולה</Text>}
          <Text style={{fontSize:17,fontWeight:'700',textAlign:'right',color:C.text,lineHeight:27}}>{q.q}</Text>
        </Card>
        {q.opts.map((opt,i)=><AnswerOpt key={i} text={opt} index={i} selected={selected} correctIdx={q.a} studyMode={config.mode==='study'} onPress={handleSelect}/>)}
        {config.mode==='study'&&showExp&&<Card style={{backgroundColor:'#fffbeb',borderWidth:1,borderColor:C.warning+'50',marginTop:8}}>
          <Row style={{justifyContent:'flex-end',marginBottom:6}}><Text style={{fontWeight:'700',color:C.warning,fontSize:13}}>💡 הסבר</Text></Row>
          <Text style={{textAlign:'right',fontSize:14,color:C.text,lineHeight:22}}>{q.exp}</Text>
        </Card>}
      </Animated.View>
    </ScrollView>
    {selected!==null&&<View style={S.qBottom}>
      <TouchableOpacity style={S.btn} onPress={handleNext}>
        <Icon name={idx===maxIdx?'checkmark':'arrow-back'} size={17} color="#fff"/>
        <Text style={[S.btnTxt,{marginRight:8}]}>{idx===maxIdx?'סיים':'הבא'}</Text>
      </TouchableOpacity>
    </View>}
  </SafeAreaView>;
}

// ─── RESULTS SCREEN ───────────────────────────────────────────────────────────
function ResultsScreen({questions,answers,result,theta,onDismiss}) {
  const [detail,setDetail] = useState(false);
  const {base,weighted,correct,total,pass,secs,topicMap} = result;
  const gradeColor = pass?C.success:base>=60?C.warning:C.danger;
  const gradeLabel2 = base>=90?'מצוין! 🌟':base>=75?'טוב מאוד':base>=70?'עבר ✓':base>=60?'כמעט...':'נכשל';
  return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
    <StatusBar barStyle="dark-content"/>
    <View style={S.qBar}>
      <TouchableOpacity onPress={onDismiss}><Icon name="close" size={22} color={C.muted}/></TouchableOpacity>
      <Text style={{fontWeight:'800',fontSize:16}}>תוצאות</Text>
    </View>
    <ScrollView contentContainerStyle={{padding:16,paddingBottom:100}} showsVerticalScrollIndicator={false}>
      {/* Score */}
      <View style={{alignItems:'center',paddingVertical:20}}>
        <View style={{width:140,height:140,borderRadius:70,borderWidth:12,borderColor:gradeColor,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:36,fontWeight:'900',color:gradeColor}}>{base}%</Text>
        </View>
        <View style={{backgroundColor:gradeColor+'18',borderWidth:2,borderColor:gradeColor,borderRadius:30,paddingHorizontal:24,paddingVertical:8,marginTop:14}}>
          <Text style={{fontSize:18,fontWeight:'900',color:gradeColor}}>{gradeLabel2}</Text>
        </View>
        <Text style={{color:C.muted,fontSize:14,marginTop:8}}>{correct} מתוך {total} נכונות</Text>
        {theta!==null&&<Pill label={`רמה: ${DIFF_LABEL[AdaptiveEngine.thetaToLevel(theta)]} (θ=${theta.toFixed(2)})`} color={C.purple}/>}
      </View>
      {/* Stats */}
      <Card style={{flexDirection:'row-reverse',marginBottom:12}}>
        {[{v:correct,l:'נכון',c:C.success,i:'checkmark-circle'},{v:total-correct,l:'שגוי',c:C.danger,i:'close-circle'},{v:fmtTime(secs),l:'זמן',c:C.primary,i:'time'}].map((s,i,arr)=>(
          <View key={s.l} style={[{flex:1,alignItems:'center',paddingVertical:10},i<arr.length-1&&{borderRightWidth:1,borderRightColor:C.border}]}>
            <Icon name={s.i} size={18} color={s.c}/>
            <Text style={{fontSize:20,fontWeight:'900',color:s.c,marginTop:3}}>{s.v}</Text>
            <Text style={{fontSize:12,color:C.muted}}>{s.l}</Text>
          </View>
        ))}
      </Card>
      {/* Weighted score */}
      {weighted!==base&&<Card style={{marginBottom:12}}>
        <Row style={{justifyContent:'space-between'}}>
          <Pill label={`${weighted}%`} color={C.purple}/>
          <Col>
            <Text style={{fontWeight:'700',fontSize:14}}>ציון משוקלל לפי קושי</Text>
            <Text style={{fontSize:12,color:C.muted}}>שאלות קשות שוות יותר</Text>
          </Col>
        </Row>
      </Card>}
      {/* Topic breakdown */}
      {Object.keys(topicMap).length>1&&<>
        <Sec title="לפי נושא"/>
        {Object.entries(topicMap).map(([tid,tm])=>{
          const t=topicById(tid), p2=pct(tm.correct,tm.total);
          return <Card key={tid} style={{marginBottom:8}}>
            <Row style={{justifyContent:'space-between',marginBottom:6}}>
              <Pill label={`${p2}%`} color={p2>=70?C.success:C.warning} small/>
              <Row style={{flex:0,gap:4}}><Text style={{fontWeight:'700',fontSize:13}}>{t?.name}</Text><Text style={{fontSize:18}}>{t?.icon}</Text></Row>
            </Row>
            <Bar value={p2} total={100} color={t?.color||C.primary} h={5}/>
            <Text style={{textAlign:'right',fontSize:11,color:C.muted,marginTop:3}}>{tm.correct}/{tm.total}</Text>
          </Card>;
        })}
      </>}
      {/* Detail */}
      <Card>
        <Row style={{justifyContent:'space-between'}}>
          <Switch value={detail} onValueChange={setDetail} trackColor={{false:C.border,true:C.primary}} thumbColor="#fff"/>
          <Row style={{flex:0,gap:4}}><Icon name="list" size={16} color={C.text}/><Text style={{fontWeight:'700',fontSize:14}}>פירוט תשובות</Text></Row>
        </Row>
      </Card>
      {detail&&questions.map((q,i)=><ReviewRow key={q.id} q={q} idx={i} sel={answers[i]}/>)}
    </ScrollView>
    <View style={S.qBottom}>
      <TouchableOpacity style={S.btn} onPress={onDismiss}>
        <Icon name="home" size={17} color="#fff"/>
        <Text style={[S.btnTxt,{marginRight:8}]}>חזור לבית</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>;
}

// ─── TOPICS SCREEN ────────────────────────────────────────────────────────────
function TopicsScreen({prog,onQuiz}) {
  const tp = prog.topicProgress||{};
  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:24}} showsVerticalScrollIndicator={false}>
    <Text style={S.pgTitle}>נושאים</Text>
    {TOPICS.map(t=>{
      const p=tp[t.id], p2=p?pct(p.correct,p.answered):0;
      const total=getQsByTopic(t.id).length;
      const easy=QS.filter(q=>q.topic===t.id&&q.diff==='beginner').length;
      const med=QS.filter(q=>q.topic===t.id&&q.diff==='intermediate').length;
      const adv=QS.filter(q=>q.topic===t.id&&q.diff==='advanced').length;
      const exp=QS.filter(q=>q.topic===t.id&&q.diff==='expert').length;
      return <Card key={t.id} style={{marginBottom:14,borderTopWidth:3,borderTopColor:t.color}} onPress={()=>onQuiz({count:total,topic:t.id,mode:'exam',timer:0,adaptive:false})}>
        <Row style={{justifyContent:'space-between',marginBottom:8}}>
          <Col><Text style={{fontSize:12,color:C.muted}}>{p?.answered||0}/{total}</Text>
            {p2>0&&<Text style={{fontSize:12,fontWeight:'700',color:p2>=70?C.success:C.warning}}>{p2}%</Text>}</Col>
          <Row style={{flex:0,gap:10}}>
            <Col style={{alignItems:'flex-end'}}>
              <Text style={{fontSize:17,fontWeight:'800'}}>{t.name}</Text>
            </Col>
            <View style={{width:50,height:50,borderRadius:25,backgroundColor:t.color+'20',alignItems:'center',justifyContent:'center'}}>
              <Text style={{fontSize:26}}>{t.icon}</Text>
            </View>
          </Row>
        </Row>
        <Bar value={p2} total={100} color={t.color} h={6}/>
        <Row style={{justifyContent:'space-between',marginTop:8}}>
          <Row style={{flex:0,gap:5}}>
            {[['קל',C.success,easy],['בינוני',C.warning,med],['מתקדם',C.orange,adv],['מומחה',C.danger,exp]].filter(([,, n])=>n>0).map(([l,c,n])=>(
              <Pill key={l} label={`${n} ${l}`} color={c} small/>
            ))}
          </Row>
          <Row style={{flex:0,gap:2}}><Text style={{fontSize:12,color:C.primary,fontWeight:'700'}}>התחל</Text><Icon name="arrow-back" size={13} color={C.primary}/></Row>
        </Row>
      </Card>;
    })}
  </ScrollView>;
}

// ─── PROGRESS SCREEN ──────────────────────────────────────────────────────────
function ProgressScreen({prog,dispatch,currentUser,onLogout}) {
  const [userName,setUserName]=useState(prog.userName||'');
  const [goal,setGoal]=useState(String(prog.dailyGoal||20));
  const tp=prog.topicProgress||{};
  const history=(prog.quizHistory||[]).slice(0,15);
  const overall=pct(prog.totalCorrect,prog.totalAnswered);
  const adaptiveLog=(prog.adaptiveLog||[]).slice(0,5);

  const achievements=[
    {icon:'🥉',label:'10 שאלות',done:prog.totalAnswered>=10},
    {icon:'🥈',label:'50 שאלות',done:prog.totalAnswered>=50},
    {icon:'🥇',label:'100 שאלות',done:prog.totalAnswered>=100},
    {icon:'🏆',label:'ציון 80%+',done:prog.totalAnswered>=20&&overall>=80},
    {icon:'🔥',label:'3 ימי רצף',done:prog.streakDays>=3},
    {icon:'⚡',label:'7 ימי רצף',done:prog.streakDays>=7},
    {icon:'🎯',label:'עבר בחינה',done:(prog.quizHistory||[]).some(h=>h.pass&&h.total>=15)},
    {icon:'🧠',label:'כל הנושאים',done:TOPICS.every(t=>(tp[t.id]?.answered||0)>0)},
  ];

  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(6-i));
    const ds=d.toDateString();
    const qs=(prog.quizHistory||[]).filter(h=>new Date(h.date).toDateString()===ds).reduce((s,h)=>s+h.total,0);
    return {label:['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'][d.getDay()],qs};
  });
  const maxQs=Math.max(...last7.map(d=>d.qs),1);

  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:32}} showsVerticalScrollIndicator={false}>
    <Text style={S.pgTitle}>התקדמות</Text>
    {/* Summary card */}
    <Card style={{backgroundColor:C.primary,marginBottom:14}}>
      <Row style={{justifyContent:'space-between',alignItems:'center'}}>
        <View style={{width:100,height:100,borderRadius:50,borderWidth:10,borderColor:'#fff3',alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:28,fontWeight:'900',color:'#fff'}}>{overall}%</Text>
        </View>
        <Col style={{flex:1,alignItems:'flex-end',paddingRight:14}}>
          <Text style={{color:'#bfdbfe',fontSize:12,marginBottom:3}}>ציון כללי</Text>
          <Text style={{color:'#fff',fontSize:20,fontWeight:'900'}}>{prog.totalAnswered||0} שאלות</Text>
          <Text style={{color:'#bfdbfe',fontSize:13}}>{prog.totalCorrect||0} נכונות</Text>
          <Text style={{color:'#fde68a',fontWeight:'700',marginTop:6}}>🔥 {prog.streakDays||0} ימי רצף</Text>
        </Col>
      </Row>
    </Card>
    {/* Activity chart */}
    <Card>
      <Text style={{textAlign:'right',fontWeight:'700',fontSize:14,marginBottom:12}}>פעילות 7 ימים</Text>
      <Row style={{alignItems:'flex-end',justifyContent:'space-between',height:80}}>
        {last7.map((d,i)=>(
          <View key={i} style={{alignItems:'center',flex:1}}>
            <View style={{flex:1,justifyContent:'flex-end',width:'70%'}}>
              <View style={{height:`${Math.max(d.qs/maxQs*100,d.qs>0?12:4)}%`,backgroundColor:d.qs>0?C.primary:C.fill,borderRadius:4}}/>
            </View>
            <Text style={{fontSize:10,color:C.muted,marginTop:4}}>{d.label}</Text>
            {d.qs>0&&<Text style={{fontSize:9,color:C.primary,fontWeight:'700'}}>{d.qs}</Text>}
          </View>
        ))}
      </Row>
    </Card>
    {/* Adaptive log */}
    {adaptiveLog.length>0&&<>
      <Sec title=" היסטוריית אדפטיבי 🧠"/>
      {adaptiveLog.map((log,i)=>(
        <Card key={i} style={{marginBottom:8}}>
          <Row style={{justifyContent:'space-between'}}>
            <Row style={{flex:0,gap:6}}>
              <Pill label={DIFF_LABEL[AdaptiveEngine.thetaToLevel(log.theta_end)]} color={C.purple} small/>
              <Text style={{fontSize:11,color:C.muted}}>{log.questions_count} שאלות</Text>
            </Row>
            <Text style={{fontWeight:'700',fontSize:13,color:C.purple}}>θ {log.theta_start?.toFixed(1)}→{log.theta_end?.toFixed(1)}</Text>
          </Row>
        </Card>
      ))}
    </>}
    {/* Topics */}
    <Sec title="לפי נושא"/>
    {TOPICS.map(t=>{const p=tp[t.id],p2=p?pct(p.correct,p.answered):0;return(
      <Card key={t.id} style={{marginBottom:8}}>
        <Row style={{justifyContent:'space-between',marginBottom:6}}>
          <Text style={{fontSize:12,color:p2>=70?C.success:p2>0?C.warning:C.muted,fontWeight:'700'}}>{p?`${p2}%`:'טרם התחיל'}</Text>
          <Row style={{flex:0,gap:4}}><Text style={{fontWeight:'700',fontSize:13}}>{t.name}</Text><Text style={{fontSize:18}}>{t.icon}</Text></Row>
        </Row>
        <Bar value={p2} total={100} color={t.color} h={5}/>
        {p&&<Text style={{textAlign:'right',fontSize:11,color:C.muted,marginTop:3}}>{p.correct}/{p.answered}</Text>}
      </Card>
    );})}
    {/* Achievements */}
    <Sec title="הישגים"/>
    <View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:10,marginBottom:14}}>
      {achievements.map((a,i)=>(
        <View key={i} style={[{width:(W-56)/4,backgroundColor:C.card,borderRadius:14,padding:10,alignItems:'center',shadowColor:'#000',shadowOpacity:0.05,shadowRadius:4,elevation:1},!a.done&&{opacity:0.3}]}>
          <Text style={{fontSize:26}}>{a.icon}</Text>
          <Text style={{fontSize:10,color:C.text,marginTop:3,textAlign:'center'}}>{a.label}</Text>
          {a.done&&<Icon name="checkmark-circle" size={12} color={C.success}/>}
        </View>
      ))}
    </View>
    {/* History */}
    {history.length>0&&<><Sec title="היסטוריה"/>
      {history.map((h,i)=>{
        const t=h.topic?topicById(h.topic):null;
        return <Card key={i} style={{marginBottom:7}}>
          <Row style={{justifyContent:'space-between'}}>
            <Row style={{flex:0,gap:6}}>
              <Text style={{fontSize:11,color:C.muted}}>{new Date(h.date).toLocaleDateString('he-IL')}</Text>
              <Pill label={`${h.base}%`} color={h.pass?C.success:C.warning} small/>
            </Row>
            <Text style={{fontWeight:'700',fontSize:13}}>{t?`${t.icon} ${t.name}`:'🔲 כל הנושאים'}</Text>
          </Row>
          <Text style={{textAlign:'right',fontSize:11,color:C.muted,marginTop:3}}>{h.score}/{h.total} • {fmtTime(h.secs)}</Text>
        </Card>;
      })}
    </>}
    {/* Settings */}
    <Sec title="הגדרות"/>
    <Card>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>שם</Text>
      <TextInput style={S.inp} value={userName} onChangeText={setUserName} placeholder="שמך..." textAlign="right" placeholderTextColor={C.muted}/>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginTop:12,marginBottom:8}}>יעד יומי</Text>
      <Row style={{gap:8}}>
        {['10','20','30','50'].map(n=><TouchableOpacity key={n} style={[S.cntBtn,goal===n&&S.cntBtnOn]} onPress={()=>setGoal(n)}>
          <Text style={[S.cntTxt,goal===n&&{color:'#fff'}]}>{n}</Text>
        </TouchableOpacity>)}
      </Row>
      <TouchableOpacity style={[S.btn,{marginTop:14}]} onPress={()=>{dispatch({type:'SETTINGS',payload:{userName:userName.trim(),dailyGoal:parseInt(goal)||20}});Alert.alert('✓','נשמר');}}>
        <Icon name="save-outline" size={16} color="#fff"/><Text style={[S.btnTxt,{marginRight:6}]}>שמור</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[S.outBtn,{borderColor:C.danger+'60',marginTop:8}]} onPress={()=>Alert.alert('איפוס','מחיקת כל ההתקדמות?',[{text:'ביטול',style:'cancel'},{text:'איפוס',style:'destructive',onPress:()=>dispatch({type:'RESET'})}])}>
        <Icon name="trash-outline" size={16} color={C.danger}/><Text style={{color:C.danger,fontWeight:'700',marginRight:6}}>איפוס התקדמות</Text>
      </TouchableOpacity>
      {onLogout&&<TouchableOpacity style={[S.outBtn,{borderColor:C.primary+'60',marginTop:8}]} onPress={()=>Alert.alert('התנתקות','להתנתק מהחשבון?',[{text:'ביטול',style:'cancel'},{text:'התנתק',onPress:onLogout}])}>
        <Icon name="log-out-outline" size={16} color={C.primary}/><Text style={{color:C.primary,fontWeight:'700',marginRight:6}}>התנתקות</Text>
      </TouchableOpacity>}
    </Card>
  </ScrollView>;
}

// ─── TAB BAR ──────────────────────────────────────────────────────────────────
function TabBar({tab,setTab}) {
  const tabs=[{id:'home',label:'בית',icon:'home-outline',active:'home'},{id:'topics',label:'נושאים',icon:'book-outline',active:'book'},{id:'quiz',label:'בחינה',icon:'pencil-outline',active:'pencil'},{id:'progress',label:'התקדמות',icon:'bar-chart-outline',active:'bar-chart'}];
  return <View style={S.tabBar}>
    {tabs.map(t=>{const on=tab===t.id;return(
      <TouchableOpacity key={t.id} style={S.tabItem} onPress={()=>setTab(t.id)}>
        {on&&<View style={S.tabInd}/>}
        <Icon name={on?t.active:t.icon} size={22} color={on?C.primary:C.muted}/>
        <Text style={{fontSize:11,color:on?C.primary:C.muted,fontWeight:on?'700':'400',marginTop:3}}>{t.label}</Text>
      </TouchableOpacity>
    );})}
  </View>;
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({gsData,onLogin,onRegister}) {
  const [tab,setTab]=useState('login');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [name,setName]=useState('');
  const [showPwd,setShowPwd]=useState(false);
  return <SafeAreaView style={{flex:1,backgroundColor:C.primary}}>
    <StatusBar barStyle="light-content"/>
    <View style={{alignItems:'center',paddingTop:48,paddingBottom:28}}>
      <Text style={{fontSize:56,marginBottom:6}}>🌐</Text>
      <Text style={{fontSize:26,fontWeight:'900',color:'#fff'}}>AmirNet Plus</Text>
      <Text style={{fontSize:13,color:'#bfdbfe',marginTop:4}}>הכנה מקצועית לבחינת אמירנט</Text>
    </View>
    <View style={{flex:1,backgroundColor:C.bg,borderTopLeftRadius:28,borderTopRightRadius:28,overflow:'hidden'}}>
      <View style={{flexDirection:'row-reverse',backgroundColor:C.fill,margin:16,borderRadius:12,padding:4}}>
        {[['login','התחברות'],['register','הרשמה']].map(([v,l])=>(
          <TouchableOpacity key={v} onPress={()=>setTab(v)}
            style={{flex:1,paddingVertical:10,borderRadius:10,alignItems:'center',
              backgroundColor:tab===v?C.card:'transparent',elevation:tab===v?2:0}}>
            <Text style={{fontWeight:'700',color:tab===v?C.primary:C.muted,fontSize:14}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={{paddingHorizontal:20,paddingBottom:40}}>
        {tab==='register'&&<>
          <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>שם מלא</Text>
          <TextInput style={[S.inp,{marginBottom:12}]} value={name} onChangeText={setName}
            placeholder="הכנס שמך המלא..." placeholderTextColor={C.muted} textAlign="right"/>
        </>}
        <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>שם משתמש</Text>
        <TextInput style={[S.inp,{marginBottom:12}]} value={username} onChangeText={setUsername}
          placeholder="username" placeholderTextColor={C.muted} textAlign="right" autoCapitalize="none"/>
        <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>סיסמה</Text>
        <View style={{marginBottom:4}}>
          <TextInput style={S.inp} value={password} onChangeText={setPassword}
            placeholder="••••••" placeholderTextColor={C.muted} textAlign="right"
            secureTextEntry={!showPwd} autoCapitalize="none"/>
          <TouchableOpacity onPress={()=>setShowPwd(s=>!s)} style={{position:'absolute',left:12,top:14}}>
            <Icon name={showPwd?'eye-off-outline':'eye-outline'} size={18} color={C.muted}/>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[S.btn,{marginTop:20}]}
          onPress={()=>tab==='login'?onLogin(username.trim(),password):onRegister(name.trim(),username.trim(),password)}>
          <Icon name={tab==='login'?'log-in-outline':'person-add-outline'} size={18} color="#fff"/>
          <Text style={[S.btnTxt,{marginRight:8}]}>{tab==='login'?'התחבר':'הרשם'}</Text>
        </TouchableOpacity>
        {tab==='login'&&<View style={{backgroundColor:'#eff6ff',borderRadius:12,padding:12,marginTop:16,borderWidth:1,borderColor:C.primary+'30'}}>
          <Row style={{justifyContent:'flex-end',gap:6,marginBottom:4}}>
            <Text style={{fontSize:13,color:C.primary,fontWeight:'700'}}>כניסת מנהל</Text>
            <Icon name="shield-checkmark" size={16} color={C.primary}/>
          </Row>
          <Text style={{textAlign:'right',fontSize:12,color:C.muted}}>משתמש: admin  •  סיסמה: admin123</Text>
        </View>}
        {tab==='register'&&!gsData.settings.regEnabled&&<View style={{backgroundColor:'#fef2f2',borderRadius:12,padding:12,marginTop:12,borderWidth:1,borderColor:C.danger+'30'}}>
          <Text style={{textAlign:'right',fontSize:13,color:C.danger,fontWeight:'700'}}>⚠️ ההרשמה סגורה</Text>
          <Text style={{textAlign:'right',fontSize:12,color:C.danger}}>צור קשר עם המנהל</Text>
        </View>}
      </ScrollView>
    </View>
  </SafeAreaView>;
}

// ─── ADMIN: DASHBOARD ─────────────────────────────────────────────────────────
function AdminDashboard({gsData,onNav}) {
  const students=gsData.users.filter(u=>u.role==='student');
  const today=new Date().toDateString();
  const activeToday=students.filter(u=>(u.prog?.quizHistory||[]).some(h=>new Date(h.date).toDateString()===today)).length;
  const allHistory=students.flatMap(u=>u.prog?.quizHistory||[]);
  const overallPassRate=allHistory.length>0?pct(allHistory.filter(h=>h.pass).length,allHistory.length):0;
  const totalAnswered=students.reduce((s,u)=>s+(u.prog?.totalAnswered||0),0);
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));
    const ds=d.toDateString();
    const qs=allHistory.filter(h=>new Date(h.date).toDateString()===ds).reduce((s,h)=>s+h.total,0);
    return {label:['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'][d.getDay()],qs};
  });
  const maxBar=Math.max(...last7.map(d=>d.qs),1);
  const topStudents=students.filter(u=>(u.prog?.totalAnswered||0)>=5)
    .map(u=>({...u,score:pct(u.prog.totalCorrect,u.prog.totalAnswered)}))
    .sort((a,b)=>b.score-a.score).slice(0,5);
  const allQsCount=QS.length+gsData.customQs.length;
  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:20}}>
    <Text style={S.pgTitle}>לוח בקרה 📊</Text>
    <Row style={{gap:8,marginBottom:4}}>
      {[{v:students.length,l:'סטודנטים',i:'people',c:C.primary},{v:activeToday,l:'פעילים היום',i:'today-outline',c:C.success},
        {v:totalAnswered,l:'שאלות נענו',i:'help-circle',c:C.purple},{v:`${overallPassRate}%`,l:'עבר בחינה',i:'trophy',c:C.warning}]
        .map(s=><Card key={s.l} style={{flex:1,alignItems:'center',padding:10,marginBottom:0}}>
          <Icon name={s.i} size={20} color={s.c}/>
          <Text style={{fontSize:18,fontWeight:'900',color:s.c,marginTop:3}}>{s.v}</Text>
          <Text style={{fontSize:10,color:C.muted,textAlign:'center',marginTop:1}}>{s.l}</Text>
        </Card>)}
    </Row>
    <Row style={{gap:8,marginBottom:12}}>
      {[{v:allQsCount,l:'שאלות בבנק',i:'book',c:C.cyan},{v:gsData.customQs.length,l:'מותאמות',i:'create',c:C.orange},
        {v:gsData.announcements.filter(a=>!a.expiresAt||a.expiresAt>Date.now()).length,l:'הודעות פעילות',i:'megaphone',c:C.danger},
        {v:students.filter(u=>u.blocked).length,l:'חסומים',i:'ban-outline',c:C.muted}]
        .map(s=><Card key={s.l} style={{flex:1,alignItems:'center',padding:10,marginBottom:0}}>
          <Icon name={s.i} size={18} color={s.c}/>
          <Text style={{fontSize:17,fontWeight:'900',color:s.c,marginTop:2}}>{s.v}</Text>
          <Text style={{fontSize:10,color:C.muted,textAlign:'center',marginTop:1}}>{s.l}</Text>
        </Card>)}
    </Row>
    <Card>
      <Text style={{textAlign:'right',fontWeight:'700',fontSize:14,marginBottom:12}}>פעילות 7 ימים</Text>
      <Row style={{alignItems:'flex-end',justifyContent:'space-between',height:80}}>
        {last7.map((d,i)=>(
          <View key={i} style={{alignItems:'center',flex:1}}>
            <View style={{flex:1,justifyContent:'flex-end',width:'70%'}}>
              <View style={{height:`${Math.max(d.qs/maxBar*100,d.qs>0?10:4)}%`,backgroundColor:d.qs>0?C.primary:C.fill,borderRadius:4}}/>
            </View>
            <Text style={{fontSize:10,color:C.muted,marginTop:4}}>{d.label}</Text>
            {d.qs>0&&<Text style={{fontSize:9,color:C.primary,fontWeight:'700'}}>{d.qs}</Text>}
          </View>
        ))}
      </Row>
    </Card>
    {topStudents.length>0&&<>
      <Sec title="🏆 מובילי לוח"/>
      {topStudents.map((u,i)=>(
        <Card key={u.id} style={{marginBottom:8}}>
          <Row style={{justifyContent:'space-between',marginBottom:6}}>
            <Row style={{flex:0,gap:8}}><Pill label={`${u.score}%`} color={u.score>=70?C.success:C.warning}/>
              <Text style={{fontSize:12,color:C.muted}}>{u.prog?.totalAnswered} שאלות</Text></Row>
            <Row style={{flex:0,gap:8}}><Text style={{fontWeight:'700',fontSize:14}}>{u.name}</Text>
              <View style={{width:26,height:26,borderRadius:13,backgroundColor:C.primary+'20',alignItems:'center',justifyContent:'center'}}>
                <Text style={{fontSize:12,fontWeight:'900',color:C.primary}}>#{i+1}</Text></View></Row>
          </Row>
          <Bar value={u.score} total={100} color={u.score>=70?C.success:C.warning} h={4}/>
        </Card>
      ))}
    </>}
    <Sec title="פעולות מהירות"/>
    <Row style={{gap:10}}>
      {[{l:'הוסף שאלה',i:'add-circle',c:C.success,t:'questions'},
        {l:'הודעה חדשה',i:'megaphone',c:C.orange,t:'announcements'},
        {l:'ניהול משתמשים',i:'people',c:C.primary,t:'users'}].map(a=>(
        <TouchableOpacity key={a.t} style={[S.card,{flex:1,alignItems:'center',padding:12,marginBottom:0}]} onPress={()=>onNav(a.t)}>
          <Icon name={a.i} size={22} color={a.c}/>
          <Text style={{fontSize:11,fontWeight:'700',color:a.c,marginTop:4,textAlign:'center'}}>{a.l}</Text>
        </TouchableOpacity>
      ))}
    </Row>
  </ScrollView>;
}

// ─── ADMIN: USERS ─────────────────────────────────────────────────────────────
function AdminUsers({gsData,setGsData}) {
  const [search,setSearch]=useState('');
  const [filter,setFilter]=useState('all');
  const [selectedUser,setSelectedUser]=useState(null);
  const students=gsData.users.filter(u=>u.role==='student');
  const filtered=students
    .filter(u=>filter==='blocked'?u.blocked:filter==='active'?!u.blocked:true)
    .filter(u=>!search||u.name.includes(search)||u.username.includes(search));

  function toggleBlock(id){setGsData(gd=>({...gd,users:gd.users.map(u=>u.id===id?{...u,blocked:!u.blocked}:u)}));}
  function resetProg(id){Alert.alert('איפוס','למחוק את כל ההתקדמות?',[{text:'ביטול',style:'cancel'},{text:'איפוס',style:'destructive',onPress:()=>setGsData(gd=>({...gd,users:gd.users.map(u=>u.id===id?{...u,prog:INIT_PROG}:u)}))}]);}
  function deleteUser(id){Alert.alert('מחיקה','למחוק משתמש לצמיתות?',[{text:'ביטול',style:'cancel'},{text:'מחק',style:'destructive',onPress:()=>{setGsData(gd=>({...gd,users:gd.users.filter(u=>u.id!==id)}));if(selectedUser?.id===id)setSelectedUser(null);}}]);}

  const DetailOverlay=selectedUser?(()=>{
    const u=gsData.users.find(x=>x.id===selectedUser.id)||selectedUser;
    const p=u.prog||INIT_PROG;
    const overall=pct(p.totalCorrect,p.totalAnswered);
    return <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'flex-end'}}>
      <View style={{backgroundColor:C.bg,borderTopLeftRadius:24,borderTopRightRadius:24,maxHeight:'88%'}}>
        <View style={{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',padding:18,borderBottomWidth:1,borderBottomColor:C.border}}>
          <TouchableOpacity onPress={()=>setSelectedUser(null)}><Icon name="close" size={22} color={C.muted}/></TouchableOpacity>
          <Text style={{fontWeight:'800',fontSize:17}}>{u.name}</Text>
        </View>
        <ScrollView contentContainerStyle={{padding:16}}>
          <Row style={{gap:8,marginBottom:12,flexWrap:'wrap'}}>
            <Pill label={`@${u.username}`} color={C.primary}/>
            <Pill label={`נרשם: ${new Date(u.createdAt).toLocaleDateString('he-IL')}`} color={C.muted}/>
            {u.blocked&&<Pill label="חסום" color={C.danger}/>}
          </Row>
          <Row style={{gap:8,marginBottom:12}}>
            {[{v:p.totalAnswered||0,l:'שאלות',c:C.primary},{v:`${overall}%`,l:'הצלחה',c:overall>=70?C.success:C.warning},{v:p.streakDays||0,l:'רצף',c:C.orange}]
              .map(s=><Card key={s.l} style={{flex:1,alignItems:'center',padding:10,marginBottom:0}}>
                <Text style={{fontSize:18,fontWeight:'900',color:s.c}}>{s.v}</Text>
                <Text style={{fontSize:11,color:C.muted}}>{s.l}</Text>
              </Card>)}
          </Row>
          <Sec title="לפי נושא"/>
          {TOPICS.map(t=>{const tp=p.topicProgress?.[t.id],p2=tp?pct(tp.correct,tp.answered):0;return(
            <Card key={t.id} style={{marginBottom:6}}>
              <Row style={{justifyContent:'space-between',marginBottom:4}}>
                <Text style={{fontSize:12,color:p2>=70?C.success:p2>0?C.warning:C.muted}}>{tp?`${p2}%`:'טרם התחיל'}</Text>
                <Row style={{flex:0,gap:4}}><Text style={{fontSize:14}}>{t.icon}</Text><Text style={{fontWeight:'700',fontSize:13}}>{t.name}</Text></Row>
              </Row>
              {tp&&<Bar value={p2} total={100} color={t.color} h={4}/>}
            </Card>);
          })}
          {(p.quizHistory||[]).length>0&&<><Sec title="5 בחינות אחרונות"/>
            {(p.quizHistory||[]).slice(0,5).map((h,i)=>{const t=h.topic?topicById(h.topic):null;return(
              <Card key={i} style={{marginBottom:6}}>
                <Row style={{justifyContent:'space-between'}}>
                  <Row style={{flex:0,gap:4}}><Text style={{fontSize:11,color:C.muted}}>{new Date(h.date).toLocaleDateString('he-IL')}</Text>
                    <Pill label={`${h.base}%`} color={h.pass?C.success:C.danger} small/></Row>
                  <Text style={{fontWeight:'700',fontSize:13}}>{t?`${t.icon} ${t.name}`:'🔲 כולם'}</Text>
                </Row>
                <Text style={{textAlign:'right',fontSize:11,color:C.muted,marginTop:3}}>{h.score}/{h.total} • {fmtTime(h.secs)}</Text>
              </Card>);})}
          </>}
          <Sec title="פעולות"/>
          <TouchableOpacity style={[S.outBtn,{marginBottom:10,borderColor:(u.blocked?C.success:C.warning)+'60'}]}
            onPress={()=>{toggleBlock(u.id);setSelectedUser(prev=>({...prev,blocked:!prev.blocked}));}}>
            <Icon name={u.blocked?'checkmark-circle-outline':'ban-outline'} size={16} color={u.blocked?C.success:C.warning}/>
            <Text style={{color:u.blocked?C.success:C.warning,fontWeight:'700',marginRight:6}}>{u.blocked?'בטל חסימה':'חסום משתמש'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.outBtn,{marginBottom:10,borderColor:C.orange+'60'}]} onPress={()=>resetProg(u.id)}>
            <Icon name="refresh-circle-outline" size={16} color={C.orange}/>
            <Text style={{color:C.orange,fontWeight:'700',marginRight:6}}>איפוס התקדמות</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[S.outBtn,{borderColor:C.danger+'60'}]} onPress={()=>{setSelectedUser(null);deleteUser(u.id);}}>
            <Icon name="trash-outline" size={16} color={C.danger}/>
            <Text style={{color:C.danger,fontWeight:'700',marginRight:6}}>מחק משתמש</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>;
  })():null;

  return <View style={{flex:1}}>
    <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:20}}>
      <Text style={S.pgTitle}>ניהול משתמשים 👥</Text>
      <TextInput style={[S.inp,{marginBottom:10}]} value={search} onChangeText={setSearch}
        placeholder="🔍 חיפוש לפי שם..." placeholderTextColor={C.muted} textAlign="right"/>
      <Row style={{gap:8,marginBottom:14}}>
        {[['all','הכל'],['active','פעילים'],['blocked','חסומים']].map(([v,l])=>(
          <TouchableOpacity key={v} style={[S.cntBtn,filter===v&&S.cntBtnOn,{flex:1}]} onPress={()=>setFilter(v)}>
            <Text style={[S.cntTxt,filter===v&&{color:'#fff'}]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      {filtered.length===0&&<Card><Text style={{textAlign:'center',color:C.muted}}>אין משתמשים</Text></Card>}
      {filtered.map(u=>{
        const p=u.prog,score=p?pct(p.totalCorrect,p.totalAnswered):0;
        return <Card key={u.id} style={{marginBottom:10}}>
          <Row style={{justifyContent:'space-between',marginBottom:8}}>
            <Row style={{flex:0,gap:6}}>{u.blocked&&<Pill label="חסום" color={C.danger} small/>}
              <Text style={{fontSize:11,color:C.muted}}>{new Date(u.createdAt).toLocaleDateString('he-IL')}</Text></Row>
            <Col style={{alignItems:'flex-end'}}>
              <Text style={{fontWeight:'800',fontSize:15}}>{u.name}</Text>
              <Text style={{fontSize:11,color:C.muted}}>@{u.username}</Text>
            </Col>
          </Row>
          {p&&p.totalAnswered>0&&<><Row style={{justifyContent:'space-between',marginBottom:4}}>
            <Text style={{fontSize:12,color:score>=70?C.success:C.warning,fontWeight:'700'}}>{score}%</Text>
            <Text style={{fontSize:12,color:C.muted}}>{p.totalAnswered} שאלות • 🔥{p.streakDays||0}</Text>
          </Row><Bar value={score} total={100} color={score>=70?C.success:C.warning} h={4}/></>}
          <Row style={{gap:8,marginTop:10}}>
            {[{l:'פרטים',c:C.primary,fn:()=>setSelectedUser(u)},
              {l:u.blocked?'בטל חסימה':'חסום',c:u.blocked?C.success:C.warning,fn:()=>toggleBlock(u.id)},
              {l:'מחק',c:C.danger,fn:()=>deleteUser(u.id)}].map(a=>(
              <TouchableOpacity key={a.l} style={{flex:1,backgroundColor:a.c+'15',borderRadius:10,paddingVertical:8,alignItems:'center'}} onPress={a.fn}>
                <Text style={{fontSize:12,fontWeight:'700',color:a.c}}>{a.l}</Text>
              </TouchableOpacity>
            ))}
          </Row>
        </Card>;
      })}
    </ScrollView>
    {DetailOverlay}
  </View>;
}

// ─── ADMIN: QUESTIONS ─────────────────────────────────────────────────────────
function AdminQuestions({gsData,setGsData}) {
  const [tab,setTab]=useState('base');
  const [filterTopic,setFilterTopic]=useState(null);
  const [editingId,setEditingId]=useState(null);
  const EMPTY={topic:'networking',diff:'intermediate',type:'mc',q:'',opts:['','','',''],a:0,exp:''};
  const [form,setForm]=useState(EMPTY);

  function saveQ(){
    if(!form.q.trim()||form.opts.some(o=>!o.trim())){Alert.alert('שגיאה','מלא את כל השדות');return;}
    if(editingId){
      setGsData(gd=>({...gd,customQs:gd.customQs.map(q=>q.id===editingId?{...q,...form}:q)}));
      setEditingId(null);
    } else {
      setGsData(gd=>({...gd,customQs:[...gd.customQs,{...form,id:`cq_${Date.now()}`,custom:true,vs:0.5}]}));
    }
    setForm(EMPTY);setTab('custom');
  }
  function delQ(id){Alert.alert('מחיקה','למחוק שאלה זו?',[{text:'ביטול',style:'cancel'},{text:'מחק',style:'destructive',onPress:()=>setGsData(gd=>({...gd,customQs:gd.customQs.filter(q=>q.id!==id)}))}]);}
  function editQ(q){setForm({topic:q.topic,diff:q.diff,type:q.type||'mc',q:q.q,opts:[...q.opts],a:q.a,exp:q.exp});setEditingId(q.id);setTab('add');}

  const baseFiltered=QS.filter(q=>!filterTopic||q.topic===filterTopic);
  const customFiltered=gsData.customQs.filter(q=>!filterTopic||q.topic===filterTopic);

  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:20}}>
    <Text style={S.pgTitle}>מנהל שאלות ❓</Text>
    <Row style={{gap:8,marginBottom:12}}>
      {[['base',`בסיס (${QS.length})`],['custom',`מותאמות (${gsData.customQs.length})`],['add',editingId?'עריכה':'הוסף']].map(([v,l])=>(
        <TouchableOpacity key={v} style={[S.cntBtn,tab===v&&S.cntBtnOn,{flex:1,paddingHorizontal:4}]} onPress={()=>setTab(v)}>
          <Text style={[{fontSize:11,fontWeight:'700',color:C.text,textAlign:'center'},tab===v&&{color:'#fff'}]}>{l}</Text>
        </TouchableOpacity>
      ))}
    </Row>
    {tab!=='add'&&<ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{flexDirection:'row-reverse',gap:6,marginBottom:10}}>
      <TouchableOpacity style={[S.cntBtn,!filterTopic&&S.cntBtnOn,{paddingHorizontal:14,paddingVertical:7}]} onPress={()=>setFilterTopic(null)}>
        <Text style={[S.cntTxt,!filterTopic&&{color:'#fff'},{fontSize:12}]}>הכל</Text>
      </TouchableOpacity>
      {TOPICS.map(t=>(
        <TouchableOpacity key={t.id} style={[S.cntBtn,filterTopic===t.id&&S.cntBtnOn,{paddingHorizontal:10,paddingVertical:7}]}
          onPress={()=>setFilterTopic(filterTopic===t.id?null:t.id)}>
          <Text style={[S.cntTxt,filterTopic===t.id&&{color:'#fff'},{fontSize:12}]}>{t.icon}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>}

    {tab==='base'&&baseFiltered.map(q=>{const t=topicById(q.topic);return(
      <Card key={q.id} style={{marginBottom:8}}>
        <Row style={{justifyContent:'space-between',marginBottom:6}}>
          <Row style={{flex:0,gap:4}}><Pill label={DIFF_LABEL[q.diff]} color={DIFF_COLOR[q.diff]} small/>
            <Pill label={q.type==='mc'?'MC':q.type==='reading'?'קריאה':'שקילות'} color={C.cyan} small/></Row>
          <Row style={{flex:0,gap:4}}><Text style={{fontSize:12,color:C.muted}}>{t?.name}</Text><Text style={{fontSize:16}}>{t?.icon}</Text></Row>
        </Row>
        <Text style={{textAlign:'right',fontSize:13,fontWeight:'600',marginBottom:4}} numberOfLines={2}>{q.q}</Text>
        <Text style={{textAlign:'right',fontSize:11,color:C.success}}>✓ {q.opts[q.a]}</Text>
      </Card>);})}

    {tab==='custom'&&<>
      {customFiltered.length===0&&<Card style={{alignItems:'center',padding:24}}>
        <Text style={{fontSize:32,marginBottom:8}}>📝</Text>
        <Text style={{color:C.muted}}>אין שאלות מותאמות עדיין</Text>
      </Card>}
      {customFiltered.map(q=>{const t=topicById(q.topic);return(
        <Card key={q.id} style={{marginBottom:8}}>
          <Row style={{justifyContent:'space-between',marginBottom:6}}>
            <Row style={{flex:0,gap:4}}><Pill label={DIFF_LABEL[q.diff]} color={DIFF_COLOR[q.diff]} small/><Pill label="מותאם" color={C.orange} small/></Row>
            <Row style={{flex:0,gap:4}}><Text style={{fontSize:12,color:C.muted}}>{t?.name}</Text><Text style={{fontSize:16}}>{t?.icon}</Text></Row>
          </Row>
          <Text style={{textAlign:'right',fontSize:13,fontWeight:'600',marginBottom:4}} numberOfLines={2}>{q.q}</Text>
          <Text style={{textAlign:'right',fontSize:11,color:C.success,marginBottom:8}}>✓ {q.opts[q.a]}</Text>
          <Row style={{gap:8}}>
            <TouchableOpacity style={{flex:1,backgroundColor:C.primary+'15',borderRadius:8,paddingVertical:7,alignItems:'center'}} onPress={()=>editQ(q)}>
              <Text style={{fontSize:12,fontWeight:'700',color:C.primary}}>עריכה</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1,backgroundColor:C.danger+'15',borderRadius:8,paddingVertical:7,alignItems:'center'}} onPress={()=>delQ(q.id)}>
              <Text style={{fontSize:12,fontWeight:'700',color:C.danger}}>מחק</Text>
            </TouchableOpacity>
          </Row>
        </Card>);})}
    </>}

    {tab==='add'&&<Card>
      <Text style={{textAlign:'right',fontWeight:'700',fontSize:16,marginBottom:14,color:C.primary}}>{editingId?'✏️ עריכת שאלה':'➕ שאלה חדשה'}</Text>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>נושא</Text>
      <View style={{flexDirection:'row-reverse',flexWrap:'wrap',gap:6,marginBottom:12}}>
        {TOPICS.map(t=>(
          <TouchableOpacity key={t.id} onPress={()=>setForm(f=>({...f,topic:t.id}))}
            style={{backgroundColor:form.topic===t.id?t.color:C.fill,borderRadius:8,paddingHorizontal:10,paddingVertical:6,borderWidth:1,borderColor:form.topic===t.id?t.color:C.border}}>
            <Text style={{fontSize:12,fontWeight:'700',color:form.topic===t.id?'#fff':C.text}}>{t.icon} {t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>רמת קושי</Text>
      <Row style={{gap:6,marginBottom:12}}>
        {['beginner','intermediate','advanced','expert'].map(d=>(
          <TouchableOpacity key={d} onPress={()=>setForm(f=>({...f,diff:d}))}
            style={[S.cntBtn,form.diff===d&&{backgroundColor:DIFF_COLOR[d],borderColor:DIFF_COLOR[d]},{flex:1,paddingVertical:8}]}>
            <Text style={{fontSize:11,fontWeight:'700',color:form.diff===d?'#fff':C.text}}>{DIFF_LABEL[d]}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>שאלה</Text>
      <TextInput style={[S.inp,{height:80,textAlignVertical:'top',marginBottom:12}]}
        value={form.q} onChangeText={v=>setForm(f=>({...f,q:v}))}
        placeholder="הכנס את השאלה..." placeholderTextColor={C.muted} textAlign="right" multiline/>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>תשובות (לחץ על האות לסימון כנכונה)</Text>
      {form.opts.map((opt,i)=>{
        const letters=['א','ב','ג','ד'];
        return <View key={i} style={{flexDirection:'row-reverse',alignItems:'center',marginBottom:8,gap:8}}>
          <TouchableOpacity onPress={()=>setForm(f=>({...f,a:i}))}
            style={{width:32,height:32,borderRadius:16,backgroundColor:form.a===i?C.success:C.fill,borderWidth:2,borderColor:form.a===i?C.success:C.border,alignItems:'center',justifyContent:'center'}}>
            <Text style={{fontWeight:'800',color:form.a===i?'#fff':C.muted,fontSize:13}}>{letters[i]}</Text>
          </TouchableOpacity>
          <TextInput style={[S.inp,{flex:1,marginBottom:0,paddingVertical:10}]}
            value={opt} onChangeText={v=>setForm(f=>({...f,opts:f.opts.map((o,j)=>j===i?v:o)}))}
            placeholder={`אפשרות ${letters[i]}...`} placeholderTextColor={C.muted} textAlign="right"/>
        </View>;
      })}
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>הסבר</Text>
      <TextInput style={[S.inp,{height:70,textAlignVertical:'top',marginBottom:16}]}
        value={form.exp} onChangeText={v=>setForm(f=>({...f,exp:v}))}
        placeholder="הסבר לתשובה הנכונה..." placeholderTextColor={C.muted} textAlign="right" multiline/>
      <Row style={{gap:10}}>
        <TouchableOpacity style={[S.outBtn,{flex:1,borderColor:C.border}]} onPress={()=>{setForm(EMPTY);setEditingId(null);setTab('custom');}}>
          <Text style={{color:C.muted,fontWeight:'700'}}>ביטול</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.btn,{flex:2,marginBottom:0}]} onPress={saveQ}>
          <Icon name="save-outline" size={16} color="#fff"/>
          <Text style={[S.btnTxt,{marginRight:8}]}>{editingId?'עדכן':'שמור שאלה'}</Text>
        </TouchableOpacity>
      </Row>
    </Card>}
  </ScrollView>;
}

// ─── ADMIN: ANALYTICS ─────────────────────────────────────────────────────────
function AdminAnalytics({gsData}) {
  const students=gsData.users.filter(u=>u.role==='student');
  const allHistory=students.flatMap(u=>u.prog?.quizHistory||[]);
  const allProgs=students.map(u=>u.prog).filter(Boolean);
  const topicStats=TOPICS.map(t=>{
    const tps=allProgs.flatMap(p=>p.topicProgress?.[t.id]?[p.topicProgress[t.id]]:[]);
    const answered=tps.reduce((s,x)=>s+x.answered,0);
    const correct=tps.reduce((s,x)=>s+x.correct,0);
    const quizzes=allHistory.filter(h=>h.topic===t.id);
    const passedQ=quizzes.filter(h=>h.pass).length;
    const avg=quizzes.length>0?Math.round(quizzes.reduce((s,h)=>s+h.base,0)/quizzes.length):0;
    return {...t,answered,correct,passRate:answered>0?pct(correct,answered):0,quizCount:quizzes.length,quizPassRate:quizzes.length>0?pct(passedQ,quizzes.length):0,avg};
  });
  const scoreRanges=[{label:'0-49%',min:0,max:49,c:C.danger},{label:'50-69%',min:50,max:69,c:C.warning},{label:'70-84%',min:70,max:84,c:C.success},{label:'85-100%',min:85,max:100,c:C.cyan}];
  const scoreDist=scoreRanges.map(r=>({...r,count:allHistory.filter(h=>h.base>=r.min&&h.base<=r.max).length}));
  const maxDist=Math.max(...scoreDist.map(r=>r.count),1);
  const totalAnswered=allProgs.reduce((s,p)=>s+(p.totalAnswered||0),0);
  const totalCorrect=allProgs.reduce((s,p)=>s+(p.totalCorrect||0),0);
  const overallRate=totalAnswered>0?pct(totalCorrect,totalAnswered):0;
  const tiers={
    excellent:students.filter(u=>(u.prog?.totalAnswered||0)>0&&pct(u.prog.totalCorrect,u.prog.totalAnswered)>=85).length,
    good:students.filter(u=>(u.prog?.totalAnswered||0)>0&&pct(u.prog.totalCorrect,u.prog.totalAnswered)>=70&&pct(u.prog.totalCorrect,u.prog.totalAnswered)<85).length,
    needs:students.filter(u=>(u.prog?.totalAnswered||0)>0&&pct(u.prog.totalCorrect,u.prog.totalAnswered)<70).length,
    none:students.filter(u=>!(u.prog?.totalAnswered>0)).length,
  };
  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:20}}>
    <Text style={S.pgTitle}>אנליטיקה 📈</Text>
    <Row style={{gap:8,marginBottom:12}}>
      {[{v:`${overallRate}%`,l:'ציון ממוצע',c:overallRate>=70?C.success:C.warning},
        {v:allHistory.filter(h=>h.pass).length,l:'עברו',c:C.success},
        {v:allHistory.filter(h=>!h.pass).length,l:'נכשלו',c:C.danger},
        {v:allHistory.length,l:'סה"כ בחינות',c:C.primary}]
        .map(s=><Card key={s.l} style={{flex:1,alignItems:'center',padding:10,marginBottom:0}}>
          <Text style={{fontSize:17,fontWeight:'900',color:s.c}}>{s.v}</Text>
          <Text style={{fontSize:10,color:C.muted,textAlign:'center'}}>{s.l}</Text>
        </Card>)}
    </Row>
    <Card>
      <Text style={{textAlign:'right',fontWeight:'700',fontSize:14,marginBottom:12}}>ביצועים לפי נושא</Text>
      {topicStats.map(t=>(
        <View key={t.id} style={{marginBottom:10}}>
          <Row style={{justifyContent:'space-between',marginBottom:4}}>
            <Row style={{flex:0,gap:8}}>
              <Text style={{fontSize:11,color:t.passRate>=70?C.success:C.warning,fontWeight:'700'}}>{t.answered>0?`${t.passRate}%`:'אין'}</Text>
              <Text style={{fontSize:11,color:C.muted}}>{t.answered} תשובות</Text>
            </Row>
            <Row style={{flex:0,gap:4}}><Text style={{fontSize:14}}>{t.icon}</Text><Text style={{fontSize:13,fontWeight:'700'}}>{t.name}</Text></Row>
          </Row>
          <Bar value={t.passRate} total={100} color={t.color} h={8}/>
          {t.quizCount>0&&<Text style={{textAlign:'right',fontSize:10,color:C.muted,marginTop:2}}>{t.quizCount} בחינות • עובר: {t.quizPassRate}% • ממוצע: {t.avg}%</Text>}
        </View>
      ))}
    </Card>
    <Card style={{marginTop:4}}>
      <Text style={{textAlign:'right',fontWeight:'700',fontSize:14,marginBottom:12}}>התפלגות ציונים</Text>
      <Row style={{alignItems:'flex-end',justifyContent:'space-around',height:100}}>
        {scoreDist.map(r=>(
          <View key={r.label} style={{alignItems:'center',flex:1}}>
            <Text style={{fontSize:10,color:r.c,fontWeight:'700',marginBottom:4}}>{r.count}</Text>
            <View style={{width:'55%',backgroundColor:r.c,borderRadius:4,height:Math.max(r.count/maxDist*80,r.count>0?8:2)}}/>
            <Text style={{fontSize:9,color:C.muted,marginTop:4,textAlign:'center'}}>{r.label}</Text>
          </View>
        ))}
      </Row>
    </Card>
    <Card style={{marginTop:4}}>
      <Text style={{textAlign:'right',fontWeight:'700',fontSize:14,marginBottom:10}}>רמות סטודנטים</Text>
      {[{l:'מצטיינים (85%+)',v:tiers.excellent,c:C.success},{l:'טובים (70-84%)',v:tiers.good,c:C.cyan},
        {l:'זקוקים לעזרה (<70%)',v:tiers.needs,c:C.warning},{l:'טרם התחילו',v:tiers.none,c:C.muted}].map(s=>(
        <Row key={s.l} style={{justifyContent:'space-between',marginBottom:8,paddingVertical:4,borderBottomWidth:1,borderBottomColor:C.fill}}>
          <View style={{backgroundColor:s.c+'20',borderRadius:12,paddingHorizontal:10,paddingVertical:3}}>
            <Text style={{fontWeight:'900',color:s.c,fontSize:15}}>{s.v}</Text>
          </View>
          <Text style={{fontSize:13,color:C.text}}>{s.l}</Text>
        </Row>
      ))}
    </Card>
  </ScrollView>;
}

// ─── ADMIN: ANNOUNCEMENTS ─────────────────────────────────────────────────────
function AdminAnnouncements({gsData,setGsData}) {
  const [showForm,setShowForm]=useState(false);
  const [title,setTitle]=useState('');
  const [body,setBody]=useState('');
  const [priority,setPriority]=useState('info');
  const [expiryDays,setExpiryDays]=useState(0);
  const pCfg={info:{c:C.cyan,l:'מידע',i:'information-circle'},warning:{c:C.warning,l:'אזהרה',i:'warning'},urgent:{c:C.danger,l:'דחוף',i:'alert-circle'}};

  function addAnn(){
    if(!title.trim()||!body.trim()){Alert.alert('שגיאה','מלא כותרת ותוכן');return;}
    const ann={id:Date.now().toString(),title:title.trim(),body:body.trim(),priority,createdAt:Date.now(),expiresAt:expiryDays>0?Date.now()+expiryDays*86400000:null};
    setGsData(gd=>({...gd,announcements:[ann,...gd.announcements]}));
    setTitle('');setBody('');setPriority('info');setExpiryDays(0);setShowForm(false);
  }
  function delAnn(id){setGsData(gd=>({...gd,announcements:gd.announcements.filter(a=>a.id!==id)}));}

  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:20}}>
    <Row style={{justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <TouchableOpacity style={[S.btn,{marginBottom:0,paddingHorizontal:16,paddingVertical:10}]} onPress={()=>setShowForm(s=>!s)}>
        <Icon name={showForm?'close':'add'} size={18} color="#fff"/>
        <Text style={[S.btnTxt,{fontSize:14,marginRight:6}]}>{showForm?'ביטול':'הודעה חדשה'}</Text>
      </TouchableOpacity>
      <Text style={S.pgTitle}>הודעות 📣</Text>
    </Row>
    {showForm&&<Card style={{marginBottom:14}}>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>כותרת</Text>
      <TextInput style={[S.inp,{marginBottom:12}]} value={title} onChangeText={setTitle} placeholder="כותרת..." placeholderTextColor={C.muted} textAlign="right"/>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>תוכן</Text>
      <TextInput style={[S.inp,{height:90,textAlignVertical:'top',marginBottom:12}]} value={body} onChangeText={setBody} placeholder="תוכן ההודעה..." placeholderTextColor={C.muted} textAlign="right" multiline/>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>עדיפות</Text>
      <Row style={{gap:8,marginBottom:12}}>
        {Object.entries(pCfg).map(([v,cfg])=>(
          <TouchableOpacity key={v} onPress={()=>setPriority(v)} style={[S.cntBtn,priority===v&&{backgroundColor:cfg.c,borderColor:cfg.c},{flex:1}]}>
            <Text style={{fontSize:12,fontWeight:'700',color:priority===v?'#fff':C.text}}>{cfg.l}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>תפוגה</Text>
      <Row style={{gap:8,marginBottom:14}}>
        {[0,1,3,7,14].map(d=>(
          <TouchableOpacity key={d} style={[S.cntBtn,expiryDays===d&&S.cntBtnOn,{flex:1,paddingVertical:8}]} onPress={()=>setExpiryDays(d)}>
            <Text style={[S.cntTxt,expiryDays===d&&{color:'#fff'},{fontSize:11}]}>{d===0?'ללא':`${d}י׳`}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <TouchableOpacity style={S.btn} onPress={addAnn}>
        <Icon name="send" size={16} color="#fff"/>
        <Text style={[S.btnTxt,{marginRight:8}]}>שלח הודעה</Text>
      </TouchableOpacity>
    </Card>}
    {gsData.announcements.length===0&&<Card style={{alignItems:'center',padding:24}}>
      <Text style={{fontSize:32,marginBottom:8}}>📭</Text>
      <Text style={{color:C.muted}}>אין הודעות</Text>
    </Card>}
    {gsData.announcements.map(a=>{
      const cfg=pCfg[a.priority]||pCfg.info;
      const expired=a.expiresAt&&a.expiresAt<Date.now();
      return <Card key={a.id} style={{marginBottom:10,borderRightWidth:4,borderRightColor:expired?C.muted:cfg.c}}>
        <Row style={{justifyContent:'space-between',marginBottom:6}}>
          <TouchableOpacity onPress={()=>delAnn(a.id)}><Icon name="trash-outline" size={18} color={C.danger}/></TouchableOpacity>
          <Row style={{flex:0,gap:6}}>
            {expired?<Pill label="פג תוקף" color={C.muted} small/>:<Pill label={cfg.l} color={cfg.c} small/>}
            <Text style={{fontWeight:'800',fontSize:15}}>{a.title}</Text>
            <Icon name={cfg.i} size={18} color={expired?C.muted:cfg.c}/>
          </Row>
        </Row>
        <Text style={{textAlign:'right',fontSize:13,color:C.text,lineHeight:20,marginBottom:6}}>{a.body}</Text>
        <Row style={{justifyContent:'space-between'}}>
          <Text style={{fontSize:11,color:C.muted}}>{a.expiresAt?`תפוגה: ${new Date(a.expiresAt).toLocaleDateString('he-IL')}`:'ללא תפוגה'}</Text>
          <Text style={{fontSize:11,color:C.muted}}>{new Date(a.createdAt).toLocaleDateString('he-IL')}</Text>
        </Row>
      </Card>;
    })}
  </ScrollView>;
}

// ─── ADMIN: LEADERBOARD ───────────────────────────────────────────────────────
function AdminLeaderboard({gsData}) {
  const [filterTopic,setFilterTopic]=useState(null);
  const students=gsData.users.filter(u=>u.role==='student');
  const ranked=students.map(u=>{
    const p=u.prog||INIT_PROG;
    let score,answered;
    if(filterTopic){const tp=p.topicProgress?.[filterTopic];score=tp?pct(tp.correct,tp.answered):0;answered=tp?.answered||0;}
    else{score=pct(p.totalCorrect,p.totalAnswered);answered=p.totalAnswered||0;}
    return {...u,score,answered,streak:p.streakDays||0};
  }).filter(u=>u.answered>0).sort((a,b)=>b.score-a.score||b.answered-a.answered);
  const medals=['🥇','🥈','🥉'];
  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:20}}>
    <Text style={S.pgTitle}>לוח מובילים 🏆</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{flexDirection:'row-reverse',gap:6,marginBottom:14}}>
      <TouchableOpacity style={[S.cntBtn,!filterTopic&&S.cntBtnOn,{paddingHorizontal:14}]} onPress={()=>setFilterTopic(null)}>
        <Text style={[S.cntTxt,!filterTopic&&{color:'#fff'},{fontSize:12}]}>כולם</Text>
      </TouchableOpacity>
      {TOPICS.map(t=>(
        <TouchableOpacity key={t.id} style={[S.cntBtn,filterTopic===t.id&&S.cntBtnOn,{paddingHorizontal:10}]}
          onPress={()=>setFilterTopic(filterTopic===t.id?null:t.id)}>
          <Text style={[S.cntTxt,filterTopic===t.id&&{color:'#fff'},{fontSize:12}]}>{t.icon} {t.name.slice(0,5)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    {ranked.length===0&&<Card style={{alignItems:'center',padding:24}}>
      <Text style={{fontSize:32,marginBottom:8}}>🏜️</Text>
      <Text style={{color:C.muted}}>אין נתונים עדיין</Text>
    </Card>}
    {ranked.map((u,i)=>(
      <Card key={u.id} style={{marginBottom:8,borderRightWidth:i<3?4:0,borderRightColor:i===0?'#f59e0b':i===1?'#94a3b8':'#b45309'}}>
        <Row style={{justifyContent:'space-between',marginBottom:6}}>
          <Row style={{flex:0,gap:8}}>
            <Pill label={`${u.score}%`} color={u.score>=70?C.success:C.warning}/>
            <Text style={{fontSize:12,color:C.muted}}>{u.answered} שאלות</Text>
            {u.streak>0&&<Text style={{fontSize:12,color:C.warning}}>🔥{u.streak}</Text>}
          </Row>
          <Row style={{flex:0,gap:8}}>
            <Col style={{alignItems:'flex-end'}}>
              <Text style={{fontWeight:'800',fontSize:15}}>{u.name}</Text>
              <Text style={{fontSize:11,color:C.muted}}>@{u.username}</Text>
            </Col>
            <Text style={{fontSize:22}}>{medals[i]||`${i+1}.`}</Text>
          </Row>
        </Row>
        <Bar value={u.score} total={100} color={u.score>=70?C.success:C.warning} h={4}/>
      </Card>
    ))}
  </ScrollView>;
}

// ─── ADMIN: SETTINGS ──────────────────────────────────────────────────────────
function AdminSettings({gsData,setGsData,onLogout,adminUser}) {
  const [passGrade,setPassGrade]=useState(String(gsData.settings.passGrade));
  const [regEnabled,setRegEnabled]=useState(gsData.settings.regEnabled);
  const [oldPwd,setOldPwd]=useState('');
  const [newPwd,setNewPwd]=useState('');
  const [confPwd,setConfPwd]=useState('');

  function saveSettings(){
    const pg=parseInt(passGrade);
    if(pg<50||pg>95){Alert.alert('שגיאה','ציון עובר חייב להיות 50–95');return;}
    setGsData(gd=>({...gd,settings:{...gd.settings,passGrade:pg,regEnabled}}));
    Alert.alert('✓','הגדרות נשמרו');
  }
  function changePwd(){
    const adminU=gsData.users.find(u=>u.id===adminUser.id);
    if(adminU.password!==oldPwd){Alert.alert('שגיאה','סיסמה נוכחית שגויה');return;}
    if(newPwd.length<4){Alert.alert('שגיאה','סיסמה חדשה קצרה מדי');return;}
    if(newPwd!==confPwd){Alert.alert('שגיאה','הסיסמאות אינן תואמות');return;}
    setGsData(gd=>({...gd,users:gd.users.map(u=>u.id===adminUser.id?{...u,password:newPwd}:u)}));
    setOldPwd('');setNewPwd('');setConfPwd('');
    Alert.alert('✓','סיסמה שונתה');
  }
  function resetAllStudents(){
    Alert.alert('איפוס כולל','למחוק את כל ההתקדמות של כל הסטודנטים?',[{text:'ביטול',style:'cancel'},{text:'איפוס הכל',style:'destructive',onPress:()=>{setGsData(gd=>({...gd,users:gd.users.map(u=>u.role==='student'?{...u,prog:INIT_PROG}:u)}));Alert.alert('✓','ההתקדמות אופסה');}}]);
  }
  function delAllCustomQs(){
    Alert.alert('מחיקה','למחוק את כל השאלות המותאמות?',[{text:'ביטול',style:'cancel'},{text:'מחק',style:'destructive',onPress:()=>{setGsData(gd=>({...gd,customQs:[]}));Alert.alert('✓','השאלות נמחקו');}}]);
  }
  function exportReport(){
    const students=gsData.users.filter(u=>u.role==='student');
    const summary=students.length===0?'אין סטודנטים עדיין':students.map(u=>`${u.name} (@${u.username}): ${pct(u.prog?.totalCorrect||0,u.prog?.totalAnswered||1)}% (${u.prog?.totalAnswered||0} שאלות)${u.blocked?' [חסום]':''}`).join('\n');
    Alert.alert(`דוח ביצועים (${students.length} סטודנטים)`,summary);
  }

  return <ScrollView style={S.scr} contentContainerStyle={{paddingBottom:40}}>
    <Text style={S.pgTitle}>הגדרות מנהל ⚙️</Text>
    <Card style={{backgroundColor:C.primary,marginBottom:14}}>
      <Row style={{justifyContent:'space-between',alignItems:'center'}}>
        <TouchableOpacity style={{backgroundColor:'rgba(255,255,255,0.2)',borderRadius:10,paddingHorizontal:14,paddingVertical:8}} onPress={()=>Alert.alert('התנתקות','להתנתק?',[{text:'ביטול',style:'cancel'},{text:'התנתק',onPress:onLogout}])}>
          <Text style={{color:'#fff',fontWeight:'700',fontSize:13}}>התנתק</Text>
        </TouchableOpacity>
        <Col style={{alignItems:'flex-end'}}>
          <Text style={{color:'#fff',fontSize:18,fontWeight:'900'}}>👑 מנהל מערכת</Text>
          <Text style={{color:'#bfdbfe',fontSize:13}}>@{adminUser.username}</Text>
        </Col>
      </Row>
    </Card>
    <Sec title="הגדרות בחינה"/>
    <Card>
      <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:6}}>ציון עובר (%)</Text>
      <Row style={{gap:8,marginBottom:14}}>
        {['60','65','70','75','80'].map(v=>(
          <TouchableOpacity key={v} style={[S.cntBtn,passGrade===v&&S.cntBtnOn,{flex:1}]} onPress={()=>setPassGrade(v)}>
            <Text style={[S.cntTxt,passGrade===v&&{color:'#fff'}]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </Row>
      <Row style={{justifyContent:'space-between',marginBottom:14}}>
        <Switch value={regEnabled} onValueChange={setRegEnabled} trackColor={{false:C.border,true:C.success}} thumbColor="#fff"/>
        <Col style={{alignItems:'flex-end'}}>
          <Text style={{fontWeight:'700',fontSize:14}}>הרשמת משתמשים</Text>
          <Text style={{fontSize:12,color:C.muted}}>{regEnabled?'פתוחה':'סגורה'}</Text>
        </Col>
      </Row>
      <TouchableOpacity style={S.btn} onPress={saveSettings}>
        <Icon name="save-outline" size={16} color="#fff"/>
        <Text style={[S.btnTxt,{marginRight:8}]}>שמור הגדרות</Text>
      </TouchableOpacity>
    </Card>
    <Sec title="שינוי סיסמת מנהל"/>
    <Card>
      {[[oldPwd,setOldPwd,'סיסמה נוכחית'],[newPwd,setNewPwd,'סיסמה חדשה'],[confPwd,setConfPwd,'אישור סיסמה']].map(([val,setter,label])=>(
        <View key={label} style={{marginBottom:10}}>
          <Text style={{textAlign:'right',fontSize:13,color:C.muted,marginBottom:4}}>{label}</Text>
          <TextInput style={S.inp} value={val} onChangeText={setter} placeholder="••••••" placeholderTextColor={C.muted} textAlign="right" secureTextEntry autoCapitalize="none"/>
        </View>
      ))}
      <TouchableOpacity style={[S.outBtn,{marginTop:4}]} onPress={changePwd}>
        <Icon name="key-outline" size={16} color={C.primary}/>
        <Text style={{color:C.primary,fontWeight:'700',marginRight:6}}>שנה סיסמה</Text>
      </TouchableOpacity>
    </Card>
    <Sec title="ניהול נתונים"/>
    <Card>
      {[{l:`יצוא דוח (${gsData.users.filter(u=>u.role==='student').length} סטודנטים)`,i:'download-outline',c:C.cyan,fn:exportReport},
        {l:`מחק שאלות מותאמות (${gsData.customQs.length})`,i:'trash-outline',c:C.warning,fn:delAllCustomQs},
        {l:'איפוס כל הסטודנטים',i:'nuclear-outline',c:C.danger,fn:resetAllStudents}].map(a=>(
        <TouchableOpacity key={a.l} style={[S.outBtn,{marginBottom:10,borderColor:a.c+'60'}]} onPress={a.fn}>
          <Icon name={a.i} size={16} color={a.c}/>
          <Text style={{color:a.c,fontWeight:'700',marginRight:6}}>{a.l}</Text>
        </TouchableOpacity>
      ))}
    </Card>
    <Card style={{alignItems:'center',marginTop:8}}>
      <Text style={{fontSize:32,marginBottom:4}}>🌐</Text>
      <Text style={{fontWeight:'800',color:C.primary,fontSize:16}}>AmirNet Plus</Text>
      <Text style={{color:C.muted,fontSize:12,marginTop:2}}>v2.0 Admin Edition</Text>
      <Text style={{color:C.muted,fontSize:11,marginTop:2}}>{gsData.users.filter(u=>u.role==='student').length} סטודנטים • {QS.length+gsData.customQs.length} שאלות</Text>
    </Card>
  </ScrollView>;
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({gsData,setGsData,currentUser,onLogout}) {
  const [adminTab,setAdminTab]=useState('dashboard');
  const adminTabs=[
    {id:'dashboard',label:'בית',icon:'grid-outline',active:'grid'},
    {id:'users',label:'משתמשים',icon:'people-outline',active:'people'},
    {id:'questions',label:'שאלות',icon:'help-circle-outline',active:'help-circle'},
    {id:'analytics',label:'אנליטיקה',icon:'bar-chart-outline',active:'bar-chart'},
    {id:'announcements',label:'הודעות',icon:'megaphone-outline',active:'megaphone'},
    {id:'leaderboard',label:'מובילים',icon:'trophy-outline',active:'trophy'},
    {id:'settings',label:'הגדרות',icon:'settings-outline',active:'settings'},
  ];
  return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
    <StatusBar barStyle="dark-content"/>
    <View style={{backgroundColor:C.primary,paddingHorizontal:16,paddingVertical:5}}>
      <Row style={{justifyContent:'space-between'}}>
        <Text style={{color:'#bfdbfe',fontSize:11}}>v2.0</Text>
        <Row style={{flex:0,gap:5}}>
          <Icon name="shield-checkmark" size={13} color="#fde68a"/>
          <Text style={{color:'#fde68a',fontSize:12,fontWeight:'700'}}>מצב מנהל</Text>
        </Row>
      </Row>
    </View>
    <View style={{flex:1}}>
      {adminTab==='dashboard'&&<AdminDashboard gsData={gsData} setGsData={setGsData} onNav={setAdminTab}/>}
      {adminTab==='users'&&<AdminUsers gsData={gsData} setGsData={setGsData}/>}
      {adminTab==='questions'&&<AdminQuestions gsData={gsData} setGsData={setGsData}/>}
      {adminTab==='analytics'&&<AdminAnalytics gsData={gsData}/>}
      {adminTab==='announcements'&&<AdminAnnouncements gsData={gsData} setGsData={setGsData}/>}
      {adminTab==='leaderboard'&&<AdminLeaderboard gsData={gsData}/>}
      {adminTab==='settings'&&<AdminSettings gsData={gsData} setGsData={setGsData} onLogout={onLogout} adminUser={currentUser}/>}
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      style={{backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.border}}
      contentContainerStyle={{flexDirection:'row-reverse',paddingBottom:Platform.OS==='ios'?20:6,paddingTop:6}}>
      {adminTabs.map(t=>{
        const on=adminTab===t.id;
        return <TouchableOpacity key={t.id} onPress={()=>setAdminTab(t.id)}
          style={{alignItems:'center',paddingHorizontal:12,paddingTop:4,minWidth:60}}>
          {on&&<View style={{position:'absolute',top:0,left:'15%',right:'15%',height:2.5,backgroundColor:C.primary,borderBottomLeftRadius:2,borderBottomRightRadius:2}}/>}
          <Icon name={on?t.active:t.icon} size={22} color={on?C.primary:C.muted}/>
          <Text style={{fontSize:10,color:on?C.primary:C.muted,fontWeight:on?'700':'400',marginTop:2}}>{t.label}</Text>
        </TouchableOpacity>;
      })}
    </ScrollView>
  </SafeAreaView>;
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser,setCurrentUser]=useState(null);
  const [loaded,setLoaded]=useState(false);
  const [gsData,setGsData]=useState({
    users:[{id:'admin',username:'admin',password:'admin123',role:'admin',name:'מנהל',blocked:false,createdAt:Date.now()}],
    announcements:[],customQs:[],settings:{passGrade:70,regEnabled:true},
  });
  const [prog,dispatch]=useReducer(reducer,INIT_PROG);
  const [tab,setTab]=useState('home');
  const [quiz,setQuiz]=useState(null);
  const go=useCallback(a=>dispatch(a),[]);

  useEffect(()=>{
    Store.get('amirnet_v4').then(raw=>{
      if(raw){try{
        const saved=JSON.parse(raw);
        if(saved.gsData)setGsData(saved.gsData);
        if(saved.currentUserId&&saved.gsData){
          const user=saved.gsData.users?.find(u=>u.id===saved.currentUserId);
          if(user&&!user.blocked){setCurrentUser(user);if(user.prog)dispatch({type:'LOAD',payload:user.prog});}
        }
      }catch(_){}}
      setLoaded(true);
    });
  },[]);

  useEffect(()=>{
    if(!loaded)return;
    const updatedGs=currentUser?{...gsData,users:gsData.users.map(u=>u.id===currentUser.id?{...u,prog}:u)}:gsData;
    Store.set('amirnet_v4',JSON.stringify({gsData:updatedGs,currentUserId:currentUser?.id}));
  },[gsData,prog,currentUser,loaded]);

  function handleLogin(username,password){
    const user=gsData.users.find(u=>u.username===username&&u.password===password);
    if(!user){Alert.alert('שגיאה','שם משתמש או סיסמה שגויים');return;}
    if(user.blocked){Alert.alert('חסום','החשבון שלך חסום. צור קשר עם המנהל.');return;}
    setCurrentUser(user);
    if(user.prog)dispatch({type:'LOAD',payload:user.prog});else dispatch({type:'RESET'});
  }
  function handleRegister(name,username,password){
    if(!gsData.settings.regEnabled){Alert.alert('סגור','ההרשמה אינה פעילה כרגע');return;}
    if(!name||!username||!password){Alert.alert('שגיאה','מלא את כל השדות');return;}
    if(password.length<4){Alert.alert('שגיאה','סיסמה קצרה מדי (מינימום 4 תווים)');return;}
    if(gsData.users.find(u=>u.username===username)){Alert.alert('שגיאה','שם משתמש כבר קיים');return;}
    const newUser={id:Date.now().toString(),username,password,name,role:'student',blocked:false,createdAt:Date.now(),prog:INIT_PROG,onboarded:false};
    setGsData(gd=>({...gd,users:[...gd.users,newUser]}));
    setCurrentUser(newUser);dispatch({type:'RESET'});
  }
  function handleLogout(){
    if(currentUser)setGsData(gd=>({...gd,users:gd.users.map(u=>u.id===currentUser.id?{...u,prog}:u)}));
    setCurrentUser(null);dispatch({type:'RESET'});setTab('home');setQuiz(null);
  }

  if(!loaded)return <SafeAreaView style={S.center}><Text style={{fontSize:48,marginBottom:8}}>🌐</Text><Text style={{fontSize:20,fontWeight:'800',color:C.primary}}>AmirNet Plus</Text></SafeAreaView>;
  if(!currentUser)return <AuthScreen gsData={gsData} onLogin={handleLogin} onRegister={handleRegister}/>;
  if(currentUser.role==='admin')return <AdminPanel gsData={gsData} setGsData={setGsData} currentUser={currentUser} onLogout={handleLogout}/>;
  if(!prog.onboarded)return <OnboardingScreen onDone={p=>{dispatch({type:'SETTINGS',payload:{...p,onboarded:true}});setCurrentUser(u=>({...u,onboarded:true}));setGsData(gd=>({...gd,users:gd.users.map(u=>u.id===currentUser.id?{...u,onboarded:true}:u)}));}}/>;
  if(quiz)return <QuizScreen config={quiz} dispatch={go} onFinish={()=>setQuiz(null)}/>;
  const activeAnn=gsData.announcements.filter(a=>!a.expiresAt||a.expiresAt>Date.now());
  return <SafeAreaView style={{flex:1,backgroundColor:C.bg}}>
    <StatusBar barStyle="dark-content"/>
    {tab==='home'&&<HomeScreen prog={prog} onQuiz={setQuiz} announcements={activeAnn} currentUser={currentUser} onLogout={handleLogout}/>}
    {tab==='topics'&&<TopicsScreen prog={prog} onQuiz={setQuiz}/>}
    {tab==='quiz'&&<QuizSetupScreen onStart={setQuiz}/>}
    {tab==='progress'&&<ProgressScreen prog={prog} dispatch={go} currentUser={currentUser} onLogout={handleLogout}/>}
    <TabBar tab={tab} setTab={setTab}/>
  </SafeAreaView>;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  scr:{flex:1,backgroundColor:C.bg,paddingHorizontal:16,paddingTop:12},
  center:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:C.bg},
  pgTitle:{fontSize:26,fontWeight:'900',textAlign:'right',color:C.text,marginBottom:14},
  sec:{fontSize:14,fontWeight:'800',textAlign:'right',color:C.text,marginTop:10,marginBottom:8},
  card:{backgroundColor:C.card,borderRadius:16,padding:14,marginBottom:10,shadowColor:'#000',shadowOpacity:0.06,shadowRadius:8,shadowOffset:{width:0,height:2},elevation:3},
  opt:{borderRadius:14,borderWidth:1.5,padding:14,marginBottom:10},
  optLetter:{width:30,height:30,borderRadius:15,alignItems:'center',justifyContent:'center'},
  btn:{flexDirection:'row-reverse',backgroundColor:C.primary,borderRadius:14,paddingVertical:15,alignItems:'center',justifyContent:'center',marginBottom:4},
  btnTxt:{color:'#fff',fontSize:16,fontWeight:'800'},
  outBtn:{flexDirection:'row-reverse',borderWidth:1.5,borderColor:C.primary+'60',borderRadius:14,paddingVertical:14,alignItems:'center',justifyContent:'center'},
  cntBtn:{flex:1,backgroundColor:C.fill,borderRadius:10,paddingVertical:11,alignItems:'center',borderWidth:1,borderColor:C.border},
  cntBtnOn:{backgroundColor:C.primary,borderColor:C.primary},
  cntTxt:{fontSize:14,fontWeight:'700',color:C.text},
  modeBtn:{flex:1,backgroundColor:C.card,borderRadius:14,padding:15,alignItems:'center',borderWidth:1.5,borderColor:C.border},
  modeBtnOn:{borderColor:C.primary,backgroundColor:C.primary+'0a'},
  topicOpt:{backgroundColor:C.card,borderRadius:12,paddingHorizontal:14,paddingVertical:12,marginBottom:8,borderWidth:1.5,borderColor:C.border},
  topicOptOn:{borderColor:C.primary,backgroundColor:C.primary+'08'},
  inp:{backgroundColor:C.fill,borderRadius:10,padding:12,fontSize:15,borderWidth:1,borderColor:C.border,color:C.text},
  onbInput:{backgroundColor:'rgba(255,255,255,0.15)',borderRadius:12,padding:14,fontSize:16,borderWidth:1.5,borderColor:'rgba(255,255,255,0.4)',color:'#fff'},
  timerBox:{flexDirection:'row-reverse',alignItems:'center',paddingHorizontal:10,paddingVertical:5,borderRadius:20,borderWidth:1,gap:4},
  qBar:{flexDirection:'row-reverse',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16,paddingVertical:10},
  qBottom:{position:'absolute',bottom:0,left:0,right:0,padding:16,backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.border},
  tabBar:{flexDirection:'row-reverse',backgroundColor:C.card,borderTopWidth:1,borderTopColor:C.border,paddingBottom:Platform.OS==='ios'?20:6,paddingTop:6},
  tabItem:{flex:1,alignItems:'center',paddingTop:4,position:'relative'},
  tabInd:{position:'absolute',top:0,left:'20%',right:'20%',height:2.5,backgroundColor:C.primary,borderBottomLeftRadius:2,borderBottomRightRadius:2},
});
