import { PartialType } from '@nestjs/mapped-types';
import { CreateSenderDto } from './create-sender.dto';

export class UpdateSenderDto extends PartialType(CreateSenderDto) {}
