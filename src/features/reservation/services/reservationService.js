import reservationApi from './reservationApi'

/**
 * Utility to extract standardized error messages from API responses.
 */
function extractError(error) {
  const response = error?.response
  return {
    success: false,
    message: response?.data?.message || 'An unexpected error occurred. Please try again.',
    errors: response?.data?.errors || {},
  }
}

export const reservationService = {
  async getReservations(params) {
    try {
      const { data } = await reservationApi.index(params)
      return { success: true, data }
    } catch (error) {
      return extractError(error)
    }
  },

  async getMyReservations(params) {
    try {
      const { data } = await reservationApi.myReservations(params)
      return { success: true, data }
    } catch (error) {
      return extractError(error)
    }
  },

  async getReservation(id) {
    try {
      const { data } = await reservationApi.show(id)
      return { success: true, data }
    } catch (error) {
      return extractError(error)
    }
  },

  async createReservation(payload) {
    try {
      const { data } = await reservationApi.store(payload)
      return { success: true, message: data.message, data: data.data }
    } catch (error) {
      return extractError(error)
    }
  },

  async cancelReservation(id) {
    try {
      const { data } = await reservationApi.cancel(id)
      return { success: true, message: data.message, data: data.data }
    } catch (error) {
      return extractError(error)
    }
  },

  async fulfillReservation(id) {
    try {
      const { data } = await reservationApi.fulfill(id)
      return { success: true, message: data.message, data: data.data }
    } catch (error) {
      return extractError(error)
    }
  },
}