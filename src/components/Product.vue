<script setup>
import {ref, computed, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { watch } from 'vue'// Make sure to install lucide-vue-next

const router = useRouter()

// Sample data
const products = ref([])
const currentPage = ref(1);           // Trang hiện tại
const pageSize = ref(10);             // Số item mỗi trang (tuỳ bạn)
const totalItems = ref(0);            // Tổng số item (lấy từ API hoặc list)
const totalPages = ref(0);

// Filter options
const mainCategories = ref([])
const subCategories = ref([])


// Selected filters
const selectedMainCategory = ref()
const selectedSubCategory = ref('')

// Filtered products
// const filteredProducts = computed(() => {
//   return products.value.filter(product => {
//     const matchesMainCategory = selectedMainCategory.value === 'Tất cả' ||
//     product.mainCategory === selectedMainCategory.value
//     const matchesSubCategory = selectedSubCategory.value === 'Tất cả' ||
//         product.subCategory === selectedSubCategory.value
//     const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
//         product.id.toLowerCase().includes(searchQuery.value.toLowerCase())
//
//     return matchesMainCategory && matchesSubCategory && matchesSearch
//   })
// })

// Update sub categories when main category changes
const updateSubCategories = () => {
  if (
      selectedMainCategory.value &&
      Array.isArray(selectedMainCategory.value.children)
  ) {
    subCategories.value = [
      { id: null, name: 'Tất cả' },
      ...selectedMainCategory.value.children
    ];

    // Chỉ reset nếu sub hiện tại không thuộc main mới
    const found = subCategories.value.find(
        (c) => c.id === selectedSubCategory.value?.id
    );

    if (!found) {
      selectedSubCategory.value = subCategories.value[0]; // fallback "Tất cả"
    }

    currentPage.value = 1;
    getProductList();
  } else {
    subCategories.value = [];
    selectedSubCategory.value = null;
  }
};


//=====================Lấy theo Ca con ====================
async function getProductListBySubCa(){
  currentPage.value = 1;
  await getProductList();
}


// ==================Lấy theo tên ========================
async function getProductListBySearch(){
  currentPage.value = 1;
  await getProductList();
}

const viewDetail = (productId) => {
  router.push(`/products/${productId}`)
}

const createNewProduct = () => {
  router.push('/createProduct')
}


// ================== Lấy API ================================
// ================== Lấy danh mục lớn và cập nhật lên danh mục nhỏ
async function fetchMainCategories() {
  const url = '/admin/product-table/categoriesParent';
  try {
    const response = await api.get(url, { withCredentials: true });
    mainCategories.value = response.data;
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh mục lớn:', error);
    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });
      window.location.href = '/home';
    }
    return [];
  }
}
import { onBeforeRouteLeave } from 'vue-router'

// Chỉ xóa localStorage nếu rời khỏi /product mà KHÔNG đi tới /products/:id
onBeforeRouteLeave((to, from, next) => {
  const goingToProductDetail = to.path.startsWith('/products/')
  const stayingInProductList = to.path.startsWith('/product')

  if (!goingToProductDetail && !stayingInProductList) {
    localStorage.removeItem('selectedMainCategory')
    localStorage.removeItem('selectedSubCategory')
    localStorage.removeItem('currentPage')
  }

  next()
})


// Lấy API bảng Sản Phẩm
async function getProductList() {
  const url = '/admin/product-table/getListProduct';

  try {
    console.log({
      selectedSubCategory: selectedSubCategory.value.id,
      selectedMainCategory: selectedMainCategory.value.id,
      pageSize: pageSize.value,
      currentPage: currentPage.value,
      searchName: String(searchName.value).trim()
    });

    const response = await api.post(url
      ,{
          selectedSubCategory: selectedSubCategory.value.id,
          selectedMainCategory: selectedMainCategory.value.id,
          pageSize: pageSize.value,
          currentPage: currentPage.value,
          searchName: String(searchName.value).trim()


      }, { withCredentials: true });
    // Gán vào listPro và totalPage
    console.log("🎯 FULL RESPONSE", response.data);

    products.value = response.data.list;
    totalPages.value = response.data.totalPages;
    console.log('✅✅✅✅✅', products.value)
    console.log(totalPages.value)
    await fetchProductNew();
    return [];
  } catch (error) {
    console.error('Lỗi :', error);

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });

      // Chuyển hướng sau khi đóng alert
      window.location.href = '/home';
    }
    return [];
  }
}
// ================================ Chuyển trang ===========================

watch([selectedMainCategory, selectedSubCategory, currentPage], () => {
  localStorage.setItem('selectedMainCategory', JSON.stringify(selectedMainCategory.value))
  localStorage.setItem('selectedSubCategory', JSON.stringify(selectedSubCategory.value))
  localStorage.setItem('currentPage', currentPage.value.toString())
})


const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    localStorage.setItem('currentPage', currentPage.value);
    getProductList() // Hàm gọi API hoặc cập nhật danh sách
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    localStorage.setItem('currentPage', currentPage.value); // Lưu lại
    getProductList(); // Hàm gọi API hoặc cập nhật danh sách
  }
};

// Khi component mounted thì gọi luôn
onMounted(async () => {
  // 1️⃣ Đọc localStorage trước
  const savedMain = JSON.parse(localStorage.getItem('selectedMainCategory') || 'null');
  const savedSub = JSON.parse(localStorage.getItem('selectedSubCategory') || 'null');
  currentPage.value = parseInt(localStorage.getItem('currentPage') || '1');

  // 2️⃣ Lấy danh mục từ BE
  await fetchMainCategories(); // lúc này chỉ gán mainCategories, KHÔNG reset selectedMainCategory

  // 3️⃣ Khôi phục main category
  if (savedMain) {
    const foundMain = mainCategories.value.find(c => c.id === savedMain.id);
    if (foundMain) {
      selectedMainCategory.value = foundMain;
      subCategories.value = [
        { id: null, name: 'Tất cả' },
        ...(foundMain.children || [])
      ];
    } else {
      // fallback nếu không tìm thấy
      selectedMainCategory.value = mainCategories.value[0];
      updateSubCategories();
    }
  } else {
    // chưa có localStorage => mặc định chọn main đầu tiên
    selectedMainCategory.value = mainCategories.value[0];
    updateSubCategories();
  }

  // 4️⃣ Khôi phục sub category
  if (savedSub && subCategories.value.length > 0) {
    const foundSub = subCategories.value.find(c => c.id === savedSub.id);
    if (foundSub) {
      selectedSubCategory.value = foundSub;
    } else {
      selectedSubCategory.value = subCategories.value[0]; // fallback
    }
  }

  // 5️⃣ Lấy danh sách sản phẩm
  await getProductList();
});


// =============================== Nút Search==================================
const searchName = ref('');

// ============================ Chuông ====================================
const notificationCount = ref(0)
const listProNew = ref([]);

async function fetchProductNew(){
  const url = '/admin/product-table/proNew';

  try {
    const response = await api.get(url, { withCredentials: true });

    listProNew.value = response.data;
    notificationCount.value = listProNew.value.length;
    // return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh mục lớn:', error);

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });

      // Chuyển hướng sau khi đóng alert
      window.location.href = '/home';
    }
    return [];
  }
}
// ================ Thêm sản phẩm ===================
import { Modal } from 'bootstrap'
const product = ref({})

const categories = ref([])
let modalInstance = null
const openModal = () => {
  if (!modalInstance) {
    const modalEl = document.getElementById('productModal')
    modalInstance = new Modal(modalEl)
  }

  // Reset form
  product.value = {
    id: 'uu',
    name: '',
    createdDate: new Date().toISOString().split('T')[0],
    description: '',
    targetCustomer: 'UNISEX',
    brand: '',
    categoryName: ''
  }
  fetchProductNewBETA();
  modalInstance.show()
}



async function fetchProductNewBETA() {
  const url = '/admin/product-table/proNewBETA';
  try {
    const response = await api.get(url, { withCredentials: true });

    // Bạn chưa dùng dữ liệu, nên chỉ cần log thử
    console.log('🎯 BETA RESPONSE', response.data);

    // Ví dụ gán ra biến:
    categories.value = response.data.categories;
    product.value.id = response.data.newProductId;

  } catch (error) {
    console.error('Lỗi khi lấy danh mục lớn:', error);
    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });
      window.location.href = '/home';
    }
    return [];
  }
}

async function createProduct() {
  const p = product.value;

  // Kiểm tra dữ liệu nhập
  if (!p.name || !p.brand || !p.categoryName) {
    await Swal.fire({
      icon: 'warning',
      title: 'Thiếu thông tin',
      text: 'Tên, thương hiệu và danh mục là bắt buộc!',
      confirmButtonText: 'OK'
    });
    return;
  }

  if (!p.description || p.description.trim().length < 150) {
    await Swal.fire({
      icon: 'warning',
      title: 'Mô tả quá ngắn',
      text: 'Mô tả sản phẩm phải từ 150 ký tự trở lên!',
      confirmButtonText: 'OK'
    });
    return;
  }

  try {
    const response = await api.post('/admin/product-table/create', p, { withCredentials: true });

    await Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Sản phẩm đã được tạo.',
      confirmButtonText: 'OK'
    });

    modalInstance.hide();  // Đóng modal
    await fetchProductNew();      // Refresh danh sách
    await getProductList();
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error);

    await Swal.fire({
      icon: 'error',
      title: 'Lỗi tạo sản phẩm',
      text: error.response?.data?.message || 'Vui lòng thử lại sau.',
      confirmButtonText: 'OK'
    });
  }
}
// ======================== Hện bảng New ============================
// Modal ref
const notificationModal = ref(null)
let notificationModalInstance = null
// Mở modal chuông
async function openNotificationModal() {
  await fetchProductNew()
  if (!notificationModalInstance) {
    notificationModalInstance = new Modal(notificationModal.value)
  }
  notificationModalInstance.show()
}

// Chuyển đến trang cấu hình sản phẩm
// Đóng modal trước khi chuyển trang
function goToProductConfig(productId) {
  if (notificationModalInstance) {
    notificationModalInstance.hide()
  }
  router.push(`/products/${productId}`)
}
</script>

<template>
  <div class="product-management">
    <!-- Header Row with dark green background -->
    <div class="header-row">
      <h1>Product Management</h1>

      <div class="header-controls">
        <div class="notification-bell position-relative"
             @click="openNotificationModal"
             ref="bellRef"
             :title="`Có ${notificationCount} sản phẩm mới chưa cấu hình toàn diện để hiện ra kênh bán`"
             data-bs-toggle="tooltip"
             data-bs-placement="bottom">

          <i class="fas fa-bell fa-2x"></i>
          <span v-if="notificationCount > 0"
                class="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle">
    {{ notificationCount }}
  </span>
        </div>
        <button @click="openModal" class="create-btn">
          <Plus :size="16" class="icon" />
          Tạo mới
        </button>
      </div>
    </div>
    <!-- Modal -->
    <!-- Modal hiển thị sản phẩm mới -->
    <div
        ref="notificationModal"
        class="modal fade"
        id="notificationModal"
        tabindex="-1"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Sản phẩm mới</h5>
            <p>Hãy cấu hình cho các sản phẩm mới, để tung ra thị trường nhé!</p>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-striped">
              <thead>
              <tr>
                <th>ID</th>
                <th>Tên sản phẩm</th>
                <th>Ngày tạo</th>
                <th class="text-center">Cấu hình</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="pro in listProNew" :key="pro.id">
                <td>{{ pro.id }}</td>
                <td>{{ pro.name }}</td>
                <td>{{ pro.createdDate }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-info" @click="goToProductConfig(pro.id)">
                    ⚙
                  </button>
                </td>
              </tr>
              <tr v-if="listProNew.length === 0">
                <td colspan="4" class="text-center text-muted">Không có sản phẩm mới</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="modal fade" id="productModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered"  style="width: 500px">
        <div class="modal-content product-modal" >
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ isEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo mới sản phẩm' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>

          <div class="modal-body">
            <div v-if="product" class="product-form">

              <div class="mb-3">
                <label class="form-label">Product ID</label>
                <input type="text" v-model="product.id" class="form-control" readonly />
              </div>

              <div class="mb-3">
                <label class="form-label">Product Name</label>
                <input type="text" v-model="product.name" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="product.description" class="form-control" rows="3" placeholder="Nhập mô tả sản phẩm..."></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Created Date</label>
                  <input type="date" v-model="product.createdDate" class="form-control" readonly />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Target Customer</label>
                  <select v-model="product.targetCustomer" class="form-control">
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="UNISEX">UNISEX</option>
                    <option value="MIDDLE-AGED">MIDDLE-AGED</option>
                    <option value="CHILD">CHILD</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Brand</label>
                  <input type="text" style="text-transform: uppercase;" v-model="product.brand" class="form-control" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Category</label>
                  <select v-model="product.categoryName" class="form-control">
                    <option disabled value="">-- Chọn Category --</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button @click="createProduct" class="btn btn-success">
              <i class="fas fa-save"></i> {{ isEdit ? 'Save' : 'Create' }}
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-group">
        <label for="main-category">Danh mục lớn:</label>
        <select
            id="main-category"
            v-model="selectedMainCategory"
            @change="updateSubCategories"
            class="filter-select"
        >
          <option v-for="category in mainCategories" :key="category" :value="category">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="sub-category">Danh mục nhỏ:</label>
        <select
            id="sub-category"
            v-model="selectedSubCategory"
            @change="getProductListBySubCa"
            class="filter-select"
        >
          <option v-for="category in subCategories" :key="category" :value="category">
            {{ category.name }}
          </option>
        </select>

      <label for="search-name">Tìm theo tên:</label>
      <input
          type="text"
          id="search-name"
          v-model="searchName"
          placeholder="Nhập tên sản phẩm"
          class="filter-input"
      />
      <button @click="getProductListBySearch" class="filter-button">Tìm</button>
      <div style="width: 50px">

      </div>
      <!-- Nút chuyển trang -->
      <button @click="goToPrevPage" :disabled="currentPage === 1" class="filter-button">
        ◀
      </button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="goToNextPage" class="filter-button">
         ▶
      </button>
      </div>
    </div>


    <!-- Product Table -->
    <div class="table-container">
      <table class="product-table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Product Name</th>
          <th>Created Date</th>
          <th>Target</th>
          <th>Brand</th>
          <th>Image</th>
          <th>Price</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="products.length === 0">
          <td colspan="8" style="text-align: center; color: gray;">
           ‼️ Danh mục này hiện không có sản phẩm nào cả.
          </td>
        </tr>

        <tr v-else v-for="product in products" :key="product.id">
          <td>{{ product.id }}</td>
          <td style="width: 270px">{{ product.name }}</td>
          <td>{{ product.createdDate }}</td>
          <td>{{ product.targetCustomer }}</td>
          <td>{{ product.brand }}</td>
          <td>
            <img :src="'http://localhost:8989/uploads/' + product.image" alt="Product image" class="product-image">
          </td>
          <td>
            <div v-if="product.discount && product.discount < product.price">
              <span style="text-decoration: line-through; color: gray;">
                {{ product.price.toLocaleString() }}đ
              </span><br>
                    <span>
                {{ product.discount.toLocaleString() }}đ
              </span>
            </div>
            <div v-else>
              {{ product.price.toLocaleString() }}đ
            </div>
          </td>
          <td>
            <button @click="viewDetail(product.id)" class="view-btn">👉</button>
          </td>
        </tr>
        </tbody>

      </table>
    </div>
  </div>
</template>

<style scoped>
.product-management {
  padding:  30px;
  padding-top: 25px;
  width: 100%;         /* full width */
  max-width: none;     /* bỏ giới hạn 1200px */
  margin: 0;           /* bỏ căn giữa */
}

/* Header Row Styles */
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #070707; /* Dark green background */
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  color: white;
}

.header-row h1 {
  margin: 0;
  font-size: 24px;
  color: white;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 15px 8px 35px;
  border: none;
  border-radius: 4px;
  width: 250px;
  background-color: rgba(255, 255, 255, 0.9);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  background-color: white;
  color: #0a0a0a;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.create-btn:hover {
  background-color: #f5f5f5;
  transform: translateY(-1px);
}

.create-btn .icon {
  margin-right: 5px;
}

/* Filter Section Styles */
.filter-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  text-align: left;
  padding: 12px 15px;
  background-color: #f5f5f5;
  font-weight: 600;
}

.product-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.product-table tr:last-child td {
  border-bottom: none;
}

.description-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.view-btn {
  padding: 6px 12px;
  background-color: #0e2275;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-btn:hover {
  background-color: #2b2d2c;
}
.filter-group {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filter-button {
  padding: 0.5rem 1rem;
  background-color: #0c3560;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.notification-bell {
  cursor: pointer;

}

.notification-bell .badge {
  font-size: 0.7rem;
  padding: 0.35em 0.5em;
}
.config-btn {
  transition: all 0.2s ease;
}

.config-btn:hover {
  background-color: #0a58ca; /* xanh đậm hơn */
  color: #fff;
  transform: scale(1.1); /* hơi phóng to */
}
</style>