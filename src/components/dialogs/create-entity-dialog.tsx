import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "@/context/app-context"
import type { CreateType } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Resource } from "@/data/mock"

const titles: Record<CreateType, string> = {
  project: "New Project",
  user: "Add User",
  agent: "Add AI Agent",
  resource: "Add Resource",
  vault: "New Vault",
  configuration: "New Configuration",
}

interface CreateEntityDialogProps {
  type: CreateType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEntityDialog({ type, open, onOpenChange }: CreateEntityDialogProps) {
  const {
    addProject,
    addUser,
    addAgent,
    addResource,
    addVault,
    addConfiguration,
  } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("Engineer")
  const [model, setModel] = useState("gpt-4.1")
  const [resourceType, setResourceType] = useState<Resource["type"]>("file")
  const [environment, setEnvironment] = useState("staging")

  function reset() {
    setName("")
    setDescription("")
    setEmail("")
    setRole("Engineer")
    setModel("gpt-4.1")
    setResourceType("file")
    setEnvironment("staging")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    switch (type) {
      case "project": {
        const projectId = addProject(name, description)
        navigate(`/projects/${projectId}`)
        break
      }
      case "user":
        addUser({ name, email, role })
        break
      case "agent":
        addAgent({
          name,
          description: description.trim() || undefined,
          model,
        })
        break
      case "resource":
        addResource(name, resourceType)
        break
      case "vault":
        addVault(name)
        break
      case "configuration":
        addConfiguration(name, environment)
        break
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{titles[type]}</DialogTitle>
            <DialogDescription>
              Create a new {type} in the current organization.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                {type === "configuration" ? "Key" : "Name"}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === "configuration" ? "MAX_FLEET_SIZE" : "Enter name"
                }
                required
              />
            </div>

            {type === "project" && (
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief project summary"
                />
              </div>
            )}

            {type === "user" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={(v) => v && setRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Engineer">Engineer</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {type === "agent" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="agent-description">Description</Label>
                  <Input
                    id="agent-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What this agent does (optional)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Select value={model} onValueChange={(v) => v && setModel(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4.1">gpt-4.1</SelectItem>
                      <SelectItem value="gpt-4.1-mini">gpt-4.1-mini</SelectItem>
                      <SelectItem value="claude-sonnet">claude-sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {type === "resource" && (
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={resourceType}
                  onValueChange={(v) => setResourceType(v as Resource["type"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file">File</SelectItem>
                    <SelectItem value="dataset">Dataset</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {type === "configuration" && (
              <div className="grid gap-2">
                <Label>Environment</Label>
                <Select value={environment} onValueChange={(v) => v && setEnvironment(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="global">Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
