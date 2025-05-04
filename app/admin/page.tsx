"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MSISDNManagement from "./msisdns/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
// Placeholder components for logs, user management, order tracking, analytics
function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("custom_jwt");
        const res = await fetch("/api/logs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch logs");
        const data = await res.json();
        setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);
  if (loading) return <div>Loading logs...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">System Logs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white/10 rounded-xl shadow-lg border border-white/20">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-white/20">Timestamp</th>
              <th className="px-3 py-2 border border-white/20">User ID</th>
              <th className="px-3 py-2 border border-white/20">Action</th>
              <th className="px-3 py-2 border border-white/20">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border border-white/20 px-3 py-2">{log.created_at}</td>
                <td className="border border-white/20 px-3 py-2">{log.user_id}</td>
                <td className="border border-white/20 px-3 py-2">{log.action}</td>
                <td className="border border-white/20 px-3 py-2">
                  {typeof log.details === "object"
                    ? JSON.stringify(log.details)
                    : log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function UserManagementTab({ role, companyId }: { role: string; companyId: string | null }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    msisdn: "",
    phone: "",
    role: "",
    password: "",
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserMsisdn, setDeleteUserMsisdn] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchUsers = async (phoneSearch?: string) => {
    setLoading(true);
    try {
      let url = "/api/users";
      if (phoneSearch && phoneSearch.trim() !== "") {
        url += `?phone=${encodeURIComponent(phoneSearch.trim())}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let payload = { ...newUser };
      if ('id' in payload) {
        // @ts-ignore
        delete payload.id;
      }
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add user");
      }
      const data = await res.json();
      setUsers([...users, data]);
      setIsDialogOpen(false);
      setNewUser({
        msisdn: "",
        phone: "",
        role: "",
        password: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.id) {
      setError("User ID is missing. Cannot update user.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...editingUser };
      console.log('PATCH payload:', payload);
      if (!payload.company_id) delete payload.company_id;
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update user");
        return;
      }
      const data = await res.json();
      setUsers(users.map((u) => (u.id === data.id ? data : u)));
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id: string, msisdn: string) => {
    setDeleteUserId(id);
    setDeleteUserMsisdn(msisdn);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/users?id=${deleteUserId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to delete user");
        return;
      }
      setUsers(users.filter((u) => u.id !== deleteUserId));
      setDeleteUserId(null);
      setDeleteUserMsisdn(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
          <Button onClick={() => fetchUsers(searchPhone)}>Search</Button>
          <Button onClick={() => { setSearchPhone(""); fetchUsers(); }}>Clear</Button>
          <Button onClick={() => setIsDialogOpen(true)}>Add User</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white/10 rounded-xl shadow-lg border border-white/20">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-white/20">MSISDN</th>
              <th className="px-3 py-2 border border-white/20">Phone</th>
              <th className="px-3 py-2 border border-white/20">Role</th>
              <th className="px-3 py-2 border border-white/20">Company</th>
              <th className="px-3 py-2 border border-white/20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const company = companies.find((c) => c.id === user.company_id);
              return (
                <tr key={user.id}>
                  <td className="border border-white/20 px-3 py-2">{user.msisdn}</td>
                  <td className="border border-white/20 px-3 py-2">{user.phone}</td>
                  <td className="border border-white/20 px-3 py-2">{user.role}</td>
                  <td className="border border-white/20 px-3 py-2">{company ? company.name : ""}</td>
                  <td className="border border-white/20 px-3 py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id, user.msisdn)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={editingUser ? handleEditUser : handleAddUser}>
            <div className="space-y-4">
              {error && <div className="text-red-500 text-sm">{error}</div>}
              {editingUser && !editingUser.id && (
                <div className="text-red-500 text-sm">User ID is missing. Cannot update user.</div>
              )}
              <div>
                <Label>MSISDN</Label>
                <Input
                  value={editingUser?.msisdn || newUser.msisdn}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({
                          ...editingUser,
                          msisdn: e.target.value,
                        })
                      : setNewUser({ ...newUser, msisdn: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={editingUser?.phone || newUser.phone}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({
                          ...editingUser,
                          phone: e.target.value,
                        })
                      : setNewUser({ ...newUser, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={editingUser?.role || newUser.role}
                  onValueChange={(value) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, role: value })
                      : setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="ssr">Sales Support</SelectItem>
                    <SelectItem value="smea">SME Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editingUser && (
                <div>
                  <Label>Company</Label>
                  <Select
                    value={editingUser.company_id || ""}
                    onValueChange={(value) =>
                      setEditingUser({ ...editingUser, company_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {!editingUser && (
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button type="submit">
                {editingUser ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteUserId} onOpenChange={(open) => { if (!open) { setDeleteUserId(null); setDeleteUserMsisdn(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="mb-4">Are you sure you want to delete user <b>{deleteUserMsisdn}</b>? This action cannot be undone.</div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteUserId(null); setDeleteUserMsisdn(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
function OrderTrackingTab({ companyId }: { companyId?: string | null }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/msisdns");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("No data");
        setOrders(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  if (loading) return <div>Loading order tracking...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Order Tracking</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white/10 rounded-xl shadow-lg border border-white/20">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-white/20">MSISDN</th>
              <th className="px-3 py-2 border border-white/20">Type</th>
              <th className="px-3 py-2 border border-white/20">Amount</th>
              <th className="px-3 py-2 border border-white/20">Spend (EUR)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.id || idx}>
                <td className="border border-white/20 px-3 py-2">{order.msisdn}</td>
                <td className="border border-white/20 px-3 py-2">{order.unit}</td>
                <td className="border border-white/20 px-3 py-2">{order.duration_volume}</td>
                <td className="border border-white/20 px-3 py-2">
                  {Math.round(Number(order.tariff_vat_incl) * 100) / 100}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function AnalyticsTab({ companyId }: { companyId?: string | null }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/msisdns");
        const users = await res.json();
        if (!Array.isArray(users)) throw new Error("No data");
        let totalSMS = 0,
          totalMin = 0,
          totalMB = 0,
          totalSpend = 0;
        const perUser: Record<
          string,
          { sms: number; min: number; mb: number; spend: number }
        > = {};
        users.forEach((u) => {
          if (!u.msisdn) return;
          if (!perUser[u.msisdn])
            perUser[u.msisdn] = { sms: 0, min: 0, mb: 0, spend: 0 };
          const val = Number(u.duration_volume || 0);
          if (u.unit === "SMS") {
            totalSMS += val;
            perUser[u.msisdn].sms += val;
          } else if (u.unit === "min") {
            totalMin += val;
            perUser[u.msisdn].min += val;
          } else if (u.unit === "MB") {
            totalMB += val;
            perUser[u.msisdn].mb += val;
          }
          totalSpend += Number(u.tariff_vat_incl || 0);
          perUser[u.msisdn].spend += Number(u.tariff_vat_incl || 0);
        });
        setStats({
          totalSMS: Math.round(totalSMS),
          totalMin: Math.round(totalMin),
          totalMB: Math.round(totalMB),
          totalSpend: Math.round(totalSpend * 100) / 100,
          perUser,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Analytics</h2>
      <div className="mb-4">
        <div>
          Total SMS: <b>{stats.totalSMS}</b>
        </div>
        <div>
          Total Minutes: <b>{stats.totalMin}</b>
        </div>
        <div>
          Total Data: <b>{stats.totalMB} MB</b>
        </div>
        <div>
          Total Spend: <b>{stats.totalSpend} EUR</b>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Per-User Breakdown</h3>
        <table className="min-w-full text-sm bg-white/10 rounded-xl shadow-lg border border-white/20">
          <thead>
            <tr>
              <th className="px-3 py-2 border border-white/20">MSISDN</th>
              <th className="px-3 py-2 border border-white/20">SMS</th>
              <th className="px-3 py-2 border border-white/20">Minutes</th>
              <th className="px-3 py-2 border border-white/20">MB</th>
              <th className="px-3 py-2 border border-white/20">Spend (ALL)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.perUser).map(([msisdn, s]: any) => (
              <tr key={msisdn}>
                <td className="border border-white/20 px-3 py-2">{msisdn}</td>
                <td className="border border-white/20 px-3 py-2">{Math.round(s.sms)}</td>
                <td className="border border-white/20 px-3 py-2">{Math.round(s.min)}</td>
                <td className="border border-white/20 px-3 py-2">{Math.round(s.mb)}</td>
                <td className="border border-white/20 px-3 py-2">
                  {Math.round(s.spend * 100) / 100}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("msisdns");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);

  // Logout handler
  const handleLogout = async () => {
    // Try to get user info for logging
    let msisdn = null;
    let phone = null;
    try {
      const token = localStorage.getItem('custom_jwt');
      if (token) {
        const res = await fetch('/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          msisdn = data.user?.msisdn || null;
          phone = data.user?.phone || null;
        }
      }
    } catch (e) {}
    // Log the logout event
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'user_logout',
          details: {
            msisdn,
            phone,
            message: `User with MSISDN ${msisdn || ''} and Phone Number ${phone || ''} logged out today at ${new Date().toLocaleString()}`,
          },
        }),
      });
    } catch (e) {}
    localStorage.removeItem('custom_jwt');
    router.push('/login');
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("custom_jwt");
      if (!token) {
        if (window.location.pathname !== "/login") router.push("/login");
        return;
      }
      const res = await fetch("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (window.location.pathname !== "/login") router.push("/login");
        return;
      }
      const { user } = await res.json();
      if (!user) {
        if (window.location.pathname !== "/login") router.push("/login");
        return;
      }
      setUserRole(user.role);
      setUserCompanyId(user.company_id || null);
      if (user.role !== "admin" && user.role !== "ssr" && user.role !== "smea") {
        if (window.location.pathname !== "/login") router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  // Tab visibility logic
  const showLogsTab = userRole === "admin";
  const showUserManagementTab = userRole === "admin";
  const showOrderTrackingTab = userRole === "admin" || userRole === "ssr" || userRole === "smea";
  const showAnalyticsTab = userRole === "admin" || userRole === "ssr" || userRole === "smea";
  const showMSISDNTab = true;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-white/20 hover:bg-white/30 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 btn-animated"
        >
          Logout
        </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          {showMSISDNTab && <TabsTrigger value="msisdns">MSISDN Management</TabsTrigger>}
          {showLogsTab && <TabsTrigger value="logs">Logs</TabsTrigger>}
          {showUserManagementTab && <TabsTrigger value="users">User Management</TabsTrigger>}
          {showOrderTrackingTab && <TabsTrigger value="orders">Order Tracking</TabsTrigger>}
          {showAnalyticsTab && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>
        <TabsContent value="msisdns">
          <MSISDNManagement companyId={userRole === 'smea' ? userCompanyId : null} />
        </TabsContent>
        {showLogsTab && (
          <TabsContent value="logs">
            <LogsTab />
          </TabsContent>
        )}
        {showUserManagementTab && (
          <TabsContent value="users">
            <UserManagementTab
              role={userRole}
              companyId={userCompanyId}
            />
          </TabsContent>
        )}
        {showOrderTrackingTab && (
          <TabsContent value="orders">
            <OrderTrackingTab companyId={userRole === 'smea' ? userCompanyId : null} />
          </TabsContent>
        )}
        {showAnalyticsTab && (
          <TabsContent value="analytics">
            <AnalyticsTab companyId={userRole === 'smea' ? userCompanyId : null} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
