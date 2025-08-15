import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ExpandedState,
  getExpandedRowModel,
  ColumnDef,
  TableOptions,
} from "@tanstack/react-table";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { ScrollArea } from "src/@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "src/@/components/ui/table";
import { rosterColumns, splitColumns } from "src/data/columnDefs";
import {
  DataTableProps,
  Player,
  SplitRowExtended,
} from "src/interfaces/interfaces";

export function StatsTable<T extends object>({
  data,
  columnDefs,
}: {
  data: T[];
  columnDefs: ColumnDef<T, any>[];
}) {
  const table = useReactTable<T>({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
  } as TableOptions<T>);

  const allLeafCols = table.getAllLeafColumns();

  const visibleLeafCols = allLeafCols.filter((col) =>
    table.getRowModel().rows.some((row) => {
      const val = row.getValue(col.id);

      return !(val === "" || val == null);
    })
  );

  return (
    <ScrollArea className="w-full rounded border overflow-auto">
      <div className="min-w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers
                  .filter((header) =>
                    visibleLeafCols.some((c) => c.id === header.id)
                  )
                  .map((h) => (
                    <TableHead key={h.id} colSpan={h.colSpan}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row
                  .getVisibleCells()
                  .filter((cell) =>
                    visibleLeafCols.some((c) => c.id === cell.column.id)
                  )
                  .map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
}

export function RosterTable({ data }: { data: Player[] }) {
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const table = useReactTable<Player>({
    data,
    columns: rosterColumns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="overflow-x-auto w-full">
      <div className="max-h-[70vh] w-full overflow-y-auto overscroll-contain">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} colSpan={h.colSpan}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>

                {row.getIsExpanded() && (
                  <TableRow>
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="p-4"
                    >
                      {(() => {
                        const flattened: SplitRowExtended[] =
                          row.original.person.stats.flatMap((ps) =>
                            ps.splits.map((split) => ({
                              type: ps.type.displayName,
                              group: ps.group.displayName,
                              ...split,
                            }))
                          );
                        return (
                          <StatsTable
                            data={flattened}
                            columnDefs={splitColumns}
                          />
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
