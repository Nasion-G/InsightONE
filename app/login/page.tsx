"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  useEffect(() => {
    // If already logged in, check role and redirect accordingly
    const checkRoleAndRedirect = async () => {
      const token = localStorage.getItem("custom_jwt");
      if (!token) return; // No token, stay on login page

      try {
        // Fetch user data to check role
        const res = await fetch("/api/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("custom_jwt"); // Invalid token
          return;
        }

        const data = await res.json();
        if (!data.user) {
          localStorage.removeItem("custom_jwt"); // No user data
          return;
        }

        // Redirect based on role
        console.log("User role:", data.user.role);
        if (data.user.role === "ssr") {
          console.log("Redirecting SSR user to /ssr");
          router.push("/ssr");
        } else if (data.user.role === "admin") {
          console.log("Redirecting admin user to /admin");
          router.push("/admin");
        } else if (data.user.role === "smea") {
          console.log("Redirecting SMEA user to /smea");
          router.push("/smea");
        } else {
          console.log("Redirecting standard user to:", callbackUrl);
          router.push(callbackUrl);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkRoleAndRedirect();
  }, [router, callbackUrl]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Normalize identifier: remove spaces and leading +
      let normIdentifier = identifier.replace(/\s+/g, "");
      if (normIdentifier.startsWith("+"))
        normIdentifier = normIdentifier.slice(1);
      console.log("Attempting login with:", {
        identifier: normIdentifier,
        password,
      });
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: normIdentifier, password }),
      });
      const data = await res.json();
      console.log("Login response:", { status: res.status, data });

      if (!res.ok) {
        // Custom error handling for missing password
        if (data.error && data.error.toLowerCase().includes("password")) {
          setError(
            data.error +
              " If you have not set a password yet, please use the Reset Password link below.",
          );
        } else {
          setError(data.error || "Login failed");
        }
        throw new Error(data.error || "Login failed");
      }

      if (!data.token) {
        throw new Error("No token received from server");
      }

      console.log("Login successful, storing token:", data.token);
      localStorage.setItem("custom_jwt", data.token);

      // Check user role and redirect accordingly
      if (data.user && data.user.role) {
        if (data.user.role === "ssr") {
          window.location.href = "/ssr";
        } else if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else if (data.user.role === "smea") {
          window.location.href = "/smea";
        } else {
          window.location.href = callbackUrl;
        }
      } else {
        // Default fallback if no role or unrecognized role
        window.location.href = callbackUrl;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <Button
          onClick={() => router.push("/")}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 btn-animated"
        >
          Back to Home
        </Button>
      </div>
      {/* Animated SVG blobs for eye candy */}
      <svg
        className="floating-svg left-10 top-10 blur-2xl animate-[floatY_8s_ease-in-out_infinite_alternate,wiggle_12s_ease-in-out_infinite]"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
      >
        <ellipse
          cx="90"
          cy="90"
          rx="90"
          ry="70"
          fill="#818cf8"
          fillOpacity="0.5"
        />
      </svg>
      <svg
        className="floating-svg right-20 top-32 blur-3xl animate-[floatY_10s_ease-in-out_infinite_alternate-reverse,wiggle_14s_ease-in-out_infinite]"
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
      >
        <ellipse
          cx="70"
          cy="70"
          rx="70"
          ry="50"
          fill="#a5b4fc"
          fillOpacity="0.4"
        />
      </svg>
      <svg
        className="floating-svg left-1/2 bottom-10 blur-2xl animate-[floatY_12s_ease-in-out_infinite_alternate,wiggle_16s_ease-in-out_infinite]"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
      >
        <ellipse
          cx="80"
          cy="80"
          rx="80"
          ry="60"
          fill="#6366f1"
          fillOpacity="0.3"
        />
      </svg>
      {/* Subtle animated sparkles */}
      <svg
        className="floating-svg left-1/3 top-1/4 animate-pulse"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle cx="12" cy="12" r="2" fill="#fff" fillOpacity="0.7" />
      </svg>
      <svg
        className="floating-svg right-1/4 bottom-1/3 animate-pulse"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
      >
        <circle cx="9" cy="9" r="1.5" fill="#fff" fillOpacity="0.5" />
      </svg>
      {/* Animated gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, #818cf8 0%, transparent 70%)",
        }}
      />
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/10 backdrop-blur-sm animate-fadein z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-4xl font-extrabold text-white">
            Login
          </CardTitle>
          <CardDescription className="text-white/80">
            Enter your phone number or MSISDN and password to access your
            account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-500/20 border-red-500/30"
              >
                <AlertDescription className="text-white">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <label
                htmlFor="identifier"
                className="text-lg font-medium text-white"
              >
                Phone Number or MSISDN
              </label>
              <Input
                id="identifier"
                type="text"
                placeholder="Phone number or MSISDN"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-lg font-medium text-white"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/30"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 btn-animated"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
            <div className="flex flex-col items-center gap-3 mt-4">
              <Link
                href="/reset-password"
                className="text-white/80 hover:text-white hover:underline text-lg transition-colors"
              >
                Forgot/Reset Password (or first time)
              </Link>
              <Link
                href="/signup"
                className="text-white/80 hover:text-white hover:underline text-lg transition-colors"
              >
                No Account? Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
