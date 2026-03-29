/**
 * Mobile Safe Area Test Component
 * 
 * Use this component to visually test safe area insets on iOS devices.
 * Add to a test route to see safe area boundaries.
 */

import React, { useEffect, useState } from 'react';

interface SafeAreaInsets {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export const SafeAreaTest: React.FC = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  });

  const [viewportHeight, setViewportHeight] = useState({
    vh: '0px',
    dvh: '0px',
  });

  useEffect(() => {
    const updateInsets = () => {
      const rootStyles = getComputedStyle(document.documentElement);

      setInsets({
        top: rootStyles.getPropertyValue('--safe-area-inset-top') || '0px',
        right: rootStyles.getPropertyValue('--safe-area-inset-right') || '0px',
        bottom: rootStyles.getPropertyValue('--safe-area-inset-bottom') || '0px',
        left: rootStyles.getPropertyValue('--safe-area-inset-left') || '0px',
      });

      // Create test element to check vh vs dvh
      const testVh = document.createElement('div');
      testVh.style.height = '100vh';
      testVh.style.position = 'absolute';
      testVh.style.visibility = 'hidden';
      document.body.appendChild(testVh);
      const vhHeight = testVh.offsetHeight;
      document.body.removeChild(testVh);

      const testDvh = document.createElement('div');
      testDvh.style.height = '100dvh';
      testDvh.style.position = 'absolute';
      testDvh.style.visibility = 'hidden';
      document.body.appendChild(testDvh);
      const dvhHeight = testDvh.offsetHeight;
      document.body.removeChild(testDvh);

      setViewportHeight({
        vh: `${vhHeight}px`,
        dvh: `${dvhHeight}px`,
      });
    };

    updateInsets();
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
    };
  }, []);

  const hasNotch = parseFloat(insets.top) > 20;
  const hasHomeIndicator = parseFloat(insets.bottom) > 0;
  const vhDvhDiff = parseFloat(viewportHeight.vh) - parseFloat(viewportHeight.dvh);

  return (
    <div className="fixed inset-0 bg-slate-900 text-white p-4 overflow-auto z-[9999]">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Safe Area Test</h1>
          <p className="text-sm text-slate-400">iOS Notch & Dynamic Island Detection</p>
        </div>

        {/* Device Status */}
        <div className="bg-slate-800 rounded-lg p-4 space-y-2">
          <h2 className="font-semibold text-lg mb-3">Device Status</h2>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasNotch ? 'bg-green-500' : 'bg-slate-600'}`}></span>
              <span>Notch/Dynamic Island: {hasNotch ? '✅ Detected' : '❌ Not detected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hasHomeIndicator ? 'bg-green-500' : 'bg-slate-600'}`}></span>
              <span>Home Indicator: {hasHomeIndicator ? '✅ Detected' : '❌ Not detected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${vhDvhDiff > 0 ? 'bg-green-500' : 'bg-slate-600'}`}></span>
              <span>Safari Tab Bar: {vhDvhDiff > 0 ? `✅ ${Math.round(vhDvhDiff)}px` : '❌ Not detected'}</span>
            </div>
          </div>
        </div>

        {/* Safe Area Insets */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Safe Area Insets</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400 mb-1">Top</div>
              <div className="text-lg ">{insets.top}</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400 mb-1">Bottom</div>
              <div className="text-lg ">{insets.bottom}</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400 mb-1">Left</div>
              <div className="text-lg ">{insets.left}</div>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <div className="text-slate-400 mb-1">Right</div>
              <div className="text-lg ">{insets.right}</div>
            </div>
          </div>
        </div>

        {/* Viewport Heights */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Viewport Heights</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center bg-slate-700 p-3 rounded">
              <span className="text-slate-400">100vh (Static)</span>
              <span className="">{viewportHeight.vh}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-700 p-3 rounded">
              <span className="text-slate-400">100dvh (Dynamic)</span>
              <span className="">{viewportHeight.dvh}</span>
            </div>
            <div className="flex justify-between items-center bg-emerald-700 p-3 rounded">
              <span className="text-white font-medium">Difference</span>
              <span className=" font-bold">{Math.round(vhDvhDiff)}px</span>
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {vhDvhDiff > 0 ? (
              <p>✅ dvh is smaller than vh by {Math.round(vhDvhDiff)}px. This means Safari tab bar is active.</p>
            ) : (
              <p>No difference - either no tab bar or browser doesn't support dvh.</p>
            )}
          </div>
        </div>

        {/* Visual Test */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Visual Test</h2>
          <div className="space-y-2 text-sm text-slate-400">
            <p>• The top of this component should be below the notch/Dynamic Island</p>
            <p>• The bottom should be above the home indicator</p>
            <p>• All corners should have safe padding</p>
          </div>
        </div>

        {/* Device Info */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-3">Device Info</h2>
          <div className="space-y-1 text-xs  text-slate-400">
            <div>Screen: {window.screen.width} × {window.screen.height}</div>
            <div>Window: {window.innerWidth} × {window.innerHeight}</div>
            <div>Device Pixel Ratio: {window.devicePixelRatio}</div>
            <div>User Agent: {navigator.userAgent.slice(0, 50)}...</div>
          </div>
        </div>

        {/* Corner Indicators */}
        <div className="fixed top-0 left-0 w-4 h-4 bg-red-500 opacity-50"
          style={{ top: insets.top, left: insets.left }}></div>
        <div className="fixed top-0 right-0 w-4 h-4 bg-red-500 opacity-50"
          style={{ top: insets.top, right: insets.right }}></div>
        <div className="fixed bottom-0 left-0 w-4 h-4 bg-red-500 opacity-50"
          style={{ bottom: insets.bottom, left: insets.left }}></div>
        <div className="fixed bottom-0 right-0 w-4 h-4 bg-red-500 opacity-50"
          style={{ bottom: insets.bottom, right: insets.right }}></div>
      </div>
    </div>
  );
};

export default SafeAreaTest;
