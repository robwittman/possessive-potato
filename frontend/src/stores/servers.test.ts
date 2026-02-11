import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useServersStore } from './servers';

// Mock the api module
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../api/client';

const mockedApi = vi.mocked(api);

beforeEach(() => {
  // Reset store state
  useServersStore.setState({
    servers: [],
    channels: [],
    activeServerId: null,
    activeChannelId: null,
  });
  vi.clearAllMocks();
});

describe('useServersStore', () => {
  describe('fetchServers', () => {
    it('should fetch and set servers', async () => {
      const mockServers = [
        { id: '1', name: 'Server 1', owner_id: '1', icon_url: null, created_at: '' },
      ];
      mockedApi.get.mockResolvedValueOnce(mockServers);

      await useServersStore.getState().fetchServers();

      expect(mockedApi.get).toHaveBeenCalledWith('/servers');
      expect(useServersStore.getState().servers).toEqual(mockServers);
    });
  });

  describe('createServer', () => {
    it('should create server and add to list', async () => {
      const newServer = { id: '2', name: 'New', owner_id: '1', icon_url: null, created_at: '' };
      mockedApi.post.mockResolvedValueOnce(newServer);

      const result = await useServersStore.getState().createServer('New');

      expect(mockedApi.post).toHaveBeenCalledWith('/servers', { name: 'New' });
      expect(result).toEqual(newServer);
      expect(useServersStore.getState().servers).toContainEqual(newServer);
    });
  });

  describe('joinServer', () => {
    it('should join server via invite code and add to list', async () => {
      const server = { id: '3', name: 'Joined', owner_id: '1', icon_url: null, created_at: '' };
      mockedApi.post.mockResolvedValueOnce(server);

      const result = await useServersStore.getState().joinServer('abc12345');

      expect(mockedApi.post).toHaveBeenCalledWith('/invites/abc12345/join');
      expect(result).toEqual(server);
      expect(useServersStore.getState().servers).toContainEqual(server);
    });
  });

  describe('updateServer', () => {
    it('should update server and reflect in list', async () => {
      const original = { id: '1', name: 'Old', owner_id: '1', icon_url: null, created_at: '' };
      const updated = { ...original, name: 'New Name' };
      useServersStore.setState({ servers: [original] });
      mockedApi.patch.mockResolvedValueOnce(updated);

      const result = await useServersStore.getState().updateServer('1', { name: 'New Name' });

      expect(mockedApi.patch).toHaveBeenCalledWith('/servers/1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
      expect(useServersStore.getState().servers[0].name).toBe('New Name');
    });
  });
});
