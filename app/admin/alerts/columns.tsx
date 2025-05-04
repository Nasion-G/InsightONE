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

export type Alert = {
  id: string
  msisdn: string
  type: "budget" | "usage" | "system"
  severity: "critical" | "warning" | "info"
  message: string
  threshold: number
  currentValue: number
  status: "active" | "resolved" | "dismissed"
  createdAt: string
  lastUpdated: string
}

export const columns: ColumnDef<Alert>[] = [
  {
    accessorKey: "msisdn",
    header: "MSISDN",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const type = row.getValue("type")
      return (
        <div className="capitalize">
          {type}
        </div>
      )
    },
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const severity = row.getValue("severity")
      return (
        <div className={`capitalize ${
          severity === "critical" ? "text-red-500" :
          severity === "warning" ? "text-yellow-500" :
          "text-blue-500"
        }`}>
          {severity}
        </div>
      )
    },
  },
  {
    accessorKey: "message",
    header: "Message",
  },
  {
    accessorKey: "threshold",
    header: "Threshold",
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      return `${row.getValue("threshold")}%`
    },
  },
  {
    accessorKey: "currentValue",
    header: "Current Value",
    cell: ({ row }: { row: { getValue: (key: string) => number } }) => {
      return `${row.getValue("currentValue")}%`
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { getValue: (key: string) => string } }) => {
      const status = row.getValue("status")
      return (
        <div className={`capitalize ${
          status === "active" ? "text-green-500" :
          status === "resolved" ? "text-blue-500" :
          "text-gray-500"
        }`}>
          {status}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Alert } }) => {
      const alert = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(alert.msisdn)}
            >
              Copy MSISDN
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Adjust Threshold</DropdownMenuItem>
            <DropdownMenuItem>Change Notification Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Dismiss Alert
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 