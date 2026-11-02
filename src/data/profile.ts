export const profile = {
  handle: 'kbs',
  name: 'K.B.S Srikar',
  fullName: 'Kasilanka Bhoopesh Siva Srikar',
  tagline: 'Full-stack engineering, applied ML, and embedded IoT',
  location: 'India',
  bio: 'Software engineer working across full-stack development, applied ML, and embedded IoT.',
  email: 'kbsivasrikar@gmail.com',
  github: 'https://github.com/kbssrikar7',
  // Intentional: the GitHub handle migrated kbss0000 -> kbssrikar7, but LinkedIn,
  // X and Hugging Face did not. These are not typos. Do not "fix" them.
  linkedin: 'https://linkedin.com/in/kbss0000',
  x: 'https://x.com/kbss0000',
  huggingface: 'https://huggingface.co/kbsss',
  monkeytype: 'https://monkeytype.com/profile/kbss',
  siteUrl: 'https://kbssrikar7.github.io',
  /** This site's own source, linked from the footer's star button. */
  sourceRepo: 'kbssrikar7/kbssrikar7.github.io',
  resume: '/kbs-srikar-resume.pdf',
} as const;

/** Single source for every outbound profile link. */
export const socials = [
  { key: 'github', label: 'github', href: profile.github, handle: 'kbssrikar7' },
  { key: 'linkedin', label: 'linkedin', href: profile.linkedin, handle: 'kbss0000' },
  // "x" as a label reads as a stray letter beside the X mark; "twitter" is still
  // what most people scanning a portfolio are looking for.
  { key: 'x', label: 'twitter', href: profile.x, handle: 'kbss0000' },
  { key: 'huggingface', label: 'hugging face', href: profile.huggingface, handle: 'kbsss' },
  { key: 'monkeytype', label: 'monkeytype', href: profile.monkeytype, handle: 'kbss' },
] as const;

export type SocialKey = (typeof socials)[number]['key'];

export const education = {
  school: 'Vellore Institute of Technology',
  campus: 'Vellore, Tamil Nadu',
  degree: 'B.Tech, Computer Science and Engineering',
  period: 'July 2022 - August 2026',
  cgpa: '8.53 / 10',
} as const;

export const stack = [
  { label: 'languages', items: ['Python', 'TypeScript', 'Java', 'Rust', 'Swift', 'C++', 'SQL', 'Bash'] },
  { label: 'backend + ml', items: ['FastAPI', 'Django', 'Spring Boot', 'TensorFlow', 'OpenCV', 'XGBoost'] },
  { label: 'ai + retrieval', items: ['RAG', 'LangChain', 'Qdrant', 'ChromaDB', 'Hugging Face', 'Groq', 'MCP'] },
  { label: 'frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'shadcn/ui'] },
  { label: 'infra', items: ['Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'GitHub Actions', 'Linux'] },
  { label: 'data + cloud', items: ['PostgreSQL', 'MySQL', 'Neon', 'AWS', 'GCP', 'Vercel', 'Cloudflare R2'] },
] as const;
