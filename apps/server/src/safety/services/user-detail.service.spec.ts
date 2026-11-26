import { UserDetailService } from './user-detail.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

describe('UserDetailService get360 partial failures', () => {
  let service: UserDetailService;

  beforeEach(() => {
    service = new UserDetailService({} as UserApiClientService);
    jest.spyOn(service, 'getProfile').mockResolvedValue({ id: 7 } as any);
    jest.spyOn(service, 'getTrust').mockResolvedValue({ trustScore: 80 } as any);
    jest.spyOn(service, 'getDevices').mockResolvedValue([]);
    jest.spyOn(service, 'getPhones').mockResolvedValue([]);
    jest.spyOn(service, 'getPersonality').mockResolvedValue(null);
    jest.spyOn(service, 'getBadges').mockResolvedValue({});
    jest.spyOn(service, 'getRelations').mockResolvedValue([]);
    jest.spyOn(service, 'getReports').mockResolvedValue([]);
    jest.spyOn(service, 'getModerationLogs').mockResolvedValue([]);
    jest.spyOn(service, 'getNotifications').mockResolvedValue([]);
    jest.spyOn(service, 'getMetrics').mockResolvedValue({});
    jest.spyOn(service, 'getActivity').mockResolvedValue({});
    jest.spyOn(service, 'getFinancial').mockResolvedValue({});
    jest.spyOn(service, 'getAiAdvice').mockResolvedValue(null);
    jest.spyOn(service, 'getImages').mockResolvedValue([]);
  });

  it('preserves successful data and exposes failed sections separately', async () => {
    const financialError = new Error('financial backend unavailable');
    jest.spyOn(service, 'getFinancial').mockRejectedValue(financialError);

    const result = await service.get360(7);

    expect(result.profile).toEqual({ id: 7 });
    expect(result.reports).toEqual([]);
    expect(result.financial).toBeNull();
    expect(result._errors).toEqual({ financial: true });
  });

  it('does not mark a legitimate empty collection as a failure', async () => {
    const result = await service.get360(7);

    expect(result.reports).toEqual([]);
    expect(result._errors).toEqual({});
  });
});
