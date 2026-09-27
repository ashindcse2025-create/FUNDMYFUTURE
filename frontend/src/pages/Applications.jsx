import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function Applications() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("fundmyfuture_user") || "null"
    )

    if (!storedUser?.email) {
      navigate("/login")
      return
    }

    setUser(storedUser)
    loadApplications(storedUser.email)
  }, [])

  async function loadApplications(email) {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `${API}/api/applications/${encodeURIComponent(email)}`
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load applications."
        )
      }

      setApplications(data.applications || [])
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          "Unable to load applications. Please make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  function getName(application) {
    return (
      application.scholarship_name ||
      application.name ||
      application.title ||
      "Scholarship"
    )
  }

  function getSource(application) {
    return (
      application.source ||
      application.provider ||
      "Official Scholarship Source"
    )
  }

  async function updateStatus(application, status) {
    if (!user?.email) return

    try {
      setError("")
      setMessage("")

      const response = await fetch(`${API}/api/applications/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          scholarship_name: getName(application),
          status: status,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update application."
        )
      }

      setApplications((current) =>
        current.map((item) =>
          getName(item) === getName(application)
            ? {
                ...item,
                status: status,
              }
            : item
        )
      )

      setMessage("Application status updated successfully.")
    } catch (err) {
      console.error(err)
      setError(err.message || "Unable to update status.")
    }
  }

  async function removeApplication(application) {
    if (!user?.email) return

    const confirmed = window.confirm(
      `Remove "${getName(application)}" from your applications?`
    )

    if (!confirmed) return

    try {
      setError("")
      setMessage("")

      const response = await fetch(`${API}/api/applications/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          scholarship_name: getName(application),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to remove application."
        )
      }

      setApplications((current) =>
        current.filter(
          (item) => getName(item) !== getName(application)
        )
      )

      setMessage("Application removed successfully.")
    } catch (err) {
      console.error(err)
      setError(err.message || "Unable to remove application.")
    }
  }

  function getStatusClass(status) {
    const value = String(status || "").toLowerCase()

    if (value === "selected") {
      return "application-status selected"
    }

    if (value === "applied") {
      return "application-status applied"
    }

    if (value === "applying") {
      return "application-status applying"
    }

    if (value === "rejected") {
      return "application-status rejected"
    }

    return "application-status interested"
  }

  if (loading) {
    return (
      <div className="applications-loading">
        <div className="applications-spinner"></div>
        <p>Loading your applications...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="applications-page">

      <section className="applications-header">
        <div className="applications-container applications-header-inner">

          <div>
            <p className="applications-eyebrow">
              APPLICATION TRACKING
            </p>

            <h1>
              Manage your{" "}
              <span>scholarship applications.</span>
            </h1>

            <p className="applications-subtitle">
              Track the scholarships you are interested in
              and keep your application progress organized.
            </p>
          </div>

          <Link
            to="/scholarships"
            className="applications-primary-button"
          >
            Find Scholarships
          </Link>

        </div>
      </section>

      <main className="applications-main">
        <div className="applications-container">

          {error && (
            <div className="applications-error">
              {error}
            </div>
          )}

          {message && (
            <div className="applications-success">
              {message}
            </div>
          )}

          <section className="applications-summary">

            <div className="application-summary-card">
              <div className="application-summary-icon">
                ✓
              </div>

              <div>
                <span>Total Applications</span>
                <strong>{applications.length}</strong>
              </div>
            </div>

            <div className="application-summary-card">
              <div className="application-summary-icon">
                →
              </div>

              <div>
                <span>Applying</span>
                <strong>
                  {
                    applications.filter(
                      (item) =>
                        String(item.status).toLowerCase() ===
                        "applying"
                    ).length
                  }
                </strong>
              </div>
            </div>

            <div className="application-summary-card">
              <div className="application-summary-icon">
                ★
              </div>

              <div>
                <span>Selected</span>
                <strong>
                  {
                    applications.filter(
                      (item) =>
                        String(item.status).toLowerCase() ===
                        "selected"
                    ).length
                  }
                </strong>
              </div>
            </div>

          </section>

          <section className="applications-section">

            <div className="applications-section-heading">

              <div>
                <p className="applications-eyebrow">
                  YOUR APPLICATIONS
                </p>

                <h2>
                  Scholarship Applications
                </h2>
              </div>

              <span className="applications-count">
                {applications.length}{" "}
                {applications.length === 1
                  ? "application"
                  : "applications"}
              </span>

            </div>

            {applications.length === 0 ? (

              <div className="applications-empty">

                <div className="applications-empty-icon">
                  ✓
                </div>

                <h3>
                  No applications yet
                </h3>

                <p>
                  Track a scholarship from the Scholarships
                  page to manage it here.
                </p>

                <Link
                  to="/scholarships"
                  className="applications-small-button"
                >
                  Explore Scholarships
                </Link>

              </div>

            ) : (

              <div className="applications-list">

                {applications.map((application, index) => {

                  const name = getName(application)

                  const status =
                    application.status ||
                    "Interested"

                  return (
                    <article
                      className="application-card"
                      key={`${name}-${index}`}
                    >

                      <div className="application-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="application-content">

                        <div className="application-card-top">

                          <div>
                            <h3>{name}</h3>

                            <p>
                              {getSource(application)}
                            </p>
                          </div>

                          <span
                            className={getStatusClass(status)}
                          >
                            {status}
                          </span>

                        </div>

                        <div className="application-controls">

                          <div className="application-status-control">

                            <label>
                              Application Status
                            </label>

                            <select
                              value={status}
                              onChange={(e) =>
                                updateStatus(
                                  application,
                                  e.target.value
                                )
                              }
                            >
                              <option>
                                Interested
                              </option>

                              <option>
                                Applying
                              </option>

                              <option>
                                Applied
                              </option>

                              <option>
                                Selected
                              </option>

                              <option>
                                Rejected
                              </option>
                            </select>

                          </div>

                          <div className="application-actions">

                            <Link
                              to={`/scholarships/details?name=${encodeURIComponent(
                                name
                              )}`}
                              className="application-view-button"
                            >
                              View Details
                            </Link>

                            <button
                              onClick={() =>
                                removeApplication(
                                  application
                                )
                              }
                              className="application-remove-button"
                            >
                              Remove
                            </button>

                          </div>

                        </div>

                      </div>

                    </article>
                  )
                })}

              </div>

            )}

          </section>

          <section className="applications-info">

            <div className="applications-info-icon">
              ✓
            </div>

            <div>
              <h3>
                Keep your application status updated
              </h3>

              <p>
                FundMyFuture helps you organize your
                scholarship applications. Always verify
                application status and deadlines on the
                official scholarship portal.
              </p>
            </div>

          </section>

        </div>
      </main>

    </div>
  )
}

export default Applications 