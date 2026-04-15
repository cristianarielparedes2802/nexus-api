import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderCommand } from '../create-order.command';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { Product } from '../../../products/entities/product.entity';
import { User } from '../../../users/entities/user.entity';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const { userId, items } = command;

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productRepo.findOneBy({
        id: item.productId,
        isActive: true,
      });

      if (!product) {
        throw new NotFoundException(
          `Product #${item.productId} not found or unavailable`,
        );
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}" (available: ${product.stock})`,
        );
      }

      product.stock -= item.quantity;
      await this.productRepo.save(product);

      const orderItem = this.orderItemRepo.create({
        product,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      total += Number(product.price) * item.quantity;
      orderItems.push(orderItem);
    }

    const order = this.orderRepo.create({
      user,
      items: orderItems,
      total,
      status: 'pending',
    });

    return this.orderRepo.save(order);
  }
}
