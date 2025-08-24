
<script setup>
import { ref, onMounted  } from 'vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isSidebarOpen: Boolean,
  displayName: String
});

const emit = defineEmits(['logout']);

const isProductsOpen = ref(false);
const isDocumentsOpen = ref(false);

function toggleSubmenu(menu) {
  if (menu === 'products') {
    isProductsOpen.value = !isProductsOpen.value;
  } else if (menu === 'documents') {
    isDocumentsOpen.value = !isDocumentsOpen.value;
  }
}
const isAdmin = ref(false);
async function checkAdmin() {
  try {
    const response = await api.get('/admin/checkAdmin', { withCredentials: true });
    return response.data === true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
onMounted(async () => {
  isAdmin.value = await checkAdmin();
  console.log( isAdmin.value);
});

</script>
<template>
  <div>
    <div :class="['sidebar', { open: isSidebarOpen }]">
      <!-- Logo -->
      <div class="logo-section">
        <img src="/public/images/logo.png" alt="FinancePro Logo" class="logo-image" />
      </div>

      <!-- Menu -->
      <div class="menu-items">
        <router-link to="/home" class="menu-item">
          <i class="fas fa-home"></i>
          <span>Trang chủ</span>
        </router-link>


        <router-link to="/OrderManagement" class="menu-item">
         <i class="fas fa-receipt"></i>
          <span>Quản lý đơn hàng</span>
        </router-link>

<!--        <router-link to="/banhang" class="menu-item">-->
<!--          <i class="fa-solid fa-receipt"></i>-->
<!--          <span>Bán hàng</span>-->
<!--        </router-link>-->

<!--        <div class="menu-item">-->
<!--          <i class="fa-solid fa-gift"></i>-->
<!--          <span>Khuyến mãi</span>-->
<!--        </div>-->

        <router-link to="/category" class="menu-item" v-if="isAdmin">
          <i class="fa-solid fa-folder"></i>
          <span>Quản lý danh mục</span>
        </router-link>

        <router-link to="/product" class="menu-item" v-if="isAdmin">
          <i class="fas fa-box"></i>
          <span>Quản lý sản phẩm</span>
        </router-link>

        <router-link to="/staffs" class="menu-item">
          <i class="fa-solid fa-users"></i>
          <span>Quản lý nhân viên</span>

        </router-link>

          <router-link to="/CustomerManagement" class="menu-item">
            <i class="fas fa-handshake"></i>
            <span>Quản lý khách hàng</span>
          </router-link>

<!--        <div class="menu-item">-->
<!--          <i class="fa-solid fa-lock"></i>-->
<!--          <span>Bảo mật</span>-->
<!--        </div>-->

        <router-link to="/dashboard" class="menu-item">
          <i class="fa-solid fa-chart-line"></i>
          <span>Thống kê</span>
        </router-link>

        <router-link to="/facility" class="menu-item">
          <i class="fa-solid fa-building"></i>
          <span>Quản lý khu vực & cơ sở</span>
        </router-link>

        <router-link to="/inventory" class="menu-item">
          <i class="fa-solid fa-warehouse"></i>
          <span>Quản lý kho</span>
        </router-link>

        <router-link to="/inventorySlips" class="menu-item">
          <i class="fa-solid fa-file"></i>
          <span>Phiếu nhập/ xuất</span>
        </router-link>


        <router-link to="/VouchersManagement" class="menu-item">
          <i class="fas fa-tags"></i>
          <span>Quản lý khuyến mãi</span>
        </router-link>
        <router-link to="/membership" class="menu-item">
          <i class="fa-solid fa-medal"></i>
          <span>Membership</span>

        </router-link>


        <div class="menu-item" @click="toggleSubmenu('documents')">
          <i class="fas fa-file-alt"></i>
          <span>Tài liệu</span>
          <i :class="['fas fa-chevron-down chevron', { open: isDocumentsOpen }]"></i>
        </div>
        <div class="submenu" :class="{ open: isDocumentsOpen }">
          <div class="submenu-item">Hướng dẫn sử dụng</div>
          <div class="submenu-item">Chính sách bảo mật</div>
        </div>
      </div>

      <!-- Auth section -->
      <div class="auth-section">
        <div class="logo-container">

          <b class="logo-text text-black text-white" style="margin-left: 20px;">{{props.displayName}}</b>
        </div>
        <div class="auth-item logout fw-bold" @click="emit('logout')">
          <i class="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </div>
      </div>
    </div>
  </div>
</template>




<style scoped>
.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
.logo-image {
  width: 100px;
  height: auto;
  margin-right: 0.5rem;
}


.sidebar {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100vh;
  background: #0066cc;
  transition: left 0.4s ease-out;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.sidebar.open {
  left: 0;
}

.logo-section {
  padding: 20px;
  text-align: center;
}

.logo-section img {
  max-width: 120px;
  height: auto;
}

.menu-items {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.menu-item {
  padding: 12px 20px;
  font-weight: 600;
  color: #ffff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  position: relative;
  text-decoration: none;
}

.menu-item:hover {
  color: #540a57;
}

.menu-item:hover::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #540a57;
}

.menu-item i {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.submenu.open {
  max-height: 500px;
}

.submenu-item {
  padding: 10px 20px 10px 52px;
  color: #ffff;
  cursor: pointer;
  font-size: 14px;
  display: block;
  text-decoration: none;
}

.submenu-item:hover {
  color: #3b82f6;
  background-color: #f1f5f9;
}

.auth-section {
  margin-top: auto;
  padding: 15px 0;
  border-top: 1px solid #e2e8f0;
}

.auth-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
}

.auth-item.login {
  color: #3b82f6;
}

.auth-item.logout {
  color: #ef4444;
}

.auth-item i {
  margin-right: 12px;
}

.chevron {
  margin-left: auto;
  font-size: 12px;
  transition: transform 0.3s;
}

.chevron.open {
  transform: rotate(180deg);
}
</style>
