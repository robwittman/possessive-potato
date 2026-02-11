export interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  status: 'online' | 'offline' | 'away' | 'dnd';
  created_at: string;
  updated_at: string;
}

export interface Server {
  id: string;
  name: string;
  owner_id: string;
  icon_url: string | null;
  created_at: string;
}

export interface Channel {
  id: string;
  server_id: string;
  name: string;
  type: 'text' | 'voice';
  position: number;
  topic: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  author_id: string;
  content: string;
  thread_id?: string;
  edited_at?: string;
  created_at: string;
}

export interface Thread {
  id: string;
  channel_id: string;
  parent_message_id: string;
  name: string;
  created_by: string;
  archived: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface GatewayEvent {
  t: string;
  d: unknown;
  s?: string;
}
