import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'

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

export default function TariffPlans() {
  const [plans, setPlans] = useState<TariffPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('custom_jwt')
      if (!token) {
        router.push('/login')
        return
      }
      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        router.push('/login')
        return
      }
      const { user } = await res.json()
      if (!user || user.role !== 'admin') {
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/tariff-plans')
        if (!response.ok) {
          throw new Error('Failed to fetch tariff plans')
        }
        const data = await response.json()
        setPlans(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-6 text-red-500">Error: {error}</div>
  }

  // Calculate statistics
  const totalPlans = plans.length
  const activePlans = plans.filter(plan => plan.is_active).length
  const popularPlan = plans.reduce((prev, current) => 
    (prev.price < current.price) ? prev : current
  )
  const averagePrice = plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tariff Plans</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            Export Plans
          </Button>
          <Button>
            Add New Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              All tariff plans
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activePlans}</div>
            <p className="text-xs text-muted-foreground">
              Currently available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Popular Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{popularPlan.name}</div>
            <p className="text-xs text-muted-foreground">
              {popularPlan.price.toLocaleString()} {popularPlan.currency}/month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePrice.toLocaleString()} ALL</div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search plans..." className="pl-8" />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={plans} />
      </div>
    </div>
  )
} 