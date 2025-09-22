import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ExpandedState,
  getExpandedRowModel,
  ColumnDef,
  TableOptions,
  ColumnFiltersState,
  getFilteredRowModel,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "src/@/components/ui/table";
import {
  rosterColumns,
  buildSplitColumnsFromData,
  totalsLastColumn,
} from "src/data/columnDefs";
import {
  DataTableProps,
  Player,
  SplitRowExtended,
} from "src/interfaces/interfaces";
import { DateRangeFilter } from "./DateRangeFilter";
import { formatYMDLocal } from "src/utils/utils";

export function StatsTable<T extends object>({
  data,
  columnDefs,
}: {
  data: T[];
  columnDefs: ColumnDef<T, any>[];
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "__totalsLast", desc: false }, // totals at bottom by default
  ]);
  const table = useReactTable<T>({
    data,
    columns: [...(columnDefs as any), totalsLastColumn as any],
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // <- needed for sorting to work
  } as TableOptions<T>);

  const allLeafCols = table.getAllLeafColumns();

  const visibleLeafCols = allLeafCols.filter((col) =>
    table.getRowModel().rows.some((row) => {
      const val = row.getValue(col.id);

      return !(val === "" || val == null);
    })
  );

  return (
    <Table className="min-w-max [&_th]:text-center [&_td]:text-center">
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
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
    <Table className="min-w-max overflow-x-auto [&_th]:text-center [&_td]:text-center [&_th]:whitespace-nowrap">
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
                <TableCell key={cell.id} className="whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>

            {row.getIsExpanded() && (
              <TableRow>
                <TableCell
                  colSpan={row.getVisibleCells().length}
                  className="p-0"
                >
                  {/* Single scroll area - stats table will be part of main table width */}
                  <div className="bg-muted/30 p-4">
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
                        <div className="min-w-max">
                          <StatsTable
                            data={flattened}
                            columnDefs={buildSplitColumnsFromData(flattened)}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </Fragment>
        ))}
      </TableBody>
    </Table>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  showDateRange,
  date,
  dateId,
  sortOrder,
}: DataTableProps<TData, TValue>) {
  const endDate = date ?? new Date();
  const startDate = `${endDate.getFullYear()}-01-01`;
  const currentDate = formatYMDLocal(endDate);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: dateId ?? "", value: { from: startDate, to: currentDate } },
  ]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: dateId ?? "", desc: sortOrder == "asc" ? false : true },
  ]);
  let props: any = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  };

  if (showDateRange && date && dateId) {
    props = {
      data,
      columns,
      state: { columnFilters, sorting },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
    };
  }
  const table = useReactTable(props);
  return (
    <div className="min-w-max border [&_th]:text-center [&_td]:text-center">
      {showDateRange ? (
        <div className={`flex p-4 items-end`}>
          <DateRangeFilter table={table} />
        </div>
      ) : null}
      <Table className="min-w-max">
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
                className="even:bg-slate-200/20 hover:bg-slate-300/25"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="">
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
