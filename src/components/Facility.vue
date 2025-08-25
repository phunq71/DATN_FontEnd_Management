<template>
  <div class="py-4 px-4">
    <!-- Form tạo/cập nhật cơ sở -->
    <div class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          {{ editingFacility ? "Cập nhật cơ sở" : "Thêm mới cơ sở" }}
        </h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <!-- Tên cơ sở -->
          <div class="col-md-6">
            <label class="form-label">Tên cơ sở</label>
            <input v-model="form.facilityName" type="text" class="form-control" placeholder="Nhập tên cơ sở"/>
          </div>

          <!-- Loại -->
          <div class="col-md-6">
            <label class="form-label">Loại</label>
            <select :disabled="editingFacility" v-model="form.type" @change="updateParentOptions" class="form-select">
              <option value="Z">Khu vực</option>
              <option value="S">Shop</option>
              <option value="K">Kho</option>
              <option value="W">Kho khu vực</option>
            </select>
          </div>

          <!-- Trạng thái -->
          <div class="col-md-6">
  <label class="form-label">Trạng thái</label>
  <div class="d-flex gap-3 align-items-center">
    <div class="form-check form-check-inline">
      <input v-model="form.isUse" class="form-check-input status-radio" type="radio" :value="true" id="statusActive">
      <label class="form-check-label" for="statusActive">
        <i class="fa fa-circle-check text-success me-1"></i> Hoạt động
      </label>
    </div>
    <div class="form-check form-check-inline">
      <input v-model="form.isUse" class="form-check-input status-radio" type="radio" :value="false" id="statusInactive">
      <label class="form-check-label" for="statusInactive">
        <i class="fa fa-circle-xmark text-danger me-1"></i> Ngừng
      </label>
    </div>
  </div>
</div>


          <!-- Địa chỉ -->
          <div class="col-12">
            <label class="form-label">Địa chỉ</label>
            <div class="row g-2 mb-2">
              <div class="col-md-4">
                <select v-model="selectedProvince" @change="onProvinceChange" class="form-select">
                  <option :value="null">Chọn Tỉnh/Thành phố</option>
                  <option v-for="province in provinces" :key="province.ProvinceID" :value="String(province.ProvinceID)">
                    {{ province.ProvinceName }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select v-model="selectedDistrict" @change="onDistrictChange" :disabled="!selectedProvince" class="form-select">
                  <option :value="null">Chọn Quận/Huyện</option>
                  <option v-for="district in districts" :key="district.DistrictID" :value="String(district.DistrictID)">
                    {{ district.DistrictName }}
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select v-model="selectedWard" :disabled="!selectedDistrict" class="form-select">
                  <option :value="null">Chọn Phường/Xã</option>
                  <option v-for="ward in wards" :key="ward.WardCode" :value="ward.WardCode">
                    {{ ward.WardName }}
                  </option>
                </select>
              </div>
            </div>
            <input v-model="form.addressDetail" type="text" class="form-control" placeholder="Số nhà, tên đường">
          </div>



          <!-- Cơ sở cha -->
          <div class="col-md-6">
            <label class="form-label">Cơ sở cha</label>
            <select v-model="form.parentId" class="form-select">
              <option :value="null">-- Không có --</option>
              <option v-for="f in parentOptions" :key="f.facilityId" :value="f.facilityId">
                {{ f.facilityName }} ({{ getTypeName(f.type) }})
              </option>
            </select>
          </div>
        </div>

        <!-- Buttons -->
        <div class="d-flex justify-content-end mt-4 gap-2">
          <button @click="saveFacility" class="btn btn-primary">
            <i class="fa fa-save me-2"></i>{{ editingFacility ? "Cập nhật" : "Thêm" }}
          </button>
          <button @click="resetForm" class="btn btn-outline-secondary">
            <i class="fa fa-undo me-2"></i>Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Bộ lọc -->
    <div class="mb-3">
      <label class="form-label">Khu vực:</label>
      <select v-model="selectedRegion" @change="onRegionChange" class="form-select w-auto">
        <option :value="null">Tất cả khu vực</option>
        <option v-for="region in regions" :key="region.facilityId" :value="region.facilityId">
          {{ region.facilityName }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-muted py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Đang tải...</p>
    </div>

    <!-- Table -->
    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-primary">
            <tr>
              <th>ID</th>
              <th>Tên cơ sở</th>
              <th>Địa chỉ</th>
              <th>ĐC GNH</th>
              <th>Loại</th>
              <th>Cha</th>
              <th>Trạng thái</th>
              <th class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="facility in filteredFacilities" :key="facility.facilityId">
              <tr :class="{'table-light': facility.type === 'Z'}">
                <td>{{ facility.facilityId }}</td>
                <td>
                  <span v-if="facility.type === 'S'" class="me-2 text-primary" role="button" @click="toggleShop(facility.facilityId)">
                    <i :class="['fa', expandedShops.includes(facility.facilityId) ? 'fa-chevron-down' : 'fa-chevron-right']"></i>
                  </span>
                  {{ facility.facilityName }}
                  <div v-if="facility.type === 'Z' && facility.managerName" class="small text-muted">
                    <i class="fa fa-user me-1"></i>{{ facility.managerName }}
                  </div>
                </td>
                <td>{{ facility.address }}</td>
                <td>{{ facility.addressIdGHN }}</td>
                <td>{{ getTypeName(facility.type) }}</td>
                <td>{{ getParentName(facility.parentId) }}</td>
                <td>
                  <span v-if="facility.isUse" class="text-success">
                    <i class="fa fa-circle-check me-1"></i> Hoạt động
                  </span>
                  <span v-else class="text-danger">
                    <i class="fa fa-circle-xmark me-1"></i> Ngừng
                  </span>
                </td>

                <td class="text-center">
                  <button @click="editFacility(facility)" class="btn btn-sm btn-outline-primary me-1">
                    <i class="fa fa-edit"></i>
                  </button>
                  <button @click="deleteFacility(facility.facilityId)" class="btn btn-sm btn-outline-danger me-1">
                    <i class="fa fa-trash"></i>
                  </button>
                  <button @click="openMoveForm(facility)" class="btn btn-sm btn-outline-secondary">
                    <i class="fa fa-arrows-alt"></i>
                  </button>
                </td>
              </tr>

              <!-- Hiển thị kho thuộc Shop -->
              <tr v-if="facility.type === 'S' && expandedShops.includes(facility.facilityId)">
                <td colspan="7">
                  <div class="p-3 bg-light border rounded-3 shadow-sm">
                    <h6 class="fw-semibold text-primary mb-3">
                      <i class="fa fa-warehouse me-2"></i>Kho của {{ facility.facilityName }}
                    </h6>
                    <div class="table-responsive">
                      <table class="table table-sm table-bordered mb-0">
                        <thead class="table-light">
                          <tr>
                            <th>ID</th>
                            <th>Tên kho</th>
                            <th>Địa chỉ</th>
                            <th>ĐC GHN</th>
                            <th>Trạng thái</th>
                            <th class="text-center">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="warehouse in getWarehouses(facility.facilityId)" :key="warehouse.facilityId">
                            <td>{{ warehouse.facilityId }}</td>
                            <td>
                              <i class="fa fa-box text-secondary me-2"></i>
                              {{ warehouse.facilityName }}
                            </td>
                            <td>{{ warehouse.address }}</td>
                            <td>{{ warehouse.addressIdGHN }}</td>
                            <td>
                              <span v-if="warehouse.isUse" class="text-success d-flex align-items-center gap-1">
                                <i class="fa fa-circle-check"></i> Hoạt động
                              </span>
                              <span v-else class="text-danger d-flex align-items-center gap-1">
                                <i class="fa fa-circle-xmark"></i> Ngừng
                              </span>
                            </td>
                            <td class="text-center">
                              <button @click="editFacility(warehouse)" class="btn btn-sm btn-outline-primary me-1">
                                <i class="fa fa-edit"></i>
                              </button>
                              <button @click="deleteFacility(warehouse.facilityId)" class="btn btn-sm btn-outline-danger me-1">
                                <i class="fa fa-trash"></i>
                              </button>
                              <button @click="openMoveForm(warehouse)" class="btn btn-sm btn-outline-secondary">
                                <i class="fa fa-arrows-alt"></i>
                              </button>
                            </td>
                          </tr>
                          <tr v-if="getWarehouses(facility.facilityId).length === 0">
                            <td colspan="5" class="text-center text-muted fst-italic">
                              Chưa có kho nào
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Không có dữ liệu -->
    <div v-if="!loading && filteredFacilities.length === 0" class="alert alert-info mt-3 text-center">
      Không có cơ sở nào để hiển thị
    </div>

<!-- Move Facility Modal -->
<div class="modal fade" id="moveFacilityModal" tabindex="-1" aria-labelledby="moveFacilityModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content rounded-3 shadow">

      <!-- Header -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title" id="moveFacilityModalLabel">Di chuyển cơ sở</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"
                @click="closeMoveForm"></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Thông tin cơ sở -->
        <div class="mb-4 p-3 bg-light border rounded">
          <h6 class="fw-semibold mb-2">Thông tin cơ sở</h6>
          <div class="row small">
            <div class="col-4 text-muted">Tên cơ sở:</div>
            <div class="col-8 fw-medium">{{ movingFacility?.facilityName }}</div>

            <div class="col-4 text-muted">Loại:</div>
            <div class="col-8 fw-medium">{{ getTypeName(movingFacility?.type) }}</div>

            <div class="col-4 text-muted">Địa chỉ:</div>
            <div class="col-8 fw-medium">{{ movingFacility?.address || 'Không có' }}</div>
          </div>
        </div>

        <!-- Cảnh báo không thể di chuyển -->
        <div v-if="showMoveAlert" class="alert alert-warning d-flex align-items-start">
          <i class="fa fa-exclamation-triangle me-2 mt-1"></i>
          <div>
            <div class="fw-semibold mb-1">Không thể di chuyển</div>
            <small>{{ moveAlertMessage }}</small>
          </div>
        </div>

        <!-- Form chọn cơ sở cha -->
        <div v-else class="mb-3">
          <label class="form-label fw-semibold">Chọn cơ sở cha mới</label>
          <select v-model="newParentId" class="form-select">
            <option :value="null">-- Chọn cơ sở cha --</option>
            <option v-for="f in moveParentOptions" :key="f.facilityId" :value="f.facilityId">
              {{ f.facilityName }} ({{ getTypeName(f.type) }})
            </option>
          </select>
          <div class="form-text">Chọn cơ sở cha phù hợp với loại cơ sở bạn đang di chuyển</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="closeMoveForm">
          Hủy bỏ
        </button>
        <button type="button" class="btn btn-success" @click="moveFacility"
                :disabled="showMoveAlert || !newParentId">
          Xác nhận di chuyển
        </button>
      </div>
    </div>
  </div>
</div>

  </div>
</template>


<script>
import { Modal } from 'bootstrap';
import Address from '../assets/data/Address.json'
export default {
  name: "Facility",
  data() {
    return {
      facilities: [],
      filteredFacilities: [],
      regions: [],
      loading: true,
      showForm: false,
      showMoveForm: false,
      editingFacility: null,
      movingFacility: null,
      newParentId: null,
      selectedRegion: null,
      expandedShops: [],
      addressData: [],
      provinces: [],
      districts: [],
      wards: [],
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
      form: {
        facilityId: null,
        facilityName: "",
        address: "",
        addressDetail: "",
        addressIdGHN: "",
        type: "Z",
        parentId: null,
        isUse: true
      },
      showMoveAlert: false,
      moveAlertMessage: ""
    }
  },
  computed: {
    parentOptions() {
      if (this.form.type === 'Z') {
        return [];
      }
      if (this.form.type === 'S' || this.form.type === 'W') {
        return this.facilities.filter(f => f.type === 'Z');
      }
      if (this.form.type === 'K') {
        return this.facilities.filter(f => f.type === 'S');
      }
      return [];
    },
    moveParentOptions() {
      if (!this.movingFacility) return [];
      const type = this.movingFacility.type;
      if (type === 'Z' || type === 'W') {
        this.showMoveAlert = true;
        this.moveAlertMessage = type === 'Z' ? "Không thể di chuyển khu vực." : "Không thể di chuyển kho khu vực.";
        return [];
      }
      this.showMoveAlert = false;
      if (type === 'S') {
        return this.facilities.filter(f => f.type === 'Z');
      }
      if (type === 'K') {
        return this.facilities.filter(f => f.type === 'S');
      }
      return [];
    }
  },
  async mounted() {
    await this.loadAddressData();
    this.loadFacilities();
  },
  methods: {
    async loadAddressData() {
      try {
        const response = await fetch('/src/assets/data/Address.json');
        this.addressData = Address;
        this.provinces = this.addressData;
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu địa chỉ:', error);
      }
    },
    onProvinceChange() {
      const province = this.provinces.find(p => p.ProvinceID == this.selectedProvince)
      this.districts = province ? province.Districts || [] : []
      this.selectedDistrict = null
      this.wards = []
      this.selectedWard = null
      this.updateAddress()
    },

    onDistrictChange() {
      const district = this.districts.find(d => d.DistrictID == this.selectedDistrict)
      this.wards = district ? district.Wards || [] : []
      this.selectedWard = null
      this.updateAddress()
    },
    updateAddress() {
      let addressParts = [];
      if (this.form.addressDetail) addressParts.push(this.form.addressDetail);
      if (this.selectedWard) addressParts.push(this.selectedWard.WardName);
      if (this.selectedDistrict) addressParts.push(this.selectedDistrict.DistrictName);
      if (this.selectedProvince) addressParts.push(this.selectedProvince.ProvinceName);
      this.form.address = addressParts.join(', ');

      //chuỗi id
      let idParts = [];
      if (this.selectedWard) idParts.push(this.selectedWard.WardCode);
      if (this.selectedDistrict) idParts.push(this.selectedDistrict.DistrictID);
      if (this.selectedProvince) idParts.push(this.selectedProvince.ProvinceID);
      this.form.addressIdGHN = idParts.join('/');
    },
    async loadFacilities() {
      this.loading = true;
      try {
        const res = await api.get('/admin/facility', {withCredentials: true});
        this.facilities = res.data;
        this.regions = this.facilities.filter(f => f.type === 'Z');
        if (this.selectedRegion) {
          this.filteredFacilities = this.facilities.filter(
              f => f.parentId === this.selectedRegion && (f.type === 'S' || f.type === 'W')
          );
        } else {
          this.filteredFacilities = this.facilities.filter(f => f.type === 'Z');
        }
      } catch (err) {
        Swal.fire("Lỗi", "Không thể tải danh sách cơ sở", "error");
      } finally {
        this.loading = false;
      }
    },
    onRegionChange() {
      if (this.selectedRegion) {
        this.filteredFacilities = this.facilities.filter(
            f => f.parentId === this.selectedRegion && (f.type === 'S' || f.type === 'W')
        );

      } else {
        this.filteredFacilities = this.facilities.filter(f => f.type === 'Z');
      }
      this.expandedShops = [];
    },
    toggleShop(shopId) {
      if (this.expandedShops.includes(shopId)) {
        this.expandedShops = this.expandedShops.filter(id => id !== shopId);
      } else {
        this.expandedShops.push(shopId);
      }
    },
    getWarehouses(shopId) {
      return this.facilities.filter(f => f.parentId === shopId && f.type === 'K');
    },
    getTypeName(type) {
      const typeMap = {
        'Z': 'Khu vực',
        'S': 'Shop',
        'K': 'Kho',
        'W': 'Kho khu vực'
      };
      return typeMap[type] || type;
    },
    getParentName(parentId) {
      if (!parentId) return '-';
      const parent = this.facilities.find(f => f.facilityId === parentId);
      return parent ? `${parent.facilityName} (${this.getTypeName(parent.type)})` : parentId;
    },
    getChildrenIds(parentId) {
      const children = this.facilities.filter(f => f.parentId === parentId);
      return children.map(c => c.facilityId);
    },
    openForm(facility = null) {
      if (facility) {
        this.editingFacility = facility;
        this.form = {
          facilityId: facility.facilityId || null,
          facilityName: facility.facilityName || "",
          address: facility.address || "",
          addressIdGHN: facility.addressIdGHN || "",
          addressDetail: "",
          type: facility.type || "Z",
          parentId: facility.parentId || null,
          isUse: facility.isUse ?? true
        };
        this.parseExistingAddress(facility.address);
        this.parseExistingAddressGHN(facility.addressIdGHN);
      } else {
        this.resetForm();
      }
    },
    parseExistingAddress(address) {

      this.selectedProvince = null;
      this.selectedDistrict = null;
      this.selectedWard = null;
      this.districts = [];
      this.wards = [];
      const addressParts = address.split(',').map(part => part.trim());
      for (const province of this.provinces) {
        if (addressParts.includes(province.ProvinceName)) {
          this.selectedProvince = province;
          this.districts = province.Districts;
          break;
        }
      }
      if (this.selectedProvince) {
        for (const district of this.districts) {
          if (addressParts.includes(district.DistrictName)) {
            this.selectedDistrict = district;
            this.wards = district.Wards;
            break;
          }
        }
      }
      if (this.selectedDistrict) {
        for (const ward of this.wards) {
          if (addressParts.includes(ward.WardName)) {
            this.selectedWard = ward;
            break;
          }
        }
      }
      const detailParts = addressParts.filter(part =>
          part !== this.selectedProvince?.ProvinceName &&
          part !== this.selectedDistrict?.DistrictName &&
          part !== this.selectedWard?.WardName
      );
      this.form.addressDetail = detailParts.join(', ');
      this.updateAddress();
    },
    parseExistingAddressGHN(addressIdGHN) {
      if (!addressIdGHN) return;

      this.selectedProvince = null;
      this.selectedDistrict = null;
      this.selectedWard = null;
      this.districts = [];
      this.wards = [];

      // Thứ tự đúng của GHN: province/district/ward
      const [provinceId, districtId, wardCode] = addressIdGHN.split("/");

      console.log("provinceId from GHN:", provinceId);
      console.log("all province IDs:", this.provinces.map(p => p.ProvinceID));

      // gán ID (string) cho v-model
      this.selectedProvince = provinceId ? String(provinceId) : null;
      const provinceObj = this.provinces.find(p => String(p.ProvinceID) === this.selectedProvince);
      if (provinceObj) {
        this.districts = provinceObj.Districts;
      }

      this.selectedDistrict = districtId ? String(districtId) : null;
      const districtObj = this.districts.find(d => String(d.DistrictID) === this.selectedDistrict);
      if (districtObj) {
        this.wards = districtObj.Wards;
      }

      this.selectedWard = wardCode ? String(wardCode) : null;
    },
    resetForm() {
      this.editingFacility = null;
      this.form = {
        facilityId: null,
        facilityName: "",
        address: "",
        addressDetail: "",
        type: "Z",
        parentId: null,
        isUse: true
      };
      this.selectedProvince = null;
      this.selectedDistrict = null;
      this.selectedWard = null;
      this.districts = [];
      this.wards = [];
    },
    closeForm() {
      this.showForm = false;
    },
    updateParentOptions() {
    },
    async saveFacility() {
      try {
        // === VALIDATE TRƯỚC ===
        const errors = [];
        if (this.form.type !== "Z") {

        }

        if (!this.form.facilityName || this.form.facilityName.trim() === "") {
          errors.push("Tên cơ sở không được để trống.");
        } else if (this.form.facilityName.length > 100) {
          errors.push("Tên cơ sở không được vượt quá 100 ký tự.");
        }

        if (!this.form.type) {
          errors.push("Vui lòng chọn loại cơ sở.");
        }

        if (this.form.isUse === null || this.form.isUse === undefined) {
          errors.push("Vui lòng chọn trạng thái hoạt động.");
        }
        if(this.form.type !== "Z"){
          if (!this.selectedProvince) {
            errors.push("Vui lòng chọn Tỉnh/Thành phố.");
          }
          if (!this.selectedDistrict) {
            errors.push("Vui lòng chọn Quận/Huyện.");
          }
          if (!this.selectedWard) {
            errors.push("Vui lòng chọn Phường/Xã.");
          }
          if (!this.form.addressDetail || this.form.addressDetail.trim() === "") {
            errors.push("Vui lòng nhập số nhà, tên đường.");
          }

          if (this.form.parentId && !this.parentOptions.some(f => f.facilityId === this.form.parentId)) {
            errors.push("Cơ sở cha không hợp lệ.");
          }
        }
        if (this.form.type !== "Z") {
          if (!this.form.parentId) {
            errors.push("Vui lòng chọn cơ sở cha.");
          } else if (!this.parentOptions.some(f => f.facilityId === this.form.parentId)) {
            errors.push("Cơ sở cha không hợp lệ.");
          }
        }

        // Nếu có lỗi thì hiện Swal và return luôn
        if (errors.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Lỗi xác thực",
            html: errors.map(e => `<div>- ${e}</div>`).join(""),
          });
          return;
        }

        // === BUILD ADDRESS ===
        let addressIdGHN = "";
        let address = "";

        if (this.selectedProvince && this.selectedDistrict && this.selectedWard) {
          // GHN ID để lưu DB
          addressIdGHN = [
            String(this.selectedProvince),
            String(this.selectedDistrict),
            String(this.selectedWard),
            this.form.addressDetail?.trim() || ""
          ].join("/");

          // Lấy tên đầy đủ để hiển thị
          const provinceObj = this.provinces.find(p => String(p.ProvinceID) === String(this.selectedProvince));
          const districtObj = this.districts.find(d => String(d.DistrictID) === String(this.selectedDistrict));
          const wardObj = this.wards.find(w => String(w.WardCode) === String(this.selectedWard));

          let addressParts = [];
          if (this.form.addressDetail) addressParts.push(this.form.addressDetail);
          if (wardObj) addressParts.push(wardObj.WardName);
          if (districtObj) addressParts.push(districtObj.DistrictName);
          if (provinceObj) addressParts.push(provinceObj.ProvinceName);

          address = addressParts.join(", ");
        }

        // === PAYLOAD ===
        const payload = {
          facilityName: this.form.facilityName.trim(),
          address: address,
          addressIdGHN: addressIdGHN,
          type: this.form.type,
          parentId: this.form.parentId,
          isUse: this.form.isUse
        };

        // === CALL API ===
        if (this.editingFacility && this.editingFacility.facilityId) {
          // if (this.form.type === "Z") {
          //   Swal.fire("Thông báo", "Khu vực không được phép cập nhật", "warning");
          //   return; // ⛔ Dừng lại, không gọi API
          // }
          await api.put(`/admin/facility/${this.editingFacility.facilityId}`, payload, { withCredentials: true });
          Swal.fire("Thành công", "Cập nhật cơ sở thành công", "success");
        }
        else {
          // if (this.form.type === "Z") {
          //   Swal.fire("Thông báo", "Vui lòng chọn loại cơ sở", "warning");
          //   return; // ⛔ Dừng, không gọi API
          // }
          await api.post("/admin/facility", payload, { withCredentials: true });
          Swal.fire("Thành công", "Thêm cơ sở thành công", "success");

        }

        // Reset + reload
        this.resetForm();
        this.loadFacilities();

      } catch (err) {
        console.error("❌ API lỗi:", err.response || err);
        Swal.fire("Lỗi", err.response?.data?.message || "Thao tác thất bại", "error");
      }
    } ,
    async deleteFacility(id) {
      try {
        const confirmResult = await Swal.fire({
          title: 'Xác nhận xóa',
          text: "Bạn có chắc chắn muốn xóa cơ sở này?",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Xóa',
          cancelButtonText: 'Hủy'
        });
        if (!confirmResult.isConfirmed) {
          return;
        }
        const res = await api.delete(`/admin/facility/${id}`, {withCredentials: true});
        if (res.data && res.data.deleteMessage) {
          Swal.fire({
            title: res.data.isUse === false ? "Không thể xóa" : "Thành công",
            html: res.data.deleteMessage,
            icon: res.data.isUse === false ? 'warning' : 'success',
            confirmButtonText: 'Đã hiểu'
          });
        } else {
          Swal.fire("Thành công", "Đã xóa cơ sở thành công", "success");
        }
        this.loadFacilities();
      } catch (err) {
        console.error("Lỗi khi xóa cơ sở:", err);
        let errorMessage = "Không thể xóa cơ sở";
        if (err.response?.data?.message) {
          errorMessage += ": " + err.response.data.message;
        } else if (err.response?.data?.deleteMessage) {
          errorMessage = err.response.data.deleteMessage;
        }
        Swal.fire("Lỗi", errorMessage, "error");
      }
    },
    openMoveForm(facility) {
      this.movingFacility = facility;
      this.newParentId = null;

      const modalEl = document.getElementById('moveFacilityModal');
      const modal = new Modal(modalEl);
      modal.show();
    },
    closeMoveForm() {
      const modalEl = document.getElementById('moveFacilityModal');
      const modal = Modal.getInstance(modalEl);
      if (modal) modal.hide();

      this.movingFacility = null;
      this.newParentId = null;
      this.showMoveAlert = false;
      this.moveAlertMessage = "";
    },
    async moveFacility() {
      if (!this.movingFacility) return;
      try {
        await api.put(`/admin/facility/${this.movingFacility.facilityId}/move`, null, {
          params: {newParentId: this.newParentId},
          withCredentials: true,
        });
        Swal.fire("Thành công", "Di chuyển thành công", "success");
        this.closeMoveForm();
        this.loadFacilities();
      } catch (err) {
        Swal.fire("Lỗi", err.response?.data?.message || "Không thể di chuyển", "error");
      }
    },
    editFacility(facility) {
      console.log(facility)
      this.setDefaultAddress(facility.addressIdGHN)
      this.openForm(facility);

    },
    setDefaultAddress(addressIdGHN) {
      if (!addressIdGHN) return
      const parts = addressIdGHN.split("/") // ["235", "1854", "291627", "888 Hòa Thành"]

      this.selectedProvince = parts[0] ? parts[0].trim() : null
      this.onProvinceChange()

      this.selectedDistrict = parts[1] ? parts[1].trim() : null
      this.onDistrictChange()

      this.selectedWard = parts[2] ? parts[2].trim() : null // WardCode thường là string

      this.detailAddress = parts[3] ? parts[3].trim() : ""

      console.log("selectedProvince:", this.selectedProvince, typeof this.selectedProvince)
      console.log("selectedDistrict:", this.selectedDistrict, typeof this.selectedDistrict)
      console.log("selectedWard:", this.selectedWard, typeof this.selectedWard)

      console.log("Provinces:", this.provinces)
      console.log("Districts:", this.districts)
      console.log("Wards:", this.wards)

      console.log("selectedProvince:", this.selectedProvince, typeof this.selectedProvince)
      console.log("selectedDistrict:", this.selectedDistrict, typeof this.selectedDistrict)
      console.log("selectedWard:", this.selectedWard, typeof this.selectedWard)


    }



  }
}
</script>

<style scoped>
/* =====================
   Tông màu chủ đạo: Trắng + Xanh
   ===================== */
body {
  font-family: 'Inter', sans-serif;
  background-color: #f0f6ff;
  color: #1e293b;
}

/* ===== Form ===== */
.bg-white {
  background-color: #ffffff;
}

h2 {
  color: #0f172a;
}

input, select {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 12px;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px #bfdbfe;
}

/* ===== Buttons ===== */
button {
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

button.bg-gray-800 {
  background-color: #2563eb; /* xanh */
}

button.bg-gray-800:hover {
  background-color: #1e40af; /* xanh đậm */
}

button.border {
  background-color: #fff;
}

button.border:hover {
  background-color: #f1f5f9;
}

button.text-red-600:hover {
  color: #dc2626;
}

/* ====== Table ====== */
table {
  width: 100%;
  border-spacing: 0;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.08);
}

th, td {
  text-align: left;
  padding: 12px 16px;
  font-size: 14px;
}

th {
  background-color: #eff6ff; /* xanh nhạt */
  color: #1e3a8a;
  font-weight: 600;
  border-bottom: 1px solid #dbeafe;
}

tr {
  transition: background-color 0.2s ease;
}

tr:hover {
  background-color: #f1f5f9;
}

tbody tr.bg-gray-50 {
  background-color: #f9fafb;
}

tbody tr.bg-gray-100 {
  background-color: #eff6ff; /* Khu vực */
}

/* Shop có kho con */
td.pl-8 {
  color: #334155;
  font-style: italic;
}

/* ====== Status Badge ====== */
.text-green-600 {
  color: #16a34a;
}

.text-red-600 {
  color: #dc2626;
}

/* ====== Modal ====== */
.fixed.inset-0 {
  background-color: rgba(0, 0, 0, 0.55);
}

.bg-white.rounded-lg {
  border-radius: 12px;
}

.bg-gray-50 {
  background-color: #f8fafc;
}

h3 {
  color: #1e3a8a;
}

/* Cảnh báo trong modal */
.bg-yellow-50 {
  background-color: #fef9c3;
}
.border-yellow-200 {
  border-color: #fde68a;
}
.text-yellow-800 {
  color: #92400e;
}

input[type="radio"] {
  appearance: radio !important; /* ép trình duyệt dùng radio mặc định */
  -webkit-appearance: radio !important; /* cho Safari/Chrome */
  -moz-appearance: radio !important; /* cho Firefox */
}

.table td.text-center {
  white-space: nowrap;  /* các button không xuống dòng */
}

.table td.text-center button {
  margin-right: 4px; /* chỉnh khoảng cách giữa các nút */
}

</style>