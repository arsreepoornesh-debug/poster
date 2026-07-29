import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectRow?: (id: string, checked: boolean) => void;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  selectedIds,
  onSelectAll,
  onSelectRow,
  emptyMessage = "No items found.",
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && selectedIds && data.every((item) => selectedIds.includes(keyExtractor(item)));

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
          <tr>
            {onSelectRow && (
              <th className="p-3.5 w-10">
                <input
                  type="checkbox"
                  checked={allSelected || false}
                  onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
                  className="rounded border-border text-brand-600 focus:ring-brand-500"
                />
              </th>
            )}
            {columns.map((col, index) => (
              <th key={index} className={cn("p-3.5", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {onSelectRow && <td className="p-3.5"><div className="w-4 h-4 bg-muted rounded"></div></td>}
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="p-3.5"><div className="h-4 bg-muted rounded w-24"></div></td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onSelectRow ? 1 : 0)} className="p-8 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds?.includes(id);

              return (
                <tr
                  key={id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    isSelected && "bg-brand-500/5"
                  )}
                >
                  {onSelectRow && (
                    <td className="p-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={(e) => onSelectRow(id, e.target.checked)}
                        className="rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={cn("p-3.5 font-medium text-foreground", col.className)}>
                      {col.cell
                        ? col.cell(item)
                        : col.accessorKey
                        ? (item[col.accessorKey] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
