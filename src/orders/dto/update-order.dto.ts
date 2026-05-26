import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './create-order.dto';

export class UpdateOrderDto {
  @ApiProperty({ example: '2026-08-01', required: false })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiProperty({
    example: 'Av. Paulista, 1000 - São Paulo, SP',
    required: false,
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ enum: OrderStatus, required: false })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ type: [CreateOrderItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
