import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";// 👈 import

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/banhang', component: BanHang } // 👈 thêm route
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
