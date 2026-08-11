# Accessibility

Current support:

- SVG `role="img"`.
- `<title>` and `<desc>`.
- SSR-stable IDs when `id` is provided.
- Chart-level focus target.
- Keyboard navigation for active points/segments.
- `LiveRegion` primitive.
- `DataTable` HTML alternative.
- Focus-visible, high-contrast, and reduced-motion CSS.

Recommended usage:

```tsx
<LineChart title="Revenue" description="Monthly revenue and costs" ... />
<DataTable data={data} columns={columns} visuallyHidden />
```
