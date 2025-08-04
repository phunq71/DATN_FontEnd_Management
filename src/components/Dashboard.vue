<script setup>

import RevenueByYear_Month from "./RevenueByYear_Month.vue";
import RevenueByArea from "./RevenueByArea.vue";
import RevenueByCategory from "./RevenueByCategory.vue";


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
            Doanh thu theo sản phẩm
          </button>
        </div>
      </div>
    </nav>

    <div class="main-container">
      <RevenueByYear_Month v-if="activeTab === 'year'" />
      <RevenueByArea v-if="activeTab === 'area'" />
      <RevenueByCategory v-if="activeTab === 'category'" />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  font-family: Arial, sans-serif;
  max-width: 1300px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1 {
  color: #0066CC;
  text-align: center;
  margin-bottom: 30px;
}
/* Thêm style cho navbar mới */
.navbar {
  background: #f5f9ff;
  padding: 15px 0;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 102, 204, 0.1);
}

.navbar-content {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
@media (max-width: 768px) {
  .navbar-content {
    flex-direction: column;
  }

  .navbar-links {
    margin-top: 15px;
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }
}




</style>