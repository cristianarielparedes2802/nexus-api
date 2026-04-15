import { Role } from '../../users/enums/role.enum';

export class GetOrdersQuery {
  constructor(
    public readonly userId: number,
    public readonly role: Role,
  ) {}
}
