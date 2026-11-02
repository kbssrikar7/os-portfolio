export type Experience = {
  company: string;
  companyUrl?: string;
  role: string;
  period: string;
  location: string;
  /** The product worked on, shown as a linked preview. */
  product?: {
    name: string;
    url: string;
    tagline: string;
    preview: string;
  };
  summary: string;
  metrics: { value: string; label: string }[];
  bullets: string[];
};

export const experience: Experience[] = [
  {
    company: 'Volteo Maritime',
    companyUrl: 'https://volteomaritime.com',
    role: 'Cloud, DevOps & Software Development Engineer Intern',
    period: 'April 2025 - June 2025',
    location: 'Kakinada, Andhra Pradesh (Hybrid)',
    product: {
      name: 'Wayship',
      url: 'https://volteomaritime.com/wayship',
      tagline: 'Operational intelligence for the modern fleet.',
      preview: '/previews/wayship.webp',
    },
    summary:
      'Wayship turns vessel operations data into structured, searchable intelligence. The platform pulls telemetry off ships in the middle of the ocean, where connectivity is intermittent by definition, so it has to stay correct even when the network drops.',
    metrics: [
      { value: '200+', label: 'vessels' },
      { value: '2000+', label: 'seafarers' },
      { value: '99.9%', label: 'uptime' },
      { value: '10M+', label: 'data points / day' },
    ],
    bullets: [
      'Architected and managed Kubernetes clusters for Wayship, sustaining 99.9% uptime for real-time IoT telemetry processing across 200+ vessels and 10M+ data points daily.',
      'Automated CI/CD pipelines with Jenkins and Terraform to deploy containerized maritime systems, cutting deployment time by 40% and eliminating manual configuration drift.',
    ],
  },
];
