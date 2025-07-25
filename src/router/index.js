import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";
import Dashboard from "../components/Dashboard.vue";
// 👈 import

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/banhang', component: BanHang },
    { path: '/dashboard', component: Dashboard}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
