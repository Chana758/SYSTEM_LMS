import { ref } from 'vue'

export function useSeat() {
  const selectedSeat = ref(null)
  const bookingStatus = ref('idle') // 'idle', 'booking', 'success', 'error'

  const bookSeat = async (seatId) => {
    bookingStatus.value = 'booking'
    try {
      // Logic ហៅ API ដើម្បីកក់កៅអី
      selectedSeat.value = seatId
      bookingStatus.value = 'success'
      console.log(`Seat ${seatId} booked successfully!`)
    } catch (error) {
      bookingStatus.value = 'error'
    }
  }

  return { selectedSeat, bookingStatus, bookSeat }
}