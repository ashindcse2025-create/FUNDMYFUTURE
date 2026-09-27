import { Link } from "react-router-dom"

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1781544827368-bb9c1d4d3426?auto=format&fit=crop&fm=jpg&q=80&w=1200"

const features = [
  {
    number: "01",
    title: "Find Scholarships",
    text: "Explore scholarships from trusted official sources in one place.",
  },
  {
    number: "02",
    title: "Get Matched",
    text: "Receive recommendations based on your academic and eligibility profile.",
  },
  {
    number: "03",
    title: "Check Eligibility",
    text: "Understand whether you meet the important scholarship requirements.",
  },
  {
    number: "04",
    title: "Track Applications",
    text: "Save scholarships, track applications and stay aware of deadlines.",
  },
]

const categories = [
  "Engineering",
  "Computer Science",
  "Postgraduate",
  "Women Students",
  "Financial Support",
  "Special Categories",
]

function Home() {
  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="home-container hero-grid">

          <div className="hero-content">
            <p className="eyebrow">SCHOLARSHIPS, SIMPLIFIED</p>

            <h1>
              Find the right
              <span> scholarship </span>
              for your future.
            </h1>

            <p className="hero-description">
              FundMyFuture helps students discover relevant scholarships,
              understand eligibility requirements and manage their
              applications from one place.
            </p>

            <div className="hero-buttons">
              <Link to="/recommend" className="primary-button">
                Get Started
              </Link>

              <Link to="/scholarships" className="secondary-button">
                Explore Scholarships
              </Link>
            </div>

            <div className="hero-note">
              <span>✓</span>
              Official scholarship information
            </div>
          </div>

          <div className="hero-image-wrapper">
            <img
              src={HERO_IMAGE}
              alt="Student learning"
              className="hero-image"
            />

            <div className="floating-card">
              <div className="floating-icon">✓</div>
              <div>
                <strong>Personalized</strong>
                <small>Scholarship matches</small>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* FEATURE STRIP */}
      <section className="feature-section">
        <div className="home-container feature-grid">

          {features.map((feature) => (
            <div className="feature-card" key={feature.number}>
              <span className="feature-number">
                {feature.number}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.text}</p>
            </div>
          ))}

        </div>
      </section>


      {/* SCHOLARSHIP CATEGORIES */}
      <section className="categories-section">
        <div className="home-container">

          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE OPPORTUNITIES</p>

              <h2>
                Scholarships for
                <span> every journey.</span>
              </h2>
            </div>

            <Link to="/scholarships" className="text-link">
              View all scholarships →
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <Link
                to="/scholarships"
                className="category-card"
                key={category}
              >
                <span className="category-index">
                  0{index + 1}
                </span>

                <div>
                  <h3>{category}</h3>
                  <p>Explore relevant opportunities</p>
                </div>

                <span className="category-arrow">→</span>
              </Link>
            ))}
          </div>

        </div>
      </section>


      {/* WHY FUNDMYFUTURE */}
      <section className="why-section">
        <div className="home-container why-grid">

          <div className="why-content">
            <p className="eyebrow">WHY FUNDMYFUTURE</p>

            <h2>
              Make scholarship
              <span> discovery easier.</span>
            </h2>

            <p className="section-text">
              Searching for scholarships can be confusing when information
              is spread across different websites. FundMyFuture brings the
              important information together and helps you focus on
              opportunities relevant to you.
            </p>

            <Link to="/about" className="primary-button">
              Learn More
            </Link>
          </div>


          <div className="benefits-grid">

            <div className="benefit-box">
              <span>01</span>
              <h3>Personalized</h3>
              <p>
                Recommendations based on your student profile.
              </p>
            </div>

            <div className="benefit-box">
              <span>02</span>
              <h3>Organized</h3>
              <p>
                Keep saved scholarships and applications together.
              </p>
            </div>

            <div className="benefit-box">
              <span>03</span>
              <h3>Transparent</h3>
              <p>
                Access scholarship information from official sources.
              </p>
            </div>

            <div className="benefit-box">
              <span>04</span>
              <h3>Timely</h3>
              <p>
                Stay aware of important application deadlines.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="steps-section">
        <div className="home-container">

          <div className="center-heading">
            <p className="eyebrow">HOW IT WORKS</p>

            <h2>
              Your scholarship journey,
              <span> made simple.</span>
            </h2>

            <p>
              Three simple steps to discover opportunities that match you.
            </p>
          </div>

          <div className="steps-grid">

            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Create Your Profile</h3>
              <p>
                Tell us about your course, year, category, income and
                other eligibility details.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Get Recommendations</h3>
              <p>
                Our recommendation system identifies scholarships
                relevant to your profile.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Apply & Track</h3>
              <p>
                Visit the official application portal and keep track
                of your scholarship applications.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* CTA */}
      <section className="cta-section">
        <div className="home-container">

          <div className="cta-box">

            <div>
              <p className="eyebrow light-eyebrow">
                START TODAY
              </p>

              <h2>
                Your next opportunity
                <br />
                could be one search away.
              </h2>

              <p>
                Build your profile and discover scholarships relevant
                to your academic journey.
              </p>
            </div>

            <Link to="/recommend" className="cta-button">
              Find My Scholarships →
            </Link>

          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="footer">
        <div className="home-container footer-content">

          <div>
            <div className="footer-logo">
              FundMyFuture
            </div>

            <p>
              Helping students discover scholarship opportunities
              with less searching and more confidence.
            </p>
          </div>

          <div className="footer-links">

            <Link to="/scholarships">
              Scholarships
            </Link>

            <Link to="/recommend">
              Recommendations
            </Link>

            <Link to="/about">
              About
            </Link>

            <Link to="/login">
              Login
            </Link>

          </div>

        </div>

        <div className="home-container footer-bottom">
          <span>
            © 2026 FundMyFuture
          </span>

          <span>
            Scholarship discovery platform
          </span>
        </div>
      </footer>

    </div>
  )
}

export default Home