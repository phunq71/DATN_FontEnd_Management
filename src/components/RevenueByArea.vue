<script setup>
import {ref, computed, watch} from 'vue'
import {Bar, Line} from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement)

// Time range selection
const selectedTimeRange = ref('year')
const currentDate = new Date()
const currentYear = currentDate.getFullYear()
const currentMonth = currentDate.getMonth() + 1

// Year and month selection
const selectedYear = ref(currentYear)
const selectedMonth = ref(currentMonth)
const years = ref(Array.from({length: 5}, (_, i) => currentYear - 2 + i))
const months = ref(Array.from({length: 12}, (_, i) => i + 1))

// Mock data generation
const generateMockData = () => {
  const regions = ['Bắc', 'Trung', 'Nam', 'Tây Nam Bộ']
  const data = {}

  // Generate yearly data for the past 5 years
  years.value.forEach(year => {
    data[year] = {}

    // Generate monthly data for each year
    months.value.forEach(month => {
      data[year][month] = regions.reduce((acc, region) => {
        // Random revenue between 500 million and 5 billion
        acc[region] = Math.floor(Math.random() * 4500000000) + 500000000
        return acc
      }, {})
    })
  })

  return data
}

const mockData = generateMockData()

// Computed properties
const totalRevenue = computed(() => {
  if (selectedTimeRange.value === 'year') {
    return Object.values(mockData[selectedYear.value])
        .flatMap(monthData => Object.values(monthData))
        .reduce((sum, revenue) => sum + revenue, 0)
  } else {
    return Object.values(mockData[selectedYear.value][selectedMonth.value])
        .reduce((sum, revenue) => sum + revenue, 0)
  }
})

const chartData = computed(() => {
  const regions = ['Bắc', 'Trung', 'Nam', 'Tây Nam Bộ']

  if (selectedTimeRange.value === 'year') {
    // Yearly view - show monthly data for all regions (Bar Chart)
    return {
      labels: months.value.map(m => `Tháng ${m}`),
      datasets: regions.map(region => ({
        label: `Khu vực miền ${region}`,
        data: months.value.map(month => mockData[selectedYear.value][month][region]),
        backgroundColor: getRegionColorBar(region),
        borderColor: getRegionColorBar(region),
        borderWidth: 1,
        type: 'bar' // Specify chart type
      }))
    }
  } else {
    // Monthly view - show trend for selected month across years (Line Chart)
    return {
      labels: years.value.map(y => `Năm ${y}`),
      datasets: regions.map(region => ({
        label: `Khu vực miền ${region}`,
        data: years.value.map(year => mockData[year][selectedMonth.value][region]),
        borderColor: getRegionColorLine(region),
        backgroundColor: 'transparent',
        borderWidth: 3, // Giảm độ dày đường kẻ một chút
        pointBackgroundColor: getRegionColorLine(region),
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0, // Quan trọng: Đặt bằng 0 để có đường gấp khúc
        stepped: false, // Đảm bảo không phải dạng bậc thang
        borderJoinStyle: 'miter', // Kiểu nối các đoạn thẳng (miter/round/bevel)
        fill: false // Không tô màu dưới đường
      }))
    }
  }
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,         // Tổng thời gian vẽ (ms)
    easing: 'easeInOutQuart', // Kiểu easing mượt
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false
  },
  plugins: {
    legend: {
      position: 'top'
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          label += new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(context.raw);
          return label;
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0, // Đường gấp khúc (0: không bo cong)
      borderWidth: 3
    },
    point: {
      radius: 5,
      hoverRadius: 7
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: function (value) {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
            compactDisplay: 'short'
          }).format(value);
        }
      },
      grid: {
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}));

// Helper function for region colors
function getRegionColorBar(region) {
  const colors = {
    'Bắc': '#4285F4',
    'Trung': '#6EA9F7',
    'Nam': '#A5CFF9',
    'Tây Nam Bộ': '#DCEEFF'
  };
  return colors[region] || '#4285F4'; // fallback
}

function getRegionColorLine(region) {
  const colors = {
    'Bắc': '#4285F4',      // Xanh đậm
    'Trung': '#63A9F9',    // Xanh trung bình
    'Nam': '#86BFFB',      // Xanh nhạt hơn
    'Tây Nam Bộ': '#A9D5FD' // Xanh rất nhạt
  };
  return colors[region] || '#4285F4'; // fallback
}
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
      {{ new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(totalRevenue) }}
    </p>
    <p v-if="selectedTimeRange === 'year'">Năm {{ selectedYear }}</p>
    <p v-else>Tháng {{ selectedMonth }} ({{ selectedYear }})</p>
  </div>

  <div class="chart-container">
    <template v-if="chartData.labels && chartData.labels.length > 0">
      <Bar
          v-if="selectedTimeRange === 'year'"
          :key="`bar-${selectedYear}`"
          :data="chartData"
          :options="chartOptions"
      />
      <Line
          v-else
          :key="`line-${selectedMonth}-${selectedYear}`"
          :data="chartData"
          :options="chartOptions"
      />

    </template>
    <div v-else class="loading">Đang tải dữ liệu...</div>
  </div>
</template>

<style scoped>
/* Giữ nguyên các style như trước */
.filters {
  display: flex;
  justify-content: space-between;
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

.year-select {
  transition: all 0.3s ease;
}

.month-select {
  margin-left: 10px;
}

.select-group:has(.month-select) .year-select {
  margin-right: 10px;
}

.select-group {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  overflow: hidden;
}

.summary-card {
  background: #0066CC;
  color: white;
  padding: 10px 20px;
  margin-bottom: 30px;
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
  opacity: 1;
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
}
</style>