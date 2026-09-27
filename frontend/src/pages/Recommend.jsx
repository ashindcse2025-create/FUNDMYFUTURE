import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

const API = "http://127.0.0.1:5000"

const initialForm = {
  course: "",
  year: "",
  gender: "",
  category: "",
  income: "",
  state: "",
  disability: "",
}

function Recommend() {
  const [form, setForm] = useState(initialForm)
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const user = JSON.parse(
    localStorage.getItem("fundmyfuture_user") || "null"
  )

  useEffect(() => {
    if (user?.email) {
      loadProfile()
    }
  }, [])

  async function loadProfile() {
    try {
      setProfileLoading(true)
      setMessage("")
      setError("")

      const response = await fetch(
        `${API}/api/users/${encodeURIComponent(user.email)}`
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        return
      }

      const profile = data.user || data

      setForm({
        course: profile.course || "",
        year: profile.year || "",
        gender: profile.gender || "",
        category: profile.category || "",
        income:
          profile.income !== undefined &&
          profile.income !== null
            ? String(profile.income)
            : "",
        state: profile.state || "",
        disability: profile.disability || "",
      })

      setMessage("Your saved profile has been loaded.")
    } catch {
      // Profile loading is optional.
    } finally {
      setProfileLoading(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    setLoading(true)
    setRecommendations([])
    setMessage("")
    setError("")

    try {
      const response = await fetch(
        `${API}/api/recommendations/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            income: Number(form.income),
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate recommendations."
        )
      }

      const results = data.recommendations || []

      results.sort(
        (a, b) =>
          Number(b.match_score || 0) -
          Number(a.match_score || 0)
      )

      setRecommendations(results)

      setMessage(
        `${results.length} scholarship${
          results.length === 1 ? "" : "s"
        } matched your profile.`
      )
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong while generating recommendations."
      )
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm(initialForm)
    setRecommendations([])
    setMessage("")
    setError("")
  }

  function scoreClass(score) {
    const value = Number(score || 0)

    if (value >= 80) return "score-high"
    if (value >= 60) return "score-medium"
    return "score-low"
  }

  function formatScore(score) {
    return `${Math.round(Number(score || 0))}%`
  }

  function getSource(item) {
    return (
      item.source ||
      item.provider ||
      "Official Source"
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

  return (
    <div className="recommend-page">
      <section className="recommend-header">
        <div className="recommend-container">
          <div className="recommend-intro">
            <p className="recommend-eyebrow">
              PERSONALIZED DISCOVERY
            </p>

            <h1>
              Find scholarships
              <span> that match you.</span>
            </h1>

            <p>
              Tell us about your academic and eligibility
              profile. FundMyFuture will identify scholarship
              opportunities relevant to you.
            </p>
          </div>

          <div className="recommend-header-badge">
            <div className="recommend-badge-icon">✦</div>
            <div>
              <strong>Smart Matching</strong>
              <span>ML-powered recommendations</span>
            </div>
          </div>
        </div>
      </section>

      <main className="recommend-main">
        <div className="recommend-container">
          <div className="recommend-layout">

            {/* FORM */}
            <section className="profile-card">
              <div className="card-heading">
                <div>
                  <p className="card-eyebrow">
                    YOUR PROFILE
                  </p>
                  <h2>Tell us about yourself</h2>
                </div>

                {user?.email && (
                  <span className="profile-status">
                    {profileLoading
                      ? "Loading..."
                      : "Profile connected"}
                  </span>
                )}
              </div>

              <p className="card-description">
                These details help us check eligibility and
                find scholarships that fit your profile.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-section-title">
                  Academic information
                </div>

                <div className="recommend-form-grid">
                  <div className="recommend-field">
                    <label htmlFor="course">
                      Course
                    </label>

                    <select
                      id="course"
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select your course
                      </option>
                      <option value="Engineering">
                        Engineering
                      </option>
                      <option value="Computer Science">
                        Computer Science
                      </option>
                      <option value="Arts">
                        Arts
                      </option>
                      <option value="Science">
                        Science
                      </option>
                      <option value="Commerce">
                        Commerce
                      </option>
                      <option value="Medical">
                        Medical
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="recommend-field">
                    <label htmlFor="year">
                      Year of study
                    </label>

                    <select
                      id="year"
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select your year
                      </option>
                      <option value="1st Year">
                        1st Year
                      </option>
                      <option value="2nd Year">
                        2nd Year
                      </option>
                      <option value="3rd Year">
                        3rd Year
                      </option>
                      <option value="4th Year">
                        4th Year
                      </option>
                      <option value="Postgraduate">
                        Postgraduate
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-section-title">
                  Eligibility information
                </div>

                <div className="recommend-form-grid">
                  <div className="recommend-field">
                    <label htmlFor="gender">
                      Gender
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select gender
                      </option>
                      <option value="Male">
                        Male
                      </option>
                      <option value="Female">
                        Female
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="recommend-field">
                    <label htmlFor="category">
                      Category
                    </label>

                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select category
                      </option>
                      <option value="General">
                        General
                      </option>
                      <option value="OBC">
                        OBC
                      </option>
                      <option value="SC">
                        SC
                      </option>
                      <option value="ST">
                        ST
                      </option>
                      <option value="EWS">
                        EWS
                      </option>
                    </select>
                  </div>

                  <div className="recommend-field">
                    <label htmlFor="income">
                      Annual family income
                    </label>

                    <div className="income-input">
                      <span>₹</span>
                      <input
                        id="income"
                        name="income"
                        type="number"
                        min="0"
                        placeholder="Enter annual income"
                        value={form.income}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="recommend-field">
                    <label htmlFor="state">
                      State
                    </label>

                    <select
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select your state
                      </option>
                      <option value="Tamil Nadu">
                        Tamil Nadu
                      </option>
                      <option value="Kerala">
                        Kerala
                      </option>
                      <option value="Karnataka">
                        Karnataka
                      </option>
                      <option value="Andhra Pradesh">
                        Andhra Pradesh
                      </option>
                      <option value="Telangana">
                        Telangana
                      </option>
                      <option value="Maharashtra">
                        Maharashtra
                      </option>
                      <option value="Delhi">
                        Delhi
                      </option>
                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="recommend-field">
                    <label htmlFor="disability">
                      Disability
                    </label>

                    <select
                      id="disability"
                      name="disability"
                      value={form.disability}
                      onChange={handleChange}
                      required
                    >
                      <option value="">
                        Select an option
                      </option>
                      <option value="Yes">
                        Yes
                      </option>
                      <option value="No">
                        No
                      </option>
                    </select>
                  </div>
                </div>

                {message && (
                  <div className="recommend-message">
                    <span>✓</span>
                    {message}
                  </div>
                )}

                {error && (
                  <div className="recommend-error">
                    <span>!</span>
                    {error}
                  </div>
                )}

                <div className="recommend-form-actions">
                  <button
                    type="button"
                    className="recommend-reset-button"
                    onClick={resetForm}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="recommend-submit-button"
                    disabled={loading}
                  >
                    {loading
                      ? "Finding matches..."
                      : "Find My Scholarships →"}
                  </button>
                </div>
              </form>
            </section>

            {/* RESULTS */}
            <section className="recommend-results">
              <div className="results-heading">
                <div>
                  <p className="card-eyebrow">
                    YOUR RESULTS
                  </p>

                  <h2>
                    Recommended scholarships
                  </h2>
                </div>

                {recommendations.length > 0 && (
                  <span className="result-count">
                    {recommendations.length} matches
                  </span>
                )}
              </div>

              {loading ? (
                <div className="recommend-loading">
                  <div className="recommend-spinner"></div>
                  <h3>Finding your matches</h3>
                  <p>
                    Checking eligibility and scholarship
                    relevance...
                  </p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="recommend-empty">
                  <div className="empty-match-icon">
                    ✦
                  </div>

                  <h3>
                    Your personalized matches will appear here.
                  </h3>

                  <p>
                    Complete your profile and click
                    <strong> Find My Scholarships </strong>
                    to discover relevant opportunities.
                  </p>

                  <div className="empty-features">
                    <span>✓ Eligibility check</span>
                    <span>✓ ML matching</span>
                    <span>✓ Official sources</span>
                  </div>
                </div>
              ) : (
                <div className="recommendation-list">
                  {recommendations.map(
                    (item, index) => {
                      const matchScore =
                        Number(item.match_score || 0)

                      const eligibilityScore =
                        Number(
                          item.eligibility_score || 0
                        )

                      const deadline =
                        getDeadline(item)

                      return (
                        <article
                          className="recommendation-card"
                          key={
                            item.name ||
                            item.scholarship_name ||
                            index
                          }
                        >
                          <div className="recommendation-top">
                            <div>
                              <span className="recommendation-number">
                                {String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                              <span className="recommendation-source">
                                {getSource(item)}
                              </span>
                            </div>

                            <div
                              className={`match-score ${scoreClass(
                                matchScore
                              )}`}
                            >
                              <strong>
                                {formatScore(matchScore)}
                              </strong>
                              <span>match</span>
                            </div>
                          </div>

                          <h3>
                            {item.name ||
                              item.scholarship_name}
                          </h3>

                          <p className="recommendation-description">
                            {item.description ||
                              "Scholarship opportunity matched to your profile."}
                          </p>

                          <div className="recommendation-stats">
                            <div>
                              <span>
                                Eligibility
                              </span>

                              <strong>
                                {formatScore(
                                  eligibilityScore
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Deadline
                              </span>

                              <strong>
                                {deadline ||
                                  "See official website"}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Type
                              </span>

                              <strong>
                                {item.type ||
                                  "Scholarship"}
                              </strong>
                            </div>
                          </div>

                          {item.reasons?.length > 0 && (
                            <div className="match-reasons">
                              <span className="reason-title">
                                Why this matches
                              </span>

                              <div>
                                {item.reasons.map(
                                  (reason, reasonIndex) => (
                                    <span
                                      key={reasonIndex}
                                      className="reason-tag"
                                    >
                                      ✓ {reason}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {item.warnings?.length > 0 && (
                            <div className="match-warnings">
                              <span>!</span>

                              <div>
                                <strong>
                                  Check before applying
                                </strong>

                                {item.warnings.map(
                                  (
                                    warning,
                                    warningIndex
                                  ) => (
                                    <p
                                      key={
                                        warningIndex
                                      }
                                    >
                                      {warning}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div className="recommendation-actions">
                            <Link
                              to={`/scholarships/details?name=${encodeURIComponent(
                                item.name ||
                                  item.scholarship_name ||
                                  ""
                              )}`}
                              className="recommend-details-button"
                            >
                              View scholarship details →
                            </Link>
                          </div>
                        </article>
                      )
                    }
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Recommend