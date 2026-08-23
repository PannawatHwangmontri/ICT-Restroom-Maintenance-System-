'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RestroomSpot {
  name: string;
  cx: number;
  cy: number;
  status: 'available' | 'maintenance' | 'pending';
  reason?: string;
}

export default function ICTRestroomStatusPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('ประเภทห้องน้ำที่เลือก');
  const [activeFloor, setActiveFloor] = useState<string | null>(null);
  const [activePopup, setActivePopup] = useState<string | null>(null);

  const locationHierarchy: { [key: string]: string[] } = {
    'ชั้น 1': [
      'ห้องน้ำหญิง / ชั้น 1 โซน A',
      'ห้องน้ำหญิง / ชั้น 1 โซน B',
      'ห้องน้ำชาย / ชั้น 1 โซน A',
      'ห้องน้ำชาย / ชั้น 1 โซน B'
    ],
    'ชั้น 2': [
      'ห้องน้ำหญิง / ชั้น 2 โซน A',
      'ห้องน้ำหญิง / ชั้น 2 โซน B',
      'ห้องน้ำหญิง / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)',
      'ห้องน้ำหญิง / ชั้น 2 โซน หอประชุมพะเยา',
      'ห้องน้ำชาย / ชั้น 2 โซน A',
      'ห้องน้ำชาย / ชั้น 2 โซน B',
      'ห้องน้ำชาย / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)',
      'ห้องน้ำชาย / ชั้น 2 โซน หอประชุมพะเยา'
    ],
    'ชั้น 3': [
      'ห้องน้ำหญิง / ชั้น 3 โซน A',
      'ห้องน้ำหญิง / ชั้น 3 โซน B',
      'ห้องน้ำหญิง / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)',
      'ห้องน้ำหญิง / ชั้น 3 โซน D (บริเวณห้องCITCOMS)',
      'ห้องน้ำชาย / ชั้น 3 โซน A',
      'ห้องน้ำชาย / ชั้น 3 โซน B',
      'ห้องน้ำชาย / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)',
      'ห้องน้ำชาย / ชั้น 3 โซน D (บริเวณห้องCITCOMS)'
    ],
    'ชั้น 4': [
      'ห้องน้ำหญิง / ชั้น 4 โซน A',
      'ห้องน้ำหญิง / ชั้น 4 โซน B',
      'ห้องน้ำชาย / ชั้น 4 โซน A',
      'ห้องน้ำชาย / ชั้น 4 โซน B'
    ]
  };

  const floorRestroomSpots: { [key: string]: RestroomSpot[] } = {
    'ชั้น 1': [
      { name: 'ห้องน้ำหญิง / ชั้น 1 โซน B', cx: 260, cy: 227, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 1 โซน B', cx: 253, cy: 247, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 1 โซน A', cx: 769, cy: 164, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 1 โซน A', cx: 777, cy: 184, status: 'pending' },
    ],
    'ชั้น 2': [
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน หอประชุมพะเยา', cx: 320, cy: 220, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน หอประชุมพะเยา', cx: 312, cy: 241, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 575, cy: 270, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 580, cy: 290, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน A', cx: 735, cy: 405, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน A', cx: 744, cy: 425, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน B', cx: 295, cy: 460, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน B', cx: 289, cy: 480, status: 'pending' },
    ],
    'ชั้น 3': [
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 305, cy: 224, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 299, cy: 244, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 645, cy: 295, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 653, cy: 315, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน A', cx: 775, cy: 440, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน A', cx: 783, cy: 460, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน B', cx: 363, cy: 490, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน B', cx: 356, cy: 510, status: 'pending' },
    ],
    'ชั้น 4': [
      { name: 'ห้องน้ำหญิง / ชั้น 4 โซน B', cx: 275, cy: 387, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 4 โซน B', cx: 268, cy: 407, status: 'pending' },
      { name: 'ห้องน้ำหญิง / ชั้น 4 โซน A', cx: 780, cy: 325, status: 'pending' },
      { name: 'ห้องน้ำชาย / ชั้น 4 โซน A', cx: 786, cy: 344, status: 'pending' },
    ]
  };

  const hasSelected = selectedLocation !== 'ประเภทห้องน้ำที่เลือก';

  const getCurrentFloorKey = () => {
    if (selectedLocation.includes('ชั้น 2')) return 'ชั้น 2';
    if (selectedLocation.includes('ชั้น 3')) return 'ชั้น 3';
    if (selectedLocation.includes('ชั้น 4')) return 'ชั้น 4';
    if (selectedLocation.includes('ชั้น 1')) return 'ชั้น 1';
    return activeFloor || 'ชั้น 1';
  };

  const getFloorImage = () => {
    const floor = getCurrentFloorKey();
    if (floor === 'ชั้น 2') return '/photo/ICT-floor2.jpg';
    if (floor === 'ชั้น 3') return '/photo/ICT-floor3.jpg';
    if (floor === 'ชั้น 4') return '/photo/ICT-floor4.jpg';
    return '/photo/ICT-floor1.jpg';
  };

  const currentFloorKey = getCurrentFloorKey();
  const currentSpots = floorRestroomSpots[currentFloorKey] || [];

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans pb-10">
      
      {/* --- Header --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center space-x-4 shadow-sm mb-6">
        <Link href="/" className="text-xl font-bold hover:opacity-75 transition-opacity">
          &lt;
        </Link>
        <h1 className="text-lg md:text-xl font-extrabold">สถานะห้องน้ำทั้งหมดในคณะ</h1>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6 pt-0">
        
        {/* --- ส่วนที่ 1: แผนที่ห้องน้ำแบบ SVG --- */}
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">แผนที่ห้องน้ำ</h2>

          <div className="bg-white border-[2px] border-[#b870e8] rounded-3xl p-3 md:p-4 shadow-sm flex items-center justify-center relative w-full">
            
            {hasSelected ? (
              <div className="w-full max-w-2xl relative mx-auto flex">
                <svg viewBox="0 0 1000 700" className="w-full h-auto block rounded-2xl select-none overflow-visible">
                  <image href={getFloorImage()} width="1000" height="700" preserveAspectRatio="xMidYMid meet" />
                  
                  {currentSpots.map((spot, index) => {
                    const isSelected = selectedLocation === spot.name;

                    return (
                      <g 
                        key={index} 
                        className="cursor-pointer" 
                        onClick={() => {
                          setSelectedLocation(spot.name);
                          setActivePopup(activePopup === spot.name ? null : spot.name);
                        }}
                      >
                        {/* 1. เพิ่มพื้นที่กดล่องหน (Invisible Touch Target) โปร่งใส มองไม่เห็นแต่กดติดง่าย */}
                        <circle 
                          cx={spot.cx} 
                          cy={spot.cy} 
                          r={25} 
                          fill="transparent" 
                        />
                        
                        {/* 2. จุดแสดงผลจริง ขนาดเท่าเดิม (รักษาสมดุลไม่ให้ทับกัน) */}
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

        {/* --- ส่วนที่ 3: กล่องแสดงประเภทห้องน้ำที่เลือก --- */}
        <div className={`bg-white border border-black/30 rounded-2xl p-4 text-center font-bold text-sm md:text-base shadow-sm ${
          hasSelected ? 'text-black' : 'text-gray-400'
        }`}>
          {selectedLocation}
        </div>

        {/* --- ส่วนที่ 4: เมนูดรอปดาวน์เลือกชั้น --- */}
        <div>
          <h2 className="text-base font-extrabold text-black mb-3">กรุณาเลือกชั้นที่ต้องการดู</h2>

          <div className="relative">
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-black/30 rounded-2xl p-4 text-sm md:text-base text-black flex items-center justify-between cursor-pointer shadow-sm select-none"
            >
              <span className={hasSelected ? 'text-black font-semibold' : 'text-gray-500'}>
                {hasSelected ? selectedLocation : 'เลือกชั้น'}
              </span>
              <span>{isDropdownOpen ? '▲' : '▼'}</span>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-black/20 rounded-2xl shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto">
                {Object.keys(locationHierarchy).map((floor) => (
                  <div key={floor} className="border-b border-gray-100 last:border-none">
                    <div 
                      onClick={() => setActiveFloor(activeFloor === floor ? null : floor)}
                      className="px-4 py-3 bg-purple-50 hover:bg-purple-100 cursor-pointer text-sm md:text-base font-extrabold text-black flex items-center justify-between"
                    >
                      <span>{floor}</span>
                      <span className="text-xs">{activeFloor === floor ? '▲' : '▼'}</span>
                    </div>

                    {activeFloor === floor && (
                      <div className="bg-white flex flex-col">
                        {locationHierarchy[floor].map((subItem, index) => (
                          <div 
                            key={index}
                            onClick={() => {
                              setSelectedLocation(subItem);
                              setIsDropdownOpen(false);
                              setActiveFloor(null);
                              setActivePopup(null); 
                            }}
                            className="px-6 py-2.5 hover:bg-purple-50 cursor-pointer text-xs md:text-sm text-gray-700 border-b border-gray-50 last:border-none"
                          >
                            - {subItem}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}