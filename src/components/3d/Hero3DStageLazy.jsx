import { lazy, Suspense } from 'react';

const Hero3DStageInner = lazy(() => import('./Hero3DStage'));

export default function Hero3DStage(props) {
  return (
    <Suspense fallback={<div className="w-full h-full rounded-2xl bg-slate-100 animate-pulse" />}>
      <Hero3DStageInner {...props} />
    </Suspense>
  );
}
