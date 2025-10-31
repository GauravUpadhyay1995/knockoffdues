import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import { verifyAdmin } from '@/lib/verifyAdmin';
import puppeteer from 'puppeteer';
import { uploadBufferToS3, deleteFromS3 } from '@/lib/uploadToS3';
import { updateLetterRecords } from '@/lib/updateLetterRecords'; // optional helper
import { User } from "@/models/User"; // assuming you store letter records in MongoDB

export const DELETE = verifyAdmin(
  asyncHandler(async (req: NextRequest, { params }) => {
    await connectToDB();

    const { id } = params; // this is letter._id
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Letter ID is required" },
        { status: 400 }
      );
    }

    // Find the user who has this letter
    const user = await User.findOne({ "letters._id": id });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Letter not found" },
        { status: 404 }
      );
    }

    // Get the specific letter object
    const letter = user.letters.id(id);
    console.log("Deleting letter:", letter);

    // Delete file from S3 if exists
    if (letter?.url) {
      await deleteFromS3(letter.url, "letters");
    }

    // Remove the letter from user's array
    user.letters = user.letters.filter(
      (l) => l._id.toString() !== id.toString()
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Letter deleted successfully",
    });
  })
);