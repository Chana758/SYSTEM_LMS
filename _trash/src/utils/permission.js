
export function hasPermission(userRole, requiredRole) {
    const roleshierarchy = { 'member': 1, 'librarian': 2, 'admin': 3 };
    return (roleshierarchy[userRole] || 0) >= (roleshierarchy[requiredRole] || 0);
}