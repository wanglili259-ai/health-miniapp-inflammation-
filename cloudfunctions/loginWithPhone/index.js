const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code } = event

  try {
    // 使用 code 换取手机号
    const result = await cloud.openapi.phonenumber.getPhoneNumber({ code })
    const phoneInfo = result.phone_info
    const phone = phoneInfo.purePhoneNumber

    const openid = wxContext.OPENID
    const now = new Date()

    const usersCollection = db.collection('users')
    const existing = await usersCollection.doc(openid).get().catch(() => null)

    if (existing && existing.data) {
      await usersCollection.doc(openid).update({
        data: { phone, updatedAt: now }
      })
    } else {
      await usersCollection.add({
        data: {
          _id: openid,
          openid,
          phone,
          createdAt: now,
          updatedAt: now
        }
      })
    }

    return { success: true, openid, phone }
  } catch (e) {
    console.error('loginWithPhone error:', e)
    return { success: false, error: e.message || String(e) }
  }
}
