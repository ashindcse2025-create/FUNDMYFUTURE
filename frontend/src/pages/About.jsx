import { Link } from "react-router-dom"

const features = [
  {
    number: "01",
    title: "Scholarship Discovery",
    text: "Explore scholarship opportunities collected from trusted official sources.",
  },
  {
    number: "02",
    title: "Smart Recommendations",
    text: "Get personalized scholarship recommendations using your student profile.",
  },
  {
    number: "03",
    title: "Eligibility Assistance",
    text: "Understand which opportunities may match your academic and eligibility details.",
  },
  {
    number: "04",
    title: "Application Tracking",
    text: "Save scholarships, track applications and keep important deadlines organized.",
  },
]

function About() {
  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-container about-hero-grid">
          <div className="about-hero-content">
            <p className="about-eyebrow">
              ABOUT FUNDMYFUTURE
            </p>

            <h1>
              Making scholarship
              <span> discovery simpler.</span>
            </h1>

            <p>
              FundMyFuture is a scholarship discovery and
              recommendation platform designed to help students
              find relevant financial opportunities without
              searching through multiple sources manually.
            </p>

            <div className="about-hero-actions">
              <Link
                to="/recommend"
                className="about-primary-button"
              >
                Find My Scholarships →
              </Link>

              <Link
                to="/scholarships"
                className="about-secondary-button"
              >
                Explore Scholarships
              </Link>
            </div>
          </div>

          <div className="about-hero-card">
            <div className="about-hero-card-top">
              <span>FUNDMYFUTURE</span>
              <span>2026</span>
            </div>

            <div className="about-visual-icon">
              ✦
            </div>

            <h3>
              One platform.
              <br />
              Better scholarship discovery.
            </h3>

            <p>
              Discover opportunities, understand eligibility
              and stay organized throughout your application
              journey.
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="about-intro-section">
        <div className="about-container about-intro-grid">
          <div>
            <p className="about-eyebrow">
              OUR PURPOSE
            </p>

            <h2>
              Helping students spend
              <span> less time searching.</span>
            </h2>
          </div>

          <div className="about-intro-text">
            <p>
              Scholarship information is often spread across
              different websites, departments and application
              portals. Finding a suitable opportunity can
              therefore take considerable time.
            </p>

            <p>
              FundMyFuture brings scholarship discovery,
              eligibility assistance, personalized
              recommendations and application tracking into
              one student-focused platform.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="about-features-section">
        <div className="about-container">
          <div className="about-section-heading">
            <div>
              <p className="about-eyebrow">
                WHAT WE PROVIDE
              </p>

              <h2>
                Built around the
                <span> student journey.</span>
              </h2>
            </div>

            <p>
              FundMyFuture combines scholarship information
              with tools that help students discover and
              manage opportunities.
            </p>
          </div>

          <div className="about-feature-grid">
            {features.map((feature) => (
              <div
                className="about-feature-card"
                key={feature.number}
              >
                <span className="about-feature-number">
                  {feature.number}
                </span>

                <h3>{feature.title}</h3>

                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="about-process-section">
        <div className="about-container">
          <div className="about-center-heading">
            <p className="about-eyebrow">
              HOW FUNDMYFUTURE WORKS
            </p>

            <h2>
              From profile to
              <span> opportunity.</span>
            </h2>

            <p>
              The platform follows a simple process to connect
              students with relevant scholarship opportunities.
            </p>
          </div>

          <div className="about-process-grid">
            <div className="about-process-card">
              <div className="about-process-number">
                01
              </div>

              <h3>Create your profile</h3>

              <p>
                Enter academic, demographic and financial
                information used for scholarship matching.
              </p>
            </div>

            <div className="about-process-card">
              <div className="about-process-number">
                02
              </div>

              <h3>Eligibility check</h3>

              <p>
                The platform evaluates important eligibility
                factors before presenting relevant opportunities.
              </p>
            </div>

            <div className="about-process-card">
              <div className="about-process-number">
                03
              </div>

              <h3>Smart matching</h3>

              <p>
                A Random Forest based recommendation system
                helps generate personalized scholarship matches.
              </p>
            </div>

            <div className="about-process-card">
              <div className="about-process-number">
                04
              </div>

              <h3>Apply and track</h3>

              <p>
                Visit the official application source and
                manage saved scholarships, applications and
                reminders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY */}
      <section className="about-technology-section">
        <div className="about-container about-tech-grid">
          <div className="about-tech-content">
            <p className="about-eyebrow">
              TECHNOLOGY
            </p>

            <h2>
              Data-driven
              <span> recommendations.</span>
            </h2>

            <p>
              FundMyFuture uses a machine-learning based
              recommendation approach to identify scholarship
              opportunities that are relevant to a student's
              profile.
            </p>

            <p>
              The system combines recommendation scoring with
              eligibility information so that students can
              understand why an opportunity may be relevant.
            </p>
          </div>

          <div className="about-tech-card">
            <div className="about-tech-row">
              <span>Frontend</span>
              <strong>React + Tailwind CSS</strong>
            </div>

            <div className="about-tech-row">
              <span>Backend</span>
              <strong>Flask REST API</strong>
            </div>

            <div className="about-tech-row">
              <span>Database</span>
              <strong>MongoDB</strong>
            </div>

            <div className="about-tech-row">
              <span>ML Model</span>
              <strong>Random Forest</strong>
            </div>

            <div className="about-tech-row">
              <span>Data Source</span>
              <strong>Official NSP information</strong>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="about-principles-section">
        <div className="about-container">
          <div className="about-center-heading">
            <p className="about-eyebrow">
              OUR APPROACH
            </p>

            <h2>
              Designed with
              <span> clarity in mind.</span>
            </h2>
          </div>

          <div className="about-principles-grid">
            <div className="about-principle">
              <div>01</div>
              <h3>Official information</h3>
              <p>
                Scholarship discovery is supported by
                information collected from official sources.
              </p>
            </div>

            <div className="about-principle">
              <div>02</div>
              <h3>Personalization</h3>
              <p>
                Recommendations consider details provided
                by the student.
              </p>
            </div>

            <div className="about-principle">
              <div>03</div>
              <h3>Transparency</h3>
              <p>
                Students can review scholarship details and
                continue to the official application source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <div className="about-container">
          <div className="about-cta-box">
            <div>
              <p className="about-eyebrow about-light-eyebrow">
                START YOUR SEARCH
              </p>

              <h2>
                Find opportunities
                <br />
                relevant to you.
              </h2>

              <p>
                Create your profile and discover scholarships
                matched to your student journey.
              </p>
            </div>

            <Link
              to="/recommend"
              className="about-cta-button"
            >
              Get Personalized Matches →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="about-footer">
        <div className="about-container about-footer-main">
          <div>
            <div className="about-footer-logo">
              FundMyFuture
            </div>

            <p>
              A scholarship discovery and recommendation
              platform for students.
            </p>
          </div>

          <div className="about-footer-links">
            <Link to="/">Home</Link>
            <Link to="/scholarships">Scholarships</Link>
            <Link to="/recommend">Recommendations</Link>
            <Link to="/about">About</Link>
          </div>
        </div>

        <div className="about-container about-footer-bottom">
          <span>© 2026 FundMyFuture</span>
          <span>Scholarship discovery platform</span>
        </div>
      </footer>

    </div>
  )
}

export default About