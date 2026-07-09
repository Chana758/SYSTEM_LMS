export default [
  {
    path: '/chatbot',
    name: 'chatbot',
    component: () => import('@/features/ai-chatbot/pages/ChatPage.vue'),
    meta: { middleware: 'auth' },
  },
]