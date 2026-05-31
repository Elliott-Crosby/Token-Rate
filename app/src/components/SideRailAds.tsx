import NodeaBannerAd from './NodeaBannerAd'
import NodeaCompanionAd from './NodeaCompanionAd'

/**
 * SideRailAds — fixed "skyscraper" rails that sit in the empty page margins,
 * one on each side of the centered content column (max-w-5xl ≈ 1024px).
 *
 * The two banners bookend the page in contrast: the light "branching AI chat
 * canvas" banner on the LEFT rail and the dark "why settle for one answer?"
 * companion on the RIGHT rail.
 *
 * Shown from 1536px (scaled to fit the margin) and at full size from 1680px;
 * hidden on narrower screens so the rails never collide with the calculator.
 * All positioning/scaling lives in the `.nd-rail*` classes in NodeaBannerAd.css.
 */
export default function SideRailAds() {
  return (
    <div aria-hidden={false}>
      <div className="nd-rail nd-rail-left">
        <NodeaBannerAd />
      </div>
      <div className="nd-rail nd-rail-right">
        <NodeaCompanionAd />
      </div>
    </div>
  )
}
