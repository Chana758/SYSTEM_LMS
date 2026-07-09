export default [
  {
    path: '/gamification',
    name: 'gamification.dashboard',
    component: () => import('@/features/gamification/pages/GamificationDashboard.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/gamification/achievements',
    name: 'gamification.achievements',
    component: () => import('@/features/gamification/pages/AchievementPage.vue'),
    meta: { middleware: 'auth' },
  },
  {
    path: '/gamification/leaderboard',
    name: 'gamification.leaderboard',
    component: () => import('@/features/gamification/pages/LeaderboardPage.vue'),
    meta: { middleware: 'auth' },
  },
]