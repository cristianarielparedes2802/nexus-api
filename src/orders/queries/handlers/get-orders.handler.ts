import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetOrdersQuery } from '../get-orders.query';
import { Order } from '../../entities/order.entity';
import { Role } from '../../../users/enums/role.enum';

@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
  ) {}

  async execute(query: GetOrdersQuery): Promise<Order[]> {
    const { userId, role } = query;

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .orderBy('order.createdAt', 'DESC');

    if (role !== Role.Admin) {
      qb.where('user.id = :userId', { userId });
    }

    return qb.getMany();
  }
}
