export default [
  {
    path: '/chatbot',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { middleware: 'auth' },
    children: [
      {
        path: '',
        name: 'chatbot',
        component: () => import('@/features/ai-chatbot/pages/ChatPage.vue'),
      },
    ],
  },
]