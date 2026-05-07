import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    const pdfData = await pdfParse(buffer);
    
    // Grabbing the first 6000 characters to stay within AI limits
    const extractedText = pdfData.text.substring(0, 6000); 

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Summarize this PDF into 3-5 bullet points." },
        { role: "user", content: extractedText }
      ],
    });

    return NextResponse.json({ summary: response.choices[0].message.content });

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}