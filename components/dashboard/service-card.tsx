"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderDialog } from "./order-dialog"
import { useState } from "react"
import { ShoppingCart, RefreshCw, CheckCircle } from "lucide-react"

export function ServiceCard({ service }: { service: any }) {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)

  const displayPrice = Number(service.price || service.base_price || 0)

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {service.icon && (
                  <img
                    src={service.icon || "/placeholder.svg"}
                    alt={service.name}
                    className="h-10 w-10 rounded-lg object-contain bg-muted p-1"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                )}
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{service.name}</CardTitle>
                  <CardDescription className="mt-0.5">{service.service_categories?.name || "Uncategorized"}</CardDescription>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {(service.has_refill || service.refill) && (
                <Badge variant="secondary" className="gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Refill
                </Badge>
              )}
              {(service.can_cancel || service.cancel) && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Cancelable
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-primary">${displayPrice.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">per 1000</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">Min Order</div>
              <div className="font-semibold">{(service.min_quantity || 1).toLocaleString()}</div>
            </div>
            <div className="rounded-md bg-muted p-2">
              <div className="text-xs text-muted-foreground">Max Order</div>
              <div className="font-semibold">{(service.max_quantity || 10000).toLocaleString()}</div>
            </div>
          </div>

          {service.description && <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>}

          <Button className="w-full gap-2" onClick={() => setOrderDialogOpen(true)}>
            <ShoppingCart className="h-4 w-4" />
            Order Now
          </Button>
        </CardContent>
      </Card>

      <OrderDialog service={service} open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} />
    </>
  )
}
