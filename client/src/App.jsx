import { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/tickets/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTickets(
        response.data.tickets ||
        response.data ||
        []
      );

    } catch (err) {
      console.error("Fetch tickets error:", err);

      setError(
        err.response?.data?.message ||
        "Failed to load tickets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const totalTickets = tickets.length;

  const newTickets = tickets.filter(
    (ticket) => ticket.status === "New"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) =>
      ticket.status === "Assigned" ||
      ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "Resolved"
  ).length;

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>SupportDesk</h2>
            <span>Customer Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/tickets"
            className="nav-item"
          >
            <span>🎫</span>
            My Tickets
          </Link>

          <Link
            to="/create-ticket"
            className="nav-item"
          >
            <span>＋</span>
            Create Ticket
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">
            <div className="avatar">N</div>

            <div>
              <strong>Customer</strong>
              <span>customer@test.com</span>
            </div>
          </div>

          <Link
            to="/"
            className="logout-btn"
          >
            ↪ Logout
          </Link>

        </div>

      </aside>


      {/* Main */}
      <main className="dashboard-main">

        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome back! Here's what's happening
              with your tickets.
            </p>
          </div>

          <Link
            to="/create-ticket"
            className="new-ticket-btn"
          >
            + New Ticket
          </Link>

        </header>


        {/* Error */}
        {error && (
          <div className="alert error-alert">
            ⚠ {error}
          </div>
        )}


        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">🎫</div>

            <div>
              <span>Total Tickets</span>
              <strong>
                {loading ? "..." : totalTickets}
              </strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">🆕</div>

            <div>
              <span>New</span>
              <strong>
                {loading ? "..." : newTickets}
              </strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">◔</div>

            <div>
              <span>In Progress</span>
              <strong>
                {loading ? "..." : inProgressTickets}
              </strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">✓</div>

            <div>
              <span>Resolved</span>
              <strong>
                {loading ? "..." : resolvedTickets}
              </strong>
            </div>
          </div>

        </section>


        {/* Tickets */}
        <section className="tickets-section">

          <div className="section-header">

            <div>
              <h2>Recent Tickets</h2>

              <p>
                Track your latest support requests.
              </p>
            </div>

            <Link to="/tickets">
              View all →
            </Link>

          </div>


          {loading ? (

            <div className="empty-state">
              <div className="loading-spinner"></div>
              <p>Loading your tickets...</p>
            </div>

          ) : tickets.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🎫
              </div>

              <h3>No tickets yet</h3>

              <p>
                You haven't created any support tickets.
              </p>

              <Link
                to="/create-ticket"
                className="new-ticket-btn"
              >
                Create Your First Ticket
              </Link>

            </div>

          ) : (

            <div className="ticket-table">

              <div className="ticket-table-header">
                <span>Ticket</span>
                <span>Category</span>
                <span>Priority</span>
                <span>Status</span>
                <span>Created</span>
              </div>


              {tickets.slice(0, 5).map((ticket) => (

                <div
                  className="ticket-row"
                  key={ticket._id}
                >

                  <div className="ticket-info">

                    <strong>
                      {ticket.ticketNumber}
                    </strong>

                    <span>
                      {ticket.subject}
                    </span>

                  </div>


                  <span className="category-badge">
                    {ticket.category || "Other"}
                  </span>


                  <span
                    className={`priority-badge ${
                      ticket.priority?.toLowerCase()
                    }`}
                  >
                    {ticket.priority || "Medium"}
                  </span>


                  <span
                    className={`status-badge ${
                      ticket.status === "Resolved"
                        ? "resolved"
                        : ticket.status === "In Progress"
                        ? "progress"
                        : "new"
                    }`}
                  >
                    {ticket.status}
                  </span>


                  <span className="ticket-date">
                    {new Date(
                      ticket.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}


function CreateTicket() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/tickets",
        {
          subject,
          description,
          ...(category && { category })
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Ticket created:", response.data);

      setSuccess("Ticket created successfully!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to create ticket. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon">S</div>

          <div>
            <h2>SupportDesk</h2>
            <span>Customer Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <Link
            to="/dashboard"
            className="nav-item"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/tickets"
            className="nav-item"
          >
            <span>🎫</span>
            My Tickets
          </Link>

          <Link
            to="/create-ticket"
            className="nav-item active"
          >
            <span>＋</span>
            Create Ticket
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="user-mini">
            <div className="avatar">N</div>

            <div>
              <strong>Customer</strong>
              <span>customer@test.com</span>
            </div>
          </div>

          <Link
            to="/"
            className="logout-btn"
          >
            ↪ Logout
          </Link>

        </div>

      </aside>


      {/* Main */}
      <main className="dashboard-main">

        <div className="page-back">
          <Link to="/dashboard">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="form-page-header">

          <h1>Create New Ticket</h1>

          <p>
            Tell us about your issue and our support team
            will help you resolve it.
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="alert error-alert">
            ⚠ {error}
          </div>
        )}


        {/* Success */}
        {success && (
          <div className="alert success-alert">
            ✓ {success}
          </div>
        )}


        <div className="create-ticket-layout">

          {/* Form */}
          <div className="ticket-form-card">

            <div className="form-card-header">
              <h2>Ticket Information</h2>

              <p>
                Please provide as much detail as possible.
              </p>
            </div>


            <form
              className="ticket-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group">

                <label>
                  Subject <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Briefly describe your issue"
                  value={subject}
                  onChange={(e) =>
                    setSubject(e.target.value)
                  }
                />

              </div>


              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  className="role-select"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >

                  <option value="">
                    Select a category
                  </option>

                  <option value="Billing">
                    Billing
                  </option>

                  <option value="Technical">
                    Technical
                  </option>

                  <option value="Account">
                    Account
                  </option>

                  <option value="Order">
                    Order
                  </option>

                  <option value="Delivery">
                    Delivery
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

                <small>
                  Category is optional. AI may suggest one
                  automatically.
                </small>

              </div>


              <div className="form-group">

                <label>
                  Description <span>*</span>
                </label>

                <textarea
                  rows="8"
                  placeholder="Explain your issue in detail..."
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                />

                <small>
                  Include relevant details such as order
                  number, error messages, or what happened.
                </small>

              </div>


              <div className="ticket-form-actions">

                <Link
                  to="/dashboard"
                  className="cancel-btn"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="login-btn submit-ticket-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Ticket..."
                    : "Submit Ticket"}
                </button>

              </div>

            </form>

          </div>


          {/* AI Info */}
          <div className="ai-info-card">

            <div className="ai-info-icon">
              ✦
            </div>

            <h3>AI-Powered Triage</h3>

            <p>
              After you submit your ticket, our AI will
              analyze your issue and suggest:
            </p>

            <div className="ai-feature">
              <span>✓</span>

              <div>
                <strong>Category</strong>

                <small>
                  Identify the type of issue
                </small>
              </div>
            </div>

            <div className="ai-feature">
              <span>✓</span>

              <div>
                <strong>Priority</strong>

                <small>
                  Determine how urgent it is
                </small>
              </div>
            </div>

            <div className="ai-feature">
              <span>✓</span>

              <div>
                <strong>Summary</strong>

                <small>
                  Create a short issue summary
                </small>
              </div>
            </div>

            <div className="ai-note">
              💡 An agent will review the AI suggestions
              before they are finalized.
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password
        }
      );

      console.log("Login response:", response.data);

      /*
        Different backends may return the token
        under different property names.
      */
      const token =
        response.data.token ||
        response.data.accessToken ||
        response.data.user?.token;

      if (!token) {
        setError("Login successful, but no token was returned.");
        return;
      }

      localStorage.setItem("token", token);

      // Save user data if backend provides it
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/dashboard");

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
        "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h1>SupportDesk</h1>
            <p>Customer Support System</p>
          </div>
        </div>

        <div className="login-heading">
          <h2>Welcome back 👋</h2>
          <p>
            Sign in to manage your support tickets.
          </p>
        </div>

        {error && (
          <div className="alert error-alert">
            ⚠ {error}
          </div>
        )}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <div className="password-label">

              <label>Password</label>

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>


          <div className="login-options">

            <label className="remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-btn"
            >
              Forgot password?
            </button>

          </div>


          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        <p className="register-text">

          Don't have an account?

          <Link
            to="/register"
            className="register-btn"
          >
            Create account
          </Link>

        </p>

      </div>


      <div className="login-footer">
        <span>© 2026 SupportDesk</span>
        <span>Secure & Reliable Support</span>
      </div>

    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
          role
        }
      );

      console.log("Register response:", response.data);

      setSuccess(
        response.data.message ||
        "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      console.error("Register error:", err);

      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="brand">
          <div className="brand-icon">S</div>

          <div>
            <h1>SupportDesk</h1>
            <p>Customer Support System</p>
          </div>
        </div>


        <div className="login-heading">
          <h2>Create your account</h2>

          <p>
            Join SupportDesk and manage your support requests.
          </p>
        </div>


        {error && (
          <div className="alert error-alert">
            ⚠ {error}
          </div>
        )}


        {success && (
          <div className="alert success-alert">
            ✓ {success}
          </div>
        )}


        <form
          className="login-form"
          onSubmit={handleRegister}
        >

          {/* Name */}
          <div className="form-group">

            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>


          {/* Email */}
          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          {/* Password */}
          <div className="form-group">

            <div className="password-label">

              <label>Password</label>

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Create a password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

          </div>


          {/* Role */}
          <div className="form-group">

            <label>Account Type</label>

            <select
              className="role-select"
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >

              <option value="customer">
                Customer
              </option>

              <option value="agent">
                Support Agent
              </option>

            </select>

          </div>


          {/* Submit */}
          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>


        <p className="register-text">

          Already have an account?

          <Link
            to="/"
            className="register-btn"
          >
            Sign in
          </Link>

        </p>

      </div>


      <div className="login-footer">
        <span>© 2026 SupportDesk</span>
        <span>Secure & Reliable Support</span>
      </div>

    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={<CustomerDashboard />}
      />

      <Route
        path="/create-ticket"
        element={<CreateTicket />}
      />
    </Routes>
  );
}
export default App;