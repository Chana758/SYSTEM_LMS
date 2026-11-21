export default [
  {
    path: '/fines',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'fine-list', component: () => import('@/features/fines/pages/FineListPage.vue') },
      { path: 'create', name: 'fine-create', component: () => import('@/features/fines/pages/FineCreatePage.vue') },
      // B5.4 (Sam): every KHQR + cash payment
      { path: 'payments', name: 'fine-payments', component: () => import('@/features/fines/pages/PaymentHistoryPage.vue') },
      { path: 'history', redirect: '/fines' },
      { path: 'report', redirect: '/reports/fine' },
      { path: ':id', name: 'fine-detail', component: () => import('@/features/fines/pages/FineDetailPage.vue') },
    ],
  },
  {
    // ★ new — Member self-service page
    path: '/my-fines',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['member'] },
    children: [
      { path: '', name: 'my-fines-page', component: () => import('@/features/fines/pages/MyFinesPage.vue') },
    ],
  },
]