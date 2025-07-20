"use client";

import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useZoom } from "./zoom-provider";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function ZoomControls() {
  const { increaseZoom, decreaseZoom, resetZoom, zoom } = useZoom();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={increaseZoom}
              className="bg-background/80 backdrop-blur-sm"
              aria-label="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Aumentar zoom</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={decreaseZoom}
              className="bg-background/80 backdrop-blur-sm"
              aria-label="Disminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Disminuir zoom</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={resetZoom}
              className="bg-background/80 backdrop-blur-sm"
              aria-label="Restablecer zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Restablecer ({zoom}%)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 