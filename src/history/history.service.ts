import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto';
import { IHistoryDao } from './db/historyDao';
import { MongoDbService } from './db/mongodb.service';
import { IParsedMessage } from 'src/builder-templates/interface';
import { History } from './entities/history.entity';


@Injectable()
export class HistoryService {
  private readonly _db: IHistoryDao;

  constructor(
    private readonly _mongoDbService: MongoDbService,
  ) {
    this._db = this._mongoDbService;

  }
  // creas una nuevo mensaje en el historial
  async create(createHistoryDto: CreateHistoryDto) {
    try {
      let newMessage = await this._db.create(createHistoryDto);
      return await newMessage.save();
    }
    catch (error) {
      throw error;
    }
  }

  async setAndCreateAssitantMessage(messageEntry: IParsedMessage , content: string) {
    messageEntry.content = content;
    let role = 'assistant'
    let newMessage = this.setModel(messageEntry, role);

    try {
      await this.create(newMessage);
      return newMessage;

    }
    catch (error) {
      throw error;
    }
  }

  // Obtienes el historial de mensaje desde el mas reciente al mas antiguo
  async findAll(clientPhone: string, chatbotNumber: string) {
    try {
      return await this._db.findAll(clientPhone, chatbotNumber);
    }
    catch (error) {
      throw error;
    }

  }

  // Creas un nuevo mensaje en el historial y obtienes el historial completo
  async createAndGetHistoryParsed(messageEntry: IParsedMessage) {
    messageEntry.content.id ? messageEntry.content = messageEntry.content.id : ''
    let newMessage = this.setModel(messageEntry, 'user');

    try {
      await this.create(newMessage);
      const history = await this.findAll(newMessage.clientPhone, newMessage.chatbotNumber);
      const parsedHistory = this.parseHistory(history);
      return parsedHistory;

    }
    catch (error) {
      throw error;
    }
  }

  setModel(messageEntry: IParsedMessage, role?: string) {
    let newMessage:CreateHistoryDto = {
      chatbotNumber: messageEntry.chatbotNumber,
      clientPhone: messageEntry.clientPhone,
      content: messageEntry.content,
      role: role ? role : 'user',
      type: messageEntry.type
    }
    return newMessage;
  }
  // Parsea el historial para obtener un string de historia
  parseHistory(history: History[], k?: number)  {
    // Revierte la historia para comenzar desde el principio de la conversación
    const originalOrderHistory = [...history].reverse();
    const limitedHistory = k ? originalOrderHistory.slice(0, k) : originalOrderHistory;

    // Agrupamos los mensajes consecutivos del mismo autor.
    let groupedMessages = limitedHistory.reduce((acc, current, index, arr) => {
        if (index === 0) {
            acc.push(current); // Agrega el primer mensaje al acumulador
        } else {
            // Si el mensaje actual y el anterior son del mismo remitente, combínelos
            if (current.role === arr[index - 1].role) {
                let lastMessage = acc[acc.length - 1];
                lastMessage.content = `${lastMessage.content} ${current.content}`;
            } else {
                acc.push(current);
            }
        }
        return acc;
    }, []);

    // Transformamos el array agrupado en un string, manteniendo el orden correcto de los mensajes.
    let conversationString = groupedMessages.map(message => {
        const prefix = message.role === 'user' ? 'Cliente' : 'Vendedor';
        return `${prefix}: "${message.content}"`;
    }).join('\n');

    return conversationString;
  }

}
