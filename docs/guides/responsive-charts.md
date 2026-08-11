# Responsive charts

Use `responsive` with `initialWidth`:

```tsx
<LineChart data={data} height={320} initialWidth={640} responsive />
```

Hydration starts with the same width used by SSR. A guarded `ResizeObserver` updates width after mount and batches updates with `requestAnimationFrame` when available.
