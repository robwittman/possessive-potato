import { useEffect, useState } from 'react';
import { useServersStore } from '../../stores/servers';

export function ChannelList() {
  const { channels, activeServerId, activeChannelId, fetchChannels, setActiveChannel, createChannel } =
    useServersStore();
  const { servers } = useServersStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');

  const activeServer = servers.find((s) => s.id === activeServerId);

  useEffect(() => {
    if (activeServerId) {
      fetchChannels(activeServerId);
    }
  }, [activeServerId, fetchChannels]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeServerId) return;
    await createChannel(activeServerId, name.trim(), type);
    setName('');
    setShowCreate(false);
  };

  if (!activeServerId) {
    return (
      <div className="w-60 bg-gray-800 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Select a server</p>
      </div>
    );
  }

  return (
    <div className="w-60 bg-gray-800 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-700 font-bold text-white truncate">
        {activeServer?.name}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs text-gray-400 uppercase font-semibold">Channels</span>
          <button
            onClick={() => setShowCreate(true)}
            className="text-gray-400 hover:text-white text-sm"
            title="Create Channel"
          >
            +
          </button>
        </div>

        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-1.5 ${
              activeChannelId === channel.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <span className="text-gray-500">{channel.type === 'voice' ? '🔊' : '#'}</span>
            <span className="truncate">{channel.name}</span>
          </button>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-white text-lg font-bold mb-4">Create Channel</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'text' | 'voice')}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
                >
                  <option value="text">Text</option>
                  <option value="voice">Voice</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
