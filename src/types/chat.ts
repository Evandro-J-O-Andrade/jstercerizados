export interface ChatRoom {
  id: string;
  visitorId: string;
  agentId: string | null;
  status: 'waiting' | 'active' | 'closed';
  subject: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  role: 'visitor' | 'agent' | 'system';
  content: string;
  createdAt: string;
}

export interface ChatAgent {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
}
