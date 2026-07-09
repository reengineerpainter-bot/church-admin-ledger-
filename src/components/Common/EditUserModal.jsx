import React, { useState, useEffect } from 'react';
import { User, Key, Globe, LayoutGrid, X, Shield, CheckCircle, AlertTriangle, Camera, RotateCw } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
  chapters = [],
  cells = [],
  isAdminMode = false,
  currentUserRole = 'member'
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [chapterId, setChapterId] = useState('');
  const [cellId, setCellId] = useState('');
  const [status, setStatus] = useState('Active');
  const [title, setTitle] = useState('Bro');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Cropping states
  const [cropImage, setCropImage] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync state with selected user data when modal opens
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setPassword(user.tempPassword || 'Pass123!');
      setRole(user.role || 'member');
      setChapterId(user.chapterId || '');
      setCellId(user.cellId || '');
      setStatus(user.status || 'Active');
      setTitle(user.title || 'Bro');
      setAvatarUrl(user.avatarUrl || '');
      setError('');
      setSuccess(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Filter cells based on selected chapter
  const filteredCells = cells.filter(cell => cell.chapterId === chapterId);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImage(reader.result);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // Clean background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 256);
      
      // Rotate and draw image from center
      ctx.translate(128, 128);
      ctx.rotate((rotation * Math.PI) / 180);
      
      const containerSize = 288;
      let renderWidth, renderHeight;
      const imageRatio = img.width / img.height;
      
      if (imageRatio > 1) {
        renderWidth = containerSize;
        renderHeight = containerSize / imageRatio;
      } else {
        renderWidth = containerSize * imageRatio;
        renderHeight = containerSize;
      }
      
      const drawWidth = renderWidth * zoom;
      const drawHeight = renderHeight * zoom;
      
      const scaleFactor = 256 / containerSize;
      ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor);
      
      ctx.drawImage(
        img,
        -drawWidth * scaleFactor / 2,
        -drawHeight * scaleFactor / 2,
        drawWidth * scaleFactor,
        drawHeight * scaleFactor
      );
      
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.85);
      setAvatarUrl(croppedBase64);
      setCropImage(null);
    };
    img.src = cropImage;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim()) {
      setError('Name field cannot be empty.');
      return;
    }
    if (!username.trim()) {
      setError('Username field cannot be empty.');
      return;
    }
    if (!password.trim()) {
      setError('Password field cannot be empty.');
      return;
    }

    const updatedFields = {
      name: name.trim(),
      username: username.trim().toLowerCase(),
      tempPassword: password.trim(),
      title: title,
      avatarUrl: avatarUrl
    };

    // If administrative mode is active, allow changing configuration attributes based on permissions
    if (isAdminMode) {
      updatedFields.status = status;
      
      // Pastor/Admin can edit everything
      if (currentUserRole === 'admin') {
        updatedFields.role = role;
        updatedFields.chapterId = (role === 'admin' || role === 'member') ? '' : chapterId;
        updatedFields.cellId = (role === 'cell_leader' || role === 'member') ? cellId : '';
        
        // Members need both chapter and cell
        if (role === 'member') {
          updatedFields.chapterId = chapterId;
          updatedFields.cellId = cellId;
        }
      } 
      // Chapter Leader can assign cells but chapter is fixed
      else if (currentUserRole === 'chapter_leader') {
        updatedFields.cellId = cellId;
      }
    }

    // Call save handler
    const res = onSave(user.id, updatedFields);
    if (res && !res.success) {
      setError(res.error || 'Failed to update credentials.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    }
  };

  // Determine what inputs are editable based on roles
  const canEditRoleAndScope = isAdminMode && currentUserRole === 'admin';
  const canEditCell = isAdminMode && (currentUserRole === 'admin' || currentUserRole === 'chapter_leader');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 transition-all duration-300">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-850">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User size={16} />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-100">
                {isAdminMode ? 'Modify User Profile' : 'Edit My Profile'}
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase -mt-0.5">
                {isAdminMode ? `Managing @${user.username}` : 'Update personal credentials'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-350 hover:bg-slate-850 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-450 text-xs rounded-xl font-semibold flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-450 text-xs rounded-xl font-bold flex items-center gap-2">
              <CheckCircle size={14} className="shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {/* Profile Picture Uploader (Real Pictures Only) */}
          <div className="flex flex-col items-center gap-4 bg-slate-950 p-6 border border-slate-850 rounded-3xl">
            <div className="relative group cursor-pointer w-32 h-32">
              <label htmlFor="avatar-upload" className="cursor-pointer block w-full h-full">
                <UserAvatar user={{ name, avatarUrl }} size="xxxl" className="ring-4 ring-indigo-500/20 group-hover:opacity-85 transition-opacity w-full h-full" />
                <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                  <Camera size={28} />
                </div>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            <div className="text-center w-full">
              <span className="block text-[10px] text-slate-500 font-semibold tracking-wider uppercase mb-1.5">Real Profile Photo</span>
              <p className="text-[11px] text-slate-400 font-medium mb-3">Click on the image circle to upload a clear face photo from your device.</p>
              {avatarUrl && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCropImage(avatarUrl);
                      setZoom(1);
                      setRotation(0);
                      setOffset({ x: 0, y: 0 });
                    }}
                    className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer select-none"
                  >
                    Adjust / Crop
                  </button>
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-3.5 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-455 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer select-none"
                  >
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Honorific Title prefix selection */}
          <div>
            <label className="block text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-1.5">Honorific Title</label>
            <div className="flex gap-2">
              {['Bro', 'Sis', 'Pastor'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTitle(t)}
                  className={`py-1.5 px-3.5 rounded-xl border text-[11px] font-bold transition-all ${title === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-450 hover:text-slate-205'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl text-xs outline-none transition-colors"
              />
            </div>
          </div>

          {/* Username and Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="username"
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl text-xs outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-455 text-[10px] font-bold uppercase tracking-wider mb-1.5">Simulated Password</label>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 rounded-xl text-xs outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Administrative Settings */}
          {isAdminMode && (
            <div className="border-t border-slate-850 pt-4 space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Shield size={14} /> System Configuration (Admin Only)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role (Only Global Admin) */}
                <div>
                  <label className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1.5">User Role</label>
                  <select
                    value={role}
                    disabled={!canEditRoleAndScope}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (e.target.value === 'admin') {
                        setChapterId('');
                        setCellId('');
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="admin" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Pastor / Global Admin</option>
                    <option value="chapter_leader" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Chapter Leader</option>
                    <option value="cell_leader" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Cell Leader</option>
                    <option value="member" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Registered Member</option>
                  </select>
                </div>

                {/* Status (Admin / Chapter Leader) */}
                <div>
                  <label className="block text-slate-450 text-[10px] font-bold uppercase tracking-wider mb-1.5">Account Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none"
                  >
                    <option value="Active" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Active</option>
                    <option value="Pending_Higher_Approval" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Pending Confirmation</option>
                    <option value="Rejected" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Rejected / Disabled</option>
                  </select>
                </div>
              </div>

              {/* Scope & Assignments */}
              {role !== 'admin' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                  {/* Chapter Select */}
                  <div>
                    <label className="block text-slate-550 text-[9px] font-bold uppercase tracking-wider mb-1.5">Chapter Region</label>
                    <div className="relative">
                      <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <select
                        value={chapterId}
                        disabled={!canEditRoleAndScope}
                        onChange={(e) => {
                          setChapterId(e.target.value);
                          setCellId('');
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>None / Unassigned</option>
                        {chapters.map(ch => (
                          <option key={ch.id} value={ch.id} className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{ch.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cell Select */}
                  {(role === 'cell_leader' || role === 'member') && (
                    <div>
                      <label className="block text-slate-550 text-[9px] font-bold uppercase tracking-wider mb-1.5">Fellowship Cell</label>
                      <div className="relative">
                        <LayoutGrid size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <select
                          value={cellId}
                          disabled={!canEditCell}
                          onChange={(e) => setCellId(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="" className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>None / Unassigned</option>
                          {cells.filter(c => c.chapterId === chapterId).map(c => (
                            <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200 font-medium" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer Controls */}
          <div className="border-t border-slate-850 pt-4 flex items-center justify-end gap-3 bg-slate-900/60 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/20"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>

      {/* Crop / Zoom Modal Overlay */}
      {cropImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-955/95 backdrop-blur-md p-4 transition-all select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-100">Crop Profile Photo</h4>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Drag to center | Slider to Zoom</p>
              </div>
              <button 
                type="button" 
                onClick={() => setCropImage(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-350 hover:bg-slate-850 transition-colors cursor-pointer border-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Interactive Crop Frame */}
            <div 
              className="w-72 h-72 mx-auto bg-slate-955 relative overflow-hidden rounded-[2rem] border border-slate-855 flex items-center justify-center cursor-move select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              <img 
                src={cropImage} 
                alt="Drag & Zoom" 
                className="max-w-none pointer-events-none"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                  maxHeight: '100%',
                  maxWidth: '100%',
                }}
              />
              {/* Target Circular Mask boundary indicator */}
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-indigo-500/80 pointer-events-none ring-[200px] ring-black/40" />
            </div>

            {/* Range Zoom Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Scale: {Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors border-none cursor-pointer"
                >
                  <RotateCw size={10} /> Rotate 90°
                </button>
              </div>
              <input 
                type="range" 
                min="1" 
                max="3.5" 
                step="0.02" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCropImage(null)}
                className="flex-1 py-2 bg-slate-855 hover:bg-slate-800 text-slate-350 hover:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/20 cursor-pointer border-none"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditUserModal;
