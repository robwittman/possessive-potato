import { create } from 'zustand';
import { api } from '../api/client';
import type { Server, Channel, Invite } from '../types';

interface ServersState {
  servers: Server[];
  channels: Channel[];
  activeServerId: string | null;
  activeChannelId: string | null;
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
}

export const useServersStore = create<ServersState>((set) => ({
  servers: [],
  channels: [],
  activeServerId: null,
  activeChannelId: null,

  fetchServers: async () => {
    const servers = await api.get<Server[]>('/servers');
    set({ servers });
  },

  fetchChannels: async (serverId: string) => {
    const channels = await api.get<Channel[]>(`/servers/${serverId}/channels`);
    set({ channels });
  },

  setActiveServer: (id: string) => set({ activeServerId: id, activeChannelId: null, channels: [] }),
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
}));
