const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 删除评估记录
    const assessmentsResult = await db.collection('assessments')
      .where({ openid })
      .remove()

    // 删除用户记录
    await db.collection('users').doc(openid).remove().catch(() => null)

    return {
      success: true,
      deletedAssessments: assessmentsResult.stats.removed
    }
  } catch (e) {
    console.error('deleteMyData error:', e)
    return { success: false, error: e.message || String(e) }
  }
}
