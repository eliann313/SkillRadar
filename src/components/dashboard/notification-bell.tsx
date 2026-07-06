"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getNotificationsAction, markAsReadAction, markAllAsReadAction } from "@/features/notifications/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Notification } from "@prisma/client";

export function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async (silent = false) => {
        if (!silent) setLoading(true);
        const result = await getNotificationsAction(1, 15);
        if (result.success && result.data) {
            setNotifications(result.data.notifications);
            setUnreadCount(result.data.unreadCount);
        }
        if (!silent) setLoading(false);
    };

    useEffect(() => {
        // Carga inicial diferida para evitar llamadas síncronas a setState durante el montaje
        const timer = setTimeout(() => {
            void fetchNotifications();
        }, 0);

        // Polling cada 45 segundos para no sobrecargar
        const interval = setInterval(() => {
            void fetchNotifications(true);
        }, 45000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            // Marcar como leída optimista
            setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
            setUnreadCount((c) => Math.max(0, c - 1));

            const res = await markAsReadAction(notification.id);
            if (!res.success) {
                // Rollback si falla
                void fetchNotifications(true);
            }
        }
        // Redirigir al link
        router.push(notification.link);
    };

    const handleMarkAllAsRead = async () => {
        // Optimista
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        const res = await markAllAsReadAction();
        if (res.success) {
            toast.success("Todas las notificaciones marcadas como leídas");
        } else {
            toast.error("Error al marcar las notificaciones");
            void fetchNotifications(true);
        }
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger
                render={
                    <button className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none transition-colors">
                        <Bell className="size-5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground p-0 border-2 border-background">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                        )}
                        <span className="sr-only">Notificaciones</span>
                    </button>
                }
            />
            <DropdownMenuContent
                align="end"
                className="w-80 p-0 shadow-lg border border-border bg-popover text-popover-foreground"
            >
                <div className="flex items-center justify-between px-4 py-2.5 font-semibold text-sm border-b border-border bg-muted/20">
                    <span>Notificaciones</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                void handleMarkAllAsRead();
                            }}
                            className="h-auto text-xs px-2 py-1 text-primary hover:text-primary/80 hover:bg-transparent"
                        >
                            Marcar leídas
                        </Button>
                    )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {loading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">Cargando...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-muted-foreground">No tienes notificaciones</div>
                    ) : (
                        notifications.map((notif) => (
                            <button
                                key={notif.id}
                                onClick={() => {
                                    void handleNotificationClick(notif);
                                }}
                                className={cn(
                                    "w-full text-left p-3.5 text-xs transition-colors hover:bg-muted/50 flex gap-2.5 items-start",
                                    !notif.read && "bg-primary/5 font-medium",
                                )}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="font-semibold text-foreground truncate max-w-[180px]">
                                            {notif.title}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(notif.createdAt).toLocaleDateString([], {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                                {!notif.read && <span className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                            </button>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
