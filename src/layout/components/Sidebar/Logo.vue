<!-- 侧边栏logo -->

<template>
  <div class="sidebar-logo-container" :class="{ 'collapse': collapse }">
    <transition name="sidebarLogoFade">
      <router-link key="expand" class="sidebar-logo-link" to="/">
        <!-- 使用与登录页相同的 SVG 作为品牌 Logo（currentColor 著色） -->
        <svg class="sidebar-logo-svg" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
          <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
            <path d="M28 6 L44 14 L44 30 L28 38 L12 30 L12 14 Z"/>
            <path d="M28 6 L28 22 L12 30" opacity=".45"/>
            <path d="M28 6 L28 22 L44 30" opacity=".45"/>
            <path d="M12 14 L28 22 L44 14" opacity=".6"/>
            <ellipse cx="28" cy="28" rx="18" ry="9" opacity=".35"/>
            <ellipse cx="28" cy="28" rx="12" ry="6" opacity=".25" transform="rotate(-20 28 28)"/>
            <ellipse cx="28" cy="28" rx="12" ry="6" opacity=".25" transform="rotate(20 28 28)"/>
          </g>
          <g fill="currentColor">
            <circle cx="28" cy="22" r="2"/>
            <circle cx="18" cy="27" r="1.5"/>
            <circle cx="38" cy="29" r="1.5"/>
          </g>
        </svg>
        <h1 style="font-size:20px;font-weight:600;" class="sidebar-title">{{ title }}</h1>
      </router-link>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: { type: Boolean, required: true }
  },
  data() {
    return { title: '物业管理系统' }
  }
}
</script>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active { transition: opacity 1.5s; }
.sidebarLogoFade-enter, .sidebarLogoFade-leave-to { opacity: 0; }

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: var(--color-bg-elevated);
  border-bottom: 1px solid var(--color-border-primary);
  backdrop-filter: saturate(140%) blur(8px);
  -webkit-backdrop-filter: saturate(140%) blur(8px);
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    /* 与登录页一致的 SVG 图标，随主题色变化 */
    & .sidebar-logo-svg {
      width: 32px;
      height: 32px;
      margin-right: 8px;
      vertical-align: middle;
      display: inline-block;
      color: var(--color-primary);
    }

    & .sidebar-title {
      display: inline-block;
      margin: 0;
      /* 五彩渐变文字 */
      color: transparent;
      background: linear-gradient(90deg, #ff4d4f, #faad14, #52c41a, #13c2c2, #1890ff, #722ed1);
      -webkit-background-clip: text;
      background-clip: text;
      font-weight: 600;
      line-height: 50px;
      font-size: 16px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
      letter-spacing: .5px;
    }
  }

  &.collapse { .sidebar-logo-svg { margin-right: 0; } }
}
</style>
