import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => (
		<input
			type={type}
			className={cn(
				"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",

				"disabled:cursor-not-allowed disabled:opacity-50",
				"file:border-0 file:bg-transparent file:text-sm file:font-medium",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"placeholder:text-muted-foreground",

				className,
			)}
			ref={ref}
			{...props}
		/>
	),
);
Input.displayName = "Input";
