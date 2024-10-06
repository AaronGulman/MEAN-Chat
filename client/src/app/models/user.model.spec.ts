import { User } from './user.model';

describe('User', () => {
  it('should create an instance', () => {
    expect(new User('1', 'testUser', 'testUser@example.com', 'password')).toBeTruthy();
  });

  it('should have correct properties assigned', () => {
    const user = new User(
      '1',
      'testUser',
      'testUser@example.com',
      'password',
      ['user', 'admin'],
      ['group1', 'group2'],
      ['interested1'],
      '/assets/custom-avatar.jpg'
    );

    expect(user.id).toBe('1');
    expect(user.username).toBe('testUser');
    expect(user.email).toBe('testUser@example.com');
    expect(user.password).toBe('password');
    expect(user.roles).toEqual(['user', 'admin']);
    expect(user.groups).toEqual(['group1', 'group2']);
    expect(user.interested).toEqual(['interested1']);
    expect(user.avatarPath).toBe('/assets/custom-avatar.jpg');
  });
});