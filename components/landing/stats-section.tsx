import { Card, CardContent } from "@/components/ui/card"

export function StatsSection() {
  const stats = [
    { value: "$550,000", label: "Total Sales", change: "+10%" },
    { value: "2500+", label: "Active Users", change: "+15%" },
    { value: "500K+", label: "Orders Completed", change: "+8%" },
  ]

  return (
    <section className="container py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
                <div className="mt-1 text-xs text-green-600">{stat.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
