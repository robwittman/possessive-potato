import { useState, useEffect } from 'react';
import { useServersStore } from '../../stores/servers';
import { Permissions, PermissionLabels } from '../../types';
import type { Role } from '../../types';

interface RoleManagerProps {
  serverId: string;
}

export function RoleManager({ serverId }: RoleManagerProps) {
  const { roles, fetchRoles, createRole, updateRole, deleteRole } = useServersStore();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles(serverId);
  }, [serverId, fetchRoles]);

  const handleCreate = async () => {
    if (!newRoleName.trim()) return;
    setError('');
    try {
      await createRole(serverId, { name: newRoleName.trim(), permissions: 0 });
      setNewRoleName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create role');
    }
  };

  const handleDelete = async (roleId: string) => {
    setError('');
    try {
      await deleteRole(serverId, roleId);
      if (editingRole?.id === roleId) setEditingRole(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete role');
    }
  };

  const handlePermissionToggle = async (permission: number) => {
    if (!editingRole) return;
    setError('');
    const newPerms = editingRole.permissions ^ permission;
    try {
      const updated = await updateRole(serverId, editingRole.id, { permissions: newPerms });
      setEditingRole(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    }
  };

  const handleNameSave = async (name: string) => {
    if (!editingRole || !name.trim()) return;
    setError('');
    try {
      const updated = await updateRole(serverId, editingRole.id, { name: name.trim() });
      setEditingRole(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    }
  };

  const handleColorSave = async (color: string) => {
    if (!editingRole) return;
    setError('');
    try {
      const updated = await updateRole(serverId, editingRole.id, { color: color || undefined });
      setEditingRole(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    }
  };

  const permissionBits = Object.values(Permissions) as number[];

  return (
    <div>
      {error && <div className="mb-3 p-2 bg-red-500/20 text-red-300 rounded text-sm">{error}</div>}

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
          placeholder="New role name"
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={!newRoleName.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
        >
          Create
        </button>
      </div>

      <div className="space-y-1 mb-4">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer ${
              editingRole?.id === role.id ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-650'
            }`}
            onClick={() => setEditingRole(role)}
          >
            <div className="flex items-center gap-2">
              {role.color && (
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
              )}
              <span className="text-white text-sm">{role.name}</span>
            </div>
            {role.position !== 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(role.id);
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {editingRole && (
        <RoleEditor
          role={editingRole}
          permissionBits={permissionBits}
          onNameSave={handleNameSave}
          onColorSave={handleColorSave}
          onPermissionToggle={handlePermissionToggle}
        />
      )}
    </div>
  );
}

function RoleEditor({
  role,
  permissionBits,
  onNameSave,
  onColorSave,
  onPermissionToggle,
}: {
  role: Role;
  permissionBits: number[];
  onNameSave: (name: string) => void;
  onColorSave: (color: string) => void;
  onPermissionToggle: (permission: number) => void;
}) {
  const [name, setName] = useState(role.name);
  const [color, setColor] = useState(role.color || '#99aab5');
  const isEveryone = role.position === 0;

  useEffect(() => {
    setName(role.name);
    setColor(role.color || '#99aab5');
  }, [role]);

  return (
    <div className="border-t border-gray-700 pt-4">
      <h4 className="text-white text-sm font-semibold mb-3">Edit: {role.name}</h4>

      {!isEveryone && (
        <div className="mb-3">
          <label className="block text-gray-400 text-xs mb-1">Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
            />
            <button
              onClick={() => onNameSave(name)}
              disabled={name === role.name || !name.trim()}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {!isEveryone && (
        <div className="mb-3">
          <label className="block text-gray-400 text-xs mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-gray-600 cursor-pointer"
            />
            <button
              onClick={() => onColorSave(color)}
              disabled={color === (role.color || '#99aab5')}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div>
        <label className="block text-gray-400 text-xs mb-2">Permissions</label>
        <div className="space-y-1">
          {permissionBits.map((perm) => (
            <label key={perm} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={(role.permissions & perm) !== 0}
                onChange={() => onPermissionToggle(perm)}
                className="rounded border-gray-600"
              />
              {PermissionLabels[perm]}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
