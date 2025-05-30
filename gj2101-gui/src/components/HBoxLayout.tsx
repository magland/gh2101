import { CSSProperties, ReactNode } from 'react';

interface HBoxLayoutProps {
  widths: number[];
  height: number;
  children: ReactNode[];
}

export const HBoxLayout = ({ widths, height, children }: HBoxLayoutProps) => {
  if (widths.length !== children.length) {
    console.warn('HBoxLayout: Number of widths does not match number of children');
    return null;
  }

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    height: height,
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      {children.map((child, index) => (
        <div
          key={index}
          style={{
            width: widths[index],
            height: '100%',
            overflow: 'auto'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
