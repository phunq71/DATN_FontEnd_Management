import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";
import Dashboard from "../components/Dashboard.vue";
import Login from "../components/Login.vue";
import StaffManagement from "../components/StaffManagement.vue";

const routes = [
    {
        path: '/',
        redirect: '/home',
        meta: { requiresAuth: true }
    },
    {
        path: '/home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/banhang',
        component: BanHang,
        meta: { requiresAuth: true }
    },
    {
        path: '/dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/staffs',
        component: StaffManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        components: {
            auth: Login
        },
        meta: { requiresAuth: false }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresAuth) {
        try {
            const response = await api.get("/admin/isLogin", { withCredentials: true });
            if (response.data.loggedIn) {
                next();
            } else {
                next('/login');
            }
        } catch (error) {
            console.log("Lỗi:", error);
            next('/login');
        }
    } else {
        next();
    }
});

export default router