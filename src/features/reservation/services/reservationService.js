import reservationApi from './reservationApi'

/** Turn any axios error into one predictable shape. */
function extractError(error) {
  const response = error?.response
  const errors = response?.data?.errors || {}

  // Laravel validation (422) puts the first message inside errors; business
  // rules (ReservationException) only send { message }.
  const firstValidation = Object.values(errors)[0]?.[0]

  return {
    success: false,
    status: response?.status,
    message: firstValidation || response?.data?.message || 'An unexpected error occurred. Please try again.',
    errors,
  }
}

async function run(call, mapSuccess = (data) => ({ data })) {
  try {
    const { data } = await call()
    return { success: true, ...mapSuccess(data) }
  } catch (error) {
    return extractError(error)
  }
}

export const reservationService = {
  getReservations: (params) => run(() => reservationApi.index(params)),
  getStats: () => run(() => reservationApi.stats()),
  getMyReservations: (params) => run(() => reservationApi.myReservations(params)),
  getReservation: (id) => run(() => reservationApi.show(id)),

  createReservation: (payload) =>
    run(() => reservationApi.store(payload), (d) => ({ message: d.message, data: d.data })),

  cancelReservation: (id) =>
    run(() => reservationApi.cancel(id), (d) => ({ message: d.message, data: d.data })),

  fulfillReservation: (id) =>
    run(() => reservationApi.fulfill(id), (d) => ({ message: d.message, data: d.data })),
}