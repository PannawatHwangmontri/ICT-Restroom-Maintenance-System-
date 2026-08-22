'use client';

import React, { useState, useEffect } from 'react';
import { useOpenMobileMenu } from '@/components/MobileMenuContext';
import {
    LayoutDashboard,
    Wrench,
    Clock,
    Users,
    LogOut,
    Menu,
    Bell,
    User,
    ChevronDown,
    X,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

// อินเทอร์เฟซสำหรับข้อมูลจุดห้องน้ำ
interface Restroom {
    id: string;
    floor: number;
    name: string;
    status: 'available' | 'unavailable';
    reason?: string;
    x: number; // เปอร์เซ็นต์ความกว้างจากซ้าย
    y: number; // เปอร์เซ็นต์ความสูงจากบน
}

// ข้อมูลจำลองจุดห้องน้ำที่ปรับพิกัดให้อยู่ตรงบริเวณโซนห้องน้ำสีฟ้าพอดี
const initialRestrooms: Restroom[] = [
    // --- ชั้น 1 ---
    { id: '1-W-A', floor: 1, name: 'ห้องน้ำหญิง โซน A', status: 'available', x: 72.5, y: 30.5 },
    { id: '1-M-A', floor: 1, name: 'ห้องน้ำชาย โซน A', status: 'available', x: 70.8, y: 25.5 },
    { id: '1-W-B', floor: 1, name: 'ห้องน้ำหญิง โซน B', status: 'available', x: 23.5, y: 35.5 },
    { id: '1-M-B', floor: 1, name: 'ห้องน้ำชาย โซน B', status: 'available', x: 25.2, y: 30.5 },

    // --- ชั้น 2 ---
    { id: '2-W-H', floor: 2, name: 'ห้องน้ำหญิง โซนหอประชุมพะเยา', status: 'available', x: 36.0, y: 30.5 },
    { id: '2-M-H', floor: 2, name: 'ห้องน้ำชาย โซนหอประชุมพะเยา', status: 'available', x: 32.0, y: 28.5 },
    { id: '2-W-D', floor: 2, name: 'ห้องน้ำหญิง โซน D', status: 'available', x: 58.5, y: 38.5 },
    { id: '2-M-D', floor: 2, name: 'ห้องน้ำชาย โซน D', status: 'available', x: 52.5, y: 42.2 },
    { id: '2-W-B', floor: 2, name: 'ห้องน้ำหญิง โซน B', status: 'available', x: 25.5, y: 69.5 },
    { id: '2-M-B', floor: 2, name: 'ห้องน้ำชาย โซน B', status: 'available', x: 26.5, y: 62.5 },
    { id: '2-W-A', floor: 2, name: 'ห้องน้ำหญิง โซน A', status: 'available', x: 68.5, y: 65.5 },
    { id: '2-M-A', floor: 2, name: 'ห้องน้ำชาย โซน A', status: 'available', x: 67.0, y: 59.2 },

    // --- ชั้น 3 ---
    { id: '3-W-C', floor: 3, name: 'ห้องน้ำหญิง โซน C โซนห้องปฏิบัติการระบบอัจฉริยะและหุ่นยนอัตโนมัต', status: 'available', x: 30.5, y: 28.5 },
    { id: '3-M-C', floor: 3, name: 'ห้องน้ำชาย โซน C โซนห้องปฏิบัติการระบบอัจฉริยะและหุ่นยนอัตโนมัต', status: 'available', x: 35.0, y: 30.5 },
    { id: '3-W-D', floor: 3, name: 'ห้องน้ำหญิงโซนงานบริการเครือข่าย ', status: 'available', x: 67.5, y: 47.5 },
    { id: '3-M-D', floor: 3, name: 'ห้องน้ำชายโซนงานบริการเครือข่าย ', status: 'available', x: 63.5, y: 51.0 },
    { id: '3-W-B', floor: 3, name: 'ห้องน้ำหญิง โซน B', status: 'available', x: 33.0, y: 73.0 },
    { id: '3-M-B', floor: 3, name: 'ห้องน้ำชาย โซน B', status: 'available', x: 34.2, y: 67.5 },
    { id: '3-W-A', floor: 3, name: 'ห้องน้ำหญิง โซน A', status: 'available', x: 70.5, y: 70.2 },
    { id: '3-M-A', floor: 3, name: 'ห้องน้ำชาย โซน A', status: 'available', x: 69.5, y: 64.5 },

    // --- ชั้น 4 ---
    { id: '4-W-C', floor: 4, name: 'ห้องน้ำหญิง โซน B', status: 'available', x: 23.0, y: 59.5 },
    { id: '4-M-C', floor: 4, name: 'ห้องน้ำชาย โซน B', status: 'available', x: 24.8, y: 53.2 },
    { id: '4-W-A', floor: 4, name: 'ห้องน้ำหญิง โซน A', status: 'available', x: 72.0, y: 54.0 },
    { id: '4-M-A', floor: 4, name: 'ห้องน้ำชาย โซน A', status: 'available', x: 71.0, y: 48.2 },
];

export default function RestroomStatusPage() {
    const openMobileMenu = useOpenMobileMenu();
    const [selectedFloor, setSelectedFloor] = useState<number>(1);
    const [restrooms, setRestrooms] = useState<Restroom[]>(initialRestrooms);

    // อัปเดต State อัตโนมัติเมื่อมีการแก้ไขข้อมูล initialRestrooms ในซอร์สโค้ด (Hot Reload)
    useEffect(() => {
        setRestrooms(initialRestrooms);
    }, [initialRestrooms]);

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(3);
    const notifications = [
        { id: 1, title: 'มีการแจ้งซ่อมใหม่', desc: 'สายฉีดชำระชำรุด ห้องน้ำชาย ชั้น 2', time: '5 นาทีที่แล้ว' },
        { id: 2, title: 'อัปเดตสถานะงาน', desc: 'ช่างรับเรื่องแล้ว: ก๊อกน้ำอ่างล้างมือ ชั้น 1', time: '20 นาทีที่แล้ว' },
        { id: 3, title: 'ตรวจพบเรื่องแจ้งซ้ำ', desc: 'โถส้วมชำรุด ห้องน้ำหญิง ชั้น 1 (4 ครั้ง)', time: '1 ชั่วโมงที่แล้ว' },
    ];

    // Modal state สำหรับเปลี่ยนสถานะเป็น "ไม่พร้อมใช้งาน"
    const [pendingItem, setPendingItem] = useState<Restroom | null>(null);
    const [reasonText, setReasonText] = useState('');

    // เพิ่ม useEffect สำหรับจำลองการดึงข้อมูลอัปเดตทุกๆ 5 วินาที
    useEffect(() => {
        const updateStatus = async () => {
            console.log("อัปเดตสถานะห้องน้ำอัตโนมัติแล้ว!");
        };

        const interval = setInterval(updateStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    // รูปภาพแผนที่ตามชั้น
    const mapImages: Record<number, string> = {
        1: '/photo/ห้องน้ำชั้น 1.jpg',
        2: '/photo/ห้องน้ำชั้น2.jpg',
        3: '/photo/ห้องน้ำชั้น 3.jpg',
        4: '/photo/ห้องน้ำชั้น4.jpg',
    };

    // เมนู Sidebar
    const menuItems = [
        { title: 'Dashboard Overview', icon: LayoutDashboard, active: false },
        { title: 'รายการแจ้งซ่อม', icon: Wrench, active: false },
        { title: 'รายงานความคืบหน้า', icon: Clock, active: false },
        { title: 'สถานะห้องน้ำ', icon: Users, active: true },
    ];

    // กรองจุดห้องน้ำตามชั้นที่เลือก
    const currentFloorRestrooms = restrooms.filter(r => r.floor === selectedFloor);

    // ฟังก์ชันจัดการการเปลี่ยนสถานะจาก Dropdown ในตาราง
    const handleStatusChangeClick = (item: Restroom, newStatus: 'available' | 'unavailable') => {
        if (newStatus === 'available') {
            setRestrooms(prev =>
                prev.map(r => r.id === item.id ? { ...r, status: 'available', reason: undefined } : r)
            );
        } else {
            setPendingItem(item);
            setReasonText('');
        }
    };

    // บันทึกสาเหตุและเปลี่ยนสถานะเป็นไม่พร้อมใช้งาน
    const handleConfirmUnavailable = () => {
        if (!pendingItem || !reasonText.trim()) return;

        setRestrooms(prev =>
            prev.map(r => r.id === pendingItem.id ? { ...r, status: 'unavailable', reason: reasonText.trim() } : r)
        );
        setPendingItem(null);
        setReasonText('');
    };

    return (
        <div className="flex min-h-screen bg-[#F6F0FE] font-sans text-gray-800 relative overflow-x-hidden">
            {/* ---------------- Main Content ---------------- */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full min-w-0">
                {/* Header Navbar */}
                <header className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={openMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-purple-200/60 text-[#4C1D95] shrink-0"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#4C1D95] truncate">
                            สถานะห้องน้ำ
                        </h2>
                    </div>

                    {/* Notification & Admin */}
                    <div className="flex items-center gap-3 shrink-0 relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-1.5 text-yellow-400 hover:opacity-80 transition-opacity relative"
                            title="การแจ้งเตือน"
                        >
                            <Bell className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-150">
                                <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                                    <h4 className="font-bold text-sm text-gray-800">การแจ้งเตือน</h4>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => setUnreadCount(0)}
                                            className="text-xs text-purple-700 hover:underline font-medium"
                                        >
                                            อ่านทั้งหมด
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className="p-2.5 rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-100/60 text-xs transition-colors"
                                        >
                                            <div className="flex justify-between font-semibold text-purple-950 mb-1">
                                                <span>{n.title}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{n.time}</span>
                                            </div>
                                            <p className="text-gray-600 leading-tight">{n.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <span className="text-sm font-bold text-gray-900 hidden sm:inline">Admin</span>
                        <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-black shadow-sm overflow-hidden shrink-0">
                            <User className="w-5 h-5 fill-black text-black" />
                        </div>
                    </div>
                </header>

                {/* ---------------- Map Interactive Card ---------------- */}
                <div className="bg-[#E2D9EE]/60 rounded-3xl p-4 sm:p-6 shadow-sm mb-6 border border-purple-100/50 flex flex-col items-center justify-center">
                    <div className="w-full max-w-4xl flex justify-center overflow-x-auto">
                        <div className="relative inline-block rounded-2xl overflow-hidden bg-white shadow-sm min-w-[300px]">
                            {/* ภาพแผนที่ตามชั้น */}
                            <img
                                src={mapImages[selectedFloor]}
                                alt={`แผนที่อาคาร ICT ชั้น ${selectedFloor}`}
                                className="w-full h-auto object-contain block max-h-[550px]"
                            />

                            {/* แสดงจุดสีสถานะห้องน้ำบนรูปภาพ */}
                            {currentFloorRestrooms.map((spot) => (
                                <div
                                    key={spot.id}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-20 cursor-pointer"
                                    style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
                                >
                                    {/* วงกลมจุดสี */}
                                    <div
                                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-125 ${spot.status === 'available' ? 'bg-emerald-600' : 'bg-red-600 animate-pulse'
                                            }`}
                                    />

                                    {/* Tooltip แสดงข้อมูลเมื่อ Hover */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 min-w-[160px]">
                                        <div className="bg-gray-900/90 text-white text-xs rounded-xl py-2 px-3 shadow-xl backdrop-blur-sm text-center space-y-1">
                                            <p className="font-bold border-b border-gray-700 pb-1">{spot.name}</p>
                                            <div className="flex items-center justify-center gap-1">
                                                <span
                                                    className={`w-2 h-2 rounded-full ${spot.status === 'available' ? 'bg-emerald-400' : 'bg-red-400'
                                                        }`}
                                                />
                                                <span className="font-semibold">
                                                    {spot.status === 'available' ? 'พร้อมใช้งาน' : 'ไม่พร้อมใช้งาน'}
                                                </span>
                                            </div>
                                            {spot.status === 'unavailable' && (
                                                <p className="text-[11px] text-red-300 font-normal pt-0.5 max-w-[180px] leading-tight">
                                                    สาเหตุ: {spot.reason || 'ไม่ระบุสาเหตุ'}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-2 h-2 bg-gray-900/90 rotate-45 -mt-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* สัญลักษณ์สี Legend */}
                    <div className="flex items-center justify-center gap-8 mt-6 text-xs sm:text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm" />
                            <span>พร้อมใช้งาน</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3.5 h-3.5 rounded-full bg-red-600 shadow-sm" />
                            <span>ไม่พร้อมใช้งาน</span>
                        </div>
                    </div>
                </div>

                {/* ---------------- Floor Dropdown Selector ---------------- */}
                <div className="flex justify-end mb-6">
                    <div className="relative inline-block w-44">
                        <select
                            value={selectedFloor}
                            onChange={(e) => setSelectedFloor(Number(e.target.value))}
                            className="w-full bg-[#5B08B2] hover:bg-[#4C1D95] text-white text-sm font-bold py-2.5 px-4 pr-10 rounded-xl appearance-none cursor-pointer shadow-md transition-colors focus:outline-none"
                        >
                            <option value={1}>ชั้น 1</option>
                            <option value={2}>ชั้น 2</option>
                            <option value={3}>ชั้น 3</option>
                            <option value={4}>ชั้น 4</option>
                        </select>
                        <ChevronDown className="w-5 h-5 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                {/* ---------------- Management Table ---------------- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Table Header Banner */}
                    <div className="bg-[#5B08B2] text-white px-6 py-3.5 font-bold text-sm sm:text-base">
                        จัดการสถานะห้องน้ำ
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#E9D5FF]/60 text-purple-950 font-bold text-xs sm:text-sm border-b border-purple-100">
                                    <th className="py-3.5 px-6 text-center w-24">ชั้น</th>
                                    <th className="py-3.5 px-6">สถานที่</th>
                                    <th className="py-3.5 px-6 text-center w-64">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs sm:text-sm font-medium">
                                {currentFloorRestrooms.map((item) => (
                                    <tr key={item.id} className="hover:bg-purple-50/40 transition-colors">
                                        <td className="py-4 px-6 text-center text-gray-700 font-semibold">
                                            {item.floor}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 font-semibold">
                                            <div>{item.name}</div>
                                            {item.status === 'unavailable' && item.reason && (
                                                <span className="text-xs text-red-500 font-normal block mt-0.5">
                                                    สาเหตุ: {item.reason}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="relative inline-block w-48">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) =>
                                                        handleStatusChangeClick(
                                                            item,
                                                            e.target.value as 'available' | 'unavailable'
                                                        )
                                                    }
                                                    className={`w-full py-2 px-4 pr-9 rounded-xl text-xs font-bold appearance-none cursor-pointer shadow-sm transition-all focus:outline-none ${item.status === 'available'
                                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                        : 'bg-red-600 text-white hover:bg-red-700'
                                                        }`}
                                                >
                                                    <option value="available" className="bg-white text-gray-800">
                                                        พร้อมใช้งาน
                                                    </option>
                                                    <option value="unavailable" className="bg-white text-gray-800">
                                                        ไม่พร้อมใช้งาน
                                                    </option>
                                                </select>
                                                <ChevronDown className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ---------------- Modal สำหรับระบุสาเหตุที่ไม่พร้อมใช้งาน ---------------- */}
                {pendingItem && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 relative">
                            <button
                                onClick={() => setPendingItem(null)}
                                className="absolute top-5 right-5 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900">ระบุสาเหตุที่ไม่พร้อมใช้งาน</h3>
                                    <p className="text-xs text-purple-700 font-semibold">{pendingItem.name}</p>
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-xs font-bold text-gray-700 mb-2">
                                    สาเหตุหรือรายละเอียดการชำรุด <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={reasonText}
                                    onChange={(e) => setReasonText(e.target.value)}
                                    placeholder="เช่น ท่อน้ำรั่วซึม, อยู่ระหว่างปรับปรุงระบบไฟฟ้า..."
                                    className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                />
                                {!reasonText.trim() && (
                                    <p className="text-[11px] text-amber-600 mt-1">
                                        * จำเป็นต้องเขียนสาเหตุก่อนกดบันทึก
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setPendingItem(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={handleConfirmUnavailable}
                                    disabled={!reasonText.trim()}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${reasonText.trim()
                                        ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    บันทึกสถานะ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}