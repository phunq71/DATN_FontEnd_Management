import { createRouter, createWebHistory } from 'vue-router'
import Home from "../components/Home.vue";
import BanHang from "../components/BanHang.vue";
import OrderManagement from "../components/OrderManagement.vue";
import Dashboard from "../components/Dashboard.vue";
import InventoryManagement from "../components/InventoryManagement.vue";
import InventorySlips from "../components/InventorySlips.vue";

import Login from "../components/Login.vue";
import Product from "../components/Product.vue";
import ProductDetail from "../components/ProductDetail.vue";
import CreateProduct from "../components/CreateProduct.vue";

import StaffManagement from "../components/StaffManagement.vue";


import Category from '../components/Category.vue';
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
        path: '/product',
        component: Product,
        meta: { requiresAuth: true }
    },
    {
        path: '/createProduct',
        component: CreateProduct,
        meta: { requiresAuth: true }
    },
    {
        path: '/products/:id',
        name: 'ProductDetail',
        component: ProductDetail,
    },
    {    path: '/staffs',
        component: StaffManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/category',
        component: Category,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        components: {
            auth: Login
        },
        meta: { requiresAuth: false }
    },
    {
        path: '/OrderManagement',
        component: OrderManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/inventory',
        component: InventoryManagement,
        meta: { requiresAuth: true }
    },
    {
        path: '/inventorySlips',
        component: InventorySlips,
        meta: {requiresAuth: true}
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