
export default [
  {
    path: '/scanner',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        name: 'scanner',
        component: () => import('@/features/scanner/pages/ScannerPage.vue'),
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
      },
      {
        path: 'history',
        name: 'scanner.history',
        component: () => import('@/features/scanner/pages/ScanHistoryPage.vue'),
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
      },
      //  Stocktake / batch inventory-audit mode
      {
        path: 'stocktake',
        name: 'scanner.stocktake',
        component: () => import('@/features/scanner/pages/StocktakePage.vue'),
        meta: { middleware: 'auth', roles: ['admin', 'librarian'] },
      },
    ],
  },
  // Remote phone-as-camera pairing page. No AdminLayout, no auth
  // middleware — the phone is not logged in as staff. The session_id
  // in the URL is itself the one-time credential (validated server-side
  // via /remote-scan/{sessionId}/status), so this route is intentionally
  // public. Do NOT nest this under the '/scanner' AdminLayout group above.
  {
    path: '/remote-scan/:sessionId',
    name: 'remote-scan',
    component: () => import('@/features/scanner/pages/RemoteScanMobilePage.vue'),
  },
]