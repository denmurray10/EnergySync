
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const value = props.value?.[0] ?? 0;
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const percentage = ((value - min) / (max - min)) * 100;
  
  const isNegative = value < 0;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div className="absolute h-full bg-gradient-to-r from-red-200 via-gray-200 to-green-200" style={{ left: '0%', right: '0%' }}/>
        <SliderPrimitive.Range 
          className={cn(
            "absolute h-full",
            isNegative ? 'bg-red-500' : 'bg-green-500'
          )}
          style={isNegative ? { right: '50%', left: `${percentage}%` } : { left: '50%', right: `${100 - percentage}%` }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
