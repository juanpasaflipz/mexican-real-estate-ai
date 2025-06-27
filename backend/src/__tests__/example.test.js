// Basic example test to verify testing setup works
describe('Example Test Suite', () => {
  it('should pass basic arithmetic test', () => {
    expect(2 + 2).toBe(4);
  });

  it('should verify string operations', () => {
    const text = 'Hello World';
    expect(text.toLowerCase()).toBe('hello world');
    expect(text).toContain('World');
  });

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });

  it('should work with objects', () => {
    const property = {
      id: 1,
      city: 'Cancún',
      price: 5000000
    };
    
    expect(property).toHaveProperty('city', 'Cancún');
    expect(property.price).toBeGreaterThan(1000000);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('Success');
    await expect(promise).resolves.toBe('Success');
  });
});