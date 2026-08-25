import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export interface MaintenanceRequest {
  id?: string;
  ticket_number: string;
  location: string;
  issue_summary: string;
  priority: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'วิกฤต';
  image_url?: string | null;
  line_user_id?: string | null;
  status?: 'รอรับเรื่อง' | 'แจ้งแล้ว' | 'กำลังดำเนินการ' | 'เสร็จสิ้น' | 'ยกเลิก' | 'ไม่รับเรื่อง';
  reported_at?: string;
  remark?: string | null;
  notification_message?: string | null;
  notified_at?: string | null;
  created_at?: string;
}

export interface RestroomStatus {
  id: number;
  location_name: string;
  floor: string;
  status: 'พร้อมใช้งาน' | 'ไม่พร้อมใช้งาน';
  updated_at?: string;
  created_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  line_notified?: boolean;
  error?: string;
}

/**
 * สร้างรายการแจ้งซ่อมใหม่ (POST /api/requests)
 */
export async function createMaintenanceRequest(
  data: Omit<MaintenanceRequest, 'id' | 'status' | 'reported_at' | 'created_at'>
): Promise<ApiResponse<MaintenanceRequest>> {
  const response = await apiClient.post<ApiResponse<MaintenanceRequest>>('/api/requests', data);
  return response.data;
}

/**
 * ดึงรายการแจ้งซ่อมทั้งหมด (GET /api/requests)
 */
export async function getAllRequests(): Promise<ApiResponse<MaintenanceRequest[]>> {
  const response = await apiClient.get<ApiResponse<MaintenanceRequest[]>>('/api/requests');
  return response.data;
}

/**
 * อัปเดตสถานะรายการแจ้งซ่อม (PATCH /api/requests/:id)
 */
export async function updateRequestStatus(
  id: string,
  payload: {
    status?: MaintenanceRequest['status'];
    remark?: string;
    notification_message?: string;
  }
): Promise<ApiResponse<MaintenanceRequest>> {
  const response = await apiClient.patch<ApiResponse<MaintenanceRequest>>(`/api/requests/${id}`, payload);
  return response.data;
}

/**
 * ลบรายการแจ้งซ่อม (DELETE /api/requests/:id)
 */
export async function deleteRequest(id: string): Promise<ApiResponse<MaintenanceRequest>> {
  const response = await apiClient.delete<ApiResponse<MaintenanceRequest>>(`/api/requests/${id}`);
  return response.data;
}

/**
 * ดึงข้อมูลสถานะห้องน้ำทั้งหมด (GET /api/restrooms)
 */
export async function getAllRestrooms(): Promise<ApiResponse<RestroomStatus[]>> {
  const response = await apiClient.get<ApiResponse<RestroomStatus[]>>('/api/restrooms');
  return response.data;
}

/**
 * อัปเดตสถานะห้องน้ำ (PATCH /api/restrooms/:id)
 */
export async function updateRestroomStatus(
  id: number,
  status: 'พร้อมใช้งาน' | 'ไม่พร้อมใช้งาน'
): Promise<ApiResponse<RestroomStatus>> {
  const response = await apiClient.patch<ApiResponse<RestroomStatus>>(`/api/restrooms/${id}`, { status });
  return response.data;
}
