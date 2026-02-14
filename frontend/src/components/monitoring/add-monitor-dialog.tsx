"use client"

import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { MonitorCreate } from "@/types/monitor"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

const formSchema = z.object({
    url: z.string().url("Please enter a valid URL (https://...)"),
    frequency: z.enum(["daily", "weekly"]),
    alert_threshold: z.coerce.number().min(1).max(100),
    check_hour: z.coerce.number().min(0).max(23),
    check_day: z.coerce.number().min(0).max(6).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AddMonitorDialogProps {
    onSuccess: () => void
}

export function AddMonitorDialog({ onSuccess }: AddMonitorDialogProps) {
    const [open, setOpen] = useState(false)
    const { isAuthenticated } = useAuth()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            url: "",
            frequency: "daily" as const,
            alert_threshold: 10,
            check_hour: 9,
        },
    })

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to create a monitor")
            return
        }

        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch(`${API_BASE}/api/monitors/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const errBody = await response.json().catch(() => ({}))
                const msg = Array.isArray(errBody.detail) ? errBody.detail.map((e: any) => e.msg || e).join(", ") : (errBody.detail || "Failed to create monitor")
                throw new Error(msg)
            }

            toast.success("Watchdog activated for " + values.url)
            setOpen(false)
            form.reset()
            onSuccess()
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Error creating monitor")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600">
                    <Plus className="h-4 w-4" />
                    New Monitor
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Watchdog Monitor</DialogTitle>
                    <DialogDescription>
                        On scanne cette URL automatiquement et on t’alerte si le score baisse. La limite dépend de ton abonnement ; en passant Pro ou Agency tu peux en créer plus.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit, (errors) => {
                            console.error("Form validation errors:", errors)
                            toast.error("Please fix the errors in the form")
                        })}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Website URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="check_hour"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Check Time (UTC)</FormLabel>
                                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select hour" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {Array.from({ length: 24 }).map((_, i) => (
                                                <SelectItem key={i} value={i.toString()}>
                                                    {i.toString().padStart(2, '0')}:00
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="daily">Daily</SelectItem>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {form.watch("frequency") === "weekly" && (
                                    <FormField
                                        control={form.control}
                                        name="check_day"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>On which day?</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString() || "0"}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select day" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="0">Monday</SelectItem>
                                                        <SelectItem value="1">Tuesday</SelectItem>
                                                        <SelectItem value="2">Wednesday</SelectItem>
                                                        <SelectItem value="3">Thursday</SelectItem>
                                                        <SelectItem value="4">Friday</SelectItem>
                                                        <SelectItem value="5">Saturday</SelectItem>
                                                        <SelectItem value="6">Sunday</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                            <FormField
                                control={form.control}
                                name="alert_threshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alert Sensitivity (Score Drop)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>Alert if score drops by {field.value} points</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Start Monitoring"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
