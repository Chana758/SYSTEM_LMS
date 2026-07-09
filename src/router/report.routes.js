export default [
  {
    path: '/reports',
    name: 'reports.dashboard',
    component: () => import('@/features/reports/pages/ReportDashboardPage.vue'),
    meta: { middleware: 'auth', roles: ['admin'] },
  },
  {
    path: '/reports/borrow',
    name: 'reports.borrow',
    component: () => import('@/features/reports/pages/BorrowReportPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/reports/fine',
    name: 'reports.fine',
    component: () => import('@/features/reports/pages/FineReportPage.vue'),
    meta: { middleware: 'auth', roles: ['admin'] },
  },
  {
    path: '/reports/user',
    name: 'reports.user',
    component: () => import('@/features/reports/pages/UserReportPage.vue'),
    meta: { middleware: 'auth', roles: ['admin'] },
  },
]