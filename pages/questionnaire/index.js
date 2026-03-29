const { QUESTIONS } = require('../../data/questions')
const { calculateScore } = require('../../utils/scoring')
const { generateSuggestions } = require('../../utils/suggestions')

Page({
  data: {
    currentStep: 0,
    progressPct: 17,
    basicFields: QUESTIONS.basicInfo.fields,
    basicInfo: {},
    basicInfoMulti: {},
    symptomGroups: QUESTIONS.symptoms.groups,
    symptomAnswers: {},
    symptomAnsweredCount: {},
    freqLabels: QUESTIONS.symptoms.freqLabels,
    lifestyleQuestions: QUESTIONS.lifestyle.questions,
    lifestyleAnswers: {},
    submitting: false
  },

  onLoad(options) {
    if (options.resume) {
      this._loadDraft()
    }
  },

  // ── 草稿 ────────────────────────────────────────────────

  _loadDraft() {
    const draft = wx.getStorageSync('draft_assessment')
    if (!draft) return
    const { currentStep, basicInfo, basicInfoMulti, symptomAnswers, lifestyleAnswers } = draft
    const symptomAnsweredCount = this._calcAnsweredCount(symptomAnswers || {})
    this.setData({
      currentStep: currentStep || 0,
      basicInfo: basicInfo || {},
      basicInfoMulti: basicInfoMulti || {},
      symptomAnswers: symptomAnswers || {},
      lifestyleAnswers: lifestyleAnswers || {},
      symptomAnsweredCount,
      progressPct: this._calcProgress(currentStep || 0)
    })
  },

  _saveDraft() {
    wx.setStorageSync('draft_assessment', {
      step: this.data.currentStep,
      currentStep: this.data.currentStep,
      basicInfo: this.data.basicInfo,
      basicInfoMulti: this.data.basicInfoMulti,
      symptomAnswers: this.data.symptomAnswers,
      lifestyleAnswers: this.data.lifestyleAnswers,
      savedAt: Date.now()
    })
  },

  // ── 进度计算 ────────────────────────────────────────────

  _calcProgress(step) {
    return [17, 50, 83][step] || 17
  },

  _calcAnsweredCount(answers) {
    const count = {}
    QUESTIONS.symptoms.groups.forEach(group => {
      count[group.id] = group.questions.filter(q => answers[q.id] !== undefined).length
    })
    return count
  },

  // ── 基础信息 ────────────────────────────────────────────

  onSelectRadio(e) {
    const { field, value } = e.currentTarget.dataset
    const basicInfo = { ...this.data.basicInfo, [field]: value }
    this.setData({ basicInfo })
    this._saveDraft()
  },

  onNumInput(e) {
    const { field } = e.currentTarget.dataset
    const val = e.detail.value
    const basicInfo = { ...this.data.basicInfo, [field]: val }
    this.setData({ basicInfo })
    this._saveDraft()
  },

  onSelectCheckbox(e) {
    const { field, value, exclusive } = e.currentTarget.dataset
    const multi = { ...this.data.basicInfoMulti }
    if (!multi[field]) multi[field] = {}

    if (value === exclusive) {
      // 互斥：选了"无"则清空其他
      multi[field] = { [value]: !multi[field][value] }
    } else {
      // 取消互斥项
      if (multi[field][exclusive]) delete multi[field][exclusive]
      multi[field][value] = !multi[field][value]
      if (!multi[field][value]) delete multi[field][value]
    }

    // 同步到 basicInfo 的数组形式
    const basicInfo = { ...this.data.basicInfo }
    basicInfo[field] = Object.keys(multi[field]).filter(k => multi[field][k])

    this.setData({ basicInfoMulti: multi, basicInfo })
    this._saveDraft()
  },

  // ── 症状 ─────────────────────────────────────────────────

  onSymptomSelect(e) {
    const { qid, val, gid } = e.currentTarget.dataset
    const symptomAnswers = { ...this.data.symptomAnswers, [qid]: parseInt(val) }
    const symptomAnsweredCount = this._calcAnsweredCount(symptomAnswers)
    this.setData({ symptomAnswers, symptomAnsweredCount })
    this._saveDraft()
  },

  // ── 生活方式 ─────────────────────────────────────────────

  onLifestyleSelect(e) {
    const { qid, idx } = e.currentTarget.dataset
    const lifestyleAnswers = { ...this.data.lifestyleAnswers, [qid]: parseInt(idx) }
    this.setData({ lifestyleAnswers })
    this._saveDraft()
  },

  // ── 导航 ─────────────────────────────────────────────────

  prevStep() {
    if (this.data.currentStep <= 0) return
    const step = this.data.currentStep - 1
    this.setData({
      currentStep: step,
      progressPct: this._calcProgress(step)
    })
    wx.pageScrollTo({ scrollTop: 0, duration: 0 })
  },

  nextStep() {
    const { currentStep } = this.data

    if (currentStep === 0) {
      if (!this._validateBasicInfo()) return
      this.setData({ currentStep: 1, progressPct: this._calcProgress(1) })
      wx.pageScrollTo({ scrollTop: 0, duration: 0 })
    } else if (currentStep === 1) {
      this.setData({ currentStep: 2, progressPct: this._calcProgress(2) })
      wx.pageScrollTo({ scrollTop: 0, duration: 0 })
    } else {
      this._submitAssessment()
    }

    this._saveDraft()
  },

  _validateBasicInfo() {
    const { basicInfo } = this.data
    if (!basicInfo.gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' })
      return false
    }
    if (!basicInfo.ageGroup) {
      wx.showToast({ title: '请选择年龄段', icon: 'none' })
      return false
    }
    return true
  },

  // ── 提交评估 ─────────────────────────────────────────────

  async _submitAssessment() {
    this.setData({ submitting: true })
    wx.showLoading({ title: '正在计算...' })

    try {
      const { basicInfo, symptomAnswers, lifestyleAnswers } = this.data
      const scoreResult = calculateScore(symptomAnswers, lifestyleAnswers, basicInfo)
      const suggestions = generateSuggestions(scoreResult, lifestyleAnswers, basicInfo)

      const assessment = {
        createdAt: new Date().toISOString(),
        basicInfo,
        symptomAnswers,
        lifestyleAnswers,
        ...scoreResult,
        suggestions
      }

      // 存本地
      const history = wx.getStorageSync('local_history') || []
      const localId = `local_${Date.now()}`
      history.unshift({ ...assessment, _id: localId })
      wx.setStorageSync('local_history', history.slice(0, 50))
      wx.removeStorageSync('draft_assessment')

      wx.hideLoading()

      // 跳转结果页
      const encoded = encodeURIComponent(JSON.stringify({ ...assessment, _id: localId }))
      wx.redirectTo({
        url: `/pages/result/index?data=${encoded}`
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '计算出错，请重试', icon: 'none' })
      console.error(err)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
