"use client";

import { FixedSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { MenuItem } from "./menu-item";

interface VirtualizedMenuGridProps {
  items: any[];
}

export function VirtualizedMenuGrid({ items }: VirtualizedMenuGridProps) {
  const COLUMN_COUNT = 3;
  const ROW_HEIGHT = 130; // Base height of each item
  const GAP = 24; // Gap between items in pixels

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    if (index >= items.length) return null;

    // Add gap to the cell style
    const cellStyle = {
      ...style,
      padding: GAP / 2,
    };

    return (
      <div style={cellStyle}>
        <MenuItem item={items[index]} />
      </div>
    );
  };

  return (
    <div
      style={{
        height: "calc(100vh - 300px)",
        marginLeft: "-12px",
        marginRight: "-12px",
      }}
    >
      <AutoSizer>
        {({ height, width }) => {
          // Calculate the available width after accounting for gaps
          const availableWidth = width - GAP * COLUMN_COUNT;
          const columnWidth = availableWidth / COLUMN_COUNT;

          return (
            <FixedSizeGrid
              columnCount={COLUMN_COUNT}
              columnWidth={columnWidth + GAP}
              height={height}
              rowCount={Math.ceil(items.length / COLUMN_COUNT)}
              rowHeight={ROW_HEIGHT + GAP}
              width={width}
            >
              {Cell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
}
