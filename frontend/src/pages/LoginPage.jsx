import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import kkpLogo from "../assets/kkp.png";
import PixelBlast from "../components/PixelBlast";

const roleHome = {
  admin: "/admin",
  operatorEselon1: "/operator-eselon1",
  operatorEselon2: "/operator-eselon2",
  operatorUPT: "/operator-upt",
};

// Map role_id to role key
const getRoleFromId = (roleId) => {
  const roleMap = {
    1: "admin",
    2: "operatorEselon1",
    3: "operatorEselon2",
    4: "operatorUPT",
  };
  return roleMap[roleId] || "admin";
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState(() =>
    String(getRandomInt(100000, 999999)),
  );
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const captchaCanvasRef = useRef(null);
  const navigate = useNavigate();

  const regenerateCaptcha = () => {
    setCaptcha(String(getRandomInt(100000, 999999)));
    setCaptchaInput("");
    setCaptchaError("");
  };

  // Draw captcha on canvas
  useEffect(() => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#2196f3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set text properties
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    // Draw each digit
    for (let i = 0; i < captcha.length; i++) {
      ctx.save();

      const x = 12 + i * 20;
      const y = 22;

      ctx.translate(x, y);
      ctx.rotate((getRandomInt(-8, 8) * Math.PI) / 180);

      ctx.font = "bold 20px Arial, Helvetica, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#1565c0";
      ctx.lineWidth = 0.5;

      ctx.fillText(captcha[i], 0, 0);
      ctx.strokeText(captcha[i], 0, 0);

      ctx.restore();
    }

    // Add noise lines
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(getRandomInt(0, 130), getRandomInt(0, 45));
      ctx.lineTo(getRandomInt(0, 130), getRandomInt(0, 45));
      ctx.stroke();
    }
  }, [captcha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    if (!email.includes("@")) {
      setError("Format email tidak valid");
      return;
    }

    if (captchaInput !== captcha) {
      setCaptchaError("Captcha salah");
      regenerateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/users/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        setError(result.message || "Login gagal");
        setLoading(false);
        regenerateCaptcha();
        return;
      }

      // Get role from role_id
      const role = getRoleFromId(result.data.role_id);

      // Validate required fields based on role
      if (role === "operatorEselon1" && !result.data.eselon1_id) {
        setError("Data Eselon 1 tidak ditemukan untuk akun Operator Eselon 1");
        setLoading(false);
        regenerateCaptcha();
        return;
      }

      if (role === "operatorEselon2") {
        if (!result.data.eselon2_id) {
          setError(
            "Data Eselon 2 tidak ditemukan untuk akun Operator Eselon 2",
          );
          setLoading(false);
          regenerateCaptcha();
          return;
        }
        if (!result.data.eselon1_id) {
          setError(
            "Data Eselon 1 tidak ditemukan untuk akun Operator Eselon 2",
          );
          setLoading(false);
          regenerateCaptcha();
          return;
        }
      }

      if (role === "operatorUPT" && !result.data.upt_id) {
        setError("Data UPT tidak ditemukan untuk akun Operator UPT");
        setLoading(false);
        regenerateCaptcha();
        return;
      }

      // Store user data di localStorage with proper typing
      localStorage.setItem("userRole", role);
      localStorage.setItem("userEmail", result.data.email || "");
      localStorage.setItem("userId", String(result.data.user_id || ""));
      localStorage.setItem("userName", result.data.nama || "");
      localStorage.setItem("eselon1_id", String(result.data.eselon1_id || ""));
      localStorage.setItem("eselon2_id", String(result.data.eselon2_id || ""));
      localStorage.setItem("upt_id", String(result.data.upt_id || ""));
      localStorage.setItem("namaEselon1", result.data.nama_eselon1 || "");
      localStorage.setItem("namaEselon2", result.data.nama_eselon2 || "");
      localStorage.setItem("namaUPT", result.data.nama_upt || "");

      // Navigate ke home page sesuai role
      navigate(roleHome[role] || "/admin", { replace: true });
    } catch (error) {
      setError("Terjadi kesalahan saat login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
          padding: "20px",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* PixelBlast Background */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 }}>
          <PixelBlast
            variant="square"
            pixelSize={4}
            color="#285dc8"
            patternScale={2.75}
            patternDensity={1}
            pixelSizeJitter={0}
            enableRipples
            rippleSpeed={0.4}
            rippleThickness={0.12}
            rippleIntensityScale={1.5}
            liquid={false}
            liquidStrength={0.12}
            liquidRadius={1.2}
            liquidWobbleSpeed={5}
            speed={0.5}
            edgeFade={0.25}
            transparent
          />
        </div>
        
        {/* Login Card */}
        <div
          style={{
            width: "100%",
            maxWidth: "650px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
            minHeight: "420px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left Side: Logo */}
          <div
            style={{
              flex: "1",
              backgroundColor: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "25px",
              borderRight: "1px solid #f1f5f9",
            }}
          >
            <img
              src={kkpLogo}
              alt="KKP Logo"
              style={{
                width: "100%",
                maxWidth: "150px",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
          <div
            style={{
              flex: "2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "35px 30px",
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#1e293b",
                  margin: "0",
                  textAlign: "center",
                  lineHeight: "1.4",
                }}
              >
                Sistem Informasi Manajemen Aplikasi
              </h1>
            </div>
            {error && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "10px 14px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fee2e2",
                  borderRadius: "10px",
                  color: "#b91c1c",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#64748b",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="nama@kkp.go.id"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#cbd5e180",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "#1e293b",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease",
                  }}
                />
              </div>
              {/* Password Input */}
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#64748b",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Masukkan password"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      paddingRight: "46px",
                      backgroundColor: "#cbd5e180",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#1e293b",
                      boxSizing: "border-box",
                      transition: "all 0.2s ease",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: "transparent",
                      border: "none",
                      fontSize: "18px",
                      cursor: loading ? "not-allowed" : "pointer",
                      padding: "4px",
                      color: "#64748b",
                      opacity: loading ? 0.5 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              {/* Captcha */}
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 600,
                    color: "#1e293b",
                    fontSize: "13px",
                  }}
                >
                  Captcha <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <canvas
                    ref={captchaCanvasRef}
                    width={130}
                    height={45}
                    style={{
                      borderRadius: "5px",
                      background: "#2196f3",
                      display: "block",
                    }}
                  />
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) =>
                      setCaptchaInput(e.target.value.replace(/\D/g, ""))
                    }
                    maxLength={6}
                    required
                    placeholder="Masukkan angka di atas"
                    style={{
                      width: "85px",
                      padding: "8px 10px",
                      border: "1px solid #cbd5e1",
                      borderRadius: "5px",
                      fontSize: "12px",
                      boxSizing: "border-box",
                      textAlign: "center",
                    }}
                  />
                  <button
                    type="button"
                    onClick={regenerateCaptcha}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #cbd5e1",
                      background: "#f8fafc",
                      color: "#475569",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    title="Ganti angka"
                  >
                    ↻
                  </button>
                </div>
                {captchaError && (
                  <div
                    style={{
                      color: "#ef4444",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {captchaError}
                  </div>
                )}
              </div>
              {/* Forgot Password Link */}
              <div style={{ marginBottom: "20px", textAlign: "left" }}>
                <span
                  onClick={() => navigate("/forgot-password")}
                  style={{
                    color: "#00a8e8",
                    fontSize: "13px",
                    textDecoration: "underline",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Lupa Password?
                </span>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: loading ? "#94a3b8" : "#00a8e8",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 6px -1px rgba(0, 168, 232, 0.2)",
                }}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.backgroundColor = "#0096d1")
                }
                onMouseLeave={(e) =>
                  !loading && (e.target.style.backgroundColor = "#00a8e8")
                }
              >
                {loading ? "Sedang login..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
