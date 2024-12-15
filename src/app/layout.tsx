"use client";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import { useRouter,usePathname } from "next/navigation";
import Loader from "@/components/common/Loader";
import {postAutoLogin} from "@/api/index";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("accessToken");
      //console.log("token", token);
      if (token) {
        try {
          const res = await postAutoLogin(token);
          //console.log("res", res);
          if (res.statusCode === 200) {
            if (pathname === "/auth/signin" || pathname === "/auth/signup") {
              router.push("/");
            } else {
              setLoading(false);
            }
          } else {
            if (pathname !== "/auth/signin" && pathname !== "/auth/signup") {
              router.push("/auth/signin");
            }
          }
        } catch (error) {
          if (pathname !== "/auth/signin" && pathname !== "/auth/signup") {
            router.push("/auth/signin");
          }
        } finally {
          setLoading(false);
        }
      } else {
        if (pathname !== "/auth/signin" && pathname !== "/auth/signup") {
          router.push("/auth/signin");
        }
        setLoading(false);
      }
    };

    checkLogin();
  }, [router]);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {loading ? <Loader /> : children}
      </body>
    </html>
  );
}
