export default [
  {
    path: '/scanner',
    name: 'scanner',
    component: () => import('@/features/scanner/pages/ScannerPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/scanner/history',
    name: 'scanner.history',
    component: () => import('@/features/scanner/pages/ScanHistoryPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
]