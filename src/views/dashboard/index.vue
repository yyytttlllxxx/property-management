<template>
  <page-container title="仪表盘" sub-title="系统概览与最新动态">
    <el-row :gutter="16">
      <el-col :md="12" :sm="24" :xs="24">
        <el-card shadow="always">
          <section-header title="最新公告" />
          <skeleton-list v-if="loading" :count="3" />
          <template v-else>
            <div class="notice-title">{{ new_notices.title }}</div>
            <div class="notice-content">{{ new_notices.noticeContent }}</div>
            <div class="notice-meta">{{ new_notices.createTime }}</div>
          </template>
        </el-card>
      </el-col>
      <el-col :md="12" :sm="24" :xs="24">
        <el-card shadow="always">
          <section-header title="欢迎来到物业管理系统" />
          <div class="intro">
            <p>欢迎使用我们的物业管理系统，我们致力于为您提供便捷、高效的物业管理服务。无论您是业主、租户还是物业管理员，我们都将竭诚为您服务，为您的生活带来更多便利。</p>
            <section-header title="服务提供" />
            <ul class="features">
              <li>物业信息管理：管理小区信息、楼栋信息、房屋信息等。</li>
              <li>维修管理：记录和处理物业维修请求，确保问题及时解决。</li>
              <li>反馈管理：收集居民意见和建议，持续改进服务质量。</li>
              <li>费用管理：管理物业费、停车费等，提供费用明细和缴费记录。</li>
            </ul>
            <section-header title="我们的使命" />
            <p>我们的使命是确保您安心居住，我们的激情是为您创造舒适生活。在您的每一个需求后面，都有我们专业的团队为您守护。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </page-container>
</template>

<script>
import { mapGetters } from 'vuex'
import { getOneApi } from '@/api/notice'
import PageContainer from '@/components/ui/PageContainer.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import SkeletonList from '@/components/ui/SkeletonList.vue'

export default {
  name: 'Dashboard',
  components: { PageContainer, SectionHeader, SkeletonList },
  data() {
    return {
      loading: true,
      new_notices: {},
      parms: { title: '', content: '', time: '' }
    }
  },
  computed: { ...mapGetters(['name']) },
  async created() {
    try {
      const res = await getOneApi(this.parms)
      if (res && res.code === 200) {
        this.new_notices = res.data || {}
      }
    } finally {
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
/* ==== 仪表盘科技风增强样式 - 方案B ====  */

/* 基础布局优化 */
::v-deep .page-container {
  background: linear-gradient(135deg, 
    rgba(16, 46, 80, 0.05) 0%, 
    rgba(13, 71, 161, 0.08) 30%,
    rgba(26, 35, 126, 0.06) 70%,
    rgba(63, 81, 181, 0.04) 100%);
  min-height: calc(100vh - 84px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.08) 0%, transparent 50%);
    pointer-events: none;
  }
}

/* 网格背景增强 */
::v-deep .el-row {
  position: relative;
  z-index: 1;
}

/* 卡片霓虹科技风样式 */
::v-deep .el-card {
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.92) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(59, 130, 246, 0.15),
    0 1px 3px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 霓虹边框效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: inherit;
    padding: 2px;
    background: linear-gradient(45deg, 
      rgba(59, 130, 246, 0.6) 0%,
      rgba(139, 92, 246, 0.5) 25%,
      rgba(16, 185, 129, 0.4) 50%,
      rgba(245, 158, 11, 0.5) 75%,
      rgba(239, 68, 68, 0.6) 100%);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  /* 悬停效果 */
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 
      0 20px 60px rgba(59, 130, 246, 0.25),
      0 8px 16px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    border-color: rgba(59, 130, 246, 0.4);
    
    &::before {
      opacity: 1;
    }
    
    .notice-title, .el-card__header {
      color: var(--el-color-primary);
      text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    }
  }
  
  /* 卡片头部样式 */
  .el-card__header {
    background: linear-gradient(135deg,
      rgba(59, 130, 246, 0.1) 0%,
      rgba(139, 92, 246, 0.08) 100%);
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 20px 20px 0 0;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 20%;
      right: 20%;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(59, 130, 246, 0.6) 50%, 
        transparent 100%);
      border-radius: 2px;
    }
  }
  
  /* 卡片内容区域 */
  .el-card__body {
    position: relative;
    background: rgba(255, 255, 255, 0.02);
  }
}

/* 暗色主题适配 */
[data-theme="dark"] {
  ::v-deep .el-card {
    background: linear-gradient(145deg, 
      rgba(30, 41, 59, 0.95) 0%,
      rgba(15, 23, 42, 0.92) 100%);
    border-color: rgba(59, 130, 246, 0.3);
    
    .el-card__header {
      background: linear-gradient(135deg,
        rgba(59, 130, 246, 0.15) 0%,
        rgba(139, 92, 246, 0.12) 100%);
      border-bottom-color: rgba(59, 130, 246, 0.3);
    }
    
    .notice-title {
      color: #e2e8f0;
    }
    
    .notice-content, .intro {
      color: #cbd5e1;
    }
    
    .notice-meta {
      color: #64748b;
    }
  }
}

/* 高对比度主题适配 */
[data-theme="high-contrast"] {
  ::v-deep .el-card {
    background: rgba(255, 255, 255, 0.98);
    border: 2px solid #000;
    
    &:hover {
      border-color: #0066cc;
      box-shadow: 0 0 20px rgba(0, 102, 204, 0.3);
    }
  }
}

/* 具体内容样式增强 */
.notice-title { 
  font-size: 18px; 
  font-weight: 700; 
  color: #111827; 
  margin-bottom: 12px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
}

.notice-content { 
  color: #4b5563; 
  line-height: 1.8; 
  font-size: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.notice-meta { 
  color: #6b7280; 
  font-size: 13px; 
  margin-top: 12px;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 20px;
  display: inline-block;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.intro { 
  color: #4b5563; 
  line-height: 1.8; 
  font-size: 15px;
  
  p {
    margin-bottom: 16px;
    text-align: justify;
  }
}

.features { 
  padding-left: 20px; 
  
  li { 
    list-style: none;
    margin: 10px 0; 
    position: relative;
    padding-left: 20px;
    
    &::before {
      content: '▶';
      position: absolute;
      left: 0;
      color: var(--el-color-primary);
      font-size: 12px;
      top: 2px;
    }
  }
}

/* SectionHeader 组件增强 */
::v-deep .section-header {
  margin-bottom: 16px;
  
  .title {
    background: linear-gradient(135deg, 
      var(--el-color-primary) 0%, 
      var(--el-color-success) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    font-size: 16px;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 40px;
      height: 2px;
      background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-success));
      border-radius: 2px;
    }
  }
}

/* 加载骨架屏增强 */
::v-deep .skeleton-list {
  .skeleton-item {
    background: linear-gradient(90deg, 
      rgba(59, 130, 246, 0.1) 25%, 
      rgba(139, 92, 246, 0.15) 50%, 
      rgba(59, 130, 246, 0.1) 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    border-radius: 8px;
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 响应式优化 */
@media (max-width: 768px) {
  ::v-deep .el-card {
    margin-bottom: 16px;
    border-radius: 16px;
    
    &:hover {
      transform: translateY(-4px) scale(1.01);
    }
  }
  
  .notice-title, .intro {
    font-size: 14px;
  }
  
  .features li {
    font-size: 13px;
  }
}
</style>
