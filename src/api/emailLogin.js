import http from '@/utils/http'

// 发送邮箱验证码
export async function sendVerificationCodeApi(email) {
  return await http.post(`/api/email/sendVerificationCode?email=${email}`)
}

// 邮箱验证码登录
export async function emailLoginApi(parm) {
  return await http.post('/api/email/loginByEmail', parm)
}