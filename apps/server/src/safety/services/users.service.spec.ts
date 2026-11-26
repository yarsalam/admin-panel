import { UsersService } from './users.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

describe('UsersService AI advice read contract', () => {
  let service: UsersService;
  let userApi: { get: jest.Mock };

  beforeEach(() => {
    userApi = { get: jest.fn() };
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
});
