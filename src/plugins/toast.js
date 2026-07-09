import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

export default {
  install(app) {
    app.use(Toast, {
      position: 'top-right',
      timeout: 3000
    })
  }
}