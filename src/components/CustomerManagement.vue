<script setup>
import { ref, onMounted, watch, onUnmounted, computed, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import Swal from "sweetalert2";
// Dữ liệu mẫu khách hàng (giữ nguyên)
const customers = ref([]);
// Phân trang cho khách hàng
const customerCurrentPage = ref(0);
const customerTotalPages = ref(0);
//Hiển thị mức dộ hài lòng
const stats = ref({
  avgRating: 0,
  starCounts: []
})
const totalReviews = computed(() =>
    stats.value.starCounts.reduce((sum, s) => sum + s.total, 0)
)

// hàm tính %
const getPercentage = (count) => {
  if (totalReviews.value === 0) return 0
  return (count / totalReviews.value) * 100
}
// Phân trang cho đơn hàng
const orderCurrentPage = ref(0);
const orderTotalPages = ref(0);
// Dữ liệu đơn hàng mẫu (giữ nguyên)
const orders = ref([]);
// Dữ liệu sản phẩm trong đơn hàng (mới thêm)
const orderItems = ref([]);
// Dữ liệu biểu đồ (giữ nguyên)
// Biến để lưu trữ instance biểu đồ
let chartInstance = null;
const chartCanvas = ref(null) // ref cho canvas
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Số lượng khách hàng',
    data: [],
    backgroundColor: '#0066cc'
  }]
});
const showReviewLevel = ref(false)
const activeTab = ref('DSKH');
const selectedCustomer = ref(null);
const selectedOrder = ref(null);
const showReviewModal = ref(false);
//Dữ liệu filter
const membershipOptions = ref([]) // dữ liệu từ BE
const idCustomer = ref('');
const filterOption = ref('');
const customerForm = ref({
  customerId: '',
  fullName: '',
  phone: '',
  gender: true,
  address: '',
  addressIdGHN: '',
  dob: '',
  imageAvt: '',
  membershipId: '',
  membership: '',
  createAt: '',
  updateAt: '',
  status: true
});


// Lấy danh sách sản phẩm và đánh giá cho đơn hàng được chọn
function formatCurrency(value) {
  if (value == null) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', 'đ'); // đổi ký hiệu sang đ nếu muốn
}
function formatOrderID(id) {
  return '#OD' + String(id).padStart(7, '0');
}
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return date; // trả lại nguyên gốc nếu không phải date
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
async function selectCustomer(customer) {
  selectedCustomer.value = { ...customer };
  customerForm.value = { ...customer };
  activeTab.value = 'Chi tiết KH';

  // Hiện loading modal
  Swal.fire({
    title: 'Đang xử lý...',
    html: 'Vui lòng chờ trong giây lát...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await api.get(
        `/admin/CustomerManager/Order/${customer.customerId}/${orderCurrentPage.value}`,
        { withCredentials: true }
    );

    orders.value = response.data.content;
    orderTotalPages.value = response.data.totalPages;
    orderCurrentPage.value = response.data.number;

    // Tắt loading sau khi có dữ liệu
    Swal.close();
  } catch (error) {
    console.error("Lỗi khi lấy thông tin khách hàng:", error);

    // Hiện thông báo lỗi
    Swal.fire({
      icon: 'error',
      title: 'Thất bại',
      text: 'Không thể tải thông tin đơn hàng, vui lòng thử lại!'
    });
  }
}

const getOrdersByCustomer = async (page = 0) => {
  if (!selectedCustomer.value) return;

  try {
    const response = await api.get(
        `/admin/CustomerManager/Order/${selectedCustomer.value.customerId}/${page}`,
        { withCredentials: true }
    );
    orders.value = response.data.content;
    orderTotalPages.value = response.data.totalPages;
    orderCurrentPage.value = response.data.number;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
  }
};

function resetForm() {
  customerForm.value = {
    CustomerID: '',
    Fullname: '',
    ImageAvt: '',
    Phone: '',
    Gender: true,
    Address: '',
    AddressIdGHN: '',
    Dob: '',
    MembershipID: ''
  };
}

function deleteCustomer(customerForm) {
  Swal.fire({
    title: `Bạn có chắc muốn xóa tài khoản khách hàng #${customerForm.customerId}?`,
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: 'Hủy',
    confirmButtonText: 'Xác nhận',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Đang xử lý...',
        html: 'Vui lòng chờ trong giây lát...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      api.get('/admin/CustomerManager/deleteCustomer', {
        params: { idCustomer: customerForm.customerId },
        withCredentials: true
      })
          .then(response => {
            Swal.fire({
              icon: 'success',
              title: 'Xóa khách hàng thành công!',
              text: `Đã xóa tài khoản khách hàng #${customerForm.customerId}`,
              confirmButtonText: 'OK'
            }).then(() => {
              loadCustomers();
              selectedCustomer.value = null;
              activeTab.value = 'DSKH';
            });
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 403) {
                Swal.fire({
                  icon: 'error',
                  title: 'Không có quyền',
                  text: error.response.data || 'Bạn không có quyền thực hiện hành động này.',
                  confirmButtonText: 'OK'
                });
              } else if (error.response.status === 404) {
                Swal.fire({
                  icon: 'error',
                  title: 'Không tìm thấy',
                  text: error.response.data || 'Không tìm thấy khách hàng.',
                  confirmButtonText: 'OK'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Xóa khách hàng thất bại!',
                  text: 'Vui lòng thử lại hoặc liên hệ quản trị viên.',
                  confirmButtonText: 'OK'
                });
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: 'Không thể kết nối đến máy chủ.',
                confirmButtonText: 'OK'
              });
            }
            console.error("Lỗi khi xóa khách hàng:", error);
          });
    }
  });
}

//Khóa TK
function lockCustomer(customerForm) {
  Swal.fire({
    title: `Bạn có chắc muốn khóa tài khoản khách hàng #${customerForm.customerId}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      // Hiển thị loading
      Swal.fire({
        title: 'Đang xử lý...',
        html: 'Vui lòng chờ trong giây lát...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Gọi API
      api.get('/admin/CustomerManager/lockAccount', {
        params: { idCustomer: customerForm.customerId },
        withCredentials: true
      })
          .then(response => {
            Swal.fire({
              icon: 'success',
              title: 'Khóa tài khoản thành công!',
              text: `Đã khóa tài khoản khách hàng #${customerForm.customerId}`,
              confirmButtonText: 'OK'
            }).then(() => {
              loadCustomers();
              selectedCustomer.value = null;
              activeTab.value = 'DSKH';
            });
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 403) {
                Swal.fire({
                  icon: 'error',
                  title: 'Không có quyền',
                  text: error.response.data || 'Bạn không có quyền thực hiện hành động này.',
                  confirmButtonText: 'OK'
                });
              } else if (error.response.status === 404) {
                Swal.fire({
                  icon: 'error',
                  title: 'Không tìm thấy',
                  text: error.response.data || 'Không tìm thấy tài khoản khách hàng.',
                  confirmButtonText: 'OK'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Khóa tài khoản thất bại',
                  text: 'Vui lòng thử lại hoặc liên hệ quản trị viên.',
                  confirmButtonText: 'OK'
                });
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: 'Không thể kết nối đến máy chủ.',
                confirmButtonText: 'OK'
              });
            }
            console.error("Lỗi khi khóa tài khoản:", error);
          });
    }
  });
}

function openCustomer(customerForm) {
  Swal.fire({
    title: `Bạn có chắc muốn mở khóa khách hàng #${customerForm.customerId}?`,
    icon: 'warning',
    showCancelButton: true,
    cancelButtonText: 'Hủy',
    confirmButtonText: 'Xác nhận',
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Đang xử lý...',
        html: 'Vui lòng chờ trong giây lát...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      api.get('/admin/CustomerManager/openAccount', {
        params: { idCustomer: customerForm.customerId },
        withCredentials: true
      })
          .then(response => {
            Swal.fire({
              icon: 'success',
              title: 'Mở khóa khách hàng thành công!',
              text: `Tài khoản khách hàng #${customerForm.customerId} đã được mở khóa.`,
              confirmButtonText: 'OK'
            }).then(() => {
              loadCustomers();
              selectedCustomer.value = null;
              activeTab.value = 'DSKH';
            });
          })
          .catch(error => {
            if (error.response) {
              if (error.response.status === 403) {
                Swal.fire({
                  icon: 'error',
                  title: 'Không có quyền',
                  text: error.response.data || 'Bạn không có quyền thực hiện hành động này.',
                  confirmButtonText: 'OK'
                });
              } else if (error.response.status === 404) {
                Swal.fire({
                  icon: 'error',
                  title: 'Không tìm thấy',
                  text: error.response.data || 'Không tìm thấy tài khoản khách hàng.',
                  confirmButtonText: 'OK'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Mở khóa khách hàng thất bại!',
                  text: 'Vui lòng thử lại hoặc liên hệ quản trị viên.',
                  confirmButtonText: 'OK'
                });
              }
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Lỗi kết nối',
                text: 'Không thể kết nối đến máy chủ.',
                confirmButtonText: 'OK'
              });
            }
            console.error("Lỗi khi mở khóa:", error);
          });
    }
  });
}
// 👉 Hàm gọi API
const loadReviewStats = async () => {
  try {
    const res = await api.get('/admin/CustomerManager/avgReview', { withCredentials: true })
    stats.value = res.data
  } catch (err) {
    console.error("Lỗi khi load dữ liệu:", err)
  }
}

// 👉 Hàm mở modal + gọi API
const openReviewLevel = () => {
  showReviewLevel.value = true
  loadReviewStats()
}

// Gọi API lấy danh sách loại thành viên
async function loadMembershipOptions() {
  try {
    const res = await api.get('/admin/CustomerManager/memberships',{withCredentials: true})
    membershipOptions.value = res.data
  } catch (error) {
    console.error('Lỗi load memberships:', error)
  }
}

function viewReview(order) {
  selectedOrder.value = order;
  api.get(`/admin/CustomerManager/Products/${order.orderID}/${customerForm.value.customerId}`, { withCredentials: true })
      .then(response => {
        orderItems.value = response.data; // Gán dữ liệu trả về vào biến orderItems
        showReviewModal.value = true;     // Mở modal
      })
      .catch(error => {
        console.error("Lỗi khi lấy sản phẩm và đánh giá:", error);
      });
}

function initializeChart() {
  if (!chartCanvas.value) {
    console.error('Canvas chưa render')
    return
  }

  // Nếu đã có chart thì hủy đi để vẽ lại
  if (chartInstance) {
    chartInstance.destroy()
  }

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: chartData.value,
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}
async function fetchCustomerStats() {
  try {
    const response = await api.get('/admin/CustomerManager/CustomerChart', { withCredentials: true });

    // Gán dữ liệu vào chartData
    chartData.value.labels = response.data.labels;
    chartData.value.datasets[0].data = response.data.data;

    // Render chart
    initializeChart();
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu thống kê khách hàng:', error);
  }
}


const loadCustomers = async (page = 0) => {
  try {
    let membership = filterOption.value?.trim() || null;
    let search = idCustomer.value?.trim() || null;

    // Nếu chọn membership thì idCustomer = null
    if (membership) {
      search = null;
    }

    // Nếu nhập idCustomer thì membershipId = null
    if (search) {
      membership = null;
    }

    const response = await api.get(`/admin/CustomerManager/${page}`, {
      params: {
        membershipId: membership,
        idCustomer: search
      },
      withCredentials: true
    });
    customers.value = response.data.content;
    customerTotalPages.value = response.data.totalPages; // Thay totalPages bằng customerTotalPages
    customerCurrentPage.value = response.data.number; // Thay currentPage bằng customerCurrentPage
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
  }
};

onMounted(() => {
  loadCustomers(0);
});
watch(activeTab, async (newTab, oldTab) => {
  if (newTab === 'BIỂU ĐỒ' && oldTab !== 'BIỂU ĐỒ') {
    await nextTick()       // chờ DOM render xong
    await fetchCustomerStats() // gọi API và render chart
  }
})
onMounted(() => {
  loadMembershipOptions()
})
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

const props = defineProps({
  // Expected prop format: [countOf5Star, countOf4Star, ..., countOf1Star]
  ratingDistribution: {
    type: Array,
    default: () => [1111, 8, 45, 12, 100]
  }
})
// tổng số review

</script>

<template>
  <div class="customer-management">
    <h1>QUẢN LÝ KHÁCH HÀNG</h1>
    <div class="tabs">
      <button :class="{ active: activeTab === 'DSKH' }" @click="activeTab = 'DSKH'">
        DSKH
      </button>
      <button :class="{ active: activeTab === 'Chi tiết KH' }" @click="activeTab = 'Chi tiết KH'"
              :disabled="!selectedCustomer && activeTab !== 'Chi tiết KH'">
        Chi tiết KH
      </button>
      <button :class="{ active: activeTab === 'BIỂU ĐỒ' }" @click="activeTab = 'BIỂU ĐỒ'">
        BIỂU ĐỒ
      </button>
    </div>
    <div class="tab-content">
      <!-- Tab Danh sách khách hàng (giữ nguyên) -->
      <div v-if="activeTab === 'DSKH'" class="customer-list">
        <div class="filter-bar">
          <div>
            <!-- Button to open modal -->
            <button
                class="btn-reviewLevel"
                @click="openReviewLevel">
              Xem mức độ đánh giá
            </button>

            <!-- Modal -->
            <div v-if="showReviewLevel" class="custom-modal-overlay" @click.self="showReviewLevel = false">
              <div class="custom-modal">
                <h3>Mức độ đánh giá khách hàng của toàn hệ thống</h3>
                <div class="rating-stats">
                  <h2>{{ stats.avgRating.toFixed(1) }} ★</h2>
                  <div v-for="star in stats.starCounts"
                      :key="star.rating"
                      class="star-row" >
                    <span class="star-label">{{ star.rating }} sao</span>
                    <div class="bar">
                      <div
                          class="bar-fill"
                          :style="{ width: getPercentage(star.total) + '%' }"
                      ></div>
                    </div>
                    <span class="percent">{{ getPercentage(star.total).toFixed(1) }}%</span>
                  </div>
                </div>

                <button class="btn-close" @click="showReviewLevel = false"></button>
              </div>
            </div>
          </div>
          <select
              v-model="filterOption"
              @change="
                        idCustomer = '';
                        loadCustomers(0);
                      "
              class="filter-select"
          >
            <option value="">Tất cả</option>
            <option
                v-for="member in membershipOptions"
                :key="member.code"
                :value="member.code"
            >
              {{ member.name }}
            </option>
          </select>

          <input type="text" v-model="idCustomer" @input="
              filterOption = ''; // reset select về Tất cả
              loadCustomers(0);" placeholder="Nhập mã khách hàng" class="search-input" />
        </div>

        <div class="customer-container">
          <div class="table-wrapper">
            <table class="customer-table">
              <thead>
              <tr>
                <th>Mã KH</th>
                <th>Họ tên</th>
                <th>Điện thoại</th>
                <th>Giới tính</th>
                <th>Địa chỉ</th>
                <th>Ngày sinh</th>
                <th>Hạng thành viên</th>
                <th>Thao tác</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="customer in customers" :key="customer.CustomerID">
                <td>{{ customer.customerId }}</td>
                <td>{{ customer.fullName }}</td>
                <td>{{ customer.phone }}</td>
                <td>{{ customer.gender ? 'Nam' : 'Nữ' }}</td>
                <td>{{ customer.address }}</td>
                <td>{{ formatDate(customer.dob) }}</td>
                <td>{{ customer.membership }}</td>
                <td>
                  <button @click="selectCustomer(customer)" class="view-btn">Xem chi tiết</button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination đặt ngoài -->
          <div class="pagination">
            <button @click="loadCustomers(customerCurrentPage - 1)"
                    :disabled="customerCurrentPage === 0">Trước</button>
            <span>Trang {{ customerCurrentPage + 1 }} / {{ customerTotalPages }}</span>
            <button @click="loadCustomers(customerCurrentPage + 1)"
                    :disabled="customerCurrentPage + 1 >= customerTotalPages">Sau</button>
          </div>
        </div>

      </div>

      <!-- Tab Chi tiết khách hàng (giữ nguyên) -->
      <div v-if="activeTab === 'Chi tiết KH'" class="customer-detail">
        <div class="detail-container">
          <div class="customer-form">
            <div class="form-group">
              <label>Ảnh đại diện:</label>
              <img v-if="customerForm.imageAvt"
                   :src="'http://localhost:8989/uploads/' + customerForm.imageAvt" alt="Avt"
                   class="Avt-img" style="height: 250px; width: 300px;">
              <span v-else>Chưa có</span>

            </div>
            <div class="form-group">
              <label>Mã KH:</label>
              <input v-model="customerForm.customerId" type="text" disabled>
            </div>
            <div class="form-group">
              <label>Họ tên:</label>
              <input v-model="customerForm.fullName" type="text" disabled>
            </div>

            <div class="form-group">
              <label>Điện thoại:</label>
              <input v-model="customerForm.phone" type="text" disabled>
            </div>
            <div class="form-group">
              <label>Giới tính:</label>
              <select v-model="customerForm.gender" disabled>
                <option :value="true">Nam</option>
                <option :value="false">Nữ</option>
              </select>
            </div>
            <div class="form-group">
              <label>Địa chỉ:</label>
              <textarea
                  v-model="customerForm.address"
                  class="group"
                  rows="3"
                  disabled>
              </textarea>
            </div>
            <div class="form-group">
              <label>Mã địa chỉ GHN:</label>
              <input v-model="customerForm.addressIdGHN" type="text" disabled>
            </div>
            <div class="form-group">
              <label>Hạng thành viên:</label>
              <input v-model="customerForm.membership" type="text" disabled>
            </div>
            <div class="form-group">
              <label>Ngày sinh:</label>
              <input v-model="customerForm.dob" type="date" disabled>
            </div>
            <div class="form-group">
              <label>Ngày tham gia:</label>
              <input v-model="customerForm.createAt" type="date" disabled>
            </div>
            <div class="form-group">
              <label>Ngày cập nhật:</label>
              <input v-model="customerForm.updateAt" type="date" disabled>
            </div>
            <div class="form-group">
              <label>Trạng thái:</label>
              <input :value="customerForm.status ? 'Còn hoạt động' : 'Dừng hoạt động'" type="text"
                     disabled>
            </div>

            <div class="action-buttons">
              <button v-if="selectedCustomer" @click="deleteCustomer(customerForm)"
                      class="delete-btn">Xóa</button>
              <button v-if="customerForm.status === true" @click="lockCustomer(customerForm)"
                      class="lock-btn">Khóa</button>
              <button v-if="customerForm.status === false" @click="openCustomer(customerForm)"
                      class="unlock-btn">Mở</button>
              <button @click="activeTab = 'DSKH'; resetForm()" class="back-btn">Quay lại</button>
            </div>
          </div>
          <div class="order-container" v-if="selectedCustomer">
            <div class="order-wrapper">
              <table class="order-table">
                <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Ngày đặt</th>
                  <th>Trạng thái</th>
                  <th>Địa chỉ</th>
                  <th>Cách thức</th>
                  <th>NV đảm nhận</th>
                  <th>Voucher</th>
                  <th>Mã shop</th>
                  <th>Tổng đơn</th>
                  <th>Mã đơn GHN</th>
                  <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="order in orders" :key="order.orderID">
                  <td>{{ formatOrderID(order.orderID) }}</td>
                  <td>{{ formatDate(order.orderDate) }}</td>
                  <td>{{ order.status }}</td>
                  <td>{{ order.shippingAddress }}</td>
                  <td>{{ order.isOnline ? 'Trực tuyến' : 'Tại cửa hàng' }}</td>
                  <td>{{ order.staffId }}</td>
                  <td>{{ order.voucherId }}</td>
                  <td>{{ order.facilityId }}</td>
                  <td>{{ formatCurrency(order.amount) }}</td>
                  <td>{{ order.shippingCode }}</td>
                  <td>
                    <button @click="viewReview(order)" class="view-review-btn">Xem đánh giá</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination riêng cho đơn hàng -->
            <div class="order-pagination" v-if="orderTotalPages > 1">
              <button
                  :disabled="orderCurrentPage === 0"
                  @click="getOrdersByCustomer(orderCurrentPage - 1)">
                ⬅ Trước
              </button>
              <span>Trang {{ orderCurrentPage + 1 }} / {{ orderTotalPages }}</span>
              <button
                  :disabled="orderCurrentPage === orderTotalPages - 1"
                  @click="getOrdersByCustomer(orderCurrentPage + 1)">
                Sau ➡
              </button>
            </div>

          </div>



        </div>
      </div>

      <!-- Tab Biểu đồ (giữ nguyên) -->
      <div v-if="activeTab === 'BIỂU ĐỒ'" class="chart-container">
        <h2>THỐNG KÊ KHÁCH HÀNG THEO TỈNH/THÀNH</h2>
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <!-- Modal đánh giá sản phẩm -->
    <div v-if="showReviewModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showReviewModal = false">&times;</span>
        <h2>ĐÁNH GIÁ SẢN PHẨM CỦA ĐƠN HÀNG {{ selectedOrder?.OrderID }}</h2>

        <table class="review-table">
          <thead>
          <tr>
            <th>Tên sản phẩm</th>
            <th>Màu</th>
            <th>Số lượng</th>
            <th>Ảnh sản phẩm</th>
            <th>Gía lúc mua</th>
            <th>Đánh giá</th>
            <th>Nội dung</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in orderItems" :key="item.productID">
            <td>{{ item.productName }}</td>
            <td>{{ item.color }}</td>
            <td>{{ item.quantity }}</td>
            <td>
              <img v-if="item && item.imageUrl"
                   :src="'http://localhost:8989/uploads/' + item.imageUrl" alt="Ảnh sản phẩm"
                   class="product-img" style="height: 150px; width: 150px;">
              <span v-else>Chưa có</span>
            </td>

            <td>{{ formatCurrency(item.unitPrice)}}</td>
            <td>
                                <span v-if="item.rating != null">
                                    <span v-for="n in 5" :key="n">
                                        <i class="fa-star"
                                           :class="n <= item.rating ? 'fas text-yellow-500' : 'far text-gray-300'"></i>
                                    </span>
                                </span>
              <span v-else>Chưa có</span>
            </td>
            <td>{{ item.content ? item.content : 'Chưa có' }} </td>
          </tr>
          </tbody>
        </table>
        <button @click="showReviewModal = false" class="close-modal-btn">Đóng</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.customer-management {
  font-family: Arial, sans-serif;
  max-width: 95%;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

h1 {
  color: #0066cc;
  text-align: left;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 2px solid #0066cc;
}

.tabs button {
  padding: 10px 20px;
  background-color: #f1f1f1;
  border: none;
  cursor: pointer;
  font-weight: bold;
  margin-right: 5px;
  border-radius: 5px 5px 0 0;
}

.tabs button.active {
  background-color: #0066cc;
  color: white;
}

.tabs button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tabs button:hover:not(.active):not(:disabled) {
  background-color: #ddd;
}

.filter-bar {
  display: flex;
  justify-content: right;
  margin-bottom: 15px;
}

.filter-select,
.search-input {
  padding: 8px;
  margin-left: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-input {
  width: 300px;
}


.view-btn {
  background-color: #0066cc;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn:hover {
  background-color: #0052a3;
}

.customer-detail {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 5px;
  border: 1px solid #ddd;
}

.detail-container {
  display: flex;
  gap: 20px;
}

.customer-form {
  flex: 1;
  min-width: 500px;
}

.order-section {

  min-width: 500px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: inline-block;
  width: 150px;
  font-weight: bold;
}

.form-group input, textarea,
.form-group select {
  padding: 8px;
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.action-buttons {
  margin-top: 20px;
}

.action-buttons button {
  padding: 8px 15px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.add-btn {
  background-color: #28a745;
  color: white;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.lock-btn {
  background-color: #ffc107;
  color: black;
}

.unlock-btn {
  background-color: #17a2b8;
  color: white;
}

.back-btn {
  background-color: #6c757d;
  color: white;
}

.chart-container {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.chart-container h2 {
  color: #0066cc;
  text-align: center;
  margin-bottom: 20px;
}

.order-wrapper {
  width: 100%;
  height: 900px;        /* cố định chiều cao */
  overflow-y: auto;     /* cuộn dọc khi nhiều đơn */
  overflow-x: auto;     /* cuộn ngang khi nhiều cột */
  border-radius: 8px;
  background: white;  /* khác màu với bảng khách hàng */
  padding: 5px;
}
.order-table {

  width: 100%;
  border-collapse: collapse; /* gộp viền cho gọn */
  font-size: 14px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #ccc; /* viền ngoài */
}

.order-table th,
.order-table td {

  border: 1px solid #ddd; /* viền từng ô */
  padding: 8px 10px;
  text-align: left;
}

.order-table th {
  font-weight: bold;
}


.rating {
  color: #ccc;
}

.rating .filled {
  color: #ffc107;
}

/* Style cho nút xem đánh giá (mới thêm) */
.view-review-btn {
  padding: 4px 10px;
  font-size: 13px;
  color: white;
  border: 1px solid #bbb;
  background: #0052a3;
  border-radius: 4px;
  cursor: pointer;

}

.view-review-btn:hover {
  background: #0a58ca;
}
.order-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: center; /* căn phải */
  gap: 10px;
}
.order-pagination button {
  background: #ddd;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.order-pagination button:hover:not(:disabled) {
  background: #bbb;
}

.order-pagination button:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  color: #aaa;
}

.order-pagination span {
  align-self: center;
  font-weight: 500;
  color: #444;
}

/* Style cho modal (mới thêm, tương tự modal cũ) */
.modal {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 1200px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.close {
  position: absolute;
  right: 20px;
  top: 10px;
  font-size: 28px;
  font-weight: bold;
  color: #aaa;
  cursor: pointer;
}

.close:hover {
  color: #333;
}

.close-modal-btn {
  display: block;
  margin: 20px auto 0;
  padding: 8px 20px;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-modal-btn:hover {
  background-color: #0052a3;
}

.review-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #fff;
  font-family: Arial, sans-serif;
}

.review-table thead {
  background-color: #f8f8f8;
}

.review-table th,
.review-table td {
  padding: 10px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.review-table th {
  font-weight: bold;
  color: #333;
}

.review-table tr:hover {
  background-color: #f5f5f5;
}

/* Ngôi sao */
.fa-star {
  margin-right: 2px;
  font-size: 16px;
}

.text-yellow-500 {
  color: #ffc107;
  /* vàng */
}

.text-gray-300 {
  color: #d1d5db;
  /* xám */
}

.btn-reviewLevel {
  background-color: #0066cc;
  /* Màu nền xanh */
  color: white;
  /* Màu chữ trắng */
  border: none;
  /* Xóa viền */
  padding: 10px 20px;
  /* Khoảng cách bên trong */
  border-radius: 8px;
  /* Bo góc */
  font-size: 16px;
  /* Cỡ chữ */
  font-weight: 500;
  /* Độ đậm chữ */
  cursor: pointer;
  /* Con trỏ khi hover */
  transition: background-color 0.3s ease, transform 0.2s ease;
}


.btn-reviewLevel:active {
  background-color: #004488;
  /* Màu khi nhấn */
  transform: translateY(0);
  /* Trở lại bình thường */
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.custom-modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  min-width: 500px;
  max-width: 500px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  position: relative;
  /* để nút close bám theo modal */
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
  color: white;
  padding: 6px 10px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  background-color: #94a3b8;
}

.btn-reviewLevel {
  background-color: #0066cc;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-reviewLevel:hover {
  background-color: #0055aa;
}
.rating-stats {
  padding: 10px;
  width: 450px;
}

.star-row {
  display: flex;
  align-items: center;
  margin: 6px 0;
}

.star-label {
  width: 50px;
}

.bar {
  flex: 1;
  height: 10px;
  background: #eee;
  margin: 0 10px;
  border-radius: 5px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: black;
}

.percent {
  width: 50px;
  text-align: right;
}
.customer-container {
  width: 100%;            /* full chiều ngang */
  /* max-width: 1200px gioi han */
  margin: 0 auto;
}

.table-wrapper {
  width: 100%;
  height: 700px;          /* cố định chiều cao */
  overflow-y: auto;       /* scroll dọc */
  overflow-x: auto;       /* scroll ngang nếu bảng rộng */
  border: 1px solid #ddd;
  border-radius: 6px;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}

.customer-table th,
.customer-table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
}

.pagination button {
  background-color: #f0f0f0; /* xám nhạt */
  color: #333; /* chữ đậm vừa */
  border: 1px solid #ccc; /* viền xám */
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;
}

.pagination button:hover:not(:disabled) {
  background-color: #e0e0e0; /* đậm hơn chút khi hover */
}

.pagination button:disabled {
  background-color: #fafafa; /* gần trắng khi disable */
  color: #aaa;
  cursor: not-allowed;
}

.pagination span {
  font-weight: 500;
  color: #333;
}
</style>