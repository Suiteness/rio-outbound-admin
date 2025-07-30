import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/admin/data-table";

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  playerId: number | null;
  playerTier: string | null;
  optPhone: boolean;
  optText: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  offers?: Array<{
    id: number;
    hotel_offer?: string;
    food_offer?: string;
    bonus_play_offer?: string;
    offer_start_date: string;
    offer_end_date: string;
    validity_start_date: string;
    validity_end_date: string;
  }>;
};

const columnHelper = createColumnHelper<Customer>();

const columns: ColumnDef<Customer>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("firstName", {
    header: "First Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("lastName", {
    header: "Last Name",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => info.getValue() || "—",
  }),
  columnHelper.accessor("phoneNumber", {
    header: "Phone",
    cell: (info) => info.getValue() || "—",
  }),
  columnHelper.accessor("playerId", {
    header: "Player ID",
    cell: (info) => info.getValue() || "—",
  }),
  columnHelper.accessor("playerTier", {
    header: "Player Tier",
    cell: (info) => info.getValue() || "—",
  }),
  columnHelper.display({
    id: "offers_count",
    header: "Offers",
    cell: (info) => {
      const offers = info.row.original.offers;
      return offers ? offers.length.toString() : "0";
    },
  }),
  columnHelper.accessor("created_at", {
    header: "Created At",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.accessor("updated_at", {
    header: "Updated At",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];

interface DataTableProps {
  data: Customer[];
}

export function CustomersTable({ data }: DataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (customer: Customer) => {
    window.location.href = `/admin/customers/${customer.id}`;
  };

  return (
    <div className="rounded-md border">
      <DataTable table={table} onRowClick={handleRowClick} />
    </div>
  );
}
