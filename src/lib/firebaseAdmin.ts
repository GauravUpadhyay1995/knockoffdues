


// lib/firebaseAdmin.ts

import * as admin from "firebase-admin";

// Reuse Firebase Admin instance across hot reloads in Next.js
let firebaseAdminApp: admin.app.App | null = null;

export const getFirebaseAdmin = () => {
    if (!admin.apps.length) {
        // Securely load credentials from environment variables
        const serviceAccount = {
            projectId: "knockoffdues-new",
            clientEmail: "firebase-adminsdk-fbsvc@knockoffdues-new.iam.gserviceaccount.com",
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC68YXSgOGb75om\ntOSxBWrwB79kSJiNnqPWt5+qrjHSI9EnsUmfqMVl29uHw6QW6LBYLXn9Rkco4sVu\nYGhrzMfaL+Y1Vlv6IdEzC7QfiwqWlF2q17a8LGJFXZapOxCTsINAZUoUUHVjJqrx\n4CouV5MWCSOFlhiDWyfe1IC3opehLAtkJNTdoJZ5/y7Js2hHwwOohnfjyamWA9xF\n4mAugrRVHrGB1EQ2WZxb5ktAGx4WZxPJTKhPIB0UlknCs4jl3b+j+uJ2AthvWx48\nfjdK2NviHvB0M3Id2xZ/XRfzlmb5S4loG7hpJSGtwerc2SSOW00vLNEy8jhQCFin\n14XJIg9/AgMBAAECggEAE/wo+G7jGjaxreyjEXzznd3TgKbgJC0ESo/j0lfVUf1B\nPrM4cd3q3cT0wZ1RJ/UlO6//ksDWGlFalj5ZO25aI9cAuc1V1ODo9UI4Nd0OkI14\n5qrb9Amcpy9mTAjZRf4AnLxCAKJKAlkKZ67gDjHk3V4JvZ4Prc9AwmoeU+4JCWeL\nVy8gu5aBkrBi+H8kc5viYrMeTTW0fG5JB5std/K/zgWiZTicPjWogZLTjCIxIV83\nX//y0hwFy6PXcCIyBlmSYkovW/GAO1CzXlQQjaM7My5rR2/xnPF42Kaw2tL1kzsh\n6MK0sik7b9dTJeB9lD30pNhtJrZQe4Z5uv+D0f10bQKBgQDlIq6ISlpiPLXNAF5W\nRrU36xY8EOwRGtC6gF9PodauRq0gq0xfAsH2E/yiTWNIa5rH3UUK4xv8NNQ3THmg\n4gYveE59kLkFq/oYmedVuF/vl+pjsYGTPbUFsxVp1z2n+c99ywRGTMMSAbsRprCz\nccxz3K9KI2xR0lkbTDXciCn+dQKBgQDQ3HshpV7mEZlwkJOfDf6pqHJMULTdkN6p\nJbTEeF9flG9rR+yP7n6DzDP9EBrs7ZwLJ4Wmwv3Ht+zhjhG7Udyp/ZnbcUmZAFpw\nMEXRK7tdBc/IO79MBC3qxK9AGLxvVeLcleCBJtFQQ7v0o5mhPMc7rlK0Jq2Rmp56\nIsYHyWV/owKBgBBRLvKfsN4MCrpFi3JDaMZJpHS0k8sICNMvLxphoQMaH1wTNsYR\nUTSv6a65KhfPKd+Pv0nuMGD+dhpWBNdTITOiMpy4gKSJwa6czx+ImLRcMiHVUy/k\nFg8I2L6HyGk83ezMV0qWTtHqc6LnJvAwa2nYzlbOPPl6rEPIYpGI1My9AoGABh5v\nfQzbOuJJHIMf0AkY7N+Cebnjkpor68ivAxKDuMkgeoQg6haSnkndPAy8vTQ43hrK\nT5hm1vMMfY8r9dDwJgrH9yXagiEAhUjkwrwFQTRqYfNeJ1v3/GjGuZn/60MY4l2B\ntkbs2u0hFIm2doLRU25H/f8kFp/xBKMAKjo8PwECgYA+C7eB44HoqAhd623YSMei\n7q+HGlzaWver2wIRKjCNvLYJpxjtJO4tOUIw0o9Jy+d7IpaMQliMQvVrEGfWfU4U\n2LIdap6QYd6XSOsfw8CuaieLTMkWwhCrt2SiuV/DKjcQU59DK3oI2+TlNrnQ8Xy8\nrJn1SbjhGgfIfNjB5TQd5Q==\n-----END PRIVATE KEY-----\n",
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

