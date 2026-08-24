"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-2xl font-semibold text-center text-gray-800">
                    ลืมรหัสผ่าน
                </h1>
                <p className="mt-2 text-center text-gray-500 text-sm">
                    กรุณากรอกอีเมลของคุณเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน
                </p>

                <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            อีเมล
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="example@up.ac.th"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 transition"
                    >
                        ส่งคำขอรีเซ็ตรหัสผ่าน
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/Admin/Login"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        กลับไปยังหน้าเข้าสู่ระบบ
                    </Link>
                </div>
            </div>
        </main>
    );
}
