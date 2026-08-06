import { getStore } from "@netlify/blobs";
import { readAccessClaims } from "../lib/access-token.mjs";

const TOKEN_LIMIT = 100_000;
const localUsage = globalThis.__xuebaLocalUsage || new Map();
globalThis.__xuebaLocalUsage = localUsage;

const SYSTEM_PROMPT = `你是“你就学霸”的 AI 学习搭子。你的任务不是一次讲完，而是根据学习者的回答调整教法。
规则：
1. 使用自然、接地气的简体中文，不说空洞鼓励话。
2. 先明确指出答对的部分，再指出一个最关键缺口。
3. 抽象概念先用生活类比，再回到真实概念。
4. 每次只处理一个概念，回答控制在 220 个汉字以内。
5. 不因为表达不专业而判错，判断核心意思是否正确。
6. 若要求评估答案，必须在最后一行输出：掌握状态：已掌握/需巩固/待学习（三选一）。`;

async function accessClaims(request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const browserId = request.headers.get("x-browser-id");
  return readAccessClaims(token, browserId);
}

async function readUsage(codeHash) {
  if (process.env.LOCAL_REDEMPTION_STORE === "true") return localUsage.get(codeHash) || { used: 0 };
  const store = getStore({ name: "xueba-token-usage", consistency: "strong" });
  return (await store.get(`usage-${codeHash}`, { type: "json" })) || { used: 0 };
}

async function writeUsage(codeHash, record) {
  if (process.env.LOCAL_REDEMPTION_STORE === "true") {
    localUsage.set(codeHash, record);
    return;
  }
  const store = getStore({ name: "xueba-token-usage", consistency: "strong" });
  await store.setJSON(`usage-${codeHash}`, record);
}

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  const claims = await accessClaims(request);
  if (!claims) {
    return Response.json({ error: "UNAUTHORIZED", message: "体验权限已失效，请重新输入体验码。" }, { status: 401 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return Response.json({
      error: "MODEL_NOT_CONFIGURED",
      message: "千问还没有配置，已切换到课程内置反馈。"
    }, { status: 503 });
  }

  try {
    const usageBefore = await readUsage(claims.codeHash);
    const usedBefore = Number(usageBefore.used) || 0;
    if (usedBefore >= TOKEN_LIMIT) {
      return Response.json({
        error: "CODE_TOKEN_LIMIT_REACHED",
        message: "这个兑换码的 10 万 Token 体验额度已经用完。",
        tokenUsage: { used: usedBefore, limit: TOKEN_LIMIT, remaining: 0 }
      }, { status: 429 });
    }

    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-8) : [];
    const model = process.env.QWEN_MODEL || "qwen-flash";
    const baseUrl = (process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1").replace(/\/$/, "");

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.35,
        max_tokens: Math.min(500, Math.max(100, TOKEN_LIMIT - usedBefore - 200)),
        enable_thinking: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const quotaEnded = data?.code === "AllocationQuota.FreeTierOnly";
      return Response.json({
        error: quotaEnded ? "FREE_QUOTA_ENDED" : "MODEL_REQUEST_FAILED",
        message: quotaEnded ? "本次免费体验额度已用完。" : "AI 暂时走神了，请稍后再试。",
        providerCode: data?.code || data?.error?.code || "UNKNOWN",
        providerMessage: data?.message || data?.error?.message || ""
      }, { status: quotaEnded ? 402 : 502 });
    }

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Empty model response");
    const tokensThisCall = Number(data?.usage?.total_tokens) ||
      (Number(data?.usage?.prompt_tokens || data?.usage?.input_tokens) + Number(data?.usage?.completion_tokens || data?.usage?.output_tokens)) || 0;
    const usedAfter = Math.min(TOKEN_LIMIT, usedBefore + tokensThisCall);
    await writeUsage(claims.codeHash, { used: usedAfter, updatedAt: new Date().toISOString() });
    return Response.json({
      text,
      model,
      tokenUsage: { used: usedAfter, limit: TOKEN_LIMIT, remaining: Math.max(0, TOKEN_LIMIT - usedAfter) }
    });
  } catch (error) {
    return Response.json({
      error: "MODEL_REQUEST_FAILED",
      message: "AI 暂时走神了，请稍后再试。"
    }, { status: 502 });
  }
};
