import { Injectable } from '@nestjs/common';
import { WspQueriesDto } from './dto';
import { WspReceivedMessageDto } from 'src/common/dto';
import { BotService } from 'src/bot/bot.service';


@Injectable()
export class WspWebHookService {
  constructor(
    private readonly botService: BotService,
  ) {}

 // Este metodo debe servir como handler de los mensajes que llegan desde WhatsApp
 async proccessMessage(messageWSP: WspReceivedMessageDto) {
  const processMessage = await this.botService.proccessMessage(messageWSP);
  return 'OK';
}

validateWebHook(wspQueries: WspQueriesDto) {
  const myVerifyToken = process.env.MY_VERIFY_TOKEN;
  const hubMode = wspQueries['hub.mode'];
  const challenge = wspQueries['hub.challenge'];
  const verifyToken = wspQueries['hub.verify_token'];

  if (hubMode === 'subscribe' && verifyToken === myVerifyToken) {
    return challenge;
  } else {
    throw new Error(
      'Failed validation. Make sure the validation tokens match.',
    );
  }
}
}
