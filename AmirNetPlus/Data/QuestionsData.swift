import Foundation

struct QuestionsData {
    static let all: [Question] = networking + security + operatingSystems + cloud + itManagement + protocols

    // MARK: - Networking (רשתות תקשורת)
    static let networking: [Question] = [
        Question(
            questionText: "כמה שכבות יש במודל OSI?",
            options: ["5", "6", "7", "8"],
            correctIndex: 2,
            explanation: "מודל OSI (Open Systems Interconnection) מורכב מ-7 שכבות: פיזית, קישור נתונים, רשת, תחבורה, סשן, מצגת ויישום.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "באיזו שכבת OSI פועל פרוטוקול IP?",
            options: ["שכבה 2 - קישור נתונים", "שכבה 3 - רשת", "שכבה 4 - תחבורה", "שכבה 5 - סשן"],
            correctIndex: 1,
            explanation: "פרוטוקול IP (Internet Protocol) פועל בשכבה 3 (שכבת הרשת) של מודל OSI, ואחראי על הניתוב בין רשתות.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא ה-Subnet Mask לרשת Class C?",
            options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
            correctIndex: 2,
            explanation: "רשת Class C משתמשת ב-Subnet Mask של 255.255.255.0 (או /24 בסימון CIDR), המאפשרת עד 254 מארחים.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "מה ההבדל בין Router ל-Switch?",
            options: [
                "Router פועל בשכבה 2, Switch בשכבה 3",
                "Router מנתב בין רשתות (שכבה 3), Switch מחבר בתוך רשת (שכבה 2)",
                "אין הבדל, שניהם זהים",
                "Switch מהיר יותר תמיד"
            ],
            correctIndex: 1,
            explanation: "Router פועל בשכבה 3 ומנתב תנועה בין רשתות שונות. Switch פועל בשכבה 2 ומחבר מכשירים בתוך אותה רשת מקומית.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "מה המשמעות של CIDR /24?",
            options: [
                "24 מארחים ברשת",
                "24 סיביות לחלק הרשת, 8 סיביות למארח",
                "Subnet Mask של 255.255.0.0",
                "24 נתבים ברשת"
            ],
            correctIndex: 1,
            explanation: "CIDR /24 מציין שה-Subnet Mask הוא 255.255.255.0. 24 הסיביות הראשונות מזהות את הרשת, ו-8 הסיביות הנותרות מזהות את המארח. מספר המארחים האפשריים: 2^8 - 2 = 254.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "מהו טווח כתובות IP פרטיות (Private) לפי Class A?",
            options: [
                "172.16.0.0 – 172.31.255.255",
                "192.168.0.0 – 192.168.255.255",
                "10.0.0.0 – 10.255.255.255",
                "169.254.0.0 – 169.254.255.255"
            ],
            correctIndex: 2,
            explanation: "כתובות Class A פרטיות הן 10.0.0.0 עד 10.255.255.255. כתובות 172.16-31 הן Class B פרטיות, ו-192.168.x.x הן Class C פרטיות.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "מה תפקיד פרוטוקול ARP?",
            options: [
                "הקצאת כתובות IP דינמית",
                "תרגום שמות דומיין לכתובות IP",
                "תרגום כתובת IP לכתובת MAC",
                "הצפנת תנועת רשת"
            ],
            correctIndex: 2,
            explanation: "ARP (Address Resolution Protocol) ממפה כתובת IP לכתובת MAC (פיזית) ברשת מקומית. זהו פרוטוקול שכבה 3 הפועל בתוך רשת מקומית.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הפורט הסטנדרטי של HTTPS?",
            options: ["80", "443", "8080", "8443"],
            correctIndex: 1,
            explanation: "HTTPS (HTTP Secure) פועל על פורט 443. HTTP הרגיל פועל על פורט 80.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "מה ההבדל בין Half-Duplex ל-Full-Duplex?",
            options: [
                "Half-Duplex מהיר יותר",
                "Full-Duplex מאפשר שליחה וקבלה בו-זמנית; Half-Duplex רק כיוון אחד בכל פעם",
                "Half-Duplex תומך ב-Wireless בלבד",
                "Full-Duplex זול יותר"
            ],
            correctIndex: 1,
            explanation: "Full-Duplex מאפשר תקשורת דו-כיוונית בו-זמנית (כמו שיחת טלפון). Half-Duplex מאפשר תקשורת רק בכיוון אחד בכל פעם (כמו מכשיר קשר).",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "רשת עם כתובת 192.168.1.0/26 – כמה מארחים ניתן לחבר?",
            options: ["30", "62", "126", "254"],
            correctIndex: 1,
            explanation: "/26 משמעו 6 סיביות למארח. 2^6 = 64 כתובות, פחות כתובת הרשת וכתובת הברודקאסט = 62 מארחים.",
            topic: .networking,
            difficulty: .hard
        ),
    ]

    // MARK: - Security (אבטחת מידע)
    static let security: [Question] = [
        Question(
            questionText: "מה ההבדל בין Symmetric ל-Asymmetric Encryption?",
            options: [
                "Symmetric מהיר יותר ומשתמש במפתח אחד; Asymmetric משתמש בזוג מפתחות",
                "Asymmetric מהיר יותר ומאובטח פחות",
                "Symmetric משתמש בשני מפתחות",
                "אין הבדל מעשי ביניהם"
            ],
            correctIndex: 0,
            explanation: "הצפנה סימטרית משתמשת במפתח אחד לצפין ולפענח (מהירה יותר, דוגמה: AES). הצפנה אסימטרית משתמשת בזוג מפתחות (ציבורי ופרטי), דוגמה: RSA.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא מתקפת Man-in-the-Middle?",
            options: [
                "מתקפה על שרת DNS",
                "תוקף מיירט תקשורת בין שני צדדים מבלי שידעו",
                "הצפת שרת בבקשות",
                "פרצה בחומת האש"
            ],
            correctIndex: 1,
            explanation: "במתקפת Man-in-the-Middle (MITM), התוקף מיירט את התקשורת בין שני צדדים, יכול לקרוא ואף לשנות את המידע המועבר.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "מהי מתקפת DoS ומה ההבדל ממתקפת DDoS?",
            options: [
                "DoS ממוחשב אחד; DDoS ממחשבים רבים (Botnet)",
                "DDoS מסוכן פחות מ-DoS",
                "שניהם זהים לחלוטין",
                "DoS מכוון לנתונים, DDoS לרשת בלבד"
            ],
            correctIndex: 0,
            explanation: "DoS (Denial of Service) מבוצע ממחשב אחד ומטרתו להפיל שרת. DDoS (Distributed DoS) מבוצע מאלפי מחשבים בו-זמנית (Botnet), קשה יותר לעצירה.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא Firewall מסוג Stateful?",
            options: [
                "חומת אש שבוחנת רק כותרות מנות",
                "חומת אש שעוקבת אחר מצב חיבורים ובוחנת הקשר",
                "חומת אש שמסנן לפי MAC Address",
                "חומת אש ללא תצורה"
            ],
            correctIndex: 1,
            explanation: "Stateful Firewall עוקב אחר מצב כל חיבור רשת ומאפשר החלטות מבוססות הקשר. בניגוד ל-Stateless שבוחן כל מנה בנפרד.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "מה ההבדל בין IDS ל-IPS?",
            options: [
                "IDS מזהה ומגיב אוטומטית; IPS רק מזהה",
                "IDS רק מזהה ומתריע; IPS גם חוסם תנועה חשודה",
                "שניהם זהים",
                "IPS פועל רק ב-Cloud"
            ],
            correctIndex: 1,
            explanation: "IDS (Intrusion Detection System) מזהה ומתריע על פעילות חשודה. IPS (Intrusion Prevention System) לא רק מזהה אלא גם חוסם באופן אקטיבי.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "מהו SSL/TLS ומה תפקידו?",
            options: [
                "פרוטוקול ניתוב",
                "פרוטוקול הצפנה לאבטחת תקשורת ברשת",
                "מנגנון זיהוי משתמשים",
                "שירות DNS מאובטח"
            ],
            correctIndex: 1,
            explanation: "SSL/TLS הם פרוטוקולי הצפנה המאבטחים תקשורת ברשת (למשל HTTPS). TLS הוא הגרסה המאובטחת יותר ומחליפה את SSL.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא Phishing?",
            options: [
                "תוכנה זדונית שמצפינה קבצים",
                "ניסיון הונאה לגנוב פרטי משתמש דרך הודעות מזויפות",
                "מתקפת Brute Force על סיסמאות",
                "ניצול חולשה בפרוטוקול TCP"
            ],
            correctIndex: 1,
            explanation: "Phishing היא טכניקת הנדסה חברתית שבה תוקפים שולחים הודעות מזויפות (מייל, SMS) כדי לגרום לקורבן לחשוף פרטים רגישים.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא VPN ואיך הוא מאבטח תקשורת?",
            options: [
                "רשת וירטואלית פרטית המצפינה תנועה ויוצרת מנהרה מאובטחת",
                "סוג של חומת אש",
                "פרוטוקול ניתוב ברשת ציבורית",
                "שירות אנטי-וירוס"
            ],
            correctIndex: 0,
            explanation: "VPN (Virtual Private Network) יוצר מנהרה מוצפנת ברשת ציבורית ומאפשר גישה מאובטחת למשאבים פרטיים, כאילו המשתמש נמצא ברשת הפנימית.",
            topic: .security,
            difficulty: .easy
        ),
    ]

    // MARK: - Operating Systems (מערכות הפעלה)
    static let operatingSystems: [Question] = [
        Question(
            questionText: "מה הוא Active Directory?",
            options: [
                "תוכנת אנטי-וירוס של Microsoft",
                "שירות ספריה של Microsoft לניהול משתמשים, קבוצות ומשאבים ברשת",
                "פרוטוקול ניתוב",
                "מנגנון גיבוי נתונים"
            ],
            correctIndex: 1,
            explanation: "Active Directory (AD) הוא שירות ספריה של Microsoft המאפשר ניהול מרכזי של משתמשים, קבוצות, מחשבים ומדיניות אבטחה בארגון.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "מה ההבדל בין Domain Controller ל-Member Server?",
            options: [
                "Domain Controller מנהל את Active Directory; Member Server הוא שרת חבר בדומיין",
                "Member Server חזק יותר",
                "Domain Controller פועל רק עם Linux",
                "אין הבדל"
            ],
            correctIndex: 0,
            explanation: "Domain Controller (DC) הוא שרת המריץ AD DS ומנהל זיהוי ואישורים. Member Server הוא שרת שהצטרף לדומיין אך אינו מריץ AD DS.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא NTFS ומה יתרונותיו על FAT32?",
            options: [
                "NTFS מהיר יותר אך לא תומך בקבצים גדולים",
                "NTFS תומך בהרשאות קבצים, הצפנה, דחיסה וקבצים גדולים מ-4GB",
                "FAT32 מתקדם יותר",
                "שניהם זהים"
            ],
            correctIndex: 1,
            explanation: "NTFS (New Technology File System) תומך בקבצים מעל 4GB, הרשאות אבטחה, הצפנה (EFS), דחיסה ורישום יומן. FAT32 מוגבל ל-4GB לקובץ ואינו תומך בהרשאות.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "מהי הפקודה לבדיקת IP ב-Windows?",
            options: ["ipconfig", "ifconfig", "netstat", "ping"],
            correctIndex: 0,
            explanation: "בWindows משתמשים ב-ipconfig להצגת הגדרות רשת. בLinux/macOS משתמשים ב-ifconfig או ip addr.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא Group Policy (GPO)?",
            options: [
                "מדיניות קבוצתית ב-Active Directory לניהול הגדרות מחשבים ומשתמשים",
                "תוכנת גיבוי",
                "פרוטוקול אבטחה",
                "שירות DHCP"
            ],
            correctIndex: 0,
            explanation: "Group Policy Object (GPO) מאפשר ניהול מרכזי של הגדרות עבור מחשבים ומשתמשים בדומיין, כגון מדיניות סיסמאות, הגדרות אבטחה ומיפוי כוננים.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הפקודה ב-Linux להצגת כל הקבצים כולל מוסתרים?",
            options: ["ls -a", "ls -l", "dir /a", "show all"],
            correctIndex: 0,
            explanation: "בLinux, הפקודה ls -a מציגה את כל הקבצים כולל קבצים מוסתרים (המתחילים בנקודה). ls -l מציג פרטים מורחבים.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא RAID 5?",
            options: [
                "גיבוי לדיסק חיצוני",
                "Striping עם Parity המפוזר על פני 3+ דיסקים, מאפשר סבילות לכשל דיסק אחד",
                "שיקוף בין 2 דיסקים",
                "אין הגנה על נתונים"
            ],
            correctIndex: 1,
            explanation: "RAID 5 משתמש ב-Striping עם Parity מפוזר על פני 3 דיסקים לפחות. ניתן לסבול כשל של דיסק אחד ולשחזר נתונים. מאזן בין ביצועים, קיבולת והגנה.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא Hyper-V?",
            options: [
                "אנטי-וירוס של Microsoft",
                "פלטפורמת וירטואליזציה של Microsoft המובנית ב-Windows Server",
                "שירות ענן של Microsoft",
                "פרוטוקול גיבוי"
            ],
            correctIndex: 1,
            explanation: "Hyper-V היא טכנולוגיית וירטואליזציה של Microsoft המובנית ב-Windows Server, המאפשרת יצירה וניהול של מכונות וירטואליות.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
    ]

    // MARK: - Cloud & Virtualization (ענן ווירטואליזציה)
    static let cloud: [Question] = [
        Question(
            questionText: "מה ההבדל בין IaaS, PaaS ו-SaaS?",
            options: [
                "כולם זהים, שמות שונים בלבד",
                "IaaS-תשתית; PaaS-פלטפורמה לפיתוח; SaaS-תוכנה כשירות מוכנה",
                "SaaS מאובטח יותר מ-IaaS",
                "PaaS מיועד רק לחברות גדולות"
            ],
            correctIndex: 1,
            explanation: "IaaS (כמו AWS EC2) מספק תשתית וירטואלית. PaaS (כמו Azure App Service) מספק פלטפורמה לפיתוח. SaaS (כמו Office 365) הוא תוכנה מוכנה לשימוש.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא S3 ב-AWS?",
            options: [
                "שירות מחשוב (compute)",
                "שירות אחסון אובייקטים (Object Storage)",
                "שירות רשת",
                "מסד נתונים"
            ],
            correctIndex: 1,
            explanation: "Amazon S3 (Simple Storage Service) הוא שירות אחסון אובייקטים בענן המאפשר אחסון וגישה לכמויות גדולות של נתונים עם זמינות גבוהה.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא VPC ב-AWS?",
            options: [
                "שירות מסד נתונים",
                "רשת וירטואלית פרטית בענן AWS עם שליטה מלאה בהגדרות הרשת",
                "שירות Backup",
                "שירות ניהול DNS"
            ],
            correctIndex: 1,
            explanation: "VPC (Virtual Private Cloud) מאפשר יצירת רשת וירטואלית מבודדת ב-AWS עם שליטה מלאה בכתובות IP, Subnets, Routing ו-Security Groups.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "מה ההבדל בין Public Cloud ל-Private Cloud?",
            options: [
                "Public Cloud מאובטח יותר",
                "Public Cloud תשתית משותפת דרך האינטרנט; Private Cloud תשתית ייעודית לארגון",
                "Private Cloud תמיד זול יותר",
                "אין הבדל מעשי"
            ],
            correctIndex: 1,
            explanation: "Public Cloud (AWS, Azure, GCP) מציע שירותים דרך האינטרנט לארגונים מרובים. Private Cloud הוא תשתית ענן ייעודית לארגון אחד, עם שליטה ואבטחה גבוהות יותר.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא Docker?",
            options: [
                "מערכת הפעלה",
                "פלטפורמת Containerization להרצת אפליקציות בסביבות מבודדות",
                "שפת תכנות",
                "כלי גיבוי"
            ],
            correctIndex: 1,
            explanation: "Docker מאפשר אריזת אפליקציה עם כל יחסי התלות שלה ב-Container, מה שמבטיח שהאפליקציה תרוץ אחידה בכל סביבה.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "מה ההבדל בין Virtualization ל-Containerization?",
            options: [
                "Containerization כבד יותר ודורש יותר משאבים",
                "Virtualization מריץ OS מלא לכל VM; Containerization חולק OS Kernel ויעיל יותר",
                "אין הבדל",
                "Virtualization מהיר יותר תמיד"
            ],
            correctIndex: 1,
            explanation: "VM מריץ מערכת הפעלה מלאה לכל מכונה וירטואלית (כבד יותר). Container חולק את ה-Kernel של מערכת ההפעלה ומריץ רק את האפליקציה ויחסי התלות (קל וקיצוני יותר).",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא Auto Scaling בענן?",
            options: [
                "הגדלה ידנית של שרתים",
                "מנגנון אוטומטי להוספה/הסרה של משאבים בהתאם לעומס",
                "שירות גיבוי אוטומטי",
                "עדכון אוטומטי של תוכנה"
            ],
            correctIndex: 1,
            explanation: "Auto Scaling מוסיף משאבי מחשוב אוטומטית כשהעומס גדל, ומסיר אותם כשהעומס קטן, מה שמבטיח ביצועים טובים ועלות מינימלית.",
            topic: .cloud,
            difficulty: .easy
        ),
    ]

    // MARK: - IT Management (ניהול IT)
    static let itManagement: [Question] = [
        Question(
            questionText: "מה הוא ITIL?",
            options: [
                "שפת תכנות לניהול IT",
                "מסגרת עבודה של Best Practices לניהול שירותי IT",
                "פרוטוקול רשת",
                "מוצר תוכנה של Microsoft"
            ],
            correctIndex: 1,
            explanation: "ITIL (Information Technology Infrastructure Library) היא מסגרת עבודה המכילה Best Practices לניהול שירותי IT, הכוללת תהליכים לניהול תקריות, בעיות, שינויים ועוד.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "מה ההבדל בין Incident ל-Problem ב-ITIL?",
            options: [
                "הם אותו הדבר",
                "Incident הוא שיבוש בשירות; Problem הוא הגורם השורשי לאירועים חוזרים",
                "Problem קל יותר לפתרון",
                "Incident מטופל לאחר Problem"
            ],
            correctIndex: 1,
            explanation: "Incident הוא כל שיבוש לא מתוכנן בשירות IT (למשל: שרת לא זמין). Problem הוא חקירת הגורם השורשי (Root Cause) כדי למנוע הישנות.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא SLA (Service Level Agreement)?",
            options: [
                "חוזה עם ספק חומרה",
                "הסכם המגדיר את רמת השירות המוסכמת בין ספק לקוח, כולל זמינות וזמן תגובה",
                "תוכנת ניהול",
                "תקן אבטחת מידע"
            ],
            correctIndex: 1,
            explanation: "SLA הוא הסכם רשמי בין ספק שירות IT ללקוח, המגדיר ציפיות לגבי זמינות שירות, זמן תגובה לתקלות, זמן שיקום ועוד.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא Change Management ב-ITIL?",
            options: [
                "ניהול שינויים ארגוניים",
                "תהליך לניהול מבוקר של שינויים בסביבת IT למניעת שיבושים",
                "עדכוני תוכנה אוטומטיים",
                "ניהול גרסאות קוד"
            ],
            correctIndex: 1,
            explanation: "Change Management הוא תהליך ITIL לניהול שינויים בסביבת IT. כולל בקשת שינוי (RFC), הערכת סיכונים, אישור, ביצוע ותיעוד כדי למזער שיבושים.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "מה הוא RTO ו-RPO בניהול המשכיות עסקית?",
            options: [
                "RTO-זמן שיקום מקסימלי; RPO-נקודת שיקום נתונים מקסימלית (כמה נתונים ניתן לאבד)",
                "שניהם מודדים זמן שיקום בלבד",
                "RPO מדד ביצועים בלבד",
                "RTO רלוונטי רק לענן"
            ],
            correctIndex: 0,
            explanation: "RTO (Recovery Time Objective) הוא הזמן המקסימלי המוסכם לשיקום שירות לאחר תקלה. RPO (Recovery Point Objective) הוא כמות הנתונים המקסימלית שניתן לאבד (זמן מאז הגיבוי האחרון).",
            topic: .itManagement,
            difficulty: .hard
        ),
        Question(
            questionText: "מה הוא Help Desk ומה ההבדל ממרכז שירות (Service Desk)?",
            options: [
                "שניהם זהים",
                "Help Desk מתמקד בפתרון תקניות; Service Desk רחב יותר ומנהל גם בקשות שירות",
                "Service Desk מיועד ללקוחות חיצוניים בלבד",
                "Help Desk יקר יותר"
            ],
            correctIndex: 1,
            explanation: "Help Desk מתמקד בתמיכה טכנית ופתרון תקלות. Service Desk (לפי ITIL) הוא נקודת קשר יחידה רחבה יותר, המטפלת גם בבקשות שירות, שינויים ועדכוני מידע.",
            topic: .itManagement,
            difficulty: .medium
        ),
    ]

    // MARK: - Protocols (פרוטוקולים)
    static let protocols: [Question] = [
        Question(
            questionText: "מה הפורט הסטנדרטי של DNS?",
            options: ["53", "80", "443", "25"],
            correctIndex: 0,
            explanation: "DNS (Domain Name System) פועל על פורט 53, הן על TCP והן על UDP. UDP לרוב לשאילתות רגילות, TCP להעברות אזור (Zone Transfer).",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "מה תפקיד פרוטוקול DHCP?",
            options: [
                "תרגום שמות דומיין",
                "הקצאה אוטומטית של כתובות IP ופרמטרי רשת למכשירים",
                "הצפנת תקשורת",
                "ניהול ניתוב"
            ],
            correctIndex: 1,
            explanation: "DHCP (Dynamic Host Configuration Protocol) מקצה אוטומטית כתובות IP, Subnet Mask, Default Gateway ו-DNS Server למכשירים ברשת.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "מה ההבדל בין TCP ל-UDP?",
            options: [
                "TCP מהיר יותר; UDP אמין יותר",
                "TCP מבוסס חיבור ואמין; UDP ללא חיבור ומהיר יותר אך פחות אמין",
                "שניהם זהים",
                "UDP תומך בהצפנה; TCP לא"
            ],
            correctIndex: 1,
            explanation: "TCP (Transmission Control Protocol) מבטיח מסירה מסודרת עם אישורים (Handshake). UDP (User Datagram Protocol) אינו מבטיח מסירה אך מהיר יותר - מתאים לסטרימינג, DNS, VoIP.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "מה תפקיד פרוטוקול SMTP?",
            options: [
                "קבלת מיילים",
                "שליחת מיילים בין שרתי דואר",
                "גלישה באינטרנט",
                "העברת קבצים"
            ],
            correctIndex: 1,
            explanation: "SMTP (Simple Mail Transfer Protocol) אחראי לשליחה והעברה של מיילים בין שרתים. פועל על פורט 25 (או 587 לשליחה מאובטחת). IMAP ו-POP3 משמשים לקבלת מיילים.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא HTTP ומה ה-Method הנפוץ ביותר?",
            options: [
                "פרוטוקול הצפנה, Method: ENCRYPT",
                "פרוטוקול תקשורת לאינטרנט, Method: GET",
                "פרוטוקול ניתוב, Method: ROUTE",
                "פרוטוקול DNS, Method: QUERY"
            ],
            correctIndex: 1,
            explanation: "HTTP (HyperText Transfer Protocol) הוא הפרוטוקול הבסיסי של האינטרנט. GET הוא ה-Method הנפוץ ביותר לבקשת נתונים. Methods נוספים: POST, PUT, DELETE, PATCH.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "מה הוא פרוטוקול FTP ועל איזה פורט הוא פועל?",
            options: [
                "File Transfer Protocol, פורט 21",
                "File Transfer Protocol, פורט 22",
                "Fast Transfer Protocol, פורט 80",
                "File Transfer Protocol, פורט 443"
            ],
            correctIndex: 0,
            explanation: "FTP (File Transfer Protocol) הוא פרוטוקול להעברת קבצים, פועל על פורט 21 (control) ופורט 20 (data). SFTP (SSH File Transfer) פועל על פורט 22 ומאובטח יותר.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "מהו Three-Way Handshake ב-TCP?",
            options: [
                "תהליך סגירת חיבור",
                "תהליך יצירת חיבור: SYN → SYN-ACK → ACK",
                "תהליך שליחת נתונים",
                "תהליך בדיקת שגיאות"
            ],
            correctIndex: 1,
            explanation: "Three-Way Handshake הוא תהליך יצירת חיבור TCP: 1) Client שולח SYN, 2) Server עונה SYN-ACK, 3) Client שולח ACK. רק אז החיבור נוצר.",
            topic: .protocols,
            difficulty: .medium
        ),
        Question(
            questionText: "מה ההבדל בין IMAP ל-POP3?",
            options: [
                "IMAP מסנכרן מיילים ושומר בשרת; POP3 מוריד ומוחק מהשרת",
                "POP3 מודרני יותר",
                "IMAP רק לשליחת מיילים",
                "שניהם זהים"
            ],
            correctIndex: 0,
            explanation: "IMAP (פורט 143/993) מסנכרן מיילים ומשאיר עותק בשרת - מאפשר גישה ממספר מכשירים. POP3 (פורט 110/995) מוריד מיילים ומוחק אותם מהשרת.",
            topic: .protocols,
            difficulty: .medium
        ),
    ]

    static func questions(for topic: TopicID) -> [Question] {
        all.filter { $0.topic == topic }
    }

    static func randomQuestions(count: Int, topic: TopicID? = nil) -> [Question] {
        let pool = topic == nil ? all : questions(for: topic!)
        return Array(pool.shuffled().prefix(count))
    }
}
