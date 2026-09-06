import { ProjectCaseStudy } from '../../types/content';
import { filterProductionVerified } from '../provenance';

export const projectsData: ProjectCaseStudy[] = [
  {
    id: "turtle-chase",
    slug: "turtle-chase",
    title: "Closed-Loop Pursuit Controller in ROS 2",
    tagline: "ROS 2 proportional pursuit node with heading angle normalization and geometry message coordination.",
    category: "robotics",
    subcategories: ["ROS 2", "Kinematics", "Python", "Geometry Messages"],
    status: "completed",
    featured: true,
    startDate: "2024",
    role: "Developer",
    organization: "Open Source Project",
    
    coverBadge: "ROS 2 Kinematics",
    
    problem: "Target-following behavior in robotics simulation requires continuous heading calculation, coordinate transformations, and message synchronization between nodes.",
    objective: "Implement a ROS 2 package where a follower node tracks and intercepts a target coordinate using Euclidean distance calculation and proportional steering control.",
    approach: "Built a publisher-subscriber structure using ROS 2 geometry_msgs. The follower node subscribes to target pose topics, computes heading angle differences, and publishes linear and angular velocity commands.",
    
    architectureDescription: "Two asynchronous ROS 2 nodes communicating over topic interfaces (/turtle1/pose, /turtle2/cmd_vel).",
    
    subsystems: [
      {
        name: "Pose Subscriber",
        category: "software",
        specs: ["Topic: /turtle1/pose", "Payload: (x, y, theta, linear_vel, angular_vel)"],
        description: "Subscribes to target coordinates in turtlesim coordinate frame."
      },
      {
        name: "Proportional Steering Controller",
        category: "algorithm",
        specs: ["Heading Correction: atan2(dy, dx) - theta", "Normalized Range: (-pi, pi]"],
        description: "Calculates angular steering corrections based on angular difference and scales linear speed with distance."
      },
      {
        name: "Node Initialization Manager",
        category: "firmware",
        specs: ["Startup Logic: Service wait loop"],
        description: "Handles node lifecycle during startup and service availability."
      }
    ],
    
    hardwareStack: ["Simulation Environment"],
    softwareStack: ["ROS 2 Humble / Iron", "Python 3", "rclpy", "geometry_msgs", "turtlesim"],
    algorithms: ["Proportional Steering Control", "Euclidean Distance Calculation", "Angle Normalization (-pi to +pi)"],
    
    challenges: [
      {
        challenge: "Angular Discontinuities at Boundary Crossings",
        rootCause: "Angle subtractions without normalization cause jump discontinuities across the +/- pi boundary.",
        solution: "Implemented angle normalization into (-pi, pi] space before applying proportional gain.",
        outcome: "Avoided rotational oscillations during target tracking."
      },
      {
        challenge: "Asynchronous Node Startup Sequencing",
        rootCause: "Follower node attempted to subscribe to target pose before turtlesim service was initialized.",
        solution: "Added service client check on client.wait_for_service().",
        outcome: "Ensured clean node initialization sequence."
      }
    ],
    
    results: {
      metrics: [],
      summary: [
        "Constructed an open-source ROS 2 package demonstrating publisher-subscriber node orchestration and basic kinematic steering.",
        "Tested trajectory tracking across boundary conditions in simulation."
      ]
    },
    
    lessonsLearned: [
      "Decoupled ROS 2 node architecture simplifies testing of controller logic.",
      "Angle normalization is necessary in angular control loops to prevent boundary jumps."
    ],
    futureWork: [
      "Experiment with 3D coordinate tracking in simulation.",
      "Test trajectory prediction filters."
    ],
    
    githubUrl: "https://github.com/tanishk756/turtle_chase",
    
    source: "GitHub Repository Tanishk756/turtle_chase",
    sourceUrl: "https://github.com/tanishk756/turtle_chase",
    verificationStatus: "GITHUB_VERIFIED",
    lastVerified: "2026-09-05",
    notes: "Verified code repository and implementation."
  },
  {
    id: "autonomous-path-planning",
    slug: "autonomous-path-planning",
    title: "2D Grid Path Planning Algorithms (A* & Dijkstra)",
    tagline: "Python implementations of A-Star heuristic search and Dijkstra uniform-cost search on discrete 2D occupancy grids.",
    category: "autonomy",
    subcategories: ["Algorithms", "Path Planning", "A*", "Dijkstra", "Python"],
    status: "completed",
    featured: true,
    startDate: "2024",
    role: "Developer",
    organization: "Open Source Project",
    
    coverBadge: "Graph Search",
    
    problem: "Navigating 2D grid environments requires finding collision-free paths between start and goal coordinates.",
    objective: "Implement and compare graph-search algorithms (A* with distance heuristics and Dijkstra uniform-cost search) on 2D grid costmaps.",
    approach: "Represented 2D grid occupancy with obstacle cells and used min-heap priority queues to explore grid coordinates from start to goal.",
    
    architectureDescription: "2D grid array with priority queue frontier traversal.",
    
    subsystems: [
      {
        name: "Grid Occupancy Representation",
        category: "software",
        specs: ["2D Grid Matrix", "Obstacle Masking"],
        description: "Stores grid cell coordinates and obstacle occupancy states."
      },
      {
        name: "A* Search Module",
        category: "algorithm",
        specs: ["Heuristics: Euclidean / Manhattan Distance", "Queue: Priority Queue"],
        description: "Explores grid coordinates using combined path cost and heuristic estimates."
      },
      {
        name: "Dijkstra Search Module",
        category: "algorithm",
        specs: ["Cost Function: Uniform Step Cost", "Queue: Priority Queue"],
        description: "Explores grid coordinates based strictly on cumulative path cost."
      }
    ],
    
    hardwareStack: ["Compute Host"],
    softwareStack: ["Python 3", "NumPy", "Matplotlib"],
    algorithms: ["A* Pathfinding", "Dijkstra Algorithm", "Priority Queue Search"],
    
    challenges: [
      {
        challenge: "Handling Diagonal Transitions around Obstacles",
        rootCause: "4-connected grid representations produce staircase paths.",
        solution: "Added 8-connected grid movement with diagonal cost weighting.",
        outcome: "Produced smoother path trajectories."
      }
    ],
    
    results: {
      metrics: [],
      summary: [
        "Implemented A* and Dijkstra search algorithms in Python.",
        "Visualized path outputs across test grid configurations."
      ]
    },
    
    lessonsLearned: [
      "Admissible distance heuristics ensure optimal shortest path solutions in A*.",
      "Priority queues are essential for efficient node exploration."
    ],
    futureWork: [
      "Test dynamic replanning algorithms.",
      "Explore path smoothing techniques."
    ],
    
    githubUrl: "https://github.com/tanishk756",
    
    source: "GitHub Repositories under Tanishk756",
    sourceUrl: "https://github.com/tanishk756",
    verificationStatus: "GITHUB_VERIFIED",
    lastVerified: "2026-09-05",
    notes: "Verified path planning implementations in Python."
  },
  {
    id: "employee-attrition-ml",
    slug: "employee-attrition-ml",
    title: "Tabular Classification Pipeline with Scikit-Learn",
    tagline: "Comparative evaluation of Decision Tree and Support Vector Classifier (SVC) models on tabular dataset.",
    category: "ai-ml",
    subcategories: ["Machine Learning", "Classification", "Scikit-Learn", "Python", "Data Science"],
    status: "completed",
    featured: true,
    startDate: "2024",
    role: "Developer",
    organization: "Open Source Project",
    
    coverBadge: "ML Classification",
    
    problem: "Analyzing tabular demographic and employment records to train binary classification models.",
    objective: "Construct a machine learning pipeline that preprocesses raw tabular data and trains Decision Tree and SVM models.",
    approach: "Applied one-hot encoding for categorical features and StandardScaler normalization for numerical features, followed by model training with Scikit-Learn.",
    
    architectureDescription: "Data Loading -> Preprocessing & Scaling -> Model Training -> Evaluation.",
    
    subsystems: [
      {
        name: "Preprocessing Subsystem",
        category: "software",
        specs: ["One-Hot Encoding", "StandardScaler Normalization"],
        description: "Normalizes numerical fields and encodes categorical variables."
      },
      {
        name: "Decision Tree Model",
        category: "algorithm",
        specs: ["Model: DecisionTreeClassifier", "Parameter Tuning: Tree Depth"],
        description: "Trains tree-based decision rules on preprocessed features."
      },
      {
        name: "Support Vector Classifier",
        category: "algorithm",
        specs: ["Model: SVC", "Kernels: Linear / RBF"],
        description: "Trains hyperplane separation model on normalized features."
      }
    ],
    
    hardwareStack: ["Compute Host"],
    softwareStack: ["Python 3", "Scikit-Learn", "Pandas", "NumPy", "Matplotlib", "Seaborn"],
    algorithms: ["Decision Tree Classifier", "Support Vector Machine (SVM)", "Standard Scaling"],
    
    challenges: [
      {
        challenge: "Handling Imbalanced Target Classes",
        rootCause: "Skewed class distribution biased default model accuracy toward majority class.",
        solution: "Adjusted class weights and evaluated Precision and Recall.",
        outcome: "Improved classification balance for minority class."
      }
    ],
    
    results: {
      metrics: [],
      summary: [
        "Built a reproducible Python data preprocessing and model evaluation script.",
        "Demonstrated tabular data preprocessing techniques."
      ]
    },
    
    lessonsLearned: [
      "Data preprocessing and feature scaling significantly impact SVM model convergence.",
      "Evaluation metrics must match class distribution characteristics."
    ],
    futureWork: [
      "Experiment with gradient boosting models.",
      "Explore feature selection techniques."
    ],
    
    githubUrl: "https://github.com/tanishk756/Employee-Attrition-Prediction",
    
    source: "GitHub Repository Tanishk756/Employee-Attrition-Prediction",
    sourceUrl: "https://github.com/tanishk756/Employee-Attrition-Prediction",
    verificationStatus: "GITHUB_VERIFIED",
    lastVerified: "2026-09-05",
    notes: "Verified machine learning scripts and pipeline code."
  }
];

export function getProductionProjects(): ProjectCaseStudy[] {
  return filterProductionVerified(projectsData);
}

export const allProjectsData = projectsData;

export function getProjectBySlug(slug: string): ProjectCaseStudy | undefined {
  return projectsData.find((p) => p.slug === slug);
}

