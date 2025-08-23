<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Tiêu đề và trạng thái
const pageTitle = ref('Quản lý tồn kho sản phẩm')
const canEdit = ref(true)
const showEditModal = ref(false)
const editingItem = ref(null)

const role = ref('');

// Bộ lọc
const selectedArea = ref(null)
const selectedShop = ref('all')

// Phân trang
const currentPage = ref(0)
const itemsPerPage = ref(10)
const totalPages = ref(0)
const totalElements = ref(0)
const maxVisiblePages = 5

// Dữ liệu
const areas = ref([])
const shops = ref([])
const inventoryItems = ref([])

// Lấy dữ liệu từ API
const fetchDataArea = async () => {
  const response = await api.get("/admin/inventory/getAreas", {withCredentials: true});
  console.log("area nè👉👉", response.data);

  // Nếu là lần đầu load, set areas và shops
  if (areas.value.length === 0) {
    areas.value = [...new Map(response.data.map(item =>
        [item.areaID, { id: item.areaID, name: item.areaName }]
    )).values()]

    shops.value = response.data.map(shop => ({
      id: shop.shopID,
      name: shop.shopName,
      areaId: shop.areaID
    }))

    // Tự động chọn khu vực đầu tiên nếu chưa chọn
    if (areas.value.length > 0 && !selectedArea.value) {
      selectedArea.value = areas.value[0].id
    }
  }
}

//Inventories
const fetchDataInventories = async (facilityId, page = 0) => {
  try {
    console.log("facilityId gửi đi:", facilityId);
    const url = facilityId
        ? `/admin/inventory/getInventories?facilityId=${facilityId}&pageN=${page}`
        : `/admin/inventory/getInventories?pageN=${page}`

    const response = await api.get(url, {withCredentials: true});
    role.value = response.data.role;
    console.log("Data nhận được 👉", response.data);
    inventoryItems.value = response.data.inventories.content
    totalPages.value = response.data.inventories.totalPages
    totalElements.value = response.data.inventories.totalElements


  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Computed properties
const filteredShops = computed(() => {
  return selectedArea.value === 'all' || !selectedArea.value
      ? shops.value
      : shops.value.filter(shop => shop.areaId === selectedArea.value)
})

const visiblePages = computed(() => {
  const range = []
  const half = Math.floor(maxVisiblePages / 2)
  let start = Math.max(currentPage.value - half, 0)
  let end = Math.min(start + maxVisiblePages - 1, totalPages.value - 1)

  if (end - start + 1 < maxVisiblePages) {
    start = Math.max(end - maxVisiblePages + 1, 0)
  }

  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

// Methods
const onAreaChange = () => {
  selectedShop.value = 'all'
  currentPage.value = 0
  fetchDataInventories(selectedArea.value);
}

const onShopChange = () => {
  currentPage.value = 0
  const facilityId = selectedShop.value === 'all' ? selectedArea.value : selectedShop.value
  fetchDataInventories(facilityId)
}

const changePage = (page) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page
    const facilityId = selectedShop.value === 'all' ? selectedArea.value : selectedShop.value
    fetchDataInventories(facilityId, page)
  }
}

const getProgressBarColor = (value, min, max) => {
  if (value < min) {
    return '#ff5252' // Đỏ - thiếu hàng
  } else if (value > max) {
    return '#ff9800' // Cam - vượt mức tối đa
  } else if (value <= min + (max - min) * 0.2) {
    return '#ffeb3b' // Vàng - gần mức tối thiểu
  }
  return '#4caf50' // Xanh - bình thường
}

const getProgressPercentage = (value, max) => {
  if(max === 0) return 0;
  return Math.round((Math.min(value, max) / max) * 100)
}

const getMinMaxText = (value, min, max) => {
  return `${value} (Min: ${min}, Max: ${max})`
}

const editItem = (item) => {
  editingItem.value = JSON.parse(JSON.stringify(item))
  showEditModal.value = true
}

const saveEdit = async () => {
  console.log("cần lưu lưu: ", editingItem.value);
  const response=await api.put(`/admin/inventory/update?areaId=${selectedArea.value}`,editingItem.value, {withCredentials: true});
  console.log("đã lưu", response.data);
  if (response.status ===200){
    if(selectedShop.value==='all') await fetchDataInventories(selectedArea.value, currentPage.value);
    else await fetchDataInventories(selectedShop.value, currentPage.value);
  }
  showEditModal.value = false
}

const cancelEdit = () => {
  showEditModal.value = false
}

// Watch
// watch(selectedArea, (newVal) => {
//   if (newVal) {
//     onAreaChange()
//   }
// })
//
// watch(selectedShop, (newVal) => {
//   if (newVal && selectedArea.value) {
//     onShopChange()
//   }
// })


// Lifecycle hook
onMounted(async () => {
  await fetchDataArea();
  await fetchDataInventories();
  setupWatchers(); // đăng ký watchers sau khi set giá trị ban đầu
  if(role.value === 'ROLE_STAFF') {
    console.log(role.value);
    selectedShop.value= shops.value[0].id;
  }
})

function setupWatchers() {
  watch(selectedArea, (newVal) => {
    if (newVal) onAreaChange()
  })
  watch(selectedShop, (newVal) => {
    if (newVal && selectedArea.value) onShopChange()
  })
}

</script>

<template>
  <div class="inventory-page">
    <!-- Tiêu đề trang -->
    <h1 class="page-title">Quản lý kho</h1>

    <!-- Bộ lọc -->
    <div class="filters">
      <div class="filter-group">
        <label for="area">Khu vực:</label>
        <select id="area" v-model="selectedArea">
          <option v-for="area in areas" :value="area.id" :key="area.id">{{ area.name }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="shop">Cửa hàng:</label>
        <select id="shop" v-model="selectedShop" :disabled="!selectedArea">
          <option v-if="role!=='ROLE_STAFF'" value="all">Không chọn cửa hàng</option>
          <option v-for="shop in filteredShops" :value="shop.id" :key="shop.id">{{ shop.name }}</option>
        </select>
      </div>
    </div>

    <!-- Bảng dữ liệu -->
    <div class="inventory-table">
      <table>
        <thead>
        <tr>
          <th>SKU</th>
          <th v-if="selectedShop !== 'all'">Kho</th>
          <th v-if="selectedShop !== 'all'">Trên quầy</th>
          <th v-else>Tồn kho</th>
          <th v-if="role==='ROLE_ADMIN' || role==='ROLE_AREA'">Hành động</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in inventoryItems" :key="item.itemId">
          <td>{{ item.sku }}</td>

          <!-- Cột Kho (chỉ hiển thị khi chọn cửa hàng cụ thể) -->
          <td v-if="selectedShop !== 'all'">
            <div v-if="item.stockQuantity !== null && item.minStockQT !== null && item.maxStockQT !== null" class="progress-info">
              <div class="progress-container">
                <div
                    class="progress-bar"
                    :style="{
                    width: `${getProgressPercentage(item.stockQuantity, item.maxStockQT)}%`,
                    backgroundColor: getProgressBarColor(item.stockQuantity, item.minStockQT, item.maxStockQT)
                  }"
                ></div>
                <span class="progress-text">{{ getProgressPercentage(item.stockQuantity, item.maxStockQT) }}%</span>
              </div>
              <div class="quantity-info">
                {{ getMinMaxText(item.stockQuantity, item.minStockQT, item.maxStockQT) }}
              </div>
            </div>
            <div v-else class="no-data">Không có dữ liệu</div>
          </td>

          <!-- Cột Cửa hàng -->
          <td>
            <div class="progress-info">
              <div class="progress-container">
                <div
                    class="progress-bar"
                    :style="{
                    width: `${getProgressPercentage(item.shopQuantity, item.maxShopQT)}%`,
                    backgroundColor: getProgressBarColor(item.shopQuantity, item.minShopQT, item.maxShopQT)
                  }"
                ></div>
                <span class="progress-text">{{ getProgressPercentage(item.shopQuantity, item.maxShopQT) }}%</span>
              </div>
              <div class="quantity-info">
                {{ getMinMaxText(item.shopQuantity, item.minShopQT, item.maxShopQT) }}
              </div>
            </div>
          </td>

          <td v-if="role==='ROLE_ADMIN' || role==='ROLE_AREA'">
            <button class="edit-btn" @click="editItem(item)" v-if="canEdit">Sửa</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <div class="pagination" v-if="totalPages > 1">
      <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="page-btn"
      >
        &laquo; Trước
      </button>

      <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{ active: page === currentPage, 'page-btn': true }"
      >
        {{ page + 1 }}
      </button>

      <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages - 1"
          class="page-btn"
      >
        Sau &raquo;
      </button>


    </div>

    <!-- Modal chỉnh sửa -->
    <div class="modal" v-if="showEditModal">
      <div class="modal-content">
        <h2>Chỉnh sửa số lượng</h2>
        <div class="form-group">
          <label>SKU: {{ editingItem.sku }}</label>
        </div>
        <div class="form-group" v-if="selectedShop !== 'all'">
          <label>Min kho:</label>
          <input type="number" v-model.number="editingItem.minStockQT">
          <label>Max kho:</label>
          <input type="number" v-model.number="editingItem.maxStockQT">
        </div>
        <div class="form-group">
          <label>{{selectedShop !== 'all' ? 'Min cửa hàng:' : 'Min kho'}}</label>
          <input type="number" v-model.number="editingItem.minShopQT">
          <label>{{selectedShop !== 'all' ? 'Max cửa hàng:' : 'Max kho'}}</label>
          <input type="number" v-model.number="editingItem.maxShopQT">
        </div>
        <div class="modal-actions">
          <button @click="saveEdit">Lưu</button>
          <button @click="cancelEdit">Hủy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.inventory-page {
  padding: 20px;
  font-family: Arial, sans-serif;
  margin: 0 auto;
}

.page-title {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 36px;
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 150px;
}

.inventory-table {
  width: 100%;
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
  background-color: #0066cc;
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-container {
  width: 100%;
  height: 24px;
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #333;
  font-size: 12px;
  font-weight: bold;
}

.quantity-info {
  font-size: 12px;
  color: #666;
}

.no-data {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.edit-btn {
  padding: 6px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #3aa876;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn.active {
  background: #42b983;
  color: white;
  border-color: #42b983;
}

.page-size {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-size select {
  padding: 5px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
}

.modal-content h2 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-actions button:first-child {
  background-color: #42b983;
  color: white;
}

.modal-actions button:first-child:hover {
  background-color: #3aa876;
}

.modal-actions button:last-child {
  background-color: #f44336;
  color: white;
}

.modal-actions button:last-child:hover {
  background-color: #e53935;
}
</style>