import { of, throwError } from 'rxjs';
import { AiPackControlService } from './ai-pack-control.service';

describe('AiPackControlService', () => {
  const config = {
    get: jest.fn((key: string) =>
      key === 'AI_PACK_CONTROL_URL'
        ? 'http://172.18.0.1:9115/'
        : 'a'.repeat(64),
    ),
  } as any;
  const http = { request: jest.fn() } as any;
  let service: AiPackControlService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AiPackControlService(http, config);
  });

  it('reads status only from the private host agent', async () => {
    http.request.mockReturnValue(of({ data: { packs: {} } }));
    await expect(service.getStatus()).resolves.toEqual({ packs: {} });
    expect(http.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'http://172.18.0.1:9115/v1/status',
        headers: expect.objectContaining({
          Authorization: 'Bearer ' + 'a'.repeat(64),
        }),
      }),
    );
  });

  it('rejects arbitrary pack names and arbitrary actions', () => {
    expect(() => service.packAction('mobapp', 'stop', 'admin')).toThrow();
    expect(() => service.packAction('matching-pack', 'down', 'admin')).toThrow();
    expect(http.request).not.toHaveBeenCalled();
  });

  it('requires an explicit confirmation before Stop All', () => {
    expect(() => service.stopAll(false, 'admin')).toThrow();
    expect(http.request).not.toHaveBeenCalled();
  });

  it('accepts only fixed job ids', () => {
    expect(() => service.getJob('../../etc/passwd')).toThrow();
    expect(http.request).not.toHaveBeenCalled();
  });

  it('forwards allowed pack actions to fixed agent routes', async () => {
    http.request.mockReturnValue(of({ data: { job_id: '0123456789abcdef' } }));
    await expect(service.packAction('seo-pack', 'test', 'admin@example.com'))
      .resolves.toEqual({ job_id: '0123456789abcdef' });
    expect(http.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'http://172.18.0.1:9115/v1/packs/seo-pack/test',
        headers: expect.objectContaining({ 'X-Admin-Actor': 'admin@example.com' }),
      }),
    );
  });

  it('fails closed when the control agent is not configured', async () => {
    const noConfig = { get: jest.fn(() => undefined) } as any;
    const unconfigured = new AiPackControlService(http, noConfig);
    await expect(unconfigured.getStatus()).rejects.toThrow(
      'کنترل‌کنندهٔ پک‌های هوش مصنوعی هنوز روی سرور نصب یا پیکربندی نشده است.',
    );
  });
});
