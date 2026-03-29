// 问题库
const QUESTIONS = {
  // ── 基础信息 ──────────────────────────────────────────────
  basicInfo: {
    title: '基础信息',
    fields: [
      {
        id: 'gender',
        label: '性别',
        type: 'radio',
        required: true,
        options: ['男', '女', '不便透露']
      },
      {
        id: 'ageGroup',
        label: '年龄段',
        type: 'radio',
        required: true,
        options: ['18-29岁', '30-39岁', '40-49岁', '50-59岁', '60岁以上']
      },
      {
        id: 'height',
        label: '身高（cm）',
        type: 'number',
        required: false,
        placeholder: '例如：170',
        min: 100,
        max: 250
      },
      {
        id: 'weight',
        label: '体重（kg）',
        type: 'number',
        required: false,
        placeholder: '例如：65',
        min: 30,
        max: 300
      },
      {
        id: 'waist',
        label: '腰围（cm，可选）',
        type: 'number',
        required: false,
        placeholder: '例如：80',
        min: 40,
        max: 200
      },
      {
        id: 'smoking',
        label: '吸烟情况',
        type: 'radio',
        required: true,
        options: ['不吸烟', '偶尔吸烟', '每天1-10支', '每天10支以上'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'drinking',
        label: '饮酒情况',
        type: 'radio',
        required: true,
        options: ['不饮酒', '偶尔饮酒', '每周2-4次', '每天饮酒'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'chronicDiseases',
        label: '既往慢性病史（可多选）',
        type: 'checkbox',
        required: false,
        options: [
          '高血压', '糖尿病', '高脂血症', '脂肪肝',
          '甲状腺疾病', '自身免疫病', '过敏性疾病',
          '肿瘤史', '无以上疾病'
        ],
        exclusive: '无以上疾病'
      },
      {
        id: 'medications',
        label: '目前用药情况（可多选）',
        type: 'checkbox',
        required: false,
        options: [
          '抗凝/抗血小板药物', '激素类药物', '免疫抑制剂',
          '降糖药', '降压药', '调脂药', '无以上用药'
        ],
        exclusive: '无以上用药'
      }
    ]
  },

  // ── 症状评估 ──────────────────────────────────────────────
  symptoms: {
    title: '症状自评',
    description: '请根据近1个月的感受，选择症状出现的频率',
    freqLabels: ['几乎没有', '偶尔', '经常', '频繁'],
    groups: [
      {
        id: 'systemic',
        title: '全身与疼痛',
        icon: '🔥',
        dimension: 'systemic',
        questions: [
          {
            id: 's1',
            text: '近1个月是否感到持续疲乏、浑身无力（非运动后）？',
            weight: 1.5,
            dimension: 'systemic'
          },
          {
            id: 's2',
            text: '是否出现不明原因的低热或体温偏高？',
            weight: 1.8,
            dimension: 'systemic',
            redFlag: false
          },
          {
            id: 's3',
            text: '是否有关节疼痛或肿胀（非运动损伤）？',
            weight: 1.5,
            dimension: 'systemic'
          },
          {
            id: 's4',
            text: '是否有肌肉酸痛、僵硬（晨起明显）？',
            weight: 1.2,
            dimension: 'systemic'
          },
          {
            id: 's5',
            text: '是否有反复头痛或偏头痛？',
            weight: 1.0,
            dimension: 'systemic'
          },
          {
            id: 's6',
            text: '是否出现不明原因的体重下降？',
            weight: 2.0,
            dimension: 'systemic',
            redFlag: true,
            redFlagNote: '近期不明原因消瘦请及时就医'
          }
        ]
      },
      {
        id: 'digestive',
        title: '消化系统',
        icon: '🫁',
        dimension: 'digestive',
        questions: [
          {
            id: 'd1',
            text: '是否经常腹胀、腹部不适？',
            weight: 1.2,
            dimension: 'digestive'
          },
          {
            id: 'd2',
            text: '是否有反酸、烧心、胃部灼热感？',
            weight: 1.3,
            dimension: 'digestive'
          },
          {
            id: 'd3',
            text: '大便是否长期不成形（稀烂/水样）或长期便秘？',
            weight: 1.2,
            dimension: 'digestive'
          },
          {
            id: 'd4',
            text: '是否有腹泻与便秘交替出现？',
            weight: 1.5,
            dimension: 'digestive'
          },
          {
            id: 'd5',
            text: '是否饭后常感恶心或消化不良？',
            weight: 1.0,
            dimension: 'digestive'
          },
          {
            id: 'd6',
            text: '是否有口臭（非临时性）？',
            weight: 0.8,
            dimension: 'digestive'
          }
        ]
      },
      {
        id: 'respiratory',
        title: '呼吸/耳鼻喉',
        icon: '🫧',
        dimension: 'respiratory',
        questions: [
          {
            id: 'r1',
            text: '是否反复鼻塞、流涕（非感冒期）？',
            weight: 1.0,
            dimension: 'respiratory'
          },
          {
            id: 'r2',
            text: '是否有慢性咳嗽（持续超过3周）？',
            weight: 1.5,
            dimension: 'respiratory'
          },
          {
            id: 'r3',
            text: '是否经常咽喉不适、异物感？',
            weight: 1.0,
            dimension: 'respiratory'
          },
          {
            id: 'r4',
            text: '是否有反复扁桃体炎或咽炎发作？',
            weight: 1.2,
            dimension: 'respiratory'
          },
          {
            id: 'r5',
            text: '是否有耳鸣或听力下降？',
            weight: 0.8,
            dimension: 'respiratory'
          }
        ]
      },
      {
        id: 'skin',
        title: '皮肤与黏膜',
        icon: '🌡️',
        dimension: 'skin',
        questions: [
          {
            id: 'sk1',
            text: '是否反复出现口腔溃疡（每年3次以上）？',
            weight: 1.5,
            dimension: 'skin'
          },
          {
            id: 'sk2',
            text: '是否有牙龈出血（刷牙或咬硬物时）？',
            weight: 1.2,
            dimension: 'skin'
          },
          {
            id: 'sk3',
            text: '是否有湿疹、荨麻疹或皮肤瘙痒反复发作？',
            weight: 1.3,
            dimension: 'skin'
          },
          {
            id: 'sk4',
            text: '是否有痤疮、粉刺持续难以消退？',
            weight: 1.0,
            dimension: 'skin'
          },
          {
            id: 'sk5',
            text: '是否皮肤容易出现红斑或过敏反应？',
            weight: 1.2,
            dimension: 'skin'
          }
        ]
      },
      {
        id: 'urinary',
        title: '泌尿系统',
        icon: '💧',
        dimension: 'urinary',
        questions: [
          {
            id: 'u1',
            text: '是否有尿频、尿急的不适感（非饮水过多）？',
            weight: 1.2,
            dimension: 'urinary'
          },
          {
            id: 'u2',
            text: '是否有反复尿路不适的经历？（如有请就医确认）',
            weight: 1.5,
            dimension: 'urinary'
          }
        ]
      },
      {
        id: 'neuro',
        title: '神经心理与睡眠',
        icon: '🧠',
        dimension: 'neuro',
        questions: [
          {
            id: 'n1',
            text: '是否有入睡困难（超过30分钟才能睡着）？',
            weight: 1.2,
            dimension: 'neuro'
          },
          {
            id: 'n2',
            text: '是否夜间容易醒来（超过2次）？',
            weight: 1.2,
            dimension: 'neuro'
          },
          {
            id: 'n3',
            text: '是否经常感到焦虑、紧张或无法放松？',
            weight: 1.3,
            dimension: 'neuro'
          },
          {
            id: 'n4',
            text: '是否情绪低落、对事物失去兴趣（持续超过2周）？',
            weight: 2.0,
            dimension: 'neuro',
            redFlag: true,
            redFlagNote: '持续2周以上情绪低落，建议寻求专业心理帮助'
          },
          {
            id: 'n5',
            text: '是否有注意力难以集中、记忆力下降？',
            weight: 1.0,
            dimension: 'neuro'
          },
          {
            id: 'n6',
            text: '是否有头晕或站立时头晕的情况？',
            weight: 0.8,
            dimension: 'neuro'
          }
        ]
      }
    ]
  },

  // ── 生活方式与心理 ────────────────────────────────────────
  lifestyle: {
    title: '生活方式与心理',
    dimension: 'lifestyle',
    questions: [
      {
        id: 'l1',
        text: '每晚平均睡眠时长',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'sleep',
        options: ['少于5小时', '5-6小时', '6-7小时', '7-8小时', '8小时以上'],
        scores: [3, 2, 1, 0, 1]
      },
      {
        id: 'l2',
        text: '睡眠时间是否规律（每天相差不超过1小时）',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'sleep',
        options: ['是，很规律', '否，不规律'],
        scores: [0, 2]
      },
      {
        id: 'l3',
        text: '近1个月主观压力感受',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'stress',
        options: ['很轻松，几乎无压力', '轻度压力', '中度压力', '重度压力'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'l4',
        text: '每周中高强度运动次数',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'exercise',
        options: ['几乎不运动', '每周1次', '每周2-3次', '每周4次以上'],
        scores: [3, 2, 1, 0]
      },
      {
        id: 'l5',
        text: '每天久坐时间（包括工作、看手机等）',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'exercise',
        options: ['少于4小时', '4-6小时', '6-8小时', '8小时以上'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'l6',
        text: '每周含糖饮料/甜食摄入频率',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'diet',
        options: ['几乎不摄入', '偶尔（每周1-2次）', '经常（每周3-5次）', '每天都有'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'l7',
        text: '每天蔬菜水果摄入总量',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'diet',
        options: ['超过500g', '300-500g', '100-300g', '少于100g'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'l8',
        text: '每周外卖/煎炸/加工食物摄入频率',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'diet',
        options: ['几乎不吃', '每周1-2次', '每周3-4次', '每周5次以上'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'l9',
        text: '每天饮水量（白水/淡茶，不含饮料）',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'diet',
        options: ['超过2000ml', '1500-2000ml', '1000-1500ml', '少于1000ml'],
        scores: [0, 1, 2, 3]
      },
      {
        id: 'l10',
        text: '是否经常进行冥想、深呼吸或其他放松练习',
        type: 'radio',
        dimension: 'lifestyle',
        subDim: 'stress',
        options: ['是，每周3次以上', '偶尔练习', '几乎不练习'],
        scores: [0, 1, 2]
      }
    ]
  }
}

module.exports = { QUESTIONS }
