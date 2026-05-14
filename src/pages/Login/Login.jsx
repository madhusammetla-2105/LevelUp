import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) return;

        try {
            // Mock login since supabase is removed
            localStorage.setItem("levelup_logged_in", "true");
            localStorage.setItem("levelup_current_user_id", "mock-id-123");
            localStorage.setItem("levelup_user_email", email);
            localStorage.setItem("levelup_user_name", "Student");
            
            navigate("/dashboard");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="auth-page">
            {/* LEFT PANEL */}
            <div className="auth-left">
                <div className="auth-brand">
                    <div className="logo-container">
                        <span className="rocket-icon">🚀</span>
                        <div className="logo-text">
                            <span className="logo-l">L</span>
                            <span className="logo-evel">EVEL</span>
                            <span className="logo-u">U</span>
                            <span className="logo-p">P<span className="logo-arrow">↑</span></span>
                        </div>
                    </div>
                    <p className="auth-brand-subtitle">YOUR AI STUDY COMPANION</p>
                </div>

                <div className="auth-marketing">
                    <h1 className="auth-hero-text">
                        Study<br />
                        <span className="indent-1">smarter.</span><br />
                        Track<br />
                        <span className="indent-2">deeper.</span><br />
                        <span className="auth-hero-highlight">Rise further.</span>
                    </h1>
                    <p className="auth-description">
                        An intelligent study platform that adapts to your cognitive rhythm — tracking focus, managing tasks, and summarising content so you can perform at your best.
                    </p>
                </div>

                <div className="auth-features">
                    <span className="auth-feature-pill">AI Focus Engine</span>
                    <span className="auth-feature-pill">PDF Summarizer</span>
                    <span className="auth-feature-pill">Cognitive Load Tracker</span>
                    <span className="auth-feature-pill">Parent Dashboard</span>
                    <span className="auth-feature-pill">Pomodoro Timer</span>
                    <span className="auth-feature-pill">Study Analytics</span>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="auth-right">
                <div className="auth-card">
                    
                    <div className="auth-tab-switcher">
                        <div className="auth-tab active">Sign In</div>
                        <Link to="/signup" className="auth-tab">Sign Up</Link>
                    </div>

                    <div className="auth-header">
                        <h1 className="auth-heading">Welcome back</h1>
                        <p className="auth-subtext">Sign in to continue your learning journey.</p>
                    </div>

                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="auth-input-group">
                            <label>Email address or Student ID</label>
                            <input
                                type="text"
                                placeholder="you@example.com or LU-1234"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <span 
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "👁️‍🗨️" : "👁️"}
                                </span>
                            </div>
                            <div className="auth-forgot-password">
                                <a href="#">Forgot password?</a>
                            </div>
                        </div>

                        <button type="submit" className="auth-btn-primary">
                            Sign In &rarr;
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <button type="button" className="auth-btn-google">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
                        Continue with Google
                    </button>

                    <p className="auth-footer-text">
                        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>

    );
}

export default Login;