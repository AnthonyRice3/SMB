export type InquiryType   = 'inquiry' | 'demo';
export type InquiryStatus = 'new' | 'read' | 'replied';

export interface Inquiry {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  company: string;
  message?: string;
  date?: string;
  time?: string;
  topic?: string;
  duration?: number;
  status: InquiryStatus;
  createdAt: string;
}

export const INQUIRY_EVENT = 'smbconnect:inquiries';
const KEY = 'smbconnect_inquiries';

export function getInquiries(): Inquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Inquiry[];
  } catch {
    return [];
  }
}

export function addInquiry(data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): void {
  const entry: Inquiry = {
    ...data,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([entry, ...getInquiries()]));
  window.dispatchEvent(new Event(INQUIRY_EVENT));
}

export function updateInquiryStatus(id: string, status: InquiryStatus): void {
  const list = getInquiries().map((i) => (i.id === id ? { ...i, status } : i));
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(INQUIRY_EVENT));
}
