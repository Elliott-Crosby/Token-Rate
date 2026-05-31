import NodeaBannerAd from './NodeaBannerAd'

/**
 * SideRailAds — fixed "skyscraper" rails that sit in the empty page margins,
 * one on each side of the centered content column (max-w-5xl ≈ 1024px).
 *
 * Only shown once the viewport is wide enough to hold a 300px banner on each
 * side without overlapping the content (1024 + 2×300 + gaps ≈ 1672px), so it
 * never collides with the calculator. Positioned via calc() relative to centre
 * so each rail always hugs the outer edge of the content column.
 */
export default function SideRailAds() {
  return (
    <div aria-hidden={false}>
      <div
        className="hidden min-[1680px]:block fixed top-1/2 -translate-y-1/2 z-30"
        style={{ left: 'calc(50% - 836px)' }}
      >
        <NodeaBannerAd />
      </div>
      <div
        className="hidden min-[1680px]:block fixed top-1/2 -translate-y-1/2 z-30"
        style={{ right: 'calc(50% - 836px)' }}
      >
        <NodeaBannerAd />
      </div>
    </div>
  )
}
