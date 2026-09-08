import React from 'react';
import { WidgetContextData } from '../types/widget';
import { Module3Panel } from '../components/Developer/Module3Panel';

export const Module3LogsWidget: React.FC<{ context: WidgetContextData }> = () => {
  return <Module3Panel />;
};
