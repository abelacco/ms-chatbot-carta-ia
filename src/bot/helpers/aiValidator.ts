import { AiService } from 'src/ai/ai.service';
import { Ctx } from 'src/context/entities/ctx.entity';

export class AiValidator {
  // constructor(private aiService: AiService) {}
  // async analyzeMessage(ctx: Ctx, historyParsed: any) {
  //   const prompt =
  //     `Como una inteligencia artificial avanzada, tu tarea es analizar el contexto de una conversación y determinar cuál de las siguientes acciones es más apropiada para realizar:
  //     --------------------------------------------------------
  //     Historial de conversación:
  //     {HISTORY}
  //     Posibles acciones a realizar:
  //     1. INFO: Esta acción se debe realizar cuando el cliente desea conocer más sobre los platos disponibles o tiene preguntas específicas sobre el menú.
  //     2. ORDER: Esta acción se debe realizar cuando el cliente está listo para hacer un pedido.
  //     3. ADDRESS: Esta acción se debe realizar solo después de que el cliente ha confirmado su pedido y necesita proporcionar su dirección para la entrega.
  //     4. PAYMENT: Esta acción se debe realizar solo después de que el cliente ha confirmado su pedido, proporcionado su dirección y está listo para elegir o confirmar su forma de pago.
  //     -----------------------------
  //     Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  //     Respuesta ideal (INFO|ORDER|ADDRESS|PAYMENT):`.replace(
  //       '{HISTORY}',
  //       historyParsed,
  //     );
  //   try {
  //     const response = await this.aiService.createChat([
  //       {
  //         role: 'system',
  //         content: prompt,
  //       },
  //     ]);
  //     return response;
  //   }
  //   catch (err) {
  //     console.error(err);
  //     return 'ERROR';
  //   }
  // }
}
