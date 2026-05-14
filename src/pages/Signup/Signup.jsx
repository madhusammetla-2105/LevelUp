import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("Male");
    const [studentPhone, setStudentPhone] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [avatar, setAvatar] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) return;

        try {
            // Mock signup since supabase is removed
            localStorage.setItem("levelup_logged_in", "true");
            localStorage.setItem("levelup_current_user_id", "mock-id-123");
            localStorage.setItem("levelup_user_name", name);
            localStorage.setItem("levelup_user_email", email);

            alert("Signup successful!");
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
                        <Link to="/login" className="auth-tab">Sign In</Link>
                        <div className="auth-tab active">Sign Up</div>
                    </div>

                    <div className="auth-header">
                        <h1 className="auth-heading">Create account</h1>
                        <p className="auth-subtext">Start your journey — it takes 30 seconds.</p>
                    </div>

                    <form onSubmit={handleSignup} className="auth-form">
                        <div className="auth-input-group">
                            <label>Profile Picture</label>
                            <label className="auth-file-input-wrapper">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="auth-file-input-hidden"
                                />
                                <div className="auth-file-input-box">
                                    <div className="upload-avatar-placeholder">
                                        {avatar ? (
                                            <img src={avatar} alt="Preview" />
                                        ) : (
                                            <span className="user-icon">👤</span>
                                        )}
                                    </div>
                                    <div className="upload-text">
                                        <strong>Upload photo</strong>
                                        <p>No file chosen</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div className="auth-input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                placeholder="Arjun Sharma"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-input-row">
                            <div className="auth-input-group flex-1">
                                <label>Age</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 15"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="auth-input-group flex-1">
                                <label>Gender</label>
                                <select value={gender} onChange={(e) => setGender(e.target.value)} className="auth-select">
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>Email address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="auth-input-group">
                            <label>Student Phone Number</label>
                            <input
                                type="tel"
                                placeholder="e.g. 9876543210"
                                value={studentPhone}
                                onChange={(e) => setStudentPhone(e.target.value)}
                            />
                        </div>

                        <div className="auth-input-row">
                            <div className="auth-input-group flex-1">
                                <label>Parent Email</label>
                                <input
                                    type="email"
                                    placeholder="parent@example.com"
                                    value={parentEmail}
                                    onChange={(e) => setParentEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="auth-input-group flex-1">
                                <label>Parent Phone</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. 9876543210"
                                    value={parentPhone}
                                    onChange={(e) => setParentPhone(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
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
                        </div>

                        <button type="submit" className="auth-btn-primary">
                            Create Account &rarr;
                        </button>
                    </form>

                    <p className="auth-footer-text">
                        By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>

    );
}

export default Signup;