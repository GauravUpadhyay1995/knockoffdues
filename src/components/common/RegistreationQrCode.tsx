"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QRGeneratorProps {
    type: "Register" | "Login"; // restrict to these two values
}

export default function QRGenerator({ type }: QRGeneratorProps) {
    const registrationUrl =
        type === "Register"
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/signup`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative">
                {/* QR Code */}
                <QRCodeCanvas
                    value={registrationUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H" // High error correction (so logo overlay won't break scanning)
                    includeMargin={true}
                />

                {/* Logo in the middle */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/images/logo/logo.png" // make sure your logo exists in /public/images/logo/logo.png
                        alt="Company Logo"
                        className="w-12 h-12 rounded-full bg-white p-1"
                    />
                </div>
            </div>

            <p className="mt-3 text-gray-800 font-semibold">KnockOff Dues</p>
            <small className="text-gray-900">Scan this QR code to {type}</small>
        </div>
    );
}
