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
  const explanations = [
    { label: "先打个比方", text: "你在玩‘接龙’游戏，我说出开头，你会根据经验接下一个最可能的词。大模型就像一个看过海量接龙的大高手。", note: "类比只是帮助理解。真实模型是在大量候选 Token 中计算概率。" },
    { label: "换成输入法想想", text: "手机输入法看到你打出‘周末一起’，可能联想出‘吃饭’‘看电影’。大模型做的事情有点像它，但规模、上下文长度和计算能力大得多。", note: "重点不是记住输入法，而是抓住‘根据前文预测后续’。" },
    { label: "回到真实概念", text: "文字会先被拆成 Token。模型读取已有 Token，为词表里的每个候选计算概率，再选择一个作为输出，然后把它接回上下文继续预测。", note: "这个循环不断重复，最终形成完整回答。" }
  ];
  const exp = explanations[state.explanationMode % explanations.length];
  return appShell(`<div class="teaching-layout"><section class="teaching-main"><div class="section-heading"><span class="eyebrow">第 ${state.currentUnit + 1} 单元 · 概念 1 / 3</span><h1>AI 教学区</h1><p>这里负责讲清楚；准备好了，再去独立练习区检验理解。</p></div>
    <article class="lesson-card"><div class="lesson-title"><span class="lesson-icon">◎</span><div><small>核心概念</small><h2>大模型到底在做什么？</h2></div></div><p class="lead">大模型的核心任务是：根据已有内容，预测接下来最可能出现的那个 Token。</p>
      <div class="analogy-card"><span class="analogy-icon">✦</span><div><h3>${exp.label}</h3><p>${exp.text}</p><small>${exp.note}</small></div></div>
      <div class="prediction-demo"><h3>可视化理解：下一个词预测</h3><div class="demo-flow"><div class="sentence">今天天气很好，适合</div><b>→</b><div class="model-orb">AI</div><b>→</b><div class="probabilities"><p><span>出门</span><i><em style="width:78%"></em></i><b>78%</b></p><p><span>散步</span><i><em style="width:32%"></em></i><b>12%</b></p><p><span>睡觉</span><i><em style="width:18%"></em></i><b>6%</b></p></div></div><p class="muted">模型会从大量可能的词中，选择概率较高的一个作为输出。</p></div>
      <div class="truth-note"><span>✓</span><p><b>真实概念小结</b>大模型通过统计语言中的模式与规律，学习“什么词更可能接在后面”，从而生成自然、连贯的回答。</p></div>
    </article>
    <div class="lesson-actions"><button class="button secondary" data-action="change-explanation">↻ 没听懂，换个说法</button><button class="button secondary" data-action="toggle-question">… 我有个问题</button><button class="button primary" data-action="go-practice">我理解了，去练习　→</button></div>
    <section id="ask-box" class="ask-box hidden"><label for="student-question">只问当前概念，AI 会简短回答</label><div><input id="student-question" placeholder="例如：模型为什么不总选概率最高的词？" maxlength="160" /><button class="button primary" data-action="ask-tutor">问 AI</button></div><p id="tutor-answer"></p></section>
  </section><aside class="lesson-aside"><article><h3>◎ 本节学习目标</h3>${["解释大模型的核心任务","通过类比理解工作方式","识别下一词预测的简单示例"].map((x,i)=>`<p><span>${i+1}</span>${x}<i></i></p>`).join("")}</article><article><h3>▤ 我的笔记</h3><textarea id="note" maxlength="300" placeholder="在这里记录你的想法、疑问或重点…"></textarea><button class="button small-button" data-action="save-note">保存</button></article><article><h3>⌁ 当前掌握状态</h3><div class="mastery pending">☺ <b>${state.learnedConcept ? "练习中" : "待学习"}</b></div><p class="muted">完成本节学习并练习后更新状态</p></article></aside></div>`, "today");
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
  return `<article class="feedback-panel"><div class="feedback-title">✓ 你的回答已提交，以下是反馈</div><div class="feedback-grid"><section><h3 class="green">✓ 你答对的部分</h3><p>${escapeHtml(feedback.correct)}</p></section><section><h3 class="orange">△ 还差一点</h3><p>${escapeHtml(feedback.gap)}</p></section><section><h3>✦ 再想一步</h3><p>${escapeHtml(feedback.next)}</p></section></div></article>`;
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
      : { status: "需巩固", correct: "你已经意识到模型的回答来自训练过程，而不是临时凭空产生。", gap: "需要补上“根据前文计算下一个 Token 概率”这个关键机制。", next: "先回教学区看一次输入法联想的例子，再用一句话重答。" };
  }
  return hasCore
    ? { status: "基本理解", correct: "这个例子体现了根据已有线索猜测下一项，类比成立。", gap: "再补一句类比和真实模型的区别，会更完整。", next: "真实模型预测的对象是 Token，并会为大量候选计算概率。" }
    : { status: "需巩固", correct: "你尝试用自己的经验建立类比，这是正确方向。", gap: "例子里还需要出现“根据前面的信息预测下一项”。", next: "可以想想接龙或输入法看到半句话时会怎样推荐。" };
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
      const prompt = `课程：零基础理解大模型。题目：${q.title}\n学习者回答：${answer}\n请按“答对的部分、关键缺口、再想一步”三个维度简短反馈。`;
      const modelText = await askModel([{ role: "user", content: prompt }]);
      state.practiceFeedback[index] = { status: /已掌握/.test(modelText) ? "已掌握" : "基本理解", correct: modelText.split("\n")[0] || modelText, gap: "根据反馈补充因果关系和具体例子，会更完整。", next: "试着把概念讲给一个完全不了解 AI 的朋友听。" };
    } catch {
      state.practiceFeedback[index] = fallbackFeedback(answer, index);
      toast("千问尚未配置，本题先使用课程内置反馈。");
    }
    setState({ pending: false, learnedConcept: true });
  } else {
    if (answer === undefined) return toast("先选一个答案。");
    const correct = Number(answer) === q.correct;
    state.practiceFeedback[index] = correct
      ? { status: "已掌握", correct: "选择正确，你抓住了这一步真正发生的事情。", gap: "可以继续想想这个过程怎样循环形成一整段回答。", next: "把新生成的 Token 接回上下文，模型就能继续预测下一个。" }
      : { status: "需巩固", correct: "你注意到了生成需要依据已有信息。", gap: `更准确的答案是：${q.options[q.correct]}。`, next: "回教学区看看概率条，再重新选择一次。" };
    setState({ practiceFeedback: state.practiceFeedback, learnedConcept: true });
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
    setState({ currentUnit: index });
  }
  if (action === "course-intro") toast("7 个单元，从下一词预测一路讲到 RAG 和对齐，全程不要求数学基础。");
  if (action === "change-explanation") setState({ explanationMode: state.explanationMode + 1 });
  if (action === "toggle-question") document.querySelector("#ask-box")?.classList.toggle("hidden");
  if (action === "ask-tutor") {
    const input = document.querySelector("#student-question");
    const answer = document.querySelector("#tutor-answer");
    if (!input.value.trim()) return toast("先写下你的问题。");
    target.disabled = true; target.textContent = "AI 正在想…";
    try { answer.textContent = await askModel([{ role: "user", content: `当前概念：大模型的核心任务是下一词预测。学生问题：${input.value.trim()}` }]); }
    catch (error) { answer.textContent = "可以先这样理解：模型并不是从固定答案库里拿答案，而是根据当前上下文，一步一步计算更可能出现的 Token。配置千问后，这里会变成真实 AI 回答。"; }
    target.disabled = false; target.textContent = "问 AI";
  }
  if (action === "save-note") {
    localStorage.setItem("xueba.note.unit1", document.querySelector("#note")?.value || "");
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
