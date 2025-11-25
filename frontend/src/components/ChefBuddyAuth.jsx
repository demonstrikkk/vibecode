// Auth.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/* ---------- CONFIG: image path (uploaded by you) ---------- */
const HERO_IMAGE = "./Gemini_Generated_Image_z66thhz66thhz66t.png";

/* ---------- Helper UI primitives (lightweight) ---------- */
const IconButton = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-2 rounded-md ${className}`}>
    {children}
  </button>
);

const Chip = ({ active, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`px-4 py-2 rounded-2xl border transition text-sm ${active ? "bg-brown-600 text-white border-brown-600 shadow-sm" : "bg-white text-brown-800 border-brown-200 hover:bg-brown-50"}`}
    style={{ minWidth: 110, textAlign: "center" }}
  >
    {label}
  </button>
);

/* ---------- UI Components (defined OUTSIDE main component to prevent focus loss) ---------- */
const Small = ({ children, style }) => (
  <div style={{ fontSize: 13, color: "var(--brown-700)", ...style }}>{children}</div>
);

const BigTitle = ({ children }) => (
  <h1 style={{ margin: 0, color: "var(--brown-900)", fontSize: 22 }}>{children}</h1>
);

const Card = ({ children, style }) => (
  <div style={{
    background: "var(--card-bg)",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 6px 30px rgba(60,31,24,0.08)",
    border: "1px solid rgba(138,75,52,0.06)",
    ...style
  }}>{children}</div>
);

// Common input style to prevent focus issues
const commonInputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.06)",
  boxSizing: 'border-box',
  outline: 'none',
  fontSize: 14,
};

/* ---------- MAIN COMPONENT ---------- */
export default function Auth({ initialView = "login" }) {
  const { login, register, updatePreferences } = useAuth();
  const navigate = useNavigate();

  // theme palette (brown + white)
  useEffect(() => {
    document.documentElement.style.setProperty("--brown-50", "#FBF6F3");
    document.documentElement.style.setProperty("--brown-100", "#F3E8E0");
    document.documentElement.style.setProperty("--brown-300", "#D8B9A3");
    document.documentElement.style.setProperty("--brown-600", "#8A4B34");
    document.documentElement.style.setProperty("--brown-700", "#6F3A2A");
    document.documentElement.style.setProperty("--brown-900", "#3C1F18");
    document.documentElement.style.setProperty("--card-bg", "#fffdfb");
  }, []);

  // top-level view state
  const [view, setView] = useState(initialView); // 'login' | 'register' | 'verify'
  // Login states
  const [method, setMethod] = useState("email"); // email | phone
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  // Password reset modal
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Registration & Profile Setup (multi-step)
  const [regStep, setRegStep] = useState(1); // 1..3
  // Step 1: account
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  // Step 2: basic info
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  // Step 3: preferences
  const dietaryPreferenceOptions = ['Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Mediterranean', 'Balanced'];
  const dietaryRestrictionOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Halal', 'Kosher'];
  const healthGoalOptions = ['Weight loss', 'Muscle gain', 'Maintenance', 'Heart health', 'Better energy'];
  const skillLevelOptions = ['Beginner', 'Intermediate', 'Advanced'];
  const cuisineOptions = ['Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'Middle Eastern'];
  const budgetOptions = ['Low', 'Medium', 'High'];

  const [dietaryPrefs, setDietaryPrefs] = useState([]);
  const [dietaryRestr, setDietaryRestr] = useState([]);
  const [healthGoals, setHealthGoals] = useState([]);
  const [skillLevel, setSkillLevel] = useState("");
  const [householdSize, setHouseholdSize] = useState(1);
  const [budget, setBudget] = useState("");
  const [cuisines, setCuisines] = useState([]);

  // Email verification simulation
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  /* ---------- Helpers ---------- */
  const toggleList = (item, arr, setter) => {
    if (arr.includes(item)) setter(arr.filter(x => x !== item));
    else setter([...arr, item]);
  };

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    if (!identifier || !password) { setAuthError("Please fill credentials."); return; }
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider) {
    alert(`${provider} sign-in not implemented yet.`);
  }

  async function handleSendReset() {
    if (!resetEmail) return setResetSent(false);
    // Simulate reset
    setTimeout(() => setResetSent(true), 700);
  }

  async function handleRegister(e) {
    e.preventDefault();
    // final validation
    if (!regEmail || !regPassword || !regConfirm) { setAuthError("Complete account fields."); return; }
    if (regPassword !== regConfirm) { setAuthError("Passwords do not match."); return; }
    if (!fullName) { setAuthError("Please fill your name in profile step."); return; }

    setLoading(true);
    try {
      // 1. Register user
      await register({
        email: regEmail,
        password: regPassword,
        full_name: fullName,
        age: age ? parseInt(age) : null,
        location: location
      });

      // 2. Update preferences
      await updatePreferences({
        dietary_preferences: dietaryPrefs,
        dietary_restrictions: dietaryRestr,
        health_goals: healthGoals,
        skill_level: skillLevel,
        household_size: parseInt(householdSize),
        budget: budget,
        cuisines: cuisines
      });

      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Layout ---------- */
  return (
    <div style={{
      fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fffaf7 0%, #fff6f0 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>

      <div style={{
        width: "100%",
        maxWidth: 1100,
        display: "grid",
        gridTemplateColumns: "1fr 460px",
        gap: 28,
        alignItems: "stretch"
      }}>
        {/* LEFT: Auth Card (login / register) */}
        <div>
          <Card style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div>
                <Small>ChefBuddy</Small>
                <BigTitle>Eat better, effortlessly</BigTitle>
                <Small style={{ marginTop: 6 }}>Sign in or create an account to get personalized meal plans</Small>
              </div>

              <div>
                <div style={{ background: "var(--brown-600)", color: "#fff", padding: "8px 12px", borderRadius: 10, fontWeight: 600 }}>Warm</div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              {/* Toggle between Login / Register tabs */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <button onClick={() => { setView("login"); setRegStep(1); }} style={{
                  flex: 1, padding: 10, borderRadius: 10,
                  background: view === "login" ? "var(--brown-600)" : "transparent",
                  color: view === "login" ? "#fff" : "var(--brown-700)",
                  border: "1px solid rgba(0,0,0,0.04)"
                }}>Login</button>

                <button onClick={() => { setView("register"); setRegStep(1); }} style={{
                  flex: 1, padding: 10, borderRadius: 10,
                  background: view === "register" ? "var(--brown-600)" : "transparent",
                  color: view === "register" ? "#fff" : "var(--brown-700)",
                  border: "1px solid rgba(0,0,0,0.04)"
                }}>Register</button>
              </div>

              {/* ----- LOGIN VIEW ----- */}
              {view === "login" && (
                <form onSubmit={handleLogin}>
                  {authError && <div style={{ color: "#852c1c", background: "#fff1ef", padding: 8, borderRadius: 8, marginBottom: 10 }}>{authError}</div>}
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <button type="button" onClick={() => setMethod("email")} style={{
                      flex: 1, padding: 10, borderRadius: 8,
                      background: method === "email" ? "var(--brown-700)" : "transparent",
                      color: method === "email" ? "#fff" : "var(--brown-900)",
                      border: "1px solid rgba(0,0,0,0.04)"
                    }}>Email</button>
                    <button type="button" onClick={() => setMethod("phone")} style={{
                      flex: 1, padding: 10, borderRadius: 8,
                      background: method === "phone" ? "var(--brown-700)" : "transparent",
                      color: method === "phone" ? "#fff" : "var(--brown-900)",
                      border: "1px solid rgba(0,0,0,0.04)"
                    }}>Phone</button>
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 13, color: "var(--brown-700)", marginBottom: 6 }}>{method === "email" ? "Email address" : "Phone number"}</label>
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={method === "email" ? "you@example.com" : "+1 555-555-5555"}
                      style={commonInputStyle} // APPLIED FIX
                    />
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 13, color: "var(--brown-700)", marginBottom: 6 }}>Password</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        style={{ ...commonInputStyle, flex: 1 }} // APPLIED FIX
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)} style={{ padding: "0 12px", borderRadius: 10, background: "#fff" }}>
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 13, color: "var(--brown-700)" }}>
                      <input type="checkbox" id="remember" /> <label htmlFor="remember"> Remember me</label>
                    </div>
                    <button type="button" onClick={() => setShowReset(true)} style={{ fontSize: 13, color: "var(--brown-700)", textDecoration: "underline", background: "transparent", border: "none" }}>Forgot?</button>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 10, background: "var(--brown-700)", color: "#fff", fontWeight: 600 }}>
                      {loading ? "Signing in..." : "Sign in"}
                    </button>

                  </div>

                  <div style={{ marginTop: 12, textAlign: "center", fontSize: 13 }}>
                    <span style={{ color: "var(--brown-700)" }}>New? </span>
                    <button type="button" onClick={() => { setView("register"); setRegStep(1); }} style={{ color: "var(--brown-700)", fontWeight: 600, background: "transparent", border: "none" }}>Create an account</button>
                  </div>
                </form>
              )}

              {/* ----- REGISTER VIEW: Multi-step ----- */}
              {view === "register" && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 20, background: regStep >= 1 ? "var(--brown-700)" : "#eee" }} />
                    <div style={{ width: 10, height: 10, borderRadius: 20, background: regStep >= 2 ? "var(--brown-700)" : "#eee" }} />
                    <div style={{ width: 10, height: 10, borderRadius: 20, background: regStep >= 3 ? "var(--brown-700)" : "#eee" }} />
                    <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--brown-700)" }}>{regStep}/3</div>
                  </div>

                  <form onSubmit={handleRegister}>
                    {authError && <div style={{ color: "#852c1c", background: "#fff1ef", padding: 8, borderRadius: 8, marginBottom: 10 }}>{authError}</div>}

                    {/* Step 1: Email/password */}
                    {regStep === 1 && (
                      <div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)" }}>Email</label>
                          <input
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{ ...commonInputStyle, padding: 10, borderRadius: 8, border: "1px solid rgba(0,0,0,0.05)" }} // APPLIED FIX
                          />
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Create password"
                            style={{ ...commonInputStyle, flex: 1, padding: 10, borderRadius: 8 }} // APPLIED FIX
                          />
                          <input
                            type="password"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            placeholder="Confirm password"
                            style={{ ...commonInputStyle, flex: 1, padding: 10, borderRadius: 8 }} // APPLIED FIX
                          />
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button type="button" onClick={() => setView("login")} style={{ flex: 1, padding: 10, borderRadius: 8, background: "transparent", border: "1px solid rgba(0,0,0,0.04)" }}>Cancel</button>
                          <button type="button" onClick={() => setRegStep(2)} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--brown-700)", color: "#fff" }}>Next</button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Basic info */}
                    {regStep === 2 && (
                      <div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)" }}>Full name</label>
                          <input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your name"
                            style={{ ...commonInputStyle, padding: 10, borderRadius: 8 }} // APPLIED FIX
                          />
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="number"
                            min={10} max={120}
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Age"
                            style={{ ...commonInputStyle, flex: 1, padding: 10, borderRadius: 8 }} // APPLIED FIX
                          />
                          <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, Country"
                            style={{ ...commonInputStyle, flex: 2, padding: 10, borderRadius: 8 }} // APPLIED FIX
                          />
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button type="button" onClick={() => setRegStep(1)} style={{ flex: 1, padding: 10, borderRadius: 8, background: "transparent" }}>Back</button>
                          <button type="button" onClick={() => setRegStep(3)} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--brown-700)", color: "#fff" }}>Next</button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Preferences */}
                    {regStep === 3 && (
                      <div>
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)", display: "block", marginBottom: 8 }}>Dietary preferences</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {dietaryPreferenceOptions.map(opt => (
                              <Chip key={opt} label={opt} active={dietaryPrefs.includes(opt)} onClick={() => toggleList(opt, dietaryPrefs, setDietaryPrefs)} />
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)", display: "block", marginBottom: 8 }}>Allergies / restrictions</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {dietaryRestrictionOptions.map(opt => (
                              <Chip key={opt} label={opt} active={dietaryRestr.includes(opt)} onClick={() => toggleList(opt, dietaryRestr, setDietaryRestr)} />
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)", display: "block", marginBottom: 8 }}>Health goals</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {healthGoalOptions.map(opt => (
                              <Chip key={opt} label={opt} active={healthGoals.includes(opt)} onClick={() => toggleList(opt, healthGoals, setHealthGoals)} />
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div>
                            <label style={{ fontSize: 13, color: "var(--brown-700)" }}>Skill level</label>
                            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} style={{ ...commonInputStyle, padding: 10, borderRadius: 8 }}>
                              <option value="">Select</option>
                              {skillLevelOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          <div>
                            <label style={{ fontSize: 13, color: "var(--brown-700)" }}>Household size</label>
                            <input
                              type="number"
                              min={1} max={20}
                              value={householdSize}
                              onChange={(e) => setHouseholdSize(e.target.value)}
                              style={{ ...commonInputStyle, padding: 10, borderRadius: 8 }} // APPLIED FIX
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)", display: "block", marginBottom: 8 }}>Budget</label>
                          <div style={{ display: "flex", gap: 8 }}>
                            {budgetOptions.map(b => <Chip key={b} label={b} active={budget === b} onClick={() => setBudget(b)} />)}
                          </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                          <label style={{ fontSize: 13, color: "var(--brown-700)", display: "block", marginBottom: 8 }}>Favorite cuisines</label>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {cuisineOptions.map(c => <Chip key={c} label={c} active={cuisines.includes(c)} onClick={() => toggleList(c, cuisines, setCuisines)} />)}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                          <button type="button" onClick={() => setRegStep(2)} style={{ flex: 1, padding: 10, borderRadius: 8 }}>Back</button>
                          <button type="submit" style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--brown-700)", color: "#fff" }}>Create account</button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          </Card>

          <div style={{ marginTop: 14, textAlign: "center", color: "var(--brown-700)" }}>
            <Small>By creating an account you agree to our Terms & Privacy (demo app)</Small>
          </div>
        </div>

        {/* RIGHT: Hero / Illustration panel with your uploaded image */}
        <div>
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", boxShadow: "0 10px 30px rgba(60,31,24,0.08)" }}>
            <img src={HERO_IMAGE} alt="AI Chef" style={{ width: "180%", height: "100%", display: "block", objectFit: "cover", marginLeft: "-10%" }} />
            <div style={{ position: "absolute", left: 18, bottom: 18, color: "#fff", background: "rgba(0,0,0,0.35)", padding: 10, borderRadius: 10 }}>
              <div style={{ fontWeight: 700 }}>AI Chef Buddy</div>
              <div style={{ fontSize: 13, opacity: 0.95 }}>Suggested recipe & step-by-step cooking guidance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Password reset modal (simple) */}
      {showReset && (
        <div style={{
          position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.35)", zIndex: 60
        }}>
          <div style={{ width: 420 }}>
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Reset password</div>
                  <Small>Enter your email to receive reset instructions</Small>
                </div>
                <div>
                  <button onClick={() => { setShowReset(false); setResetSent(false); setResetEmail(""); }} style={{ background: "transparent", border: "none" }}>✕</button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ ...commonInputStyle, padding: 10, borderRadius: 8 }} // APPLIED FIX
                />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button onClick={() => { setShowReset(false); }} style={{ flex: 1, padding: 10, borderRadius: 8 }}>Cancel</button>
                <button onClick={async () => { await handleSendReset(); }} style={{ flex: 1, padding: 10, borderRadius: 8, background: "var(--brown-700)", color: "#fff" }}>
                  {resetSent ? "Sent ✓" : "Send reset email"}
                </button>
              </div>

              {resetSent && <div style={{ marginTop: 12, color: "var(--brown-700)" }}>Reset link has been sent (demo). Check inbox.</div>}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}