import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './contexts/AppContext'
import { AppLayout } from './components/layout/AppLayout'
import { CommandCenter } from './pages/CommandCenter'
import { AllProjects } from './pages/AllProjects'
import { ProjectDetail } from './pages/ProjectDetail'
import { ProjectForm } from './pages/ProjectForm'
import { ImportProjects } from './pages/ImportProjects'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<CommandCenter />} />
            <Route path="/projects" element={<AllProjects />} />
            <Route path="/projects/new" element={<ProjectForm />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/import" element={<ImportProjects />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
