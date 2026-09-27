import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API = "http://127.0.0.1:5000"

function EditProfile() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)

  const [form, setForm] = useState({
    name: "",
    course: "",
    year: "",
    gender: "",
    category: "",
    income: "",
    state: "",
    disability: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("fundmyfuture_user") || "null"
    )

    if (!storedUser?.email) {
      navigate("/login")
      return
    }

    setUser(storedUser)
    loadProfile(storedUser.email)
  }, [])

  async function loadProfile(email) {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `${API}/api/users/${encodeURIComponent(email)}`
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load profile."
        )
      }

      const profile = data.user || data

      setForm({
        name: profile.name || "",
        course: profile.course || "",
        year: profile.year || "",
        gender: profile.gender || "",
        category: profile.category || "",
        income: profile.income ?? "",
        state: profile.state || "",
        disability: profile.disability || "",
      })
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          "Unable to load your profile. Please make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

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

    if (!form.name || !form.income) {
      setError("Name and annual family income are required.")
      return
    }

    try {
      setSaving(true)

      const response = await fetch(
        `${API}/api/users/update/${encodeURIComponent(
          user.email
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            course: form.course,
            year: form.year,
            gender: form.gender,
            category: form.category,
            income: Number(form.income),
            state: form.state,
            disability: form.disability,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update profile."
        )
      }

      const updatedUser = {
        ...(data.user || user),
        email: user.email,
        name: form.name,
        course: form.course,
        year: form.year,
        gender: form.gender,
        category: form.category,
        income: Number(form.income),
        state: form.state,
        disability: form.disability,
      }

      localStorage.setItem(
        "fundmyfuture_user",
        JSON.stringify(updatedUser)
      )

      setUser(updatedUser)

      setSuccess(
        "Profile updated successfully!"
      )
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
          "Unable to update your profile."
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="edit-profile-loading">
        <div className="edit-profile-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="edit-profile-page">

      <section className="edit-profile-header">
        <div className="edit-profile-container">

          <Link
            to="/dashboard"
            className="edit-profile-back"
          >
            ← Back to Dashboard
          </Link>

          <p className="edit-profile-eyebrow">
            ACCOUNT SETTINGS
          </p>

          <h1>
            Edit your <span>profile.</span>
          </h1>

          <p className="edit-profile-subtitle">
            Keep your academic and eligibility details
            updated to receive more relevant scholarship
            recommendations.
          </p>

        </div>
      </section>

      <main className="edit-profile-main">

        <div className="edit-profile-container">

          {error && (
            <div className="edit-profile-error">
              {error}
            </div>
          )}

          {success && (
            <div className="edit-profile-success">
              {success}
            </div>
          )}

          <div className="edit-profile-layout">

            <aside className="edit-profile-side">

              <div className="edit-profile-avatar">
                {form.name
                  ? form.name.charAt(0).toUpperCase()
                  : "S"}
              </div>

              <h2>
                {form.name || "Student"}
              </h2>

              <p>
                {user.email}
              </p>

              <div className="edit-profile-side-note">
                <strong>
                  Why update your profile?
                </strong>

                <span>
                  Your profile information is used by
                  FundMyFuture's recommendation system
                  to identify relevant scholarships.
                </span>
              </div>

            </aside>

            <section className="edit-profile-card">

              <div className="edit-profile-card-heading">
                <p className="edit-profile-eyebrow">
                  PERSONAL & ACADEMIC DETAILS
                </p>

                <h2>
                  Profile Information
                </h2>

                <p>
                  Update the information below and save
                  your changes.
                </p>
              </div>

              <form
                className="edit-profile-form"
                onSubmit={handleSubmit}
              >

                <div className="edit-profile-field">
                  <label>
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="edit-profile-field">
                  <label>
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={user.email}
                    disabled
                  />

                  <small>
                    Email address cannot be changed.
                  </small>
                </div>

                <div className="edit-profile-grid">

                  <div className="edit-profile-field">
                    <label>
                      Course
                    </label>

                    <select
                      name="course"
                      value={form.course}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Course
                      </option>
                      <option>
                        Engineering
                      </option>
                      <option>
                        Computer Science
                      </option>
                      <option>
                        Arts
                      </option>
                      <option>
                        Science
                      </option>
                      <option>
                        Commerce
                      </option>
                      <option>
                        Medical
                      </option>
                      <option>
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="edit-profile-field">
                    <label>
                      Year
                    </label>

                    <select
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Year
                      </option>
                      <option>
                        1st Year
                      </option>
                      <option>
                        2nd Year
                      </option>
                      <option>
                        3rd Year
                      </option>
                      <option>
                        4th Year
                      </option>
                      <option>
                        Postgraduate
                      </option>
                    </select>
                  </div>

                </div>

                <div className="edit-profile-grid">

                  <div className="edit-profile-field">
                    <label>
                      Gender
                    </label>

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Gender
                      </option>
                      <option>
                        Male
                      </option>
                      <option>
                        Female
                      </option>
                      <option>
                        Other
                      </option>
                    </select>
                  </div>

                  <div className="edit-profile-field">
                    <label>
                      Category
                    </label>

                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Category
                      </option>
                      <option>
                        General
                      </option>
                      <option>
                        OBC
                      </option>
                      <option>
                        SC
                      </option>
                      <option>
                        ST
                      </option>
                      <option>
                        EWS
                      </option>
                    </select>
                  </div>

                </div>

                <div className="edit-profile-grid">

                  <div className="edit-profile-field">
                    <label>
                      Annual Family Income
                    </label>

                    <input
                      type="number"
                      name="income"
                      value={form.income}
                      onChange={handleChange}
                      min="0"
                      placeholder="Example: 300000"
                    />
                  </div>

                  <div className="edit-profile-field">
                    <label>
                      State
                    </label>

                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select State
                      </option>
                      <option>
                        Tamil Nadu
                      </option>
                      <option>
                        Kerala
                      </option>
                      <option>
                        Karnataka
                      </option>
                      <option>
                        Andhra Pradesh
                      </option>
                      <option>
                        Telangana
                      </option>
                      <option>
                        Maharashtra
                      </option>
                      <option>
                        Delhi
                      </option>
                      <option>
                        Other
                      </option>
                    </select>
                  </div>

                </div>

                <div className="edit-profile-field">
                  <label>
                    Person with Disability
                  </label>

                  <select
                    name="disability"
                    value={form.disability}
                    onChange={handleChange}
                  >
                    <option>
                      No
                    </option>
                    <option>
                      Yes
                    </option>
                  </select>
                </div>

                <div className="edit-profile-actions">

                  <Link
                    to="/dashboard"
                    className="edit-profile-cancel"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="edit-profile-save"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving Changes..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </section>

          </div>

        </div>

      </main>

    </div>
  )
}

export default EditProfile