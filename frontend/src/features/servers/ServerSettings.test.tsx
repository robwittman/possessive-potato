import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerSettings } from './ServerSettings';
import { useServersStore } from '../../stores/servers';
import { useAuthStore } from '../../stores/auth';

// Mock the api module
vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '../../api/client';

const mockedApi = vi.mocked(api);

beforeEach(() => {
  useServersStore.setState({
    servers: [{ id: '1', name: 'Test Server', owner_id: '10', icon_url: null, created_at: '' }],
    channels: [],
    activeServerId: '1',
    activeChannelId: null,
  });
  useAuthStore.setState({
    user: { id: '10', username: 'owner', display_name: 'Owner', email: 'o@test.com', avatar_url: null, status: 'online', created_at: '', updated_at: '' },
    accessToken: 'token',
    refreshToken: 'refresh',
  });
  vi.clearAllMocks();
  // Default: fetchInvites returns empty array
  mockedApi.get.mockResolvedValue([]);
});

describe('ServerSettings', () => {
  it('renders server name input for owner', () => {
    render(<ServerSettings serverId="1" onClose={vi.fn()} />);

    expect(screen.getByDisplayValue('Test Server')).toBeInTheDocument();
    expect(screen.getByText('Server Settings')).toBeInTheDocument();
  });

  it('shows invite code after creation', async () => {
    const user = userEvent.setup();
    const mockInvite = { code: 'xyz99999', server_id: '1', created_by: '10', max_uses: null, uses: 0, expires_at: null, created_at: '' };
    mockedApi.post.mockResolvedValueOnce(mockInvite);

    render(<ServerSettings serverId="1" onClose={vi.fn()} />);

    await user.click(screen.getByText('+ Create'));

    expect(await screen.findByText('xyz99999')).toBeInTheDocument();
  });
});
