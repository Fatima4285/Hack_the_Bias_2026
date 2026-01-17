import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Help</h1>
        <p className="text-sm text-neutral-body">
          Quick support links and feedback entry points.
        </p>
      </header>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-body">
            Tell us what feels confusing, overstimulating, or missing.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-body">
            This MVP uses mock/local-only data unless you opt in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
