const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    const {
      basicInfo,
      symptomAnswers,
      lifestyleAnswers,
      totalScore,
      level,
      levelText,
      levelColor,
      dimensionScores,
      topFactors,
      suggestions,
      completeness,
      incomplete,
      redFlags,
      createdAt
    } = event

    const doc = {
      openid,
      createdAt: createdAt ? new Date(createdAt) : new Date(),
      savedAt: new Date(),
      basicInfo: basicInfo || {},
      symptomAnswers: symptomAnswers || {},
      lifestyleAnswers: lifestyleAnswers || {},
      totalScore: totalScore || 0,
      level: level || 'low',
      levelText: levelText || '',
      levelColor: levelColor || '#4CC38A',
      dimensionScores: dimensionScores || {},
      topFactors: topFactors || [],
      suggestions: suggestions || {},
      completeness: completeness || 0,
      incomplete: !!incomplete,
      redFlags: redFlags || []
    }

    const result = await db.collection('assessments').add({ data: doc })

    return { success: true, id: result._id }
  } catch (e) {
    console.error('saveAssessment error:', e)
    return { success: false, error: e.message || String(e) }
  }
}
