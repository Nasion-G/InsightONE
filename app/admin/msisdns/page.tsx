"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { columns } from "./columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function MSISDNManagement({
  companyId,
}: {
  companyId?: string | null;
}) {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    msisdn: "",
    tariff_plan_id: "",
    usage_limit: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<{ [msisdn: string]: boolean }>({});
  const router = useRouter();

  // Fetch users and plans on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersRes = await fetch("/api/msisdns");
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);

        const plansRes = await fetch("/api/tariff-plans");
        const plansData = await plansRes.json();
        setPlans(Array.isArray(plansData) ? plansData : []);
      } catch (err: any) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("custom_jwt");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const { user } = await res.json();
      if (!user || user.role !== "admin") {
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/msisdns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msisdn: newUser.msisdn,
          tariff_plan_id: newUser.tariff_plan_id,
          usage_limit: parseFloat(newUser.usage_limit),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add user");
      }
      const data = await res.json();
      setUsers([...users, data]);
      setIsDialogOpen(false);
      setNewUser({ msisdn: "", tariff_plan_id: "", usage_limit: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group users by MSISDN
  const grouped = users.reduce(
    (acc, user) => {
      if (
        user.msisdn &&
        typeof user.msisdn === "string" &&
        user.msisdn.trim() !== "" &&
        user.msisdn.toLowerCase().includes(search.toLowerCase())
      ) {
        if (!acc[user.msisdn]) acc[user.msisdn] = [];
        acc[user.msisdn].push(user);
      }
      return acc;
    },
    {} as Record<string, any[]>,
  );
  const msisdnList = Object.keys(grouped);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">MSISDN Management</h1>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add MSISDN
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New MSISDN</DialogTitle>
                <DialogDescription>
                  Enter the details for the new MSISDN.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <div className="space-y-2">
                  <Label htmlFor="msisdn">MSISDN Number</Label>
                  <Input
                    id="msisdn"
                    value={newUser.msisdn}
                    onChange={(e) =>
                      setNewUser({ ...newUser, msisdn: e.target.value })
                    }
                    placeholder="Enter MSISDN number"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tariff_plan_id">Tariff Plan</Label>
                  <Select
                    value={newUser.tariff_plan_id}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, tariff_plan_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.price} {plan.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit (ALL)</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={newUser.usage_limit}
                    onChange={(e) =>
                      setNewUser({ ...newUser, usage_limit: e.target.value })
                    }
                    placeholder="Enter usage limit"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Adding..." : "Add MSISDN"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search MSISDNs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white/5">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-white/20">MSISDN</th>
              <th className="px-3 py-2 border border-white/20">Users/Phones</th>
              <th className="px-3 py-2 border border-white/20">Expand</th>
            </tr>
          </thead>
          <tbody>
            {msisdnList.map((msisdn) => (
              <React.Fragment key={msisdn}>
                <tr className="bg-purple-100/10">
                  <td className="px-3 py-2 border border-white/20">{msisdn}</td>
                  <td className="px-3 py-2 border border-white/20">
                    {grouped[msisdn].length}
                  </td>
                  <td className="px-3 py-2 border border-white/20">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [msisdn]: !e[msisdn] }))
                      }
                    >
                      {expanded[msisdn] ? "Hide" : "Show"}
                    </Button>
                  </td>
                </tr>
                {expanded[msisdn] && (
                  <tr>
                    <td colSpan={3} className="bg-white/10">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 border border-white/20">
                              User ID
                            </th>
                            <th className="px-3 py-2 border border-white/20">
                              Tariff Plan
                            </th>
                            <th className="px-3 py-2 border border-white/20">
                              Usage Limit
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {grouped[msisdn].map((user) => (
                            <tr key={user.id}>
                              <td className="px-3 py-2 border border-white/20">
                                {user.id}
                              </td>
                              <td className="px-3 py-2 border border-white/20">
                                {user.tariff_plan_id}
                              </td>
                              <td className="px-3 py-2 border border-white/20">
                                {user.usage_limit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
