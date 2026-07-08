import { useState, useEffect } from 'react';
import { initialUsers, initialLedger, initialChapters, initialCells } from '../data/mockData';

export function useAppState() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('church_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [ledger, setLedger] = useState(() => {
    const saved = localStorage.getItem('church_ledger');
    return saved ? JSON.parse(saved) : initialLedger;
  });

  const [chapters, setChapters] = useState(() => {
    const saved = localStorage.getItem('church_chapters');
    return saved ? JSON.parse(saved) : initialChapters;
  });

  const [cells, setCells] = useState(() => {
    const saved = localStorage.getItem('church_cells');
    return saved ? JSON.parse(saved) : initialCells;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem('church_current_user_id');
    return saved || 'u1'; // Default to Pastor Chris
  });

  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('church_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'log_init', text: 'System initialized. Loaded default database.', time: new Date().toLocaleTimeString() }
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('church_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('church_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('church_chapters', JSON.stringify(chapters));
  }, [chapters]);

  useEffect(() => {
    localStorage.setItem('church_cells', JSON.stringify(cells));
  }, [cells]);

  useEffect(() => {
    localStorage.setItem('church_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('church_logs', JSON.stringify(logs));
  }, [logs]);

  const currentUser = users.find(u => u.id === currentUserId);

  // Helper to add system audit logs
  const addLog = (text) => {
    const newLog = {
      id: `log_${Date.now()}`,
      text,
      time: new Date().toLocaleString()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const switchUser = (userId) => {
    setCurrentUserId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      addLog(`Switched active profile to ${targetUser.name} (${targetUser.role.toUpperCase()})`);
    }
  };

  const logout = () => {
    setCurrentUserId('logged_out');
    addLog(`Logged out active profile session.`);
  };

  const login = (username, password) => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    const matched = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (!matched) {
      return { success: false, error: 'Username not found.' };
    }
    if (matched.status === 'Rejected') {
      return { success: false, error: 'This credential account has been rejected by higher administration.' };
    }
    const expectedPassword = matched.tempPassword || 'password';
    if (password !== expectedPassword) {
      return { success: false, error: 'Incorrect credentials password.' };
    }
    setCurrentUserId(matched.id);
    addLog(`Authenticated session as ${matched.name} (@${matched.username})`);
    return { success: true };
  };

  // Credential Provisioning Workflow
  const createCredential = (username, name, password, role, targetChapterId, targetCellId, title = 'Bro') => {
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already exists' };
    }

    const newId = `u_${Date.now()}`;
    let status = 'Pending_Higher_Approval';

    // Pastor creates Chapter Leaders -> Instantly Active
    if (currentUser.role === 'admin' && role === 'chapter_leader') {
      status = 'Active';
    }

    const newUser = {
      id: newId,
      username,
      name,
      role,
      chapterId: targetChapterId || currentUser.chapterId || '',
      cellId: targetCellId || currentUser.cellId || '',
      status,
      creatorId: currentUser.id,
      tempPassword: password,
      title
    };

    setUsers(prev => [...prev, newUser]);
    
    if (status === 'Active') {
      addLog(`${currentUser.name} created and instantly activated Chapter Leader credentials for ${name}.`);
    } else {
      const pendingTier = role === 'cell_leader' ? 'Pastor Confirmation' : 'Chapter Leader Confirmation';
      addLog(`${currentUser.name} created credentials for ${name} (${role}). Status: Awaiting ${pendingTier}.`);
    }

    return { success: true };
  };

  const approveCredential = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addLog(`${currentUser.name} approved credentials for ${u.name} (${u.role.toUpperCase()}). User is now Active.`);
        return { ...u, status: 'Active' };
      }
      return u;
    }));
  };

  const rejectCredential = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addLog(`${currentUser.name} rejected credentials for ${u.name} (${u.role.toUpperCase()}).`);
        return { ...u, status: 'Rejected' };
      }
      return u;
    }));
  };

  // Ledger / Giving Workflow
  const submitLedgerEntry = (serviceDate, segment, category, amount, description, paymentMethod, receiptFileName, newMembersBroughtIn) => {
    const numericAmount = Number(amount) || 0;
    const dummyBreakdown = {
      tithe: category === 'Tithe' ? numericAmount : 0,
      offering: category === 'Offering' ? numericAmount : 0,
      firstFruit: category === 'First Fruit' ? numericAmount : 0,
      localSeed: (category === 'Partnership' || category === 'Church Hosting') ? numericAmount : 0,
      havenSeed: (category === 'PCO Seed' || category === 'Welfare' || category === 'Others') ? numericAmount : 0
    };

    const newEntry = {
      id: `l_${Date.now()}`,
      memberId: currentUser.id,
      memberName: currentUser.name,
      chapterId: currentUser.chapterId,
      cellId: currentUser.cellId,
      serviceDate,
      segment,
      category,
      amount: numericAmount,
      totalAmount: numericAmount,
      breakdown: dummyBreakdown,
      description: description || '',
      paymentMethod,
      receiptUrl: receiptFileName || 'receipt_placeholder.png',
      newMembersBroughtIn: Number(newMembersBroughtIn) || 0,
      status: 'Pending_Cell_Review',
      createdAt: new Date().toISOString()
    };

    setLedger(prev => [newEntry, ...prev]);
    addLog(`${currentUser.name} submitted ${segment} giving (${category}) of $${numericAmount}. Status: Pending Cell Review.`);
    return { success: true };
  };

  const verifyLedgerEntry = (ledgerId, isApproved) => {
    setLedger(prev => prev.map(item => {
      if (item.id === ledgerId) {
        const newStatus = isApproved ? 'Confirmed' : 'Rejected';
        addLog(`${currentUser.name} ${isApproved ? 'Approved' : 'Rejected'} weekly ledger entry of $${item.totalAmount} from ${item.memberName}.`);
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  // Hierarchy Structure Modifiers
  const createChapter = (name, headquarters) => {
    const newId = `c_${Date.now()}`;
    const newChapter = { id: newId, name, headquarters };
    setChapters(prev => [...prev, newChapter]);
    addLog(`${currentUser.name} created new Chapter: ${name} (Headquarters: ${headquarters}).`);
    return newId;
  };

  const createCell = (name, chapterId, leaderName = 'Vacant') => {
    const newId = `cell_${Date.now()}`;
    const newCell = { id: newId, name, chapterId, leaderName };
    setCells(prev => [...prev, newCell]);
    addLog(`${currentUser.name} created new Cell Group: ${name} (Chapter ID: ${chapterId}).`);
    return newId;
  };

  const updateUser = (userId, updatedData) => {
    if (updatedData.username) {
      const exists = users.some(
        u => u.id !== userId && u.username.toLowerCase() === updatedData.username.toLowerCase()
      );
      if (exists) {
        return { success: false, error: 'Username already taken.' };
      }
    }

    setUsers(prev => {
      return prev.map(u => {
        if (u.id === userId) {
          const changes = [];
          if (updatedData.title && updatedData.title !== u.title) changes.push(`title to "${updatedData.title}"`);
          if (updatedData.name && updatedData.name !== u.name) changes.push(`name to "${updatedData.name}"`);
          if (updatedData.username && updatedData.username !== u.username) changes.push(`username to "@${updatedData.username}"`);
          if (updatedData.tempPassword && updatedData.tempPassword !== u.tempPassword) changes.push('password');
          if (updatedData.role && updatedData.role !== u.role) changes.push(`role to "${updatedData.role}"`);
          if (updatedData.chapterId && updatedData.chapterId !== u.chapterId) {
            const chName = chapters.find(c => c.id === updatedData.chapterId)?.name || updatedData.chapterId;
            changes.push(`chapter to "${chName}"`);
          }
          if (updatedData.cellId && updatedData.cellId !== u.cellId) {
            const cName = cells.find(c => c.id === updatedData.cellId)?.name || updatedData.cellId;
            changes.push(`cell to "${cName}"`);
          }
          if (updatedData.status && updatedData.status !== u.status) changes.push(`status to "${updatedData.status}"`);

          if (changes.length > 0) {
            addLog(`${currentUser.name} updated profile details for ${u.name} (Changed: ${changes.join(', ')}).`);
          }
          return { ...u, ...updatedData };
        }
        return u;
      });
    });

    return { success: true };
  };

  const requestUserDeletion = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addLog(`${currentUser.name} initiated deletion request for credentials of ${u.name} (${u.role.toUpperCase()}).`);
        return { ...u, status: 'Pending_Deletion' };
      }
      return u;
    }));
    return { success: true };
  };

  const approveUserDeletion = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      addLog(`${currentUser.name} approved deletion. Permanent removal of credentials for ${targetUser.name} completed.`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
    return { success: true };
  };

  const rejectUserDeletion = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        addLog(`${currentUser.name} rejected deletion request for ${u.name}. Restored status to Active.`);
        return { ...u, status: 'Active' };
      }
      return u;
    }));
    return { success: true };
  };

  const resetData = () => {
    localStorage.removeItem('church_users');
    localStorage.removeItem('church_ledger');
    localStorage.removeItem('church_chapters');
    localStorage.removeItem('church_cells');
    localStorage.removeItem('church_current_user_id');
    localStorage.removeItem('church_logs');
    setUsers(initialUsers);
    setLedger(initialLedger);
    setChapters(initialChapters);
    setCells(initialCells);
    setCurrentUserId('u1');
    setLogs([{ id: 'log_reset', text: 'Database reset to initial mock configurations.', time: new Date().toLocaleTimeString() }]);
  };

  return {
    currentUserId,
    currentUser,
    users,
    ledger,
    chapters,
    cells,
    logs,
    switchUser,
    createCredential,
    approveCredential,
    rejectCredential,
    submitLedgerEntry,
    verifyLedgerEntry,
    createChapter,
    createCell,
    updateUser,
    requestUserDeletion,
    approveUserDeletion,
    rejectUserDeletion,
    login,
    logout,
    resetData
  };
}
