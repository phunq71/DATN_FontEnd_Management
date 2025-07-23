// src/main.js hoặc index.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

// ✅ tạo app 1 lần
const app = createApp(App)

app.use(router)
app.mount('#app')

