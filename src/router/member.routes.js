export default [
  {
    path: '/members',
    name: 'members.list',
    component: () => import('@/features/members/pages/MemberListPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/members/:id',
    name: 'members.detail',
    component: () => import('@/features/members/pages/MemberDetailPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    props: true,
  },
  {
    path: '/members/:id/profile',
    name: 'members.profile',
    component: () => import('@/features/members/pages/MemberProfilePage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
]