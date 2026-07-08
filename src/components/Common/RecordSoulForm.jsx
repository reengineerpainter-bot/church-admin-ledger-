import React, { useState } from 'react';
import { Sparkles, User, MapPin, Phone, Briefcase, CheckCircle } from 'lucide-react';

export function RecordSoulForm({ currentUser, chapters = [], cells = [], onSubmit }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [sex, setSex] = useState('Male');
  const [profession, setProfession] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [selectedCellId, setSelectedCellId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Filter cells based on chapter choice
  const availableCells = cells.filter(c => c.chapterId === (selectedChapterId || currentUser.chapterId));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!name.trim() || !address.trim() || !phone.trim() || !profession.trim()) {
      setError('Please fill in all fields (Name, Phone, Profession, Address).');
      return;
    }

    const soulChapterId = currentUser.role === 'admin' ? selectedChapterId : currentUser.chapterId;
    const soulCellId = currentUser.role === 'admin' ? selectedCellId : (currentUser.role === 'chapter_leader' ? selectedCellId : currentUser.cellId);

    if (currentUser.role === 'admin' && !soulChapterId) {
      setError('Please select a chapter to assign the soul.');
      return;
    }

    const res = onSubmit(
      name.trim(),
      address.trim(),
      phone.trim(),
      sex,
      profession.trim(),
      soulChapterId,
      soulCellId
    );

    if (res && res.success) {
      setSuccess(true);
      setName('');
      setAddress('');
      setPhone('');
      setProfession('');
      setError('');
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-inner">
      <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-indigo-400" />
        Record Soul Won & Brought to Church
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-bold animate-pulse-soft">
          <CheckCircle size={16} /> Soul win recorded successfully! {currentUser.role === 'admin' ? 'Activated instantly as member.' : 'Awaiting confirmation from your higher leader.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Soul's Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. +2348012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Gender (Sex)</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Profession</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. Architect"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Home Address</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="e.g. 12 Grace Court, Lagos"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
            />
          </div>
        </div>

        {/* Dynamic assignments based on leader visibility */}
        {currentUser.role === 'admin' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Assign Chapter</label>
              <select
                value={selectedChapterId}
                onChange={(e) => { setSelectedChapterId(e.target.value); setSelectedCellId(''); }}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
              >
                <option value="">-- Select Chapter --</option>
                {chapters.map(ch => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Assign Cell (Optional)</label>
              <select
                value={selectedCellId}
                onChange={(e) => setSelectedCellId(e.target.value)}
                disabled={!selectedChapterId}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors disabled:opacity-50"
              >
                <option value="">-- Select Cell (None) --</option>
                {availableCells.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentUser.role === 'chapter_leader' && (
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Assign Cell Group (Optional)</label>
            <select
              value={selectedCellId}
              onChange={(e) => setSelectedCellId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
            >
              <option value="">-- Select Cell (None/General Chapter) --</option>
              {availableCells.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/20"
        >
          Submit Soul Win Details
        </button>
      </form>
    </div>
  );
}

export default RecordSoulForm;
