import http from '@/utils/http'

// 创建水费支付宝支付订单
export async function createWaterAlipayOrderApi(waterId) {
  return await http.post(`/api/feeWaterNew/alipay/${waterId}`, null)
}

// 创建电费支付宝支付订单
export async function createPowerAlipayOrderApi(powerId) {
  return await http.post(`/api/feePowerNew/alipay/${powerId}`, null)
}

// 创建停车费支付宝支付订单
export async function createParkAlipayOrderApi(parkFeeId) {
  return await http.post(`/api/feeParkNew/alipay/${parkFeeId}`, null)
}

// 模拟支付成功（仅用于测试）
export async function simulatePaySuccessApi(outTradeNo) {
  return await http.post(`/api/pay/simulate-success?outTradeNo=${outTradeNo}`, null)
}

// 支付宝支付结果查询（可选）
export async function queryAlipayResultApi(outTradeNo) {
  return await http.get(`/api/pay/query/${outTradeNo}`)
}