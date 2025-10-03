// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { asyncHandler } from "@/lib/asyncHandler";
import { connectToDB } from "@/config/mongo";
import { Config } from "@/models/Config";
import { uploadBufferToS3 } from "@/lib/uploadToS3";
import { verifyAdmin } from "@/lib/verifyAdmin";

export const PATCH = verifyAdmin(
    asyncHandler(async (req: NextRequest) => {
        await connectToDB();
        const user = (req as any).user;

        // Parse multipart/form-data
        const formData = await req.formData();

        // Get files
        const logo = formData.get("comapnyLogo") as File | null;
        const favicon = formData.get("comapnyFavicon") as File | null;

        // Extract other fields (exclude files)
        const rawBody = Object.fromEntries(
            [...formData.entries()].filter(
                ([key]) => key !== "comapnyLogo" && key !== "comapnyFavicon"
            )
        );

        // Upload logo to S3
        let logoUrl: string | undefined;
        if (logo && logo.size > 0) {
            const buffer = Buffer.from(await logo.arrayBuffer());
            const uploadResult = await uploadBufferToS3(
                buffer,
                logo.type,
                logo.name,
                "settings"
            );
            logoUrl = uploadResult?.url;
        }

        // Upload favicon to S3
        let faviconUrl: string | undefined;
        if (favicon && favicon.size > 0) {
            const buffer = Buffer.from(await favicon.arrayBuffer());
            const uploadResult = await uploadBufferToS3(
                buffer,
                favicon.type,
                favicon.name,
                "settings"
            );
            faviconUrl = uploadResult?.url;
        }

        // Prepare settings data - FIXED: Correct field names according to schema
        const settingsData: any = {
            comanyName: rawBody.comanyName,
            companyEmail: rawBody.companyEmail || undefined,
            companyWhatsapp: rawBody.companyWhatsapp || undefined,
            creator: user.id,
        };

        // Only add logo/favicon if they were uploaded - FIXED: Correct field names
        if (logoUrl) {
            settingsData.comapnyLogo = logoUrl;
        }
        if (faviconUrl) {
            settingsData.comapnyFavicon = faviconUrl;
        }

        // FIXED: Use findOneAndUpdate for settings (usually only one settings document)
        const existingSetting = await Config.findOne();

        let updatedSetting;
        if (existingSetting) {
            updatedSetting = await Config.findOneAndUpdate(
                { _id: existingSetting._id },
                settingsData,
                { new: true, runValidators: true }
            );
        } else {
            // Create new settings if none exist
            updatedSetting = await Config.create(settingsData);
        }

        return NextResponse.json({
            success: true,
            message: "Settings updated successfully",
            data: updatedSetting,
        });
    })
);

// FIXED: GET route for settings
export const GET = asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    // For settings, we usually want just one document
    const settings = await Config.findOne().sort({ createdAt: -1 }).lean();

    // If no settings exist, create default ones
    if (!settings) {
        const defaultSettings = await Config.create({

            comanyName: "Dummy Company Name",
            companyEmail: "dummy@gmail.com"
        });
        return NextResponse.json({
            success: true,
            data: defaultSettings,
        });
    }

    return NextResponse.json({
        success: true,
        data: settings,
    });
});