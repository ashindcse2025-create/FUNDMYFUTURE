import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    course: "Computer Science",
    year: "2nd Year",
    gender: "Male",
    category: "General",
    income: "",
    state: "Tamil Nadu",
    disability: "No",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!form.name || !form.email || !form.password || !form.income) {
      setError("Please fill in all required fields.")
      return
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API}/api/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          income: Number(form.income),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Registration failed."
        )
      }

      setSuccess(
        "Registration successful! Redirecting to login..."
      )

      setTimeout(() => {
        navigate("/login")
      }, 1200)
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          "Unable to register. Please make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-wrapper">

        <div className="register-brand">
          <Link to="/" className="register-logo">
            FundMyFuture
          </Link>

          <p>
            Create your student profile and discover
            scholarships that match your eligibility.
          </p>
        </div>

        <div className="register-card">

          <div className="register-heading">
            <p className="register-eyebrow">
              GET STARTED
            </p>

            <h1>Create your account</h1>

            <p>
              Enter your details to build your scholarship
              profile.
            </p>
          </div>

          {error && (
            <div className="register-error">
              {error}
            </div>
          )}

          {success && (
            <div className="register-success">
              {success}
            </div>
          )}

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            <div className="register-field">
              <label>Full Name *</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="register-field">
              <label>Email Address *</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="register-field">
              <label>Password *</label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="register-grid">

              <div className="register-field">
                <label>Course</label>

                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                >
                  <option>Engineering</option>
                  <option>Computer Science</option>
                  <option>Arts</option>
                  <option>Science</option>
                  <option>Commerce</option>
                  <option>Medical</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="register-field">
                <label>Year</label>

                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                  <option>Postgraduate</option>
                </select>
              </div>

            </div>

            <div className="register-grid">

              <div className="register-field">
                <label>Gender</label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="register-field">
                <label>Category</label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>EWS</option>
                </select>
              </div>

            </div>

            <div className="register-grid">

              <div className="register-field">
                <label>Annual Family Income *</label>

                <input
                  type="number"
                  name="income"
                  value={form.income}
                  onChange={handleChange}
                  placeholder="Example: 300000"
                  min="0"
                  required
                />
              </div>

              <div className="register-field">
                <label>State</label>

                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                >
                  <option>Tamil Nadu</option>
                  <option>Kerala</option>
                  <option>Karnataka</option>
                  <option>Andhra Pradesh</option>
                  <option>Telangana</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Other</option>
                </select>
              </div>

            </div>

            <div className="register-field">
              <label>Person with Disability</label>

              <select
                name="disability"
                value={form.disability}
                onChange={handleChange}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          <div className="register-login">
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Register