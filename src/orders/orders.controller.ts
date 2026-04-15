import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../users/enums/role.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderCommand } from './commands/create-order.command';
import { GetOrdersQuery } from './queries/get-orders.query';
import { GetOrderByIdQuery } from './queries/get-order-by-id.query';

interface AuthUser {
  id: number;
  email: string;
  role: Role;
}

@ApiTags('orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(Role.Admin, Role.Client)
  @ApiOperation({ summary: 'Place a new order — dispatches CreateOrderCommand (CQRS)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Insufficient stock' })
  createOrder(@Body() dto: CreateOrderDto, @CurrentUser() user: AuthUser) {
    return this.commandBus.execute(new CreateOrderCommand(user.id, dto.items));
  }

  @Get()
  @Roles(Role.Admin, Role.Client)
  @ApiOperation({ summary: 'Get orders — dispatches GetOrdersQuery (CQRS). Client sees own, Admin sees all' })
  getOrders(@CurrentUser() user: AuthUser) {
    return this.queryBus.execute(new GetOrdersQuery(user.id, user.role));
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Client)
  @ApiOperation({ summary: 'Get order by ID — dispatches GetOrderByIdQuery (CQRS)' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  getOrderById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.queryBus.execute(new GetOrderByIdQuery(id, user.id, user.role));
  }
}
