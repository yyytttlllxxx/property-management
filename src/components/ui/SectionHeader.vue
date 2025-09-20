<template>
  <div class="section-header">
    <h2 class="section-title">{{ title }}</h2>
    <div class="section-actions">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: { title: { type: String, default: '' } }
}
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 0 14px;
}
.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  position: relative;
  padding-left: 10px;
}
.section-title:before {
  content: '';
  position: absolute;
  left: 0; top: 4px;
  width: 4px; height: 14px;
  border-radius: 2px;
  background: #409eff;
}
</style>

