<script setup>
import {onMounted, ref, watch} from "vue";
import Swal from "sweetalert2";

const props = defineProps({
  showCompleteModal: Boolean,
  slip: Object
})

const emit = defineEmits(['update:showCompleteModal'])

const formatNote = (note) => {
  if (!note) return "-";
  return note.replace("[Lý do từ chối]", "\n[Lý do từ chối]");
};

const closeCompleteModal = () => {
  emit('update:showCompleteModal', false)
}

// Khởi tạo selectedSlip với actualQuantity bằng với quantity ban đầu
const selectedSlip = ref({
  ...props.slip,
  details: props.slip.details.map(detail => ({
    ...detail,
    actualQuantity: detail.quantity
  }))
})

// Theo dõi thay đổi của props.slip để cập nhật selectedSlip
watch(() => props.slip, (newSlip) => {
  selectedSlip.value = {
    ...newSlip,
    details: newSlip.details.map(detail => ({
      ...detail,
      actualQuantity: detail.quantity
    }))
  }
}, {deep: true})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
}

const translateStatus = (status) => {
  const statusMap = {
    'PENDING': 'Chờ duyệt',
    'APPROVED': 'Đã duyệt',
    'REJECTED': 'Từ chối',
    'DONE': 'Hoàn thành'
  }
  return statusMap[status] || status
}

onMounted(() => {
  selectedSlip.value.note ='';
});

const complete = async () => {
  selectedSlip.value.details.forEach(d => {
    if (d.actualQuantity != null) {
      d.quantity = d.actualQuantity;
    }
    delete d.actualQuantity;
  });
  console.log("Đã hoàn thành: ", selectedSlip.value)
  const response = await api.post("/admin/inventorySlip/complete", selectedSlip.value, {withCredentials: true});

  if(response.status === 200){
    Swal.fire({
      icon: "success",
      title: "Xác nhận thành công!",
      confirmButtonText: "OK",
      confirmButtonColor: "#3085d6"
    }).then(() => {
      // phát sự kiện cho cha
      emit("slipCompleted", selectedSlip.value);
    });

  }

}
</script>

<template>
  <div v-if="showCompleteModal" class="modal" @click="closeCompleteModal">
    <div class="modal-content" @click.stop>
      <span class="close" @click="closeCompleteModal">&times;</span>
      <h2>Thông tin phiếu xuất #{{ slip.id }}</h2>

      <div class="slip-details">
        <div><strong>Loại:</strong> {{ slip.type ? "Nhập" : "Xuất" }}</div>
        <div><strong>Trạng thái:</strong> {{ translateStatus(slip.status) }}</div>
        <div><strong>Từ:</strong> {{ slip.fromName }}</div>
        <div><strong>Đến:</strong> {{ slip.toName }}</div>
        <div><strong>Nhân viên:</strong> {{ slip.staffName }}</div>
        <div><strong>Người duyệt:</strong> {{ slip.approverName || "-" }}</div>
        <div><strong>Ngày tạo:</strong> {{ formatDate(slip.createDate) }}</div>
        <div>
          <strong>Ghi chú: </strong>
          <span style="white-space: pre-wrap;">{{ formatNote(slip.note) }}</span>
        </div>
      </div>

      <h3>Chi tiết sản phẩm</h3>
      <table class="details-table">
        <thead>
        <tr>
          <th>Mẫu</th>
          <th>Số lượng xuất</th>
          <th>Thực tế nhận</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(detail, index) in selectedSlip.details" :key="index">
          <td>{{ detail.itemName }}</td>
          <td>{{ slip.details[index].quantity }}</td>
          <td style="padding: 0">
            <input
                type="number"
                v-model="detail.actualQuantity"
                min="0"
            >
          </td>
        </tr>
        </tbody>
      </table>

      <textarea v-model="selectedSlip.note" maxlength="385" placeholder="Thêm ghi chú"></textarea>
      <div :style="{ color: selectedSlip.note.length > 380 ? 'red' : 'black' }">
        {{ selectedSlip.note.length }}/500 ký tự
      </div>

      <div class="details-actions">
        <button @click="complete" class="complete-btn">Xác nhận</button>
        <button @click="closeCompleteModal" class="close-btn">Đóng</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

td input[type="number"] {
  border: none;
}
/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-content {
  background-color: white;
  padding: 25px;
  border-radius: 8px;
  width: 80%;
  max-width: 700px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  scrollbar-width: none;
}

.close {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group select, .form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 80px;
}

.detail-items {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.detail-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.detail-item select {
  flex: 2;
}

.detail-item input {
  flex: 1;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr:hover {
  background-color: #f5f5f5;
}


/* Details modal styles */
.slip-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.slip-details div {
  padding: 5px 0;
}

.details-table {
  width: 100%;
  margin-bottom: 20px;
}

.details-table th, .details-table td {
  padding: 10px;
}

.details-actions {
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.complete-btn {
  background-color: #58db34;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 15px;
}

.table-container {
  min-height: calc(6 * 60px); /* Giả sử mỗi row cao 50px */
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  min-height: 80px;
}

.action-btn.complete {
  background-color: #9b59b6;
  color: white;
}


</style>