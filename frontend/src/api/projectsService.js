// frontend/src/api/projectsService.js

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * MOCK DATA — temporary data until real backend endpoints exist
 */
const MOCK_PROJECTS = [
  {
    id: 1,
    name: "Smart Library System",
    description: "Management of books, users, and loan processes.",
    techStack: ["React", "FastAPI", "PostgreSQL"],
    infrastructure: "Docker + Railway",
    members: 4,
    progress: 40,
    lastUpdated: "24.11.2025",
  },
  {
    id: 2,
    name: "Project Management Tool",
    description: "Scrum board with AI-generated task descriptions.",
    techStack: ["React", "Node.js", "MongoDB"],
    infrastructure: "Docker + AWS",
    members: 5,
    progress: 20,
    lastUpdated: "23.11.2025",
  },
  {
    id: 3,
    name: "E-Learning Platform",
    description: "Online courses, quizzes, and analytics.",
    techStack: ["Vue", "Django"],
    infrastructure: "Kubernetes",
    members: 3,
    progress: 70,
    lastUpdated: "21.11.2025",
  },
];

// list all projects (mock)
export async function fetchProjects() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_PROJECTS), 300);
  });
}

// details for a single project (mock)
export async function fetchProjectById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const project = MOCK_PROJECTS.find((p) => p.id === Number(id));
      if (project) resolve(project);
      else reject(new Error("Project not found"));
    }, 300);
  });
}
