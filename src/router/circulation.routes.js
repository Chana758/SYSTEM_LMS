export default [
  {
    path: '/borrow',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'borrow-page', component: () => import('@/features/circulation/pages/BorrowPage.vue') },
    ],
  },
  // Return and Overdue now live on the Borrow page (list + filter).
  { path: '/return', redirect: '/borrow' },
  { path: '/overdue', redirect: { path: '/borrow', query: { status: 'overdue' } } },
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
    component: () => import('@/layouts/MemberLayout.vue'),
    meta: { middleware: 'auth', roles: ['member'] },
    children: [
      { path: '', name: 'my-borrows-page', component: () => import('@/features/circulation/pages/MyBorrowsPage.vue') },
    ],
  },
]