import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";
import Dashboard from "../components/Dashboard.vue";
import Category from "../components/Category.vue"
// 👈 import

const routes = [
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/banhang', component: BanHang },
    { path: '/dashboard', component: Dashboard},
    { path: '/category', component: Category}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
