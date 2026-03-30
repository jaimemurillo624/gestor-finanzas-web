import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar Bootstrap 5
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.js'

// ✅ NUEVO: Importar estilos de tema
import '../src/styles/theme.css'

const app = createApp(App)

app.use(router)
app.mount('#app')