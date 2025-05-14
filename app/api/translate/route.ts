import { type NextRequest, NextResponse } from "next/server"
import { translateText, translateObject } from "@/lib/translation-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLang, sourceLang = "es", isObject = false } = body

    if (!text || !targetLang) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    let result
    if (isObject) {
      result = await translateObject(text, targetLang, sourceLang)
    } else {
      result = await translateText(text, targetLang, sourceLang)
    }

    return NextResponse.json({ translatedText: result })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json({ error: "Translation service error" }, { status: 500 })
  }
}
