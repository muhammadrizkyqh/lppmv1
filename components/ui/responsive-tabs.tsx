'use client'

import * as React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'

interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface ResponsiveTabsProps {
  tabs: TabItem[]
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function ResponsiveTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}: ResponsiveTabsProps) {
  const isMobile = useIsMobile()
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue)

  const handleValueChange = (newValue: string) => {
    setSelectedTab(newValue)
    onValueChange?.(newValue)
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={handleValueChange}
      defaultValue={defaultValue}
      className={className}
    >
      {/* Mobile: Dropdown Select */}
      {isMobile ? (
        <div className="mb-4">
          <Select value={selectedTab} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {tabs.find((t) => t.value === selectedTab)?.icon}
                  <span>{tabs.find((t) => t.value === selectedTab)?.label}</span>
                  {tabs.find((t) => t.value === selectedTab)?.count !== undefined && (
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {tabs.find((t) => t.value === selectedTab)?.count}
                    </span>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tabs.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  <div className="flex items-center gap-2">
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        // Desktop: Normal Tabs
        <TabsList className="w-full justify-start mb-4 h-auto flex-wrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      )}

      {children}
    </Tabs>
  )
}
