# Responsive Tabs Component

## Problem
Tabs di mobile sangat tidak responsif:
- Text panjang terpotong
- Terlalu banyak tabs overflow horizontal
- UX buruk dengan scroll horizontal

## Solution
`ResponsiveTabs` component yang otomatis switch antara:
- **Mobile (≤768px)**: Dropdown Select
- **Desktop (>768px)**: Normal Tabs

## Usage

### Basic Example
```tsx
import { ResponsiveTabs } from '@/components/ui/responsive-tabs'
import { TabsContent } from '@/components/ui/tabs'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

<ResponsiveTabs
  defaultValue="complete"
  tabs={[
    {
      value: 'complete',
      label: 'Review Lengkap',
      icon: <CheckCircle2 className="h-4 w-4" />,
      count: 10,
    },
    {
      value: 'incomplete',
      label: 'Menunggu',
      icon: <Clock className="h-4 w-4" />,
      count: 5,
    },
    {
      value: 'all',
      label: 'Semua',
      icon: <AlertCircle className="h-4 w-4" />,
      count: 15,
    },
  ]}
>
  <TabsContent value="complete">
    {/* Your content */}
  </TabsContent>
  
  <TabsContent value="incomplete">
    {/* Your content */}
  </TabsContent>
  
  <TabsContent value="all">
    {/* Your content */}
  </TabsContent>
</ResponsiveTabs>
```

### With State Control
```tsx
const [activeTab, setActiveTab] = useState('complete')

<ResponsiveTabs
  value={activeTab}
  onValueChange={setActiveTab}
  tabs={[...]}
>
  {/* TabsContent */}
</ResponsiveTabs>
```

### Without Icons and Counts
```tsx
<ResponsiveTabs
  defaultValue="all"
  tabs={[
    { value: 'all', label: 'Semua' },
    { value: 'active', label: 'Aktif' },
    { value: 'archived', label: 'Arsip' },
  ]}
>
  {/* TabsContent */}
</ResponsiveTabs>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tabs` | `TabItem[]` | ✅ | Array of tab items |
| `defaultValue` | `string` | ✅ | Default active tab value |
| `value` | `string` | ❌ | Controlled tab value |
| `onValueChange` | `(value: string) => void` | ❌ | Callback when tab changes |
| `children` | `React.ReactNode` | ✅ | TabsContent components |
| `className` | `string` | ❌ | Additional CSS classes |

### TabItem Interface
```typescript
interface TabItem {
  value: string      // Unique identifier
  label: string      // Display text
  icon?: React.ReactNode  // Optional icon
  count?: number     // Optional badge count
}
```

## Migration Guide

### Before (Old Tabs)
```tsx
<Tabs defaultValue="complete">
  <TabsList>
    <TabsTrigger value="complete">
      <CheckCircle2 className="h-4 w-4" />
      Review Lengkap (10)
    </TabsTrigger>
    <TabsTrigger value="incomplete">
      <Clock className="h-4 w-4" />
      Menunggu (5)
    </TabsTrigger>
  </TabsList>
  
  <TabsContent value="complete">...</TabsContent>
  <TabsContent value="incomplete">...</TabsContent>
</Tabs>
```

### After (Responsive Tabs)
```tsx
<ResponsiveTabs
  defaultValue="complete"
  tabs={[
    {
      value: 'complete',
      label: 'Review Lengkap',
      icon: <CheckCircle2 className="h-4 w-4" />,
      count: 10,
    },
    {
      value: 'incomplete',
      label: 'Menunggu',
      icon: <Clock className="h-4 w-4" />,
      count: 5,
    },
  ]}
>
  <TabsContent value="complete">...</TabsContent>
  <TabsContent value="incomplete">...</TabsContent>
</ResponsiveTabs>
```

## Benefits
✅ Mobile-friendly automatically
✅ No horizontal scroll
✅ Consistent API dengan Tabs standard
✅ Support icons dan counts
✅ Controlled & uncontrolled mode

## Where to Use
Ganti semua halaman yang pakai tabs:
- ✅ `/admin/reviews` - Sudah updated
- ⏳ `/admin/proposals`
- ⏳ `/dosen/proposals`
- ⏳ `/dosen/reports`
- ⏳ `/dashboard/notifications`
- ⏳ Dan halaman lain dengan tabs
