import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatCompletionMessageParam } from 'openai/resources';


@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async createChat(
    @Body() body: { messages: ChatCompletionMessageParam[]; model?: string; temperature?: number }
  ) {
    try {
      const { messages, model, temperature } = body;
      const response = await this.aiService.createChat(messages, model, temperature);
      return { response };
    } catch (error) {
      console.error(error);
      return { response: 'ERROR' };
      // throw new HttpException('Failed to create chat completion', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}
