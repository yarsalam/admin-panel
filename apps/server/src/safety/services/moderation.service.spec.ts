import { ModerationService } from './moderation.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

describe('ModerationService read contract', () => {
  let service: ModerationService;
  let userApi: { get: jest.Mock; post: jest.Mock };

  beforeEach(() => {
    userApi = { get: jest.fn(), post: jest.fn() };
    service = new ModerationService(
      {} as any,
      { get: jest.fn().mockReturnValue('http://ai-moderation') } as any,
      userApi as unknown as UserApiClientService,
    );
  });

  it('uses the backend flagged-images route', async () => {
    userApi.get.mockResolvedValue([]);
    await expect(service.getFlaggedImages()).resolves.toEqual([]);
    expect(userApi.get).toHaveBeenCalledWith(
      '/admin-api/safety/moderation/flagged-images',
    );
  });

  it('propagates flagged-images failures instead of returning an empty list', async () => {
    const error = new Error('backend unavailable');
    userApi.get.mockRejectedValue(error);
    await expect(service.getFlaggedImages()).rejects.toBe(error);
  });

  it('uses the backend flagged-messages route', async () => {
    userApi.get.mockResolvedValue([]);
    await expect(service.getFlaggedMessages()).resolves.toEqual([]);
    expect(userApi.get).toHaveBeenCalledWith(
      '/admin-api/safety/moderation/flagged-messages',
    );
  });

  it('propagates flagged-messages failures instead of returning an empty list', async () => {
    const error = new Error('backend unavailable');
    userApi.get.mockRejectedValue(error);
    await expect(service.getFlaggedMessages()).rejects.toBe(error);
  });
});
