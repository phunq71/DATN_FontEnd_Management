<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import menubar from "./components/menubar.vue";


const router = useRouter();
const isSidebarOpen = ref(false);
const isAuthenticated = ref(false);
const displayName = ref("");

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

async function checkAuth() {
  try {
    const response = await api.get("/admin/isLogin", { withCredentials: true });
    if (response.data.loggedIn) {
      displayName.value = response.data.displayName;
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
      router.push('/login');
    }
  } catch (error) {
    console.log("Lỗi:", error);
    isAuthenticated.value = false;
    router.push('/login');
  }
}

async function logout() {
  await api.post("/api/auth/logout2",{},{ withCredentials: true });
  isAuthenticated.value = false;
  displayName.value = "";
  router.push('/login');
}

function handleLoginSuccess(userData) {
  displayName.value = userData;
  isAuthenticated.value = true;
}

onMounted(() => {
  checkAuth();
});
</script>

<template>
  <div id="main-container" v-if="isAuthenticated">
    <menubar
        :isSidebarOpen="isSidebarOpen"
        :displayName="displayName"
        @logout="logout()"
    />
    <div :class="['main-container', { 'sidebar-opened': isSidebarOpen }]">
      <div class="menu-toggle">
        <i class="fas fa-sliders-h" @click="toggleSidebar"></i>
      </div>
      <router-view />
    </div>
  </div>

  <router-view v-else name="auth" @login-success="handleLoginSuccess" />
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