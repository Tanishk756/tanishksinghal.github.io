import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fpjaijgbcdalrdgwbece.supabase.co';
const ADMIN_EMAIL = 'tanishksinghal6285@gmail.com';

function createAdminJwt(email: string, expiresInSec = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'test-admin-id',
    email,
    aud: 'authenticated',
    role: 'authenticated',
    exp: now + expiresInSec,
    iat: now,
  };
  const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64(header)}.${b64(payload)}.browser_test_sig`;
}

const ALL_27_CANONICAL_DRAFT_SKILLS = [
  // 1. Robotics & Control (7)
  { name: 'ROS 2 (Robot Operating System)', category: 'Robotics & Control', description: 'ROS 2 node architecture and spatial navigation', subdiscipline: 'ROS 2 Ecosystem', proficiency_level: 'Advanced', display_order: 0 },
  { name: 'Autonomous Kinematics & Control', category: 'Robotics & Control', description: 'Proportional steering and closed-loop feedback control', subdiscipline: 'Kinematics & Control', proficiency_level: 'Advanced', display_order: 1 },
  { name: 'Path Planning (A*, Dijkstra, BFS)', category: 'Robotics & Control', description: 'Graph traversal and heuristic spatial search', subdiscipline: 'Spatial Navigation', proficiency_level: 'Advanced', display_order: 2 },
  { name: 'Obstacle Avoidance & Perception', category: 'Robotics & Control', description: 'Proximity perception and avoidance maneuvering', subdiscipline: 'Perception & Safety', proficiency_level: 'Advanced', display_order: 3 },
  { name: 'State Machine Coordination', category: 'Robotics & Control', description: 'Deterministic state machines for mission sequencing', subdiscipline: 'Mission Sequencing', proficiency_level: 'Advanced', display_order: 4 },
  { name: 'Coordinate Transformations (TF2)', category: 'Robotics & Control', description: 'Coordinate frames and dynamic transformation trees', subdiscipline: 'Spatial Frames', proficiency_level: 'Advanced', display_order: 5 },
  { name: 'Closed-Loop Feedback Systems', category: 'Robotics & Control', description: 'Sensor feedback regulation and stability control', subdiscipline: 'Feedback Control', proficiency_level: 'Advanced', display_order: 6 },

  // 2. AI & ML (6)
  { name: 'Machine Learning Pipelines', category: 'AI & ML', description: 'End-to-end model training, validation, and evaluation pipelines', subdiscipline: 'Pipelines & Workflow', proficiency_level: 'Advanced', display_order: 7 },
  { name: 'Scikit-Learn & NumPy', category: 'AI & ML', description: 'Scientific computing and vectorized mathematical operations', subdiscipline: 'Numerical Modeling', proficiency_level: 'Advanced', display_order: 8 },
  { name: 'Classification & Regression', category: 'AI & ML', description: 'Supervised predictive modeling and loss optimization', subdiscipline: 'Statistical Learning', proficiency_level: 'Advanced', display_order: 9 },
  { name: 'Decision Trees & SVMs', category: 'AI & ML', description: 'Non-linear kernel boundaries and decision boundary analysis', subdiscipline: 'Algorithmic Classifiers', proficiency_level: 'Advanced', display_order: 10 },
  { name: 'Computer Vision & Image Processing', category: 'AI & ML', description: 'Spatial feature extraction and visual filtering', subdiscipline: 'Vision & Optics', proficiency_level: 'Advanced', display_order: 11 },
  { name: 'Data Preprocessing & EDA', category: 'AI & ML', description: 'Exploratory feature distribution and outliers cleansing', subdiscipline: 'Data Engineering', proficiency_level: 'Advanced', display_order: 12 },

  // 3. Firmware & Embedded (5)
  { name: 'Embedded C / C++', category: 'Firmware & Embedded', description: 'Real-time firmware programming and bare-metal registers', subdiscipline: 'Systems Programming', proficiency_level: 'Advanced', display_order: 13 },
  { name: 'Python Systems Programming', category: 'Firmware & Embedded', description: 'POSIX sockets, IPC, and peripheral bus automation', subdiscipline: 'Hardware Interfacing', proficiency_level: 'Advanced', display_order: 14 },
  { name: 'Microcontroller Architectures', category: 'Firmware & Embedded', description: 'ARM Cortex-M and AVR peripheral interrupt handling', subdiscipline: 'Embedded Compute', proficiency_level: 'Advanced', display_order: 15 },
  { name: 'Serial Protocols (UART / I2C / SPI)', category: 'Firmware & Embedded', description: 'Deterministic low-latency hardware bus communication', subdiscipline: 'Serial Busses', proficiency_level: 'Advanced', display_order: 16 },
  { name: 'Real-Time Sensor Interfacing', category: 'Firmware & Embedded', description: 'Interrupt-driven telemetry streaming and ADC sampling', subdiscipline: 'Sensor Integration', proficiency_level: 'Advanced', display_order: 17 },

  // 4. Hardware & Circuits (4)
  { name: 'Circuit Prototyping & Debugging', category: 'Hardware & Circuits', description: 'Oscilloscope telemetry analysis and power plane debugging', subdiscipline: 'Circuit Diagnostics', proficiency_level: 'Advanced', display_order: 18 },
  { name: 'PCB Design Fundamentals', category: 'Hardware & Circuits', description: 'Schematic layout, trace impedance, and routing topology', subdiscipline: 'EDA & PCB Layout', proficiency_level: 'Advanced', display_order: 19 },
  { name: 'Sensor & Actuator Calibration', category: 'Hardware & Circuits', description: 'PWM drive linearity and ADC scale calibration', subdiscipline: 'Actuation & Sensors', proficiency_level: 'Advanced', display_order: 20 },
  { name: 'Power Distribution Basics', category: 'Hardware & Circuits', description: 'Buck/boost regulation and transient protection', subdiscipline: 'Power Electronics', proficiency_level: 'Advanced', display_order: 21 },

  // 5. Software & Tools (5)
  { name: 'Linux / Ubuntu Environment', category: 'Software & Tools', description: 'POSIX CLI, systemd daemon management, and kernel modules', subdiscipline: 'OS & Environment', proficiency_level: 'Advanced', display_order: 22 },
  { name: 'Git & Collaborative CI/CD', category: 'Software & Tools', description: 'Semantic versioning and automated testing workflows', subdiscipline: 'Version Control & CI', proficiency_level: 'Advanced', display_order: 23 },
  { name: 'Data Visualization (Matplotlib/Seaborn)', category: 'Software & Tools', description: 'Statistical chart plotting and experimental data analysis', subdiscipline: 'Analytics & Plotting', proficiency_level: 'Advanced', display_order: 24 },
  { name: 'Algorithm Complexity Optimization', category: 'Software & Tools', description: 'Asymptotic analysis and data structure memory tuning', subdiscipline: 'Algorithm Optimization', proficiency_level: 'Advanced', display_order: 25 },
  { name: 'Technical Documentation', category: 'Software & Tools', description: 'Architecture specifications and research reproducibility logs', subdiscipline: 'Technical Writing', proficiency_level: 'Advanced', display_order: 26 },
];

async function seedMissingSkills() {
  const adminToken = createAdminJwt(ADMIN_EMAIL);
  const getRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const json = await getRes.json();
  const existingList: any[] = json.data || [];
  const existingNames = new Set(existingList.map(s => s.name));
  console.log(`Current skills count: ${existingList.length}`);

  for (const skill of ALL_27_CANONICAL_DRAFT_SKILLS) {
    if (!existingNames.has(skill.name)) {
      console.log(`Inserting missing draft skill: ${skill.name} (${skill.category})`);
      const createRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...skill,
          publicationStatus: 'draft',
          verificationStatus: 'USER_PROVIDED',
        }),
      });
      const createJson = await createRes.json();
      console.log('  -> Result:', createJson.success ? 'OK' : createJson);
    } else {
      // Update subdiscipline if missing
      const existing = existingList.find(s => s.name === skill.name);
      if (existing && !existing.subdiscipline) {
        console.log(`Updating subdiscipline for: ${skill.name} -> ${skill.subdiscipline}`);
        await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill&id=${existing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            ...existing,
            subdiscipline: skill.subdiscipline,
          }),
        });
      }
    }
  }

  const finalRes = await fetch(`${SUPABASE_URL}/functions/v1/admin-content?type=skill`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const finalJson = await finalRes.json();
  console.log(`\nFinal verified skills count in Supabase: ${finalJson.data?.length}`);
}

seedMissingSkills();
