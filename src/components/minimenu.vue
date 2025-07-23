<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm px-5 mt-3">
    <a class="navbar-brand" href="#">

    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNavDropdown">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="#">Option1</a>
        </li>

        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
            Option2
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">submeun1</a></li>
            <li><a class="dropdown-item" href="#">submenu2</a></li>
            <li><a class="dropdown-item" href="#">submenu3</a></li>
          </ul>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="#">option3</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="#">option4</a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>

</script>

<style scoped>

.navbar-nav .nav-link {
  font-weight: 500;
}
</style>
