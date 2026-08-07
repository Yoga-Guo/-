const STORAGE_KEY = "xueba.learning.v1";

const units = [
  { title: "大模型到底在做什么", time: 12, concepts: ["下一词预测", "概率选择", "语言规律"] },
  { title: "文字怎样变成模型能处理的数字", time: 15, concepts: ["Token", "Embedding", "向量"] },
  { title: "神经网络怎样处理这些数字", time: 15, concepts: ["神经元", "层", "参数"] },
  { title: "大模型怎样学会回答", time: 15, concepts: ["预训练", "损失函数", "参数更新"] },
  { title: "Transformer 为什么重要", time: 18, concepts: ["注意力", "位置编码", "上下文"] },
  { title: "模型怎样生成最终答案", time: 18, concepts: ["推理", "采样", "上下文窗口"] },
  { title: "大模型为什么会出错，又怎样增强", time: 15, concepts: ["幻觉", "检索增强", "对齐"] }
];

const unitLessons = {
  0: [
    {
      title: "大模型的基本动作：预测下一个 Token",
      lead: "不管最后写出的是一句话、一段代码还是一篇文章，大模型每一步做的基本动作都一样：读取已有内容，预测下一个更可能出现的 Token。",
      analogyTitle: "先从接龙游戏开始",
      analogy: "我说“床前明月”，你很容易接出“光”。不是因为你临时查了资料，而是过去见过的语言经验让这个答案概率很高。大模型像一个做过海量接龙练习的选手，只不过它计算的对象不是完整词语，而是 Token。",
      analogyNote: "类比帮助我们建立直觉；真实模型依靠参数计算候选 Token 的概率。",
      definition: "Token 是模型处理文本的基本单位。模型先把输入拆成 Token，再结合前面所有可见 Token，计算词表中每个候选 Token 的分数和概率。",
      steps: [
        ["读上下文", "把问题和已经生成的内容放进当前上下文。"],
        ["计算候选", "为词表里的大量候选 Token 分别计算可能性。"],
        ["选出一个", "根据生成策略，从高概率候选中选出一个 Token。"],
        ["接回去再算", "把新 Token 加回上下文，然后重复整个过程。"]
      ],
      exampleTitle: "一句回答是怎样长出来的？",
      example: "输入“今天天气很好，适合”后，模型可能算出“出门”78%、“散步”12%、“睡觉”6%。选出“出门”后，句子变成“今天天气很好，适合出门”，模型再继续预测后面的内容。很多次微小预测连起来，才形成完整回答。",
      misconception: "“预测下一个 Token”不等于模型只能完成简单接龙。训练规模、参数量和上下文足够大时，预测任务会迫使模型学习语法、事实联系、表达结构，甚至一些推理模式。",
      summary: "长回答不是一次性吐出来的，而是一次次 Token 预测累积出来的。",
      check: "读到“为了把网站上线，我下一步应该……”，模型生成答案时，最先做的是查网站，还是计算下一个 Token 的概率？"
    },
    {
      title: "模型为什么不总选概率最高的词？",
      lead: "模型算出概率以后，还要决定“怎样选”。如果永远只取第一名，回答会比较稳定，却也可能机械、重复；适度保留其他高概率候选，表达会更自然。",
      analogyTitle: "像在熟悉的餐馆点菜",
      analogy: "你最常点牛肉面，但并不代表每次都必须点它。牛肉面可能有60%的选择概率，饺子25%，盖饭15%。模型生成文字也类似：高概率候选更容易被选中，但生成策略可以保留一点变化。",
      analogyNote: "这里的“概率”不是模型有喜好，而是候选 Token 在当前上下文中的相对可能性。",
      definition: "模型先输出一组分数，再转换成概率分布。温度、Top-p 等生成参数会改变候选范围和随机程度，但不会改变模型已经学到的知识本身。",
      steps: [
        ["得到分数", "模型为每个候选 Token 计算一个原始分数。"],
        ["形成概率", "把分数转换成加起来等于100%的概率分布。"],
        ["调整范围", "生成参数决定只看最有希望的候选，还是保留更多可能。"],
        ["完成采样", "选出一个 Token，并进入下一轮预测。"]
      ],
      exampleTitle: "为什么同一个问题会有不同回答？",
      example: "“给新产品写一句宣传语”没有唯一标准答案。一次可能从“让学习更简单”开头，另一次可能从“这次真正学会”开头。两次都符合上下文，只是在多个合理候选中走了不同路径。",
      misconception: "随机不等于胡说。好的生成是在合理候选中保留变化；如果放得太开，才更容易跑题。事实问答通常需要更稳定，创意写作则可以允许更多变化。",
      summary: "概率决定哪些词更可能出现，生成策略决定回答更稳定还是更多样。",
      check: "如果你希望合同摘要每次都更稳定，生成时应该增加随机性，还是降低随机性？"
    },
    {
      title: "会说得像懂了，等于真的理解世界吗？",
      lead: "大模型可以解释概念、写方案、做推理，但它获得能力的方式和人不同。分清“语言能力很强”和“拥有人的现实经验”，是理解大模型边界的关键。",
      analogyTitle: "像一位读过无数剧本的演员",
      analogy: "一位演员看过大量医生题材剧本，可能把医生说话的方式模仿得非常像，但这不代表他真的做过手术。大模型见过海量文本关系，因此能生成很专业的表达，却不自动拥有现实经历和持续感知。",
      analogyNote: "类比并不是说模型只会背台词；它能组合规律解决新问题，但信息来源和人不同。",
      definition: "模型把训练数据中的语言规律压缩进参数。它可以利用这些规律概括、组合和推导，但默认不知道此刻现实世界发生了什么，也不会因为语气肯定就自动保证事实正确。",
      steps: [
        ["从文本学习", "训练数据让模型接触词语、事实和推理步骤之间的关系。"],
        ["压缩成参数", "模型不是保存一套答案库，而是调整大量参数来表示规律。"],
        ["按上下文生成", "面对新问题时，模型利用参数和当前上下文组织回答。"],
        ["接受外部校验", "涉及实时或关键事实时，需要搜索、数据库或人工核实。"]
      ],
      exampleTitle: "它能回答天气，却不一定知道天气",
      example: "模型可以解释“下雨为什么会堵车”，因为这是常见知识关系；但如果问“北京现在下雨吗”，只靠模型参数并不可靠。只有接入实时天气工具并读取结果后，它才获得回答这个问题所需的新信息。",
      misconception: "不要走向另一个极端：模型不具备人的体验，并不代表它“只是随机拼字、什么都不会”。它确实学到了可迁移的语言和知识结构，只是能力有边界，也会自信地犯错。",
      summary: "模型擅长利用语言规律解决问题，但实时事实和高风险结论仍需工具与核验。",
      check: "如果模型很肯定地给出一条最新政策，最稳妥的下一步是什么？"
    }
  ]
};

const diagnosticQuestions = [
  {
    step: "见过哪些概念",
    question: "你对下面这些 AI 概念的熟悉程度，更接近哪一种？",
    options: ["几乎都没听过", "听过大模型和 ChatGPT", "知道 Token、神经网络等概念", "能说出它们之间的关系"]
  },
  {
    step: "理解基本原理",
    question: "你觉得大模型的‘聪明’主要来自哪里？",
    options: ["工程师写好了每一个答案", "从大量文本中学到语言规律", "能实时读取所有网站", "它和人类大脑完全一样"]
  },
  {
    step: "判断工作方式",
    question: "下面哪句话最接近大模型生成回答的方式？",
    options: [
      "先理解问题的真实含义，再从记忆里找答案",
      "根据前面的文字，持续预测下一个更可能出现的词",
      "同时搜索整个互联网，再拼出一个回答",
      "按照工程师事先写好的固定句子逐条输出"
    ]
  },
  {
    step: "识别常见误区",
    question: "当大模型说得很肯定时，下面哪种判断更稳妥？",
    options: ["语气肯定就代表事实正确", "模型不会编造不存在的信息", "仍要核实关键事实", "答案越长越可信"]
  },
  {
    step: "选择学习偏好",
    question: "遇到抽象概念时，你更希望 AI 先怎么讲？",
    options: ["先给生活类比", "先看一张结构图", "先看实际案例", "先给准确定义"]
  }
];

const practiceQuestions = [
  {
    type: "text",
    title: "为什么说大模型的核心任务是预测下一个 Token，而不是像人一样真正理解世界？",
    hint: "用你自己的话回答，1～3 句话就够了。"
  },
  {
    type: "choice",
    title: "给定“今天天气很好，适合”，大模型下一步最先做什么？",
    options: ["理解今天的真实天气", "计算候选 Token 的概率", "打开天气网站", "复制训练材料中的原句"],
    correct: 1
  },
  {
    type: "choice",
    title: "下面哪个说法最准确？",
    options: ["模型每次只能生成完整段落", "概率最高的词永远是唯一答案", "模型会逐个 Token 往后生成", "模型已经保存了全部训练原文"],
    correct: 2
  },
  {
    type: "text",
    title: "请用一个生活中的例子，解释什么叫“根据前文预测下一项”。",
    hint: "可以从接龙、歌词、输入法联想等熟悉场景里选一个。"
  },
  {
    type: "choice",
    title: "为什么同一个问题有时会得到不同回答？",
    options: ["模型心情不同", "生成时可能从多个高概率候选中采样", "网络一定出错了", "工程师临时改了固定答案"],
    correct: 1
  }
];

const defaultState = {
  accepted: false,
  view: "course",
  diagnosisIndex: 0,
  diagnosisAnswers: [],
  diagnosisDone: false,
  currentUnit: 0,
  currentConcept: 0,
  completedConcepts: {},
  learnedConcept: false,
  explanationMode: 0,
  practiceIndex: 0,
  practiceAnswers: {},
  practiceFeedback: {},
  completedUnits: [],
  weakUnits: [],
  reportReady: false,
  pending: false,
  accessToken: "",
  browserId: ""
};

let state = loadState();
if (!state.browserId) {
  state.browserId = crypto.randomUUID();
  saveState();
}

function loadState() {
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(patch, rerender = true) {
  state = { ...state, ...patch };
  saveState();
  if (rerender) render();
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function go(view) {
  setState({ view });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toast(message) {
  const el = document.querySelector("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2400);
}

function logo() {
  return `<button class="brand" data-action="go-course" aria-label="返回课程广场"><span class="brand-mark"><i></i><i></i></span><strong>你就学霸</strong></button>`;
}

function topbar({ title = "", simple = false } = {}) {
  return `<header class="topbar">
    ${logo()}
    ${simple ? `<div class="top-title">${title}</div>` : `<nav class="top-nav" aria-label="主导航">
      <button class="${state.view === "course" ? "active" : ""}" data-action="go-course">课程广场</button>
      <button class="${["roadmap", "teach", "practice", "report"].includes(state.view) ? "active" : ""}" data-action="go-roadmap">我的学习</button>
    </nav>`}
    <div class="top-actions">
      ${simple ? `<button class="text-button" data-action="go-course">暂时退出</button>` : `<span class="muted">已有进度？</span><button class="button primary compact" data-action="continue">▶ 继续学习</button>`}
    </div>
  </header>`;
}

function appShell(content, active = "today") {
  const progress = Math.round((state.completedUnits.length / units.length) * 100);
  return `${topbar({ title: units[state.currentUnit].title })}
    <div class="workspace">
      <aside class="sidebar">
        <div class="course-mini">
          <small>正在学习</small>
          <strong>零基础理解大模型是怎么工作的</strong>
          <div class="mini-progress"><span style="width:${Math.max(progress, 8)}%"></span></div>
          <small>${state.completedUnits.length} / 7 单元</small>
        </div>
        <nav class="side-nav" aria-label="学习导航">
          <button class="${active === "route" ? "active" : ""}" data-action="go-roadmap"><span>◇</span>课程路线</button>
          <button class="${active === "today" ? "active" : ""}" data-action="go-teach"><span>▣</span>今天学习</button>
          <button class="${active === "practice" ? "active" : ""}" data-action="go-practice"><span>□</span>练习与测验</button>
          <button class="${active === "map" ? "active" : ""}" data-action="show-map"><span>⌘</span>知识地图</button>
          <button class="${active === "report" ? "active" : ""}" data-action="go-report"><span>▥</span>学习报告</button>
        </nav>
        <div class="streak-card"><span class="accent">◉</span><strong>连续学习 2 天</strong><small>再接再厉，进步看得见</small><div class="streak-dots"><i></i><i></i><i></i><i></i><i></i></div></div>
      </aside>
      <main class="workspace-main">${content}</main>
    </div>`;
}

function accessView() {
  return `<main class="access-page">
    <section class="access-panel">
      ${logo()}
      <div class="access-copy">
        <span class="eyebrow">AI 自适应学习体验</span>
        <h1>这次，真把它学明白</h1>
        <p>AI 会根据你的回答调整教法。懂了就继续，没懂就换个说法再来。</p>
      </div>
      <form id="access-form" class="access-form">
        <label for="invite-code">输入兑换码</label>
        <div class="code-row"><input id="invite-code" name="code" autocomplete="one-time-code" placeholder="例如 XB-XXXX-XXXX-XXXX" required /><button class="button primary" type="submit">开始体验</button></div>
        <small>每个兑换码仅限首次兑换的浏览器使用，累计含 10 万 Token AI 额度。</small>
        <p class="form-error" id="access-error"></p>
      </form>
      <div class="access-features"><span>一次只讲一个点</span><span>答错会换个方法</span><span>真正学会再继续</span></div>
    </section>
    <aside class="access-visual"><div class="orbit one"></div><div class="orbit two"></div><div class="brain-card"><span>AI</span><strong>不是听完就算学过</strong><small>而是真的学会了再往下走</small></div></aside>
  </main>`;
}

function courseView() {
  return `${topbar()}<main class="page course-page">
    <section class="hero"><span class="eyebrow">一个会换着方法教你的 AI 学习搭子</span><h1>这次，真把它学明白</h1><p>选一门课，AI 会根据你的回答调整教法。懂了就继续，没懂就换个说法再来。</p></section>
    <section class="course-entries">
      <article class="entry-card featured">
        <div class="entry-labels"><span class="badge indigo">✦ 精品课程</span><span class="badge yellow">☆ 首门精品课</span></div>
        <h2>零基础理解大模型是怎么工作的</h2><p>7 个单元 · 每单元约 15 分钟 · 不要求数学基础</p>
        <div class="tag-row"><span>生活化类比</span><span>边学边练</span><span>学会再往下走</span></div>
        <div class="concept-visual"><div class="concept-node">思考</div><b>→</b><div class="concept-node doc">规律</div><b>→</b><div class="concept-node network">预测</div></div>
        <button class="button primary wide" data-action="start-diagnosis">▶ 开始学习</button>
      </article>
      <article class="entry-card ai-pick">
        <span class="badge mint">✦ AI 为我选课</span><h2>还没想好学什么？让 AI 帮你安排</h2><p>选方向、目的和基础，不用写长篇学习目标。</p>
        <div class="topic-grid"><button>▣ AI</button><button>⌘ 编程</button><button>◇ 产品</button><button>▥ 商业</button><button>□ 职场</button></div>
        <button class="button secondary wide" data-action="ai-course">✣ 帮我选一门</button>
      </article>
    </section>
    <section class="difference"><h2>它和普通聊天有什么不一样？</h2><div class="feature-grid">
      <article><span class="feature-icon">◎</span><div><h3>一次只讲一个点</h3><p>不让知识一股脑砸过来</p></div></article>
      <article><span class="feature-icon mint-icon">…</span><div><h3>答错会换个方法</h3><p>根据你的回答补讲</p></div></article>
      <article><span class="feature-icon yellow-icon">✓</span><div><h3>真正学会再继续</h3><p>练习和测评不挤在聊天里</p></div></article>
    </div></section>
  </main>`;
}

function diagnosticView() {
  const index = state.diagnosisIndex;
  const question = diagnosticQuestions[index];
  const selected = state.diagnosisAnswers[index];
  return `${topbar({ simple: true, title: "零基础理解大模型是怎么工作的" })}
    <main class="diagnostic-layout">
      <aside class="diagnostic-steps"><h2>入学小测</h2><p>不用紧张，只是帮 AI 找到适合你的讲法</p><ol>${diagnosticQuestions.map((item, i) => `<li class="${i === index ? "active" : i < index ? "done" : ""}"><span>${i < index ? "✓" : i + 1}</span><b>${item.step}</b></li>`).join("")}</ol><strong class="step-count">已完成 <em>${index}</em> / 5</strong></aside>
      <section class="diagnostic-main">
        <div class="question-meta"><strong>第 ${index + 1} 题 <span>/ 共 5 题</span></strong><span class="badge yellow">☆ 没有分数，不会影响课程</span></div>
        <div class="progress-bar"><span style="width:${((index + 1) / 5) * 100}%"></span></div>
        <article class="question-card"><h1>${question.question}</h1><div class="option-grid">${question.options.map((option, i) => `<button class="option ${selected === i ? "selected" : ""}" data-action="select-diagnostic" data-index="${i}"><span>${String.fromCharCode(65 + i)}</span><b>${option}</b>${selected === i ? "<i>✓</i>" : ""}</button>`).join("")}</div><div class="question-actions"><button class="button secondary" data-action="diagnostic-prev" ${index === 0 ? "disabled" : ""}>上一题</button><button class="button primary" data-action="diagnostic-next" ${selected === undefined ? "disabled" : ""}>${index === 4 ? "查看学习路线" : "确认并继续"}</button></div><p class="center muted">选择最接近你当前理解的一项就好</p></article>
      </section>
      <aside class="diagnostic-info"><article><h3>为什么先做小测？</h3><div><span>≫</span><p><b>跳过你已经会的</b><small>节省时间，直奔重点。</small></p></div><div><span>▥</span><p><b>难点多讲一点</b><small>针对你的薄弱点，多用例子和类比。</small></p></div><div><span>○</span><p><b>把例子换成你熟悉的</b><small>结合你的场景，学得更快、更好懂。</small></p></div></article><div class="info-note">◷ 所有题目都是选择题，<br />大约 2 分钟完成。</div></aside>
    </main>`;
}

function roadmapView() {
  return `${topbar({ simple: true, title: "课程广场　/　零基础理解大模型是怎么工作的" })}
    <main class="roadmap-page">
      <section class="route-hero"><div><span class="success-label">● 入学小测完成</span><h1>路线排好了，从你真正需要的地方开始</h1><p>你已经知道一点 AI，但核心原理还不够牢。前两单元会讲得更快，Transformer 和生成过程会多放几个例子。</p></div><article class="start-profile"><h3>你的起点</h3><p><span>◇ 当前基础</span><b>听说过一些</b></p><p><span>◎ 学习目标</span><b>了解基础</b></p><p><span>◷ 学习节奏</span><b>每次 15 分钟</b></p></article></section>
      <div class="route-content"><section class="units-panel"><h2>7 个学习单元</h2><div class="unit-grid">${units.map((unit, i) => {
        const completed = state.completedUnits.includes(i);
        const active = i === state.currentUnit;
        const badge = i === 0 ? "建议快速学习" : i === 1 ? "基础衔接" : [4, 5].includes(i) ? "重点单元" : "按路线学习";
        return `<button class="unit-card ${active ? "active" : ""} ${completed ? "done" : ""}" data-action="select-unit" data-index="${i}"><span class="unit-number">${completed ? "✓" : i + 1}</span><div><strong>${unit.title}</strong><small>◷ 约 ${unit.time} 分钟</small></div><em class="${[4,5].includes(i) ? "warm" : ""}">${badge}</em>${active ? "<i>▶</i>" : ""}</button>`;
      }).join("")}</div></section>
      <aside class="route-aside"><article class="coach-flow"><h2>AI 会怎么陪你学</h2>${[["▤","讲一个概念","用简单的例子帮你建立直观理解"],["?","问一道题","检查你是否真正理解了"],["✣","根据回答补讲","只补你没掌握的部分"],["⚑","掌握后进入下一点","循序渐进，稳步前进"]].map(x => `<div><span>${x[0]}</span><p><b>${x[1]}</b><small>${x[2]}</small></p></div>`).join("")}<p class="muted small">练习和测评会在独立区域完成，不会全塞进聊天窗口。</p></article><article class="today-card"><h3>▣ 今天先完成第 ${state.currentUnit + 1} 单元</h3><p>预计 ${units[state.currentUnit].time} 分钟 · 3 个知识点 · 5 次理解检查</p><button class="button primary wide" data-action="go-teach">▶ 开始第 ${state.currentUnit + 1} 单元</button><button class="text-button" data-action="course-intro">先看看课程介绍</button></article></aside></div>
      <div class="route-note">ⓘ 路线可以随学习表现微调，但 7 个核心单元不会缺席。</div>
    </main>`;
}

function teachView() {
  const fallbackLessons = units[state.currentUnit].concepts.map((concept) => ({
    title: concept,
    lead: `这一节会从直觉、原理、例子和常见误区四个角度，把“${concept}”真正讲明白。`,
    analogyTitle: "先建立一个直观印象",
    analogy: `${concept}不是一个需要死记的名词。先观察它解决什么问题，再回到它在大模型中的准确位置。`,
    analogyNote: "本单元的精品正文正在按同一教学标准扩写。",
    definition: `${concept}是“${units[state.currentUnit].title}”中的关键环节，需要结合前后知识点一起理解。`,
    steps: [["先看问题", "理解它为什么会被需要。"], ["再看机制", "拆开它在模型内部怎样工作。"], ["最后看边界", "区分它能解决什么、不能解决什么。"]],
    exampleTitle: "放进完整流程里看",
    example: `把${concept}放回大模型从输入到输出的流程中，会比只背定义更容易理解。`,
    misconception: `只记住“${concept}”的名词解释，并不等于真正掌握；还要能说明原因并举出例子。`,
    summary: `掌握${concept}，要同时说清“是什么、为什么、怎样工作”。`,
    check: `你能用自己的话说说${concept}解决了什么问题吗？`
  }));
  const lessons = unitLessons[state.currentUnit] || fallbackLessons;
  const conceptIndex = Math.min(Number(state.currentConcept) || 0, lessons.length - 1);
  const lesson = lessons[conceptIndex];
  const completed = state.completedConcepts?.[state.currentUnit] || [];
  const nextLabel = conceptIndex === lessons.length - 1 ? "完成本单元教学，去练习" : `完成本概念，继续概念 ${conceptIndex + 2}`;
  const askPlaceholder = conceptIndex === 0 ? "例如：为什么预测下一个 Token 也能回答复杂问题？" : conceptIndex === 1 ? "例如：随机性越高，回答就越好吗？" : "例如：模型到底算不算理解语言？";

  return appShell(`<div class="teaching-layout"><section class="teaching-main">
    <div class="section-heading"><span class="eyebrow">第 ${state.currentUnit + 1} 单元 · 概念 ${conceptIndex + 1} / ${lessons.length}</span><h1>AI 教学区</h1><p>先在这里把概念学透；完成本单元全部概念后，再去独立练习区检验理解。</p></div>
    <nav class="concept-progress" aria-label="本单元知识点">${lessons.map((item, i) => `<button class="${i === conceptIndex ? "active" : completed.includes(i) ? "done" : ""}" data-action="concept-jump" data-index="${i}"><span>${completed.includes(i) ? "✓" : i + 1}</span><b>${item.title}</b><small>${i === conceptIndex ? "正在学习" : completed.includes(i) ? "已学完" : "待学习"}</small></button>`).join("")}</nav>
    <article class="lesson-card">
      <div class="lesson-title"><span class="lesson-icon">◎</span><div><small>核心概念 ${conceptIndex + 1}</small><h2>${lesson.title}</h2></div></div>
      <p class="lead">${lesson.lead}</p>
      <div class="analogy-card"><span class="analogy-icon">✦</span><div><h3>${lesson.analogyTitle}</h3><p>${lesson.analogy}</p><small>${lesson.analogyNote}</small></div></div>
      <section class="lesson-section"><span class="section-number">01</span><div><small>回到准确概念</small><h3>它在模型里究竟是什么？</h3><p>${lesson.definition}</p></div></section>
      <section class="lesson-section"><span class="section-number">02</span><div><small>一步一步拆开</small><h3>它是怎样工作的？</h3><ol class="mechanism-steps">${lesson.steps.map(([title, text], i) => `<li><span>${i + 1}</span><p><b>${title}</b><small>${text}</small></p></li>`).join("")}</ol></div></section>
      <section class="lesson-section example-section"><span class="section-number">03</span><div><small>放进真实场景</small><h3>${lesson.exampleTitle}</h3><p>${lesson.example}</p>${conceptIndex === 0 ? `<div class="prediction-demo compact-demo"><div class="demo-flow"><div class="sentence">今天天气很好，适合</div><b>→</b><div class="model-orb">AI</div><b>→</b><div class="probabilities"><p><span>出门</span><i><em style="width:78%"></em></i><b>78%</b></p><p><span>散步</span><i><em style="width:32%"></em></i><b>12%</b></p><p><span>睡觉</span><i><em style="width:18%"></em></i><b>6%</b></p></div></div></div>` : ""}</div></section>
      <section class="misconception-card"><span>!</span><div><small>最容易踩的坑</small><h3>别把概念理解成这样</h3><p>${lesson.misconception}</p></div></section>
      <div class="truth-note"><span>✓</span><p><b>这一概念的真正结论</b>${lesson.summary}</p></div>
      <section class="self-check"><span>?</span><div><small>离开页面前，先在心里回答</small><h3>${lesson.check}</h3><p>不需要现在提交答案。能用自己的话解释清楚，再进入下一个概念。</p></div></section>
    </article>
    <div class="lesson-actions expanded"><button class="button secondary" data-action="concept-prev" ${conceptIndex === 0 ? "disabled" : ""}>← 上一个概念</button><button class="button secondary" data-action="toggle-question">… 我有个问题</button><button class="button primary" data-action="concept-next">${nextLabel}　→</button></div>
    <section id="ask-box" class="ask-box hidden"><label for="student-question">哪里没懂就问哪里，AI 会围绕当前概念展开讲解</label><div><input id="student-question" placeholder="${askPlaceholder}" maxlength="200" /><button class="button primary" data-action="ask-tutor">问 AI</button></div><p id="tutor-answer"></p></section>
    <button class="floating-next" data-action="concept-next"><small>${conceptIndex + 1} / ${lessons.length}</small><b>${nextLabel}</b><span>→</span></button>
  </section><aside class="lesson-aside"><article><h3>◎ 本概念学习目标</h3>${["先用类比建立直觉","理解真实工作机制","能识别常见误区"].map((x,i)=>`<p><span>${i+1}</span>${x}<i></i></p>`).join("")}</article><article><h3>▤ 我的笔记</h3><textarea id="note" maxlength="500" placeholder="记录你的想法、疑问或重点…">${escapeHtml(localStorage.getItem(`xueba.note.${state.currentUnit}.${conceptIndex}`) || "")}</textarea><button class="button small-button" data-action="save-note">保存</button></article><article><h3>⌁ 本单元进度</h3><div class="mastery pending">☺ <b>${completed.length} / ${lessons.length}</b></div><p class="muted">三个概念全部学完后进入练习区</p></article></aside></div>`, "today");
}

function practiceView() {
  const index = state.practiceIndex;
  const question = practiceQuestions[index];
  const answer = state.practiceAnswers[index];
  const feedback = state.practiceFeedback[index];
  return appShell(`<div class="practice-layout"><aside class="practice-list"><h2>大模型基础入门</h2><p>共 5 题</p>${practiceQuestions.map((q,i)=>`<button class="${i===index?"active":""} ${state.practiceFeedback[i]?"done":""}" data-action="practice-jump" data-index="${i}"><span>${i+1}</span><b>${i===0?"什么是大模型？":i===1?"大模型如何预测？":i===2?"生成过程":i===3?"举个例子":"理解差异"}</b><small>${state.practiceFeedback[i]?"✓ 已作答":i===index?"● 进行中":"○ 未作答"}</small></button>`).join("")}<button class="button secondary wide bottom-button" data-action="go-roadmap">⌂ 返回课程总览</button></aside>
    <section class="practice-main"><div class="practice-heading"><div><h1>独立练习区</h1><p>理解检查 · 第 ${index+1} 题 / 共 5 题</p></div><div class="zone-switch"><button data-action="go-teach">AI 教学区</button><button class="active">独立练习区</button></div></div>
      <article class="practice-card"><h2>${question.title}</h2><p class="muted">${question.type === "text" ? question.hint : "选择一个最准确的答案"}</p>${question.type === "text" ? `<textarea id="practice-answer" maxlength="180" placeholder="写下你的理解…">${escapeHtml(answer || "")}</textarea><div class="answer-count">${String(answer||"").length}/180</div>` : `<div class="practice-options">${question.options.map((opt,i)=>`<button class="${Number(answer)===i?"selected":""}" data-action="select-practice" data-index="${i}"><span>${String.fromCharCode(65+i)}</span>${opt}</button>`).join("")}</div>`}<div class="practice-actions"><button class="button primary" data-action="submit-practice" ${state.pending ? "disabled" : ""}>${state.pending ? "AI 正在看你的回答…" : feedback ? "重新提交" : "提交回答"}</button>${question.type === "text" ? `<button class="button secondary" data-action="show-hint">✦ 给我一个小提示</button>` : ""}<button class="text-button" data-action="go-teach">← 回到教学区复习</button></div></article>
      ${feedback ? feedbackPanel(feedback) : `<div class="empty-feedback"><span>✓</span><p>提交后，AI 会告诉你答对了什么、还差什么。</p></div>`}
      <div class="practice-nav"><button class="button secondary" data-action="practice-prev" ${index===0?"disabled":""}>上一题</button><button class="button primary" data-action="practice-next" ${!feedback?"disabled":""}>${index===4?"完成本单元":"下一题"}</button></div>
    </section><aside class="practice-aside"><article><h3>本题考查</h3><div class="tag-row"><span>核心含义</span><span>因果理解</span><span>自己的话表达</span></div></article><article><h3>当前状态：<em>${feedback?.status || "待作答"}</em></h3><p>${feedback ? "已经完成一次理解检查，可以根据反馈补充后重试。" : "先独立想一想，不需要追求专业术语。"}</p></article><article class="tip-card"><h3>✦ 练习小贴士</h3><p>用“是什么 + 为什么 + 例子”的结构回答，会更清晰有说服力。</p></article></aside></div>`, "practice");
}

function feedbackPanel(feedback) {
  return `<article class="feedback-panel"><div class="feedback-title">${feedback.status === "已掌握" ? "✓" : "↻"} AI 根据你的答案进行了针对性讲解</div><div class="feedback-grid"><section><h3 class="green">✓ 你已经理解的部分</h3><p>${escapeHtml(feedback.correct)}</p></section><section><h3 class="orange">△ 真正卡住的地方</h3><p>${escapeHtml(feedback.gap)}</p></section><section class="reteach-section"><h3>✦ 换一种方法重新讲</h3><p>${escapeHtml(feedback.reteach || "把这个概念放回具体例子中再看一次，会更容易抓住关键区别。")}</p></section><section class="next-check"><h3>? 现在再想一步</h3><p>${escapeHtml(feedback.next)}</p></section></div></article>`;
}

function reportView() {
  const complete = state.completedUnits.length || (state.reportReady ? 1 : 0);
  return appShell(`<section class="report-page"><div class="report-heading"><h1>欢迎回来，继续把大模型学明白 ✦</h1><button class="button primary" data-action="continue">▶ 继续学习</button></div>
    <section class="progress-hero"><div class="big-progress"><small>当前进度</small><strong>${Math.max(complete,1)}<em>/ 7</em></strong><span>单元</span><div class="progress-bar"><i style="width:${Math.max(complete/7*100,14)}%"></i></div></div><div class="last-study"><small>上次学习</small><h2>${units[state.currentUnit].title}</h2><p>${state.reportReady ? "你已经完成本单元的练习，可以继续下一个知识点。" : "理解了本节核心结构，继续完成独立练习。"}</p><button class="button primary" data-action="continue">▶ 继续学习</button></div><div class="report-illustration">▤<span>✓</span></div></section>
    <div class="report-grid"><section class="route-summary"><h2>课程路线</h2><div class="summary-units">${units.map((u,i)=>`<article class="${state.completedUnits.includes(i)?"mastered":i===state.currentUnit?"current":"locked"}"><span>${i+1}</span><b>${u.title}</b><small>${state.completedUnits.includes(i)?"已掌握":i===state.currentUnit?"学习中":"待学习"}</small></article>`).join("")}</div></section><section class="week-summary"><h2>本周学习</h2><div><article><b>▤ 学习 3 次</b><small>较上周 +1</small></article><article><b>✓ 完成 ${complete} 单元</b><small>继续保持</small></article><article><b>? 问答题 12 道</b><small>正确率 83%</small></article><article><b>◉ 连续学习 2 天</b><small>继续保持哦</small></article></div></section></div>
    <section class="knowledge-section"><div><h2>知识掌握地图</h2><p><b class="green">✓ 已掌握</b>${["Token","Embedding","神经网络","下一词预测"].map(x=>`<span class="knowledge mastered">${x}</span>`).join("")}</p><p><b class="orange">↻ 需巩固</b>${["Transformer 结构","自注意力","位置编码"].map(x=>`<span class="knowledge weak">${x}</span>`).join("")}</p><p><b>□ 待学习</b>${["推理","RAG","检索","微调","对齐","评测"].map(x=>`<span class="knowledge">${x}</span>`).join("")}</p></div><article class="ai-advice"><h2>✦ AI 给你的学习建议</h2><b>下一步建议：深入理解损失函数</b><p>你在 Transformer 结构上已经打下基础，接下来理解“模型怎样知道自己答错”，会更顺畅。</p><button class="button primary" data-action="continue">去学习</button></article></section>
    <section class="stage-report"><div><div class="section-title"><h2>▤ 阶段学习报告</h2><button class="text-button">查看完整报告 ›</button></div><div class="insight-grid"><article><h3 class="green">✓ 你的优势</h3><p>能抓住大模型的核心任务，并用自己的话解释下一词预测。</p></article><article><h3 class="orange">△ 易错点 / 常见误区</h3><p>容易混淆“语言规律”和“理解现实”，建议结合示例再巩固。</p></article><article><h3>✦ 你偏好的讲解方式</h3><p>你更适合“图示 + 步骤拆解”的方式，后续会优先这样讲。</p></article></div></div><article class="share-card"><small>课程完成后可生成分享卡片</small><h3>我在「你就学霸」学会了</h3><strong>零基础理解大模型是怎么工作的</strong><p>从 0 到 1，真正理解大模型的原理与应用</p><button class="button secondary">预览效果 ↗</button></article></section>
  </section>`, "report");
}

function render() {
  const root = document.querySelector("#app");
  if (!state.accepted) {
    root.innerHTML = accessView();
    bindForms();
    return;
  }
  const views = { course: courseView, diagnostic: diagnosticView, roadmap: roadmapView, teach: teachView, practice: practiceView, report: reportView };
  root.innerHTML = (views[state.view] || courseView)();
  bindForms();
}

function bindForms() {
  document.querySelector("#access-form")?.addEventListener("submit", verifyAccess);
  document.querySelector("#practice-answer")?.addEventListener("input", (event) => {
    state.practiceAnswers[state.practiceIndex] = event.target.value;
    saveState();
    const counter = document.querySelector(".answer-count");
    if (counter) counter.textContent = `${event.target.value.length}/180`;
  });
}

async function verifyAccess(event) {
  event.preventDefault();
  const code = new FormData(event.currentTarget).get("code")?.trim();
  const error = document.querySelector("#access-error");
  try {
    const response = await fetch("/api/verify-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, browserId: state.browserId }) });
    const result = await response.json();
    if (result.valid) setState({ accepted: true, accessToken: result.token || "", view: "course" });
    else if (result.reason === "CODE_ALREADY_USED") error.textContent = "这个兑换码已经绑定了其他浏览器。";
    else if (result.reason === "SERVICE_UNAVAILABLE") error.textContent = "兑换服务暂时不可用，请稍后再试。";
    else error.textContent = "兑换码不对，再检查一下。";
  } catch {
    error.textContent = "暂时无法连接兑换服务，请稍后再试。";
  }
}

async function askModel(messages) {
  const response = await fetch("/api/tutor", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${state.accessToken || ""}`, "X-Browser-ID": state.browserId }, body: JSON.stringify({ messages }) });
  if (!response.ok) throw new Error((await response.json()).message || "模型暂不可用");
  return (await response.json()).text;
}

function fallbackFeedback(answer, questionIndex) {
  const text = String(answer || "");
  const hasCore = /预测|概率|下一个|后面|接龙|输入法|规律/.test(text);
  if (questionIndex === 0) {
    return hasCore
      ? { status: "基本理解", correct: "你抓住了“根据上下文预测后续”这个核心，方向是对的。", gap: "还可以再明确：模型学到的是语言中的统计规律，不等于拥有人的现实经验和意图。", next: "如果模型只是在预测，它为什么仍能表现出推理能力？可以带着这个问题进入下一课。" }
      : { status: "需巩固", correct: "你已经意识到模型的回答来自训练过程，而不是临时凭空产生。", gap: "你把“模型从训练中学到规律”和“模型生成时正在做什么”混在了一起。生成当下最关键的动作，是根据已有上下文计算下一个 Token 的概率。", reteach: "把它想成输入法联想：输入法过去学过大量表达，但你打出“周末一起”时，它此刻做的不是重新学习，而是根据这几个字预测“吃饭、看电影”等后续。大模型的规模更大、计算更复杂，但每一步生成仍是类似的预测过程。", next: "现在用“训练时学规律，生成时做预测”这个结构，再回答一次。" };
  }
  return hasCore
    ? { status: "基本理解", correct: "这个例子体现了根据已有线索猜测下一项，类比成立。", gap: "再补一句类比和真实模型的区别，会更完整。", reteach: "生活中的猜测通常只面对少量选项；真实模型会把文字拆成 Token，并同时给词表里的大量候选计算概率。", next: "你的例子中，哪些内容相当于“已有上下文”，哪一项相当于“下一个 Token”？" }
    : { status: "需巩固", correct: "你尝试用自己的经验建立类比，这是正确方向。", gap: "例子里还没有清楚出现“依据前面的信息，预测接下来的一项”这个因果关系。", reteach: "想象接龙：前一个人说“床前明月”，你根据过去见过的语言规律接“光”。前面的四个字是上下文，“光”是被预测的下一项。模型也是利用已有内容预测后续，只是它面对的候选更多。", next: "换成输入法、歌词或接龙中的任意一个例子，再明确指出“依据什么，预测什么”。" };
}

function parseModelFeedback(text, fallback) {
  try {
    const clean = String(text || "").replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const data = JSON.parse(clean);
    if (!data.correct || !data.gap || !data.reteach || !data.next) return fallback;
    return {
      status: ["已掌握", "需巩固", "待学习"].includes(data.status) ? data.status : fallback.status,
      correct: String(data.correct),
      gap: String(data.gap),
      reteach: String(data.reteach),
      next: String(data.next)
    };
  } catch {
    return fallback;
  }
}

async function getAdaptiveFeedback({ question, answer, correctAnswer = "", isCorrect = false, fallback }) {
  const prompt = `你正在评估“零基础理解大模型”精品课中的一道题。
题目：${question}
学习者答案：${answer}
${correctAnswer ? `参考答案：${correctAnswer}\n本次是否答对：${isCorrect ? "是" : "否"}` : "请判断核心意思，不要求专业术语。"}

请根据这一个具体答案进行诊断。答错时，先分析学习者为什么会这样选，以及混淆了哪两个概念；然后换一个生活类比重新讲准确机制，不能只公布正确答案。答对时也要指出理由和边界。
只输出一个 JSON 对象，字段必须是：
{"status":"已掌握/需巩固/待学习","correct":"已经理解的部分，40～90字","gap":"具体错因或关键缺口，60～120字","reteach":"针对错因的重新讲解，150～260字，包含类比和准确原理","next":"一道用于确认理解的小问题，30～70字"}`;
  const modelText = await askModel([{ role: "user", content: prompt }]);
  return parseModelFeedback(modelText, fallback);
}

async function submitPractice() {
  const index = state.practiceIndex;
  const q = practiceQuestions[index];
  let answer = state.practiceAnswers[index];
  if (q.type === "text") {
    answer = document.querySelector("#practice-answer")?.value.trim();
    if (!answer || answer.length < 8) return toast("再多写一点点，让 AI 看得懂你的想法。");
    state.practiceAnswers[index] = answer;
    setState({ pending: true });
    try {
      const fallback = fallbackFeedback(answer, index);
      state.practiceFeedback[index] = await getAdaptiveFeedback({ question: q.title, answer, fallback });
    } catch {
      state.practiceFeedback[index] = fallbackFeedback(answer, index);
      toast("AI 暂时没有响应，本题先使用课程内置讲解。");
    }
    setState({ pending: false, learnedConcept: true });
  } else {
    if (answer === undefined) return toast("先选一个答案。");
    const correct = Number(answer) === q.correct;
    const selectedText = q.options[Number(answer)];
    const correctText = q.options[q.correct];
    const fallback = correct
      ? { status: "已掌握", correct: `你选择了“${selectedText}”，抓住了这一步真正发生的事情。`, gap: "这一题已经答对。还要注意，这只是一次预测；完整回答需要把新 Token 接回上下文并重复很多次。", reteach: "可以把它想成走路：选出一个 Token 只迈出了一步。模型把这一步接到原句后面，再重新观察整个上下文，决定下一步往哪里走，最终才形成完整段落。", next: "新 Token 生成后，模型为什么要把它重新放回上下文？" }
      : { status: "需巩固", correct: "你注意到模型生成需要依据已有信息，这个方向是对的。", gap: `你选择了“${selectedText}”，说明你把模型的语言生成和获取外部事实混在了一起。当前步骤并不会自动访问现实世界。`, reteach: `模型此刻真正拿到的是题目中的文字。它先把文字拆成 Token，再计算候选 Token 的概率；因此更准确的答案是“${correctText}”。就像输入法看到半句话时先做联想，而不是替你去调查现实情况。`, next: "如果确实需要获取今天的真实天气，除了语言模型本身，还要接入什么？" };
    setState({ pending: true });
    try {
      state.practiceFeedback[index] = await getAdaptiveFeedback({ question: q.title, answer: selectedText, correctAnswer: correctText, isCorrect: correct, fallback });
    } catch {
      state.practiceFeedback[index] = fallback;
      toast("AI 暂时没有响应，本题先使用课程内置讲解。");
    }
    setState({ pending: false, practiceFeedback: state.practiceFeedback, learnedConcept: true });
  }
}

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "go-course") go("course");
  if (action === "go-roadmap") go("roadmap");
  if (action === "go-teach") go("teach");
  if (action === "go-practice") go("practice");
  if (action === "go-report") go("report");
  if (action === "continue") go(state.diagnosisDone ? (state.learnedConcept ? "practice" : "teach") : "diagnostic");
  if (action === "start-diagnosis") setState({ view: state.diagnosisDone ? "roadmap" : "diagnostic" });
  if (action === "ai-course") toast("AI 选课入口将在精品课跑通后开放。首版先把这门课打磨好。");
  if (action === "select-diagnostic") {
    state.diagnosisAnswers[state.diagnosisIndex] = Number(target.dataset.index);
    setState({ diagnosisAnswers: state.diagnosisAnswers });
  }
  if (action === "diagnostic-prev" && state.diagnosisIndex > 0) setState({ diagnosisIndex: state.diagnosisIndex - 1 });
  if (action === "diagnostic-next") {
    if (state.diagnosisAnswers[state.diagnosisIndex] === undefined) return;
    if (state.diagnosisIndex === 4) setState({ diagnosisDone: true, view: "roadmap" });
    else setState({ diagnosisIndex: state.diagnosisIndex + 1 });
  }
  if (action === "select-unit") {
    const index = Number(target.dataset.index);
    if (index > Math.max(state.completedUnits.length, 0)) return toast("先完成前面的单元，这一课就会解锁。");
    setState({ currentUnit: index, currentConcept: 0, learnedConcept: false, practiceIndex: 0, practiceAnswers: {}, practiceFeedback: {} });
  }
  if (action === "course-intro") toast("7 个单元，从下一词预测一路讲到 RAG 和对齐，全程不要求数学基础。");
  if (action === "concept-jump") {
    const index = Number(target.dataset.index);
    const completed = state.completedConcepts?.[state.currentUnit] || [];
    if (index > Math.min(completed.length, 2)) return toast("先学完当前概念，下一个就会解锁。");
    setState({ currentConcept: index });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (action === "concept-prev" && state.currentConcept > 0) {
    setState({ currentConcept: state.currentConcept - 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  if (action === "concept-next") {
    const lessons = unitLessons[state.currentUnit] || units[state.currentUnit].concepts;
    const current = Math.min(Number(state.currentConcept) || 0, lessons.length - 1);
    const completedConcepts = { ...(state.completedConcepts || {}) };
    completedConcepts[state.currentUnit] = [...new Set([...(completedConcepts[state.currentUnit] || []), current])].sort((a, b) => a - b);
    if (current < lessons.length - 1) {
      setState({ completedConcepts, currentConcept: current + 1 });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setState({ completedConcepts, learnedConcept: true, view: "practice" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("三个概念已学完，现在用练习检验是否真正掌握。");
    }
  }
  if (action === "toggle-question") document.querySelector("#ask-box")?.classList.toggle("hidden");
  if (action === "ask-tutor") {
    const input = document.querySelector("#student-question");
    const answer = document.querySelector("#tutor-answer");
    if (!input.value.trim()) return toast("先写下你的问题。");
    target.disabled = true; target.textContent = "AI 正在想…";
    const lessons = unitLessons[state.currentUnit] || [];
    const currentLesson = lessons[state.currentConcept];
    try { answer.textContent = await askModel([{ role: "user", content: `你正在精品课教学区答疑。当前单元：${units[state.currentUnit].title}。当前概念：${currentLesson?.title || units[state.currentUnit].concepts[state.currentConcept]}。学生问题：${input.value.trim()}。请先判断学生卡在哪里，再用一个贴近生活的类比和准确原理展开说明，最后用一个小问题确认理解。不要只给一句话。` }]); }
    catch (error) { answer.textContent = "可以先这样理解：模型并不是从固定答案库里拿答案，而是根据当前上下文，一步一步计算更可能出现的 Token。配置千问后，这里会变成真实 AI 回答。"; }
    target.disabled = false; target.textContent = "问 AI";
  }
  if (action === "save-note") {
    localStorage.setItem(`xueba.note.${state.currentUnit}.${state.currentConcept}`, document.querySelector("#note")?.value || "");
    toast("笔记已保存在这个浏览器里。");
  }
  if (action === "select-practice") {
    state.practiceAnswers[state.practiceIndex] = Number(target.dataset.index);
    setState({ practiceAnswers: state.practiceAnswers });
  }
  if (action === "submit-practice") await submitPractice();
  if (action === "show-hint") toast("先从“它在预测什么”以及“它没有什么人类经验”两个方向想。");
  if (action === "practice-jump") setState({ practiceIndex: Number(target.dataset.index) });
  if (action === "practice-prev" && state.practiceIndex > 0) setState({ practiceIndex: state.practiceIndex - 1 });
  if (action === "practice-next") {
    if (!state.practiceFeedback[state.practiceIndex]) return;
    if (state.practiceIndex < 4) setState({ practiceIndex: state.practiceIndex + 1 });
    else {
      const completed = [...new Set([...state.completedUnits, state.currentUnit])];
      setState({ completedUnits: completed, reportReady: true, view: "report" });
      toast("第 1 单元完成，学习报告已经更新。");
    }
  }
  if (action === "show-map") { go("report"); setTimeout(() => document.querySelector(".knowledge-section")?.scrollIntoView({ behavior: "smooth" }), 80); }
});

render();
