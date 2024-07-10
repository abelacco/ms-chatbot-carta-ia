import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseStringToArrayPipe implements PipeTransform<string, string[]> {
  transform(value: string, metadata: ArgumentMetadata): string[] {
    if (!value) {
      throw new BadRequestException('Validation failed');
    }
    return value['query'].split(',').map((word) => word.trim());
  }
}
