/**
 * Hand-written project copy. This is the source of truth for anything a human
 * should author: blurbs, metrics, and the live-URL map.
 *
 * The live URLs here are curated, NOT taken from the GitHub `homepage` field -
 * several repos advertise a homepage that is dead (BillFlow's Railway deploy
 * 404s, shopify-analytics' Render deploy is down).
 *
 * `scripts/curate.py` never writes to this file. Merging happens in
 * src/lib/projects.ts, where these fields always win.
 */

export type ManualProject = {
  slug: string;
  title: string;
  blurb: string;
  /** Search-result snippet, when the blurb runs past the ~155 characters
      Google shows. Defaults to the blurb. */
  metaDescription?: string;
  detail: string;
  tech: string[];
  liveUrl?: string;
  /** Set when the repo has a live URL that is dead or unreliable. */
  liveNote?: string;
  metrics?: { value: string; label: string }[];
  /** A screenshot from the repo's README. When set it wins over capturing liveUrl. */
  readmeImage?: string;
  /**
   * GitHub repo name when it differs from the slug. `null` for a private repo
   * (client work): no source link anywhere, since it would 404 for visitors.
   */
  repo?: string | null;
  /** Text of the live-URL button; "live demo" unless the thing is a real site. */
  liveLabel?: string;
  /** Built for a client: shown under the "client work" category. */
  clientWork?: boolean;
  /**
   * The technical write-up on the project page, for engineers reading past the
   * card. Every claim here is taken from the project's own repo and README.
   */
  writeup?: {
    pipeline: { step: string; detail: string }[];
    notes: { title: string; body: string }[];
    limits?: string[];
  };
};

export const manualProjects: ManualProject[] = [
  {
    slug: 'libraa-website',
    title: 'Libraa Group',
    repo: null,
    clientWork: true,
    blurb: 'Freelance project: the company website for Libraa Group, a ship-management and marine-services firm, covering its services, 16-vessel fleet, clients and certifications. Live at libraa.com.',
    detail:
      "Built and shipped as a freelance project for Libraa Group, a ship-management, crew-management and marine-services company operating since 2009 from Chennai, Kakinada and Port Blair. One static page covers its seven service lines, a sixteen-vessel fleet slider, thirty-one clients from the Indian Navy and Adani Ports to Reliance and JSW, its offices and operating ports, certifications, leadership and careers. Every name, flag, certificate number and address on the page comes from the company's verified records. It is served from Cloudflare Pages at www.libraa.com, with the old site's pages that still appear in search redirected to the new one.",
    tech: ['Next.js', 'React', 'TypeScript', 'Cloudflare Pages', 'Puppeteer', 'Python'],
    liveUrl: 'https://www.libraa.com',
    liveLabel: 'visit site',
    metaDescription:
      'The company website for Libraa Group, a ship-management and marine-services firm: its services, 16-vessel fleet, clients and certifications.',
    metrics: [
      { value: '100', label: 'Lighthouse SEO' },
      { value: '16', label: 'vessels in the fleet slider' },
      { value: '31', label: 'clients listed' },
    ],
    writeup: {
      pipeline: [
        { step: 'Content', detail: "Every vessel, flag, certificate number, client and office on the page comes from the company's verified records, not from copywriting." },
        { step: 'Photos', detail: 'A Python script encodes each photo to AVIF at several widths, choosing the lowest quality that keeps SSIM above a threshold, with a stricter one for photos of people. Each image loads at the width it is drawn; browsers without AVIF get the original.' },
        { step: 'Build', detail: 'A Next.js static export: plain HTML, CSS and JavaScript, no server.' },
        { step: 'Hosting', detail: 'Cloudflare Pages at www.libraa.com, with security headers, year-long caching for hashed build files and one-day caching for photos, which keep their names when replaced.' },
        { step: 'Verification', detail: 'A Puppeteer script checks the built page before release: fleet slider behaviour, fonts, layout and screenshot sanity.' },
      ],
      notes: [
        { title: 'Previews before photos', body: 'Each fleet photo ships with a tiny blurred preview inlined in the page, so a slide that comes into view before its photo has downloaded shows the ship softly instead of an empty box.' },
        { title: 'Keeping old search results', body: "Two pages of the company's previous site were still showing in Google, so they redirect permanently to the new page instead of landing on a 404." },
        { title: 'A company, not a star sign', body: 'Search engines read "Libraa" as a misspelling of "Libra". Organization structured data now states the company, its address and contacts, so it is read as a business.' },
      ],
    },
  },
  {
    slug: 'healthcare-qa-chatbot',
    title: 'MediQuery',
    blurb: 'Medical Q&A that shows its work: hybrid retrieval over 505K documents with per-answer confidence and source attribution.',
    detail:
      'My capstone. Most medical chatbots answer confidently and cite nothing, which is the exact failure mode that makes them unusable in practice. MediQuery retrieves with dense embeddings and BM25 in parallel, fuses the rankings with Reciprocal Rank Fusion, and attaches an explainability score built from retrieval confidence, generation confidence, and source attribution, so a wrong answer is visibly a low-confidence answer. It is backed by a 20-file pytest suite and a 6-stage CI/CD pipeline covering linting, testing, and security scanning.',
    tech: ['FastAPI', 'LangChain', 'Qdrant', 'ChromaDB', 'Next.js', 'Docker'],
    liveUrl: 'https://mediquery-healthcare.vercel.app',
    metrics: [
      { value: '505K+', label: 'documents indexed' },
      { value: '3-way', label: 'hybrid retrieval' },
      { value: '20', label: 'test files' },
    ],
    writeup: {
      pipeline: [
        { step: 'Safety check', detail: 'Every query is screened for emergency keywords, dangerous content, and known drug-interaction patterns before retrieval runs.' },
        { step: 'Hybrid retrieval', detail: 'Dense search over 505,584 chunks in Qdrant Cloud (all-MiniLM-L6-v2 embeddings, from MedQuAD, MedQA, and clinical guidelines) runs alongside BM25 keyword search. Results are fused and re-ranked.' },
        { step: 'Generation', detail: 'The answer is generated from the retrieved passages only, through a LangChain pipeline with a self-correcting LangGraph RAG graph.' },
        { step: 'Explainability', detail: 'A confidence score built from retrieval score, entity coverage, source agreement, and answer length, plus the source passages highlighted where they were used.' },
        { step: 'Safety check', detail: 'The response is screened again before it is returned.' },
      ],
      notes: [
        { title: 'Confidence you can inspect', body: 'The score is a breakdown, not one opaque number, so a user can see why an answer is low-confidence rather than being told it is.' },
        { title: 'A fully on-device Android port', body: 'No server and no internet permission: Gemma 3 1B through LiteRT-LM, hand-written BM25 + dense retrieval (ONNX Runtime) fused with RRF, and the same confidence scorer, Platt-calibrated against a 97-question on-device evaluation run.' },
        { title: 'CI that deploys', body: 'Every push runs ruff, pytest, a frontend type-check and build, gitleaks, and a Trivy scan. Pushes to main build a Docker image to GHCR and deploy the backend to Hugging Face Spaces.' },
      ],
      limits: ['Educational use only - it does not replace clinical advice, and the app says so.'],
    },
  },
  {
    slug: 'cardiac-risk-stratification',
    title: 'Cardiac Risk Stratification',
    blurb: 'Multi-modal cardiac MRI pipeline: U-Net segmentation, radiomics, and a calibrated classifier that explains every prediction.',
    detail:
      'Segments cardiac MRI with a U-Net, extracts radiomics and infarct-burden features from the masks, and feeds them to a calibrated XGBoost classifier. Calibration matters here: an uncalibrated risk score is not a risk score. Explainability runs at both levels: SHAP for the tabular features, Grad-CAM back onto the imaging, so a clinician can see which part of the heart drove the number.',
    tech: ['TensorFlow', 'U-Net', 'XGBoost', 'SHAP', 'Grad-CAM', 'FastAPI', 'Next.js'],
    liveUrl: 'https://cardiac-risk-frontend.vercel.app/',
    metrics: [
      { value: 'multi-modal', label: 'imaging + tabular' },
      { value: 'calibrated', label: 'probability output' },
    ],
    writeup: {
      pipeline: [
        { step: 'Segmentation', detail: 'A U-Net trained on the EMIDEC dataset segments the myocardium from short-axis MRI, extended from 3 to 5 classes to include infarction and no-reflow.' },
        { step: 'Radiomics', detail: 'PyRadiomics extracts shape, texture, and intensity features from the masks, plus infarct-burden features (infarct volume and share of myocardium).' },
        { step: 'Fusion', detail: 'Imaging features are merged with four clinical biomarkers: age, LVEF, troponin, and NT-proBNP.' },
        { step: 'Prediction', detail: 'A calibrated XGBoost classifier, tuned with nested Optuna search and evaluated under repeated stratified cross-validation, outputs Low / Moderate / High / Very High with class probabilities.' },
        { step: 'Explanation', detail: 'SHAP contributions per feature, Grad-CAM heatmaps on the MRI, and a rule-based cross-check shown next to every prediction.' },
      ],
      notes: [
        { title: 'Dropped the ensemble', body: 'A stacked XGBoost + Attention-MLP ensemble was retired after permutation importance showed the MLP branch contributed zero signal. The single calibrated model matches its accuracy with far less complexity.' },
        { title: 'Traced a SHAP anomaly to the data', body: "Troponin's SHAP value came out identical for 0.01, 0.08, and 4.5 ng/L. Traced to the booster level: not a code bug. The training distribution (mean ~70, std ~94) squeezes every value from 0 to ~25 into one narrow z-score band that no tree splits within." },
        { title: 'Segmentation on very rare classes', body: 'Infarction reaches a Dice of 0.275 while making up only 0.176% of training pixels. No-reflow, ten times rarer, is not learnable from 100 patients, and the features built on it are documented as such.' },
      ],
      limits: [
        'The training label comes from a rule on age, LVEF, troponin, and NT-proBNP, not a clinical outcome - the models imitate that rule, and accuracy should be read that way.',
        'Clinical-only requests fill imaging features with population medians, which can bias toward Very High Risk. The rule-based cross-check is there to catch it.',
      ],
    },
  },
  {
    slug: 'headphonesafety',
    title: 'Headphone Safety',
    blurb: "Brings iOS's 'Reduce Loud Sounds' to macOS, Linux, Windows, and Android: a real-time peak limiter, not just a volume cap.",
    detail:
      'A volume cap alone does not protect hearing, because transients blow straight past it. This runs an actual peak-limiting signal processor in the audio path on four platforms, each through its native audio stack: CoreAudio on macOS, PipeWire on Linux, WASAPI on Windows, and DynamicsProcessing on Android. The macOS build routes audio through BlackHole, a virtual loopback driver, with watchdog and rollback logic that restores safe output within one second of a device disconnect, and a startup recovery check that guards against unclean crashes.',
    tech: ['Swift', 'Rust', 'C++', 'Kotlin', 'CoreAudio', 'PipeWire', 'WASAPI'],
    metrics: [
      { value: '4', label: 'platforms' },
      { value: '<1s', label: 'failsafe recovery' },
      { value: '5', label: 'headroom presets' },
    ],
    writeup: {
      pipeline: [
        { step: 'Detect', detail: 'Protection engages only when headphones - wired or Bluetooth - are the active output.' },
        { step: 'Capture', detail: 'System audio is routed through a loopback on each platform: BlackHole on macOS, a PipeWire virtual sink on Linux, WASAPI loopback with a virtual cable on Windows.' },
        { step: 'Limit', detail: "A true-peak limiter caps the signal at a chosen headroom below full scale: Apple's PeakLimiter Audio Unit on macOS, ZaMaximX2 through LADSPA on Linux." },
        { step: 'Output', detail: 'The limited signal plays on the real headphone device, with tens of milliseconds of latency.' },
      ],
      notes: [
        { title: 'Measured, not assumed', body: 'On Windows, a 0 dBFS input came out at -9.9 dB with a 10 dB headroom setting, on real Bluetooth headphones. On Linux, a -1.1 dB tone came out at -10.1 dB against a -10 dB ceiling.' },
        { title: 'Recovery that cannot hang', body: 'Unplugging headphones mid-playback reverts output to a safe device within about a second, and a startup check undoes stray routing after a crash. Recovery never queries the disconnecting device, because those CoreAudio calls were observed to block indefinitely.' },
        { title: 'Research before code', body: 'Each port started with a written architecture study. The first Windows design, an Audio Processing Object, registered correctly but was never loaded by audiodg.exe - so what ships is a WASAPI-loopback design instead, and the study records why.' },
      ],
      limits: [
        'Android has no public API for a system-wide limiter: the Volume Cap works fully, the limiter covers apps per-app at a fixed, device-set ceiling.',
      ],
    },
  },
  {
    slug: 'led_control_deploy',
    title: 'ESP32 Fleet OTA',
    blurb: 'Admin dashboard and over-the-air firmware pipeline for a fleet of ESP32 devices, with browser-based flashing.',
    detail:
      'Managing firmware on deployed IoT hardware is the part nobody demos. This handles LED and relay control, RS485 solar-meter readings, and MQTT-driven OTA updates across a device fleet, with flashing that runs in the browser via WebSerial, so a field technician needs no toolchain. Firmware artifacts live in Cloudflare R2.',
    tech: ['ESP32', 'MQTT', 'Cloudflare R2', 'GitHub Actions', 'Next.js', 'WebSerial'],
    liveUrl: 'https://ledcontroldeploy.vercel.app',
  },
  {
    slug: 'studyFlow--AI_Powered_Productivity_Suite',
    title: 'StudyFlow',
    blurb: 'Full-stack study suite: Pomodoro, Kanban, snippet manager, and activity heatmap, with five Groq-backed AI features.',
    detail:
      'A productivity suite built around focused study sessions: Pomodoro timer, Kanban task board, code snippet manager, and an activity heatmap, served by six FastAPI routers. Five AI features run on the Groq API, including study plan generation, code explanation, and focus-pattern analysis. It uses Google OAuth and JWT auth, PostgreSQL on Neon, and automated Vercel deploys. The UI is deliberately cinematic, styled after The Dark Knight and The Batman.',
    tech: ['React', 'FastAPI', 'PostgreSQL', 'Neon', 'Groq', 'JWT'],
    liveUrl: 'https://studyflow-app-pearl.vercel.app',
    // The live app opens on a login screen; the README's dashboard shot shows
    // the actual product.
    readmeImage:
      'https://raw.githubusercontent.com/kbssrikar7/studyFlow--AI_Powered_Productivity_Suite/main/screenshots/mission-control.png',
    metrics: [
      { value: '6', label: 'API routers' },
      { value: '5', label: 'AI features' },
    ],
  },
  {
    slug: 'handwritten-equation-solver',
    title: 'Handwritten Equation Solver',
    blurb: 'A custom CNN that reads handwritten math and solves it: 14 symbols at 95% test accuracy.',
    detail:
      'An OpenCV pipeline normalizes input to 32×32 grayscale and segments individual symbols, then a custom CNN classifies 14 mathematical symbols at 95% test accuracy before the expression is parsed and evaluated. Next.js frontend on Vercel, FastAPI inference API on Hugging Face Spaces.',
    tech: ['TensorFlow', 'OpenCV', 'FastAPI', 'Next.js', 'Hugging Face'],
    liveUrl: 'https://simple-math-solver.vercel.app/',
    metrics: [
      { value: '95%', label: 'test accuracy' },
      { value: '14', label: 'symbol classes' },
    ],
  },
  {
    slug: 'n8n-upi-payment-gateway-django',
    title: 'Self-Hosted UPI Gateway',
    blurb: 'Direct-to-bank UPI payments confirmed by parsing bank credit-alert emails, with no aggregator, no merchant account.',
    detail:
      'Payment aggregators take a cut and require a merchant account. This skips both: payments go straight to the bank account, and an n8n workflow watches the bank\'s credit-alert emails, matches them against pending orders, and fires a webhook back into Django to confirm. It is a pragmatic answer to a real constraint faced by small Indian merchants.',
    tech: ['Django', 'n8n', 'UPI', 'Webhooks', 'Python'],
  },
  {
    slug: 'ota-flasher',
    title: 'OTA Flasher',
    blurb: 'Cross-platform desktop app for ESP32 firmware deployment, written in Rust with egui.',
    detail:
      'The desktop counterpart to the ESP32 fleet dashboard: a native Rust/egui application that pushes firmware to devices over MQTT with TLS, pulling artifacts from Cloudflare R2.',
    tech: ['Rust', 'egui', 'MQTT', 'TLS', 'Cloudflare R2'],
  },
  {
    slug: 'esp32-energy-meter-pcb',
    title: 'ESP32 Energy Meter PCB',
    blurb: 'Fab-ready KiCad board for a single-phase energy meter around the ATM90E26 metering AFE.',
    detail:
      'A complete hardware design, not a breadboard sketch: single-phase energy metering built on the ATM90E26 AFE with an ESP32, DRC and ERC clean, SPICE-validated, and ready to send to a fab.',
    tech: ['KiCad', 'ESP32', 'ATM90E26', 'SPICE'],
  },
  {
    slug: 'ytdlp-gui',
    title: 'yt-dlp GUI',
    blurb: 'Native macOS GUI for yt-dlp, written in Rust and tuned for Apple Silicon.',
    detail:
      'A native wrapper around yt-dlp and FFmpeg with configurable quality, format, and output settings, plus packaging scripts that automate dependency installation and macOS app bundling.',
    tech: ['Rust', 'yt-dlp', 'FFmpeg', 'macOS'],
  },
  {
    slug: 'shopify-analytics',
    title: 'Shopify Analytics',
    blurb: 'Rails 7 analytics for Shopify stores: background jobs, webhooks, and LLM-powered natural-language queries.',
    detail:
      'A Ruby on Rails 7 analytics application for Shopify: webhook ingestion, background job processing, interactive charts, and an LLM layer that turns plain-English questions into queries over store data.',
    tech: ['Ruby on Rails', 'Shopify API', 'Groq', 'Sidekiq', 'Webhooks'],
    liveNote: 'Hosted demo retired; source and screenshots on GitHub.',
    readmeImage:
      'https://raw.githubusercontent.com/kbssrikar7/shopify-analytics/main/screenshots/dashboard.png',
  },
  {
    slug: 'BillFlow',
    title: 'BillFlow',
    blurb: 'Retail billing and POS system: Spring Boot and MySQL behind a responsive React storefront.',
    detail:
      'A full-stack point-of-sale application covering sales, inventory, and payments, with a Spring Boot backend over MySQL and a React interface.',
    tech: ['Java', 'Spring Boot', 'MySQL', 'React'],
    liveNote: 'Hosted demo retired; source on GitHub.',
  },
  {
    slug: 'heart-attack-risk-ensemble',
    title: 'Heart Attack Risk Ensemble',
    blurb: 'Recall-weighted ensemble for heart attack risk, tuned so false negatives cost more than false positives.',
    detail:
      'A screening model where the asymmetry matters: missing a true positive is far worse than flagging a false one, so the ensemble is tuned for recall rather than headline accuracy. Deployed as a Hugging Face Space.',
    tech: ['scikit-learn', 'Ensemble methods', 'Hugging Face'],
    // The HF Space is down ("Launch timed out, workload was not healthy").
    // Note that HF serves its error page with HTTP 200, so a status probe alone
    // reports this as live - it is not. Verified by screenshot.
    liveNote: 'Hugging Face Space is currently down; source on GitHub.',
  },
  {
    slug: 'house-price-prediction-app',
    title: 'House Price Prediction',
    blurb: 'End-to-end ML pipeline on the Kaggle House Prices dataset: supervised regression, clustering, and SHAP interpretability.',
    detail:
      'Ridge, RandomForest, XGBoost, LightGBM, and SVM for regression; KMeans, DBSCAN, and PCA for unsupervised structure; SHAP for interpretability. Packaged with a Streamlit app and Docker for reproducibility.',
    tech: ['XGBoost', 'LightGBM', 'scikit-learn', 'SHAP', 'Streamlit', 'Docker'],
  },
  {
    slug: 'azure-cost-planner',
    title: 'Azure Cost Planner',
    blurb: 'Streamlit tool for estimating Azure VM costs before you provision them.',
    detail: 'A cost estimation tool for Azure virtual machines, built as a Streamlit app.',
    tech: ['Python', 'Streamlit', 'Azure'],
    liveUrl: 'https://azure-cost-planner.streamlit.app',
    liveNote: 'Hosted on Streamlit Cloud; it may take about 30 seconds to wake up.',
  },
  {
    slug: 'ensemble-heart-disease-prediction',
    title: 'Heart Disease Ensemble',
    blurb: 'An earlier ensemble approach to heart disease prediction, deployed on Streamlit.',
    detail: 'An ensemble classifier for heart disease risk, packaged as a Streamlit application.',
    tech: ['scikit-learn', 'Ensemble methods', 'Streamlit'],
    liveUrl: 'https://ensemble-heart-disease-prediction.streamlit.app',
    liveNote: 'Hosted on Streamlit Cloud; it may take about 30 seconds to wake up.',
  },
  {
    slug: 'TCS_IPA',
    title: 'TCS Xplore Prep',
    blurb: 'Java solutions, practice programs, and an interactive practice app for the TCS Xplore assessment.',
    detail:
      'Curated Java coding solutions and MCQ notes for the TCS Xplore IPA/NQT assessment, alongside an interactive practice web app I built.',
    tech: ['Java', 'JavaScript'],
  },
];
