export default [
  {
    path: '/fines',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'fine-list', component: () => import('@/features/fines/pages/FineListPage.vue') },
      { path: 'create', name: 'fine-create', component: () => import('@/features/fines/pages/FineCreatePage.vue') },
      { path: 'history', name: 'fine-history', component: () => import('@/features/fines/pages/FineHistoryPage.vue') },
      { path: 'report', name: 'fine-report', component: () => import('@/features/fines/pages/FineReportPage.vue') },
      { path: ':id', name: 'fine-detail', component: () => import('@/features/fines/pages/FineDetailPage.vue') },
      { path: ':id/edit', name: 'fine-edit', component: () => import('@/features/fines/pages/FineEditPage.vue') },
    ],
  },
  {
    // ★ new — Member self-service page
    path: '/my-fines',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth' },
    children: [
      { path: '', name: 'my-fines-page', component: () => import('@/features/fines/pages/MyFinesPage.vue') },
    ],
  },
]