import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { HfInference } from '@huggingface/inference';

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const huggingface = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json();

    if (type === 'gemini') {
      const model = gemini.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return NextResponse.json({ result: response.text() });
    }

    if (type === 'huggingface') {
      const result = await huggingface.textGeneration({
        model: 'gpt2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.95,
        },
      });
      return NextResponse.json({ result: result.generated_text });
    }

    return NextResponse.json({ error: 'Invalid AI type specified' }, { status: 400 });
  } catch (error) {
    console.error('AI Processing Error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}