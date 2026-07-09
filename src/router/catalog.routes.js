export default [
  {
    path: '/books',
    name: 'books.list',
    component: () => import('@/features/catalog/pages/BookListPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/books/create',
    name: 'books.create',
    component: () => import('@/features/catalog/pages/AddBookPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
  },
  {
    path: '/books/:id',
    name: 'books.detail',
    component: () => import('@/features/catalog/pages/BookDetailPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
  {
    path: '/books/:id/edit',
    name: 'books.edit',
    component: () => import('@/features/catalog/pages/EditBookPage.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
    props: true,
  },
]