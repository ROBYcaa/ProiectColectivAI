// frontend/src/components/ProjectCard.jsx
import { useNavigate } from "react-router-dom";
import "./ProjectCard.css";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  function handleViewProject() {
    // navighează către /projects/ID (ex: /projects/1)
    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="project-card">
      <h3 className="project-card__title">{project.name}</h3>

      <p className="project-card__description">{project.description}</p>

      <div className="project-card__meta">
        <div>👥 {project.members} Members</div>
        <div>⚙️ {project.techStack.join(", ")}</div>
      </div>

      {/* Progress */}
      <div className="project-card__progress">
        <div
          className="project-card__progress-bar"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="project-card__progress-label">
        {project.progress}% complete
      </div>

      {/* Footer */}
      <div className="project-card__footer">
        <span className="project-card__updated">
          Last updated: {project.lastUpdated}
        </span>

        <button
          className="project-card__button"
          type="button"
          onClick={handleViewProject}
        >
          View Project
        </button>
      </div>
    </div>
  );
}
