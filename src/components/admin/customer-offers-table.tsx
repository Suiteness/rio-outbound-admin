"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

export type CustomerOffer = {
  id: number;
  hotel_offer?: string;
  food_offer?: string;
  bonus_play_offer?: string;
  offer_start_date: string;
  offer_end_date: string;
  validity_start_date: string;
  validity_end_date: string;
};

const columnHelper = createColumnHelper<CustomerOffer>();

const columns: ColumnDef<CustomerOffer>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("hotel_offer", {
    header: "Hotel Offer",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("food_offer", {
    header: "Food Offer",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.accessor("bonus_play_offer", {
    header: "Bonus Play Offer",
    cell: (info) => info.getValue() || "N/A",
  }),
  columnHelper.display({
    id: "offer_period",
    header: "Offer Period",
    cell: (info) => {
      const startDate = new Date(
        info.row.original.offer_start_date
      ).toLocaleDateString();
      const endDate = new Date(
        info.row.original.offer_end_date
      ).toLocaleDateString();
      return `${startDate} - ${endDate}`;
    },
  }),
  columnHelper.display({
    id: "validity_period",
    header: "Validity Period",
    cell: (info) => {
      const startDate = new Date(
        info.row.original.validity_start_date
      ).toLocaleDateString();
      const endDate = new Date(
        info.row.original.validity_end_date
      ).toLocaleDateString();
      return `${startDate} - ${endDate}`;
    },
  }),
];

interface CustomerOffersTableProps {
  data: CustomerOffer[];
}

export function CustomerOffersTable({ data }: CustomerOffersTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <DataTable table={table} />
    </div>
  );
}
