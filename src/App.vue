<script setup>
import Home from "./components/Home.vue";
import menubar from "./components/menubar.vue";
import BanHang from "./components/BanHang.vue";

import { ref } from 'vue';

const isSidebarOpen = ref(false);
const showLogin = ref(true); // Thêm biến điều khiển hiển thị login
const username = ref("");
const password = ref("");

const displayName = ref("");

async function toggleLogin() {
  try {
    const response = await api.post("/api/auth/login2", {
      email: username.value,
      password: password.value,
      rememberMe: false
    },
        { withCredentials: true }
    );

    displayName.value= response.data;
    console.log(displayName.value);
    // Thông báo thành công
    Swal.fire({
      title: 'Đăng nhập thành công!',
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    }).then(ss => {
      showLogin.value= false;
      isSidebarOpen.value=false;
    });

  } catch (error) {
    // Thông báo thất bại
    await Swal.fire({
      title: 'Đăng nhập thất bại!',
      text: 'Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

document.addEventListener('DOMContentLoaded', async function(){
  const loggedIn = await isLogin();
  if(loggedIn) {
    showLogin.value = false;
  }
});

async function isLogin(){
  return api.get("/admin/isLogin", { withCredentials: true })
      .then(response => {
    if(response.data.loggedIn) {
      displayName.value = response.data.displayName;
      return true;
    }
    return false;
  }).catch(error => {
    console.log("Lỗi:", error)
    return false;
  });
}


</script>

<template>
  <div id="main-container" v-if="!showLogin">
    <menubar
        :isSidebarOpen="isSidebarOpen"
        :displayName="displayName"
        @logout="toggleLogin(true)"
    />
    <div :class="['main-container', { 'sidebar-opened': isSidebarOpen }]">
      <div class="menu-toggle">
        <i class="fas fa-sliders-h" @click="toggleSidebar"></i>
      </div>
      <router-view />
    </div>
  </div>


  <div id="login-container" v-if="showLogin">
    <h1 class="text-primary">Đăng nhập</h1>
    <input type="text" placeholder="Tên đăng nhập" class="form-control" v-model="username">
    <input type="password" placeholder="Mật khẩu" class="form-control" v-model="password">
    <button
        class="btn btn-outline-primary"
        @click="toggleLogin()"
    >
      Đăng nhập
    </button>
  </div>



<!--  <div class="wave-container">-->
<!--    <div class="wave"></div>-->
<!--  </div>-->
<!--  <div class="background-icons">-->
<!--    <i class="fas fa-coins bg-icon icon-1"></i>-->
<!--    <i class="fas fa-chart-line bg-icon icon-2"></i>-->
<!--    <i class="fas fa-university bg-icon icon-3"></i>-->
<!--    <i class="fas fa-money-bill-wave bg-icon icon-4"></i>-->
<!--  </div>-->
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
  display: inline-block;
  position: sticky;
  top: 15px;
  left: 20px;
  margin-left: 20px;
  font-size: 24px;
  color: #3b82f6;
  cursor: pointer;
  z-index: 1001;
  transition: transform 0.3s;
}

.menu-toggle:hover {
 color: #1f2937;
}



/** Hiệu ứng background **/

.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 200px;
  overflow: hidden;
  z-index: 0;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%230066CC' fill-opacity='0.2' d='M0,160L48,181.3C96,203,192,245,288,234.7C384,224,480,160,576,160C672,160,768,224,864,218.7C960,213,1056,139,1152,117.3C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'/%3E%3C/svg%3E");
  background-size: contain;
  animation: wave 12s linear infinite;
  transform: translate3d(0,0,0);
}

.background-icons {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.bg-icon {
  position: absolute;
  color: var(--primary-color);
  opacity: 0.1;
  font-size: 4rem;
  transition: opacity 0.3s ease;
}

.icon-1 {
  top: 10%;
  left: 5%;
  transform: rotate(-15deg);
}

.icon-2 {
  top: 20%;
  right: 10%;
  transform: rotate(10deg);
}

.icon-3 {
  bottom: 30%;
  left: 15%;
  transform: rotate(-20deg);
}

.icon-4 {
  bottom: 20%;
  right: 5%;
  transform: rotate(15deg);
}

@keyframes wave {
  0% { transform: translateX(0); }
  50% { transform: translateX(-25%); }
  100% { transform: translateX(0); }
}



@media (max-width: 768px) {
  .welcome-title {
    font-size: 2.2rem;
  }

  .welcome-subtitle {
    font-size: 1.1rem;
  }

  .header-content {
    margin-top: 4rem;
  }

  .dashboard-preview {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .wave {
    animation-duration: 16s;
  }

  .bg-icon {
    font-size: 2.5rem;
  }
}

</style>