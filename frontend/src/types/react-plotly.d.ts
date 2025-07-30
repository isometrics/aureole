declare module 'react-plotly.js' {
  import * as React from 'react';
  
  interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    [key: string]: any;
  }
  
  const Plot: React.ComponentType<PlotParams>;
  export default Plot;
}