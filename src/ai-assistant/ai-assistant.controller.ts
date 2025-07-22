import { Controller, Post, Body, Req } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorators';
import { Request } from 'express';
import { AiAssistantService } from './ai-assistant.service';

@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}
  @Public()
  @Post('chat')
  async chat(@Body('message') message: string, @Req() req: Request) {
    //optionally pass user context
    const userContext = {
      user: req.user,
      //fetch available services, preferences
    };
    const aiResponse = await this.aiAssistantService.getChatResponse(
      message,
      userContext,
    );
    return aiResponse;
  }
}
