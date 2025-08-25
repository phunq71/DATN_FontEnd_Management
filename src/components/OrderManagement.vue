<template>
  <div class="order-management-container">
    <!-- Filter Section -->
    <div class="filter-section">
      <div class="filter-row">
        <span style="font-size: 34px; font-weight: bolder; left: 20px; position: absolute;"> Quản lý đơn hàng </span>
        <div v-if="activeTab === 'SanSangGiao'" class="pickup-filter">
          <select
              v-model="pickupStatus"
              class="filter-select" >
            <option value="ChuanBiDon">Chuẩn bị đơn</option>
            <option value="SanSangGiao">Sẵn sàng giao</option>
          </select>
        </div>
        <select v-model="filters.area" class="filter-select" :disabled="areas.length === 1">
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>

        <select v-model="filters.store" class="filter-select" :disabled="filteredStores.length < 2">
          <option v-for="store in filteredStores" :key="store.id" :value="store.id">
            {{ store.name }}
          </option>
        </select>
        <VueDatePicker
            class="filter-select"
            style="width: 280px"
            v-model="filters.day"
            range
            placeholder="Từ ngày - Đến ngày"
            :enable-time-picker="false"
            :format="customFormat"
        />

        <input
            type="text"
            v-model="filters.orderId"
            class="filter-select"
            placeholder="Tìm theo ID hóa đơn"
        />
      </div>
      <button type="button"  class="reset-button"
          @click="() => { filters.orderId = ''; getOrders(); }"
          v-if="filters.orderId"
      >
        ✕
      </button>
    </div>

    <!-- Tabbed Pane -->
    <div class="tabbed-pane">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" @click="selectTab(tab.id)"
          :class="{ 'active-tab': activeTab === tab.id }">
          {{ tab.label }}
        </button>
      </div>
      <div class="orders-container">
      <div class="orders-table-wrapper">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt hàng</th>
              <th>Trạng thái</th>
              <th>Địa chỉ giao</th>
              <th>NG dự kiến (+1)</th>
              <th>Loại đơn</th>
              <th>Khách hàng</th>
              <th>Hình thức TT</th>
              <th>Ngày TT</th>
              <th>Thành tiền</th>
              <th>Trạng thái GHN</th>
              <th>Thời gian cập nhật đơn GHN</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
          <tr v-for="order in orders" :key="order.orderID">
            <td>{{ formatOrderID(order.orderID) }}</td>
            <td>{{ formatDateTime(order.orderDate) }}</td>
            <td>
            <span :class="'status-' + order.status?.toLowerCase().replace(' ', '-')">
              {{ statusMap[order.status] || order.status }}
            </span>
            </td>
            <td>{{ order.shippingAddress }}</td>
            <td>{{ order.delivery || '---'}}</td>
            <td>{{ order.isOnline ? 'Online' : 'Trực tiếp' }}</td>
            <td>{{ order.customerName }}</td>
            <td>{{ order.paymentMethod || '---' }}</td> <!-- nếu có -->
            <td>{{ formatDateTime(order.transactionDate) || '---' }}</td>
            <td>{{ formatCurrency(order.totalAmount) }}</td>
            <td>{{ order.statusGHN}}</td>
            <td>{{ formatDateTime(order.updatedTimeGHN)}}</td>
            <td>
              <button @click="showOrderDetail(order)" class="view-detail-btn">
                Xem chi tiết
              </button>
            </td>
          </tr>

          </tbody>
        </table>
      </div>
      </div>
      <div class="pagination">
        <button @click="changePage(1)" :disabled="currentPage === 1">⏮</button>
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1">&lt;</button>

        <button
            v-for="page in pageRange"
            :key="page"
            @click="typeof page === 'number' && changePage(page)"
            :disabled="page === '...'"
            :class="{ 'active-page': currentPage === page, 'ellipsis': page === '...' }"
        >
          {{ page }}
        </button>

        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">&gt;</button>
        <button @click="changePage(totalPages)" :disabled="currentPage === totalPages">⏭</button>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Chi tiết đơn hàng {{ selectedOrder.OrderID }}</h3>
          <button @click="closeModal" class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Thông tin đơn hàng -->
          <div class="detail-section">
            <h4>Thông tin đơn hàng</h4>
            <div class="row">
              <div class="detail-grid" style="width: 60%">
                <div class="detail-item">
                  <label><strong>Mã đơn:</strong></label>
                  <label>{{ selectedOrder.OrderID }}</label>
                </div>
                <div class="detail-item">
                  <label><strong>Ngày đặt:</strong></label>
                  <label>{{ formatDateTime(selectedOrder.OrderDate) }}</label>
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
                  <label><strong>Cửa hàng:</strong></label>
                  <label>{{ selectedOrder.FacilityName }}</label>
                </div>
                <div class="detail-item">
                  <label><strong>Ngày giao dự kiến cho khách (+1):</strong></label>
                  <label>{{ selectedOrder.delivery }}</label>
                </div>
                <div class="detail-item">
                  <label><strong>Địa chỉ GHN:</strong></label>
                  <label>{{ selectedOrder.AddressIdGHN || 'Không có' }}</label>
                </div>
                <div class="detail-item">
                  <label><strong>Mã đơn hàng GHN:</strong></label>
                  <label>{{ selectedOrder.shippingCode || 'Không có' }}</label>
                </div>
                <div class="detail-item">
                  <label><strong>Thời gian GHN cập nhật:</strong></label>
                  <label>{{ selectedOrder.updatedTimeGHN || 'Không có' }}</label>
                </div>
              </div>
              <div style="width: 40%" v-if="selectedOrder.logOrders != null && selectedOrder.logOrders.length > 0">
                <label><strong>Lịch sử trạng thái:</strong></label>
                <table class="table-auto border border-gray-300 w-full" style="font-size: 14px">
                  <thead class="bg-gray-100">
                  <tr>
                    <th class="border border-gray-300 px-2 py-1 text-center">Thời gian</th>
                    <th class="border border-gray-300 px-2 py-1">Nội dung</th>
                    <th class="border border-gray-300 px-2 py-1">Nhân viên</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(log, index) in selectedOrder.logOrders" :key="index">
                    <td class="border border-gray-300 px-2 py-1 text-center">
                      {{ formatDateTime(log.updateAt) }}
                    </td>
                    <td class="border border-gray-300 px-2 py-1">{{ log.content }}</td>
                    <td class="border border-gray-300 px-2 py-1">{{ log.staffName }}</td>
                  </tr>
                  </tbody>
                </table>

              </div>
            </div>
            </div>


          <!-- Thông tin sản phẩm -->
          <div class="detail-section">
            <h4>Thông tin sản phẩm</h4>
            <div class="products-grid">
              <div v-for="(product, index) in visibleProducts" :key="index" class="product-item">
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
            <button v-if="selectedOrder.Products.length > 3" @click="showAllProducts = !showAllProducts" class="show-more-btn">
              {{ showAllProducts ? 'Ẩn bớt' : `Xem thêm (${selectedOrder.Products.length - 3})` }}
            </button>
          </div>
          <!-- Thông tin giao dịch -->
          <div class="detail-section">
            <h4>Thông tin thanh toán</h4>
            <div class="detail-grid">
              <div class="detail-item" v-if="selectedOrder.paymentCode">
                <label><strong>Mã thanh toán:</strong></label>
                <label>{{ selectedOrder.paymentCode }}</label>

              </div>
              <div class="detail-item">
                <label><strong>Loại giao dịch:</strong></label>
                <label>{{ selectedOrder.paymentMethod }}</label>
              </div>
              <div class="detail-item">
                <label><strong>Ngày GD:</strong></label>
                <label>{{ formatDateTime(selectedOrder.transactionDate) }}</label>
              </div>
            </div>

          </div>
          <div class="detail-section">
            <h4>Thông tin tổng quát</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <label><strong>Tổng tiền hàng:</strong></label>
                <label>
                  {{
                    selectedOrder.Products
                        ? selectedOrder.Products.reduce((sum, p) => sum + p.totalPrice, 0).toLocaleString()
                        : '0'
                  }} đ
                </label>
              </div>
              <div class="detail-item">
                <label><strong>Phí vận chuyển:</strong></label>
                <label>
                  {{
                    selectedOrder.Products?.[0]?.costShip != null
                        ? selectedOrder.Products[0].costShip.toLocaleString()
                        : '0'
                  }} đ
                </label>
              </div>
              <div class="detail-item">
                <label><strong>Ưu đãi phí vận chuyển:</strong></label>
                <label>
                  - {{
                    selectedOrder.Products?.[0]?.discountCost != null
                        ? selectedOrder.Products[0].discountCost.toLocaleString()
                        : '0'
                  }} đ
                </label>
              </div>
              <div class="detail-item">
                <label><strong>Voucher:</strong></label>
                <label>
                  - {{
                    selectedOrder.Products?.length
                        ? (
                            selectedOrder.Products[0].discountType === 'Percent'
                                ? Math.round(
                                    (
                                        selectedOrder.Products.reduce((sum, p) => sum + p.totalPrice, 0) +
                                        (
                                            selectedOrder.Products[0].discountCost != null
                                                ? selectedOrder.Products[0].discountCost
                                                : selectedOrder.Products[0].costShip
                                        )
                                    ) * selectedOrder.Products[0].discountValue / 100
                                ).toLocaleString()
                                : selectedOrder.Products[0].discountType === 'Amount'
                                    ? (selectedOrder.Products[0].discountValue || 0).toLocaleString()
                                    : '0'
                        )
                        : '0'
                  }} đ
                </label>
              </div>
              <div class="detail-item">
                <label><strong>Tổng cộng:</strong></label>
                <label>{{ formatCurrency(selectedOrder.totalAmount) }}</label>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer xử lý -->
          <div class="modal-footer">
          <div v-if="showRejectReason" class="reject-reason-input">
            <label><strong>Lý do từ chối:</strong></label>
            <textarea v-model="rejectReason" placeholder="Nhập lý do từ chối đơn hàng" class="reason-input" rows="3"></textarea>
          </div>
            <div class="action-buttons" v-if="selectedOrder.Status === 'Chờ xác nhận'">
              <button @click="toggleRejectReason" class="reject-btn" :class="{ 'cancel-reject': showRejectReason }">
                {{ showRejectReason ? 'Hủy từ chối' : 'Từ chối đơn hàng' }}
              </button>
              <button v-if="showRejectReason" @click="rejectOrder" class="submit-reject-btn">Gửi từ chối</button>
              <button @click="confirmOrder" class="confirm-btn">Xác nhận đơn hàng</button>
            </div>
            <div class="action-buttons" v-else-if="selectedOrder.Status === 'Chuẩn bị đơn'">
              <button @click="markReadyToShip" class="confirm-btn">Sẵn sàng giao</button>
            </div>
            <div class="action-buttons" v-else-if="selectedOrder.Status === 'Yêu cầu hủy'">
              <button @click="chapnhanHuy(selectedOrder.OrderID, $event)" class="confirm-btn">Chấp nhận hủy</button>
            </div>
            <div class="action-buttons" v-else-if="selectedOrder.Status === 'Yêu cầu hủy' && selectedOrder.Status === 'Chuẩn bị đơn'">
              <button @click="markReadyToShip" class="confirm-btn">Sẵn sàng giao</button>
            </div>
          </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import popover from "bootstrap/js/src/popover.js";
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import qs from 'qs';

// Filter data
const filters = ref({
  orderType: 'all',
  area: '',
  store: '',
  day: [],
  search: '',
  status: '',
  orderId: ''
});


const today = new Date();
const pad = (n) => String(n).padStart(2, '0');
const areas = ref([]);

const stores = ref([]);

const rawFacilities = ref([]);
// Tabs
const tabs = ref([
  { id: 'ChoXacNhan', label: 'Chờ xác nhận' },
  { id: 'SanSangGiao', label: 'Chờ lấy hàng' },
  { id: 'ChoGiaoHang', label: 'Chờ giao hàng' },
  { id: 'DaGiao', label: 'Đơn hàng thành công' },
  { id: 'DaHuy', label: 'Đã hủy' },
  { id: 'YeuCauHuy', label: 'Yêu cầu hủy' }
]);

const activeTab = ref('ChoXacNhan');
const pickupStatus = ref('ChuanBiDon');
function formatOrderID(id) {
  return '#OD' + String(id).padStart(7, '0');
}
// Modal state
const showModal = ref(false);
const selectedOrder = ref(null);
const showAllProducts = ref(false);
const showRejectReason = ref(false);
const rejectReason = ref('');

// Lấy dữ liệu từ backend
const getFacilities = async () => {
  try {
    const res = await api.get("/admin/area", { withCredentials: true });
    rawFacilities.value = res.data;
    // Tách danh sách khu vực (duy nhất)
    const uniqueAreas = [...new Map(
      res.data.map(item => [item.parentId, { id: item.parentId, name: item.parentName }])
    ).values()];
    areas.value = uniqueAreas;

    // Tách danh sách tất cả cửa hàng
    stores.value = res.data.map(item => ({
      id: item.facilityId,
      name: item.facilityName,
      areaId: item.parentId
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách:", error);
  }
};
const currentPage = ref(1);
const totalPages = ref(1);
const orders = ref([]);
const selectTab = (tabId) => {
  activeTab.value = tabId;
  currentPage.value = 1;
  if (tabId === 'SanSangGiao') {
    filters.value.status = pickupStatus.value; // Luôn dùng giá trị dropdown
  } else {
    filters.value.status = tabId; // Dùng giá trị tab cho các tab khác
  }
};

function formatDate1(date) {
  if (!date) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

let requestId = 0; // biến toàn cục trong component

const getOrders = async () => {
  const currentRequestId = ++requestId; // gán ID cho request này

  try {
    const res = await api.get(`/admin/order/${currentPage.value - 1}`, {
      withCredentials: true,
      params: {
        areaId: filters.value.area || null,
        storeId: filters.value.store || null,
        day: filters.value.day && filters.value.day.length > 0
            ? filters.value.day.map(d => formatDate1(d))
            : null,
        status: filters.value.status || null,
        orderType: filters.value.orderType !== 'all' ? filters.value.orderType : null,
        search: filters.value.search || null,
        orderId: filters.value.orderId || null
      },
      paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    });

    // ✅ chỉ update nếu đây là request mới nhất
    if (currentRequestId === requestId) {
      console.log("Response từ BE:", res.data);
      orders.value = res.data.content ?? [];
      totalPages.value = res.data.totalPages ?? 0;
    } else {
      console.log("⚠️ Bỏ qua response cũ:", res.data);
    }

  } catch (error) {
    if (currentRequestId === requestId) {
      console.error("Lỗi khi tải đơn hàng:", error);
      orders.value = [];
      Swal.fire({
        icon: 'error',
        title: 'Lỗi tải dữ liệu',
        text: 'Không thể tải danh sách đơn hàng. Vui lòng thử lại sau!'
      });
    }
  } finally {
    if (currentRequestId === requestId) {
      Swal.close();
    }
  }
};

//TRÌ HOẢNG
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
const debouncedGetOrders = debounce(() => {
  getOrders();
}, 500); // đợi 500ms sau khi người dùng ngừng gõ

watch(() => filters.value.orderId, () => {
  debouncedGetOrders(); // chỉ gọi sau khi người dùng ngưng gõ 500ms
});
watch(() => filters.value.area, () => {
  getOrders();
});
watch(() => filters.value.store, () => {
  getOrders();
});
watch(() => filters.value.day, () => {
  getOrders();
});
watch(() => activeTab.value, () => {
  getOrders();
});
// Trong watcher
watch([activeTab, pickupStatus], () => {
  if (activeTab.value === 'SanSangGiao') {
    filters.value.status = pickupStatus.value; // 'SanSangGiao' hoặc 'ChoLayHang' (string)
  }
}, { immediate: true });
watch(pickupStatus, (newVal) => {
  if (activeTab.value === 'SanSangGiao') {
    filters.value.status = newVal;
    getOrders();
  }
});

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  getOrders();
};
const pageRange = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const range = [];

  if (total <= 10) {
    // Nếu tổng số trang <= 10 thì hiển thị hết
    for (let i = 1; i <= total; i++) {
      range.push(i);
    }
  } else {
    // Chỉ hiển thị tối đa 10 trang liên tiếp quanh trang hiện tại
    let start = Math.max(1, current - 4);
    let end = Math.min(total, current + 5);

    // Điều chỉnh nếu gần đầu hoặc cuối để đủ 10 trang
    if (current <= 5) {
      start = 1;
      end = 10;
    } else if (current >= total - 4) {
      start = total - 9;
      end = total;
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
  }

  return range;
});

const markReadyToShip = async () => {
  if (!selectedOrder.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Chưa chọn đơn hàng',
      text: 'Vui lòng chọn một đơn hàng trước khi gửi!'
    });
    return;
  }
// --------------------------------------------
  const token = '5b993278-3a63-11f0-9b81-222185cb68c8';
  const shopId = 196674;
  let service_id = null;
  let service_type_id = null;
  async function getGHNService(from_district_id, to_district_id) {
    console.log("From district (shop):", from_district_id);
    console.log("To district (customer):", to_district_id);
    try {
      const res = await axios.post(
          'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
          {
            shop_id: shopId,
            from_district: from_district_id,
            to_district: to_district_id
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Token': token
            }
          }
      );

      const services = res.data?.data;
      console.log("📋 Danh sách dịch vụ GHN:", services);

      if (!services || services.length === 0) {
        console.error("❌ Không tìm thấy dịch vụ vận chuyển phù hợp.");
        return null;
      }
      // Gán vào biến toàn cục
      service_id = services[0].service_id;
      service_type_id = services[0].service_type_id;
      return services[0]; // hoặc trả về cả danh sách nếu muốn
    } catch (err) {
      console.error("❌ Lỗi khi lấy dịch vụ GHN:", err.response?.data || err.message);
      return null;
    }
  }
// Gọi hàm lấy dịch vụ GHN

  const rawAddress = selectedOrder.value.AddressIdGHN; // "213/1558/560101/Phú My Hưng"
  const rawAddressShop = selectedOrder.value.addressIDGHN_Shop;
  const parts = rawAddress.split('/');
  const partsShop = rawAddressShop.split('/');
  const districtIdGHNTo = parseInt(parts[1]);                  //  Integer =>
  const wardIDGHNTo = parts[2];               // String => "560101"
  const districtIdGHNShop = parseInt(partsShop[1]);                  //  Integer =>
  const wardCodeIdGHNShop = partsShop[2];

  const service = await getGHNService(districtIdGHNShop, districtIdGHNTo);
  if (!service) {
    Swal.fire({
      icon: 'error',
      title: 'Không lấy được dịch vụ GHN',
      text: 'Vui lòng kiểm tra lại địa chỉ và thử lại.'
    });
    return;
  }
  const ghnPayload = {
    orderID: selectedOrder.value.OdID,
    to_name: selectedOrder.value.CustomerName,
    to_phone: selectedOrder.value.numberPhone || 'Chưa có', // ⚠️ Cần có
    to_address: selectedOrder.value.ShippingAddress,
    to_ward_code: wardIDGHNTo || null,
    to_district_code: districtIdGHNTo || null,
    from_ward_code: wardCodeIdGHNShop || null,
    from_district_code: districtIdGHNShop || null,
    addressIDGHN_Shop: selectedOrder.addressIDGHN_Shop || null,
    cod_amount: selectedOrder.value.paymentMethod === 'cod'
        ? selectedOrder.value.totalAmount
        : 0,
    content: `Giao đơn hàng cho ${selectedOrder.value.CustomerName}`,
    weight: 500, // 0.5kg
    length: 20,  // cm
    width: 15,  //cm
    height: 10, //cm
    payment_type_id: 1, //1: người gửi trả
    required_note: "KHONGCHOXEMHANG", // hoặc "CHOXEMHANG"
    // service_id: selectedOrder.value.ShipMethod || defaultServiceID || null, bỏ không cần
    service_id: service.service_id,              // 👈 ưu tiên dịch vụ đầu tiên
    service_type_id: service.service_type_id,    // 👈 lấy đúng loại
    items: selectedOrder.value.Products.map(p => ({
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      height: 10,
      weight: 200,
      length: 10,
      width: 10
    })),
  };
  try {
    const res = await api.post('/admin/order/ready-to-ship', ghnPayload, {
      withCredentials: true
    });


     Swal.fire({
      icon: 'success',
      title: 'Đơn hàng đã được gửi!',
      text: 'Hệ thống giao hàng đã nhận đơn.'

    }).then(() => {
       // Sau khi người dùng bấm "OK" thì gọi lại danh sách đơn
       closeModal();
       getOrders();  // 👈 Thêm dòng này
     });
  } catch (error) {
    console.error('❌ Lỗi khi gửi đơn hàng:', error);
    Swal.fire({
      icon: 'error',
      title: 'Gửi đơn hàng thất bại',
      text: 'Vui lòng kiểm tra lại và thử lại sau.'
    });
  }
};

// ----------------------Fillter khu vực, ngày tháng (Lọc)
const filteredStores = ref([]);

watch(
    () => filters.value.area,
    (newAreaId) => {
      if (!newAreaId) {
        filteredStores.value = stores.value;
      } else {
        filteredStores.value = stores.value.filter(
            (store) => store.areaId === newAreaId
        );
      }

      // Nếu cửa hàng hiện tại không còn hợp lệ => chọn mặc định cái đầu tiên
      if (!filteredStores.value.find((store) => store.id === filters.value.store)) {
        filters.value.store = filteredStores.value.length > 0 ? filteredStores.value[0].id : '';

      }

      getOrders();
    },
    { immediate: true }
    // để chạy luôn khi component mount
);

watch(() => currentPage.value, () => {
  getOrders();
});


onMounted(async () => {
  await getFacilities();

  if (areas.value.length > 0) {
    filters.value.area = areas.value[0].id;
  }

  if (stores.value.length > 0) {
    filters.value.store = stores.value[0].id;
  }

  filters.value.status = 'ChoXacNhan';

  await getOrders();
});




const visibleProducts = computed(() => {
  const products = selectedOrder.value?.Products;
  if (!Array.isArray(products)) return [];
  return showAllProducts.value ? products : products.slice(0, 3);
});


// Methods
function showOrderDetail(order) {
  selectedOrder.value = {
    OdID: order.orderID,
    OrderID: formatOrderID(order.orderID),
    OrderDate: order.orderDate,
    Status: statusMap[order.status] || order.status,
    ShippingAddress: order.shippingAddress,
    Note: order.note || '',
    IsOnline: order.isOnline,
    AddressIdGHN: order.addressIdGHN,
    ShipMethod: order.shipMethod,
    CustomerName: order.customerName,
    StaffName: order.staffName || 'Không có',
    FacilityName: order.facilityName || 'Không có',
    UpdatedAt: formatDateTime(order.updatedStatusAt) || null,
    shippingCode: order.shippingCode || null,
    paymentMethod: order.paymentMethod || null,
    paymentCode: order.paymentCode || null,
    totalAmount: order.totalAmount||null,
    transactionDate: order.transactionDate || null,
    numberPhone: order.numberPhone || null,
    delivery: order.delivery || null,
    addressIDGHN_Shop: order.addressIDGHN_Shop || null,
    statusGHN: order.statusGHN || null,
    updatedTimeGHN: order.updatedTimeGHN || null,
    logOrders: order.logOrders || null,
    Products: (order.products || []).map(p => {
      const price = p.originalPrice * (1 - p.discountPercent / 100);
      return {
        name: p.productName,                         // Tên sản phẩm
        image: `https://phudatn.blob.core.windows.net/images/${p.image}`,  // Đường dẫn hình ảnh sản phẩm
        originalPrice: p.originalPrice,              // Giá gốc
        discountPercent: p.discountPercent,          // Phần trăm giảm giá (%)
        quantity: p.quantity,                        // Số lượng
        price: price,                                // Giá sau giảm
        totalPrice: price * p.quantity,              // Tổng tiền cho sản phẩm (sau giảm × số lượng)
        costShip: p.costShip,                        // Phí vận chuyển gốc
        discountCost: p.discountCost != null ? (p.costShip - p.discountCost) : 0,
        // Số tiền đã được giảm từ phí vận chuyển (nếu có)
        discountType: p.discountType,                // Kiểu giảm giá (theo phần trăm hoặc số tiền cố định)
        discountValue: p.discountValue,              // Giá trị giảm giá (tùy theo kiểu)
        totalAmount: order.totalAmount || null,      // Tổng tiền đơn hàng (tổng cộng tất cả sản phẩm + phí ship - giảm)
      };
    }),
  };

  showModal.value = true;
  showAllProducts.value = false;
  showRejectReason.value = false;
  rejectReason.value = '';
}

function closeModal() {
  showModal.value = false;
}

function toggleRejectReason() {
  showRejectReason.value = !showRejectReason.value;
  if (!showRejectReason.value) {
    rejectReason.value = '';
  }
}
async function confirmOrder() {
  if (!selectedOrder.value) return;
  let loading;
  try {
    // Hiển thị loading
    loading = Swal.fire({
      title: 'Đang xử lý xác nhận...',
      html: 'Vui lòng chờ trong giây lát...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Gửi request xác nhận đơn hàng
    await api.post('/admin/order/confirm', {
      orderID: selectedOrder.value.OdID
    }, { withCredentials: true });

    // Đóng loading và hiển thị thông báo thành công
    Swal.close();

    await Swal.fire({
      title: 'Xác nhận thành công!',
      text: `Đã xác nhận đơn hàng ${selectedOrder.value.OrderID}`,
      icon: 'success',
      confirmButtonText: 'OK'
    });

    showModal.value = false;
    await getOrders();
  } catch (error) {
    console.error('❌ Lỗi khi gửi xác nhận:', error);

    // Đóng loading nếu đang mở
    Swal.close();

    const errorMessage = error.response?.data || 'Đã xảy ra lỗi khi gửi xác nhận đơn hàng.';

    await Swal.fire({
      title: 'Xác nhận thất bại!',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}
const customFormat = (dates) => {
  if (!dates) return "";
  if (Array.isArray(dates)) {
    const [start, end] = dates;
    if (start && !end) {
      return start.toLocaleDateString("vi-VN"); // chỉ hiển thị ngày start
    }
    if (start && end) {
      return `${start.toLocaleDateString("vi-VN")} - ${end.toLocaleDateString("vi-VN")}`;
    }
  }
  return "";
};



async function rejectOrder() {
  if (!rejectReason.value.trim()) {
    await Swal.fire({
      title: "Thiếu lý do",
      text: "Vui lòng nhập lý do từ chối",
      icon: "warning",
      confirmButtonText: "OK"
    });
    return;
  }

  if (!selectedOrder.value) return;

  try {
    api.put(
        "/admin/orders11/reject",
        { orderId: selectedOrder.value.OrderID, reason: rejectReason.value },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
    );

    // ✅ Cập nhật local state
    selectedOrder.value.Status = "Đã từ chối";
    selectedOrder.value.Note = `Lý do từ chối: ${rejectReason.value}`;

    const index = orders.value.findIndex(o => o.OrderID === selectedOrder.value.OrderID);
    if (index !== -1) {
      orders.value[index] = { ...selectedOrder.value };
    }

    await Swal.fire({
      title: "Thành công!",
      text: `Đã từ chối đơn hàng ${selectedOrder.value.OrderID}`,
      icon: "success",
      confirmButtonText: "OK"
    });

    showModal.value = false;
    showRejectReason.value = false;
    rejectReason.value = "";
    activeTab.value = 'DaHuy';
    filters.value.status = 'DaHuy'


  } catch (err) {
    console.error("Lỗi khi từ chối đơn:", err);
    await Swal.fire({
      title: "Thất bại!",
      text: err.response?.data || "Không thể từ chối đơn",
      icon: "error",
      confirmButtonText: "OK"
    });
  }
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
const statusMap = {
  ChuanBiDon: 'Chuẩn bị đơn',
  ChoXacNhan: 'Chờ xác nhận',
  SanSangGiao: 'Sẵn sàng giao',
  ChoGiaoHang: 'Chờ giao hàng',
  DaGiao: 'Đơn hàng thành công',
  DaHuy: 'Đã hủy',
  YeuCauHuy: 'Yêu cầu hủy',
};

async function chapnhanHuy(orderId, event) {
  const btn = event.currentTarget
  try {
    const res = await api.post('/admin/order/cancelOrderCustomer', { orderId }
        , { withCredentials: true })

    await Swal.fire({
      title: "Thành công",
      text: "Đã chấp nhận hủy đơn!",
      icon: "success",
      confirmButtonText: "OK"
    })

    // Disable nút và update UI
    btn.disabled = true
    btn.textContent = "Đã chấp nhận"

    // Tắt tab hiện tại
    const currentTab = document.getElementById("yeu-cau-huy")
    if (currentTab) currentTab.classList.remove("active")

    // Cập nhật danh sách đơn
    showModal.value = false;
    showRejectReason.value = false;
    rejectReason.value = "";
    activeTab.value = 'DaHuy';
    filters.value.status = 'DaHuy'


  } catch (err) {
    console.error(err)
    Swal.fire({
      title: "Lỗi",
      text: "Không thể chấp nhận hủy đơn.",
      icon: "error",
      confirmButtonText: "OK"
    })
  }
}

</script>

<style scoped>
/* Base Styles */
.order-management-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
}

/* Filter Section */
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

.filter-select,
.search-input {
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

/* Tabbed Pane */
.tabbed-pane {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 30px;
}

.tabs {
  display: flex;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.tabs button {
  padding: 12px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #64748b;
  flex: 1;
  text-align: center;
  transition: all 0.2s;
}

.tabs button.active-tab {
  color: #3b82f6;
  border-bottom: 2px solid #3b82f6;
  background-color: white;
}

.tab-content {
  padding: 15px;
}

.pickup-filter {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

/* Orders Table */
.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin-bottom: 15px;
}

.orders-table th,
.orders-table td {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: left;
}

.orders-table th {
  background-color: #f1f5f9;
  position: sticky;
  top: 0;
  font-weight: 500;
  color: #334155;
}

.orders-table tr:hover {
  background-color: #f8fafc;
}

/* Status Badges */
.status-chờ-xác-nhận {
  color: #f59e0b;
  font-weight: 500;
  background-color: #fef3c7;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-chờ-lấy-hàng {
  color: #3b82f6;
  font-weight: 500;
  background-color: #dbeafe;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-chờ-giao-hàng {
  color: #6366f1;
  font-weight: 500;
  background-color: #e0e7ff;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-thành-công {
  color: #10b981;
  font-weight: 500;
  background-color: #d1fae5;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-đã-từ-chối {
  color: #ef4444;
  font-weight: 500;
  background-color: #fee2e2;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-block;
}

/* View Detail Button */
.view-detail-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.2s;
}

.view-detail-btn:hover {
  background-color: #2563eb;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 0;
  width: 80px; /* hoặc 44px nếu bạn muốn rộng hơn */
  border: 1px solid var(--primary-color, #007bff);
  background-color: white;
  color: var(--primary-color, #007bff);
  border-radius: 4px;
  cursor: pointer;
  transition: 0.2s;
  text-align: center;
  font-size: 13px;
}


.pagination-button:hover:not(:disabled) {
  background-color: #f1f5f9;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #94a3b8;
}

.page-info {
  font-size: 14px;
  color: #64748b;
  min-width: 100px;
  text-align: center;
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
  max-width: 1400px;
  max-height: 100vh;
  overflow-y: auto;
  /* Cuộn dọc nếu cần */
  overflow-x: hidden;
  /* Ẩn thanh cuộn ngang */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
}

.close-modal {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
}

.close-modal:hover {
  color: #334155;
}

.modal-body {
  padding: 20px;
}

/* Detail Sections */
.detail-section {
  margin-bottom: 25px;
}

.detail-section h4 {
  color: #3b82f6;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 16px;
}

.detail-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; }
.detail-item { display: flex; flex-direction: column; font-size: 14px; }


.detail-item label:first-child {
  font-weight: 500;
  margin-bottom: 5px;
  color: #64748b;
}

.detail-item label:last-child {
  color: #334155;
  padding: 6px;
  background-color: #f8fafc;
  border-radius: 4px;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.product-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 15px;
  transition: transform 0.2s;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.product-image {
  width: 80px;
  height: 80px;
  background-color: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
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
  gap: 6px;
}

.product-info label {
  font-size: 13px;
  color: #334155;
}

.original-price {
  text-decoration: line-through;
  color: #94a3b8;
  margin-right: 5px;
}

.show-more-btn {
  margin-top: 15px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  color: #3b82f6;
  font-size: 13px;
  transition: all 0.2s;
}

.show-more-btn:hover {
  background-color: #e2e8f0;
}

/* Modal Footer */
.modal-footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 20px;
}

.reject-reason-input {
  margin-right: 10px;
  width: 500px;
}

.reject-reason-input label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
}

.reason-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;
  font-size: 14px;
}

.reason-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.confirm-btn,
.reject-btn,
.submit-reject-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn {
  background-color: #10b981;
  color: white;
}

.confirm-btn:hover {
  background-color: #0d9c6e;
}

.reject-btn {
  background-color: #ef4444;
  color: white;
}

.reject-btn:hover {
  background-color: #dc2626;
}

.cancel-reject {
  background-color: #64748b;
}

.cancel-reject:hover {
  background-color: #475569;
}

.submit-reject-btn {
  background-color: #ef4444;
  color: white;
}

.submit-reject-btn:hover {
  background-color: #dc2626;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }

  .filter-select,
  .search-input {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }

  .action-buttons {
    flex-direction: column;
  }

  .confirm-btn,
  .reject-btn,
  .submit-reject-btn {
    width: 100%;
  }
}
.active-page {
  background-color: #007bff;
  color: white;
  font-weight: bold;
}
.orders-container {
  border: 1px solid #ddd;
  border-radius: 12px;
  min-height: 700px; /* Giữ khung cao cố định */
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #fff;
}

.orders-table-wrapper {
  flex: 1; /* phần table sẽ chiếm toàn bộ chiều cao còn lại */
  overflow-y: auto;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid var(--primary-color, #007bff);
  background-color: white;
  color: var(--primary-color, #007bff);
  border-radius: 4px;
  cursor: pointer;
  min-width: 36px;
  transition: 0.2s;
}

.pagination button:hover:not(:disabled):not(.ellipsis) {
  background-color: var(--primary-color, #007bff);
  color: white;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination .active-page {
  background-color: var(--primary-color, #007bff);
  color: white;
}

.pagination .ellipsis {
  cursor: default;
  border: none;
  background: none;
  color: gray;
}
.reset-button {
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  color: #666;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.reset-button:hover {
  background-color: #e0e0e0;
  color: #333;
}
::v-deep(.dp__range_between) {
  background-color: rgba(25, 118, 210, 0.2);
  border-radius: 0 !important;
}

::v-deep(.dp__range_start) {
  background-color: #1976d2 !important;
  color: white !important;
  border-radius: 50% !important;
}

::v-deep(.dp__range_end) {
  background-color: #1976d2 !important;
  color: white !important;
  border-radius: 50% !important;
}

</style>