/**
 * CloudBase API 封装
 * 统一管理所有云函数调用
 */

const cloudService = {
  /**
   * 手机号登录
   */
  loginWithPhone(code) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'loginWithPhone',
        data: { code },
        success: res => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error((res.result && res.result.error) || '登录失败'))
          }
        },
        fail: err => reject(err)
      })
    })
  },

  /**
   * 保存评估结果
   */
  saveAssessment(data) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'saveAssessment',
        data,
        success: res => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error((res.result && res.result.error) || '保存失败'))
          }
        },
        fail: err => reject(err)
      })
    })
  },

  /**
   * 获取历史评估列表
   */
  listAssessments(page = 1, pageSize = 20) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'listAssessments',
        data: { page, pageSize },
        success: res => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error((res.result && res.result.error) || '获取失败'))
          }
        },
        fail: err => reject(err)
      })
    })
  },

  /**
   * 获取单次评估详情
   */
  getAssessmentDetail(id) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'getAssessmentDetail',
        data: { id },
        success: res => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error((res.result && res.result.error) || '获取失败'))
          }
        },
        fail: err => reject(err)
      })
    })
  },

  /**
   * 删除用户数据
   */
  deleteMyData() {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'deleteMyData',
        data: {},
        success: res => {
          if (res.result && res.result.success) {
            resolve(res.result)
          } else {
            reject(new Error((res.result && res.result.error) || '删除失败'))
          }
        },
        fail: err => reject(err)
      })
    })
  }
}

module.exports = cloudService
