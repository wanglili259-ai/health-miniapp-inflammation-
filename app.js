App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // 替换为你在微信云开发控制台创建的环境 ID，例如 'prod-xxxxxx'
        env: 'your-env-id',
        traceUser: true
      })
    }
    this.globalData = {}
  },

  globalData: {
    userInfo: null,
    openid: null,
    phone: null
  }
})
