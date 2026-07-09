export default [
  {
    path: '/reservations',
    name: 'reservations.list',
    component: () => import('@/features/reservation/pages/ReservationListPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/reservations/create',
    name: 'reservations.create',
    component: () => import('@/features/reservation/pages/ReservationCreatePage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/reservations/:id',
    name: 'reservations.detail',
    component: () => import('@/features/reservation/pages/ReservationDetailPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
  {
    path: '/reservations/history',
    name: 'reservations.history',
    component: () => import('@/features/reservation/pages/ReservationHistoryPage.vue'),
    meta: { middleware: 'auth' },
  },
]