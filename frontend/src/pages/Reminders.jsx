import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function Reminders() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [reminders, setReminders] = useState([])
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
    loadReminders(storedUser.email)
  }, [])

  async function loadReminders(email) {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `${API}/api/reminders/${encodeURIComponent(email)}`
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load reminders."
        )
      }

      setReminders(data.reminders || [])
    } catch (err) {
      console.error(err)
      setError(
        err.message ||
          "Unable to load reminders. Please make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  function getName(reminder) {
    return (
      reminder.scholarship_name ||
      reminder.name ||
      reminder.title ||
      "Scholarship"
    )
  }

  function getDeadline(reminder) {
    return (
      reminder.application_end ||
      reminder.applicationEnd ||
      reminder.deadline ||
      reminder.date ||
      "Check official portal"
    )
  }

  function getSource(reminder) {
    return (
      reminder.source ||
      reminder.provider ||
      "Official Scholarship Source"
    )
  }

  function getDays(reminder) {
    if (
      reminder.days_remaining !== undefined &&
      reminder.days_remaining !== null
    ) {
      return Number(reminder.days_remaining)
    }

    return null
  }

  function getUrgencyClass(reminder) {
    const days = getDays(reminder)

    if (days !== null && days <= 3) {
      return "reminder-card urgent"
    }

    if (days !== null && days <= 7) {
      return "reminder-card soon"
    }

    return "reminder-card normal"
  }

  function getUrgencyLabel(reminder) {
    const days = getDays(reminder)

    if (days === null) {
      return "Upcoming"
    }

    if (days <= 3) {
      return "Closing Soon"
    }

    if (days <= 7) {
      return "This Week"
    }

    return "Upcoming"
  }

  async function removeReminder(reminder) {
    if (!user?.email) return

    try {
      setMessage("")
      setError("")

      const response = await fetch(`${API}/api/reminders/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          scholarship_name: getName(reminder),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to remove reminder."
        )
      }

      setReminders((current) =>
        current.filter(
          (item) => getName(item) !== getName(reminder)
        )
      )

      setMessage("Reminder removed successfully.")
    } catch (err) {
      setError(
        err.message || "Unable to remove reminder."
      )
    }
  }

  async function addReminder(reminder) {
    if (!user?.email) return

    try {
      setMessage("")
      setError("")

      const response = await fetch(`${API}/api/reminders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          scholarship_name: getName(reminder),
          deadline: getDeadline(reminder),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to set reminder."
        )
      }

      setMessage("Reminder set successfully.")
      await loadReminders(user.email)
    } catch (err) {
      setError(
        err.message || "Unable to set reminder."
      )
    }
  }

  if (loading) {
    return (
      <div className="reminders-loading">
        <div className="reminders-spinner"></div>
        <p>Loading your reminders...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const urgentCount = reminders.filter((item) => {
    const days = getDays(item)
    return days !== null && days <= 7
  }).length

  const upcomingCount = reminders.filter((item) => {
    const days = getDays(item)
    return days === null || days > 7
  }).length

  return (
    <div className="reminders-page">

      {/* Header */}
      <section className="reminders-header">
        <div className="reminders-container reminders-header-inner">

          <div>
            <p className="reminders-eyebrow">
              DEADLINE MANAGEMENT
            </p>

            <h1>
              Stay ahead of your{" "}
              <span>scholarship deadlines.</span>
            </h1>

            <p className="reminders-subtitle">
              Keep track of important application deadlines
              and avoid missing opportunities.
            </p>
          </div>

          <Link
            to="/scholarships"
            className="reminders-primary-button"
          >
            Explore Scholarships
          </Link>

        </div>
      </section>

      <main className="reminders-main">
        <div className="reminders-container">

          {/* Messages */}

          {error && (
            <div className="reminders-error">
              {error}
            </div>
          )}

          {message && (
            <div className="reminders-success">
              {message}
            </div>
          )}

          {/* Summary */}

          <section className="reminders-summary">

            <div className="reminder-summary-card">
              <div className="reminder-summary-icon">
                ⏰
              </div>

              <div>
                <span>Total Reminders</span>
                <strong>{reminders.length}</strong>
              </div>
            </div>

            <div className="reminder-summary-card">
              <div className="reminder-summary-icon urgent-icon">
                !
              </div>

              <div>
                <span>Within 7 Days</span>
                <strong>{urgentCount}</strong>
              </div>
            </div>

            <div className="reminder-summary-card">
              <div className="reminder-summary-icon">
                ✓
              </div>

              <div>
                <span>Later Deadlines</span>
                <strong>{upcomingCount}</strong>
              </div>
            </div>

          </section>

          {/* Reminder list */}

          <section className="reminders-section">

            <div className="reminders-section-heading">
              <div>
                <p className="reminders-eyebrow">
                  YOUR REMINDERS
                </p>

                <h2>Upcoming Scholarship Deadlines</h2>
              </div>

              <span className="reminders-count">
                {reminders.length}{" "}
                {reminders.length === 1
                  ? "reminder"
                  : "reminders"}
              </span>
            </div>

            {reminders.length === 0 ? (
              <div className="reminders-empty">

                <div className="reminders-empty-icon">
                  ⏰
                </div>

                <h3>No reminders yet</h3>

                <p>
                  When you set reminders for scholarships,
                  upcoming deadlines will appear here.
                </p>

                <Link
                  to="/scholarships"
                  className="reminders-small-button"
                >
                  Find Scholarships
                </Link>

              </div>
            ) : (
              <div className="reminders-grid">

                {reminders.map((reminder, index) => {
                  const name = getName(reminder)
                  const days = getDays(reminder)

                  return (
                    <article
                      className={getUrgencyClass(reminder)}
                      key={`${name}-${index}`}
                    >

                      <div className="reminder-card-top">

                        <span className="reminder-status">
                          {getUrgencyLabel(reminder)}
                        </span>

                        <span className="reminder-bell">
                          ⏰
                        </span>

                      </div>

                      <div className="reminder-card-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <h3>{name}</h3>

                      <p className="reminder-source">
                        {getSource(reminder)}
                      </p>

                      <div className="reminder-deadline">

                        <span>Application deadline</span>

                        <strong>
                          {getDeadline(reminder)}
                        </strong>

                      </div>

                      {days !== null && (
                        <div className="reminder-days">

                          <span>
                            {days === 0
                              ? "Deadline is today"
                              : days === 1
                              ? "1 day remaining"
                              : `${days} days remaining`}
                          </span>

                        </div>
                      )}

                      <div className="reminder-card-actions">

                        <Link
                          to={`/scholarships/details?name=${encodeURIComponent(
                            name
                          )}`}
                          className="reminder-view-button"
                        >
                          View Details
                        </Link>

                        <button
                          onClick={() =>
                            removeReminder(reminder)
                          }
                          className="reminder-remove-button"
                        >
                          Remove
                        </button>

                      </div>

                    </article>
                  )
                })}

              </div>
            )}

          </section>

          {/* Information */}

          <section className="reminder-info-section">

            <div className="reminder-info-icon">
              ✓
            </div>

            <div>
              <h3>Important</h3>

              <p>
                Scholarship deadlines can change. Always
                verify the latest deadline and eligibility
                information on the official scholarship
                portal before submitting your application.
              </p>
            </div>

          </section>

        </div>
      </main>
    </div>
  )
}

export default Reminders