import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type MSISDN = {
  id: string
  number: string
  tariffPlan: string
  usageLimit: number
  currentUsage: number
  status: "active" | "suspended" | "pending"
  lastUpdated: string
}

export const columns: ColumnDef<MSISDN>[] = [
  {
    accessorKey: "number",
    header: "MSISDN",
  },
  {
    accessorKey: "tariffPlan",
    header: "Tariff Plan",
  },
  {
    accessorKey: "usageLimit",
    header: "Usage Limit",
    cell: ({ row }) => {
      return `${row.getValue("usageLimit")} ALL`
    },
  },
  {
    accessorKey: "currentUsage",
    header: "Current Usage",
    cell: ({ row }) => {
      return `${row.getValue("currentUsage")} ALL`
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div className={`capitalize ${
          status === "active" ? "text-green-600" :
          status === "suspended" ? "text-red-600" :
          "text-yellow-600"
        }`}>
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const msisdn = row.original.number;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {msisdn && msisdn.trim() !== '' ? (
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(msisdn)}
              >
                Copy MSISDN
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Plan</DropdownMenuItem>
            <DropdownMenuItem>Adjust Limit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Suspend MSISDN
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 