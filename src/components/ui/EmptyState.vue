<template>
  <div class="empty-state">
    <img v-if="illustration" class="illustration" :src="illustration" alt="" />
    <p class="title">{{ title }}</p>
    <p v-if="description" class="desc">{{ description }}</p>
    <div class="actions"><slot /></div>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    title: { type: String, default: '暂无数据' },
    description: { type: String, default: '' },
    illustration: { type: String, default: '' }
  }
}
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  color: #6b7280;
  padding: 24px 0;
}
.illustration { width: 160px; margin: 0 auto 8px; display: block; opacity: .9; }
.title { font-weight: 600; color: #374151; }
.desc { margin: 4px 0 10px; font-size: 13px; }
.actions { margin-top: 8px; }
</style>

