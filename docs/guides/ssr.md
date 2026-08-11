# SSR

Fixed dimensions are deterministic:

```tsx
<LineChart data={data} width={640} height={320} />
```

Responsive charts render `initialWidth` on the server and measure after hydration:

```tsx
<LineChart data={data} height={320} initialWidth={640} responsive />
```

Browser APIs are guarded and not read during server render.
