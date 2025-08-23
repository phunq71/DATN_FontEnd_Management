<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import router from '../router';
import * as bootstrap from 'bootstrap'; // <-- JS của Bootstrap
// Dữ liệu giả lập
const areas = ref([
  // { id: 2, name: 'Miền Trung' },
  // { id: 3, name: 'Miền Nam' }
]);

const shops = ref([
  // { id: 1, name: 'Shop Hà Nội', areaId: 1 },
  // { id: 2, name: 'Shop Hải Phòng', areaId: 1 },
  // { id: 3, name: 'Shop Đà Nẵng', areaId: 2 },
  // { id: 4, name: 'Shop Huế', areaId: 2 },
  // { id: 5, name: 'Shop HCM', areaId: 3 },
  // { id: 6, name: 'Shop Cần Thơ', areaId: 3 }
]);

const currentRole = ref('');

const roles = ref([
  { value: 'STOCK', text: 'Nhân viên kho' },
  { value: 'STAFF', text: 'Nhân viên shop' }
]);


const rolesForAres = [
  { value: 'STOCK', text: 'Nhân viên kho' },
  { value: 'STAFF', text: 'Nhân viên shop' }
]

const rolesForAdmin = [
  { value: 'STOCK', text: 'Nhân viên kho' },
  { value: 'STAFF', text: 'Nhân viên shop' },
  { value: 'AREA', text: 'Quản lý khu vực' },
  { value: 'ADMIN', text: 'Quản trị hệ thống'}
]

const roleTexts =[
  { value: 'STOCK', text: 'Nhân viên kho' },
  { value: 'STAFF', text: 'Nhân viên shop' },
  { value: 'AREA', text: '<b>Quản lý khu vực</b>' },
  { value: 'ADMIN', text: 'Quản trị hệ thống'}
];

// Dữ liệu nhân viên
const staffs = ref([
  // {
  //   staffID: 'NV004',
  //   fullName: 'Phạm Thị D',
  //   email: 'ptd@gmail.com',
  //   password: '123456',
  //   phone: '0987654324',
  //   dob: '1993-07-25',
  //   address: {
  //     province: 'TP. Hồ Chí Minh',
  //     district: 'Quận 1',
  //     ward: 'Bến Nghé',
  //     detail: 'Số 4 Lê Lợi'
  //   },
  //   role: 'STOCK',
  //   status: false,
  //   shopId: null,
  //   areaId: 3,
  //   createAt: '2023-01-04',
  //   updateAt: '2023-01-04'
  // }
]);

// State
const selectedArea = ref('');
const selectedShop = ref('');
const searchQuery = ref('');

const currentPage = ref(1);
const totalPages = ref(0);


const isEditing = ref(false);

const currentStaff = reactive({
  staffID: '',
  fullName: '',
  email: '',
  password: '',
  phone: '',
  dob: '',
  fullAddress: '',
  role: '',
  status: true,
  createAt: '',
  updateAt: '',
  facilityID: '',
  province: '',
  district: '',
  ward: '',
  addressDetail: ''
});

let managerId;
// Computed
const fetchAreasAndShops = async () => {
  try {
    const res = await api.get("/admin/staffs/getArea", { withCredentials: true })
    console.log("fetch area:", res.data);
    const role = res.data.role;

    managerId = res.data.areas[0].managerId;
    console.log("manager: ",managerId);

    const data = res.data.areas // lấy mảng areas trong response



    // Tạo danh sách khu vực duy nhất
    const areaMap = new Map()
    const shopList = []

    data.forEach(item => {
      // Nếu area chưa có thì thêm
      if (!areaMap.has(item.areaID)) {
        areaMap.set(item.areaID, {
          id: item.areaID,
          name: item.areaName
        })


      }

      // Thêm shop tương ứng
      shopList.push({
        id: item.shopID,
        name: item.shopName,
        areaId: item.areaID
      })
    })

    areas.value = Array.from(areaMap.values())
    shops.value = shopList
    console.log("areas nhận được: ", areas.value);
    console.log("shops: ",shops.value)
    selectedArea.value= areas.value[0].id;

    if(role === "ROLE_ADMIN") {
      roles.value=rolesForAdmin;
      areas.value.push({id: "ADMIN", name: "Các tài khoản quản trị"} )
    } else if(role === "ROLE_AREA") {
      roles.value=rolesForAres;
    }

  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Thông báo',
      text: 'Bạn không có quyền mở trang này!',
      confirmButtonText: 'Quay lại trang chủ',
      confirmButtonColor: '#000000',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then(() => {

      router.push('/home');
    });
  }
}



const filteredShops = computed(() =>
      shops.value.filter(shop => shop.areaId === selectedArea.value)
);

// const filteredStaffs = computed(() => {
//   let result = staffs.value.filter(s => s.areaId === selectedArea.value);
//   if (selectedShop.value) result = result.filter(s => s.shopId === selectedShop.value);
//   if (searchQuery.value) {
//     const q = searchQuery.value.toLowerCase();
//     result = result.filter(s =>
//         s.staffID.toLowerCase().includes(q) ||
//         s.fullName.toLowerCase().includes(q) ||
//         s.email.toLowerCase().includes(q) ||
//         s.phone.toLowerCase().includes(q)
//     );
//   }
//   return result;
// });

// const paginatedStaffs = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage;
//   return filteredStaffs.value.slice(start, start + itemsPerPage);
// });
//
// const totalPages = computed(() =>
//     Math.ceil(filteredStaffs.value.length / itemsPerPage)
// );

// const filteredDistricts = computed(() =>
//     currentStaff.province ? districts[currentStaff.province] || [] : []
// );
//
// const filteredWards = computed(() =>
//     currentStaff.district ? wards[currentStaff.district] || [] : []
// );

const search= async () => {
  currentPage.value=1;
  await loadPageStaffs();
}

const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value=1;
  loadPageStaffs();
};


async function loadPageStaffs(){
  const pageNumber = Number(currentPage.value) - 1;
  const areaId= selectedArea.value;
  const shopId=selectedShop.value;

  const keyWord = searchQuery.value;

  const params = {
    pageNumber: pageNumber,
    areaId: areaId
  }

  if(shopId!== ''){
    params.shopId=shopId;
  }

  if(keyWord !== ''){
    params.keyWord=keyWord;
  }

  const pageStaff = await api.get("/admin/staffs/getStaffs",
      {
        params,
        withCredentials: true
      })
  totalPages.value=pageStaff.data.totalPages;
  staffs.value=pageStaff.data.content;

  // console.log("params: ", params);
  // console.log("page", pageStaff.data);
  // console.log("list", staffs.value);
}

watch([selectedArea, selectedShop, currentPage], async () => {
  await loadPageStaffs();
});

const formTitle = computed(() =>
    isEditing.value ? 'CẬP NHẬT NHÂN VIÊN' : 'THÊM MỚI NHÂN VIÊN'
);

// Methods
function resetForm() {
  Object.assign(currentStaff, {
    staffID: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    role: '',
    status: true,
    createAt: '',
    updateAt: '',
    facilityID: '',
    province: '',
    district: '',
    ward: '',
    addressDetail: ''
  });
  isEditing.value = false;
}


async function validateForm() {
  // Reset all validation states
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

  // Full Name validation
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
  if (!currentStaff.fullName) {
    await showSweetError('Vui lòng nhập họ tên', 'fullName');
    return false;
  } else if (!nameRegex.test(currentStaff.fullName)) {
    await showSweetError('Tên không được chứa số hoặc ký tự đặc biệt', 'fullName');
    return false;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!currentStaff.email) {
    await showSweetError('Vui lòng nhập email', 'email');
    return false;
  } else if (!emailRegex.test(currentStaff.email)) {
    await showSweetError('Email không hợp lệ', 'email');
    return false;
  }

  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!isEditing && !currentStaff.password) {
    await showSweetError('Vui lòng nhập mật khẩu', 'password');
    return false;
  } else if (currentStaff.password && !passwordRegex.test(currentStaff.password)) {
    await showSweetError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt', 'password');
    return false;
  }

  // Phone validation
  const phoneRegex = /^0\d{9}$/;
  if (!currentStaff.phone) {
    await showSweetError('Vui lòng nhập số điện thoại', 'phone');
    return false;
  } else if (!phoneRegex.test(currentStaff.phone)) {
    await showSweetError('Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số', 'phone');
    return false;
  }

  // Date of Birth validation
  if (!currentStaff.dob) {
    await showSweetError('Vui lòng nhập ngày sinh', 'dob');
    return false;
  } else if (new Date(currentStaff.dob) >= new Date()) {
    await showSweetError('Ngày sinh phải nhỏ hơn ngày hiện tại', 'dob');
    return false;
  }

  // Address validation
  if (!currentStaff.province) {
    await showSweetError('Vui lòng chọn tỉnh/thành phố', 'province');
    return false;
  }
  if (!currentStaff.district) {
    await showSweetError('Vui lòng chọn quận/huyện', 'district');
    return false;
  }
  if (!currentStaff.ward) {
    await showSweetError('Vui lòng chọn xã/phường', 'ward');
    return false;
  }

  // Address detail validation
  const addressDetailRegex = /^[^,]+$/;
  if (!currentStaff.addressDetail) {
    await showSweetError('Vui lòng nhập địa chỉ chi tiết', 'addressDetail');
    return false;
  } else if (!addressDetailRegex.test(currentStaff.addressDetail)) {
    await showSweetError('Địa chỉ không được chứa dấu phẩy hoặc ký tự đặc biệt', 'addressDetail');
    return false;
  }

  // Role validation
  if (currentStaff.role === 'STAFF' && !isEditing && !selectedShop.value) {
    await showSweetError('Vui lòng chọn shop cho nhân viên', 'role');
    return false;
  }

  return true;
}

// Helper function to show SweetAlert2 error and highlight field
async function showSweetError(message, fieldId = null) {
  if (fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('is-invalid');
      field.focus();
    }
  }

  await Swal.fire({
    icon: 'error',
    title: 'Lỗi',
    text: message,
    confirmButtonColor: '#0066CC',
    confirmButtonText: 'Đã hiểu'
  });
}

const demoteData = ref({
  areaId: '',
  shopId: null,
  newRole: 'STOCK'
});

const roleChangeModal = ref(null);

onMounted(() => {
  roleChangeModal.value = new bootstrap.Modal(document.getElementById('roleChangeModal'));
});

const confirmDemote = async () => {
  try {
    const response = await api.put('/admin/staffs/demoteStaff', demoteData.value, {withCredentials: true});

    if (response.data) {
      roleChangeModal.value.hide();
      await proceedWithSave();
    } else {
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể thực hiện thay đổi',
        icon: 'error'
      });
    }
  } catch (error) {
    Swal.fire({
      title: 'Lỗi',
      text: 'Đã xảy ra lỗi khi gửi yêu cầu',
      icon: 'error'
    });
  }
};

const proceedWithSave = async () => {
  try {
    if (isEditing.value) {
      // UPDATE logic
      const response = await updateStaff(currentStaff);


      Swal.fire({
        title: response.data.message,
        icon: response.data.status,
        confirmButtonColor: '#000'
      });
      if(response.data.status==="success"){
        await fetchAreasAndShops();
        await loadPageStaffs();
        //resetForm();
      }

    } else {
      // CREATE logic
      const response = await createStaff(currentStaff);


      Swal.fire({
        title: response.data.message,
        icon: response.data.status,
        confirmButtonColor: '#000'
      });
      if(response.data.status==="success"){
        await fetchAreasAndShops();
        await loadPageStaffs();
        resetForm();
      }

    }
  } catch (error) {
    Swal.fire({
      title: 'Lỗi',
      text: 'Đã xảy ra lỗi khi lưu thông tin',
      icon: 'error'
    });
  }
};

const saveStaff = async () => {
  if (!(await validateForm())) return;
  console.log("Tiến hành save!")
  currentStaff.fullAddress = currentStaff.addressDetail + ", " +
      findLocationNameById(currentStaff.ward) + ", " +
      findLocationNameById(currentStaff.district) + ", " +
      findLocationNameById(currentStaff.province);
  console.log("Đã lưu address: ", currentStaff.fullAddress);


  if(!isEditing) {
    if (currentStaff.role === "ADMIN") {
      currentStaff.facilityID = "";
    } else if (currentStaff.role === "STOCK" || currentStaff.role === "AREA") {
      currentStaff.facilityID = selectedArea.value;
    } else {
      currentStaff.facilityID = selectedShop.value;
    }
  }else {
    if (currentStaff.role === "ADMIN") {
      currentStaff.facilityID = "";
    } else if (currentStaff.role === "STOCK" || currentStaff.role === "AREA") {
      currentStaff.facilityID = selectedArea.value;
    } else {
      currentStaff.facilityID = selectedShop.value!==""? selectedShop.value : currentStaff.facilityID;
    }
  }

  // Handle AREA role case
  if ( currentStaff.role === "AREA" && managerId!==null && managerId!==currentStaff.staffID ) {
    demoteData.value.areaId = selectedArea.value;
    roleChangeModal.value.show();
  } else {
    await proceedWithSave();
  }
};


function editStaff(staff) {
  Object.assign(currentStaff, JSON.parse(JSON.stringify(staff)));
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const addressIds= getAddressID(currentStaff.province, currentStaff.district, currentStaff.ward);
  currentStaff.province = addressIds[0];

  currentStaff.district = addressIds[1];
  currentStaff.ward =addressIds[2];
  console.log("AddressIds", addressIds);
  console.log("currentStaff", currentStaff)
}


async function deleteStaff() {

  let title = 'Xác nhận xóa?';
  let text = `Bạn có chắc muốn xóa nhân viên ${currentStaff.fullName} không?`;

  if(currentStaff.role==="AREA"){
    title = "Đây là tài khoản quản lý";
  }

  const confirm = await Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0066CC',
    cancelButtonColor: '#656565',
    confirmButtonText: 'Có, hãy xóa đi!',
    cancelButtonText: 'Hủy, không xóa nữa'
  });

  if (!confirm.isConfirmed) return;

  try {
    const response = await deleteByStaff(currentStaff);
    const data = response.data;

    await Swal.fire({
      icon: data.status || 'info',
      title: data.message || 'Thông báo',
      text: data.text || '',
      confirmButtonColor: '#0066CC'
    });

    if (data.status === 'success') {
      resetForm();
      await fetchAreasAndShops();
      await loadPageStaffs();
    }

  } catch (error) {
    const isUnauthorized = error.response?.status === 401;

    await Swal.fire({
      icon: 'error',
      title: 'Có lỗi xảy ra',
      text: isUnauthorized
          ? 'Bạn không có quyền thực hiện thao tác này.'
          : 'Vui lòng thử lại sau.',
      confirmButtonColor: '#0066CC'
    });
  }
}

async function createStaff(staff){
  console.log("cần tạo: ",staff);
  const response = await api.post("/admin/staffs/createStaff", staff ,{withCredentials: true});
  console.log(response.data);
  return response;
}

async function updateStaff(staff){
  console.log("cần update: ",staff);
  const response = await api.put("/admin/staffs/updateStaff", staff ,{withCredentials: true});
  console.log(response.data);
  return response;
}

async function deleteByStaff(staff){
  console.log("cần xóa: ",staff);
  const response = await api.post("/admin/staffs/deleteStaff", staff ,{withCredentials: true});
  console.log(response.data);
  return response;
}




function getRoleText(val) {
  const role = roleTexts.find(r => r.value === val);
  return role ? role.text : val;
}

function onAreaChange() {
  selectedShop.value = '';
  currentPage.value = 1;
}

function onShopChange() {
  currentPage.value = 1;
  if (selectedShop.value && !currentStaff.role) {
    currentStaff.role = 'STAFF';
  }

  if(selectedShop.value ==="") currentStaff.role='';
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function goToPage(p) {
  currentPage.value = p;
}

// Khởi tạo
onMounted(async () => {



  await fetchAreasAndShops();
  await fetchAddress();
  resetForm();


  const resizer = document.getElementById('resizer');
  const left = resizer.previousElementSibling;
  const right = resizer.nextElementSibling;

  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const containerOffsetLeft = document.querySelector('.resizable-row').offsetLeft;
    const newLeftWidth = e.clientX - containerOffsetLeft;

    if (newLeftWidth > 100 && newLeftWidth < window.innerWidth - 100) {
      left.style.width = newLeftWidth + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isResizing = false;
    document.body.style.cursor = 'default';
  });


});
let dataAddress = [];
let provincesSelect;
let districtsSelect;
let wardsSelect;


async function fetchAddress(){
  provincesSelect = document.getElementById('province');
  districtsSelect = document.getElementById('district');
  wardsSelect = document.getElementById('ward');



  // Load JSON dữ liệu

  await api.get("/data/Address.json", {withCredentials: true}).then(json => {
    dataAddress = json.data;
    populateProvinces();
  });

  function populateProvinces() {
    dataAddress.forEach(province => {
      let option = document.createElement('option');
      option.value = province.ProvinceID;
      option.textContent = province.ProvinceName;
      provincesSelect.appendChild(option);
    });
  }

  provincesSelect.addEventListener('change', () => {
    clearSelect(districtsSelect);
    clearSelect(wardsSelect);

    let selectedProvinceId = provincesSelect.value;


    let province = dataAddress.find(p => p.ProvinceID == selectedProvinceId);
    if (province) {
      //districtContainer.style.display = 'block';
      province.Districts.forEach(district => {
        let option = document.createElement('option');
        option.value = district.DistrictID;
        option.textContent = district.DistrictName;
        districtsSelect.appendChild(option);
      });
    }
  });

  districtsSelect.addEventListener('change', () => {
    clearSelect(wardsSelect);
    // resultDiv.style.display = 'none';

    let selectedProvinceId = provincesSelect.value;
    let selectedDistrictId = districtsSelect.value;

    // if (!selectedDistrictId) {
    //     wardContainer.style.display = 'none';
    //     return;
    // }

    let province = dataAddress.find(p => p.ProvinceID == selectedProvinceId);
    if (!province) return;

    let district = province.Districts.find(d => d.DistrictID == selectedDistrictId);
    if (district) {
      // wardContainer.style.display = 'block';
      district.Wards.forEach(ward => {
        let option = document.createElement('option');
        option.value = ward.WardCode;
        option.textContent = ward.WardName;
        wardsSelect.appendChild(option);
      });
    }
  });

  wardsSelect.addEventListener('change', () => {
    let selectedWardCode = wardsSelect.value;
    // if (!selectedWardCode) {
    //     resultDiv.style.display = 'none';
    //     return;
    // }

    // resProvince.textContent = provincesSelect.value;
    // resDistrict.textContent = districtsSelect.value;
    // resWard.textContent = selectedWardCode;
    // resultDiv.style.display = 'block';
  });

  function clearSelect(selectElement) {
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
  }
}

function findLocationNameById(id) {
  const numericId = id;

  for (const province of dataAddress) {
    if (province.ProvinceID === numericId) {
      return province.ProvinceName;
    }

    for (const district of province.Districts) {
      if (district.DistrictID === numericId) {
        return district.DistrictName;
      }

      for (const ward of district.Wards) {
        if (ward.WardCode === numericId) {
          return ward.WardName;
        }
      }
    }
  }
  console.log("❌❌❌không tìm thấy:", id);
  return null;
}



/**
 * Truyền vào:
 * @param {String} provinceName - tên tỉnh/thành phố
 * @param {String} districtName - tên quận/huyện
 * @param {String} wardName - tên xã/phường/thị trấn
 * @returns {Array} [provinceID, districtID, wardCode] hoặc [null, null, null] nếu không thấy
 */
function getAddressID(provinceName, districtName, wardName) {
  let provinceID = null;
  let districtID = null;
  let wardCode = null;

  // Tìm tỉnh
  const province = dataAddress.find(p => p.ProvinceName === provinceName);
  //console.log("🚛 Tìm tỉnh:", provinceName, "=>", province);
  if (province) {
    provinceID = province.ProvinceID;
    //console.log("🚛 provinceID:", provinceID);

    // Tìm quận/huyện trong tỉnh
    const district = province.Districts.find(d => d.DistrictName === districtName);
    //console.log("🚛 Tìm quận/huyện:", districtName, "=>", district);
    if (district) {
      districtID = district.DistrictID;
     // console.log("🚛 districtID:", districtID);

      // Tìm xã/phường trong quận/huyện
      const ward = district.Wards.find(w => w.WardName === wardName);
     // console.log("🚛 Tìm xã/phường:", wardName, "=>", ward);
      if (ward) {
        wardCode = ward.WardCode;
        console.log("🚛 wardCode:", wardCode);
      }
    }
  }

  provincesSelect.value=provinceID;
  provincesSelect.dispatchEvent(new Event('change'));
  districtsSelect.value=districtID;
  districtsSelect.dispatchEvent(new Event('change'));
  wardsSelect.value=wardCode;


  return [provinceID, districtID, wardCode];
}




function getFacilityName(facilityID){
  const listAreas = areas.value;
  const listShops = shops.value;

  const area = listAreas.find(a => a.id === facilityID);
  if(area) return area.name;

  const shop = listShops.find(s => s.id === facilityID);
  if(shop) return shop.name;

  return '';
}


</script>


<template>
  <div id="app">
    <div class="container">
      <!-- Dòng 1: Tiêu đề -->
      <div class="row">
        <div class="col-12 text-center header">
          <h2>QUẢN LÝ NHÂN VIÊN</h2>
        </div>
      </div>

      <!-- Dòng 2: Select khu vực và shop -->
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="area" class="form-label">Khu vực</label>
          <select id="area" class="form-select" v-model="selectedArea" @change="onAreaChange">
            <option v-for="area in areas" :value="area.id" :key="area.id">{{ area.name }}</option>
          </select>
        </div>
        <div class="col-md-6">
          <label for="shop" class="form-label">Shop</label>
          <select id="shop" class="form-select" v-model="selectedShop" @change="onShopChange">
            <option value="">-- Tất cả shop --</option>
            <option v-for="shop in filteredShops" :value="shop.id" :key="shop.id">{{ shop.name }}</option>
          </select>
        </div>
      </div>

      <!-- Dòng 3: Form và List -->
      <div class="row resizable-row">
        <!-- Cột trái: Form -->
        <div class="col-left">
          <div class="form-section">
            <h4 class="mb-3">{{ formTitle }}</h4>

            <div class="mb-3">
              <label for="staffID" class="form-label">Mã nhân viên</label>
              <input type="text" class="form-control" id="staffID" v-model="currentStaff.staffID" disabled>
            </div>

            <div class="mb-3">
              <label for="fullName" class="form-label">Họ và tên</label>
              <input type="text" class="form-control" id="fullName" v-model="currentStaff.fullName">
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input type="email" class="form-control" id="email" v-model="currentStaff.email">
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Mật khẩu</label>
              <input type="text" class="form-control" id="password" v-model="currentStaff.password"
                     :placeholder="isEditing ? 'Nhập mật khẩu mới (nếu cần đổi)' : ''">
            </div>

            <div class="mb-3">
              <label for="phone" class="form-label">Số điện thoại</label>
              <input type="tel" class="form-control" id="phone" v-model="currentStaff.phone">
            </div>

            <div class="mb-3">
              <label for="dob" class="form-label">Ngày sinh</label>
              <input type="date" class="form-control" id="dob" v-model="currentStaff.dob">
            </div>

            <div class="mb-3">
              <label class="form-label">Địa chỉ</label>
              <div class="row g-2 mb-2">
                <div class="col-md-4">
                  <select class="form-select" id="province" v-model="currentStaff.province">
                    <option value="" selected disabled>Tỉnh/Thành phố</option>
<!--                    <option v-for="province in provinces" :value="province" :key="province">{{ province }}</option>-->
                  </select>
                </div>
                <div class="col-md-4">
                  <select class="form-select" id="district" v-model="currentStaff.district">
                    <option value="" selected disabled>Quận/Huyện</option>
<!--                    <option v-for="district in filteredDistricts" :value="district" :key="district">{{ district }}</option>-->
                  </select>
                </div>
                <div class="col-md-4">
                  <select class="form-select" id="ward" v-model="currentStaff.ward">
                    <option value="" selected disabled>Xã/Phường</option>
<!--                    <option v-for="ward in filteredWards" :value="ward" :key="ward">{{ ward }}</option>-->
                  </select>
                </div>
              </div>
              <input type="text" class="form-control" placeholder="Địa chỉ chi tiết" v-model="currentStaff.addressDetail">
            </div>

            <div class="mb-3">
              <label for="role" class="form-label">Vai trò</label>
              <select id="role" class="form-select" v-model="currentStaff.role">
                <option
                    v-for="role in roles"
                    :key="role.value"
                    :value="role.value"
                    :disabled="role.value === 'STAFF' && !selectedShop"
                >
                  {{ role.text }} {{ role.value === 'STAFF' && !isEditing && !selectedShop ? '(Vui lòng chọn shop)' : '' }}
                </option>
              </select>
            </div>


            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="status" v-model="currentStaff.status">
              <label class="form-check-label" for="status">Kích hoạt tài khoản</label>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Ngày tạo tài khoản:</label>
                <div>{{ currentStaff.createAt }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Lần cập nhật gần nhất:</label>
                <div>{{ currentStaff.updateAt }}</div>
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <button class="btn btn-primary" @click="saveStaff">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
              <button class="btn btn-outline-secondary" @click="resetForm">Reset</button>
              <button class="btn btn-outline-danger" @click="deleteStaff" v-if="isEditing">Xóa</button>
            </div>
          </div>
        </div>
        <div class="resizer" id="resizer"></div>
        <!-- Cột phải: Danh sách -->
        <div class="col-right">
          <div class="list-section">
            <div class="search-box">
              <div class="input-group">
                <input
                    type="text"
                    class="form-control"
                    placeholder="Tìm kiếm nhân viên..."
                    v-model="searchQuery"
                    @keyup.enter="loadPageStaffs"
                >

                <!-- Nút dấu X hiện khi đã nhập -->
                <button
                    v-if="searchQuery"
                    class="btn btn-outline-secondary"
                    type="button"
                    @click="clearSearch"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>

                <button
                    class="btn btn-outline-primary ps-3"
                    type="button"
                    @click="search"
                >
                  <i class="fa fa-search"></i>
                </button>
              </div>
            </div>


            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Họ tên</th>
                  <th>Vai trò</th>
                  <th v-if="selectedArea!=='ADMIN'">Cơ sở</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="staff in staffs" :key="staff.staffID" >
                  <td>{{ staff.staffID }}</td>
                  <td>{{ staff.fullName }}</td>
                  <td v-html="getRoleText(staff.role)"></td>
                  <td v-if="selectedArea!=='ADMIN'">{{  getFacilityName(staff.facilityID) }}</td>
                  <td :class="staff.status ? 'status-active' : 'status-inactive'">
                    {{ staff.status ? '✅' : '❌' }}
                  </td>
                  <td>
                    <button class="btn btn-sm btn-outline-primary" @click="editStaff(staff)">Sửa</button>
                  </td>
                </tr>
                <tr v-if="staffs.length === 0" style="height: 350px; ">
                  <td :colspan="selectedArea !== 'ADMIN' ? 6 : 5" class="text-center text-muted fw-bolder fs-4" >
                    Không có kết quả phù hợp
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <nav aria-label="Page navigation">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="prevPage">Trước</a>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
                  <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="nextPage">Sau</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>




  <!-- Modal for role change confirmation -->
  <div class="modal fade" id="roleChangeModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Xác nhận thay đổi quản lý khu vực</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Để tạo quản lý khu vực mới, bạn cần giáng chức quản lý cũ. Vui lòng chọn:</p>

          <div class="mb-3">
            <label class="form-label">Chọn vai trò mới cho quản lý cũ</label>
            <select class="form-select" v-model="demoteData.newRole">
              <option value="STOCK">Nhân viên kho</option>
              <option value="STAFF">Nhân viên shop</option>
            </select>
          </div>

          <div class="mb-3" v-if="demoteData.newRole === 'STAFF'">
            <label class="form-label">Chọn shop</label>
              <select id="shop" class="form-select" v-model="demoteData.shopId">
                <option v-for="shop in filteredShops" :value="shop.id" :key="shop.id">{{ shop.name }}</option>
              </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
          <button type="button" class="btn btn-dark" @click="confirmDemote">Gửi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary-color: #0066CC;
  --secondary-color: #e9f2fb;
}

.table td, .table th {
  vertical-align: middle;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; /* hoặc số px ông thấy phù hợp */
  height: 70px;

}

.table-responsive {
  position: relative;
  min-height: 420px; /* đảm bảo chiều cao tối thiểu */
}

.table tbody {
  display: block;
  min-height: 350px; /* tùy chỉnh để luôn giữ khoảng trống */
}

.table thead,
.table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}


body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.container {
  max-width: 1400px;
}

.header {
  color: var(--primary-color);

  padding: 15px 0;
  margin-bottom: 20px;
  border-radius: 5px;
}

.form-section {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  background-color: #f9f9f9;
  height: 100%;
}

.list-section {

  border-radius: 5px;
  padding: 0px;
  background-color: white;
}

.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-primary {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline-primary:hover {
  background-color: var(--primary-color);
  color: white;
}

.table th {
  background-color: var(--secondary-color);
}

.pagination .page-item.active .page-link {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.pagination .page-link {
  color: var(--primary-color);
}

.search-box {
  margin-bottom: 15px;
}

.status-active {
  color: green;
  font-weight: bold;
}

.status-inactive {
  color: red;
  font-weight: bold;
}

.page-item.active .page-link {
  color: white;
}


.invalid-feedback {
  display: block;
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
}

.is-invalid {
  border-color: #dc3545;
}

.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

/*-----------------------------------------------------------------------------*/
.resizable-row {
  display: flex;
  height: 100vh;
  margin-bottom: 30px;
}

.col-left, .col-right {
  overflow-y: auto;
}

.col-left {
  width: 50%;
  min-width: 100px;
  padding-right: 0;
  margin-bottom: 20px;
}

.col-right {
  flex: 1 0 0;
  min-width: 100px;
  padding-left: 0;
}

.resizer {
  width: 1px;
  cursor: col-resize;
  background-color: #e0e0e0;
  padding-left: 5px;
  padding-right: 5px;
  margin-left: 3px;
  margin-right: 3px;
  border-radius: 10px;
  margin-bottom: 20px;
}
</style>