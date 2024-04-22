import { PartialType } from '@nestjs/mapped-types';
import { CreateFlowDto } from './create-flow.dto';

export class UpdateFlowDto extends PartialType(CreateFlowDto) {}
