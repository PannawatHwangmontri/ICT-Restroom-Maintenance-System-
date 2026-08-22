import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ตัวแปรจำลองการเก็บ Active Session และ OTP (ในใช้งานจริงควรเก็บใน Database / Redis)
let activeSessionToken: string | null = null;
let lastActiveTime: number | null = null;
let currentOTP: string | null = null;
let otpExpireTIme: number | null = null;

const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const ALLOWED_ADMIN_EMAIL = ' '; // อีเมลเดียวที่อนุญาตในระบบ

// ตั้งค่า ตัวส่งอีเมล (Nodemailer  Transporter) 
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true สำหรับ port 465, false สำหรับ port อื่นๆ
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, email, password, newPassword, otp, token } = body;

        // ==========================================
        // 1. ACTION: LOGIN
        // ==========================================
        if (action === 'login') {
            const currentTime = Date.now();

            if (email !== ALLOWED_ADMIN_EMAIL) {
                return NextResponse.json(
                    { success: false, message: 'บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบ' },
                    { status: 403 }
                );
            }

            const isSessionActive =
                activeSessionToken !== null &&
                lastActiveTime !== null &&
                (currentTime - lastActiveTime < SESSION_TIMEOUT_MS);

            if (isSessionActive) {
                return NextResponse.json(
                    { success: false, message: 'ขณะนี้มีผู้ใช้งานอื่นกำลังอยู่ในระบบ' },
                    { status: 409 }
                );
            }

            if (password !== 'admin1234') {
                return NextResponse.json(
                    { success: false, message: 'รหัสผ่านไม่ถูกต้อง' },
                    { status: 401 }
                );
            }

            const newToken = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            activeSessionToken = newToken;
            lastActiveTime = Date.now();

            return NextResponse.json({
                success: true,
                message: 'เข้าสู่ระบบสำเร็จ',
                token: newToken,
            });
        }

        // ==========================================
        // 2. ACTION: FORGOT-PASSWORD (ส่ง OTP เข้าอีเมลจริง)
        // ==========================================
        if (action === 'forgot-password') {
            if (!email || typeof email !== 'string') {
                return NextResponse.json({ success: false, message: 'กรุณากรอกอีเมล' }, { status: 400 });
            }

            // ตรวจสอบว่าใช้อีเมลเดียวที่ลงทะเบียนไว้ในระบบหรือไม่
            if (email.trim().toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
                return NextResponse.json(
                    { success: false, message: 'ไม่พบอีเมลนี้ในระบบ' },
                    { status: 404 }
                );
            }

            // สุ่มรหัส OTP 6 หลัก
            const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
            currentOTP = generatedOTP;
            otpExpireTIme = Date.now() + 5 * 60 * 1000; // หมดอายุใน 5 นาที

            try {
                // ส่งอีเมลจริงไปยังผู้ใช้ 
                await transporter.sendMail({
                    from: `"ICT Restroom System" <${process.env.SMTP_USER}>`,
                    to: email.trim(),
                    subject: 'รหัสยืนยันการตั้งรหัสผ่านใหม่ (OTP)',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>รีเซ็ตรหัสผ่าน ICT Restroom System</h2>
                            <p>รหัสยืนยัน OTP สำหรับตั้งรหัสผ่านใหม่ของคุณคือ:</p>
                            <h1 style="color: #0067b8; letter-spacing: 4px;">${generatedOTP}</h1>
                            <p>รหัสนี้จะหมดอายุภายใน 5 นาที</p>
                        </div>
                    `,
                });

                return NextResponse.json({
                    success: true,
                    message: 'ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว',
                });
            } catch (mailError) {
                console.error('Email Send Error:', mailError);
                return NextResponse.json(
                    { success: false, message: 'ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบการตั้งค่า SMTP ใน .env' },
                    { status: 500 }
                );
            }
        }

        // ==========================================
        // 3. ACTION: RESET-PASSWORD (ตรวจสอบ OTP & ตั้งรหัสใหม่)
        // ==========================================
        if (action === 'reset-password') {
            if (!otp || otp !== currentOTP) { 
                return NextResponse.json(
                    { success: false, message: 'รหัส OTP ไม่ถูกต้อง' },
                    { status: 400 }
                );
            }

            if (otpExpireTIme && Date.now() > otpExpireTIme) {
                return NextResponse.json(
                    { success: false, message: 'รหัส OTP หมดอายุแล้ว กรุณาขอใหม่' },
                    { status: 400 }
                );
            }

            if (!newPassword || newPassword.length < 6) {
                return NextResponse.json(
                    { success: false, message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
                    { status: 400 }
                );
            }

            // รีเซ็ตค่า OTP หลังใช้งานสำเร็จ
            currentOTP = null;
            otpExpireTIme = null;

            return NextResponse.json({
                success: true,
                message: 'ตั้งรหัสผ่านใหม่สำเร็จ',
            });
        }

        // ==========================================
        // 4. ACTION: LOGOUT
        // ==========================================
        if (action === 'logout') {
            activeSessionToken = null;
            lastActiveTime = null;

            return NextResponse.json({ success: true, message: 'ออกจากระบบเรียบร้อยแล้ว' });
        }

        return NextResponse.json({ success: false, message: 'Action ไม่ถูกต้อง' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 });
    }
}

