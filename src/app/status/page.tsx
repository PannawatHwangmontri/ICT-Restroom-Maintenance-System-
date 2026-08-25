'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllRequests, updateRequestStatus, MaintenanceRequest } from '../services/api';

export default function StatusPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalType, setModalType] = useState<'details' | 'image' | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRequest | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllRequests();
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      console.error('Fetch requests error:', err);
      setError('ไม่สามารถโหลดข้อมูลการแจ้งซ่อมได้ กรุณาตรวจสอบการเชื่อมต่อ Backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancelTicket = async (ticket: MaintenanceRequest) => {
    if (!ticket.id) return;
    if (!confirm(`คุณต้องการยกเลิกคำร้องหมายเลข #${ticket.ticket_number} ใช่หรือไม่?`)) {
      return;
    }

    try {
      setActionLoadingId(ticket.id);
      const res = await updateRequestStatus(ticket.id, { status: 'ไม่รับเรื่อง', remark: 'ผู้ใช้ยกเลิกคำร้อง' });
      if (res.success) {
        // Refresh or update state locally
        setRequests((prev) =>
          prev.map((r) => (r.id === ticket.id ? { ...r, status: 'ไม่รับเรื่อง' } : r))
        );
        if (selectedTicket?.id === ticket.id) {
          setSelectedTicket((prev) => (prev ? { ...prev, status: 'ไม่รับเรื่อง' } : null));
        }
      }
    } catch (err: any) {
      console.error('Cancel ticket error:', err);
      alert(err?.response?.data?.message || 'เกิดข้อผิดพลาดในการยกเลิกคำร้อง');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'รอรับเรื่อง':
        return <span className="bg-[#6610A8] text-white text-xs font-bold px-3 py-1 rounded-full shadow">รอรับเรื่อง</span>;
      case 'แจ้งแล้ว':
        return <span className="bg-[#2E7D32] text-white text-xs font-bold px-3 py-1 rounded-full shadow">แจ้งแล้ว</span>;
      case 'กำลังดำเนินการ':
        return <span className="bg-[#0284C7] text-white text-xs font-bold px-3 py-1 rounded-full shadow">กำลังดำเนินการ</span>;
      case 'เสร็จสิ้น':
        return <span className="bg-[#16A34A] text-white text-xs font-bold px-3 py-1 rounded-full shadow">เสร็จสิ้น</span>;
      case 'ยกเลิก':
      case 'ไม่รับเรื่อง':
        return <span className="bg-[#D32F2F] text-white text-xs font-bold px-3 py-1 rounded-full shadow">{status}</span>;
      default:
        return <span className="bg-gray-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">{status || 'รอรับเรื่อง'}</span>;
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      return new Date(isoStr).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const latestTicket = requests.length > 0 ? requests[0] : null;

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative pb-10">
      
      {/* --- Header ด้านบน --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center justify-between shadow-sm mb-6">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xl font-bold hover:opacity-75 transition-opacity">
            &lt;
          </Link>
          <h1 className="text-lg md:text-xl font-extrabold">ติดตามสถานะ</h1>
        </div>
        <button
          onClick={fetchRequests}
          disabled={loading}
          className="text-xs bg-white border border-[#6610A8] text-[#6610A8] font-bold px-3 py-1.5 rounded-xl hover:bg-purple-50 active:scale-95 transition-all"
        >
          {loading ? 'กำลังโหลด...' : '🔄 รีเฟรช'}
        </button>
      </div>

      {/* --- เนื้อหาหลัก --- */}
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        
        {loading && (
          <div className="bg-white border border-purple-100 rounded-3xl p-8 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-4 border-[#6610A8] border-t-transparent rounded-full animate-spin"></span>
            <p className="font-semibold text-sm">กำลังดึงข้อมูลการแจ้งซ่อม...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button
              onClick={fetchRequests}
              className="text-xs bg-red-600 text-white font-bold px-3 py-1 rounded-lg hover:bg-red-700 ml-3"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center text-gray-400 text-sm shadow-sm flex flex-col items-center gap-4">
            <span className="text-4xl">📋</span>
            <p className="font-bold text-gray-700">ยังไม่มีรายการแจ้งซ่อมในระบบ</p>
            <Link
              href="/report"
              className="bg-[#6610A8] hover:bg-[#520c87] text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow transition-transform active:scale-95"
            >
              + แจ้งปัญหาใหม่
            </Link>
          </div>
        )}

        {/* --- ส่วนที่ 1: ล่าสุด --- */}
        {!loading && latestTicket && (
          <div>
            <h2 className="text-base font-extrabold text-black mb-3">ล่าสุด</h2>

            <div 
              onClick={() => {
                setSelectedTicket(latestTicket);
                setModalType('details');
              }}
              className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <span className="text-lg font-extrabold text-black">#{latestTicket.ticket_number}</span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(latestTicket.status)}
                  {latestTicket.status !== 'ยกเลิก' && latestTicket.status !== 'ไม่รับเรื่อง' && latestTicket.status !== 'เสร็จสิ้น' && (
                    <button 
                      disabled={actionLoadingId === latestTicket.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelTicket(latestTicket);
                      }}
                      className="bg-[#D32F2F] hover:bg-[#B71C1C] disabled:opacity-50 text-white text-xs font-bold px-3 py-1 rounded-full shadow transition-transform active:scale-95"
                    >
                      {actionLoadingId === latestTicket.id ? '...' : 'ยกเลิก'}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-2">{formatDate(latestTicket.reported_at)} น.</p>
              
              <div className="text-sm text-black flex flex-col gap-1 mb-2">
                <p><strong>หมวดหมู่:</strong> {latestTicket.issue_summary}</p>
                <p><strong>สถานที่:</strong> {latestTicket.location}</p>
                {latestTicket.priority && (
                  <p><strong>ความสำคัญ:</strong> <span className={latestTicket.priority === 'สูง' || latestTicket.priority === 'วิกฤต' ? 'text-red-600 font-bold' : 'text-gray-700'}>{latestTicket.priority}</span></p>
                )}
              </div>

              {latestTicket.remark && (
                <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2 rounded-xl border border-red-100 mt-2">
                  หมายเหตุ: {latestTicket.remark}
                </p>
              )}
            </div>
          </div>
        )}

        {/* --- ส่วนที่ 2: ทั้งหมด --- */}
        {!loading && requests.length > 0 && (
          <div>
            <h2 className="text-base font-extrabold text-black mb-3">ทั้งหมด ({requests.length} รายการ)</h2>

            <div className="flex flex-col gap-4">
              {requests.map((ticket) => (
                <div 
                  key={ticket.id || ticket.ticket_number}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setModalType('details');
                  }}
                  className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-5 shadow-sm cursor-pointer hover:border-[#6610A8] transition-all relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-extrabold text-black">#{ticket.ticket_number}</span>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <p className="text-xs text-gray-500 mb-2">{formatDate(ticket.reported_at)} น.</p>
                  
                  <div className="text-sm text-black flex flex-col gap-1">
                    <p><strong>หมวดหมู่:</strong> {ticket.issue_summary}</p>
                    <p><strong>สถานที่:</strong> {ticket.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- POP-UP รายละเอียดการแจ้งซ่อม --- */}
      {modalType === 'details' && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-4 relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setModalType(null)}
              className="absolute top-5 right-5 text-black font-bold text-lg hover:opacity-75"
            >
              ✕
            </button>

            <h3 className="text-lg font-extrabold text-black mb-1">รายละเอียดการแจ้งซ่อม</h3>

            <div className="text-sm text-black flex flex-col gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p><strong>รหัสแจ้ง:</strong> #{selectedTicket.ticket_number}</p>
              <p><strong>สถานะ:</strong> {selectedTicket.status || 'รอรับเรื่อง'}</p>
              <p><strong>วันเวลาที่แจ้ง :</strong> {formatDate(selectedTicket.reported_at)} น.</p>
              <p><strong>สถานที่ :</strong> {selectedTicket.location}</p>
              <p><strong>หมวดหมู่ :</strong> {selectedTicket.issue_summary}</p>
              {selectedTicket.priority && (
                <p><strong>ความสำคัญ :</strong> <span className={selectedTicket.priority === 'สูง' || selectedTicket.priority === 'วิกฤต' ? 'text-red-600 font-bold' : 'text-gray-700'}>{selectedTicket.priority}</span></p>
              )}
              
              {selectedTicket.image_url ? (
                <>
                  <p className="font-bold mt-2">รูปภาพที่แนบ</p>
                  <div 
                    onClick={() => setModalType('image')}
                    className="bg-white border border-black/30 rounded-xl px-3 py-2.5 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>รูปภาพหลักฐาน</span>
                    <span className="text-[#6610A8] font-bold">🔍 คลิกเพื่อดูรูปภาพ</span>
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 mt-2">ไม่มีรูปภาพแนบ</p>
              )}
            </div>

            {selectedTicket.remark && (
              <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                หมายเหตุ: {selectedTicket.remark}
              </p>
            )}

            {selectedTicket.status !== 'ยกเลิก' && selectedTicket.status !== 'ไม่รับเรื่อง' && selectedTicket.status !== 'เสร็จสิ้น' && (
              <button
                disabled={actionLoadingId === selectedTicket.id}
                onClick={() => handleCancelTicket(selectedTicket)}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] disabled:opacity-50 text-white font-extrabold py-3 rounded-2xl shadow-md text-sm transition-transform active:scale-95 mt-2"
              >
                {actionLoadingId === selectedTicket.id ? 'กำลังยกเลิก...' : 'ยกเลิกคำร้องนี้'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- POP-UP ดูรูปภาพเต็มจอ --- */}
      {modalType === 'image' && selectedTicket?.image_url && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative flex flex-col">
            <button 
              onClick={() => setModalType('details')}
              className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold z-10 hover:bg-black"
            >
              ✕
            </button>
            <div className="w-full max-h-[60vh] bg-gray-100 flex items-center justify-center relative overflow-hidden">
              <img 
                src={selectedTicket.image_url} 
                alt="Uploaded Issue" 
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-4 bg-white text-center text-xs text-gray-500 font-bold">
              รูปภาพปัญหาที่แนบมา (#{selectedTicket.ticket_number})
            </div>
          </div>
        </div>
      )}

    </div>
  );
}