export function validateBookForm(form) {
  const errors = {}
  if (!form.title) errors.title = 'Please enter the book title'
  if (!form.isbn) errors.isbn = 'Please enter the ISBN'
  if (!form.author) errors.author = 'Please enter the author name'
  if (!form.category_id) errors.category_id = 'Please select a category'
  if (!form.total_qty || form.total_qty < 1) errors.total_qty = 'Quantity must be at least 1'
  return errors
}