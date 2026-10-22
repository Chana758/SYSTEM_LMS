// Shared by ReservationCreateModal (member) and ReservationForm (admin),
// so both screens always agree on what "can be reserved" means.
export const queueCountOf = (book) => Number(book?.active_reservations_count ?? 0)

// Borrowing directly is possible only if there is stock AND nobody is waiting.
export const canBorrowDirectly = (book) =>
  !!book && Number(book.available_qty) > 0 && queueCountOf(book) === 0