import { useState } from 'react';
import { useServersStore } from '../../stores/servers';

interface JoinServerModalProps {
  onClose: () => void;
}

export function JoinServerModal({ onClose }: JoinServerModalProps) {
  const { joinServer, setActiveServer } = useServersStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    try {
      const server = await joinServer(trimmed);
      setActiveServer(server.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
        <h2 className="text-white text-lg font-bold mb-4">Join a Server</h2>
        {error && <div className="mb-3 p-2 bg-red-500/20 text-red-300 rounded text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter invite code"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none mb-4"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
