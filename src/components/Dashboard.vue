<script setup>

import RevenueByYear_Month from "./RevenueByYear_Month.vue";
import RevenueByArea from "./RevenueByArea.vue";
import RevenueByCategory from "./RevenueByCategory.vue";
import RevenueByShop from "./RevenueByShop.vue";

import { ref } from 'vue'


// Tab đang chọn
const activeTab = ref('year')
</script>

<template>
  <div class="dashboard">
    <nav class="navbar">
      <div class="navbar-content">
        <div class="navbar-links">
          <button
              class="nav-link"
              :class="{ active: activeTab === 'year' }"
              @click="activeTab = 'year'"
          >
            Doanh thu theo năm
          </button>
          <button
              class="nav-link"
              :class="{ active: activeTab === 'area' }"
              @click="activeTab = 'area'"
          >
            Doanh thu theo khu vực
          </button>
          <button
              class="nav-link"
              :class="{ active: activeTab === 'category' }"
              @click="activeTab = 'category'"
          >
            Doanh thu theo danh mục
          </button>

          <button
              class="nav-link"
              :class="{ active: activeTab === 'map' }"
              @click="activeTab = 'map'"
          >
            Bản đồ doanh thu
          </button>

        </div>
      </div>
    </nav>

    <div class="main-container">
      <RevenueByYear_Month v-if="activeTab === 'year'" />
      <RevenueByArea v-if="activeTab === 'area'" />
      <RevenueByCategory v-if="activeTab === 'category'" />
      <RevenueByShop v-if="activeTab === 'map'"/>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  font-family: Arial, sans-serif;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  max-width: 95vw; /* co giãn theo màn hình */
}

h1 {
  color: #0066CC;
  text-align: center;
  margin-bottom: 30px;
}

.navbar {
  background: #f5f9ff;
  padding: 15px 0;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 102, 204, 0.1);
}

.navbar-content {
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 95vw; /* chiếm 95% màn hình, không bị quá rộng */
}

.navbar-links {
  display: flex;
  gap: 30px;
}

.nav-link {
  color: #0066CC;
  text-decoration: none;
  font-weight: 500;
  padding: 5px 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #004d99;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: #0066CC;
  transition: width 0.3s;
}

.nav-link.active {
  color: #1f2937;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard,
  .navbar-content {
    max-width: 1140px;
  }
}

@media (max-width: 992px) {
  .dashboard,
  .navbar-content {
    max-width: 960px;
  }
}

@media (max-width: 768px) {
  .dashboard,
  .navbar-content {
    max-width: 720px;
    flex-direction: column;
  }

  .navbar-links {
    margin-top: 15px;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
}

@media (max-width: 576px) {
  .dashboard,
  .navbar-content {
    max-width: 540px;
  }
}


</style>