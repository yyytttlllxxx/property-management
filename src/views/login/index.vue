<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <div class="logo" aria-hidden="true">
          <!-- 抽象“空间/立体结构+轨道”SVG，保持科技感与主题适配（currentColor） -->
          <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="">
            <g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">
              <!-- 立方体线框（空间体） -->
              <path d="M28 6 L44 14 L44 30 L28 38 L12 30 L12 14 Z"/>
              <path d="M28 6 L28 22 L12 30" opacity=".45"/>
              <path d="M28 6 L28 22 L44 30" opacity=".45"/>
              <path d="M12 14 L28 22 L44 14" opacity=".6"/>
              <!-- 环绕轨道（空间轨迹） -->
              <ellipse cx="28" cy="28" rx="18" ry="9" opacity=".35"/>
              <ellipse cx="28" cy="28" rx="12" ry="6" opacity=".25" transform="rotate(-20 28 28)"/>
              <ellipse cx="28" cy="28" rx="12" ry="6" opacity=".25" transform="rotate(20 28 28)"/>
            </g>
            <!-- 节点（空间锚点） -->
            <g fill="currentColor">
              <circle cx="28" cy="22" r="2"/>
              <circle cx="18" cy="27" r="1.5"/>
              <circle cx="38" cy="29" r="1.5"/>
            </g>
          </svg>
        </div>
        <div class="title">物业管理系统</div>
        <div class="subtitle">Property Management System</div>
      </div>

      <el-form :model="loginForm" ref="loginForm" :rules="rules" class="login-form" label-position="top">
        <!-- 登录方式切换 -->
        <el-form-item>
          <el-radio-group v-model="loginType" class="login-type-toggle">
            <el-radio label="password" class="login-type-item">密码登录</el-radio>
            <el-radio label="email" class="login-type-item">邮箱验证码</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 密码登录表单 -->
        <template v-if="loginType === 'password'">
          <el-form-item prop="username" label="用户名">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              autocomplete="username"
              @keyup.enter.native="onSubmit"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
              :type="showPassword ? 'text' : 'password'"
              v-model="loginForm.password"
              placeholder="请输入密码"
              autocomplete="current-password"
              @keyup.enter.native="onSubmit"
            >
              <template slot="suffix">
                <i :class="['el-input__icon', showPassword ? 'el-icon-view' : 'el-icon-view']" @click="togglePassword" title="显示/隐藏密码" />
              </template>
            </el-input>
          </el-form-item>
        </template>

        <!-- 邮箱验证码登录表单 -->
        <template v-else>
          <el-form-item prop="email" label="邮箱地址">
            <el-input
              v-model="emailForm.email"
              placeholder="请输入邮箱地址"
              type="email"
              @keyup.enter.native="onEmailSubmit"
            ></el-input>
          </el-form-item>

          <el-form-item prop="verificationCode" label="验证码">
            <div style="display: flex; gap: 10px;">
              <el-input 
                v-model="emailForm.verificationCode" 
                placeholder="请输入验证码"
                style="flex: 1"
                @keyup.enter.native="onEmailSubmit"
              ></el-input>
              <el-button 
                type="primary" 
                @click="sendVerificationCode" 
                :disabled="countdown > 0 || !emailForm.email"
                :loading="sendCodeLoading"
                style="min-width: 110px;"
              >
                {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </template>

        <el-form-item prop="userType" label="用户类型">
          <el-radio-group v-model="loginForm.userType" class="segmented">
            <el-radio :label="0" class="segmented-item">业主</el-radio>
            <el-radio :label="1" class="segmented-item">管理员</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-button
          type="primary"
          class="submit-button"
          :loading="loading"
          @click="loginType === 'password' ? onSubmit() : onEmailSubmit()"
        >{{ loginType === 'password' ? '登 录' : '验证码登录' }}</el-button>

        <div class="tips">
          欢迎使用小区物业管理系统，您的满意是我们最大的动力！
        </div>
        <div class="tips">
          该系统一切所有权归LCX所有
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { sendVerificationCodeApi, emailLoginApi } from '@/api/emailLogin'
import { setToken, setUserId } from '@/utils/auth'

export default {
  data() {
    return {
      // 登录方式
      loginType: 'password', // 'password' | 'email'
      
      //登录表单绑定数据源（字段保持不变）
      loginForm: {
        username: "",
        password: "",
        userType: "", // 0：业主  1：管理员
      },
      
      // 邮箱登录表单
      emailForm: {
        email: '',
        verificationCode: '',
      },
      
      // UI 状态
      loading: false,
      showPassword: false,
      sendCodeLoading: false,
      countdown: 0,
      
      //表单验证规则（保持原有触发与文案）
      rules: {
        username: [
          { trigger: "change", required: true, message: "请输入用户名" },
        ],
        password: [
          { trigger: "change", required: true, message: "请输入密码" },
        ],
        email: [
          { trigger: "change", required: true, message: "请输入邮箱地址" },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        verificationCode: [
          { trigger: "change", required: true, message: "请输入验证码" },
        ],
        userType: [
          { trigger: "change", required: true, message: "请选择用户类型" },
        ],
      },
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    
    // 发送验证码
    async sendVerificationCode() {
      if (!this.emailForm.email) {
        this.$message.error('请先输入邮箱地址')
        return
      }
      
      this.sendCodeLoading = true
      try {
        const res = await sendVerificationCodeApi(this.emailForm.email)
        console.log('验证码发送响应:', res) // 调试日志
        
        // 更精确的状态码判断
        if (res && (res.code === 200 || res.code == 200)) {
          this.$message.success('验证码发送成功，请查收邮件！')
          this.startCountdown()
        } else {
          console.log('验证码发送失败，状态码:', res ? res.code : 'undefined')
          this.$message.error((res && res.msg) || '验证码发送失败')
        }
      } catch (error) {
        console.log('验证码发送异常:', error) // 调试日志
        // 检查是否是网络错误或服务器错误
        if (error.response) {
          this.$message.error('服务器返回错误：' + (error.response.data.msg || error.response.statusText))
        } else if (error.request) {
          this.$message.error('网络连接失败，请检查网络')
        } else {
          this.$message.error('验证码发送失败：' + error.message)
        }
      } finally {
        this.sendCodeLoading = false
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 30
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 邮箱验证码登录
    async onEmailSubmit() {
      if (!this.emailForm.email || !this.emailForm.verificationCode || this.loginForm.userType === '') {
        this.$message.error('请填写完整信息')
        return
      }
      
      this.loading = true
      try {
        const loginData = {
          email: this.emailForm.email,
          verificationCode: this.emailForm.verificationCode,
          userType: this.loginForm.userType.toString()
        }
        
        console.log('邮箱登录请求数据:', loginData) // 调试日志
        const res = await emailLoginApi(loginData)
        console.log('邮箱登录响应:', res) // 调试日志
        
        if (res && (res.code === 200 || res.code == 200)) {
          this.$message.success('登录成功！')
          
          // 按照系统标准流程处理登录成功
          if (res.data && res.data.token) {
            // 1. 更新 Vuex store 状态
            this.$store.commit('user/SET_TOKEN', res.data.token)
            
            // 2. 使用系统标准方式存储到 cookie
            setToken(res.data.token)
            setUserId(res.data.userId)
            
            // 3. 获取用户信息
            this.$store.dispatch('user/getInfo').then(() => {
              // 4. 跳转到仪表盘页面
              this.$router.push({ path: '/dashboard' })
            }).catch(() => {
              // 如果获取用户信息失败，仍然跳转，但可能权限有问题
              this.$router.push({ path: '/dashboard' })
            })
          }
        } else {
          console.log('邮箱登录失败，状态码:', res ? res.code : 'undefined')
          this.$message.error((res && res.msg) || '登录失败')
        }
      } catch (error) {
        console.log('邮箱登录异常:', error) // 调试日志
        if (error.response) {
          this.$message.error('服务器返回错误：' + (error.response.data.msg || error.response.statusText))
        } else if (error.request) {
          this.$message.error('网络连接失败，请检查网络')
        } else {
          this.$message.error('登录失败：' + error.message)
        }
      } finally {
        this.loading = false
      }
    },
    
    //登录提交事件（逻辑保持不变）
    onSubmit() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("user/login", this.loginForm)
            .then(() => {
              this.$router.push({ path: this.redirect || "/" });
              this.loading = false;
            })
            .catch(() => {
              this.loading = false;
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 更明显的冷色科技氛围：加强冷色光斑 + 低对比科技网格 */
  background:
    radial-gradient(1200px 600px at 12% 18%, rgba(80,140,255,0.32), transparent 60%),
    radial-gradient(900px 520px at 88% 80%, rgba(0,220,255,0.28), transparent 62%),
    radial-gradient(640px 360px at 50% 0%, rgba(0,160,255,0.22), transparent 65%),
    /* 纵横网格（低对比，增强科技感且不干扰可读性） */
    repeating-linear-gradient(0deg, rgba(120,200,255,0.08) 0, rgba(120,200,255,0.08) 1px, transparent 1px, transparent 24px),
    repeating-linear-gradient(90deg, rgba(120,200,255,0.06) 0, rgba(120,200,255,0.06) 1px, transparent 1px, transparent 24px),
    /* 底色渐变（冷色系） */
    linear-gradient(135deg, #e9f0ff 0%, #eaf3ff 40%, #eef9ff 100%);
}

.login-card {
  width: 460px;
  padding: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  /* 毛玻璃：提高通透与冷色阴影，整体更显质感 */
  background: linear-gradient(to bottom right, rgba(255,255,255,0.78), rgba(255,255,255,0.60));
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  backdrop-filter: blur(16px) saturate(160%);
  color: var(--color-text-primary);
  box-shadow: 0 12px 36px rgba(15, 40, 80, 0.18), 0 8px 18px rgba(15, 40, 80, 0.12);
  border: 1px solid rgba(255,255,255,0.55);
  position: relative;
  border-top: 3px solid var(--color-primary);
}
/* 冷色辉光：卡片外沿淡淡的蓝青色光晕，提升聚焦度 */
.login-card::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background:
    radial-gradient(120% 80% at 50% -20%, rgba(64,160,255,0.35), transparent 60%),
    radial-gradient(80% 60% at 100% 50%, rgba(0,228,255,0.25), transparent 60%),
    radial-gradient(80% 60% at 0% 50%, rgba(0,255,199,0.18), transparent 60%);
  filter: blur(22px);
  z-index: -1;
  pointer-events: none;
}

.brand {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  .logo { width: 56px; height: 56px; margin: 0 auto var(--spacing-lg); color: var(--color-primary); transition: transform var(--duration-normal) var(--easing-ease); }
  .logo:hover { transform: translateY(-2px); }
  .title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); letter-spacing: 2px; color: var(--color-text-primary); }
  .subtitle { margin-top: var(--spacing-xs); font-size: var(--font-size-sm); color: var(--color-text-tertiary); }
}

.login-form { :deep(.el-form-item) { margin-bottom: var(--spacing-lg); } :deep(.el-form-item__label) { color: var(--color-text-secondary); padding-bottom: 4px; } }

:deep(.el-input__inner) { height: 40px; background-color: var(--color-bg-primary); color: var(--color-text-primary); border-color: var(--color-border-primary); &:focus { border-color: var(--color-border-focus); box-shadow: var(--shadow-focus); } }

.segmented { display: inline-flex; padding: 4px; background-color: rgba(0,0,0,0.04); border-radius: var(--radius-full); border: 1px solid var(--color-border-primary); gap: 4px; }
.segmented-item { :deep(.el-radio__input) { display: none; } :deep(.el-radio__label) { display: inline-flex; align-items: center; justify-content: center; min-width: 96px; height: 34px; padding: 0 16px; border-radius: var(--radius-full); color: var(--color-text-secondary); transition: all var(--duration-normal) var(--easing-ease); } &.is-checked :deep(.el-radio__label) { background-color: var(--color-primary); color: var(--color-text-inverse); box-shadow: 0 4px 12px rgba(0,0,0,0.06); } &:hover :deep(.el-radio__label) { color: var(--color-text-primary); } }

.login-type-toggle { display: inline-flex; padding: 4px; background-color: rgba(0,0,0,0.04); border-radius: var(--radius-full); border: 1px solid var(--color-border-primary); gap: 4px; width: 100%; margin-bottom: 16px; }
.login-type-item { flex: 1; :deep(.el-radio__input) { display: none; } :deep(.el-radio__label) { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 36px; padding: 0 16px; border-radius: var(--radius-full); color: var(--color-text-secondary); transition: all var(--duration-normal) var(--easing-ease); font-weight: 500; } &.is-checked :deep(.el-radio__label) { background-color: var(--color-primary); color: var(--color-text-inverse); box-shadow: 0 4px 12px rgba(0,0,0,0.06); } &:hover :deep(.el-radio__label) { color: var(--color-text-primary); } }

.submit-button { width: 100%; height: 44px; margin-top: var(--spacing-md); border-radius: var(--radius-md); font-weight: var(--font-weight-medium); }
.tips { margin-top: var(--spacing-md); font-size: var(--font-size-xs); color: var(--color-text-tertiary); text-align: center; }

/* 暗色主题：更冷、更深的底色与光斑，并保留低对比网格 */
:global([data-theme="dark"]) .login-page { background:
  radial-gradient(1100px 560px at 12% 18%, rgba(80,140,255,0.22), transparent 60%),
  radial-gradient(820px 460px at 88% 80%, rgba(0,220,255,0.24), transparent 62%),
  radial-gradient(600px 340px at 50% 0%, rgba(0,150,255,0.18), transparent 65%),
  repeating-linear-gradient(0deg, rgba(120,200,255,0.06) 0, rgba(120,200,255,0.06) 1px, transparent 1px, transparent 24px),
  repeating-linear-gradient(90deg, rgba(120,200,255,0.05) 0, rgba(120,200,255,0.05) 1px, transparent 1px, transparent 24px),
  linear-gradient(135deg, #0a0f1e 0%, #0b152a 48%, #0a1d38 100%);
}
:global([data-theme="dark"]) .login-card { background: linear-gradient(to bottom right, rgba(19,24,36,0.74), rgba(19,24,36,0.52)); border-color: rgba(255,255,255,0.10); box-shadow: 0 18px 40px rgba(0,0,0,0.50), 0 8px 16px rgba(0,0,0,0.30); }
:global([data-theme="dark"]) .login-card::before {
  background:
    radial-gradient(120% 80% at 50% -20%, rgba(64,160,255,0.45), transparent 60%),
    radial-gradient(80% 60% at 100% 50%, rgba(0,228,255,0.32), transparent 60%),
    radial-gradient(80% 60% at 0% 50%, rgba(0,255,199,0.24), transparent 60%);
}

/* 高对比主题：禁用辉光以保证可读性 */
:global([data-theme="high-contrast"]) .login-card::before { display: none; }
:global([data-theme="high-contrast"]) .brand .logo { transition: none; }
:global([data-theme="high-contrast"]) .brand .logo:hover { transform: none; }

/* 小屏/移动端自适应与品牌区比例调整 */
@media (max-width: 600px) {
  .login-card { width: min(92vw, 380px); padding: var(--spacing-xl); border-radius: var(--radius-lg); }
  .brand { margin-bottom: var(--spacing-xl); }
  .brand .title { font-size: var(--font-size-xl); letter-spacing: 1px; }
  .brand .logo { width: 48px; height: 48px; margin-bottom: var(--spacing-md); }
  .segmented-item :deep(.el-radio__label) { min-width: 82px; height: 32px; padding: 0 12px; }
  .submit-button { height: 40px; }
}
</style>
