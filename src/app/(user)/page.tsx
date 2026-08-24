'use client';

import { useEffect, useState } from 'react';
import liff from '@line/liff';
import Link from 'next/link';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) {
        console.warn('LIFF Init Skipped: NEXT_PUBLIC_LIFF_ID is not set in Environment Variables');
        setIsReady(true);
        return;
      }

      try {
        await liff.init({ liffId });
        setIsReady(true);
        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          setProfile(userProfile);
        } else {
          liff.login();
        }
      } catch (error) {
        console.error('LIFF Init Error:', error);
        setIsReady(true);
      }
    };
    initLiff();
  }, []);

  if (!isReady) return <div className="min-h-screen flex items-center justify-center bg-[#FDF9FF]">กำลังโหลดระบบ...</div>;

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans">
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col flex-1">
        
        {/* Header */}
        <header className="bg-gradient-to-r from-[#8A2BE2] to-[#6610A8] text-white p-4 md:p-6 rounded-2xl shadow-md flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 flex items-center justify-center">
              <img src="/photo/LogoICT.png" alt="Logo ICT" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-bold">ICT Restroom Maintenance System</h1>
              <p className="text-xs md:text-sm text-purple-200">แจ้งซ่อม - ติดตามสถานะห้องน้ำคณะ ICT</p>
            </div>
          </div>
        </header>

       {/* การ์ดทักทาย */}
       <div className="bg-white border-[2px] border-[#6610A8] rounded-2xl p-4 md:p-6 shadow-sm flex items-center space-x-4 mb-6">
          <div className="w-5 h-5 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
            <img src="/photo/Hello.png" alt="Hello Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-black">สวัสดี, {profile?.displayName || 'ผู้ใช้งาน'}</h2>
            <p className="text-xs md:text-sm text-gray-500">พบปัญหาห้องน้ำ? แจ้งได้ใน 3 ขั้นตอน</p>
          </div>
        </div>

        {/* เมนู 3 ปุ่ม */}
        <div className="flex flex-col flex-1 justify-end">
          <div 
            className={`grid transition-all duration-500 ease-in-out ${
              isMenuOpen ? "grid-rows-[1fr] opacity-100 mb-4" : "grid-rows-[0fr] opacity-0 mb-0"
            }`}
          >
            <div className="overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              
              {/* ปุ่มที่ 1: แจ้งปัญหา */}
              <Link href="/report" className="w-full flex">
                <button className="w-full border-[2px] border-[#6610A8] rounded-2xl p-5 bg-white shadow-sm flex flex-col items-start text-left active:scale-95 transition-transform hover:bg-purple-50 justify-between h-full">
                  <div>
                    <span className="text-3xl mb-3 block">⚠️</span>
                    <h3 className="text-lg md:text-xl font-extrabold text-black">แจ้งปัญหา</h3>
                    <p className="text-xs text-gray-500 mt-1">พบปัญหาห้องน้ำ? แจ้งได้ใน 3 ขั้นตอน</p>
                  </div>
                  <span className="text-xs font-bold text-[#6610A8] mt-4 flex items-center">คลิกเพื่อแจ้งซ่อม &rarr;</span>
                </button>
              </Link>

              {/* ปุ่มที่ 2: ติดตามสถานะ */}
              <Link href="/status" className="w-full flex">
                <button className="w-full border-[2px] border-[#6610A8] rounded-2xl p-5 bg-white shadow-sm flex flex-col items-start text-left relative active:scale-95 transition-transform hover:bg-purple-50 justify-between h-full">
                  <div>
                    <span className="text-3xl mb-3 block">📋</span>
                    <h3 className="text-lg md:text-xl font-extrabold text-black">ติดตามสถานะ</h3>
                    <p className="text-xs text-gray-500 mt-1">ตรวจสอบสถานะการซ่อมแบบเรียลไทม์</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-[#E00000] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow">1</div>
                  <span className="text-xs font-bold text-[#6610A8] mt-4">1 เรื่องกำลังดำเนินการ &rarr;</span>
                </button>
              </Link>

              {/* ปุ่มที่ 3: อัปเดตลิงก์เป็น /ICT-restroom-status ตรงกับชื่อโฟลเดอร์ใหม่ */}
              <Link href="/ICT-restroom-status" className="w-full flex">
                <button className="w-full border-[2px] border-[#6610A8] rounded-2xl p-5 bg-white shadow-sm flex flex-col items-start text-left active:scale-95 transition-transform hover:bg-purple-50 justify-between h-full">
                  <div>
                    <div className="w-10 h-10 rounded-xl overflow-hidden mb-3 flex items-center justify-center">
                      <img src="/photo/icon ICT rest.png" alt="App Logo" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-lg md:text-xl font-extrabold text-black">สถานะห้องน้ำทั้งหมดในคณะ</h3>
                    <p className="text-xs text-gray-500 mt-1">ดูตามอาคาร/ชั้น แบบเรียลไทม์</p>
                  </div>
                  <span className="text-xs font-bold text-[#6610A8] mt-4">ตรวจสอบตึกทั้งหมด &rarr;</span>
                </button>
              </Link>

            </div>
          </div>

          <div 
            className="bg-[#E4C5F9] p-3 text-center cursor-pointer flex justify-center items-center gap-2 rounded-xl shadow-sm hover:bg-[#d8b0f7] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="text-sm font-extrabold text-gray-900">เมนู</span>
            <span className="text-xs text-gray-900 font-bold">{isMenuOpen ? '▼' : '▲'}</span>
          </div>
        </div>

        <footer className="text-center text-xs text-gray-400 mt-6 pb-4">
          ICT Restroom Maintenance System © 2026
        </footer>
      </div>
    </div>
  );
}