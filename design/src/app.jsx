// Folio — root app + routing + tweaks.

const { useState: rS, useEffect: rE } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "density": "comfortable",
  "brandName": "Folio",
  "brandLetter": "F",
  "brandColor": "#1A1714"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [role, setRole] = rS(() => window.ROLES.find(r => r.id === "ops_manager"));
  const [page, setPage] = rS("home");
  const [focusedIncident, setFocusedIncident] = rS(null);
  const [altitudeIncidentId, setAltitudeIncidentId] = rS(null);
  const [showSwitcher, setShowSwitcher] = rS(false);

  rE(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.dataset.density = t.density;
  }, [t.theme, t.density]);

  rE(() => {
    const allowed = window.NAV_BY_ALTITUDE[role.altitude] || ["home"];
    if (!allowed.includes(page) && page !== "incident" && page !== "altitude") {
      setPage(allowed[0]);
    }
  }, [role.altitude]);

  const openIncident = (inc) => { setFocusedIncident(inc); setPage("incident"); };
  const openAltitude = (id)  => { setAltitudeIncidentId(id); setPage("altitude"); };
  const navigate = (p) => { setFocusedIncident(null); setPage(p); };

  return (
    <div className="app">
      <Sidebar tweaks={t} role={role} page={page} setPage={navigate} openRoleSwitcher={() => setShowSwitcher(true)} />
      <div className="main">
        <Topbar role={role} page={page} focusedIncident={page === "incident" ? focusedIncident : null} />
        <div className="content">
          {page === "home"       && <HomePage role={role} setPage={navigate} openIncident={openIncident} openAltitude={openAltitude} />}
          {page === "queue"      && <QueuePage role={role} openIncident={openIncident} openAltitude={openAltitude} />}
          {page === "incident"   && focusedIncident && <IncidentPage incident={focusedIncident} role={role} back={() => navigate("queue")} openAltitude={openAltitude} />}
          {page === "altitude"   && <AltitudePage incidentId={altitudeIncidentId || "LEASE-A-2491"} role={role} back={() => navigate("home")} setRole={setRole} />}
          {page === "templates"  && <DetectionPage role={role} />}
          {page === "compliance" && <CompliancePage role={role} />}
          {page === "pipeline"   && <ITOpsPage role={role} />}
          {page === "training"   && <TrainingPage role={role} />}
          {page === "reports"    && <ReportsPage role={role} />}
        </div>
      </div>

      {showSwitcher && <RoleSwitcher currentRole={role} onPick={setRole} onClose={() => setShowSwitcher(false)} />}

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={t.theme} options={["light","dark"]} onChange={v => setTweak("theme", v)} />
        <TweakSection label="Density" />
        <TweakRadio label="Spacing" value={t.density} options={["comfortable","compact","dense"]} onChange={v => setTweak("density", v)} />
        <TweakSection label="Brand" />
        <TweakText  label="Org name"    value={t.brandName}   onChange={v => setTweak("brandName", v)} />
        <TweakText  label="Mark letter" value={t.brandLetter} onChange={v => setTweak("brandLetter", v)} maxLength={2} />
        <TweakColor label="Mark color"  value={t.brandColor}
          options={["#1A1714","#8B3A1F","#2F4C2A","#2A4E8F","#6E6960","#B5651D"]}
          onChange={v => setTweak("brandColor", v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
