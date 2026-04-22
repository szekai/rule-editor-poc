# Building for Production

This guide explains how to build the SpEL Rule Editor for production deployment.

## Building the Application

To create a production build:

```bash
npm run build
```

This command will:
1. Compile all React components
2. Optimize assets and images
3. Generate static files
4. Create a production-ready build

## Build Output

After building, the output is placed in the `.next/` directory:

```
.next/
├── cache/              # Build cache
├── server/            # Server files
│   ├── app/          # App router
│   └── chunks/       # Code chunks
├── static/           # Static assets
└── ...
```

## Running the Production Build

To serve the production build:

```bash
npm run start
```

This starts the Next.js production server on `http://localhost:3000`.

**Note:** You must run `npm run build` before `npm run start`.

## Build Optimization Tips

### Analyze Bundle Size

To analyze the bundle size:

```bash
# Add to next.config.mjs for bundle analysis
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
```

### Environment Variables

Set production environment variables before building:

```bash
# Use real API
REACT_APP_USE_MOCK_SPEL=false REACT_APP_SPEL_API_URL=https://api.example.com npm run build
```

## Deployment

### Static Export

To create a static export (if not using server-side features):

```javascript
// next.config.mjs
export default {
  output: 'export',
};
```

Then run:

```bash
npm run build
# Output will be in ./out/
```

### Docker

Create a Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t rule-editor .
docker run -p 3000:3000 rule-editor
```

### Platform-Specific

| Platform | Deployment Method |
|----------|-------------------|
| Vercel | `npm i -g vercel && vercel` |
| AWS | Use AWS Amplify or ECS |
| Google Cloud | Use Cloud Run or App Engine |
| Self-hosted | Use Node.js or Docker |

## Performance Considerations

| Optimization | Description |
|--------------|-------------|
| Caching | Next.js automatically caches build output |
| Compression | Gzip/Brotli compression enabled by default |
| Image Optimization | Use `next/image` for automatic optimization |

## Troubleshooting

**Build fails with out of memory error:**
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

**Missing environment variables in production:**
- Ensure all required env vars are set before building
- Or use `.env.production` file

## Next Steps

- [Configuration](../configuration/environment-variables.md)
- [Troubleshooting](../troubleshooting/common-errors.md)
