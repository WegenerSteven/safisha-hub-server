import { Injectable } from '@nestjs/common';
import axios from 'axios';
@Injectable()
export class AiAssistantService {
  async getChatResponse(
    userMessage: string,
    userContext?: any,
  ): Promise<{ text: string; actions?: Array<{ label: string; to: string }> }> {
    // Build prompt with user message and context
    const prompt = `User: ${userMessage}\nContext: ${JSON.stringify(userContext)}\nAssistant:`;

    interface TogetherChatResponse {
      choices?: {
        message?: {
          content?: string;
        };
      }[];
    }

    const systemPrompt = `
You are SafishaHub AI assistant. Only answer questions related to SafishaHub, its car wash services, bookings, and platform features.
If a user asks about anything outside SafishaHub (e.g., general programming, world facts, unrelated topics), politely respond: "Sorry, I can only assist with SafishaHub-related questions and services."
When a user asks for something that requires action or navigation (e.g., booking, viewing services, accessing a page), include a JSON array called 'actions' in your response, e.g.:
{
  "text": "You can view our services or book a car wash.",
  "actions": [
    { "label": "View Services", "to": "/services" },
    { "label": "Book Now", "to": "/dashboard/bookings" }
     {"label": "Contact Us", "email US", "to": "/contact}
  ]
}
If no actions are relevant, omit the 'actions' field.
Always return your response as a JSON object with 'text' and optional 'actions'.
`;

    const response = await axios.post<TogetherChatResponse>(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const rawContent = response.data.choices?.[0]?.message?.content ?? '';
    let aiResponse: {
      text: string;
      actions?: Array<{ label: string; to: string }>;
    };
    try {
      aiResponse = JSON.parse(rawContent) as {
        text: string;
        actions?: Array<{ label: string; to: string }>;
      };
    } catch {
      aiResponse = { text: rawContent };
    }
    return aiResponse;
  }
}
