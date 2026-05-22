"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { DashboardShell } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";
import { User, Building, Bell, Shield } from "lucide-react";

function SettingsContent() {
  const { user } = useAuth();

  if (!user) {
    redirect("/");
  }

  return (
    <DashboardShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>
              Your personal information and profile details
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={user.name} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
            </div>
            {user.role === "recruiter" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  defaultValue={(user as { company?: string }).company || ""}
                  placeholder="Enter your company name"
                />
              </div>
            )}
            <Button className="w-fit">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Account Type */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="size-5 text-primary" />
              Account Type
            </CardTitle>
            <CardDescription>
              Your current plan and role
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {user.role}
                </Badge>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                  Free Plan
                </Badge>
              </div>
              <Button variant="outline">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your analyses and matches
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Weekly Digest</p>
                <p className="text-sm text-muted-foreground">
                  Get a summary of your activity every week
                </p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Connected Accounts</p>
                <p className="text-sm text-muted-foreground">
                  Manage your linked social accounts
                </p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
}
