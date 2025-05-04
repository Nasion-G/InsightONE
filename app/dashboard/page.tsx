"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("custom_jwt");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (!data.user) {
          router.push("/login");
          return;
        }
        // Check if user role is "ssr" and redirect if it is
        if (data.user.role === "admin") {
          router.push("/admin");
          return;
        } else if (data.user.role === "ssr") {
          router.push("/ssr");
          return;
        } else if (data.user.role === "smea") {
          router.push("/smea");
          return;
        }
        setUserData(data.user);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("custom_jwt");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Dashboard</h1>
        <Button
          onClick={handleLogout}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 btn-animated"
        >
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              User Information
            </CardTitle>
            <CardDescription className="text-white/80">
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-white">
              <div>
                <p className="text-lg font-medium">MSISDN</p>
                <p className="text-xl">{userData?.msisdn}</p>
              </div>
              <div>
                <p className="text-lg font-medium">Account Status</p>
                <p className="text-xl">{userData?.status || "Active"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              Recent Activity
            </CardTitle>
            <CardDescription className="text-white/80">
              Your latest actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-white">
              <div>
                <p className="text-lg font-medium">Last Login</p>
                <p className="text-xl">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-lg font-medium">Session Duration</p>
                <p className="text-xl">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Quick Actions</CardTitle>
            <CardDescription className="text-white/80">
              Common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 btn-animated"
                onClick={() => router.push("/reset-password")}
              >
                Change Password
              </Button>
              <Button
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 btn-animated"
                onClick={() => router.push("/profile")}
              >
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

