import React, { useState, useEffect, useReducer, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Dimensions, Platform, Alert, Switch,
  TextInput, I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W } = Dimensions.get('window');

// ─── TOPICS ────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: 'networking',       name: 'רשתות תקשורת',     icon: '🌐', color: '#2563eb', desc: 'מודל OSI, TCP/IP, ניתוב רשתות ו-Subnetting' },
  { id: 'security',         name: 'אבטחת מידע',        icon: '🔒', color: '#dc2626', desc: 'חומות אש, הצפנה, VPN ואיומי סייבר' },
  { id: 'operatingSystems', name: 'מערכות הפעלה',      icon: '💻', color: '#16a34a', desc: 'Windows Server, Linux וניהול שרתים' },
  { id: 'cloud',            name: 'ענן ווירטואליזציה', icon: '☁️', color: '#0891b2', desc: 'AWS, Azure, VMware ווירטואליזציה' },
  { id: 'itManagement',     name: 'ניהול IT',           icon: '👥', color: '#ea580c', desc: 'ITIL, ניהול שינויים ותהליכי IT' },
  { id: 'protocols',        name: 'פרוטוקולים',         icon: '🔄', color: '#7c3aed', desc: 'HTTP, DNS, DHCP, FTP ופרוטוקולים נוספים' },
];

const topicById = id => TOPICS.find(t => t.id === id);

// ─── QUESTIONS DATA ─────────────────────────────────────────────────────────
const QS = [
  // NETWORKING
  { id:'n1', q:'כמה שכבות יש במודל OSI?', opts:['5','6','7','8'], a:2, exp:'מודל OSI מורכב מ-7 שכבות: פיזית, קישור נתונים, רשת, תחבורה, סשן, מצגת ויישום.', topic:'networking', diff:'easy' },
  { id:'n2', q:'באיזו שכבת OSI פועל פרוטוקול IP?', opts:['שכבה 2 - קישור נתונים','שכבה 3 - רשת','שכבה 4 - תחבורה','שכבה 5 - סשן'], a:1, exp:'פרוטוקול IP פועל בשכבה 3 (שכבת הרשת) ואחראי על הניתוב בין רשתות.', topic:'networking', diff:'easy' },
  { id:'n3', q:'מה הוא ה-Subnet Mask לרשת Class C?', opts:['255.0.0.0','255.255.0.0','255.255.255.0','255.255.255.255'], a:2, exp:'רשת Class C משתמשת ב-255.255.255.0 (/24), המאפשרת עד 254 מארחים.', topic:'networking', diff:'easy' },
  { id:'n4', q:'מה ההבדל בין Router ל-Switch?', opts:['Router פועל בשכבה 2, Switch בשכבה 3','Router מנתב בין רשתות (שכבה 3), Switch מחבר בתוך רשת (שכבה 2)','אין הבדל, שניהם זהים','Switch מהיר יותר תמיד'], a:1, exp:'Router פועל בשכבה 3 ומנתב תנועה בין רשתות שונות. Switch פועל בשכבה 2 ומחבר מכשירים בתוך אותה רשת מקומית.', topic:'networking', diff:'medium' },
  { id:'n5', q:'מה המשמעות של CIDR /24?', opts:['24 מארחים ברשת','24 סיביות לחלק הרשת, 8 סיביות למארח','Subnet Mask של 255.255.0.0','24 נתבים ברשת'], a:1, exp:'/24 מציין 24 סיביות לרשת ו-8 למארח. Subnet Mask: 255.255.255.0. מספר מארחים: 254.', topic:'networking', diff:'medium' },
  { id:'n6', q:'מהו טווח כתובות IP פרטיות לפי Class A?', opts:['172.16.0.0–172.31.255.255','192.168.0.0–192.168.255.255','10.0.0.0–10.255.255.255','169.254.0.0–169.254.255.255'], a:2, exp:'כתובות Class A פרטיות: 10.0.0.0–10.255.255.255. כתובות 172.16-31 הן Class B, ו-192.168.x.x הן Class C.', topic:'networking', diff:'medium' },
  { id:'n7', q:'מה תפקיד פרוטוקול ARP?', opts:['הקצאת כתובות IP דינמית','תרגום שמות דומיין לכתובות IP','תרגום כתובת IP לכתובת MAC','הצפנת תנועת רשת'], a:2, exp:'ARP ממפה כתובת IP לכתובת MAC (פיזית) ברשת מקומית.', topic:'networking', diff:'medium' },
  { id:'n8', q:'מה הפורט הסטנדרטי של HTTPS?', opts:['80','443','8080','8443'], a:1, exp:'HTTPS פועל על פורט 443. HTTP הרגיל פועל על פורט 80.', topic:'networking', diff:'easy' },
  { id:'n9', q:'מה ההבדל בין Half-Duplex ל-Full-Duplex?', opts:['Half-Duplex מהיר יותר','Full-Duplex מאפשר שליחה וקבלה בו-זמנית; Half-Duplex רק כיוון אחד בכל פעם','Half-Duplex תומך ב-Wireless בלבד','Full-Duplex זול יותר'], a:1, exp:'Full-Duplex מאפשר תקשורת דו-כיוונית בו-זמנית. Half-Duplex מאפשר תקשורת רק בכיוון אחד בכל פעם.', topic:'networking', diff:'easy' },
  { id:'n10', q:'רשת עם כתובת 192.168.1.0/26 – כמה מארחים ניתן לחבר?', opts:['30','62','126','254'], a:1, exp:'/26 = 6 סיביות למארח. 2^6=64 כתובות, פחות כתובת רשת וברודקאסט = 62 מארחים.', topic:'networking', diff:'hard' },
  // SECURITY
  { id:'s1', q:'מה ההבדל בין Symmetric ל-Asymmetric Encryption?', opts:['Symmetric מהיר יותר ומשתמש במפתח אחד; Asymmetric משתמש בזוג מפתחות','Asymmetric מהיר יותר ומאובטח פחות','Symmetric משתמש בשני מפתחות','אין הבדל מעשי ביניהם'], a:0, exp:'הצפנה סימטרית - מפתח אחד (AES). הצפנה אסימטרית - זוג מפתחות ציבורי/פרטי (RSA).', topic:'security', diff:'medium' },
  { id:'s2', q:'מה הוא מתקפת Man-in-the-Middle?', opts:['מתקפה על שרת DNS','תוקף מיירט תקשורת בין שני צדדים מבלי שידעו','הצפת שרת בבקשות','פרצה בחומת האש'], a:1, exp:'במתקפת MITM, התוקף מיירט את התקשורת בין שני צדדים, יכול לקרוא ואף לשנות את המידע.', topic:'security', diff:'easy' },
  { id:'s3', q:'מהי מתקפת DoS ומה ההבדל ממתקפת DDoS?', opts:['DoS ממחשב אחד; DDoS ממחשבים רבים (Botnet)','DDoS מסוכן פחות מ-DoS','שניהם זהים לחלוטין','DoS מכוון לנתונים, DDoS לרשת בלבד'], a:0, exp:'DoS ממחשב אחד. DDoS מאלפי מחשבים בו-זמנית (Botnet), קשה יותר לעצירה.', topic:'security', diff:'easy' },
  { id:'s4', q:'מה הוא Firewall מסוג Stateful?', opts:['חומת אש שבוחנת רק כותרות מנות','חומת אש שעוקבת אחר מצב חיבורים ובוחנת הקשר','חומת אש שמסנן לפי MAC Address','חומת אש ללא תצורה'], a:1, exp:'Stateful Firewall עוקב אחר מצב כל חיבור רשת ומאפשר החלטות מבוססות הקשר.', topic:'security', diff:'medium' },
  { id:'s5', q:'מה ההבדל בין IDS ל-IPS?', opts:['IDS מזהה ומגיב אוטומטית; IPS רק מזהה','IDS רק מזהה ומתריע; IPS גם חוסם תנועה חשודה','שניהם זהים','IPS פועל רק ב-Cloud'], a:1, exp:'IDS מזהה ומתריע. IPS גם חוסם באופן אקטיבי.', topic:'security', diff:'medium' },
  { id:'s6', q:'מהו SSL/TLS ומה תפקידו?', opts:['פרוטוקול ניתוב','פרוטוקול הצפנה לאבטחת תקשורת ברשת','מנגנון זיהוי משתמשים','שירות DNS מאובטח'], a:1, exp:'SSL/TLS מאבטחים תקשורת ברשת (HTTPS). TLS הוא הגרסה המאובטחת יותר.', topic:'security', diff:'easy' },
  { id:'s7', q:'מה הוא Phishing?', opts:['תוכנה זדונית שמצפינה קבצים','ניסיון הונאה לגנוב פרטי משתמש דרך הודעות מזויפות','מתקפת Brute Force על סיסמאות','ניצול חולשה בפרוטוקול TCP'], a:1, exp:'Phishing - הנדסה חברתית לגניבת פרטים רגישים דרך הודעות מזויפות.', topic:'security', diff:'easy' },
  { id:'s8', q:'מה הוא VPN ואיך הוא מאבטח תקשורת?', opts:['רשת וירטואלית פרטית המצפינה תנועה ויוצרת מנהרה מאובטחת','סוג של חומת אש','פרוטוקול ניתוב ברשת ציבורית','שירות אנטי-וירוס'], a:0, exp:'VPN יוצר מנהרה מוצפנת ברשת ציבורית ומאפשר גישה מאובטחת למשאבים פרטיים.', topic:'security', diff:'easy' },
  // OS
  { id:'o1', q:'מה הוא Active Directory?', opts:['תוכנת אנטי-וירוס של Microsoft','שירות ספריה של Microsoft לניהול משתמשים, קבוצות ומשאבים ברשת','פרוטוקול ניתוב','מנגנון גיבוי נתונים'], a:1, exp:'Active Directory (AD) מאפשר ניהול מרכזי של משתמשים, קבוצות, מחשבים ומדיניות אבטחה.', topic:'operatingSystems', diff:'easy' },
  { id:'o2', q:'מה ההבדל בין Domain Controller ל-Member Server?', opts:['Domain Controller מנהל את Active Directory; Member Server הוא שרת חבר בדומיין','Member Server חזק יותר','Domain Controller פועל רק עם Linux','אין הבדל'], a:0, exp:'Domain Controller מריץ AD DS ומנהל זיהוי. Member Server הצטרף לדומיין אך אינו מריץ AD DS.', topic:'operatingSystems', diff:'medium' },
  { id:'o3', q:'מה הוא NTFS ומה יתרונותיו על FAT32?', opts:['NTFS מהיר יותר אך לא תומך בקבצים גדולים','NTFS תומך בהרשאות קבצים, הצפנה, דחיסה וקבצים גדולים מ-4GB','FAT32 מתקדם יותר','שניהם זהים'], a:1, exp:'NTFS תומך בקבצים מעל 4GB, הרשאות אבטחה, הצפנה (EFS), דחיסה ורישום יומן.', topic:'operatingSystems', diff:'medium' },
  { id:'o4', q:'מהי הפקודה לבדיקת IP ב-Windows?', opts:['ipconfig','ifconfig','netstat','ping'], a:0, exp:'בWindows משתמשים ב-ipconfig. בLinux/macOS משתמשים ב-ifconfig או ip addr.', topic:'operatingSystems', diff:'easy' },
  { id:'o5', q:'מה הוא Group Policy (GPO)?', opts:['מדיניות קבוצתית ב-Active Directory לניהול הגדרות מחשבים ומשתמשים','תוכנת גיבוי','פרוטוקול אבטחה','שירות DHCP'], a:0, exp:'GPO מאפשר ניהול מרכזי של הגדרות עבור מחשבים ומשתמשים בדומיין.', topic:'operatingSystems', diff:'medium' },
  { id:'o6', q:'מה הפקודה ב-Linux להצגת כל הקבצים כולל מוסתרים?', opts:['ls -a','ls -l','dir /a','show all'], a:0, exp:'ls -a מציגה את כל הקבצים כולל מוסתרים (המתחילים בנקודה).', topic:'operatingSystems', diff:'easy' },
  { id:'o7', q:'מה הוא RAID 5?', opts:['גיבוי לדיסק חיצוני','Striping עם Parity המפוזר על פני 3+ דיסקים, מאפשר סבילות לכשל דיסק אחד','שיקוף בין 2 דיסקים','אין הגנה על נתונים'], a:1, exp:'RAID 5 - Striping עם Parity על 3+ דיסקים. יכול לסבול כשל של דיסק אחד.', topic:'operatingSystems', diff:'medium' },
  { id:'o8', q:'מה הוא Hyper-V?', opts:['אנטי-וירוס של Microsoft','פלטפורמת וירטואליזציה של Microsoft המובנית ב-Windows Server','שירות ענן של Microsoft','פרוטוקול גיבוי'], a:1, exp:'Hyper-V היא טכנולוגיית וירטואליזציה של Microsoft המובנית ב-Windows Server.', topic:'operatingSystems', diff:'easy' },
  // CLOUD
  { id:'c1', q:'מה ההבדל בין IaaS, PaaS ו-SaaS?', opts:['כולם זהים, שמות שונים בלבד','IaaS-תשתית; PaaS-פלטפורמה לפיתוח; SaaS-תוכנה כשירות מוכנה','SaaS מאובטח יותר מ-IaaS','PaaS מיועד רק לחברות גדולות'], a:1, exp:'IaaS=תשתית (EC2), PaaS=פלטפורמה (App Service), SaaS=תוכנה מוכנה (Office 365).', topic:'cloud', diff:'medium' },
  { id:'c2', q:'מה הוא S3 ב-AWS?', opts:['שירות מחשוב (compute)','שירות אחסון אובייקטים (Object Storage)','שירות רשת','מסד נתונים'], a:1, exp:'Amazon S3 - אחסון אובייקטים בענן עם זמינות גבוהה.', topic:'cloud', diff:'easy' },
  { id:'c3', q:'מה הוא VPC ב-AWS?', opts:['שירות מסד נתונים','רשת וירטואלית פרטית בענן AWS עם שליטה מלאה בהגדרות הרשת','שירות Backup','שירות ניהול DNS'], a:1, exp:'VPC מאפשר יצירת רשת וירטואלית מבודדת ב-AWS עם שליטה מלאה.', topic:'cloud', diff:'medium' },
  { id:'c4', q:'מה ההבדל בין Public Cloud ל-Private Cloud?', opts:['Public Cloud מאובטח יותר','Public Cloud תשתית משותפת דרך האינטרנט; Private Cloud תשתית ייעודית לארגון','Private Cloud תמיד זול יותר','אין הבדל מעשי'], a:1, exp:'Public Cloud (AWS/Azure) משותף. Private Cloud ייעודי לארגון אחד, אבטחה גבוהה יותר.', topic:'cloud', diff:'easy' },
  { id:'c5', q:'מה הוא Docker?', opts:['מערכת הפעלה','פלטפורמת Containerization להרצת אפליקציות בסביבות מבודדות','שפת תכנות','כלי גיבוי'], a:1, exp:'Docker מאפשר אריזת אפליקציה עם יחסי תלות ב-Container להרצה אחידה בכל סביבה.', topic:'cloud', diff:'medium' },
  { id:'c6', q:'מה ההבדל בין Virtualization ל-Containerization?', opts:['Containerization כבד יותר ודורש יותר משאבים','Virtualization מריץ OS מלא לכל VM; Containerization חולק OS Kernel ויעיל יותר','אין הבדל','Virtualization מהיר יותר תמיד'], a:1, exp:'VM מריץ OS מלא (כבד). Container חולק Kernel ומריץ רק האפליקציה (קל ומהיר).', topic:'cloud', diff:'medium' },
  { id:'c7', q:'מה הוא Auto Scaling בענן?', opts:['הגדלה ידנית של שרתים','מנגנון אוטומטי להוספה/הסרה של משאבים בהתאם לעומס','שירות גיבוי אוטומטי','עדכון אוטומטי של תוכנה'], a:1, exp:'Auto Scaling מוסיף/מסיר משאבי מחשוב אוטומטית לפי עומס - ביצועים טובים ועלות מינימלית.', topic:'cloud', diff:'easy' },
  // IT MANAGEMENT
  { id:'i1', q:'מה הוא ITIL?', opts:['שפת תכנות לניהול IT','מסגרת עבודה של Best Practices לניהול שירותי IT','פרוטוקול רשת','מוצר תוכנה של Microsoft'], a:1, exp:'ITIL (Information Technology Infrastructure Library) - מסגרת Best Practices לניהול שירותי IT.', topic:'itManagement', diff:'easy' },
  { id:'i2', q:'מה ההבדל בין Incident ל-Problem ב-ITIL?', opts:['הם אותו הדבר','Incident הוא שיבוש בשירות; Problem הוא הגורם השורשי לאירועים חוזרים','Problem קל יותר לפתרון','Incident מטופל לאחר Problem'], a:1, exp:'Incident = שיבוש לא מתוכנן. Problem = חקירת הגורם השורשי (Root Cause).', topic:'itManagement', diff:'medium' },
  { id:'i3', q:'מה הוא SLA (Service Level Agreement)?', opts:['חוזה עם ספק חומרה','הסכם המגדיר את רמת השירות המוסכמת בין ספק לקוח, כולל זמינות וזמן תגובה','תוכנת ניהול','תקן אבטחת מידע'], a:1, exp:'SLA - הסכם רשמי המגדיר ציפיות לגבי זמינות שירות, זמן תגובה לתקלות ועוד.', topic:'itManagement', diff:'easy' },
  { id:'i4', q:'מה הוא Change Management ב-ITIL?', opts:['ניהול שינויים ארגוניים','תהליך לניהול מבוקר של שינויים בסביבת IT למניעת שיבושים','עדכוני תוכנה אוטומטיים','ניהול גרסאות קוד'], a:1, exp:'Change Management - תהליך ITIL לניהול שינויים: RFC, הערכת סיכונים, אישור, ביצוע ותיעוד.', topic:'itManagement', diff:'medium' },
  { id:'i5', q:'מה הוא RTO ו-RPO בניהול המשכיות עסקית?', opts:['RTO-זמן שיקום מקסימלי; RPO-נקודת שיקום נתונים מקסימלית (כמה נתונים ניתן לאבד)','שניהם מודדים זמן שיקום בלבד','RPO מדד ביצועים בלבד','RTO רלוונטי רק לענן'], a:0, exp:'RTO = זמן שיקום מקסימלי. RPO = כמות נתונים מקסימלית שניתן לאבד.', topic:'itManagement', diff:'hard' },
  { id:'i6', q:'מה הוא Help Desk ומה ההבדל ממרכז שירות (Service Desk)?', opts:['שניהם זהים','Help Desk מתמקד בפתרון תקניות; Service Desk רחב יותר ומנהל גם בקשות שירות','Service Desk מיועד ללקוחות חיצוניים בלבד','Help Desk יקר יותר'], a:1, exp:'Help Desk = תמיכה טכנית. Service Desk (ITIL) = נקודת קשר רחבה יותר, כולל בקשות שירות.', topic:'itManagement', diff:'medium' },
  // PROTOCOLS
  { id:'p1', q:'מה הפורט הסטנדרטי של DNS?', opts:['53','80','443','25'], a:0, exp:'DNS פועל על פורט 53 (UDP לשאילתות, TCP להעברות אזור).', topic:'protocols', diff:'easy' },
  { id:'p2', q:'מה תפקיד פרוטוקול DHCP?', opts:['תרגום שמות דומיין','הקצאה אוטומטית של כתובות IP ופרמטרי רשת למכשירים','הצפנת תקשורת','ניהול ניתוב'], a:1, exp:'DHCP מקצה אוטומטית IP, Subnet Mask, Default Gateway ו-DNS Server.', topic:'protocols', diff:'easy' },
  { id:'p3', q:'מה ההבדל בין TCP ל-UDP?', opts:['TCP מהיר יותר; UDP אמין יותר','TCP מבוסס חיבור ואמין; UDP ללא חיבור ומהיר יותר אך פחות אמין','שניהם זהים','UDP תומך בהצפנה; TCP לא'], a:1, exp:'TCP - מסירה מסודרת עם Handshake. UDP - מהיר יותר בלי ערבות מסירה (סטרימינג, DNS, VoIP).', topic:'protocols', diff:'easy' },
  { id:'p4', q:'מה תפקיד פרוטוקול SMTP?', opts:['קבלת מיילים','שליחת מיילים בין שרתי דואר','גלישה באינטרנט','העברת קבצים'], a:1, exp:'SMTP שולח ומעביר מיילים בין שרתים. פועל על פורט 25 (או 587). IMAP/POP3 לקבלה.', topic:'protocols', diff:'easy' },
  { id:'p5', q:'מה הוא HTTP ומה ה-Method הנפוץ ביותר?', opts:['פרוטוקול הצפנה, Method: ENCRYPT','פרוטוקול תקשורת לאינטרנט, Method: GET','פרוטוקול ניתוב, Method: ROUTE','פרוטוקול DNS, Method: QUERY'], a:1, exp:'HTTP הוא הפרוטוקול הבסיסי של האינטרנט. GET לבקשת נתונים. Methods: POST, PUT, DELETE.', topic:'protocols', diff:'easy' },
  { id:'p6', q:'מה הוא פרוטוקול FTP ועל איזה פורט הוא פועל?', opts:['File Transfer Protocol, פורט 21','File Transfer Protocol, פורט 22','Fast Transfer Protocol, פורט 80','File Transfer Protocol, פורט 443'], a:0, exp:'FTP להעברת קבצים, פורט 21 (control) ו-20 (data). SFTP על פורט 22 מאובטח יותר.', topic:'protocols', diff:'easy' },
  { id:'p7', q:'מהו Three-Way Handshake ב-TCP?', opts:['תהליך סגירת חיבור','תהליך יצירת חיבור: SYN → SYN-ACK → ACK','תהליך שליחת נתונים','תהליך בדיקת שגיאות'], a:1, exp:'Three-Way Handshake: 1) Client שולח SYN, 2) Server עונה SYN-ACK, 3) Client שולח ACK.', topic:'protocols', diff:'medium' },
  { id:'p8', q:'מה ההבדל בין IMAP ל-POP3?', opts:['IMAP מסנכרן מיילים ושומר בשרת; POP3 מוריד ומוחק מהשרת','POP3 מודרני יותר','IMAP רק לשליחת מיילים','שניהם זהים'], a:0, exp:'IMAP מסנכרן ומשאיר עותק בשרת (גישה ממספר מכשירים). POP3 מוריד ומוחק מהשרת.', topic:'protocols', diff:'medium' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestions(topic, count) {
  const pool = topic ? QS.filter(q => q.topic === topic) : QS;
  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

function countByTopic(topicId) {
  return QS.filter(q => q.topic === topicId).length;
}

// ─── STORAGE ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'amirnetplus_progress_v1';

const defaultProgress = {
  totalAnswered: 0,
  totalCorrect: 0,
  topicProgress: {},  // { topicId: { answered, correct } }
  streakDays: 0,
  lastStudyDate: null,
  quizHistory: [],    // [{ date, score, total, topic, secs }]
  bookmarkedIds: [],
  dailyGoal: 20,
  userName: '',
};

function progressReducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...defaultProgress, ...action.payload };
    case 'RECORD_QUIZ': {
      const { questions, answers, startTime } = action.payload;
      let correct = 0;
      const tp = { ...state.topicProgress };
      questions.forEach((q, i) => {
        const isCorrect = answers[i] === q.a;
        if (isCorrect) correct++;
        const prev = tp[q.topic] || { answered: 0, correct: 0 };
        tp[q.topic] = { answered: prev.answered + 1, correct: prev.correct + (isCorrect ? 1 : 0) };
      });
      const secs = (Date.now() - startTime) / 1000;
      const entry = { date: Date.now(), score: correct, total: questions.length, topic: questions[0]?.topic || null, secs };
      const history = [entry, ...state.quizHistory].slice(0, 100);
      // Streak
      const today = new Date().toDateString();
      let streak = state.streakDays;
      if (state.lastStudyDate) {
        const last = new Date(state.lastStudyDate).toDateString();
        const diff = Math.floor((new Date(today) - new Date(last)) / 86400000);
        if (diff === 1) streak += 1;
        else if (diff > 1) streak = 1;
      } else { streak = 1; }
      return {
        ...state,
        totalAnswered: state.totalAnswered + questions.length,
        totalCorrect: state.totalCorrect + correct,
        topicProgress: tp,
        quizHistory: history,
        streakDays: streak,
        lastStudyDate: Date.now(),
      };
    }
    case 'TOGGLE_BOOKMARK': {
      const id = action.payload;
      const ids = state.bookmarkedIds.includes(id)
        ? state.bookmarkedIds.filter(x => x !== id)
        : [...state.bookmarkedIds, id];
      return { ...state, bookmarkedIds: ids };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, ...action.payload };
    case 'RESET':
      return { ...defaultProgress, dailyGoal: state.dailyGoal, userName: state.userName };
    default: return state;
  }
}

// ─── COLORS & THEME ─────────────────────────────────────────────────────────
const C = {
  bg: '#f2f2f7',
  card: '#ffffff',
  blue: '#2563eb',
  green: '#16a34a',
  red: '#dc2626',
  orange: '#ea580c',
  purple: '#7c3aed',
  cyan: '#0891b2',
  text: '#111827',
  secondary: '#6b7280',
  border: '#e5e7eb',
  fill: '#f3f4f6',
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Badge({ label, color }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function ProgressBar({ value, total, color = C.blue, height = 6 }) {
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  return (
    <View style={[styles.progressTrack, { height }]}>
      <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color, height }]} />
    </View>
  );
}

function TabBar({ tab, setTab }) {
  const tabs = [
    { id: 'home', label: 'בית', icon: '🏠' },
    { id: 'topics', label: 'נושאים', icon: '📚' },
    { id: 'quiz', label: 'בחינה', icon: '✏️' },
    { id: 'progress', label: 'התקדמות', icon: '📊' },
  ];
  return (
    <View style={styles.tabBar}>
      {tabs.map(t => (
        <TouchableOpacity key={t.id} style={styles.tabItem} onPress={() => setTab(t.id)}>
          <Text style={styles.tabIcon}>{t.icon}</Text>
          <Text style={[styles.tabLabel, tab === t.id && { color: C.blue, fontWeight: '700' }]}>
            {t.label}
          </Text>
          {tab === t.id && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── SCREENS ────────────────────────────────────────────────────────────────

function HomeScreen({ progress, dispatch, onStartQuiz }) {
  const tp = progress.topicProgress || {};
  const pct = progress.totalAnswered > 0 ? Math.round(progress.totalCorrect / progress.totalAnswered * 100) : 0;
  const coveredTopics = TOPICS.filter(t => (tp[t.id]?.answered || 0) > 0).length;

  // Today's answered (simple approximation from last quiz)
  const todayAnswered = (() => {
    const today = new Date().toDateString();
    return (progress.quizHistory || []).filter(h => new Date(h.date).toDateString() === today)
      .reduce((s, h) => s + h.total, 0);
  })();
  const goal = progress.dailyGoal || 20;
  const goalDone = todayAnswered >= goal;

  const weakTopics = TOPICS.filter(t => {
    const p = tp[t.id];
    if (!p || p.answered < 3) return false;
    return (p.correct / p.answered * 100) < 70;
  }).sort((a, b) => {
    const pa = tp[a.id], pb = tp[b.id];
    return (pa.correct / pa.answered) - (pb.correct / pb.answered);
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.homeHeader}>
        <Text style={styles.homeTitle}>
          {progress.userName ? `שלום, ${progress.userName} 👋` : 'AmirNet Plus 🌐'}
        </Text>
        <Text style={styles.homeSubtitle}>הכנה לבחינת אמירנט</Text>
      </View>

      {/* Daily Goal */}
      <Card style={goalDone ? styles.goalCardDone : {}}>
        <View style={styles.row}>
          <View style={styles.row}>
            <Text style={[styles.goalNum, { color: goalDone ? C.green : C.blue }]}>{todayAnswered}/{goal}</Text>
            <Text style={styles.secondaryText}> שאלות היום</Text>
          </View>
          <Text style={[styles.caption, { color: goalDone ? C.green : C.text, fontWeight: '700' }]}>
            {goalDone ? 'יעד יומי הושג! 🎯' : 'יעד יומי'}
          </Text>
        </View>
        <ProgressBar value={todayAnswered} total={goal} color={goalDone ? C.green : C.blue} height={8} />
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { v: progress.totalAnswered, l: 'שאלות', c: C.blue, i: '❓' },
          { v: pct > 0 ? `${pct}%` : '-', l: 'הצלחה', c: pct >= 70 ? C.green : C.orange, i: '✅' },
          { v: coveredTopics, l: 'נושאים', c: C.purple, i: '📖' },
          { v: progress.bookmarkedIds?.length || 0, l: 'שמורות', c: C.orange, i: '🔖' },
        ].map((s, i) => (
          <Card key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.i}</Text>
            <Text style={[styles.statValue, { color: s.c }]}>{s.v}</Text>
            <Text style={styles.caption}>{s.l}</Text>
          </Card>
        ))}
      </View>

      {/* Streak */}
      <Card style={styles.streakCard}>
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.streakText}>{progress.streakDays || 0} ימי רצף</Text>
          <Text style={styles.caption}>
            {(progress.streakDays || 0) > 0 ? 'כל הכבוד! המשך לשמור על הרצף' : 'התחל לימוד היום!'}
          </Text>
        </View>
      </Card>

      {/* Weak Topics */}
      {weakTopics.length > 0 && (
        <Card style={styles.weakCard}>
          <View style={[styles.row, { marginBottom: 8 }]}>
            <View />
            <Text style={styles.sectionTitle}>⚠️ נושאים לחיזוק</Text>
          </View>
          {weakTopics.slice(0, 2).map(t => {
            const p = tp[t.id];
            const pct2 = Math.round(p.correct / p.answered * 100);
            return (
              <View key={t.id} style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={[styles.caption, { color: C.orange, fontWeight: '700' }]}>{pct2}%</Text>
                  <Text style={[styles.caption, { fontWeight: '600' }]}>{t.icon} {t.name}</Text>
                </View>
                <ProgressBar value={pct2} total={100} color={C.orange} height={5} />
              </View>
            );
          })}
        </Card>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>פעולות מהירות</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.blue + '15' }]} onPress={() => onStartQuiz({ count: 10, topic: null, mode: 'exam' })}>
          <Text style={styles.actionIcon}>▶️</Text>
          <Text style={[styles.actionTitle, { color: C.blue }]}>בחינה מהירה</Text>
          <Text style={styles.caption}>10 שאלות</Text>
        </TouchableOpacity>
        {weakTopics.length > 0 && (
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: C.orange + '15' }]} onPress={() => onStartQuiz({ count: 10, topic: weakTopics[0].id, mode: 'study' })}>
            <Text style={styles.actionIcon}>💪</Text>
            <Text style={[styles.actionTitle, { color: C.orange }]}>חזק חולשות</Text>
            <Text style={styles.caption}>{weakTopics[0].name}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Topics Overview */}
      <Text style={styles.sectionTitle}>סקירת נושאים</Text>
      {TOPICS.map(t => {
        const p = tp[t.id];
        const pct2 = p && p.answered > 0 ? Math.round(p.correct / p.answered * 100) : 0;
        return (
          <Card key={t.id} style={{ marginBottom: 8 }}>
            <View style={styles.row}>
              <Text style={[styles.caption, { color: C.secondary }]}>{p?.answered || 0} שאלות</Text>
              <View style={styles.row}>
                <Text style={styles.bodyText}>{t.name}</Text>
                <Text style={{ fontSize: 18, marginRight: 6 }}>{t.icon}</Text>
              </View>
            </View>
            <ProgressBar value={pct2} total={100} color={t.color} height={5} />
          </Card>
        );
      })}
    </ScrollView>
  );
}

function TopicsScreen({ progress, onStartQuiz }) {
  const tp = progress.topicProgress || {};
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.pageTitle}>נושאים</Text>
      {TOPICS.map(t => {
        const p = tp[t.id];
        const pct = p && p.answered > 0 ? Math.round(p.correct / p.answered * 100) : 0;
        const total = countByTopic(t.id);
        const easy = QS.filter(q => q.topic === t.id && q.diff === 'easy').length;
        const med = QS.filter(q => q.topic === t.id && q.diff === 'medium').length;
        const hard = QS.filter(q => q.topic === t.id && q.diff === 'hard').length;
        return (
          <TouchableOpacity key={t.id} onPress={() => onStartQuiz({ count: total, topic: t.id, mode: 'exam' })}>
            <Card style={{ marginBottom: 12 }}>
              <View style={styles.row}>
                <View>
                  <Text style={[styles.caption, { color: C.secondary }]}>{p?.answered || 0}/{total} שאלות</Text>
                  {pct > 0 && (
                    <Text style={[styles.caption, { color: pct >= 70 ? C.green : C.orange, fontWeight: '700' }]}>{pct}% הצלחה</Text>
                  )}
                </View>
                <View style={styles.row}>
                  <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
                    <Text style={styles.topicName}>{t.name}</Text>
                    <Text style={[styles.caption, { textAlign: 'right', maxWidth: W * 0.55 }]}>{t.desc}</Text>
                  </View>
                  <View style={[styles.iconCircle, { backgroundColor: t.color + '22' }]}>
                    <Text style={{ fontSize: 22 }}>{t.icon}</Text>
                  </View>
                </View>
              </View>
              <ProgressBar value={pct} total={100} color={t.color} height={6} />
              <View style={[styles.row, { marginTop: 8 }]}>
                <View style={styles.row}>
                  {[['קל', C.green, easy], ['בינוני', C.orange, med], ['קשה', C.red, hard]].map(([l, c, n]) => (
                    <View key={l} style={[styles.diffBadge, { backgroundColor: c + '22' }]}>
                      <Text style={[styles.diffText, { color: c }]}>{n} {l}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.secondaryText}>התחל ←</Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function QuizSetupScreen({ onStart }) {
  const [count, setCount] = useState(10);
  const [topic, setTopic] = useState(null);
  const [mode, setMode] = useState('exam');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>הגדרות בחינה</Text>

      {/* Header Card */}
      <Card style={styles.setupHeaderCard}>
        <View style={styles.row}>
          <Text style={{ fontSize: 48 }}>✅</Text>
          <View style={{ flex: 1, alignItems: 'flex-end', marginRight: 12 }}>
            <Text style={styles.setupHeaderTitle}>בחינת אמירנט</Text>
            <Text style={[styles.caption, { textAlign: 'right' }]}>הגדר את הבחינה שלך והתחל להתכונן</Text>
          </View>
        </View>
      </Card>

      {/* Question Count */}
      <Text style={styles.sectionTitle}>מספר שאלות</Text>
      <View style={styles.countRow}>
        {[10, 20, 30, 50].map(n => (
          <TouchableOpacity key={n} style={[styles.countBtn, count === n && styles.countBtnActive]} onPress={() => setCount(n)}>
            <Text style={[styles.countBtnText, count === n && { color: '#fff' }]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Topic */}
      <Text style={styles.sectionTitle}>נושא</Text>
      <TouchableOpacity style={[styles.topicOption, topic === null && styles.topicOptionActive]} onPress={() => setTopic(null)}>
        <View style={styles.row}>
          {topic === null && <Text style={{ color: C.blue, marginLeft: 8 }}>✓</Text>}
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
            <Text style={styles.bodyText}>כל הנושאים</Text>
            <Text style={styles.caption}>שאלות מעורבות מכל הנושאים</Text>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: C.blue + '22' }]}>
            <Text>🔲</Text>
          </View>
        </View>
      </TouchableOpacity>
      {TOPICS.map(t => (
        <TouchableOpacity key={t.id} style={[styles.topicOption, topic === t.id && styles.topicOptionActive]} onPress={() => setTopic(t.id)}>
          <View style={styles.row}>
            {topic === t.id && <Text style={{ color: C.blue, marginLeft: 8 }}>✓</Text>}
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
              <Text style={styles.bodyText}>{t.name}</Text>
              <Text style={styles.caption}>{countByTopic(t.id)} שאלות</Text>
            </View>
            <View style={[styles.iconCircle, { backgroundColor: t.color + '22' }]}>
              <Text style={{ fontSize: 20 }}>{t.icon}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Mode */}
      <Text style={styles.sectionTitle}>מצב בחינה</Text>
      <View style={styles.modeRow}>
        {[
          { v: 'exam', icon: '⏱', title: 'מצב בחינה', desc: 'ראה תוצאות בסוף' },
          { v: 'study', icon: '💡', title: 'מצב לימוד', desc: 'ראה תשובה אחרי כל שאלה' },
        ].map(m => (
          <TouchableOpacity key={m.v} style={[styles.modeBtn, mode === m.v && styles.modeBtnActive]} onPress={() => setMode(m.v)}>
            <Text style={{ fontSize: 28 }}>{m.icon}</Text>
            <Text style={[styles.bodyText, mode === m.v && { color: C.blue }]}>{m.title}</Text>
            <Text style={[styles.caption, { textAlign: 'center' }]}>{m.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Start */}
      <TouchableOpacity style={styles.startBtn} onPress={() => onStart({ count, topic, mode })}>
        <Text style={styles.startBtnText}>▶ התחל בחינה</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function QuizScreen({ config, progress, dispatch, onFinish }) {
  const [questions] = useState(() => getQuestions(config.topic, config.count));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp] = useState(false);
  const [startTime] = useState(Date.now());
  const [done, setDone] = useState(false);

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.pageTitle}>אין שאלות זמינות</Text>
        <TouchableOpacity style={styles.startBtn} onPress={onFinish}>
          <Text style={styles.startBtnText}>חזור</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (done) {
    const score = questions.filter((q, i) => answers[i] === q.a).length;
    return (
      <QuizResultsScreen
        questions={questions}
        answers={answers}
        score={score}
        secs={(Date.now() - startTime) / 1000}
        onDismiss={onFinish}
        onRetry={() => {
          dispatch({ type: 'RECORD_QUIZ', payload: { questions, answers, startTime } });
          onFinish();
        }}
        dispatch={dispatch}
        startTime={startTime}
      />
    );
  }

  const q = questions[index];

  function selectOption(i) {
    if (selected !== null) return;
    setSelected(i);
    setAnswers(prev => ({ ...prev, [index]: i }));
    if (config.mode === 'study') setShowExp(true);
  }

  function next() {
    if (index === questions.length - 1) {
      const finalAnswers = { ...answers, [index]: selected };
      dispatch({ type: 'RECORD_QUIZ', payload: { questions, answers: finalAnswers, startTime } });
      setAnswers(finalAnswers);
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
      setShowExp(false);
    }
  }

  const optLetters = ['א', 'ב', 'ג', 'ד'];
  const diffColors = { easy: C.green, medium: C.orange, hard: C.red };
  const diffNames = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
  const topic = topicById(q.topic);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top Bar */}
      <View style={styles.quizTopBar}>
        <TouchableOpacity onPress={onFinish}>
          <Text style={[styles.bodyText, { color: C.red }]}>יציאה</Text>
        </TouchableOpacity>
        <Text style={styles.bodyText}>{index + 1} / {questions.length}</Text>
      </View>
      {/* Progress */}
      <View style={styles.quizProgress}>
        <View style={[styles.quizProgressFill, { width: `${(index / questions.length) * 100}%` }]} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Question Card */}
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.row}>
            <Badge label={diffNames[q.diff]} color={diffColors[q.diff]} />
            <Text style={styles.caption}>{topic?.name}</Text>
          </View>
          <Text style={styles.questionText}>{q.q}</Text>
        </Card>
        {/* Options */}
        {q.opts.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = q.a === i;
          const showColor = selected !== null;
          let bg = C.card, border = C.border;
          if (showColor && isCorrect) { bg = C.green + '22'; border = C.green; }
          else if (showColor && isSelected && !isCorrect) { bg = C.red + '22'; border = C.red; }
          return (
            <TouchableOpacity key={i} onPress={() => selectOption(i)} disabled={selected !== null}
              style={[styles.optionBtn, { backgroundColor: bg, borderColor: border }]}>
              <View style={styles.row}>
                {showColor && isCorrect && <Text style={{ color: C.green, marginLeft: 8 }}>✓</Text>}
                {showColor && isSelected && !isCorrect && <Text style={{ color: C.red, marginLeft: 8 }}>✗</Text>}
                <View style={{ flex: 1 }} />
                <Text style={[styles.bodyText, { flex: 1, textAlign: 'right', marginLeft: 8 }]}>{opt}</Text>
                <View style={[styles.optLetter, { backgroundColor: isSelected ? (isCorrect ? C.green : C.red) : C.fill }]}>
                  <Text style={[styles.caption, { color: isSelected ? '#fff' : C.secondary }]}>{optLetters[i]}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {/* Explanation */}
        {config.mode === 'study' && showExp && (
          <Card style={styles.expCard}>
            <Text style={[styles.caption, { color: C.orange, fontWeight: '700', textAlign: 'right', marginBottom: 4 }]}>💡 הסבר</Text>
            <Text style={[styles.bodyText, { textAlign: 'right' }]}>{q.exp}</Text>
          </Card>
        )}
      </ScrollView>
      {/* Bottom Next Button */}
      {selected !== null && (
        <View style={styles.quizBottom}>
          <TouchableOpacity style={styles.nextBtn} onPress={next}>
            <Text style={styles.nextBtnText}>
              {index === questions.length - 1 ? 'סיים ←' : 'הבא ←'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function QuizResultsScreen({ questions, answers, score, secs, onDismiss, onRetry, dispatch, startTime }) {
  const [showDetail, setShowDetail] = useState(false);
  const total = questions.length;
  const pct = Math.round(score / total * 100);

  const grade = pct >= 90 ? 'מצוין! 🌟' : pct >= 75 ? 'טוב מאוד 👍' : pct >= 60 ? 'טוב' : pct >= 50 ? 'עובר' : 'נסה שוב 🔄';
  const gradeColor = pct >= 80 ? C.green : pct >= 60 ? C.orange : C.red;

  const mins = Math.floor(secs / 60);
  const secsR = Math.floor(secs % 60);
  const timeStr = `${mins}:${secsR.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.resultsTopBar}>
        <TouchableOpacity onPress={onDismiss}>
          <Text style={[styles.bodyText, { color: C.blue }]}>סגור</Text>
        </TouchableOpacity>
        <Text style={styles.bodyText}>תוצאות הבחינה</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Score Circle */}
        <View style={styles.scoreCircle}>
          <View style={[styles.scoreRing, { borderColor: gradeColor }]}>
            <Text style={[styles.scorePct, { color: gradeColor }]}>{pct}%</Text>
            <Text style={[styles.caption, { color: gradeColor }]}>{grade}</Text>
          </View>
          <Text style={styles.scoreCaption}>{score} מתוך {total} תשובות נכונות</Text>
        </View>
        {/* Stats Row */}
        <Card style={styles.statsRow2}>
          {[
            { v: score, l: 'נכון ✅', c: C.green },
            { v: total - score, l: 'שגוי ❌', c: C.red },
            { v: timeStr, l: 'זמן ⏱', c: C.blue },
          ].map((s, i) => (
            <View key={i} style={[styles.statItem, i < 2 && styles.statItemBorder]}>
              <Text style={[styles.statValue, { color: s.c }]}>{s.v}</Text>
              <Text style={styles.caption}>{s.l}</Text>
            </View>
          ))}
        </Card>
        {/* Toggle Detail */}
        <Card>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <Switch value={showDetail} onValueChange={setShowDetail} trackColor={{ true: C.blue }} />
            <Text style={styles.bodyText}>הצג פירוט תשובות</Text>
          </View>
        </Card>
        {/* Answers Detail */}
        {showDetail && questions.map((q, i) => {
          const sel = answers[i];
          const correct = sel === q.a;
          const [expanded, setExpanded] = useState(false);
          return (
            <Card key={q.id} style={{ marginTop: 8 }}>
              <TouchableOpacity onPress={() => setExpanded(e => !e)}>
                <View style={styles.row}>
                  <Text style={styles.caption}>{expanded ? '▲' : '▼'}</Text>
                  <View style={styles.row}>
                    <Text style={[styles.caption, { color: correct ? C.green : C.red, marginLeft: 8 }]}>{correct ? '✓' : '✗'}</Text>
                    <View style={[styles.numCircle, { backgroundColor: C.fill }]}>
                      <Text style={styles.caption}>{i + 1}</Text>
                    </View>
                  </View>
                  <Text style={[styles.caption, { flex: 1, textAlign: 'right', marginHorizontal: 8 }]} numberOfLines={expanded ? undefined : 2}>{q.q}</Text>
                </View>
              </TouchableOpacity>
              {expanded && (
                <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 }}>
                  {sel !== undefined && sel !== q.a && (
                    <Text style={[styles.caption, { color: C.red, textAlign: 'right', marginBottom: 4 }]}>תשובתך: {q.opts[sel]}</Text>
                  )}
                  <Text style={[styles.caption, { color: C.green, textAlign: 'right', marginBottom: 4, fontWeight: '700' }]}>תשובה נכונה: {q.opts[q.a]}</Text>
                  <Text style={[styles.caption, { color: C.secondary, textAlign: 'right' }]}>{q.exp}</Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
      {/* Action Buttons */}
      <View style={styles.resultsButtons}>
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryBtnText}>🔄 נסה שוב</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={onDismiss}>
          <Text style={styles.doneBtnText}>✓ סיום</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProgressScreen({ progress, dispatch }) {
  const [showReset, setShowReset] = useState(false);
  const [userName, setUserName] = useState(progress.userName || '');
  const [dailyGoal, setDailyGoal] = useState(String(progress.dailyGoal || 20));
  const tp = progress.topicProgress || {};
  const history = (progress.quizHistory || []).slice(0, 10);

  function saveSettings() {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { userName: userName.trim(), dailyGoal: parseInt(dailyGoal) || 20 } });
    Alert.alert('נשמר!', 'ההגדרות עודכנו בהצלחה');
  }

  function confirmReset() {
    Alert.alert('איפוס התקדמות', 'האם אתה בטוח? כל ההתקדמות תימחק.', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'איפוס', style: 'destructive', onPress: () => dispatch({ type: 'RESET' }) },
    ]);
  }

  const achievements = [
    { id: 'first_10', label: 'ענק! 10 שאלות', icon: '🥉', unlocked: progress.totalAnswered >= 10 },
    { id: 'fifty', label: '50 שאלות', icon: '🥈', unlocked: progress.totalAnswered >= 50 },
    { id: 'century', label: '100 שאלות', icon: '🥇', unlocked: progress.totalAnswered >= 100 },
    { id: 'scorer', label: 'ציון גבוה 80%+', icon: '🏆', unlocked: progress.totalAnswered >= 20 && progress.totalCorrect / Math.max(1, progress.totalAnswered) >= 0.8 },
    { id: 'streak3', label: 'רצף 3 ימים', icon: '🔥', unlocked: progress.streakDays >= 3 },
    { id: 'streak7', label: 'רצף שבוע!', icon: '⚡', unlocked: progress.streakDays >= 7 },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>התקדמות</Text>

      {/* Overview */}
      <Card style={{ marginBottom: 16 }}>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>סיכום כללי</Text>
        {[
          { l: 'שאלות שנענו', v: progress.totalAnswered || 0 },
          { l: 'תשובות נכונות', v: progress.totalCorrect || 0 },
          { l: 'אחוז הצלחה', v: progress.totalAnswered ? `${Math.round(progress.totalCorrect / progress.totalAnswered * 100)}%` : '-' },
          { l: 'ימי רצף', v: `${progress.streakDays || 0} 🔥` },
        ].map(({ l, v }) => (
          <View key={l} style={[styles.row, { marginBottom: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: C.border }]}>
            <Text style={[styles.bodyText, { color: C.blue, fontWeight: '700' }]}>{v}</Text>
            <Text style={styles.bodyText}>{l}</Text>
          </View>
        ))}
      </Card>

      {/* Topic Breakdown */}
      <Text style={styles.sectionTitle}>פירוט לפי נושא</Text>
      {TOPICS.map(t => {
        const p = tp[t.id];
        const pct = p && p.answered > 0 ? Math.round(p.correct / p.answered * 100) : 0;
        return (
          <Card key={t.id} style={{ marginBottom: 8 }}>
            <View style={styles.row}>
              <Text style={[styles.caption, { color: pct >= 70 ? C.green : pct > 0 ? C.orange : C.secondary }]}>
                {p?.answered ? `${pct}%` : 'לא התחיל'}
              </Text>
              <Text style={styles.bodyText}>{t.icon} {t.name}</Text>
            </View>
            <ProgressBar value={pct} total={100} color={t.color} height={5} />
            {p && <Text style={[styles.caption, { textAlign: 'right', marginTop: 4 }]}>{p.correct}/{p.answered} נכון</Text>}
          </Card>
        );
      })}

      {/* Achievements */}
      <Text style={styles.sectionTitle}>הישגים</Text>
      <View style={styles.achievementsGrid}>
        {achievements.map(a => (
          <View key={a.id} style={[styles.achievement, !a.unlocked && { opacity: 0.35 }]}>
            <Text style={{ fontSize: 30 }}>{a.icon}</Text>
            <Text style={styles.caption}>{a.label}</Text>
          </View>
        ))}
      </View>

      {/* Quiz History */}
      {history.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>היסטוריית בחינות</Text>
          {history.map((h, i) => {
            const pct = Math.round(h.score / h.total * 100);
            const d = new Date(h.date);
            const topic = h.topic ? topicById(h.topic) : null;
            return (
              <Card key={i} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <View style={styles.row}>
                    <Text style={[styles.caption, { color: C.secondary, marginRight: 8 }]}>{d.toLocaleDateString('he-IL')}</Text>
                    <Badge label={`${pct}%`} color={pct >= 70 ? C.green : C.orange} />
                  </View>
                  <Text style={styles.bodyText}>{topic ? `${topic.icon} ${topic.name}` : 'כל הנושאים'}</Text>
                </View>
                <Text style={[styles.caption, { textAlign: 'right', color: C.secondary }]}>{h.score}/{h.total} נכון</Text>
              </Card>
            );
          })}
        </>
      )}

      {/* Settings */}
      <Text style={styles.sectionTitle}>הגדרות</Text>
      <Card>
        <Text style={[styles.bodyText, { textAlign: 'right', marginBottom: 6 }]}>שם משתמש</Text>
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholder="הכנס שם..."
          textAlign="right"
        />
        <Text style={[styles.bodyText, { textAlign: 'right', marginTop: 12, marginBottom: 6 }]}>יעד יומי (שאלות)</Text>
        <TextInput
          style={styles.input}
          value={dailyGoal}
          onChangeText={setDailyGoal}
          keyboardType="number-pad"
          placeholder="20"
          textAlign="right"
        />
        <TouchableOpacity style={[styles.startBtn, { marginTop: 12 }]} onPress={saveSettings}>
          <Text style={styles.startBtnText}>שמור הגדרות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.retryBtn, { marginTop: 8 }]} onPress={confirmReset}>
          <Text style={[styles.retryBtnText, { color: C.red }]}>🗑 איפוס כל ההתקדמות</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
}

// ─── APP ────────────────────────────────────────────────────────────────────

export default function App() {
  const [progress, dispatch] = useReducer(progressReducer, defaultProgress);
  const [tab, setTab] = useState('home');
  const [quizConfig, setQuizConfig] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { dispatch({ type: 'LOAD', payload: JSON.parse(raw) }); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }
  }, [progress, loaded]);

  const wrappedDispatch = useCallback((action) => {
    dispatch(action);
  }, []);

  if (!loaded) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.pageTitle}>AmirNet Plus 🌐</Text>
        <Text style={styles.secondaryText}>טוען...</Text>
      </SafeAreaView>
    );
  }

  // Quiz flow (full screen)
  if (quizConfig) {
    return (
      <QuizScreen
        config={quizConfig}
        progress={progress}
        dispatch={wrappedDispatch}
        onFinish={() => setQuizConfig(null)}
      />
    );
  }

  function startQuiz(cfg) {
    if (cfg.tab === 'quiz') { setTab('quiz'); return; }
    setQuizConfig(cfg);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />
      {tab === 'home' && <HomeScreen progress={progress} dispatch={wrappedDispatch} onStartQuiz={setQuizConfig} />}
      {tab === 'topics' && <TopicsScreen progress={progress} onStartQuiz={setQuizConfig} />}
      {tab === 'quiz' && <QuizSetupScreen onStart={setQuizConfig} />}
      {tab === 'progress' && <ProgressScreen progress={progress} dispatch={wrappedDispatch} />}
      <TabBar tab={tab} setTab={setTab} />
    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 16, paddingTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg },
  card: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  row: { flexDirection: 'row-reverse', alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: '800', textAlign: 'right', marginBottom: 16, color: C.text },
  sectionTitle: { fontSize: 16, fontWeight: '700', textAlign: 'right', color: C.text, marginBottom: 8, marginTop: 4 },
  bodyText: { fontSize: 15, color: C.text },
  caption: { fontSize: 12, color: C.secondary },
  secondaryText: { fontSize: 14, color: C.secondary },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  progressTrack: { backgroundColor: C.fill, borderRadius: 6, overflow: 'hidden', width: '100%' },
  progressFill: { borderRadius: 6 },
  // Home
  homeHeader: { paddingTop: 8, paddingBottom: 8, alignItems: 'flex-end' },
  homeTitle: { fontSize: 24, fontWeight: '800', color: C.text, textAlign: 'right' },
  homeSubtitle: { fontSize: 14, color: C.secondary, textAlign: 'right' },
  goalCardDone: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: C.green + '55' },
  goalNum: { fontSize: 18, fontWeight: '800' },
  statsRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  statCard: { flex: 1, alignItems: 'center', padding: 10, marginBottom: 0 },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 18, fontWeight: '800' },
  streakCard: { flexDirection: 'row-reverse', backgroundColor: '#fff7ed', borderRadius: 14, padding: 14, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: C.orange + '44' },
  streakIcon: { fontSize: 28, marginLeft: 0 },
  streakText: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
  weakCard: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: C.orange + '44' },
  actionsRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
  actionBtn: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionTitle: { fontSize: 13, fontWeight: '700' },
  topicName: { fontSize: 16, fontWeight: '700', textAlign: 'right' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  diffBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginLeft: 4 },
  diffText: { fontSize: 11, fontWeight: '600' },
  // Quiz Setup
  setupHeaderCard: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#eff6ff', marginBottom: 16 },
  setupHeaderTitle: { fontSize: 18, fontWeight: '800', textAlign: 'right' },
  countRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
  countBtn: { flex: 1, backgroundColor: C.fill, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  countBtnActive: { backgroundColor: C.blue },
  countBtnText: { fontSize: 16, fontWeight: '700', color: C.text },
  topicOption: { backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, borderWidth: 1.5, borderColor: C.border },
  topicOptionActive: { backgroundColor: '#eff6ff', borderColor: C.blue + '66' },
  modeRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 16 },
  modeBtn: { flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: C.border },
  modeBtnActive: { backgroundColor: '#eff6ff', borderColor: C.blue + '66' },
  startBtn: { backgroundColor: C.blue, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Quiz
  quizTopBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  quizProgress: { height: 4, backgroundColor: C.fill },
  quizProgressFill: { height: 4, backgroundColor: C.blue },
  questionText: { fontSize: 17, fontWeight: '600', textAlign: 'right', marginTop: 10, lineHeight: 26 },
  optionBtn: { borderRadius: 12, borderWidth: 1.5, padding: 14, marginBottom: 10 },
  optLetter: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  expCard: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: C.orange + '44', marginTop: 8 },
  quizBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  nextBtn: { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Results
  resultsTopBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  scoreCircle: { alignItems: 'center', paddingVertical: 24 },
  scoreRing: { width: 160, height: 160, borderRadius: 80, borderWidth: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  scorePct: { fontSize: 38, fontWeight: '900' },
  scoreCaption: { fontSize: 14, color: C.secondary },
  statsRow2: { flexDirection: 'row-reverse', marginBottom: 12 },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  statItemBorder: { borderRightWidth: 1, borderRightColor: C.border },
  numCircle: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  resultsButtons: { flexDirection: 'row-reverse', gap: 10, padding: 16, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border },
  retryBtn: { flex: 1, backgroundColor: C.fill, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  retryBtnText: { fontSize: 15, fontWeight: '700', color: C.text },
  doneBtn: { flex: 1, backgroundColor: C.blue, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  // Progress
  achievementsGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  achievement: { width: (W - 56) / 3, backgroundColor: C.card, borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  input: { backgroundColor: C.fill, borderRadius: 10, padding: 10, fontSize: 15, borderWidth: 1, borderColor: C.border },
  // Tab Bar
  tabBar: { flexDirection: 'row-reverse', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: Platform.OS === 'ios' ? 16 : 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, paddingBottom: 4, position: 'relative' },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: C.secondary, marginTop: 2 },
  tabIndicator: { position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, backgroundColor: C.blue, borderRadius: 1 },
});
