import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        // 💡 กำหนดอีเมลและรหัสผ่านสำหรับทดสอบเข้าสู่ระบบ
        const MOCK_USER = "admin@up.ac.th";
        const MOCK_PASS = "123456";

        if (username === MOCK_USER && password === MOCK_PASS) {
            return NextResponse.json(
                {
                    token: "mock-jwt-token-xyz123",
                    message: "เข้าสู่ระบบสำเร็จ",
                },
                { status: 200 } 
            );
        }

        // กรณีรหัสผ่านหรืออีเมลไม่ถูกต้อง
        return NextResponse.json(
            { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" },
            { status: 500 }
        );
    }
}