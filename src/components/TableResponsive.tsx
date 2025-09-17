import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableResponsiveProps {
  children: React.ReactNode;
  className?: string;
}

export const TableResponsive: React.FC<TableResponsiveProps> = ({ children, className = "" }) => {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full">
        <Table className={className}>
          {children}
        </Table>
      </div>
    </div>
  );
};

interface MobileCardProps {
  data: Record<string, any>;
  titleField: string;
  subtitleField?: string;
  badgeField?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  actions?: React.ReactNode;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  data,
  titleField,
  subtitleField,
  badgeField,
  badgeVariant = "default",
  actions,
  className = ""
}) => {
  return (
    <Card className={`mb-3 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{data[titleField]}</h3>
            {subtitleField && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{data[subtitleField]}</p>
            )}
            {badgeField && data[badgeField] && (
              <Badge variant={badgeVariant} className="mt-2 text-xs">
                {data[badgeField]}
              </Badge>
            )}
          </div>
          {actions && (
            <div className="flex-shrink-0 ml-2">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface ResponsiveTableProps {
  headers: Array<{
    key: string;
    label: string;
    className?: string;
    mobile?: boolean; // Afficher sur mobile ou non
  }>;
  data: Array<Record<string, any>>;
  renderCell?: (key: string, value: any, row: Record<string, any>) => React.ReactNode;
  mobileCard?: {
    titleField: string;
    subtitleField?: string;
    badgeField?: string;
    badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  };
  actions?: (row: Record<string, any>) => React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  data,
  renderCell,
  mobileCard,
  actions,
  className = ""
}) => {
  const visibleHeaders = headers.filter(h => h.mobile !== false);
  const mobileHeaders = headers.filter(h => h.mobile === true);

  return (
    <>
      {/* Version Desktop */}
      <div className="hidden md:block">
        <TableResponsive className={className}>
          <TableHeader>
            <TableRow>
              {visibleHeaders.map((header) => (
                <TableHead key={header.key} className={header.className}>
                  {header.label}
                </TableHead>
              ))}
              {actions && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {visibleHeaders.map((header) => (
                  <TableCell key={header.key} className={header.className}>
                    {renderCell ? renderCell(header.key, row[header.key], row) : row[header.key]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </TableResponsive>
      </div>

      {/* Version Mobile */}
      <div className="md:hidden">
        {data.map((row, index) => (
          <MobileCard
            key={index}
            data={row}
            titleField={mobileCard?.titleField || visibleHeaders[0]?.key || 'id'}
            subtitleField={mobileCard?.subtitleField}
            badgeField={mobileCard?.badgeField}
            badgeVariant={mobileCard?.badgeVariant}
            actions={actions ? actions(row) : undefined}
          />
        ))}
      </div>
    </>
  );
};
