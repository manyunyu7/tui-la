# Testing Strategy

## Overview

Love Map uses a comprehensive testing approach covering unit, integration, and end-to-end tests.

---

## Testing Stack

| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Vitest | Fast unit tests for utilities, hooks |
| Component Tests | Vitest + Testing Library | React component testing |
| API Tests | Vitest + Supertest | REST endpoint testing |
| Socket Tests | Vitest + socket.io-client | WebSocket event testing |
| E2E Tests | Playwright | Full user flow testing |

---

## Test Structure

```
love_map/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       └── Button.test.tsx    # Co-located
│   │   ├── hooks/
│   │   │   ├── usePins.ts
│   │   │   └── usePins.test.ts
│   │   └── utils/
│   │       ├── format.ts
│   │       └── format.test.ts
│   └── vitest.config.ts
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── auth.service.test.ts
│   │   └── utils/
│   └── vitest.config.ts
│
└── e2e/
    ├── tests/
    │   ├── auth.spec.ts
    │   ├── pairing.spec.ts
    │   ├── map.spec.ts
    │   └── realtime.spec.ts
    └── playwright.config.ts
```

---

## Unit Tests

### Utility Functions

```typescript
// server/src/utils/invite-code.test.ts
import { describe, it, expect } from 'vitest';
import { generateInviteCode, validateInviteCode } from './invite-code';

describe('generateInviteCode', () => {
  it('should generate a code of correct length', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
  });

  it('should generate unique codes', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBe(100);
  });

  it('should only contain alphanumeric characters', () => {
    const code = generateInviteCode();
    expect(code).toMatch(/^[A-Z0-9]+$/);
  });
});

describe('validateInviteCode', () => {
  it('should accept valid codes', () => {
    expect(validateInviteCode('ABC12345')).toBe(true);
  });

  it('should reject invalid codes', () => {
    expect(validateInviteCode('')).toBe(false);
    expect(validateInviteCode('abc')).toBe(false);
    expect(validateInviteCode('ABC-1234')).toBe(false);
  });
});
```

### Service Layer

```typescript
// server/src/services/auth.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { db } from '../config/database';

vi.mock('../config/database');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should create user with hashed password', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };

      vi.mocked(db.users.findByEmail).mockResolvedValue(null);
      vi.mocked(db.users.create).mockResolvedValue({
        id: '1',
        ...mockUser,
        password_hash: 'hashed',
      });

      const result = await authService.register(mockUser);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw if email already exists', async () => {
      vi.mocked(db.users.findByEmail).mockResolvedValue({ id: '1' });

      await expect(authService.register({
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Test',
      })).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      // ... test implementation
    });

    it('should throw for invalid password', async () => {
      // ... test implementation
    });
  });
});
```

---

## Component Tests

### UI Components

```typescript
// client/src/components/ui/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild).toHaveClass('bg-rose-100');
  });
});
```

### Hook Tests

```typescript
// client/src/hooks/usePins.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePins } from './usePins';

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('usePins', () => {
  it('fetches pins for a map', async () => {
    const { result } = renderHook(() => usePins('map-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
  });

  it('creates a new pin optimistically', async () => {
    const { result } = renderHook(() => usePins('map-1'), { wrapper });

    await waitFor(() => result.current.isSuccess);

    result.current.createPin({
      title: 'New Memory',
      lat: 51.5,
      lng: -0.1,
    });

    // Pin appears immediately (optimistic)
    expect(result.current.data).toContainEqual(
      expect.objectContaining({ title: 'New Memory' })
    );
  });
});
```

---

## API Integration Tests

```typescript
// server/src/routes/auth.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../config/database';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.migrate.rollback();
    await db.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'securepassword123',
          displayName: 'New User',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          displayName: 'Test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('email');
    });

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          displayName: 'First User',
        });

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          displayName: 'Second User',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'securepassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 401 for wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});
```

---

## Socket Tests

```typescript
// server/src/socket/pin.handler.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { setupSocketHandlers } from './handlers';

describe('Pin Socket Handlers', () => {
  let io: Server;
  let serverSocket;
  let clientSocket1;
  let clientSocket2;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    setupSocketHandlers(io);

    httpServer.listen(() => {
      const port = httpServer.address().port;

      clientSocket1 = Client(`http://localhost:${port}`, {
        auth: { token: 'user1-token' },
      });

      clientSocket2 = Client(`http://localhost:${port}`, {
        auth: { token: 'user2-token' },
      });

      let connected = 0;
      const onConnect = () => {
        connected++;
        if (connected === 2) done();
      };

      clientSocket1.on('connect', onConnect);
      clientSocket2.on('connect', onConnect);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket1.close();
    clientSocket2.close();
  });

  it('should broadcast pin creation to partner', (done) => {
    // Both join the same map room
    clientSocket1.emit('join_map', { mapId: 'map-1' });
    clientSocket2.emit('join_map', { mapId: 'map-1' });

    clientSocket2.on('pin:created', (data) => {
      expect(data.title).toBe('Test Pin');
      expect(data.createdBy).toBe('user1');
      done();
    });

    clientSocket1.emit('pin:create', {
      mapId: 'map-1',
      title: 'Test Pin',
      lat: 51.5,
      lng: -0.1,
    });
  });

  it('should broadcast cursor movement to partner', (done) => {
    clientSocket2.on('partner:cursor', (data) => {
      expect(data.lat).toBe(51.5);
      expect(data.lng).toBe(-0.1);
      done();
    });

    clientSocket1.emit('cursor:move', {
      mapId: 'map-1',
      lat: 51.5,
      lng: -0.1,
    });
  });
});
```

---

## E2E Tests (Playwright)

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can register and login', async ({ page }) => {
    // Go to registration
    await page.goto('/register');

    // Fill form
    await page.fill('[name="displayName"]', 'Test User');
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'securepassword123');
    await page.fill('[name="confirmPassword"]', 'securepassword123');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to pairing page
    await expect(page).toHaveURL('/pairing');
    await expect(page.locator('[data-testid="invite-code"]')).toBeVisible();
  });

  test('user can login with existing account', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'existing@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/maps');
  });
});

// e2e/tests/pairing.spec.ts
test.describe('Couple Pairing', () => {
  test('partners can pair with invite code', async ({ browser }) => {
    // Create two browser contexts (two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const partner1 = await context1.newPage();
    const partner2 = await context2.newPage();

    // Partner 1 registers
    await partner1.goto('/register');
    await partner1.fill('[name="email"]', 'partner1@example.com');
    // ... fill rest of form
    await partner1.click('button[type="submit"]');

    // Get invite code
    const inviteCode = await partner1.locator('[data-testid="invite-code"]').textContent();

    // Partner 2 joins with code
    await partner2.goto('/register');
    await partner2.fill('[name="email"]', 'partner2@example.com');
    await partner2.fill('[name="inviteCode"]', inviteCode);
    // ... fill rest of form
    await partner2.click('button[type="submit"]');

    // Both should see connected state
    await expect(partner1.locator('[data-testid="partner-connected"]')).toBeVisible();
    await expect(partner2.locator('[data-testid="partner-connected"]')).toBeVisible();

    await context1.close();
    await context2.close();
  });
});

// e2e/tests/realtime.spec.ts
test.describe('Real-time Collaboration', () => {
  test('partners see each other\'s pins in real-time', async ({ browser }) => {
    // Setup paired users...

    // Partner 1 creates a pin
    await partner1.click('[data-testid="map"]', { position: { x: 400, y: 300 } });
    await partner1.fill('[name="pinTitle"]', 'Our Favorite Cafe');
    await partner1.click('[data-testid="save-pin"]');

    // Partner 2 should see it immediately
    await expect(partner2.locator('text=Our Favorite Cafe')).toBeVisible();
  });
});
```

---

## Test Scripts

```json
// package.json (root)
{
  "scripts": {
    "test": "npm run test:client && npm run test:server",
    "test:client": "cd client && npm test",
    "test:server": "cd server && npm test",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage"
  }
}

// client/package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}

// server/package.json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

---

## Coverage Requirements

| Area | Minimum Coverage |
|------|------------------|
| Utilities | 90% |
| Services | 80% |
| Controllers | 70% |
| Components | 70% |
| Hooks | 75% |

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgis/postgis:15-3.3
        env:
          POSTGRES_DB: love_map_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgres://test:test@localhost:5432/love_map_test
          REDIS_URL: redis://localhost:6379

      - name: Run E2E tests
        run: npm run test:e2e
```
