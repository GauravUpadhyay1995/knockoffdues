"use client";

import { QRCodeCanvas } from "qrcode.react";

interface QRGeneratorProps {
    type: "Register" | "Login";
}

export default function QRGenerator({ type }: QRGeneratorProps) {
    const registrationUrl =
        type === "Register"
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/signup`
            : `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

    const handleDownload = () => {
        const canvas = document.querySelector<HTMLCanvasElement>("canvas");
        if (!canvas) return;

        // Create a larger canvas to include text below QR code
        const combinedCanvas = document.createElement("canvas");
        const ctx = combinedCanvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions: QR code size + space for text
        const qrSize = canvas.width;
        const textHeight = 40; // Space for text
        const padding = 20; // Additional padding
        combinedCanvas.width = qrSize + padding * 2;
        combinedCanvas.height = qrSize + textHeight + padding * 2;

        // Fill background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

        // Draw QR code centered
        ctx.drawImage(canvas, padding, padding, qrSize, qrSize);

        // Draw rounded logo in the center of QR code
        const logoSize = 40;
        const centerX = padding + qrSize / 2 - logoSize / 2;
        const centerY = padding + qrSize / 2 - logoSize / 2;

        const logo = new Image();
        logo.crossOrigin = "anonymous"; // Important for loading images
        logo.src = "/images/logo/logo.png";
        
        logo.onload = () => {
            // Create a temporary canvas for rounded logo
            const logoCanvas = document.createElement("canvas");
            const logoCtx = logoCanvas.getContext("2d");
            if (!logoCtx) return;

            logoCanvas.width = logoSize;
            logoCanvas.height = logoSize;

            // Create circular clipping path for rounded logo
            logoCtx.beginPath();
            logoCtx.arc(logoSize / 2, logoSize / 2, logoSize / 2, 0, Math.PI * 2);
            logoCtx.closePath();
            logoCtx.clip();

            // Draw logo on rounded canvas
            logoCtx.drawImage(logo, 0, 0, logoSize, logoSize);

            // Draw white background for logo (slightly larger than logo)
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(centerX + logoSize/2, centerY + logoSize/2, logoSize/2 + 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw rounded logo onto main canvas
            ctx.drawImage(logoCanvas, centerX, centerY);

            // Draw text below QR code
            ctx.fillStyle = "#000000";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            const text = `Scan to ${type}`;
            const textY = padding + qrSize + 10;
            const textX = combinedCanvas.width / 2;
            
            ctx.fillText(text, textX, textY);

            // Download the combined image
            const pngUrl = combinedCanvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");

            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `qr-${type.toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Handle logo loading error
        logo.onerror = () => {
            console.error("Logo failed to load");
            // If logo fails to load, still draw the text
            ctx.fillStyle = "#000000";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            
            const text = `Scan to ${type}`;
            const textY = padding + qrSize + 10;
            const textX = combinedCanvas.width / 2;
            
            ctx.fillText(text, textX, textY);

            // Download the combined image
            const pngUrl = combinedCanvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");

            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `qr-${type.toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    };

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative">
                {/* QR Code */}
                <QRCodeCanvas
                    value={registrationUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                />

                {/* Logo in the middle */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/images/logo/logo.png"
                        alt="Company Logo"
                        className="w-12 h-12 rounded-full bg-white p-1"
                    />
                </div>
            </div>

            <p className="mt-3 text-gray-800 font-semibold">KnockOff Dues</p>
            <small className="text-gray-900 dark:text-gray-300">Scan this QR code to {type}</small>
            <button
                onClick={handleDownload}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 transition"
            >
                Download QR
            </button>
        </div>
    );
}