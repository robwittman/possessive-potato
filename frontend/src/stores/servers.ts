import { create } from 'zustand';
import { api } from '../api/client';
import type { Server, Channel } from '../types';

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
  createChannel: (serverId: string, name: string, type: 'text' | 'voice') => Promise<Channel>;
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

  createChannel: async (serverId: string, name: string, type: 'text' | 'voice') => {
    const channel = await api.post<Channel>(`/servers/${serverId}/channels`, { name, type });
    set((state) => ({ channels: [...state.channels, channel] }));
    return channel;
  },
}));
