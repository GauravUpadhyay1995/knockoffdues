"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from 'next/navigation';

export default function EmailVerificationPage() {
    const params = useParams();
    const token = params.token as string;

    const router = useRouter();


    const [status, setStatus] = useState<"loading" | "success" | "expired" | "invalid" | "missing">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("missing");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/v1/admin/email/verify-email/${token}`, {
                    method: "GET",
                });

                const data = await res.json();

                if (data.success) {

                    setStatus("success");

                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push("/login");
                    }, 3000);
                } else {
                    // Backend distinguishes between expired & invalid tokens by message
                    if (data.message?.includes("expired")) setStatus("expired");
                    else setStatus("invalid");
                }
            } catch (err) {
                setStatus("invalid");
            }
        };

        verify();
    }, [token, router]);

      const reSend = async () => {
            try {
                const res = await fetch(`/api/v1/admin/email/new-verification-email`, {
                    method: "POST",
                    body: JSON.stringify({ token }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = await res.json();

                if (data.success) {

                    setStatus("success");

                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push("/login");
                    }, 3000);
                } else {
                    // Backend distinguishes between expired & invalid tokens by message
                    if (data.message?.includes("expired")) setStatus("expired");
                    else setStatus("invalid");
                }
            } catch (err) {
                setStatus("invalid");
            }
        };

    // 🔥 Animations
    const fadeIn = "animate-[fadeIn_0.6s_ease-in-out]";
    const bounce = "animate-[bounce_1.5s_infinite]";
    const pulse = "animate-pulse";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md text-center">

                {status === "loading" && (
                    <div className={fadeIn}>
                        <div className={`w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-5 ${pulse}`} />
                        <h2 className="text-xl font-semibold text-gray-700">Verifying your email...</h2>
                        <p className="text-gray-500 mt-2">Please wait a moment</p>
                    </div>
                )}

                {status === "success" && (
                    <div className={fadeIn}>
                        <div className="text-green-600 text-6xl mb-4">✔</div>
                        <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
                        <p className="text-gray-500 mt-2">Redirecting you to login...</p>
                    </div>
                )}

                {status === "expired" && (
                    <div className={fadeIn}>
                        <div className={`text-yellow-500 text-6xl mb-4 ${bounce}`}>⏳</div>
                        <h2 className="text-2xl font-bold text-yellow-600">Link Expired</h2>
                        <p className="text-gray-500 mt-2">
                            Your verification link has expired. Please request a new one.
                        </p>
                    </div>
                )}

                {status === "invalid" && (
                    <div className={fadeIn}>
                        <div className="text-red-500 text-6xl mb-4">✖</div>
                        <h2 className="text-2xl font-bold text-red-600">Invalid or Broken Link</h2>
                        <p className="text-gray-500 mt-2">
                            The link seems to be incorrect. Please try again.
                        </p>
                    </div>
                )}

                {status === "missing" && (
                    <div className={fadeIn}>
                        <div className="text-red-500 text-6xl mb-4">❓</div>
                        <h2 className="text-2xl font-bold text-red-600">Token Missing</h2>
                        <p className="text-gray-500 mt-2">
                            No verification token found in URL.
                        </p>
                    </div>
                )}

                {/* 🔁 Resend Verification Button */}
                {(status === "invalid" || status === "expired" || status === "missing") && (
                    <button
                        onClick={() =>reSend()}
                        className="mt-6 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                        Resend Verification Email
                    </button>
                )}
            </div>
        </div>
    );
}
