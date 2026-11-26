import { ReportsService } from './reports.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

describe('ReportsService API contract', () => {
  let service: ReportsService;
  let userApi: jest.Mocked<Pick<UserApiClientService, 'get' | 'post'>>;

  beforeEach(() => {
    userApi = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as jest.Mocked<Pick<UserApiClientService, 'get' | 'post'>>;
    service = new ReportsService(userApi as UserApiClientService);
  });

  it('lists reports through the backend safety reports route', async () => {
    userApi.get.mockResolvedValue([]);
    await expect(service.getReports('PENDING')).resolves.toEqual([]);
    expect(userApi.get).toHaveBeenCalledWith('/admin-api/safety/reports', {
      status: 'PENDING',
    });
  });

  it('lists all reports without a status filter', async () => {
    userApi.get.mockResolvedValue([]);
    await service.getReports();
    expect(userApi.get).toHaveBeenCalledWith('/admin-api/safety/reports', {});
  });

  it('propagates upstream errors instead of presenting them as an empty list', async () => {
    const error = new Error('upstream unavailable');
    userApi.get.mockRejectedValue(error);
    await expect(service.getReports()).rejects.toBe(error);
  });

  it('uses the backend routes for confirm, reject, block and unblock', async () => {
    userApi.post.mockResolvedValue({ success: true });

    await service.confirmReport(11);
    await service.rejectReport(12);
    await service.blockUser(13, '7');
    await service.unblockUser(14);

    expect(userApi.post).toHaveBeenNthCalledWith(
      1,
      '/admin-api/safety/reports/11/confirm',
    );
    expect(userApi.post).toHaveBeenNthCalledWith(
      2,
      '/admin-api/safety/reports/12/reject',
    );
    expect(userApi.post).toHaveBeenNthCalledWith(
      3,
      '/admin-api/safety/reports/13/block',
      { adminId: '7' },
    );
    expect(userApi.post).toHaveBeenNthCalledWith(
      4,
      '/admin-api/safety/reports/unblock/14',
    );
  });
});
