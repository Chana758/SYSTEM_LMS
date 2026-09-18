
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-light-green/theme.css'; 

export function setupPrimeVue(app) {
    app.use(PrimeVue, { ripple: true });
}