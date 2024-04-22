import { Injectable, Logger } from '@nestjs/common';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';
import { Ctx } from 'src/context/entities/ctx.entity';
import axios from 'axios';
import { IParsedMessage } from 'src/builder-templates/interface';
import { CtxService } from 'src/context/ctx.service';
import { SenderService } from 'src/sender/sender.service';
import { GoogleSpreadsheetService } from 'src/google-spreadsheet/google-spreadsheet.service';
import { getFullCurrentDate } from 'src/bot/helpers/currentDate';
import { AiService } from 'src/ai/ai.service';
import { HistoryService } from 'src/history/history.service';
import { GoogleCalendarService } from 'src/google-calendar/google-calendar.service';
import { Utilities } from 'src/context/helpers/utils';
import { LangchainService } from 'src/langchain/langchain.service';
import { Appointment, Calendar } from 'src/google-spreadsheet/entities';
import { MENU, NAME_TEMPLATES, STATUS_APPOINTMENT, STEPS } from 'src/context/helpers/constants';
@Injectable()
export class FlowsService {
  constructor(
    private readonly builderTemplate: BuilderTemplatesService,
    private readonly ctxService: CtxService,
    private readonly historyService: HistoryService,
    private readonly senderService: SenderService,
    private readonly aiService: AiService,
    private readonly langChainService: LangchainService,
    private readonly googleSpreadsheetService: GoogleSpreadsheetService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) { }


  async getWhatsappMediaUrl({ imageId }: { imageId: string }) {
    const getImage = await axios
      .get(`https://graph.facebook.com/v19.0/${imageId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      })
      .then((res) => res.data)
      .catch((error) => console.error(error));

    return getImage.url;
  }

  PROMPT_ANALYZE_DATA = 
  `Como una inteligencia artificial avanzada, tu tarea es analizar [HISTORIAL_CONVERSACION] y seleccionar la acción más adecuada a seguir.
  --------------------------------------------------------
  [HISTORIAL_CONVERSACION]:
  {HISTORY}

  [QUESTION]:
  {CLIENT_ANSWER}
  
  Posibles acciones a realizar:
  1. INFO: Esta acción se debe realizar cuando el cliente expresa su deseo de conocer más sobre nuestros servicios.
  2. ORDERNAR: Esta acción se debe realizar cuando el cliente expresa su deseo por algun producto o promoción.
  3. COBERTURA: Esta acción se debe realizar cuando el cliente desea conocer si tenemos cobertura en su zona.

  Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  
  Respuesta ideal (INFO|ORDERNAR|COBERTURA):`;

  generateAnalyzePrompt = (question:string,history: string) => {
    return this.PROMPT_ANALYZE_DATA.replace('{HISTORY}', history).replace('{CLIENT_ANSWER}', question);
  }

  async analyzeDataFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      Logger.log('DEFINO INTENCION DEL CLIENTE' , 'ANALYZE_PROMPT');
      const prompt = this.generateAnalyzePrompt(messageEntry.content,historyParsed);
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },

      ]);
      if(response === 'INFO') {
        Logger.log('INFO', 'INTENCION');
        await this.sendInfoFlow(ctx, messageEntry, historyParsed);
      } else if(response === 'ORDERNAR') {
        Logger.log('ORDERNAR', 'INTENCION');
        await this.sendInfoFlow(ctx, messageEntry, historyParsed);
      }
       else {
        Logger.log('COBERTURA', 'INTENCION');
        // await this.checkCoverage(ctx, messageEntry, historyParsed);
      }
    
    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }
  }


  PROMPT_WELCOME = `Como asistente virtual de Ali IA, tu primer contacto con el cliente es crucial para establecer una relación amigable y de confianza. A partir del PRIMER_MENSAJE_DEL_CLIENTE, debes ofrecer una bienvenida cálida, responder a su consulta de manera precisa y aprovechar para informar sobre nuestros servicios, precios y la opción de agendar una cita con un especialista.

  INSTRUCCIONES:
   - Comienza con un saludo afectuoso y una bienvenida que haga sentir al cliente especial en su primer contacto.
   - Debes indicarle que eres un Asistente en entrenamiento y que estás aquí para ayudarlo.
   - Analiza el PRIMER_MENSAJE_DEL_CLIENTE para entender y responder claramente a su consulta, usando la información de la BASE_DE_DATOS.
   - Informa sobre los servicios que ofrecemos, destacando brevemente las características principales, beneficios y precios.
   - Invita al cliente a agendar una cita con un especialista para una asesoría más detallada o personalizada.
   - Mantén la respuesta dentro de los 200 caracteres, utilizando emojis para hacer la interacción más amigable y cercana.
   
   Tu objetivo es maximizar la satisfacción del cliente desde el primer mensaje, brindando información valiosa y demostrando el alto nivel de atención y soporte que ofrecemos.
   
   ### CONTEXTO
   ----------------
   PRIMER_MENSAJE_DEL_CLIENTE:
   {question}
   ----------------
   BASE_DE_DATOS:
   {context}
   ----------------

   
   Sigue estas instrucciones para asegurar una acogida cálida y una interacción informativa con el cliente, resaltando la accesibilidad y el valor de nuestros servicios de chatbots.`

   PROMPT_INFO = `Como asistente virtual del {restaurante}, tu responsabilidad es brindar información precisa y útil sobre detalles generales de nuestro establecimiento, y facilitar que el cliente acceda a nuestra carta completa a través del enlace proporcionado.

   INSTRUCCIONES:
     - Saluda al cliente solo si es el primer mensaje de [HISTORIAL_DE_CONVERSACIÓN]. En tu saludo, incluye siempre el nombre del restaurante, por ejemplo: "Bienvenido a {restaurante}, ¿en qué puedo ayudarte hoy?"
     - Utiliza el [HISTORIAL_DE_CONVERSACIÓN] para comprender el contexto y adaptar tus respuestas.
     - Responde a la PREGUNTA_DEL_CLIENTE de manera clara y concisa, limitando tu respuesta a detalles generales como la dirección, horarios de atención y cobertura de entrega.
     - Asegúrate de incluir siempre un enlace a nuestra carta en cada respuesta, así: "{link}".
     - Si la pregunta del cliente no es clara, pide más detalles de manera amable.
     - Usa emojis de manera estratégica para hacer la comunicación más amigable.
     - Si pregunta por delivery o cobertura pregunta por la dirección de entrega.
     - Las respuestas no deben exceder los 200 caracteres para garantizar claridad y eficiencia.

   ### CONTEXTO
   ----------------
   DATOS IMPORTANTES DEL NEGOCIO:
   Slogan: {slogan}
   Dirección: {direccion}
   Horarios de atención: {horarios}
   Carta: {link}
   Menú: {menu}
   Delivery: Sí
   Promociones: {promotions}
   ----------------
   [HISTORIAL_DE_CONVERSACIÓN]:
   {chatHistory}
   ----------------
   PREGUNTA_DEL_CLIENTE:
   {question}
   ----------------
   
   Sigue estas directrices para asegurar una interacción efectiva y satisfactoria con el cliente, enfocándote en proporcionar la información esencial y promoviendo el acceso a nuestra carta.`
   
   

    generateGeneralInfoFlow(question:string,history: string) {
      const mainPrompt = this.PROMPT_INFO.replace('{chatHistory}', history)
      .replace('{question}', question)
      .replace('{restaurante}', 'La Burguesía')
      .replace('{slogan}', 'Regla #1 Contarle a tus amigos del sabor de La Burguesía')
      .replace('{direccion}', 'Los Cardos 123, Urb. Miraflores,Piura')
      .replace('{horarios}', 'Lunes a Sábados de 7 pm a 11pm')
      .replace('{link}', 'https://menu.cartadirecta.com/laburguesia')
      .replace('{menu}', 'Hamburguesas , Salchipapas y bebidas')
      .replace('{promotions}', 'Hamburguesas 2x1');
      return mainPrompt;
    }

  sendInfoFlow = async (ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) => {
    try {
      const prompt = this.generateGeneralInfoFlow(messageEntry.content,historyParsed);
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },

      ]);
      const chunks = response.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
        );
      }
      // Actualizar paso
      ctx.step = STEPS.INIT;
      await this.ctxService.updateCtx(ctx._id, ctx);

    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }

  }



  PROMPT_FILTER_DATE = `
  ### Contexto
  Eres un experto determinando fechas. Tu propósito es determinar la fecha que el cliente quiere, en el formato dd/mm/yyyy.
  
  ### Fecha y Hora Actual:
  {CURRENT_DAY}
  
  ### Historial de Conversación:
  {HISTORY}

  ### Expresión de tiempo a analizar:
  {TIME_EXPRESSION}

  Instrucciones detalladas:
- Uso como contexto el historial de conversación y la expresión de tiempo proporcionada.
- Utiliza la fecha y hora actuales como punto de partida para tus cálculos.
- Si la expresión de tiempo no proporciona suficiente información para una fecha específica, usa la fecha {CURRENT_DAY}.
- Asume un calendario estándar gregoriano sin tener en cuenta posibles eventos o festividades.

  Ejemplo de expresiones a interpretar (estos ejemplos son hipotéticos y sirven como guía para tus cálculos y expresiones de tiempo similiares):
    Suponiendo que para este ejemplo la fecha actual es 02/04/2024:
    1. Para mañana = 03/04/2024
    2. Este viernes = 05/04/2024
    3. Para la otra semana = 08/04/2024 - Asume el inicio de la semana el lunes
    4. Lo más pronto posible = 02/04/2024 - Fecha actual
    5. Para fin de mes = 30/04/2024
    6. Para pasado mañana = 04/04/2024
    7. Dentro de una semana = 09/04/2024
    8. Para el próximo mes = 01/05/2024
    9. En tres días laborables = 05/04/2024 - Asume días laborables de lunes a viernes
    10. Fin de semana próximo = 06/04/2024 - Asume el sábado como inicio del fin de semana
    11. Para fin de año = 31/12/2024
    12. En un mes a partir de ahora = 02/05/2024
    13. Deseo agendar una cita  = 02/04/2024 - Fecha actual

    Tu respuesta siempre debe ser una fecha con el formato dd/mm/yyyy.

    Respuesta ideal: {date: "dd/mm/yyyy"}
  `;
  generatePromptFilter  = (history: string, timeEpression: string) => {
  const nowDate = Utilities.todayHour()
  const mainPrompt = this.PROMPT_FILTER_DATE
      .replace('{HISTORY}', history)
      .replace('{CURRENT_DAY}', nowDate)
      .replace('{TIME_EXPRESSION}', timeEpression);

  return mainPrompt;
  }

  async checkAvailabilityFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed) {
    try {
        // Suponiendo que generatePromptFilter, aiService.desiredDateFn y Utilities están definidos anteriormente
        const promptGetDateAndHour = this.generatePromptFilter(historyParsed,messageEntry.content);
        Logger.log('GETDATEANDHOUR PROMPT');
        // Logger.log('PROMPT:', promptGetDateAndHour);
        const posibleDate = await this.aiService.desiredDateFn([
            {
                role: 'system',
                content: promptGetDateAndHour,
            },
            
          ],
          'gpt-4'
        );

        let fullDate = posibleDate?.date ? posibleDate.date : '';
        Logger.log('FULLDATE:', fullDate);
        if (!fullDate) {
          fullDate = Utilities.today();
        }

        let queryDateTime = fullDate
        let availableSlots = { day: '', hours: [] };

        do {
          // Verificar si el día está dentro del horario de atención
          if (Utilities.isWithinBusinessHours(queryDateTime)) {
            // Buscar slots disponibles para el día
            availableSlots = await this.googleCalendarService.findAvailableSlots('abel3121@gmail.com', queryDateTime);
            if (availableSlots.hours.length === 0) {
              queryDateTime = Utilities.addBusinessDays(queryDateTime, 1);
              console.log('No hay slots disponibles para el día', queryDateTime);
            }
          } else {
            queryDateTime = Utilities.addBusinessDays(queryDateTime, 1);
            console.log('No es un día hábil, buscando siguiente día', queryDateTime);
          }
        } while (availableSlots.hours.length === 0); // Continuar hasta encontrar un día con al menos un slot disponible
        // Procesar y mostrar los slots disponibles
        let slotsParsed = Utilities.convertSchedule(availableSlots)
        let btnText = 'Ver horarios';
        let sections = Utilities.generateOneSectionTemplate('Fechas disponibles:',slotsParsed)
        let bodyMessage = 'Para una mejor experiencia , te brindo las fechas disponibles para agendar tu cita, si deseas otra fecha y hora por favor escribela.';
        let combineTextList = Utilities.combineTextList(bodyMessage,sections);
        await this.historyService.setAndCreateAssitantMessage(
              messageEntry,
              combineTextList,
            )
        const newMessage = this.builderTemplate.buildInteractiveListMessage(messageEntry.clientPhone, btnText, sections , 'Fechas disponible',bodyMessage);
        await this.senderService.sendMessages(newMessage);
        ctx.step = STEPS.DATE_SELECTED;
        await this.ctxService.updateCtx(ctx._id, ctx);
    } catch (err) {
        console.error(`[ERROR]:`, err);
    }
  }

  async preconfirmFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      ctx.dateSelected ? ctx.datePreselected = ctx.dateSelected : ctx.dateSelected = messageEntry.content;
      if(ctx.clientname) {
        ctx.dateSelected = messageEntry.content;
        return await this.changeDateFlow(ctx, messageEntry, historyParsed);
      }
      let dateSelected = ctx.dateSelected;
      let messageOne = `Ahora para finalizar la reserva para el día ${dateSelected}, brindanos tu nombre.\n*Ingresa todos los datos en un solo mensaje.*`;
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          messageOne,
        ),
      );
      await this.historyService.setAndCreateAssitantMessage(messageEntry, messageOne);
      ctx.step = STEPS.EXTRA_DATA;
      await this.ctxService.updateCtx(ctx._id, ctx);
    }
    catch (err) {
      console.error(err);
      return;
    }
  }



  PROMPT_CONFIRM = `Eres un asistente especializado en determinar si un cliente cumple con todos los requisitos para agendar una reunion. Tu objetivo es analizar la conversación y detectar si el cliente ha mencionado:
  
  ### Datos obligatorios para agendar una reunión:
  - Nombre del cliente

  ### Registro de Conversación:(Cliente/Vendedor)
  {HISTORY}

  ### Respuesta del cliente:
  {CLIENT_ANSWER}

  ### Acciones a realizar:
  -Extraer los datos obligatorios para agendar una reunión.
  -No suponer datos, solo extraer la información proporcionada por el cliente.
  -No inventar datos, solo extraer la información proporcionada por el cliente.
  -En caso la respuesta del cliente no hace referencia a los datos solicitados, entonces debes poner en true la variable outOfContext.
  `;

  generatePromptConfirm = (question:string,history: string) => {
    const mainPrompt = this.PROMPT_CONFIRM
      .replace('{HISTORY}', history)
      .replace('{CLIENT_ANSWER', question)
    return mainPrompt
  }



  async checkExtaDataFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      const prompt = this.generatePromptConfirm(messageEntry.content,historyParsed);
      const response = await this.aiService.checkData([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      if(response.outOfContext) {
       return await this.analyzeDataFlow(ctx, messageEntry, historyParsed);
      }
      const validateJsonAnswer = Utilities.validateBusinessInfo(response);
      if(validateJsonAnswer === 'OK'){
        // Vamos a crear la cita
        ctx.clientname = response.clientName;
        const newAppointment = new Appointment(ctx);
        await this.googleSpreadsheetService.insertData(0,newAppointment);
        const eventInfo = Utilities.parseForGoogleCalendar(ctx.dateSelected,60);
        const responseCalendar = await this.googleCalendarService.createEventWithGoogleMeetAndNotifyAttendees(eventInfo.eventStart, eventInfo.eventEnd);
        if(responseCalendar.status === 'confirmed') 
        {
        // Confirmar cita
        // ctx.eventId = responseCalendar.id;
        let confirmMessage = `Genial ${response.clientName}. Tu cita es para el ${ctx.dateSelected}, uno de nuestros especilistas te estará contactando.`
        await this.senderService.sendMessages(
            this.builderTemplate.buildTextMessage(
              messageEntry.clientPhone,
              confirmMessage,
            ),
          );
        await this.historyService.setAndCreateAssitantMessage(messageEntry, confirmMessage)
        await this.notifyPaymentFlow(ctx,responseCalendar.htmlLink);
        ctx.step = STEPS.AFTER_CONFIRM
        await this.ctxService.updateCtx(ctx._id, ctx);
        }
        else {
          let errorMessage = `Lo siento ${response.clientName}. No se pudo agendar tu cita, en unos minutos una persona de nuestro equipo se pondrá en contacto contigo.`
          await this.senderService.sendMessages(
            this.builderTemplate.buildTextMessage(
              messageEntry.clientPhone,
              errorMessage,
            ),
          );
        }

      } else {
        let missingInfoMessage = validateJsonAnswer
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            missingInfoMessage,
          ),
        );
      }
    }
    catch (err) {
      console.error(err);
      return;
    }
  }

  async notifyPaymentFlow(ctx:Ctx ,url:string) {
    const clientPhone = ctx.clientPhone;
    const clientName = ctx.clientname;
    const dateSelected = ctx.dateSelected;
    const templateName:string = NAME_TEMPLATES.NOTIFY_APP;
    const languageCode = 'es';
    const bodyParameters = [clientName,clientPhone ,dateSelected]
    const admins = ['51947308823','51980827944']
    for (const admin of admins) {
      const template = this.builderTemplate.buildTemplateMessage(admin, templateName, languageCode, null, bodyParameters);
      await this.senderService.sendMessages(template);
  }
    await this.ctxService.updateCtx(ctx._id, ctx);
  }
  PROMPT_ANALYZE_AFTER_CONFIRM =  `Como una inteligencia artificial avanzada, tu tarea es analizar [HISTORIAL_CONVERSACION] y seleccionar la acción más adecuada a seguir.
  --------------------------------------------------------
  [HISTORIAL_CONVERSACION]:
  {HISTORY}

  [QUESTION]:
  {CLIENT_ANSWER}
  
  Posibles acciones a realizar:
  1. REANGENDAR: Esta acción se debe realizar cuando el cliente expresa su deseo de reprogramar o cancelar su cita.
  2. INFO: Esta acción se debe realizar cuando el cliente desea hacer más pregúntas de nuestros servicios.

  Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  
  Respuesta ideal (INFO|REANGENDAR):`

  generatePromptAnalyzeAfterConfirm = (question:string,history: string) => {
    return this.PROMPT_ANALYZE_AFTER_CONFIRM.replace('{HISTORY}', history).replace('{CLIENT_ANSWER}', question);
  }
// Analiza si es que el cliente desea reagendar o solo esta pidiendo información
  async anlyzeAfterConfirmFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      const prompt = this.generatePromptAnalyzeAfterConfirm(messageEntry.content,historyParsed);
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      if(response === 'INFO') {
        await this.sendInfoAAFlow(ctx, messageEntry, historyParsed);
      }
      else {
        await this.rescheduleAppointmentFlow(ctx, messageEntry, historyParsed);
      }

    }
    catch (err) {
      console.error(err);
      return;
    }
  }
  PROMPT_INFO_AA = 
  `Como asistente virtual de Ali IA, tu tarea es brindar información precisa y detallada sobre nuestros servicios de chatbots de ventas e informes, utilizando exclusivamente la información contenida en la BASE_DE_DATOS para responder la pregunta del cliente. 
  
  ### CONTEXTO
  ETAPA DE LA CONVERSACIÓN:
  El cliente ya cuenta con una cita programada y desea saber más sobre nuestros servicios.
  En esta etapa solo damos información de nuestos servicios ya no invitamos a agendar una cita porque ya la tiene programada
  con un especialista de Ali IA.

  ----------------
  CITA_PROGRAMADA:
  [date_selected]
  ----------------
  HISTORIAL_DE_CHAT:
  {chatHistory}
  ----------------
  BASE_DE_DATOS:
  {context}
  ----------------
  INTERROGACIÓN_DEL_CLIENTE:
  {question}
  ----------------
  
  Asegúrate de seguir estas INSTRUCCIONES detalladamente:
   
  INSTRUCCIONES:
    - Debes analizar tanto el HISTORIAL_DE_CHAT como la INTERROGACIÓN_DEL_CLIENTE para ofrecer respuestas personalizadas y útiles que se ajusten a la conversación.
    - Analizar el HISTORIAL_DE_CHAT para comprender el contexto de la conversación y proporcionar respuestas de acuerdo a la conversacion.
    - Debes responder a la INTERROGACIÓN_DEL_CLIENTE de manera clara y detallada, utilizando información precisa de la BASE_DE_DATOS y alineado al HISTORIAL_DE_CHAT
    - NO SALUDES , NO USES HOLA O BUENOS DIAS , SOLO RESPONDE A LA PREGUNTA DEL CLIENTE
    - Dirige todas las consultas hacia información específica sobre nuestros servicios de chatbots, utilizando datos precisos de la BASE_DE_DATOS.
    - Si el cliente desvía la conversación de nuestros servicios principales, redirígelo amablemente hacia los temas de interés.
    - Asegúrate de solicitar detalles adicionales de manera amigable si la pregunta del cliente no es clara.
    - El mensaje no debe exceder los 200 caracteres.
    - De manera amable indícale que en la cita que ya programo podrá resolver todas sus dudas con un especialista de Ali IA.
    - Usa emojis de manera estratégica para hacer la comunicación más amigable.
    - En caso el cliente desea conocer cuando es su cita debes usar la fecha [date_selected] para responder.
    - Recuerda, tu enfoque debe ser siempre maximizar la satisfacción del cliente mediante respuestas claras, informativas y personalizadas, promoviendo una relación positiva con nuestra marca.

    Sigue estas directrices cuidadosamente para asegurar una interacción efectiva y amigable con el cliente, destacando la calidad y el valor de nuestros servicios de chatbots.
    `
  async sendInfoAAFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      const history = await this.historyService.findAll(messageEntry.clientPhone, messageEntry.chatbotNumber)
      const question = messageEntry.content; 
      const prompt = this.PROMPT_INFO_AA.replace(/\[date_selected\]/g, ctx.dateSelected);
      const { response } = await this.langChainService.runChat(history, question, prompt);
      const chunks = response.split(/(?<!\d)\.\s+/g);
      for (const chunk of chunks) {
        const newMessage =
          await this.historyService.setAndCreateAssitantMessage(
            messageEntry,
            chunk,
          );
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            chunk,
          ),
        );
      }

    } catch (err) {
      console.log(`[ERROR]:`, err);
      return;
    }

  }

  async rescheduleAppointmentFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
     const messageOne = `Por favor ${ctx.clientname}, para reprogramar tu cita del día ${ctx.dateSelected}, brindanos la fecha y hora que deseas.`
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          messageOne,
        ),
      );
      await this.historyService.setAndCreateAssitantMessage(messageEntry, messageOne);
      ctx.step = STEPS.WAITING_FOR_RESCHEDULE;
      await this.ctxService.updateCtx(ctx._id, ctx);
    }
    catch (err) {
      console.error(err);
      return;
    }
  }

  PROMPT_ANALYZE_RE_SCHEDULE =  `Como una inteligencia artificial avanzada, tu tarea es analizar [HISTORIAL_CONVERSACION] y seleccionar la acción más adecuada a seguir.
  --------------------------------------------------------
  [HISTORIAL_CONVERSACION]:
  {HISTORY}

  [QUESTION]:
  {CLIENT_ANSWER}
  
  Posibles acciones a realizar:
  1. REANGENDAR: Esta acción se debe realizar cuando el cliente expresa su deseo deseo de reagendar o ha brindado una fecha y hora para reprogramar su cita.
  2. INFO: Esta acción se debe realizar cuando el cliente no ha dado una fecha y hora para reprogramar su cita.

  Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  
  Respuesta ideal (INFO|REANGENDAR):`
  
  generatePromptAnalyzeReSchedule = (question:string,history: string) => {
    return this.PROMPT_ANALYZE_RE_SCHEDULE.replace('{HISTORY}', history).replace('{CLIENT_ANSWER}', question);
  }

  // Analiza si es que el cliente ha confirmado si desea reprogrmar o no
  async analyzeAnswerFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      const prompt = this.generatePromptAnalyzeReSchedule(messageEntry.content,historyParsed);
      const response = await this.aiService.createChat([
        {
          role: 'system',
          content: prompt,
        },
      ]);
      // El cliente no ha confirmado si desea reprogramar
      if(response === 'INFO') {
        await this.sendInfoAAFlow(ctx, messageEntry, historyParsed);
      }
      // El cliente ha confirmado que desea reprogramar con una fecha  y hora
      else {
        await this.checkAvailabilityFlow(ctx, messageEntry, historyParsed);
      }

    }
    catch (err) {
      console.error(err);
      return;
    }
  }

  async changeDateFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
    try {
      // Actualizar estado de la cita en la hoja de cálculo
      await this.googleSpreadsheetService.updateAppointmentStatusByDateAndClientPhone(ctx.datePreselected, ctx.clientPhone, STATUS_APPOINTMENT.REPROGAMADA);
      // Eliminar cita anterior en calendar
      // await  this.googleCalendarService.updateEventStatusToCancelled(undefined,ctx.eventId);
      // Seguir el flujo de crear cita
      const newAppointment = new Appointment(ctx);
      await this.googleSpreadsheetService.insertData(0,newAppointment);
      const eventInfo = Utilities.parseForGoogleCalendar(ctx.dateSelected,60);
      const responseCalendar = await this.googleCalendarService.createEventWithGoogleMeetAndNotifyAttendees(eventInfo.eventStart, eventInfo.eventEnd);
      if(responseCalendar.status === 'confirmed') {
      // Confirmar cita
      // ctx.eventId = responseCalendar.id;
      let messageOne = `Gracias ${ctx.clientname}, tu cita ha sido reprogramada para el día ${ctx.dateSelected}.`;
      await this.senderService.sendMessages(
        this.builderTemplate.buildTextMessage(
          messageEntry.clientPhone,
          messageOne,
        ),
      );
      await this.historyService.setAndCreateAssitantMessage(messageEntry, messageOne)
      await this.notifyPaymentFlow(ctx,responseCalendar.htmlLink);
      ctx.step = STEPS.AFTER_CONFIRM;
      await this.ctxService.updateCtx(ctx._id, ctx);
      }
      else {
        let errorMessage = `Lo siento ${ctx.clientname}. No se pudo agendar tu cita, en unos minutos una persona de nuestro equipo se pondrá en contacto contigo.`
        await this.senderService.sendMessages(
          this.builderTemplate.buildTextMessage(
            messageEntry.clientPhone,
            errorMessage,
          ),
        );
      }

    }
    catch (err) {
      console.error(err);
      return;
    }
  }
}


//   PROMPT_ANSWER_DATE = `As an artificial intelligence engineer specializing in meeting scheduling, your goal is to analyze the conversation and determine the client's intention to schedule a meeting, as well as their preferred date and time.

//     Current Day: {CURRENT_DAY}

//     Spots available:
//     -----------------------------------
//     {AGENDA}

//     Conversation history:
//     -----------------------------------
//     {HISTORY}

//     INSTRUCTIONS:
//     - Do not start with a greeting.
//     - Always refer the day if it is possible.
//     - Always response with aviaible hours.
//     - If there is availability you must tell the user to confirm.
//     - If not available, always suggest the next available dates.
//     - Check in detail the conversation history and calculate the day, date and time that does not conflict with another already scheduled.
//     - Ideal short answers to send by WhatsApp with emojis.-

//     Examples of suitable answers to suggest times and check availability:
//     ----------------------------------
//     "Sure, I have a space available tomorrow at 9 am but I have 11 , 12 and 3 pm available".
//     "Sure, I have a space available tomorrow, what time works best for you?".
//     "Yes, I have a space available today, what time works best for you?".
//     "Sure, I have several spaces available this week. Please let me know the day and time you prefer."

//     Helpful first-person response (in Spanish):
//   `

//  generatePromptAnswerDate = (summary: string, history: string) => {
//   const nowDate = Utilities.todayHour()
//   const mainPrompt = this.PROMPT_ANSWER_DATE
//       .replace('{AGENDA}', summary)
//       .replace('{HISTORY}', history)
//       .replace('{CURRENT_DAY}', nowDate)

//   return mainPrompt
//  }



//   async CONFIRMAR(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
//     try {
//       const parsedAvailableHours = ctx.parsedAvailableHours;
//       const confirmPrompt = this.generatePromptConfirm(parsedAvailableHours,historyParsed);
//       console.log('confirmPrompt', confirmPrompt)
//       const answer = await this.aiService.createChat([
//         {
//           role: 'system',
//           content: confirmPrompt,
//         }
//       ]);
//       const chunks = answer.split(/(?<!\d)\.\s+/g);
//       for (const chunk of chunks) {
//         const newMessage =
//           await this.historyService.setAndCreateAssitantMessage(
//             messageEntry,
//             chunk,
//           );
//         await this.senderService.sendMessages(
//           this.builderTemplate.buildTextMessage(
//             messageEntry.clientPhone,
//             chunk,
//           ),
//         );
//       }
//     } catch (error) {
//       console.error(error);
//       return;
//     }
//   }
  // PROMPT_FILTER_AVAILABLE =  `Como una inteligencia artificial avanzada, tu tarea es analizar [HISTORIAL_CONVERSACION] y seleccionar la acción más adecuada en respuesta a la [QUESTION].
  // --------------------------------------------------------
  // [HISTORIAL_CONVERSACION]:
  // {HISTORY}

  // [QUESTION]:
  // {QUESTION}
  
  // Posibles acciones a realizar:
  // 1. INFO: Esta acción es cuando el cliente pregunta por información general sobre los servicios que ofrecemos y nada relacionado a la disponibilidad. Generalmente son preguntas acerca del servicio o precios.
  // 2. DISPONIBILIDAD: Esta acción se debe realizar cuando el cliente expresa su deseo de programar una cita.
  // -----------------------------

  // Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  
  
  // Respuesta ideal (INFO|DISPONIBILIDAD|CONFIRMAR):`;
  // generatePromptFilterDate = (history: string , question:string) => {
  //   return this.PROMPT_FILTER_AVAILABLE.replace('{HISTORY}', history).replace('{QUESTION}', question);
  // }

  // PROMPT_INIT_FLOW = 
  // `Como una inteligencia artificial avanzada, tu tarea es analizar un mensaje inicial de un cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  // --------------------------------------------------------
  // Mesaje Inicial:
  // {HISTORY}
  
  // Posibles acciones a realizar:
  // 1. SALUDO: Esta acción se debe realizar cuando el cliente inicia la conversación con un saludo génerico sin alguna preguta en especifico.
  // 2. INFO: Esta acción se debe realizar cuando el cliente solicita información sobre los servicios que ofrecemos.
  // 3. DISPONIBILIDAD: Esta acción se debe realizar cuando el cliente pide información sobre la disponibilidad para agendar una cita.
  // -----------------------------
  // Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  
  // Respuesta ideal (SALUDO|INFO|DISPONIBILIDAD):`;

  // generataInitFlowPrompt = (history: string) => {
  //   return this.PROMPT_INIT_FLOW.replace('{HISTORY}', history);
  // }
// async checkAvailabilityFlow(ctx: Ctx, messageEntry: IParsedMessage, historyParsed) {
//   try {
//       // Suponiendo que generatePromptFilter, aiService.desiredDateFn y Utilities están definidos anteriormente
//       const promptGetDateAndHour = this.generatePromptFilter(historyParsed,messageEntry.content);
//       const posibleDate = await this.aiService.desiredDateFn([
//           {
//               role: 'system',
//               content: promptGetDateAndHour,
//           },
//       ]);

//       let fullDate = posibleDate?.date ? posibleDate.date : '';
//       console.log('fullDate:', fullDate);
//       if (!fullDate) {
//         fullDate = Utilities.today();
//       }

//       let queryDateTime = fullDate
//       let availableSlots = { day: '', hours: [] };

//       do {
//         // Verificar si el día está dentro del horario de atención
//         if (Utilities.isWithinBusinessHours(queryDateTime)) {
//           // Buscar slots disponibles para el día
//           availableSlots = await this.googleCalendarService.findAvailableSlots('abel3121@gmail.com', queryDateTime);
//           if (availableSlots.hours.length === 0) {
//             queryDateTime = Utilities.addBusinessDays(queryDateTime, 1);
//             console.log('No hay slots disponibles para el día', queryDateTime);
//           }
//         } else {
//           queryDateTime = Utilities.addBusinessDays(queryDateTime, 1);
//           console.log('No es un día hábil, buscando siguiente día', queryDateTime);
//         }
//       } while (availableSlots.hours.length === 0); // Continuar hasta encontrar un día con al menos un slot disponible
//       // Procesar y mostrar los slots disponibles
//       // const parsedAvailableHours = Utilities.parseAvailableSpots(availableSlots);
//       // console.log(parsedAvailableHours);
//       // ctx.parsedAvailableHours = parsedAvailableHours;
//       // await this.ctxService.updateCtx(ctx._id, ctx);
//       // console.log('parsedAvailableHours', parsedAvailableHours)
//       // const propmtAnswerDate = this.generatePromptAnswerDate(parsedAvailableHours,historyParsed);
//       // console.log('propmtAnswerDate', propmtAnswerDate)
//       let btnText = 'Ver horarios';
//       let sections = Utilities.generateOneSectionTemplate('Fechas disponibles:',availableSlots)
//       let bodyMessage = 'Por favor, selecciona una fecha y hora para agendar tu cita, si deseas otra fecha y hora por favor escribela.';
//       // let combineTextList = Utilities.generateOneSectionTemplate(bodyMessage,sections);
//       //     await this.historyService.setAndCreateAssitantMessage(
//       //       messageEntry,
//       //       combineTextList,
//       //     )
//       const newMessage = this.builderTemplate.buildInteractiveListMessage(messageEntry.clientPhone, btnText, sections , 'Lista',bodyMessage);
//       await this.senderService.sendMessages(newMessage);
//       ctx.step = '3';
//       await this.ctxService.updateCtx(ctx._id, ctx);
//       // const finalAnswer = await this.aiService.createChat([
//       //   {
//       //     role: 'system',
//       //     content: propmtAnswerDate,
//       //   }
//       // ]);

//       // const chunks = finalAnswer.split(/(?<!\d)\.\s+/g);
//       // for (const chunk of chunks) {
//       //   const newMessage =
//       //     await this.historyService.setAndCreateAssitantMessage(
//       //       messageEntry,
//       //       chunk,
//       //     );
//       //   await this.senderService.sendMessages(
//       //     this.builderTemplate.buildTextMessage(
//       //       messageEntry.clientPhone,
//       //       chunk,
//       //     ),
//       //   );
//       // }


//   } catch (err) {
//       console.error(`[ERROR]:`, err);
//   }
// }

// async INITFLOW(ctx: Ctx, messageEntry: IParsedMessage, historyParsed?: string) {
//   try {
//     await this.sendInfoFlow(ctx, messageEntry, historyParsed);
//     ctx.step = '1';
//     await this.ctxService.updateCtx(ctx._id, ctx);
//   } catch (err) {
//     console.log(`[ERROR]:`, err);
//     return;
//   }
// }

  // async INFO(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
  //   const analyzePrompt = this.generteInfoAvailablePrompt(historyParsed);
  //   console.log('ANALYZE PROMPT:', analyzePrompt);
  //   const response = await this.aiService.createChat([
  //     {
  //       role: 'system',
  //       content: analyzePrompt,
  //     },
  //   ]);
  //   if(response === 'INFO') {
  //     await this.sendInfo(ctx, messageEntry, historyParsed);
  //   } else {
  //     console.log('DISPONIBILIDAD');
  //     await this.sendAvailability(ctx, messageEntry, historyParsed);
  //     ctx.step = '2';
  //     await this.ctxService.updateCtx(ctx._id, ctx);
  //   }
  // }

  // sendAvailability = async (ctx: Ctx, messageEntry: IParsedMessage,historyParsed: string) => {
  //   const generatePromptFilter = this.generatePromptFilterDate(historyParsed, messageEntry.content);
  //   console.log('PROMPT:', generatePromptFilter);
  //   const response = await this.aiService.createChat([
  //     {
  //       role: 'system',
  //       content: generatePromptFilter,
  //     },
  //   ]);
  //   if(response === 'DISPONIBILIDAD') {
  //     console.log('DISPONIBILIDAD');
  //     await this.checkAvailabilityFlow(ctx, messageEntry, historyParsed);
  //   }
  //   else {
  //     console.log('INFO');
  //     await this.sendInfo(ctx, messageEntry, historyParsed);
  //   }

  //   // determinar si existe preferencia de fecha y hora o solo consulta por disponibilidad
  //   // Si existe entonces buscamos en la db extraemos y construimos respuesta
  //   // si no existe entonces le brindamos las opciones de fecha y hora disponibles mas prontas y aedmas lo invitamos a ingesar una fecha y hora
  // }

  // async AGENDAR(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
  //   try {
  //     const messageOne = 'dame un momento para consultar la agenda...';
  //     const saveMessageOne = await this.historyService.setAndCreateAssitantMessage(
  //       { ...messageEntry },
  //       messageOne,
  //     );
  //     await this.senderService.sendMessages(
  //       this.builderTemplate.buildTextMessage(
  //         messageEntry.clientPhone,
  //         messageOne,
  //       ),
  //     );
  //     const promptSchedule = this.generatePromptFilter(historyParsed, messageEntry.content);
  //     const messageTwo = await this.aiService.desiredDateFn([
  //       {
  //         role: 'system',
  //         content: promptSchedule,
  //       }
  //     ], 'gpt-4');
  //     console.log('messageTwo', messageTwo)
  //     const fullDate = messageTwo.date + ' ' + messageTwo.hour;
  //     console.log('fullDate', fullDate)
  //     const availableHours = await this.googleCalendarService.findAvailableSlots('abel3121@gmail.com',fullDate);
  //     const parsedAvailableHours = Utilities.parseAvailableSpots(availableHours);
  //     ctx.parsedAvailableHours = parsedAvailableHours;
  //     await this.ctxService.updateCtx(ctx._id, ctx);
  //     console.log('parsedAvailableHours', parsedAvailableHours)
  //     const propmtAnswerDate = this.generatePromptAnswerDate(parsedAvailableHours,historyParsed);
  //     console.log('propmtAnswerDate', propmtAnswerDate)
  //     const finalAnswer = await this.aiService.createChat([
  //       {
  //         role: 'system',
  //         content: propmtAnswerDate,
  //       }
  //     ]);

  //     const chunks = finalAnswer.split(/(?<!\d)\.\s+/g);
  //     for (const chunk of chunks) {
  //       const newMessage =
  //         await this.historyService.setAndCreateAssitantMessage(
  //           messageEntry,
  //           chunk,
  //         );
  //       await this.senderService.sendMessages(
  //         this.builderTemplate.buildTextMessage(
  //           messageEntry.clientPhone,
  //           chunk,
  //         ),
  //       );
  //     }

  //   } catch (err) {
  //     console.log(`[ERROR]:`, err);
  //     return;
  //   }
  // }

  // async HABLAR(ctx: Ctx, messageEntry: IParsedMessage, historyParsed?: string) {
  //   try {
  //     const history = await this.historyService.findAll(messageEntry.clientPhone, messageEntry.chatbotNumber)
  //     const question = messageEntry.content;

  //     const { response } = await this.langChainService.runChat(history, question);
  //     const chunks = response.split(/(?<!\d)\.\s+/g);
  //     for (const chunk of chunks) {
  //       const newMessage =
  //         await this.historyService.setAndCreateAssitantMessage(
  //           messageEntry,
  //           chunk,
  //         );
  //       await this.senderService.sendMessages(
  //         this.builderTemplate.buildTextMessage(
  //           messageEntry.clientPhone,
  //           chunk,
  //         ),
  //       );
  //     }

  //   } catch (err) {
  //     console.log(`[ERROR]:`, err);
  //     return;
  //   }
  // }
  // PROMPT_FILTER_DATE = `
  // ### Contexto
  // Eres un asistente de inteligencia artificial. Tu propósito es determinar la fecha y hora que el cliente desea agendar una reunión. Debes analizar la conversación y detectar si el cliente ha mencionado la fecha y hora de la reunión. Si el cliente no ha mencionado la fecha y hora, debes solicitarle la información faltante. Debes responder con un mensaje corto y amigable, utilizando emojis para hacer más amigable la conversación.
 
  // ### Fecha y Hora Actual:
  // {CURRENT_DAY}

  // ### Historial de Conversación:
  // {HISTORY}
  // `;
  // PROMPT_FILTER_DATE = `
  // ### Contexto
  // Eres un asistente de inteligencia artificial. Tu propósito es determinar la fecha y hora que el cliente quiere, en el formato yyyy/MM/dd HH:mm:ss.
  
  // ### Fecha y Hora Actual:
  // {CURRENT_DAY}
  
  // ### Registro de Conversación:
  // {HISTORY}

  // Instrucciones:
  // - No adivinar la fecha
  
  // Asistente: "{respuesta en formato (dd/mm/yyyy)}"
  // `;


//   PROMPT_SCHEDULE = `
//   Como ingeniero de inteligencia artificial especializado en la programación de reuniones, tu objetivo es analizar la conversación y determinar la intención del cliente de programar una reunión, así como su preferencia de fecha y hora. La reunión durará aproximadamente 45 minutos y solo puede ser programada entre las 9am y las 4pm, de lunes a viernes, y solo para la semana en curso.

//   Fecha de hoy: {CURRENT_DAY}

//   Reuniones ya agendadas:
//   -----------------------------------
//   {AGENDA_ACTUAL}

//   Historial de Conversacion:
//   -----------------------------------
//   {HISTORIAL_CONVERSACION}

//   Ejemplos de respuestas adecuadas para sugerir horarios y verificar disponibilidad:
//   ----------------------------------
//   "Por supuesto, tengo un espacio disponible mañana, ¿a qué hora te resulta más conveniente?"
//   "Sí, tengo un espacio disponible hoy, ¿a qué hora te resulta más conveniente?"
//   "Lo siento, el miércoles a las 4 pm ya está reservado, pero tengo turnos disponibles a las 9 am, 10 am y 11 am. ¿Cuál prefieres?"
//   "Ciertamente, tengo varios huecos libres esta semana. Por favor, indícame el día y la hora que prefieres."
//   "Los turnos disponibles mas pronto son el martes a las 9 am, 10 am y 11 am. ¿Cuál prefieres?"

//   INSTRUCCIONES:
//   ----------------------------------
//   - No inicies con un saludo.
//   -Si el cliente pregunta disponibilidad sin especificar fecha ni hora:
//     Responde preguntando si tiene alguna fecha y hora en especial en mente.
//     Ejemplo de respuesta: "¿Tienes alguna fecha y hora específica en mente para nuestra reunión?"
//   -Si el cliente pregunta disponibilidad solo indicando la hora:
//     Verifica primero si hay disponibilidad para esa hora el día de hoy. Considera si la hora ya ha pasado.
//   -Si no hay disponibilidad hoy o la hora ya ha pasado, indica los turnos más próximos disponibles.
//     Ejemplo de respuesta: "Para hoy ya no tenemos disponibilidad a esa hora, pero los próximos espacios disponibles son [listar tres próximas horas disponibles]. ¿Te conviene alguno de estos horarios?"
//   -Si el cliente pregunta disponibilidad solo indicando la fecha:
//     Busca en esa fecha las 3 horas disponibles más próximas y pregunta si desea alguna de esas o si prefiere otra hora.
//     Ejemplo de respuesta: "Para el [fecha], tengo los siguientes horarios disponibles: [hora 1], [hora 2], [hora 3]. ¿Te gustaría reservar alguno de estos, o prefieres otra hora?"
//   -Si el cliente pregunta disponibilidad con fecha y hora:
//     Verifica si hay disponibilidad para esa fecha y hora.
//     Si está disponible, pide al cliente que confirme.
//     Si no está disponible, indica las fechas disponibles más próximas.
//     Ejemplo de respuesta: "Para el [fecha] a las [hora], tenemos disponibilidad. ¿Te gustaría confirmar este horario para nuestra reunión? 📅⏰"
//   - Si no hay disponibilidad: "Lo siento, pero no tenemos disponibilidad para esa hora. Los próximos espacios disponibles son [listar tres próximos horarios disponibles]. ¿Te gustaría reservar alguno de estos? 📅⏰"  - Las reuniones solo pueden ser programadas entre las 9am y las 4pm, de lunes a viernes.
//   - Cada reunion dura 45 minutos.
//   - Cada reunion empieza en punto. Es decir 9:00 , 10:00 , 11:00 , 12:00 , 13:00 , 14:00 , 15:00 , 16:00
//   - Las respuestas deben ser cortas y adecuadas para WhatsApp, utilizando emojis para mayor claridad y amabilidad.
//   - Utiliza la información del historial de conversción y la agenda para calcular las respuestas.
// `
  //   PROMPT_DETERMINATE_DATE = `
//   Como Ingeniero de Inteligencia Artificial especializado en la coordinación de citas, tu objetivo principal es interpretar y ajustar las solicitudes de programación de citas de los clientes, las cuales están disponibles de lunes a viernes, entre las 9 a.m. y las 5 p.m. Tu responsabilidad es analizar detenidamente las preferencias de fecha y hora de los clientes, alineándolas con nuestro horario operativo y basándote en expresiones de tiempo específicas que ellos proporcionen.

//   Fecha de Hoy: {CURRENT_DAY}
  
//   Instrucciones Detalladas de Procesamiento:
  
//   Determinación y Ajuste de la Fecha y Hora Solicitadas: Debes identificar con precisión la fecha y la hora (o el momento del día) que el cliente requiere para su cita, a partir de su solicitud. Ajusta la hora exacta si se proporciona; en caso de que el cliente solo indique una parte del día, asigna un rango horario estándar (AM para la mañana o PM para la tarde).
  
//   Configuración de Fechas según Expresiones Temporales Comunes y Construcción del JSON:
  
//   "Para de aquí a más tarde"/"Para hoy más tarde": Fija la fecha para el mismo día y señala la próxima hora disponible dentro de nuestro horario.
//   "Para mañana por la mañana": Ajusta la fecha para el próximo día hábil y establece la hora en "AM".
//   "Para mañana por la tarde": Ajusta la fecha para el próximo día hábil y establece la hora en "PM".
//   "Para dentro de un mes"/"El siguiente mes": Establece la fecha al primer día hábil del mes siguiente.
//   "La otra semana": Programa la cita para el primer día laborable de la próxima semana.
//   "Para la quincena": Fija la fecha para el día 15 del mes actual o del siguiente, según lo que sea más próximo.
//   "Inicios de mes": Selecciona una fecha dentro de los primeros cinco días hábiles del mes siguiente.
//   "Cualquier día por la mañana": Ajusta la fecha según lo solicitado y establece la hora en "AM".
//   "Cualquier día por la tarde": Ajusta la fecha según lo solicitado y establece la hora en "PM".
//   Cada configuración debe reflejarse adecuadamente en una respuesta estructurada en formato JSON, que incluya las claves "date", "hour", y "default":
  
//   "date": La fecha ajustada en formato "dd/mm/yyyy". Si la fecha no puede establecerse, utiliza "NF".
//   "hour": La hora ajustada en formato de 12 horas "HH:MM AM/PM" si se proporciona una hora específica, o "AM"/"PM" si se indica un periodo del día. Utiliza "NF" si la hora no puede determinarse.
//   "default": Este campo debe llenarse únicamente si tanto 'date' como 'hour' son "NF". En ese caso, debe contener la frase "Por favor, proporcione más detalles si necesitamos más información para determinar una fecha u hora adecuadas". De lo contrario, debe estar vacío o contener "NF".  Formato de Respuesta Esperado:
//   {
//     "date": "{fecha calculada}" o "NF",
//     "hour": "{hora calculada}" o "AM"/"PM" o "NF",
//     "default": "NF" o "Por favor, proporcione más detalles si necesitamos más información para determinar una fecha u hora adecuadas."
// }
//    `;

    // generateSchedulePrompt = (summary: string, history: string) => {
  //   const nowDate = Utilities.todayHour()
  //   const mainPrompt = this.PROMPT_SCHEDULE
  //     .replace('{AGENDA_ACTUAL}', summary)
  //     .replace('{HISTORIAL_CONVERSACION}', history)
  //     .replace('{CURRENT_DAY}', nowDate)
  //   console.log('mainPrompt', mainPrompt)
  //   return mainPrompt
  // }

     // generateDeterminateDatePrompt = () => {
  //   const nowDate = Utilities.todayHour()
  //   const mainPrompt = this.PROMPT_FILTER_DATE
  //     .replace('{CURRENT_DAY}', nowDate)
  //   return mainPrompt
  // }
   // PROMPT_ANSWER_DATE = `
  // ### Contexto
  // Debes analizar el historial de la conversación y debes determinar si existe disponibilidad para la fecha y hora solicitada por el cliente. Si no hay disponibilidad, debes sugerir las fechas y horas más próximas disponibles. Debes responder con un mensaje corto y amigable, utilizando emojis para mayor claridad y amabilidad.

  // ### Fecha y Hora Actual:
  // {CURRENT_DAY}
  
  // ### Registro de Conversación:
  // {HISTORY}

  // ### Horarios disponibles:
  // {AVAILABLE_HOURS}

  // Instrucciones:
  // - Debes preguntar siempre si confirma la hora y fecha en caso el cliente hay expresado ambos en la conversación, en todo caso debes preguntarle
  // las sugerencias de horarios disponibles.
  // - Usa emojis para hacer más amigable la conversación.
  // - Si en caso no exista disponibilidad debes preguntar si desea otra fecha y hora.
  // `
  // PROMPT_SELLER = `	
  //   Bienvenido a "LaBurger Lima", tu destino para auténticas hamburguesas al carbón en el distrito de Surquillo. Nos encontramos en el corazón de Lima, en Av. Principal 501, Surquillo. Soy tu Asistente Virtual, listo para ayudarte en lo que necesites. 
    
  //   FECHA DE HOY: {CURRENT_DAY}
  //   INIT: {INIT}

  //   SOBRE "LaBurger Lima":
  //   En LaBurger Lima, nos enorgullecemos de ofrecer hamburguesas hechas a la perfección al carbón, utilizando sólo carne de res 100% natural para proporcionarte una experiencia culinaria excepcional. Estamos abiertos todos los días desde las 7:00 PM hasta las 11:00 PM. Si necesitas más información o deseas realizar un pedido, no dudes en llamarnos al 934504415 durante nuestro horario de atención o visitarnos en nuestra dirección en Av. Principal 501, Surquillo, Lima. Aceptamos efectivo , todo las tarjetas , yape o plin.
    
  //   MENÚ COMPLETO:

  //   HAMBURGUESAS:
  //   - Burger Doble (2 carnes de 130 gr): S/.17.9
  //   - Burger Royal (con huevo frito): S/.14.9
  //   - Burger a lo pobre (con plátano frito): S/.16.9
  //   - Burger Hawaiana (con Piña, queso y jamón): S/.16.9
  //   - Burger Bacon (con Tocino ahumado): S/.15.9
  //   - Burger Caramel / Cheddar (con cebollas caramelizadas y queso Cheddar): S/.15.9
  //   - Burger Argentina (con chorizo parrillero): S/.17.9
  //   - Burger Clásica (con papas al hilo, lechuga y tomate): S/.13.9
  //   - Burger Cheese (con Queso Edam o Cheddar): S/.14.9
  //   - Burger Deluxe (con 4 toppings a elección, no incluye chorizo/carne extra): S/.18.9
    
  //   ADICIONALES O TOPPINGS (Solo para hamburguesas y otros):
  //   - Jamón: S/.2
  //   - Filete de pollo Extra: S/.6
  //   - Tocino: S/.3
  //   - Queso Edam: S/.2
  //   - Queso Cheddar: S/.2
  //   - Plátano frito: S/.2
  //   - Piña: S/.2
  //   - Huevo: S/.2
  //   - Carne extra: S/.5
  //   - Chorizo: S/.5
  //   - Cebolla Caramelizada: S/.2
    
  //   BEBIDAS:
  //   - Agua San Carlos (500ml): S/.2
  //   - Sprite (500ml): S/.5
  //   - Shandy (Cerveza Lager y bebida gasificada): S/.7
  //   - Coca Cola Zero (300ml): S/.4
  //   - Inca Kola (500ml): S/.5
  //   - Pepsi (355ml): S/.2.5
  //   - 7 Up (355ml): S/.1
  //   - Fanta (500ml): S/.5
  //   - Inca Kola Zero (300ml): S/.4
  //   - Guarana (330ml): S/.2.5
  //   - Concordia Piña (355ml): S/.2.5
    
  //   OTROS:
  //   - Salchipapa Deluxe (con 3 toppings a elección): S/.18.9
  //   - Filete de Pollo a la parrilla: S/.14.9
  //   - Papas fritas Crocantes (150 gr): S/.6
  //   - Camote frito: S/.6
  //   - Salchipapa con Queso y Tocino: S/.17.9
  //   - Salchipapa Frankfuter: S/.14.9
  //   - Choripan con Chimichurri: S/.10.9
  //   - Salchipapa con Queso Cheddar: S/.15.9
  //   - Combo papas fritas + Gaseosa PepsiCo: S/.6
  //   - Combo camote frito + Gaseosa PepsiCo: S/.6
    
  //   CREMAS DISPONIBLES:
  //   - Ketchup
  //   - Mayonesa
  //   - Mostaza
  //   - Ají
  //   - Aceituna
  //   - Rocoto

  //   HISTORIAL DE CONVERSACIÓN:
  //   --------------
  //   {HISTORIAL_CONVERSACION}
  //   --------------
    
  //   DIRECTRICES DE INTERACCIÓN:
  //   1. Proporciona información detallada y precisa sobre nuestros platos cuando se solicite.
  //   2. Anima a los clientes a realizar sus pedidos directamente a través de este chat.
  //   3. Confirma los detalles del pedido con el cliente para asegurar su total satisfacción.
  //   4. Si INIT es 1, omite el saludo inicial para evitar repeticiones y procede directamente con la consulta o servicio requerido.
  //   5. Cuando saludes siempre di el nombre del restaurante y además dejas indicando que le dejas un link de la carta.

  //   EJEMPLOS DE RESPUESTAS:
  //   "Bienvenido a LaBurger Lima, ¿te gustaría ordenar alguna de nuestras hamburguesas destacadas o necesitas alguna recomendación?"
  //   "¡Por supuesto! ¿Te gustaría ordenar alguna de nuestras hamburguesas destacadas o necesitas alguna recomendación?"
  //   "Estoy aquí para ayudarte con tu pedido, ¿qué te gustaría probar hoy?"
  //   " Para terminar con tu orden necesito tu nombre y dirección de entrega por favor"
  //   "¿Te interesa probar nuestra Hamburguesa Especial de la Casa o prefieres algo más tradicional como nuestra Hamburguesa Clásica?"
    
  //   INSTRUCCIONES:
  //   - Utiliza respuestas cortas y claras, ideales para enviar por WhatsApp.
  //   - En lo posible agregar emojis al mensaje.
  //   - Mantén las respuestas basadas en el menú y la información proporcionada.
  //   - Si INIT es 1, evita el saludo inicial para no ser repetitivo y ofrece directamente la asistencia.
  //   `;

  // generatePromptSeller = (history: string) => {
  //   let init = '0';
  //   if (history.includes('Vendedor')) {
  //     init = '1';
  //   }
  //   const nowDate = getFullCurrentDate();
  //   return this.PROMPT_SELLER.replace('{HISTORIAL_CONVERSACION}', history)
  //     .replace('{CURRENT_DAY}', nowDate)
  //     .replace('{INIT}', init);
  // };

  // async INFO(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
  //   try {
  //     const prompt = this.generatePromptSeller(historyParsed);
  //     console.log('PROMPT:', prompt);
  //     const text = await this.aiService.createChat([
  //       {
  //         role: 'system',
  //         content: prompt,
  //       },
  //     ]);

  //     const chunks = text.split(/(?<!\d)\.\s+/g);
  //     for (const chunk of chunks) {
  //       const newMessage =
  //         await this.historyService.setAndCreateAssitantMessage(
  //           messageEntry,
  //           chunk,
  //         );
  //       await this.senderService.sendMessages(
  //         this.builderTemplate.buildTextMessage(
  //           messageEntry.clientPhone,
  //           chunk,
  //         ),
  //       );
  //     }
  //   } catch (err) {
  //     console.log(`[ERROR]:`, err);
  //     return;
  //   }
  // }

  //   PROMPT_GET_PRODUCTS = `
  //   Basado en el historial de la conversación proporcionada y nuestra lista de productos disponibles, tu tarea es identificar y extraer las menciones finales de productos y adicionales realizadas por el cliente, organizándolos en grupos según su relación en el pedido. Considera que algunos productos pueden ser parte de un combo o tener adicionales especificados por el cliente.
  //   Historial de la Conversación:
  //   {CONVERSATION_HISTORY}

  //   Lista de Productos Disponibles:
  //   {PRODUCT_LIST}

  //   Instrucciones:
  //   1. Analiza detalladamente la conversación proporcionada para identificar todas las menciones de productos finales, incluyendo los platos principales, adicionales, toppings y cremas.
  //   2. Compara las menciones finales encontradas con la lista de productos disponibles que hemos proporcionado.
  //   3. Crea un array con los nombres de los productos y adicionales exactos según aparecen en nuestra lista de productos disponibles cuando encuentres una coincidencia.
  //   4. Si un producto mencionado por el cliente se encuentra en nuestra lista, inclúyelo en el array con el nombre exacto registrado en la base de datos.
  //   5. El array debe reflejar solo los productos y adicionales finales confirmados en la conversación, asegurándote de que cada elemento coincida con un producto de nuestra base de datos.
  //   6. Agrupa los productos , sus adicionales y cremas según cómo el cliente los ha confirmado en su pedido.
  //   7. Los productos iguales pero no relacionados directamente deben listarse por separado.

  //   Ejemplo de Formato de Respuesta Esperado (solo el array):
  //   [
  //     [
  //         "Burger Deluxe"
  //     ],
  //     [
  //         "Burger Deluxe"
  //     ],
  //     [
  //         "Burger Clasica",
  //         "Adic, Chorizo*",
  //         "Adic, Plátano frito"
  //     ],
  //     [
  //         "Pepsi"
  //     ],
  //     [
  //         "Pepsi"
  //     ]
  // ]
  //   Asegúrate de que el array final sea una representación precisa de la última conversación con el cliente, utilizando los nombres reales de los productos y adicionales tal como están registrados en nuestra base de datos.
  //   `;
//   PROMPT_GET_PRODUCTS = `Basándonos en la siguiente conversación entre un cliente y un vendedor, y considerando nuestra carta de menú detallada, tu tarea es identificar y listar todos los productos finales mencionados por el cliente, asegurándote de corregir y adaptar cualquier mención a los nombres exactos de los productos tal como aparecen en nuestra carta. Si en caso no exista el producto mencionado por el cliente entonces este no agregarlo a la respuesta.Considera los cambios realizados durante la conversación, como adiciones o eliminaciones de productos.
// Historial de la Conversación:
// --------------
// {CONVERSATION_HISTORY}
// --------------
//  MENÚ COMPLETO:
// --------------
// HAMBURGUESAS:
//     - Burger Doble (2 carnes de 130 gr): S/.17.9
//     - Burger Royal (con huevo frito): S/.14.9
//     - Burger a lo pobre (con plátano frito): S/.16.9
//     - Burger Hawaiana (con Piña, queso y jamón): S/.16.9
//     - Burger Bacon (con Tocino ahumado): S/.15.9
//     - Burger Caramel / Cheddar (con cebollas caramelizadas y queso Cheddar): S/.15.9
//     - Burger Argentina (con chorizo parrillero): S/.17.9
//     - Burger Clásica (con papas al hilo, lechuga y tomate): S/.13.9
//     - Burger Cheese (con Queso Edam o Cheddar): S/.14.9
//     - Burger Deluxe (con 4 toppings a elección, no incluye chorizo/carne extra): S/.18.9
    
//     ADICIONALES (Solo para hamburguesas y otros):
//     - Jamón: S/.2
//     - Filete de pollo Extra: S/.6
//     - Tocino: S/.3
//     - Queso Edam: S/.2
//     - Queso Cheddar: S/.2
//     - Plátano frito: S/.2
//     - Piña: S/.2
//     - Huevo: S/.2
//     - Carne extra: S/.5
//     - Chorizo: S/.5
//     - Cebolla Caramelizada: S/.2
    
//     BEBIDAS:
//     - Agua San Carlos (500ml): S/.2
//     - Sprite (500ml): S/.5
//     - Shandy (Cerveza Lager y bebida gasificada): S/.7
//     - Coca Cola Zero (300ml): S/.4
//     - Inca Kola (500ml): S/.5
//     - Pepsi (355ml): S/.2.5
//     - 7 Up (355ml): S/.1
//     - Fanta (500ml): S/.5
//     - Inca Kola Zero (300ml): S/.4
//     - Guarana (330ml): S/.2.5
//     - Concordia Piña (355ml): S/.2.5
    
//     OTROS:
//     - Salchipapa Deluxe (con 3 toppings a elección): S/.18.9
//     - Filete de Pollo a la parrilla: S/.14.9
//     - Papas fritas Crocantes (150 gr): S/.6
//     - Camote frito: S/.6
//     - Salchipapa con Queso y Tocino: S/.17.9
//     - Salchipapa Frankfuter: S/.14.9
//     - Choripan con Chimichurri: S/.10.9
//     - Salchipapa con Queso Cheddar: S/.15.9
//     - Combo papas fritas + Gaseosa PepsiCo: S/.6
//     - Combo camote frito + Gaseosa PepsiCo: S/.6
    
//     CREMAS DISPONIBLES:
//     - Ketchup
//     - Mayonesa
//     - Mostaza
//     - Ají
//     - Aceituna
//     - Rocoto
// --------------

//  INSTRUCCIONES:

// -Extracción y Verificación: Analiza cuidadosamente la conversación entre el cliente y el vendedor. Identifica los productos mencionados y verifica cada uno contra nuestra carta de menú detallada.
// -Filtrado de Productos: Incluye en el array final únicamente aquellos productos que coinciden exactamente con los ítems disponibles en nuestra carta. Los productos que no estén en la carta NO deben ser agregados al array.
// -Detalles del Pedido: Para los productos que sí se encuentran en la carta, lista su nombre exacto como aparece en el menú, la cantidad solicitada y cualquier especificación adicional mencionada por el cliente.
// -Organización del Pedido: Presenta la información de manera ordenada y clara, reflejando el pedido actualizado del cliente según la conversación, pero solo incluyendo los productos que se validaron como parte de la carta.
// -Confirmación Final: Revisa que cada ítem incluido en el array final realmente exista en la carta del menú y corresponda a las especificaciones del cliente.

// Nota Adicional: Asegúrate de revisar cada pedido contra la carta para confirmar la disponibilidad antes de incluir cualquier producto en el array final. Este enfoque garantiza que solo los productos válidos y confirmados se reflejen en el pedido finalizado.


// EJEMPLO RESPUESTA:
// [
//     {
//         "producto": "Burger Deluxe",
//         "cantidad": 1,
//         "adicionales": [],
//         "notas": []
//     },
//     {
//         "producto": "Papas fritas Crocantes",
//         "cantidad": 1,
//         "adicionales": [],
//         "notas": []
//     },
//     {
//         "producto": "Burger Clásica",
//         "cantidad": 1,
//         "adicionales": ["Mayonesa"],
//         "notas": [ ]
//     }
// ]
// EJEMPLO SIN PRODUCTOS
//  [ ]
// `
  // generatePromptGetProducts = (history: string, productsDB: any) => {
  //   let productsDbParsed = JSON.stringify(productsDB);
  //   return this.PROMPT_GET_PRODUCTS.replace(
  //     '{CONVERSATION_HISTORY}',
  //     history,
  //   ).replace('{PRODUCT_LIST}', productsDbParsed);
  // };

//   PROMPT_BUILD_ORDER = `
//   Basado en el historial de la conversación proporcionada y la lista de productos seleccionados por el cliente, tu tarea es crear un array de objetos que represente el pedido final de manera precisa. Cada objeto debe seguir nuestra estructura estándar para un producto ordenado, completando las propiedades conocidas basadas en la información proporcionada y dejando vacías aquellas que sean desconocidas.

//   Glosario:
//   - Producto: Cualquier ítem que el cliente puede ordenar directamente.
//   - Adicional/Topping: Ingredientes o ítems que se añaden a un producto principal, identificados en las menciones de la conversación.
//   - Combo: Un paquete de productos ofrecidos a un precio especial, que puede incluir el producto principal junto con varios adicionales o toppings específicos.
//   Historial de la Conversación:
//   {CONVERSATION_HISTORY}
  
//   Productos Seleccionados (validados de la base de datos):
//   {VALIDATED_PRODUCTS}

//   Instrucciones Detalladas:
//   1. Examina la información proporcionada en la conversación y los productos seleccionados para determinar los detalles finales del pedido, incluyendo la cantidad de cada producto y los adicionales mencionados.
//   2. Establece la 'quantity' y 'subtotal' para cada producto basándote en la conversación; asume 1 como cantidad predeterminada si no se especifica.
//   3. Identifica los 'toppings' y 'sauce' mencionados para cada producto. Asigna como 'toppings' aquellos adicionales mencionados que aumentan el precio.
//   4. Para los productos clasificados como 'combo', utiliza el nombre del producto como 'name' y lista los productos o toppings que se mencionan como incluidos en la propiedad 'combo', basándote en la descripción del producto. Si los toppings son parte de la descripción del combo incluido, estos deben ser clasificados en 'combo', no en 'toppings', y no deben incrementar el precio del combo.
//   5. Deja cualquier propiedad desconocida o no mencionada como vacía.
  
//   Ejemplo de Estructura de Pedido para el Array Final:
//   [
//       {
//           "id": "1070",
//           "name": "Burger Deluxe",
//           "price": 18.9,
//           "quantity": 1,
//           "subtotal": 18.9,
//           "description": "Burger c/4 toppings a elección incluidos",
//           "notes": "Adicional de chorizo",
//           "active": true,
//           "toppings": [],
//           "sauce": [],
//           "combo": [{"name": "Jamón"}, {"name": "Filete de pollo Extra"}, {"name": "Tocino"}, {"name": "Queso Cheddar"}]
//       },
//       {
//           "name": "Burger Simple con Huevo",
//           "price": [determinar según base de datos si disponible],
//           "quantity": 1,
//           "subtotal": [calcular basado en precio y adicionales],
//           "description": "Burger simple con adicional de huevo",
//           "notes": "",
//           "active": [determinar si activo según base de datos],
//           "toppings": [{"name": "Huevo", "price": [precio del huevo si es adicional]}],
//           "sauce": [],
//           "combo": []
//       }
//       // Añade más objetos según cada producto en el pedido.
//   ]
  
//   Recuerda detallar el pedido final del cliente utilizando la información proporcionada y siguiendo las especificaciones de la estructura del producto.
//  `;

  // generatePromptBuildOrder = (history: string, validProducts: any) => {
  //   let validProductsParsed = JSON.stringify(validProducts);
  //   return this.PROMPT_BUILD_ORDER.replace(
  //     '{CONVERSATION_HISTORY}',
  //     history,
  //   ).replace('{VALIDATED_PRODUCTS}', validProductsParsed);
  // };

  // async ORDER(ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) {
  //   try {
  //     const productsDB = await this.googleSpreadsheetService.getProducts();
  //     // debo determinar si el producto existe en el menu de la db
  //     // si existe debo retornar el precio y la descripcion del producto
  //     // si no existe debo retornar un mensaje de error
  //     const prompt = this.generatePromptGetProducts(historyParsed, productsDB);
  //     console.log('PROMPT:', prompt);
  //     const text = await this.aiService.createChat([
  //       {
  //         role: 'system',
  //         content: prompt,
  //       },
  //     ]);
  //     const validProducts = JSON.parse(text);
  //     console.log('VALID PRODUCTS:', validProducts);
  //     const arrayValidProduct = await this.findAndProcessProducts(
  //       validProducts,
  //       productsDB,
  //       historyParsed,
  //     );
  //     console.log('ARRAY VALID PRODUCTS:', arrayValidProduct);
  //     // const findValidProducts = productsDB.filter(product => {
  //     //   return arrayValidProduct.includes(product.name);
  //     // })
  //     // console.log('FIND VALID PRODUCTS:', findValidProducts);
  //     const promptBuildOrder = this.generatePromptBuildOrder(historyParsed, arrayValidProduct);
  //     console.log('PROMPT BUILD ORDER:', promptBuildOrder);
  //     const textBuildOrder = await this.aiService.createChat([
  //       {
  //         role: 'system',
  //         content: promptBuildOrder,
  //       },
  //     ]);
  //     console.log('TEXT BUILD ORDER:', textBuildOrder);
  //     const order = JSON.parse(textBuildOrder);
  //     console.log('ORDER:', order);
  //     const message = await this.buildOrderMessage(order);
  //     const newMessage = await this.historyService.setAndCreateAssitantMessage(
  //       messageEntry,
  //       message,
  //     );
  //     await this.senderService.sendMessages(
  //       this.builderTemplate.buildTextMessage(
  //         messageEntry.clientPhone,
  //         message,
  //       ),
  //     );
  //     // const chunks = text.split(/(?<!\d)\.\s+/g);
  //     // for (const chunk of chunks) {
  //     //   const newMessage =
  //     //     await this.historyService.setAndCreateAssitantMessage(
  //     //       messageEntry,
  //     //       chunk,
  //     //     );
  //     //   await this.senderService.sendMessages(
  //     //     this.builderTemplate.buildTextMessage(
  //     //       messageEntry.clientPhone,
  //     //       chunk,
  //     //     ),
  //     //   );
  //     // }
  //   } catch (err) {
  //     console.log(`[ERROR]:`, err);
  //     return;
  //   }
  // }

  // async findAndProcessProducts(orderList, productList, historyParsed) {
  //   let productsValidated = [];
  //   let finalOrder = [];
  //   for (let orders of orderList) {
  //     for (let orderItem of orders) {
  //       // Find the first product that matches the order item
  //       let product = productList.find((product) =>
  //         product.name.toLowerCase().includes(orderItem.toLowerCase()),
  //       );

  //       if (product) {
  //         productsValidated.push(product); // Add product to results
  //         // await prompt(product); // Wait for the 'prompt' function to complete before continuing
  //       }
  //     }
  //     // const promptBuildOrder = this.generatePromptBuildOrder(
  //     //   historyParsed,
  //     //   productsValidated,
  //     // );
  //     // console.log('PROMPT BUILD ORDER:', promptBuildOrder);
  //     // const textBuildOrder = await this.aiService.createChat([
  //     //   {
  //     //     role: 'system',
  //     //     content: promptBuildOrder,
  //     //   },
  //     // ]);
  //     // console.log('TEXT BUILD ORDER:', textBuildOrder);
  //     // const order = JSON.parse(textBuildOrder);
  //     // console.log('ORDER:', order);
  //     // finalOrder.push(order);
  //     // productsValidated = [];
  //   }
  //   return productsValidated;
  // }

  // async buildOrderMessage(orderArray) {
  //   let message = "🍔 Tu pedido en LaBurger Lima:\n\n";
  //   let totalOrder = 0;

  //   orderArray.forEach(item => {
  //     message += `${item.quantity}x ${item.name} - S/.${item.price}\n`;
  //     if (item.combo.length > 0) {
  //       message += "   Combo incluye:\n";
  //       item.combo.forEach(comboItem => {
  //         message += `   - ${comboItem.name}\n`; // Asumimos que los combos no modifican el precio
  //       });
  //     }
  //     if (item.toppings.length > 0) {
  //       message += "   Adicionales:\n";
  //       item.toppings.forEach(topping => {
  //         message += `   - ${topping.name}: S/.${topping.price}\n`;
  //         item.subtotal += parseFloat(topping.price); // Asegúrate de que price es un número
  //       });
  //     }
  //     if (item.sauce.length > 0) {
  //       message += "   Salsas:\n";
  //       item.sauce.forEach(sauce => {
  //         message += `   - ${sauce.name}\n`; // Suponiendo que las salsas son gratis o ya están incluidas en el precio
  //       });
  //     }
  //     if (item.notes) {
  //       message += `   Notas: ${item.notes}\n`;
  //     }
  //     message += `   Subtotal: S/.${item.subtotal.toFixed(2)}\n\n`; // Asegura dos decimales en el subtotal
  //     totalOrder += item.subtotal; // Suma al total del pedido
  //   });

  //   message += `Total del pedido: S/.${totalOrder.toFixed(2)}`; // Total del pedido con dos decimales
  //   return message;
  // }

  // async ADDRESS(ctx: Ctx, messageEntry: IParsedMessage) { }

  // async PAYMENT(ctx: Ctx, messageEntry: IParsedMessage) { }

  // PROMPT_FILTER_AVAILABLE =  `Como una inteligencia artificial avanzada, tu tarea es analizar [HISTORIAL_CONVERSACION] y seleccionar la acción más adecuada en respuesta a la [QUESTION].
  // --------------------------------------------------------
  // [HISTORIAL_CONVERSACION]:
  // {HISTORY}

  // [QUESTION]:
  // {QUESTION}
  
  // Posibles acciones a realizar:
  // 1. INFO: Esta acción es cuando el cliente pregunta por información general sobre los servicios que ofrecemos y nada relacionado a la disponibilidad. Generalmente son preguntas acerca del servicio o precios.
  // 2. DISPONIBILIDAD: Esta acción se debe realizar cuando el cliente expresa su deseo de programar una cita.
  // 3. CONFIRMAR: Esta acción se debe realizar cuando el cliente confirma la hora y fecha de la cita despues de haberle brindado las opciones disponibles.
  // -----------------------------

  // Tu objetivo es comprender la intención del cliente y seleccionar la acción más adecuada en respuesta a su declaración.
  
  
  // Respuesta ideal (INFO|DISPONIBILIDAD|CONFIRMAR):`;

  
  // checkAvailabilityFlow = async (ctx: Ctx, messageEntry: IParsedMessage, historyParsed: string) => {
  //   try {
  //     const promptGetDateAndHour = this.generatePromptFilter(historyParsed);
  //     const posibleDate = await this.aiService.desiredDateFn([
  //       {
  //         role: 'system',
  //         content: promptGetDateAndHour,
  //       },
  //     ]);
  //     console.log('posibleDate:', posibleDate);
  //     let possibleDay = posibleDate?.date || '';
  //     let possibleHour = posibleDate?.hour || '';
  //     let fullDate = `${possibleDay} ${possibleHour}`;
  //     console.log('fullDate:', fullDate)
  //     if(!fullDate) {
  //       let fullDate = Utilities.today()
  //     }
  //     const validateDate = Utilities.isWithinBusinessHours(fullDate);
  //     if(!validateDate) {
  //       let message = 'Lo siento, la fecha y hora seleccionada no se encuentra dentro de nuestro horario de atención. Por favor, selecciona una fecha y hora dentro de nuestro horario de atención.';
  //       const newMessage = await this.historyService.setAndCreateAssitantMessage(
  //         messageEntry,
  //         message,
  //       );
  //       await this.senderService.sendMessages(
  //         this.builderTemplate.buildTextMessage(
  //           messageEntry.clientPhone,
  //           message,
  //         ),
  //       );
  //       return;
  //     }
  //     const availableHours = await this.googleCalendarService.findAvailableSlots('abel3121@gmail.com',fullDate);
  //     const parsedAvailableHours = Utilities.parseAvailableSpots(availableHours);
  //     ctx.parsedAvailableHours = parsedAvailableHours;
  //     await this.ctxService.updateCtx(ctx._id, ctx);
  //     console.log('parsedAvailableHours', parsedAvailableHours)
  //     const propmtAnswerDate = this.generatePromptAnswerDate(parsedAvailableHours,historyParsed);
  //     console.log('propmtAnswerDate', propmtAnswerDate)
  //     const finalAnswer = await this.aiService.createChat([
  //       {
  //         role: 'system',
  //         content: propmtAnswerDate,
  //       }
  //     ]);

  //     const chunks = finalAnswer.split(/(?<!\d)\.\s+/g);
  //     for (const chunk of chunks) {
  //       const newMessage =
  //         await this.historyService.setAndCreateAssitantMessage(
  //           messageEntry,
  //           chunk,
  //         );
  //       await this.senderService.sendMessages(
  //         this.builderTemplate.buildTextMessage(
  //           messageEntry.clientPhone,
  //           chunk,
  //         ),
  //       );
  //     }


  //   } catch (err) {
  //     console.log(`[ERROR]:`, err);
  //     return;
  //   }
  
  // }

  // sendGreetings = async (ctx: Ctx, messageEntry: IParsedMessage) => {
  //   const clientName = messageEntry.clientName;
  //   const text = `Hola ${clientName}, soy Ali, tu asistente virtual. Estoy aquí para ayudarte a mejorar tus procesos de ventas y la atención al cliente con inteligencia artificial. Puedo ofrecerte información sobre nuestros servicios y precios, ayudarte a agendar una demostración con nuestros especialistas, o resolver cualquier duda que tengas. ¿Cómo puedo asistirte hoy?`;
  //   const newMessage = await this.historyService.setAndCreateAssitantMessage(
  //     messageEntry,
  //     text,
  //   );
  //   await this.senderService.sendMessages(
  //     this.builderTemplate.buildTextMessage(
  //       messageEntry.clientPhone,
  //       text,
  //     ),
  //   );
  // }

//   sendAvailability = async (ctx: Ctx, messageEntry: IParsedMessage) => {
//     const generatePromptFilter = this.generatePromptFilterDate();
//     console.log('PROMPT:', generatePromptFilter);
//     const response = await this.aiService.createChat([
//       {
//         role: 'system',
//         content: generatePromptFilter,
//       },
//     ]);
//     // determinar si existe preferencia de fecha y hora o solo consulta por disponibilidad
//     // Si existe entonces buscamos en la db extraemos y construimos respuesta
//     // si no existe entonces le brindamos las opciones de fecha y hora disponibles mas prontas y aedmas lo invitamos a ingesar una fecha y hora


// }