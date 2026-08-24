'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RestroomSpot {
  name: string;
  cx: number;
  cy: number;
  status: 'available' | 'maintenance' | 'pending';
  reason?: string;
}

export default function ICTRestroomStatusPage() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // แยก State: อันนึงเก็บชั้นที่เลือก(เพื่อเปลี่ยนแผนที่) อีกอันเก็บชื่อห้องน้ำที่กด(เพื่อโชว์กล่องล่าง)
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null); 
  const [selectedSpot, setSelectedSpot] = useState('ประเภทห้องน้ำที่เลือก');
  const [activePopup, setActivePopup] = useState<string | null>(null);

  // เมนูเหลือแค่ชั้น 1-4
  const floors = ['ชั้น 1', 'ชั้น 2', 'ชั้น 3', 'ชั้น 4'];

  const floorRestroomSpots: { [key: string]: RestroomSpot[] } = {
    'ชั้น 1': [
      { name: 'ห้องน้ำหญิง / ชั้น 1 โซน A', cx: 725, cy: 213.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 1 โซน A', cx: 708, cy: 178.5, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 1 โซน B', cx: 235, cy: 248.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 1 โซน B', cx: 252, cy: 213.5, status: 'available' }
    ],
    'ชั้น 2': [
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน หอประชุมพะเยา', cx: 360, cy: 213.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน หอประชุมพะเยา', cx: 320, cy: 199.5, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 585, cy: 269.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน D (บริเวณ งานบริการระบบเครือข่ายคอมพิวเตอร์)', cx: 525, cy: 295.4, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน A', cx: 685, cy: 458.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน A', cx: 670, cy: 414.4, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 2 โซน B', cx: 255, cy: 486.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 2 โซน B', cx: 265, cy: 437.5, status: 'available' }
    ],
    'ชั้น 3': [
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 305, cy: 199.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน C (ห้องน้ำชำรุดใช้งานไม่ได้)', cx: 350, cy: 213.5, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 675, cy: 332.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน D (บริเวณห้องCITCOMS)', cx: 635, cy: 357, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน A', cx: 705, cy: 491.4, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน A', cx: 695, cy: 451.5, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 3 โซน B', cx: 330, cy: 511, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 3 โซน B', cx: 342, cy: 472.5, status: 'available' }
    ],
    'ชั้น 4': [
      { name: 'ห้องน้ำหญิง / ชั้น 4 โซน B', cx: 230, cy: 416.5, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 4 โซน B', cx: 248, cy: 372.4, status: 'available' },
      { name: 'ห้องน้ำหญิง / ชั้น 4 โซน A', cx: 720, cy: 378, status: 'available' },
      { name: 'ห้องน้ำชาย / ชั้น 4 โซน A', cx: 710, cy: 337.4, status: 'available' }
    ]
  };

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
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center space-x-4 shadow-sm mb-6">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            window.close(); // ลองสั่งปิดหน้าต่าง (สำหรับ LINE)
            setTimeout(() => router.push('/'), 300); // ถ้าปิดไม่ได้ให้กลับหน้าหลัก (สำหรับ PC)
          }} 
          className="text-xl font-bold hover:opacity-75 transition-opacity"
        >
          &lt;
        </button>
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
                  <image href={getFloorImage()} width="1000" height="700" preserveAspectRatio="xMidYMid meet" />
                  
                  {currentSpots.map((spot, index) => {
                    const isSelected = selectedSpot === spot.name;

                    return (
                      <g 
                        key={index} 
                        className="cursor-pointer" 
                        onClick={() => {
                          setSelectedSpot(spot.name);
                          setActivePopup(activePopup === spot.name ? null : spot.name);
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

        {/* --- ส่วนที่ 3: เมนูดรอปดาวน์เลือกชั้น (เอาซับเมนูออก) --- */}
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
                      setIsDropdownOpen(false);
                      setActivePopup(null); 
                      setSelectedSpot('ประเภทห้องน้ำที่เลือก'); // รีเซ็ตชื่อกล่องล่างเมื่อเปลี่ยนชั้น
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

        {/* --- ส่วนที่ 4: กล่องแสดงประเภทห้องน้ำที่กดจากแผนที่ --- */}
        <div className={`bg-white border border-black/30 rounded-2xl p-4 text-center font-bold text-sm md:text-base shadow-sm ${
          selectedSpot !== 'ประเภทห้องน้ำที่เลือก' ? 'text-black' : 'text-gray-400'
        }`}>
          {selectedSpot}
        </div>

      </div>
    </div>
  );
}