import { Module } from '@nestjs/common';
import { MallaController } from './malla.controller';
import { MallaService } from './malla.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MallaController],
  providers: [MallaService],
})
export class MallaModule {}
