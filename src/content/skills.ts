import { SkillItem } from '../types/content';

export const skillsData: SkillItem[] = [
  // Robotics & Control
  { name: "ROS 2 (Robot Operating System)", category: "Robotics & Control", level: "proficient", highlight: true },
  { name: "Autonomous Kinematics & Control", category: "Robotics & Control", level: "proficient", highlight: true },
  { name: "Path Planning (A*, Dijkstra, BFS)", category: "Robotics & Control", level: "proficient", highlight: true },
  { name: "Obstacle Avoidance & Perception", category: "Robotics & Control", level: "proficient", highlight: true },
  { name: "State Machine Coordination", category: "Robotics & Control", level: "proficient" },
  { name: "Coordinate Transformations (TF2)", category: "Robotics & Control", level: "working" },
  { name: "Closed-Loop Feedback Systems", category: "Robotics & Control", level: "proficient" },

  // AI & ML
  { name: "Machine Learning Pipelines", category: "AI & ML", level: "proficient", highlight: true },
  { name: "Scikit-Learn & NumPy", category: "AI & ML", level: "proficient", highlight: true },
  { name: "Classification & Regression", category: "AI & ML", level: "proficient" },
  { name: "Decision Trees & SVMs", category: "AI & ML", level: "proficient" },
  { name: "Computer Vision & Image Processing", category: "AI & ML", level: "working", highlight: true },
  { name: "Data Preprocessing & EDA", category: "AI & ML", level: "proficient" },

  // Firmware & Embedded
  { name: "Embedded C / C++", category: "Firmware & Embedded", level: "proficient", highlight: true },
  { name: "Python Systems Programming", category: "Firmware & Embedded", level: "proficient", highlight: true },
  { name: "Microcontroller Architectures", category: "Firmware & Embedded", level: "working" },
  { name: "Serial Protocols (UART / I2C / SPI)", category: "Firmware & Embedded", level: "working" },
  { name: "Real-Time Sensor Interfacing", category: "Firmware & Embedded", level: "working" },

  // Hardware & Circuits
  { name: "Circuit Prototyping & Debugging", category: "Hardware & Circuits", level: "working" },
  { name: "PCB Design Fundamentals", category: "Hardware & Circuits", level: "working" },
  { name: "Sensor & Actuator Calibration", category: "Hardware & Circuits", level: "working" },
  { name: "Power Distribution Basics", category: "Hardware & Circuits", level: "working" },

  // Software & Tools
  { name: "Linux / Ubuntu Environment", category: "Software & Tools", level: "proficient", highlight: true },
  { name: "Git & Collaborative CI/CD", category: "Software & Tools", level: "proficient", highlight: true },
  { name: "Data Visualization (Matplotlib/Seaborn)", category: "Software & Tools", level: "proficient" },
  { name: "Algorithm Complexity Optimization", category: "Software & Tools", level: "proficient" },
  { name: "Technical Documentation", category: "Software & Tools", level: "proficient" }
];export function getProductionSkills(): SkillItem[] {
  return skillsData;
}

export function getAllCandidateSkills(): SkillItem[] {
  return skillsData;
}
