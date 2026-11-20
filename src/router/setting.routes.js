import { useAuthStore } from '@/features/auth/store/authStore'
export default [
  {
    path: '/settings',
    component: () => import('@/layouts/AdminLayout.vue'),
    // members keep their profile in /my-profile
    redirect: () => (useAuthStore().role === 'member' ? '/settings/security' : '/settings/profile'),
    children: [
      { 
        path: 'profile',        
        name: 'settings.profile',    
        component: () => import('@/features/settings/pages/ProfilePage.vue'), 
        beforeEnter: () => (useAuthStore().role === 'member' ? '/my-profile' : true),
        meta: { middleware: 'auth' } 
      },
      { path: 'account', redirect: '/settings/profile' },
      { 
        path: 'security',       
        name: 'settings.security',   
        component: () => import('@/features/settings/pages/SecurityPage.vue'), 
        meta: { middleware: 'auth' } 
      },
      { 
        path: 'preferences',    
        name: 'settings.preferences',
        component: () => import('@/features/settings/pages/PreferencesPage.vue'), 
        meta: { middleware: 'auth' } 
      },
      { 
        path: 'system',         
        name: 'settings.system',     
        component: () => import('@/features/settings/pages/SystemSettingsPage.vue'), 
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] } 
      },
      { 
        path: 'backup',         
        name: 'settings.backup',     
        component: () => import('@/features/settings/pages/BackupPage.vue'), 
        meta: { middleware: 'auth', roles: ['admin'] } 
      },
      { 
        path: 'card-approvals', 
        name: 'settings.card-approvals',      
        component: () => import('@/features/settings/pages/PendingCardsPage.vue'), 
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] } 
      },
      {
        path: 'membership-types',
        name: 'settings.membership-types',
        component: () => import('@/features/settings/pages/MembershipTypesPage.vue'),
        meta: { middleware: 'auth', roles: ['admin'] },
      },
    ],
  },
]