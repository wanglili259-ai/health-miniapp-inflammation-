const cloudService = require('../../utils/cloudService')

Page({
  data: {
    redFlagList: [
      '持续不明原因发热（超过3天）',
      '便血或黑便',
      '胸痛或胸闷持续不缓解',
      '呼吸困难',
      '短期内明显消瘦（1个月内体重下降超过5%）',
      '持续严重情绪低落、有自伤或自杀想法（请立即拨打心理援助热线）',
      '严重头痛伴颈项强直或意识改变'
    ]
  },

  confirmDeleteData() {
    const openid = wx.getStorageSync('openid')
    if (!openid) {
      wx.showModal({
        title: '清除本地数据',
        content: '将清除本设备上的所有测评记录，此操作不可恢复。',
        confirmText: '确认清除',
        confirmColor: '#E5534B',
        success: res => {
          if (res.confirm) {
            wx.removeStorageSync('local_history')
            wx.removeStorageSync('draft_assessment')
            wx.showToast({ title: '本地数据已清除', icon: 'success' })
          }
        }
      })
      return
    }

    wx.showModal({
      title: '删除所有数据',
      content: '将永久删除您在云端和本地的所有测评数据，此操作不可恢复！',
      confirmText: '永久删除',
      confirmColor: '#E5534B',
      success: res => {
        if (res.confirm) this._deleteData()
      }
    })
  },

  async _deleteData() {
    wx.showLoading({ title: '删除中...' })
    try {
      await cloudService.deleteMyData()
      wx.removeStorageSync('local_history')
      wx.removeStorageSync('draft_assessment')
      wx.removeStorageSync('openid')
      wx.removeStorageSync('phone')
      const app = getApp()
      app.globalData.openid = null
      app.globalData.phone = null
      wx.hideLoading()
      wx.showToast({ title: '数据已删除', icon: 'success' })
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: e.message || '删除失败', icon: 'none' })
    }
  }
})
