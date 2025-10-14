import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/asyncHandler';
import { connectToDB } from '@/config/mongo';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/models/User';
import { loginUserSchema } from '@/lib/validations/user.schema';
import { sendResponse } from '@/lib/sendResponse';
import { cookies } from 'next/headers';

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  // ✅ Joi validation
  const { error, value } = loginUserSchema.validate(body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.reduce((acc, curr) => {
      acc[curr.path[0] as string] = curr.message;
      return acc;
    }, {} as Record<string, string>);

    return sendResponse({
      success: false,
      statusCode: 400,
      message: 'Validation failed',
      data: errorMessages,
    });
  }

  const { email, password } = value;

  await connectToDB();

  // ⛔ Must include password field manually due to select: false
  const user = await User.findOne({ email }).select('+password');



  if (!user) {
    return sendResponse({
      success: false,
      statusCode: 401,
      message: 'User not found',
    });
  }
  if (!user.isActive) {
    return sendResponse({
      success: false,
      statusCode: 401,
      message: 'Unauthorized:Your Account is DeActived connect to Organization',
    });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return sendResponse({
      success: false,
      statusCode: 401,
      message: 'Invalid credentials',
    });
  }
  const permissions =
    user.role == "super admin"
      ? getSuperAdminPermissions()
      : user.role == "admin"
        ? getAdminPermissions()  // ✅ correct
        : user.role == "hr"
          ? getHrPermissions()
          : getUserPermission();


  // ✅ JWT creation
  const token = generateToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    avatar: user?.avatar || '',
    permissions,
  });

  // ✅ Permissions (can later be fetched from DB if needed)

  const response = NextResponse.json({
    success: true,
    message: 'Login successful',
    token,
    data: {
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      permissions,
    },
  });

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 1, // 1 days
  });

  return response;
});


export const GET = asyncHandler(async () => {
  const token = (await cookies()).get('admin_token')?.value;

  if (!token) {
    return sendResponse({
      success: false,
      statusCode: 401,
      message: 'Unauthorized. No admin token found.',
    });
  }

  let decodedToken: { id: string; email: string; role: string };

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as typeof decodedToken;
  } catch (error) {
    return sendResponse({
      success: false,
      statusCode: 401,
      message: 'Invalid or expired token',
    });
  }

  await connectToDB();

  const user = await User.findById(decodedToken.id);

  const permissions =
    user.role == "super admin"
      ? getSuperAdminPermissions()
      : user.role == "admin"
        ? getAdminPermissions()  // ✅ correct
        : user.role == "hr"
          ? getHrPermissions()
          : getUserPermission();
  return sendResponse({
    message: 'Admin info fetched successfully',
    token,
    data: user,
    permissions

  });
});

// 🔐 Generate JWT
const generateToken = (payload: object) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
};

// 📦 Admin role-based permission object
const getSuperAdminPermissions = () => [
  { module: 'User', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Account', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Setting', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Department', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Task', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Project', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'News', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Trl', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Event', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Gallery', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Docs & Links', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Dashboard', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Team', actions: ['create', 'read', 'update', 'delete'] },



];
const getHrPermissions = () => [
  { module: 'User', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Setting', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Department', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Task', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Project', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'News', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Trl', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Event', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Gallery', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Docs & Links', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Dashboard', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Team', actions: ['create', 'read', 'update', 'delete'] },



];
const getAdminPermissions = () => [

  { module: 'Task', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Project', actions: ['create', 'read', 'update', 'delete'] },
  { module: 'Dashboard', actions: ['create', 'read', 'update', 'delete'] },




];
const getUserPermission = () => [
  { module: 'Task', actions: ['create', 'read', 'update', 'delete'] },

]
