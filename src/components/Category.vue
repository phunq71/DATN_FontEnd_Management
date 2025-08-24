<template>
  <div class="category-management">
    <div class="cm-container">
      <!-- Header với tiêu đề và thanh tìm kiếm -->
      <div class="cm-header">
        <div class="cm-title-section">
          <h2 class="cm-title">
            <i class="fas fa-boxes me-2"></i>
            Quản lý Danh mục sản phẩm
          </h2>
          <span class="cm-badge">{{ flatCategoryList.length }} danh mục</span>
        </div>
        
        <form @submit.prevent="searchCategory" class="cm-search-form">
          <div class="cm-search-box">
            <input v-model="searchKeyword"
                  type="text"
                  placeholder="Tìm kiếm..."
                  class="cm-search-input">
            <button class="cm-search-btn">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </form>
      </div>

      <!-- Form thêm/sửa -->
      <div class="cm-form-section">
        <div class="cm-form-header">
          <h5 class="cm-form-title">
            <i :class="isEdit ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
            {{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }} danh mục
          </h5>
        </div>
        
        <form @submit.prevent="saveCategory" class="cm-form-body">
          <div class="cm-form-row">
            <div class="cm-form-group">
              <input v-model="form.categoryName" 
                    type="text" 
                    placeholder="Tên danh mục"
                    class="cm-form-control" 
                    required>
            </div>
            
            <div class="cm-form-group">
              <select v-model="form.parentID" class="cm-form-control">
                <option value="">-- Chọn danh mục cha --</option>
                <option v-for="cat in parentCategoryList" 
                        :key="cat.categoryID" 
                        :value="cat.categoryID">
                  {{ cat.categoryName }}
                </option>
              </select>
            </div>
            <div class="cm-form-actions">
              <button type="submit" class="cm-btn cm-btn-primary">
                <i :class="isEdit ? 'fas fa-save' : 'fas fa-plus'"></i>
                {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
              </button>
              <button type="button" @click="resetForm" class="cm-btn cm-btn-secondary">
                <i class="fas fa-undo"></i> Reset
              </button>
              <button v-if="isEdit" 
                      type="button" 
                      @click="deleteCurrentCategory" 
                      class="cm-btn cm-btn-danger">
                <i class="fas fa-trash-alt"></i> Xóa
              </button>
            </div>
          </div>
          <div class="cm-form-row">
            <input
                ref="fileInput"
                type="file"
                @change="onBannerChange"
                accept="image/*"
                hidden
            />

            <!-- Ảnh cũ hoặc ảnh preview -->
            <img
                :src="
                previewBanner
                  ? previewBanner
                  : form.banner
                    ? 'https://phudatn.blob.core.windows.net/images/' + form.banner
                    : 'https://phudatn.blob.core.windows.net/images/null.png'

              "
                            alt="banner"
                            class="banner clickable"
                            @click="triggerFileSelect"
            />

            <textarea class="content" v-model="form.content" required></textarea>
          </div>
        </form>
      </div>

      <!-- Danh sách danh mục -->
      <div class="cm-list-section">
        <div class="cm-list-header">
          <h5 class="cm-list-title">
            <i class="fas fa-list-ul me-2"></i>
            Danh sách danh mục
          </h5>
        </div>
        
        <div v-if="categories.length === 0" class="cm-empty-state">
          <i class="fas fa-folder-open"></i>
          <p>Không có danh mục nào</p>
        </div>
        
        <ul v-else class="cm-category-list">
          <li v-for="cat in categories" :key="cat.categoryID" class="cm-category-item">
            <div class="cm-category-main">
              <button class="cm-category-toggle" 
                      @click="cat.expanded = !cat.expanded"
                      :disabled="!cat.children?.length">
                <i v-if="cat.children?.length" 
                  class="fas" 
                  :class="cat.expanded ? 'fa-chevron-down' : 'fa-chevron-right'"></i>
                <span v-else class="cm-no-child-icon"></span>
                <span class="cm-category-name">{{ cat.categoryName }}</span>
              </button>
              
              <div class="cm-category-actions">
                <button @click="editCategory(cat)" 
                        class="cm-action-btn cm-edit-btn"
                        title="Chỉnh sửa">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteCategory(cat.categoryID)" 
                        class="cm-action-btn cm-delete-btn"
                        title="Xóa">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
            
            <!-- Danh mục con -->
            <ul v-if="cat.expanded && cat.children?.length" class="cm-subcategory-list">
              <li v-for="child in cat.children" :key="child.categoryID" class="cm-subcategory-item">
                <div class="cm-subcategory-content">
                  <span class="cm-subcategory-prefix">↳</span>
                  <span class="cm-subcategory-name">{{ child.categoryName }}</span>
                  
                  <div class="cm-subcategory-actions">
                    <button @click="editCategory(child)" 
                            class="cm-action-btn cm-edit-btn"
                            title="Chỉnh sửa">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteCategory(child.categoryID)" 
                            class="cm-action-btn cm-delete-btn"
                            title="Xóa">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

const categories = ref([])
const flatCategoryList = ref([])
const form = ref({ categoryID: '', categoryName: '', parentID: '', content: '', banner: ''})
const isEdit = ref(false)
const searchKeyword = ref('')
const parentCategoryList = ref([])

// Ảnh tạm
const fileInput = ref(null);
const previewBanner = ref(null);
const newFile = ref(null);

const triggerFileSelect = () => {
  fileInput.value.click();
};
const onBannerChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    previewBanner.value = URL.createObjectURL(file);
    newFile.value = file;
  }
};
// Load dữ liệu danh mục
const loadCategories = async () => {
  try {
    const res = await api.get('/admin/category', { withCredentials: true })
    categories.value = res.data
    flatCategoryList.value = flattenTree(res.data)
    parentCategoryList.value = res.data.filter(cat => !cat.parentID)
  } catch (error) {
    showError('Lỗi tải danh sách danh mục')
  }
}

const flattenTree = (tree, depth = 0) => {
  const result = []
  for (const node of tree) {
    result.push({
      ...node,
      categoryName: `${'— '.repeat(depth)}${node.categoryName}`
    })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }
  return result
}

const saveCategory = async () => {
  try {
    if (newFile.value === null && form.value.banner === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu ảnh',
        text: 'Vui lòng thêm ảnh trước khi tiếp tục!',
        confirmButtonText: 'OK'
      });
      return;
    }

    const fd = new FormData();

// append JSON dưới dạng string
    fd.append("category", JSON.stringify(form.value));

// append file nếu có
    if (newFile.value) {
      fd.append("file", newFile.value);
    }

    if (isEdit.value) {
      await api.put(`/admin/category/${form.value.categoryID}`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });
      showSuccess("Cập nhật danh mục thành công!");
    } else {
      await api.post("/admin/category", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });
      showSuccess("Thêm danh mục mới thành công!");
    }
    resetForm()
    await loadCategories()
  } catch (err) {
    showError(err.response?.data || 'Lỗi thao tác')
  }
}

const resetForm = () => {
  form.value = { categoryID: '', categoryName: '', parentID: '', content: '', banner: '' }
  newFile.value = null
  previewBanner.value = ''
  isEdit.value = false
}

const editCategory = (cat) => {
  form.value = { ...cat }
  isEdit.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteCategory = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc muốn xóa danh mục này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ef4444',
    reverseButtons: true
  })

  if (isConfirmed) {
    try {
      await api.delete(`/admin/category/${id}`, { withCredentials: true })
      showSuccess('Xóa danh mục thành công!')
      await loadCategories()
    } catch (err) {
      showError(err.response?.data || 'Không thể xóa danh mục')
    }
  }
}

const searchCategory = async () => {
  if (!searchKeyword.value.trim()) return loadCategories()
  
  try {
    const res = await api.get(`/admin/category/search?name=${encodeURIComponent(searchKeyword.value)}`, { withCredentials: true })
    categories.value = res.data
    flatCategoryList.value = flattenTree(res.data)
  } catch (error) {
    showError('Lỗi tìm kiếm danh mục')
  }
}

const deleteCurrentCategory = async () => {
  if (!form.value.categoryID) return
  
  const { isConfirmed } = await Swal.fire({
    title: 'Xác nhận xóa',
    text: 'Bạn có chắc muốn xóa danh mục này?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#ef4444',
    reverseButtons: true
  })

  if (isConfirmed) {
    try {
      await api.delete(`/admin/category/${form.value.categoryID}`, { withCredentials: true })
      showSuccess('Xóa danh mục thành công!')
      await loadCategories()
      resetForm()
    } catch (err) {
      showError(err.response?.data || 'Lỗi khi xóa danh mục')
    }
  }
}

// Helper functions for notifications
const showSuccess = (message) => {
  Swal.fire({
    title: 'Thành công!',
    text: message,
    icon: 'success',
    confirmButtonText: 'OK',
    confirmButtonColor: '#3498db'
  })
}

const showError = (message) => {
  Swal.fire({
    title: 'Lỗi!',
    text: "Thao tác này không được phép!",
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444'
  })
}

onMounted(loadCategories)
</script>

<style scoped>
.category-management {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.cm-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  padding: 25px;
}

/* Header styles */
.cm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
}

.cm-title-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cm-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.cm-badge {
  background-color: #3498db;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.cm-search-form {
  flex: 1;
  min-width: 250px;
  max-width: 400px;
}

.cm-search-box {
  display: flex;
  position: relative;
}

.cm-search-input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 30px 0 0 30px;
  font-size: 14px;
  transition: all 0.3s;
}

.cm-search-input:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.cm-search-btn {
  padding: 0 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 0 30px 30px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cm-search-btn:hover {
  background-color: #2980b9;
}

/* Form section */
.cm-form-section {
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 25px;
  overflow: hidden;
}

.cm-form-header {
  padding: 12px 20px;
  background-color: #3498db;
  color: white;
}

.cm-form-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.cm-form-body {
  padding: 20px;
}

.cm-form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.cm-form-group {
  flex: 1;
  min-width: 200px;
}

.cm-form-control {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.cm-form-control:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.cm-form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.cm-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cm-btn-primary {
  background-color: #3498db;
  color: white;
}

.cm-btn-primary:hover {
  background-color: #2980b9;
}

.cm-btn-secondary {
  background-color: #f1f5f9;
  color: #334155;
}

.cm-btn-secondary:hover {
  background-color: #e2e8f0;
}

.cm-btn-danger {
  background-color: #ef4444;
  color: white;
}

.cm-btn-danger:hover {
  background-color: #dc2626;
}

/* List section */
.cm-list-section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.cm-list-header {
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
}

.cm-list-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.cm-empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
}

.cm-empty-state i {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.cm-empty-state p {
  margin: 0;
  font-size: 16px;
}

/* Category list styles */
.cm-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cm-category-item {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
}

.cm-category-item:last-child {
  border-bottom: none;
}

.cm-category-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
}

.cm-category-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  flex: 1;
  text-align: left;
}

.cm-category-toggle:disabled {
  cursor: default;
}

.cm-category-name {
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
}

.cm-no-child-icon {
  display: inline-block;
  width: 16px;
}

.cm-category-actions {
  display: flex;
  gap: 8px;
}

.cm-action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;
}

.cm-edit-btn {
  color: #3498db;
}

.cm-edit-btn:hover {
  background-color: rgba(52, 152, 219, 0.1);
}

.cm-delete-btn {
  color: #ef4444;
}

.cm-delete-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

/* Subcategory styles */
.cm-subcategory-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

.cm-subcategory-item {
  padding: 8px 20px 8px 50px;
  border-bottom: 1px solid #f1f5f9;
}

.cm-subcategory-item:last-child {
  border-bottom: none;
}

.cm-subcategory-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cm-subcategory-prefix {
  color: #94a3b8;
  font-size: 14px;
}

.cm-subcategory-name {
  font-size: 14px;
  color: #475569;
  flex: 1;
}

.cm-subcategory-actions {
  display: flex;
  gap: 8px;
}
.banner {
  margin-top: 5px;
  border-radius: 5px;
  width: 300px;
  border: solid 1px gray;
  height: 150px;
}
.content {
  margin-top: 5px;
  border-radius: 5px;
  border: solid 1px gray;
  width: 500px;
}
.banner.clickable {
  cursor: pointer;
}
.banner.clickable:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Responsive styles */
@media (max-width: 768px) {
  .cm-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cm-search-form {
    max-width: 100%;
  }
  
  .cm-form-row {
    flex-direction: column;
  }
  
  .cm-form-actions {
    width: 100%;
  }
  
  .cm-btn {
    flex: 1;
  }
  
  .cm-category-main {
    padding: 12px 15px;
  }
  
  .cm-subcategory-item {
    padding-left: 40px;
  }
}
</style>