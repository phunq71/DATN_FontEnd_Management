<template>
  <div class="inventory-container">
    <!-- Header -->
    <div class="header">
      <h1>Quản lý phiếu nhập xuất kho</h1>
      <div class="user-info">

      </div>
    </div>

    <!-- Navigation and Filters -->
    <div class="nav-filters">
      <div class="filter-group">
        <label>Khu vực:</label>
        <select v-model="selectedArea" @change="loadShops">
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Cửa hàng:</label>
        <select v-model="selectedShop" :disabled="!selectedArea">
          <option value="" v-if="user.role!=='STAFF'">Không chọn shop</option>
          <option v-for="shop in filteredShops" :key="shop.id" :value="shop.id">
            {{ shop.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Ngày:</label>
        <button @click="changeDate(-1)">-</button>
        <input type="date" v-model="selectedDate"/>
        <button @click="changeDate(1)">+</button>
      </div>

      <div class="filter-group">
        <label>Loại phiếu:</label>
        <select v-model="filterType">
          <option value="">Tất cả</option>
          <option value="N">Nhập kho</option>
          <option value="X">Xuất kho</option>
        </select>
      </div>


    </div>
    <div class="btn-container">
      <button class="create-btn" @click="showCreateModal = true" v-if="canCreateSlip">
        Tạo phiếu mới
      </button>
      <button class="approval-btn" @click="openApprovalModal">
        <i class="fa-solid fa-bell"></i>
        <span class="notification-badge" v-if="badgeCount>0">{{ badgeCount }}</span>
      </button>
    </div>
    <!-- Slips Table -->
    <div class="table-container">

      <table>
        <thead>
        <tr>
          <th>Mã phiếu</th>
          <th>Loại</th>
          <th>Từ</th>
          <th>Đến</th>
          <th>Ngày tạo</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="slip in slips" :key="slip.id">
          <td>{{ slip.id }}</td>
          <td :class="slip.type ? 'export' : 'import'">
            {{ slip.type ? "Nhập" : "Xuất" }}
          </td>
          <td :style="slip.fromName === null? 'color: gray; font-size: 12px;': ''">{{ slip.fromName === null ? 'Không có' : slip.fromName }}</td>
          <td :style="slip.toName === null? 'color: gray; font-size: 12px;': ''">{{ slip.toName === null ? 'Không có' : slip.toName }}</td>
          <td>{{ formatDate(slip.createDate) }}</td>
          <td :class="getStatusClass(slip.status)">
            {{ translateStatus(slip.status) }}
          </td>
          <td>
            <button @click="viewDetails(slip)" class="action-btn view">Xem</button>
            <button
                v-if="checkApproval(slip)"
                @click="approveSlip(slip.id, true)"
                class="action-btn approve"
            >
              Duyệt
            </button>
            <button
                v-if="checkApproval(slip)"
                @click="approveSlip(slip.id, false)"
                class="action-btn reject"
            >
              Từ chối
            </button>
            <button
                v-if="canComplete(slip)"
                @click="completeSlip(slip)"
                class="action-btn complete"
            >
              Hoàn thành
            </button>
          </td>
        </tr>
        <!-- Hiển thị khi không có dữ liệu -->
        <tr v-if="slips.length === 0">
          <td colspan="7" class="no-data">Không tìm thấy bất kỳ phiếu nào</td>
        </tr>
        <!-- Thêm các dòng trống nếu cần để giữ chiều cao cố định -->
        <template v-if="slips.length > 0 && slips.length < 6">
          <tr v-for="i in (6 - slips.length)" :key="'empty-' + i">
            <td colspan="7">&nbsp;</td>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">Trước</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">Sau</button>
    </div>

    <!-- Create Slip Modal -->

    <CreateInventorySlip
        v-if="showCreateModal"
        v-model:show-create-modal="showCreateModal"
        v-model:user="user"
        @slipCreated="handleSlipCreated"
    />
    <teleport to="body">
      <CompleteInvSlip
        v-if="showCompleteModal"
        v-model:show-complete-modal="showCompleteModal"
        :slip="invSlip_complete"
        @slipCompleted="handleSlipCompleted"
      />
    </teleport>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="modal" @click="closeApprovalModal" >
      <div class="modal-content" @click.stop>
        <span class="close" @click="closeApprovalModal">&times;</span>
        <h2>Phiếu cần duyệt </h2>

        <div class="approval-list">
          <div v-for="slip in pendingSlips" :key="slip.id" class="approval-item">
            <div class="slip-info">
              <span><strong>Mã phiếu:</strong> {{ slip.id }}</span>
              <span><strong>Loại:</strong> {{ slip.type ? "Phiếu nhập" : "Phiếu xuất" }}</span>
              <span><strong>Từ:</strong> {{ slip.fromName }}</span>
              <span><strong>Đến:</strong> {{ slip.toName }}</span>
              <span><strong>Nhân viên:</strong> {{ slip.staffName }}</span>
              <span><strong>Ngày tạo:</strong> {{ formatDate(slip.createDate) }}</span>
            </div>
            <div class="approval-actions">
              <button @click="viewDetails(slip)" class="action-btn view">Xem</button>
              <button
                  v-if="checkApproval(slip)"
                  @click="approveSlip(slip.id, true)"
                  class="action-btn approve"
              >
                Duyệt
              </button>
              <button
                  v-if="checkApproval(slip)"
                  @click="approveSlip(slip.id, false)"
                  class="action-btn reject"
              >
                Từ chối
              </button>
              <button
                  v-if="canComplete(slip)"
                  @click="completeSlip(slip)"
                  class="action-btn complete"
              >
                Hoàn thành
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Details Modal -->
    <div v-if="showDetailsModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeDetailsModal">&times;</span>
        <h2>Chi tiết phiếu #{{ selectedSlip.id }}</h2>

        <div class="slip-details">
          <div><strong>Loại:</strong> {{ selectedSlip.type ? "Nhập" : "Xuất" }}</div>
          <div><strong>Trạng thái:</strong> {{ translateStatus(selectedSlip.status) }}</div>
          <div><strong>Từ:</strong> {{ selectedSlip.fromName }}</div>
          <div><strong>Đến:</strong> {{ selectedSlip.toName }}</div>
          <div><strong>Nhân viên:</strong> {{ selectedSlip.staffName }}</div>
          <div><strong>Người duyệt:</strong> {{ selectedSlip.approverName || "-" }}</div>
          <div><strong>Ngày tạo:</strong> {{ formatDate(selectedSlip.createDate) }}</div>
          <div>
            <strong>Ghi chú: </strong>
            <span style="white-space: pre-wrap;">{{ formatNote(selectedSlip.note) }}</span>
          </div>
        </div>

        <h3>Chi tiết sản phẩm</h3>
        <table class="details-table">
          <thead>
          <tr>
            <th>Mẫu</th>
            <th>Số lượng</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(detail, index) in selectedSlip.details" :key="index">
            <td>{{ getItemName(detail.itemName) }}</td>
            <td>{{ detail.quantity }}</td>
          </tr>
          </tbody>
        </table>

        <div class="details-actions">
          <button @click="closeDetailsModal" class="close-btn">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import CreateInventorySlip from "./CreateInventorySlip.vue";
import CompleteInvSlip from "./CompleteInvSlip.vue";


const formatNote = (note) => {
  if (!note) return "-";
  return note.replace("[Lý do từ chối]", "\n[Lý do từ chối]");
};


// Mock data - in a real app, this would come from API calls
const areas = ref([
])

const shops = ref([
])

const items = ref([
])

// Mock user data - in a real app, this would come from auth system
const user = ref({
  id: 'user1',
  name: 'Nguyễn Văn A',
  role: 'AREA', // STAFF, STOCK, AREA, ADMIN
  facilityId: '',
})

// Mock inventory slips data
const slips = ref([

]);

const pendingSlips = ref([]);

// Filter and pagination state
const selectedArea = ref('')
const selectedShop = ref('')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const filterType = ref('')
const currentPage = ref(1)
const badgeCount = ref(0);

// Modal states
const showCreateModal = ref(false)
const showApprovalModal = ref(false)
const showDetailsModal = ref(false)
const showCompleteModal = ref(false)
const selectedSlip = ref(null)

//Sự kiện từ component con
const handleSlipCreated = async (slip) => {
  console.log("Phiếu vừa tạo:", slip);
  showCreateModal.value = false; // đóng modal
  await fetchDataSlips(); // hoặc gọi API load lại danh sách phiếu
};

const handleSlipCompleted = async (slip) =>{
  console.log("Phiếu vừa tạo:", slip);
  showCompleteModal.value = false; // đóng modal
  await fetchDataSlips(); // hoặc gọi API load lại danh sách phiếu
  await fetchDataPendingSlip();
}

// Computed properties
const filteredShops = computed(() => {
  if (!selectedArea.value) return []
  return shops.value.filter(shop => shop.areaId === selectedArea.value)
})


const changeDate =(days)=> {
  const date = new Date(selectedDate.value);
  date.setDate(date.getDate() + days);
  selectedDate.value = date.toISOString().split('T')[0];
}


const totalPages = ref(0);

const canCreateSlip = computed(() => {
  return ['STAFF', 'STOCK'].includes(user.value.role)
})


const slipDestinations = computed(() => {
  if (user.value.role === 'STAFF') {
    return [
      {id: `warehouse${user.value.areaId.slice(-1)}`, name: 'Kho khu vực'}
    ]
  } else if (user.value.role === 'STOCK') {
    return shops.value.filter(shop => shop.areaId === user.value.areaId)
  }
  return []
})

// Methods
const loadShops = () => {
  selectedShop.value = ''
}


const getItemName = (id) => {
  return items.value.find(item => item.id === id)?.name || id
}

const translateStatus = (status) => {
  const statusMap = {
    'PENDING': 'Chờ duyệt',
    'APPROVED': 'Đã duyệt',
    'REJECTED': 'Từ chối',
    'DONE': 'Hoàn thành'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  return status.toLowerCase()
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}



const canComplete = (slip) => {
  if(slip.status !== 'APPROVED') return false;
  if(user.value.role === 'STOCK' && slip.to=== user.value.facilityId) return true;
  if(user.value.role === 'STAFF' && user.value.facilityId) return true;
  return false
}


const closeCreateModal = () => {
  showCreateModal.value = false
}

const openApprovalModal = async () => {
  showApprovalModal.value = true
  await fetchDataPendingSlip();
}

const closeApprovalModal = () => {
  showApprovalModal.value = false
}

const viewDetails = (slip) => {
  selectedSlip.value = slip
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
}


const approveSlip = async (slipId, approve) => {
  try {
    if (approve === false) {
      const {value: reason} = await Swal.fire({
        title: 'Nhập lý do từ chối',
        input: 'textarea',
        inputPlaceholder: 'Nhập lý do (tối đa 100 ký tự)',
        inputAttributes: {
          maxlength: 100
        },
        showCancelButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#000000',
        cancelButtonText: 'Hủy',
        didOpen: () => {
          const textarea = Swal.getInput();
          const counter = document.createElement('div');
          counter.style.textAlign = 'right';
          counter.style.fontSize = '12px';
          counter.style.color = '#666';
          counter.style.marginTop = '4px';
          counter.innerText = `0/100`;

          // Thêm counter ngay dưới textarea
          textarea.parentNode.appendChild(counter);

          textarea.addEventListener('input', () => {
            counter.innerText = `${textarea.value.length}/100`;
          });
        },
        preConfirm: (value) => {
          if (!value.trim()) {
            Swal.showValidationMessage('Vui lòng nhập lý do từ chối');
            return false;
          }
          return value.trim();
        }
      });

      if (!reason) return;
      const response = await api.get("/admin/inventorySlip/approve", {
        withCredentials: true,
        params: {
          invSlipId: slipId,
          isApproved: approve,
          reason: reason
        }
      });

      if (response.status === 200) {
        await fetchDataPendingSlip();
        await fetchDataSlips();
      }
    } else {
      const response = await api.get("/admin/inventorySlip/approve", {
        withCredentials: true,
        params: {
          invSlipId: slipId,
          isApproved: approve,
          reason: ''
        }
      });

      if (response.status === 200) {
        await fetchDataPendingSlip();
        await fetchDataSlips();
      } else {
        // Hiển thị lỗi từ BE (message trong response)
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: response.data.message || 'Có lỗi xảy ra khi duyệt phiếu.',
        });
      }
    }
  }catch (e) {
    Swal.fire({
      icon: 'error',
      title: 'Có lỗi xảy ra khi duyệt phiếu.',
      text: 'Vui lòng kiểm tra số lượng các sản phẩm trong phiếu',
      confirmButtonColor: 'black'
    });
  }
};

const invSlip_complete = ref({});

const completeSlip = (slip) => {
  showCompleteModal.value=true
  invSlip_complete.value =slip;
}

const checkApproval = (slip) => {
  if (slip.status !== 'PENDING') return false;

  const from = slip.from?.charAt(0);
  const to = slip.to?.charAt(0);

  // W -> W hoặc W -> null  => ADMIN
  if (from === 'W' && (to === 'W' || slip.to === null) && user.value.role === 'ADMIN') {
    return true;
  }

  // W -> K, K -> null, S -> null => AREA
  if (
      (from === 'W' && to === 'K') ||
      (from === 'K' && slip.to === null) ||
      (from === 'S' && slip.to === null)
  ) {
    if (user.value.role === 'AREA') {
      return true;
    }
  }

  return false;
}


// Watchers
watch([selectedArea, selectedShop, selectedDate, filterType], () => {
  currentPage.value = 1
})

// Initialize
onMounted(async () => {
  // In a real app, you would fetch data from APIs here
  await fetchDataArea();
  await fetchDataSlips();
  selectedArea.value = areas.value[0].id;
  if (user.value.role === "STAFF") {
    selectedShop.value = shops.value[0].id;
  }

  setupWatcher();

  // if (user.value.role === 'STAFF') {
  //   selectedArea.value = user.value.areaId
  //   selectedShop.value = user.value.shopId
  // } else if (user.value.role === 'STOCK' || user.value.role === 'AREA') {
  //   selectedArea.value = user.value.areaId
  // }
});
const setupWatcher = () => {
  watch([selectedShop, selectedArea, selectedDate, currentPage, filterType], async () => {
    await fetchDataSlips();
  });
}


const fetchDataArea = async () => {
  const response = await api.get("/admin/inventorySlip/getAreas", {withCredentials: true});
  console.log("area nè👉👉", response.data);
  areas.value = [...new Map(response.data.areas.map(item =>
      [item.areaID, {id: item.areaID, name: item.areaName}]
  )).values()]

  badgeCount.value= response.data.badgeCount;

  shops.value = response.data.areas.map(shop => ({
    id: shop.shopID,
    name: shop.shopName,
    areaId: shop.areaID
  }))

  // Tự động chọn khu vực đầu tiên nếu chưa chọn
  if (areas.value.length > 0 && !selectedArea.value) {
    selectedArea.value = areas.value[0].id
  }

  user.value.role = response.data.role;
  user.value.facilityId = response.data.facilityIDOfAccount;
}

const fetchDataSlips = async () => {
  const params = {
    pageN: currentPage.value - 1,
    facilityId: selectedShop.value !== "" ? selectedShop.value : selectedArea.value,
    date: selectedDate.value
  };

  if (filterType.value === "N") params.type = true
  else if (filterType.value === "X") params.type = false
  console.log("params", params);
  const response = await api.get("/admin/inventorySlip/get", {
    params,
    withCredentials: true
  });
  console.log(response.data);
  if (response.status === 200) {
    slips.value = response.data.content;
    totalPages.value = response.data.totalPages;
  }
}

const fetchDataPendingSlip = async () =>{
  const response = await api.get("/admin/inventorySlip/pending", {withCredentials: true});
  console.log("Phiếu cần duyệt: ", response.data);
  if(response.status===200) {
    pendingSlips.value = response.data;
    badgeCount.value = pendingSlips.value.length;
  }
}



</script>

<style scoped>
.inventory-container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.approval-btn {
  position: relative; /* để badge định vị theo nút */
  background-color: #f39c12;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 15px;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
}

.approval-btn:hover {
  background-color: #e67e22;
}

.nav-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
  align-items: center; /* căn giữa theo chiều dọc */
  justify-content: center; /* căn giữa theo chiều ngang */
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
}


.filter-group {
  display: flex;
  align-items: center;
  justify-content: center; /* căn giữa ngang */
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
}

.filter-group select, .filter-group input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-container {
  display: flex;
  justify-content: flex-end; /* đẩy nút sang phải */
  margin-bottom: 10px;
}

.create-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-left: auto;
}

.create-btn:hover {
  background-color: #27ae60;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}

.export {
  color: #27ae60;
  font-weight: bold;
}

.import {
  color: #e74c3c;
  font-weight: bold;
}

.pending {
  color: #f39c12;
  font-weight: bold;
}

.approved {
  color: #3498db;
  font-weight: bold;
}

.rejected {
  color: #e74c3c;
  font-weight: bold;
}

.done {
  color: #27ae60;
  font-weight: bold;
}

.action-btn {
  padding: 5px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.9em;
}

.action-btn.view {
  background-color: #3498db;
  color: white;
}

.action-btn.approve {
  background-color: #2ecc71;
  color: white;
}

.action-btn.reject {
  background-color: #e74c3c;
  color: white;
}

.action-btn.complete {
  background-color: #9b59b6;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 80%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  scrollbar-width: none;
}

.close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group select, .form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
}

.detail-items {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.detail-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.detail-item select {
  flex: 2;
}

.detail-item input {
  flex: 1;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* Approval modal styles */
.approval-list {
  margin-top: 20px;
}

.approval-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slip-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  flex: 1;
}

.slip-info span {
  font-size: 0.9em;
}

.approval-actions {
  display: flex;
  gap: 10px;
}

.approve-btn {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
}

/* Details modal styles */
.slip-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.slip-details div {
  padding: 5px 0;
}

.details-table {
  width: 100%;
  margin-bottom: 20px;
}

.details-table th, .details-table td {
  padding: 10px;
}

.details-actions {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.table-container {
  min-height: calc(6 * 60px); /* Giả sử mỗi row cao 50px */
}

table {
  width: 100%;
  border-collapse: collapse;
}

tbody tr {
  height: 60px; /* Chiều cao cố định cho mỗi row */
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}

.pagination button {
  margin: 0 5px;
  padding: 5px 10px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}


.filter-group button {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-group button:hover {
  background-color: #e0e0e0;
}

.filter-group button:active {
  background-color: #d0d0d0;
  transform: scale(0.98);
}
</style>