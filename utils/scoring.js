/**
 * 慢性炎症风险指数评分引擎
 * 总分 0-100，分三级：低(0-33) / 中(34-66) / 高(67-100)
 * 权重：症状60% + 生活方式40%
 */

// 症状维度权重（合计 = 1.0）
const DIM_WEIGHTS = {
  systemic:    0.25,
  digestive:   0.20,
  respiratory: 0.15,
  skin:        0.15,
  urinary:     0.10,
  neuro:       0.15
}

// 维度中文名
const DIM_NAMES = {
  systemic:    '全身与疼痛',
  digestive:   '消化系统',
  respiratory: '呼吸/耳鼻喉',
  skin:        '皮肤与黏膜',
  urinary:     '泌尿系统',
  neuro:       '神经心理',
  lifestyle:   '生活方式'
}

/**
 * 计算每道症状题的最大可能得分
 */
function maxSymptomScore(questions) {
  return questions.reduce((sum, q) => sum + 3 * (q.weight || 1.0), 0)
}

/**
 * 计算单一维度原始分（0~maxScore）
 * answers: { [questionId]: 0|1|2|3 }
 */
function calcDimRaw(questions, answers) {
  let raw = 0
  let answered = 0
  questions.forEach(q => {
    const val = answers[q.id]
    if (val !== undefined && val !== null) {
      raw += val * (q.weight || 1.0)
      answered++
    }
  })
  return { raw, answered, total: questions.length }
}

/**
 * 计算生活方式得分（0-100）
 */
function calcLifestyleScore(lifestyleAnswers, basicInfo) {
  const { QUESTIONS } = require('../data/questions')
  const questions = QUESTIONS.lifestyle.questions
  let raw = 0
  let maxRaw = 0
  let answered = 0

  questions.forEach(q => {
    const val = lifestyleAnswers[q.id]
    const maxScore = Math.max(...q.scores)
    maxRaw += maxScore
    if (val !== undefined && val !== null) {
      raw += q.scores[val] || 0
      answered++
    }
  })

  // 吸烟加分
  if (basicInfo && basicInfo.smoking) {
    const smokingMap = { '不吸烟': 0, '偶尔吸烟': 4, '每天1-10支': 8, '每天10支以上': 14 }
    raw += smokingMap[basicInfo.smoking] || 0
    maxRaw += 14
  }

  // 饮酒加分
  if (basicInfo && basicInfo.drinking) {
    const drinkingMap = { '不饮酒': 0, '偶尔饮酒': 2, '每周2-4次': 5, '每天饮酒': 10 }
    raw += drinkingMap[basicInfo.drinking] || 0
    maxRaw += 10
  }

  if (maxRaw === 0) return { score: 0, answered, total: questions.length }
  return {
    score: Math.min(100, Math.round((raw / maxRaw) * 100)),
    answered,
    total: questions.length
  }
}

/**
 * 主评分函数
 * @param {Object} symptomAnswers  - { questionId: 0|1|2|3 }
 * @param {Object} lifestyleAnswers - { questionId: optionIndex }
 * @param {Object} basicInfo
 * @returns {{ totalScore, level, dimensionScores, topFactors, completeness, redFlags }}
 */
function calculateScore(symptomAnswers, lifestyleAnswers, basicInfo) {
  const { QUESTIONS } = require('../data/questions')

  // ── 1. 症状各维度得分 ────────────────────────────────────
  const dimensionScores = {}
  let totalSymptomWeighted = 0

  QUESTIONS.symptoms.groups.forEach(group => {
    const { raw, answered, total } = calcDimRaw(group.questions, symptomAnswers || {})
    const maxRaw = maxSymptomScore(group.questions)
    const dimScore = maxRaw > 0 ? Math.min(100, Math.round((raw / maxRaw) * 100)) : 0
    const weight = DIM_WEIGHTS[group.id] || 0.1
    dimensionScores[group.id] = {
      name:     DIM_NAMES[group.id],
      score:    dimScore,
      answered,
      total,
      weight
    }
    totalSymptomWeighted += dimScore * weight
  })

  // ── 2. 生活方式得分 ──────────────────────────────────────
  const lsResult = calcLifestyleScore(lifestyleAnswers || {}, basicInfo || {})
  dimensionScores.lifestyle = {
    name:     DIM_NAMES.lifestyle,
    score:    lsResult.score,
    answered: lsResult.answered,
    total:    lsResult.total,
    weight:   1.0
  }

  // ── 3. 总分（症状60% + 生活方式40%） ────────────────────
  const rawTotal = totalSymptomWeighted * 0.60 + lsResult.score * 0.40
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)))

  // ── 4. 风险等级 ──────────────────────────────────────────
  let level = 'low'
  let levelText = '低风险'
  let levelColor = '#4CC38A'
  if (totalScore >= 67) {
    level = 'high'; levelText = '高风险'; levelColor = '#E5534B'
  } else if (totalScore >= 34) {
    level = 'medium'; levelText = '中风险'; levelColor = '#F5A623'
  }

  // ── 5. 贡献最大的 Top3 维度 ─────────────────────────────
  const sortedDims = Object.entries(dimensionScores)
    .filter(([key]) => key !== 'lifestyle')
    .sort(([, a], [, b]) => b.score - a.score)

  const topFactors = sortedDims.slice(0, 3).map(([key, val]) => ({
    id:    key,
    name:  val.name,
    score: val.score
  }))

  // ── 6. 完整性检查 ────────────────────────────────────────
  let totalQ = 0, answeredQ = 0
  Object.values(dimensionScores).forEach(d => {
    totalQ += d.total || 0
    answeredQ += d.answered || 0
  })
  const completeness = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0
  const incomplete = completeness < 70

  // ── 7. 红旗症状检查 ──────────────────────────────────────
  const redFlags = []
  if (symptomAnswers) {
    // 不明原因发热（s2 频繁）
    if ((symptomAnswers.s2 || 0) >= 2) redFlags.push('出现不明原因发热，建议就医排查')
    // 不明原因体重下降（s6 偶尔以上）
    if ((symptomAnswers.s6 || 0) >= 1) redFlags.push('近期体重明显下降，建议尽快就医检查')
    // 情绪低落持续（n4 经常以上）
    if ((symptomAnswers.n4 || 0) >= 2) redFlags.push('持续情绪低落超过2周，建议寻求心理专业帮助')
  }

  return {
    totalScore,
    level,
    levelText,
    levelColor,
    dimensionScores,
    topFactors,
    completeness,
    incomplete,
    redFlags
  }
}

/**
 * 获取维度评分颜色
 */
function getDimColor(score) {
  if (score >= 67) return '#E5534B'
  if (score >= 34) return '#F5A623'
  return '#4CC38A'
}

module.exports = { calculateScore, getDimColor, DIM_NAMES, DIM_WEIGHTS }
