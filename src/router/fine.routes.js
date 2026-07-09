export default [
  {
    path: '/fines',
    name: 'fines.list',
    component: () => import('@/features/fines/pages/FineListPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/fines/create',
    name: 'fines.create',
    component: () => import('@/features/fines/pages/FineCreatePage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/fines/:id',
    name: 'fines.detail',
    component: () => import('@/features/fines/pages/FineDetailPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
  {
    path: '/fines/:id/edit',
    name: 'fines.edit',
    component: () => import('@/features/fines/pages/FineEditPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    props: true,
  },
  {
    path: '/fines/history',
    name: 'fines.history',
    component: () => import('@/features/fines/pages/FineHistoryPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/fines/report',
    name: 'fines.report',
    component: () => import('@/features/fines/pages/FineReportPage.vue'),
    meta: { middleware: 'auth', roles: ['admin'] },
  },
]