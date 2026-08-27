import { lazy, Suspense } from 'react';

const Product3DViewerInner = lazy(() => import('./Product3DViewer'));

export default function Product3DViewer(props) {
  return (
    <Suspense fallback={<div className="w-full h-full rounded-2xl bg-slate-100 animate-pulse" />}>
      <Product3DViewerInner {...props} />
    </Suspense>
  );
}
