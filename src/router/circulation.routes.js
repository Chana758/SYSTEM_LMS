export default [
  {
    path: '/borrow',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'borrow-page', component: () => import('@/features/circulation/pages/BorrowPage.vue') },
    ],
  },
  {
    path: '/return',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'return-page', component: () => import('@/features/circulation/pages/ReturnPage.vue') },
    ],
  },
  {
    path: '/overdue',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'overdue-page', component: () => import('@/features/circulation/pages/OverduePage.vue') },
    ],
  },
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