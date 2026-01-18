import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tiles = [
  { title: "Add a posting", href: "/researcher/postings/new" },
  { title: "Your postings", href: "/researcher/postings/mine" },
  { title: "Explore patterns", href: "/researcher/explore" },

];

export default function ResearcherDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-body">Research Dashboard</p>
        <h1 className="text-2xl font-semibold text-ink">Welcome, Researcher!</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base text-ink">{t.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-neutral-body">Open</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
