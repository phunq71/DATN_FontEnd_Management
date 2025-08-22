<template>
  <div class="dashboard-container">
    <div class="filters">
      <div class="button-group">
        <button
            @click="selectedTimeRange = 'yearly'"
            :class="{ active: selectedTimeRange === 'yearly' }"
        >
          Theo năm
        </button>
        <button
            @click="selectedTimeRange = 'monthly'"
            :class="{ active: selectedTimeRange === 'monthly' }"
        >
          Theo tháng
        </button>
      </div>

      <div class="select-group">
        <div class="filter-group">
          <label>Năm:</label>
          <select v-model="selectedYear">
            <option v-for="year in years" :value="year">{{ year }}</option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedTimeRange === 'monthly'">
          <label>Tháng:</label>
          <select v-model="selectedMonth">
            <option v-for="month in 12" :value="month">Tháng {{ month }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <h3>Tổng doanh thu</h3>
      <p class="revenue">
        {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue) }}
      </p>
      <p v-if="selectedTimeRange === 'yearly'">Năm {{ selectedYear }}</p>
      <p v-else>Tháng {{ selectedMonth }} năm {{ selectedYear }}</p>
    </div>

    <div class="chart-container" style="height: 600px;">
      <div ref="treemapChart" style="width: 100%; height: 100%;"></div>
      <div v-if="!chartData.length" class="no-data">
        <p>Không có dữ liệu để hiển thị</p>
        <p>Vui lòng kiểm tra lại năm/tháng đã chọn</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const selectedTimeRange = ref('yearly')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(new Date().getMonth() + 1)
const years = ref([])
const totalRevenue = ref(0)
const chartData = ref([])
const treemapChart = ref(null)
const chartInstance = ref(null)

const fetchAvailableYears = async () => {
  try {
    const response = await api.get('/admin/dashboard/revenue/availableYear', { withCredentials: true })
    years.value = response.data
    if (years.value.length > 0 && !years.value.includes(selectedYear.value)) {
      selectedYear.value = years.value[0]
    }
  } catch (error) {
    console.error('Error fetching available years:', error)
  }
}

const fetchData = async () => {
  try {
    const params = {
      year: selectedYear.value
    }

    if (selectedTimeRange.value === 'monthly') {
      params.month = selectedMonth.value
    }

    const response = await api.get('/admin/dashboard/revenueByShop', {
      params,
      withCredentials: true
    })

    chartData.value = response.data
    calculateTotalRevenue()
    renderChart()
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    chartData.value = []
    totalRevenue.value = 0
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = null
    }
  }
}

const calculateTotalRevenue = () => {
  totalRevenue.value = chartData.value.reduce((sum, item) => sum + item.revenue, 0)
}

const renderChart = () => {
  if (!chartData.value.length) return

  // Initialize the chart if it doesn't exist
  if (!chartInstance.value) {
    chartInstance.value = echarts.init(treemapChart.value)
  }

  // Group data by area
  const areaMap = {}
  chartData.value.forEach(item => {
    if (!areaMap[item.area]) {
      areaMap[item.area] = {
        name: item.area,
        value: 0,
        children: []
      }
    }
    areaMap[item.area].value += item.revenue
    areaMap[item.area].children.push({
      name: item.shop,
      value: item.revenue
    })
  })

  const seriesData = Object.values(areaMap)

  const option = {
    title: {
      text: 'DOANH THU THEO CỬA HÀNG',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(info) {
        const value = info.value;
        const formattedValue = new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(value);

        return `
        <div style="font-weight:bold;color:${info.color};margin-bottom:5px;">
          ${info.name}
        </div>
        <div style="display:flex;justify-content:space-between;">
          <span>Doanh thu:</span>
          <span style="font-weight:bold;">${formattedValue}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:3px;">
          <span>Tỉ trọng:</span>
          <span>${((value / totalRevenue.value) * 100).toFixed(1)}%</span>
        </div>
      `;
      }
    },
    series: [{
      // name: 'Doanh thu',
      type: 'treemap',
      roam:  false,
      visibleMin: 300,
      emphasis: {
        disabled: false, // Tắt hiệu ứng hover (click vẫn hoạt động)
      },
      select: {
        disabled: true, // Tắt chọn (nếu có)
      },
      data: seriesData,
      breadcrumb: {
        show: false
      },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 12,
        color: '#fff',
        textShadowBlur: 3,
        textShadowColor: 'rgba(0,0,0,0.5)'
      },
      upperLabel: {
        show: true,
        height: 30,
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold'
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
      levels: [
        {
          // Cấp độ khu vực
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 2,
            gapWidth: 1
          },
          color: [
            '#0066CC', // Miền Bắc
            '#00A651', // Miền Trung
            '#FF5722', // Miền Nam
            '#9C27B0', // Miền Tây
            '#607D8B', // Khu vực khác
            '#795548'  // Dự phòng
          ]
        },
        {
          // Cấp độ cửa hàng
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            gapWidth: 1
          },
          colorSaturation: [0.4, 0.7],
          colorMappingBy: 'value',
          visualMap: {
            type: 'continuous',
            min: Math.min(...seriesData.flatMap(area => area.children.map(shop => shop.value))),
            max: Math.max(...seriesData.flatMap(area => area.children.map(shop => shop.value))),
            inRange: {
              colorLightness: [0.8, 0.3]
            }
          }
        }
      ]
    }],
    toolbox: {
      show: true,
      feature: {
        // saveAsImage: {
        //   title: 'Lưu hình ảnh',
        //   pixelRatio: 2
        // }
      }
    }
  };

  chartInstance.value.setOption(option)
}

const handleResize = () => {
  if (chartInstance.value) {
    chartInstance.value.resize()
  }
}

// Watchers
watch(selectedTimeRange, fetchData)
watch(selectedYear, fetchData)
watch(selectedMonth, fetchData)

// Lifecycle hooks
onMounted(async () => {
  await fetchAvailableYears()
  await fetchData()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance.value) {
    chartInstance.value.dispose()
    chartInstance.value = null
  }
})
</script>

<style scoped>
/* Your existing styles remain the same */
.no-data {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #666;
  font-size: 1.2rem;
}

.no-data p {
  margin: 0.5rem 0;
}

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
}
</style>
