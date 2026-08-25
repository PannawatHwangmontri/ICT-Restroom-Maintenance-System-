import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljljntqysinqkqyjvden.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqbGpudHF5c2lucWtxeWp2ZGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwOTI3MSwiZXhwIjoyMTAyMDg1MjcxfQ.HNL2xEcxlb-4w5kCEcARW1O-s0LQaB8J6Fzo2KdNdfY';

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/maintenance_requests?select=*&order=reported_at.desc`, {
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
    console.error('API Requests GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งซ่อม',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticket_number, location, issue_summary, priority, image_url, line_user_id } = body;

    if (!ticket_number || !location || !issue_summary || !priority) {
      return NextResponse.json(
        {
          success: false,
          message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ',
        },
        { status: 400 }
      );
    }

    const payload = [
      {
        ticket_number,
        location,
        issue_summary,
        priority,
        image_url: image_url || null,
        line_user_id: line_user_id || null,
        reported_at: new Date().toISOString(),
        status: 'รอรับเรื่อง',
      },
    ];

    const res = await fetch(`${SUPABASE_URL}/rest/v1/maintenance_requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase insert error: ${errText}`);
    }

    const insertedData = await res.json();
    return NextResponse.json(
      {
        success: true,
        message: 'บันทึกรายการแจ้งซ่อมเรียบร้อยแล้ว',
        data: insertedData[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API Requests POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
