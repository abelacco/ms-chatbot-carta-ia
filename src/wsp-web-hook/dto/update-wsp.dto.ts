import { PartialType } from '@nestjs/mapped-types';
import { CreateWspDto } from './create-wsp.dto';

export class UpdateWspDto extends PartialType(CreateWspDto) {}
