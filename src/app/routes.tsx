import { useEffect, useState } from "react";
export type Route = "/" | "/play" | "/results";
function readRoute(): Route {
  const hash = location.hash.slice(1);
  return hash === "/play" || hash === "/results" ? hash : "/";
}
export function navigate(route: Route) {
  location.hash = route;
}
export function useRoute() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);
  return route;
}
