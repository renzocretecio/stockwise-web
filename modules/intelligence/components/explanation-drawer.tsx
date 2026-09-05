"use client";

import { X } from "lucide-react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { IntelligenceMessageView } from "./message";
import type { IntelligenceResponse } from "../types";

export function ExplanationDrawer({
  open,
  onOpenChange,
  title,
  description,
  response,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  response: IntelligenceResponse | undefined;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className="h-full max-w-xl rounded-none m-0">
        <DrawerHeader className="border-b pb-4 text-left">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription className="mt-1">
                {description}
              </DrawerDescription>
            </div>
            <DrawerClose
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center hover:bg-muted"
              aria-label="Close explanation"
            >
              <X className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {response ? <IntelligenceMessageView response={response} /> : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
