


// lib/firebaseAdmin.ts

import * as admin from "firebase-admin";

// Reuse Firebase Admin instance across hot reloads in Next.js
let firebaseAdminApp: admin.app.App | null = null;

export const getFirebaseAdmin = () => {
    if (!admin.apps.length) {
        // Securely load credentials from environment variables
        const serviceAccount = {
            projectId:  "knockoff-d4404",
            clientEmail:"firebase-adminsdk-fbsvc@knockoff-d4404.iam.gserviceaccount.com",
            privateKey:"-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDBnami5bnZhr9c\n4/YJI22YNbtytkxfDdF3LvcjHhEH2kkMh1KvGTJNQH8rQPm+zwfVrvUOepcGSG5z\nttfZWqkUUullQoAP8Jyd8xnyaDj6c1H7XgM9fCmmzcsxjeypcXlLuIEyuVJ7qND4\nxsrUnG67r5d2+0hqsZj9HkA/Xu+bYvVmxokZgPgVKUq/ZkBkzxSh1WuGjYX/CHFl\nTRGGfj/XG7QLsrmTB+EMCw+n3AyG6ICQb5yIbETLc7RGzryRpUbznlB0PP5Uo0y1\n7kfkVwBgA2L99zqSejeHUWvVtICu/XT1+SVvSJ1xVvHJQCP7DhheClpV3D2FiAMR\ngT8sXx/HAgMBAAECgf8xiaVdiGmEvnU3zxukOuxPhW/wabQgneh6FgolcgvpdnA6\nRGVjZ473NQlUh8tehpn6kkkg6zy43s9jy+RuOEQKbyxIPDuH2Ig54XlCDGiHq/nN\n1r/9e0cs5nqWszlaIS5nsU1dLQ1tlkPhYvuCaoPqgYK/bouYwNfj61mE3UVw++5i\nHYM4b0BLuHrh51GqFs9JZI7715ZyNlMNVScM16RPs2draP3uBaJac5jcur9sUArt\nvgtvTxAuTeJiAfDbMY/9yRB226xIi0HUHt7ZENJVefFOdf0Lz7vXXLsu6Ur6lfty\nhLpQSC5FbeMIs4NGLxMbhHp0tN7MUztr20Etd3UCgYEA9GGSECDPfODP/t9ybfqU\nQPYMhlGOsqrtlve9nwsQgpA6E76O8QGG/7D6dlkyun4JhJOXY8q9Q+S17dvnoLO+\nEzxfunr9Hdf+aMCrwG+5bWHh8aXHRjsXNNC0WQdItzwW56Xgpi9fNvslMCBA5iW1\nkVfoI0sVPnw1+5FJo+BqXnMCgYEAytI21XX38YKghhkUQYnbLBhtpye0SWht04hO\nKK5B/x51TcEp/fUc91bSQhifHqEP+RcW3DOCEJM6lskgeD8Wa6oo30HbrR/y5mkJ\nFEfrFFy4yiHY0SNnx32REKykjUxKXkhGtp+hHfLVSpkE69pwkZw/MUiW0hJT3X/e\n+utV8F0CgYAoHoiDG0/U2XdsCTTY90U1cO9XcbYygLsmiJ9Zp9BbDuBp82O2DyEh\nguVrXnNkiGJ5oF0/Jb5yke6IEQzype9zavrwO1aoepgqjE7l9bGEUohsSmHvlq3V\nntmsr/RxGG1OND4wKiDAfvR49SKSZehr5vmWKbJgIrYeCZkETUhJHwKBgFiEKf47\nP/ydH+WmaFq6CXdTKff7sgkflF7va/0BIDhxWIyYsvTs1rlzoMvL5xX9APWbCBUO\nPcNyHe3U1WDlV6mhV7koCvGhseaxDI9XW9dFKDi/UNrlctNzj64RSreIBiTjskjd\nnfluE3w9EBLHAL3rzQB7R6di7EsNFYm4z4bZAoGBAMySapaBRD31eWwmgCB9tn+A\n7sWzTYpG2a5aRR+TYXW+Og3gKME0LB/7TC/Vji+2dWkaVuqTstnhGqdzzcqTYLBr\nj6ZALQd2fUSknSjlq1JKZXrqT4oeRsrBcHGALFtasraqKThNlVQzsC930hYy2ZPN\nhsyO8iPMeGQ8Qxa18cHV\n-----END PRIVATE KEY-----\n".replace(/\\n/g, "\n"),
        };

             firebaseAdminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL, // ❗ SERVER-SIDE DB URL
        });

    } else {
        firebaseAdminApp = admin.app(); // Reuse existing instance
    }

    return {
        app: firebaseAdminApp,
        db: admin.database(),
    };
};

