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

export type TariffPlan = {
  id: string
  name: string
  description: string
  voice_minutes: number
  data_gb: number
  sms_count: number
  price: number
  currency: string
  validity_days: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export const columns: ColumnDef<TariffPlan>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "voice_minutes",
    header: "Voice Minutes",
    cell: ({ row }) => {
      return `${row.getValue("voice_minutes")} min`
    },
  },
  {
    accessorKey: "data_gb",
    header: "Data",
    cell: ({ row }) => {
      return `${row.getValue("data_gb")} GB`
    },
  },
  {
    accessorKey: "sms_count",
    header: "SMS",
    cell: ({ row }) => {
      return row.getValue("sms_count")
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      const currency = row.getValue("currency") as string
      return `${price.toLocaleString()} ${currency}`
    },
  },
  {
    accessorKey: "validity_days",
    header: "Validity",
    cell: ({ row }) => {
      return `${row.getValue("validity_days")} days`
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean
      return (
        <div className={`capitalize ${
          isActive ? "text-green-500" : "text-red-500"
        }`}>
          {isActive ? "Active" : "Inactive"}
        </div>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
  {
    accessorKey: "updated_at",
    header: "Last Updated",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const plan = row.original

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
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Plan</DropdownMenuItem>
            <DropdownMenuItem>Duplicate Plan</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              {plan.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 