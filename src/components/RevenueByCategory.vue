<script setup>
import { ref, onMounted } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const selectedYear = ref(new Date().getFullYear())
const years = [2023, 2022, 2021, 2020]
selectedYear.value= years[0];
const categories = [
  'Áo thun', 'Quần jeans', 'Váy', 'Áo sơ mi',
  'Áo khoác', 'Giày dép', 'Phụ kiện', 'Đồ thể thao'
]
const totalRevenue = ref(0)
const chartData = ref({
  labels: [],
  datasets: [
    {
      backgroundColor: [
        '#4285F4', // xanh đậm
        '#63A9F9', // xanh trung
        '#86BFFB', // xanh nhạt
        '#A9D5FD', // xanh rất nhạt
        '#36A2EB', // xanh aqua
        '#4BC0C0', // xanh teal
        '#5AD3D1', // xanh mint
        '#B3E5FC'  // xanh baby blue
      ],
      data: []
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Cơ cấu doanh thu theo danh mục năm '+ selectedYear.value
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.raw || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = Math.round((value / total) * 100)
          return `${label}: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} (${percentage}%)`
        }
      }
    }
  }
}


const generateRandomData = () => {
  // Random data for each category
  const data = categories.map(() => Math.floor(Math.random() * 50000000) + 10000000)

  chartData.value.labels = categories
  chartData.value.datasets[0].data = data
  totalRevenue.value = data.reduce((a, b) => a + b, 0)
}

const updateChartData = () => {
  generateRandomData()
}

onMounted(() => {
  generateRandomData()
})
</script>

<template>
  <div class="filters">
    <div class="filter-group year-select">
      <label>Năm:</label>
      <select v-model="selectedYear" @change="updateChartData">
        <option v-for="year in years" :value="year">{{ year }}</option>
      </select>
    </div>
  </div>

  <div class="summary-card">
    <h3>Tổng doanh thu</h3>
    <p class="revenue">
      {{ new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(totalRevenue) }}
    </p>
    <p>Năm {{ selectedYear }}</p>
  </div>

  <div class="chart-container">
    <template v-if="chartData.labels && chartData.labels.length > 0">
      <Pie
          :key="`pie-${selectedYear}`"
          :data="chartData"
          :options="chartOptions"
      />
    </template>
    <div v-else class="loading">Đang tải dữ liệu...</div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #f5f9ff;
  padding: 10px 20px;
  margin-bottom: 20px;
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
  min-width: 100px;
}

.summary-card {
  background: #0066CC;
  color: white;
  padding: 15px 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-card h3 {
  margin: 0;
  font-size: 1.2rem;
  margin-right: 20px;
}

.revenue {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0;
}

.summary-card p {
  margin: 0;
  margin-left: auto;
  padding-left: 20px;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 102, 204, 0.1);
  margin-bottom: 30px;
  min-height: 500px;
  position: relative;
  width: 100%;
}

.chart-container canvas {
  height: 500px !important;
  width: 100% !important;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #0066CC;
  font-weight: bold;
}

@media (max-width: 768px) {
  .chart-container {
    min-height: 400px;
  }

  .chart-container canvas {
    height: 400px !important;
  }

  .summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .summary-card p {
    margin-left: 0;
    padding-left: 0;
  }
}
</style>