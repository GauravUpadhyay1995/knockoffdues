import { connectToDB } from '@/config/mongo';
import { User } from '@/models/User';
import { createNotification } from "@/lib/createNotification";
export async function updateLetterRecords(userId: string, s3Url: string, letterType: string, admin: any) {
    await connectToDB();

    // Example 1: Update user record
    let result = await User.findOneAndUpdate(
        { _id: userId, "letters.letterType": letterType },
        {
            $set: {
                "letters.$.url": s3Url,
                "letters.$.issueDate": new Date(),
            },
        },
        { new: true }
    );

    if (!result) {
        result = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    letters: {
                        letterType,
                        url: s3Url,
                        issueDate: new Date(),
                    },
                },
            },
            { new: true }
        );
    }



    let title = "";
    let description = "";
    if (letterType === "joining") {
        title = "Joining Letter Issued";
        description = "Your joining letter has been issued. Please check your documents section.";
    } else if (letterType === "experience") {
        title = "Experience Letter Issued";
        description = "Your experience letter has been issued. Please check your documents section.";
    }


    const notificationPromise = createNotification({
        notificationType: "Other",
        title: `Document Issued: ${title}`,
        descriptions: `${description}`,
        docs: [],
        createdBy: admin.id,
        userId: [userId]
    });

    console.log(`✅ Background updates done for ${result}`);
}
