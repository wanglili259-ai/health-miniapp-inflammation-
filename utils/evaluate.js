/**
 * evaluate.js
 * Utility module for inflammation risk scoring and evaluation.
 *
 * Scoring system:
 *   Each question contributes 0–3 points toward an inflammation risk score.
 *   Total possible points: 39
 *   Risk tiers:
 *     Low    :  0 – 12
 *     Moderate: 13 – 25
 *     High   : 26 – 39
 */

/**
 * Question definitions used by the questionnaire page.
 * Each item has:
 *   id     - unique key stored in answers map
 *   text   - question label
 *   options - array of { label, score } objects
 */
const QUESTIONS = [
  // ── Basic Information ──────────────────────────────────────────────────────
  {
    id: 'age',
    group: '基本信息',
    text: '您的年龄段是？',
    options: [
      { label: '18 岁以下', score: 0 },
      { label: '18 – 35 岁', score: 0 },
      { label: '36 – 50 岁', score: 1 },
      { label: '51 – 65 岁', score: 2 },
      { label: '65 岁以上', score: 3 }
    ]
  },
  {
    id: 'bmi',
    group: '基本信息',
    text: '您的体重状况（BMI）？',
    options: [
      { label: '偏轻（BMI < 18.5）', score: 1 },
      { label: '正常（18.5 – 24）', score: 0 },
      { label: '超重（24 – 28）', score: 1 },
      { label: '肥胖（> 28）', score: 3 }
    ]
  },
  // ── Symptoms ───────────────────────────────────────────────────────────────
  {
    id: 'joint_pain',
    group: '症状',
    text: '您是否经常感到关节疼痛或僵硬？',
    options: [
      { label: '从不', score: 0 },
      { label: '偶尔（每月 1–2 次）', score: 1 },
      { label: '经常（每周多次）', score: 2 },
      { label: '几乎每天', score: 3 }
    ]
  },
  {
    id: 'fatigue',
    group: '症状',
    text: '您是否经常感到疲惫乏力？',
    options: [
      { label: '从不', score: 0 },
      { label: '偶尔', score: 1 },
      { label: '经常', score: 2 },
      { label: '几乎每天', score: 3 }
    ]
  },
  {
    id: 'digestive',
    group: '症状',
    text: '您是否有消化道不适（腹胀、腹泻或腹痛）？',
    options: [
      { label: '从不', score: 0 },
      { label: '偶尔', score: 1 },
      { label: '经常', score: 2 },
      { label: '几乎每天', score: 3 }
    ]
  },
  {
    id: 'skin',
    group: '症状',
    text: '您是否有皮肤问题（红疹、湿疹或痤疮）？',
    options: [
      { label: '无', score: 0 },
      { label: '轻微', score: 1 },
      { label: '中度', score: 2 },
      { label: '严重', score: 3 }
    ]
  },
  // ── Diet ───────────────────────────────────────────────────────────────────
  {
    id: 'processed_food',
    group: '饮食习惯',
    text: '您每周摄入加工食品（快餐、零食、腌制品）的频率？',
    options: [
      { label: '几乎不吃', score: 0 },
      { label: '每周 1–2 次', score: 1 },
      { label: '每周 3–5 次', score: 2 },
      { label: '每天都吃', score: 3 }
    ]
  },
  {
    id: 'sugar',
    group: '饮食习惯',
    text: '您每天的糖分摄入量（含甜饮料）？',
    options: [
      { label: '很少（< 25 g）', score: 0 },
      { label: '适量（25 – 50 g）', score: 1 },
      { label: '较多（50 – 100 g）', score: 2 },
      { label: '很多（> 100 g）', score: 3 }
    ]
  },
  {
    id: 'vegetables',
    group: '饮食习惯',
    text: '您每天摄入蔬菜和水果的情况？',
    options: [
      { label: '5 份以上', score: 0 },
      { label: '3 – 4 份', score: 1 },
      { label: '1 – 2 份', score: 2 },
      { label: '几乎不吃', score: 3 }
    ]
  },
  // ── Lifestyle ──────────────────────────────────────────────────────────────
  {
    id: 'exercise',
    group: '生活方式',
    text: '您每周进行中等强度运动（如快走、游泳）的频率？',
    options: [
      { label: '5 天以上', score: 0 },
      { label: '3 – 4 天', score: 1 },
      { label: '1 – 2 天', score: 2 },
      { label: '几乎不运动', score: 3 }
    ]
  },
  {
    id: 'sleep',
    group: '生活方式',
    text: '您每晚平均睡眠时间及质量？',
    options: [
      { label: '7 – 8 小时，睡眠质量好', score: 0 },
      { label: '6 – 7 小时，质量尚可', score: 1 },
      { label: '5 – 6 小时，常有失眠', score: 2 },
      { label: '< 5 小时或严重失眠', score: 3 }
    ]
  },
  {
    id: 'stress',
    group: '生活方式',
    text: '您的日常压力水平？',
    options: [
      { label: '压力很小', score: 0 },
      { label: '压力适中', score: 1 },
      { label: '压力较大', score: 2 },
      { label: '压力极大', score: 3 }
    ]
  },
  {
    id: 'smoking',
    group: '生活方式',
    text: '您的吸烟情况？',
    options: [
      { label: '从不吸烟', score: 0 },
      { label: '已戒烟', score: 1 },
      { label: '偶尔吸烟', score: 2 },
      { label: '每天吸烟', score: 3 }
    ]
  }
];

/** Maximum achievable score */
const MAX_SCORE = QUESTIONS.reduce((sum, q) => {
  const maxOption = q.options.reduce((m, o) => Math.max(m, o.score), 0);
  return sum + maxOption;
}, 0);

/**
 * Risk tier thresholds (ratio of MAX_SCORE, inclusive upper bound).
 *   score / MAX_SCORE <= low      → 低风险  (0 – 33 %)
 *   score / MAX_SCORE <= moderate → 中等风险 (34 – 67 %)
 *   otherwise                    → 高风险  (68 – 100 %)
 */
const THRESHOLDS = {
  low: 0.33,
  moderate: 0.67
};

/**
 * Evaluate an answers map and return a result object.
 *
 * @param {Object} answers  – { questionId: optionIndex, ... }
 * @returns {Object} result – { score, maxScore, percentage, level, label, color, tips[] }
 */
function evaluate(answers) {
  let score = 0;

  QUESTIONS.forEach(q => {
    const idx = answers[q.id];
    if (idx !== undefined && idx !== null && q.options[idx]) {
      score += q.options[idx].score;
    }
  });

  const percentage = MAX_SCORE > 0 ? score / MAX_SCORE : 0;

  let level, label, color, description, tips;

  if (percentage <= THRESHOLDS.low) {
    level = 'low';
    label = '低风险';
    color = '#27AE60';
    description = '您目前的炎症风险较低，身体状态良好。请继续保持健康的生活习惯！';
    tips = [
      '保持均衡饮食，多摄入新鲜蔬果',
      '坚持规律运动，每周至少 150 分钟中等强度活动',
      '保证充足睡眠（7–8 小时/晚）',
      '定期体检，预防为主'
    ];
  } else if (percentage <= THRESHOLDS.moderate) {
    level = 'moderate';
    label = '中等风险';
    color = '#F39C12';
    description = '您存在一定的炎症风险，建议关注饮食和生活方式，积极改善相关因素。';
    tips = [
      '减少加工食品和高糖饮食的摄入',
      '增加富含 Omega-3 的食物（深海鱼、亚麻籽、坚果）',
      '每天坚持适量运动，有助于控制炎症',
      '学会压力管理，如冥想、深呼吸或瑜伽',
      '如有持续症状，请咨询医生'
    ];
  } else {
    level = 'high';
    label = '高风险';
    color = '#E74C3C';
    description = '您的炎症风险较高，建议尽快寻求医疗建议，同时积极调整生活习惯。';
    tips = [
      '尽快就医，进行炎症相关指标检测（CRP、ESR 等）',
      '严格控制饮食：避免加工食品、精制糖和反式脂肪',
      '戒烟限酒，减少对身体的持续刺激',
      '保持规律睡眠，避免熬夜',
      '积极管理慢性压力，必要时寻求心理援助',
      '遵医嘱进行治疗，不可自行用药'
    ];
  }

  return {
    score,
    maxScore: MAX_SCORE,
    percentage: Math.round(percentage * 100),
    level,
    label,
    color,
    description,
    tips,
    answeredCount: Object.keys(answers).length,
    totalCount: QUESTIONS.length
  };
}

/**
 * Group questions by their group label for UI rendering.
 * @returns {Array} [{ group, questions[] }]
 */
function getGroupedQuestions() {
  const groups = [];
  const seen = {};

  QUESTIONS.forEach(q => {
    if (!seen[q.group]) {
      seen[q.group] = { group: q.group, questions: [] };
      groups.push(seen[q.group]);
    }
    seen[q.group].questions.push(q);
  });

  return groups;
}

module.exports = {
  QUESTIONS,
  MAX_SCORE,
  evaluate,
  getGroupedQuestions
};
