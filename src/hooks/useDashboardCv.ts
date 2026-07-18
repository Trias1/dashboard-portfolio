import { useState } from 'react';

export function useDashboardCv() {
  const [cvTemplate, setCvTemplate] = useState('professional');
  const [cvLoading, setCvLoading] = useState(false);
  return { cvTemplate, setCvTemplate, cvLoading, setCvLoading };
}
