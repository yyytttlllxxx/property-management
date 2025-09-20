import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import locale from 'element-ui/lib/locale/lang/en' // lang i18n
//中文
import locale from 'element-ui/lib/locale/lang/zh-CN'
import '@/styles/theme.scss' // theme css variables
import '@/styles/index.scss' // global css
//清空表单
import resetForm from '@/utils/resetForm'
Vue.prototype.$resetForm = resetForm;
//信息提示框
import myconfirm from '@/utils/myconfirm'
Vue.prototype.$myconfirm = myconfirm;
//对象快速复制
import objCoppy from '@/utils/objCoppy'
Vue.prototype.$objCoppy = objCoppy;
//按钮权限
//按钮权限判断
import hasPermission from '@/permission/index'
Vue.prototype.hasPerm = hasPermission;
import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control
import { initTheme } from '@/utils/theme'
//引入图标库
import '@/assets/icons/iconfont.css'
import TableCard from '@/components/common/TableCard.vue'

// 移除生产环境 mock，避免线上与真实后端冲突并减少开销
// if (process.env.NODE_ENV === 'production') {
//     const { mockXHR } = require('../mock')
//     mockXHR()
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
Vue.component('TableCard', TableCard)
    // 如果想要中文版 element-ui，按如下方式声明
    // Vue.use(ElementUI)

Vue.config.productionTip = false

// 初始化主题（不影响业务逻辑，仅设置 data-theme 和 CSS 变量）
initTheme()

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
})