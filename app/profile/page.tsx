import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="text-sm text-neutral-body">
          Mock profile settings — wire to auth later.
        </p>
      </header>

      <Card>
        <CardContent className="pt-4">
          <p className="text-sm text-ink">
            Name: <span className="font-semibold">Maya</span>
          </p>
          <p className="mt-2 text-sm text-neutral-body">
            Preferences, accessibility options, and notifications will live here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
