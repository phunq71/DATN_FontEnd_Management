// import { ref, computed, onMounted } from 'vue';

// // Filter data
// const filters = ref({
//   orderType: 'all',
//   area: '',
//   store: '',
//   year: '',
//   month: '',
//   day: '',
//   search: ''
// });

// const areas = ref([
//   { id: 1, name: 'Miền Bắc' },
//   { id: 2, name: 'Miền Trung' },
//   { id: 3, name: 'Miền Nam' }
// ]);

// const stores = ref([
//   { id: 1, name: 'Cửa hàng Hà Nội', areaId: 1 },
//   { id: 2, name: 'Cửa hàng Đà Nẵng', areaId: 2 },
//   { id: 3, name: 'Cửa hàng Hồ Chí Minh', areaId: 3 }
// ]);

// const years = ref(Array.from({length: 5}, (_, i) => new Date().getFullYear() - i));
// const months = ref([
//   { value: 1, label: 'Tháng 1' },
//   { value: 2, label: 'Tháng 2' },
//   { value: 3, label: 'Tháng 3' },
//   { value: 4, label: 'Tháng 4' },
//   { value: 5, label: 'Tháng 5' },
//   { value: 6, label: 'Tháng 6' },
//   { value: 7, label: 'Tháng 7' },
//   { value: 8, label: 'Tháng 8' },
//   { value: 9, label: 'Tháng 9' },
//   { value: 10, label: 'Tháng 10' },
//   { value: 11, label: 'Tháng 11' },
//   { value: 12, label: 'Tháng 12' }
// ]);

// // Modal state
// const showModal = ref(false);
// const selectedOrder = ref(null);
// const showAllProducts = ref(false);

// // Sample data
// const orders = ref([
//   {
//     OrderID: 'ORD001',
//     OrderDate: '2023-05-15T14:30:00',
//     Status: 'Chờ xác nhận',
//     ShippingAddress: '123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM,123 Đường ABC, Quận 1, TP.HCM',
//     Province: 'TP.HCM',
//     Note: 'Giao hàng trước 17h',
//     IsOnline: true,
//     ShipMethod: 'Giao hàng nhanh',
//     CustomerID: 'CUS001',
//     CustomerName: 'Nguyễn Văn A',
//     StaffID: 'STAFF001',
//     StaffName: 'Trần Thị B',
//     FacilityID: 'STORE001',
//     FacilityName: 'Cửa hàng Hà Nội',
//     UpdatedAt: '2023-05-15T14:35:00',
//     TransactionType: 'Thanh toán online',
//     TransactionDate: '2023-05-15T14:32:00',
//     TotalAmount: 1250000,
//     shippingCode: 'GHN001',
//     Products: [
//       {
//         id: 'P001',
//         name: 'iPhone 13 Pro Max',
//         image: 'https://example.com/iphone.jpg',
//         price: 25000000,
//         originalPrice: 28000000,
//         quantity: 1
//       },
//       {
//         id: 'P002',
//         name: 'AirPods Pro',
//         image: 'https://example.com/airpods.jpg',
//         price: 5000000,
//         originalPrice: 5000000,
//         quantity: 2
//       },
//       {
//         id: 'P003',
//         name: 'Sạc MagSafe',
//         image: 'https://example.com/magsafe.jpg',
//         price: 1200000,
//         originalPrice: 1500000,
//         quantity: 1
//       },
//        {
//         id: 'P003',
//         name: 'Sạc MagSafe',
//         image: 'https://example.com/magsafe.jpg',
//         price: 1200000,
//         originalPrice: 1500000,
//         quantity: 1
//       },
//        {
//         id: 'P003',
//         name: 'Sạc MagSafe',
//         image: 'https://example.com/magsafe.jpg',
//         price: 1200000,
//         originalPrice: 1500000,
//         quantity: 1
//       },
//        {
//         id: 'P003',
//         name: 'Sạc MagSafe',
//         image: 'https://example.com/magsafe.jpg',
//         price: 1200000,
//         originalPrice: 1500000,
//         quantity: 1
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS001',
//       PaymentCode: 'PAY001',
//       TransactionType: 'Thanh toán đơn hàng',
//       TransactionDate: '2023-05-15T14:32:00',
//       Description: 'Thanh toán cho đơn hàng ORD001',
//       Status: 'Hoàn thành',
//       StaffName: 'Trần Thị B',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   },
//   {
//     OrderID: 'ORD002',
//     OrderDate: '2023-05-16T09:15:00',
//     Status: 'Chờ lấy hàng',
//     ShippingAddress: '456 Đường XYZ, Quận Hoàn Kiếm, Hà Nội',
//     Province: 'Hà Nội',
//     Note: '',
//     IsOnline: false,
//     ShipMethod: 'Giao hàng tiết kiệm',
//     CustomerID: 'CUS002',
//     CustomerName: 'Lê Văn C',
//     StaffID: 'STAFF002',
//     StaffName: 'Phạm Thị D',
//     FacilityID: 'STORE002',
//     FacilityName: 'Cửa hàng Đà Nẵng',
//     UpdatedAt: '2023-05-16T10:30:00',
//     TransactionType: 'Thanh toán trực tiếp',
//     TransactionDate: '2023-05-16T09:20:00',
//     TotalAmount: 7500000,
//     shippingCode: 'GHN002',
//     Products: [
//       {
//         id: 'P004',
//         name: 'MacBook Air M1',
//         image: 'https://example.com/macbook.jpg',
//         price: 22000000,
//         originalPrice: 25000000,
//         quantity: 1
//       },
//       {
//         id: 'P005',
//         name: 'USB-C Cable',
//         image: 'https://example.com/usbc.jpg',
//         price: 300000,
//         originalPrice: 300000,
//         quantity: 3
//       }
//     ],
//     Transaction: {
//       TransactionID: 'TRANS002',
//       PaymentCode: 'PAY002',
//       TransactionType: 'Thanh toán trực tiếp',
//       TransactionDate: '2023-05-16T09:20:00',
//       Description: 'Thanh toán tại cửa hàng',
//       Status: 'Hoàn thành',
//       StaffName: 'Phạm Thị D',
//       Approver: 'Nguyễn Văn C'
//     }
//   }
// ]);

// // Pagination
// const currentPage = ref(1);
// const itemsPerPage = 10;

// // Computed properties
// const filteredOrders = computed(() => {
//   return orders.value.filter(order => {
//     // Filter by search text
//     if (filters.value.search && 
//         !order.OrderID.toLowerCase().includes(filters.value.search.toLowerCase())) {
//       return false;
//     }
    
//     // Filter by order type
//     if (filters.value.orderType === 'online' && !order.IsOnline) return false;
//     if (filters.value.orderType === 'offline' && order.IsOnline) return false;
    
//     // Filter by date
//     const orderDate = new Date(order.OrderDate);
//     if (filters.value.year && orderDate.getFullYear() !== parseInt(filters.value.year)) return false;
//     if (filters.value.month && (orderDate.getMonth() + 1) !== parseInt(filters.value.month)) return false;
//     if (filters.value.day && orderDate.getDate() !== parseInt(filters.value.day)) return false;
    
//     return true;
//   });
// });

// const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));
// const paginatedOrders = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage;
//   const end = start + itemsPerPage;
//   return filteredOrders.value.slice(start, end);
// });

// const visibleProducts = computed(() => {
//   if (!selectedOrder.value) return [];
//   return showAllProducts.value 
//     ? selectedOrder.value.Products 
//     : selectedOrder.value.Products.slice(0, 3);
// });

// // Methods
// function showOrderDetail(order) {
//   selectedOrder.value = order;
//   showModal.value = true;
//   showAllProducts.value = false;
// }

// function closeModal() {
//   showModal.value = false;
// }

// function formatDate(dateString) {
//   if (!dateString) return '';
//   const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
//   return new Date(dateString).toLocaleDateString('vi-VN', options);
// }

// function formatDateTime(dateString) {
//   if (!dateString) return '';
//   const date = new Date(dateString);
//   const day = date.getDate().toString().padStart(2, '0');
//   const month = (date.getMonth() + 1).toString().padStart(2, '0');
//   const year = date.getFullYear();
//   const hours = date.getHours().toString().padStart(2, '0');
//   const minutes = date.getMinutes().toString().padStart(2, '0');
//   return `${hours}:${minutes} ${day}/${month}/${year}`;
// }

// function formatCurrency(amount) {
//   return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
// }

// function getStatusText(status) {
//   const statusMap = {
//     'Chờ xác nhận': 'Chờ xác nhận',
//     'Chờ lấy hàng': 'Chờ lấy hàng',
//     'Chờ giao hàng': 'Chờ giao hàng',
//     'Đơn hàng thành công': 'Thành công',
//     'Đã từ chối': 'Đã từ chối'
//   };
//   return statusMap[status] || status;
// }

// function getProvince(address) {
//   // Simple extraction - in real app you might want a more robust solution
//   if (address.includes('TP.HCM')) return 'TP.HCM';
//   if (address.includes('Hà Nội')) return 'Hà Nội';
//   if (address.includes('Đà Nẵng')) return 'Đà Nẵng';
//   return address.split(',').pop().trim();
// }
// // Thêm các state mới
// const showRejectReason = ref(false);
// const rejectReason = ref('');

// // Các hàm xử lý
// const toggleRejectReason = () => {
//   showRejectReason.value = !showRejectReason.value;
//   if (!showRejectReason.value) {
//     rejectReason.value = '';
//   }
// };

// const confirmOrder = () => {
//   // Xử lý xác nhận đơn hàng
//   alert(`Đã xác nhận đơn hàng ${selectedOrder.value.OrderID}`);
//   showModal.value = false;
// };

// const rejectOrder = () => {
//   if (!rejectReason.value.trim()) {
//     alert('Vui lòng nhập lý do từ chối');
//     return;
//   }
  
//   // Xử lý từ chối đơn hàng
//   alert(`Đã từ chối đơn hàng ${selectedOrder.value.OrderID} với lý do: ${rejectReason.value}`);
//   showModal.value = false;
//   showRejectReason.value = false;
//   rejectReason.value = '';
// };