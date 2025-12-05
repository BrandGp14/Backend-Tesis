import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstituteConfiguration } from 'src/institutes/entities/institute-configuration.entity';
import { Institution } from 'src/institutes/entities/institute.entity';
import { InstitutionDepartment } from 'src/institutes/entities/institution-department.entity';
import { PaymentTicket } from 'src/payment/entity/payment-ticket.entity';
import { Payment } from 'src/payment/entity/payment.entity';
import { PaymentTransaction } from 'src/payment/entity/payment-transaction.entity';
import { RaffleSerie } from 'src/raffles/entities/raffle-serie.entity';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { RaffleGiftImage } from 'src/raffles/entities/rafle-gift-image.entity';
import { RaffleImage } from 'src/raffles/entities/rafle-image.entity';
import { Ticket } from 'src/raffles/entities/ticket.entity';
import { RaffleNumber } from 'src/raffles/entities/raffle-number.entity';
import { Permission } from 'src/roles/entities/permission.entity';
import { RolePermission } from 'src/roles/entities/role-permission.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/users/entities/user-role.entity';
import { User } from 'src/users/entities/user.entity';
import { Notification } from 'src/notification/entities/notification.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserRole, Role, RolePermission, Permission, Raffle, RaffleSerie, RaffleImage, RaffleGiftImage,
        Ticket, RaffleNumber, Institution, InstitutionDepartment, InstituteConfiguration, Payment, PaymentTicket, PaymentTransaction, Notification])],
    exports: [TypeOrmModule],
})
export class EntitiesModuleModule { }
