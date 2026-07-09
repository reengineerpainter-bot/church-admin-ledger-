import React from 'react';

export function UserAvatar({ user, size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] rounded-lg',
    sm: 'w-8 h-8 text-xs rounded-xl',
    md: 'w-10 h-10 text-sm rounded-xl',
    lg: 'w-12 h-12 text-md rounded-2xl',
    xl: 'w-16 h-16 text-lg rounded-2xl',
    xxl: 'w-24 h-24 text-2xl rounded-3xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.name}
        className={`${selectedSize} object-cover border border-slate-800/80 shadow-md ${className}`}
      />
    );
  }

  // Fallback initials generator
  const initials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  // Generate color index deterministically based on user name
  const colors = [
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'bg-violet-500/10 text-violet-400 border-violet-500/20',
  ];

  const charSum = user?.name
    ? user.name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
    : 0;
  const colorClass = colors[charSum % colors.length];

  return (
    <div className={`${selectedSize} flex items-center justify-center font-extrabold border shrink-0 ${colorClass} ${className} select-none`}>
      {initials}
    </div>
  );
}

export default UserAvatar;
