<!-- components/Login.vue -->
<template>
  <div id="login-container">
    <h1 class="text-primary">Đăng nhập</h1>
    <input type="text" placeholder="Tên đăng nhập" class="form-control" v-model="username">
    <input type="password" placeholder="Mật khẩu" class="form-control" v-model="password">
    <button
        class="btn btn-outline-primary"
        @click="handleLogin()"
    >
      Đăng nhập
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const username = ref("");
const password = ref("");

const emit = defineEmits(['login-success']);

async function handleLogin() {
  try {
    const response = await api.post("/api/auth/login2", {
      email: username.value,
      password: password.value,
      rememberMe: false
    }, { withCredentials: true });

    // Thông báo thành công
    await Swal.fire({
      title: 'Đăng nhập thành công!',
      icon: 'success',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false
    });

    emit('login-success', response.data);
    router.push('/home');

  } catch (error) {
    // Thông báo thất bại
    await Swal.fire({
      title: 'Đăng nhập thất bại!',
      text: 'Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.',
      icon: 'error',
      confirmButtonText: 'OK',
      confirmButtonColor: '#000000'
    });
  }
}
</script>