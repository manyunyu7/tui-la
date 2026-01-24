# Security Guidelines

## Overview

Twy handles intimate couple data. Security is not optional - it's critical. This document outlines all security measures that MUST be implemented.

---

## Authentication Security

### Password Handling

```typescript
// MUST use bcrypt with cost factor 12+
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Requirements

```typescript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  // Special chars optional but encouraged
};

// Validation with zod
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number');
```

### JWT Security

```typescript
// Access token - short lived
const ACCESS_TOKEN_EXPIRES = '15m';

// Refresh token - longer, rotated on use
const REFRESH_TOKEN_EXPIRES = '7d';

// MUST use strong secret (min 32 chars, random)
const JWT_SECRET = process.env.JWT_SECRET; // Never hardcode!

// Token payload - minimal data
interface TokenPayload {
  userId: string;
  coupleId: string;
  iat: number;
  exp: number;
}

// NEVER include sensitive data in JWT
// BAD: { email, password, ... }
// GOOD: { userId, coupleId }
```

### Refresh Token Rotation

```typescript
// On every refresh:
// 1. Validate current refresh token
// 2. Invalidate it in database
// 3. Generate new refresh token
// 4. Return new access + refresh tokens

async function refreshTokens(oldRefreshToken: string) {
  // Verify token
  const payload = verifyRefreshToken(oldRefreshToken);

  // Check if revoked
  const tokenRecord = await db.refreshTokens.findByHash(hash(oldRefreshToken));
  if (!tokenRecord || tokenRecord.revokedAt) {
    throw new UnauthorizedError('Token revoked');
  }

  // Revoke old token
  await db.refreshTokens.revoke(tokenRecord.id);

  // Generate new tokens
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store new refresh token hash
  await db.refreshTokens.create({
    userId: payload.userId,
    tokenHash: hash(refreshToken),
    expiresAt: addDays(new Date(), 7),
  });

  return { accessToken, refreshToken };
}
```

---

## Data Isolation

### Critical: Couple Data Separation

Every query MUST include couple_id check. This prevents data leaks between couples.

```typescript
// CORRECT - Always filter by coupleId
async function getMap(mapId: string, coupleId: string) {
  const map = await db.query(
    'SELECT * FROM maps WHERE id = $1 AND couple_id = $2',
    [mapId, coupleId]
  );
  return map;
}

// WRONG - Never trust mapId alone
async function getMap(mapId: string) {
  const map = await db.query(
    'SELECT * FROM maps WHERE id = $1', // DANGEROUS!
    [mapId]
  );
  return map;
}
```

### Middleware Enforcement

```typescript
// Apply to all routes that access couple data
const ensureCoupleAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { coupleId } = req.user;

  if (!coupleId) {
    throw new ForbiddenError('Not part of a couple');
  }

  // Attach to request for use in handlers
  req.coupleId = coupleId;
  next();
};

// Usage
router.get('/maps', ensureCoupleAccess, getMapsList);
router.get('/maps/:id', ensureCoupleAccess, validateMapAccess, getMap);
```

### Resource Ownership Validation

```typescript
// For resources that belong to couples
const validateMapAccess = async (req: Request, res: Response, next: NextFunction) => {
  const { id: mapId } = req.params;
  const { coupleId } = req;

  const map = await db.maps.findOne({ id: mapId, coupleId });

  if (!map) {
    throw new NotFoundError('Map not found'); // Don't reveal existence
  }

  req.map = map;
  next();
};
```

---

## Input Validation

### Validate Everything

```typescript
import { z } from 'zod';

// Define schemas
const createPinSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  pinType: z.enum(['memory', 'wishlist', 'milestone', 'trip']).default('memory'),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  memoryDate: z.string().datetime().optional(),
});

// Validation middleware
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new ValidationError(result.error.errors);
    }

    req.body = result.data; // Use sanitized data
    next();
  };
};

// Usage
router.post('/pins', validate(createPinSchema), createPin);
```

### Sanitize Output

```typescript
// Sanitize HTML in user content
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML allowed
    ALLOWED_ATTR: [],
  });
}

// Or use text-only
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

---

## SQL Injection Prevention

### Always Use Parameterized Queries

```typescript
// CORRECT - Parameterized
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// WRONG - String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'` // DANGEROUS!
);

// CORRECT - With query builder
const user = await db.users
  .where('email', email)
  .first();
```

---

## File Upload Security

### Validation

```typescript
import fileType from 'file-type';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

async function validateUpload(file: Express.Multer.File) {
  // Check file size
  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large');
  }

  // Check MIME type from file signature (magic bytes)
  const type = await fileType.fromBuffer(file.buffer);

  if (!type || !ALLOWED_TYPES.includes(type.mime)) {
    throw new ValidationError('Invalid file type');
  }

  // Don't trust the extension
  // Don't trust Content-Type header
  // Only trust magic bytes

  return type;
}
```

### Storage Security

```typescript
// Generate random filename to prevent enumeration
import { randomUUID } from 'crypto';

function generateSafeFilename(originalName: string, mimeType: string): string {
  const ext = mimeType.split('/')[1]; // jpeg, png, etc.
  return `${randomUUID()}.${ext}`;
}

// Store outside web root if possible
const UPLOAD_DIR = '/app/uploads'; // Not in public/

// Serve through API with auth check
router.get('/uploads/:coupleId/:filename',
  authenticate,
  validateCoupleAccess,
  serveFile
);
```

### Image Processing

```typescript
import sharp from 'sharp';

async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    // Strip EXIF data (contains GPS, device info)
    .rotate() // Auto-rotate based on EXIF before stripping
    .withMetadata({ exif: {} }) // Remove all EXIF
    // Resize if too large
    .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
    // Convert to WebP
    .webp({ quality: 80 })
    .toBuffer();
}
```

---

## XSS Prevention

### Content Security Policy

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For Tailwind
      imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org"],
      connectSrc: ["'self'", "wss:"], // WebSocket
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // For map tiles
}));
```

### React Auto-Escaping

React escapes by default, but be careful:

```tsx
// SAFE - React escapes this
<p>{userInput}</p>

// DANGEROUS - Bypasses escaping
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// If you MUST use dangerouslySetInnerHTML, sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

---

## CSRF Protection

### SameSite Cookies

```typescript
// Refresh token as HTTP-only cookie
res.cookie('refreshToken', token, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh', // Only sent to refresh endpoint
});
```

### For State-Changing Requests

```typescript
// Generate CSRF token
import { randomBytes } from 'crypto';

const csrfToken = randomBytes(32).toString('hex');

// Store in session/cookie and require in headers
// X-CSRF-Token: <token>
```

---

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Auth endpoints - strict
const authLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // 5 attempts
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload - moderate
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

// General API - generous
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

// Apply
app.use('/api/auth', authLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api', apiLimiter);
```

---

## WebSocket Security

```typescript
import { Server } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

// Authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await db.users.findById(payload.userId);

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.data.user = user;
    socket.data.coupleId = payload.coupleId;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Room authorization
socket.on('join_map', async ({ mapId }) => {
  // Verify user has access to this map
  const map = await db.maps.findOne({
    id: mapId,
    coupleId: socket.data.coupleId,
  });

  if (!map) {
    socket.emit('error', { message: 'Access denied' });
    return;
  }

  socket.join(`map:${mapId}`);
});
```

---

## Environment Security

### Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
```

### Validate Environment

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  // ... etc
});

// Validate on startup
const env = envSchema.parse(process.env);
export default env;
```

---

## Logging Security

### What to Log

```typescript
// Log security events
logger.info('User login', { userId, ip, userAgent });
logger.warn('Failed login attempt', { email, ip });
logger.error('Unauthorized access attempt', { userId, resource });
```

### What NOT to Log

```typescript
// NEVER log sensitive data
logger.info('Login', { password }); // WRONG
logger.info('Token issued', { token }); // WRONG
logger.info('User data', { user }); // WRONG if includes sensitive fields
```

---

## Security Checklist

### Pre-Launch

- [ ] All passwords hashed with bcrypt (cost 12+)
- [ ] JWT secret is long and random
- [ ] All queries parameterized
- [ ] All input validated with zod
- [ ] All uploads validated (type, size)
- [ ] EXIF stripped from images
- [ ] Rate limiting on all endpoints
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] HTTPS enforced in production
- [ ] Sensitive data not in logs
- [ ] Error messages don't leak info
- [ ] Couple data isolation verified
- [ ] File paths don't allow traversal
- [ ] No secrets in code or git

### Ongoing

- [ ] Dependencies updated regularly
- [ ] npm audit clean
- [ ] Logs monitored for suspicious activity
- [ ] Backups encrypted
- [ ] Access reviewed periodically
