<template>
  <tr>
    <td class="border px-4 py-2">{{ category.categoryID }}</td>
    <td class="border px-4 py-2">
      <span :style="{ paddingLeft: `${level * 20}px` }" class="inline-block">
        <span v-if="level === 0" class="font-bold text-blue-700">📁</span>
        <span v-else>↳</span>
        {{ category.categoryName }}
      </span>
    </td>
    <td class="border px-4 py-2 text-center">
      <button @click="$emit('edit', category)" class="text-blue-600 hover:underline">Sửa</button>
      <span class="mx-1">|</span>
      <button @click="$emit('delete', category.categoryID)" class="text-red-600 hover:underline">Xóa</button>
    </td>
  </tr>

  <!-- Hiển thị danh mục con nếu có -->
  <template v-if="category.children?.length">
    <CategoryRow
      v-for="child in category.children"
      :key="child.categoryID"
      :category="child"
      :level="level + 1"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
  </template>
</template>

<script setup>
import CategoryRow from './CategoryRow.vue'
const props = defineProps({
  category: Object,
  level: {
    type: Number,
    default: 0,
  },
})
</script>
