import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";
import OrderManagement from "../components/OrderManagement.vue";// 👈 import
import Dashboard from "../components/Dashboard.vue";
const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/banhang', component: BanHang },
    { path: '/OrderManagement', component: OrderManagement },
 // 👈 thêm route
    { path: '/dashboard', component: Dashboard}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
