// pages/questionnaire/questionnaire.js
const app = getApp();
const { getGroupedQuestions, QUESTIONS } = require('../../utils/evaluate');

Page({
  data: {
    groups: [],
    answers: {},
    answeredCount: 0,
    totalCount: QUESTIONS.length,
    progressPct: 0,
    canSubmit: false
  },

  onLoad() {
    // Build groups and attach a global question index for display
    const rawGroups = getGroupedQuestions();
    let globalIndex = 1;
    const groups = rawGroups.map(group => ({
      group: group.group,
      questions: group.questions.map(q => ({
        ...q,
        globalIndex: globalIndex++
      }))
    }));

    this.setData({ groups });
  },

  onSelectOption(e) {
    const { qid, idx } = e.currentTarget.dataset;
    const answers = { ...this.data.answers, [qid]: idx };
    const answeredCount = Object.keys(answers).length;
    const totalCount = this.data.totalCount;
    const progressPct = Math.round((answeredCount / totalCount) * 100);

    this.setData({
      answers,
      answeredCount,
      progressPct,
      canSubmit: answeredCount >= totalCount
    });
  },

  onSubmit() {
    if (!this.data.canSubmit) return;

    // Persist answers and navigate to result
    app.saveAnswers(this.data.answers);
    wx.navigateTo({ url: '/pages/result/result' });
  }
});
