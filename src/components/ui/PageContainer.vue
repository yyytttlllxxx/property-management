<template>
  <div class="page-container">
    <div v-if="hasHeader" class="page-header">
      <div class="page-titles">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subTitle" class="page-subtitle">{{ subTitle }}</p>
      </div>
      <div class="page-extra">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>
    <div class="page-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageContainer',
  props: {
    title: { type: String, default: '' },
    subTitle: { type: String, default: '' },
    extra: { type: String, default: '' }
  },
  computed: {
    hasHeader() {
      return !!(this.title || this.subTitle || this.$slots.extra || this.extra)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px 20px 24px;
  background: var(--page-bg, #f6f7fb);
  min-height: calc(100vh - 100px);
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 8px 4px 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #111827;
}
.page-subtitle {
  margin: 4px 0 0 0;
  color: #6b7280;
  font-size: 13px;
}
.page-content {
  display: block;
}
</style>

