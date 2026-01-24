// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Polyfill Web APIs for Next.js tests
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder as unknown as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

// Mock Request and Response if not available
if (typeof Request === 'undefined') {
  global.Request = class Request {} as unknown as typeof Request;
}
if (typeof Response === 'undefined') {
  global.Response = class Response {} as unknown as typeof Response;
}
if (typeof Headers === 'undefined') {
  global.Headers = class Headers {
    private map = new Map();
    set(key: string, value: string) { this.map.set(key, value); }
    get(key: string) { return this.map.get(key); }
    has(key: string) { return this.map.has(key); }
  } as unknown as typeof Headers;
}
