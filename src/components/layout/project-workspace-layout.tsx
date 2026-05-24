import { useEffect } from "react"
import { Navigate, Outlet, useNavigate, useParams } from "react-router-dom"
import { useApp } from "@/context/app-context"

export function ProjectRouteSync() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { orgProjects, setSelectedProjectId } = useApp()

  useEffect(() => {
    if (projectId) {
      const exists = orgProjects.some((project) => project.id === projectId)
      if (exists) {
        setSelectedProjectId(projectId)
        return
      }
      if (orgProjects.length > 0) {
        navigate(`/projects/${orgProjects[0].id}`, { replace: true })
      }
      return
    }

    const target = orgProjects[0]?.id
    if (target) {
      navigate(`/projects/${target}`, { replace: true })
    }
  }, [projectId, orgProjects, setSelectedProjectId, navigate])

  return null
}

export function ProjectIndexRedirect() {
  const { orgProjects } = useApp()
  const target = orgProjects[0]?.id
  if (!target) {
    return <Navigate to="/projects" replace />
  }
  return <Navigate to={`/projects/${target}`} replace />
}

export function ProjectWorkspaceLayout() {
  return (
    <>
      <ProjectRouteSync />
      <Outlet />
    </>
  )
}
