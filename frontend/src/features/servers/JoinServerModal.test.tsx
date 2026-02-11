import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinServerModal } from './JoinServerModal';
import { useServersStore } from '../../stores/servers';

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
    servers: [],
    channels: [],
    activeServerId: null,
    activeChannelId: null,
  });
  vi.clearAllMocks();
});

describe('JoinServerModal', () => {
  it('renders input and buttons', () => {
    render(<JoinServerModal onClose={vi.fn()} />);

    expect(screen.getByPlaceholderText('Enter invite code')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('submits invite code and closes on success', async () => {
    const user = userEvent.setup();
    const server = { id: '1', name: 'Test', owner_id: '1', icon_url: null, created_at: '' };
    mockedApi.post.mockResolvedValueOnce(server);

    const onClose = vi.fn();
    render(<JoinServerModal onClose={onClose} />);

    const input = screen.getByPlaceholderText('Enter invite code');
    await user.type(input, 'abc12345');
    await user.click(screen.getByText('Join'));

    expect(mockedApi.post).toHaveBeenCalledWith('/invites/abc12345/join');
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error on invalid code', async () => {
    const user = userEvent.setup();
    mockedApi.post.mockRejectedValueOnce(new Error('invalid invite code'));

    render(<JoinServerModal onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText('Enter invite code');
    await user.type(input, 'badcode');
    await user.click(screen.getByText('Join'));

    expect(await screen.findByText('invalid invite code')).toBeInTheDocument();
  });
});
