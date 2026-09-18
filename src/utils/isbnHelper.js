
export function isValidISBN(isbn) {
    if (!isbn) return false;
    const cleanIsbn = isbn.replace(/[- ]/g, '');
    return cleanIsbn.length === 10 || cleanIsbn.length === 13;
}