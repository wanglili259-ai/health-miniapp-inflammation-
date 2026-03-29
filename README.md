# 炎症风险自测 · 微信小程序

慢性炎症风险自评工具，基于原生微信小程序 + 微信云开发（CloudBase）构建。

## 功能概述

- **多维度评估**：基础信息 → 症状自评（6大系统）→ 生活方式与心理
- **智能评分**：生成 0-100 慢性炎症风险指数（CIRI）及三级风险等级
- **个性化建议**：5 大改善原则 + 每日/每周行动清单 + 关键营养素建议
- **数据同步**：手机号登录后评估结果自动同步云端
- **历史追踪**：查看历史评估记录，追踪健康趋势
- **暗色主题**：全程深色 UI，护眼舒适

---

## 快速开始

### 前置条件

1. [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) 最新版
2. 微信小程序账号（[申请](https://mp.weixin.qq.com/)）
3. 已开通微信云开发服务

### 步骤一：配置小程序 AppID

1. 打开 `project.config.json`
2. 将 `"appid": "your-appid"` 替换为你的真实 AppID

### 步骤二：配置云开发环境

1. 在微信开发者工具中开通云开发
2. 记录你的云环境 ID（形如 `prod-xxxxxx`）
3. 打开 `app.js`，将 `env: 'your-env-id'` 替换为你的云环境 ID

### 步骤三：初始化数据库集合

在云开发控制台 → 数据库，创建以下集合：

| 集合名 | 权限设置 |
|--------|---------|
| `users` | 仅创建者可读写 |
| `assessments` | 仅创建者可读写 |

### 步骤四：部署云函数

在微信开发者工具中，逐一右键点击 `cloudfunctions/` 下的每个云函数目录，选择「上传并部署：云端安装依赖」：

- `loginWithPhone` — 手机号登录
- `saveAssessment` — 保存评估结果
- `listAssessments` — 查询历史记录
- `getAssessmentDetail` — 查看评估详情
- `deleteMyData` — 删除用户数据

### 步骤五：开通手机号登录权限

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 「开发管理」→「接口设置」→ 开通「手机号快速验证」
3. 在 `loginWithPhone` 云函数中已使用 `cloud.openapi.phonenumber.getPhoneNumber`，需确保云函数已获得该接口调用权限

---

## 项目结构

```
.
├── app.js                    # 小程序入口，初始化云开发
├── app.json                  # 全局配置（页面路由等）
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置（AppID 等）
├── styles/
│   └── theme.wxss            # 深色主题 CSS 变量与基础组件样式
├── data/
│   └── questions.js          # 完整题库（基础信息/症状/生活方式）
├── utils/
│   ├── scoring.js            # 评分引擎（CIRI 算法）
│   ├── suggestions.js        # 建议生成引擎
│   └── cloudService.js       # 云函数调用封装
├── pages/
│   ├── home/                 # 首页
│   ├── auth/                 # 手机号登录页
│   ├── questionnaire/        # 分步问卷（3步）
│   ├── result/               # 评估结果页
│   ├── history/
│   │   ├── index             # 历史记录列表
│   │   └── detail            # 历史记录详情
│   └── about/                # 关于/隐私/免责
└── cloudfunctions/
    ├── loginWithPhone/       # 手机号登录
    ├── saveAssessment/       # 保存评估
    ├── listAssessments/      # 历史列表
    ├── getAssessmentDetail/  # 评估详情
    └── deleteMyData/         # 删除用户数据
```

---

## 评分算法说明

**CIRI（慢性炎症风险指数）** 采用加权综合评分：

- **症状维度（60%）**：6 个系统维度，各有权重
  - 全身与疼痛（25%）
  - 消化系统（20%）
  - 神经心理（15%）
  - 呼吸/耳鼻喉（15%）
  - 皮肤与黏膜（15%）
  - 泌尿系统（10%）
- **生活方式（40%）**：睡眠、运动、饮食、压力管理

**风险等级**：
- 🟢 低风险：0-33 分
- 🟡 中风险：34-66 分  
- 🔴 高风险：67-100 分

---

## 隐私与安全

- 所有用户数据存储在微信云开发，采用行级安全规则
- 手机号仅用于账号标识，不用于推广
- 用户可随时通过「关于」页面删除所有个人数据
- 本应用不收集位置、通讯录等敏感信息

---

## 重要免责声明

**本工具仅供健康教育参考，不构成医疗诊断或治疗建议。** 如有健康疑虑，请咨询专业医疗机构。

---

## 技术栈

- 原生微信小程序（WXML / WXSS / JS）
- 微信云开发（CloudBase）
- wx-server-sdk ~2.6.3
