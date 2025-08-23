<script setup>
import {ref, computed, onMounted} from "vue";
import {debounce} from "chart.js/helpers";
import Swal from "sweetalert2";

const props = defineProps({
  showCreateModal: Boolean,
  user: Object
})

const emit = defineEmits(['update:showCreateModal'])

const closeCreateModal = () => {
  emit('update:showCreateModal', false) // báo cho cha đóng modal
}



// Form data
const newSlip = ref({
  id: null,
  type: false,
  from: "",
  fromName: '',
  to: "",
  toName: '',
  status: '',
  staff: '',
  staffName: '',
  approver: '',
  approverName: '',
  createDate: null,
  note: '',
  details: [{
    invSlipID: null,
    itemID: null,
    itemName: '',
    quantity: 1,
    maxQT: 1
  }]
})
//
const force = ref(false);

// Item selection
const activeDropdownIndex = ref(null)
const itemSearchKeyword = ref('')
const items = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 10

// Computed
const paginationInfo = computed(() => `Trang ${currentPage.value} / ${totalPages.value}`)


const toggleItemDropdown = async (index) => {
  if (activeDropdownIndex.value === index) {
    activeDropdownIndex.value = null
  } else {
    activeDropdownIndex.value = index
    await fetchItems();
  }
}

const fetchItems = async () => {
  console.log("bắt đầu gọi api");
  let toFacilityId=newSlip.value.to;
  if(newSlip.value.to === "S" && props.user.role ==="STAFF"){
    toFacilityId = "K"+ props.user.facilityId.substring(1);
  }
  else if (newSlip.value.to ==="K" && props.user.role ==="STAFF"){
    toFacilityId = props.user.facilityId;
  }

  console.log(toFacilityId);
  try {
    const response = await api.get("/admin/inventorySlip/getItemInvSlips", {
      withCredentials: true,
      params: {
        pageN: currentPage.value-1,
        keyword: itemSearchKeyword.value,
        toFacilityId: toFacilityId //chỉ dành cho staff
      }
    });
    console.log(response.data);

    items.value = response.data.content || []
    totalPages.value = response.data.totalPages || 1
  } catch (error) {
    console.error("Error fetching items:", error)
    items.value = []
  }
}

const refreshItems = async () =>{
  if(props.user.role !== "STAFF") return;

  await fetchItems();
}


const searchItems = debounce(async () => {
  currentPage.value = 1
  await fetchItems();
}, 300);

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchItems();
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchItems();
  }
}


const selectItem = (index, item) => {
  // Check trùng
  const isDuplicate = newSlip.value.details.some(
      (detail, i) => detail.itemID === item.itemId && i !== index
  );

  if (isDuplicate) {
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: "Mặt hàng này đã được chọn rồi!",
      confirmButtonText: "OK",
      confirmButtonColor: "black"
    });
    return; // Không cho lưu
  }

  // Không trùng => cập nhật
  newSlip.value.details[index].itemID = item.itemId;
  newSlip.value.details[index].itemName = item.sku;
  newSlip.value.details[index].maxQT = item.quantity;
  activeDropdownIndex.value = null;
  checkQuantity(index);
};

const addDetail = () => {
  newSlip.value.details.push({
    itemID: null,
    itemName: '',
    quantity: 1,
    maxQT: 1
  })
}

const removeDetail = (index) => {
  newSlip.value.details.splice(index, 1)
}

const submitSlip = async () => {
  removeNullItemDetails();

  // Nếu chưa có sản phẩm
  if (newSlip.value.details.length < 1) {
    Swal.fire({
      icon: "warning",
      title: "Hãy thêm ít nhất 1 sản phẩm",
      text: "Để có thể tiếp tục tạo phiếu",
      confirmButtonText: "OK",
      confirmButtonColor: "rgba(0, 0, 0, 0.5)"
    });
    return;
  }

  try {
    if(newSlip.value.to ==='K'){
      newSlip.value.to =null;
      if(props.user.role === "STAFF")
        newSlip.value.from= "K" + props.user.facilityId.substring(1);
    } else if( newSlip.value.to === 'S'){
      newSlip.value.to= null;
      newSlip.value.from = props.user.facilityId;
    }


    const respone = await api.post("/admin/inventorySlip/create",
        newSlip.value,
        {
          withCredentials: true,
          params: {
            force: force.value
          }
        }
    );

    if (respone.status === 200) {
      if (respone.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: respone.data.message || "Tạo thành công!",
          confirmButtonText: "OK",
          confirmButtonColor: "#3085d6"
        }).then(() => {
          // phát sự kiện cho cha
          emit("slipCreated", newSlip.value);
        });

      } else if (respone.data.status === "warning") {
        Swal.fire({
          icon: "warning",
          title: respone.data.message || "Vượt max của kho nhận",
          html: renderItemsTable(respone.data.items), // Tùy thích hiển thị bảng
          showCancelButton: true,
          confirmButtonText: "Có, vẫn tạo",
          cancelButtonText: "Hủy",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          width: '1100px'
        }).then((result) => {
          if (result.isConfirmed) {
            force.value = true;
            submitSlip(); // gọi lại
          }
        });
      }
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Lỗi khi tạo phiếu",
      text: err.message || "Đã xảy ra lỗi"
    });
  }
};

// Hàm render bảng item cảnh báo (nếu muốn hiển thị đẹp)
function renderItemsTable(items) {
  if (!items || items.length === 0) return "";
  let html = "<table style='width:100%; border-collapse: collapse; text-align:left;'>";
  html += `<tr>
                <th style='border-bottom:1px solid #ccc;padding:4px;'>SKU</th>
                <th style='border-bottom:1px solid #ccc;padding:4px;'>Số lượng xuất</th>
                <th style='border-bottom:1px solid #ccc;padding:4px;'>SL Tối đa của kho nhận</th>
                <th style='border-bottom:1px solid #ccc;padding:4px;'>SL Hiện tại của kho nhận</th>
                <th style='border-bottom:1px solid #ccc;padding:4px;'>Số lượng của kho nếu xuất</th>
          </tr>`;
  items.forEach(item => {
    html += `<tr>
      <td style='border-bottom:1px solid #eee;padding:4px;'>${item.itemName}</td>
      <td style='border-bottom:1px solid #eee;padding:4px;'>${item.quantity}</td>
      <td style='border-bottom:1px solid #eee;padding:4px;'>${item.maxQT}</td>
      <td style='border-bottom:1px solid #eee;padding:4px;'>${item.invSlipID}</td>
      <td style='border-bottom:1px solid #eee;padding:4px;'>${item.quantity + Number(item.invSlipID)}</td>
    </tr>`;
  });
  html += "</table>";
  return html;
}


const facilities = ref([]);

const fetchDataFacilities = async () => {
  const response = await api.get("/admin/inventory/getFacilities", {withCredentials: true});
  console.log(response.data)
  if(response.status ===200){
    facilities.value = response.data.facilities;
    newSlip.value.to = facilities.value[0].shopID;
  }
}

const checkQuantity = debounce(async (index) => {


  const detail = newSlip.value.details[index];
  const maxQT = detail.maxQT;
  let quantity = Number(detail.quantity);
  console.log("check quantity của", detail);

  if(detail.itemID=== null){
    return;
  }

  // nếu quantity < 1 hoặc không phải số → set về 1 luôn
  if (isNaN(quantity) || quantity < 1) {
    detail.quantity = 1;
    return;
  }
  if(newSlip.value.type) return;
  if (quantity > maxQT) {
    await Swal.fire({
      icon: "warning",
      title: "Quá số lượng trong kho hiện tại",
      text: `Số lượng tối đa: ${maxQT}`,
      confirmButtonText: "OK",
      confirmButtonColor: "rgba(0, 0, 0, 0.5)"
    });
    newSlip.value.details[index].quantity = maxQT;
  }
}, 300);


function removeNullItemDetails() {
  newSlip.value.details = newSlip.value.details.filter(detail => {
    return detail.itemID != null; // Sử dụng != để kiểm tra cả null và undefined
  });
}

onMounted(async () => {
  await fetchDataFacilities();
})
</script>

<template>
  <div v-if="showCreateModal" class="modal" @click="closeCreateModal">
    <div class="modal-content" @click.stop>
      <span class="close" @click="closeCreateModal">&times;</span>
      <h2>Tạo phiếu nhập/xuất</h2>

      <div class="form-group">
        <label>Loại phiếu:</label>
        <select v-model="newSlip.type">

          <option v-if="user.role==='STOCK'" :value="true">Nhập kho</option>
          <option :value="false">Xuất kho</option>
        </select>
      </div>

      <div class="form-group" v-if="!newSlip.type">
        <label>Tới:</label>
        <select v-model="newSlip.to" @change="refreshItems">
          <option v-for="from in facilities"
                  :key="from.shopID"
                  :value="from.shopID"
                  :style="from.shopID.charAt(0)==='W'? 'font-weight: bolder;':''"
          >
            {{ from.shopName }}
          </option>
          <option :value="'S'" v-if="user.role ==='STAFF'">Xuất hàng lỗi của shop</option>
          <option :value="'K'">Xuất hàng lỗi của kho</option>
        </select>
      </div>

      <div class="form-group">
        <label>Ghi chú:</label>
        <textarea v-model="newSlip.note" maxlength="385"></textarea>
        <div :style="{ color: newSlip.note.length > 380 ? 'red' : 'black' }">
          {{ newSlip.note.length }}/385 ký tự
        </div>

      </div>

      <div class="form-group">
        <label>Chi tiết:</label>
        <div class="detail-items">
          <div v-for="(detail, index) in newSlip.details" :key="index" class="detail-item">
            <div class="item-select-container">
              <div class="item-input-wrapper">
                <input
                    type="text"
                    v-model="detail.itemName"
                    @click="toggleItemDropdown(index)"
                    readonly
                    placeholder="Chọn sản phẩm"
                />
                <button
                    @click="toggleItemDropdown(index)"
                    class="toggle-dropdown-btn"
                >
                  {{ activeDropdownIndex === index ? 'Đóng' : 'Mở' }}
                </button>
              </div>

              <div
                  v-if="activeDropdownIndex === index"
                  class="item-dropdown"
              >
                <div class="search-box">
                  <input
                      type="text"
                      v-model="itemSearchKeyword"
                      placeholder="Tìm kiếm sản phẩm..."
                      @input="searchItems"
                      class="search-input"
                  />
                </div>

                <table class="item-table">
                  <thead>
                  <tr>
                    <th>SKU</th>
                    <th v-if="!newSlip.type">Số lượng</th>
                    <th>Thao tác</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in items" :key="item.itemId">
                    <td>{{ item.sku }}</td>
                    <td v-if="!newSlip.type">{{ item.quantity }}</td>
                    <td>
                      <button
                          @click="selectItem(index, item)"
                          class="select-item-btn"
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                  </tbody>
                </table>

                <div class="pagination">
                  <button
                      @click="prevPage"
                      :disabled="currentPage === 1"
                  >
                    Trước
                  </button>
                  <span>Trang {{ currentPage }} / {{ totalPages }}</span>
                  <button
                      @click="nextPage"
                      :disabled="currentPage === totalPages"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>

            <input
                type="number"
                v-model="detail.quantity"
                min="1"
                @input="checkQuantity(index)"
                placeholder="Số lượng"
            />
            <button @click="removeDetail(index)" class="remove-btn">X</button>
          </div>
          <button @click="addDetail" class="add-btn">Thêm sản phẩm</button>
        </div>
      </div>

      <div class="form-actions">
        <input type="checkbox" id="force" v-model="force">
        <label for="force">Vẫn xuất nếu vượt kho chứa</label>

        <button @click="submitSlip" class="submit-btn">Tạo phiếu</button>
        <button @click="closeCreateModal" class="cancel-btn">Hủy</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  max-width: 1000px;
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
  align-items: center;
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
/* Item selection styles */
.item-select-container {
  position: relative;
  width: 100%;
}

.item-input-wrapper {
  display: flex;
  align-items: center;
}

.item-input-wrapper input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
}

.toggle-dropdown-btn {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.item-dropdown {
  position: relative;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: white;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.search-box {
  display: flex;
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.search-box:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.search-input {
  flex: 1;
  padding: 8px 15px;
  border: none;
  outline: none;
  font-size: 14px;
}

.search-btn {
  padding: 0 15px;
  background: #f5f7fa;
  border: none;
  border-left: 1px solid #dcdfe6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.search-btn:hover {
  background: #e6e9ed;
  color: #409eff;
}



.item-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.item-table th, .item-table td {
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
}

.item-table th {
  background-color: #f5f5f5;
}

.select-item-btn {
  padding: 4px 8px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination button {
  padding: 5px 10px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* Thêm vào file CSS của bạn */
.detail-item input[type="number"] {
  width: 100px; /* Hoặc kích thước bạn muốn */
  padding: 8px;
  font-size: 14px;
}

.form-actions label {
  display: flex;
  align-items: center;
  gap: 8px; /* khoảng cách giữa checkbox và text */
  cursor: pointer;
  font-size: 14px;
}

.form-actions input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2ecc71; /* màu xanh đẹp cho checkbox */
  cursor: pointer;
}
</style>