const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { page = 1, pageSize = 20 } = event

  try {
    const skip = (page - 1) * pageSize
    const result = await db.collection('assessments')
      .where({ openid })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    const total = await db.collection('assessments')
      .where({ openid })
      .count()

    return {
      success: true,
      data: result.data,
      total: total.total,
      hasMore: skip + result.data.length < total.total
    }
  } catch (e) {
    console.error('listAssessments error:', e)
    return { success: false, error: e.message || String(e) }
  }
}
