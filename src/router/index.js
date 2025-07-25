import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";
import QLDonHang from "../components/QLDonHang.vue";// 👈 import

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/banhang', component: BanHang },
    { path: '/qldonhang', name: 'QuanLyDonHang', component: QLDonHang }
 // 👈 thêm route
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
