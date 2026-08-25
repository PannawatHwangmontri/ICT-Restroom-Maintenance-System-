'use client';

import { useState, useEffect } from 'react';
import { getAllRestrooms, getAllRequests } from '../services/api';

interface RestroomSpot {
  name: string;
  cx: number;
  cy: number;
  status: 'available' | 'maintenance' | 'pending';
  reason?: string;
}

const initialFloorRestroomSpots: { [key: string]: RestroomSpot[] } = {
  'ชั้น 1': [
    // 📍 สลับพิกัด ชั้น 1 โซน A และ B ให้จุดบนเป็นผู้ชาย จุดหน้าเป็นผู้หญิงทั้ง 2 ฝั่ง
    { name: 'ห้องน้ำชาย / ชั้น 1 โซน A', cx: 728, cy: 209.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 1 โซน A', cx: 717, cy: 184.5, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 1 โซน B', cx: 249, cy: 222.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 1 โซน B', cx: 238, cy: 250.5, status: 'available' }
  ],
  'ชั้น 2': [
    { name: 'ห้องน้ำหญิง / ชั้น 2 โซน หอประชุมพะเยา', cx: 352, cy: 221.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 557, cy: 259.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 2 โซน A', cx: 700, cy: 442.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 2 โซน B', cx: 282, cy: 478.5, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 2 โซน หอประชุมพะเยา', cx: 329, cy: 215.5, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 537, cy: 265.4, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 2 โซน A', cx: 690, cy: 421.4, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 2 โซน B', cx: 290, cy: 457.5, status: 'available' }
  ],
  'ชั้น 3': [
    { name: 'ห้องน้ำหญิง / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 333, cy: 231.5, status: 'maintenance', reason: 'ห้องน้ำชำรุดใช้งานไม่ได้' },
    { name: 'ห้องน้ำหญิง / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 634, cy: 288.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 3 โซน A', cx: 745, cy: 475.4, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 3 โซน B', cx: 350, cy: 512, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 313, cy: 224.5, status: 'maintenance', reason: 'ห้องน้ำชำรุดใช้งานไม่ได้' },
    { name: 'ห้องน้ำชาย / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 615, cy: 295, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 3 โซน A', cx: 737, cy: 452.5, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 3 โซน B', cx: 358, cy: 489.5, status: 'available' }
  ],
  'ชั้น 4': [
    { name: 'ห้องน้ำหญิง / ชั้น 4 โซน B', cx: 257, cy: 411.5, status: 'available' },
    { name: 'ห้องน้ำหญิง / ชั้น 4 โซน A', cx: 734, cy: 370, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 4 โซน B', cx: 266, cy: 387.4, status: 'available' },
    { name: 'ห้องน้ำชาย / ชั้น 4 โซน A', cx: 723, cy: 343.4, status: 'available' }
  ]
};

// Helper ฟังก์ชันเปรียบเทียบสถานที่ให้ตรงกัน 100%
const isLocationMatch = (nameA: string, nameB: string) => {
  if (!nameA || !nameB) return false;

  // 1. ตรวจสอบเพศ (ชาย / หญิง)
  const isMaleA = nameA.includes('ชาย');
  const isMaleB = nameB.includes('ชาย');
  const isFemaleA = nameA.includes('หญิง');
  const isFemaleB = nameB.includes('หญิง');
  if (isMaleA !== isMaleB && (isMaleA || isMaleB) && (isFemaleA || isFemaleB)) {
    return false;
  }

  // 2. ตรวจสอบชั้น (ชั้น 1, 2, 3, 4)
  for (let f = 1; f <= 4; f++) {
    const hasFloorA = nameA.includes(`ชั้น ${f}`) || nameA.includes(`ชั้น${f}`);
    const hasFloorB = nameB.includes(`ชั้น ${f}`) || nameB.includes(`ชั้น${f}`);
    if (hasFloorA !== hasFloorB && (hasFloorA || hasFloorB)) {
      return false;
    }
  }

  // 3. ตรวจสอบโซน / บริเวณ
  const zones = [
    'โซน a', 'โซน a',
    'โซน b', 'โซน b',
    'โซน c', 'โซน c',
    'โซน d', 'โซน d',
    'หอประชุมพะเยา',
    'citcoms',
    'งานบริการระบบเครือข่ายคอมพิวเตอร์',
  ];

  const lowerA = nameA.toLowerCase();
  const lowerB = nameB.toLowerCase();

  let zoneMatched = false;
  for (const z of zones) {
    const hasZA = lowerA.includes(z);
    const hasZB = lowerB.includes(z);
    if (hasZA && hasZB) {
      zoneMatched = true;
      break;
    }
  }

  if (zoneMatched) return true;

  // Fallback เปรียบเทียบแบบตัดช่องว่าง
  const cleanA = lowerA.replace(/[\s/()（）-]/g, '');
  const cleanB = lowerB.replace(/[\s/()（）-]/g, '');
  return cleanA === cleanB;
};

export default function ICTRestroomStatusPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null); 
  const [selectedSpot, setSelectedSpot] = useState('ประเภทห้องน้ำที่เลือก');
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [floorRestroomSpots, setFloorRestroomSpots] = useState<{ [key: string]: RestroomSpot[] }>(initialFloorRestroomSpots);

  const floors = ['ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4'];

  // ดึงข้อมูลสถานะจากฐานข้อมูล Backend
  useEffect(() => {
    const fetchRestroomStatuses = async () => {
      try {
        const [restroomRes, requestRes] = await Promise.allSettled([
          getAllRestrooms(),
          getAllRequests(),
        ]);

        const dbRestrooms = restroomRes.status === 'fulfilled' && restroomRes.value.success ? restroomRes.value.data : [];
        const dbRequests = requestRes.status === 'fulfilled' && requestRes.value.success ? requestRes.value.data : [];

        setFloorRestroomSpots((prev) => {
          const updated: { [key: string]: RestroomSpot[] } = {};

          Object.keys(prev).forEach((floor) => {
            updated[floor] = prev[floor].map((spot) => {
              // 1. เช็กจากตาราง restroom_status โดยตรง
              const matchedRestroom = Array.isArray(dbRestrooms)
                ? dbRestrooms.find((r) => isLocationMatch(r.location_name, spot.name))
                : null;

              // 2. เช็กจากการแจ้งซ่อมที่ยังไม่เสร็จ (รอรับเรื่อง, แจ้งแล้ว, กำลังดำเนินการ)
              const activeRequest = Array.isArray(dbRequests)
                ? dbRequests.find(
                    (req) =>
                      isLocationMatch(req.location, spot.name) &&
                      (req.status === 'รอรับเรื่อง' || req.status === 'แจ้งแล้ว' || req.status === 'กำลังดำเนินการ')
                  )
                : null;

              // 1) ถ้าในฐานข้อมูล restroom_status กำหนดสถานะไว้โดยตรง ให้ยึดตามนั้นเป็นหลัก
              if (matchedRestroom) {
                if (matchedRestroom.status === 'ไม่พร้อมใช้งาน') {
                  return {
                    ...spot,
                    status: 'maintenance',
                    reason: matchedRestroom.reason || 'ไม่พร้อมใช้งานตามที่ระบุในฐานข้อมูล',
                  };
                } else if (matchedRestroom.status === 'พร้อมใช้งาน') {
                  return {
                    ...spot,
                    status: 'available',
                    reason: undefined,
                  };
                }
              }

              // 2) ถ้ามีรายการแจ้งซ่อมอยู่ระหว่างดำเนินการ
              if (activeRequest) {
                return {
                  ...spot,
                  status: 'maintenance',
                  reason: activeRequest.issue_summary || 'มีการแจ้งปัญหาอยู่ระหว่างดำเนินการ',
                };
              }

              // 3) ค่าเริ่มต้น
              const isDefaultBroken = spot.name.includes('ห้องน้ำชำรุดใช้งานไม่ได้');
              if (isDefaultBroken) {
                return {
                  ...spot,
                  status: 'maintenance',
                  reason: 'ห้องน้ำชำรุดใช้งานไม่ได้',
                };
              }

              return {
                ...spot,
                status: 'available',
                reason: undefined,
              };
            });
          });

          return updated;
        });
      } catch (err) {
        console.warn('Error fetching restroom statuses:', err);
      }
    };

    fetchRestroomStatuses();
    const interval = setInterval(fetchRestroomStatuses, 10000);
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
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center shadow-sm mb-6">
        {/* 📍 เอาปุ่ม < ออกเรียบร้อยครับ */}
        <h1 className="text-lg md:text-xl font-extrabold">สถานะห้องน้ำทั้งหมดในคณะ</h1>
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
                  
                  {isImageLoaded && currentSpots.map((spot, index) => {
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
                        <circle 
                          cx={spot.cx} 
                          cy={spot.cy} 
                          r={25} 
                          fill="transparent" 
                        />
                        
                        <circle 
                          cx={spot.cx} 
                          cy={spot.cy} 
                          r={10} 
                          className={`${
                            spot.status === 'available' ? 'fill-[#2E7D32]' : 
                            spot.status === 'maintenance' ? 'fill-[#E00000]' : 'fill-[#9CA3AF]'
                          } ${isSelected ? 'animate-pulse' : ''} transition-all duration-200 shadow-md`}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* --- ส่วนการ์ด Popup ลอยตัว --- */}
                {activePopup && currentSpots.filter(s => s.name === activePopup).map((spot, i) => {
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
                        marginTop: '-4px' 
                      }}
                    >
                      <div className="bg-[#1E222B] text-white rounded-xl md:rounded-2xl p-2.5 md:p-3 shadow-2xl flex flex-col items-center text-center w-48 md:w-56">
                        <div className="text-[10px] md:text-sm font-extrabold text-white pb-1.5 border-b border-gray-600/60 w-full truncate">
                          {spot.name}
                        </div>

                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <span className={`w-2 h-2 rounded-full ${
                            spot.status === 'available' ? 'bg-[#4ADE80]' : 
                            spot.status === 'maintenance' ? 'bg-[#F87171]' : 'bg-[#9CA3AF]'
                          }`} />
                          <span className={`text-[10px] md:text-sm font-bold ${
                            spot.status === 'available' ? 'text-[#4ADE80]' : 
                            spot.status === 'maintenance' ? 'text-white' : 'text-gray-300'
                          }`}>
                            {spot.status === 'available' ? 'พร้อมใช้งาน' : 
                             spot.status === 'maintenance' ? 'ไม่พร้อมใช้งาน' : 'กำลังโหลดสถานะ...'}
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
        <div className={`bg-white border border-black/30 rounded-2xl p-4 text-center font-bold text-sm md:text-base shadow-sm pointer-events-none select-none ${
          selectedSpot !== 'ประเภทห้องน้ำที่เลือก' ? 'text-black' : 'text-gray-400'
        }`}>
          {selectedSpot}
        </div>

      </div>
    </div>
  );
}