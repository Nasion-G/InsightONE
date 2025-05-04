import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsageMonitoring() {
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
        <h1 className="text-3xl font-bold">Usage Monitoring & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            Export Report
          </Button>
          <Button>
            Generate Analytics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">Real-time Usage</TabsTrigger>
          <TabsTrigger value="historical">Historical Trends</TabsTrigger>
          <TabsTrigger value="budget">Usage vs Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Voice Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234 min</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Data Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.6 GB</div>
                <p className="text-xs text-muted-foreground">
                  +12.3% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total SMS Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">456</div>
                <p className="text-xs text-muted-foreground">
                  -5.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Budget Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12,345 ALL</div>
                <p className="text-xs text-muted-foreground">
                  65% of total budget
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search MSISDNs..." className="pl-8" />
            </div>
            <Button variant="outline">
              Filter
            </Button>
          </div>

          <div className="rounded-md border">
            <DataTable columns={columns} data={[]} />
          </div>
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Historical usage charts will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage vs Budget Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">Budget comparison charts will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 