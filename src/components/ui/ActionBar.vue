<template>
  <div class="action-bar">
    <slot />
  </div>
</template>

<script>
export default { name: 'ActionBar' }
</script>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0 12px;
}
</style>

