const ICONS: Record<string, string> = {
  Python: 'py', TypeScript: 'ts', JavaScript: 'javascript', Java: 'java', Kotlin: 'kotlin', Rust: 'rust',
  Swift: 'swift', 'C++': 'cpp', SQL: 'sql', Bash: 'bash', FastAPI: 'fastapi', Django: 'django',
  'Spring Boot': 'springboot', 'Ruby on Rails': 'rubyonrails', TensorFlow: 'tensorflow', 'scikit-learn': 'scikitlearn',
  OpenCV: 'opencv', Streamlit: 'streamlit', LangChain: 'langchain', Qdrant: 'qdrant', ChromaDB: 'chroma',
  'Hugging Face': 'hf', Groq: 'groq', MCP: 'mcp', React: 'react', 'Next.js': 'next', 'Tailwind CSS': 'tailwind',
  'shadcn/ui': 'shadcnui', Puppeteer: 'puppeteer', Kubernetes: 'k8s', Docker: 'docker', Terraform: 'terraform',
  Jenkins: 'jenkins', 'GitHub Actions': 'ghactions', Linux: 'linux', macOS: 'macos', PostgreSQL: 'postgres',
  MySQL: 'mysql', Neon: 'neon', AWS: 'aws', Azure: 'azure', GCP: 'gcp', Vercel: 'vercel',
  'Cloudflare R2': 'cloudflare', 'Cloudflare Pages': 'cloudflare', Shopify: 'shopify', 'Shopify API': 'shopify',
  n8n: 'n8n', JWT: 'jwt', MQTT: 'mqtt', ESP32: 'esp32', KiCad: 'kicad',
};

export function techIcon(name: string): string | null {
  const file = ICONS[name];
  return file ? `/stack-icons/${file}.svg` : null;
}
