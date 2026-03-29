const app = getApp()

Page({
  data: {
    isLoggedIn: false,
    phoneDisplay: '',
    historyCount: 0
  },

  onShow() {
    this._refreshLoginStatus()
    this._loadHistoryCount()
  },

  _refreshLoginStatus() {
    const globalData = app.globalData
    const phone = globalData.phone || wx.getStorageSync('phone')
    const openid = globalData.openid || wx.getStorageSync('openid')
    if (phone && openid) {
      const masked = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
      this.setData({ isLoggedIn: true, phoneDisplay: masked })
    } else {
      this.setData({ isLoggedIn: false, phoneDisplay: '' })
    }
  },

  _loadHistoryCount() {
    const history = wx.getStorageSync('local_history') || []
    this.setData({ historyCount: history.length })
  },

  startAssessment() {
    // 检查是否有草稿
    const draft = wx.getStorageSync('draft_assessment')
    if (draft && draft.currentStep > 0) {
      wx.showModal({
        title: '发现未完成的测评',
        content: '是否继续上次未完成的测评？',
        confirmText: '继续',
        cancelText: '重新开始',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/questionnaire/index?resume=1' })
          } else {
            wx.removeStorageSync('draft_assessment')
            wx.navigateTo({ url: '/pages/questionnaire/index' })
          }
        }
      })
    } else {
      wx.navigateTo({ url: '/pages/questionnaire/index' })
    }
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index' })
  },

  goAbout() {
    wx.navigateTo({ url: '/pages/about/index' })
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/auth/auth' })
  }
})
