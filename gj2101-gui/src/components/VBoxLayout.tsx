import { CSSProperties, ReactNode } from 'react';

interface VBoxLayoutProps {
  heights: number[];
  width: number;
  children: ReactNode[];
}

export const VBoxLayout = ({ heights, width, children }: VBoxLayoutProps) => {
  if (heights.length !== children.length) {
    console.warn('VBoxLayout: Number of heights does not match number of children');
    return null;
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: width,
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            height: heights[index],
            width: '100%',
            overflow: 'auto'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
