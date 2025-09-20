<template>
  <div class="email-login-demo">
    <el-card class="login-card" style="max-width: 400px; margin: 50px auto;">
      <div slot="header" class="clearfix">
        <span>邮箱验证码登录测试</span>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱地址"></el-input>
        </el-form-item>
        
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="loginForm.userType" placeholder="选择用户类型" style="width: 100%">
            <el-option label="业主" value="0"></el-option>
            <el-option label="管理员" value="1"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="验证码" prop="verificationCode">
          <div style="display: flex; gap: 10px;">
            <el-input 
              v-model="loginForm.verificationCode" 
              placeholder="请输入验证码"
              style="flex: 1"
            ></el-input>
            <el-button 
              type="primary" 
              @click="sendCode" 
              :disabled="countdown > 0"
              :loading="sendLoading"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitLogin" 
            :loading="loginLoading"
            style="width: 100%"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { sendVerificationCodeApi, emailLoginApi } from '@/api/emailLogin'

export default {
  name: 'EmailLoginDemo',
  data() {
    return {
      loginForm: {
        email: '',
        userType: '',
        verificationCode: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        userType: [
          { required: true, message: '请选择用户类型', trigger: 'change' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      },
      countdown: 0,
      sendLoading: false,
      loginLoading: false
    }
  },
  methods: {
    // 发送验证码
    async sendCode() {
      if (!this.loginForm.email) {
        this.$message.error('请先输入邮箱地址')
        return
      }
      
      this.sendLoading = true
      try {
        const res = await sendVerificationCodeApi(this.loginForm.email)
        if (res && res.code == 200) {
          this.$message.success('验证码发送成功，请查收邮件！')
          this.startCountdown()
        } else {
          this.$message.error(res.msg || '验证码发送失败')
        }
      } catch (error) {
        this.$message.error('验证码发送失败：' + error.message)
      } finally {
        this.sendLoading = false
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 提交登录
    async submitLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loginLoading = true
          try {
            const res = await emailLoginApi(this.loginForm)
            if (res && res.code == 200) {
              this.$message.success('登录成功！')
              console.log('登录结果：', res.data)
              // 这里可以存储token并跳转页面
              // localStorage.setItem('token', res.data.token)
              // this.$router.push('/dashboard')
            } else {
              this.$message.error(res.msg || '登录失败')
            }
          } catch (error) {
            this.$message.error('登录失败：' + error.message)
          } finally {
            this.loginLoading = false
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.email-login-demo {
  padding: 20px;
}
.login-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>