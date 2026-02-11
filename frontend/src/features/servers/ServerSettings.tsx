import { useState, useEffect } from 'react';
import { useServersStore } from '../../stores/servers';
import { useAuthStore } from '../../stores/auth';
import { RoleManager } from './RoleManager';
import { MemberList } from './MemberList';
import type { Invite } from '../../types';

interface ServerSettingsProps {
  serverId: string;
  onClose: () => void;
}

type Tab = 'general' | 'roles' | 'members';

export function ServerSettings({ serverId, onClose }: ServerSettingsProps) {
  const { servers, updateServer, deleteServer, createInvite, fetchInvites, deleteInvite } =
    useServersStore();
  const user = useAuthStore((s) => s.user);
  const server = servers.find((s) => s.id === serverId);

  const [tab, setTab] = useState<Tab>('general');
  const [name, setName] = useState(server?.name || '');
  const [invites, setInvites] = useState<Invite[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isOwner = server?.owner_id === user?.id;

  useEffect(() => {
    if (isOwner && serverId) {
      fetchInvites(serverId).then(setInvites).catch(() => {});
    }
  }, [serverId, isOwner, fetchInvites]);

  if (!server) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await updateServer(serverId, { name: name.trim() });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update server');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInvite = async () => {
    try {
      const invite = await createInvite(serverId);
      setInvites((prev) => [invite, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create invite');
    }
  };

  const handleDeleteInvite = async (code: string) => {
    try {
      await deleteInvite(serverId, code);
      setInvites((prev) => prev.filter((i) => i.code !== code));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete invite');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async () => {
    try {
      await deleteServer(serverId);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete server');
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'roles', label: 'Roles' },
    { key: 'members', label: 'Members' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-white text-lg font-bold mb-4">Server Settings</h2>

        <div className="flex gap-1 mb-4 border-b border-gray-700">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
                tab === t.key
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-3 p-2 bg-red-500/20 text-red-300 rounded text-sm">{error}</div>}

        {tab === 'general' && (
          <>
            {isOwner && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-1">Server Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving || name.trim() === server.name}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm font-semibold">Invite Codes</label>
                    <button
                      onClick={handleCreateInvite}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      + Create
                    </button>
                  </div>
                  {invites.length === 0 ? (
                    <p className="text-gray-500 text-sm">No invites yet</p>
                  ) : (
                    <div className="space-y-2">
                      {invites.map((invite) => (
                        <div
                          key={invite.code}
                          className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
                        >
                          <code className="text-white text-sm font-mono">{invite.code}</code>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopy(invite.code)}
                              className="text-xs text-gray-400 hover:text-white"
                            >
                              {copiedCode === invite.code ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                              onClick={() => handleDeleteInvite(invite.code)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  {!confirmDelete ? (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete Server
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-400">Are you sure?</span>
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1 text-gray-400 hover:text-white text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'roles' && <RoleManager serverId={serverId} />}
        {tab === 'members' && <MemberList serverId={serverId} />}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
