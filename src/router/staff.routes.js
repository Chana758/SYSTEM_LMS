export default [
  {
    path: '/staff',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin'] },
    children: [
      {
        path: '',
        name: 'staff-list',
        component: () => import('@/features/staff/pages/LibrarianListPage.vue'),
      },
      {
        path: ':id',
        name: 'staff-detail',
        component: () => import('@/features/staff/pages/LibrarianDetailPage.vue'),
      },
    ],
  },
]