import { lazy, Suspense } from "react";

// Three.js + postprocessing are large — code-split into their own chunk so
// pages that don't render the storm don't pay for it.
const StormSceneCanvas = lazy(() => import("./StormSceneCanvas"));

export default function StormScene(props) {
  return (
    <Suspense fallback={null}>
      <StormSceneCanvas {...props} />
    </Suspense>
  );
}
