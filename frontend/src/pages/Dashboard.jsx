import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function Dashboard() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [saved, setSaved] = useState([])
  const [applications, setApplications] = useState([])
  const [reminders, setReminders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("fundmyfuture_user") || "null"
    )

    if (!storedUser?.email) {
      navigate("/login")
      return
    }

    setUser(storedUser)
    loadDashboard(storedUser.email)
  }, [])

  async function loadDashboard(email) {
    try {
      setLoading(true)
      setError("")

      const encodedEmail = encodeURIComponent(email)

      const [
        profileResponse,
        savedResponse,
        applicationsResponse,
        remindersResponse,
      ] = await Promise.all([
        fetch(`${API}/api/users/${encodedEmail}`),
        fetch(`${API}/api/saved/${encodedEmail}`),
        fetch(`${API}/api/applications/${encodedEmail}`),
        fetch(`${API}/api/reminders/${encodedEmail}`),
      ])

      const profileData = await profileResponse.json()
      const savedData = await savedResponse.json()
      const applicationsData = await applicationsResponse.json()
      const remindersData = await remindersResponse.json()

      if (profileResponse.ok && profileData.success) {
        const profile = profileData.user || profileData

        setUser(profile)

        localStorage.setItem(
          "fundmyfuture_user",
          JSON.stringify(profile)
        )
      }

      if (savedResponse.ok && savedData.success) {
        setSaved(savedData.saved || savedData.scholarships || [])
      }

      if (applicationsResponse.ok && applicationsData.success) {
        setApplications(
          applicationsData.applications || []
        )
      }

      if (remindersResponse.ok && remindersData.success) {
        setReminders(remindersData.reminders || [])
      }
    } catch (err) {
      console.error(err)
      setError(
        "Unable to load your dashboard. Please make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  async function removeSaved(item) {
    if (!user?.email) return

    try {
      const response = await fetch(`${API}/api/saved/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          scholarship_name:
            item.scholarship_name ||
            item.name ||
            item.title,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSaved((current) =>
          current.filter(
            (savedItem) =>
              (savedItem.scholarship_name ||
                savedItem.name ||
                savedItem.title) !==
              (item.scholarship_name ||
                item.name ||
                item.title)
          )
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  function getScholarshipName(item) {
    return (
      item.scholarship_name ||
      item.name ||
      item.title ||
      "Scholarship"
    )
  }

  function getDeadline(item) {
    return (
      item.application_end ||
      item.applicationEnd ||
      item.deadline ||
      ""
    )
  }

  function getStatusClass(status) {
    const value = String(status || "").toLowerCase()

    if (value === "selected") {
      return "dashboard-status selected"
    }

    if (value === "applied") {
      return "dashboard-status applied"
    }

    if (value === "applying") {
      return "dashboard-status applying"
    }

    if (value === "rejected") {
      return "dashboard-status rejected"
    }

    return "dashboard-status interested"
  }

  function handleLogout() {
    localStorage.removeItem("fundmyfuture_user")
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <section className="dashboard-header">
        <div className="dashboard-container dashboard-header-inner">

          <div>
            <p className="dashboard-eyebrow">
              STUDENT DASHBOARD
            </p>

            <h1>
              Welcome back,{" "}
              <span>{user.name || "Student"}</span>
            </h1>

            <p className="dashboard-subtitle">
              Manage your scholarships, applications and
              profile from one place.
            </p>
          </div>

          <div className="dashboard-header-actions">
            <Link
              to="/recommend"
              className="dashboard-primary-button"
            >
              Find Scholarships
            </Link>

            <button
              onClick={handleLogout}
              className="dashboard-logout-button"
            >
              Logout
            </button>
          </div>

        </div>
      </section>

      <main className="dashboard-main">
        <div className="dashboard-container">

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          {/* Statistics */}
          <section className="dashboard-stats">

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                ♡
              </div>

              <div>
                <span>Saved Scholarships</span>
                <strong>{saved.length}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                ✓
              </div>

              <div>
                <span>Applications</span>
                <strong>{applications.length}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                ⏰
              </div>

              <div>
                <span>Upcoming Deadlines</span>
                <strong>{reminders.length}</strong>
              </div>
            </div>

            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon">
                ✦
              </div>

              <div>
                <span>Profile Status</span>
                <strong>Active</strong>
              </div>
            </div>

          </section>

          {/* Quick actions */}
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-eyebrow">
                  QUICK ACTIONS
                </p>

                <h2>What would you like to do?</h2>
              </div>
            </div>

            <div className="dashboard-action-grid">

              <Link
                to="/recommend"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-number">
                  01
                </span>

                <div>
                  <h3>Get Recommendations</h3>
                  <p>
                    Find scholarships based on your
                    profile and eligibility.
                  </p>
                </div>

                <span className="dashboard-action-arrow">
                  →
                </span>
              </Link>

              <Link
                to="/scholarships"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-number">
                  02
                </span>

                <div>
                  <h3>Explore Scholarships</h3>
                  <p>
                    Browse scholarship opportunities from
                    official sources.
                  </p>
                </div>

                <span className="dashboard-action-arrow">
                  →
                </span>
              </Link>

              <Link
                to="/applications"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-number">
                  03
                </span>

                <div>
                  <h3>Manage Applications</h3>
                  <p>
                    Track the progress of your scholarship
                    applications.
                  </p>
                </div>

                <span className="dashboard-action-arrow">
                  →
                </span>
              </Link>

              <Link
                to="/reminders"
                className="dashboard-action-card"
              >
                <span className="dashboard-action-number">
                  04
                </span>

                <div>
                  <h3>View Reminders</h3>
                  <p>
                    Check upcoming scholarship deadlines
                    and reminders.
                  </p>
                </div>

                <span className="dashboard-action-arrow">
                  →
                </span>
              </Link>

            </div>
          </section>

          {/* Saved Scholarships */}
          <section className="dashboard-section">

            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-eyebrow">
                  SAVED
                </p>

                <h2>Saved Scholarships</h2>
              </div>

              <Link
                to="/scholarships"
                className="dashboard-view-link"
              >
                Explore more →
              </Link>
            </div>

            {saved.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  ♡
                </div>

                <h3>No saved scholarships yet</h3>

                <p>
                  Save scholarships you are interested in
                  and they will appear here.
                </p>

                <Link
                  to="/scholarships"
                  className="dashboard-small-button"
                >
                  Explore Scholarships
                </Link>
              </div>
            ) : (
              <div className="dashboard-list">

                {saved.slice(0, 5).map((item, index) => {
                  const name = getScholarshipName(item)

                  return (
                    <div
                      className="dashboard-scholarship-row"
                      key={`${name}-${index}`}
                    >

                      <div className="dashboard-row-icon">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="dashboard-row-content">
                        <h3>{name}</h3>

                        <p>
                          {item.source ||
                            item.provider ||
                            "Official Scholarship"}
                        </p>

                        {getDeadline(item) && (
                          <small>
                            Deadline: {getDeadline(item)}
                          </small>
                        )}
                      </div>

                      <div className="dashboard-row-actions">

                        <Link
                          to={`/scholarships/details?name=${encodeURIComponent(
                            name
                          )}`}
                          className="dashboard-row-button"
                        >
                          View
                        </Link>

                        <button
                          onClick={() => removeSaved(item)}
                          className="dashboard-remove-button"
                        >
                          Remove
                        </button>

                      </div>

                    </div>
                  )
                })}

              </div>
            )}
          </section>

          {/* Applications */}
          <section className="dashboard-section">

            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-eyebrow">
                  APPLICATIONS
                </p>

                <h2>My Applications</h2>
              </div>

              <Link
                to="/applications"
                className="dashboard-view-link"
              >
                Manage all →
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  ✓
                </div>

                <h3>No applications yet</h3>

                <p>
                  Track a scholarship application to see
                  it here.
                </p>

                <Link
                  to="/scholarships"
                  className="dashboard-small-button"
                >
                  Find Scholarships
                </Link>
              </div>
            ) : (
              <div className="dashboard-list">

                {applications.slice(0, 5).map((application, index) => {
                  const name = getScholarshipName(application)
                  const status =
                    application.status || "Interested"

                  return (
                    <div
                      className="dashboard-application-row"
                      key={`${name}-${index}`}
                    >

                      <div className="dashboard-row-icon">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="dashboard-row-content">
                        <h3>{name}</h3>

                        <p>
                          {application.source ||
                            application.provider ||
                            "Scholarship Application"}
                        </p>
                      </div>

                      <div className="dashboard-application-right">

                        <span
                          className={getStatusClass(status)}
                        >
                          {status}
                        </span>

                        <Link
                          to="/applications"
                          className="dashboard-row-button"
                        >
                          Manage
                        </Link>

                      </div>

                    </div>
                  )
                })}

              </div>
            )}
          </section>

          {/* Deadlines */}
          <section className="dashboard-section">

            <div className="dashboard-section-heading">
              <div>
                <p className="dashboard-eyebrow">
                  DEADLINES
                </p>

                <h2>Upcoming Deadlines</h2>
              </div>

              <Link
                to="/reminders"
                className="dashboard-view-link"
              >
                View all →
              </Link>
            </div>

            {reminders.length === 0 ? (
              <div className="dashboard-empty">
                <div className="dashboard-empty-icon">
                  ⏰
                </div>

                <h3>No upcoming deadlines</h3>

                <p>
                  Your upcoming scholarship reminders will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="dashboard-deadline-grid">

                {reminders.slice(0, 3).map((reminder, index) => (
                  <div
                    className="dashboard-deadline-card"
                    key={`${getScholarshipName(
                      reminder
                    )}-${index}`}
                  >

                    <div className="deadline-top">
                      <span>
                        {reminder.days_remaining !==
                        undefined
                          ? `${reminder.days_remaining} days left`
                          : "Upcoming"}
                      </span>

                      <span>⏰</span>
                    </div>

                    <h3>
                      {getScholarshipName(reminder)}
                    </h3>

                    <p>
                      Deadline:{" "}
                      {getDeadline(reminder) ||
                        reminder.deadline ||
                        "Check official portal"}
                    </p>

                    <Link
                      to={`/scholarships/details?name=${encodeURIComponent(
                        getScholarshipName(reminder)
                      )}`}
                      className="deadline-link"
                    >
                      View Scholarship →
                    </Link>

                  </div>
                ))}

              </div>
            )}
          </section>

          {/* Profile */}
          <section className="dashboard-profile-section">

            <div className="dashboard-profile-info">

              <p className="dashboard-eyebrow">
                YOUR PROFILE
              </p>

              <h2>
                {user.name || "Student"}
              </h2>

              <p className="dashboard-profile-email">
                {user.email}
              </p>

              <div className="dashboard-profile-tags">

                {user.course && (
                  <span>{user.course}</span>
                )}

                {user.year && (
                  <span>{user.year}</span>
                )}

                {user.category && (
                  <span>{user.category}</span>
                )}

                {user.state && (
                  <span>{user.state}</span>
                )}

              </div>

            </div>

            <div className="dashboard-profile-actions">

              <Link
                to="/edit-profile"
                className="dashboard-primary-button"
              >
                Edit Profile
              </Link>

              <Link
                to="/recommend"
                className="dashboard-outline-button"
              >
                Update Recommendations
              </Link>

            </div>

          </section>

          {/* Footer note */}
          <div className="dashboard-note">
            <strong>FundMyFuture</strong>

            <span>
              Scholarship information should always be
              verified on the official scholarship portal
              before applying.
            </span>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Dashboard