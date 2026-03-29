const app = getApp()
const cloudService = require('../../utils/cloudService')

Page({
  data: {
    loading: false
  },

  async onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '授权已取消', icon: 'none' })
      return
    }

    this.setData({ loading: true })
    wx.showLoading({ title: '登录中...' })

    try {
      const result = await cloudService.loginWithPhone(e.detail.code)
      app.globalData.openid = result.openid
      app.globalData.phone = result.phone
      wx.setStorageSync('openid', result.openid)
      wx.setStorageSync('phone', result.phone)

      wx.hideLoading()
      wx.showToast({ title: '登录成功', icon: 'success' })

      setTimeout(() => {
        wx.navigateBack()
      }, 1200)
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none',
        duration: 2500
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  skipLogin() {
    wx.navigateBack()
  },

  viewPrivacy() {
    wx.navigateTo({ url: '/pages/about/index?tab=privacy' })
  },

  viewTerms() {
    wx.navigateTo({ url: '/pages/about/index?tab=terms' })
  }
})
