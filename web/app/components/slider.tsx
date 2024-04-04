import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/cn";

export const Slider = forwardRef<
	ElementRef<typeof SliderPrimitive.Root>,
	ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
	<SliderPrimitive.Root
		ref={ref}
		className={cn(
			"relative flex w-full touch-none select-none items-center",

			className,
		)}
		{...props}
	>
		<SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted">
			<SliderPrimitive.Range
				className={cn(
					"absolute h-full bg-primary",

					"data-[disabled]:bg-background/20",
				)}
			/>
		</SliderPrimitive.Track>

		<SliderPrimitive.Thumb
			className={cn(
				"block h-5 w-5 rounded-full bg-primary ring-offset-background transition-colors",

				"data-[disabled]:pointer-events-none data-[disabled]:bg-muted",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
			)}
		/>
	</SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
