'use client';

import { useState, useEffect } from 'react';
import { getAllRestrooms, RestroomStatus } from '../services/api';

interface RestroomSpot {
  id: number;
  name: string;
  cx: number;
  cy: number;
  status: 'available' | 'maintenance';
  reason?: string;
}

// แผนผังพิกัดและ ID ตรงกับตาราง restroom_status ในฐานข้อมูล 100%
const initialFloorRestroomSpots: { [key: string]: RestroomSpot[] } = {
  'ชั้น 1': [
    { id: 1, name: 'ห้องน้ำชาย / ชั้น 1 โซน A', cx: 728, cy: 209.5, status: 'available' },
    { id: 2, name: 'ห้องน้ำหญิง / ชั้น 1 โซน A', cx: 717, cy: 184.5, status: 'available' },
    { id: 9, name: 'ห้องน้ำชาย / ชั้น 1 โซน B', cx: 249, cy: 222.5, status: 'available' },
    { id: 10, name: 'ห้องน้ำหญิง / ชั้น 1 โซน B', cx: 238, cy: 250.5, status: 'available' },
  ],
  'ชั้น 2': [
    { id: 22, name: 'ห้องน้ำหญิง / ชั้น 2 โซน หอประชุมพะเยา', cx: 352, cy: 221.5, status: 'available' },
    { id: 20, name: 'ห้องน้ำหญิง / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 557, cy: 259.5, status: 'available' },
    { id: 4, name: 'ห้องน้ำหญิง / ชั้น 2 โซน A', cx: 700, cy: 442.5, status: 'maintenance' },
    { id: 12, name: 'ห้องน้ำหญิง / ชั้น 2 โซน B', cx: 282, cy: 478.5, status: 'available' },
    { id: 21, name: 'ห้องน้ำชาย / ชั้น 2 โซน หอประชุมพะเยา', cx: 329, cy: 215.5, status: 'available' },
    { id: 19, name: 'ห้องน้ำชาย / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 537, cy: 265.4, status: 'available' },
    { id: 3, name: 'ห้องน้ำชาย / ชั้น 2 โซน A', cx: 690, cy: 421.4, status: 'available' },
    { id: 11, name: 'ห้องน้ำชาย / ชั้น 2 โซน B', cx: 290, cy: 457.5, status: 'available' },
  ],
  'ชั้น 3': [
    { id: 24, name: 'ห้องน้ำหญิง / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 333, cy: 231.5, status: 'maintenance', reason: 'ห้องน้ำชำรุดใช้งานไม่ได้' },
    { id: 18, name: 'ห้องน้ำหญิง / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 634, cy: 288.5, status: 'available' },
    { id: 6, name: 'ห้องน้ำหญิง / ชั้น 3 โซน A', cx: 745, cy: 475.4, status: 'available' },
    { id: 14, name: 'ห้องน้ำหญิง / ชั้น 3 โซน B', cx: 350, cy: 512, status: 'available' },
    { id: 23, name: 'ห้องน้ำชาย / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 313, cy: 224.5, status: 'maintenance', reason: 'ห้องน้ำชำรุดใช้งานไม่ได้' },
    { id: 17, name: 'ห้องน้ำชาย / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 615, cy: 295, status: 'available' },
    { id: 5, name: 'ห้องน้ำชาย / ชั้น 3 โซน A', cx: 737, cy: 452.5, status: 'available' },
    { id: 13, name: 'ห้องน้ำชาย / ชั้น 3 โซน B', cx: 358, cy: 489.5, status: 'available' },
  ],
  'ชั้น 4': [
    { id: 16, name: 'ห้องน้ำหญิง / ชั้น 4 โซน B', cx: 257, cy: 411.5, status: 'maintenance' },
    { id: 8, name: 'ห้องน้ำหญิง / ชั้น 4 โซน A', cx: 734, cy: 370, status: 'available' },
    { id: 15, name: 'ห้องน้ำชาย / ชั้น 4 โซน B', cx: 266, cy: 387.4, status: 'available' },
    { id: 7, name: 'ห้องน้ำชาย / ชั้น 4 โซน A', cx: 723, cy: 343.4, status: 'available' },
  ],
};

export default function ICTRestroomStatusPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState('ประเภทห้องน้ำที่เลือก');
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [floorRestroomSpots, setFloorRestroomSpots] = useState<{ [key: string]: RestroomSpot[] }>(initialFloorRestroomSpots);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const floors = ['ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4'];

  // ดึงข้อมูลสถานะจากตาราง restroom_status ในฐานข้อมูล Backend
  const fetchRestroomStatuses = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await getAllRestrooms();
      if (res && res.success && Array.isArray(res.data)) {
        const dbRestrooms: RestroomStatus[] = res.data;

        setFloorRestroomSpots((prev) => {
          const updated: { [key: string]: RestroomSpot[] } = {};

          Object.keys(prev).forEach((floor) => {
            updated[floor] = prev[floor].map((spot) => {
              // แมปด้วย id เป็นหลัก (ตรงกับ DB 1:1)
              const matched = dbRestrooms.find((r) => r.id === spot.id);

              if (matched) {
                const isAvailable = matched.status === 'พร้อมใช้งาน';
                return {
                  ...spot,
                  status: isAvailable ? 'available' : 'maintenance',
                  reason: isAvailable ? undefined : (matched.reason || 'ห้องน้ำไม่พร้อมใช้งานตามที่ระบุในฐานข้อมูล'),
                };
              }

              return spot;
            });
          });

          return updated;
        });
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastUpdated(timeStr);
    } catch (err) {
      console.warn('Error fetching restroom statuses from DB:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestroomStatuses(true);
    const interval = setInterval(() => fetchRestroomStatuses(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const getFloorImage = () => {
    if (selectedFloor === 'ชั้น 2') return '/photo/ICT-floor2.jpg';
    if (selectedFloor === 'ชั้น 3') return '/photo/ICT-floor3.jpg';
    if (selectedFloor === 'ชั้น 4') return '/photo/ICT-floor4.jpg';
    return '/photo/ICT-floor1.jpg';
  };

  const currentSpots = selectedFloor ? floorRestroomSpots[selectedFloor] : [];

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans pb-10">
      {/* --- Header --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center justify-between shadow-sm mb-6">
        <div>
          <h1 className="text-lg md:text-xl font-extrabold">สถานะห้องน้ำทั้งหมดในคณะ</h1>
          {lastUpdated && (
            <p className="text-[11px] md:text-xs text-purple-900 font-semibold mt-0.5">
              ● ซิงค์กับฐานข้อมูลล่าสุด {lastUpdated} น. (อัปเดตอัตโนมัติ)
            </p>
          )}
        </div>
        <button
          onClick={() => fetchRestroomStatuses(true)}
          disabled={isRefreshing}
          className="bg-white/80 hover:bg-white text-[#6610A8] px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          title="รีเฟรชข้อมูลสถานะ"
        >
          <span className={`inline-block ${isRefreshing ? 'animate-spin' : ''}`}>🔄</span>
          <span>{isRefreshing ? 'กำลังโหลด...' : 'รีเฟรช'}</span>
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        {/* --- ส่วนที่ 1: แผนที่ห้องน้ำแบบ SVG --- */}
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">แผนที่ห้องน้ำ</h2>

          <div className="bg-white border-[2px] border-[#b870e8] rounded-3xl p-3 md:p-4 shadow-sm flex items-center justify-center relative w-full">
            {selectedFloor ? (
              <div className="w-full max-w-2xl relative mx-auto flex">
                <svg viewBox="0 0 1000 700" className="w-full h-auto block rounded-2xl select-none overflow-visible">
                  <image
                    href={getFloorImage()}
                    width="1000"
                    height="700"
                    preserveAspectRatio="xMidYMid meet"
                    onLoad={() => setIsImageLoaded(true)}
                  />

                  {isImageLoaded &&
                    currentSpots.map((spot, index) => {
                      const isSelected = activePopup === spot.name;

                      return (
                        <g
                          key={index}
                          className="cursor-pointer"
                          onClick={() => {
                            if (activePopup === spot.name) {
                              setSelectedSpot('ประเภทห้องน้ำที่เลือก');
                              setActivePopup(null);
                            } else {
                              setSelectedSpot(spot.name);
                              setActivePopup(spot.name);
                            }
                          }}
                        >
                          <circle cx={spot.cx} cy={spot.cy} r={25} fill="transparent" />

                          <circle
                            cx={spot.cx}
                            cy={spot.cy}
                            r={10}
                            className={`${
                              spot.status === 'available'
                                ? 'fill-[#2E7D32]'
                                : 'fill-[#E00000]'
                            } ${isSelected ? 'animate-pulse' : ''} transition-all duration-200 shadow-md`}
                          />
                        </g>
                      );
                    })}
                </svg>

                {/* --- ส่วนการ์ด Popup ลอยตัว --- */}
                {activePopup &&
                  currentSpots
                    .filter((s) => s.name === activePopup)
                    .map((spot, i) => {
                      const leftPct = (spot.cx / 1000) * 100;
                      const topPct = (spot.cy / 700) * 100;

                      return (
                        <div
                          key={`popup-${i}`}
                          className="absolute z-30 flex flex-col items-center pointer-events-none animate-fade-in"
                          style={{
                            left: `${leftPct}%`,
                            top: `${topPct}%`,
                            transform: 'translate(-50%, -100%)',
                            marginTop: '-4px',
                          }}
                        >
                          <div className="bg-[#1E222B] text-white rounded-xl md:rounded-2xl p-2.5 md:p-3 shadow-2xl flex flex-col items-center text-center w-48 md:w-56">
                            <div className="text-[10px] md:text-sm font-extrabold text-white pb-1.5 border-b border-gray-600/60 w-full truncate">
                              {spot.name}
                            </div>

                            <div className="flex items-center justify-center gap-1.5 mt-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  spot.status === 'available' ? 'bg-[#4ADE80]' : 'bg-[#F87171]'
                                }`}
                              />
                              <span
                                className={`text-[10px] md:text-sm font-bold ${
                                  spot.status === 'available' ? 'text-[#4ADE80]' : 'text-white'
                                }`}
                              >
                                {spot.status === 'available' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                              </span>
                            </div>

                            {spot.status === 'maintenance' && spot.reason && (
                              <p className="text-[10px] md:text-xs text-[#FCA5A5] mt-1.5 leading-snug font-medium">
                                สาเหตุ: {spot.reason}
                              </p>
                            )}
                          </div>

                          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#1E222B]"></div>
                        </div>
                      );
                    })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-black py-16">
                <svg
                  className="w-20 h-20 stroke-black fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" />
                  <path d="M9 3v15" />
                  <path d="M15 6v15" />
                  <path d="M12 4a2.5 2.5 0 0 0-2.5 2.5c0 1.8 2.5 4.5 2.5 4.5s2.5-2.7 2.5-4.5A2.5 2.5 0 0 0 12 4z" strokeWidth="1" />
                  <circle cx="12" cy="6.5" r="0.8" fill="black" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* --- ส่วนที่ 2: สัญลักษณ์สี --- */}
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm flex items-center justify-around">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#E00000] inline-block shadow-sm"></span>
            <span className="text-xs md:text-sm font-bold text-black">ไม่พร้อมใช้งาน</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#2E7D32] inline-block shadow-sm"></span>
            <span className="text-xs md:text-sm font-bold text-black">พร้อมใช้งาน</span>
          </div>
        </div>

        {/* --- ส่วนที่ 3: เมนูดรอปดาวน์เลือกชั้น --- */}
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">กรุณาเลือกชั้นที่ต้องการดู</h2>

          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-black/30 rounded-2xl p-4 text-sm md:text-base text-black flex items-center justify-between cursor-pointer shadow-sm select-none"
            >
              <span className={selectedFloor ? 'text-black font-semibold' : 'text-gray-500'}>
                {selectedFloor || 'เลือกชั้น'}
              </span>
              <span>{isDropdownOpen ? '▲' : '▼'}</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-black/20 rounded-2xl shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto">
                {floors.map((floor) => (
                  <div
                    key={floor}
                    onClick={() => {
                      setSelectedFloor(floor);
                      setIsImageLoaded(false);
                      setIsDropdownOpen(false);
                      setActivePopup(null);
                      setSelectedSpot('ประเภทห้องน้ำที่เลือก');
                    }}
                    className="px-4 py-3 bg-purple-50 hover:bg-purple-100 cursor-pointer text-sm md:text-base font-extrabold text-black border-b border-gray-100 last:border-none"
                  >
                    {floor}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- กล่องแสดงชื่อห้องน้ำที่เลือก (ล็อกให้กดไม่ได้ 100%) --- */}
        <div
          className={`bg-white border border-black/30 rounded-2xl p-4 text-center font-bold text-sm md:text-base shadow-sm pointer-events-none select-none ${
            selectedSpot !== 'ประเภทห้องน้ำที่เลือก' ? 'text-black' : 'text-gray-400'
          }`}
        >
          {selectedSpot}
        </div>
      </div>
    </div>
  );
}