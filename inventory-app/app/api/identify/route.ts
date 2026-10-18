import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "placeholder_gemini_key") {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const prompt = `You are cataloging a home inventory item. Identify the object in this image.
Respond with ONLY valid JSON (no markdown, no code fences), using this exact structure:
{
  "name": "short name of the item",
  "description": "one sentence description",
  "suggestedArea": "one of: Kitchen, Living Room, Bedroom, Bathroom, Garage, Storage Room, Office, Garden, Laundry, Other",
  "suggestedSubArea": "suggested shelf/cabinet/box/location within the area",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "condition": "new or good or fair or poor"
}`;

    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      prompt,
    ]);

    const text = result.response.text().trim();
    // Strip any accidental markdown code fences
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Identify error:", err);
    return NextResponse.json({ error: "Failed to identify item" }, { status: 500 });
  }
}
