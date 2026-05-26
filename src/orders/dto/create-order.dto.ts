import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'Camiseta azul tamanho M' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity!: number;

  @ApiProperty({ example: 49.9 })
  @IsNumber()
  @IsPositive()
  unitPrice!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'ORD-006' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({ example: '2026-07-10' })
  @IsDateString()
  estimatedDeliveryDate!: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  customerDocument!: string;

  @ApiProperty({ example: 'Rua das Flores, 123 - São Paulo, SP' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress!: string;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
