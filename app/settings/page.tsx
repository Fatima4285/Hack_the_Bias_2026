import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Settings</h1>
        <p className="text-sm text-neutral-body">
          Mock settings — keep it calm and minimal.
        </p>
      </header>

      <div className="grid gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-body">
              Reminders for check-ins, insights digest, study updates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Accessibility</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-body">
              Reduce motion, increased spacing, font sizing (coming next).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
