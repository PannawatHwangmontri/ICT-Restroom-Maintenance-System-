'use client';

import { useState } from 'react';

interface TicketData {
  id: string;
  date: string;
  category: string;
  location: string;
  note?: string;
  status: 'pending' | 'received' | 'cancelled';
}

export default function StatusPage() {
  const [modalType, setModalType] = useState<'details' | 'image' | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([
    {
      id: '#AW1-01',
      date: '20/07/2026 10:00',
      category: 'ระบบน้ำ สายฉีดชำระเสีย ห้อง 2',
      location: 'ห้องน้ำหญิง ชั้น 1 โซน A',
      note: 'อยู่ระหว่างปิดปรับปรุงพื้นที่ระบบใหญ่',
      status: 'received'
    },
    {
      id: '#EL2-05',
      date: '18/07/2026 14:30',
      category: 'ไฟฟ้า หลอดไฟขาด ห้อง 1',
      location: 'ห้องน้ำชาย ชั้น 2 โซน B',
      status: 'pending'
    }
  ]);
  
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative pb-10">
      
      {/* --- Header ด้านบน --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center space-x-4 shadow-sm mb-6">
        <h1 className="text-lg md:text-xl font-extrabold">ติดตามสถานะ</h1>
      </div>

      {/* --- เนื้อหาหลัก --- */}
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        
        {/* --- ส่วนที่ 1: ล่าสุด --- */}
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">ล่าสุด</h2>

          {tickets.length > 0 && tickets[0].status !== 'cancelled' ? (
            <div 
              onClick={() => {
                setSelectedTicket(tickets[0]);
                setModalType('details');
              }}
              className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-lg font-extrabold text-black">{tickets[0].id}</span>
                <div className="flex items-center gap-2">
                  {/* 📍 นำป้าย "แจ้งแล้ว" (สีเขียว) ออกแล้ว แต่ปุ่ม "ไม่รับเรื่อง" ยังอยู่เหมือนเดิม */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm('คุณต้องการไม่รับเรื่องการแจ้งซ่อมนี้ใช่หรือไม่?')) {
                        const updated = [...tickets];
                        updated[0].status = 'cancelled';
                        setTickets(updated);
                      }
                    }}
                    className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow transition-transform active:scale-95"
                  >
                    ไม่รับเรื่อง
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2">{tickets[0].date}</p>
              
              <div className="text-sm text-black flex flex-col gap-1 mb-3">
                <p><strong>หมวดหมู่:</strong> {tickets[0].category}</p>
                <p><strong>สถานที่:</strong> {tickets[0].location}</p>
              </div>

              {tickets[0].note && (
                <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2 rounded-xl border border-red-100">
                  หมายเหตุ: {tickets[0].note}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-4 text-center text-gray-400 text-sm">
              ไม่มีรายการล่าสุด (ไม่รับเรื่องแล้ว)
            </div>
          )}
        </div>

        {/* --- ส่วนที่ 2: ทั้งหมด --- */}
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">ทั้งหมด</h2>

          <div className="flex flex-col gap-4">
            {tickets.map((ticket, index) => (
              <div 
                key={index}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setModalType('details');
                }}
                className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-extrabold text-black">{ticket.id}</span>
                  {ticket.status === 'pending' ? (
                    <span className="bg-[#e3dc01] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      รอรับเรื่อง
                    </span>
                  ) : ticket.status === 'received' ? (
                    <span className="bg-[#2E7D32] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      แจ้งแล้ว
                    </span>
                  ) : (
                    <span className="bg-gray-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                      ไม่รับเรื่องแล้ว
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 mb-2">{ticket.date}</p>
                
                <div className="text-sm text-black flex flex-col gap-1">
                  <p><strong>หมวดหมู่:</strong> {ticket.category}</p>
                  <p><strong>สถานที่:</strong> {ticket.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- POP-UP รายละเอียดการแจ้งซ่อม --- */}
      {modalType === 'details' && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-4 relative">
            <button 
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 text-black font-bold text-lg hover:opacity-75"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-black mb-1">รายละเอียดการแจ้งซ่อม</h3>

            <div className="text-sm text-black flex flex-col gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p><strong>รหัสแจ้ง:</strong> {selectedTicket.id}</p>
              <p><strong>วันเวลาที่แจ้ง :</strong> {selectedTicket.date} น.</p>
              <p><strong>หมวดหมู่ :</strong> {selectedTicket.category}</p>
              <p><strong>สถานที่ :</strong> {selectedTicket.location}</p>
              
              <p className="font-bold mt-2">รูปภาพที่แนบ</p>
              <div 
                onClick={() => setModalType('image')}
                className="bg-white border border-black/30 rounded-xl px-3 py-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
              >
                <span>file_photo.png</span>
                <span className="text-xs text-gray-400">คลิกเพื่อดูรูปภาพ</span>
              </div>
            </div>

            {selectedTicket.note && (
              <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                หมายเหตุ: {selectedTicket.note}
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- POP-UP ดูรูปภาพเต็มจอ --- */}
      {modalType === 'image' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative flex flex-col">
            <button 
              onClick={() => setModalType('details')}
              className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 hover:bg-black"
            >
              ✕
            </button>
            <div className="w-full h-80 bg-gray-200 flex items-center justify-center relative">
              <img 
                src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" 
                alt="Uploaded Issue" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-white text-center text-xs text-gray-500 font-bold">
              รูปภาพปัญหาที่แนบมา
            </div>
          </div>
        </div>
      )}

    </div>
  );
}