import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export interface CreateRequestPayload {
  ticket_number: string;
  location: string;
  issue_summary: string;
  priority: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'วิกฤต';
  image_url?: string | null;
  line_user_id?: string | null;
}

export interface MaintenanceRequestItem {
  id: string | number;
  ticket_number: string;
  location: string;
  issue_summary: string;
  priority: string;
  status: 'รอรับเรื่อง' | 'แจ้งแล้ว' | 'กำลังดำเนินการ' | 'เสร็จสิ้น' | 'ยกเลิก' | 'ไม่รับเรื่อง';
  image_url?: string | null;
  line_user_id?: string | null;
  reported_at: string;
  remark?: string;
  notification_message?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data?: T;
  error?: string;
  line_notified?: boolean;
}

/**
 * ส่งคำขอ HTTP ไปยัง Backend พร้อมระบบ Fallback
 */
const requestApi = async <T>(method: 'GET' | 'POST' | 'PATCH', endpoint: string, data?: any): Promise<ApiResponse<T>> => {
  // ลองส่งไปยัง Backend URL ตรงก่อน
  const directUrl = `${BACKEND_URL}/api${endpoint}`;
  
  try {
    const response = await axios({
      method,
      url: directUrl,
      data,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });
    return response.data;
  } catch (directErr: any) {
    console.warn(`⚠️ Direct request to ${directUrl} failed, trying proxy rewrite...`, directErr?.message);

    // ถ้าล้มเหลว (เช่น CORS หรือ Port ต่างกัน) ให้ส่งผ่าน Next.js Rewrite Proxy (/backend-api/...)
    try {
      const proxyUrl = `/backend-api${endpoint}`;
      const response = await axios({
        method,
        url: proxyUrl,
        data,
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      });
      return response.data;
    } catch (proxyErr: any) {
      console.error('❌ ทั้ง Direct และ Proxy Request ล้มเหลว:', proxyErr?.response?.data || proxyErr.message);
      throw new Error(
        proxyErr?.response?.data?.message ||
        directErr?.response?.data?.message ||
        'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend (http://localhost:5000) ได้ กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่'
      );
    }
  }
};

/**
 * ส่งข้อมูลคำร้องแจ้งซ่อมใหม่ไปยัง Backend API
 */
export const createMaintenanceRequest = async (
  payload: CreateRequestPayload
): Promise<ApiResponse<MaintenanceRequestItem>> => {
  return requestApi<MaintenanceRequestItem>('POST', '/requests', payload);
};

/**
 * ดึงรายการแจ้งซ่อมทั้งหมดจาก Backend
 */
export const getAllRequests = async (): Promise<ApiResponse<MaintenanceRequestItem[]>> => {
  return requestApi<MaintenanceRequestItem[]>('GET', '/requests');
};

/**
 * อัปเดตสถานะการแจ้งซ่อม (เช่น ยกเลิก หรือเปลี่ยนสถานะ)
 */
export const updateRequestStatus = async (
  id: string | number,
  payload: { status?: string; remark?: string; notification_message?: string }
): Promise<ApiResponse<MaintenanceRequestItem>> => {
  return requestApi<MaintenanceRequestItem>('PATCH', `/requests/${id}`, payload);
};

/**
 * ดึงข้อมูลสถานะห้องน้ำทั้งหมด
 */
export const getRestroomStatuses = async () => {
  return requestApi('GET', '/restrooms');
};
