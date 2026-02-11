import { create } from 'zustand';
import { api } from '../api/client';
import type { Message } from '../types';

interface MessagesState {
  messages: Message[];
  loading: boolean;
  fetchMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  removeMessage: (id: string) => void;
  clear: () => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messages: [],
  loading: false,

  fetchMessages: async (channelId: string) => {
    set({ loading: true });
    try {
      const messages = await api.get<Message[]>(`/channels/${channelId}/messages`);
      // Messages come in DESC order from API, reverse for display
      set({ messages: messages.reverse() });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (channelId: string, content: string) => {
    await api.post(`/channels/${channelId}/messages`, { content });
  },

  addMessage: (message: Message) => {
    set((state) => {
      // Avoid duplicates
      if (state.messages.some((m) => m.id === message.id)) return state;
      return { messages: [...state.messages, message] };
    });
  },

  updateMessage: (id: string, content: string) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, content, edited_at: new Date().toISOString() } : m,
      ),
    }));
  },

  removeMessage: (id: string) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    }));
  },

  clear: () => set({ messages: [], loading: false }),
}));
