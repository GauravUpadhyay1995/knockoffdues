import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from '@/lib/validations/user.schema';
import { asyncHandler } from '@/lib/asyncHandler';
import { withAuth } from '@/lib/withAuth';
import { verifyAdmin } from '@/lib/verifyAdmin';
import { connectToDB } from '@/config/mongo';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

type CreateUserBody = {
    name: string;
    email: string;
    role: string;
    password: string;
    mobile: string;
    permissions?: {
        module: string;
        actions: string[];
    }[];
};

// Existing POST endpoint for single user creation
export const POST = (asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    const body = await req.json();
    const { error, value } = createUserSchema.validate(body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.reduce((acc, curr) => {
            acc[curr.path[0] as string] = curr.message;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(
            {
                success: false,
                message: 'Validation failed',
                errors: errorMessages,
                data: null,
            },
            { status: 400 }
        );
    }
    const creationResult = await createUser(body);

    return NextResponse.json({
        success: creationResult.success,
        message: creationResult.message,
        data: creationResult.data,
    },
        { status: creationResult.status });
}));

// New endpoint for bulk user upload
export const PUT = (asyncHandler(async (req: NextRequest) => {
    await connectToDB();

    try {
        console.log('Starting bulk user upload process...');
        const formData = await req.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            console.error('No file provided in request');
            return NextResponse.json(
                {
                    success: false,
                    message: 'No file provided',
                    data: null,
                },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
            console.error(`Invalid file format: ${file.name}`);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid file format. Please upload an Excel file (.xlsx, .xls) or CSV',
                    data: null,
                },
                { status: 400 }
            );
        }

        console.log(`Processing file: ${file.name}`);
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Process the file
        const result = await processBulkUsers(buffer, file.name);
        
        console.log(`Bulk upload completed. Successful: ${result.successful}, Failed: ${result.failed}, Total: ${result.total}`);
        return NextResponse.json({
            success: true,
            message: 'Bulk upload processed',
            data: result,
        });
        
    } catch (error) {
        console.error('Bulk upload error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to process bulk upload',
                data: null,
            },
            { status: 500 }
        );
    }
}));

// Process Excel/CSV file and insert users in chunks
async function processBulkUsers(buffer: Buffer, fileName: string) {
    console.log('Parsing file...');
    let workbook;
    
    try {
        if (fileName.endsWith('.csv')) {
            // Handle CSV files
            const csvData = buffer.toString('utf8');
            workbook = XLSX.read(csvData, { type: 'string' });
        } else {
            // Handle Excel files
            workbook = XLSX.read(buffer, { type: 'buffer' });
        }
    } catch (error) {
        console.error('Failed to parse file:', error);
        throw new Error('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
    }

    // Get first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Extract headers and validate
    if (data.length < 2) {
        console.error('File has insufficient data: less than 2 rows');
        throw new Error('File must contain at least a header row and one data row');
    }
    
    const headers = data[0] as string[];
    const requiredHeaders = ['name', 'email'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
        console.error(`Missing required headers: ${missingHeaders.join(', ')}`);
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
    
    console.log(`File parsed successfully. Total rows to process: ${data.length - 1}`);
    // Process data rows
    const rows = data.slice(1) as any[];
    const results = {
        total: rows.length,
        successful: 0,
        failed: 0,
        errors: [] as Array<{row: number, error: string}>,
        users: [] as any[]
    };
    
    // Process in chunks for better performance
    const CHUNK_SIZE = 10000; // Adjust based on your server capacity
    const chunks = [];
    
    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        chunks.push(rows.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`Processing in ${chunks.length} chunks of size ${CHUNK_SIZE}`);
    // Process each chunk
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        console.log(`Starting chunk ${chunkIndex + 1}/${chunks.length}`);
        const chunk = chunks[chunkIndex];
        const chunkPromises = [];
        
        for (let rowIndex = 0; rowIndex < chunk.length; rowIndex++) {
            const row = chunk[rowIndex];
            const rowData: any = {};
            
            // Map row data to headers
            headers.forEach((header, index) => {
                if (index < row.length) {
                    rowData[header.toLowerCase()] = row[index];
                }
            });
            
            // Process this row
            chunkPromises.push(processUserRow(rowData, chunkIndex * CHUNK_SIZE + rowIndex + 1));
        }
        
        // Wait for chunk to complete before processing next
        const chunkResults = await Promise.allSettled(chunkPromises);
        
        // Process results
        chunkResults.forEach((result, index) => {
            const globalIndex = chunkIndex * CHUNK_SIZE + index + 1;
            
            if (result.status === 'fulfilled' && result.value.success) {
                results.successful++;
                results.users.push(result.value.user);
                console.log(`Row ${globalIndex + 1}: User created successfully for email ${result.value.user.email}`);
            } else {
                results.failed++;
                const errorMsg = result.status === 'rejected' 
                    ? result.reason.message 
                    : result.value.error;
                results.errors.push({
                    row: globalIndex + 1, // +1 for header row
                    error: errorMsg || 'Unknown error'
                });
                console.error(`Row ${globalIndex + 1}: Error - ${errorMsg || 'Unknown error'}`);
            }
        });
        
        console.log(`Chunk ${chunkIndex + 1} completed. Successful in chunk: ${chunkResults.filter(r => r.status === 'fulfilled' && r.value.success).length}, Failed: ${chunkResults.length - chunkResults.filter(r => r.status === 'fulfilled' && r.value.success).length}`);
        // Small delay between chunks to prevent database overload
        if (chunkIndex < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return results;
}

// Process a single user row from the Excel file
async function processUserRow(rowData: any, rowNumber: number) {
    console.log(`Processing row ${rowNumber + 1}: Email - ${rowData.email || 'N/A'}`);
    try {
        // Validate required fields
        if (!rowData.name || !rowData.email) {
            throw new Error('Name and email are required');
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: rowData.email.toLowerCase().trim() },
                ...(rowData.mobile ? [{ mobile: rowData.mobile }] : [])
            ]
        });
        
        if (existingUser) {
            throw new Error('User already exists');
        }
        
        // Prepare user data
        const userData: any = {
            name: rowData.name.trim(),
            email: rowData.email.toLowerCase().trim(),
            role: (rowData.role || 'user').toLowerCase().trim(),
            mobile: rowData.mobile ? rowData.mobile.toString().trim() : '',
        
        };
        
        // Generate password if not provided
        const password = rowData.password || generateSecurePassword();
        userData.password = await bcrypt.hash(password, 10);
        
        // Create and save user
        const user = new User(userData);
        const savedUser = await user.save();
        
        // Convert to object and remove password
        const userObj = savedUser.toObject();
        delete userObj.password;
        
        return {
            success: true,
            user: userObj
        };
        
    } catch (error: any) {
        console.error(`Error processing row ${rowNumber + 1}: ${error.message}`);
        return {
            success: false,
            error: error.message || 'Failed to create user'
        };
    }
}

// Existing createUser function
export const createUser = async (body: CreateUserBody) => {
    try {
        const { name, email, role, password, mobile } = body;
        await connectToDB();
        console.log(`Creating single user: Email - ${email}`);
        const existingUser = await User.findOne({
            $or: [{ email }, { mobile }]
        });

        if (existingUser) {
            console.warn(`User already exists: Email - ${email}`);
            return {
                status: 409,
                success: false,
                message: 'User already exists',
                data: null
            };
        }

        const rawPassword = password || generateSecurePassword();
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            mobile,
        });

        const result = await user.save();
        const userObj = result.toObject();
        delete userObj.password;
        console.log(`Single user created successfully: Email - ${email}`);
        return {
            status: 200,
            success: true,
            message: 'User Registered',
            data: userObj
        };
    } catch (error: any) {
        console.error("User creation failed:", error);
        const formatted = formatMongooseError(error);
        return {
            status: 400,
            success: false,
            message: formatted.message,
            errors: formatted.errors,
            data: null
        };
    }
};

function generateSecurePassword(length = 12) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const specialChars = '!@#$%^&*';
    const password = Array.from({ length: length - 2 }, () =>
        chars[Math.floor(Math.random() * chars.length)]).join('');
    return password +
        specialChars[Math.floor(Math.random() * specialChars.length)] +
        chars[Math.floor(Math.random() * chars.length)];
}

function formatMongooseError(error: any) {
    // Basic implementation: extract message and errors from Mongoose error object
    return {
        message: error.message || 'An error occurred',
        errors: error.errors || {},
    };
}