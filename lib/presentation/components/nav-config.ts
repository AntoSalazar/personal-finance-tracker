import { Home, Wallet, ArrowLeftRight, Bitcoin, Settings, LayoutDashboard, BarChart3, Users, Repeat } from "lucide-react"

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Wallet,
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    title: "Debts",
    href: "/debts",
    icon: Users,
  },
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: Repeat,
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: BarChart3,
  },
  {
    title: "Crypto",
    href: "/crypto",
    icon: Bitcoin,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]
