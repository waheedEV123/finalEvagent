import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the FleetAxis EV Transition Advisor — an expert AI consultant specialising in electric vehicle fleet transformation for commercial and public sector clients across the GCC, MENA, and global markets, representing Waheed Syed of FleetAxis Advisory.

Today's date is May 2026.

You have access to a web_search tool. Use it for current EV models, prices, latest incentives, policy changes, and nearby charging stations when a location is provided.

Your expertise: Fleet Analysis, TCO Modelling, Charging Infrastructure, UAE/KSA/GCC/EU/UK incentives, EV vehicle selection, Transition roadmaps.

Be direct, consultative and actionable. You represent FleetAxis Advisory.`;

const PLAN_LIMITS = { trial: 5, starter: 50, professional: 300, enterprise: 999999 };
const usageStore = new Map();

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY is not set in environment variables" },
      { status: 500 }
    );
  }

  try {
    const { messages, username, plan = "trial" } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages" }, { status: 400 });
    }

    const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.trial;
    const key = username || "anonymous";
    const used = usageStore.get(key) || 0;
    if (used >= limit) {
      return Response.json({ error: "query_limit_reached", used, limit, plan }, { status: 429 });
    }

    const client = new Anthropic({ apiKey });

    let finalText = "";
    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (response.stop_reason === "tool_use") {
        const toolResults = response.content
          .filter((b) => b.type === "tool_use")
          .map((t) => ({
            type: "tool_result",
            tool_use_id: t.id,
            content: t.output || `Search done for: ${t.input?.query || "EV info"}`,
          }));

        const followUp = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "assistant", content: response.content },
            { role: "user", content: toolResults },
          ],
        });

        finalText = followUp.content?.filter((b) => b.type === "text").map((b) => b.text).join("") || "";
      } else {
        finalText = response.content?.filter((b) => b.type === "text").map((b) => b.text).join("") || "";
      }
    } catch (searchErr) {
      const fallback = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      finalText = fallback.content?.[0]?.text || "";
    }

    usageStore.set(key, used + 1);

    return Response.json({
      content: finalText || "No response.",
      usage: { used: used + 1, limit, plan },
    });

  } catch (err) {
    console.error("Chat API error:", err);
    return Response.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
