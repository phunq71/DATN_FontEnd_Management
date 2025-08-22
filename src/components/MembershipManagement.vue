<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import Swal from 'sweetalert2'
import { Chart, registerables } from 'chart.js'

// Đăng ký components cho Chart.js
Chart.register(...registerables)

// Dữ liệu
const memberships = ref([])
const formData = ref({
  id: '',
  rank: '',
  description: '',
  minPoint: 0
})
const isEditing = ref(false)
const showModal = ref(false)
const pieChartData = ref([])
let pieChart = null

// Lấy tất cả membership
// const fetchMemberships = async () => {
//   try {
//     const response = await axios.get('/admin/membership/getAll')
//     memberships.value = response.data
//   } catch (error) {
//     Swal.fire({
//       icon: 'error',
//       title: 'Lỗi!',
//       text: 'Không thể tải dữ liệu membership'
//     })
//   }
// }

// Lấy dữ liệu cho biểu đồ
const fetchPieChartData = async () => {
  try {
    const response = await api.get('/admin/membership/pie', {withCredentials: true})
    pieChartData.value = response.data
    renderPieChart()
  } catch (error) {
    console.error('Không thể tải dữ liệu biểu đồ', error)
  }
}

// Vẽ biểu đồ tròn
const renderPieChart = () => {
  const ctx = document.getElementById('membershipPieChart')

  // Hủy biểu đồ cũ nếu tồn tại
  if (pieChart) {
    pieChart.destroy()
  }

  if (ctx && pieChartData.value.length > 0) {
    const backgroundColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#8ac6d1', '#ff6b6b'
    ]

    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: pieChartData.value.map(item => item.rank),
        datasets: [{
          data: pieChartData.value.map(item => item.quantity),
          backgroundColor: backgroundColors.slice(0, pieChartData.value.length),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'Phân bố Membership'
          }
        }
      }
    })
  }
}

// Lấy tất cả membership
const fetchMemberships = async () => {
  try {
    const response = await api.get('/admin/membership/getAll', {withCredentials: true})
    memberships.value = response.data
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể tải dữ liệu membership'
    })
  }
}

// Tạo mới membership
const createMembership = async () => {
  try {
    await api.post('/admin/membership/create', {
      rank: formData.value.rank,
      description: formData.value.description,
      minPoint: formData.value.minPoint
    }, {withCredentials: true})

    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã tạo membership mới'
    })

    closeModal()
    await fetchMemberships()
    await fetchPieChartData() // Cập nhật lại biểu đồ
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể tạo membership'
    })
  }
}

// Cập nhật membership
const updateMembership = async () => {
  try {
    await api.put('/admin/membership/update', {
      id: formData.value.id,
      rank: formData.value.rank,
      description: formData.value.description,
      minPoint: formData.value.minPoint
    }, {withCredentials: true})

    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã cập nhật membership'
    })

    closeModal()
    await fetchMemberships()
    await fetchPieChartData() // Cập nhật lại biểu đồ
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể cập nhật membership'
    })
  }
}

// Xóa membership
const deleteMembership = async (id) => {
  const result = await Swal.fire({
    title: 'Bạn có chắc muốn xóa hạng này?',
    text: "Sau khi xóa, tất cả khách hàng thuộc hạng này sẽ không còn hạng nữa. Hành động này không thể hoàn tác!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  })


  if (result.isConfirmed) {
    try {
      await api.delete(`/admin/membership/delete?membershipId=${id}`, {withCredentials: true})

      Swal.fire({
        icon: 'success',
        title: 'Đã xóa!',
        text: 'Membership đã được xóa.'
      })


      await fetchMemberships()
      await fetchPieChartData() // Cập nhật lại biểu đồ
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể xóa membership'
      })
    }
  }
}


// Mở modal
const openModal = (membership = null) => {
  if (membership) {
    formData.value = { ...membership }
    isEditing.value = true
  } else {
    resetForm()
  }
  showModal.value = true
}

// Đóng modal
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// Chọn membership để chỉnh sửa
const selectMembership = (membership) => {
  openModal(membership)
}

// Reset form
const resetForm = () => {
  formData.value = {
    id: '',
    rank: '',
    description: '',
    minPoint: 0
  }
  isEditing.value = false
}

// Xử lý submit form
const handleSubmit = () => {
  if (isEditing.value) {
    updateMembership()
  } else {
    createMembership()
  }
}

// Load dữ liệu khi component được mount
onMounted(() => {
  fetchMemberships()
  fetchPieChartData()
})

// Theo dõi thay đổi của modal để render lại biểu đồ
watch(showModal, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      renderPieChart()
    })
  }
})
</script>

<template>
  <div class="membership-container">
    <h2 class="text-center mb-4">Quản lý Membership</h2>

    <div class="row">
      <!-- Biểu đồ bên trái -->
      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <span>Phân bố Membership</span>
            </div>
          </div>
          <div class="card-body">
            <canvas id="membershipPieChart" width="300" height="300"></canvas>
            <div v-if="pieChartData.length === 0" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Đang tải dữ liệu...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Table bên phải -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            Danh sách Membership
            <button class="btn btn-sm btn-primary" @click="openModal()">
              <i class="fas fa-plus"></i> Thêm mới
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>Rank</th>
                  <th>Điểm tối thiểu</th>
                  <th>Mô tả</th>
                  <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in memberships" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.rank }}</td>
                  <td>{{ item.minPoint.toLocaleString() }}</td>
                  <td>{{ item.description }}</td>
                  <td>
                    <button
                        class="btn btn-sm btn-outline-primary me-1"
                        @click="selectMembership(item)"
                    >
                      Sửa
                    </button>
                    <button
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteMembership(item.id)"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
                <tr v-if="memberships.length === 0">
                  <td colspan="5" class="text-center">Không có dữ liệu</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal fade" :class="{ 'show': showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? 'Cập nhật Membership' : 'Thêm Membership mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">ID</label>
                <input
                    type="text"
                    class="form-control"
                    :value="formData.id"
                    disabled
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Rank <span class="text-danger">*</span></label>
                <input
                    type="text"
                    class="form-control"
                    v-model="formData.rank"
                    required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Điểm tối thiểu <span class="text-danger">*</span></label>
                <input
                    type="number"
                    class="form-control"
                    v-model.number="formData.minPoint"
                    min="0"
                    required
                >
                <div class="form-text">Số điểm tích lũy tối thiểu để đạt được hạng này</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea
                    class="form-control"
                    v-model="formData.description"
                    rows="3"
                ></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="handleSubmit">
              {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade" :class="{ 'show': showModal }" :style="{ display: showModal ? 'block' : 'none' }"></div>
  </div>
</template>

<style scoped>
.membership-container {
  padding: 20px;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 20px;
}

.card-header {
  background-color: #f8f9fa;
  font-weight: 500;
}

.table th {
  background-color: #f8f9fa;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.form-text {
  font-size: 0.85rem;
  color: #6c757d;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Animation for modal */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, -50px);
}

.modal.show .modal-dialog {
  transform: none;
}
</style>