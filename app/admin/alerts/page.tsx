import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AlertsConfiguration() {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('custom_jwt');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch('/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const { user } = await res.json();
      if (!user || user.role !== 'admin') {
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            Export Alerts
          </Button>
          <Button>
            Add New Alert
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">3</div>
            <p className="text-xs text-muted-foreground">
              -1 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Warning Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">5</div>
            <p className="text-xs text-muted-foreground">
              +3 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Info Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">4</div>
            <p className="text-xs text-muted-foreground">
              No change from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts via SMS
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dashboard Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show alerts in dashboard
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Thresholds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Budget Usage Warning</Label>
              <Input type="number" placeholder="80" suffix="%" />
            </div>
            <div className="space-y-2">
              <Label>Budget Usage Critical</Label>
              <Input type="number" placeholder="90" suffix="%" />
            </div>
            <div className="space-y-2">
              <Label>Data Usage Warning</Label>
              <Input type="number" placeholder="75" suffix="%" />
            </div>
            <div className="space-y-2">
              <Label>Data Usage Critical</Label>
              <Input type="number" placeholder="90" suffix="%" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search alerts..." className="pl-8" />
        </div>
        <Button variant="outline">
          Filter
        </Button>
      </div>

      <div className="rounded-md border">
        <DataTable columns={columns} data={[]} />
      </div>
    </div>
  )
} 