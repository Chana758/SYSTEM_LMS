export default [
  {
    path: '/reports',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', redirect: '/reports/borrow' },
      { path: 'borrow', name: 'report-borrow', component: () => import('@/features/reports/pages/BorrowReportPage.vue') },
      { path: 'fine', name: 'report-fine', component: () => import('@/features/reports/pages/FineReportPage.vue') },
      { path: 'revenue', redirect: '/reports/fine' },
      { path: 'stock', name: 'report-stock', component: () => import('@/features/reports/pages/StockReportPage.vue') },
      { path: 'user', name: 'report-user', component: () => import('@/features/reports/pages/UserReportPage.vue') },
    ],
  },
]