import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Старые заказы без publicId: заполняем UUID после синхронизации схемы.
 */
@Injectable()
export class OrdersPublicIdBackfillService implements OnModuleInit {
  private readonly logger = new Logger(OrdersPublicIdBackfillService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(
        `UPDATE orders SET "publicId" = gen_random_uuid()::text WHERE "publicId" IS NULL`,
      );
    } catch (e) {
      this.logger.warn(
        `Не удалось backfill publicId: ${e instanceof Error ? e.message : e}`,
      );
    }
  }
}
