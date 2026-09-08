import React from 'react';
import { WidgetContextData } from '../types/widget';
import { Module2Panel } from '../components/Developer/Module2Panel';

export const Module2DetailsWidget: React.FC<{ context: WidgetContextData }> = () => {
  return <Module2Panel />;
};
