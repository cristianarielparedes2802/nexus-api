export class CreateOrderCommand {
  constructor(
    public readonly userId: number,
    public readonly items: Array<{ productId: number; quantity: number }>,
  ) {}
}
