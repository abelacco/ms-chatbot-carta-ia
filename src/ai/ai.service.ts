import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

@Injectable()
export class AiService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL;
    this.openai = new OpenAI({ apiKey, timeout: 15 * 1000 });
    if (!apiKey || apiKey.length === 0) {
      throw new Error('OPENAI_API_KEY is missing');
    }

    this.model = model;
  }

  /**
   *
   * @param messages
   * @param model
   * @param temperature
   * @returns
   */
  async createChat(
    messages: ChatCompletionMessageParam[],
    model?: string,
    temperature = 0,
  ) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model ?? this.model,
        messages,
        temperature,
        max_tokens: 1500,
        top_p: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return completion.choices[0].message.content;
    } catch (err) {
      console.error(err);
      return 'ERROR';
    }
  }

  /**
   *
   * @param messages
   * @param model
   * @param temperature
   * @returns
   */
  async desiredDateFn(
    messages: ChatCompletionMessageParam[],
    model?: string,
    temperature = 0,
  ): Promise<{ date: string }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model ?? this.model,
        temperature: temperature,
        messages,
        functions: [
          {
            name: 'fn_desired_date',
            description:
              "determine the user's desired date in the format dd/mm/yyyy",
            parameters: {
              type: 'object',
              properties: {
                date: {
                  type: 'string',
                  description: 'dd/mm/yyyy',
                },
              },
              required: ['date'],
            },
          },
        ],
        function_call: {
          name: 'fn_desired_date',
        },
      });
      // Convert json to object
      const response = JSON.parse(
        completion.choices[0].message.function_call.arguments,
      );

      return response;
    } catch (err) {
      console.error(err);
      return {
        date: '',
      };
    }
  }

  /**
   *
   * @param messages
   * @param model
   * @param temperature
   * @returns
   */
  async checkData(
    messages: ChatCompletionMessageParam[],
    model?: string,
    temperature = 0,
  ): Promise<{ clientName: string; outOfContext: boolean }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: model ?? this.model,
        temperature: temperature,
        messages,
        functions: [
          {
            name: 'fn_check_data',
            description:
              "determine the user's information in the format clientName, businessName, businessCategory, email",
            parameters: {
              type: 'object',
              properties: {
                clientName: {
                  type: 'string',
                  description: 'Has to be the client name',
                },
                outOfContext: {
                  type: 'boolean',
                  description: 'In case the user is out of context or not',
                },
              },
              required: ['clientName', 'outOfContext'],
            },
          },
        ],
        function_call: {
          name: 'fn_check_data',
        },
      });
      // Convert json to object
      const response = JSON.parse(
        completion.choices[0].message.function_call.arguments,
      );

      return response;
    } catch (err) {
      console.error(err);
      return {
        clientName: '',
        outOfContext: false,
      };
    }
  }
}
