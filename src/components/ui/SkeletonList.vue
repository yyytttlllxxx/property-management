<template>
  <div class="skeleton-list">
    <div v-for="n in count" :key="n" class="skeleton-item">
      <div class="avatar" />
      <div class="lines">
        <div class="line short" />
        <div class="line" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonList',
  props: { count: { type: Number, default: 5 } }
}
</script>

<style lang="scss" scoped>
@keyframes shine { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
.skeleton-item { display:flex; gap:12px; padding:8px 0; }
.avatar, .line {
  background: linear-gradient(90deg,#eee 25%,#f5f5f5 37%,#eee 63%);
  background-size: 400px 100px; animation: shine 1.2s infinite linear;
}
.avatar { width: 36px; height: 36px; border-radius: 50%; }
.lines { flex:1; }
.line { height: 12px; border-radius: 6px; margin: 6px 0; }
.line.short { width: 40%; }
</style>

