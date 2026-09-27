import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {
  const savedUser = localStorage.getItem("fundmyfuture_user")

  if (!savedUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute