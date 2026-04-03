export type TicketCategory = 'general' | 'billing' | 'technical' | 'feature' | 'urgent';
export type TicketStatus   = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketMessage {
  id: string;
  from: 'user' | 'admin';
  text: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  userId: string;         // matches user id (slug / number as string)
  userName: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export const TICKET_EVENT = 'SAGAH:tickets';
const KEY = 'SAGAH_tickets';

export function getTickets(): Ticket[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Ticket[];
  } catch {
    return [];
  }
}

export function getTicketsForUser(userId: string): Ticket[] {
  return getTickets().filter((t) => t.userId === userId);
}

export function addTicket(data: {
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  message: string;
}): void {
  const now = new Date().toISOString();
  const ticket: Ticket = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    subject: data.subject,
    category: data.category,
    priority: data.priority,
    status: 'open',
    messages: [{ id: '0', from: 'user', text: data.message, createdAt: now }],
    createdAt: now,
    updatedAt: now,
  };
  localStorage.setItem(KEY, JSON.stringify([ticket, ...getTickets()]));
  window.dispatchEvent(new Event(TICKET_EVENT));
}

export function replyToTicket(ticketId: string, from: 'user' | 'admin', text: string): void {
  const now = new Date().toISOString();
  const list = getTickets().map((t) => {
    if (t.id !== ticketId) return t;
    return {
      ...t,
      messages: [...t.messages, { id: Date.now().toString(36), from, text, createdAt: now }],
      updatedAt: now,
    };
  });
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(TICKET_EVENT));
}

export function updateTicketStatus(ticketId: string, status: TicketStatus): void {
  const now = new Date().toISOString();
  const list = getTickets().map((t) => t.id === ticketId ? { ...t, status, updatedAt: now } : t);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(TICKET_EVENT));
}

export function updateTicketPriority(ticketId: string, priority: TicketPriority): void {
  const now = new Date().toISOString();
  const list = getTickets().map((t) => t.id === ticketId ? { ...t, priority, updatedAt: now } : t);
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(TICKET_EVENT));
}
