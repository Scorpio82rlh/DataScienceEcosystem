
const sitePalette = [
  { name: "Indigo 600", hex: "#4F46E5" },
  { name: "Sky 400", hex: "#38BDF8" },
  { name: "Emerald 500", hex: "#10B981" },
  { name: "Amber 400", hex: "#F59E0B" },
  { name: "Slate 900", hex: "#0F172A" }
];

const featureList = [
  { icon: "🧠", title: "AI Tutor Guide", desc: "A glowing arcade‑style avatar gives rationales, hints, and clinical pearls." },
  { icon: "🕹️", title: "True CSE Branching", desc: "Indicated / not indicated logic with branching decisions and early terminations." },
  { icon: "⚖️", title: "Harmful vs Beneficial", desc: "Hidden point values mirror credit, neutral, and penalty scoring." },
  { icon: "☁️", title: "Cloud Tap Orders", desc: "Arcade clouds animate each choice—tap fast, but stay accurate." },
  { icon: "📊", title: "Randomized Vitals", desc: "Vitals and ABGs drift within realistic ranges for each reset." },
  { icon: "🎯", title: "Progress Tracking", desc: "See IG vs DM progress, total score, and branches cleared." },
  { icon: "🏆", title: "Badges & Streaks", desc: "Build confidence with streak bonuses and mastery milestones." }
];

const heroCloudOptions = [
  { id: "hero-sputum", label: "Sputum culture", tag: "beneficial" },
  { id: "hero-bipap", label: "Start BiPAP", tag: "beneficial" },
  { id: "hero-intubate", label: "Intubate now", tag: "harmful" },
  { id: "hero-fio2", label: "Increase FiO₂ to 40%", tag: "beneficial" }
];

const heroTotals = {
  total: heroCloudOptions.length,
  beneficial: heroCloudOptions.filter(option => option.tag === "beneficial").length
};

const heroState = {
  score: 0,
  cleared: 0,
  lastMessage: ""
};

let heroResetTimer = null;

const vitalTemplates = [
  { key: "SpO₂", unit: "%", range: [86, 89], trend: "critical" },
  { key: "Respiratory Rate", unit: "breaths/min", range: [26, 32], trend: "up" },
  { key: "Heart Rate", unit: "bpm", range: [105, 122], trend: "up" },
  { key: "Temperature", unit: "°C", range: [38.4, 39.1], trend: "up", decimals: 1 },
  { key: "Blood Pressure", unit: "mmHg", pair: [ [138, 152], [78, 88] ] },
  { key: "pH", range: [7.26, 7.31], trend: "critical", decimals: 2 },
  { key: "PaCO₂", unit: "mmHg", range: [58, 68], trend: "critical" },
  { key: "PaO₂", unit: "mmHg", range: [48, 60], trend: "critical" }
];

const caseData = {
  id: "febrile-copd",
  title: "Febrile COPD Exacerbation",
  entry: "ig-history",
  steps: {
    "ig-history": {
      type: "IG",
      question: "Prioritize history cues",
      prompt: "Select the indicated history questions before you order therapy for this febrile COPD exacerbation.",
      allowMultiple: true,
      ai: {
        headline: "Start with baseline",
        body: [
          "NBRC loves to see you confirm home support and recent triggers before you order equipment.",
          "Sedation or delays before you know the patient's baseline ventilatory status cost credit."
        ]
      },
      options: [
        {
          id: "home-oxygen",
          label: "Ask about home oxygen prescription and adherence",
          tag: "beneficial",
          points: 2,
          rationale: "Baseline oxygen targets guide how aggressive you should be with FiO₂ and NIV.",
          group: "History"
        },
        {
          id: "medication-use",
          label: "Review inhaled bronchodilator and steroid adherence",
          tag: "beneficial",
          points: 1,
          rationale: "Identifies recent underuse that may be driving the exacerbation and informs education later.",
          group: "History"
        },
        {
          id: "sputum-character",
          label: "Clarify changes in sputum volume and color",
          tag: "beneficial",
          points: 1,
          rationale: "Helps confirm infectious etiology and antibiotic need—classic IG point on CSE cases.",
          group: "History"
        },
        {
          id: "tobacco-status",
          label: "Confirm smoking status and quit attempts",
          tag: "neutral",
          points: 0,
          rationale: "Useful background but not immediately actionable for this acute encounter.",
          group: "History"
        },
        {
          id: "surgery-history",
          label: "Investigate prior abdominal surgeries",
          tag: "neutral",
          points: 0,
          rationale: "Does not change emergent respiratory management in this scenario.",
          group: "History"
        },
        {
          id: "give-sedation",
          label: "Administer IV sedation before assessment",
          tag: "harmful",
          points: -2,
          rationale: "Sedating before evaluating ventilation can worsen hypercapnia and obscure neurologic status.",
          group: "Harm"
        }
      ],
      next: "ig-exam"
    },
    "ig-exam": {
      type: "IG",
      question: "Immediate bedside assessment",
      prompt: "Which focused assessments are indicated right now?",
      allowMultiple: true,
      ai: {
        headline: "Look before you leap",
        body: [
          "Rapid visualization and auscultation justify any escalation.",
          "Avoid positioning or deferring monitors that worsen ventilation."
        ]
      },
      options: [
        {
          id: "inspect-accessory",
          label: "Inspect accessory muscle use and chest excursion",
          tag: "beneficial",
          points: 1,
          rationale: "Work of breathing determines need for ventilatory support.",
          group: "Assessment"
        },
        {
          id: "auscultate",
          label: "Auscultate lung fields for wheezes and crackles",
          tag: "beneficial",
          points: 1,
          rationale: "Findings differentiate bronchospasm from pneumonia involvement and guide therapy.",
          group: "Assessment"
        },
        {
          id: "assess-mental",
          label: "Evaluate mental status and ability to protect airway",
          tag: "beneficial",
          points: 1,
          rationale: "Altering sensorium indicates rising CO₂ and need for escalation.",
          group: "Assessment"
        },
        {
          id: "supine-position",
          label: "Place patient supine without head elevation",
          tag: "harmful",
          points: -2,
          rationale: "Supine positioning worsens diaphragmatic movement and secretion clearance.",
          group: "Harm"
        },
        {
          id: "delay-spo2",
          label: "Delay SpO₂ monitoring until after therapy",
          tag: "harmful",
          points: -1,
          rationale: "Continuous oximetry is essential baseline data before interventions.",
          group: "Harm"
        },
        {
          id: "pedal-edema",
          label: "Inspect pedal edema",
          tag: "neutral",
          points: 0,
          rationale: "Chronic cor pulmonale findings do not drive acute management here.",
          group: "Assessment"
        }
      ],
      next: "ig-monitoring"
    },
    "ig-monitoring": {
      type: "IG",
      question: "Monitoring and diagnostics",
      prompt: "Choose the monitoring data you should gather before committing to invasive support.",
      allowMultiple: true,
      ai: {
        headline: "Capture ventilation data",
        body: [
          "ABG + capnography pair well on COPD cases for NBRC scoring.",
          "Avoid labs that don't change emergent respiratory care."
        ]
      },
      options: [
        {
          id: "obtain-abg",
          label: "Obtain an arterial blood gas immediately",
          tag: "beneficial",
          points: 2,
          rationale: "Confirms ventilatory failure (↑PaCO₂) and acid-base status before interventions.",
          group: "Diagnostics",
          onSelect: state => {
            state.flags.abg = true;
          }
        },
        {
          id: "start-capno",
          label: "Apply continuous waveform capnography",
          tag: "beneficial",
          points: 1,
          rationale: "Trending CO₂ helps judge response to bronchodilators/NIV without repeated sticks.",
          group: "Monitoring",
          onSelect: state => {
            state.flags.capno = true;
          }
        },
        {
          id: "order-metabolic",
          label: "Order a basic metabolic panel",
          tag: "neutral",
          points: 0,
          rationale: "Helpful for chronic management but not urgent for ventilatory decisions.",
          group: "Diagnostics"
        },
        {
          id: "order-d-dimer",
          label: "Order a STAT D-dimer",
          tag: "harmful",
          points: -1,
          rationale: "No suspicion of PE—ordering low-yield tests wastes critical time.",
          group: "Harm"
        }
      ],
      next: "ig-labs"
    },
    "ig-labs": {
      type: "IG",
      question: "Targeted labs & cultures",
      prompt: "Identify which laboratory studies support the suspected infectious COPD exacerbation.",
      allowMultiple: true,
      ai: {
        headline: "Support the infection story",
        body: [
          "Sputum cultures and CBCs are recurring NBRC picks when infection drives the flare.",
          "Avoid exotic tests that delay antibiotics."
        ]
      },
      options: [
        {
          id: "sputum-culture",
          label: "Send sputum for Gram stain and culture",
          tag: "beneficial",
          points: 1,
          rationale: "Guides targeted antibiotics and documents purulent exacerbation.",
          group: "Diagnostics"
        },
        {
          id: "cbc",
          label: "Order CBC with differential",
          tag: "beneficial",
          points: 1,
          rationale: "Leukocytosis supports infectious trigger and trending response.",
          group: "Diagnostics"
        },
        {
          id: "viral-panel",
          label: "Request comprehensive viral PCR panel",
          tag: "neutral",
          points: 0,
          rationale: "Could help but not essential before therapy—no penalty if deferred.",
          group: "Diagnostics"
        },
        {
          id: "brain-mri",
          label: "Order emergent brain MRI",
          tag: "harmful",
          points: -2,
          rationale: "Unrelated imaging wastes resources and delays respiratory interventions.",
          group: "Harm"
        }
      ],
      next: "ig-prep"
    },
    "ig-prep": {
      type: "IG",
      question: "Prepare the bay",
      prompt: "Before you make decisions, prep the bedside resources you'll likely need.",
      allowMultiple: true,
      ai: {
        headline: "Set up the win",
        body: [
          "NBRC rewards anticipatory prep—NIV circuits, suction, and airway equipment.",
          "Drawing paralytics without a plan is harmful."
        ]
      },
      options: [
        {
          id: "setup-niv",
          label: "Set up a noninvasive ventilation circuit with bacterial filter",
          tag: "beneficial",
          points: 2,
          rationale: "Readies BiPAP quickly—matches scenario description.",
          group: "Preparation",
          onSelect: state => {
            state.flags.nivReady = true;
          }
        },
        {
          id: "check-suction",
          label: "Ensure Yankauer suction and inline suction are functional",
          tag: "beneficial",
          points: 1,
          rationale: "COPD patients with sputum need airway clearance tools immediately available.",
          group: "Preparation"
        },
        {
          id: "airway-cart",
          label: "Verify airway cart and intubation meds are nearby",
          tag: "beneficial",
          points: 1,
          rationale: "Readiness for deterioration is good practice even if NIV succeeds.",
          group: "Preparation",
          onSelect: state => {
            state.flags.airwayReady = true;
          }
        },
        {
          id: "draw-paralytic",
          label: "Pre-draw paralytics despite no plan to intubate",
          tag: "harmful",
          points: -2,
          rationale: "Giving paralytics without a secured airway can be catastrophic and is unjustified yet.",
          group: "Harm"
        }
      ],
      next: "dm-initial-support"
    },
    "dm-initial-support": {
      type: "DM",
      question: "Initial ventilatory support",
      prompt: "ABG returns: pH 7.28 / PaCO₂ 64 mmHg / PaO₂ 54 mmHg on 28% Venturi. Choose the best immediate action.",
      allowMultiple: false,
      ai: {
        headline: "Hypercapnic failure",
        body: [
          "BiPAP is first-line when mental status is intact and hemodynamics are stable.",
          "Jumping to intubation or giving sedatives is penalized unless NIV fails."
        ]
      },
      options: [
        {
          id: "start-bipap",
          label: "Initiate BiPAP 12/5 cm H₂O, FiO₂ 0.40",
          tag: "beneficial",
          points: 3,
          rationale: "Addresses both oxygenation and ventilation without the risks of intubation.",
          group: "Therapy",
          onSelect: state => {
            state.flags.startedBiPap = true;
          }
        },
        {
          id: "increase-venturi",
          label: "Increase Venturi mask to 40% and reassess later",
          tag: "neutral",
          points: 0,
          rationale: "Improves oxygenation slightly but ignores CO₂ retention—no credit, no penalty.",
          group: "Therapy"
        },
        {
          id: "intubate-now",
          label: "Proceed directly to endotracheal intubation",
          tag: "harmful",
          points: -3,
          fatal: true,
          rationale: "Skipping NIV in a stable COPD exacerbation is harmful and ends the case early.",
          group: "Harm",
          onSelect: state => {
            state.flags.intubated = true;
          }
        },
        {
          id: "give-morphine",
          label: "Give IV morphine for dyspnea relief",
          tag: "harmful",
          points: -2,
          rationale: "Opiates depress respiratory drive and worsen hypercapnia.",
          group: "Harm"
        }
      ],
      next: (context, state) => {
        if (context.selected.includes("start-bipap")) {
          return "dm-vent-adjust";
        }
        if (context.selected.includes("intubate-now")) {
          return null;
        }
        return "dm-vent-adjust";
      }
    },
    "dm-vent-adjust": {
      type: "DM",
      question: "Ventilatory follow-up",
      prompt: state => state.flags.startedBiPap
        ? "Ten minutes after BiPAP 12/5, RR is 26, SpO₂ 90%, patient still using accessory muscles. Pick indicated actions."
        : "The patient remains tachypneic on Venturi mask with CO₂ 64 mmHg. Choose your next best steps.",
      allowMultiple: state => state.flags.startedBiPap,
      ai: {
        headline: "Tune support",
        body: [
          "If NIV is running, adjust pressures before abandoning it.",
          "If you skipped NIV, now is the time to deploy it—sedation without airway is harmful."
        ]
      },
      options: state => state.flags.startedBiPap
        ? [
            {
              id: "raise-ipap",
              label: "Increase IPAP to 16 cm H₂O keeping EPAP 5",
              tag: "beneficial",
              points: 2,
              rationale: "Higher pressure support improves ventilation and reduces PaCO₂.",
              group: "Therapy"
            },
            {
              id: "raise-epap",
              label: "Increase EPAP to 8 cm H₂O without changing IPAP",
              tag: "harmful",
              points: -1,
              rationale: "Raises mean airway pressure without extra support, risking CO₂ retention.",
              group: "Harm"
            },
            {
              id: "stop-niv",
              label: "Abandon NIV and intubate immediately",
              tag: "harmful",
              points: -2,
              rationale: "Prematurely abandoning NIV after limited time loses credit unless failure signs appear.",
              group: "Harm",
              onSelect: state => {
                state.flags.intubated = true;
              }
            }
          ]
        : [
            {
              id: "start-niv-now",
              label: "Initiate BiPAP now that equipment is ready",
              tag: "beneficial",
              points: 2,
              rationale: "Delaying NIV initially costs credit, but starting it now is still indicated.",
              group: "Therapy",
              onSelect: state => {
                state.flags.startedBiPap = true;
              }
            },
            {
              id: "prepare-intubation",
              label: "Prepare for potential intubation while monitoring response",
              tag: "neutral",
              points: 0,
              rationale: "Readiness without committing is reasonable—especially if NIV may fail.",
              group: "Preparation",
              onSelect: state => {
                state.flags.airwayReady = true;
              }
            },
            {
              id: "administer-sedation",
              label: "Give IV sedatives now to calm the patient",
              tag: "harmful",
              points: -2,
              rationale: "Sedation without a definitive airway risks hypoventilation and arrest.",
              group: "Harm"
            }
          ],
      next: "dm-infection-management"
    },
    "dm-infection-management": {
      type: "DM",
      question: "Treat the infectious trigger",
      prompt: "Select the indicated pharmacologic therapies for this febrile COPD exacerbation.",
      allowMultiple: true,
      ai: {
        headline: "Stack the trio",
        body: [
          "COPD exacerbation with suspected infection calls for bronchodilators, systemic steroids, and antibiotics.",
          "Diuretics or withholding antipyretics do not address the trigger."
        ]
      },
      options: [
        {
          id: "start-nebulizer",
          label: "Administer scheduled nebulized short-acting bronchodilators",
          tag: "beneficial",
          points: 1,
          rationale: "Addresses bronchospasm and improves airflow with minimal risk.",
          group: "Therapy"
        },
        {
          id: "start-steroids",
          label: "Initiate IV methylprednisolone",
          tag: "beneficial",
          points: 1,
          rationale: "Systemic steroids shorten exacerbation duration per guidelines.",
          group: "Therapy"
        },
        {
          id: "start-antibiotics",
          label: "Begin empiric IV antibiotics targeting gram-negative organisms",
          tag: "beneficial",
          points: 2,
          rationale: "Purulent sputum with fever warrants antibiotics—classic NBRC decision.",
          group: "Therapy",
          onSelect: state => {
            state.flags.abx = true;
          }
        },
        {
          id: "start-lasix",
          label: "Administer IV furosemide",
          tag: "harmful",
          points: -1,
          rationale: "No fluid overload—diuretics can worsen hemodynamics unnecessarily.",
          group: "Harm"
        },
        {
          id: "hold-antipyretic",
          label: "Hold antipyretics to watch the fever trend",
          tag: "neutral",
          points: 0,
          rationale: "Fever control is supportive but not critical to scoring—no credit or penalty.",
          group: "Support"
        }
      ],
      next: "dm-reassessment"
    },
    "dm-reassessment": {
      type: "DM",
      question: "Reassessment after therapy",
      prompt: state => state.flags.startedBiPap
        ? "After 20 minutes of NIV plus meds: RR 22, SpO₂ 93%, pH 7.32, PaCO₂ 58. Choose ongoing assessments."
        : "After bronchodilators on oxygen: RR 28, SpO₂ 90%, pH 7.29, PaCO₂ 62. Select your monitoring plan.",
      allowMultiple: true,
      ai: {
        headline: "Trend the response",
        body: [
          "NBRC rewards continued trending of ABGs and neuro status after interventions.",
          "Do not remove monitoring that is helping you catch deterioration."
        ]
      },
      options: [
        {
          id: "repeat-abg",
          label: "Repeat ABG in 30-60 minutes",
          tag: "beneficial",
          points: 1,
          rationale: "Confirms ongoing improvement or need to escalate.",
          group: "Monitoring"
        },
        {
          id: "monitor-mental",
          label: "Trend mental status and fatigue",
          tag: "beneficial",
          points: 1,
          rationale: "Hypercapnia relapse shows up early as lethargy—keep checking.",
          group: "Monitoring"
        },
        {
          id: "document-response",
          label: "Document ventilatory response and communicate with team",
          tag: "neutral",
          points: 0,
          rationale: "Good practice but not a scoring differentiator.",
          group: "Monitoring"
        },
        {
          id: "stop-capno",
          label: "Discontinue waveform capnography now",
          tag: "harmful",
          points: -1,
          rationale: "Capnography guides whether NIV is succeeding—removing it too early loses data.",
          group: "Harm"
        }
      ],
      next: "dm-disposition"
    },
    "dm-disposition": {
      type: "DM",
      question: "Disposition planning",
      prompt: state => state.flags.startedBiPap
        ? "With improving ABG on BiPAP and hemodynamic stability, choose the best disposition."
        : "After delayed NIV initiation the patient is stable but still hypercapnic. Choose disposition.",
      allowMultiple: false,
      ai: {
        headline: "Right level of care",
        body: [
          "Improving COPD cases on NIV usually go to a monitored step-down or ICU depending on the support needed.",
          "Discharging or ignoring the need for monitoring is harmful."
        ]
      },
      options: [
        {
          id: "admit-stepdown",
          label: "Admit to step-down/telemetry unit with NIV capability",
          tag: "beneficial",
          points: 2,
          rationale: "Matches need for continued NIV and close monitoring.",
          group: "Disposition"
        },
        {
          id: "admit-icu",
          label: "Transfer directly to ICU",
          tag: "neutral",
          points: 0,
          rationale: "Acceptable but not mandatory if the patient is improving on NIV.",
          group: "Disposition"
        },
        {
          id: "discharge-home",
          label: "Discharge home with oral antibiotics",
          tag: "harmful",
          points: -3,
          rationale: "Sending home a patient requiring NIV for ventilation is unsafe and exam-fatal.",
          group: "Harm",
          fatal: true
        }
      ],
      next: null
    }
  }
};

const totals = Object.values(caseData.steps).reduce((acc, step) => {
  acc.total += 1;
  if (step.type === "IG") acc.ig += 1;
  else acc.dm += 1;
  return acc;
}, { total: 0, ig: 0, dm: 0 });

const state = {
  active: false,
  currentStepId: null,
  currentStep: null,
  selected: new Set(),
  score: 0,
  history: [],
  flags: {},
  completed: { IG: 0, DM: 0 },
  terminated: false,
  nextStepId: null
};

function resetState() {
  state.active = false;
  state.currentStepId = null;
  state.currentStep = null;
  state.selected = new Set();
  state.score = 0;
  state.history = [];
  state.flags = {};
  state.completed = { IG: 0, DM: 0 };
  state.terminated = false;
  state.nextStepId = null;
}

function randomRange(range, decimals = 0) {
  const [min, max] = range;
  const value = Math.random() * (max - min) + min;
  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
}

function buildVitals() {
  return vitalTemplates.map(template => {
    if (template.pair) {
      const systolic = randomRange(template.pair[0]);
      const diastolic = randomRange(template.pair[1]);
      return {
        label: template.key,
        value: `${systolic}/${diastolic} ${template.unit}`,
        trend: template.trend || null
      };
    }
    const decimals = template.decimals || 0;
    const val = randomRange(template.range, decimals);
    return {
      label: template.key,
      value: `${val}${template.unit ? " " + template.unit : ""}`,
      trend: template.trend || null
    };
  });
}

function renderMockVitals(vitals) {
  const container = document.getElementById("mock-vitals");
  if (!container) return;
  container.innerHTML = "";
  vitals.slice(0, 3).forEach(vital => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = `${vital.label} ${vital.value}`;
    if (vital.trend === "critical") chip.classList.add("chip--pink");
    container.appendChild(chip);
  });
}

function renderPalette() {
  const paletteGrid = document.getElementById("palette-grid");
  if (!paletteGrid) return;
  paletteGrid.innerHTML = "";
  sitePalette.forEach(color => {
    const card = document.createElement("div");
    card.className = "palette__card";
    const chip = document.createElement("div");
    chip.className = "palette__chip";
    chip.style.background = color.hex;
    const body = document.createElement("div");
    body.className = "palette__body";
    body.innerHTML = `<strong>${color.name}</strong><br/><span>${color.hex}</span>`;
    card.appendChild(chip);
    card.appendChild(body);
    paletteGrid.appendChild(card);
  });
}

function renderFeatures() {
  const grid = document.getElementById("feature-grid");
  if (!grid) return;
  grid.innerHTML = "";
  featureList.forEach(item => {
    const card = document.createElement("div");
    card.className = "feature-card";
    const icon = document.createElement("div");
    icon.className = "feature-card__icon";
    icon.textContent = item.icon;
    const body = document.createElement("div");
    body.className = "feature-card__body";
    const h3 = document.createElement("h3");
    h3.textContent = item.title;
    const p = document.createElement("p");
    p.textContent = item.desc;
    body.appendChild(h3);
    body.appendChild(p);
    card.appendChild(icon);
    card.appendChild(body);
    grid.appendChild(card);
  });
}


function updateFlagNotes() {
  const container = document.getElementById("sim-flags");
  if (!container) return;
  container.innerHTML = "";
  const notes = [];
  if (state.flags.nivReady) notes.push("NIV circuit ready");
  if (state.flags.airwayReady) notes.push("Airway cart prepped");
  if (state.flags.abg) notes.push("ABG ordered");
  if (state.flags.capno) notes.push("Capnography running");
  if (state.flags.startedBiPap) notes.push("BiPAP active");
  if (state.flags.intubated) notes.push("Intubation path flagged");
  if (state.flags.abx) notes.push("Antibiotics started");

  if (!notes.length) {
    const placeholder = document.createElement("p");
    placeholder.textContent = "Key actions will appear here.";
    container.appendChild(placeholder);
    return;
  }

  notes.forEach(note => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = note;
    container.appendChild(chip);
  });
}

function resolveStep(stepId) {
  const base = caseData.steps[stepId];
  if (!base) return null;
  const resolved = { ...base };
  resolved.prompt = typeof base.prompt === "function" ? base.prompt(state) : base.prompt;
  resolved.allowMultiple = typeof base.allowMultiple === "function" ? base.allowMultiple(state) : base.allowMultiple;
  resolved.options = typeof base.options === "function" ? base.options(state).map(opt => ({ ...opt })) : base.options.map(opt => ({ ...opt }));
  return resolved;
}

function updateScoreboard() {
  const totalEl = document.getElementById("score-total");
  const igEl = document.getElementById("score-ig");
  const dmEl = document.getElementById("score-dm");
  const statusEl = document.getElementById("score-status");

  if (!totalEl || !igEl || !dmEl || !statusEl) return;

  totalEl.textContent = state.score;
  igEl.textContent = `${state.completed.IG}/${totals.ig}`;
  dmEl.textContent = `${state.completed.DM}/${totals.dm}`;

  if (!state.active) {
    statusEl.textContent = "Awaiting start";
  } else if (state.terminated) {
    statusEl.textContent = "Case terminated";
  } else if (!state.nextStepId && state.currentStepId === null) {
    statusEl.textContent = "Case complete";
  } else {
    statusEl.textContent = "In progress";
  }
}

function renderVitalsSidebar(vitals) {
  const vitalsContainer = document.getElementById("sim-vitals");
  if (!vitalsContainer) return;
  vitalsContainer.innerHTML = "";
  vitals.forEach(vital => {
    const item = document.createElement("div");
    item.className = "vital";
    if (vital.trend) item.dataset.trend = vital.trend;
    const label = document.createElement("span");
    label.textContent = vital.label;
    const value = document.createElement("span");
    value.textContent = vital.value;
    item.appendChild(label);
    item.appendChild(value);
    vitalsContainer.appendChild(item);
  });
}

function setPhaseLabel(text) {
  const phase = document.getElementById("sim-phase");
  if (!phase) return;
  phase.textContent = text;
}

function setProgress() {
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  if (!progressBar || !progressText) return;
  const completed = state.history.length;
  const total = totals.total;
  const percent = Math.round((completed / total) * 100);
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `Task ${Math.min(completed + 1, total)} of ${total}`;
}

function clearOptions() {
  state.selected.clear();
  const grid = document.getElementById("option-grid");
  if (grid) {
    grid.querySelectorAll(".option-cloud").forEach(card => {
      card.classList.remove("selected");
      card.removeAttribute("data-status");
      card.removeAttribute("data-status-label");
      card.disabled = false;
      card.setAttribute("aria-pressed", "false");
    });
  }
  document.getElementById("submit-step").disabled = true;
}

let audioCtx = null;

function ensureAudioContext() {
  if (typeof window === "undefined") return null;
  if (!("AudioContext" in window || "webkitAudioContext" in window)) return null;
  if (!audioCtx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    try {
      audioCtx = new Ctor();
    } catch (err) {
      audioCtx = null;
    }
  }
  return audioCtx;
}

function playFeedbackSound(type) {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const isSuccess = type === "success";
  osc.type = isSuccess ? "sine" : "triangle";
  const baseFreq = isSuccess ? 640 : 220;
  osc.frequency.setValueAtTime(baseFreq, now);
  if (isSuccess) {
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.15, now + 0.18);
  } else {
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.7, now + 0.18);
  }
  gain.gain.setValueAtTime(0.0001, now);
  const peak = isSuccess ? 0.08 : 0.045;
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
  const stopAt = now + (isSuccess ? 0.45 : 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(stopAt);
}

function updateHeroStatus() {
  const phase = document.getElementById("hero-phase");
  const score = document.getElementById("hero-score");
  const branch = document.getElementById("hero-branch");
  const message = heroState.lastMessage || "Tap indicated orders to earn credit.";
  if (phase) phase.textContent = message;
  if (score) {
    score.textContent = `Score: ${heroState.score > 0 ? "+" : ""}${heroState.score} pts`;
  }
  if (branch) {
    branch.textContent = `Clouds cleared ${heroState.cleared}/${heroTotals.total} • Goal: ${heroTotals.beneficial} credits`;
  }
}

function handleHeroSelection(option, button) {
  if (button.disabled) return;
  button.disabled = true;
  button.setAttribute("aria-pressed", "true");
  heroState.cleared += 1;
  if (option.tag === "beneficial") {
    heroState.score += 1;
    heroState.lastMessage = `Credit: ${option.label}`;
    button.dataset.state = "correct";
    playFeedbackSound("success");
  } else {
    heroState.score -= 1;
    heroState.lastMessage = `Penalty: ${option.label}`;
    button.dataset.state = "wrong";
    playFeedbackSound("harm");
  }
  updateHeroStatus();
  if (heroState.cleared >= heroTotals.total) {
    heroState.lastMessage = "All clouds reviewed! Resetting...";
    updateHeroStatus();
    if (heroResetTimer) clearTimeout(heroResetTimer);
    heroResetTimer = setTimeout(() => initHeroGame(), 2400);
  }
}

function initHeroGame() {
  if (heroResetTimer) {
    clearTimeout(heroResetTimer);
    heroResetTimer = null;
  }
  heroState.score = 0;
  heroState.cleared = 0;
  heroState.lastMessage = "Tap indicated orders to earn credit.";
  const container = document.getElementById("hero-clouds");
  if (!container) {
    updateHeroStatus();
    return;
  }
  container.innerHTML = "";
  const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const order = heroCloudOptions.slice().sort(() => Math.random() - 0.5);
  order.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cloud";
    button.dataset.tag = option.tag;
    button.dataset.optionId = option.id;
    button.textContent = option.label;
    button.disabled = false;
    button.removeAttribute("data-state");
    button.setAttribute("aria-pressed", "false");
    const delay = (Math.random() * 1.35).toFixed(2);
    const duration = (6 + Math.random() * 2.4).toFixed(2);
    const distance = (10 + Math.random() * 10).toFixed(0);
    button.style.setProperty("--delay", `${delay}s`);
    button.style.setProperty("--duration", `${duration}s`);
    button.style.setProperty("--float-distance", `${distance}px`);
    if (prefersReducedMotion) {
      button.style.animation = "none";
    }
    button.addEventListener("click", () => handleHeroSelection(option, button));
    container.appendChild(button);
  });
  updateHeroStatus();
}

function toggleOption(card) {
  if (!state.active || !state.currentStep) return;
  if (card.disabled) return;
  const optionId = card.dataset.optionId;
  if (!state.currentStep.allowMultiple) {
    document.querySelectorAll(".option-cloud.selected").forEach(el => {
      if (el === card) return;
      el.classList.remove("selected");
      el.setAttribute("aria-pressed", "false");
    });
    state.selected.clear();
    state.selected.add(optionId);
    card.classList.add("selected");
    card.setAttribute("aria-pressed", "true");
  } else {
    if (state.selected.has(optionId)) {
      state.selected.delete(optionId);
      card.classList.remove("selected");
      card.setAttribute("aria-pressed", "false");
    } else {
      state.selected.add(optionId);
      card.classList.add("selected");
      card.setAttribute("aria-pressed", "true");
    }
  }
  if (state.selected.has(optionId)) {
    const option = state.currentStep.options.find(o => o.id === optionId);
    if (option) {
      if (option.tag === "harmful") {
        playFeedbackSound("harm");
      } else if (option.tag === "beneficial") {
        playFeedbackSound("success");
      }
    }
  }
  document.getElementById("submit-step").disabled = state.selected.size === 0;
}

function renderStep(stepId) {
  updateFlagNotes();
  const resolved = resolveStep(stepId);
  if (!resolved) return;
  state.currentStepId = stepId;
  state.currentStep = resolved;
  state.selected = new Set();
  const submitButton = document.getElementById("submit-step");
  if (submitButton) submitButton.disabled = true;
  const clearButton = document.getElementById("clear-selection");
  if (clearButton) clearButton.disabled = false;
  const card = document.getElementById("sim-card");
  const results = document.getElementById("sim-results");
  if (card) card.hidden = false;
  if (results) results.hidden = true;

  const taskLabel = document.getElementById("sim-task");
  if (taskLabel) taskLabel.textContent = resolved.type === "IG" ? "Information Gathering" : "Decision Making";
  const questionEl = document.getElementById("sim-question");
  if (questionEl) questionEl.textContent = resolved.question;
  const promptEl = document.getElementById("sim-prompt");
  if (promptEl) promptEl.textContent = resolved.prompt;

  setPhaseLabel(resolved.type === "IG" ? "Phase: Assessment" : "Phase: Implementation");
  setProgress();

  const grid = document.getElementById("option-grid");
  if (!grid) return;
  grid.innerHTML = "";
  resolved.options.forEach(option => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "option-cloud";
    card.dataset.optionId = option.id;
    card.dataset.tag = option.tag || "neutral";
    card.disabled = false;
    card.setAttribute("aria-pressed", "false");
    const hint = document.createElement("span");
    hint.className = "option-cloud__tag";
    hint.textContent = option.group || (resolved.type === "IG" ? "IG" : "DM");
    const text = document.createElement("span");
    text.className = "option-cloud__text";
    text.textContent = option.label;
    card.appendChild(hint);
    card.appendChild(text);
    const delay = (Math.random() * 1.5).toFixed(2);
    const duration = (5.5 + Math.random() * 2.5).toFixed(2);
    const distance = (8 + Math.random() * 8).toFixed(0);
    card.style.setProperty("--float-delay", `${delay}s`);
    card.style.setProperty("--float-duration", `${duration}s`);
    card.style.setProperty("--float-distance", `${distance}px`);
    card.addEventListener("click", () => toggleOption(card));
    grid.appendChild(card);
  });

  updateAIContext(resolved);
}

function evaluateStep() {
  const detail = [];
  let delta = 0;
  let fatal = false;
  const optionElements = {};
  document.querySelectorAll(".option-cloud").forEach(card => {
    optionElements[card.dataset.optionId] = card;
  });

  state.currentStep.options.forEach(option => {
    const selected = state.selected.has(option.id);
    if (selected && typeof option.onSelect === "function") {
      option.onSelect(state);
    }
    let status = "neutral";
    let label = "Neutral";
    if (selected) {
      delta += option.points || 0;
      if (option.tag === "beneficial") {
        status = "credit";
        label = `Credit ${option.points >= 0 ? "+" + option.points : option.points}`;
      } else if (option.tag === "neutral") {
        status = "neutral";
        label = "Neutral";
      } else if (option.tag === "harmful") {
        status = "penalty";
        label = `Penalty ${option.points}`;
        if (option.fatal) fatal = true;
      }
    } else {
      if (option.tag === "beneficial") {
        status = "missed";
        label = "Missed credit";
      } else if (option.tag === "harmful") {
        status = "neutral";
        label = "Avoided harm";
      }
    }
    detail.push({
      ...option,
      selected,
      status,
      statusLabel: label
    });
    const card = optionElements[option.id];
    if (card) {
      card.dataset.status = status;
      card.dataset.statusLabel = label;
      card.disabled = true;
      card.setAttribute("aria-pressed", selected ? "true" : "false");
      if (selected) card.classList.add("selected");
    }
  });

  state.score += delta;
  state.completed[state.currentStep.type] += 1;
  state.history.push({
    stepId: state.currentStepId,
    title: state.currentStep.question,
    type: state.currentStep.type,
    detail,
    delta,
    fatal
  });
  updateFlagNotes();
  if (fatal) {
    state.terminated = true;
  }

  const stepDef = caseData.steps[state.currentStepId];
  let nextId = null;
  if (!fatal) {
    if (typeof stepDef.next === "function") {
      nextId = stepDef.next({
        selected: Array.from(state.selected),
        detail,
        delta
      }, state);
    } else {
      nextId = stepDef.next;
    }
  }

  state.nextStepId = nextId;
  if (fatal) {
    state.nextStepId = null;
  }

  return { detail, delta, fatal };
}

function showResults(result) {
  const submitButton = document.getElementById("submit-step");
  if (submitButton) submitButton.disabled = true;
  const clearButton = document.getElementById("clear-selection");
  if (clearButton) clearButton.disabled = true;

  const resultsBox = document.getElementById("sim-results");
  if (!resultsBox) return;
  resultsBox.innerHTML = "";

  const header = document.createElement("div");
  header.className = "result-header";
  const scoreSpan = document.createElement("strong");
  scoreSpan.textContent = `${result.delta >= 0 ? "+" : ""}${result.delta} pts`;
  const status = document.createElement("span");
  if (result.fatal) {
    status.textContent = "Harmful choice selected — case ends";
  } else if (!state.nextStepId) {
    status.textContent = "All tasks complete";
  } else {
    status.textContent = "Review rationale, then continue";
  }
  header.appendChild(scoreSpan);
  header.appendChild(status);
  resultsBox.appendChild(header);

  const body = document.createElement("div");
  body.className = "result-body";
  result.detail.forEach(item => {
    const rationale = document.createElement("div");
    rationale.className = "rationale";
    rationale.innerHTML = `<strong>${item.label}</strong><em>${item.statusLabel}</em><p>${item.rationale}</p>`;
    body.appendChild(rationale);
  });
  resultsBox.appendChild(body);

  const actionRow = document.createElement("div");
  actionRow.className = "sim__action-group";
  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn--primary";
  nextBtn.textContent = result.fatal || !state.nextStepId ? "View summary" : "Next task";
  nextBtn.addEventListener("click", () => {
    if (result.fatal || !state.nextStepId) {
      renderSummary();
    } else {
      const resEl = document.getElementById("sim-results");
      if (resEl) resEl.hidden = true;
      const clear = document.getElementById("clear-selection");
      if (clear) clear.disabled = false;
      renderStep(state.nextStepId);
    }
  });
  actionRow.appendChild(nextBtn);

  const reviewBtn = document.createElement("button");
  reviewBtn.className = "btn btn--outline";
  reviewBtn.textContent = "Reset case";
  reviewBtn.addEventListener("click", () => {
    startCase();
  });
  actionRow.appendChild(reviewBtn);

  resultsBox.appendChild(actionRow);
  resultsBox.hidden = false;
  updateScoreboard();
  setProgress();
}

function renderSummary() {
  state.currentStep = null;
  state.currentStepId = null;
  setPhaseLabel(state.terminated ? "Case terminated" : "Case complete");
  const card = document.getElementById("sim-card");
  if (card) card.hidden = true;
  const resultsBox = document.getElementById("sim-results");
  if (!resultsBox) return;
  resultsBox.hidden = false;
  resultsBox.innerHTML = "";

  const heading = document.createElement("h3");
  heading.textContent = state.terminated ? "Case terminated" : "Case complete";
  resultsBox.appendChild(heading);

  const summary = document.createElement("p");
  summary.textContent = state.terminated
    ? "A harmful action ended the case early. Review the rationales and retry for mastery."
    : "Great work! You navigated all IG and DM tasks. Keep practicing to lock in the scoring logic.";
  resultsBox.appendChild(summary);

  const scoreLine = document.createElement("p");
  scoreLine.innerHTML = `<strong>Total score:</strong> ${state.score}`;
  resultsBox.appendChild(scoreLine);

  const list = document.createElement("div");
  list.className = "result-body";
  state.history.forEach(entry => {
    const card = document.createElement("div");
    card.className = "rationale";
    card.innerHTML = `<strong>${entry.type === "IG" ? "IG" : "DM"} – ${entry.title}</strong><em>${entry.delta >= 0 ? "+" + entry.delta : entry.delta} pts</em>`;
    list.appendChild(card);
  });
  resultsBox.appendChild(list);

  const restart = document.createElement("button");
  restart.className = "btn btn--accent";
  restart.textContent = "Play again";
  restart.addEventListener("click", () => startCase());
  resultsBox.appendChild(restart);

  state.nextStepId = null;
  updateScoreboard();
}

function updateAIContext(step) {
  const context = document.getElementById("ai-panel-context");
  if (!context) return;
  if (!step) {
    context.textContent = "Clinical reasoning tips appear here.";
    return;
  }
  context.textContent = `${step.type === "IG" ? "IG" : "DM"} focus: ${step.question}`;
}

function openAI(step) {
  const panel = document.getElementById("ai-panel");
  const body = document.getElementById("ai-panel-body");
  if (!panel || !body) return;
  body.innerHTML = "";

  const activeStep = step || state.currentStep;
  if (activeStep) {
    const aiData = activeStep.ai || { headline: "Arcade tutor", body: ["Review clinical priorities and avoid harmful actions."] };
    const headline = document.createElement("div");
    headline.className = "ai-hint";
    const paragraphs = aiData.body.map(text => `<p>${text}</p>`).join("");
    headline.innerHTML = `<strong>${aiData.headline}</strong>${paragraphs}`;
    body.appendChild(headline);
    if (state.history.length) {
      const recap = document.createElement("div");
      recap.className = "ai-hint";
      recap.innerHTML = `<strong>Case recap</strong><p>Score: ${state.score} | IG ${state.completed.IG}/${totals.ig} | DM ${state.completed.DM}/${totals.dm}</p>`;
      body.appendChild(recap);
    }
  } else {
    const general = document.createElement("div");
    general.className = "ai-hint";
    general.innerHTML = "<strong>Arcade tutor</strong><p>Start a case to unlock contextual guidance.</p>";
    body.appendChild(general);
  }

  panel.setAttribute("aria-hidden", "false");
}

function closeAI() {
  const panel = document.getElementById("ai-panel");
  if (panel) {
    panel.setAttribute("aria-hidden", "true");
  }
}

function startCase() {
  resetState();
  updateFlagNotes();
  state.active = true;
  const vitals = buildVitals();
  renderVitalsSidebar(vitals);
  renderMockVitals(vitals);
  initHeroGame();
  setPhaseLabel("Phase: Assessment");
  const results = document.getElementById("sim-results");
  if (results) results.hidden = true;
  renderStep(caseData.entry);
  updateScoreboard();
  const simulationSection = document.getElementById("simulation");
  simulationSection.scrollIntoView({ behavior: "smooth" });
  if (window.location.hash !== "#simulation") {
    history.replaceState(null, "", "#simulation");
  }
}

let hasInitialized = false;

function initialize() {
  if (hasInitialized) return;
  hasInitialized = true;
  const vitals = buildVitals();
  renderMockVitals(vitals);
  initHeroGame();
  renderPalette();
  renderFeatures();
  const footerYear = document.getElementById("footer-year");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
  updateFlagNotes();
  updateScoreboard();
  const clearButton = document.getElementById("clear-selection");
  if (clearButton) {
    clearButton.disabled = true;
  }

  const startTriggers = ["cta-start", "nav-start"].map(id => document.getElementById(id)).filter(Boolean);
  startTriggers.forEach(trigger => {
    trigger.addEventListener("click", event => {
      event.preventDefault();
      startCase();
    });
  });
  const resetButton = document.getElementById("reset-case");
  if (resetButton) resetButton.addEventListener("click", startCase);
  if (clearButton) clearButton.addEventListener("click", clearOptions);

  const submitButton = document.getElementById("submit-step");
  if (submitButton) {
    submitButton.addEventListener("click", () => {
      if (!state.currentStep || state.selected.size === 0) return;
      const result = evaluateStep();
      showResults(result);
    });
  }

  const aiButtons = [
    "open-ai",
    "show-tutor",
    "mock-ai",
    "mock-ai-alt"
  ];
  aiButtons
    .map(id => document.getElementById(id))
    .filter(Boolean)
    .forEach(btn => btn.addEventListener("click", () => openAI()));

  const closeAi = document.getElementById("close-ai");
  if (closeAi) closeAi.addEventListener("click", closeAI);

  const aiPanel = document.getElementById("ai-panel");
  if (aiPanel) {
    aiPanel.addEventListener("click", event => {
      if (event.target.id === "ai-panel") {
        closeAI();
      }
    });
  }

  if (window.location.hash === "#simulation") {
    startCase();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
