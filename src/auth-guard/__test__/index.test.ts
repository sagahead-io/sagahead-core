import { authGuard } from '../index';
describe('authGuard', () => {
  it('should successfully create instance', async () => {
    const guard = await authGuard('service');

    expect(guard).toBeDefined();
  });
});
