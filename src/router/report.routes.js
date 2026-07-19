export default [
  {
    path: '/reports',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'report-dashboard', component: () => import('@/features/reports/pages/ReportDashboardPage.vue') },
      { path: 'borrow', name: 'report-borrow', component: () => import('@/features/reports/pages/BorrowReportPage.vue') },
      { path: 'fine', name: 'report-fine', component: () => import('@/features/reports/pages/FineReportPage.vue') },
      { path: 'revenue', name: 'report-revenue', component: () => import('@/features/reports/pages/RevenueReportPage.vue') },
      { path: 'stock', name: 'report-stock', component: () => import('@/features/reports/pages/StockReportPage.vue') },
      { path: 'user', name: 'report-user', component: () => import('@/features/reports/pages/UserReportPage.vue') },
    ],
  },
]