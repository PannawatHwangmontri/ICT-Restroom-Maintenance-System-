'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ReportPage() {
  const router = useRouter();
  const [isUrgent, setIsUrgent] = useState(false);
  
  // สถานะสำหรับ Location
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('เลือกสถานที่');
  const [activeFloor, setActiveFloor] = useState<string | null>(null);

  // สถานะสำหรับ Category
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('เลือกหมวดหมู่ปัญหา');
  const [activeCategoryGroup, setActiveCategoryGroup] = useState<string | null>(null);
  
  // สถานะสำหรับกรอกจำนวน (กรณีเลือกหัวข้อระบบไฟฟ้า)
  const [electricCount, setElectricCount] = useState('');

  // สถานะสำหรับหมายเหตุ
  const [noteText, setNoteText] = useState('');

  // สถานะสำหรับไฟล์รูปภาพ & Image Preview URL
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // สถานะควบคุม Pop-up
  const [modalStep, setModalStep] = useState<'confirm' | 'success' | 'leave' | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

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

  const categoryHierarchy: { [key: string]: string[] } = {
    'ระบบน้ำ': [
      'ก๊อกน้ำอ่างล้างมือที่ 1 ชำรุด',
      'ก๊อกน้ำอ่างล้างมือที่ 2 ชำรุด',
      'ก๊อกน้ำอ่างล้างมือที่ 3 ชำรุด',
      'ก๊อกน้ำอ่างล้างมือที่ 4 ชำรุด',
      'สายฉีดชำระห้องที่ 1 ชำรุด',
      'สายฉีดชำระห้องที่ 2 ชำรุด',
      'สายฉีดชำระห้องที่ 3 ชำรุด',
      'สายฉีดชำระห้องที่ 4 ชำรุด',
      'ท่อน้ำรั่ว',
      'น้ำท่วมขังบริเวณห้องน้ำ'
    ],
    'สุขภัณฑ์': [
      'โถส้วมห้องที่ 1 ชำรุด',
      'โถส้วมห้องที่ 2 ชำรุด',
      'โถส้วมห้องที่ 3 ชำรุด',
      'โถส้วมห้องที่ 4 ชำรุด',
      'ฝารองนั่งห้องที่ 1 ชำรุด',
      'ฝารองนั่งห้องที่ 2 ชำรุด',
      'ฝารองนั่งห้องที่ 3 ชำรุด',
      'ฝารองนั่งห้องที่ 4 ชำรุด',
      'อ่างล้างมือ 1 ชำรุด',
      'อ่างล้างมือ 2 ชำรุด',
      'อ่างล้างมือ 3 ชำรุด',
      'อ่างล้างมือ 4 ชำรุด'
    ],
    'ระบบไฟฟ้า': [
      'ไฟในห้องน้ำไม่ติด',
      'หลอดไฟเสีย',
      'ไฟกระพริบ'
    ]
  };

  const isElectricCategory = selectedCategory === 'ไฟในห้องน้ำไม่ติด' || selectedCategory === 'หลอดไฟเสีย' || selectedCategory === 'ไฟกระพริบ';

  const hasFormStarted = selectedLocation !== 'เลือกสถานที่' || 
                         selectedCategory !== 'เลือกหมวดหมู่ปัญหา' || 
                         electricCount !== '' || 
                         noteText !== '' || 
                         selectedFile !== null || 
                         isUrgent;

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasFormStarted) {
      setPendingUrl('close');
      setModalStep('leave');
    } else {
      window.close();
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    const isLocationEmpty = selectedLocation === 'เลือกสถานที่';
    const isCategoryEmpty = selectedCategory === 'เลือกหมวดหมู่ปัญหา';
    const isFileEmpty = !selectedFile;

    if (isLocationEmpty && isCategoryEmpty && isFileEmpty) {
      setAlertMessage('กรุณากรอกข้อมูลให้ครบถ้วนก่อนกดส่งข้อมูลแจ้งปัญหา');
      return;
    }

    if (isLocationEmpty) {
      setAlertMessage('กรุณาเลือกสถานที่');
      return;
    }

    if (isCategoryEmpty) {
      setAlertMessage('กรุณาเลือกหมวดหมู่ปัญหาก่อนส่งข้อมูล');
      return;
    }
    
    if (isElectricCategory && !electricCount) {
      setAlertMessage('กรุณาระบุจำนวนจุดที่พบปัญหา');
      return;
    }

    if (isFileEmpty) {
      setAlertMessage('กรุณาแนบรูปหลักฐานทุกครั้งก่อนกดแจ้งปัญหา');
      return;
    }

    setModalStep('confirm');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9FF] flex flex-col font-sans relative">
      
      {/* --- Header --- */}
      <div className="w-full bg-[#E4C5F9] text-black px-4 py-4 md:px-8 md:py-5 flex items-center space-x-4 shadow-sm mb-6">
        <h1 className="text-lg md:text-xl font-extrabold">แจ้งรายละเอียดปัญหา</h1>
      </div>

      {/* --- เนื้อหาฟอร์ม --- */}
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col flex-1 pt-0">
        <form onSubmit={handleSubmitReport} className="flex flex-col gap-6 flex-1">
          
          {/* 1. เลือกสถานที่ */}
          <div className="bg-[#E4C5F9]/60 border border-[#D5B0F2] rounded-3xl p-5 md:p-6 shadow-sm">
            <label className="block text-sm md:text-base font-bold text-black mb-3 flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden shrink-0 flex items-center justify-center">
                <img src="/photo/image.png" alt="Location Icon" className="w-full h-full object-contain" />
              </div>
              <span>สถานที่</span>
            </label>

            <div className="relative">
              <div 
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="w-full bg-white border border-black/30 rounded-2xl p-3.5 text-sm md:text-base text-black flex items-center justify-between cursor-pointer shadow-sm select-none"
              >
                <span className={selectedLocation === 'เลือกสถานที่' ? 'text-black' : 'text-black font-semibold'}>
                  {selectedLocation}
                </span>
                <span className="text-sm">{isLocationOpen ? '▲' : '▼'}</span>
              </div>

              {isLocationOpen && (
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
                          {locationHierarchy[floor].map((subItem, index) => {
                            // 📍 เช็กเงื่อนไขห้องน้ำชำรุด
                            const isBroken = subItem.includes('ห้องน้ำชำรุดใช้งานไม่ได้');

                            return (
                              <div 
                                key={index}
                                onClick={() => {
                                  if (isBroken) return; // ล็อกไม่ให้คลิกเลือกได้
                                  setSelectedLocation(subItem);
                                  setIsLocationOpen(false);
                                  setActiveFloor(null);
                                }}
                                className={`px-6 py-2.5 text-xs md:text-sm border-b border-gray-50 last:border-none ${
                                  isBroken 
                                    ? 'text-gray-400 bg-gray-50 cursor-not-allowed' // สไตล์เมื่อกดไม่ได้
                                    : 'text-gray-700 hover:bg-purple-50 cursor-pointer' // สไตล์ปกติ
                                }`}
                              >
                                - {subItem}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. เลือกหมวดหมู่ปัญหา */}
          <div>
            <label className="block text-base md:text-lg font-extrabold text-black mb-1">
              เลือกหมวดหมู่ปัญหา
            </label>
            <p className="text-xs text-[#E00000] mb-3">
              หมายเหตุ: ลำดับห้องน้ำและสุขภัณฑ์ จะนับจากซ้ายไปขวา
            </p>

            <div className="relative mb-3">
              <div 
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full bg-white border border-black/30 rounded-2xl p-3.5 text-sm md:text-base text-black flex items-center justify-between cursor-pointer shadow-sm select-none"
              >
                <span className={selectedCategory === 'เลือกหมวดหมู่ปัญหา' ? 'text-black' : 'text-black font-semibold'}>
                  {selectedCategory}
                </span>
                <span className="text-sm">{isCategoryOpen ? '▲' : '▼'}</span>
              </div>

              {isCategoryOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-black/20 rounded-2xl shadow-xl overflow-hidden z-20 max-h-80 overflow-y-auto">
                  {Object.keys(categoryHierarchy).map((group) => (
                    <div key={group} className="border-b border-gray-100 last:border-none">
                      <div 
                        onClick={() => setActiveCategoryGroup(activeCategoryGroup === group ? null : group)}
                        className="px-4 py-3 bg-purple-50 hover:bg-purple-100 cursor-pointer text-sm md:text-base font-extrabold text-black flex items-center justify-between"
                      >
                        <span>{group}</span>
                        <span className="text-xs">{activeCategoryGroup === group ? '▲' : '▼'}</span>
                      </div>

                      {activeCategoryGroup === group && (
                        <div className="bg-white flex flex-col">
                          {categoryHierarchy[group].map((item, index) => (
                            <div 
                              key={index}
                              onClick={() => {
                                setSelectedCategory(item);
                                setIsCategoryOpen(false);
                                setActiveCategoryGroup(null);
                              }}
                              className="px-6 py-2.5 hover:bg-purple-50 cursor-pointer text-xs md:text-sm text-gray-700 border-b border-gray-50 last:border-none"
                            >
                              - {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isElectricCategory ? (
              <div className="flex items-center gap-3 bg-white border border-black/30 rounded-2xl p-3.5">
                <span className="text-sm md:text-base text-black font-semibold shrink-0">จำนวนจุดที่พบปัญหา:</span>
                <input 
                  type="number" 
                  min="1"
                  placeholder="ระบุจำนวน (กี่จุด/กี่หลอด)" 
                  value={electricCount}
                  onChange={(e) => setElectricCount(e.target.value)}
                  className="w-full bg-transparent text-sm md:text-base text-black focus:outline-none"
                />
              </div>
            ) : (
              <input 
                type="text" 
                readOnly
                value={selectedCategory === 'เลือกหมวดหมู่ปัญหา' ? '' : selectedCategory}
                placeholder="ประเภทปัญหาที่เลือก" 
                className="w-full bg-white border border-black/30 rounded-2xl p-3.5 text-sm md:text-base text-gray-700 focus:outline-none"
              />
            )}
          </div>

          {/* 3. แนบรูปภาพ */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-base md:text-lg font-extrabold text-black">
                แนบรูปภาพ <span className="text-red-600">*</span>
              </label>
              <span className="text-xs text-[#E00000] font-semibold">
                *จำเป็นต้องแนบรูปภาพหลักฐานทุกครั้ง
              </span>
            </div>

            <div className="relative w-28 h-28 md:w-32 md:h-32">
              <label className="w-full h-full border-2 border-dashed border-black rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-gray-50 transition-colors shadow-sm overflow-hidden relative group">
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      <span className="text-white text-xs font-bold">📷 เปลี่ยนรูป</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs font-bold text-black">ภาพถ่าย</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {selectedFile && (
              <p className="text-xs text-green-700 font-semibold mt-2">✓ เลือกรูปแล้ว: {selectedFile.name}</p>
            )}
          </div>

          {/* 4. เร่งด่วน และ หมายเหตุ */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isUrgent} 
                onChange={(e) => setIsUrgent(e.target.checked)}
                className="w-5 h-5 accent-black rounded cursor-pointer" 
              />
              <span className="text-base font-extrabold text-black">เร่งด่วน</span>
            </label>

            <input 
              type="text" 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="* หมายเหตุเพิ่มเติม" 
              className="w-full bg-white border border-black/30 rounded-2xl p-3.5 text-sm md:text-base text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            />
          </div>

          {/* 5. ปุ่มส่งข้อมูล */}
          <div className="mt-4 pb-6">
            <button type="submit" className="w-full bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold py-4 rounded-2xl shadow-md flex items-center justify-center gap-3 text-base md:text-lg transition-transform active:scale-95">
              <span>ส่งข้อมูลแจ้งปัญหา</span>
              <span>&gt;</span>
            </button>
          </div>

        </form>
      </div>

      {/* --- CUSTOM ALERT POP-UP --- */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col items-center text-center gap-5">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-black">
              แจ้งเตือน
            </h3>
            <p className="text-sm md:text-base text-gray-700">
              {alertMessage}
            </p>
            <button 
              onClick={() => setAlertMessage(null)}
              className="w-full bg-[#6610A8] hover:bg-[#520d86] text-white font-extrabold py-3.5 rounded-2xl shadow-md text-base transition-transform active:scale-95"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* --- POP-UP 1: ยืนยันรายละเอียดปัญหา --- */}
      {modalStep === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col gap-5">
            <h2 className="text-xl md:text-2xl font-extrabold text-black text-center">
              ยืนยันรายละเอียดปัญหา
            </h2>
            <div className="text-sm md:text-base text-black flex flex-col gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100">
              <p><strong>วันเวลาที่แจ้ง :</strong> 20/07/2026 10:00 น.</p>
              <p><strong>รหัสแจ้ง :</strong> #AW1-01</p>
              <p><strong>สถานที่ :</strong> {selectedLocation}</p>
              <p><strong>หมวดหมู่ :</strong> {selectedCategory} {electricCount ? `(${electricCount} จุด)` : ''}</p>
              {isUrgent && (
                <p><strong>สถานะ :</strong> <span className="text-[#E00000] font-bold">เร่งด่วน 🚨</span></p>
              )}
              <p><strong>หมายเหตุ :</strong> {noteText ? noteText : '-'}</p>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between bg-white border border-black/20 rounded-xl px-3 py-2 text-xs">
                  <span className="text-gray-700 truncate max-w-[240px]">{selectedFile.name}</span>
                  <span className="text-green-600 font-bold shrink-0 ml-2">✓ แนบแล้ว</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-3 mt-2">
              <button 
                onClick={() => setModalStep('success')}
                className="w-full bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold py-3.5 rounded-2xl shadow-md text-base transition-transform active:scale-95"
              >
                ยืนยัน
              </button>
              <button 
                onClick={() => setModalStep(null)}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold py-3.5 rounded-2xl shadow-md text-base transition-transform active:scale-95"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP 2: ส่งเรียบร้อยแล้ว --- */}
      {modalStep === 'success' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 bg-[#2E7D32] rounded-full flex items-center justify-center text-white text-3xl shadow-md">
              ✓
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-black">
              ส่งเรียบร้อยแล้ว
            </h2>
            <div className="w-full text-sm md:text-base text-black flex flex-col gap-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-100 text-left">
              <p><strong>วันเวลาที่แจ้ง :</strong> 20/07/2026 10:00 น.</p>
              <p><strong>รหัสแจ้ง :</strong> #AW1-01</p>
              <p><strong>สถานที่ :</strong> {selectedLocation}</p>
              <p><strong>หมวดหมู่ :</strong> {selectedCategory} {electricCount ? `(${electricCount} จุด)` : ''}</p>
              {isUrgent && (
                <p><strong>สถานะ :</strong> <span className="text-[#E00000] font-bold">เร่งด่วน 🚨</span></p>
              )}
              <p><strong>หมายเหตุ :</strong> {noteText ? noteText : '-'}</p>
              <p className="text-[#2E7D32] font-extrabold mt-1 text-center">เจ้าหน้าที่ได้รับข้อความแจ้งเตือนแบบเรียลไทม์</p>
            </div>
            <div className="w-full mt-2">
              <Link href="/status" onClick={() => setModalStep(null)} className="w-full bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold py-3.5 rounded-2xl shadow-md text-base flex items-center justify-center transition-transform active:scale-95">
                ไปที่หน้าติดตามสถานะ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP 3: เตือนเมื่อกำลังจะออกจากหน้าเว็บ --- */}
      {modalStep === 'leave' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border-[2px] border-[#6610A8] rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl flex flex-col items-center text-center gap-6">
            <h2 className="text-lg md:text-xl font-extrabold text-black leading-relaxed">
              ข้อมูลการแจ้งปัญหาที่คุณกรอกไว้จะไม่ได้รับการบันทึก<br />ต้องการออกจากหน้านี้ใช่หรือไม่
            </h2>
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => {
                  setModalStep(null);
                  if (pendingUrl === 'close') {
                    window.close();
                  } else if (pendingUrl) {
                    router.push(pendingUrl);
                  }
                }}
                className="w-full bg-[#2E7D32] hover:bg-[#256628] text-white font-extrabold py-3.5 rounded-2xl shadow-md text-base transition-transform active:scale-95"
              >
                ยืนยัน
              </button>
              <button 
                onClick={() => {
                  setModalStep(null);
                  setPendingUrl(null);
                }}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold py-3.5 rounded-2xl shadow-md text-base transition-transform active:scale-95"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}