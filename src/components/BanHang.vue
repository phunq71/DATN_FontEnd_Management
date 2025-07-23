<template>
  <div class="sales-container">
    <!-- Header -->
    <div class="sales-header">
      <h1>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bán hàng</h1>
      <div class="header-actions">
        <button class="btn secondary">
          <i class="fas fa-history"></i> Lịch sử
        </button>
        <button class="btn primary">
          <i class="fas fa-save"></i> Lưu tạm
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="sales-content">
      <!-- Left Column - Product Management -->
      <div class="product-column">
        <!-- Product Scan Section -->
        <div class="scan-section">
          <div class="section-header">
            <h3>Quét mã sản phẩm</h3>
            <button class="btn icon">
              <i class="fas fa-qrcode"></i>
            </button>
          </div>
          <div class="scan-input">
            <input
                type="text"
                placeholder="Nhập mã sản phẩm hoặc quét QR..."
                v-model="productInput"
                @keyup.enter="addProduct"
            >
            <i class="fas fa-barcode"></i>
          </div>
        </div>

        <!-- Selected Products -->
        <div class="products-section">
          <div class="section-header">
            <h3>Sản phẩm đã chọn ({{ selectedProducts.length }})</h3>
            <button
                class="btn text danger"
                @click="clearAll"
                :disabled="!selectedProducts.length"
            >
              <i class="fas fa-trash-alt"></i> Xóa tất cả
            </button>
          </div>

          <div class="product-list">
            <div
                class="product-item"
                v-for="(product, index) in selectedProducts"
                :key="product.id"
            >
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">{{ formatCurrency(product.price) }}</div>
              </div>
              <div class="product-actions">
                <button
                    class="btn quantity-btn"
                    @click="decreaseQuantity(product)"
                    :disabled="product.quantity <= 1"
                >
                  -
                </button>
                <span class="quantity">{{ product.quantity }}</span>
                <button class="btn quantity-btn" @click="increaseQuantity(product)">
                  +
                </button>
                <button class="btn icon danger" @click="removeProduct(index)">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Customer & Payment -->
      <div class="customer-column">
        <!-- Customer Info -->
        <div class="customer-section">
          <div class="section-header">
            <h3>Khách hàng</h3>
            <div class="customer-actions">
              <button class="btn icon">
                <i class="fas fa-qrcode"></i>
              </button>
              <button class="btn icon">
                <i class="fas fa-phone"></i>
              </button>
            </div>
          </div>

          <div class="customer-input">
            <input
                type="text"
                placeholder="Nhập số điện thoại hoặc quét QR khách hàng..."
                v-model="customerInput"
            >
          </div>

          <!-- Customer Details -->
          <div class="customer-details" v-if="currentCustomer">
            <div class="customer-info">
              <div class="avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="info">
                <div class="name">{{ currentCustomer.name }}</div>
                <div class="phone">{{ currentCustomer.phone }}</div>
              </div>
              <div class="points">
                <i class="fas fa-star"></i> {{ currentCustomer.points }} điểm
              </div>
            </div>

            <!-- Customer Vouchers -->
            <div class="vouchers-section">
              <h4>Voucher có thể dùng</h4>
              <div class="voucher-list">
                <div
                    class="voucher-item"
                    v-for="voucher in currentCustomer.vouchers"
                    :key="voucher.id"
                >
                  <div class="voucher-discount">{{ voucher.value }}%</div>
                  <div class="voucher-info">
                    <div class="voucher-name">{{ voucher.name }}</div>
                    <div class="voucher-expiry">HSD: {{ voucher.expiry }}</div>
                  </div>
                  <button class="btn small">Dùng</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="payment-section">
          <div class="summary-row">
            <span>Tạm tính:</span>
            <span>{{ formatCurrency(subTotal) }}</span>
          </div>
          <div class="summary-row">
            <span>Giảm giá:</span>
            <span>-{{ formatCurrency(discount) }}</span>
          </div>
          <div class="summary-row total">
            <span>Tổng cộng:</span>
            <span>{{ formatCurrency(total) }}</span>
          </div>

          <div class="payment-methods">
            <button
                class="method-btn"
                :class="{ active: selectedPayment === 1 }"
                @click="selectedPayment = 1"
            >
              <i class="fas fa-money-bill-wave"></i> Tiền mặt
            </button>
            <button
                class="method-btn"
                :class="{ active: selectedPayment === 2 }"
                @click="selectedPayment = 2"
            >
              <i class="fas fa-university"></i> Chuyển khoản
            </button>
          </div>

          <button class="btn checkout-btn" :disabled="!selectedProducts.length">
            <i class="fas fa-credit-card"></i> THANH TOÁN
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Sample data
const productInput = ref('');
const customerInput = ref('');
const selectedPayment = ref(1);

const selectedProducts = ref([
  { id: 1, name: 'Áo thun nam trắng', price: 150000, quantity: 1 },
  { id: 2, name: 'Quần jean nam đen', price: 350000, quantity: 1 },
  { id: 3, name: 'Giày thể thao trắng', price: 500000, quantity: 1 }
]);

const currentCustomer = ref({
  id: 1,
  name: 'Nguyễn Văn A',
  phone: '0987654321',
  points: 1250,
  vouchers: [
    { id: 1, name: 'Giảm 10% đơn hàng', value: 10, expiry: '30/06/2023' },
    { id: 2, name: 'Giảm 50k đơn từ 500k', value: 50000, expiry: '15/07/2023' }
  ]
});

// Computed
const subTotal = computed(() => {
  return selectedProducts.value.reduce((sum, product) => sum + (product.price * product.quantity), 0);
});

const discount = computed(() => {
  return 0; // Will calculate based on vouchers later
});

const total = computed(() => {
  return subTotal.value - discount.value;
});

// Methods
const addProduct = () => {
  if (!productInput.value) return;

  // In real app, this would search product from database
  const newProduct = {
    id: Date.now(),
    name: `Sản phẩm ${productInput.value}`,
    price: Math.floor(Math.random() * 500000) + 50000,
    quantity: 1
  };

  selectedProducts.value.push(newProduct);
  productInput.value = '';
};

const increaseQuantity = (product) => {
  product.quantity++;
};

const decreaseQuantity = (product) => {
  if (product.quantity > 1) product.quantity--;
};

const removeProduct = (index) => {
  selectedProducts.value.splice(index, 1);
};

const clearAll = () => {
  selectedProducts.value = [];
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};
</script>

<style scoped>
.sales-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
  font-family: 'Inter', sans-serif;
}

.sales-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.sales-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.sales-content {
  display: flex;
  flex: 1;
  padding: 16px;
  gap: 16px;
  overflow: hidden;
}

.product-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.customer-column {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Common Section Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Scan Section */
.scan-section, .customer-section, .payment-section {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.scan-input, .customer-input {
  position: relative;
}

.scan-input input, .customer-input input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.scan-input i, .customer-input i {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
}

/* Product List */
.products-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-item {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.product-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.product-name {
  font-weight: 500;
}

.product-price {
  font-weight: 600;
  color: #1f2937;
}

.product-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: #f3f4f6;
  border: none;
}

.quantity {
  min-width: 20px;
  text-align: center;
}

/* Customer Section */
.customer-actions {
  display: flex;
  gap: 8px;
}

.customer-details {
  margin-top: 16px;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.info {
  flex: 1;
}

.name {
  font-weight: 500;
}

.phone {
  font-size: 13px;
  color: #6b7280;
}

.points {
  font-size: 14px;
  color: #f59e0b;
  font-weight: 500;
}

/* Vouchers */
.vouchers-section {
  margin-top: 16px;
}

.vouchers-section h4 {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.voucher-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.voucher-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.voucher-discount {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.voucher-info {
  flex: 1;
}

.voucher-name {
  font-size: 14px;
  font-weight: 500;
}

.voucher-expiry {
  font-size: 12px;
  color: #6b7280;
}

/* Payment Section */
.payment-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.summary-row.total {
  font-weight: 600;
  font-size: 16px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.payment-methods {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.method-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.method-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
  color: #3b82f6;
}

.checkout-btn {
  width: 100%;
  padding: 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  margin-top: 8px;
}

.checkout-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* Button Styles */
.btn {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}

.btn.secondary {
  background: white;
  border-color: #e5e7eb;
  color: #4b5563;
}

.btn.icon {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
}

.btn.text {
  background: transparent;
  border: none;
  padding: 4px 8px;
}

.btn.text.danger {
  color: #ef4444;
}

.btn.small {
  padding: 4px 8px;
  font-size: 13px;
}

.btn.danger {
  background: #fee2e2;
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .sales-content {
    flex-direction: column;
  }

  .customer-column {
    width: 100%;
  }
}
</style>