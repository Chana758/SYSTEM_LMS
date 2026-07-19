import AdminLayout from '@/layouts/AdminLayout.vue'

export default [
  {
    path: '/scanner',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'scanner',
        component: () => import('@/features/scanner/pages/ScannerPage.vue'),
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
      },
      {
        path: 'history',
        name: 'scanner.history',
        component: () => import('@/features/scanner/pages/ScanHistoryPage.vue'),
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
      },
    ],
  },
]