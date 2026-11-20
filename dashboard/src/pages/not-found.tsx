import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="rise flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="text-6xl font-semibold tracking-tight text-muted-foreground/40">
        404
      </div>
      <h1 className="text-xl font-semibold">
        This indicator wandered off the chart
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you asked for doesn't exist. The overview has every indicator,
        analysis and the methodology.
      </p>
      <Button render={<Link to="/" />}>
        Back to the overview <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
