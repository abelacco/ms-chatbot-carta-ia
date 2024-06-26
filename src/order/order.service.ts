import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { v4 as uuidv4 } from 'uuid';
import { CtxService } from 'src/context/ctx.service';
import { IOrderDao } from './db/orderDao';
import { MongoDbService } from './db/mongodb.service';
import { HistoryService } from 'src/history/history.service';
import { CartaDirectaController } from 'src/carta-directa/cartaDirecta.controller';
import { BusinessModule } from 'src/business/business.module';
import { BusinessService } from 'src/business/business.service';
import { SenderService } from 'src/sender/sender.service';
import { BuilderTemplatesService } from 'src/builder-templates/builder-templates.service';

console.log(uuidv4());

@Injectable()
export class OrderService {
  private readonly _db: IOrderDao;
  constructor(
    private readonly _mongoDbService: MongoDbService,
    private readonly ctxService: CtxService,
    private readonly historyService: HistoryService,
    private readonly businessService: BusinessService,
    private readonly senderService: SenderService,
    private readonly builderTemplateService: BuilderTemplatesService,
  ) {
    this._db = this._mongoDbService;
  }

  async create(createOrderDto: CreateOrderDto) {
    const locationMessage = await this.historyService.findLastLocationMessage(
      createOrderDto.clientPhone,
      createOrderDto.chatBotNumber,
    );

    const business = await this.businessService.getBusiness(
      createOrderDto.chatBotNumber,
    );

    const deliveryZoneFinded = business.coverage.find(
      (area) => area.area === createOrderDto.deliveryZone,
    );

    /* Manejo de errores */
    if (!business) {
      throw new NotFoundException(
        `Business with chatbotnumber ${createOrderDto.chatBotNumber} not exist`,
      );
    }

    if (!deliveryZoneFinded) {
      throw new NotFoundException(
        `Delivery zone ${createOrderDto.deliveryZone} not found in business with chatbotnumber ${createOrderDto.chatBotNumber}`,
      );
    } else {
      createOrderDto.deliveryCost = deliveryZoneFinded.price;
    }

    if (!locationMessage) {
      throw new NotFoundException('The user has not provided their location.');
    }

    const coordinatesArray = locationMessage.content.split(',');

    const order = {
      ...createOrderDto,
      orderId: uuidv4(),
      latitude: coordinatesArray[0],
      longitude: coordinatesArray[1],
    };

    const messageTemplate = await this.builderTemplateService.buildTextMessage(
      createOrderDto.clientPhone,
      `Ya hemos tomado tu pedido de: ${createOrderDto.order}\n\nEl costo total es de: S/${createOrderDto.price}\nY el costo del delivery es de S/${createOrderDto.deliveryCost}`,
    );

    await this.senderService.sendMessages(
      messageTemplate,
      createOrderDto.chatBotNumber,
    );

    const ctx = await this.ctxService.manualOrder(order);

    await this.historyService.setAndCreateAssitantMessage(
      {
        chatbotNumber: ctx.chatbotNumber,
        clientName: '',
        clientPhone: ctx.clientPhone,
        type: 'text',
        content: `Ya hemos tomado tu pedido de: ${createOrderDto.order}\n\nEl costo total es de: S/${createOrderDto.price}\nY el costo del delivery es de S/${createOrderDto.deliveryCost}`,
      },
      `Ya hemos tomado tu pedido de: ${createOrderDto.order}\n\nEl costo total es de: S/${createOrderDto.price}\nY el costo del delivery es de S/${createOrderDto.deliveryCost}`,
    );
    const createdOrder = this._db.create(order);
    return createdOrder;
  }

  async findAll() {
    const orders = await this._db.findAll();
    return orders;
  }

  async findOne(id: string) {
    const order = await this._db.findOne(id);
    if (!order) {
      throw new NotFoundException(`Order with orderId: ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this._db.update(id, updateOrderDto);
    const ctx = await this.ctxService.manualOrder(order);
    return order;
  }
}
