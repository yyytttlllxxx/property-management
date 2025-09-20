// 主题管理工具：初始化、获取、设置，并持久化到 localStorage
// 注意：仅涉及 UI 属性，不触及业务逻辑。
const THEME_KEY = 'app-theme'
const VALID_THEMES = ['light', 'dark', 'high-contrast']

export function getTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved && VALID_THEMES.includes(saved)) return saved
  // 根据系统偏好作为默认值
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

export function setTheme(theme) {
  const next = VALID_THEMES.includes(theme) ? theme : 'light'
  const root = document.documentElement
  root.setAttribute('data-theme', next)
  localStorage.setItem(THEME_KEY, next)
}

export function initTheme() {
  // 初始化主题并监听系统主题变化（当未手动选择时）
  const saved = localStorage.getItem(THEME_KEY)
  if (saved && VALID_THEMES.includes(saved)) {
    setTheme(saved)
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
    const theme = prefersDark && prefersDark.matches ? 'dark' : 'light'
    setTheme(theme)
    if (prefersDark && typeof prefersDark.addEventListener === 'function') {
      prefersDark.addEventListener('change', (e) => {
        const manuallySet = localStorage.getItem(THEME_KEY)
        if (!manuallySet) setTheme(e.matches ? 'dark' : 'light')
      })
    }
  }
}