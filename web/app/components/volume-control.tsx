import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";

import { cn } from "@/lib/cn";

import { Button } from "./button";

export const VolumeControlViewport = forwardRef<
	React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
	React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
	<div className="absolute left-0 top-full flex justify-center">
		<NavigationMenuPrimitive.Viewport
			className={cn(
				"origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",

				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
				"md:w-[var(--radix-navigation-menu-viewport-width)]",

				className,
			)}
			ref={ref}
			{...props}
		/>
	</div>
));
VolumeControlViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

export const VolumeControl = forwardRef<
	ElementRef<typeof NavigationMenuPrimitive.Root>,
	ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
	<NavigationMenuPrimitive.Root
		aria-label="Volume control"
		asChild
		className={cn("relative z-10 flex max-w-max flex-1 items-center justify-center", className)}
		ref={ref}
		{...props}
	>
		<div>
			<NavigationMenuPrimitive.List className="group list-none">
				<NavigationMenuPrimitive.Item>{children}</NavigationMenuPrimitive.Item>
			</NavigationMenuPrimitive.List>

			<VolumeControlViewport />
		</div>
	</NavigationMenuPrimitive.Root>
));
VolumeControl.displayName = NavigationMenuPrimitive.Root.displayName;

export const VolumeControlTrigger = forwardRef<
	ElementRef<typeof NavigationMenuPrimitive.Trigger>,
	ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ children, className, ...props }, ref) => (
	<NavigationMenuPrimitive.Trigger
		aria-label="Volume"
		asChild
		className={className}
		ref={ref}
		{...props}
	>
		<Button size="icon" variant="ghost">
			{children}
		</Button>
	</NavigationMenuPrimitive.Trigger>
));
VolumeControlTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

export const VolumeControlContent = forwardRef<
	ElementRef<typeof NavigationMenuPrimitive.Content>,
	ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
	<NavigationMenuPrimitive.Content
		className={cn(
			"left-0 top-0 w-full",

			"data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
			"md:absolute md:w-auto",

			className,
		)}
		ref={ref}
		{...props}
	/>
));
VolumeControlContent.displayName = NavigationMenuPrimitive.Content.displayName;
