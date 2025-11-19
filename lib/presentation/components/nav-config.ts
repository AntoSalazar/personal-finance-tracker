import { Home, Wallet, ArrowLeftRight, Bitcoin, Settings, LayoutDashboard } from "lucide-react"

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
