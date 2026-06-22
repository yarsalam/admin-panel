import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleDefaultPermissions } from '../auth/role-permissions';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUser } from '../auth/entities/admin-user.entity';
import { Repository } from 'typeorm';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(
    private adminUsersService: AdminUsersService,
    @InjectRepository(AdminUser)
    private adminUserRepo: Repository<AdminUser>,
  ) {}

  @Post()
  @Roles('superadmin')
  create(
    @Body()
    body: {
      email: string;
      password: string;
      role: string;
      permissions?: string[];
    },
  ) {
    return this.adminUsersService.create(body);
  }

  @Get()
  @Roles('superadmin')
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Patch(':id')
  @Roles('superadmin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role?: string; permissions?: string[] },
  ) {
    const user = await this.adminUserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    if (body.role) user.role = body.role;
    if (body.permissions) user.permissions = body.permissions;
    return this.adminUserRepo.save(user);
  }

  @Patch(':id/deactivate')
  @Roles('superadmin')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const user = await this.adminUserRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    user.isActive = false;
    return this.adminUserRepo.save(user);
  }

  @Get('roles')
  @Roles('superadmin')
  getRoles() {
    return Object.entries(RoleDefaultPermissions).map(([role, perms]) => ({
      label: role,
      value: role,
      permissions: perms,
    }));
  }
}
