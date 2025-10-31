
import { timeStamp } from 'console';
import { boolean } from 'joi';
import mongoose, { Schema } from 'mongoose';

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

}, { timestamps: true });

// Optional: compound index for frequent filter + search
// userSchema.index({ name: 1, isActive: 1 });

export const User = mongoose.models.User || mongoose.model('User', userSchema);
