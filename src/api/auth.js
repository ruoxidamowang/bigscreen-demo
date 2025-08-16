import request from '@/utils/request.js'

// 登录接口
export const login = async (username, password) => {
  try {
    const response = await request({
      url: '/api/auth/login',
      method: 'post',
      data: {
        username,
        password
      }
    })
    return response
  } catch (error) {
    console.error('登录请求失败:', error)
    throw error
  }
}

// 登出接口
export const logout = async () => {
  try {
    const response = await request({
      url: '/api/auth/logout',
      method: 'post'
    })
    return response
  } catch (error) {
    console.error('登出请求失败:', error)
    throw error
  }
}

// 检查登录状态
export const checkAuth = async () => {
  try {
    const response = await request({
      url: '/api/auth/check',
      method: 'get'
    })
    return response
  } catch (error) {
    console.error('检查认证状态失败:', error)
    throw error
  }
}

