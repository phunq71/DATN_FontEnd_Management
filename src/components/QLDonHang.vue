<template>
 
  <div class="order-management-container">
    <div class="title-first">
      <h1>Quản lý đơn hàng</h1>
    </div>
    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-row">
         <input 
          v-model="filters.search" 
          type="text" 
          placeholder="Tìm kiếm đơn hàng..." 
          class="search-input"
        >
        <select v-model="filters.orderType" class="filter-select">
          <option value="all">Toàn bộ cửa hàng</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
        
        <select v-model="filters.area" class="filter-select">
          <option value="">Khu vực</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">{{ area.name }}</option>
        </select>
        
        <select v-model="filters.store" class="filter-select">
          <option value="">Cửa hàng</option>
          <option v-for="store in stores" :key="store.id" :value="store.id">{{ store.name }}</option>
        </select>
        
        <select v-model="filters.year" class="filter-select">
          <option value="">Năm</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
        
        <select v-model="filters.month" class="filter-select">
          <option value="">Tháng</option>
          <option v-for="month in months" :key="month.value" :value="month.value">{{ month.label }}</option>
        </select>

        <select v-model="filters.day" class="filter-select">
          <option value="">Ngày</option>
          <option v-for="day in 31" :key="day" :value="day">{{ day }}</option>
        </select>

      </div>
    </div>

    <!-- Orders Table -->
    <div class="table-container">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Ngày đặt hàng</th>
            <th>Trạng thái</th>
            <th>Tỉnh giao</th>
            <th>Loại đơn</th>
            <th>Khách hàng</th>
            <th>Nhân viên</th>
            <th>Cập nhật đơn</th>
            <th>Loại GD</th>
            <th>Ngày GD</th>
            <th>Thành tiền</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.OrderID">
            <td>{{ order.OrderID }}</td>
            <td>{{ formatDateTime(order.OrderDate) }}</td>
            <td>
              <span :class="'status-' + order.Status.toLowerCase().replace(' ', '-')">
                {{ getStatusText(order.Status) }}
              </span>
            </td>
            <td>{{ getProvince(order.ShippingAddress) }}</td>
            <td>{{ order.IsOnline ? 'Online' : 'Trực tiếp' }}</td>
            <td>{{ order.CustomerName }}</td>
            <td>{{ order.StaffName }}</td>
            <td>{{ formatDate(order.UpdatedAt) }}</td>
            <td>{{ order.TransactionType }}</td>
            <td>{{ formatDate(order.TransactionDate) }}</td>
            <td>{{ formatCurrency(order.TotalAmount) }}</td>
            <td>
              <button @click="showOrderDetail(order)" class="view-detail-btn">
                Xem chi tiết
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          &lt;
        </button>
        
        <span class="page-info">
          Trang {{ currentPage }} / {{ totalPages }}
        </span>
        
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          &gt;
        </button>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Chi tiết đơn hàng #{{ selectedOrder.OrderID }}</h3>
          <button @click="closeModal" class="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <!-- Order Information -->
          <div class="detail-section">
            <h4>Thông tin đơn hàng</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label><strong>Mã đơn:</strong></label>
                <label>{{ selectedOrder.OrderID }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Ngày đặt:</strong></label>
                <label>{{ formatDateTime(selectedOrder.OrderDate) }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Trạng thái:</strong></label>
                <label>{{ getStatusText(selectedOrder.Status) }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Địa chỉ giao:</strong></label>
                <label>{{ selectedOrder.ShippingAddress }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Ghi chú:</strong></label>
                <label>{{ selectedOrder.Note || 'Không có' }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Loại đơn:</strong></label>
                <label>{{ selectedOrder.IsOnline ? 'Online' : 'Trực tiếp' }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Phương thức VC:</strong></label>
                <label>{{ selectedOrder.ShipMethod }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Khách hàng:</strong></label>
                <label>{{ selectedOrder.CustomerName }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Nhân viên:</strong></label>
                <label>{{ selectedOrder.StaffName }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Cửa hàng:</strong></label>
                <label>{{ selectedOrder.FacilityName }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Cập nhật đơn:</strong></label>
                <label>{{ formatDateTime(selectedOrder.UpdatedAt) }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Mã GHN:</strong></label>
                <label>{{ selectedOrder.shippingCode || 'Không có' }}</label>
              </div>
            </div>
          </div>

          <!-- Products Information -->
          <div class="detail-section">
            <h4>Thông tin sản phẩm</h4>
            <div class="products-grid">
              <div 
                v-for="(product, index) in visibleProducts" 
                :key="index" 
                class="product-item"
              >
                <div class="product-image">
                  <img :src="product.image" :alt="product.name">
                </div>
                <div class="product-info">
                  <label><strong>Tên SP:</strong> {{ product.name }}</label>
                  <label v-if="product.originalPrice > product.price">
                    <strong>Giá gốc:</strong> 
                    <span class="original-price">{{ formatCurrency(product.originalPrice) }}</span>
                  </label>
                  <label><strong>Giá bán:</strong> {{ formatCurrency(product.price) }}</label>
                  <label><strong>Số lượng:</strong> {{ product.quantity }}</label>
                  <label><strong>Tổng:</strong> {{ formatCurrency(product.price * product.quantity) }}</label>
                </div>
              </div>
            </div>
            
            <button 
              v-if="selectedOrder.Products.length > 3" 
              @click="showAllProducts = !showAllProducts"
              class="show-more-btn"
            >
              {{ showAllProducts ? 'Ẩn bớt' : `Xem thêm (${selectedOrder.Products.length - 3})` }}
            </button>
          </div>

          <!-- Transaction Information -->
          <div class="detail-section">
            <h4>Thông tin thanh toán</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label><strong>Mã giao dịch:</strong></label>
                <label>{{ selectedOrder.Transaction.TransactionID }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Mã thanh toán:</strong></label>
                <label>{{ selectedOrder.Transaction.PaymentCode }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Loại giao dịch:</strong></label>
                <label>{{ selectedOrder.Transaction.TransactionType }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Ngày GD:</strong></label>
                <label>{{ formatDateTime(selectedOrder.Transaction.TransactionDate) }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Mô tả:</strong></label>
                <label>{{ selectedOrder.Transaction.Description }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Trạng thái:</strong></label>
                <label>{{ selectedOrder.Transaction.Status }}</label>
              </div>
              <div class="detail-item">
                <label><strong>NV xử lý:</strong></label>
                <label>{{ selectedOrder.Transaction.StaffName }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Người duyệt:</strong></label>
                <label>{{ selectedOrder.Transaction.Approver }}</label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
        <div v-if="showRejectReason" class="reject-reason-input">
           <label><strong>Lý do từ chối:</strong></label>
            <textarea
              v-model="rejectReason" 
              placeholder="Nhập lý do từ chối đơn hàng"
              class="reason-input"
              rows="4"
            ></textarea>
        </div>
        <button 
            @click="toggleRejectReason" 
            class="reject-btn"
            :class="{ 'cancel-reject': showRejectReason }"
          >
            {{ showRejectReason ? 'Hủy từ chối' : 'Từ chối đơn hàng' }}
          </button>
            <button 
              v-if="showRejectReason"
              @click="rejectOrder" 
              class="submit-reject-btn"
            >
              Gửi từ chối
              </button>
        <div class="action-buttons">
          <button @click="confirmOrder" class="confirm-btn">
            Xác nhận đơn hàng
          </button>
          
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Filter data
const filters = ref({
  orderType: 'all',
  area: '',
  store: '',
  year: '',
  month: '',
  day: '',
  search: ''
});

const areas = ref([
  { id: 1, name: 'Miền Bắc' },
  { id: 2, name: 'Miền Trung' },
  { id: 3, name: 'Miền Nam' }
]);

const stores = ref([
  { id: 1, name: 'Cửa hàng Hà Nội', areaId: 1 },
  { id: 2, name: 'Cửa hàng Đà Nẵng', areaId: 2 },
  { id: 3, name: 'Cửa hàng Hồ Chí Minh', areaId: 3 }
]);

const years = ref(Array.from({length: 5}, (_, i) => new Date().getFullYear() - i));
const months = ref([
  { value: 1, label: 'Tháng 1' },
  { value: 2, label: 'Tháng 2' },
  { value: 3, label: 'Tháng 3' },
  { value: 4, label: 'Tháng 4' },
  { value: 5, label: 'Tháng 5' },
  { value: 6, label: 'Tháng 6' },
  { value: 7, label: 'Tháng 7' },
  { value: 8, label: 'Tháng 8' },
  { value: 9, label: 'Tháng 9' },
  { value: 10, label: 'Tháng 10' },
  { value: 11, label: 'Tháng 11' },
  { value: 12, label: 'Tháng 12' }
]);

// Modal state
const showModal = ref(false);
const selectedOrder = ref(null);
const showAllProducts = ref(false);

// Sample data
const orders = ref([
  {
    OrderID: 'ORD001',
    OrderDate: '2023-05-15T14:30:00',
    Status: 'Chờ xác nhận',
    ShippingAddress: '123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM',
    Province: 'TP.HCM',
    Note: 'Giao hàng trước 17h',
    IsOnline: true,
    ShipMethod: 'Giao hàng nhanh',
    CustomerID: 'CUS001',
    CustomerName: 'Nguyễn Văn A',
    StaffID: 'STAFF001',
    StaffName: 'Trần Thị B',
    FacilityID: 'STORE001',
    FacilityName: 'Cửa hàng Hà Nội',
    UpdatedAt: '2023-05-15T14:35:00',
    TransactionType: 'Thanh toán online',
    TransactionDate: '2023-05-15T14:32:00',
    TotalAmount: 1250000,
    shippingCode: 'GHN001',
    Products: [
      {
        id: 'P001',
        name: 'iPhone 13 Pro Max',
        image: 'https://example.com/iphone.jpg',
        price: 25000000,
        originalPrice: 28000000,
        quantity: 1
      },
      {
        id: 'P002',
        name: 'AirPods Pro',
        image: 'https://example.com/airpods.jpg',
        price: 5000000,
        originalPrice: 5000000,
        quantity: 2
      },
      {
        id: 'P003',
        name: 'Sạc MagSafe',
        image: 'https://example.com/magsafe.jpg',
        price: 1200000,
        originalPrice: 1500000,
        quantity: 1
      },
       {
        id: 'P003',
        name: 'Sạc MagSafe',
        image: 'https://example.com/magsafe.jpg',
        price: 1200000,
        originalPrice: 1500000,
        quantity: 1
      },
       {
        id: 'P003',
        name: 'Sạc MagSafe',
        image: 'https://example.com/magsafe.jpg',
        price: 1200000,
        originalPrice: 1500000,
        quantity: 1
      },
       {
        id: 'P003',
        name: 'Sạc MagSafe',
        image: 'https://example.com/magsafe.jpg',
        price: 1200000,
        originalPrice: 1500000,
        quantity: 1
      }
    ],
    Transaction: {
      TransactionID: 'TRANS001',
      PaymentCode: 'PAY001',
      TransactionType: 'Thanh toán đơn hàng',
      TransactionDate: '2023-05-15T14:32:00',
      Description: 'Thanh toán cho đơn hàng ORD001',
      Status: 'Hoàn thành',
      StaffName: 'Trần Thị B',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  },
  {
    OrderID: 'ORD002',
    OrderDate: '2023-05-16T09:15:00',
    Status: 'Chờ lấy hàng',
    ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
    Province: 'Hà Nội',
    Note: '',
    IsOnline: false,
    ShipMethod: 'Giao hàng tiết kiệm',
    CustomerID: 'CUS002',
    CustomerName: 'Lê Văn C',
    StaffID: 'STAFF002',
    StaffName: 'Phạm Thị D',
    FacilityID: 'STORE002',
    FacilityName: 'Cửa hàng Đà Nẵng',
    UpdatedAt: '2023-05-16T10:30:00',
    TransactionType: 'Thanh toán trực tiếp',
    TransactionDate: '2023-05-16T09:20:00',
    TotalAmount: 7500000,
    shippingCode: 'GHN002',
    Products: [
      {
        id: 'P004',
        name: 'MacBook Air M1',
        image: 'https://example.com/macbook.jpg',
        price: 22000000,
        originalPrice: 25000000,
        quantity: 1
      },
      {
        id: 'P005',
        name: 'USB-C Cable',
        image: 'https://example.com/usbc.jpg',
        price: 300000,
        originalPrice: 300000,
        quantity: 3
      }
    ],
    Transaction: {
      TransactionID: 'TRANS002',
      PaymentCode: 'PAY002',
      TransactionType: 'Thanh toán trực tiếp',
      TransactionDate: '2023-05-16T09:20:00',
      Description: 'Thanh toán tại cửa hàng',
      Status: 'Hoàn thành',
      StaffName: 'Phạm Thị D',
      Approver: 'Nguyễn Văn C'
    }
  }
]);

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Computed properties
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    // Filter by search text
    if (filters.value.search && 
        !order.OrderID.toLowerCase().includes(filters.value.search.toLowerCase())) {
      return false;
    }
    
    // Filter by order type
    if (filters.value.orderType === 'online' && !order.IsOnline) return false;
    if (filters.value.orderType === 'offline' && order.IsOnline) return false;
    
    // Filter by date
    const orderDate = new Date(order.OrderDate);
    if (filters.value.year && orderDate.getFullYear() !== parseInt(filters.value.year)) return false;
    if (filters.value.month && (orderDate.getMonth() + 1) !== parseInt(filters.value.month)) return false;
    if (filters.value.day && orderDate.getDate() !== parseInt(filters.value.day)) return false;
    
    return true;
  });
});

const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));
const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredOrders.value.slice(start, end);
});

const visibleProducts = computed(() => {
  if (!selectedOrder.value) return [];
  return showAllProducts.value 
    ? selectedOrder.value.Products 
    : selectedOrder.value.Products.slice(0, 3);
});

// Methods
function showOrderDetail(order) {
  selectedOrder.value = order;
  showModal.value = true;
  showAllProducts.value = false;
}

function closeModal() {
  showModal.value = false;
}

function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} ${day}/${month}/${year}`;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getStatusText(status) {
  const statusMap = {
    'Chờ xác nhận': 'Chờ xác nhận',
    'Chờ lấy hàng': 'Chờ lấy hàng',
    'Chờ giao hàng': 'Chờ giao hàng',
    'Đơn hàng thành công': 'Thành công',
    'Đã từ chối': 'Đã từ chối'
  };
  return statusMap[status] || status;
}

function getProvince(address) {
  // Simple extraction - in real app you might want a more robust solution
  if (address.includes('TP.HCM')) return 'TP.HCM';
  if (address.includes('Hà Nội')) return 'Hà Nội';
  if (address.includes('Đà Nẵng')) return 'Đà Nẵng';
  return address.split(',').pop().trim();
}
// Thêm các state mới
const showRejectReason = ref(false);
const rejectReason = ref('');

// Các hàm xử lý
const toggleRejectReason = () => {
  showRejectReason.value = !showRejectReason.value;
  if (!showRejectReason.value) {
    rejectReason.value = '';
  }
};

const confirmOrder = () => {
  // Xử lý xác nhận đơn hàng
  alert(`Đã xác nhận đơn hàng ${selectedOrder.value.OrderID}`);
  showModal.value = false;
};

const rejectOrder = () => {
  if (!rejectReason.value.trim()) {
    alert('Vui lòng nhập lý do từ chối');
    return;
  }
  
  // Xử lý từ chối đơn hàng
  alert(`Đã từ chối đơn hàng ${selectedOrder.value.OrderID} với lý do: ${rejectReason.value}`);
  showModal.value = false;
  showRejectReason.value = false;
  rejectReason.value = '';
};
</script>

<style scoped>
.order-management-container {
  font-family: Arial, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.filter-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: auto;
}

.filter-select, .search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  min-width: 150px;
}

.search-input {
  flex: 1;
  max-width: 300px;
}

.table-container {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.orders-table th, .orders-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.orders-table th {
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
}

.orders-table tr:hover {
  background-color: #f0f7ff;
}

.status-chờ-xác-nhận {
  color: #f59e0b;
  font-weight: bold;
}

.status-chờ-lấy-hàng {
  color: #3b82f6;
  font-weight: bold;
}

.status-chờ-giao-hàng {
  color: #6366f1;
  font-weight: bold;
}

.status-thành-công {
  color: #10b981;
  font-weight: bold;
}

.status-đã-từ-chối {
  color: #ef4444;
  font-weight: bold;
}

.view-detail-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.view-detail-btn:hover {
  background-color: #2563eb;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  gap: 10px;
}

.pagination-button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #555;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #3b82f6;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #777;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  color: #3b82f6;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; /* Gợi ý font stack */
  margin-bottom: 8px; /* Thêm khoảng cách giữa các item */
}

.detail-item label:first-child {
  font-weight: 600; /* Semi-bold thay vì bold */
  margin-bottom: 5px;
  color: #444;
  font-size: 14px;
}

.detail-item label:last-child {
  color: #333;
  font-size: 15px;
  padding-left: 8px; /* Thụt lề nhẹ */
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
}

.product-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.original-price {
  text-decoration: line-through;
  color: #777;
}

.show-more-btn {
  margin-top: 15px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  color: #3b82f6;
}

.show-more-btn:hover {
  background-color: #e0e0e0;
}

.title-first{
  text-align: center;
  margin-bottom: 30px;
}

/* Nút xác nhận đơn và từ chối đơn */
.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  margin-left: 10px;
  margin-top: 13px;  
  gap: 15px;
  justify-content: flex-end;
}

.reject-reason-input {
  margin-bottom: 15px;
}

.reason-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 5px;
  min-height: 100px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit; /* Giữ font chữ đồng nhất */
}

.confirm-btn {
  background-color: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.reject-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  margin-left: 10px;
  margin-top: 13px;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-reject {
  background-color: #6b7280;
}

.submit-reject-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  margin-left: 10px;
  margin-top: 13px;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>