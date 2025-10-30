import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children?: ReactNode
  showRadialGradient?: boolean
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col h-full w-full items-center justify-center dark:bg-zinc-900 bg-background",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -inset-[10px] opacity-50 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(100deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.03) 7%, transparent 10%, transparent 12%, rgba(255,255,255,0.03) 16%),
              repeating-linear-gradient(100deg, #3b82f6 10%, #6366f1 15%, #60a5fa 20%, #a78bfa 25%, #3b82f6 30%)
            `,
            backgroundSize: '300% 200%',
            backgroundPosition: '50% 50%',
            filter: 'blur(10px)',
            animation: 'aurora 60s linear infinite',
            willChange: 'transform',
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(100deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.03) 7%, transparent 10%, transparent 12%, rgba(255,255,255,0.03) 16%),
                repeating-linear-gradient(100deg, #3b82f6 10%, #6366f1 15%, #60a5fa 20%, #a78bfa 25%, #3b82f6 30%)
              `,
              backgroundSize: '200% 100%',
              backgroundAttachment: 'fixed',
              animation: 'aurora 60s linear infinite',
              mixBlendMode: 'difference',
            }}
          />
        </div>
      </div>
      {children}
    </div>
  )
}

