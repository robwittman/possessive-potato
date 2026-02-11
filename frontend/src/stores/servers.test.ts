import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useServersStore } from './servers';

// Mock the api module
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
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
    roles: [],
    members: [],
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

  describe('fetchRoles', () => {
    it('should fetch and set roles', async () => {
      const mockRoles = [
        { id: '1', server_id: '100', name: '@everyone', permissions: 192, color: null, position: 0 },
        { id: '2', server_id: '100', name: 'Moderator', permissions: 4, color: '#3498db', position: 1 },
      ];
      mockedApi.get.mockResolvedValueOnce(mockRoles);

      await useServersStore.getState().fetchRoles('100');

      expect(mockedApi.get).toHaveBeenCalledWith('/servers/100/roles');
      expect(useServersStore.getState().roles).toEqual(mockRoles);
    });
  });

  describe('createRole', () => {
    it('should create role and add to list', async () => {
      const newRole = { id: '3', server_id: '100', name: 'Admin', permissions: 1, color: null, position: 1 };
      mockedApi.post.mockResolvedValueOnce(newRole);

      const result = await useServersStore.getState().createRole('100', { name: 'Admin', permissions: 1 });

      expect(mockedApi.post).toHaveBeenCalledWith('/servers/100/roles', { name: 'Admin', permissions: 1 });
      expect(result).toEqual(newRole);
      expect(useServersStore.getState().roles).toContainEqual(newRole);
    });
  });

  describe('deleteRole', () => {
    it('should delete role and remove from list', async () => {
      const role = { id: '2', server_id: '100', name: 'Mod', permissions: 4, color: null, position: 1 };
      useServersStore.setState({ roles: [role] });
      mockedApi.delete.mockResolvedValueOnce(undefined);

      await useServersStore.getState().deleteRole('100', '2');

      expect(mockedApi.delete).toHaveBeenCalledWith('/servers/100/roles/2');
      expect(useServersStore.getState().roles).toHaveLength(0);
    });
  });

  describe('fetchMembers', () => {
    it('should fetch and set members', async () => {
      const mockMembers = [
        { user_id: '1', username: 'alice', display_name: 'Alice', avatar_url: null, nickname: null, joined_at: '' },
      ];
      mockedApi.get.mockResolvedValueOnce(mockMembers);

      await useServersStore.getState().fetchMembers('100');

      expect(mockedApi.get).toHaveBeenCalledWith('/servers/100/members');
      expect(useServersStore.getState().members).toEqual(mockMembers);
    });
  });
});
