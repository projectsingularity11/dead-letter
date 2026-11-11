import {
  DeskLamp,
  PostOfficeWindow,
  Moth,
  GhostPortrait,
} from "../../art/PostalArt";
export function PostalScene({ home = false }: { home?: boolean }) {
  return (
    <div
      className={`postal-scene ${home ? "home-scene" : ""}`}
      aria-hidden="true"
    >
      <div className="window">
        <PostOfficeWindow />
        {home && <GhostPortrait className="postmaster" />}
      </div>
      <DeskLamp className="lamp" />
      <Moth className="moth" />
      <span className="wall-mark">
        EST. BETWEEN
        <br />
        HERE & THERE
      </span>
      <div className="desk-surface" />
    </div>
  );
}
