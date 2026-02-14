"use client"

import { useState } from "react"
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DiffViewerProps {
    beforeImage: string
    afterImage: string
    diffImage?: string // URL to the diff image (red overlay)
    diffPercentage?: number
    className?: string
}

export function DiffViewer({
    beforeImage,
    afterImage,
    diffImage,
    diffPercentage,
    className
}: DiffViewerProps) {
    const [showDiffLayer, setShowDiffLayer] = useState(false)
    const [position, setPosition] = useState(50)

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Visual Regression Test</h3>
                    {diffPercentage !== undefined && (
                        <Badge variant={diffPercentage > 5 ? "destructive" : "secondary"}>
                            {diffPercentage}% Change
                        </Badge>
                    )}
                </div>

                {diffImage && (
                    <Button
                        variant={showDiffLayer ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowDiffLayer(!showDiffLayer)}
                        className="gap-2"
                    >
                        {showDiffLayer ? <Eye className="h-4 w-4" /> : <Layers className="h-4 w-4" />}
                        {showDiffLayer ? "View Normal" : "X-Ray Mode"}
                    </Button>
                )}
            </div>

            <div className="relative rounded-lg overflow-hidden border shadow-sm aspect-video bg-gray-100 dark:bg-gray-800">
                {showDiffLayer && diffImage ? (
                    // X-Ray Mode: Show the diff image directly
                    <div className="w-full h-full relative">
                        <img
                            src={diffImage}
                            alt="Visual Difference"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
                            Magenta pixels indicate changes
                        </div>
                    </div>
                ) : (
                    // Slider Mode: Before vs After
                    <ReactCompareSlider
                        itemOne={<ReactCompareSliderImage src={beforeImage} alt="Before" />}
                        itemTwo={<ReactCompareSliderImage src={afterImage} alt="After" />}
                        position={position}
                        onPositionChange={setPosition}
                        className="w-full h-full"
                        style={{ height: "100%" }}
                    />
                )}

                {/* Labels (only visible in slider mode) */}
                {!showDiffLayer && (
                    <>
                        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm pointer-events-none">
                            Before (Old)
                        </div>
                        <div className="absolute top-4 right-4 bg-blue-600/70 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm pointer-events-none">
                            After (New)
                        </div>
                    </>
                )}
            </div>

            <p className="text-sm text-muted-foreground text-center">
                {showDiffLayer
                    ? "Viewing difference layer. Differences are highlighted."
                    : "Drag the slider to compare the previous and current versions."}
            </p>
        </div>
    )
}
