import { UsersService } from './users.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';
import { throwError } from 'rxjs';

describe('UsersService AI advice read contract', () => {
  let service: UsersService;
  let userApi: { get: jest.Mock; post: jest.Mock };

  beforeEach(() => {
    userApi = { get: jest.fn(), post: jest.fn() };
    service = new UsersService(
      userApi as unknown as UserApiClientService,
      {} as any,
      { get: jest.fn().mockReturnValue('http://ai-verification') } as any,
    );
  });

  it('uses the backend user AI advice route', async () => {
    const advice = { tips: [], personality_summary: 'No major issues' };
    userApi.get.mockResolvedValue(advice);

    await expect(service.getAiAssistantAdvice(7)).resolves.toEqual(advice);
    expect(userApi.get).toHaveBeenCalledWith(
      '/admin-api/safety/users/7/ai-advice',
    );
  });

  it('propagates upstream AI advice failures', async () => {
    const error = new Error('AI advice unavailable');
    userApi.get.mockRejectedValue(error);

    await expect(service.getAiAssistantAdvice(7)).rejects.toBe(error);
  });
  it('propagates user re-analysis failures', async () => {
    const error = new Error('re-analysis unavailable');
    userApi.post = jest.fn().mockRejectedValue(error);

    await expect(service.reAnalyzeUser(7, 'bio', [])).rejects.toBe(error);
  });

  it('propagates face-verification service failures', async () => {
    const error = new Error('verification service unavailable');
    const http = (service as any).http;
    http.post = jest.fn().mockReturnValue(throwError(() => error));

    await expect(
      service.verifyFace(Buffer.from('selfie'), Buffer.from('profile')),
    ).rejects.toBe(error);
  });

});
