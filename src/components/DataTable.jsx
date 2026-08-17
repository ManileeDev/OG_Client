const SKELETON_WIDTHS = ['w-32', 'w-16', 'w-24', 'w-20', 'w-10', 'w-16', 'w-12']

function SkeletonRows({ columns }) {
  return [0, 1, 2, 3, 4].map((row) => (
    <tr key={row} className="border-b border-edge last:border-0">
      {columns.map((col, i) => (
        <td key={col.header || i} className="px-4 py-3.5">
          <div
            className={`h-4 animate-pulse rounded bg-panel-2 ${SKELETON_WIDTHS[(row + i) % SKELETON_WIDTHS.length]}`}
          />
        </td>
      ))}
    </tr>
  ))
}

export default function DataTable({ columns, rows, rowKey, loading = false, emptyMessage = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-edge bg-panel">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-edge">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-dim ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows columns={columns} />
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-dim">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)} className="border-b border-edge last:border-0 hover:bg-panel-2/50">
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3.5 ${col.className ?? ''}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
