import { Module } from '@nestjs/common';
import { ReceiptController } from './receipt.controller';
import { ReceiptService } from './receipt.service';
import { EmailSenderUtil } from '../common/utils/email.sender.util';

@Module({
  controllers: [ReceiptController],
  providers: [ReceiptService, EmailSenderUtil],
  exports: [ReceiptService], // Exportamos el servicio para uso en otros módulos
})
export class ReceiptModule {}