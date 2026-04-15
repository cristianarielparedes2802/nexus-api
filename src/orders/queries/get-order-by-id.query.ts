import { Role } from '../../users/enums/role.enum';

export class GetOrderByIdQuery {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly role: Role,
  ) {}
}
