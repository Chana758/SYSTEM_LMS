import AdminLayout from '@/layouts/AdminLayout.vue'

export default [
  {
    path: '/settings',
    component: AdminLayout,
    redirect: '/settings/profile',
    children: [
      { 
        path: 'profile',        
        name: 'settings.profile',    
        component: () => import('@/features/settings/pages/ProfilePage.vue'), 
        meta: { middleware: 'auth' } 
      },
      { 
        path: 'account',        
        name: 'settings.account',    
        component: () => import('@/features/settings/pages/AccountPage.vue'), 
        meta: { middleware: 'auth' } 
      },
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