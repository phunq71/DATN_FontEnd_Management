<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import colorData from '../assets/data/Color.json'

const colorOptions = ref([])
const flagCreate = ref(false);

const route = useRoute()
const productId = route.params.id

const product = ref(null);

const sizes = ref([])
const variants = ref([])
const variantSizes = ref([])
const sizeCodes = ref([])
const selectedVariant = ref(null)
const showModal = ref(false)
const showAddSizeModal = ref(false)
const selectedVariantIds = ref([])
const selectedSizeId = ref(null)
const listSizeNew = ref([])
const msg = ref()
const msg2 = ref()


const openEditModal = (variant) => {
  selectedVariant.value = { ...variant }
  showModal.value = true
}

const saveVariant = () => {
  // Save logic here
  showModal.value = false
}

const addSize = () => {

}
//============================= Lấy Api product ========================
async function fetchProduct() {
  const url = '/admin/productDetail/getProduct';

  try {
    const response = await api.get(url, {
      params: { id: productId },
      withCredentials: true
    });

    console.log(response.data);
    product.value = response.data;
    variants.value = response.data.listVariants;
    variantSizes.value = response.data.variantSizes;
    sizeCodes.value = [...new Set(variantSizes.value.map(item => item.sizeCode))]
    console.log(sizeCodes);
    await fetchSizes();
    getNextVariantId();


    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy Pro:', error);

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
// ================Hàm check cấu hình size cho sản phẩm =======================
function isChecked(size, variantId) {
  return variantSizes.value.some(
      item => item.sizeCode === size && item.variantID === variantId && item.checked
  );
}

function toggleSize(sizeCode, variantID, checked) {
  const index = variantSizes.value.findIndex(
      item => item.sizeCode === sizeCode && item.variantID === variantID
  );

  if (index !== -1) {
    // Nếu tồn tại, cập nhật checked
    variantSizes.value[index].checked = checked;
  } else {
    // Nếu chưa có, thêm mới
    variantSizes.value.push({ sizeCode, variantID, checked });
  }

  return [];
}


//================== Hàm update sản phẩm ====================================
function saveProduct(){
    const url = '/admin/productDetail/updateProduct';
  console.log(product.value)
  // Kiểm tra dữ liệu trước khi gửi
  if (!product.value.name || product.value.name.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Tên sản phẩm không được để trống',
      confirmButtonText: 'OK'
    });
    return;
  }

  if (!product.value.description || product.value.description.trim().length < 150) {
    Swal.fire({
      icon: 'warning',
      title: 'Mô tả quá ngắn',
      text: 'Mô tả sản phẩm phải có ít nhất 150 ký tự để đảm bảo đầy đủ thông tin.',
      confirmButtonText: 'OK'
    });
    return;
  }

  if (!product.value.brand || product.value.brand.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Thương hiệu không được để trống',
      confirmButtonText: 'OK'
    });
    return;
  }
  try {
    const response = api.put(url,
      product.value
    ,{
        withCredentials: true
    });
    Swal.fire({
      icon: 'success',
      title: 'Cập nhật thành công',
      text: 'Hệ thống đã ghi nhận thông tin cập nhật của bạn!',
      confirmButtonText: 'OK'
    });

  } catch (error) {
    console.error('Lỗi khi lấy Pro:', error);

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      Swal.fire({
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
// ========================== Lấy sizes =======================
async function fetchSizes(){
  try {
    const response = await api.get('/admin/productDetail/size',{
      withCredentials: true
    } ) // 🔁 Thay đổi endpoint phù hợp
    console.log('sizeCodes:', sizeCodes.value)
    console.log(response.data)
    listSizeNew.value = response.data.filter(size => !sizeCodes.value.includes(size.code));
    if (listSizeNew.value.length > 0 && selectedSizeId.value == null) {
      selectedSizeId.value = listSizeNew.value[0].sizeID;
    }

  } catch (error) {
    console.error('Lỗi khi tải size:', error)
  }
}
onMounted(() => {
  fetchProduct();
  colorOptions.value = colorData;
});
// ========================== UPdate cấu hình sizes =============================
async function updateSeletedSize() {
  const url = '/admin/productDetail/update-size-config';
  console.log(product.value);


  try {
    const response = await api.post(url, product.value, {
      withCredentials: true
    });
    showAddSizeModal.value = false;
    selectedSizeId.value = null;
    selectedVariantIds.value = [];
    await fetchProduct();
    Swal.fire({
      icon: 'success',
      title: 'Cập nhật thành công',
      text: 'Hệ thống đã ghi nhận thông tin cập nhật cấu hình size!',
      confirmButtonText: 'OK'
    });

  } catch (error) {

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });

      window.location.href = '/home';
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Không cho phép xóa',
        text: 'Có Item dùng trong nhiều bản ghi nên không được xóa!',
        confirmButtonText: 'OK'
      });
      const url = '/admin/productDetail/getProduct';

      const response = await api.get(url, {
        params: { id: productId },
        withCredentials: true
      });

// Cập nhật variantSizes mới, giữ nguyên các thuộc tính còn lại
      product.value = {
        ...product.value,
        variantSizes: response.data.variantSizes
      };
      variants.value = response.data.listVariants;
      variantSizes.value = response.data.variantSizes;
      sizeCodes.value = [...new Set(variantSizes.value.map(item => item.sizeCode))]
      console.log(product.value)
      return [];

    }
  }
}
// ============================ Thêm size ===========================
async function submitSizeConfig(){
  const url = '/admin/productDetail/submitSizeConfig';
  console.log(product.value);

  if (!selectedVariantIds.value || selectedVariantIds.value.length === 0) {
    msg.value = "Bạn cần phải chọn ít nhất 1 sản biến thể!"
    return;
  }

  console.log("selectedSizeId", selectedSizeId.value);
  console.log("selectedVariantIds", selectedVariantIds.value);

  try {
    const response = await api.post(url, {
      selectedSizeId: selectedSizeId.value,
      selectedVariantIds: [...selectedVariantIds.value]
    }, {
      withCredentials: true
    });
    msg.value = '';
    showAddSizeModal.value = false;
    selectedSizeId.value = null;
    selectedVariantIds.value = [];
    await fetchProduct();
    Swal.fire({
      icon: 'success',
      title: 'Thêm size thành công',
      text: 'Hệ thống đã ghi nhận thông tin cập nhật cấu hình size!',
      confirmButtonText: 'OK'
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });

      window.location.href = '/home';
    }
  }
}

// ========================== Uploads ảnh lên tạm ============================
// Tham chiếu input file
const imageInput = ref(null)

// Mở hộp thoại chọn file
const openFileDialog = () => {
  if (imageInput.value) {
    imageInput.value.click()
  } else {
    console.warn('imageInput is not ready yet.')
  }
}

// Xử lý chọn nhiều ảnh
const handleImageUpload = (event) => {
  const files = event.target.files
  if (!files.length) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        // Convert sang WebP (85% quality)
        canvas.toBlob(
            (blob) => {
              const webpFile = new File(
                  [blob],
                  file.name.replace(/\.\w+$/, '.webp'),
                  { type: 'image/webp' }
              )

              // Thêm vào danh sách ảnh
              selectedVariant.value.images.push({
                isNew: true,
                file: webpFile,
                preview: URL.createObjectURL(webpFile),
                isMain: false
              })
            },
            'image/webp',
            0.85
        )
      }
      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  }

  // Reset input để có thể chọn lại cùng file
  event.target.value = null
}


const setMainImage = (index) => {
  selectedVariant.value.images.forEach((img, i) => {
    img.isMain = i === index
  })
}

//========================== Lấy màu hiện =====================
const selectedColor = ref('black')

function getSelectedColorCode() {
  if (!selectedVariant.value) return 'black';
  const selected = colorOptions.value.find(c => c.ten === selectedVariant.value.color);
  return selected ? selected.ma : 'black';
}

watch(() => selectedVariant.value?.color, (newColor) => {
  if (!newColor) {
    selectedColor.value = 'black';
    return;
  }
  selectedColor.value = getSelectedColorCode();
}, { immediate: true })
// ===================== Xóa ảnh =======================
const removeImage = (index) => {
  const removed = selectedVariant.value.images.splice(index, 1)[0]

  // Nếu ảnh bị xóa là ảnh chính => gán ảnh đầu tiên còn lại làm ảnh chính
  if (removed?.isMain && selectedVariant.value.images.length > 0) {
    selectedVariant.value.images[0].isMain = true
  }

  // Nếu ảnh mới upload có preview => giải phóng bộ nhớ
  if (removed?.isNew && removed.preview) {
    URL.revokeObjectURL(removed.preview)
  }
}
// ====================== Hàm update Variant ==========================
async function updateVariant(){
  const url = '/admin/productDetail/updateVariant';
  console.log(product);
  console.log(selectedVariant);


  // Kiểm tra giá của từng biến thể
  if (!selectedVariant.value || selectedVariant.value.price < 1000) {
    msg2.value = "Giá tối thiểu 1000đ!"
    return;
  }

  if (selectedVariant.value.description === null || selectedVariant.value.description.trim() === '') {
    msg2.value = "Không được để trống mô tả!"
    return;
  }

  const hasMainImage = selectedVariant.value.images.some(img => img.isMain === true);
  if (!hasMainImage) {
    msg2.value = "Phải chọn ít nhất 1 ảnh làm ảnh chính!";
    return;
  }

  if (selectedVariant.value.description.trim().length < 150){
    msg2.value = "Mô tả không được nhập quá ngắn!"
    return;
  }

  if (selectedVariant.value.images.length < 2){
    msg2.value = "Phải có ít nhất 2 ảnh sản phẩm!"
    return;
  }

  if (
      !selectedVariant.value.isMainVariant && // biến thể hiện tại KHÔNG phải main
      !product.value.listVariants.some(
          v => v.isMainVariant && v.id !== selectedVariant.value.id // không có main khác
      )
  ) {
    msg2.value = "Bạn phải chọn ít nhất một biến thể làm biến thể chính!"
    return
  }


  const newImages = selectedVariant.value.images
      .filter(img => img.isNew)
      .map(img => ({
        file: img.file,
        isMainVariant: img.isMainVariant
      }))

  const formData = new FormData()

// Gửi JSON của selectedVariant
  formData.append('selectedVariant', JSON.stringify(selectedVariant.value))

// Gửi file và cờ isMain song song
  newImages.forEach(img => {
    formData.append('files', img.file)                    // File
  })

  formData.append('mainIndex', selectedVariant.value.images.findIndex(img => img.isMain));
  console.log('👉',selectedVariant.value.images.findIndex(img => img.isMain));
// PUT multipart phải set Content-Type thủ công
  try {
    const response = await api.post(url, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    msg2.value = '';
    // showAddSizeModal.value = false;
    // selectedSizeId.value = null;
    // selectedVariantIds.value = null;
    await fetchProduct();
    await fetchSizes();
    Swal.fire({
      icon: 'success',
      title: 'Lưu thay đổi thành công',
      text: 'Hệ thống đã ghi nhận thông tin cập nhật!',
      confirmButtonText: 'OK'
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });

      window.location.href = '/home';
    }
  }
}

async function closeModel(){
  console.log('😎😎😎😎😎😎')
  showModal.value = false;
  const url = '/admin/productDetail/getProduct';


    const response = await api.get(url, {
      params: {id: productId},
      withCredentials: true
    })

  product.value = {
    ...product.value,
    variantSizes: response.data.variantSizes
  };
  variants.value = response.data.listVariants;
  console.log(product.value)
  return [];
}

async function reset() {
  selectedVariant.value.id = ''
  selectedVariant.value.color = 'Đen'
  selectedVariant.value.createdDate = getToday()
  selectedVariant.value.description = ''
  selectedVariant.value.discount = 0
  selectedVariant.value.price = 1000
  selectedVariant.value.isMainVariant = false
  selectedVariant.value.isUse = true
  selectedVariant.value.images.splice(0) // xóa toàn bộ phần tử trong mảng
}


// ====================== Tạo Variant mới ===================
function getToday() {
  const today = new Date()
  return today.toISOString().split('T')[0] // Lấy yyyy-MM-dd
}
function getNextVariantId() {
  if (!product.value || !product.value.listVariants || product.value.listVariants.length === 0) {
    VaNew.value.id = productId + "-01"; // mặc định
    return;
  }

  const ids = product.value.listVariants.map(v => v.id);

  const maxId = ids.reduce((max, cur) => {
    const [pro, variant] = cur.split('-');
    const num = parseInt(pro.replace('pro', ''), 10);
    const varNum = parseInt(variant, 10);
    if (!max || num > max.num || (num === max.num && varNum > max.var)) {
      return { id: cur, num, var: varNum };
    }
    return max;
  }, null);

  if (!maxId) {
    VaNew.value.id = productId + "-01";
    return;
  }

  const nextVariant = maxId.var + 1;
  const paddedVariant = String(nextVariant).padStart(2, '0');

  VaNew.value.id = `${maxId.id.split('-')[0]}-${paddedVariant}`;
}



const VaNew = ref({
  id: '',
  color: 'Đen',
  createdDate: getToday(),
  description: '',
  discount: 0,
  price: 1000,
  isMainVariant: false,
  isUse: true,
  images: [] // danh sách ảnh rỗng
})

async function crateVariant(){
// Reset thông báo
  msg2.value = '';

  // 1️⃣ Kiểm tra mô tả >= 150 ký tự
  if (!selectedVariant.value.description || selectedVariant.value.description.length < 150) {
    msg2.value = "Mô tả sản phẩm phải có ít nhất 150 ký tự!";
    return;
  }

  // 2️⃣ Kiểm tra giá > 1000
  if (!selectedVariant.value.price || selectedVariant.value.price < 1000) {
    msg2.value = "Giá sản phẩm phải lớn hơn 1000!";
    return;
  }

  // 3️⃣ Kiểm tra ít nhất 2 ảnh
  if (!selectedVariant.value.images || selectedVariant.value.images.length < 2) {
    msg2.value = "Phải có ít nhất 2 ảnh sản phẩm!";
    return;
  }

  // 4️⃣ Kiểm tra phải có ít nhất 1 ảnh chính
  const hasMainImage = selectedVariant.value.images.some(img => img.isMain === true);
  if (!hasMainImage) {
    msg2.value = "Phải chọn ít nhất 1 ảnh làm ảnh chính!";
    return;
  }

  const formData = new FormData();
  formData.append('selectedVariant', JSON.stringify({...selectedVariant.value,productId: product.value.id}));

  selectedVariant.value.images
      .forEach(img => formData.append('files', img.file));
  // ✅ Nếu qua hết validation thì xử lý tiếp
  console.log('🤬🤬🤬🤬🤬 Tạo variant thành công:', VaNew.value);
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: File name = ${value.name}, size = ${value.size}`);
    } else {
      console.log(`${key}: ${value}`);
    }
  }
  let totalSize = 0;
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: ${value.name} (${(value.size / (1024*1024)).toFixed(2)} MB)`);
      totalSize += value.size;
    }
  }
  console.log(`📦 Tổng dung lượng tất cả file: ${(totalSize / (1024*1024)).toFixed(2)} MB`);
  try {
    const url = '/admin/variant/add';

     const reponse = await api.post(url, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    msg2.value = '';
    await closeModel();
    await reset();


    await fetchProduct();
    await fetchSizes();
    Swal.fire({
      icon: 'success',
      title: 'Thêm biến thể thành công',
      text: 'Hệ thống đã ghi nhận biến thể mới !',
      confirmButtonText: 'OK'
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);

    if (error.response && (error.response.status === 403 || error.response.status === 400)) {
      Swal.fire({
        icon: 'warning',
        title: 'Không có quyền',
        text: 'Chỉ có Admin mới được sử dụng chức năng này!',
        confirmButtonText: 'OK'
      });

      window.location.href = '/home';
    }
  }

}

async function deleteProduct(productId) {
  // Yêu cầu người dùng gõ delete
  const { value: input } = await Swal.fire({
    title: 'Xác nhận xoá?',
    html: `Nhập <b>delete</b> để xác nhận xoá sản phẩm <b>${productId}</b>`,
    input: 'text',
    inputPlaceholder: 'Nhập delete...',
    showCancelButton: true,
    confirmButtonText: 'Xoá',
    cancelButtonText: 'Huỷ',
    preConfirm: (value) => {
      if (value !== 'delete') {
        Swal.showValidationMessage('Bạn phải nhập chính xác "delete" để xoá')
      }
      return value
    }
  })

  if (input !== 'delete') {
    return Swal.fire('Đã huỷ', 'Sản phẩm chưa bị xoá.', 'info')
  }

  try {
    const response = await api.delete(`/admin/productDetail/delete/${productId}`, { withCredentials: true })
    console.log('Server trả về:', response.data)

    await Swal.fire({
      icon: 'success',
      title: 'Đã xoá sản phẩm!',
      text: response.data
    })

    window.location.href = '/product'

  } catch (error) {
    console.error('Lỗi khi xoá sản phẩm:', error)
    Swal.fire('Lỗi!', 'Không thể xoá sản phẩm này.', 'error')
  }
}

// ======================== Xóa sản phẩm ===========================
async function deleteVariant() {
  if (!selectedVariant.value) return;

  // Hỏi người dùng trước khi xóa
  const result = await Swal.fire({
    title: `Bạn có chắc muốn xóa biến thể "${selectedVariant.value.id}"?`,
    text: "Hành động này không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy"
  });


  if (!result.isConfirmed) return; // Người dùng bấm Hủy

  try {
    const id = selectedVariant.value.id;
    const response = await api.delete(`/admin/variant/${id}`, { withCredentials: true });
    showModal.value = false;
    await fetchProduct();
    // Hiện thông báo thành công
    if (typeof response.data === 'string' && response.data.startsWith("Xóa")) {
      await Swal.fire({
        title: "Đã xóa!",
        text: response.data,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      await Swal.fire({
        title: "Không thể xóa!",
        text: response.data || "Có lỗi xảy ra!",
        icon: "error"
      });
    }
    return true;
  } catch (error) {
    // Xử lý lỗi
    const errorMessage = error.response?.data || "Lỗi kết nối đến server!";
    await Swal.fire({
      title: "Không thể xóa!",
      text: "Biến thể đang dùng trong nhiều đơn hàng/ là biến thể chính! ",
      icon: "error"
    });
    return false;
  }
}
</script>

<template>
  <div class="product-detail">
    <h1>Product Detail</h1>

    <div v-if="product" class="product-header">
      <div class="product-info">
        <div class="info-row">
          <span class="label">Product ID:</span>
          <input type="text" v-model="product.id" class="value" readonly />
        </div>

        <div class="info-row">
          <span class="label">Product Name:</span>
          <input type="text" v-model="product.name" class="value" />
        </div>

        <div class="info-row">
          <span class="label">Description:</span>
          <textarea v-model="product.description" class="value" rows="4" placeholder="Nhập mô tả sản phẩm..."></textarea>
        </div>

        <div class="info-row">
          <span class="label">Created Date:</span>
          <input
              type="date"
              v-model="product.createdDate"
              class="value"
              readonly
          />
        </div>

        <div class="info-row">
          <span class="label">Target Customer:</span>
          <select v-model="product.targetCustomer" class="value">
            <option value="MALE">MALE</option>
            <option value="FEMALE">FEMALE</option>
            <option value="UNISEX">UNISEX</option>
            <option value="MIDDLE-AGED">MIDDLE-AGED</option>
            <option value="CHILD">CHILD</option>
          </select>
        </div>

        <div class="info-row">
          <span class="label">Brand:</span>
          <input type="text" style="text-transform: uppercase;" v-model="product.brand" class="value" />
        </div>

        <div class="info-row">
          <span class="label">Name of Category:</span>
          <input type="text" v-model="product.categoryName" class="value"  readonly/>
        </div>
        <div style="display: flex; justify-content: flex-end;">
          <button @click="saveProduct" class="add-size-btn">
            <i class="fas fa-save"></i> Save
          </button>

          <button @click="deleteProduct(productId)" class="add-size-btn" style="margin-left: 5px; background-color: red">
            <i class="fa-solid fa-trash"></i> Delete
          </button>
        </div>
      </div>


      <div class="variant-matrix">
        <h3>Variant Matrix</h3>
        <table class="matrix-table">
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
              <input
                  type="checkbox"
                  class="variant-checkbox"
                  :checked="isChecked(size, variant.id)"
                  @change="toggleSize(size, variant.id, $event.target.checked)"
              />
            </td>
          </tr>
          </tbody>
        </table>

        <button @click="updateSeletedSize" class="add-size-btn" style="margin-right: 10px; background-color: #0a0a0a; color: white;">
          <i class="fas fa-check-circle" style="margin-right: 5px;"></i>
          Save Size Configuration
        </button>
        <!-- Nút mở modal -->
        <button @click="showAddSizeModal = true" class="add-size-btn">Add Size</button>
        <!-- Modal thêm size -->
      </div>
    </div>
    <div v-else>
      <p>Đang tải thông tin sản phẩm...</p>
    </div>
    <div class="variants-section">
      <h2>Variants <button @click="openEditModal(VaNew); flagCreate = true; " class="edit-btn" style="font-size: 24px; background-color: #068520"> + </button> </h2>
      <table class="variants-table">
        <thead>
        <tr>
          <th>Variant ID</th>
          <th>Color</th>
          <th>Image Main</th>
          <th>Created Date</th>
          <th>Price</th>
          <th>Main Variant</th>
          <th>In Use</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="variant in variants" :key="variant.id">
          <td>{{ variant.id }}</td>
          <td>{{ variant.color }}</td>
<!---->
          <td>
            <img
                v-for="img in variant.images"
                :key="img.id"
                :src="'http://localhost:8989/uploads/' + img.fileName"
                alt="Main product image"
                class="product-image"
            >
          </td>


          <td>{{ variant.createdDate }}</td>
          <td>
            <div v-if="variant.discount && variant.discount < variant.price">
              <span style="text-decoration: line-through; color: gray;">
                {{ variant.price.toLocaleString() }}đ
              </span><br>
              <span>
                {{ variant.discount.toLocaleString() }}đ
              </span>
            </div>
            <div v-else>
              {{ variant.price.toLocaleString() }}đ
            </div>
          </td>
          <td>{{ variant.isMainVariant ? '✅' : '❌' }}</td>
          <td>{{ variant.isUse ? '✅' : '❌' }}</td>
          <td>
            <button @click="openEditModal(variant); flagCreate = false" class="edit-btn">View/Edit</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="showModal" class="modal-overlay" >
      <div class="modal-content" style="width: 710px">
        <h3>Edit Variant</h3>
        <div class="modal-form">
          <div class="form-group">
            <div class="form-column">
              <label>Variant ID:</label>
              <input type="text" v-model="selectedVariant.id" disabled>
            </div>
            <div class="form-column">
              <label>Create Date:</label>
              <input type="text" v-model="selectedVariant.createdDate" disabled>
            </div>
          </div>
          <hr>
          <div class="form-group" style="display: flex; flex-wrap: wrap; gap: 12px;">
            <!-- Ảnh sản phẩm -->
            <div
                v-for="(img, index) in selectedVariant.images"
                :key="index"
                style="position: relative; width: 100px;"
            >
              <img
                  :src="img.isNew ? img.preview : 'http://localhost:8989/uploads/' + img.fileName"
                  alt="Product image"
                  style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #ccc;"
              />

              <!-- Nút xóa ảnh -->
              <button
                  type="button"
                  @click="removeImage(index)"
                  style="position: absolute; top: -6px; right: -6px;
               background: red; color: white; border: none;
               border-radius: 50%; width: 20px; height: 20px;
               display: flex; align-items: center; justify-content: center;
               cursor: pointer; font-size: 12px;"
              >×</button>

              <!-- Radio chọn ảnh chính -->
              <label
                  style="position: absolute; bottom: 4px; left: 4px;
               background: rgba(255,255,255,0.8);
               padding: 2px 4px; border-radius: 4px; font-size: 10px;"
              >
                <input
                    type="radio"
                    name="mainImage"
                    :checked="img.isMain"
                    @change="setMainImage(index)"
                />
                Chính
              </label>
            </div>

            <!-- Nút + để chọn ảnh -->
            <button
                type="button"
                @click="openFileDialog"
                style="
        width: 100px;
        height: 100px;
        font-size: 36px;
        font-weight: bold;
        border: 2px dashed #aaa;
        border-radius: 8px;
        background-color: #f9f9f9;
        color: #555;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      "
            >+</button>

            <!-- Input ảnh (ẩn) -->
            <input
                type="file"
                ref="imageInput"
                multiple
                accept="image/*"
                style="display: none"
                @change="handleImageUpload"
            />
          </div>



          <hr>
          <div class="form-group">
            <div class="form-column">
              <label>Color: <span >{{ selectedVariant.color }} </span> <span
                  :style="{
    display: 'inline-block',
    width: '15px',
    height: '15px',
    backgroundColor: selectedColor,
    border: '1px solid #000',
    verticalAlign: 'middle',
    marginBottom: '5px',
  }"
              ></span>
              </label>
              <select class="form-select" v-model="selectedVariant.color" style="height: 90px" size="4">
                <option class="form-option" v-for="(color, index) in colorOptions" :key="index" :value="color.ten">
                  {{ color.ten }} ({{ color.tenTiengAnh }})
                </option>
              </select>
            </div>

            <div class="form-column">
              <label>Price: </label>
              <input type="number" v-model="selectedVariant.price">
                <div class="form-column checkbox-group">
                  <label>
                    <input type="checkbox" v-model="selectedVariant.isMainVariant" style="transform: scale(1.2);">
                    Main Variant
                  </label>
                </div>
                <div class="form-column checkbox-group">
                  <label>
                    <input type="checkbox" v-model="selectedVariant.isUse" style="transform: scale(1.2);">
                    In Use
                  </label>
                </div>
            </div>
          </div>

          <div class="form-group">
            <label>Description:</label>
            <textarea rows="4" v-model="selectedVariant.description"></textarea>
          </div>
          <br>

          <p style="color: red; font-weight: 700" v-if="msg2">{{ msg2 }}</p>
        </div>

        <div class="modal-actions" v-if="!flagCreate">
          <button @click="updateVariant" class="save-btn">Save</button>
          <button @click="deleteVariant" class="delete-btn">Delete</button>
          <button @click="closeModel" class="cancel-btn">Cancel</button>
        </div>

        <div class="modal-actions" v-else>
          <button @click="crateVariant" class="save-btn">Create</button>
          <button @click="reset" class="save-btn" style="background-color: #3b82f6">Reset</button>
          <button @click="closeModel" class="cancel-btn">Cancel</button>
        </div>

      </div>
    </div>
  </div>

  <div v-if="showAddSizeModal" class="modal-overlay">
    <div class="modal-content">
      <h3>Thêm cấu hình Size</h3>

      <div class="modal-form">
        <!-- Select chọn size -->
        <div class="form-group" style="padding-bottom: 10px">
          <label>Chọn size:</label>
          <select v-model="selectedSizeId" class="w-full border p-2 rounded" style="margin-left: 22px">
            <option v-for="size in listSizeNew" :key="size.sizeID" :value="size.sizeID">
              {{ size.code }}
            </option>
          </select>
        </div>

        <!-- Checkbox các variant -->
        <div class="form-group">
          <label>Chọn Variant:</label>
          <div class="max-h-32 overflow-y-auto space-y-1 border p-2 rounded">
            <label style="font-size: 18px" v-for="variant in variants" :key="variant.id" class="flex items-center space-x-2">
              <input type="checkbox" :value="variant.id" v-model="selectedVariantIds" style="transform: scale(1.5);" />
              <span style="margin-left: 5px; position: relative; top: -2px;">{{ variant.id }}</span>
            </label>
            <p style="color: red; font-weight: 700" v-if="msg">{{ msg }}</p>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="submitSizeConfig" class="save-btn">Xác nhận</button>
        <button @click="showAddSizeModal = false" class="cancel-btn">Đóng</button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.product-detail {
    padding:  30px;
    padding-top: 25px;
    width: 100%;         /* full width */
    max-width: none;     /* bỏ giới hạn 1200px */
    margin: 0;           /* bỏ căn giữa */
}

h1, h2, h3 {
  margin-bottom: 20px;
}

.product-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.product-info {
  flex: 7;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.variant-matrix {
  flex: 5;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.info-row {
  margin-bottom: 15px;
  display: flex;
}

.label {
  font-weight: 600;
  width: 150px;
}

.value {
  flex: 1;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
}

.matrix-table th, .matrix-table td {
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
}

.matrix-table th {
  background-color: #f0f0f0;
}

.variant-checkbox {
  width: 18px;
  height: 18px;
}

.add-size-btn {
  padding: 6px 12px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.variants-table {
  width: 100%;
  border-collapse: collapse;
}

.variants-table th {
  text-align: left;
  padding: 12px 15px;
  background-color: #f5f5f5;
  font-weight: 600;
}

.variants-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.variants-table tr:last-child td {
  border-bottom: none;
}

.description-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-btn {
  padding: 6px 12px;
  background-color: #FFC107;
  color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

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
  padding: 25px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-form {
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}


.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.save-btn {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn {
  padding: 8px 16px;
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  padding: 8px 16px;
  background-color: #9E9E9E;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.value {
  flex: 1;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  transition: border-color 0.2s;
}
.form-column {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}
</style>