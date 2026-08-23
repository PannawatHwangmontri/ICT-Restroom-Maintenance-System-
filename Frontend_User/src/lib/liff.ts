import liff from '@line/liff';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface MaintenanceReportData {
  ticketNumber: string;
  location: string;
  category: string;
  electricCount?: string;
  isUrgent: boolean;
  priority: 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'วิกฤต';
  note?: string;
  imageUrl?: string | null;
  reportedAt?: string;
  displayName?: string;
}

let isLiffReady = false;
let isRealLiff = false;

/**
 * กำหนดค่าและเริ่มต้นใช้งาน LIFF SDK อย่างปลอดภัย
 * รองรับทั้งการรันใน LINE App และการเปิดทดสอบใน Web Browser ทั่วไป
 */
export const initLiff = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (isLiffReady) return isRealLiff;

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

  if (!liffId || liffId === 'your_liff_id_here' || liffId.trim() === '') {
    isLiffReady = true;
    isRealLiff = false;
    return false;
  }

  try {
    await liff.init({ liffId });
    isLiffReady = true;
    isRealLiff = true;
    return true;
  } catch (error) {
    console.warn('⚠️ LIFF Init Failed (โหมด Browser/Guest):', error);
    isLiffReady = true;
    isRealLiff = false;
    return false;
  }
};

/**
 * ดึงข้อมูล Profile ของผู้ใช้จาก LINE
 */
export const getLiffProfile = async (): Promise<LiffProfile | null> => {
  try {
    const hasRealLiff = await initLiff();

    if (hasRealLiff && liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      if (typeof window !== 'undefined') {
        localStorage.setItem('line_user_id', profile.userId);
        localStorage.setItem('line_display_name', profile.displayName);
      }
      return profile;
    }

    // กรณีอยู่ใน Browser ที่เคยจำลองข้อมูลไว้
    if (typeof window !== 'undefined') {
      const cachedId = localStorage.getItem('line_user_id');
      const cachedName = localStorage.getItem('line_display_name');
      if (cachedId) {
        return {
          userId: cachedId,
          displayName: cachedName || 'ผู้ใช้งาน',
        };
      }
    }

    return null;
  } catch (err) {
    console.warn('⚠️ ข้ามการดึง LINE Profile (โหมด Browser/Guest):', err);
    return null;
  }
};

/**
 * ตรวจสอบว่าเปิดอยู่ภายในแอป LINE หรือไม่
 */
export const isLiffInClient = (): boolean => {
  try {
    if (!isRealLiff) return false;
    return liff.isInClient();
  } catch {
    return false;
  }
};

/**
 * ปิดหน้าต่าง LIFF
 */
export const closeLiff = () => {
  try {
    if (isRealLiff && liff.isInClient()) {
      liff.closeWindow();
    }
  } catch (e) {
    console.warn('Cannot close LIFF window', e);
  }
};

/**
 * สร้างโครงสร้าง LINE Flex Message รูปแบบมาตรฐาน LINE OA
 * สำหรับส่งเข้าห้องแชทของ LINE Official Account
 */
export const buildLineOAFlexMessage = (data: MaintenanceReportData) => {
  const reportedTime = data.reportedAt || new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  const categoryText = data.electricCount
    ? `${data.category} (${data.electricCount} จุด)`
    : data.category;

  const headerColor = data.isUrgent ? '#D32F2F' : '#6610A8';
  const badgeText = data.isUrgent ? '🚨 แจ้งซ่อมด่วน' : '📋 แจ้งซ่อมใหม่';

  // Bubble Structure สำหรับ LINE Flex Message
  const bubble: any = {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: headerColor,
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: badgeText,
              color: '#ffffff',
              weight: 'bold',
              size: 'sm',
              flex: 1,
            },
            {
              type: 'text',
              text: data.ticketNumber,
              color: '#ffffff',
              weight: 'bold',
              size: 'sm',
              align: 'end',
            },
          ],
        },
        {
          type: 'text',
          text: 'ระบบแจ้งซ่อมห้องน้ำ ICT',
          color: '#F3E8FF',
          size: 'xs',
          margin: 'xs',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      paddingAll: '16px',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'สถานที่:',
                  size: 'sm',
                  color: '#666666',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: data.location,
                  size: 'sm',
                  color: '#111111',
                  weight: 'bold',
                  flex: 5,
                  wrap: true,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'หมวดหมู่:',
                  size: 'sm',
                  color: '#666666',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: categoryText,
                  size: 'sm',
                  color: '#111111',
                  flex: 5,
                  wrap: true,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'ความเร่งด่วน:',
                  size: 'sm',
                  color: '#666666',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: data.priority,
                  size: 'sm',
                  color: data.isUrgent ? '#D32F2F' : '#2E7D32',
                  weight: 'bold',
                  flex: 5,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'สถานะ:',
                  size: 'sm',
                  color: '#666666',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: 'รอรับเรื่อง ⏳',
                  size: 'sm',
                  color: '#FF9800',
                  weight: 'bold',
                  flex: 5,
                },
              ],
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: 'หมายเหตุ:',
                  size: 'sm',
                  color: '#666666',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: data.note && data.note.trim() ? data.note : '-',
                  size: 'sm',
                  color: '#444444',
                  flex: 5,
                  wrap: true,
                },
              ],
            },
          ],
        },
        {
          type: 'separator',
          margin: 'md',
        },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: [
            {
              type: 'text',
              text: `📅 วันเวลาที่แจ้ง: ${reportedTime}`,
              size: 'xs',
              color: '#888888',
            },
            {
              type: 'text',
              text: '⚡ ระบบได้ส่งข้อมูลให้เจ้าหน้าที่เรียบร้อยแล้ว',
              size: 'xs',
              color: '#2E7D32',
              weight: 'bold',
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: '#6610A8',
          height: 'sm',
          action: {
            type: 'uri',
            label: '📱 ติดตามสถานะการซ่อม',
            uri: typeof window !== 'undefined' ? `${window.location.origin}/status` : 'https://liff.line.me',
          },
        },
      ],
    },
  };

  return {
    type: 'flex',
    altText: `[แจ้งซ่อม] ${data.ticketNumber} — ${data.location}`,
    contents: bubble,
  };
};

/**
 * ส่งข้อความ Flex Message ขึ้น LINE Chat ผ่าน LIFF SDK
 */
export const sendLiffMessage = async (flexMessage: any): Promise<boolean> => {
  try {
    if (!liff.isInClient()) {
      console.log('ℹ️ ไม่อยู่ใน LINE Client ข้ามการส่ง liff.sendMessages');
      return false;
    }
    await liff.sendMessages([flexMessage]);
    console.log('✅ ส่ง LINE Message ผ่าน LIFF สำเร็จ');
    return true;
  } catch (error) {
    console.error('⚠️ ไม่สามารถส่งข้อความผ่าน LIFF ได้:', error);
    return false;
  }
};
