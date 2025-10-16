import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  User,
  FileText,
  Settings
} from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  type: "select" | "date" | "text";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface SearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  activeFilters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilter({
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  placeholder = "Cari...",
  className = ""
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = Object.values(activeFilters).filter(value => 
    value !== "" && value !== null && value !== undefined
  ).length;

  const renderFilter = (filter: FilterOption) => {
    switch (filter.type) {
      case "select":
        return (
          <Select
            key={filter.key}
            value={activeFilters[filter.key] || ""}
            onValueChange={(value) => onFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={filter.placeholder || `Pilih ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "date":
        return (
          <Input
            key={filter.key}
            type="date"
            value={activeFilters[filter.key] || ""}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-48"
          />
        );
      
      case "text":
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || filter.label}
            value={activeFilters[filter.key] || ""}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="w-48"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {filters.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filters.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-sm">Filter Options</h4>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {filter.label}
                  </label>
                  {renderFilter(filter)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters)
            .filter(([_, value]) => value !== "" && value !== null && value !== undefined)
            .map(([key, value]) => {
              const filter = filters.find(f => f.key === key);
              const displayValue = filter?.type === "select" 
                ? filter.options?.find(opt => opt.value === value)?.label || value
                : value;
              
              return (
                <Badge 
                  key={key} 
                  variant="secondary" 
                  className="flex items-center space-x-1"
                >
                  <span className="text-xs">{filter?.label}: {displayValue}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => onFilterChange(key, "")}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              );
            })}
        </div>
      )}
    </div>
  );
}

// Predefined filter configurations
export const PROPOSAL_FILTERS: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "draft", label: "Draft" },
      { value: "submitted", label: "Submitted" },
      { value: "in_review", label: "In Review" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
      { value: "revision", label: "Revision" }
    ]
  },
  {
    key: "scheme",
    label: "Skema",
    type: "select",
    options: [
      { value: "fundamental", label: "Penelitian Fundamental" },
      { value: "terapan", label: "Penelitian Terapan" },
      { value: "kolaboratif", label: "Penelitian Kolaboratif" },
      { value: "mahasiswa", label: "Penelitian Mahasiswa" }
    ]
  },
  {
    key: "fakultas",
    label: "Fakultas",
    type: "select",
    options: [
      { value: "teknik", label: "Fakultas Teknik" },
      { value: "tarbiyah", label: "Fakultas Tarbiyah" },
      { value: "syariah", label: "Fakultas Syariah" },
      { value: "ushuluddin", label: "Fakultas Ushuluddin" }
    ]
  },
  {
    key: "tanggal_mulai",
    label: "Tanggal Mulai",
    type: "date"
  },
  {
    key: "tanggal_selesai", 
    label: "Tanggal Selesai",
    type: "date"
  }
];

export const USER_FILTERS: FilterOption[] = [
  {
    key: "role",
    label: "Role",
    type: "select",
    options: [
      { value: "dosen", label: "Dosen" },
      { value: "mahasiswa", label: "Mahasiswa" },
      { value: "reviewer", label: "Reviewer" },
      { value: "admin", label: "Admin" }
    ]
  },
  {
    key: "fakultas",
    label: "Fakultas",
    type: "select",
    options: [
      { value: "teknik", label: "Fakultas Teknik" },
      { value: "tarbiyah", label: "Fakultas Tarbiyah" },
      { value: "syariah", label: "Fakultas Syariah" },
      { value: "ushuluddin", label: "Fakultas Ushuluddin" }
    ]
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Aktif" },
      { value: "inactive", label: "Tidak Aktif" }
    ]
  }
];