import React, { useState, useEffect, createContext, useContext, useRef } from "react";

/* ============================
   AUTH CONTEXT
============================ */

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("auth_session"))
  );

  const login = (userData) => {
    localStorage.setItem("auth_session", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth_session");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <LoginScreen />;
  return children;
};

/* ============================
   NEON BUTTON
============================ */

const colorMap = {
  neonGreen: "border-green-400 text-green-400 hover:bg-green-400",
  neonBlue: "border-cyan-400 text-cyan-400 hover:bg-cyan-400",
};

const NeonButton = ({ children, onClick, color = "neonGreen", type="button" }) => (
  <button
    type={type}
    onClick={onClick}
    className={`${colorMap[color]} px-4 py-2 border hover:text-black transition-all uppercase text-xs`}
  >
    {children}
  </button>
);

/* ============================
   LOGIN SCREEN
============================ */

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = (e) => {
    e.preventDefault();

    if (form.username === "testuser" && form.password === "Test123") {
      login({ username: "testuser" });
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono">
      <form
        onSubmit={handleLogin}
        className="p-10 border border-green-400 bg-gray-900 flex flex-col gap-6 w-96"
      >
        <h2 className="text-green-400 text-2xl text-center">
          SECURE_ACCESS
        </h2>

        <input
          type="text"
          placeholder="USERNAME"
          className="bg-black border border-green-400 p-3 text-green-400"
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="PASSWORD"
          className="bg-black border border-green-400 p-3 text-green-400"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <NeonButton type="submit">LOGIN</NeonButton>
      </form>
    </div>
  );
};

/* ============================
   EMPLOYEE LIST
============================ */

const ListScreen = ({ onSelect, setEmployees }) => {
  const [employeesLocal, setEmployeesLocal] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = 60;
  const containerHeight = 600;

  useEffect(() => {
    fetch("https://backend.jotish.in/backend_dev/gettabledata.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: "test", password: "123456" }),
    })
      .then((res) => res.json())
      .then((data) => {
        const empData = data?.TABLE_DATA?.data || [];
        setEmployees(empData);
        setEmployeesLocal(empData);
      });
  }, []);

  const totalHeight = employeesLocal.length * rowHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 5);
  const endIndex = Math.min(
    employeesLocal.length - 1,
    Math.floor((scrollTop + containerHeight) / rowHeight) + 5
  );

  const visibleRows = employeesLocal.slice(startIndex, endIndex + 1);

  return (
    <div className="p-8 bg-black min-h-screen text-green-400">
      <h1 className="text-3xl mb-6 border-b border-green-400">
        EMPLOYEE_GRID
      </h1>

      <div
        onScroll={(e) => setScrollTop(e.target.scrollTop)}
        className="relative overflow-auto border border-cyan-400 h-[600px] bg-gray-900"
      >
        <div style={{ height: totalHeight, position: "relative" }}>
          {visibleRows.map((emp, i) => {
            const actualIndex = startIndex + i;

            return (
              <div
                key={emp[3]}
                onClick={() => onSelect(emp)}
                style={{
                  position: "absolute",
                  top: actualIndex * rowHeight,
                  height: rowHeight,
                }}
                className="w-full flex items-center px-6 border-b border-gray-800 hover:bg-green-400 hover:text-black cursor-pointer"
              >
                <span className="w-1/4">ID: {emp[3]}</span>
                <span className="w-2/4 font-bold">{emp[0]}</span>
                <span className="w-1/4 text-right">${emp[4]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================
   DETAILS SCREEN
============================ */

const DetailsScreen = ({ employee, onComplete }) => {
  const videoRef = useRef(null);
  const signatureRef = useRef(null);

  const [capturedImg, setCapturedImg] = useState(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    let stream;

    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      stream = s;
      videoRef.current.srcObject = stream;
    });

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const takePhoto = () => {
    const canvas = document.createElement("canvas");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    canvas
      .getContext("2d")
      .drawImage(videoRef.current, 0, 0);

    setCapturedImg(canvas.toDataURL("image/png"));
  };

  const startDraw = (e) => {
    const canvas = signatureRef.current;
    const ctx = canvas.getContext("2d");

    const rect = canvas.getBoundingClientRect();

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    isDrawing.current = true;
  };

  const stopDraw = () => (isDrawing.current = false);

  const draw = (e) => {
    if (!isDrawing.current) return;

    const canvas = signatureRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    ctx.strokeStyle = "#39FF14";
    ctx.lineWidth = 2;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const finalize = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = capturedImg;

    await img.decode();

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);
    ctx.drawImage(signatureRef.current, 0, 0);

    onComplete(canvas.toDataURL("image/png"));
  };

  return (
    <div className="bg-black min-h-screen p-8 text-green-400">
      <h1 className="text-2xl mb-6">VERIFY: {employee[0]}</h1>

      <div className="grid grid-cols-2 gap-8">

        <div className="border border-cyan-400 p-4">
          {!capturedImg ? (
            <video ref={videoRef} autoPlay className="w-full mb-4"/>
          ) : (
            <img src={capturedImg} className="w-full mb-4"/>
          )}

          <NeonButton onClick={takePhoto}>
            CAPTURE
          </NeonButton>
        </div>

        <div className="border border-green-400 p-4 bg-black">
          <p className="mb-2">SIGNATURE</p>

          <canvas
            ref={signatureRef}
            width={400}
            height={300}
            onMouseDown={startDraw}
            onMouseUp={stopDraw}
            onMouseMove={draw}
            className="bg-gray-900 w-full border border-dashed border-green-400"
          />

          <div className="mt-4">
            <NeonButton color="neonBlue" onClick={finalize}>
              FINALIZE
            </NeonButton>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ============================
   ANALYTICS SCREEN
============================ */

const AnalyticsScreen = ({ auditImg, data }) => {

  const chartWidth = 700;
  const chartHeight = 350;
  const padding = 50;

  const salaries = data.map(d => parseInt(d[4]));

  if (!salaries.length) {
    return <div className="p-8 text-cyan-400">No data available</div>;
  }

  const minSalary = Math.min(...salaries);
  const maxSalary = Math.max(...salaries);

  const bucketCount = 6;
  const bucketSize = Math.ceil((maxSalary - minSalary) / bucketCount);

  const buckets = new Array(bucketCount).fill(0);

  salaries.forEach(sal => {
    const index = Math.min(
      Math.floor((sal - minSalary) / bucketSize),
      bucketCount - 1
    );
    buckets[index]++;
  });

  const maxBucket = Math.max(...buckets);

  const barWidth = (chartWidth - padding * 2) / bucketCount;

  return (
    <div className="bg-black min-h-screen p-8 text-cyan-400">

      <h1 className="text-3xl mb-8 border-b border-cyan-400">
        AUDIT_REPORT
      </h1>

      <div className="flex gap-8">

        <div className="w-1/3">
          <h3 className="text-green-400 mb-2">MERGED_IDENTITY</h3>

          <img
            src={auditImg}
            className="border border-green-400"
            alt="audit"
          />
        </div>

        <div className="w-2/3">

          <h3 className="mb-4">SALARY_DISTRIBUTION</h3>

          <svg
            width={chartWidth}
            height={chartHeight}
            className="border border-cyan-400 bg-black"
          >

            <line
              x1={padding}
              y1={chartHeight - padding}
              x2={chartWidth - padding}
              y2={chartHeight - padding}
              stroke="#00F3FF"
            />

            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={chartHeight - padding}
              stroke="#00F3FF"
            />

            {buckets.map((count, i) => {

              const barHeight =
                (count / maxBucket) *
                (chartHeight - padding * 2);

              const x = padding + i * barWidth;
              const y = chartHeight - padding - barHeight;

              const rangeStart = minSalary + i * bucketSize;
              const rangeEnd = rangeStart + bucketSize;

              return (
                <g key={i}>

                  <rect
                    x={x + 10}
                    y={y}
                    width={barWidth - 20}
                    height={barHeight}
                    fill="#00F3FF"
                  />

                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    fill="#39FF14"
                    fontSize="12"
                    textAnchor="middle"
                  >
                    {count}
                  </text>

                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - 20}
                    fill="#00F3FF"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {Math.round(rangeStart)}-{Math.round(rangeEnd)}
                  </text>

                </g>
              );
            })}

          </svg>

        </div>

      </div>
    </div>
  );
};

/* ============================
   MAIN APP
============================ */

c/* ============================
   APP CONTENT
============================ */

const AppContent = () => {

  const { logout } = useContext(AuthContext);

  const [screen, setScreen] = useState("list");
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [auditImg, setAuditImg] = useState(null);

  return (
    <ProtectedRoute>

      <div className="bg-black min-h-screen">

        <nav className="p-4 flex justify-between border-b border-green-400">

          <div className="flex gap-4">

            <button
              onClick={() => setScreen("list")}
              className="text-green-400"
            >
              GRID
            </button>

            <button
              onClick={() => setScreen("analytics")}
              className="text-cyan-400"
            >
              ANALYTICS
            </button>

          </div>

          <NeonButton color="neonBlue" onClick={logout}>
            LOGOUT
          </NeonButton>

        </nav>

        {screen === "list" && (
          <ListScreen
            setEmployees={setEmployees}
            onSelect={(emp) => {
              setSelectedEmp(emp);
              setScreen("details");
            }}
          />
        )}

        {screen === "details" && (
          <DetailsScreen
            employee={selectedEmp}
            onComplete={(img) => {
              setAuditImg(img);
              setScreen("analytics");
            }}
          />
        )}

        {screen === "analytics" && (
          <AnalyticsScreen
            auditImg={auditImg}
            data={employees}
          />
        )}

      </div>

    </ProtectedRoute>
  );
};


/* ============================
   MAIN APP WRAPPER
============================ */

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;