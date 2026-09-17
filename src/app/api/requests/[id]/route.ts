import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljljntqysinqkqyjvden.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbGpudHF5c2lucWtxeWp2ZGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwOTI3MSwiZXhwIjoyMTAyMDg1MjcxfQ.HNL2xEcxlb-4w5kCEcARW1O-s0LQaB8J6Fzo2KdNdfY';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ ID ของรายการแจ้งซ่อม' },
        { status: 400 }
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const filterQuery = isUuid
      ? `id=eq.${encodeURIComponent(id)}`
      : `ticket_number=eq.${encodeURIComponent(id)}`;

    const endpoint = `${SUPABASE_URL}/rest/v1/maintenance_requests?${filterQuery}&select=*`;

    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Supabase error: ${res.statusText}`);
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: `ไม่พบรายการแจ้งซ่อม ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error: any) {
    console.error('API Request By ID GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการ',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
