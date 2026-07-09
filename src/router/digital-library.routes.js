export default [
  {
    path: '/digital-library',
    name: 'digital-library.home',
    component: () => import('@/features/digital-library/pages/LibraryHomePage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/digital-library/category/:id',
    name: 'digital-library.category',
    component: () => import('@/features/digital-library/pages/LibraryCategoryPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
  {
    path: '/digital-library/book/:id',
    name: 'digital-library.detail',
    component: () => import('@/features/digital-library/pages/LibraryDetailPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
  {
    path: '/digital-library/reader/:id',
    name: 'digital-library.reader',
    component: () => import('@/features/digital-library/pages/BookReaderPage.vue'),
    meta: { middleware: 'auth' },
    props: true,
  },
]