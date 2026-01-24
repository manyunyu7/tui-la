# Configuration Guide

## App Branding

The app name and branding are fully configurable. To change the app name from "Twy" to something else:

### 1. Environment Variable

```env
APP_NAME=Twy
```

### 2. Client Constants (will be created)

```typescript
// client/src/config/constants.ts
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Twy',
  tagline: 'Your shared journey',
  description: 'A real-time collaborative map for couples',
} as const;
```

### 3. Usage in Components

```tsx
import { APP_CONFIG } from '@/config/constants';

// In components
<h1>{APP_CONFIG.name}</h1>
<title>{APP_CONFIG.name} - {APP_CONFIG.tagline}</title>
```

### 4. Meta Tags

```html
<!-- index.html -->
<title>Twy - Your shared journey</title>
<meta name="description" content="A real-time collaborative map for couples">
<meta property="og:title" content="Twy">
```

---

## Theme Configuration

### Default Theme

```typescript
// client/src/config/themes.ts
export const themes = {
  rose_garden: {
    name: 'Rose Garden',
    primary: '#E11D48',
    secondary: '#FB7185',
    accent: '#831843',
    background: '#FFF1F2',
    surface: '#FFFFFF',
    text: '#44403C',
    textMuted: '#78716C',
  },
  sunset_love: {
    name: 'Sunset Love',
    primary: '#F97316',
    secondary: '#FDBA74',
    accent: '#9A3412',
    background: '#FFF7ED',
    surface: '#FFFFFF',
    text: '#44403C',
    textMuted: '#78716C',
  },
  // ... more themes
} as const;

export const defaultTheme = 'rose_garden';
```

### Tailwind Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // These are CSS variables set by theme
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
    },
  },
};
```

### Theme Provider

```tsx
// client/src/contexts/ThemeContext.tsx
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    const colors = themes[theme];

    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    // ... etc
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## Map Configuration

### Tile Providers

```typescript
// client/src/config/map.ts
export const mapTileProviders = {
  openstreetmap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  openfreemap: {
    url: 'https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png',
    attribution: '&copy; OpenFreeMap',
  },
  // Add more as needed
} as const;

export const defaultTileProvider = 'openfreemap';
```

### Map Defaults

```typescript
export const mapDefaults = {
  center: [0, 0] as [number, number],
  zoom: 2,
  minZoom: 2,
  maxZoom: 18,
};
```

---

## API Configuration

```typescript
// client/src/config/api.ts
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
};

export const SOCKET_CONFIG = {
  url: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};
```

---

## Upload Configuration

```typescript
// shared or server config
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  thumbnailSize: 300,
  maxPhotosPerPin: 10,
};
```

---

## Feature Flags

```typescript
// client/src/config/features.ts
export const FEATURES = {
  voiceNotes: false,      // Coming in V2
  videoUpload: false,     // Coming in V2
  publicSharing: false,   // Coming in V2
  offlineMode: false,     // Coming in V3
  pushNotifications: false, // Coming in V3
} as const;

// Usage
if (FEATURES.voiceNotes) {
  // Show voice note button
}
```

---

## Rate Limits

```typescript
// server/src/config/rateLimit.ts
export const RATE_LIMITS = {
  auth: {
    windowMs: 60 * 1000, // 1 minute
    max: 5,
  },
  api: {
    windowMs: 60 * 1000,
    max: 100,
  },
  upload: {
    windowMs: 60 * 1000,
    max: 10,
  },
  socket: {
    cursorUpdates: 50, // ms between cursor broadcasts
    strokeUpdates: 16, // ~60fps
  },
};
```
