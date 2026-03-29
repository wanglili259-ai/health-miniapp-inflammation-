const cloudService = require('../../utils/cloudService')
const { getDimColor } = require('../../utils/scoring')

Page({
  data: {
    loading: true,
    totalScore: 0,
    levelText: '',
    levelColor: '#4CC38A',
    dateStr: '',
    basicInfo: null,
    topFactors: [],
    principles: [],
    actionList: { today: [], thisWeek: [], nextAssess: [] },
    redFlags: []
  },

  onLoad(options) {
    if (options.data) {
      const assessment = JSON.parse(decodeURIComponent(options.data))
      this._render(assessment)
    } else if (options.id && options.source === 'cloud') {
      this._loadCloud(options.id)
    }
  },

  async _loadCloud(id) {
    try {
      const result = await cloudService.getAssessmentDetail(id)
      this._render(result.data)
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  _render(assessment) {
    const {
      totalScore, levelText, levelColor,
      topFactors, suggestions, redFlags, basicInfo, createdAt
    } = assessment

    const enrichedTop = (topFactors || []).map(f => ({
      ...f,
      color: getDimColor(f.score)
    }))

    const dateStr = createdAt
      ? new Date(createdAt).toLocaleString('zh-CN', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        })
      : ''

    this.setData({
      loading: false,
      totalScore: totalScore || 0,
      levelText: levelText || '',
      levelColor: levelColor || '#4CC38A',
      dateStr,
      basicInfo: basicInfo || null,
      topFactors: enrichedTop,
      principles: (suggestions && suggestions.principles) || [],
      actionList: (suggestions && suggestions.actionList) || { today: [], thisWeek: [], nextAssess: [] },
      redFlags: redFlags || []
    })
  }
})
