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

export interface Invite {
  code: string;
  server_id: string;
  created_by: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  server_id: string;
  name: string;
  permissions: number;
  color: string | null;
  position: number;
}

export interface Member {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  nickname: string | null;
  joined_at: string;
}

export const Permissions = {
  Admin: 1 << 0,
  ManageServer: 1 << 1,
  ManageChannels: 1 << 2,
  ManageRoles: 1 << 3,
  KickMembers: 1 << 4,
  BanMembers: 1 << 5,
  SendMessages: 1 << 6,
  ReadMessages: 1 << 7,
  ManageMessages: 1 << 8,
  Connect: 1 << 9,
  Speak: 1 << 10,
  ShareScreen: 1 << 11,
} as const;

export const PermissionLabels: Record<number, string> = {
  [Permissions.Admin]: 'Administrator',
  [Permissions.ManageServer]: 'Manage Server',
  [Permissions.ManageChannels]: 'Manage Channels',
  [Permissions.ManageRoles]: 'Manage Roles',
  [Permissions.KickMembers]: 'Kick Members',
  [Permissions.BanMembers]: 'Ban Members',
  [Permissions.SendMessages]: 'Send Messages',
  [Permissions.ReadMessages]: 'Read Messages',
  [Permissions.ManageMessages]: 'Manage Messages',
  [Permissions.Connect]: 'Connect',
  [Permissions.Speak]: 'Speak',
  [Permissions.ShareScreen]: 'Share Screen',
};

export interface GatewayEvent {
  t: string;
  d: unknown;
  s?: string;
}
