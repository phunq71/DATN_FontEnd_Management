<script setup>
import {onMounted, ref, watch} from 'vue'
// import MyBarChart thay vì Bar trực tiếp
import MyBarChart from './MyBarChart.vue'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js'

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
const selectedYear = ref(0)
const selectedMonth = ref(0)
const years_select = ref([]);
const totalRevenue = ref(0);
const facilityName = ref('');
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
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) label += ': '

          if (context.datasetIndex === 1) {
            // Số lượng đơn
            label += context.raw + ' đơn'
          } else if (context.datasetIndex === 0) {
            // Doanh thu -> format VND đầy đủ
            label += new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(context.raw)
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
      },
      // Thêm ID cho trục y
      id: 'y',
      // Đặt suggestedMax ở đây thay vì trong ticks
      suggestedMax: 10, // Giá trị mặc định ban đầu
      ticks: {
        callback: function (value) {
          return value + ' đơn'
        }
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
        callback: function (value) {
          if (value >= 1_000_000_000) {
            return (value / 1_000_000_000) + ' tỷ'
          } else if (value >= 1_000_000) {
            return (value / 1_000_000) + ' triệu'
          } else {
            return new Intl.NumberFormat('vi-VN').format(value)
          }
        }
      }
    }
  }
})

// Tạo dữ liệu mẫu
const generateData = (data) => {
  if (data != null) {
    console.log("data nhận được", data)
    return {
      labels: data.time,
      datasets: [
        {
          label: 'Doanh thu',
          data: data.revenues,
          backgroundColor: '#66CCFF',
          borderColor: '#66CCFF',
          borderWidth: 2,
          type: 'line',
          yAxisID: 'y1'
        },
        {
          label: 'Số lượng đơn',
          data: data.orderCounts,
          backgroundColor: '#0066CC',
          borderColor: '#0066CC',
          borderWidth: 1
        }
      ]
    }
  }
}


// Cập nhật dữ liệu chart
const updateChart = async () => {

  if (selectedTimeRange.value === 'year') {
    chartData.value = generateData(await getRevenueByYear());
    chartOptions.value.plugins.title.text = `BÁO CÁO BÁN HÀNG THEO NĂM`
  } else {
    chartData.value = generateData(await getRevenueByMonth(selectedYear.value, selectedMonth.value));
    chartOptions.value.plugins.title.text = `BÁO CÁO BÁN HÀNG CÁC THÁNG TRONG NĂM ${selectedYear.value}`
  }
}


// Khởi tạo ban đầu
onMounted(async () => {
  await getAvailableYear();
  await updateChart();

});

async function getRevenueByYear() {
  try {
    const response = await api.get("/admin/dashboard/revenueByYear", {withCredentials: true});
    const data = response.data;
    console.log("API Data:", data);

    let rawRevenue = [];


    // Kiểm tra trường hợp AREA
    if (data.hasOwnProperty("facilityName") && data.hasOwnProperty("revenueByYear")) {
      facilityName.value = data.facilityName;
      rawRevenue = data.revenueByYear;
    } else {
      // Trường hợp ADMIN
      rawRevenue = data;
    }

    const years = rawRevenue.map(item => item.time);
    const orderCounts = rawRevenue.map(item => item.orderCount);
    const maxOrderCount = Math.max(...orderCounts);
    chartOptions.value.scales.y.suggestedMax = Math.ceil(maxOrderCount * 1.1);
    const revenues = rawRevenue.map(item => item.revenue);

    console.log("Years:", years);
    console.log("Order Counts:", orderCounts);
    console.log("Revenues:", revenues);


    return {
      time: years,
      orderCounts: orderCounts,
      revenues: revenues
    };

  } catch (error) {
    console.log(error);
    Swal.fire({
      title: 'Bạn không có quyền xem mục này!',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#000000'
    });
    return null;
  }
}


async function getRevenueByMonth(year) {
  try {
    const response = await api.get(`/admin/dashboard/revenueByMonth/${year}`, {withCredentials: true});
    const data = response.data;
    console.log(data);

    const months = data.map(item => item.time);
    const orderCounts = data.map(item => item.orderCount);
    const maxOrderCount = Math.max(...orderCounts);
    // Cập nhật suggestedMax trực tiếp trong scale options
    updateMaxOrderCount(maxOrderCount);

    const revenues = data.map(item => item.revenue);
    revenues.forEach(revenue => {
      totalRevenue.value += revenue;
    });
    console.log("months:", months);
    console.log("Order Counts:", orderCounts);
    console.log("Revenues:", revenues);


    return {
      time: months,
      orderCounts: orderCounts,
      revenues: revenues
    };
  } catch (error) {
    console.log(error);
    Swal.fire({
      title: 'Bạn không có quyền xem mục này!',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#000000'
    });
    // return { years: [], orderCounts: [], revenues: [] };
    return null;
  }
}

async function getAvailableYear() {
  await api.get("/admin/dashboard/revenue/availableYear", {withCredentials: true})
      .then(response => {
        years_select.value = response.data;
        selectedYear.value = years_select.value[0];
        console.log(years_select.value);
      }).catch(error => {
        console.log(error);
        Swal.fire({
          title: 'Lỗi lấy năm',
          text: "Vui lòng truy cập sau",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#000000'
        });
      });
}

// Thay đổi cách cập nhật suggestedMax
const updateMaxOrderCount = (maxOrderCount) => {
  chartOptions.value = {
    ...chartOptions.value,
    scales: {
      ...chartOptions.value.scales,
      y: {
        ...chartOptions.value.scales.y,
        suggestedMax: Math.ceil(maxOrderCount * 1.1)
      }
    }
  }
}

// Theo dõi thay đổi filter
watch([selectedTimeRange, selectedYear, selectedMonth], updateChart)

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
      <div v-if="selectedTimeRange === 'month'" class="filter-group year-select">
        <label>Năm:</label>
        <select v-model="selectedYear">
          <option v-for="year in years_select" :value="year">{{ year }}</option>
        </select>
      </div>

    </div>
  </div>

  <div v-if="!facilityName">
    <div v-if="selectedTimeRange === 'month'" class="summary-card">
      <h3>Tổng doanh thu: </h3>
      <p class="revenue">
        {{ new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(totalRevenue) }}
      </p>
      <p v-if="selectedTimeRange === 'year'">Năm {{ selectedYear }}</p>
      <p v-else>Trong năm: {{ selectedYear }}</p>
    </div>
  </div>

  <div v-else>
    <div v-if="selectedTimeRange === 'year'" class="summary-card">
      <h3></h3>
      <p class="revenue">
        {{ facilityName }}
      </p>
      <p v-if="selectedTimeRange === 'year'"></p>

    </div>



    <div v-if="selectedTimeRange === 'month'" class="summary-card">
      <h3>{{ facilityName }}:</h3>
      <p class="revenue">
        {{ new Intl.NumberFormat('vi-VN', {style: 'currency', currency: 'VND'}).format(totalRevenue) }}
      </p>
      <p v-if="selectedTimeRange === 'year'">Năm {{ selectedYear }}</p>
      <p v-else>Trong năm: {{ selectedYear }}</p>
    </div>
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