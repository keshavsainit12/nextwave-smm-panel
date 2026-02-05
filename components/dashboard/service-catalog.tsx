"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, PackageOpen } from "lucide-react"
import { ServiceCard } from "./service-card"

export function ServiceCatalog({ services, categories }: { services: any[]; categories: any[] }) {
  const [search, setSearch] = useState("")

  const filteredServices = services.filter((service) => service.name.toLowerCase().includes(search.toLowerCase()))

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <PackageOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Services Available</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Services haven't been synced yet. Please contact admin to sync services from API providers.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services by name..."
          className="pl-9 h-11"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <TabsList className="w-full justify-start flex-nowrap bg-muted/50 p-1 h-auto inline-flex min-w-full">
            <TabsTrigger value="all" className="flex items-center gap-2 whitespace-nowrap">
              <span>All Services ({services.length})</span>
            </TabsTrigger>
            {categories.map((cat) => {
              const count = services.filter((s) => s.category_id === cat.id).length
              return (
                <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2 whitespace-nowrap">
                  {cat.icon && (
                    <img
                      src={cat.icon || "/placeholder.svg"}
                      alt={cat.name}
                      className="h-5 w-5 rounded object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                  <span>
                    {cat.name} ({count})
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          {filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No services found matching "{search}"</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </TabsContent>

        {categories.map((cat) => {
          const categoryServices = filteredServices.filter((s) => s.category_id === cat.id)
          return (
            <TabsContent key={cat.id} value={cat.id} className="mt-6">
              {categoryServices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No services available in this category</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryServices.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
