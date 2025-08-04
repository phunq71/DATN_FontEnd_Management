<script setup>
import { ref, computed } from 'vue';

// Tab management
const activeTab = ref(1);

// Product data
const product = ref({
  id: '',
  name: '',
  description: '',
  createdDate: new Date().toISOString().split('T')[0],
  targetCustomer: 'UNISEX',
  brand: '',
  categoryName: ''
});

// Variants data
const variants = ref([]);
const selectedVariant = ref({
  id: '',
  color: '',
  images: [],
  createdDate: '',
  price: 0,
  discount: 0,
  isMainVariant: false,
  isUse: true,
  description: ''
});
const flagCreate = ref(false);
const VaNew = ref({
  id: '',
  color: '',
  images: [],
  createdDate: new Date().toISOString().split('T')[0],
  price: 0,
  discount: 0,
  isMainVariant: false,
  isUse: true,
  description: ''
});

// Size matrix data
const sizeCodes = ref(['S', 'M', 'L', 'XL', 'XXL']);
const sizeMatrix = ref([]);

// Color options
const colorOptions = ref([
  { ten: 'Đỏ', tenTiengAnh: 'Red' },
  { ten: 'Xanh dương', tenTiengAnh: 'Blue' },
  { ten: 'Xanh lá', tenTiengAnh: 'Green' },
  { ten: 'Vàng', tenTiengAnh: 'Yellow' },
  { ten: 'Đen', tenTiengAnh: 'Black' },
  { ten: 'Trắng', tenTiengAnh: 'White' }
]);

// Computed property for selected color
const selectedColor = computed(() => {
  const color = colorOptions.value.find(c => c.ten === selectedVariant.value.color);
  if (!color) return 'transparent';

  const colorMap = {
    'Đỏ': '#ff0000',
    'Xanh dương': '#0000ff',
    'Xanh lá': '#00ff00',
    'Vàng': '#ffff00',
    'Đen': '#000000',
    'Trắng': '#ffffff'
  };

  return colorMap[color.ten] || 'transparent';
});

// Methods
const saveProduct = () => {
  console.log('Product saved:', product.value);
};

const deleteProduct = () => {
  console.log('Product deleted');
};

const openEditModal = (variant) => {
  selectedVariant.value = JSON.parse(JSON.stringify(variant));
};

const openFileDialog = () => {
  // Implementation for file dialog
};

const handleImageUpload = (event) => {
  // Implementation for image upload
};

const removeImage = (index) => {
  selectedVariant.value.images.splice(index, 1);
};

const setMainImage = (index) => {
  selectedVariant.value.images.forEach((img, i) => {
    img.isMain = i === index;
  });
};

const saveVariant = () => {
  if (flagCreate.value) {
    // Add new variant
    variants.value.push(selectedVariant.value);
  } else {
    // Update existing variant
    const index = variants.value.findIndex(v => v.id === selectedVariant.value.id);
    if (index !== -1) {
      variants.value[index] = selectedVariant.value;
    }
  }
};

const isChecked = (size, variantId) => {
  return sizeMatrix.value.some(item =>
      item.size === size && item.variantId === variantId
  );
};

const toggleSize = (size, variantId, checked) => {
  if (checked) {
    sizeMatrix.value.push({ size, variantId });
  } else {
    const index = sizeMatrix.value.findIndex(item =>
        item.size === size && item.variantId === variantId
    );
    if (index !== -1) {
      sizeMatrix.value.splice(index, 1);
    }
  }
};
</script>

<template>
  <div class="product-management-container">
    <div class="tabs-header">
      <button
          @click="activeTab = 1"
          :class="{ active: activeTab === 1 }"
      >
        <i class="fas fa-info-circle"></i> Product Info
      </button>
      <button
          @click="activeTab = 2"
          :class="{ active: activeTab === 2 }"
      >
        <i class="fas fa-palette"></i> Variants
      </button>
      <button
          @click="activeTab = 3"
          :class="{ active: activeTab === 3 }"
      >
        <i class="fas fa-ruler-combined"></i> Size Matrix
      </button>
    </div>

    <!-- Tab 1: Product Info -->
    <div v-if="activeTab === 1" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-cube"></i> Product Information</h2>
        </div>
        <div class="card-body">
          <div v-if="product" class="product-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Product ID</label>
                <input type="text" v-model="product.id" readonly class="form-control">
              </div>

              <div class="form-group">
                <label>Product Name <span class="required">*</span></label>
                <input type="text" v-model="product.name" class="form-control">
              </div>

              <div class="form-group span-2">
                <label>Description</label>
                <textarea v-model="product.description" class="form-control" rows="3" placeholder="Enter product description..."></textarea>
              </div>

              <div class="form-group">
                <label>Created Date</label>
                <input type="date" v-model="product.createdDate" readonly class="form-control">
              </div>

              <div class="form-group">
                <label>Target Customer</label>
                <select v-model="product.targetCustomer" class="form-control">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNISEX">Unisex</option>
                  <option value="MIDDLE-AGED">Middle-aged</option>
                  <option value="CHILD">Child</option>
                </select>
              </div>

              <div class="form-group">
                <label>Brand <span class="required">*</span></label>
                <input type="text" v-model="product.brand" class="form-control">
              </div>

              <div class="form-group">
                <label>Category</label>
                <input type="text" v-model="product.categoryName" readonly class="form-control">
              </div>
            </div>

            <div class="form-actions">
              <button @click="deleteProduct" class="btn btn-danger">
                <i class="fas fa-trash-alt"></i> Delete Product
              </button>
              <button @click="saveProduct" class="btn btn-primary">
                <i class="fas fa-save"></i> Save Product
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-footer">
        <button @click="activeTab = 2" class="btn btn-next">
          Next: Variants <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Tab 2: Variants -->
    <div v-if="activeTab === 2" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-palette"></i> Product Variants</h2>
          <button @click="openEditModal(VaNew); flagCreate = true;" class="btn btn-success btn-sm">
            <i class="fas fa-plus"></i> Add Variant
          </button>
        </div>

        <div class="card-body variant-management">
          <div class="variant-editor">
            <div class="editor-card">
              <h3>{{ flagCreate ? 'Add New Variant' : 'Edit Variant' }}</h3>

              <div class="form-row">
                <div class="form-group">
                  <label>Variant ID</label>
                  <input type="text" v-model="selectedVariant.id" disabled class="form-control">
                </div>
                <div class="form-group">
                  <label>Create Date</label>
                  <input type="text" v-model="selectedVariant.createdDate" disabled class="form-control">
                </div>
              </div>

              <div class="image-upload-section">
                <label>Product Images</label>
                <div class="image-preview-container">
                  <div
                      v-for="(img, index) in selectedVariant.images"
                      :key="index"
                      class="image-preview"
                  >
                    <img
                        :src="img.isNew ? img.preview : 'http://localhost:8989/uploads/' + img.fileName"
                        alt="Product image"
                    >
                    <button @click="removeImage(index)" class="delete-image-btn">
                      <i class="fas fa-times"></i>
                    </button>
                    <label class="main-image-label">
                      <input
                          type="radio"
                          name="mainImage"
                          :checked="img.isMain"
                          @change="setMainImage(index)"
                      />
                      Main
                    </label>
                  </div>

                  <button @click="openFileDialog" class="add-image-btn">
                    <i class="fas fa-plus"></i>
                  </button>
                  <input
                      type="file"
                      ref="imageInput"
                      multiple
                      accept="image/*"
                      style="display: none"
                      @change="handleImageUpload"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Color</label>
                  <div class="color-selection">
                    <span class="color-preview" :style="{ backgroundColor: selectedColor }"></span>
                    <select v-model="selectedVariant.color" class="form-control">
                      <option v-for="(color, index) in colorOptions" :key="index" :value="color.ten">
                        {{ color.ten }} ({{ color.tenTiengAnh }})
                      </option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Price (VND)</label>
                  <input type="number" v-model="selectedVariant.price" class="form-control">
                </div>
              </div>

              <div class="form-row">
                <div class="form-check">
                  <input type="checkbox" v-model="selectedVariant.isMainVariant" class="form-check-input">
                  <label class="form-check-label">Main Variant</label>
                </div>
                <div class="form-check">
                  <input type="checkbox" v-model="selectedVariant.isUse" class="form-check-input">
                  <label class="form-check-label">In Use</label>
                </div>
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea v-model="selectedVariant.description" class="form-control" rows="3"></textarea>
              </div>

              <div class="form-actions">
                <button @click="saveVariant" class="btn btn-primary">
                  <i class="fas fa-save"></i> {{ flagCreate ? 'Create Variant' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>

          <div class="variant-list">
            <div class="table-responsive">
              <table class="variants-table">
                <thead>
                <tr>
                  <th>Variant ID</th>
                  <th>Color</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="variant in variants" :key="variant.id">
                  <td>{{ variant.id }}</td>
                  <td>
                      <span class="color-badge" :style="{ backgroundColor: getColorCode(variant.color) }">
                        {{ variant.color }}
                      </span>
                  </td>
                  <td>
                    <img
                        v-if="variant.images.length > 0"
                        :src="'http://localhost:8989/uploads/' + variant.images.find(img => img.isMain)?.fileName || variant.images[0].fileName"
                        alt="Variant image"
                        class="variant-thumbnail"
                    >
                    <span v-else class="no-image">No Image</span>
                  </td>
                  <td class="price-cell">
                    <div v-if="variant.discount && variant.discount < variant.price">
                      <span class="original-price">{{ formatPrice(variant.price) }}</span>
                      <span class="discount-price">{{ formatPrice(variant.discount) }}</span>
                    </div>
                    <div v-else>
                      {{ formatPrice(variant.price) }}
                    </div>
                  </td>
                  <td>
                      <span :class="['status-badge', variant.isUse ? 'active' : 'inactive']">
                        {{ variant.isUse ? 'Active' : 'Inactive' }}
                      </span>
                    <span v-if="variant.isMainVariant" class="main-badge">Main</span>
                  </td>
                  <td>
                    <button @click="openEditModal(variant); flagCreate = false" class="btn btn-sm btn-edit">
                      <i class="fas fa-edit"></i> Edit
                    </button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="tab-footer">
        <button @click="activeTab = 1" class="btn btn-prev">
          <i class="fas fa-arrow-left"></i> Previous: Product Info
        </button>
        <button @click="activeTab = 3" class="btn btn-next">
          Next: Size Matrix <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <!-- Tab 3: Size Matrix -->
    <div v-if="activeTab === 3" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-ruler-combined"></i> Size Matrix</h2>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="size-matrix-table">
              <thead>
              <tr>
                <th>Variant ID</th>
                <th v-for="size in sizeCodes" :key="size">{{ size }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="variant in variants" :key="variant.id">
                <td>{{ variant.id }}</td>
                <td v-for="size in sizeCodes" :key="size">
                  <label class="size-checkbox">
                    <input
                        type="checkbox"
                        :checked="isChecked(size, variant.id)"
                        @change="toggleSize(size, variant.id, $event.target.checked)"
                    />
                    <span class="checkmark"></span>
                  </label>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="tab-footer">
        <button @click="activeTab = 2" class="btn btn-prev">
          <i class="fas fa-arrow-left"></i> Previous: Variants
        </button>
        <button @click="saveProduct" class="btn btn-success">
          <i class="fas fa-check"></i> Complete & Save Product
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base Styles */
.product-management-container {
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

/* Tabs */
.tabs-header {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.tabs-header button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tabs-header button:hover {
  color: #068520;
}

.tabs-header button.active {
  border-bottom: 3px solid #068520;
  color: #068520;
  font-weight: 600;
}

.tabs-header button i {
  font-size: 16px;
}

/* Card Styles */
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

.card-header {
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-body {
  padding: 24px;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group.span-2 {
  grid-column: span 2;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.required {
  color: #e53935;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #068520;
  outline: none;
  box-shadow: 0 0 0 2px rgba(6, 133, 32, 0.1);
}

.form-control[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

textarea.form-control {
  min-height: 80px;
  resize: vertical;
}

select.form-control {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23333' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

/* Button Styles */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn-primary {
  background-color: #068520;
  color: white;
}

.btn-primary:hover {
  background-color: #056a1a;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-edit {
  background-color: #17a2b8;
  color: white;
}

.btn-edit:hover {
  background-color: #138496;
}

.btn-prev {
  background-color: #6c757d;
  color: white;
}

.btn-prev:hover {
  background-color: #5a6268;
}

.btn-next {
  background-color: #068520;
  color: white;
}

.btn-next:hover {
  background-color: #056a1a;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* Variant Management */
.variant-management {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
}

.variant-editor {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
}

.editor-card {
  background: white;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.editor-card h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  width: 16px;
  height: 16px;
  margin: 0;
}

.form-check-label {
  margin: 0;
  font-weight: normal;
}

/* Image Upload */
.image-upload-section {
  margin-bottom: 20px;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.image-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-preview:hover .delete-image-btn {
  opacity: 1;
}

.main-image-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  padding: 2px;
  text-align: center;
  cursor: pointer;
}

.main-image-label input {
  margin-right: 4px;
}

.add-image-btn {
  width: 80px;
  height: 80px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.add-image-btn:hover {
  border-color: #068520;
  color: #068520;
  background: rgba(6, 133, 32, 0.05);
}

/* Color Selection */
.color-selection {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

/* Variant List */
.variant-list {
  overflow-x: auto;
}

.variants-table {
  width: 100%;
  border-collapse: collapse;
}

.variants-table th {
  background-color: #f8f9fa;
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
}

.variants-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.variants-table tr:hover td {
  background-color: #f8f9fa;
}

.variant-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #eee;
}

.no-image {
  color: #999;
  font-size: 13px;
}

.color-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  background-color: #666;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.main-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background-color: #cce5ff;
  color: #004085;
}

.price-cell {
  font-weight: 500;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 13px;
  display: block;
}

.discount-price {
  color: #dc3545;
  font-weight: 600;
}

/* Size Matrix */
.size-matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.size-matrix-table th {
  background-color: #f8f9fa;
  text-align: center;
  padding: 12px;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #e0e0e0;
}

.size-matrix-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.size-checkbox {
  display: inline-block;
  position: relative;
  padding-left: 25px;
  cursor: pointer;
  user-select: none;
}

.size-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #eee;
  border-radius: 4px;
  transition: all 0.3s;
}

.size-checkbox:hover input ~ .checkmark {
  background-color: #ddd;
}

.size-checkbox input:checked ~ .checkmark {
  background-color: #068520;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.size-checkbox input:checked ~ .checkmark:after {
  display: block;
}

.size-checkbox .checkmark:after {
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Tab Footer */
.tab-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Responsive */
@media (max-width: 1200px) {
  .variant-management {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group.span-2 {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .tabs-header {
    flex-wrap: wrap;
  }

  .tabs-header button {
    flex: 1;
    min-width: 120px;
    padding: 10px;
    font-size: 13px;
  }

  .form-row {
    flex-direction: column;
    gap: 16px;
  }
}
</style>