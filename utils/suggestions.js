/**
 * 建议生成引擎
 * 根据各维度得分和总体风险等级，生成个性化健康建议
 */

/**
 * 主函数：生成完整建议对象
 * @param {Object} scoreResult - calculateScore 的返回值
 * @param {Object} lifestyleAnswers
 * @param {Object} basicInfo
 * @returns {{ principles, actionList, detailAdvice }}
 */
function generateSuggestions(scoreResult, lifestyleAnswers, basicInfo) {
  const { totalScore, level, dimensionScores, topFactors } = scoreResult
  const ls = dimensionScores.lifestyle || {}
  const lsScore = ls.score || 0

  const dietScore = _getSubScore(lifestyleAnswers, ['l6', 'l7', 'l8', 'l9'])
  const sleepScore = _getSubScore(lifestyleAnswers, ['l1', 'l2'])
  const exerciseScore = _getSubScore(lifestyleAnswers, ['l4', 'l5'])
  const stressScore = _getSubScore(lifestyleAnswers, ['l3', 'l10'])

  const principles = _buildPrinciples(scoreResult, dietScore, sleepScore, exerciseScore, stressScore, lifestyleAnswers)
  const actionList = _buildActionList(scoreResult, lifestyleAnswers, dietScore, sleepScore, exerciseScore, stressScore)
  const detailAdvice = _buildDetailAdvice(scoreResult, lifestyleAnswers, basicInfo)

  return { principles, actionList, detailAdvice }
}

// ── 原则 (5条) ────────────────────────────────────────────

function _buildPrinciples(scoreResult, dietScore, sleepScore, exerciseScore, stressScore, la) {
  const { dimensionScores } = scoreResult
  const skinScore = (dimensionScores.skin || {}).score || 0

  return [
    {
      id: 'diet',
      icon: '🥗',
      title: '抗炎饮食原则',
      content: dietScore >= 60
        ? '减少精制糖、反式脂肪、加工食品摄入是当前最优先事项。尝试用深色蔬菜、浆果类水果、全谷物替代高糖高脂食物，每天至少摄入5种不同颜色的蔬果。'
        : '继续保持良好的饮食结构。增加富含Omega-3的食物（深海鱼、亚麻籽、核桃），以橄榄油替代部分精炼植物油，进一步强化抗炎效果。'
    },
    {
      id: 'sleep',
      icon: '😴',
      title: '睡眠修复原则',
      content: sleepScore >= 60
        ? '睡眠是身体自我修复的黄金时段。建议固定就寝时间（22:00-23:00），睡前1小时关闭蓝光屏幕，尝试4-7-8呼吸法（吸气4秒→屏气7秒→呼气8秒）帮助入睡。'
        : '您的睡眠质量较好，请继续保持。睡前可进行10分钟拉伸或冥想，进一步提升深度睡眠比例，强化免疫调节能力。'
    },
    {
      id: 'exercise',
      icon: '🏃',
      title: '规律运动原则',
      content: exerciseScore >= 60
        ? '运动不足是慢性炎症的重要危险因素。从每天10分钟快走开始，逐步增加到每周150分钟中等强度有氧运动（如快走、游泳、骑行），并加入每周2次力量训练。'
        : '保持现有运动习惯，尝试加入力量训练（哑铃、自重训练），有助于改善胰岛素敏感性和降低炎症标志物水平。'
    },
    {
      id: 'stress',
      icon: '🧘',
      title: '压力管理原则',
      content: stressScore >= 60
        ? '长期心理压力会持续激活炎症通路。每天安排15-20分钟正念冥想或深呼吸练习；尝试写感恩日记；识别压力源并制定应对策略，必要时寻求心理咨询。'
        : '继续保持良好的压力管理习惯。可探索更多放松技术，如渐进式肌肉放松、自然接触（户外散步）等，进一步降低皮质醇水平。'
    },
    {
      id: 'oral',
      icon: '🦷',
      title: '口腔健康原则',
      content: skinScore >= 50
        ? '口腔慢性炎症（牙周炎、溃疡）是全身炎症负担的重要来源。建议每6个月进行一次口腔检查和专业洁牙，每天使用牙线，减少精制糖摄入以改善口腔菌群环境。'
        : '保持每天早晚刷牙（至少2分钟）、使用牙线的好习惯。定期口腔检查可帮助早期发现牙周问题，避免慢性低度炎症积累。'
    }
  ]
}

// ── 行动清单 ──────────────────────────────────────────────

function _buildActionList(scoreResult, la, dietScore, sleepScore, exerciseScore, stressScore) {
  const { level, dimensionScores } = scoreResult
  const today = [], thisWeek = [], nextAssess = []

  // 今天开始（3项，最紧迫）
  if (dietScore >= 50) {
    today.push({ icon: '🥤', text: '今天起，用白开水或无糖茶替代所有含糖饮料' })
  } else {
    today.push({ icon: '🥦', text: '今天的餐食中，增加一份深色蔬菜（菠菜/西兰花/紫甘蓝）' })
  }

  if (sleepScore >= 40) {
    today.push({ icon: '📱', text: '今晚睡前1小时，将手机静音并放到床边以外的地方' })
  } else {
    today.push({ icon: '⏰', text: '设定一个固定的就寝闹钟提醒，今晚按时准备入睡' })
  }

  if (stressScore >= 40) {
    today.push({ icon: '🌬️', text: '现在花3分钟做4-7-8呼吸：吸气4秒→屏气7秒→呼气8秒，循环4次' })
  } else {
    today.push({ icon: '🚶', text: '今天饭后散步10分钟，感受身体的轻盈' })
  }

  // 本周计划（3项）
  thisWeek.push({
    icon: '🐟',
    text: '本周安排2次深海鱼（三文鱼/金枪鱼/鲭鱼）作为主要蛋白质来源，补充Omega-3'
  })

  if (exerciseScore >= 50) {
    thisWeek.push({
      icon: '🏋️',
      text: '本周增加2次30分钟有氧运动，从快走开始，心率维持在最大心率的60-70%'
    })
  } else {
    thisWeek.push({
      icon: '🚴',
      text: '维持本周运动计划，尝试加入一次力量训练（深蹲、平板支撑各3组）'
    })
  }

  thisWeek.push({
    icon: '🧴',
    text: '本周尝试每晚临睡前做10分钟渐进式肌肉放松（从脚趾到头部逐步放松各肌肉群）'
  })

  // 下次复评
  const weeks = level === 'high' ? 4 : level === 'medium' ? 8 : 12
  nextAssess.push({
    icon: '📋',
    text: `建议${weeks}周后重新完成本测评，届时重点观察：睡眠质量、消化舒适度、疲劳感变化`
  })

  return { today, thisWeek, nextAssess }
}

// ── 详细建议 ──────────────────────────────────────────────

function _buildDetailAdvice(scoreResult, la, basicInfo) {
  const { dimensionScores } = scoreResult
  const onAnticoagulants = basicInfo &&
    basicInfo.medications &&
    basicInfo.medications.includes('抗凝/抗血小板药物')

  return {
    diet: {
      title: '饮食建议',
      items: [
        { label: '多吃', content: '深色蔬菜（菠菜、羽衣甘蓝）、浆果（蓝莓、草莓）、深海鱼、坚果、豆类、全谷物、橄榄油、绿茶' },
        { label: '少吃', content: '精制糖、白面包/白米饭、油炸食品、加工肉类（腊肠/培根）、含糖饮料、人造黄油/起酥油' },
        { label: '烹饪方式', content: '首选蒸、煮、炖、生拌；减少高温油炸，避免产生晚期糖基化终末产物（AGEs）' }
      ]
    },
    sleep: {
      title: '睡眠建议',
      items: [
        { label: '睡眠时长', content: '成人理想睡眠时长为7-8小时，睡眠不足或超过9小时均与炎症指标升高有关' },
        { label: '入睡技巧', content: '4-7-8呼吸法、渐进式肌肉放松、保持卧室温度18-20°C、遮光窗帘' },
        { label: '睡眠卫生', content: '固定起床时间（含周末）、避免午睡超过30分钟、睡前4小时避免咖啡因、睡前2小时停止剧烈运动' }
      ]
    },
    nutrition: {
      title: '关键营养素',
      warning: '以下建议优先通过食物补充。服用补充剂前请咨询医生，尤其是有用药史的人群。',
      items: [
        {
          name: 'Omega-3脂肪酸',
          food: '深海鱼（三文鱼/鲭鱼/沙丁鱼）、亚麻籽、核桃、奇亚籽',
          note: onAnticoagulants ? '⚠️ 您正在使用抗凝药物，高剂量Omega-3补充剂可能增加出血风险，请务必咨询医生后再服用' : '每周食用2-3次深海鱼可满足基本需求'
        },
        {
          name: '维生素D',
          food: '蛋黄、蘑菇（日晒）、深海鱼肝、强化牛奶',
          note: '个体差异较大，建议通过血液检测确认是否缺乏后再决定是否补充'
        },
        {
          name: '镁',
          food: '坚果（杏仁/腰果）、深绿叶菜、黑巧克力（>70%）、豆类、全谷物',
          note: '压力大、睡眠差人群往往镁消耗增加，可适当增加食物来源'
        },
        {
          name: '益生菌',
          food: '无糖酸奶、开菲尔、泡菜（低盐发酵）、纳豆、味噌',
          note: '每天摄入1-2份发酵食品，有助于改善肠道菌群多样性，间接降低肠道炎症'
        }
      ]
    },
    exercise: {
      title: '运动建议',
      items: [
        { label: '有氧运动', content: '每周150分钟中等强度有氧（快走/游泳/骑行/舞蹈），或75分钟高强度（慢跑/HIIT）' },
        { label: '力量训练', content: '每周2次，每次30-45分钟，有助于改善胰岛素敏感性，降低IL-6、CRP等炎症标志物' },
        { label: '减少久坐', content: '每坐45-60分钟起身活动5分钟；站立式办公、爬楼梯替代电梯均有益' },
        { label: '从小开始', content: '若当前运动量很少，从每天10分钟散步开始，逐步增加时长和强度' }
      ]
    },
    psychology: {
      title: '心理健康建议',
      items: [
        { label: '自助技巧', content: '正念冥想（推荐Headspace/潮汐App）、CBT情绪日记（记录→识别→挑战负面想法）、感恩练习（每天写3件好事）' },
        { label: '社交支持', content: '与亲友保持定期联系；减少孤独感与慢性炎症密切相关' },
        { label: '何时寻求帮助', content: '持续2周以上情绪低落、兴趣丧失；或出现自伤/自杀想法，请立即联系心理专科医生或拨打心理援助热线（北京：010-82951332）' }
      ]
    }
  }
}

// ── 工具函数 ──────────────────────────────────────────────

function _getSubScore(answers, ids) {
  if (!answers) return 0
  let sum = 0, count = 0
  ids.forEach(id => {
    if (answers[id] !== undefined) { sum += answers[id]; count++ }
  })
  if (count === 0) return 0
  return Math.round((sum / (count * 3)) * 100)
}

module.exports = { generateSuggestions }
