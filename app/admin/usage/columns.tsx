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

export type Usage = {
  id: string
  msisdn: string
  voiceUsage: number
  dataUsage: number
  smsUsage: number
  totalUsage: number
  budget: number
  budgetUsed: number
  lastUpdated: string
}

export const columns: ColumnDef<Usage>[] = [
  {
    accessorKey: "msisdn",
    header: "MSISDN",
  },
  {
    accessorKey: "voiceUsage",
    header: "Voice Usage",
    cell: ({ row }) => {
      return `${row.getValue("voiceUsage")} min`
    },
  },
  {
    accessorKey: "dataUsage",
    header: "Data Usage",
    cell: ({ row }) => {
      return `${row.getValue("dataUsage")} GB`
    },
  },
  {
    accessorKey: "smsUsage",
    header: "SMS Usage",
    cell: ({ row }) => {
      return row.getValue("smsUsage")
    },
  },
  {
    accessorKey: "totalUsage",
    header: "Total Usage",
    cell: ({ row }) => {
      return `${row.getValue("totalUsage")} ALL`
    },
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => {
      return `${row.getValue("budget")} ALL`
    },
  },
  {
    accessorKey: "budgetUsed",
    header: "Budget Used",
    cell: ({ row }) => {
      const budgetUsed = row.getValue("budgetUsed") as number
      const budget = row.getValue("budget") as number
      const percentage = (budgetUsed / budget) * 100
      
      return (
        <div className="flex items-center gap-2">
          <div className="w-full h-2 bg-muted rounded-full">
            <div 
              className={`h-full rounded-full ${
                percentage >= 90 ? "bg-red-500" :
                percentage >= 80 ? "bg-yellow-500" :
                "bg-green-500"
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <span>{percentage.toFixed(1)}%</span>
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
      const usage = row.original

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
              onClick={() => navigator.clipboard.writeText(usage.msisdn)}
            >
              Copy MSISDN
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Adjust Budget</DropdownMenuItem>
            <DropdownMenuItem>Set Alerts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Suspend Usage
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 