import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function Scholarships() {
  const navigate = useNavigate()

  const [scholarships, setScholarships] = useState([])
  const [savedScholarships, setSavedScholarships] = useState([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [sourceFilter, setSourceFilter] = useState("All")

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const user = JSON.parse(
    localStorage.getItem("fundmyfuture_user") || "null"
  )

  useEffect(() => {
    loadScholarships()

    if (user?.email) {
      loadSavedScholarships()
    }
  }, [])

  async function loadScholarships() {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${API}/api/scholarships/`)
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load scholarships")
      }

      setScholarships(data.scholarships || [])
    } catch (err) {
      setError(err.message || "Unable to load scholarships")
    } finally {
      setLoading(false)
    }
  }

  async function loadSavedScholarships() {
    try {
      const response = await fetch(
        `${API}/api/saved/${encodeURIComponent(user.email)}`
      )

      const data = await response.json()

      if (response.ok && data.success) {
        setSavedScholarships(data.saved || data.scholarships || [])
      }
    } catch {
      // Saved scholarships are optional for this page.
    }
  }

  const types = useMemo(() => {
    const values = scholarships
      .map((item) => item.type)
      .filter(Boolean)

    return ["All", ...new Set(values)]
  }, [scholarships])

  const sources = useMemo(() => {
    const values = scholarships
      .map((item) => item.source || item.provider)
      .filter(Boolean)

    return ["All", ...new Set(values)]
  }, [scholarships])

  const filteredScholarships = useMemo(() => {
    const query = search.trim().toLowerCase()

    return scholarships.filter((item) => {
      const name = (item.name || "").toLowerCase()
      const description = (item.description || "").toLowerCase()
      const provider = (
        item.provider ||
        item.source ||
        ""
      ).toLowerCase()

      const matchesSearch =
        !query ||
        name.includes(query) ||
        description.includes(query) ||
        provider.includes(query)

      const matchesType =
        typeFilter === "All" ||
        item.type === typeFilter

      const itemSource = item.source || item.provider || ""

      const matchesSource =
        sourceFilter === "All" ||
        itemSource === sourceFilter

      return matchesSearch && matchesType && matchesSource
    })
  }, [
    scholarships,
    search,
    typeFilter,
    sourceFilter,
  ])

  function getSavedName(item) {
    if (typeof item === "string") return item

    return (
      item?.name ||
      item?.scholarship_name ||
      item?.scholarshipName ||
      ""
    )
  }

  function isSaved(scholarship) {
    return savedScholarships.some(
      (item) =>
        getSavedName(item).toLowerCase() ===
        (scholarship.name || "").toLowerCase()
    )
  }

  async function toggleSave(scholarship) {
    if (!user?.email) {
      navigate("/login")
      return
    }

    try {
      setMessage("")

      if (isSaved(scholarship)) {
        const response = await fetch(`${API}/api/saved/`, {
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
            data.message || "Unable to remove scholarship"
          )
        }

        setSavedScholarships((current) =>
          current.filter(
            (item) =>
              getSavedName(item).toLowerCase() !==
              scholarship.name.toLowerCase()
          )
        )

        setMessage("Scholarship removed from your saved list.")
      } else {
        const response = await fetch(`${API}/api/saved/`, {
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
            data.message || "Unable to save scholarship"
          )
        }

        setSavedScholarships((current) => [
          ...current,
          scholarship,
        ])

        setMessage("Scholarship saved successfully.")
      }
    } catch (err) {
      setMessage(err.message || "Something went wrong.")
    }
  }

  async function trackApplication(scholarship) {
    if (!user?.email) {
      navigate("/login")
      return
    }

    try {
      setMessage("")

      const response = await fetch(`${API}/api/applications/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          scholarship_name: scholarship.name,
          status: "Interested",
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to track application"
        )
      }

      setMessage(
        "Scholarship added to your application tracker."
      )
    } catch (err) {
      setMessage(err.message || "Something went wrong.")
    }
  }

  function clearFilters() {
    setSearch("")
    setTypeFilter("All")
    setSourceFilter("All")
  }

  function formatDeadline(value) {
    if (!value) return "Not specified"

    return value
  }

  function getDeadlineClass(value) {
    if (!value) return ""

    const parts = value.split("-")

    if (parts.length !== 3) return ""

    const day = Number(parts[0])
    const month = Number(parts[1]) - 1
    const year = Number(parts[2])

    const deadline = new Date(year, month, day)
    const today = new Date()

    const difference =
      (deadline - today) / (1000 * 60 * 60 * 24)

    if (difference <= 7) return "deadline-danger"
    if (difference <= 30) return "deadline-warning"

    return ""
  }

  return (
    <div className="scholarships-page">

      {/* HEADER */}
      <section className="scholarships-header">
        <div className="scholarships-container">

          <div className="page-intro">
            <p className="page-eyebrow">
              SCHOLARSHIP DIRECTORY
            </p>

            <h1>
              Discover opportunities
              <span> made for students.</span>
            </h1>

            <p>
              Explore scholarships collected from official sources
              and find opportunities relevant to your education.
            </p>
          </div>

          <div className="directory-stat">
            <strong>{scholarships.length}</strong>
            <span>Scholarships</span>
          </div>

        </div>
      </section>


      {/* FILTER BAR */}
      <section className="filter-section">
        <div className="scholarships-container">

          <div className="filter-bar">

            <div className="search-box">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search scholarships..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === "All" ? "All Types" : type}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) =>
                setSourceFilter(e.target.value)
              }
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source === "All" ? "All Sources" : source}
                </option>
              ))}
            </select>

            <button
              className="clear-button"
              onClick={clearFilters}
            >
              Clear
            </button>

          </div>

        </div>
      </section>


      {/* CONTENT */}
      <main className="scholarships-main">
        <div className="scholarships-container">

          {message && (
            <div className="page-message">
              {message}
            </div>
          )}

          {error && (
            <div className="page-error">
              {error}

              <button onClick={loadScholarships}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="results-header">
              <div>
                <h2>Available scholarships</h2>

                <p>
                  Showing {filteredScholarships.length} of{" "}
                  {scholarships.length} opportunities
                </p>
              </div>

              <Link
                to="/recommend"
                className="recommend-link"
              >
                Get personalized matches →
              </Link>
            </div>
          )}


          {loading ? (
            <div className="loading-state">
              <div className="loading-circle"></div>
              <p>Loading scholarships...</p>
            </div>
          ) : filteredScholarships.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🔎
              </div>

              <h3>
                No scholarships found
              </h3>

              <p>
                Try changing your search or filters.
              </p>

              <button
                className="primary-small-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>

            </div>

          ) : (

            <div className="scholarship-grid">

              {filteredScholarships.map((scholarship, index) => {

                const saved = isSaved(scholarship)

                const source =
                  scholarship.source ||
                  scholarship.provider ||
                  "Official Source"

                const deadline =
                  scholarship.application_end ||
                  scholarship.applicationEnd ||
                  scholarship.deadline ||
                  ""

                const startDate =
                  scholarship.application_start ||
                  scholarship.applicationStart ||
                  ""

                return (
                  <article
                    className="scholarship-card"
                    key={
                      scholarship.name ||
                      scholarship._id ||
                      index
                    }
                  >

                    <div className="card-top">

                      <div className="scholarship-type">
                        {scholarship.type ||
                          "Scholarship"}
                      </div>

                      <button
                        className={`save-button ${
                          saved ? "saved" : ""
                        }`}
                        onClick={() =>
                          toggleSave(scholarship)
                        }
                        title={
                          saved
                            ? "Remove from saved"
                            : "Save scholarship"
                        }
                      >
                        {saved ? "♥" : "♡"}
                      </button>

                    </div>


                    <h3 className="scholarship-title">
                      {scholarship.name}
                    </h3>


                    <p className="scholarship-description">
                      {scholarship.description ||
                        "View the official scholarship information to learn about eligibility, benefits and application requirements."}
                    </p>


                    <div className="scholarship-meta">

                      <div>
                        <span>Source</span>
                        <strong>{source}</strong>
                      </div>

                      <div>
                        <span>Application period</span>

                        <strong>
                          {startDate && deadline
                            ? `${startDate} – ${deadline}`
                            : deadline
                              ? `Until ${deadline}`
                              : "See official website"}
                        </strong>
                      </div>

                    </div>


                    <div
                      className={`deadline-row ${getDeadlineClass(
                        deadline
                      )}`}
                    >
                      <span>
                        Application deadline
                      </span>

                      <strong>
                        {formatDeadline(deadline)}
                      </strong>
                    </div>


                    <div className="card-actions">

                      <Link
                        to={`/scholarships/details?name=${encodeURIComponent(
                          scholarship.name
                        )}`}
                        className="details-button"
                      >
                        View details
                      </Link>

                      <button
                        className="track-button"
                        onClick={() =>
                          trackApplication(
                            scholarship
                          )
                        }
                      >
                        Track application
                      </button>

                    </div>

                  </article>
                )
              })}

            </div>
          )}

        </div>
      </main>

    </div>
  )
}

export default Scholarships