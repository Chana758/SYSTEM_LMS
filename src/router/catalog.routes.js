export default [
  {
    path: '/books',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth' },
    children: [
      {
        path: '',
        name: 'book-list',
        component: () => import('@/features/catalog/pages/BookListPage.vue'),
      },
      {
        path: 'categories',
        name: 'category-list',
        component: () => import('@/features/catalog/pages/CategoryListPage.vue'),
        meta: { roles: ['admin', 'librarian'] },
      },
      {
        path: ':id',
        name: 'book-detail',
        component: () => import('@/features/catalog/pages/BookDetailPage.vue'),
      },
    ],
  },
]