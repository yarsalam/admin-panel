import { TicketsService } from './tickets.service';
import { UserApiClientService } from '../../admin/common/api-client/user-api-client.service';

describe('TicketsService read contract', () => {
  let service: TicketsService;
  let userApi: { get: jest.Mock; post: jest.Mock };

  beforeEach(() => {
    userApi = { get: jest.fn(), post: jest.fn() };
    service = new TicketsService(
      {} as any,
      { get: jest.fn().mockReturnValue(undefined) } as any,
      userApi as unknown as UserApiClientService,
    );
  });

  it('passes filters to the backend ticket list route', async () => {
    userApi.get.mockResolvedValue([]);
    await expect(service.getTickets('open', 'high')).resolves.toEqual([]);
    expect(userApi.get).toHaveBeenCalledWith('/admin-api/safety/tickets', {
      status: 'open',
      priority: 'high',
    });
  });

  it('propagates ticket list failures instead of returning an empty list', async () => {
    const error = new Error('backend unavailable');
    userApi.get.mockRejectedValue(error);
    await expect(service.getTickets()).rejects.toBe(error);
  });

  it('propagates ticket detail failures', async () => {
    const error = new Error('ticket detail unavailable');
    userApi.get.mockRejectedValue(error);
    await expect(service.getTicketDetail(42)).rejects.toBe(error);
    expect(userApi.get).toHaveBeenCalledWith('/admin-api/safety/tickets/42');
  });

  it('propagates AI analysis failures', async () => {
    const error = new Error('AI analysis unavailable');
    userApi.get.mockRejectedValue(error);
    await expect(service.getAIAnalysis(42)).rejects.toBe(error);
    expect(userApi.get).toHaveBeenCalledWith(
      '/admin-api/safety/tickets/42/ai-analysis',
    );
  });
});
