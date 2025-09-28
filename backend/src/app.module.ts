import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HttpModule } from '@nestjs/axios';
import { MallaModule } from './malla/malla.module';


@Module({
  imports: [AuthModule, HttpModule, MallaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
