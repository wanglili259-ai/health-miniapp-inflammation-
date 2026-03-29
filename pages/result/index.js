const cloudService = require('../../utils/cloudService')
const { getDimColor } = require('../../utils/scoring')

Page({
  data: {
    assessment: null,
    totalScore: 0,
    levelText: '',
    levelColor: '#4CC38A',
    levelDesc: '',
    dateStr: '',
    topFactors: [],
    principles: [],
    actionList: { today: [], thisWeek: [], nextAssess: [] },
    detailAdvice: {},
    redFlags: [],
    completeness: 100,
    incomplete: false,
    saving: false,
    saved: false
  },

  onLoad(options) {
    if (options.data) {
      try {
        const assessment = JSON.parse(decodeURIComponent(options.data))
        this._renderAssessment(assessment)
      } catch (e) {
        wx.showToast({ title: '数据解析失败', icon: 'none' })
      }
    } else if (options.id) {
      this._loadFromCloud(options.id)
    }
  },

  _renderAssessment(assessment) {
    const {
      totalScore, level, levelText, levelColor,
      topFactors, dimensionScores,
      suggestions, redFlags, completeness, incomplete,
      createdAt, savedToCloud
    } = assessment

    const levelDesc = {
      low: '您的慢性炎症风险较低，继续保持健康的生活方式。',
      medium: '检测到中等程度的慢性炎症风险信号，建议从生活方式调整入手。',
      high: '检测到较高的慢性炎症风险信号，建议认真执行改善计划并考虑就医检查。'
    }[level] || ''

    const enrichedTopFactors = (topFactors || []).map(f => ({
      ...f,
      color: getDimColor(f.score)
    }))

    const dateStr = createdAt
      ? new Date(createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : ''

    this.setData({
      assessment,
      totalScore: totalScore || 0,
      levelText: levelText || '未知',
      levelColor: levelColor || '#4CC38A',
      levelDesc,
      dateStr,
      topFactors: enrichedTopFactors,
      principles: (suggestions && suggestions.principles) || [],
      actionList: (suggestions && suggestions.actionList) || { today: [], thisWeek: [], nextAssess: [] },
      detailAdvice: (suggestions && suggestions.detailAdvice) || { nutrition: { items: [] } },
      redFlags: redFlags || [],
      completeness: completeness || 100,
      incomplete: !!incomplete,
      saved: !!savedToCloud
    })
  },

  async _loadFromCloud(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const result = await cloudService.getAssessmentDetail(id)
      wx.hideLoading()
      this._renderAssessment(result.data)
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async saveToCloud() {
    const app = getApp()
    if (!app.globalData.openid && !wx.getStorageSync('openid')) {
      wx.showModal({
        title: '需要登录',
        content: '请先登录后才能保存到云端',
        confirmText: '去登录',
        success: res => {
          if (res.confirm) wx.navigateTo({ url: '/pages/auth/auth' })
        }
      })
      return
    }

    this.setData({ saving: true })
    wx.showLoading({ title: '保存中...' })

    try {
      const { assessment } = this.data
      const result = await cloudService.saveAssessment(assessment)

      // 更新本地记录标记
      const history = wx.getStorageSync('local_history') || []
      const idx = history.findIndex(h => h._id === assessment._id)
      if (idx >= 0) {
        history[idx].savedToCloud = true
        history[idx].cloudId = result.id
        wx.setStorageSync('local_history', history)
      }

      wx.hideLoading()
      this.setData({ saving: false, saved: true })
      wx.showToast({ title: '已保存', icon: 'success' })
    } catch (e) {
      wx.hideLoading()
      this.setData({ saving: false })
      wx.showToast({ title: e.message || '保存失败', icon: 'none' })
    }
  },

  retake() {
    wx.redirectTo({ url: '/pages/questionnaire/index' })
  },

  goHome() {
    wx.switchTab ? wx.reLaunch({ url: '/pages/home/home' }) : wx.navigateBack({ delta: 10 })
  }
})
