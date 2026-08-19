const SKELETON_WIDTHS = ['w-32', 'w-16', 'w-24', 'w-20', 'w-10', 'w-16', 'w-12']

function SkeletonRows({ columns }) {
  return [0, 1, 2, 3, 4].map((row) => (
    <tr key={row}>
      {columns.map((col, i) => (
        <td key={col.header || i} className="border-b border-edge px-4 py-3.5">
          <div
            className={`h-4 animate-pulse rounded bg-panel-2 ${SKELETON_WIDTHS[(row + i) % SKELETON_WIDTHS.length]}`}
          />
        </td>
      ))}
    </tr>
  ))
}

export default function DataTable({ columns, rows, rowKey, loading = false, emptyMessage = 'Nothing here yet.', onRowClick }) {
  // Clicks on interactive elements inside a row (links, action buttons)
  // keep their own behaviour instead of triggering the row click
  const handleRowClick = (e, row) => {
    if (e.target.closest('a, button, input, select, label')) return
    onRowClick(row)
  }

  return (
    // Rows scroll inside this container so the header row stays pinned.
    <div className="max-h-[65vh] overflow-auto rounded-xl border border-edge bg-panel">
      {/* border-separate: collapsed borders don't travel with sticky headers */}
      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={`sticky top-0 z-10 border-b border-edge bg-panel px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-dim ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
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
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? (e) => handleRowClick(e, row) : undefined}
                className={`hover:bg-panel-2/50 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.header} className={`border-b border-edge px-4 py-3.5 ${col.className ?? ''}`}>
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
