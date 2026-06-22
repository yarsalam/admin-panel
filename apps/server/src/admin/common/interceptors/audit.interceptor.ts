import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, user } = req;

    return next.handle().pipe(
      tap(() => {
        this.logger.log(
          `[${user?.email ?? 'anonymous'}] ${method} ${originalUrl}`,
        );
      }),
    );
  }
}
