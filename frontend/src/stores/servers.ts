import { create } from 'zustand';
import { api } from '../api/client';
import type { Server, Channel, Invite, Role, Member } from '../types';

interface ServersState {
  servers: Server[];
  channels: Channel[];
  activeServerId: string | null;
  activeChannelId: string | null;
  roles: Role[];
  members: Member[];
  fetchServers: () => Promise<void>;
  fetchChannels: (serverId: string) => Promise<void>;
  setActiveServer: (id: string) => void;
  setActiveChannel: (id: string) => void;
  createServer: (name: string) => Promise<Server>;
  updateServer: (serverId: string, data: { name?: string; icon_url?: string }) => Promise<Server>;
  deleteServer: (serverId: string) => Promise<void>;
  joinServer: (code: string) => Promise<Server>;
  createChannel: (serverId: string, name: string, type: 'text' | 'voice') => Promise<Channel>;
  updateChannel: (channelId: string, data: { name?: string; topic?: string }) => Promise<Channel>;
  reorderChannels: (serverId: string, positions: { id: string; position: number }[]) => Promise<void>;
  createInvite: (serverId: string) => Promise<Invite>;
  fetchInvites: (serverId: string) => Promise<Invite[]>;
  deleteInvite: (serverId: string, code: string) => Promise<void>;
  fetchRoles: (serverId: string) => Promise<void>;
  createRole: (serverId: string, data: { name: string; permissions: number; color?: string }) => Promise<Role>;
  updateRole: (serverId: string, roleId: string, data: { name?: string; permissions?: number; color?: string }) => Promise<Role>;
  deleteRole: (serverId: string, roleId: string) => Promise<void>;
  assignRole: (serverId: string, userId: string, roleId: string) => Promise<void>;
  removeRole: (serverId: string, userId: string, roleId: string) => Promise<void>;
  fetchMembers: (serverId: string) => Promise<void>;
  fetchMemberRoles: (serverId: string, userId: string) => Promise<Role[]>;
}

export const useServersStore = create<ServersState>((set) => ({
  servers: [],
  channels: [],
  activeServerId: null,
  activeChannelId: null,
  roles: [],
  members: [],

  fetchServers: async () => {
    const servers = await api.get<Server[]>('/servers');
    set({ servers });
  },

  fetchChannels: async (serverId: string) => {
    const channels = await api.get<Channel[]>(`/servers/${serverId}/channels`);
    set({ channels });
  },

  setActiveServer: (id: string) => set({ activeServerId: id, activeChannelId: null, channels: [], roles: [], members: [] }),
  setActiveChannel: (id: string) => set({ activeChannelId: id }),

  createServer: async (name: string) => {
    const server = await api.post<Server>('/servers', { name });
    set((state) => ({ servers: [...state.servers, server] }));
    return server;
  },

  updateServer: async (serverId: string, data: { name?: string; icon_url?: string }) => {
    const server = await api.patch<Server>(`/servers/${serverId}`, data);
    set((state) => ({
      servers: state.servers.map((s) => (s.id === serverId ? server : s)),
    }));
    return server;
  },

  deleteServer: async (serverId: string) => {
    await api.delete(`/servers/${serverId}`);
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== serverId),
      activeServerId: state.activeServerId === serverId ? null : state.activeServerId,
      activeChannelId: state.activeServerId === serverId ? null : state.activeChannelId,
      channels: state.activeServerId === serverId ? [] : state.channels,
    }));
  },

  joinServer: async (code: string) => {
    const server = await api.post<Server>(`/invites/${code}/join`);
    set((state) => ({ servers: [...state.servers, server] }));
    return server;
  },

  createChannel: async (serverId: string, name: string, type: 'text' | 'voice') => {
    const channel = await api.post<Channel>(`/servers/${serverId}/channels`, { name, type });
    set((state) => ({ channels: [...state.channels, channel] }));
    return channel;
  },

  updateChannel: async (channelId: string, data: { name?: string; topic?: string }) => {
    const channel = await api.patch<Channel>(`/channels/${channelId}`, data);
    set((state) => ({
      channels: state.channels.map((c) => (c.id === channelId ? channel : c)),
    }));
    return channel;
  },

  reorderChannels: async (serverId: string, positions: { id: string; position: number }[]) => {
    await api.patch(`/servers/${serverId}/channels/positions`, positions);
    set((state) => ({
      channels: state.channels.map((ch) => {
        const pos = positions.find((p) => p.id === ch.id);
        return pos ? { ...ch, position: pos.position } : ch;
      }).sort((a, b) => a.position - b.position),
    }));
  },

  createInvite: async (serverId: string) => {
    return api.post<Invite>(`/servers/${serverId}/invites`);
  },

  fetchInvites: async (serverId: string) => {
    return api.get<Invite[]>(`/servers/${serverId}/invites`);
  },

  deleteInvite: async (serverId: string, code: string) => {
    await api.delete(`/servers/${serverId}/invites/${code}`);
  },

  fetchRoles: async (serverId: string) => {
    const roles = await api.get<Role[]>(`/servers/${serverId}/roles`);
    set({ roles: roles || [] });
  },

  createRole: async (serverId: string, data: { name: string; permissions: number; color?: string }) => {
    const role = await api.post<Role>(`/servers/${serverId}/roles`, data);
    set((state) => ({ roles: [...state.roles, role] }));
    return role;
  },

  updateRole: async (serverId: string, roleId: string, data: { name?: string; permissions?: number; color?: string }) => {
    const role = await api.patch<Role>(`/servers/${serverId}/roles/${roleId}`, data);
    set((state) => ({
      roles: state.roles.map((r) => (r.id === roleId ? role : r)),
    }));
    return role;
  },

  deleteRole: async (serverId: string, roleId: string) => {
    await api.delete(`/servers/${serverId}/roles/${roleId}`);
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== roleId),
    }));
  },

  assignRole: async (serverId: string, userId: string, roleId: string) => {
    await api.put(`/servers/${serverId}/members/${userId}/roles/${roleId}`);
  },

  removeRole: async (serverId: string, userId: string, roleId: string) => {
    await api.delete(`/servers/${serverId}/members/${userId}/roles/${roleId}`);
  },

  fetchMembers: async (serverId: string) => {
    const members = await api.get<Member[]>(`/servers/${serverId}/members`);
    set({ members: members || [] });
  },

  fetchMemberRoles: async (serverId: string, userId: string) => {
    return api.get<Role[]>(`/servers/${serverId}/members/${userId}/roles`);
  },
}));
