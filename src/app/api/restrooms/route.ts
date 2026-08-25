import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljljntqysinqkqyjvden.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbGpudHF5c2lucWtxeWp2ZGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwOTI3MSwiZXhwIjoyMTAyMDg1MjcxfQ.HNL2xEcxlb-4w5kCEcARW1O-s0LQaB8J6Fzo2KdNdfY';

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/restroom_status?select=*&order=id.asc`, {
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
    return NextResponse.json({
      success: true,
      count: data.length,
      data: data,
    });
  } catch (error: any) {
    console.error('API Restrooms Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถานะห้องน้ำ',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
