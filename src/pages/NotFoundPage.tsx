import { Link } from "react-router-dom";
import { Text } from "@mcas/design-system";

export function NotFoundPage() {
  return (
    <div className="home-page">
      <h1 className="home-page__title">Page not found</h1>
      <Text variant="muted">The page you requested does not exist.</Text>
      <p>
        <Link to="/">Back to home</Link>
      </p>
    </div>
  );
}
