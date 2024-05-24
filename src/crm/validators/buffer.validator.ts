import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'bufferStructure', async: false })
export class BufferStructureValidator implements ValidatorConstraintInterface {
  validate(buffer: any, args: ValidationArguments) {
    if (!buffer || typeof buffer !== 'object' || !Array.isArray(buffer.data)) {
      return false;
    }
    for (const num of buffer.data) {
      if (typeof num !== 'number' || num < 0 || num > 255) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid buffer structure';
  }
}
