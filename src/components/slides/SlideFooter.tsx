interface SlideFooterProps {
  pageNumber: number;
}

export function SlideFooter({ pageNumber }: SlideFooterProps) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
      <p className="text-[10px] text-muted-foreground/70 max-w-md">
        Strictly Private & Confidential. This document is for information purposes only and should not be construed as investment advice.
      </p>
      <span className="text-xs text-muted-foreground font-medium">
        {pageNumber}
      </span>
    </div>
  );
}
