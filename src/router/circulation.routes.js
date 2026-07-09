export default [
  {
    path: '/borrow',
    name: 'borrow.page',
    component: () => import('@/features/circulation/pages/BorrowPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/borrow/history',
    name: 'borrow.history',
    component: () => import('@/features/circulation/pages/BorrowHistoryPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/borrow/overdue',
    name: 'borrow.overdue',
    component: () => import('@/features/circulation/pages/OverduePage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/return',
    name: 'return.page',
    component: () => import('@/features/circulation/pages/ReturnPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
]