"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, style, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex w-full items-center justify-between px-2 py-1 text-[14px] outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      height: "28px",
      border: "1px solid var(--notion-border)",
      borderRadius: "3px",
      background: "var(--notion-bg)",
      color: "var(--notion-text)",
      ...style,
    }}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown style={{ width: "14px", height: "14px", opacity: 0.5, flexShrink: 0 }} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden bg-white animate-in fade-in-0 zoom-in-95",
        position === "popper" && "translate-y-1",
        className
      )}
      position={position}
      style={{
        borderRadius: "4px",
        border: "1px solid var(--notion-border)",
        boxShadow: "0 4px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
      }}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 font-semibold", className)}
    style={{ fontSize: "11px", color: "var(--notion-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center py-1 pl-6 pr-2 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    style={{
      borderRadius: "3px",
      fontSize: "14px",
      color: "var(--notion-text)",
      height: "28px",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.background = "var(--notion-bg-hover)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.background = "transparent";
    }}
    {...props}
  >
    <span className="absolute left-1.5 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check style={{ width: "12px", height: "12px" }} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px", className)}
    style={{ background: "var(--notion-border-light)" }}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
