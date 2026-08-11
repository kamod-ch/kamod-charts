# Composition API

The low-level API composes primitives inside `Chart`:

```tsx
<Chart data={data} xKey="date" xScale="time" height={320}>
  <Grid yKey="revenue" />
  <XAxis />
  <YAxis dataKey="revenue" />
  <AreaSeries dataKey="revenue" opacity={0.15} />
  <LineSeries dataKey="revenue" />
  <ReferenceLine y={1000} yKey="revenue" label="Ziel" />
</Chart>
```
