// lib/getSettings.ts
import { connectToDB } from "@/config/mongo";
import { Config } from '@/models/Config';
const getSettings = async () => {
    await connectToDB();

    // Get the latest settings document
    let settings = await Config.findOne().sort({ createdAt: -1 }).lean();

    // If no settings exist, create default ones
    if (!settings) {
        settings = await Config.create({
            companyName: "Dummy Company Name",
            companyEmail: "dummy@gmail.com",
            companyWhatsapp: "1234567890",
            companyAddress: "123, Dummy Street, Dummy City, Country",
        });
    }

    return settings;
};

export default getSettings;
