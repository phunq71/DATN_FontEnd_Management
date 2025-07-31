<template>
  <div class="container py-5">
    <div class="bg-white shadow rounded p-4">
      <!-- Tiêu đề và thanh tìm kiếm -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0 text-dark">Quản lý Danh mục sản phẩm</h2>
        <form @submit.prevent="searchCategory" class="d-flex" style="max-width: 250px;">
          <input v-model="searchKeyword"
                 type="text"
                 placeholder="Tìm kiếm..."
                 class="form-control rounded-start-pill">
          <button class="btn btn-primary rounded-end-pill ms-1 px-3">🔍</button>
        </form>
      </div>

      <!-- Form thêm/sửa -->
      <div class="bg-light p-3 rounded mb-4 border">
        <h5 class="text-primary">{{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }} danh mục</h5>
        <form @submit.prevent="saveCategory" class="row g-3 mt-2">
          <div class="col-md-5">
            <input v-model="form.categoryName" type="text" placeholder="Tên danh mục"
                   class="form-control" required />
          </div>
          <div class="col-md-4">
            <select v-model="form.parentID" class="form-select">
              <option value="">-- Chọn danh mục cha --</option>
              <option v-for="cat in parentCategoryList" :key="cat.categoryID" :value="cat.categoryID">
                {{ cat.categoryName }}
              </option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <button type="submit" class="btn btn-success me-1">
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
            <button type="button" @click="resetForm" class="btn btn-secondary me-1">Reset</button>
            <button v-if="isEdit" type="button" @click="deleteCurrentCategory" class="btn btn-danger">Xóa</button>
          </div>
        </form>
      </div>

      <!-- Danh sách danh mục dạng menu xổ xuống -->
      <div>
        <h5 class="text-dark">Danh sách danh mục</h5>
        <ul class="list-group">
          <li v-for="cat in categories" :key="cat.categoryID" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <button class="btn btn-link text-decoration-none text-dark p-0 me-2"
                        @click="cat.expanded = !cat.expanded">
                  <span v-if="cat.children?.length"></span>
                  {{ cat.categoryName }}
                </button>
              </div>
              <div>
                <button @click="editCategory(cat)" class="btn btn-sm btn-outline-primary me-2">Sửa</button>
                <button @click="deleteCategory(cat.categoryID)" class="btn btn-sm btn-outline-danger">Xóa</button>
              </div>
            </div>

            <!-- Danh mục con -->
            <ul v-if="cat.expanded && cat.children?.length" class="list-group mt-2 ps-4">
              <li v-for="child in cat.children" :key="child.categoryID" class="list-group-item d-flex justify-content-between align-items-center">
                <span>↳ {{ child.categoryName }}</span>
                <div>
                  <!-- Nút Sửa -->
<button @click="editCategory(child)" class="btn btn-sm btn-outline-primary me-2" title="Chỉnh sửa">
  <i class="fas fa-edit"></i>
</button>

<!-- Nút Xóa -->
<button @click="deleteCategory(child.categoryID)" class="btn btn-sm btn-outline-danger" title="Xóa">
  <i class="fas fa-trash-alt"></i>
</button>

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
import CategoryRow from './CategoryRow.vue'

const categories = ref([])
const flatCategoryList = ref([])
const form = ref({ categoryID: '', categoryName: '', parentID: '' })
const isEdit = ref(false)
const searchKeyword = ref('')
const parentCategoryList = ref([])

// Load dữ liệu danh mục
const loadCategories = async () => {
  const res = await api.get('/admin/category', { withCredentials: true })
  categories.value = res.data
  flatCategoryList.value = flattenTree(res.data)
  parentCategoryList.value = res.data.filter(cat => !cat.parentID)
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
    if (isEdit.value) {
      await api.put(`/admin/category/${form.value.categoryID}`, form.value, { withCredentials: true })
    } else {
      await api.post('/admin/category', form.value, { withCredentials: true })
    }
    resetForm()
    await loadCategories()
  } catch (err) {
    alert(err.response?.data || 'Lỗi thao tác')
  }
}

const resetForm = () => {
  form.value = { categoryID: '', categoryName: '', parentID: '' }
  isEdit.value = false
}

const editCategory = (cat) => {
  form.value = { ...cat }
  isEdit.value = true
}

const deleteCategory = async (id) => {
  if (confirm('Bạn có chắc muốn xóa?')) {
    try {
      await api.delete(`/admin/category/${id}`, { withCredentials: true })
      await loadCategories()
    } catch (err) {
      alert(err.response?.data || 'Không thể xóa')
    }
  }
}

const searchCategory = async () => {
  if (!searchKeyword.value.trim()) return loadCategories()
  const res = await api.get(`/admin/category/search?name=${encodeURIComponent(searchKeyword.value)}`, { withCredentials: true })
  categories.value = res.data
  flatCategoryList.value = flattenTree(res.data)
}

const deleteCurrentCategory = async () => {
  if (!form.value.categoryID) return
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return

  try {
    await api.delete(`/admin/category/${form.value.categoryID}`, { withCredentials: true })
    await loadCategories()
    resetForm()
  } catch (err) {
    alert(err.response?.data || 'Lỗi khi xóa danh mục')
  }
}


onMounted(loadCategories)
</script>

<style scoped>
.btn-link:hover {
  text-decoration: none;
  color: #0d6efd;
}
.list-group-item {
  border: none;
  border-bottom: 1px solid #eee;
}
</style>

