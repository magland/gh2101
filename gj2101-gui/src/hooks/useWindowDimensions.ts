import { useState, useEffect } from 'react';

interface WindowDimensions {
  width: number;
  height: number;
}

export const useWindowDimensions = (): WindowDimensions => {
  const [dimensions, setDimensions] = useState<WindowDimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
};
