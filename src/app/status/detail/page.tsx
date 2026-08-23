'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StatusDetailPage() {
  const [modalType, setModalType] = useState<'details' | 'image' | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative pb-10">
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center space-x-4 shadow-sm mb-6">
        <Link href="/status" className="text-xl font-bold hover:opacity-75 transition-opacity">
          &lt;
        </Link>
        <h1 className="text-lg md:text-xl font-extrabold">ติดตามสถานะ</h1>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">ล่าสุด</h2>
          {!isCancelled ? (
            <div 
              onClick={() => setModalType('details')}
              className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-extrabold text-black">#AW1-01</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('คุณต้องการยกเลิกการแจ้งซ่อมนี้ใช่หรือไม่?')) {
                      setIsCancelled(true);
                    }
                  }}
                  className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow transition-transform active:scale-95"
                >
                  ยกเลิก
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-2">20/07/2026 10:00</p>
              <div className="text-sm text-black flex flex-col gap-1 mb-3">
                <p><strong>หมวดหมู่:</strong> ระบบน้ำ สายฉีดชำระเสีย ห้อง 2</p>
                <p><strong>สถานที่:</strong> ห้องน้ำหญิง ชั้น 1 โซน A</p>
              </div>
              <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2 rounded-xl border border-red-100">
                หมายเหตุ: อยู่ระหว่างปิดปรับปรุงพื้นที่ระบบใหญ่
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4 text-center text-gray-400 text-sm">
              ไม่มีรายการล่าสุด (ถูกยกเลิกแล้ว)
            </div>
          )}
        </div>

        <div>
          <h2 className="text-base font-extrabold text-black mb-3">ทั้งหมด</h2>
          <div className="bg-white border border-black/20 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-lg font-extrabold text-black">#AW1-01</span>
              <span className="bg-[#2E7D32] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">แจ้งแล้ว</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">20/07/2026 10:00</p>
            <div className="text-sm text-black flex flex-col gap-1">
              <p><strong>หมวดหมู่:</strong> ระบบน้ำ สายฉีดชำระเสีย ห้อง 2</p>
              <p><strong>สถานที่:</strong> ห้องน้ำหญิง ชั้น 1 โซน A</p>
            </div>
          </div>
        </div>
      </div>

      {modalType === 'details' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-4 relative">
            <button onClick={() => setModalType(null)} className="absolute top-5 right-5 text-black font-bold text-lg hover:opacity-75">✕</button>
            <h3 className="text-lg font-extrabold text-black mb-1">รายละเอียดการแจ้งซ่อม</h3>
            <div className="text-sm text-black flex flex-col gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p><strong>รหัสแจ้ง:</strong> #AW1-01</p>
              <p><strong>วันเวลาที่แจ้ง :</strong> 20/07/2026 10:00 น.</p>
              <p><strong>หมวดหมู่ :</strong> ระบบน้ำ สายฉีดชำระเสีย ห้อง 2</p>
              <p><strong>สถานที่ :</strong> ห้องน้ำหญิง ชั้น 1 โซน A</p>
              <p className="font-bold mt-2">รูปภาพที่แนบ</p>
              <div onClick={() => setModalType('image')} className="bg-white border border-black/30 rounded-xl px-3 py-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-between">
                <span>file_photo.png</span>
                <span className="text-[#6610A8] font-bold">🔍 ดูรูป</span>
              </div>
            </div>
            <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
              หมายเหตุ: อยู่ระหว่างปิดปรับปรุงพื้นที่ระบบใหญ่
            </p>
          </div>
        </div>
      )}

      {modalType === 'image' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative flex flex-col">
            <button onClick={() => setModalType('details')} className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 hover:bg-black">✕</button>
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center relative">
              <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" alt="Issue" className="w-full h-full object-cover" />
            </div>
            <div className="p-4 bg-white text-center text-xs text-gray-500 font-bold">รูปภาพปัญหาห้องน้ำที่แนบมา</div>
          </div>
        </div>
      )}
    </div>
  );
}