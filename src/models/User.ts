
import { timeStamp } from 'console';
import { boolean } from 'joi';
import mongoose, { Schema } from 'mongoose';
import crypto from "crypto";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true, // ✅ Add index
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    index: true,

  },
  jod: {
    type: String,

  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true, // ✅ Unique index
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true, // ✅ Index for filtering active users
    comment: "Tracks if the user has logged into the platform",
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true, // ✅ Index for filtering active users
    comment: "Tracks if the user verified into the platform",
  },

  avatar: {
    type: String,
    required: false,
  },
  resume: {
    type: String,
    required: true,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  forgotPasswordToken: {
    type: String,
  },
  forgotPasswordExpiry: {
    type: Date,
  },
  refreshToken: {
    type: String,
  },
  refreshTokenExpiry: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },

  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    default: "68c010a2724b71204da764cf", // ✅ auto-assign default dept
  },

  permanentAddress: {
    type: String,
  },
  currentAddress: {
    type: String,
  },
  dateOfBirth: {

    type: String,
  },
  position: {
    type: String,
  },
  maritalStatus: {
    type: String,
    enum: ["Single", "Married", "Divorced", "Widowed"],
  },
  referenceName: {
    type: String,
  },
  hasPreviousInterview: {
    type: Boolean,
    default: false,
  },
  isDifferentlyAbled: {
    type: Boolean,
    default: false,
  },
  hasPoliceRecord: {
    type: Boolean,
    default: false,
  },
  hasMajorIllness: {
    type: Boolean,
    default: false,
  },
  totalExperience: {
    type: Number,
  },
  currentSalary: {
    type: Number,
  },
  expectedSalary: {
    type: Number,
  },
  noticePeriodInDays: {
    type: Number,
    default: 0,
  },
  careerGap: {
    type: String,
  },
  spouseName: {
    type: String,
  },
  fatherName: {
    type: String,
  },
  motherName: {
    type: String,
  },
  numberOfSiblings: {
    type: Number,
    default: 0,
  },
  guardianContact: {
    type: String,
  },
  recruiterName: {
    type: String,
  },
  recruiterComment: {
    type: String,
  },
  academics: [
    {
      className: {
        type: String,
        lowercase: true,
        trim: true,
      },
      university: {
        type: String,
        lowercase: true,
        trim: true,
      },
      isRegular: {
        type: Boolean,
        default: false,
      },
      passingYear: {
        type: Number,
      },
      percentage: {
        type: Number,
      },
      documentUrl: {
        type: String,
      },
      isApproved: {
        type: String,
        default: "pending"
      }
    },
  ],
  workExperience: [
    {
      designation: {
        type: String,
        trim: true,
        lowercase: true,
      },
      companyName: {
        type: String,
        trim: true,
        lowercase: true,
      },
      joiningDate: {
        type: String,
      },
      relievingDate: {
        type: String,
      },
    },
  ],
  documents: [
    {
      documentName: {
        type: String,
        trim: true,
        lowercase: true,
      },

      documentUrl: {
        type: String,
      },
      isApproved: {
        type: String,
        default: "pending"
      }
    },
  ],

  letters: [
    {
      letterType: {
        type: String,
        enum: ["joining", "experience", "promotion", "termination"], // example
        required: true,
      },
      url: {
        type: String,
        default: "",
      },
      isSent: {
        type: Boolean,
        default: false,
      },
      issueDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },

  emailVerificationLink: {
    type: String,
    default: null,

  },
  emailVerificationLinkExpiry: {
    type: Date,
    default: null,
  },
  emp_id: { type: String, unique: true }, // auto-generated

}, { timestamps: true });

// --- Pre-save hook to auto-generate emp_id ---
// userSchema.pre("save", async function (next) {
//   if (this.emp_id) return next(); // already has one → skip

//   const User = mongoose.model("User", userSchema);

//   // Get latest user (sort by emp_id descending)
//   const lastUser = await User.findOne().sort({ createdAt: -1 });

//   let newIdNum = 1;
//   if (lastUser && lastUser.emp_id) {
//     const lastNum = parseInt(lastUser.emp_id.replace("TBM", ""), 10);
//     newIdNum = lastNum + 1;
//   }

//   this.emp_id = `TBM${String(newIdNum).padStart(4, "0")}`;
//   next();
// });


userSchema.pre("save", async function (next) {
  // If emp_id exists, skip generating it again
  if (!this.emp_id) {
    const User = mongoose.model("User", userSchema);

    // Get last saved user
    const lastUser = await User.findOne().sort({ createdAt: -1 });

    let newIdNum = 1;
    if (lastUser && lastUser.emp_id) {
      const lastNum = parseInt(lastUser.emp_id.replace("TBM", ""), 10);
      newIdNum = lastNum + 1;
    }

    this.emp_id = `TBM${String(newIdNum).padStart(4, "0")}`;
  }

  // ================================
  // 📧 Email Verification Link & Expiry
  // ================================
  if (!this.emailVerificationLink) {
    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");

    // Store token (you will append domain while sending mail)
    this.emailVerificationLink = token;

    // Set expiry (for example: valid for 24 hours)
    this.emailVerificationLinkExpiry = Date.now() + 1 * 60 * 1000;
  }

  next();
});


// Optional: compound index for frequent filter + search
// userSchema.index({ name: 1, isActive: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
