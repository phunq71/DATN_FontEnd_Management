<template>
  <div class="welcome-container">

    <div class="welcome-header">

      <div class="header-content">
        <h1 class="welcome-title">Quản trị hệ thống cửa hàng</h1>
        <p class="welcome-subtitle">Hệ thống quản lý vận hành cho doanh nghiệp</p>
      </div>
    </div>

    <div class="dashboard-preview">
      <div class="preview-card" v-for="(item, index) in features" :key="index">
        <div class="card-icon">
          <i :class="item.icon"></i>
        </div>
        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-desc">{{ item.desc }}</p>
        <div class="load-bar"></div>
      </div>
    </div>

    <div class="wave-container">
      <div class="wave"></div>
    </div>
    <div class="background-icons">
      <i class="fas fa-coins bg-icon icon-1"></i>
      <i class="fas fa-chart-line bg-icon icon-2"></i>
      <i class="fas fa-university bg-icon icon-3"></i>
      <i class="fas fa-money-bill-wave bg-icon icon-4"></i>
    </div>

  </div>


</template>

<script setup>
const features = [
  { icon: 'fas fa-shopping-cart', title: 'Bán hàng', desc: 'Quản lý giao dịch bán hàng' },
  { icon: 'fas fa-warehouse', title: 'Xuất nhập kho', desc: 'Kiểm soát hàng tồn kho' },
  { icon: 'fas fa-chart-bar', title: 'Thống kê', desc: 'Phân tích dữ liệu kinh doanh' },
  { icon: 'fas fa-file-invoice', title: 'Đơn hàng', desc: 'Quản lý đơn hàng hiệu quả' },
  { icon: 'fas fa-users', title: 'Nhân Viên', desc: 'Quản lý đội ngũ nhân sự' },
  { icon: 'fas fa-tags', title: 'Khuyến mãi', desc: 'Tạo và quản lý ưu đãi' }
];
</script>

<style>
:root {
  --primary-color: #0066CC; /* Deep, vibrant sky blue */
  --secondary-color: #3399FF; /* Lighter, complementary vibrant blue */
  --gradient-bg: linear-gradient(135deg, #0066CC 0%, #3399FF 100%);
  --card-shadow: 0 8px 30px rgba(0, 102, 204, 0.15);
}



body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: #f8f9fa;
}

.welcome-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 2rem 0;
  position: relative;
  overflow: hidden;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  padding: 0 1rem;
  margin-bottom: 2rem;
  position: relative;
}


.header-content {
  text-align: center;
  margin-top: 5rem; /* Space for logo-container */
}

.welcome-title {
  font-size: 3.2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.welcome-subtitle {
  font-size: 1.3rem;
  color: #455A64;
  line-height: 1.6;
  max-width: 600px;
}

.dashboard-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  z-index: 1;
}

.preview-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid #E8EAF6;
}

.preview-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--card-shadow);
}

.preview-card:hover .card-icon {
  background: var(--gradient-bg);
}

.card-icon {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  background: #E8EAF6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  transition: all 0.4s ease;
}

.card-icon i {
  font-size: 1.8rem;
  color: var(--primary-color);
  transition: color 0.3s ease;
}

.preview-card:hover .card-icon i {
  color: white;
}

.card-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #263238;
  margin-bottom: 0.75rem;
  text-align: center;
}

.card-desc {
  font-size: 0.95rem;
  color: #607D8B;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.load-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 4px;
  background: var(--gradient-bg);
  transition: width 0.3s ease;
}

.preview-card:hover .load-bar {
  width: 100%;
}

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