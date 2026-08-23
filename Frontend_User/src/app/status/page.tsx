'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllRequests, updateRequestStatus, MaintenanceRequestItem } from '@/app/services/api';
import { getLiffProfile } from '@/lib/liff';

export default function StatusPage() {
  const [requests, setRequests] = useState<MaintenanceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalType, setModalType] = useState<'details' | 'image' | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequestItem | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchRequestsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await getLiffProfile();
      if (profile?.userId) {
        setCurrentUserId(profile.userId);
      }

      const res = await getAllRequests();
      if (res && res.data) {
        setRequests(res.data);
      }
    } catch (err: any) {
      console.error('Fetch requests error:', err);
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลรายการแจ้งซ่อมได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestsData();
  }, []);

  const handleCancelRequest = async (e: React.MouseEvent, req: MaintenanceRequestItem) => {
    e.stopPropagation();
    if (!confirm(`คุณต้องการยกเลิก/ไม่รับเรื่องรายการ ${req.ticket_number} ใช่หรือไม่?`)) {
      return;
    }

    try {
      await updateRequestStatus(req.id, {
        status: 'ยกเลิก',
        remark: 'ผู้แจ้งยกเลิกรายการผ่านระบบ',
      });
      // อัปเดตใน Local State ทันที
      setRequests((prev) =>
        prev.map((item) => (item.id === req.id ? { ...item, status: 'ยกเลิก' } : item))
      );
    } catch (err: any) {
      alert(err?.message || 'ไม่สามารถยกเลิกรายการได้');
    }
  };

  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })} ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.`;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'รอรับเรื่อง':
        return <span className="bg-[#FF9800] text-white text-xs font-bold px-3 py-1 rounded-full shadow">รอรับเรื่อง ⏳</span>;
      case 'แจ้งแล้ว':
        return <span className="bg-[#2E7D32] text-white text-xs font-bold px-3 py-1 rounded-full shadow">แจ้งแล้ว</span>;
      case 'กำลังดำเนินการ':
        return <span className="bg-[#1976D2] text-white text-xs font-bold px-3 py-1 rounded-full shadow">กำลังดำเนินการ 🔧</span>;
      case 'เสร็จสิ้น':
        return <span className="bg-[#388E3C] text-white text-xs font-bold px-3 py-1 rounded-full shadow">เสร็จสิ้น ✅</span>;
      case 'ยกเลิก':
      case 'ไม่รับเรื่อง':
        return <span className="bg-[#D32F2F] text-white text-xs font-bold px-3 py-1 rounded-full shadow">ยกเลิก ❌</span>;
      default:
        return <span className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{status}</span>;
    }
  };

  // แยกรายการล่าสุด (รายการแรกสุดที่ยังไม่เสร็จหรือรายการแรก)
  const latestRequest = requests.length > 0 ? requests[0] : null;
  const otherRequests = requests.length > 1 ? requests.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative pb-10">
      {/* --- Header ด้านบน --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center justify-between shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold hover:opacity-75 transition-opacity">
            &lt;
          </Link>
          <h1 className="text-lg md:text-xl font-extrabold">ติดตามสถานะการแจ้งซ่อม</h1>
        </div>
        <button
          onClick={fetchRequestsData}
          className="text-xs bg-white text-[#6610A8] font-bold px-3 py-1.5 rounded-xl border border-[#6610A8]/30 hover:bg-purple-50 active:scale-95 transition-all"
        >
          🔄 รีเฟรช
        </button>
      </div>

      {/* --- เนื้อหาหลัก --- */}
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        {loading && (
          <div className="text-center py-12 text-purple-900 font-bold">
            กำลังโหลดข้อมูลสถานะจากเซิร์ฟเวอร์...
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center text-red-600 text-sm">
            <p className="font-bold mb-1">เกิดข้อผิดพลาด</p>
            <p>{error}</p>
            <button
              onClick={fetchRequestsData}
              className="mt-3 text-xs bg-red-600 text-white px-4 py-1.5 rounded-xl font-bold"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {!loading && requests.length === 0 && !error && (
          <div className="bg-white border-[2px] border-dashed border-[#B870E8] rounded-3xl p-8 text-center text-gray-500">
            <span className="text-4xl block mb-2">📋</span>
            <h3 className="text-base font-bold text-black mb-1">ยังไม่มีรายการแจ้งซ่อม</h3>
            <p className="text-xs text-gray-400 mb-4">คุณยังไม่ได้ส่งข้อมูลแจ้งปัญหาห้องน้ำ</p>
            <Link
              href="/report"
              className="inline-block bg-[#6610A8] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow hover:bg-[#520d86]"
            >
              + แจ้งปัญหาห้องน้ำ
            </Link>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <>
            {/* --- ส่วนที่ 1: รายการล่าสุด --- */}
            {latestRequest && (
              <div>
                <h2 className="text-base font-extrabold text-black mb-3">ล่าสุด</h2>
                <div
                  onClick={() => {
                    setSelectedTicket(latestRequest);
                    setModalType('details');
                  }}
                  className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-black">
                        #{latestRequest.ticket_number}
                      </span>
                      {latestRequest.priority === 'สูง' || latestRequest.priority === 'วิกฤต' ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-md">
                          เร่งด่วน 🚨
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(latestRequest.status)}
                      {latestRequest.status !== 'เสร็จสิ้น' && latestRequest.status !== 'ยกเลิก' && (
                        <button
                          onClick={(e) => handleCancelRequest(e, latestRequest)}
                          className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold px-3 py-1 rounded-full shadow transition-transform active:scale-95"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    {formatThaiDate(latestRequest.reported_at)}
                  </p>

                  <div className="text-sm text-black flex flex-col gap-1 mb-2">
                    <p>
                      <strong>ปัญหา:</strong> {latestRequest.issue_summary}
                    </p>
                    <p>
                      <strong>สถานที่:</strong> {latestRequest.location}
                    </p>
                  </div>

                  {latestRequest.remark && (
                    <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100 mt-2">
                      หมายเหตุจากเจ้าหน้าที่: {latestRequest.remark}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* --- ส่วนที่ 2: รายการทั้งหมด --- */}
            {otherRequests.length > 0 && (
              <div>
                <h2 className="text-base font-extrabold text-black mb-3">ทั้งหมด ({requests.length} รายการ)</h2>
                <div className="flex flex-col gap-3">
                  {otherRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedTicket(req);
                        setModalType('details');
                      }}
                      className="bg-white border border-[#B870E8]/60 hover:border-[#6610A8] rounded-3xl p-4 shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-base font-extrabold text-black">
                          #{req.ticket_number}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>

                      <p className="text-xs text-gray-400 mb-2">{formatThaiDate(req.reported_at)}</p>

                      <div className="text-xs md:text-sm text-black flex flex-col gap-1">
                        <p>
                          <strong>ปัญหา:</strong> {req.issue_summary}
                        </p>
                        <p>
                          <strong>สถานที่:</strong> {req.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- POP-UP รายละเอียดการแจ้งซ่อม --- */}
      {modalType === 'details' && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 text-black font-bold text-lg hover:opacity-75 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-black mb-1">รายละเอียดการแจ้งซ่อม</h3>

            <div className="text-sm text-black flex flex-col gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p>
                <strong>รหัสแจ้ง:</strong> #{selectedTicket.ticket_number}
              </p>
              <p>
                <strong>สถานะ:</strong> {selectedTicket.status}
              </p>
              <p>
                <strong>ระดับความเร่งด่วน:</strong> {selectedTicket.priority}
              </p>
              <p>
                <strong>วันเวลาที่แจ้ง:</strong> {formatThaiDate(selectedTicket.reported_at)}
              </p>
              <p>
                <strong>สถานที่:</strong> {selectedTicket.location}
              </p>
              <p>
                <strong>ปัญหา:</strong> {selectedTicket.issue_summary}
              </p>

              {selectedTicket.image_url && (
                <div className="mt-2">
                  <p className="font-bold mb-1">รูปภาพที่แนบ</p>
                  <div
                    onClick={() => setModalType('image')}
                    className="bg-white border border-black/30 rounded-xl p-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="text-xs text-gray-700 truncate">📷 ดูภาพถ่ายหลักฐาน</span>
                    <span className="text-xs text-[#6610A8] font-bold">คลิกเพื่อขยาย &rarr;</span>
                  </div>
                </div>
              )}
            </div>

            {selectedTicket.remark && (
              <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                หมายเหตุ: {selectedTicket.remark}
              </p>
            )}

            {selectedTicket.notification_message && (
              <p className="text-xs text-[#2E7D32] font-semibold bg-green-50 p-2.5 rounded-xl border border-green-100">
                ข้อความแจ้งเตือน: {selectedTicket.notification_message}
              </p>
            )}

            <button
              onClick={() => setModalType(null)}
              className="w-full bg-[#6610A8] hover:bg-[#520d86] text-white font-bold py-3 rounded-2xl shadow transition-transform active:scale-95 mt-2"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* --- POP-UP ดูรูปภาพเต็มจอ --- */}
      {modalType === 'image' && selectedTicket && selectedTicket.image_url && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative flex flex-col">
            <button
              onClick={() => setModalType('details')}
              className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 hover:bg-black"
            >
              ✕
            </button>
            <div className="w-full h-80 bg-gray-900 flex items-center justify-center relative">
              <img
                src={selectedTicket.image_url}
                alt="Uploaded Evidence"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-white text-center text-xs text-gray-700 font-bold">
              รูปภาพปัญหาที่แนบมา (#{selectedTicket.ticket_number})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}