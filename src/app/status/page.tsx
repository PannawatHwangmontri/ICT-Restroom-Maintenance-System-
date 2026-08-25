'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import liff from '@line/liff';
import { getAllRequests } from '../services/api';

interface TicketData {
  id: string;
  dbId?: string;
  date: string;
  category: string;
  location: string;
  note?: string;
  status: 'pending' | 'received';
  imageUrl?: string | null;
}

export default function StatusPage() {
  const [modalType, setModalType] = useState<'details' | 'image' | null>(null);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);

  // ดึง LINE User ID อัตโนมัติเมื่อเปิดผ่าน LINE และดึงข้อมูลการแจ้งซ่อม
  useEffect(() => {
    const initAndFetch = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      if (!liffId) {
        // กรณีไม่มี LIFF ID (เช่น รันเทสบน Localhost)
        try {
          const res = await getAllRequests();
          if (res.success && Array.isArray(res.data)) {
            setTickets(mapTicketData(res.data));
          }
        } catch (err) {
          console.warn('Fetch error:', err);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        await liff.init({ liffId });

        // ถ้าเปิดผ่าน LINE App LIFF จะเข้าสู่ระบบให้อัตโนมัติ (isInClient)
        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          if (profile?.userId) {
            setLineUserId(profile.userId);
            setUserName(profile.displayName || '');

            // ดึงรายการแจ้งซ่อมเฉพาะของบัญชี LINE นี้
            const res = await getAllRequests(profile.userId);
            if (res.success && Array.isArray(res.data)) {
              setTickets(mapTicketData(res.data));
              setIsLoading(false);
              return;
            }
          }
        }

        // กรณีเปิดผ่านเบราว์เซอร์ภายนอก / Dev Tunnel
        const fallbackRes = await getAllRequests();
        if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
          setTickets(mapTicketData(fallbackRes.data));
        }
      } catch (err) {
        console.warn('LIFF init warning:', err);
        try {
          const res = await getAllRequests();
          if (res.success && Array.isArray(res.data)) {
            setTickets(mapTicketData(res.data));
          }
        } catch (e) {
          console.error(e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const mapTicketData = (data: any[]): TicketData[] => {
      return data.map((item) => {
        let formattedDate = item.reported_at || '';
        try {
          if (item.reported_at) {
            const d = new Date(item.reported_at);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
          }
        } catch {
          formattedDate = item.reported_at || '';
        }

        // สถานะมีเพียง 2 แบบ: 'รอรับเรื่อง' (pending) และ 'แจ้งแล้ว' (received)
        let statusVal: 'pending' | 'received' = 'pending';
        if (item.status === 'แจ้งแล้ว' || item.status === 'กำลังดำเนินการ' || item.status === 'เสร็จสิ้น') {
          statusVal = 'received';
        } else {
          statusVal = 'pending';
        }

        return {
          id: item.ticket_number || `#AW-${item.id?.slice(0, 4)}`,
          dbId: item.id,
          date: formattedDate,
          category: item.issue_summary,
          location: item.location,
          note: item.remark || undefined,
          status: statusVal,
          imageUrl: item.image_url,
        };
      });
    };

    initAndFetch();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative pb-10">
      
      {/* --- Header ด้านบน --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center justify-between shadow-sm mb-6">
        <h1 className="text-lg md:text-xl font-extrabold">ติดตามสถานะ</h1>
        {userName && (
          <span className="text-xs md:text-sm bg-white/70 px-3 py-1 rounded-full font-bold text-[#6610A8]">
            👤 {userName}
          </span>
        )}
      </div>

      {/* --- เนื้อหาหลัก --- */}
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        
        {/* กรณีโหลดข้อมูล */}
        {isLoading && (
          <div className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-8 text-center text-gray-500 font-bold shadow-sm">
            กำลังโหลดข้อมูลสถานะของคุณ...
          </div>
        )}

        {/* กรณีไม่มีประวัติการแจ้ง */}
        {!isLoading && tickets.length === 0 && (
          <div className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-8 text-center shadow-sm flex flex-col items-center gap-4">
            <div className="text-4xl">📋</div>
            <h3 className="text-base md:text-lg font-extrabold text-black">
              ยังไม่มีประวัติการแจ้งปัญหาของคุณ
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              เมื่อคุณแจ้งปัญหาห้องน้ำผ่านระบบ รายการจะแสดงสถานะการดำเนินงานที่หน้านี้แบบเรียลไทม์
            </p>
            <Link href="/report" className="mt-2">
              <button className="bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold px-6 py-3 rounded-2xl shadow text-sm transition-transform active:scale-95">
                + แจ้งปัญหาใหม่
              </button>
            </Link>
          </div>
        )}

        {/* กรณีมีรายการแจ้งซ่อม */}
        {!isLoading && tickets.length > 0 && (
          <>
            {/* --- ส่วนที่ 1: ล่าสุด --- */}
            <div>
              <h2 className="text-base font-extrabold text-black mb-3">ล่าสุด</h2>

              <div 
                onClick={() => {
                  setSelectedTicket(tickets[0]);
                  setModalType('details');
                }}
                className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-extrabold text-black">{tickets[0].id}</span>
                  <div>
                    {tickets[0].status === 'pending' ? (
                      <span className="bg-[#e3dc01] text-black text-xs font-bold px-4 py-1.5 rounded-full shadow">
                        รอรับเรื่อง
                      </span>
                    ) : (
                      <span className="bg-[#2E7D32] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                        แจ้งแล้ว
                      </span>
                    )}
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
            </div>

            {/* --- ส่วนที่ 2: ทั้งหมด --- */}
            <div>
              <h2 className="text-base font-extrabold text-black mb-3">ทั้งหมด ({tickets.length} รายการ)</h2>

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
                        <span className="bg-[#e3dc01] text-black text-xs font-bold px-4 py-1.5 rounded-full shadow">
                          รอรับเรื่อง
                        </span>
                      ) : (
                        <span className="bg-[#2E7D32] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                          แจ้งแล้ว
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
          </>
        )}

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
              
              {selectedTicket.imageUrl ? (
                <>
                  <p className="font-bold mt-2">รูปภาพที่แนบ</p>
                  <div 
                    onClick={() => setModalType('image')}
                    className="bg-white border border-black/30 rounded-xl px-3 py-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>📷 ดูภาพถ่ายหลักฐาน</span>
                    <span className="text-xs text-purple-600 font-bold">คลิกเพื่อดูรูปภาพ</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 mt-2">ไม่มีรูปภาพแนบ</p>
              )}
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
                src={selectedTicket?.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"} 
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