import { Controller} from '@nestjs/common';
import { FlowsService } from './flows.service';


@Controller('flows')
export class FlowsController {
  constructor(private readonly flowsService: FlowsService) {}

}
