export const initialChapters = [
  { id: 'c1', name: 'Grace Chapter', headquarters: 'Lagos' },
  { id: 'c2', name: 'Hope Chapter', headquarters: 'London' }
];

export const initialCells = [
  { id: 'cell1', name: 'Joy Cell', chapterId: 'c1', leaderName: 'Cell Leader Mary' },
  { id: 'cell2', name: 'Peace Cell', chapterId: 'c1', leaderName: 'Cell Leader James' },
  { id: 'cell3', name: 'Love Cell', chapterId: 'c2', leaderName: 'Cell Leader Peter' },
  { id: 'cell4', name: 'Life Cell', chapterId: 'c2', leaderName: 'Vacant' }
];

export const initialUsers = [
  // Admin / Pastor
  {
    id: 'u1',
    username: 'pastorchris',
    name: 'Pastor Chris',
    role: 'admin',
    status: 'Active',
    title: 'Pastor'
  },
  // Chapter Leaders
  {
    id: 'u2',
    username: 'cldavid',
    name: 'CL David',
    role: 'chapter_leader',
    chapterId: 'c1',
    status: 'Active',
    title: 'Bro'
  },
  {
    id: 'u3',
    username: 'clsarah',
    name: 'CL Sarah',
    role: 'chapter_leader',
    chapterId: 'c2',
    status: 'Active',
    title: 'Sis'
  },
  // Cell Leaders
  {
    id: 'u4',
    username: 'marycell',
    name: 'Cell Leader Mary',
    role: 'cell_leader',
    chapterId: 'c1',
    cellId: 'cell1',
    status: 'Active',
    creatorId: 'u2',
    title: 'Sis'
  },
  {
    id: 'u5',
    username: 'jamescell',
    name: 'Cell Leader James',
    role: 'cell_leader',
    chapterId: 'c1',
    cellId: 'cell2',
    status: 'Active',
    creatorId: 'u2',
    title: 'Bro'
  },
  {
    id: 'u6',
    username: 'petercell',
    name: 'Cell Leader Peter',
    role: 'cell_leader',
    chapterId: 'c2',
    cellId: 'cell3',
    status: 'Active',
    creatorId: 'u3',
    title: 'Bro'
  },
  // Members
  {
    id: 'u7',
    username: 'memberjohn',
    name: 'Member John',
    role: 'member',
    chapterId: 'c1',
    cellId: 'cell1',
    status: 'Active',
    creatorId: 'u4',
    title: 'Bro'
  },
  {
    id: 'u8',
    username: 'memberhannah',
    name: 'Member Hannah',
    role: 'member',
    chapterId: 'c1',
    cellId: 'cell1',
    status: 'Active',
    creatorId: 'u4',
    title: 'Sis'
  },
  {
    id: 'u9',
    username: 'membermark',
    name: 'Member Mark',
    role: 'member',
    chapterId: 'c2',
    cellId: 'cell3',
    status: 'Active',
    creatorId: 'u6',
    title: 'Bro'
  },
  // PENDING CREDENTIAL WORKFLOW USER CASES
  {
    id: 'u_pend_cl1',
    username: 'cell_thomas',
    name: 'Cell Leader Thomas',
    role: 'cell_leader',
    chapterId: 'c1',
    cellId: 'cell2',
    status: 'Pending_Higher_Approval',
    creatorId: 'u2',
    tempPassword: 'TempCellPass1!',
    title: 'Bro'
  },
  {
    id: 'u_pend_cl2',
    username: 'cell_esther',
    name: 'Cell Leader Esther',
    role: 'cell_leader',
    chapterId: 'c2',
    cellId: 'cell4',
    status: 'Pending_Higher_Approval',
    creatorId: 'u3',
    tempPassword: 'TempCellPass2!',
    title: 'Sis'
  },
  {
    id: 'u_pend_mem1',
    username: 'member_ruth',
    name: 'Member Ruth',
    role: 'member',
    chapterId: 'c1',
    cellId: 'cell1',
    status: 'Pending_Higher_Approval',
    creatorId: 'u4',
    tempPassword: 'TempMemPass1!',
    title: 'Sis'
  },
  {
    id: 'u_pend_mem2',
    username: 'member_luke',
    name: 'Member Luke',
    role: 'member',
    chapterId: 'c2',
    cellId: 'cell3',
    status: 'Pending_Higher_Approval',
    creatorId: 'u6',
    tempPassword: 'TempMemPass2!',
    title: 'Bro'
  }
];

export const initialLedger = [
  // John (c1, cell1)
  {
    id: 'l1',
    memberId: 'u7',
    memberName: 'Member John',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-06-14',
    segment: 'Local',
    category: 'Tithe',
    amount: 200,
    totalAmount: 200,
    description: 'Weekly tithe payment',
    paymentMethod: 'Bank Transfer',
    receiptUrl: 'receipt_john_june14.png',
    newMembersBroughtIn: 1,
    status: 'Confirmed',
    createdAt: '2026-06-14T19:00:00Z'
  },
  {
    id: 'l2',
    memberId: 'u7',
    memberName: 'Member John',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-06-21',
    segment: 'Local',
    category: 'Offering',
    amount: 180,
    totalAmount: 180,
    description: 'Weekly offering contribution',
    paymentMethod: 'Card',
    receiptUrl: 'receipt_john_june21.png',
    newMembersBroughtIn: 0,
    status: 'Confirmed',
    createdAt: '2026-06-21T19:10:00Z'
  },
  {
    id: 'l3',
    memberId: 'u7',
    memberName: 'Member John',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-06-28',
    segment: 'Local',
    category: 'Partnership',
    amount: 250,
    totalAmount: 250,
    description: 'Partnership seed payment',
    paymentMethod: 'Bank Transfer',
    receiptUrl: 'receipt_john_june28.png',
    newMembersBroughtIn: 2,
    status: 'Confirmed',
    createdAt: '2026-06-28T18:45:00Z'
  },
  {
    id: 'l4',
    memberId: 'u7',
    memberName: 'Member John',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-07-05',
    segment: 'Local',
    category: 'Church Hosting',
    amount: 430,
    totalAmount: 430,
    description: 'Church hosting contribution',
    paymentMethod: 'Bank Transfer',
    receiptUrl: 'receipt_john_july05.png',
    newMembersBroughtIn: 1,
    status: 'Pending_Cell_Review',
    createdAt: '2026-07-05T19:30:00Z'
  },

  // Hannah (c1, cell1)
  {
    id: 'l5',
    memberId: 'u8',
    memberName: 'Member Hannah',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-06-21',
    segment: 'Haven',
    category: 'PCO Seed',
    amount: 140,
    totalAmount: 140,
    description: 'PCO partner seed contribution',
    paymentMethod: 'Mobile Money',
    receiptUrl: 'receipt_hannah_june21.png',
    newMembersBroughtIn: 2,
    status: 'Confirmed',
    createdAt: '2026-06-21T18:20:00Z'
  },
  {
    id: 'l6',
    memberId: 'u8',
    memberName: 'Member Hannah',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-06-28',
    segment: 'Haven',
    category: 'Welfare',
    amount: 160,
    totalAmount: 160,
    description: 'Haven welfare department seed',
    paymentMethod: 'Mobile Money',
    receiptUrl: 'receipt_hannah_june28.png',
    newMembersBroughtIn: 0,
    status: 'Confirmed',
    createdAt: '2026-06-28T18:55:00Z'
  },
  {
    id: 'l7',
    memberId: 'u8',
    memberName: 'Member Hannah',
    chapterId: 'c1',
    cellId: 'cell1',
    serviceDate: '2026-07-05',
    segment: 'Haven',
    category: 'Others',
    amount: 285,
    totalAmount: 285,
    description: 'General Haven other seed',
    paymentMethod: 'Card',
    receiptUrl: 'receipt_hannah_july05.png',
    newMembersBroughtIn: 1,
    status: 'Pending_Cell_Review',
    createdAt: '2026-07-05T20:10:00Z'
  },

  // Mark (c2, cell3)
  {
    id: 'l8',
    memberId: 'u9',
    memberName: 'Member Mark',
    chapterId: 'c2',
    cellId: 'cell3',
    serviceDate: '2026-06-21',
    segment: 'Local',
    category: 'Tithe',
    amount: 340,
    totalAmount: 340,
    description: 'Monthly tithe check',
    paymentMethod: 'Bank Transfer',
    receiptUrl: 'receipt_mark_june21.png',
    newMembersBroughtIn: 0,
    status: 'Confirmed',
    createdAt: '2026-06-21T17:40:00Z'
  },
  {
    id: 'l9',
    memberId: 'u9',
    memberName: 'Member Mark',
    chapterId: 'c2',
    cellId: 'cell3',
    serviceDate: '2026-06-28',
    segment: 'Local',
    category: 'Offering',
    amount: 370,
    totalAmount: 370,
    description: 'Weekly offering check',
    paymentMethod: 'Bank Transfer',
    receiptUrl: 'receipt_mark_june28.png',
    newMembersBroughtIn: 2,
    status: 'Confirmed',
    createdAt: '2026-06-28T17:50:00Z'
  },
  {
    id: 'l10',
    memberId: 'u9',
    memberName: 'Member Mark',
    chapterId: 'c2',
    cellId: 'cell3',
    serviceDate: '2026-07-05',
    segment: 'Local',
    category: 'Partnership',
    amount: 620,
    totalAmount: 620,
    description: 'Outreach partnership seed',
    paymentMethod: 'Card',
    receiptUrl: 'receipt_mark_july05.png',
    newMembersBroughtIn: 3,
    status: 'Confirmed',
    createdAt: '2026-07-05T18:00:00Z'
  }
];
