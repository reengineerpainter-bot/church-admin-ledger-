import React, { useState, useEffect } from 'react';
import { User, Key, Globe, LayoutGrid, CheckCircle } from 'lucide-react';

export function CredentialForm({ 
  creatorRole, 
  targetRole, 
  chapters = [], 
  cells = [], 
  currentChapterId = '', 
  currentCellId = '', 
  onSubmit 
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [cellId, setCellId] = useState('');
  const [title, setTitle] = useState('Bro');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [selectedRole, setSelectedRole] = useState(targetRole || 'chapter_leader');

  useEffect(() => {
    if (targetRole) {
      setSelectedRole(targetRole);
    }
  }, [targetRole]);

  // Initialize chapter/cell locks
  useEffect(() => {
    const isHigherAdmin = ['admin', 'group_pastor', 'pastor'].includes(creatorRole);
    if (creatorRole === 'chapter_leader') {
      setChapterId(currentChapterId);
    } else if (creatorRole === 'cell_leader') {
      setChapterId(currentChapterId);
      setCellId(currentCellId);
    } else if (isHigherAdmin) {
      // Don't lock chapters/cells for global administrators
    }
  }, [creatorRole, currentChapterId, currentCellId]);

  // Filter chapters and cells based on creator's jurisdiction and selected role
  const selectableChapters = chapters.filter(ch => {
    if (creatorRole === 'chapter_leader' || creatorRole === 'cell_leader') {
      if (ch.id !== currentChapterId) return false;
    }
    
    if (selectedRole === 'group_pastor') {
      return ch.type === 'group';
    }
    if (selectedRole === 'pastor') {
      return ch.type === 'church';
    }
    if (selectedRole === 'chapter_leader') {
      return ch.type === 'chapter' || !ch.type;
    }
    return ch.type === 'chapter' || !ch.type;
  });

  const selectableCells = cells.filter(cell => {
    if (creatorRole === 'cell_leader') {
      return cell.id === currentCellId;
    }
    if (creatorRole === 'chapter_leader') {
      return cell.chapterId === currentChapterId;
    }
    return cell.chapterId === chapterId;
  });

  const getSelectableRoles = () => {
    if (creatorRole === 'admin') {
      return [
        { value: 'group_pastor', label: 'Group Pastor (L2)' },
        { value: 'pastor', label: 'Pastor (L3)' },
        { value: 'chapter_leader', label: 'Chapter Leader (L4)' },
        { value: 'cell_leader', label: 'Cell Leader (L5)' },
        { value: 'member', label: 'Member (L6)' }
      ];
    }
    if (creatorRole === 'group_pastor') {
      return [
        { value: 'pastor', label: 'Pastor (L3)' },
        { value: 'chapter_leader', label: 'Chapter Leader (L4)' },
        { value: 'cell_leader', label: 'Cell Leader (L5)' },
        { value: 'member', label: 'Member (L6)' }
      ];
    }
    if (creatorRole === 'pastor') {
      return [
        { value: 'chapter_leader', label: 'Chapter Leader (L4)' },
        { value: 'cell_leader', label: 'Cell Leader (L5)' },
        { value: 'member', label: 'Member (L6)' }
      ];
    }
    return [];
  };

  const selectableRoles = getSelectableRoles();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all general fields.');
      return;
    }

    if (selectedRole === 'chapter_leader' && !chapterId) {
      setError('Please select a chapter for the leader.');
      return;
    }

    if ((selectedRole === 'cell_leader' || selectedRole === 'member') && (!chapterId || !cellId)) {
      setError('Please select a chapter and a cell.');
      return;
    }

    // Call submit handler
    const res = onSubmit(
      username.trim().toLowerCase(), 
      name.trim(), 
      password, 
      selectedRole, 
      chapterId, 
      cellId,
      title
    );

    if (res && !res.success) {
      setError(res.error || 'Failed to create credentials.');
    } else {
      setSuccess(true);
      setName('');
      setUsername('');
      setPassword('');
      const isHigherAdmin = ['admin', 'group_pastor', 'pastor'].includes(creatorRole);
      if (isHigherAdmin) {
        setChapterId('');
        setCellId('');
      }
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const getRoleLabel = () => {
    if (selectedRole === 'group_pastor') return 'Group Pastor';
    if (selectedRole === 'pastor') return 'Pastor';
    if (selectedRole === 'chapter_leader') return 'Chapter Leader';
    if (selectedRole === 'cell_leader') return 'Cell Leader';
    return 'Registered Member';
  };

  const isHigherAdmin = ['admin', 'group_pastor', 'pastor'].includes(creatorRole);

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 sm:p-6 rounded-2xl">
      <h3 className="text-lg font-bold text-slate-105 mb-4 flex items-center gap-2">
        <User size={18} className="text-indigo-400" />
        Create New Credential
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle size={16} />
          Credentials created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector (Only for Higher Admin Authorities) */}
        {selectableRoles.length > 0 && (
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Assign Workspace Role</label>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setChapterId('');
                  setCellId('');
                }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-105 rounded-xl text-sm outline-none transition-all"
              >
                {selectableRoles.map(r => (
                  <option key={r.value} value={r.value} className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Title Prefix Selector */}
        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Honorific Title</label>
          <div className="flex gap-2">
            {['Bro', 'Sis', 'Pastor'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTitle(t)}
                className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${title === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-955 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-505" />
            <input
              type="text"
              placeholder="e.g. Brother Thomas Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-101 rounded-xl text-sm outline-none transition-all"
            />
          </div>
        </div>

        {/* Username & Temp Password grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">@</span>
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Temp Password</label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Temporary password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Chapter/Assignment Selection */}
        {selectedRole !== 'admin' && (
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Assignment</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select
                value={chapterId}
                disabled={!isHigherAdmin && creatorRole !== 'admin'}
                onChange={(e) => {
                  setChapterId(e.target.value);
                  setCellId(''); // Reset cell selection
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Select Structure...</option>
                {selectableChapters.map(ch => (
                  <option key={ch.id} value={ch.id} className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{ch.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Cell Selection */}
        {(selectedRole === 'cell_leader' || selectedRole === 'member') && (
          <div>
            <label className="block text-slate-405 text-xs font-semibold uppercase tracking-wider mb-2">Cell Assignment</label>
            <div className="relative">
              <LayoutGrid size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-505" />
              <select
                value={cellId}
                disabled={creatorRole === 'cell_leader'}
                onChange={(e) => setCellId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Select Cell...</option>
                {selectableCells.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{c.name}</option>
                ))}
              </select>
            </div>
            {chapterId && selectableCells.length === 0 && (
              <span className="text-xs text-amber-500 mt-1 block">No cells found for selected Chapter. Create a cell first.</span>
            )}
          </div>
        )}

        {/* Informational Text */}
        <div className="text-xs text-slate-500 leading-relaxed pt-1">
          {selectedRole === 'group_pastor' || selectedRole === 'pastor' || selectedRole === 'chapter_leader' ? (
            <span>* Created credentials are <strong className="text-emerald-450">Instantly Activated</strong> since they are provisioned by a Zonal Authority.</span>
          ) : selectedRole === 'cell_leader' ? (
            <span>* Saved as <strong className="text-amber-400">Pending Pastor Confirmation</strong>. Credentials will not be active until approved by the Pastor.</span>
          ) : (
            <span>* Saved as <strong className="text-amber-400">Pending Chapter Leader Confirmation</strong>. Credentials will not be active until approved by your Chapter Leader.</span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-xl text-sm transition-all duration-300 shadow-md shadow-indigo-950/20 active:scale-[0.98]"
        >
          Provision Credentials
        </button>
      </form>
    </div>
  );
}
export default CredentialForm;
