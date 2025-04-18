# Install Sentry SDK
npm install @sentry/react @sentry/tracing

# Configure Sentry in the application
$sentryConfig = "Sentry.init({ dsn: 'YOUR_SENTRY_DSN', integrations: [new Sentry.BrowserTracing()], tracesSampleRate: 1.0 });"
Add-Content -Path "src/main.tsx" -Value $sentryConfig

Write-Host "Sentry configured for error tracking and performance monitoring."