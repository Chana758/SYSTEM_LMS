export default [
  // Admin / Librarian — full management view
  {
    path: '/reservations',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    children: [
      { path: '', name: 'reservation-list', component: () => import('@/features/reservation/pages/ReservationListPage.vue') },
      { path: 'create', name: 'reservation-create', component: () => import('@/features/reservation/pages/ReservationCreatePage.vue') },
      { path: 'history', name: 'reservation-history', component: () => import('@/features/reservation/pages/ReservationHistoryPage.vue') },
      { path: ':id', name: 'reservation-detail', component: () => import('@/features/reservation/pages/ReservationDetailPage.vue') },
    ],
  },
  // Member — own reservations only
  {
    path: '/my-reservations',
    component: () => import('@/layouts/MemberLayout.vue'),
    meta: { middleware: 'auth', roles: ['member'] },
    children: [
      { path: '', name: 'my-reservations', component: () => import('@/features/reservation/pages/MyReservationsPage.vue') },
    ],
  },
]