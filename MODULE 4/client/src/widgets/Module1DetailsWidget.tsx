import React from 'react';
import { WidgetContextData } from '../types/widget';
import { Module1Panel } from '../components/Developer/Module1Panel';

export const Module1DetailsWidget: React.FC<{ context: WidgetContextData }> = () => {
  return <Module1Panel />;
};
