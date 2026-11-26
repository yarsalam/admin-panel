import { RiskService } from './risk.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

describe('RiskService', () => {
  let service: RiskService;
  let userApi: jest.Mocked<Pick<UserApiClientService, 'get'>>;

  const paths = [
    '/admin-api/safety/users/42/profile',
    '/admin-api/safety/users/42/financial',
    '/admin-api/safety/users/42/reports',
    '/admin-api/safety/users/42/activity',
    '/admin-api/safety/users/42/moderation-logs',
  ];

  beforeEach(() => {
    userApi = {
      get: jest.fn((path: string) => {
        switch (path) {
          case paths[0]:
            return Promise.resolve({ createdAt: '2000-01-01T00:00:00.000Z' });
          case paths[1]:
            return Promise.resolve({ payments: [] });
          case paths[2]:
            return Promise.resolve([]);
          case paths[3]:
            return Promise.resolve({ messages: [] });
          case paths[4]:
            return Promise.resolve([]);
          default:
            return Promise.reject(new Error(`Unexpected path: ${path}`));
        }
      }),
    } as unknown as jest.Mocked<Pick<UserApiClientService, 'get'>>;
    service = new RiskService(userApi as unknown as UserApiClientService);
  });

  it('calculates risk only after all five evidence sources are available', async () => {
    await expect(service.calculateRisk(42)).resolves.toMatchObject({
      userId: 42,
      riskScore: 0,
      trustScore: 100,
      level: 'low',
      recommendedAction: 'none',
    });
    expect(userApi.get).toHaveBeenCalledTimes(5);
    paths.forEach((path) => expect(userApi.get).toHaveBeenCalledWith(path));
  });

  it.each(paths)('propagates an upstream failure from %s', async (failedPath) => {
    const upstreamError = new Error('upstream unavailable');
    userApi.get.mockImplementation((path: string) =>
      path === failedPath ? Promise.reject(upstreamError) : Promise.resolve(
        path === paths[0]
          ? { createdAt: '2000-01-01T00:00:00.000Z' }
          : path === paths[1]
            ? { payments: [] }
            : path === paths[3]
              ? { messages: [] }
              : [],
      ),
    );

    await expect(service.calculateRisk(42)).rejects.toBe(upstreamError);
  });
});
