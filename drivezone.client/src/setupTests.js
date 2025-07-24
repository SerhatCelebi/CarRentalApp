// Jest setup file for DriveZone Client Tests

// React Testing Library
import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock File and FileReader
global.File = class File {
  constructor(chunks, filename, options = {}) {
    this.chunks = chunks;
    this.name = filename;
    this.size = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    this.type = options.type || '';
    this.lastModified = options.lastModified || Date.now();
  }
};

global.FileReader = class FileReader {
  constructor() {
    this.readyState = 0;
    this.result = null;
    this.error = null;
    
    this.onload = null;
    this.onerror = null;
    this.onabort = null;
    this.onloadstart = null;
    this.onloadend = null;
    this.onprogress = null;
  }
  
  readAsDataURL() {
    setTimeout(() => {
      this.readyState = 2;
      this.result = 'data:image/jpeg;base64,mocked-data';
      if (this.onload) this.onload();
      if (this.onloadend) this.onloadend();
    }, 0);
  }
  
  readAsText() {
    setTimeout(() => {
      this.readyState = 2;
      this.result = 'mocked-text-content';
      if (this.onload) this.onload();
      if (this.onloadend) this.onloadend();
    }, 0);
  }
  
  abort() {
    this.readyState = 2;
    if (this.onabort) this.onabort();
    if (this.onloadend) this.onloadend();
  }
};

// Mock Image
global.Image = class Image {
  constructor() {
    this.onload = null;
    this.onerror = null;
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
};

// Mock Canvas and CanvasRenderingContext2D
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4).fill(0),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

// Mock Geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
});

// Mock Clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(),
    readText: jest.fn().mockResolvedValue('mocked-clipboard-text'),
  },
});

// Mock Notification API
global.Notification = class Notification {
  constructor(title, options) {
    this.title = title;
    this.options = options;
    this.onclick = null;
    this.onshow = null;
    this.onerror = null;
    this.onclose = null;
  }
  
  static requestPermission() {
    return Promise.resolve('granted');
  }
  
  close() {}
};

// Mock Service Worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve({
      unregister: jest.fn(() => Promise.resolve()),
    }),
  },
});

// Mock console methods in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  
  // Clean up any timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Global test utilities
global.testUtils = {
  // Mock API responses
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
  
  // Mock user
  mockUser: {
    id: '1',
    email: 'test@drivezone.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'Member',
    membershipLevel: 'Bronze',
  },
  
  // Mock vehicle
  mockVehicle: {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Gri',
    category: 'Sedan',
    fuelType: 'Benzin',
    transmission: 'Otomatik',
    seatingCapacity: 5,
    dailyRate: 150,
    hourlyRate: 25,
    securityDeposit: 500,
    licensePlate: '06 ABC 123',
    mileage: 15000,
    isAvailable: true,
  },
  
  // Mock booking
  mockBooking: {
    id: '1',
    vehicleId: '1',
    memberId: '1',
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-17T10:00:00Z',
    status: 'Confirmed',
    totalCost: 300,
    securityDeposit: 500,
    insuranceType: 'Basic',
  },
  
  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock token
  mockToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.mock-token-signature',
};

// Set up fake timers for tests that need them
// Tests can override this with jest.useFakeTimers()
jest.useRealTimers();

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// DriveZone specific test configuration
global.DRIVEZONE_TEST_CONFIG = {
  API_BASE_URL: 'http://localhost:7042/api',
  MOCK_DELAY: 100,
  DEFAULT_TIMEOUT: 5000,
};

console.log('🚗 DriveZone Test Environment Initialized'); 