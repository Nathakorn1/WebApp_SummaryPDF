import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAuth } from '@clerk/nextjs/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const text = buffer.toString('latin1');
    const matches = text.match(/BT[\s\S]*?ET/g) || [];
    const extractedText = matches
      .join(' ')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 6000);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(
      `Summarize this PDF content into 3-5 bullet points:\n\n${extractedText || "No text could be extracted."}`
    );

    const summary = result.response.text();
    return NextResponse.json({ summary });

  } catch (error) {
    console.error("Backend Error:", JSON.stringify(error, null, 2));
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}