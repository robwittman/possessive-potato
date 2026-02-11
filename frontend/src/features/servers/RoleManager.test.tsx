import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoleManager } from './RoleManager';
import { useServersStore } from '../../stores/servers';

vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

beforeEach(() => {
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

describe('RoleManager', () => {
  it('renders roles list', () => {
    useServersStore.setState({
      roles: [
        { id: '1', server_id: '100', name: '@everyone', permissions: 192, color: null, position: 0 },
        { id: '2', server_id: '100', name: 'Moderator', permissions: 4, color: '#3498db', position: 1 },
      ],
    });

    render(<RoleManager serverId="100" />);

    expect(screen.getByText('@everyone')).toBeDefined();
    expect(screen.getByText('Moderator')).toBeDefined();
  });

  it('creates a new role', async () => {
    const user = userEvent.setup();
    const newRole = { id: '3', server_id: '100', name: 'Admin', permissions: 0, color: null, position: 1 };

    const { api } = await import('../../api/client');
    vi.mocked(api.post).mockResolvedValueOnce(newRole);

    render(<RoleManager serverId="100" />);

    const input = screen.getByPlaceholderText('New role name');
    await user.type(input, 'Admin');
    await user.click(screen.getByText('Create'));

    expect(vi.mocked(api.post)).toHaveBeenCalledWith('/servers/100/roles', {
      name: 'Admin',
      permissions: 0,
    });
  });

  it('does not show delete button for @everyone role', () => {
    useServersStore.setState({
      roles: [
        { id: '1', server_id: '100', name: '@everyone', permissions: 192, color: null, position: 0 },
        { id: '2', server_id: '100', name: 'Moderator', permissions: 4, color: null, position: 1 },
      ],
    });

    render(<RoleManager serverId="100" />);

    const deleteButtons = screen.getAllByText('Delete');
    // Only the Moderator role should have a delete button
    expect(deleteButtons).toHaveLength(1);
  });
});
