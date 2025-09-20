<template>
  <el-card class="table-card">
    <div slot="header" class="card-header">
      <div class="card-titles">
        <span class="card-title">{{ title }}</span>
        <span class="card-subtitle">共 {{ total }} 条记录</span>
      </div>
      <div class="table-toolbar">
        <el-tooltip content="刷新" placement="top">
          <el-button circle size="mini" icon="el-icon-refresh" @click="$emit('refresh')"></el-button>
        </el-tooltip>
        <el-tooltip content="清空筛选" placement="top">
          <el-button circle size="mini" icon="el-icon-close" @click="$emit('reset')"></el-button>
        </el-tooltip>
        <el-tooltip v-if="showExport" content="导出CSV" placement="top">
          <el-button circle size="mini" icon="el-icon-download" class="is-ghost" @click="$emit('export')"></el-button>
        </el-tooltip>
        <slot name="toolbar-extra"></slot>
      </div>
    </div>
    <div class="table-area">
      <div class="table-skeleton" v-if="showSkeleton">
        <div class="skeleton-row" v-for="n in skeletonRows" :key="n"></div>
      </div>
      <slot></slot>
    </div>
  </el-card>
</template>

<script>
export default {
  name: 'TableCard',
  props: {
    title: { type: String, default: '' },
    total: { type: Number, default: 0 },
    showExport: { type: Boolean, default: true },
    showSkeleton: { type: Boolean, default: false },
    skeletonRows: { type: Number, default: 6 },
  },
};
</script>

<style lang="scss" scoped>
/* 该组件复用项目中既有样式类：table-card、card-header、card-titles、table-toolbar、table-area、table-skeleton、skeleton-row、empty-state 等。
   如需扩展自定义样式，可在全局样式中统一维护，避免在组件内重复定义。 */
</style>