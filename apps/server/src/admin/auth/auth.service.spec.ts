import * as bcrypt from 'bcrypt';
import { AdminAuthService } from './auth.service';

describe('AdminAuthService initial superadmin bootstrap', () => {
  afterEach(() => jest.restoreAllMocks());

  function createService(configValues: Record<string, string | undefined> = {}) {
    const repository = {
      findOne: jest.fn(),
      create: jest.fn((value: any) => value),
      save: jest.fn<(...args: any[]) => Promise<any>>().mockResolvedValue({}),
    };
    const config = {
      get: jest.fn((key: string) => configValues[key]),
    };
    const service = new AdminAuthService(
      repository as any,
      { sign: jest.fn() } as any,
      config as any,
    );
    return { service, repository, config };
  }

  it('does not require bootstrap credentials when a superadmin already exists', async () => {
    const { service, repository } = createService();
    repository.findOne.mockResolvedValueOnce({ id: 1, role: 'superadmin' });

    await expect(service.createInitialAdmin()).resolves.toBeUndefined();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('fails instead of creating a predictable default account', async () => {
    const { service, repository } = createService();
    repository.findOne.mockResolvedValueOnce(null);

    await expect(service.createInitialAdmin()).rejects.toThrow(
      'INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('requires a strong bootstrap password', async () => {
    const { service, repository } = createService({
      INITIAL_ADMIN_EMAIL: 'owner@example.com',
      INITIAL_ADMIN_PASSWORD: 'short',
    });
    repository.findOne.mockResolvedValueOnce(null);

    await expect(service.createInitialAdmin()).rejects.toThrow(
      'at least 16 characters',
    );
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('creates only the configured superadmin with a hashed password', async () => {
    const { service, repository } = createService({
      INITIAL_ADMIN_EMAIL: 'Owner@Example.com ',
      INITIAL_ADMIN_PASSWORD: 'long-random-bootstrap-secret',
    });
    repository.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

    await service.createInitialAdmin();

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'owner@example.com',
        passwordHash: 'hashed-password',
        role: 'superadmin',
        isActive: true,
        isVerified: true,
      }),
    );
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
