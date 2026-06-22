import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ImpersonateGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-impersonate-token'];
    if (!token) return true;
    try {
      const payload = this.jwtService.verify(token);
      request.user = {
        ...request.user,
        impersonatedBy: payload.adminId,
        id: payload.userId,
      };
      return true;
    } catch {
      return false;
    }
  }
}
