import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { MallaModule } from './malla/malla.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProyeccionModule } from './proyeccion/proyeccion.module'; // el tuyo
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, HttpModule, MallaModule,PrismaModule,ProyeccionModule,ConfigModule.forRoot({isGlobal: true }),],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
