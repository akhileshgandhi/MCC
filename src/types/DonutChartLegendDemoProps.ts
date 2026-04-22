export interface DonutData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

export interface DonutChartProps {
  title: string;
  subTitle?: string;
  data: DonutData[];
  height?: number;
  footer?: React.ReactNode;
}
