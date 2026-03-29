const cloudService = require('../../utils/cloudService')
const { getDimColor } = require('../../utils/scoring')

Page({
  data: {
    loading: true,
    list: [],
    hasMore: false,
    hasCloud: false,
    page: 1
  },

  onShow() {
    this._loadHistory()
  },

  async _loadHistory() {
    this.setData({ loading: true })

    const local = (wx.getStorageSync('local_history') || []).map(item => ({
      ...item,
      source: 'local',
      dateStr: this._formatDate(item.createdAt),
      levelColor: item.levelColor || getDimColor(item.totalScore || 0)
    }))

    this.setData({ list: local, loading: false })

    // 尝试从云端加载
    const openid = wx.getStorageSync('openid')
    if (openid) {
      try {
        const result = await cloudService.listAssessments(1, 50)
        if (result.data && result.data.length > 0) {
          const cloudList = result.data.map(item => ({
            ...item,
            source: 'cloud',
            dateStr: this._formatDate(item.createdAt),
            levelColor: item.levelColor || getDimColor(item.totalScore || 0)
          }))

          // 合并去重（优先云端）
          const merged = [...cloudList]
          local.forEach(l => {
            const dup = cloudList.find(c => c.createdAt === l.createdAt)
            if (!dup) merged.push(l)
          })
          merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

          this.setData({ list: merged, hasCloud: true })
        }
      } catch (e) {
        // 云端加载失败，仅显示本地
      }
    }
  },

  _formatDate(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  },

  viewDetail(e) {
    const { id, source } = e.currentTarget.dataset
    if (source === 'cloud') {
      wx.navigateTo({ url: `/pages/history/detail?id=${id}&source=cloud` })
    } else {
      // 本地数据通过 storage 传递
      const item = (wx.getStorageSync('local_history') || []).find(h => h._id === id)
      if (item) {
        const encoded = encodeURIComponent(JSON.stringify(item))
        wx.navigateTo({ url: `/pages/history/detail?data=${encoded}` })
      }
    }
  },

  startAssessment() {
    wx.navigateTo({ url: '/pages/questionnaire/index' })
  },

  loadMore() {
    // 分页加载（暂仅本地）
  }
})
