import { Checkbox } from "@/components/ui/checkbox";
import { TableHead, TableRow, TableHeader } from "@/components/ui/table";

interface TranscriptionTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  hasSelections: boolean;
}

export function TranscriptionTableHeader({ onSelectAll, allSelected, hasSelections }: TranscriptionTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox 
            checked={allSelected}
            indeterminate={hasSelections && !allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
          />
        </TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Created</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}