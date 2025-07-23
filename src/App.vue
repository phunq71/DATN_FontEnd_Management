<script setup>
import Home from "./components/Home.vue";
import menubar from "./components/menubar.vue";
import BanHang from "./components/BanHang.vue";

import { ref } from 'vue';

const isSidebarOpen = ref(false);
const showLogin = ref(true); // Thêm biến điều khiển hiển thị login

function toggleLogin(show) {
  showLogin.value = show;
  isSidebarOpen.value =show;
}
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

</script>

<template>
  <div id="main-container" v-if="!showLogin">
    <menubar
        :isSidebarOpen="isSidebarOpen"
        @logout="toggleLogin(true)"
    />
    <div :class="['main-container', { 'sidebar-opened': isSidebarOpen }]">
      <div class="menu-toggle" @click="toggleSidebar">
        <i class="fas fa-sliders-h"></i>
      </div>
      <router-view />
    </div>
  </div>


  <div id="login-container" v-if="showLogin">
    <h1 class="text-primary">Đăng nhập</h1>
    <input type="text" placeholder="Tên đăng nhập" class="form-control">
    <input type="password" placeholder="Mật khẩu" class="form-control">
    <button
        class="btn btn-outline-primary"
        @click="toggleLogin(false)"
    >
      Đăng nhập
    </button>
  </div>
</template>

<style scoped>
.main-container {
  position: relative;
  left: 0;
  width: 100%;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-container.sidebar-opened {
  left: 250px;
  width: calc(100% - 250px);
}

#login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 10px 20px;
  cursor: pointer;
}
.menu-toggle {
  position: absolute;
  top: 15px;
  left: 20px;
  font-size: 24px;
  color: #3b82f6;
  cursor: pointer;
  z-index: 1001;
  transition: transform 0.3s;
}

.menu-toggle:hover {
  transform: scale(1.1);
}

</style>