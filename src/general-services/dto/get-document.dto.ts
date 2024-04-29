import { IsNotEmpty, IsString, Matches } from "class-validator";

export class DocumentDto {

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?:\d{8}|\d{11})$/, { message: 'documento debe tener 8 o 11 dígitos.' })
    idNumber: string
}
