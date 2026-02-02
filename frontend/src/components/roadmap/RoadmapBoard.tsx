"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RoadmapTask, generateRoadmap } from "@/services/priorityMatrix"
import { getFixGuide, FixGuide } from "@/services/fixGuide"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Rocket, Calendar, Archive, CheckCircle2, Shield, Search, Zap, Leaf, Info, Wrench, X, Copy, ExternalLink, ChevronRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import confetti from "canvas-confetti"

interface RoadmapBoardProps {
    errors: string[]
}

export function RoadmapBoard({ errors }: RoadmapBoardProps) {
    const [tasks, setTasks] = useState<RoadmapTask[]>([])
    const [progress, setProgress] = useState(0)
    const [selectedTask, setSelectedTask] = useState<RoadmapTask | null>(null)
    const [activeGuide, setActiveGuide] = useState<FixGuide | null>(null)
    const [isExpanded, setIsExpanded] = useState(true)

    // Initialize tasks from errors prop
    useEffect(() => {
        if (errors && errors.length > 0) {
            const initialTasks = generateRoadmap(errors)
            setTasks(initialTasks)
        }
    }, [errors])

    // Update progress
    useEffect(() => {
        if (tasks.length === 0) return
        const doneCount = tasks.filter(t => t.isDone).length
        const newProgress = Math.round((doneCount / tasks.length) * 100)
        setProgress(newProgress)

        if (newProgress === 100 && tasks.length > 0) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
        }
    }, [tasks])

    const toggleTask = (taskId: string) => {
        setTasks(current =>
            current.map(t =>
                t.id === taskId ? { ...t, isDone: !t.isDone } : t
            )
        )
    }

    const openFixGuide = (task: RoadmapTask) => {
        const guide = getFixGuide(task.label) || getFixGuide(task.originalError)
        setActiveGuide(guide)
        setSelectedTask(task)
    }

    const columns = [
        {
            id: "quick-wins",
            title: "Victoires Rapides",
            subtitle: "Fort Impact • Facile à corriger",
            icon: Rocket,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            id: "projects",
            title: "Projets de Fond",
            subtitle: "Fort Impact • Demande du temps",
            icon: Calendar,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            id: "backlog",
            title: "Backlog / Optimisations",
            subtitle: "Faible Impact • À faire plus tard",
            icon: Archive,
            color: "text-zinc-500",
            bg: "bg-zinc-500/10",
            border: "border-zinc-500/20"
        }
    ]

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case "Security": return <Shield className="w-3 h-3" />
            case "SEO": return <Search className="w-3 h-3" />
            case "Performance": return <Zap className="w-3 h-3" />
            case "GreenIT": return <Leaf className="w-3 h-3" />
            default: return <Info className="w-3 h-3" />
        }
    }

    if (errors.length === 0) {
        return (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Félicitations !</AlertTitle>
                <AlertDescription>
                    Aucune erreur critique détectée. Votre feuille de route est vide.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header / Progress - Always Visible */}
            <div className="space-y-4">
                <div
                    className="flex justify-between items-end cursor-pointer group"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-zinc-800 transition-transform duration-300 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Votre Feuille de Route Interactive</h2>
                            <p className="text-zinc-400 text-sm">Suivez ce plan pour optimiser votre site efficacement.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-violet-400">{progress}%</span>
                        <span className="text-zinc-500 text-sm ml-2">Résolu</span>
                    </div>
                </div>
                <Progress value={progress} className="h-3" />
            </div>

            {/* Kanban Board - Collapsible */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 pb-4">
                            {columns.map(col => {
                                const colTasks = tasks.filter(t => t.column === col.id)
                                const activeTasks = colTasks.filter(t => !t.isDone)
                                const doneTasks = colTasks.filter(t => t.isDone)

                                return (
                                    <div key={col.id} className={`rounded-xl border ${col.border} bg-black/40 flex flex-col h-full`}>
                                        {/* Column Header */}
                                        <div className={`p-4 border-b border-zinc-800 ${col.bg} rounded-t-xl`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <col.icon className={`w-5 h-5 ${col.color}`} />
                                                <h3 className={`font-bold ${col.color}`}>{col.title}</h3>
                                                <Badge variant="secondary" className="ml-auto bg-black/40 text-zinc-300">
                                                    {activeTasks.length}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-zinc-400 opacity-80">{col.subtitle}</p>
                                        </div>

                                        {/* Column Content */}
                                        <div className="p-4 flex-1 space-y-3 min-h-[200px]">
                                            <AnimatePresence mode="popLayout">
                                                {colTasks.length === 0 ? (
                                                    <div className="text-center py-8 text-zinc-600 italic text-sm">
                                                        Rien à signaler ici.
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Active Tasks */}
                                                        {activeTasks.map(task => (
                                                            <motion.div
                                                                key={task.id}
                                                                layout
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.9 }}
                                                                transition={{ duration: 0.2 }}
                                                            >
                                                                <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors group">
                                                                    <CardContent className="p-3">
                                                                        <div className="flex items-start gap-3">
                                                                            <Checkbox
                                                                                checked={task.isDone}
                                                                                onCheckedChange={() => toggleTask(task.id)}
                                                                                className="mt-1 border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                                            />
                                                                            <div className="flex-1 space-y-2">
                                                                                <p className="text-sm font-medium text-zinc-200 leading-snug">
                                                                                    {task.label}
                                                                                </p>
                                                                                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                                                                                    <div className="flex gap-1">
                                                                                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 gap-1 border-zinc-700 text-zinc-400">
                                                                                            {getCategoryIcon(task.category)}
                                                                                            {task.category}
                                                                                        </Badge>
                                                                                    </div>

                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="h-6 px-2 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                                                        onClick={() => openFixGuide(task)}
                                                                                    >
                                                                                        <Wrench className="w-3 h-3 mr-1" />
                                                                                        Corriger
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </motion.div>
                                                        ))}

                                                        {/* Done Tasks (Visual separation) */}
                                                        {doneTasks.length > 0 && activeTasks.length > 0 && (
                                                            <div className="h-px bg-zinc-800 my-4" />
                                                        )}

                                                        {doneTasks.map(task => (
                                                            <motion.div
                                                                key={task.id}
                                                                layout
                                                                className="opacity-50 grayscale"
                                                            >
                                                                <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-900 bg-zinc-950/50">
                                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                    <span className="text-sm text-zinc-500 line-through decoration-zinc-700">
                                                                        {task.label}
                                                                    </span>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FIX GUIDE SIDE PANEL */}
            <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <SheetContent className="w-[400px] sm:w-[540px] border-l border-zinc-800 bg-black text-zinc-100 p-0 overflow-y-auto">
                    {activeGuide ? (
                        <>
                            <SheetHeader className="p-6 border-b border-zinc-800 bg-zinc-900/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Guide de Correction</Badge>
                                    <Badge variant="outline" className="border-zinc-700 text-zinc-400">{selectedTask?.category}</Badge>
                                </div>
                                <SheetTitle className="text-2xl font-bold text-white">{activeGuide.title}</SheetTitle>
                                <SheetDescription className="text-zinc-400 text-base mt-2">
                                    {activeGuide.description}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="p-6 space-y-8">
                                {/* Steps */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">1</div>
                                        Étapes à suivre
                                    </h4>
                                    <div className="space-y-3 pl-2 border-l border-zinc-800 ml-3">
                                        {activeGuide.steps.map((step, i) => (
                                            <div key={i} className="flex gap-3 text-zinc-300 text-sm pl-4 relative">
                                                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-blue-500" />
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Code Snippet */}
                                {activeGuide.codeSnippet && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs">2</div>
                                            Code à copier
                                        </h4>
                                        <div className="relative group rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="secondary" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(activeGuide.codeSnippet!)}>
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                            <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                                                {activeGuide.codeSnippet}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {/* Resources */}
                                {activeGuide.resources && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Ressources Utiles</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {activeGuide.resources.map((res, i) => (
                                                <a
                                                    key={i}
                                                    href={res.url}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                                                >
                                                    {res.label}
                                                    <ExternalLink className="w-3 h-3 opacity-50" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mark as Done Action */}
                                <div className="pt-8 border-t border-zinc-800 mt-8">
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12"
                                        onClick={() => {
                                            selectedTask && toggleTask(selectedTask.id)
                                            setSelectedTask(null)
                                        }}
                                    >
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        J'ai corrigé ce problème !
                                    </Button>
                                    <p className="text-center text-xs text-zinc-500 mt-3">
                                        Cela marquera la tâche comme "Fait" dans votre roadmap.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center">
                            <h3 className="text-lg font-bold text-white mb-2">Pas de guide spécifique</h3>
                            <p className="text-zinc-400">
                                Désolé, nous n'avons pas encore de guide étape par étape pour cette erreur précise.
                                <br />Code erreur : <code className="bg-zinc-800 px-1 py-0.5 rounded text-xs">{selectedTask?.label}</code>
                            </p>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
