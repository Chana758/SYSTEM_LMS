export default [
  {
    path: '/members',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      {
        path: '',
        name: 'member-list',
        component: () => import('@/features/members/pages/MemberListPage.vue'),
      },
      {
        path: ':id',
        name: 'member-detail',
        component: () => import('@/features/members/pages/MemberDetailPage.vue'),
      },
    ],
  },
  // FIX: was missing — no route existed for MyProfilePage.vue, so a
  // member clicking a "My Profile" link (or navigating to /my-profile
  // directly) would hit a 404/NotFound instead of their profile page.
  {
    path: '/my-profile',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['member'] },
    children: [
      {
        path: '',
        name: 'my-profile',
        component: () => import('@/features/members/pages/MyProfilePage.vue'),
      },
    ],
  },
]