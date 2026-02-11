import { useState, useEffect, useCallback } from 'react';
import { useServersStore } from '../../stores/servers';
import { useAuthStore } from '../../stores/auth';
import type { Role } from '../../types';

interface MemberListProps {
  serverId: string;
}

export function MemberList({ serverId }: MemberListProps) {
  const { members, roles, fetchMembers, fetchRoles, fetchMemberRoles, assignRole, removeRole } =
    useServersStore();
  const user = useAuthStore((s) => s.user);
  const servers = useServersStore((s) => s.servers);
  const server = servers.find((s) => s.id === serverId);

  const [memberRolesMap, setMemberRolesMap] = useState<Record<string, Role[]>>({});
  const [error, setError] = useState('');

  const isOwner = server?.owner_id === user?.id;

  // Check if user has ManageRoles permission (owner always does)
  const canManageRoles = isOwner;

  useEffect(() => {
    fetchMembers(serverId);
    fetchRoles(serverId);
  }, [serverId, fetchMembers, fetchRoles]);

  const loadMemberRoles = useCallback(async (userId: string) => {
    try {
      const memberRoles = await fetchMemberRoles(serverId, userId);
      setMemberRolesMap((prev) => ({ ...prev, [userId]: memberRoles || [] }));
    } catch {
      // silently fail
    }
  }, [serverId, fetchMemberRoles]);

  useEffect(() => {
    members.forEach((m) => loadMemberRoles(m.user_id));
  }, [members, loadMemberRoles]);

  const assignableRoles = roles.filter((r) => r.position !== 0);

  const handleAssign = async (userId: string, roleId: string) => {
    setError('');
    try {
      await assignRole(serverId, userId, roleId);
      await loadMemberRoles(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to assign role');
    }
  };

  const handleRemove = async (userId: string, roleId: string) => {
    setError('');
    try {
      await removeRole(serverId, userId, roleId);
      await loadMemberRoles(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove role');
    }
  };

  return (
    <div>
      {error && <div className="mb-3 p-2 bg-red-500/20 text-red-300 rounded text-sm">{error}</div>}

      <div className="space-y-2">
        {members.map((member) => {
          const userRoles = memberRolesMap[member.user_id] || [];
          return (
            <div key={member.user_id} className="bg-gray-700 rounded px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                      {(member.display_name || member.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-white text-sm font-medium">
                      {member.display_name || member.username}
                    </div>
                    <div className="text-gray-400 text-xs">@{member.username}</div>
                  </div>
                </div>
                {server?.owner_id === member.user_id && (
                  <span className="text-xs text-yellow-400">Owner</span>
                )}
              </div>

              {userRoles.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {userRoles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-white"
                      style={{ backgroundColor: role.color || '#4b5563' }}
                    >
                      {role.name}
                      {canManageRoles && (
                        <button
                          onClick={() => handleRemove(member.user_id, role.id)}
                          className="ml-1 hover:text-red-300"
                        >
                          x
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {canManageRoles && assignableRoles.length > 0 && (
                <div className="mt-2">
                  <select
                    className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded border border-gray-500"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) handleAssign(member.user_id, e.target.value);
                    }}
                  >
                    <option value="">Add role...</option>
                    {assignableRoles
                      .filter((r) => !userRoles.some((ur) => ur.id === r.id))
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
