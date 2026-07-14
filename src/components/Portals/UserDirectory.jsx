import React, { useState } from 'react';
import { Search, Filter, Shield, Edit, User, MapPin, Grid, CheckCircle2, AlertCircle } from 'lucide-react';
import { EditUserModal } from '../Common/EditUserModal';
import { UserAvatar } from '../Common/UserAvatar';

export function UserDirectory({
  currentUser,
  users,
  chapters = [],
  cells = [],
  updateUser,
  requestUserDeletion
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);

  // --- HIERARCHICAL SCOPE FILTERING ---
  const getScopedUsers = () => {
    if (currentUser.role === 'admin') {
      // Admin sees everyone except themselves
      return users.filter(u => u.id !== currentUser.id);
    }
    
    if (currentUser.role === 'chapter_leader') {
      // Chapter Leader sees Cell Leaders and Members inside their chapter
      return users.filter(u => 
        u.chapterId === currentUser.chapterId && 
        u.id !== currentUser.id && 
        (u.role === 'cell_leader' || u.role === 'member')
      );
    }
    
    if (currentUser.role === 'cell_leader') {
      // Cell Leader sees only Members in their cell
      return users.filter(u => 
        u.cellId === currentUser.cellId && 
        u.id !== currentUser.id && 
        u.role === 'member'
      );
    }
    
    return []; // Members don't see a directory
  };

  const scopedUsers = getScopedUsers();

  // --- SEARCH AND FILTER LOGIC ---
  const filteredUsers = scopedUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    if (role === 'admin') return 'badge-indigo-soft';
    if (role === 'chapter_leader') return 'badge-indigo-soft';
    if (role === 'cell_leader') return 'badge-slate-soft';
    return 'badge-emerald-soft';
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') return 'badge-emerald-soft';
    if (status === 'Pending_Higher_Approval') return 'badge-amber-soft';
    if (status === 'Pending_Deletion') return 'badge-rose-soft';
    return 'badge-rose-soft';
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Pastor';
    if (role === 'chapter_leader') return 'Chapter Leader';
    if (role === 'cell_leader') return 'Cell Leader';
    return 'Member';
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-grow">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or @username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-955 border border-slate-800 custom-focus text-slate-100 rounded-xl text-xs outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {currentUser.role === 'admin' && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Shield size={12} className="text-indigo-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-slate-350 text-xs font-bold outline-none cursor-pointer custom-focus"
              >
                <option value="all" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>All Roles</option>
                <option value="chapter_leader" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Chapter Leaders</option>
                <option value="cell_leader" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Cell Leaders</option>
                <option value="member" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Members</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <Filter size={12} className="text-indigo-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-350 text-xs font-bold outline-none cursor-pointer custom-focus"
            >
              <option value="all" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>All Statuses</option>
              <option value="Active" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Active</option>
              <option value="Pending_Higher_Approval" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Pending Approval</option>
              <option value="Rejected" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Rejected / Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/20">
        <table className="w-full text-left text-xs border-collapse min-w-[800px]">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
              <th className="px-5 py-3.5">Full Name</th>
              <th className="px-5 py-3.5">Username</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5">Regional Scope</th>
              <th className="px-5 py-3.5">Account Status</th>
              <th className="px-5 py-3.5">Temp Password</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 font-medium text-slate-300">
            {filteredUsers.map(u => {
              const chapter = chapters.find(ch => ch.id === u.chapterId);
              const cell = cells.find(c => c.id === u.cellId);
              return (
                <tr key={u.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-5 py-3.5 text-slate-100 font-bold flex items-center gap-2">
                    <UserAvatar user={u} size="xs" className="shrink-0" />
                    {u.name}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-400">@{u.username}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[9px] px-2 py-0.5 border rounded uppercase font-bold ${getRoleBadge(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-405">
                    {chapter ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-slate-205 flex items-center gap-1 font-semibold">
                          <MapPin size={10} className="text-slate-500" />
                          {chapter.name}
                        </span>
                        {cell && (
                          <span className="text-[10px] text-slate-450 flex items-center gap-1">
                            <Grid size={10} className="text-slate-605" />
                            {cell.name}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">None / Global Root</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[9px] px-2 py-0.5 border rounded uppercase font-bold flex items-center gap-1 w-fit ${getStatusBadge(u.status)}`}>
                      {u.status === 'Active' ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <AlertCircle size={10} />
                      )}
                      {u.status === 'Pending_Higher_Approval' ? 'Pending Approval' : u.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs">{u.tempPassword || '—'}</td>
                  <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg border border-indigo-500/20 transition-all active:scale-95 text-[10px]"
                    >
                      <Edit size={10} /> Edit Credentials
                    </button>
                    {currentUser.role === 'chapter_leader' && requestUserDeletion && (
                      u.status === 'Pending_Deletion' ? (
                        <span className="text-[10px] text-amber-400 font-bold px-2 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10 select-none">Pending Deletion approval</span>
                      ) : (
                        <button
                          onClick={() => requestUserDeletion(u.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg border border-rose-500/20 transition-all active:scale-95 text-[10px]"
                        >
                          Request Deletion
                        </button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-slate-500 py-10 italic">
                  No directory records match the active search and filter constraints.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={updateUser}
        chapters={chapters}
        cells={cells}
        isAdminMode={true}
        currentUserRole={currentUser.role}
      />
    </div>
  );
}

export default UserDirectory;
