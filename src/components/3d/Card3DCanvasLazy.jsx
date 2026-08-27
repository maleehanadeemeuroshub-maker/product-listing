import { lazy, Suspense } from 'react';

const Card3DCanvasInner = lazy(() => import('./Card3DCanvas'));

export default function Card3DCanvas(props) {
  return (
    <Suspense fallback={<div className="w-full h-full rounded-xl bg-slate-100 animate-pulse" />}>
      <Card3DCanvasInner {...props} />
    </Suspense>
  );
}
