/**
 * Basic setup test to verify Jest configuration
 */

describe('Project Setup', () => {
  test('should have proper Node.js environment', () => {
    expect(process.version).toBeDefined();
    expect(process.env.NODE_ENV).toBeDefined();
  });

  test('should support modern JavaScript features', () => {
    const testArray = [1, 2, 3];
    const [first, ...rest] = testArray;
    expect(first).toBe(1);
    expect(rest).toEqual([2, 3]);
  });

  test('should have proper test framework', () => {
    expect(expect).toBeDefined();
    expect(describe).toBeDefined();
    expect(test).toBeDefined();
  });

  test('should support async/await', async () => {
    const promise = new Promise(resolve => setTimeout(() => resolve('test'), 10));
    const result = await promise;
    expect(result).toBe('test');
  });
});