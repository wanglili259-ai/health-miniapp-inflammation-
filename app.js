App({
  globalData: {
    userInfo: null,
    answers: {}
  },

  onLaunch() {
    const answers = wx.getStorageSync('answers');
    if (answers) {
      this.globalData.answers = answers;
    }
  },

  saveAnswers(answers) {
    this.globalData.answers = answers;
    wx.setStorageSync('answers', answers);
  },

  clearAnswers() {
    this.globalData.answers = {};
    wx.removeStorageSync('answers');
  }
});
