<script setup>
import { ref, onMounted } from "vue";

const promotionProduct= ref({
  promotionProductId: "",
  productIds: [],
  promotionId: "",
  productId:"",
  quantityUsed: "",
  quantityRemaining:"",
  discountPercent:"",
  note:"",
  selectedProductId:""
});
const promotionProducts= ref({})
const voucher = ref({
  voucherId: "",
  discountType: "",
  discountValue: "",
  minOrderValue: "",
  quantityUsed: 0,
  quantityRemaining: 0,
  endDate: "",
  claimConditions: "",
  promotionId: ""
})
const vouchers = ref([]);
const promotion = ref({
  promotionID: "",
  promotionName: "",
  description: "",
  startDate: "",
  endDate: "",
  type: "",
  membershipId: "",
  rank: ""
});
const showModal = ref(false);          // bật/tắt modal
const modalType = ref("");             // loại modal (theo promotion.type)
const editPromo = ref(false);              // dữ liệu đang thao tác
const membershipOptions = ref([]);
const promotions = ref([]);
const editIndex = ref(null);
const editFormVoucher = ref(false);
const editFormPromotionProduct = ref(false);
async function createPromotion(promotion) {
  console.log(promotion.membershipId);
  try {
    // ✅ Validate
    const errorMsg = validatePromotion(promotion);
    if (errorMsg) {
      await Swal.fire("Lỗi", errorMsg, "error");
      return;
    }

    // Gửi BE nếu hợp lệ
    const params = new URLSearchParams();
    //trả về mảng 2 chiều chứa key và value
    Object.entries(promotion).forEach(([key, value]) =>
        params.append(key, value ?? "")
    );

    const response = await api.post(`/admin/Promotion/createPromotion`, params, {
      withCredentials: true,
    });

    await Swal.fire("Thành công!", "Thêm xúc tiến thành công", "success");
    await fetchPromotion();
    await resetFormPromotion();

    return response.data;
  } catch (error) {
    Swal.fire("Lỗi", "Thêm thất bại. Vui lòng thử lại!", "error");
    console.error("Lỗi khi thêm xúc tiến:", error);
    throw error;
  }
}
async function fetchPromotion() {
  Swal.fire({
    title: 'Đang xử lý...',
    html: 'Vui lòng chờ trong giây lát...',
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const response = await api.get(
        `/admin/Promotion/loadData`,
        { withCredentials: true }
    );

    // In toàn bộ dữ liệu ra console
    console.log("📌 Toàn bộ response:", response);
    console.log("📌 Response.data:", response.data);
    console.log("📌 Response.data.content:", response.data.content);

    promotions.value = response.data;

    // Tắt loading sau khi có dữ liệu
    Swal.close();
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách xúc tiến:", error);

    // Hiện thông báo lỗi
    Swal.fire({
      icon: 'error',
      title: 'Thất bại',
      text: 'Không thể tải thông tin đơn hàng, vui lòng thử lại!'
    });
  }
}
async function updatePromotion(promotion) {
  try {
    // ✅ Validate trước khi update
    const errorMsg = validatePromotion(promotion);
    if (errorMsg) {
      await Swal.fire("Lỗi", errorMsg, "error");
      return;
    }

    // ✅ Chuẩn bị params
    const params = new URLSearchParams();
    Object.entries(promotion).forEach(([key, value]) => {
      if (key === "membershipId") {
        // Nếu type = ProductDiscount thì membershipId để trống
        params.append("membershipId", promotion.type !== "ProductDiscount" ? (value ?? "") : "");
      } else {
        params.append(key, value ?? "");
      }
    });

    // ✅ Gọi API
    const response = await api.post(`/admin/Promotion/updatePromotion`, params, {
      withCredentials: true,
    });

    await Swal.fire("Cập nhật thành công!", "Khuyến mãi đã được cập nhật", "success");

    console.log("Cập nhật khuyến mãi thành công:", response.data);
    await resetFormPromotion();
    await fetchPromotion();
    return response.data;
  } catch (error) {
    Swal.fire("Lỗi", "Cập nhật thất bại. Vui lòng thử lại!", "error");
    console.error("Lỗi khi cập nhật khuyến mãi:", error);
    throw error;
  }
}
async function updateVoucher(voucher){
  try {
    // ✅ Validate trước khi update
    const errorMsg = validateVoucher(voucher);
    if (errorMsg) {
      await Swal.fire("Lỗi", errorMsg, "error");
      return;
    }

    // ✅ Chuẩn bị params
    const params = new URLSearchParams();
    Object.entries(voucher).forEach(([key, value]) => {
        params.append(key, value ?? "");
    });
    // ✅ Gọi API
    const response = await api.post(`/admin/Promotion/updateVoucherCampaign`, params, {
      withCredentials: true,
    });

    await Swal.fire("Cập nhật thành công!", "Khuyến mãi đã được cập nhật", "success");

    console.log("Cập nhật khuyến mãi thành công:", response.data);
    await fetchVoucher(voucher.promotionId);
    await resetFormVoucher();
    return response.data;
  } catch (error) {
    Swal.fire("Lỗi", "Cập nhật thất bại. Vui lòng thử lại!", "error");
    console.error("Lỗi khi cập nhật khuyến mãi:", error);
    throw error;
  }
}
async function loadMembershipOptions() {
  try {
    const res = await api.get('/admin/Promotion/memberShip',{withCredentials: true})
    membershipOptions.value = res.data
  } catch (error) {
    console.error('Lỗi load memberships:', error)
  }
}

async function deletePromotion(promotion) {
  Swal.fire({
    title: "Bạn có chắc muốn xoá?",
    text: `Xúc tiến có ID là ${promotion.promotionID} sẽ bị xoá vĩnh viễn!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ"
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Hiện loading trong khi chờ BE
      Swal.fire({
        title: "Đang xoá...",
        text: "Vui lòng chờ trong giây lát",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await api.get(
            `/admin/Promotion/DeletePromotion/${promotion.promotionID}`,
            { withCredentials: true }
        );
        await resetFormPromotion(promotion);
        // Báo thành công, để confirm button cho user tự tắt
        Swal.fire({
          icon: "success",
          title: "Đã xoá!",
          text: `Xúc tiến sản phẩm có ID là ${promotion.promotionID} đã được xoá.`,
          confirmButtonText: "OK"
        });


        return response.data;

      } catch (error) {
        let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";
        if (error.response) {
          errorMessage = error.response.data;
          console.error("Status:", error.response.status);
          console.error("Message:", error.response.data);
        } else {
          console.error("Network error:", error.message);
          errorMessage = "Không thể kết nối đến server!";
        }

        // Báo lỗi, cũng để confirm button
        Swal.fire({
          icon: "error",
          title: "Xoá thất bại",
          text: "Voucher đã được sử dụng",
          confirmButtonText: "Đóng"
        });

        throw error;
      }
    }
  });
}
const resetFormVoucher = async () => {
  try {
    // Gọi API để lấy PromotionID mới (BE xử lý trả về)
    const response = await api.get('/admin/Promotion/voucherIdNew',{withCredentials: true});
    const newVoucherId = response.data; // ví dụ BE trả về chuỗi "KM000001"
    const currentPromotionId = voucher.value.promotionId;
    let claimConditionss = 0;
    let endDatee = null;
    if(promotion.value.type=== "VoucherCampaign"){
       endDatee = promotion.value.endDate;
       claimConditionss = null;
    }
    if(promotion.value.type=== "NewRank"){
      claimConditionss = null;
    }
    voucher.value = {
      voucherId: newVoucherId,
      discountType: "Amount",
      discountValue: 0,
      minOrderValue: 0,
      quantityUsed: 0,
      quantityRemaining: 0,
      endDate: endDatee,
      claimConditions: claimConditionss,
      promotionId: currentPromotionId
    };
    editFormVoucher.value = false;
    editIndex.value = null;
    editPromo.value = true;
  } catch (error) {
    console.error("Lỗi khi lấy PromotionID:", error);
  }
};

const resetFormPromotionProduct = async (promotion) => {
  try {
    // Gọi API để lấy PromotionID mới (BE xử lý trả về)
    const currentPromotionId = promotionProduct.value.promotionId;

    promotionProduct.value = {
      promotionId: currentPromotionId,
      quantityUsed: 0,
      quantityRemaining: 0,
      discountPercent:0,
      note:""
    };
    await fetchProductOfPromotion(promotion);
    await fetchPromotionProduct(promotion.promotionID);
    editFormPromotionProduct.value = false;
    editIndex.value = null;
    editPromo.value = true;
  } catch (error) {
    console.error("Lỗi khi lấy PromotionID:", error);
  }
};
async function createVoucher(voucher){
  console.log(voucher.voucherId);
  try {
    // ✅ Validate
    const errorMsg = validateVoucher(voucher);
    if (errorMsg) {
      await Swal.fire("Lỗi", errorMsg, "error");
      return;
    }

    // Gửi BE nếu hợp lệ
    const params = new URLSearchParams();
    //trả về mảng 2 chiều chứa key và value
    Object.entries(voucher).forEach(([key, value]) =>
        params.append(key, value ?? "")
    );
    const response = await api.post(`/admin/Promotion/createVoucher`, params, {
      withCredentials: true,
    });
    await Swal.fire("Thành công!", "Thêm voucher thành công", "success");
    await fetchVoucher(voucher.promotionId);
    await resetFormVoucher();
    return response.data;
  } catch (error) {
    Swal.fire("Lỗi", "Thêm thất bại. Vui lòng thử lại!", "error");
    console.error("Lỗi khi thêm voucher:", error);
    throw error;
  }
}
async function deleteVoucher(voucher) {
  // Hiện hộp thoại xác nhận
  Swal.fire({
    title: "Bạn có chắc muốn xoá?",
    text: `Voucher ${voucher.voucherId} sẽ bị xoá vĩnh viễn!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ"
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Hiện loading trong khi chờ BE
      Swal.fire({
        title: "Đang xoá...",
        text: "Vui lòng chờ trong giây lát",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await api.get(
            `/admin/Promotion/DeleteVoucher/${voucher.voucherId}`,
            { withCredentials: true }
        );

        // Đóng loading và báo thành công
        Swal.fire({
          icon: "success",
          title: "Đã xoá!",
          text: `Voucher ${voucher.voucherId} đã được xoá.`,
          timer: 1500,
          showConfirmButton: false,
        });

        await fetchVoucher(voucher.promotionId);
        await resetFormVoucher();
        return response.data;

      } catch (error) {
        let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";
        if (error.response) {
          // BE có trả message
          errorMessage = error.response.data;
          console.error("Status:", error.response.status);
          console.error("Message:", error.response.data);
        } else {
          // Lỗi mạng, không gọi được BE
          console.error("Network error:", error.message);
          errorMessage = "Không thể kết nối đến server!";
        }
        Swal.fire({
          icon: "error",
          title: "Xoá thất bại",
          text: "Voucher đã được sử dụng",
        });
        throw error;
      }
    }
  });
}

const resetFormPromotion = async () => {
  try {
    // Gọi API để lấy PromotionID mới (BE xử lý trả về)
    const response = await api.get('/admin/Promotion/promotionIdNew',{withCredentials: true});
    const newPromotionId = response.data; // ví dụ BE trả về chuỗi "KM000001"
    promotion.value = {
      promotionID: newPromotionId,
      promotionName: "",
      description: "",
      startDate: "",
      endDate: "",
      type: "",
      membershipId: ""  // mặc định là rỗng
    };
    await fetchPromotion();
    editIndex.value = null;
    editPromo.value = false;
  } catch (error) {
    console.error("Lỗi khi lấy PromotionID:", error);
  }
};
function editPromotionProduct(promotionProductt){
  console.log(promotionProductt)
  editFormPromotionProduct.value = true;
  promotionProduct.value.promotionProductId = promotionProductt.promotionProductId
  promotionProduct.value.productId = promotionProductt.productId
  promotionProduct.value.quantityUsed = promotionProductt.quantityUsed
  promotionProduct.value.quantityRemaining = promotionProductt.quantityRemaining
  promotionProduct.value.discountPercent = promotionProductt.discountPercent
  promotionProduct.value.note = promotionProductt.note

}
function editVoucher(voucherIndex){
  console.log("VoucherIndexx: "+voucherIndex);
  editFormVoucher.value = true;
  voucher.value = {...voucherIndex};
  if (voucher.value.endDate) {
    voucher.value.endDate = voucher.value.endDate.split("T")[0];
  }
}

function editPromotion(promotionEdit) {
  promotion.value = { ...promotionEdit };
  promotion.value.membershipId = promotion.value.membershipId ?? "";
  console.log(promotion.value.rank);
  console.log(promotion.value.membershipId);
  // Chuyển LocalDateTime -> yyyy-MM-dd
  if (promotion.value.startDate) {
    promotion.value.startDate = promotion.value.startDate.split("T")[0];
  }
  if (promotion.value.endDate) {
    promotion.value.endDate = promotion.value.endDate.split("T")[0];
  }
  editPromo.value = true;
}
async function fetchPromotionProduct(promotionId) {
  console.log("Maaaaaaaa "+promotionId);
  try {
    const response = await api.get(`/admin/Promotion/PromotionProduct/${promotionId}`,{withCredentials: true});
    promotionProducts.value = response.data;
    console.log(promotionProducts);
  } catch (error) {
    console.error("Lỗi khi load PromotionProduct:", error);
  }
}
async function fetchProductOfPromotion(promotion) {
  console.log("Maaaaaaaa "+promotion.promotionID);
  const startDate = promotion.startDate;
  const endDate = promotion.endDate;
  try {
    const response = await api.get(`/admin/Promotion/promotionProduct/${startDate}/${endDate}/${promotion.promotionID}`,{withCredentials: true});
    promotionProduct.value.productIds = response.data;
    promotionProduct.value.productId = promotionProduct.value.productIds[0];
  } catch (error) {
    console.error("Lỗi khi load PromotionProduct:", error);
  }
}

async function fetchVoucher(promotionId) {
  try {
    const response = await api.get(`/admin/Promotion/Voucher/${promotionId}`,{withCredentials: true});
    // In dữ liệu nhận từ BE ra console
    console.log("Dữ liệu trả về từ BE:", response.data);
    vouchers.value = response.data;
  } catch (error) {
    console.error("Lỗi khi load PromotionProduct:", error);
  }
}
async function createPromotionProduct(promotionProduct,promotion){
  console.log("Promotion: "+promotion.promotionID);
  console.log("Procu: "+promotionProduct.productId);
  try {
    // ✅ Validate
    const errorMsg = validatePromotionProduct(promotionProduct);
    if (errorMsg) {
      await Swal.fire("Lỗi", errorMsg, "error");
      return;
    }

    // Gửi BE nếu hợp lệ
    const params = new URLSearchParams();
    //trả về mảng 2 chiều chứa key và value
    Object.entries(promotionProduct).forEach(([key, value]) =>
        params.append(key, value ?? "")
    );
    const response = await api.post(`/admin/Promotion/createPromotionProduct`, params, {
      withCredentials: true,
    });
    await Swal.fire("Thành công!", "Thêm xúc tiến sản phẩm thành công", "success");
    await resetFormPromotionProduct(promotion);
    return response.data;
  } catch (error) {
    Swal.fire("Lỗi", "Thêm thất bại. Vui lòng thử lại!", "error");
    console.error("Lỗi khi thêm xúc tiến:", error);
    throw error;
  }
}
async function updatePromotionProduct(promotionProduct, promotion){
  console.log("Promotion: "+promotion.promotionID);
  console.log("Procu: "+promotionProduct.promotionProductId);
  try {
    // ✅ Validate
    const errorMsg = validatePromotionProduct(promotionProduct);
    if (errorMsg) {
      await Swal.fire("Lỗi", errorMsg, "error");
      return;
    }
    // Gửi BE nếu hợp lệ
    const params = new URLSearchParams();
    //trả về mảng 2 chiều chứa key và value
    Object.entries(promotionProduct).forEach(([key, value]) =>
        params.append(key, value ?? "")
    );
    const response = await api.post(`/admin/Promotion/updatePromotionProduct`, params, {
      withCredentials: true,
    });
    await Swal.fire("Thành công!", "Cập nhật xúc tiến sản phẩm thành công", "success");
    await resetFormPromotionProduct(promotion);
    return response.data;
  } catch (error) {
    Swal.fire("Lỗi", "Cập nhật thất bại. Vui lòng thử lại!", "error");
    console.error("Lỗi khi thêm xúc tiến:", error);
    throw error;
  }
}

async function deletePromotionProduct(promotionProduct, promotion){
  // Hiện hộp thoại xác nhận
  Swal.fire({
    title: "Bạn có chắc muốn xoá?",
    text: `Xúc tiến sản phẩm có ID là ${promotionProduct.promotionProductId} sẽ bị xoá vĩnh viễn!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xoá",
    cancelButtonText: "Huỷ"
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Hiện loading trong khi chờ BE
      Swal.fire({
        title: "Đang xoá...",
        text: "Vui lòng chờ trong giây lát",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      try {
        const response = await api.get(
            `/admin/Promotion/DeletePromotionProduct/${promotionProduct.promotionProductId}`,
            { withCredentials: true }
        );
        // Đóng loading và báo thành công
        Swal.fire({
          icon: "success",
          title: "Đã xoá!",
          text: `Xúc tiến sản phẩm có ID là ${promotionProduct.promotionProductId} đã được xoá.`,
          timer: 1500,
          showConfirmButton: false,
        });
        await resetFormPromotionProduct(promotion);
        return response.data;
        } catch (error) {
        let errorMessage = "Có lỗi xảy ra. Vui lòng thử lại!";
        if (error.response) {
          // BE có trả message
          errorMessage = error.response.data;
          console.error("Status:", error.response.status);
          console.error("Message:", error.response.data);
        } else {
          // Lỗi mạng, không gọi được BE
          console.error("Network error:", error.message);
          errorMessage = "Không thể kết nối đến server!";
        }

        Swal.fire({
          icon: "error",
          title: "Xoá thất bại",
          text: errorMessage,
        });
        throw error;
      }
    }
  });
}

// ------ model
function openModal(type,promotion) {
    modalType.value = type;
    showModal.value = true;
    resetFormVoucher();
    voucher.value.promotionId = promotion.promotionID;
    promotionProduct.value.promotionId = promotion.promotionID;
    if(type==='ProductDiscount'){
      resetFormPromotionProduct(promotion);
      fetchProductOfPromotion(promotion);
      console.log("Guwir api thanh cong"+ promotion.promotionID);
    }
    if(type==='AfterSaleService'){
      fetchVoucher(promotion.promotionID);
    }
    if(type==='VoucherCampaign'){
      fetchVoucher(promotion.promotionID);
    }
    if(type==='NewRank'){
      fetchVoucher(promotion.promotionID);
    }

}

function closeModal() {
  showModal.value = false;
}

// --------
// --------------FORMAT VA VALIDATE
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
function validateVoucher(voucher) {
  if (!voucher.voucherId || voucher.voucherId.trim() === "") {
    return "Voucher ID không được để trống!";
  }
  if (voucher.voucherId.length > 25) {
    return "Voucher ID tối đa 25 ký tự!";
  }

  if (!voucher.discountType || (voucher.discountType !== "Amount" && voucher.discountType !== "Percent")) {
    return "Loại khuyến mãi không hợp lệ (phải chọn Amount hoặc Percent)!";
  }

  if (!voucher.discountValue || voucher.discountValue <= 0) {
    return "Giá trị giảm phải lớn hơn 0!";
  }

  if (voucher.minOrderValue == null || voucher.minOrderValue < 0) {
    return "Đơn tối thiểu phải ≥ 0!";
  }

  if (voucher.quantityRemaining == null || voucher.quantityRemaining <= 0) {
    return "Số lượng còn lại phải ≥ 0!";
  }

  const today = new Date();
  const endDate = voucher.endDate;
  console.log(endDate);
  if (endDate != null && new Date(endDate) < today) {
    console.log(endDate);
    return "Ngày kết thúc phải lớn hơn hoặc bằng ngày hiện tại!";
  }
  if(promotion.value.type !=="VoucherCampaign" && promotion.value.type !=="NewRank"){
    if (voucher.claimConditions == null || voucher.claimConditions < 0) {
      return "Điều kiện nhận phải ≥ 0!";
    }
  }


  if (!voucher.promotionId || voucher.promotionId.trim() === "") {
    return "Promotion ID không được để trống!";
  }
  if (voucher.promotionId.length > 8) {
    return "Promotion ID tối đa 8 ký tự!";
  }

  return null; // ✅ hợp lệ
}

function validatePromotionProduct(promotionProduct) {
  // ProductID (lấy từ productId hoặc selectedProductId)
  const productId = promotionProduct.productId || promotionProduct.selectedProductId;
  if (!productId || productId.trim() === "") {
    return "Mã sản phẩm không được để trống!";
  }
  if (productId.length > 10) {
    return "Mã sản phẩm tối đa 10 ký tự!";
  }

  // QuantityUsed
  if (promotionProduct.quantityUsed === "" || promotionProduct.quantityUsed == null) {
    return "Số lượng đã dùng không được để trống!";
  }
  if (isNaN(promotionProduct.quantityUsed) || promotionProduct.quantityUsed < 0) {
    return "Số lượng đã dùng phải là số >= 0!";
  }

  // QuantityRemaining
  if (promotionProduct.quantityRemaining === "" || promotionProduct.quantityRemaining == null) {
    return "Số lượng còn lại không được để trống!";
  }
  if (isNaN(promotionProduct.quantityRemaining) || promotionProduct.quantityRemaining < 0) {
    return "Số lượng còn lại phải là số >= 0!";
  }

  // DiscountPercent
  if (promotionProduct.discountPercent === "" || promotionProduct.discountPercent == null) {
    return "Phần trăm giảm không được để trống!";
  }
  if (
      isNaN(promotionProduct.discountPercent) ||
      promotionProduct.discountPercent < 0 ||
      promotionProduct.discountPercent > 100
  ) {
    return "Phần trăm giảm phải nằm trong khoảng 0 - 100!";
  }

  // Note
  if (promotionProduct.note && promotionProduct.note.length > 150) {
    return "Ghi chú tối đa 150 ký tự!";
  }

  return null; // hợp lệ
}

function validatePromotion(promotion) {
  if (!promotion.promotionID || promotion.promotionID.trim() === "") {
    return "Mã khuyến mãi không được để trống!";
  }
  if (promotion.promotionID.length > 8) {
    return "Mã khuyến mãi tối đa 8 ký tự!";
  }
  if (!promotion.promotionName || promotion.promotionName.trim() === "") {
    return "Tên khuyến mãi không được để trống!";
  }
  if (promotion.promotionName.length > 95) {
    return "Tên khuyến mãi tối đa 95 ký tự!";
  }
  if (!promotion.description || promotion.description.trim() === "") {
    return "Mô tả không được để trống!";
  }
  if (promotion.description.length < 100) {
    return "Mô tả phải từ 100 ký tự!";
  }
  if (promotion.description.length > 500) {
    return "Mô tả tối đa 500 ký tự!";
  }
  if (!promotion.startDate) {
    return "Ngày bắt đầu không được để trống!";
  }
  if (!promotion.endDate) {
    return "Ngày kết thúc không được để trống!";
  }
  if (new Date(promotion.startDate) > new Date(promotion.endDate)) {
    return "Ngày bắt đầu không được lớn hơn ngày kết thúc!";
  }
  if (promotion.banner && promotion.banner.length > 55) {
    return "Đường dẫn banner tối đa 55 ký tự!";
  }
  if (!promotion.type || promotion.type.trim() === "") {
    return "Loại khuyến mãi không được để trống!";
  }
  if (promotion.type.length > 20) {
    return "Loại khuyến mãi tối đa 20 ký tự!";
  }
  if (promotion.membershipId && promotion.membershipId.length > 10) {
    return "MembershipID tối đa 10 ký tự!";
  }

  return null; // ✅ hợp lệ
}

//--------------------
onMounted(() => {
  resetFormPromotion();
  loadMembershipOptions();
})
</script>

<template>
  <div class="container-fluid py-4 promotion-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0 text-primary">Quản lý khuyến mãi</h1>
    </div>

    <div class="row">
      <!-- Form bên trái -->
      <div class="col-lg-3">
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-light py-3">
            <h5 class="mb-0">{{ editIndex !== null ? 'Cập nhật' : 'Thêm mới' }} khuyến mãi</h5>
          </div>
          <div class="card-body">
              <div class="mb-3">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Mã khuyến mãi</label>
                <input v-model="promotion.promotionID" type="text" class="form-control" disabled />
              </div>

              <div class="mb-3">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Tên khuyến mãi</label>
                <input v-model="promotion.promotionName" type="text" class="form-control" />
              </div>

              <div class="mb-3">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Mô tả</label>
                <textarea v-model="promotion.description" class="form-control" rows="3"></textarea>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Ngày bắt đầu</label>
                  <input v-model="promotion.startDate" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Ngày kết thúc</label>
                  <input v-model="promotion.endDate" type="date" class="form-control" />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Loại khuyến mãi</label>
                <select v-model="promotion.type" class="form-select">
                  <option disabled value="">-- Chọn loại --</option>
                  <option value="ProductDiscount">Giảm giá sản phẩm</option>
                  <option value="AfterSaleService">Hậu mãi</option>
                  <option value="VoucherCampaign">Phát voucher</option>
                  <option value="NewRank">Lên bậc</option>
                </select>
              </div>

              <div v-if="promotion.type !=='ProductDiscount'" class="mb-3">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Hạng thành viên</label>
                <select v-model="promotion.membershipId" class="form-select">
                  <option value="">-- Không áp dụng --</option>
                  <option v-for="member in membershipOptions"
                          :key="member.code"
                          :value="member.code">
                    {{ member.name }}
                  </option>
                </select>
              </div>

              <div class="d-grid gap-2 d-md-flex">

                <template v-if="promotion.type==='ProductDiscount'">
                  <button v-if= "editPromo" class="btn btn-secondary me-md-2" @click="openModal('ProductDiscount',promotion)">Cấu hình GG Sản phẩm</button>
                </template>
                <template v-else-if="promotion.type==='AfterSaleService'">
                  <button v-if= "editPromo"  class="btn btn-secondary me-md-2" @click="openModal('AfterSaleService',promotion)">Cấu hình voucher</button>
                </template>
                <template v-else-if="promotion.type==='VoucherCampaign'">
                  <button v-if= "editPromo"  class="btn btn-secondary me-md-2" @click="openModal('VoucherCampaign',promotion)">Cấu hình voucher</button>
                </template>
                <template v-else-if="promotion.type==='NewRank'">
                 <button v-if= "editPromo"  class="btn btn-secondary me-md-2" @click="openModal('NewRank',promotion)">Cấu hình voucher</button>
                </template>
                <span style="color: red" v-if= "editPromo">Reset và chọn loại khuyến mãi để thêm sản phẩm!</span>
                <span style="color: red" v-if= "!editPromo">Nhập thông tin và chọn loại khuyến mãi để thêm xúc tiến!</span>
              </div>

              <div class="d-grid gap-2 d-md-flex justify-content-md-end mt-3">
                <button v-if= "!editPromo" class="btn btn-success me-md-2" @click="createPromotion(promotion)">Thêm xúc tiến</button>
                <button v-if= "editPromo" class="btn btn-primary me-md-2" @click="updatePromotion(promotion)">Cập nhật xúc tiến</button>
                <button  class="btn btn-secondary me-1" @click="resetFormPromotion()" >
                  Reset
                </button>
              </div>
          </div>
        </div>
      </div>

      <!-- Bảng bên phải -->
      <div class="col-lg-9">
        <div class="card shadow-sm">
          <div class="card-header bg-light py-3">
            <h5 class="mb-0">Danh sách khuyến mãi</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover table-striped mb-0 promotion-table">
                <thead class="table-light">
                <tr>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Loại</th>
                  <th>Thành viên</th>
                  <th class="text-center">Hành động</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(promotion, index) in promotions" :key="promotion.promotionID">
                  <td class="fw-bold">{{ promotion.promotionID }}</td>
                  <td>{{ promotion.promotionName }}</td>
                  <td>{{ formatDateTime(promotion.startDate) }}</td>
                  <td>{{ formatDateTime(promotion.endDate) }}</td>
                  <td>
                    <span >{{ promotion.type }}</span>
                  </td>
                  <td>{{ promotion.rank || "Không áp dụng" }}</td>
                  <td class="text-center">
                    <button class="btn btn-primary me-1" @click="editPromotion(promotion)" title="Sửa">
                      Sửa
                    </button>
                    <button class="btn btn-danger" @click="deletePromotion(promotion)" title="Xóa">
                   Xóa
                    </button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal overlay -->
  <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Cấu hình xúc tiến sản phẩm </h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Modal cho ProductPromotion -->
          <div v-if="modalType === 'ProductDiscount'" class="row">
            <!-- Cột Form -->
            <div class="col-md-4">
              <h5 class="mb-3">Thêm sản phẩm áp dụng</h5>
              <div class="row">
                <select v-model="promotionProduct.productId" class="form-select" style="width: 200px; margin-left: 100px">
                  <option v-for="(pro, index) in promotionProduct.productIds" :key="index" :value="pro">
                    {{ pro }}
                  </option>
                </select>
              </div>
              <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Đã dùng</label>
                  <input v-model="promotionProduct.quantityUsed" type="number" class="form-control" disabled/>
              </div>
              <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Còn lại</label>
                  <input v-model="promotionProduct.quantityRemaining" type="number" class="form-control" />
              </div>
                <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">% Giảm</label>
                  <input v-model="promotionProduct.discountPercent" type="number" class="form-control" />
              </div>
              <div class="">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Ghi chú</label>
                <input v-model="promotionProduct.note" type="text" class="form-control" />
              </div>
              <button v-if="!editFormPromotionProduct" class="btn btn-success me-1" @click="createPromotionProduct(promotionProduct, promotion)">
                Thêm khuyến mãi
              </button>
              <button v-if="editFormPromotionProduct" class="btn btn-primary me-1" @click="updatePromotionProduct(promotionProduct, promotion)" >
                Cập nhật
              </button>
              <button  class="btn btn-secondary me-1" @click="resetFormPromotionProduct(promotion)" >
                Reset
              </button>
            </div>

            <!-- Cột Table -->
            <div class="col-md-8">
              <h5 class="mb-3">Danh sách sản phẩm áp dụng</h5>

              <table class="table table-bordered table-striped text-center align-middle">
                <thead class="table-light">
                <tr>
                  <th>PromotionID</th>
                  <th>ProductID</th>
                  <th>% Giảm</th>
                  <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                <tr v-if="promotionProducts.length === 0">
                  <td colspan="4">Chưa có voucher</td>
                </tr>
                <tr v-for="(pp, index) in promotionProducts" :key="index">
                  <td>{{ pp.promotionId }}</td>
                  <td>{{ pp.productId }}</td>
                  <td>{{ pp.discountPercent }}%</td>
                  <td>
                    <button class="btn btn-warning btn-sm me-1" @click="editPromotionProduct(pp)">Sửa</button>
                    <button class="btn btn-danger btn-sm" @click="deletePromotionProduct(pp, promotion)">Xóa</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
      <!-- Modal cho VoucherCampaign -->
          <div v-if="modalType === 'VoucherCampaign'" class="row">
            <!-- Cột Form -->
            <div class="col-md-4">
              <h5 class="mb-3">Thêm voucher</h5>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Voucher ID</label>
                <input v-model="voucher.voucherId" type="text" class="form-control" disabled/>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Loại khuyến mãi</label>
                <select v-model="voucher.discountType" class="form-select-sg" style="width: 200px; text-align: center; margin-left: 85px">
                  <option value="Amount">Theo giá</option>
                  <option value="Percent">Theo phần trăm</option>
                </select>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Giá trị giảm</label>
                <input v-model="voucher.discountValue" type="number" class="form-control" />
              </div>


                <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Đơn tối thiểu</label>
                  <input v-model="voucher.minOrderValue" type="number" step="0.01" class="form-control" />
                </div>
                <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Ngày kết thúc</label>
                  <input v-model="voucher.endDate" type="date" class="form-control" :disabled="promotion.type === 'VoucherCampaign'" />
                </div>
                <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Đã dùng</label>
                  <input v-model="voucher.quantityUsed" type="number" class="form-control" disabled />
                </div>
                <div class="row ">
                  <label class="form-label" style="text-align: left ; margin-left: 42px;">Còn lại</label>
                  <input v-model="voucher.quantityRemaining" type="number" class="form-control" />
                </div>
              <button v-if="!editFormVoucher" class="btn btn-success me-1" @click="createVoucher(voucher)">
                Thêm khuyến mãi
              </button>
              <button v-if="editFormVoucher" class="btn btn-primary me-1" @click="updateVoucher(voucher)" >
                Cập nhật
              </button>
              <button  class="btn btn-secondary me-1" @click="resetFormVoucher()" >
                Reset
              </button>
            </div>

            <!-- Cột Table -->
            <div class="col-md-8">
              <h5 class="mb-3">Danh sách vouchers</h5>

              <div style="overflow-x:auto;">
                <table class="table table-bordered table-striped text-center align-middle">
                  <thead class="table-light">
                  <tr>
                    <th>VoucherID</th>
                    <th>Loại</th>
                    <th>Giảm</th>
                    <th>Min Order</th>
                    <th>Hành động</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="vouchers.length === 0">
                    <td colspan="5">Chưa có voucher</td>
                  </tr>
                  <tr v-for="(v, index) in vouchers" :key="index">
                    <td>{{ v.voucherId }}</td>
                    <td>{{ v.discountType }}</td>
                    <td>{{ v.discountValue }}</td>
                    <td>{{ v.minOrderValue }}</td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" @click="editVoucher(v)">Sửa</button>
                      <button class="btn btn-danger btn-sm" @click="deleteVoucher(v)">Xóa</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
<!-- model phát  hạu mai AfterSaleService-->
          <div v-if="modalType === 'AfterSaleService'" class="row">
            <!-- Cột Form -->
            <div class="col-md-4">
              <h5 class="mb-3">Thêm voucher hậu mãi</h5>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Voucher ID</label>
                <input v-model="voucher.voucherId" type="text" class="form-control" disabled/>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Loại khuyến mãi</label>
                <select v-model="voucher.discountType" class="form-select-sg" style="width: 200px; text-align: center; margin-left: 85px">
                  <option value="Amount">Theo giá</option>
                  <option value="Percent">Theo phần trăm</option>
                </select>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Giá trị giảm</label>
                <input v-model="voucher.discountValue" type="number" class="form-control" />
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Đơn tối thiểu</label>
                <input v-model="voucher.minOrderValue" type="number" step="0.01" class="form-control" />
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Ngày kết thúc</label>
                <input v-model="voucher.endDate" type="date" class="form-control" />
              </div>

              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Đã dùng</label>
                <input v-model="voucher.quantityUsed" type="number" class="form-control" disabled/>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Còn lại</label>
                <input v-model="voucher.quantityRemaining" type="number" class="form-control" />
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Điều kiện nhận</label>
                <input v-model="voucher.claimConditions" type="number" step="0.01" class="form-control" />
              </div>
              <button v-if="!editFormVoucher" class="btn btn-success me-1" @click="createVoucher(voucher)">
                Thêm khuyến mãi
              </button>
              <button v-if="editFormVoucher" class="btn btn-primary me-1" @click="updateVoucher(voucher)" >
                Cập nhật
              </button>
              <button  class="btn btn-secondary me-1" @click="resetFormVoucher()" >
                Reset
              </button>
            </div>

            <!-- Cột Table -->
            <div class="col-md-8">
              <h5 class="mb-3">Danh sách vouchers</h5>

              <div style="overflow-x:auto;">
                <table class="table table-bordered table-striped text-center align-middle">
                  <thead class="table-light">
                  <tr>
                    <th>VoucherID</th>
                    <th>Loại</th>
                    <th>Giảm</th>
                    <th>Min Order</th>
                    <th>Hành động</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="vouchers.length === 0">
                    <td colspan="5">Chưa có voucher</td>
                  </tr>
                  <tr v-for="(v, index) in vouchers" :key="index">
                    <td>{{ v.voucherId }}</td>
                    <td>{{ v.discountType }}</td>
                    <td>{{ v.discountValue }}</td>
                    <td>{{ v.minOrderValue }}</td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" @click="editVoucher(v)">Sửa</button>
                      <button class="btn btn-danger btn-sm" @click="deleteVoucher(v)">Xóa</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
<!--     -->
<!--          model new rank-->
          <div v-if="modalType === 'NewRank'" class="row">
            <!-- Cột Form -->
            <div class="col-md-4">
              <h5 class="mb-3">Thêm voucher cho người mới lên rank</h5>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Voucher ID</label>
                <input v-model="voucher.voucherId" type="text" class="form-control" disabled/>
              </div>
              <div class="row ">
                <select v-model="voucher.discountType" class="form-select-sg" style="width: 200px; text-align: center; margin-left: 85px">
                  <option value="Amount">Theo giá</option>
                  <option value="Percent">Theo phần trăm</option>
                </select>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Giá trị giảm</label>
                <input v-model="voucher.discountValue" type="number" class="form-control" />
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Đơn tối thiểu</label>
                <input v-model="voucher.minOrderValue" type="number" step="0.01" class="form-control" />
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Ngày kết thúc</label>
                <input v-model="voucher.endDate" type="date" class="form-control" />
              </div>

              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Đã dùng</label>
                <input v-model="voucher.quantityUsed" type="number" class="form-control" disabled/>
              </div>
              <div class="row ">
                <label class="form-label" style="text-align: left ; margin-left: 42px;">Còn lại</label>
                <input v-model="voucher.quantityRemaining" type="number" class="form-control" />
              </div>
              <button v-if="!editFormVoucher" class="btn btn-success me-1" @click="createVoucher(voucher)">
                Thêm khuyến mãi
              </button>
              <button v-if="editFormVoucher" class="btn btn-primary me-1" @click="updateVoucher(voucher)" >
                Cập nhật
              </button>
              <button  class="btn btn-secondary me-1" @click="resetFormVoucher()" >
                Reset
              </button>
            </div>

            <!-- Cột Table -->
            <div class="col-md-8">
              <h5 class="mb-3">Danh sách vouchers</h5>

              <div style="overflow-x:auto;">
                <table class="table table-bordered table-striped text-center align-middle">
                  <thead class="table-light">
                  <tr>
                    <th>VoucherID</th>
                    <th>Loại</th>
                    <th>Giảm</th>
                    <th>Min Order</th>
                    <th>Hành động</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-if="vouchers.length === 0">
                    <td colspan="5">Chưa có voucher</td>
                  </tr>
                  <tr v-else v-for="(v, index) in vouchers" :key="index">
                    <td>{{ v.voucherId }}</td>
                    <td>{{ v.discountType }}</td>
                    <td>{{ v.discountValue }}</td>
                    <td>{{ v.minOrderValue }}</td>
                    <td>
                      <button class="btn btn-warning btn-sm me-1" @click="editVoucher(v)">Sửa</button>
                      <button class="btn btn-danger btn-sm" @click="deleteVoucher(v)">Xóa</button>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Đóng</button>

        </div>
      </div>
    </div>
  </div>
  <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<style>
.promotion-container {
  max-width: 95%;
  margin: auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #0066cc;
  margin-bottom: 20px;
  text-align: center;
}

.content-grid {
  display: grid;
  grid-template-columns: 0.7fr 2fr;
  gap: 20px;
}

/* ==== FORM ==== */
.promotion-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-weight: normal;
  color: black;
  display: block;
  margin-bottom: 5px;
}

input,
textarea,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #444;
  border-radius: 5px;
  color: black;
  background: white;
}

input:focus,
textarea:focus,
select:focus {
  outline: 1px solid #0066cc;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn:hover {
  opacity: 0.9;
}

.promotion-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  font-size: 14px;
}

.promotion-table thead {
  font-style: normal;
  background: #f1f1f1;
  color: black;
}
.promotion-table tr{
  max-font-size: 14px;
  height: 10px;
}
.promotion-table th,
.promotion-table td {
  border: 1px solid #ddd;
  padding: 6px 10px;
  vertical-align: top;
}

.promotion-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}
/* Đảm bảo ô chứa ảnh có đủ không gian */
.promotion-table td:nth-child(7) {
  min-width: 160px;
}

/* Responsive cho mobile */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .promotion-table {
    font-size: 12px;
  }
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

.modal-content {
  margin-top: 100px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 1200px !important;
  text-align: center; /* căn giữa nội dung */
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.modal-content label {
  display: block;
  text-align: center;
  margin: 8px 0 4px;
  font-weight: 500;
}

.modal-content input {
  width: 300px;     /* input chiều rộng cố định */
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  display: block;
  margin-left: auto;
  margin-right: auto; /* căn giữa input */
}

.modal-actions {
  margin-top: 15px;
  display: flex;
  justify-content: center; /* căn giữa button */
  gap: 15px;
}

.modal-actions .btn {
  width: 120px;  /* button chiều rộng cố định */
  padding: 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}
</style>