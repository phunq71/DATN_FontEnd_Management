<script setup>
import { ref, computed, onMounted, watch } from 'vue'
// import MyBarChart thay vì Bar trực tiếp
import MyBarChart from './MyBarChart.vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement
} from 'chart.js'
import Minimenu from "./minimenu.vue";

// Đăng ký components ChartJS
ChartJS.register(
    Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineElement, PointElement
)

// Khởi tạo dữ liệu với cấu trúc mặc định
const chartData = ref({
  labels: [],
  datasets: []
})

// State cho filter
const selectedTimeRange = ref('year')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)

// Options cho chart
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false
  },
  plugins: {
    title: {
      display: true,
      text: 'Đang tải dữ liệu...'
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || ''
          if (label) label += ': '
          if (context.datasetIndex === 1) {
            label += new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(context.raw)
          } else {
            label += context.raw
          }
          return label
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Số lượng đơn'
      }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Doanh thu'
      },
      grid: {
        drawOnChartArea: false
      },
      ticks: {
        callback: function(value) {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(value)
        }
      }
    }
  }
})

// Tạo dữ liệu mẫu
const generateData = () => {
  if (selectedTimeRange.value === 'year') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return {
      labels: months,
      datasets: [
        {
          label: 'Doanh thu',
          data: months.map(() => Math.floor(Math.random() * 20000) + 5000),
          backgroundColor: '#66CCFF',
          borderColor: '#66CCFF',
          borderWidth: 2,
          type: 'line',
          yAxisID: 'y1'
        },
        {
          label: 'Số lượng đơn',
          data: months.map(() => Math.floor(Math.random() * 500) + 100),
          backgroundColor: '#0066CC',
          borderColor: '#0066CC',
          borderWidth: 1
        }
      ]
    }
  } else {
    const days = Array.from({ length: 30 }, (_, i) => i + 1)
    return {
      labels: days.map(d => `${d}`),
      datasets: [
        {
          label: 'Doanh thu',
          data: days.map(() => Math.floor(Math.random() * 2000) + 500),
          backgroundColor: '#66CCFF',
          borderColor: '#66CCFF',
          borderWidth: 2,
          type: 'line',
          yAxisID: 'y1'
        },
        {
          label: 'Số lượng đơn',
          data: days.map(() => Math.floor(Math.random() * 30) + 5),
          backgroundColor: '#0066CC',
          borderColor: '#0066CC',
          borderWidth: 1
        }
      ]
    }
  }
}

// Cập nhật dữ liệu chart
const updateChart = () => {
  const newData = generateData()
  chartData.value = newData

  chartOptions.value.plugins.title.text =
      selectedTimeRange.value === 'year'
          ? `BÁO CÁO BÁN HÀNG NĂM ${selectedYear.value}`
          : `BÁO CÁO BÁN HÀNG THÁNG ${selectedMonth.value}/${selectedYear.value}`
}

// Tính tổng doanh thu
const totalRevenue = computed(() => {
  if (!chartData.value.datasets[1]) return 0
  return chartData.value.datasets[1].data.reduce((a, b) => a + b, 0)
})

// Khởi tạo ban đầu
onMounted(updateChart)

// Theo dõi thay đổi filter
watch([selectedTimeRange, selectedYear, selectedMonth], updateChart)

// Danh sách năm và tháng
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
</script>

<template>
  <div class="filters">
    <div class="button-group">
      <button
          @click="selectedTimeRange = 'year'"
          :class="{ active: selectedTimeRange === 'year' }"
      >
        Theo năm
      </button>
      <button
          @click="selectedTimeRange = 'month'"
          :class="{ active: selectedTimeRange === 'month' }"
      >
        Theo tháng
      </button>
    </div>

    <div class="select-group">
      <div class="filter-group year-select">
        <label>Năm:</label>
        <select v-model="selectedYear">
          <option v-for="year in years" :value="year">{{ year }}</option>
        </select>
      </div>

      <transition name="slide-fade">
        <div v-if="selectedTimeRange === 'month'" class="filter-group month-select">
          <label>Tháng:</label>
          <select v-model="selectedMonth">
            <option v-for="month in months" :value="month">{{ month }}</option>
          </select>
        </div>
      </transition>
    </div>
  </div>

  <div class="summary-card">
    <h3>Tổng doanh thu</h3>
    <p class="revenue">
      {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue) }}
    </p>
    <p v-if="selectedTimeRange === 'year'">Năm {{ selectedYear }}</p>
    <p v-else>Tháng {{ selectedMonth }}/{{ selectedYear }}</p>
  </div>

  <div class="chart-container">
    <MyBarChart
        v-if="chartData.labels.length > 0"
        :chart-data="chartData"
        :chart-options="chartOptions"
    />
    <div v-else class="loading">Đang tải dữ liệu...</div>
  </div>

</template>

<style scoped>

.filters {
  display: flex;
  justify-content: space-between; /* Căn 2 nhóm ra 2 bên */
  align-items: center;

  flex-wrap: wrap;
  background: #f5f9ff;
  padding: 10px 20px;

}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  padding: 8px 16px;
  border: 1px solid #0066CC;
  background: white;
  color: #0066CC;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.button-group button.active {
  background: #0066CC;
  color: white;
}

.select-group {
  display: flex;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
  color: #0066CC;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #0066CC;
  border-radius: 4px;
  background: white;
  color: #333;
}

/* Hiệu ứng xuất hiện */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Đảm bảo select năm di chuyển mượt mà */
.year-select {
  transition: all 0.3s ease;
}

.month-select {
  margin-left: 10px; /* Khoảng cách giữa select năm và tháng */
}

/* Khi có select tháng thì select năm dịch sang trái */
.select-group:has(.month-select) .year-select {
  margin-right: 10px;
}


.select-group {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  overflow: hidden; /* Ẩn phần tràn khi animation */
}

.summary-card {
  background: #0066CC;
  color: white;
  padding: 10px 20px; /* Giảm padding top-bottom */

  margin-bottom: 30px;
  display: flex; /* Thêm flexbox */
  align-items: center; /* Căn giữa theo chiều dọc */
  justify-content: space-between; /* Các phần tử cách đều 2 bên */
}

.summary-card h3 {
  margin: 0; /* Bỏ margin top */
  font-size: 1.2rem;
  margin-right: 20px; /* Khoảng cách với doanh thu */
}

.revenue {
  font-size: 1.8rem; /* Giảm kích thước font một chút */
  font-weight: bold;
  margin: 0; /* Bỏ margin */
}

.summary-card p {
  margin: 0; /* Bỏ margin */
  margin-left: auto; /* Đẩy về phía bên phải */
  padding-left: 20px; /* Khoảng cách với doanh thu */
}

.chart-container {
  background: white !important; /* Đảm bảo nền trắng */
  opacity: 1 !important; /* Đảm bảo không trong suốt */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 102, 204, 0.1);
  margin-bottom: 30px;
  min-height: 500px; /* Tăng chiều cao tối thiểu */
  position: relative;
  width: 100%; /* Đảm bảo chiếm full width */
}

/* Thêm style cho canvas chart để phóng to */
.chart-container canvas {
  height: 500px !important; /* Chiều cao cụ thể cho canvas */
  width: 100% !important; /* Chiều rộng full */
}

.chart-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0066CC;
  font-weight: bold;
}

.chart-placeholders {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.placeholder {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 102, 204, 0.1);
}

.placeholder h3 {
  color: #0066CC;
  margin-top: 0;
}

.empty-chart {
  height: 200px;
  background: #f5f9ff;
  border: 1px dashed #66CCFF;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0066CC;
}

@media (max-width: 768px) {
  .chart-container {
    min-height: 400px;
  }
  .chart-container canvas {
    height: 400px !important;
  }
}

</style>