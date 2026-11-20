export default [
  // One Loans page (/borrow-history). New loans and returns are done in the Scanner.
  { path: '/borrow', redirect: (to) => ({ path: '/borrow-history', query: to.query }) },
  { path: '/return', redirect: { path: '/borrow-history', query: { status: 'borrowed' } } },
  { path: '/overdue', redirect: { path: '/borrow-history', query: { status: 'overdue' } } },
  {
    path: '/borrow-history',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'borrow-history-page', component: () => import('@/features/circulation/pages/BorrowHistoryPage.vue') },
    ],
  },
  {
    path: '/my-borrows',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['member'] },
    children: [
      { path: '', name: 'my-borrows-page', component: () => import('@/features/circulation/pages/MyBorrowsPage.vue') },
    ],
  },
]