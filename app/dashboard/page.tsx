"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { IdeasTable } from "@/components/ideas-table"
import { StatsCards } from "@/components/stats-cards"
import { Tables } from "../ideas-portal-data-types"


export default function DashboardPage() {
  const [user, setUser] = useState<Tables<"users">| null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const base_url = process.env.BASE_URL!

 

  useEffect(() => {
     console.log("Fetching user data step 1",user);
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
       console.info("Fetching user data...",user);
       console.info("Base URL...",user);
      const response = await fetch("http://localhost:3000/api/user", {
        credentials: "include", // ✅ tells browser to send cookies
      });
      if (response.ok) {
        const userData = await response.json()
        
        setUser(userData)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  // const fetchUser = async () => {
  //   try {
  //     const cookieStore = cookies();
  //     const userId = cookieStore.get('user_id')?.value;
  //     const userData = await getUserByZohoId(userId?.toString() || ""  );
  //     return Response.json({ userId });

  //   } catch (error) {
  //     console.error("Error fetching user:", error)
  //     router.push("/")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout userRole={user.role} userName={user.name}>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Welcome back, <span className="font-semibold">{user.name}</span>
          </p>
        </div>

        <StatsCards userRole={user.role} userId={user.id}/>
        <IdeasTable userRole={user.role} />
      </div>
    </DashboardLayout>
  )
}
