import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function ScholarshipDetails() {
  const [searchParams] = useSearchParams()
  const scholarshipName = searchParams.get("name")

  const [scholarship, setScholarship] = useState(null)
  const [reminderSet, setReminderSet] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const user = JSON.parse(
    localStorage.getItem("fundmyfuture_user") || "null"
  )

  useEffect(() => {
    loadScholarship()
  }, [scholarshipName])

  useEffect(() => {
    if (user?.email && scholarshipName) {
      checkReminder()
    }
  }, [scholarshipName])

  async function loadScholarship() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API}/api/scholarships/`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load scholarship"
        )
      }

      const found = (data.scholarships || []).find(
        (item) =>
          item.name?.toLowerCase() ===
          scholarshipName?.toLowerCase()
      )

      if (!found) {
        throw new Error("Scholarship not found")
      }

      setScholarship(found)
    } catch (err) {
      setError(err.message || "Unable to load scholarship")
    } finally {
      setLoading(false)
    }
  }

  async function checkReminder() {
    try {
      const response = await fetch(
        `${API}/api/reminders/${encodeURIComponent(
          user.email
        )}`
      )

      const data = await response.json()

      if (response.ok && data.success) {
        const reminders = data.reminders || []

        setReminderSet(
          reminders.some(
            (item) =>
              item.scholarship_name?.toLowerCase() ===
              scholarshipName?.toLowerCase()
          )
        )
      }
    } catch {
      // Reminder status is optional.
    }
  }

  async function toggleReminder() {
    if (!user?.email) {
      setMessage("Please login to set a reminder.")
      return
    }

    try {
      setMessage("")

      if (reminderSet) {
        const response = await fetch(`${API}/api/reminders/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            scholarship_name: scholarship.name,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to remove reminder"
          )
        }

        setReminderSet(false)
        setMessage("Reminder removed successfully.")
      } else {
        const response = await fetch(`${API}/api/reminders/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            scholarship_name: scholarship.name,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to set reminder"
          )
        }

        setReminderSet(true)
        setMessage(
          "Reminder set successfully. You can manage it from Reminders."
        )
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.")
    }
  }

  function getValue(...values) {
    return values.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
  }

  if (loading) {
    return (
      <div className="details-loading">
        <div className="details-spinner"></div>
        <p>Loading scholarship details...</p>
      </div>
    )
  }

  if (error || !scholarship) {
    return (
      <div className="details-error-page">
        <div className="details-error-box">
          <div className="details-error-icon">!</div>

          <h2>Scholarship not found</h2>

          <p>
            {error ||
              "The scholarship you are looking for could not be found."}
          </p>

          <Link
            to="/scholarships"
            className="details-primary-button"
          >
            ← Back to Scholarships
          </Link>
        </div>
      </div>
    )
  }

  const source =
    getValue(
      scholarship.source,
      scholarship.provider
    ) || "Official Source"

  const type =
    scholarship.type || "Scholarship"

  const startDate = getValue(
    scholarship.application_start,
    scholarship.applicationStart
  )

  const endDate = getValue(
    scholarship.application_end,
    scholarship.applicationEnd,
    scholarship.deadline
  )

  const academicYear =
    getValue(
      scholarship.academic_year,
      scholarship.academicYear,
      scholarship.year
    ) || "2026–27"

  const eligibility =
    getValue(
      scholarship.eligibility,
      scholarship.eligibility_criteria,
      scholarship.eligibilityCriteria
    )

  const description =
    scholarship.description ||
    "Please refer to the official scholarship guidelines for complete information about this opportunity."

  const specificationUrl =
    getValue(
      scholarship.specification_url,
      scholarship.specificationUrl,
      scholarship.official_url,
      scholarship.officialUrl,
      scholarship.url
    )

  const faqUrl =
    getValue(
      scholarship.faq_url,
      scholarship.faqUrl
    )

  return (
    <div className="scholarship-details-page">

      {/* TOP HEADER */}

      <section className="details-header">
        <div className="details-container">

          <Link
            to="/scholarships"
            className="back-link"
          >
            ← Back to scholarships
          </Link>

          <div className="details-header-content">

            <div className="details-title-area">

              <div className="details-tags">
                <span className="details-type">
                  {type}
                </span>

                <span className="details-source">
                  {source}
                </span>
              </div>

              <h1>{scholarship.name}</h1>

              <p>
                Official scholarship information for students
                seeking financial and educational support.
              </p>

            </div>

            <div className="details-year">
              <span>ACADEMIC YEAR</span>
              <strong>{academicYear}</strong>
            </div>

          </div>

        </div>
      </section>


      {/* MAIN */}

      <main className="details-main">
        <div className="details-container details-layout">

          {/* LEFT */}

          <div className="details-content">

            {message && (
              <div className="details-message">
                {message}
              </div>
            )}


            {/* APPLICATION DATES */}

            <section className="details-section dates-section">

              <div className="section-label">
                APPLICATION PERIOD
              </div>

              <div className="dates-grid">

                <div className="date-box">
                  <span>Application opens</span>

                  <strong>
                    {startDate || "Not specified"}
                  </strong>
                </div>

                <div className="date-box">
                  <span>Application deadline</span>

                  <strong className="deadline-value">
                    {endDate || "Not specified"}
                  </strong>
                </div>

              </div>

            </section>


            {/* DESCRIPTION */}

            <section className="details-section">

              <div className="section-label">
                ABOUT THIS SCHOLARSHIP
              </div>

              <h2>Overview</h2>

              <p className="details-paragraph">
                {description}
              </p>

            </section>


            {/* ELIGIBILITY */}

            <section className="details-section">

              <div className="section-label">
                ELIGIBILITY
              </div>

              <h2>
                Who can apply?
              </h2>

              {eligibility ? (
                <div className="eligibility-box">
                  {eligibility}
                </div>
              ) : (
                <div className="info-note">
                  <span>i</span>

                  <p>
                    Eligibility details may vary. Please check
                    the official scholarship guidelines before
                    applying.
                  </p>
                </div>
              )}

            </section>


            {/* IMPORTANT INFORMATION */}

            <section className="details-section">

              <div className="section-label">
                IMPORTANT INFORMATION
              </div>

              <div className="information-list">

                <div className="information-item">
                  <span className="information-icon">
                    ✓
                  </span>

                  <div>
                    <strong>
                      Verify eligibility
                    </strong>

                    <p>
                      Review the official eligibility
                      requirements before starting your
                      application.
                    </p>
                  </div>
                </div>


                <div className="information-item">
                  <span className="information-icon">
                    ↗
                  </span>

                  <div>
                    <strong>
                      Apply through the official portal
                    </strong>

                    <p>
                      FundMyFuture provides scholarship
                      discovery support. Applications should
                      be submitted through the official portal.
                    </p>
                  </div>
                </div>


                <div className="information-item">
                  <span className="information-icon">
                    !
                  </span>

                  <div>
                    <strong>
                      Check deadlines
                    </strong>

                    <p>
                      Application dates can change. Confirm
                      the current deadline on the official
                      scholarship website.
                    </p>
                  </div>
                </div>

              </div>

            </section>

          </div>


          {/* RIGHT SIDEBAR */}

          <aside className="details-sidebar">

            <div className="apply-card">

              <div className="apply-card-label">
                READY TO APPLY?
              </div>

              <h3>
                Continue to the official website.
              </h3>

              <p>
                Read the complete guidelines and submit
                your application through the official
                scholarship portal.
              </p>

              {specificationUrl ? (
                <a
                  href={specificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="official-button"
                >
                  Apply on Official Website ↗
                </a>
              ) : (
                <div className="unavailable-link">
                  Official application link unavailable
                </div>
              )}

            </div>


            {/* REMINDER */}

            <div className="sidebar-card">

              <div className="sidebar-card-icon">
                {reminderSet ? "✓" : "🔔"}
              </div>

              <h3>
                {reminderSet
                  ? "Reminder is set"
                  : "Don't miss the deadline"}
              </h3>

              <p>
                {reminderSet
                  ? "We'll keep this scholarship in your reminder list."
                  : "Set a reminder and keep this scholarship on your dashboard."}
              </p>

              <button
                className={
                  reminderSet
                    ? "remove-reminder-button"
                    : "reminder-button"
                }
                onClick={toggleReminder}
              >
                {reminderSet
                  ? "Remove Reminder"
                  : "Set Reminder"}
              </button>

            </div>


            {/* QUICK INFO */}

            <div className="sidebar-card quick-info">

              <div className="sidebar-card-label">
                QUICK INFORMATION
              </div>

              <div className="quick-row">
                <span>Source</span>
                <strong>{source}</strong>
              </div>

              <div className="quick-row">
                <span>Type</span>
                <strong>{type}</strong>
              </div>

              <div className="quick-row">
                <span>Academic year</span>
                <strong>{academicYear}</strong>
              </div>

              <div className="quick-row">
                <span>Deadline</span>
                <strong>{endDate || "Not specified"}</strong>
              </div>

            </div>


            {/* FAQ */}

            {faqUrl && (
              <a
                href={faqUrl}
                target="_blank"
                rel="noreferrer"
                className="faq-link"
              >
                View official FAQs ↗
              </a>
            )}

          </aside>

        </div>
      </main>

    </div>
  )
}

export default ScholarshipDetails