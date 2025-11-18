// frontend/src/pages/ProjectsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjects } from "../api/projectsService";
import ProjectCard from "../components/ProjectCard";
import "./ProjectsPage.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProjects();
        if (!cancelled) setProjects(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="projects-layout">
      {/* Topbar */}
      <header className="projects-topbar">
        <div className="projects-topbar__brand">Smart Project Management</div>
        <div className="projects-topbar__right">
          <button className="projects-topbar__icon-btn">🔔 Notifications</button>
          <button className="projects-topbar__icon-btn">👤 Profile</button>
        </div>
      </header>

      {/* Content */}
      <main className="projects-main">
        <section className="projects-header">
          <h1>Your Projects</h1>
          <p>
            Manage and track your project progress. Store technical details and use AI to generate better tasks.
          </p>
          <button
            className="projects-new-btn"
            onClick={() => alert("TODO: Create New Project")}
          >
            + New Project
          </button>
        </section>

        <section className="projects-grid">
          {loading && <div className="projects-empty">Loading projects...</div>}
          {!loading && projects.length === 0 && (
            <div className="projects-empty">
              No projects yet. Click <b>+ New Project</b> to get started.
            </div>
          )}
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </section>
      </main>
    </div>
  );
}
