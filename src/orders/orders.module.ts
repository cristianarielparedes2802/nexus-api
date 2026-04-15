import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { OrdersController } from './orders.controller';
import { CreateOrderHandler } from './commands/handlers/create-order.handler';
import { GetOrdersHandler } from './queries/handlers/get-orders.handler';
import { GetOrderByIdHandler } from './queries/handlers/get-order-by-id.handler';

const CommandHandlers = [CreateOrderHandler];
const QueryHandlers = [GetOrdersHandler, GetOrderByIdHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
  ],
  controllers: [OrdersController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class OrdersModule {}
