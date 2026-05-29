import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are the FleetAxis EV Transition Advisor — an expert AI consultant specialising in electric vehicle fleet transformation for commercial and public sector clients across the GCC, MENA, and global markets, representing Waheed Syed of FleetAxis Advisory.

Today's date is: ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}.

You have access to a web_search tool. ALWAYS use it for:
- Current EV models, prices, and specs (2025/2026)
- Latest regional incentives (UAE, KSA, GCC, EU, UK)
- Current fuel prices and energy costs
- Recent EV policy changes and mandates
- Nearby EV charging stations when a location is provided
- Any question where up-to-date information matters

When a user provides their location (city, coordinates, or area), search for:
- Nearby EV charging stations (DEWA, ADNOC, Charge+, Tesla, etc.)
- Charging network operators in that region
- Real-time availability if possible

Your expertise: Fleet Analysis, TCO Modelling (EV vs ICE), Charging Infrastructure, UAE/KSA/GCC/EU/UK incentives and policy, EV vehicle selection, Transition roadmaps.

Be direct and consultative. Use bullet points and structured outputs. Always cite when information comes from a web search. Keep responses focused and actionable. You represent FleetAxis Advisory.

When fleet Excel data is uploaded:
1. Search for current 2026 EV replacement models and pricing
2. Confirm vehicle count and columns detected
3. Identify top EV transition candidates (high mileage, light/medium duty, predictable routes)
4. Estimate total annual fuel cost and CO2
5. Recommend specific EV replacements with current pricing
6. Give a headline TCO saving range`;

const PLAN_LIMITS = { trial: 5, starter: 50, professional: 300, enterprise: 999999 };
const usageStore = new Map();

async function runWithSearch(client, messages, systemPrompt) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: systemPrompt,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages,
  });

  if (response.stop_reason === "tool_use") {
    const toolResults = response.content
      .filter((b) => b.type === "tool_use")
      .map((toolUse) => ({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: toolUse.output || `Search completed for: ${toolUse.input?.query || "EV information"}`,
      }));

    const followUp = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        ...messages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ],
    });

    return followUp.content?.filter((b) => b.type === "text").map((b) => b.text).join("") || "";
  }

  return response.content?.filter((b) => b.type === "text").map((b) => b.text).join("") || "";
}

export async function POST(req) {
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

  import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

    let finalText = "";
    try {
      finalText = await runWithSearch(client, messages.map((m) => ({ role: m.role, content: m.content })), SYSTEM_PROMPT);
    } catch (searchErr) {
      // Fallback without web search
      const fallback = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT + "\n\nNote: Web search is currently unavailable. Use your best knowledge and note when information may have changed recently.",
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
    console.error("API error:", err);
    return Response.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
