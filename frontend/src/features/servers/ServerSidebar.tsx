import { useEffect, useState } from 'react';
import { useServersStore } from '../../stores/servers';

export function ServerSidebar() {
  const { servers, activeServerId, fetchServers, setActiveServer, createServer } = useServersStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const server = await createServer(name.trim());
    setName('');
    setShowCreate(false);
    setActiveServer(server.id);
  };

  return (
    <div className="w-18 bg-gray-900 flex flex-col items-center py-3 gap-2 overflow-y-auto">
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => setActiveServer(server.id)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm transition-all hover:rounded-xl ${
            activeServerId === server.id
              ? 'bg-indigo-600 rounded-xl'
              : 'bg-gray-700 hover:bg-indigo-500'
          }`}
          title={server.name}
        >
          {server.name.charAt(0).toUpperCase()}
        </button>
      ))}

      <button
        onClick={() => setShowCreate(true)}
        className="w-12 h-12 rounded-2xl bg-gray-700 hover:bg-green-600 hover:rounded-xl flex items-center justify-center text-green-400 hover:text-white text-2xl transition-all"
        title="Create Server"
      >
        +
      </button>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-white text-lg font-bold mb-4">Create a Server</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Server name"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none mb-4"
                autoFocus
              />
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
