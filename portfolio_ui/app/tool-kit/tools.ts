import type { Tool } from "./DomeGallery";

export const TOOLS: Tool[] = [
  { name: "Python", mark: "Py", category: "Languages", accent: "#3776ab", description: "The main language I use to build, test, and connect data systems." },
  { name: "SQL", mark: "SQL", category: "Languages", accent: "#e58a13", description: "For querying the data layer and turning raw tables into useful answers." },
  { name: "scikit-learn", mark: "sk", category: "ML / AI", accent: "#f7931e", description: "A reliable base for classical models, pipelines, and evaluation." },
  { name: "TensorFlow", mark: "Tf", category: "ML / AI", accent: "#ff6f00", description: "Used when a project needs trainable neural networks at scale." },
  { name: "Keras", mark: "K", category: "ML / AI", accent: "#d00000", description: "A clear, fast way to prototype and explain deep-learning models." },
  { name: "XGBoost", mark: "XG", category: "ML / AI", accent: "#1261a0", description: "A strong choice for structured data and high-signal tabular predictions." },
  { name: "LightGBM", mark: "LGB", category: "ML / AI", accent: "#5a9b54", description: "Fast gradient boosting for large, practical tabular datasets." },
  { name: "Embeddings", mark: "Em", category: "LLMs", accent: "#7c4dff", description: "The representation layer behind semantic search and matching systems." },
  { name: "RAG", mark: "RAG", category: "LLMs", accent: "#ec407a", description: "A way to ground language-model answers in relevant source material." },
  { name: "ChromaDB", mark: "C", category: "LLMs", accent: "#f5a623", description: "A lightweight vector store for retrieval experiments and prototypes." },
  { name: "FastAPI", mark: "FA", category: "LLMs", accent: "#009688", description: "The API layer I reach for when a model needs a clean interface." },
  { name: "Pandas", mark: "pd", category: "Data", accent: "#150458", description: "For cleaning, joining, reshaping, and understanding datasets." },
  { name: "NumPy", mark: "Np", category: "Data", accent: "#4dabcf", description: "The numerical foundation for arrays, transforms, and scientific work." },
  { name: "Matplotlib", mark: "Mpl", category: "Data", accent: "#11557c", description: "For precise plots that make model behavior and data patterns legible." },
  { name: "Plotly", mark: "Pl", category: "Data", accent: "#3f4f75", description: "For interactive visual stories, dashboards, and exploratory analysis." },
];
