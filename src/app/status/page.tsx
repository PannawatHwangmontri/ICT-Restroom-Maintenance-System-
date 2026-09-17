'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import liff from '@line/liff';
import { getAllRequests, getRequestById } from '../services/api';

interface TicketData {
  id: string;
  dbId?: string;
  date: string;
  timeOnly?: string;
  rawDateOnly?: string; // YYYY-MM-DD for accurate date filtering
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
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // ฟังก์ชันหาค่าวันที่ของวันนี้ (YYYY-MM-DD) ตาม Local Time
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ตัวกรอง: ค่าเริ่มต้นคือ 'today' (โหลด/แสดงข้อมูลวันนี้ก่อนเป็นอันดับแรก)
  const [dateMode, setDateMode] = useState<'today' | 'all' | 'custom'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateStr());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received'>('all');
  const [showSearchBox, setShowSearchBox] = useState(false);

  // แปลงข้อมูลจาก API เป็น TicketData
  const mapTicketData = (data: any[]): TicketData[] => {
    return data.map((item) => {
      let formattedDate = item.reported_at || '';
      let dateOnly = '';
      let timeOnly = '';
      try {
        if (item.reported_at) {
          const d = new Date(item.reported_at);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
          dateOnly = `${year}-${month}-${day}`;
          timeOnly = `${hours}:${minutes}`;
        }
      } catch {
        formattedDate = item.reported_at || '';
      }

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
        timeOnly: timeOnly,
        rawDateOnly: dateOnly,
        category: item.issue_summary,
        location: item.location,
        note: item.remark || undefined,
        status: statusVal,
        imageUrl: item.image_url,
      };
    });
  };

  // ดึงข้อมูลรายการแจ้งซ่อม (โหลดเฉพาะข้อความ ไม่รวมรูปภาพเพื่อความเร็วสูงสุด)
  const fetchTickets = useCallback(async (userId?: string | null, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const targetUserId = userId || lineUserId || undefined;
      const res = await getAllRequests(targetUserId, false);
      if (res.success && Array.isArray(res.data)) {
        const mapped = mapTicketData(res.data);
        setTickets((prev) => {
          // เก็บ imageUrl ที่ผู้ใช้เคยคลิกโหลดแล้ว
          const imgMap = new Map(
            prev.filter((t) => t.imageUrl && t.dbId).map((t) => [t.dbId, t.imageUrl])
          );
          return mapped.map((t) => ({
            ...t,
            imageUrl: t.imageUrl || (t.dbId ? imgMap.get(t.dbId) || null : null),
          }));
        });

        // อัปเดตข้อมูลใน modal แบบเรียลไทม์หากเปิดดูอยู่
        setSelectedTicket((currentSelected) => {
          if (!currentSelected) return null;
          const updated = mapped.find(
            (t) => (t.dbId && t.dbId === currentSelected.dbId) || t.id === currentSelected.id
          );
          if (updated) {
            return {
              ...updated,
              imageUrl: currentSelected.imageUrl || updated.imageUrl,
            };
          }
          return currentSelected;
        });
      }
    } catch (err) {
      console.warn('Fetch error:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, [lineUserId]);

  // ดึง LINE User ID อัตโนมัติเมื่อเปิดผ่าน LINE และดึงข้อมูลการแจ้งซ่อมครั้งแรก
  useEffect(() => {
    const initAndFetch = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      if (!liffId) {
        await fetchTickets();
        return;
      }

      try {
        await liff.init({ liffId });

        if (liff.isLoggedIn()) {
          const profile = await liff.getProfile();
          if (profile?.userId) {
            setLineUserId(profile.userId);
            setUserName(profile.displayName || '');
            await fetchTickets(profile.userId);
            return;
          }
        }

        await fetchTickets();
      } catch (err) {
        console.warn('LIFF init warning:', err);
        await fetchTickets();
      }
    };

    initAndFetch();
  }, [fetchTickets]);

  // อัปเดตข้อมูลสถานะแบบเรียลไทม์ทุก 3 วินาที
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets(undefined, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  // ฟังก์ชันเปิดดูรายละเอียด พร้อมโหลดรูปภาพแบบ On-demand
  const handleOpenTicket = async (ticket: TicketData) => {
    setSelectedTicket(ticket);
    setModalType('details');

    if (!ticket.imageUrl && ticket.dbId) {
      setIsLoadingImage(true);
      try {
        const res = await getRequestById(ticket.dbId);
        if (res?.success && res.data?.image_url) {
          const freshImg = res.data.image_url;
          setSelectedTicket((prev) => (prev && prev.dbId === ticket.dbId ? { ...prev, imageUrl: freshImg } : prev));
          setTickets((prev) =>
            prev.map((t) => (t.dbId === ticket.dbId ? { ...t, imageUrl: freshImg } : t))
          );
        }
      } catch (err) {
        console.warn('Could not fetch ticket detail image:', err);
      } finally {
        setIsLoadingImage(false);
      }
    }
  };

  // ฟังก์ชันแปลงรูปแบบวันที่ YYYY-MM-DD เป็นภาษาไทย
  const formatThaiDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const monthName = thaiMonths[parseInt(m, 10) - 1] || m;
      const thaiYear = parseInt(y, 10) + 543;
      return `${parseInt(d, 10)} ${monthName} ${thaiYear}`;
    } catch {
      return dateStr;
    }
  };

  const todayDateStr = getTodayDateStr();

  // นับจำนวนของแต่ละสถานะ
  const todayCount = useMemo(() => {
    return tickets.filter((t) => t.rawDateOnly === todayDateStr).length;
  }, [tickets, todayDateStr]);

  const pendingCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'pending').length;
  }, [tickets]);

  const receivedCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'received').length;
  }, [tickets]);

  // สลับโหมดวันที่
  const handleSelectDateMode = (mode: 'today' | 'all' | 'custom') => {
    setDateMode(mode);
    if (mode === 'today') {
      setSelectedDate(todayDateStr);
    } else if (mode === 'all') {
      setSelectedDate('');
    } else if (mode === 'custom') {
      // ตั้งค่าเริ่มต้น ค้นหา เป็นไม่มีวัน
      setSelectedDate('');
      setShowSearchBox(true);
    }
  };

  // กรองรายการตามวันที่ค้นหา, คำค้นหา และสถานะ
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // กรองตามวันที่เลือก
      if (selectedDate && ticket.rawDateOnly !== selectedDate) {
        return false;
      }

      // กรองตามสถานะ
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }

      // กรองตามคำค้นหา (รหัส, หมวดหมู่, สถานที่, หมายเหตุ)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchId = ticket.id.toLowerCase().includes(query);
        const matchCategory = ticket.category.toLowerCase().includes(query);
        const matchLocation = ticket.location.toLowerCase().includes(query);
        const matchNote = ticket.note?.toLowerCase().includes(query);
        if (!matchId && !matchCategory && !matchLocation && !matchNote) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, selectedDate, searchQuery, statusFilter]);

  const isFiltering = Boolean(selectedDate || searchQuery.trim() || statusFilter !== 'all');

  const handleClearFilters = () => {
    setDateMode('all');
    setSelectedDate('');
    setSearchQuery('');
    setStatusFilter('all');
    setShowSearchBox(false);
  };

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative pb-16">

      {/* --- Header ด้านบน (Sticky & Mobile-friendly) --- */}
      <header className="sticky top-0 z-30 bg-[#E4C5F9]/95 backdrop-blur-md text-black px-4 py-3 md:px-8 md:py-4 shadow-sm border-b border-purple-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-base md:text-xl font-extrabold text-gray-900">ติดตามสถานะ</h1>

          {userName && (
            <span className="text-xs bg-white/80 px-2.5 py-1 rounded-full font-bold text-[#6610A8] truncate max-w-[150px] md:max-w-none border border-purple-200 shadow-xs">
              {userName}
            </span>
          )}
        </div>
      </header>

      {/* --- ตัวควบคุมแถบตัวกรองด่วนสำหรับมือถือ (Segmented Control) --- */}
      <div className="w-full max-w-4xl mx-auto px-3.5 pt-3 md:px-8 md:pt-4">

        {/* แถบสลับ: วันนี้ / ทั้งหมด / เลือกวันที่ */}
        <div className="bg-white border border-[#B870E8] rounded-2xl p-1.5 shadow-xs flex flex-col gap-2">

          <div className="grid grid-cols-3 gap-1 bg-[#F3E8FF] p-1 rounded-xl">
            {/* แท็บ 1: วันนี้ (Default) */}
            <button
              onClick={() => handleSelectDateMode('today')}
              className={`py-2 px-2 rounded-lg font-extrabold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 ${dateMode === 'today'
                  ? 'bg-[#6610A8] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black hover:bg-purple-100/60'
                }`}
            >
              <span>วันนี้</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${dateMode === 'today' ? 'bg-white/25 text-white' : 'bg-purple-200 text-[#6610A8]'
                }`}>
                {todayCount}
              </span>
            </button>

            {/* แท็บ 2: ทั้งหมด */}
            <button
              onClick={() => handleSelectDateMode('all')}
              className={`py-2 px-2 rounded-lg font-extrabold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 ${dateMode === 'all'
                  ? 'bg-[#6610A8] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black hover:bg-purple-100/60'
                }`}
            >
              <span>ทั้งหมด</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${dateMode === 'all' ? 'bg-white/25 text-white' : 'bg-purple-200 text-[#6610A8]'
                }`}>
                {tickets.length}
              </span>
            </button>

            {/* แท็บ 3: เลือกวันที่ */}
            <button
              onClick={() => handleSelectDateMode('custom')}
              className={`py-2 px-2 rounded-lg font-extrabold text-xs md:text-sm transition-all flex items-center justify-center gap-1 ${dateMode === 'custom'
                  ? 'bg-[#6610A8] text-white shadow-sm'
                  : 'text-gray-700 hover:text-black hover:bg-purple-100/60'
                }`}
            >
              <span>ค้นหา</span>
              {dateMode === 'custom' && selectedDate && (
                <span className="text-[10px] bg-white/25 text-white px-1 rounded truncate max-w-[60px]">
                  {formatThaiDate(selectedDate).split(' ')[0]}
                </span>
              )}
            </button>
          </div>

          {/* กล่องเลือกวันที่แบบกำหนดเอง (แสดงเมื่อเลือกแท็บ custom) */}
          {dateMode === 'custom' && (
            <div className="flex flex-col gap-1.5 pt-1 px-1">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 flex items-center">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setDateMode('custom');
                    }}
                    className="w-full bg-[#FAF5FF] border border-[#B870E8] rounded-xl px-3 py-2 text-xs md:text-sm text-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#6610A8]"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate('')}
                      className="absolute right-2 text-gray-400 hover:text-gray-700 text-xs font-bold px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                      title="ล้างวันที่ (ไม่มีวัน)"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
                {selectedDate ? (
                  <span className="text-xs text-[#6610A8] font-bold whitespace-nowrap">
                    {formatThaiDate(selectedDate)}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap bg-purple-50 px-2 py-1.5 rounded-lg border border-purple-200">
                    ไม่มีวัน
                  </span>
                )}
              </div>
            </div>
          )}

          {/* แถวตัวกรองสถานะ + ปุ่มค้นหา */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-purple-100 px-1">
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
              <button
                onClick={() => setStatusFilter('all')}
                className={`text-[11px] md:text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 ${statusFilter === 'all'
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`text-[11px] md:text-xs px-2.5 py-1 rounded-lg font-extrabold transition-all shrink-0 flex items-center gap-1 ${statusFilter === 'pending'
                    ? 'bg-[#e3dc01] text-black shadow-xs'
                    : 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
                  }`}
              >
                <span>รอรับเรื่อง</span>
                {pendingCount > 0 && <span className="text-[10px]">({pendingCount})</span>}
              </button>
              <button
                onClick={() => setStatusFilter('received')}
                className={`text-[11px] md:text-xs px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1 ${statusFilter === 'received'
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
                  }`}
              >
                <span>แจ้งแล้ว</span>
                {receivedCount > 0 && <span className="text-[10px]">({receivedCount})</span>}
              </button>
            </div>

            {/* ปุ่มเปิด/ปิดช่องค้นหา */}
            <button
              onClick={() => setShowSearchBox(!showSearchBox)}
              className={`text-xs px-2 py-1 rounded-lg font-bold border transition-colors shrink-0 flex items-center gap-1.5 ${showSearchBox || searchQuery
                  ? 'bg-purple-100 border-[#6610A8] text-[#6610A8]'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18a7.5 7.5 0 006.15-3.35z" />
              </svg>
              <span>{showSearchBox ? 'ปิด' : 'ค้นหา'}</span>
            </button>
          </div>

          {/* กล่องค้นหาข้อความ (พับเก็บได้) */}
          {(showSearchBox || searchQuery) && (
            <div className="relative flex items-center pt-1 px-1">
              <input
                type="text"
                placeholder="ค้นหารหัส, สถานที่, ปัญหา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF5FF] border border-[#B870E8] rounded-xl px-3 py-2 text-xs md:text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-[#6610A8]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-gray-700 text-xs font-bold p-1"
                >
                  &times;
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* --- เนื้อหาหลัก --- */}
      <main className="w-full max-w-4xl mx-auto p-3.5 md:p-8 flex flex-col gap-4">

        {/* แถบสรุปเงื่อนไขการกรอง (ถ้ามี) */}
        {isFiltering && (
          <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 text-xs text-[#6610A8] font-bold">
            <div className="flex items-center gap-1.5 truncate">
              <span className="truncate">
                {dateMode === 'today' && 'รายการวันนี้'}
                {dateMode === 'all' && 'ทุกวัน'}
                {dateMode === 'custom' && (selectedDate ? `วันที่ ${formatThaiDate(selectedDate)}` : 'ค้นหา (ไม่มีวัน)')}
                {statusFilter !== 'all' && ` • ${statusFilter === 'pending' ? 'รอรับเรื่อง' : 'แจ้งแล้ว'}`}
                {searchQuery && ` • "${searchQuery}"`}
                {` (${filteredTickets.length} รายการ)`}
              </span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:underline shrink-0 ml-2 font-bold cursor-pointer"
            >
              ล้างทั้งหมด
            </button>
          </div>
        )}

        {/* กรณีโหลดข้อมูล */}
        {isLoading && (
          <div className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-8 text-center text-gray-500 font-bold shadow-xs animate-pulse flex flex-col items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-[#6610A8]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>กำลังโหลดข้อมูลสถานะของคุณ...</span>
          </div>
        )}

        {/* กรณีไม่มีประวัติการแจ้งเลยในระบบ */}
        {!isLoading && tickets.length === 0 && (
          <div className="bg-white border-[2px] border-[#B870E8] rounded-3xl p-6 md:p-8 text-center shadow-xs flex flex-col items-center gap-4">
            <h3 className="text-base md:text-lg font-extrabold text-black">
              ยังไม่มีประวัติการแจ้งปัญหาของคุณ
            </h3>
            <p className="text-xs md:text-sm text-gray-500 max-w-md">
              เมื่อคุณแจ้งปัญหาห้องน้ำผ่านระบบ รายการจะแสดงสถานะการดำเนินงานที่หน้านี้แบบเรียลไทม์
            </p>
            <Link href="/report" className="mt-2 w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold px-6 py-3 rounded-2xl shadow text-sm transition-transform active:scale-95 cursor-pointer">
                + แจ้งปัญหาใหม่
              </button>
            </Link>
          </div>
        )}

        {/* กรณีมีข้อมูลในระบบ แต่ผลการค้นหาไม่ตรงกับเงื่อนไข */}
        {!isLoading && tickets.length > 0 && filteredTickets.length === 0 && (
          <div className="bg-white border-[2px] border-dashed border-[#B870E8] rounded-3xl p-6 md:p-8 text-center shadow-xs flex flex-col items-center gap-3">
            <h3 className="text-base font-extrabold text-black">
              {dateMode === 'today'
                ? 'วันนี้ยังไม่มีรายการแจ้งซ่อมใหม่'
                : 'ไม่พบประวัติการแจ้งตามเงื่อนไขที่เลือก'}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm">
              {dateMode === 'today'
                ? `คุณสามารถสลับไปดูประวัติย้อนหลังทั้งหมด (${tickets.length} รายการ) ได้ทันที`
                : 'ลองปรับเปลี่ยนคำค้นหา วันที่ หรือสถานะการแจ้งซ่อม'}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full sm:w-auto">
              <button
                onClick={handleClearFilters}
                className="bg-[#6610A8] hover:bg-[#520c87] text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                ดูประวัติการแจ้งทั้งหมด ({tickets.length} รายการ)
              </button>
              <Link href="/report" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-xs transition-transform active:scale-95 cursor-pointer">
                  + แจ้งปัญหาใหม่
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* --- รายการการ์ดแจ้งซ่อม (Mobile Card Layout) --- */}
        {!isLoading && filteredTickets.length > 0 && (
          <div className="flex flex-col gap-3.5">

            {/* Header แสดงจำนวนรายการ */}
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm md:text-base font-extrabold text-black flex items-center gap-1.5">
                <span>{dateMode === 'today' ? 'รายการวันนี้' : 'รายการแจ้งซ่อม'}</span>
                <span className="text-xs font-bold text-gray-500">
                  ({filteredTickets.length} รายการ)
                </span>
              </h2>

              {dateMode === 'today' && tickets.length > todayCount && (
                <button
                  onClick={() => handleSelectDateMode('all')}
                  className="text-xs text-[#6610A8] hover:underline font-bold active:scale-95 transition-transform"
                >
                  ดูทั้งหมด ({tickets.length}) &rarr;
                </button>
              )}
            </div>

            {/* การ์ดรายการแต่ละชิ้น */}
            {filteredTickets.map((ticket, index) => {
              const isToday = ticket.rawDateOnly === todayDateStr;
              return (
                <div
                  key={ticket.dbId || ticket.id || index}
                  onClick={() => handleOpenTicket(ticket)}
                  className="bg-white border-[2px] border-[#B870E8] hover:border-[#6610A8] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-xs cursor-pointer active:scale-[0.98] transition-all relative group flex flex-col gap-2.5"
                >
                  {/* แถวบน: รหัสแจ้ง + สถานะ */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base md:text-lg font-black text-black group-hover:text-[#6610A8] transition-colors">
                        {ticket.id}
                      </span>
                      {isToday && (
                        <span className="bg-purple-100 text-[#6610A8] text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-purple-200">
                          วันนี้
                        </span>
                      )}
                    </div>

                    <div>
                      {ticket.status === 'pending' ? (
                        <span className="bg-[#e3dc01] text-black text-xs font-black px-3 py-1 rounded-full shadow-xs inline-flex items-center">
                          รอรับเรื่อง
                        </span>
                      ) : (
                        <span className="bg-[#2E7D32] text-white text-xs font-black px-3 py-1 rounded-full shadow-xs inline-flex items-center">
                          แจ้งแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  {/* เวลาที่แจ้ง */}
                  <div className="text-[11px] md:text-xs text-gray-500">
                    <span>{isToday && ticket.timeOnly ? `วันนี้ เวลา ${ticket.timeOnly} น.` : `${ticket.date} น.`}</span>
                  </div>

                  {/* ข้อมูลหมวดหมู่และสถานที่ */}
                  <div className="text-xs md:text-sm text-gray-900 bg-purple-50/40 p-2.5 rounded-xl border border-purple-100 flex flex-col gap-1">
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-gray-700 shrink-0">สถานที่:</span>
                      <span className="font-bold text-black">{ticket.location}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-gray-700 shrink-0">หมวดหมู่:</span>
                      <span className="text-gray-700">{ticket.category}</span>
                    </div>
                  </div>

                  {/* หมายเหตุ (ถ้ามี) */}
                  {ticket.note && (
                    <p className="text-[11px] md:text-xs text-[#E00000] font-semibold bg-red-50 p-2 rounded-xl border border-red-100">
                      <strong>หมายเหตุ:</strong> {ticket.note}
                    </p>
                  )}

                  {/* แถวล่างของการ์ด: ส่งสัญญาณบอกว่าแตะดูรายละเอียดได้ */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#6610A8] font-bold border-t border-purple-50">
                    <span>
                      {ticket.imageUrl ? 'มีรูปภาพแนบ' : 'รายละเอียด'}
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ดูรายละเอียด</span>
                      <span>&rsaquo;</span>
                    </span>
                  </div>

                </div>
              );
            })}

            {/* ปุ่มนำทางไปดูรายการทั้งหมดด้านล่างสุด (กรณีอยู่ในโหมด 'วันนี้') */}
            {dateMode === 'today' && tickets.length > todayCount && (
              <div className="text-center pt-2">
                <button
                  onClick={() => handleSelectDateMode('all')}
                  className="w-full bg-white hover:bg-purple-50 border-[2px] border-[#B870E8] text-[#6610A8] font-extrabold py-3 px-4 rounded-2xl text-xs md:text-sm shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>ดูประวัติการแจ้งทั้งหมด ({tickets.length} รายการ)</span>
                  <span>&rarr;</span>
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* --- POP-UP รายละเอียดการแจ้งซ่อม (Bottom Sheet บนมือถือ) --- */}
      {modalType === 'details' && selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white border-t-2 sm:border-2 border-[#6610A8] rounded-t-3xl sm:rounded-3xl p-5 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-200">

            {/* ด้ามจับสำหรับมือถือ (Handle bar) */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto -mt-1 mb-1 sm:hidden" />

            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-extrabold text-black">
                รายละเอียดการแจ้งซ่อม
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-black font-bold text-base flex items-center justify-center cursor-pointer active:scale-90"
              >
                &times;
              </button>
            </div>

            <div className="text-xs md:text-sm text-black flex flex-col gap-2.5 bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
              <div className="flex justify-between items-center pb-2 border-b border-purple-200">
                <span className="font-bold text-gray-600">รหัสแจ้ง:</span>
                <span className="font-black text-black text-sm">{selectedTicket.id}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-600">สถานะ:</span>
                <div>
                  {selectedTicket.status === 'pending' ? (
                    <span className="bg-[#e3dc01] text-black text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      รอรับเรื่อง
                    </span>
                  ) : (
                    <span className="bg-[#2E7D32] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      แจ้งแล้ว
                    </span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-600">วันเวลาที่แจ้ง:</span>
                <p className="font-medium text-black mt-0.5">{selectedTicket.date} น.</p>
              </div>

              <div>
                <span className="font-bold text-gray-600">สถานที่:</span>
                <p className="font-bold text-black mt-0.5">{selectedTicket.location}</p>
              </div>

              <div>
                <span className="font-bold text-gray-600">หมวดหมู่ / ปัญหา:</span>
                <p className="font-medium text-black mt-0.5">{selectedTicket.category}</p>
              </div>

              {/* ส่วนแสดงรูปภาพหลักฐาน */}
              <div className="pt-2 border-t border-purple-200">
                <p className="font-bold text-gray-600 mb-1.5">รูปภาพที่แนบ:</p>
                {selectedTicket.imageUrl ? (
                  <div
                    onClick={() => setModalType('image')}
                    className="bg-white border border-[#B870E8] rounded-xl p-3 text-xs text-gray-800 cursor-pointer hover:bg-purple-50 flex items-center justify-between transition-colors shadow-xs active:scale-98"
                  >
                    <span className="font-bold">
                      ดูภาพถ่ายหลักฐาน
                    </span>
                    <span className="text-xs text-[#6610A8] font-black flex items-center gap-1">
                      <span>แตะเพื่อดูรูป</span>
                      <span>&rsaquo;</span>
                    </span>
                  </div>
                ) : isLoadingImage ? (
                  <div className="text-xs text-[#6610A8] font-bold flex items-center gap-1.5 py-2 animate-pulse">
                    กำลังโหลดรูปภาพ...
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-1">ไม่มีรูปภาพแนบสำหรับรายการนี้</p>
                )}
              </div>
            </div>

            {selectedTicket.note && (
              <p className="text-xs text-[#E00000] font-semibold bg-red-50 p-3 rounded-xl border border-red-100">
                <strong>หมายเหตุ:</strong> {selectedTicket.note}
              </p>
            )}

            <button
              onClick={() => setModalType(null)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold py-3 rounded-2xl text-xs md:text-sm active:scale-95 transition-all cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* --- POP-UP ดูรูปภาพเต็มจอ (Fullscreen Image Modal) --- */}
      {modalType === 'image' && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setModalType('details')}
              className="absolute top-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-base z-10 hover:bg-black active:scale-90 transition-transform cursor-pointer"
            >
              &times;
            </button>
            <div className="w-full h-80 sm:h-96 bg-gray-900 flex items-center justify-center relative overflow-hidden">
              <img
                src={selectedTicket?.imageUrl || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80"}
                alt="Uploaded Issue"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4 bg-white flex items-center justify-between text-xs text-gray-600 font-bold border-t">
              <span>ภาพถ่ายหลักฐาน ({selectedTicket?.id})</span>
              <button
                onClick={() => setModalType('details')}
                className="text-[#6610A8] hover:underline font-extrabold cursor-pointer"
              >
                &larr; กลับหน้ารายละเอียด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}