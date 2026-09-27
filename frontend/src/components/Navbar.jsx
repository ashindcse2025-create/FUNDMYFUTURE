import { useEffect, useState } from "react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function loadUser() {
      const storedUser = JSON.parse(
        localStorage.getItem("fundmyfuture_user") || "null"
      )

      setUser(storedUser)
    }

    loadUser()
  }, [location.pathname])

  const navigation = [
    {
      name: "Home",
      path: "/",
      icon: "⌂",
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
      requiresLogin: true,
    },
    {
      name: "Scholarships",
      path: "/scholarships",
      icon: "◇",
    },
    {
      name: "Recommend",
      path: "/recommend",
      icon: "✦",
    },
    {
      name: "Applications",
      path: "/applications",
      icon: "✓",
      requiresLogin: true,
    },
    {
      name: "Reminders",
      path: "/reminders",
      icon: "◷",
      requiresLogin: true,
    },
    {
      name: "About",
      path: "/about",
      icon: "i",
    },
  ]

  const visibleNavigation = navigation.filter(
    (item) => !item.requiresLogin || user
  )

  function isActive(path) {
    if (path === "/") {
      return location.pathname === "/"
    }

    return location.pathname.startsWith(path)
  }

  function handleLogout() {
    localStorage.removeItem("fundmyfuture_user")
    setUser(null)
    setOpen(false)
    navigate("/")
  }

  return (
    <>
      {/* Desktop Right Navbar */}
      <aside className="side-navbar">

        <div className="side-navbar-logo">
          <Link to="/">
            <span className="side-logo-mark">
              F
            </span>

            <span className="side-logo-text">
              FundMyFuture
            </span>
          </Link>
        </div>

        <nav className="side-navbar-menu">

          {visibleNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                isActive(item.path)
                  ? "side-nav-link active"
                  : "side-nav-link"
              }
              title={item.name}
            >
              <span className="side-nav-icon">
                {item.icon}
              </span>

              <span className="side-nav-label">
                {item.name}
              </span>
            </Link>
          ))}

        </nav>

        <div className="side-navbar-bottom">

          {user ? (
            <>
              <Link
                to="/edit-profile"
                className="side-user-card"
              >
                <div className="side-user-avatar">
                  {(user.name || "S")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="side-user-info">
                  <strong>
                    {user.name || "Student"}
                  </strong>

                  <span>
                    Edit Profile
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="side-logout-button"
              >
                <span>↪</span>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="side-login-button"
            >
              Login
            </Link>
          )}

        </div>
      </aside>

      {/* Mobile Navbar */}
      <header className="mobile-navbar">

        <Link
          to="/"
          className="mobile-navbar-logo"
        >
          <span className="mobile-logo-mark">
            F
          </span>

          <span>
            FundMyFuture
          </span>
        </Link>

        <button
          className="mobile-navbar-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? "×" : "☰"}
        </button>

      </header>

      {open && (
        <div className="mobile-navbar-menu">

          {visibleNavigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={
                isActive(item.path)
                  ? "mobile-nav-link active"
                  : "mobile-nav-link"
              }
            >
              <span>
                {item.icon}
              </span>

              {item.name}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to="/edit-profile"
                onClick={() => setOpen(false)}
                className="mobile-nav-link"
              >
                <span>⚙</span>
                Edit Profile
              </Link>

              <button
                onClick={handleLogout}
                className="mobile-logout"
              >
                <span>↪</span>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="mobile-nav-link"
            >
              <span>→</span>
              Login
            </Link>
          )}

        </div>
      )}
    </>
  )
}

export default Navbar