const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { id } = event

  try {
    if (!id) {
      return { success: false, error: '缺少 id 参数' }
    }

    const result = await db.collection('assessments').doc(id).get()

    // 权限校验：只能查看自己的数据
    if (result.data.openid !== openid) {
      return { success: false, error: '无权访问' }
    }

    return { success: true, data: result.data }
  } catch (e) {
    console.error('getAssessmentDetail error:', e)
    return { success: false, error: e.message || String(e) }
  }
}
