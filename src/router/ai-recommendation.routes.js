export default [
  {
    path: '/ai-recommendation',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth' },
    children: [
      {
        path: '',
        name: 'ai-recommendation',
        component: () => import('@/features/ai-recommendation/pages/RecommendationPage.vue'),
      },
    ],
  },
]