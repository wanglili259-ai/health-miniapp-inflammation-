// pages/index/index.js
const app = getApp();

Page({
  data: {
    hasHistory: false,
    features: [
      { icon: '👤', bg: '#EBF5FB', name: '基本信息', desc: '年龄段与体重状况' },
      { icon: '🩺', bg: '#FDEDEC', name: '身体症状', desc: '关节、疲劳、消化与皮肤' },
      { icon: '🥗', bg: '#E9F7EF', name: '饮食习惯', desc: '加工食品、糖分与蔬果摄入' },
      { icon: '🏃', bg: '#FEF9E7', name: '生活方式', desc: '运动、睡眠、压力与吸烟' }
    ]
  },

  onShow() {
    const answers = app.globalData.answers;
    this.setData({
      hasHistory: answers && Object.keys(answers).length > 0
    });
  },

  onStart() {
    // Clear previous answers before a fresh assessment
    app.clearAnswers();
    wx.navigateTo({ url: '/pages/questionnaire/questionnaire' });
  },

  onViewHistory() {
    wx.navigateTo({ url: '/pages/result/result' });
  }
});
