"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

const features = [
  {
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
      </svg>
    ),
    title: "All-in-One Management",
    desc: "Monitor, assign, and manage all your company's mobile lines in one place.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
      </svg>
    ),
    title: "Smart Alerts",
    desc: "Get notified at 80%, 90%, and 100% of your budget or usage limits.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 8v8" />
      </svg>
    ),
    title: "AI Recommendations",
    desc: "Personalized plan and usage suggestions powered by machine learning.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z" />
      </svg>
    ),
    title: "Self-Service Operations",
    desc: "Change limits, activate packages, and manage orders instantly.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Advanced Analytics",
    desc: "Deep insights into usage patterns, cost optimization, and employee productivity.",
  },
  {
    icon: (
      <svg
        className="w-8 h-8 text-indigo-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Real-time Monitoring",
    desc: "Live tracking of usage, costs, and network performance across all devices.",
  },
];

const testimonials = [
  {
    quote:
      "InsightONE has transformed how we manage our telecoms. The real-time dashboard and alerts are a game changer!",
    name: "Elira K.",
    company: "AlbaTech Solutions",
  },
  {
    quote:
      "The AI recommendations helped us save 20% on our mobile costs in the first month.",
    name: "Gentian P.",
    company: "SmartBiz Albania",
  },
  {
    quote:
      "Finally, a dashboard that's easy for both IT and business users. Love the design!",
    name: "Ardian D.",
    company: "One Creative Studio",
  },
];

const badges = [
  {
    label: "GDPR Compliant",
    color: "bg-white/10 text-[#8e24aa] border border-[#8e24aa]",
  },
  {
    label: "ISO 27001",
    color: "bg-white/10 text-[#8e24aa] border border-[#8e24aa]",
  },
  {
    label: "99.99% Uptime",
    color: "bg-white/10 text-[#8e24aa] border border-[#8e24aa]",
  },
  {
    label: "AI-Powered",
    color: "bg-white/10 text-[#8e24aa] border border-[#8e24aa]",
  },
];

const trustedBy = [
  "AlbaTech",
  "SmartBiz",
  "One Creative",
  "TelecomPro",
  "BizConnect",
];

export default function HomePage() {
  const [showDemo, setShowDemo] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [prevTestimonialIdx, setPrevTestimonialIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const [showMainAnim, setShowMainAnim] = useState(false);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(
    undefined,
  );
  const testimonialRefs = [
    React.useRef<HTMLDivElement>(null),
    React.useRef<HTMLDivElement>(null),
  ];
  const [msisdn, setMsisdn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showTabModal, setShowTabModal] = useState<null | 'whatsnew' | 'ai'>(null);

  // Animated counters
  const stats = [
    { label: "MSISDNs Managed", value: 10432 },
    { label: "AI Recommendations", value: 2381 },
    { label: "Orders Processed", value: 5120 },
  ];

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashFade(true);
      setShowMainAnim(true);
    }, 1000); // start fade and main anim
    const timer2 = setTimeout(() => setShowSplash(false), 1600); // remove splash after fade
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  // Cycle testimonials every 6s
  useEffect(() => {
    const interval = setInterval(() => {
      handleTestimonialChange((testimonialIdx + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonialIdx]);

  // Animate container height for smooth transition
  useLayoutEffect(() => {
    const currentRef = fading ? testimonialRefs[0] : testimonialRefs[1];
    if (currentRef.current) {
      setContainerHeight(currentRef.current.offsetHeight);
    }
  }, [testimonialIdx, fading]);

  function handleTestimonialChange(newIdx: number) {
    if (newIdx === testimonialIdx) return;
    setPrevTestimonialIdx(testimonialIdx);
    setTestimonialIdx(newIdx);
    setFading(true);
    setTimeout(() => {
      setFading(false);
    }, 400); // duration matches CSS
  }

  useEffect(() => {
    if (showSplash) {
      document.body.classList.add("no-scrollbar");
    } else {
      document.body.classList.remove("no-scrollbar");
    }

    return () => {
      document.body.classList.remove("no-scrollbar");
    };
  }, [showSplash]);
  const handleCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let normMsisdn = msisdn.replace(/\s+/g, "");
      if (normMsisdn.startsWith("+")) normMsisdn = normMsisdn.slice(1);
      console.log("Checking MSISDN:", { msisdn: normMsisdn });
      const res = await fetch("/api/check-msisdn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ msisdn: normMsisdn }),
      });
      const data = await res.json();
      console.log("Check response:", { status: res.status, data });

      if (!res.ok) {
        setError(data.error || "Check failed");
        throw new Error(data.error || "Check failed");
      }

      if (data.exists) {
        router.push("/login");
      } else {
        router.push("/signup");
      }
    } catch (error: any) {
      console.error("Check error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-y-auto">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0 animated-gradient-bg"></div>
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
      {/* Main content only renders when showMainAnim is true */}
      {showMainAnim && (
        <>
          {/* Top Navigation */}
          <div className="fixed top-4 right-4 z-30 flex gap-4">
            <Button
              onClick={() => router.push("/login")}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 btn-animated"
            >
              Login
            </Button>
            <Button
              onClick={() => router.push("/signup")}
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 btn-animated"
            >
              Sign Up
            </Button>
          </div>

          <main className="flex flex-1 flex-col items-center justify-center text-center px-4 z-10">
            {/* Logo above title */}
            <img
              src="/one-logo.png"
              alt="ONE Albania Logo"
              className={`w-24 h-24 mb-4 drop-shadow-xl animate-fadein mx-auto`}
              style={{
                animationDelay: "0.05s",
                animationFillMode: "both",
              }}
            />
            <h1
              className={`text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8e24aa] to-[#ffb300] mb-6 drop-shadow-lg animate-fadein`}
            >
              InsightONE
            </h1>
            <h2
              className="text-xl md:text-2xl text-white mb-8 font-medium animate-fadein"
              style={{ animationDelay: "0.1s", animationFillMode: "both" }}
            >
              The all-in-one self-care platform for ONE Albania business
              customers
            </h2>

            {/* Promo/Marketing Section */}
            <section
              className="w-full max-w-2xl mx-auto mb-10 rounded-2xl bg-gradient-to-r from-[#8e24aa]/80 to-[#ffb300]/80 p-6 shadow-xl border-2 border-white/10 animate-fadein"
              style={{ animationDelay: "0.15s", animationFillMode: "both" }}
            >
              <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-2 drop-shadow-lg">
                🚀 Special Offers for Summer 2025!
              </h3>
              <p className="text-white/90 mb-4 text-lg">
                Unlock exclusive deals and maximize your business savings with
                InsightONE.
              </p>
              <ul className="list-disc list-inside text-left text-white/90 space-y-2">
                <li>
                  <span className="font-bold text-[#ffb300]">
                    2 months FREE
                  </span>{" "}
                  for all new business signups!
                </li>
                <li>
                  <span className="font-bold text-[#8e24aa]">
                    Refer a friend
                  </span>{" "}
                  and earn up to{" "}
                  <span className="font-bold text-[#ffb300]">€100</span> in
                  rewards.
                </li>
                <li>
                  <span className="font-bold text-[#ffb300]">30% off</span> on
                  all plans for the Summer 2025 season.
                </li>
              </ul>
            </section>
            <div
              className="max-w-2xl text-white text-lg mb-12 animate-fadein"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            >
              <ul className="list-disc list-inside text-left mx-auto">
                <li>
                  Monitor and manage all your company's mobile lines in one
                  place
                </li>
                <li>
                  Set usage limits, assign plans, and track real-time and
                  historical usage
                </li>
                <li>Receive smart alerts and AI-powered recommendations</li>
                <li>Order new services, manage employees, and more</li>
              </ul>
            </div>
            <div
              className="flex gap-6 mt-4 animate-fadein"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              <Link href="/login">
                <button className="px-8 py-3 rounded-xl bg-[#8e24aa] text-white font-bold text-lg shadow-lg hover:bg-[#6d1b7b] transition btn-animated relative overflow-hidden group">
                  <span className="relative z-10">Get Started</span>
                  <span
                    className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-full"
                    style={{ pointerEvents: "none" }}
                  ></span>
                </button>
              </Link>
              <Link href="/signup">
                <button className="px-8 py-3 rounded-xl bg-white text-[#8e24aa] font-bold text-lg border border-[#8e24aa] shadow-lg hover:bg-purple-50 transition btn-animated relative overflow-hidden group">
                  <span className="relative z-10">Create Account</span>
                  <span
                    className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-[#8e24aa]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-x-full"
                    style={{ pointerEvents: "none" }}
                  ></span>
                </button>
              </Link>
            </div>
          </main>

          {/* Animated stats */}
          <section
            className="flex flex-wrap justify-center gap-8 mt-12 z-10 animate-fadein"
            style={{ animationDelay: "0.4s", animationFillMode: "both" }}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-3xl md:text-4xl font-extrabold text-white animate-pulse">
                  {stat.value.toLocaleString()}
                </span>
                <span className="text-[#8e24aa] text-sm font-medium mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </section>

          {/* Feature highlights */}
          <section
            className="max-w-4xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 z-10 animate-fadein"
            style={{ animationDelay: "0.5s", animationFillMode: "both" }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-4 bg-white/10 rounded-xl p-6 shadow-lg hover:scale-105 transition-transform text-white"
              >
                <div
                  className={
                    f.title === "Smart Alerts" ||
                    f.title === "Self-Service Operations"
                      ? "text-[#8e24aa]"
                      : "text-[#8e24aa]"
                  }
                >
                  {React.cloneElement(f.icon, {
                    className:
                      "w-8 h-8 " +
                      (f.title === "Smart Alerts" ||
                      f.title === "Self-Service Operations"
                        ? "text-[#8e24aa]"
                        : "text-[#8e24aa]"),
                  })}
                </div>
                <div>
                  <div className="font-bold text-white text-lg mb-1">
                    {f.title}
                  </div>
                  <div className="text-white/80 text-sm">{f.desc}</div>
                </div>
              </div>
            ))}
          </section>

          {/* Testimonials carousel */}
          <section
            className="max-w-6xl mx-auto mt-16 z-10 animate-fadein flex flex-col items-center"
            style={{ animationDelay: "0.6s", animationFillMode: "both" }}
          >
            <div
              className="bg-white/10 rounded-xl shadow-lg p-8 text-center relative overflow-hidden transition-all duration-500 max-w-6xl w-full mx-auto min-w-[500px]"
              style={{ minHeight: 120, height: containerHeight }}
            >
              {/* Render all testimonials for true cross-fade */}
              {testimonials.map((t, i) => {
                let opacity = 0;
                if (i === testimonialIdx && !fading) opacity = 1;
                if (i === prevTestimonialIdx && fading) opacity = 1;
                if (i === testimonialIdx && fading) opacity = 0;
                return (
                  <div
                    key={i}
                    ref={
                      i === testimonialIdx
                        ? testimonialRefs[1]
                        : i === prevTestimonialIdx
                          ? testimonialRefs[0]
                          : undefined
                    }
                    className={`absolute left-0 top-0 w-full transition-opacity duration-400 max-w-6xl w-full mx-auto min-w-[500px] break-words`}
                    style={{ opacity, pointerEvents: "none" }}
                  >
                    <div className="text-white text-lg italic mb-4">
                      "{t.quote}"
                    </div>
                    <div className="text-white font-bold">{t.name}</div>
                    <div className="text-white/70 text-sm">{t.company}</div>
                  </div>
                );
              })}
            </div>
            {/* Dots below the card */}
            <div className="flex justify-center gap-2 mt-4 relative z-30">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? "bg-indigo-600 scale-125" : "bg-indigo-300"}`}
                  onClick={() => handleTestimonialChange(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Trusted by logos */}
          <section
            className="flex flex-wrap justify-center gap-6 mt-12 z-10 animate-fadein"
            style={{ animationDelay: "0.7s", animationFillMode: "both" }}
          >
            <span className="text-white font-semibold mr-2">Trusted by:</span>
            {trustedBy.map((name) => (
              <span
                key={name}
                className="bg-white/10 text-white px-4 py-1 rounded-lg font-bold shadow-sm text-sm border border-white/30"
              >
                {name}
              </span>
            ))}
          </section>

          {/* Security/compliance badges */}
          <section
            className="flex flex-wrap justify-center gap-4 mt-8 z-10 animate-fadein"
            style={{ animationDelay: "0.8s", animationFillMode: "both" }}
          >
            {badges.map((b) => (
              <span
                key={b.label}
                className={`px-3 py-1 rounded-full font-semibold text-xs shadow ${b.color}`}
              >
                {b.label}
              </span>
            ))}
          </section>

          {/* What's New/Changelog badge */}
          <div
            className="fixed left-4 bottom-4 z-50 animate-fadein"
            style={{ animationDelay: "1s", animationFillMode: "both" }}
          >
            <button
              className="bg-[#8e24aa] text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs hover:bg-[#6d1b7b] transition btn-animated"
              onClick={() => setShowTabModal('whatsnew')}
            >
              What's New
            </button>
          </div>

          {/* AI Assistant teaser */}
          <div
            className="fixed bottom-4 right-4 z-50 animate-fadein"
            style={{ animationDelay: "1.1s", animationFillMode: "both" }}
          >
            <button
              className="flex items-center gap-2 bg-[#8e24aa] text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs hover:scale-105 transition btn-animated"
              onClick={() => setShowTabModal('ai')}
            >
              <svg
                className="w-5 h-5 animate-bounce"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
                <path
                  d="M8 15s1.5 2 4 2 4-2 4-2"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <circle cx="9" cy="10" r="1" fill="#fff" />
                <circle cx="15" cy="10" r="1" fill="#fff" />
              </svg>
              AI Assistant
            </button>
          </div>

          {/* Tab Modal for What's New and AI Assistant */}
          {showTabModal && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowTabModal(null)}>
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-fadein relative" onClick={e => e.stopPropagation()}>
                <button
                  className="absolute top-2 right-2 text-[#8e24aa] hover:text-[#6d1b7b] text-xl font-bold"
                  onClick={() => setShowTabModal(null)}
                >
                  &times;
                </button>
                <div className="flex gap-4 mb-4">
                  <button
                    className={`px-4 py-2 rounded-full font-bold text-sm transition ${showTabModal === 'whatsnew' ? 'bg-[#8e24aa] text-white' : 'bg-gray-100 text-[#8e24aa]'}`}
                    onClick={() => setShowTabModal('whatsnew')}
                  >
                    What's New
                  </button>
                  <button
                    className={`px-4 py-2 rounded-full font-bold text-sm transition ${showTabModal === 'ai' ? 'bg-[#8e24aa] text-white' : 'bg-gray-100 text-[#8e24aa]'}`}
                    onClick={() => setShowTabModal('ai')}
                  >
                    AI Assistant
                  </button>
                </div>
                {showTabModal === 'whatsnew' && (
                  <div>
                    <h3 className="text-xl font-bold text-[#8e24aa] mb-2">What's New</h3>
                    <ul className="list-disc list-inside text-[#8e24aa]/90 text-base space-y-2">
                      <li>AI-powered recommendations for all users</li>
                      <li>New dashboard widgets for analytics</li>
                      <li>Summer 2025 promo: 2 months free for new signups</li>
                      <li>30% off on all plans for a limited time</li>
                    </ul>
                  </div>
                )}
                {showTabModal === 'ai' && (
                  <div>
                    <h3 className="text-xl font-bold text-[#8e24aa] mb-2">AI Assistant</h3>
                    <p className="mb-2 text-[#8e24aa]/90">Hi! I am your AI assistant. How can I help you today?</p>
                    <ul className="list-disc list-inside text-[#8e24aa]/90 text-base space-y-2">
                      <li>Ask about your usage, plans, or invoices</li>
                      <li>Get recommendations for cost savings</li>
                      <li>Learn how to use the dashboard features</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <footer className="text-center text-indigo-300 py-6 text-sm z-10">
            &copy; {new Date().getFullYear()} ONE Albania. All rights reserved.
          </footer>
        </>
      )}

      {/* Splash screen */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-700 overflow-y-auto ${splashFade ? "opacity-0" : "opacity-100"}`}
        >
          <img
            src="/one-logo.png"
            alt="ONE Albania Logo"
            className="w-40 h-40 block mx-auto animate-popIn splash-fadein drop-shadow-2xl relative z-10"
          />
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.92) translateY(30px); }
          80% { opacity: 1; transform: scale(1.04) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .splash-fadein {
          animation: splashFadeIn 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-2deg) scale(1); }
          50% { transform: rotate(2deg) scale(1.04); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .floating-svg {
          position: absolute;
          z-index: 0;
        }
        .btn-animated {
          transition: all 0.3s ease;
        }
        .btn-animated:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fadeOut {
          animation: fadeOut 0.4s forwards;
        }
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animated-gradient-bg {
          background: linear-gradient(120deg, #3a2fa4, #8e24aa, #5f3dc4, #3a2fa4);
          background-size: 200% 200%;
          animation: gradientMove 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
