export default [
  {
    path: '/digital-library',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth', roles: ['admin', 'librarian', 'member'] },
    children: [
      { path: '', name: 'library-home-page', component: () => import('@/features/digital-library/pages/LibraryHomePage.vue') },
      { path: 'category/:id', name: 'library-category-page', component: () => import('@/features/digital-library/pages/LibraryCategoryPage.vue') },
      { path: 'favorites', name: 'my-favorites-page', component: () => import('@/features/digital-library/pages/MyFavoritesPage.vue') },
      { path: ':id', name: 'library-detail-page', component: () => import('@/features/digital-library/pages/LibraryDetailPage.vue') },
      { path: ':id/read', name: 'book-reader-page', component: () => import('@/features/digital-library/pages/BookReaderPage.vue') },
    ],
  },
]