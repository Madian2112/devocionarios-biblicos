import type React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

interface GradientCardProps extends React.ComponentProps<typeof Card> {
  gradient?: "blue" | "purple" | "green" | "orange"
}

export function GradientCard({ className, gradient = "blue", children, ...props }: GradientCardProps) {
  const gradients = {
    blue: "bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20",
    purple: "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20",
    green: "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20",
    orange: "bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20",
  }

  return (
    <Card
      className={cn(
        "backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/20",
        gradients[gradient],
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
