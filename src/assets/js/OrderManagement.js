// import { ref, computed, watch } from 'vue';

// export function useOrderManagement() {
//   // ==================== STATE ====================
//   // State cho bộ lọc
//   const filters = ref({
//     orderType: 'all',
//     area: '',
//     store: '',
//     year: '',
//     month: '',
//     day: '',
//     search: ''
//   });

//   // State cho dữ liệu
//   const orders = ref([]);
//   const facilities = ref([]);
  
//   // State cho UI
//   const tabs = ref([
//     { id: 'confirmation', label: 'Chờ xác nhận' },
//     { id: 'pickup', label: 'Chờ lấy hàng' },
//     { id: 'delivery', label: 'Chờ giao hàng' },
//     { id: 'completed', label: 'Đơn hàng thành công' }
//   ]);
//   const activeTab = ref('confirmation');
//   const pickupStatus = ref('all');
  
//   // State cho modal
//   const showModal = ref(false);
//   const selectedOrder = ref(null);
//   const showAllProducts = ref(false);
//   const showRejectReason = ref(false);
//   const rejectReason = ref('');
  
//   // State cho loading và error
//   const isLoading = ref(false);
//   const error = ref(null);
  
//   // State cho phân trang
//   const currentPage = ref(1);
//   const itemsPerPage = ref(10);

//   // ==================== DỮ LIỆU TĨNH ====================
//   // Danh sách năm (5 năm gần nhất)
//   const years = ref(Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i));
  
//   // Danh sách tháng
//   const months = ref([
//     { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
//     { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
//     { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
//     { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' },
//     { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
//     { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' }
//   ]);

//   // ==================== COMPUTED ====================
//   // Tính số ngày trong tháng được chọn
//   const daysInMonth = computed(() => {
//     if (!filters.value.year || !filters.value.month) return Array.from({ length: 31 }, (_, i) => i + 1);
//     const year = parseInt(filters.value.year);
//     const month = parseInt(filters.value.month);
//     return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
//   });

//  const areas = computed(() => {
//   return facilities.value.filter(f => f.type === 'Z');
// });

// const stores = computed(() => {
//   if (!filters.value.area) return [];
//   return facilities.value.filter(f => f.type === 'S' && f.parentId === filters.value.area);
// });

// const warehouses = computed(() => {
//   if (!filters.value.store) return [];
//   return facilities.value.filter(f => f.type === 'W' && f.parentId === filters.value.store);
// });

//   // Danh sách cửa hàng đã lọc
//   const filteredStores = computed(() => {
//     if (!filters.value.area) {
//       return facilities.value.filter(f => f.type === 'S' || f.type === 'W');
//     }
//     return facilities.value.filter(
//       f => (f.type === 'S' || f.type === 'W') && f.parentId === filters.value.area
//     );
//   });

//   // Danh sách đơn hàng đã lọc
//   const filteredOrders = computed(() => {
//     return orders.value.filter(order => {
//       // Lọc theo trạng thái tab
//       switch (activeTab.value) {
//         case 'confirmation': return order.Status === 'Chờ xác nhận';
//         case 'pickup':
//           if (pickupStatus.value === 'preparing') return order.isPreparing;
//           if (pickupStatus.value === 'ready') return !order.isPreparing;
//           return order.Status === 'Chờ lấy hàng';
//         case 'delivery': return order.Status === 'Chờ giao hàng';
//         case 'completed': return order.Status === 'Đơn hàng thành công';
//         default: return true;
//       }
//     }).filter(order => {
//       // Lọc theo từ khóa tìm kiếm
//       if (filters.value.search && 
//           (!order.OrderID || !order.OrderID.toLowerCase().includes(filters.value.search.toLowerCase()))) {
//         return false;
//       }
//       // Lọc theo loại đơn hàng
//       if (filters.value.orderType !== 'all' && 
//           order.IsOnline !== (filters.value.orderType === 'online')) {
//         return false;
//       }
//       // Lọc theo khu vực
//       if (filters.value.area && order.FacilityID) {
//         const store = stores.value.find(s => s.id === order.FacilityID);
//         if (store && store.areaId !== parseInt(filters.value.area)) {
//           return false;
//         }
//       }
//       // Lọc theo cửa hàng
//       if (filters.value.store && order.FacilityID !== parseInt(filters.value.store)) {
//         return false;
//       }
//       // Lọc theo ngày
//       if (filters.value.year || filters.value.month || filters.value.day) {
//         const orderDate = new Date(order.OrderDate);
//         if (filters.value.year && orderDate.getFullYear() !== parseInt(filters.value.year)) {
//           return false;
//         }
//         if (filters.value.month && (orderDate.getMonth() + 1) !== parseInt(filters.value.month)) {
//           return false;
//         }
//         if (filters.value.day && orderDate.getDate() !== parseInt(filters.value.day)) {
//           return false;
//         }
//       }
//       return true;
//     });
//   });

//   // Tính tổng số trang
//   const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value));

//   // Danh sách đơn hàng phân trang
//   const paginatedOrders = computed(() => {
//     const start = (currentPage.value - 1) * itemsPerPage.value;
//     const end = start + itemsPerPage.value;
//     return filteredOrders.value.slice(start, end);
//   });

//   // Sản phẩm hiển thị trong modal (tối đa 3 hoặc tất cả)
//   const visibleProducts = computed(() => {
//     if (!selectedOrder.value || !selectedOrder.value.Products) return [];
//     return showAllProducts.value 
//       ? selectedOrder.value.Products 
//       : selectedOrder.value.Products.slice(0, 3);
//   });

//   // ==================== WATCHERS ====================
//   // Theo dõi thay đổi khu vực để reset cửa hàng
//   watch(() => filters.value.area, () => {
//     filters.value.store = '';
//   });

//   // Theo dõi thay đổi tháng/năm để reset ngày nếu cần
//   watch([() => filters.value.month, () => filters.value.year], () => {
//     if (filters.value.day && parseInt(filters.value.day) > daysInMonth.value.length) {
//       filters.value.day = '';
//     }
//   });

//   // ==================== METHODS ====================
//   // API calls
//   const fetchFacilities = async () => {
//     try {
//       isLoading.value = true;
//       const response = await api.get('/opulentia_admin/area', { withCredentials: true });
//       console.log(response);
//       facilities.value = response.data;
//     } catch (err) {
//       console.error('Lỗi khi fetch facilities:', err);
//       error.value = err.message || 'Lỗi không xác định';
//     } finally {
//       isLoading.value = false;
//     }
//   };

//   const fetchOrders = async () => {
//     // try {
//     //   isLoading.value = true;
//     //   const response = await fetch('/api/orders');
//     //   if (!response.ok) throw new Error('Lỗi khi lấy danh sách đơn hàng');
//     //   orders.value = await response.json();
//     // } catch (err) {
//     //   error.value = err.message;
//     // } finally {
//     //   isLoading.value = false;
//     // }
//   };

//   // Khởi tạo dữ liệu
//   const initializeData = async () => {
//     await Promise.all([ fetchFacilities(), fetchOrders()]);
//   };
//   initializeData();

//   // Xử lý modal
//   const showOrderDetail = (order) => {
//     selectedOrder.value = order;
//     showModal.value = true;
//     showAllProducts.value = false;
//     showRejectReason.value = false;
//     rejectReason.value = '';
//   };

//   const closeModal = () => {
//     showModal.value = false;
//   };

//   const toggleRejectReason = () => {
//     showRejectReason.value = !showRejectReason.value;
//     if (!showRejectReason.value) {
//       rejectReason.value = '';
//     }
//   };

//   // Xử lý đơn hàng
//   const confirmOrder = async () => {
//     if (selectedOrder.value) {
//       const currentStatus = selectedOrder.value.Status;
//       let newStatus = currentStatus;

//       if (currentStatus === 'Chờ xác nhận') {
//         newStatus = 'Chờ lấy hàng';
//       } else if (currentStatus === 'Chờ lấy hàng') {
//         newStatus = 'Chờ giao hàng';
//       } else if (currentStatus === 'Chờ giao hàng') {
//         newStatus = 'Đơn hàng thành công';
//       } else {
//         error.value = 'Không thể chuyển trạng thái từ ' + currentStatus;
//         return;
//       }

//       try {
//         isLoading.value = true;
//         const response = await fetch(`/api/orders/${selectedOrder.value.OrderID}/confirm`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ status: newStatus })
//         });
//         if (!response.ok) throw new Error('Lỗi khi xác nhận đơn hàng');
        
//         // Cập nhật danh sách orders
//         const index = orders.value.findIndex(o => o.OrderID === selectedOrder.value.OrderID);
//         if (index !== -1) {
//           orders.value[index] = { ...selectedOrder.value, Status: newStatus };
//         }
        
//         showModal.value = false;
//       } catch (err) {
//         error.value = err.message;
//       } finally {
//         isLoading.value = false;
//       }
//     }
//   };

//   const rejectOrder = async () => {
//     if (!rejectReason.value.trim()) {
//       error.value = 'Vui lòng nhập lý do từ chối.';
//       return;
//     }
    
//     if (selectedOrder.value && selectedOrder.value.Status !== 'Đơn hàng thành công') {
//       try {
//         isLoading.value = true;
//         const response = await fetch(`/api/orders/${selectedOrder.value.OrderID}/reject`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             status: 'Đã từ chối',
//             note: `Lý do từ chối: ${rejectReason.value}`
//           })
//         });
//         if (!response.ok) throw new Error('Lỗi khi từ chối đơn hàng');
        
//         // Cập nhật danh sách orders
//         const index = orders.value.findIndex(o => o.OrderID === selectedOrder.value.OrderID);
//         if (index !== -1) {
//           orders.value[index] = { 
//             ...selectedOrder.value, 
//             Status: 'Đã từ chối',
//             Note: `Lý do từ chối: ${rejectReason.value}`
//           };
//         }
        
//         showModal.value = false;
//         showRejectReason.value = false;
//         rejectReason.value = '';
//       } catch (err) {
//         error.value = err.message;
//       } finally {
//         isLoading.value = false;
//       }
//     } else {
//       error.value = 'Không thể từ chối đơn hàng đã hoàn thành.';
//     }
//   };

//   // Hàm định dạng
//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//     return new Date(dateString).toLocaleDateString('vi-VN', options);
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
//   };

//   const getStatusText = (status) => {
//     const statusMap = {
//       'Chờ xác nhận': 'Chờ xác nhận',
//       'Chờ lấy hàng': 'Chờ lấy hàng',
//       'Chờ giao hàng': 'Chờ giao hàng',
//       'Đơn hàng thành công': 'Thành công',
//       'Đã từ chối': 'Đã từ chối'
//     };
//     return statusMap[status] || status;
//   };

//   const getProvince = (address) => {
//     if (!address) return '';
//     if (address.includes('TP.HCM')) return 'TP.HCM';
//     if (address.includes('Hà Nội')) return 'Hà Nội';
//     if (address.includes('Đà Nẵng')) return 'Đà Nẵng';
//     return address.split(',').pop().trim();
//   };

//   // ==================== EXPORTS ====================
//   return {
//     // State
//     filters,
//     areas,
//     stores,
//     years,
//     months,
//     daysInMonth,
//     tabs,
//     activeTab,
//     pickupStatus,
//     showModal,
//     selectedOrder,
//     showAllProducts,
//     orders,
//     currentPage,
//     itemsPerPage,
//     showRejectReason,
//     rejectReason,
//     isLoading,
//     error,
    
//     // Computed
//     filteredStores,
//     filteredOrders,
//     totalPages,
//     paginatedOrders,
//     visibleProducts,

//     // Methods
//     fetchFacilities,
//     showOrderDetail,
//     closeModal,
//     toggleRejectReason,
//     confirmOrder,
//     rejectOrder,
//     formatDate,
//     formatDateTime,
//     formatCurrency,
//     getStatusText,
//     getProvince
//   };
// }