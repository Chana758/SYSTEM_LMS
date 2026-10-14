
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ឆែកមើលប្រអប់មិនឱ្យទទេ
export function isNotEmpty(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}