# TypeScript

Public APIs are generic over datum type.

```tsx
interface Point {
  date: Date;
  revenue: number | null;
}

<LineChart<Point>
  data={data}
  xKey="date"
  xScale="time"
  series={[{ key: "revenue" }]}
  height={320}
/>;
```

Accessors can be object keys or callbacks. Missing values are represented as `null`/`undefined` and are not coerced by line/scatter series.
