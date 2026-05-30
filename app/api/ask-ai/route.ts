import { NextRequest, NextResponse } from "next/server";
import {
  createQwenClient,
  dashscopeKeyMissingDetails,
  dashscopeKeyMissingError,
  formatDashscopeError,
  getDashscopeApiKey,
  QWEN_MODEL,
} from "@/lib/dashscope";

export async function POST(request: NextRequest) {
  const apiKey = getDashscopeApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { error: dashscopeKeyMissingError(), details: dashscopeKeyMissingDetails() },
      { status: 500 }
    );
  }

  let body: { question?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "无效的请求体" }, { status: 400 });
  }

  const { question } = body;
  if (!question?.trim()) {
    return NextResponse.json({ error: "请填写问题" }, { status: 400 });
  }

  try {
    const client = createQwenClient(apiKey);
    const completion = await client.chat.completions.create({
      model: QWEN_MODEL,
      messages: [
        {
          role: "system",
          content:
            "你是一位资深旅行顾问，用实用、温暖的语气回答旅行准备问题。回答300～500字，内容详细实用，分点说明，给出具体可执行的建议。",
        },
        { role: "user", content: question.trim() },
      ],
      max_tokens: 1500,
    });

    const answer = completion.choices[0]?.message?.content;
    if (!answer) throw new Error("API 返回了空内容");

    return NextResponse.json({ answer });
  } catch (err) {
    const { error, details } = formatDashscopeError(err);
    return NextResponse.json({ error, details }, { status: 500 });
  }
}
