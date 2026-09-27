import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function Login() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setError("")

    if (!form.email || !form.password) {
      setError("Please enter your email and password.")
      return
    }

    try {
      setLoading(true)

      const response = await fetch(`${API}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password.")
      }

      localStorage.setItem(
        "fundmyfuture_user",
        JSON.stringify(
          data.user || {
            email: form.email,
          }
        )
      )

      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Unable to login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">

        <div className="login-brand">
          <Link to="/" className="login-logo">
            FundMyFuture
          </Link>

          <p className="login-brand-text">
            Discover scholarships that match your academic journey.
          </p>

          <div className="login-highlight">
            <span>✓</span>
            <div>
              <strong>Personalized Scholarships</strong>
              <small>Find opportunities relevant to your profile.</small>
            </div>
          </div>

          <div className="login-highlight">
            <span>✓</span>
            <div>
              <strong>Official Information</strong>
              <small>Scholarship details from trusted sources.</small>
            </div>
          </div>

          <div className="login-highlight">
            <span>✓</span>
            <div>
              <strong>Track Your Progress</strong>
              <small>Save scholarships and manage applications.</small>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <p className="login-eyebrow">WELCOME BACK</p>

            <h1>Sign in to your account</h1>

            <p>
              Access your scholarships, recommendations and applications.
            </p>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">

            <div className="login-field">
              <label htmlFor="email">Email Address</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <p className="login-register">
            Don't have an account?
            <Link to="/register"> Create an account</Link>
          </p>

          <Link to="/" className="login-back">
            ← Back to FundMyFuture
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login