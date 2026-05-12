import Foundation

struct QuestionsData {
    static let all: [Question] = networkingHE + networkingEN + securityHE + securityEN + operatingSystemsHE + operatingSystemsEN + cloudHE + cloudEN + itManagementHE + itManagementEN + protocolsHE + protocolsEN

    // MARK: - Networking (רשתות תקשורת)
    static let networking: [Question] = networkingHE + networkingEN
    static let networkingHE: [Question] = [
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

    // MARK: - Networking EN – Sentence Completion
    static let networkingEN: [Question] = [
        Question(
            questionText: "The ___ protocol automatically assigns IP addresses and network settings to devices.",
            options: ["DHCP", "DNS", "FTP", "SMTP"],
            correctIndex: 0,
            explanation: "DHCP (Dynamic Host Configuration Protocol) automatically assigns IP address, subnet mask, default gateway and DNS server to devices on a network.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ operates at Layer 3 of the OSI model and forwards packets between different networks.",
            options: ["Router", "Switch", "Hub", "Bridge"],
            correctIndex: 0,
            explanation: "A Router operates at OSI Layer 3 (Network layer) and makes forwarding decisions based on IP addresses to route traffic between networks.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ layer of the OSI model is responsible for end-to-end reliable data delivery.",
            options: ["Transport", "Network", "Session", "Physical"],
            correctIndex: 0,
            explanation: "The Transport layer (Layer 4) handles end-to-end communication. TCP provides reliable delivery; UDP provides fast, connectionless delivery.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "A MAC address is a ___ address assigned to a network interface card.",
            options: ["physical (hardware)", "logical", "virtual", "dynamic"],
            correctIndex: 0,
            explanation: "A MAC (Media Access Control) address is a unique 48-bit physical hardware address burned into a NIC by the manufacturer.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "VLANs are used to segment a network into separate ___ domains.",
            options: ["broadcast", "collision", "routing", "multicast"],
            correctIndex: 0,
            explanation: "VLANs (Virtual LANs) logically segment a switched network into separate broadcast domains, improving security and performance.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "NAT allows multiple devices on a private network to share a single ___ IP address.",
            options: ["public", "private", "static", "loopback"],
            correctIndex: 0,
            explanation: "NAT (Network Address Translation) translates private IP addresses to a single public IP address, conserving public IP space.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "The loopback address ___ is used by a host to refer to itself.",
            options: ["127.0.0.1", "192.168.0.1", "10.0.0.1", "0.0.0.0"],
            correctIndex: 0,
            explanation: "127.0.0.1 is the loopback (localhost) address. Traffic sent to it stays on the local machine and is used to test the network stack.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "OSPF is classified as a ___ routing protocol.",
            options: ["link-state", "distance-vector", "path-vector", "static"],
            correctIndex: 0,
            explanation: "OSPF (Open Shortest Path First) is a link-state routing protocol. Each router builds a complete map of the network topology and calculates the shortest path.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "Spanning Tree Protocol (STP) prevents ___ loops in switched networks.",
            options: ["bridge/network", "routing", "broadcast", "multicast"],
            correctIndex: 0,
            explanation: "STP (Spanning Tree Protocol) prevents Layer 2 switching loops by blocking redundant paths, ensuring a loop-free topology.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "A ___ connects two different network types and translates between their protocols at all OSI layers.",
            options: ["Gateway", "Switch", "Hub", "Repeater"],
            correctIndex: 0,
            explanation: "A Gateway operates at all OSI layers and translates between incompatible protocols or network architectures.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "The ___ command is used to display the routing table on a Windows machine.",
            options: ["route print", "netstat -r", "ipconfig /all", "tracert"],
            correctIndex: 0,
            explanation: "'route print' displays the routing table on Windows. 'netstat -r' also works. The routing table shows how the system forwards packets to different networks.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "In a /28 subnet, the number of usable host addresses is ___.",
            options: ["14", "16", "30", "62"],
            correctIndex: 0,
            explanation: "/28 leaves 4 bits for hosts: 2^4 = 16 addresses total. Subtract the network and broadcast addresses: 16 – 2 = 14 usable hosts.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "An IP address of 169.254.x.x indicates the device failed to obtain an address from ___.",
            options: ["a DHCP server", "a DNS server", "the default gateway", "an FTP server"],
            correctIndex: 0,
            explanation: "169.254.0.0/16 is the APIPA (Automatic Private IP Addressing) range. Windows assigns an address in this range when it cannot reach a DHCP server.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "The ___ layer of the OSI model handles data format translation and encryption/decryption.",
            options: ["Presentation", "Session", "Application", "Transport"],
            correctIndex: 0,
            explanation: "The Presentation layer (Layer 6) handles data format translation, encryption/decryption, and compression so the Application layer receives usable data.",
            topic: .networking,
            difficulty: .medium
        ),
        Question(
            questionText: "Full-Duplex communication allows data to be transmitted ___.",
            options: ["in both directions simultaneously", "in one direction at a time", "wirelessly only", "without a switch"],
            correctIndex: 0,
            explanation: "Full-Duplex allows simultaneous bidirectional communication (like a phone call). Half-Duplex allows only one direction at a time (like a walkie-talkie).",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ protocol resolves IP addresses to MAC addresses within a local network.",
            options: ["ARP", "DNS", "DHCP", "RARP"],
            correctIndex: 0,
            explanation: "ARP (Address Resolution Protocol) maps a known IP address to a MAC address by broadcasting a request on the local network segment.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "QoS stands for Quality of ___.",
            options: ["Service", "Speed", "Security", "System"],
            correctIndex: 0,
            explanation: "QoS (Quality of Service) refers to mechanisms that prioritize certain types of network traffic to guarantee performance for latency-sensitive applications.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ is a network device that regenerates and retransmits signals to extend the network range.",
            options: ["Repeater", "Router", "Switch", "Firewall"],
            correctIndex: 0,
            explanation: "A Repeater operates at OSI Layer 1 (Physical). It amplifies and retransmits signals to extend the reach of a network segment.",
            topic: .networking,
            difficulty: .easy
        ),
        Question(
            questionText: "BGP (Border Gateway Protocol) is the routing protocol used to exchange routing information between ___.",
            options: ["autonomous systems on the internet", "routers in a LAN", "VLANs on a switch", "wireless access points"],
            correctIndex: 0,
            explanation: "BGP is the core routing protocol of the internet, exchanging routing information between autonomous systems (AS) – large networks managed by different organisations.",
            topic: .networking,
            difficulty: .hard
        ),
        Question(
            questionText: "In IPv6, the address space is ___ bits long.",
            options: ["128", "32", "64", "256"],
            correctIndex: 0,
            explanation: "IPv6 uses 128-bit addresses (compared to 32-bit in IPv4), providing approximately 3.4 × 10^38 unique addresses.",
            topic: .networking,
            difficulty: .medium
        ),
    ]

    // MARK: - Security (אבטחת מידע)
    static let security: [Question] = securityHE + securityEN
    static let securityHE: [Question] = [
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

    // MARK: - Security EN – Sentence Completion
    static let securityEN: [Question] = [
        Question(
            questionText: "The CIA triad in information security stands for Confidentiality, Integrity, and ___.",
            options: ["Availability", "Authentication", "Authorization", "Accountability"],
            correctIndex: 0,
            explanation: "The CIA triad is the core model of information security. Confidentiality protects data from unauthorised access; Integrity ensures data is unaltered; Availability ensures systems are accessible.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "In ___ encryption, the same key is used for both encrypting and decrypting data.",
            options: ["symmetric", "asymmetric", "public-key", "hybrid"],
            correctIndex: 0,
            explanation: "Symmetric encryption uses a single shared key (e.g. AES). It is faster than asymmetric encryption but requires a secure channel to exchange the key.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "___ is a social engineering attack that tricks users into revealing sensitive information via fake messages.",
            options: ["Phishing", "Spoofing", "Sniffing", "Port scanning"],
            correctIndex: 0,
            explanation: "Phishing uses deceptive emails, websites, or messages that appear legitimate to steal credentials or sensitive data from unsuspecting users.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "IDS stands for Intrusion ___ System.",
            options: ["Detection", "Defense", "Denial", "Delivery"],
            correctIndex: 0,
            explanation: "IDS (Intrusion Detection System) monitors network or system activity for malicious activity and sends alerts. Unlike IPS, it does not actively block threats.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ attack involves an attacker secretly intercepting and possibly altering communications between two parties.",
            options: ["Man-in-the-Middle", "DoS", "Phishing", "SQL Injection"],
            correctIndex: 0,
            explanation: "In a Man-in-the-Middle (MitM) attack, the attacker positions themselves between the two communicating parties, able to read, modify or inject messages.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ firewall inspects packets based on the state of active network connections.",
            options: ["stateful", "stateless", "packet-filtering", "application-proxy"],
            correctIndex: 0,
            explanation: "A stateful firewall tracks the state of each connection and makes decisions based on context (e.g. allowing return traffic for established sessions).",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "Zero-day vulnerability refers to a security flaw that is ___ to the software vendor.",
            options: ["unknown", "known and patched", "publicly documented", "reported to authorities"],
            correctIndex: 0,
            explanation: "A zero-day vulnerability is unknown to the vendor and therefore has no patch. Attackers who discover it have 'zero days' of warning before exploitation.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "Ransomware is malware that ___ the victim's files and demands payment for the decryption key.",
            options: ["encrypts", "deletes", "copies to a remote server", "monitors activity on"],
            correctIndex: 0,
            explanation: "Ransomware encrypts a victim's files or entire disk, then demands a ransom (usually cryptocurrency) in exchange for the decryption key.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ is a trusted third party that issues digital certificates to verify identities online.",
            options: ["Certificate Authority (CA)", "Domain Controller", "Firewall", "Load Balancer"],
            correctIndex: 0,
            explanation: "A Certificate Authority issues and signs digital certificates (e.g. SSL/TLS certificates) that bind a public key to an entity, enabling trust on the internet.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "The principle of ___ ensures users only have the minimum access rights needed to perform their job.",
            options: ["Least Privilege", "Separation of Duties", "Defense in Depth", "Non-Repudiation"],
            correctIndex: 0,
            explanation: "The Principle of Least Privilege (PoLP) limits users and processes to only the permissions they need, reducing the attack surface.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "Multi-factor authentication (MFA) requires users to provide at least ___ form(s) of verification.",
            options: ["two", "one", "three", "four"],
            correctIndex: 0,
            explanation: "MFA combines two or more factors: something you know (password), something you have (token), and something you are (biometric).",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "SSH uses port ___ by default for secure remote access.",
            options: ["22", "23", "21", "443"],
            correctIndex: 0,
            explanation: "SSH (Secure Shell) uses TCP port 22 to provide encrypted remote login and command execution. Telnet (port 23) is the insecure predecessor.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "WPA2 secures wireless networks using ___ encryption.",
            options: ["AES", "DES", "MD5", "SHA-1"],
            correctIndex: 0,
            explanation: "WPA2 uses AES (Advanced Encryption Standard) with CCMP for encryption. WEP and the older WPA used RC4, which is now considered insecure.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "A ___ attack attempts to gain access by systematically trying every possible password combination.",
            options: ["Brute Force", "Phishing", "Man-in-the-Middle", "DoS"],
            correctIndex: 0,
            explanation: "A Brute Force attack tries all possible combinations until the correct password is found. Account lockout policies and strong passwords mitigate this risk.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ is a network segment that acts as a buffer zone between a trusted internal network and the internet.",
            options: ["DMZ (Demilitarised Zone)", "VLAN", "NAT", "VPN tunnel"],
            correctIndex: 0,
            explanation: "A DMZ hosts public-facing services (web, email servers) isolated from the internal network. Even if the DMZ is compromised, the internal network remains protected.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "A ___ is a program that appears legitimate but contains hidden malicious code.",
            options: ["Trojan horse", "Worm", "Virus", "Adware"],
            correctIndex: 0,
            explanation: "A Trojan horse disguises itself as legitimate software. Unlike viruses or worms it does not self-replicate, but can open backdoors or steal data.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "HTTPS uses ___ to secure the HTTP communication.",
            options: ["TLS (Transport Layer Security)", "IPsec", "ARP", "SNMP"],
            correctIndex: 0,
            explanation: "HTTPS wraps HTTP inside TLS (formerly SSL), providing encryption, authentication, and integrity protection for web traffic.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "SQL Injection is an attack that inserts malicious ___ into an input field to manipulate a database.",
            options: ["SQL code", "HTML tags", "JavaScript", "Shell commands"],
            correctIndex: 0,
            explanation: "SQL Injection exploits poor input validation by inserting SQL statements that the database executes, potentially exposing or modifying data.",
            topic: .security,
            difficulty: .medium
        ),
        Question(
            questionText: "The process of converting plaintext into unreadable ciphertext is called ___.",
            options: ["encryption", "hashing", "encoding", "compression"],
            correctIndex: 0,
            explanation: "Encryption transforms plaintext into ciphertext using an algorithm and key. It is reversible (decryptable), unlike hashing which is a one-way process.",
            topic: .security,
            difficulty: .easy
        ),
        Question(
            questionText: "A VPN creates an encrypted ___ through a public network to secure communications.",
            options: ["tunnel", "bridge", "VLAN", "proxy"],
            correctIndex: 0,
            explanation: "A VPN (Virtual Private Network) encapsulates and encrypts traffic in a tunnel over the internet, giving remote users secure access to private network resources.",
            topic: .security,
            difficulty: .easy
        ),
    ]

    // MARK: - Operating Systems (מערכות הפעלה)
    static let operatingSystems: [Question] = operatingSystemsHE + operatingSystemsEN
    static let operatingSystemsHE: [Question] = [
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

    // MARK: - Operating Systems EN – Sentence Completion
    static let operatingSystemsEN: [Question] = [
        Question(
            questionText: "The ___ command in Linux is used to change the permissions of a file or directory.",
            options: ["chmod", "chown", "chgrp", "ls -l"],
            correctIndex: 0,
            explanation: "chmod (change mode) sets read/write/execute permissions for owner, group and others. Example: chmod 755 file gives rwxr-xr-x.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "In Windows, the ___ tool provides centralised management of users, computers, and policies in a domain.",
            options: ["Active Directory", "Task Manager", "Registry Editor", "Device Manager"],
            correctIndex: 0,
            explanation: "Active Directory (AD) is Microsoft's directory service. It stores information about objects (users, computers, groups) and enforces security policies across the domain.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "A ___ in Linux is a background process that runs without direct user interaction.",
            options: ["daemon", "shell", "kernel module", "cron"],
            correctIndex: 0,
            explanation: "Daemons are background processes in Linux/Unix (e.g. httpd, sshd). They start at boot and handle system or network services without a controlling terminal.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ file system is the default for modern Windows installations and supports large files and fine-grained permissions.",
            options: ["NTFS", "FAT32", "exFAT", "ext4"],
            correctIndex: 0,
            explanation: "NTFS (New Technology File System) supports files larger than 4 GB, Access Control Lists (ACLs), journaling, compression and encryption (EFS).",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "RAID ___ uses disk mirroring to provide fault tolerance, but does not improve read/write performance.",
            options: ["1", "0", "5", "10"],
            correctIndex: 0,
            explanation: "RAID 1 mirrors data identically on two disks. If one fails, the other contains a full copy. It provides fault tolerance but uses 50% of total disk capacity.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "The Windows ___ is a hierarchical database that stores configuration settings for the OS, hardware, and applications.",
            options: ["Registry", "Task Scheduler", "Event Viewer", "BIOS"],
            correctIndex: 0,
            explanation: "The Windows Registry stores low-level settings for Windows and applications. It is organised into keys and values, and can be edited with regedit.exe.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "In Active Directory, a ___ is the fundamental administrative boundary that groups computers, users and resources.",
            options: ["domain", "workgroup", "forest root", "site"],
            correctIndex: 0,
            explanation: "A domain is the core unit of AD. All objects in a domain share the same directory database and security policies. Multiple domains can form a forest.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "The ___ command in Windows checks and repairs file system errors on a disk.",
            options: ["chkdsk", "diskpart", "format", "defrag"],
            correctIndex: 0,
            explanation: "chkdsk (Check Disk) scans the file system and disk surface for errors and attempts to fix them. Running with /f flag fixes errors; /r locates bad sectors.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "GPO stands for Group Policy ___.",
            options: ["Object", "Operation", "Override", "Objective"],
            correctIndex: 0,
            explanation: "A Group Policy Object (GPO) is a collection of settings that control the working environment of user accounts and computer accounts in Active Directory.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "In Linux, the ___ command displays currently running processes and system resource usage in real time.",
            options: ["top", "ps", "df", "ls"],
            correctIndex: 0,
            explanation: "top shows a dynamic real-time view of running processes, CPU usage, memory usage and more. Press 'q' to quit. htop is a more user-friendly alternative.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ command in Linux is used to change the ownership of a file.",
            options: ["chown", "chmod", "chgrp", "ls"],
            correctIndex: 0,
            explanation: "chown (change owner) changes the user and/or group ownership of a file. Example: chown user:group filename.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "Hyper-V is Microsoft's built-in ___.",
            options: ["hypervisor (virtualisation platform)", "antivirus engine", "backup agent", "network monitor"],
            correctIndex: 0,
            explanation: "Hyper-V is a Type-1 (bare-metal) hypervisor built into Windows Server and Windows 10/11 Pro/Enterprise, allowing you to create and run virtual machines.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "In Linux, the file ___ contains information about all local user accounts.",
            options: ["/etc/passwd", "/etc/shadow", "/etc/hosts", "/etc/fstab"],
            correctIndex: 0,
            explanation: "/etc/passwd stores basic user account info (username, UID, home directory, shell). Encrypted passwords are stored separately in /etc/shadow.",
            topic: .operatingSystems,
            difficulty: .medium
        ),
        Question(
            questionText: "PowerShell is Microsoft's command-line shell and ___ framework for task automation.",
            options: ["scripting", "networking", "virtualisation", "backup"],
            correctIndex: 0,
            explanation: "PowerShell is a cross-platform task automation tool consisting of a command-line shell and scripting language built on .NET, widely used for Windows administration.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
        Question(
            questionText: "BIOS stands for Basic Input/Output ___.",
            options: ["System", "Software", "Service", "Standard"],
            correctIndex: 0,
            explanation: "BIOS (Basic Input/Output System) is firmware stored on a chip on the motherboard. It initialises hardware during boot and loads the operating system bootloader.",
            topic: .operatingSystems,
            difficulty: .easy
        ),
    ]

    // MARK: - Cloud & Virtualization (ענן ווירטואליזציה)
    static let cloud: [Question] = cloudHE + cloudEN
    static let cloudHE: [Question] = [
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

    // MARK: - Cloud EN – Sentence Completion
    static let cloudEN: [Question] = [
        Question(
            questionText: "IaaS stands for Infrastructure as a ___.",
            options: ["Service", "System", "Solution", "Server"],
            correctIndex: 0,
            explanation: "IaaS (Infrastructure as a Service) provides virtualised computing resources over the internet – virtual machines, storage and networking – on a pay-as-you-go basis.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "AWS S3 is primarily used for ___ storage.",
            options: ["object", "block", "file", "database"],
            correctIndex: 0,
            explanation: "Amazon S3 (Simple Storage Service) is an object storage service. Data is stored as objects (files + metadata) in buckets, ideal for backups, media, and static websites.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "In cloud computing, ___ refers to the ability to automatically add or remove resources based on demand.",
            options: ["elasticity", "reliability", "durability", "portability"],
            correctIndex: 0,
            explanation: "Elasticity means cloud resources expand when load increases and shrink when it drops, ensuring cost-efficient performance without manual intervention.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "Docker containers share the host's ___, making them significantly lighter than virtual machines.",
            options: ["OS kernel", "CPU cores", "RAM modules", "disk controller"],
            correctIndex: 0,
            explanation: "Unlike VMs, containers share the host OS kernel. They package only the application and its dependencies, making them faster to start and much smaller in size.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "A ___ cloud combines both public and private cloud environments, allowing data and applications to move between them.",
            options: ["hybrid", "community", "distributed", "federated"],
            correctIndex: 0,
            explanation: "A hybrid cloud links on-premises or private cloud infrastructure with public cloud services, enabling flexibility, cost optimisation and data sovereignty.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "Kubernetes is an open-source platform for ___ containerised workloads and services.",
            options: ["orchestrating", "building", "testing", "encrypting"],
            correctIndex: 0,
            explanation: "Kubernetes (K8s) automates deployment, scaling, and management of containerised applications. It groups containers into pods and manages their lifecycle.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "SLA stands for Service Level ___.",
            options: ["Agreement", "Assessment", "Authorization", "Allocation"],
            correctIndex: 0,
            explanation: "An SLA (Service Level Agreement) is a contract between a cloud provider and customer that defines expected service levels such as uptime, response time and support.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ cloud model charges customers only for the resources they actually consume.",
            options: ["pay-as-you-go", "subscription", "perpetual licence", "freemium"],
            correctIndex: 0,
            explanation: "The pay-as-you-go (consumption) model is the defining pricing model of public cloud. Customers pay only for what they use, avoiding large upfront capital expenses.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "___ computing moves computation and data storage closer to the data source to reduce latency.",
            options: ["Edge", "Grid", "Fog", "Cluster"],
            correctIndex: 0,
            explanation: "Edge computing processes data at or near the source (e.g. IoT devices, factories) rather than sending it to a centralised data centre, reducing latency and bandwidth.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "CDN stands for Content ___ Network.",
            options: ["Delivery", "Distribution", "Domain", "Dynamic"],
            correctIndex: 0,
            explanation: "A CDN (Content Delivery Network) is a geographically distributed group of servers that caches content close to users, improving load times and reducing origin server load.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "In cloud environments, ___ ensures services remain operational even if individual components fail.",
            options: ["high availability", "low latency", "horizontal scaling", "load balancing"],
            correctIndex: 0,
            explanation: "High availability (HA) is achieved through redundancy, failover mechanisms and geographic distribution, ensuring services meet their uptime SLA targets.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "PaaS provides developers with a ___ to build, run and manage applications without managing the underlying infrastructure.",
            options: ["platform", "virtual machine", "container image", "bare-metal server"],
            correctIndex: 0,
            explanation: "PaaS (Platform as a Service) handles the OS, middleware, runtime and scaling, letting developers focus purely on writing code. Examples: Azure App Service, Google App Engine.",
            topic: .cloud,
            difficulty: .easy
        ),
        Question(
            questionText: "AWS ___ is the service used to manage user identities and access to AWS resources.",
            options: ["IAM (Identity and Access Management)", "EC2", "S3", "CloudFront"],
            correctIndex: 0,
            explanation: "AWS IAM lets you create users, groups and roles, and control who can access which AWS services and resources using fine-grained permissions.",
            topic: .cloud,
            difficulty: .medium
        ),
        Question(
            questionText: "In a cloud disaster recovery plan, RTO refers to the maximum acceptable ___ to restore a service after a failure.",
            options: ["downtime (time to recover)", "data loss", "cost", "bandwidth"],
            correctIndex: 0,
            explanation: "RTO (Recovery Time Objective) is the maximum duration a service can be unavailable. A short RTO requires more expensive solutions like hot standby or active-active replication.",
            topic: .cloud,
            difficulty: .hard
        ),
        Question(
            questionText: "A ___ is a pre-configured template containing the OS and application stack used to launch cloud instances.",
            options: ["machine image (AMI/snapshot)", "Dockerfile", "YAML manifest", "shell script"],
            correctIndex: 0,
            explanation: "Cloud machine images (e.g. AWS AMI) capture the full state of an instance. Launching from an image produces identical, pre-configured instances rapidly.",
            topic: .cloud,
            difficulty: .medium
        ),
    ]

    // MARK: - IT Management (ניהול IT)
    static let itManagement: [Question] = itManagementHE + itManagementEN
    static let itManagementHE: [Question] = [
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

    // MARK: - IT Management EN – Sentence Completion
    static let itManagementEN: [Question] = [
        Question(
            questionText: "ITIL stands for Information Technology Infrastructure ___.",
            options: ["Library", "Lifecycle", "Listing", "Logic"],
            correctIndex: 0,
            explanation: "ITIL (Information Technology Infrastructure Library) is a set of best-practice guidelines for IT service management (ITSM), widely adopted worldwide.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "In ITIL, an ___ is any unplanned interruption or reduction in quality of an IT service.",
            options: ["incident", "problem", "change", "event"],
            correctIndex: 0,
            explanation: "An incident is an unplanned service disruption. The goal of incident management is to restore normal service as quickly as possible with minimum business impact.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ process in ITIL investigates the root cause of one or more incidents to prevent recurrence.",
            options: ["Problem Management", "Incident Management", "Change Management", "Release Management"],
            correctIndex: 0,
            explanation: "Problem Management identifies and removes the underlying cause of incidents. Once identified, the root cause becomes a 'known error' with a documented workaround.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "KPI stands for Key Performance ___.",
            options: ["Indicator", "Index", "Integration", "Interface"],
            correctIndex: 0,
            explanation: "KPIs (Key Performance Indicators) are measurable values that demonstrate how effectively an organisation or team is achieving key business objectives.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "An SLA defines the ___ of service expected between an IT provider and the customer.",
            options: ["level", "speed", "cost", "architecture"],
            correctIndex: 0,
            explanation: "An SLA (Service Level Agreement) is a formal contract specifying service metrics such as uptime percentage, response time, and resolution time for incidents.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "CMDB stands for Configuration Management ___ Database.",
            options: ["- (the full name is Configuration Management Database)", "Change", "Content", "Control"],
            correctIndex: 0,
            explanation: "A CMDB (Configuration Management Database) stores information about IT assets (Configuration Items) and their relationships, supporting ITSM processes.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "RTO stands for Recovery Time ___.",
            options: ["Objective", "Operation", "Override", "Outcome"],
            correctIndex: 0,
            explanation: "RTO (Recovery Time Objective) is the maximum acceptable length of time after a service disruption before it must be restored to avoid unacceptable business impact.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "RPO refers to the maximum amount of ___ a business can afford to lose in a disaster.",
            options: ["data", "time", "money", "staff"],
            correctIndex: 0,
            explanation: "RPO (Recovery Point Objective) defines the age of data that must be recovered. A 4-hour RPO means backups must occur at least every 4 hours.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "ITSM stands for IT Service ___.",
            options: ["Management", "Monitoring", "Mapping", "Migration"],
            correctIndex: 0,
            explanation: "IT Service Management (ITSM) encompasses all activities, processes and policies an organisation uses to plan, design, deliver, operate and control IT services.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ is the single point of contact between IT users and the IT department.",
            options: ["Service Desk", "Help Centre", "NOC", "SOC"],
            correctIndex: 0,
            explanation: "The Service Desk (per ITIL) is a broader concept than a Help Desk. It handles incidents, service requests, changes, and communications – acting as a strategic function.",
            topic: .itManagement,
            difficulty: .easy
        ),
        Question(
            questionText: "Change ___ in ITIL ensures all modifications to IT infrastructure are properly assessed, approved and implemented.",
            options: ["Management", "Control", "Logging", "Deployment"],
            correctIndex: 0,
            explanation: "Change Management controls the lifecycle of all changes, minimising the risk of disruption. Changes are categorised as standard, normal, or emergency.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "A ___ plan describes the steps an organisation takes to resume critical business operations after a disaster.",
            options: ["Business Continuity", "Disaster Recovery", "Incident Response", "Service Level"],
            correctIndex: 0,
            explanation: "A Business Continuity Plan (BCP) ensures critical business functions continue during and after a disaster. The more focused Disaster Recovery Plan (DRP) covers IT systems restoration.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "In ITIL, a ___ is a workaround for a known error until a permanent fix is implemented.",
            options: ["known error record", "problem ticket", "incident report", "change request"],
            correctIndex: 0,
            explanation: "A known error record documents a problem with an identified root cause and a workaround. It lives in the Known Error Database (KEDB) and helps resolve future incidents faster.",
            topic: .itManagement,
            difficulty: .hard
        ),
        Question(
            questionText: "Availability management in ITIL aims to ensure IT services meet availability targets defined in the ___.",
            options: ["SLA", "CMDB", "RFC", "KPI dashboard"],
            correctIndex: 0,
            explanation: "Availability management monitors and improves the availability of IT services to ensure they meet the levels agreed with customers in the SLA.",
            topic: .itManagement,
            difficulty: .medium
        ),
        Question(
            questionText: "A ___ (RFC) is a formal proposal submitted to the change management process requesting a modification to an IT service.",
            options: ["Request for Change", "Request for Comment", "Release for Change", "Record for Configuration"],
            correctIndex: 0,
            explanation: "A Request for Change (RFC) triggers the Change Management process. It documents the nature of the change, its business justification, risk assessment and rollback plan.",
            topic: .itManagement,
            difficulty: .medium
        ),
    ]

    // MARK: - Protocols (פרוטוקולים)
    static let protocols: [Question] = protocolsHE + protocolsEN
    static let protocolsHE: [Question] = [
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

    // MARK: - Protocols EN – Sentence Completion
    static let protocolsEN: [Question] = [
        Question(
            questionText: "DNS stands for Domain Name ___.",
            options: ["System", "Service", "Server", "Security"],
            correctIndex: 0,
            explanation: "DNS (Domain Name System) translates human-readable domain names (e.g. www.example.com) into IP addresses that computers use to communicate.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "HTTP uses port ___ by default.",
            options: ["80", "443", "8080", "21"],
            correctIndex: 0,
            explanation: "HTTP (HyperText Transfer Protocol) uses TCP port 80. HTTPS (HTTP Secure) uses port 443. Port 8080 is a common alternative for web servers and proxies.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "SMTP is used to ___ email messages between servers.",
            options: ["send / relay", "receive and store", "encrypt", "compress"],
            correctIndex: 0,
            explanation: "SMTP (Simple Mail Transfer Protocol) handles outgoing email – it sends and relays messages between mail servers on port 25, or port 587 for authenticated submission.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "In TCP, a connection is established using a ___ handshake.",
            options: ["three-way", "two-way", "four-way", "one-way"],
            correctIndex: 0,
            explanation: "TCP's three-way handshake: (1) Client sends SYN, (2) Server replies SYN-ACK, (3) Client sends ACK. Only then is the connection established.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "SNMP is used by network administrators to ___ network devices.",
            options: ["monitor and manage", "encrypt traffic on", "route packets through", "assign IPs to"],
            correctIndex: 0,
            explanation: "SNMP (Simple Network Management Protocol) collects and organises information about managed devices (routers, switches, servers) and allows remote configuration.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ protocol uses UDP port 123 to synchronise clocks across networked devices.",
            options: ["NTP", "SNMP", "TFTP", "ICMP"],
            correctIndex: 0,
            explanation: "NTP (Network Time Protocol) keeps device clocks synchronised to within milliseconds of Coordinated Universal Time (UTC), which is essential for logs, certificates and Kerberos.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "IMAP allows email clients to access and manage messages ___ on the mail server.",
            options: ["stored remotely", "downloaded and deleted", "encrypted locally", "cached offline only"],
            correctIndex: 0,
            explanation: "IMAP (Internet Message Access Protocol) keeps email on the server and synchronises state across multiple devices. POP3 downloads and typically deletes from the server.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "POP3 uses port ___ by default.",
            options: ["110", "25", "143", "993"],
            correctIndex: 0,
            explanation: "POP3 uses port 110 (unencrypted) or port 995 (POP3S over TLS). IMAP uses port 143 (or 993 encrypted). SMTP uses port 25.",
            topic: .protocols,
            difficulty: .medium
        ),
        Question(
            questionText: "The ___ protocol is used by the 'ping' command to test network connectivity.",
            options: ["ICMP", "TCP", "UDP", "ARP"],
            correctIndex: 0,
            explanation: "Ping uses ICMP (Internet Control Message Protocol) Echo Request and Echo Reply messages to test reachability and measure round-trip time.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "LDAP is used to access and maintain ___ directory services.",
            options: ["distributed", "encrypted", "local", "real-time streaming"],
            correctIndex: 0,
            explanation: "LDAP (Lightweight Directory Access Protocol) queries and modifies items in distributed directory services such as Active Directory, using port 389 (or 636 for LDAPS).",
            topic: .protocols,
            difficulty: .medium
        ),
        Question(
            questionText: "BGP stands for ___ Gateway Protocol.",
            options: ["Border", "Basic", "Bridge", "Broadcast"],
            correctIndex: 0,
            explanation: "BGP (Border Gateway Protocol) is the routing protocol of the internet. It exchanges routing information between autonomous systems (AS) on port 179.",
            topic: .protocols,
            difficulty: .medium
        ),
        Question(
            questionText: "Telnet is considered insecure because it transmits all data, including passwords, in ___.",
            options: ["plaintext", "ciphertext", "binary", "Base64"],
            correctIndex: 0,
            explanation: "Telnet sends all data unencrypted in plaintext. SSH (port 22) replaced Telnet as the secure alternative for remote administration.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "The ___ protocol provides connectionless, fast data transmission without guaranteed delivery.",
            options: ["UDP", "TCP", "FTP", "HTTPS"],
            correctIndex: 0,
            explanation: "UDP (User Datagram Protocol) is connectionless and has no error-checking or retransmission. It is ideal for speed-critical applications: DNS, VoIP, video streaming, online gaming.",
            topic: .protocols,
            difficulty: .easy
        ),
        Question(
            questionText: "SFTP transfers files securely by running over ___.",
            options: ["SSH (port 22)", "FTP (port 21)", "HTTPS (port 443)", "TFTP (port 69)"],
            correctIndex: 0,
            explanation: "SFTP (SSH File Transfer Protocol) is not FTP over SSL. It is a completely separate protocol that runs within an SSH session, inheriting SSH's encryption and authentication.",
            topic: .protocols,
            difficulty: .medium
        ),
        Question(
            questionText: "HTTPS secures web traffic by operating at the ___ layer of the OSI model.",
            options: ["Application (Layer 7)", "Transport (Layer 4)", "Session (Layer 5)", "Presentation (Layer 6)"],
            correctIndex: 0,
            explanation: "HTTPS is an Application layer protocol. The TLS encryption it uses actually spans the Presentation and Session layers, but as a user-facing protocol it is classified at Layer 7.",
            topic: .protocols,
            difficulty: .hard
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
