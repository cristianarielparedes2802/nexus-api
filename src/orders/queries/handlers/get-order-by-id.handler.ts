import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GetOrderByIdQuery } from '../get-order-by-id.query';
import { Order } from '../../entities/order.entity';
import { Role } from '../../../users/enums/role.enum';

@QueryHandler(GetOrderByIdQuery)
export class GetOrderByIdHandler implements IQueryHandler<GetOrderByIdQuery> {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(query: GetOrderByIdQuery): Promise<Order> {
    const { orderId, userId, role } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .where('order.id = :orderId', { orderId });

    if (role !== Role.Admin) {
      qb.andWhere('user.id = :userId', { userId });
    }

    const order = await qb.getOne();
    if (!order) throw new NotFoundException(`Order #${orderId} not found`);
    return order;
  }
}
