import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedUsers();
    await this.seedProducts();
    this.logger.log('Database seeded successfully');
  }

  private async seedUsers(): Promise<void> {
    const count = await this.userRepo.count();
    if (count > 0) return;

    await this.userRepo.save([
      {
        email: 'admin@nexus.dev',
        password: await bcrypt.hash('Admin123!', 10),
        role: Role.Admin,
      },
      {
        email: 'client@nexus.dev',
        password: await bcrypt.hash('Client123!', 10),
        role: Role.Client,
      },
    ]);

    this.logger.log('Seeded 2 users — admin@nexus.dev / client@nexus.dev');
  }

  private async seedProducts(): Promise<void> {
    const count = await this.productRepo.count();
    if (count > 0) return;

    const products = [
      {
        name: 'Gaming Laptop Pro',
        description: 'High-performance laptop with RTX 4080, 32GB RAM, 1TB SSD',
        price: 1299.99,
        stock: 15,
      },
      {
        name: 'Mechanical Keyboard TKL',
        description: 'Tenkeyless keyboard with Cherry MX Blue switches, RGB backlight',
        price: 149.99,
        stock: 50,
      },
      {
        name: 'Ultrawide Monitor 34"',
        description: 'Curved ultrawide IPS panel, 144Hz, 1ms response, WQHD',
        price: 649.99,
        stock: 20,
      },
      {
        name: 'Wireless Gaming Mouse',
        description: 'Lightweight 58g wireless mouse, 70h battery, 25K DPI sensor',
        price: 89.99,
        stock: 75,
      },
      {
        name: 'USB-C Hub 7-in-1',
        description: '4K HDMI, 3x USB-A, SD/microSD card reader, 100W PD pass-through',
        price: 49.99,
        stock: 100,
      },
      {
        name: 'Noise-Cancelling Headphones',
        description: 'Hybrid ANC, 30h playback, hi-res audio certified',
        price: 279.99,
        stock: 30,
      },
      {
        name: 'Webcam 4K',
        description: '4K 30fps with autofocus, dual noise-cancelling mics, privacy shutter',
        price: 129.99,
        stock: 40,
      },
      {
        name: 'Anti-Fatigue Standing Desk Mat',
        description: 'Ergonomic beveled edge mat, 90x60cm, waterproof PU surface',
        price: 39.99,
        stock: 200,
      },
      {
        name: 'NVMe SSD 1TB',
        description: 'PCIe Gen 4.0 NVMe M.2, 7400MB/s read, 6900MB/s write',
        price: 99.99,
        stock: 60,
      },
      {
        name: 'Smart RGB LED Strip 5m',
        description: 'WiFi + Bluetooth controlled, 16M colors, works with Alexa & Google Home',
        price: 24.99,
        stock: 150,
      },
    ];

    await this.productRepo.save(products);
    this.logger.log(`Seeded ${products.length} products`);
  }
}
