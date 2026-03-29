// pages/result/result.js
const app = getApp();
const { evaluate } = require('../../utils/evaluate');

Page({
  data: {
    result: null,
    evalTime: ''
  },

  onLoad() {
    this._computeResult();
  },

  onShow() {
    // Recompute if the user navigated back and answers changed
    this._computeResult();
  },

  _computeResult() {
    const answers = app.globalData.answers || {};
    const result = evaluate(answers);

    // Format current date-time for display
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const evalTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    this.setData({ result, evalTime });
  },

  onRetake() {
    app.clearAnswers();
    wx.redirectTo({ url: '/pages/questionnaire/questionnaire' });
  },

  onBackHome() {
    wx.switchTab
      ? wx.switchTab({ url: '/pages/index/index' })
      : wx.redirectTo({ url: '/pages/index/index' });
  }
});
