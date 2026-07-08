import React, { useState } from 'react';
import { Send, Calendar, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export function RecordGivingForm({ currentUser, onSubmit, onUpdateUser }) {
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [segment, setSegment] = useState('Local');
  const [category, setCategory] = useState('Tithe');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [receiptFile, setReceiptFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [sundayInPerson, setSundayInPerson] = useState(false);
  const [wednesdayOnline, setWednesdayOnline] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSegmentChange = (seg) => {
    setSegment(seg);
    if (seg === 'Local') {
      setCategory('Tithe');
    } else {
      setCategory('PCO Seed');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReceiptFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const numAmount = Number(amount) || 0;
    if (numAmount <= 0) {
      setError('Total giving amount must be greater than $0.');
      return;
    }

    if (!receiptFile) {
      setError('Please upload a Proof of Payment receipt file.');
      return;
    }

    const res = onSubmit(
      serviceDate,
      segment,
      category,
      numAmount,
      description.trim(),
      paymentMethod,
      receiptFile.name,
      0
    );

    if (res && res.success) {
      setSuccess(true);
      setReceiptFile(null);
      setAmount('');
      setDescription('');
      setError('');
      
      if (onUpdateUser) {
        onUpdateUser(currentUser.id, {
          attendance: { sundayInPerson, wednesdayOnline }
        });
      }
      
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-inner">
      <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
        <Send size={16} className="text-indigo-400" />
        Record My Giving Contribution
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-bold animate-pulse-soft">
          <CheckCircle2 size={16} /> Giving recorded successfully! {currentUser.role === 'admin' ? 'Confirmed instantly.' : 'Awaiting confirmation from higher leaders.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Service Date</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card Payment</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Segment</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSegmentChange('Local')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${segment === 'Local' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                Local Only
              </button>
              <button
                type="button"
                onClick={() => handleSegmentChange('Haven')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${segment === 'Haven' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                Haven Only
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
            >
              {segment === 'Local' ? (
                <>
                  <option value="Tithe">Tithe</option>
                  <option value="Offering">Offering</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Church Hosting">Church Hosting</option>
                </>
              ) : (
                <>
                  <option value="PCO Seed">PCO Seed</option>
                  <option value="Welfare">Welfare</option>
                  <option value="Others">Others</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Giving Amount ($)</label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none transition-colors"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
          <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Attendance Verification</span>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sundayInPerson}
                onChange={(e) => setSundayInPerson(e.target.checked)}
                className="w-3.5 h-3.5 accent-indigo-500 rounded cursor-pointer"
              />
              <span>I was in church on Sunday</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wednesdayOnline}
                onChange={(e) => setWednesdayOnline(e.target.checked)}
                className="w-3.5 h-3.5 accent-indigo-500 rounded cursor-pointer"
              />
              <span>I joined the online service on Wednesday weekly</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Add Additional Description</label>
          <textarea
            placeholder="Add details (e.g. receipt notes, reference codes)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none resize-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Upload Proof of Payment</label>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors relative ${dragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {receiptFile ? (
              <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                <FileText size={16} />
                <span>{receiptFile.name}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                <span className="font-bold text-indigo-400">Click to upload</span> or drag and drop image/PDF
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/20"
        >
          Record Giving Contribution
        </button>
      </form>
    </div>
  );
}

export default RecordGivingForm;
