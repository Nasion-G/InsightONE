"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import MSISDNManagement from "../admin/msisdns/page";
import OrderTrackingTab from "../admin/page";
import AnalyticsTab from "../admin/page";

export default function SMEADashboard() {
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
      const token = localStorage.getItem("custom_jwt");
      if (token) {
        const res = await fetch("/api/user", {
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
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "user_logout",
          details: {
            msisdn,
            phone,
            message: `User with MSISDN ${msisdn || ""} and Phone Number ${phone || ""} logged out today at ${new Date().toLocaleString()}`,
          },
        }),
      });
    } catch (e) {}
    localStorage.removeItem("custom_jwt");
    router.push("/login");
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
      if (user.role !== "smea") {
        if (window.location.pathname !== "/login") router.push("/login");
      }
    };
  }, [router]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">SME Admin Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-white/20 hover:bg-white/30 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 btn-animated"
        >
          Logout
        </Button>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="msisdns">MSISDN Management</TabsTrigger>
          <TabsTrigger value="orders">Order Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="msisdns">
          <MSISDNManagement companyId={userCompanyId} />
        </TabsContent>
        <TabsContent value="orders">
          <OrderTrackingTab companyId={userCompanyId} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab companyId={userCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

