<script setup>
import {ref, computed, watch, onMounted} from 'vue'
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

// Time range selection - Mặc định hiển thị theo năm trước
const selectedTimeRange = ref('monthly')
const currentDate = new Date()

// Year selection
const selectedYear = ref(new Date().getFullYear());
const years = ref([]);
const availableRegions = ref([]);

const chartData = ref({
  labels: [],
  datasets: []
});

// Fetch data when component mounts
onMounted(() => {
  fetchRevenueData();
});

// Watch for changes in time range or year selection
watch([selectedTimeRange, selectedYear], () => {
  fetchRevenueData();
});

// Fetch data based on current selection
const fetchRevenueData = async () => {
  if (selectedTimeRange.value === 'yearly') {
    const data = await getRevenueArea(selectedYear.value);
    chartData.value = generateBarChartData(data);
    chartOptions.value.plugins.title.text = `BÁO CÁO BÁN HÀNG THEO THÁNG NĂM ${selectedYear.value}`;
  } else {
    const data = await getRevenueArea();
    chartData.value = generateLineChartData(data);
    chartOptions.value.plugins.title.text = `BÁO CÁO BÁN HÀNG THEO NĂM`;
  }
}

// API call to get revenue by area
async function getRevenueArea(year = null) {
  const url = year ? `/admin/dashboard/revenueByArea?year=${year}` : '/admin/dashboard/revenueByArea';

  try {
    const response = await api.get(url, {withCredentials: true});

    // Extract unique years for dropdown
    if (!year) {
      years.value = [...new Set(response.data.map(item => item.time))].sort();
    }

    // Extract unique regions
    availableRegions.value = [...new Set(response.data.map(item => item.area))];

    return response.data;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    return [];
  }
}

// Generate data for bar chart (yearly view)
function generateBarChartData(data) {
  const datasets = [];
  const labels = [];
  const revenueByMonth = {};

  // Process data to group by month and region
  data.forEach(item => {
    if (!revenueByMonth[item.time]) {
      revenueByMonth[item.time] = {};
      labels.push(`Tháng ${item.time}`);
    }

    revenueByMonth[item.time][item.area] = item.revenue;
  });

  // Tạo màu sắc theo tông xanh biển với các độ đậm nhạt khác nhau
  const blueColors = [
    '#0066CC', // Màu chính
    '#66A3FF', // Nhạt hơn 40%
    '#99C2FF', // Nhạt hơn 60%
    '#CCE0FF'  // Nhạt hơn 80%
  ];

  // Create datasets for each region dynamically
  availableRegions.value.forEach((region, index) => {
    const colorIndex = index % blueColors.length;
    datasets.push({
      label: region, // Shorten label
      data: labels.map((_, index) => revenueByMonth[index+1]?.[region] || 0),
      backgroundColor: blueColors[colorIndex],
      borderColor: blueColors[colorIndex],
      borderWidth: 1
    });
  });

  return {
    labels,
    datasets
  };
}

// Generate data for line chart (monthly view)
function generateLineChartData(data) {
  const datasets = [];
  const revenueByYear = {};

  // Process data to group by year and region
  data.forEach(item => {
    if (!revenueByYear[item.time]) {
      revenueByYear[item.time] = {};
    }
    revenueByYear[item.time][item.area] = item.revenue;
  });

  // Tạo màu sắc theo tông xanh biển với các độ đậm nhạt khác nhau
  const blueColors = [
    '#0066CC', // Màu chính
    '#3385FF', // Nhạt hơn 20%
    '#66A3FF', // Nhạt hơn 40%
    '#99C2FF', // Nhạt hơn 60%
    '#CCE0FF'  // Nhạt hơn 80%
  ];

  // Create datasets for each region dynamically
  availableRegions.value.forEach((region, index) => {
    const colorIndex = index % blueColors.length;
    datasets.push({
      label: region, // Shorten label
      data: years.value.map(year => revenueByYear[year]?.[region] || 0),
      borderColor: blueColors[colorIndex],
      backgroundColor: 'transparent',
      borderWidth: 3,
      pointBackgroundColor: blueColors[colorIndex],
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0
    });
  });

  return {
    labels: years.value.map(year => `Năm ${year}`),
    datasets
  };
}

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true,
      text: 'BÁO CÁO BÁN HÀNG',
      font: {
        size: 16
      }
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
  scales: {
    y: {
      beginAtZero: false,
      ticks: {
        callback: function (value) {
          if (value >= 1_000_000_000) {
            return (value / 1_000_000_000) + ' tỷ'
          } else if (value >= 1_000_000) {
            return (value / 1_000_000) + ' triệu'
          } else {
            return new Intl.NumberFormat('vi-VN').format(value)
          }
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

const totalRevenue = computed(() => {
  if (!chartData.value.datasets.length) return 0;

  return chartData.value.datasets.reduce((total, dataset) => {
    return total + dataset.data.reduce((sum, value) => sum + value, 0);
  }, 0);
});
</script>

<template>
  <div class="dashboard-container">
    <div class="filters">
      <div class="button-group">
        <button
            @click="selectedTimeRange = 'monthly'"
            :class="{ active: selectedTimeRange === 'monthly' }"
        >
          Theo năm
        </button>
        <button
            @click="selectedTimeRange = 'yearly'"
            :class="{ active: selectedTimeRange === 'yearly' }"
        >
          Theo tháng trong năm
        </button>
      </div>

      <div class="select-group" v-if="selectedTimeRange === 'yearly'">
        <div class="filter-group year-select">
          <label>Năm:</label>
          <select v-model="selectedYear">
            <option v-for="year in years" :value="year">{{ year }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <h3>Tổng doanh thu</h3>
      <p class="revenue">
        {{ new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(totalRevenue) }}
      </p>
      <p v-if="selectedTimeRange === 'yearly'">Năm {{ selectedYear }}</p>
      <p v-else>Toàn bộ các năm</p>
    </div>

    <div class="chart-container">
      <template v-if="chartData.labels && chartData.labels.length > 0">
        <Line
            v-if="selectedTimeRange === 'monthly'"
            :key="`line-${selectedYear}`"
            :data="chartData"
            :options="chartOptions"
        />
        <Bar
            v-else
            :key="`bar-${selectedYear}`"
            :data="chartData"
            :options="chartOptions"
        />
      </template>
      <div v-else class="loading">Đang tải dữ liệu...</div>
    </div>
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