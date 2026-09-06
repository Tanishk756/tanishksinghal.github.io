-- SEEDING CANONICAL DRAFT RECORDS FROM STATIC ARCHIVE

BEGIN;

INSERT INTO public.profiles (full_name, display_name, headline, short_bio, long_bio, location, email, profile_image_url, resume_url, github_url, linkedin_url, google_scholar_url, researchgate_url, publication_status, verification_status, last_verified) VALUES ('Tanishk Singhal', 'Tanishk Singhal', 'Robotics Researcher & Systems Engineer', 'Hands-on engineer focused on the intersection of autonomous mobile robotics, spatial navigation algorithms, embedded compute, and applied AI systems.', 'I am an engineer and researcher dedicated to building robust physical and cyber-physical systems. My work spans robotics software architecture using ROS 2, autonomous pursuit and trajectory planning, obstacle perception, and applied machine learning.

I focus on practical engineering depth: understanding how low-level kinematics, sensor feedback, real-time control loops, and high-level decision pipelines integrate into reliable, cohesive systems.', 'India', 'Tanishksinghal6285@gmail.com', 'https://avatars.githubusercontent.com/u/132895444?v=4', '/resume', 'https://github.com/tanishk756', 'https://www.linkedin.com/in/tanishk-singhal-/', 'https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en', 'https://www.researchgate.net/profile/Tanishk-Singhal', 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.218Z') ON CONFLICT DO NOTHING;

INSERT INTO public.education (institution, degree, field, start_date, end_date, is_current, grade, location, description, display_order, publication_status, verification_status, last_verified) VALUES ('Lovely Professional University', 'B.Tech, Robotics and Automation', 'B.Tech, Robotics and Automation', 'Aug 2022', 'May 2026', false, NULL, NULL, NULL, 0, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.219Z') ON CONFLICT DO NOTHING;

INSERT INTO public.education (institution, degree, field, start_date, end_date, is_current, grade, location, description, display_order, publication_status, verification_status, last_verified) VALUES ('Board of Secondary Education Rajasthan', 'Senior Secondary Education, Student', 'Senior Secondary Education, Student', '2021', '2022', false, '95.80%', NULL, NULL, 1, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.219Z') ON CONFLICT DO NOTHING;

INSERT INTO public.education (institution, degree, field, start_date, end_date, is_current, grade, location, description, display_order, publication_status, verification_status, last_verified) VALUES ('Board of Secondary Education Rajasthan', 'Secondary Education, Student', 'Secondary Education, Student', '2019', '2020', false, '94.66%', NULL, NULL, 2, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.219Z') ON CONFLICT DO NOTHING;

INSERT INTO public.experience (organization, role_title, category, employment_type, start_date, end_date, is_current, location, work_mode, description, responsibilities, technologies, evidence_url, display_order, publication_status, verification_status, last_verified) VALUES ('DronIQ Labs Pvt Ltd', 'Robotics and AI Engineer', 'employment', 'Full-time', 'July 2026', 'Present', true, 'Jammu', 'on_site', '[]'::jsonb, '{}', '{}', NULL, 0, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.219Z') ON CONFLICT DO NOTHING;

INSERT INTO public.experience (organization, role_title, category, employment_type, start_date, end_date, is_current, location, work_mode, description, responsibilities, technologies, evidence_url, display_order, publication_status, verification_status, last_verified) VALUES ('FiguredoutAI', 'Co-Founder & CEO', 'employment', 'Full-time', '2024', 'Present', true, NULL, 'on_site', '["Co-founder leadership role directing technical strategy and product architecture."]'::jsonb, '{}', '{"AI/ML","Systems Architecture"}', NULL, 1, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT DO NOTHING;

INSERT INTO public.experience (organization, role_title, category, employment_type, start_date, end_date, is_current, location, work_mode, description, responsibilities, technologies, evidence_url, display_order, publication_status, verification_status, last_verified) VALUES ('Space Tech & Astro Community (STAC)', 'Technical Head', 'employment', 'Full-time', '2023', '2024', false, NULL, 'on_site', '["Technical leadership in student community projects and workshops."]'::jsonb, '{}', '{"Avionics","Robotics","Community Leadership"}', NULL, 2, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT DO NOTHING;

INSERT INTO public.experience (organization, role_title, category, employment_type, start_date, end_date, is_current, location, work_mode, description, responsibilities, technologies, evidence_url, display_order, publication_status, verification_status, last_verified) VALUES ('Independent Open Source Robotics', 'Systems Developer & Researcher', 'employment', 'Full-time', '2023', 'Present', true, NULL, 'on_site', '["Engineered ROS 2 multi-node packages for autonomous mobile robotics, real-time closed-loop control, and deterministic spatial path planning.","Maintained public open-source repositories and reproducible documentation."]'::jsonb, '{}', '{"ROS 2","Python","C++","Kinematics","Linux","Git"}', 'https://github.com/tanishk756', 3, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT DO NOTHING;

INSERT INTO public.projects (slug, title, subtitle, overview, algorithms, challenges, limitations, future_work, github_url, featured, display_order, publication_status, verification_status, last_verified) VALUES ('turtle-chase', 'Closed-Loop Pursuit Controller in ROS 2', 'ROS 2 proportional pursuit node with heading angle normalization and geometry message coordination.', 'Built a publisher-subscriber structure using ROS 2 geometry_msgs. The follower node subscribes to target pose topics, computes heading angle differences, and publishes linear and angular velocity commands.', '{"Proportional Steering Control","Euclidean Distance Calculation","Angle Normalization (-pi to +pi)"}', '{"Angular Discontinuities at Boundary Crossings: Implemented angle normalization into (-pi, pi] space before applying proportional gain. (Avoided rotational oscillations during target tracking.)","Asynchronous Node Startup Sequencing: Added service client check on client.wait_for_service(). (Ensured clean node initialization sequence.)"}', '{"Decoupled ROS 2 node architecture simplifies testing of controller logic.","Angle normalization is necessary in angular control loops to prevent boundary jumps."}', '{"Experiment with 3D coordinate tracking in simulation.","Test trajectory prediction filters."}', 'https://github.com/tanishk756/turtle_chase', true, 0, 'draft', 'GITHUB_VERIFIED', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.projects (slug, title, subtitle, overview, algorithms, challenges, limitations, future_work, github_url, featured, display_order, publication_status, verification_status, last_verified) VALUES ('autonomous-path-planning', '2D Grid Path Planning Algorithms (A* & Dijkstra)', 'Python implementations of A-Star heuristic search and Dijkstra uniform-cost search on discrete 2D occupancy grids.', 'Represented 2D grid occupancy with obstacle cells and used min-heap priority queues to explore grid coordinates from start to goal.', '{"A* Pathfinding","Dijkstra Algorithm","Priority Queue Search"}', '{"Handling Diagonal Transitions around Obstacles: Added 8-connected grid movement with diagonal cost weighting. (Produced smoother path trajectories.)"}', '{"Admissible distance heuristics ensure optimal shortest path solutions in A*.","Priority queues are essential for efficient node exploration."}', '{"Test dynamic replanning algorithms.","Explore path smoothing techniques."}', 'https://github.com/tanishk756', true, 1, 'draft', 'GITHUB_VERIFIED', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.projects (slug, title, subtitle, overview, algorithms, challenges, limitations, future_work, github_url, featured, display_order, publication_status, verification_status, last_verified) VALUES ('employee-attrition-ml', 'Tabular Classification Pipeline with Scikit-Learn', 'Comparative evaluation of Decision Tree and Support Vector Classifier (SVC) models on tabular dataset.', 'Applied one-hot encoding for categorical features and StandardScaler normalization for numerical features, followed by model training with Scikit-Learn.', '{"Decision Tree Classifier","Support Vector Machine (SVM)","Standard Scaling"}', '{"Handling Imbalanced Target Classes: Adjusted class weights and evaluated Precision and Recall. (Improved classification balance for minority class.)"}', '{"Data preprocessing and feature scaling significantly impact SVM model convergence.","Evaluation metrics must match class distribution characteristics."}', '{"Experiment with gradient boosting models.","Explore feature selection techniques."}', 'https://github.com/tanishk756/Employee-Attrition-Prediction', true, 2, 'draft', 'GITHUB_VERIFIED', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.research_programs (slug, title, research_area, summary, research_question, methodology, key_contribution, status, collaborators, display_order, publication_status, verification_status, last_verified) VALUES ('autonomous-kinematic-control', 'Closed-Loop Kinematics & Heading Tracking in ROS 2', 'Robotics & Control Systems', 'Implementation study on proportional steering control, angle normalization across quadrant boundaries, and asynchronous node communication in ROS 2.', 'Closed-Loop Kinematics & Heading Tracking in ROS 2', 'Implemented heading error calculations and quadrant angle normalization in Python node scripts, tested across simulation runs in turtlesim.', NULL, 'active', '{"Tanishk Singhal"}', 0, 'draft', 'GITHUB_VERIFIED', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.research_programs (slug, title, research_area, summary, research_question, methodology, key_contribution, status, collaborators, display_order, publication_status, verification_status, last_verified) VALUES ('graph-path-planning-perception', 'Graph Search Algorithms & 2D Grid Traversal', 'Robotics & Control Systems', 'Comparative implementation of deterministic graph-search algorithms (A* heuristic search vs Dijkstra uniform cost) on discrete 2D grid representations.', 'Graph Search Algorithms & 2D Grid Traversal', 'Implemented 8-connected grid search in Python using priority queues with Manhattan and Euclidean distance heuristics.', NULL, 'active', '{"Tanishk Singhal"}', 1, 'draft', 'GITHUB_VERIFIED', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.research_programs (slug, title, research_area, summary, research_question, methodology, key_contribution, status, collaborators, display_order, publication_status, verification_status, last_verified) VALUES ('uav-energy-harvesting-research', 'Multi-Source Wireless Energy Harvesting Architectures for Autonomous UAVs', 'Robotics & Control Systems', 'Theoretical framework and simulation of hybrid energy harvesting (RF, photovoltaic, and ambient scavenging) to supplement onboard battery reserves in autonomous drone systems.', 'Multi-Source Wireless Energy Harvesting Architectures for Autonomous UAVs', 'Energy budget modeling and power transfer efficiency analysis across diverse flight profiles and RF transmitter topologies.', NULL, 'active', '{"MK Shukla","HS Bedi","YK Verma","Tanishk Singhal"}', 2, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.publications (slug, title, authors, venue, publication_type, year, doi, abstract, keywords, pdf_asset_url, doi_url, scholar_url, researchgate_url, display_order, publication_status, verification_status, last_verified) VALUES ('uav-wireless-power-harvesting', 'Framework for UAV-based wireless power harvesting', '{"MK Shukla","HS Bedi","YK Verma","Tanishk Singhal"}', 'Academic Research Publication', 'conference', 2026, NULL, 'Investigating multi-source wireless power harvesting methodologies integrating RF energy scavenging, solar absorption, and dynamic power distribution architectures to extend flight endurance and operational autonomy for unmanned aerial vehicle (UAV) networks.', '{"UAV","Wireless Power Harvesting","Energy Scavenging","Autonomous Systems"}', NULL, NULL, NULL, NULL, 0, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.publications (slug, title, authors, venue, publication_type, year, doi, abstract, keywords, pdf_asset_url, doi_url, scholar_url, researchgate_url, display_order, publication_status, verification_status, last_verified) VALUES ('digital-twin-fault-diagnosis', 'Advanced fault diagnosis and prognostics using digital twin technology', '{"HS Bedi","Tanishk Singhal"}', 'Academic Research Publication', 'conference', 2025, NULL, 'Modeling cyber-physical digital twins to monitor real-time telemetry, detect telemetry anomalies, and provide prognostic indicators for robotic and automated sub-assemblies before physical hardware failure occurs.', '{"Digital Twin","Fault Diagnosis","Prognostics","Telemetry","Robotics"}', NULL, NULL, NULL, NULL, 1, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.publications (slug, title, authors, venue, publication_type, year, doi, abstract, keywords, pdf_asset_url, doi_url, scholar_url, researchgate_url, display_order, publication_status, verification_status, last_verified) VALUES ('iot-smart-polyhouse', 'IoT-Based Smart Polyhouse Automation', '{"A Kumar","HS Bedi","Tanishk Singhal"}', 'Academic Research Publication', 'conference', 2025, NULL, 'Architecting an IoT-driven sensing and automated environmental feedback loop for micro-climate stabilization, closed-loop actuator control, and sensor telemetry analysis.', '{"IoT","Embedded Sensing","Smart Systems","Automation"}', NULL, NULL, NULL, NULL, 2, 'draft', 'PROBABLE', '2026-09-06T17:49:13.220Z') ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('ROS 2 (Robot Operating System)', 'Robotics', NULL, 'Advanced', 0, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Autonomous Kinematics & Control', 'Robotics', NULL, 'Advanced', 1, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Path Planning (A*, Dijkstra, BFS)', 'Robotics', NULL, 'Advanced', 2, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Obstacle Avoidance & Perception', 'Robotics', NULL, 'Advanced', 3, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('State Machine Coordination', 'Robotics', NULL, 'Advanced', 4, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Coordinate Transformations (TF2)', 'Robotics', NULL, 'Advanced', 5, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Closed-Loop Feedback Systems', 'Robotics', NULL, 'Advanced', 6, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Machine Learning Pipelines', 'AI / ML', NULL, 'Advanced', 7, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Scikit-Learn & NumPy', 'AI / ML', NULL, 'Advanced', 8, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Classification & Regression', 'AI / ML', NULL, 'Advanced', 9, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Decision Trees & SVMs', 'AI / ML', NULL, 'Advanced', 10, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Computer Vision & Image Processing', 'AI / ML', NULL, 'Advanced', 11, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Data Preprocessing & EDA', 'AI / ML', NULL, 'Advanced', 12, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Embedded C / C++', 'Embedded Systems', NULL, 'Advanced', 13, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Python Systems Programming', 'Embedded Systems', NULL, 'Advanced', 14, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Microcontroller Architectures', 'Embedded Systems', NULL, 'Advanced', 15, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Serial Protocols (UART / I2C / SPI)', 'Embedded Systems', NULL, 'Advanced', 16, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Real-Time Sensor Interfacing', 'Embedded Systems', NULL, 'Advanced', 17, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Circuit Prototyping & Debugging', 'Programming', NULL, 'Advanced', 18, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('PCB Design Fundamentals', 'Programming', NULL, 'Advanced', 19, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Sensor & Actuator Calibration', 'Programming', NULL, 'Advanced', 20, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Power Distribution Basics', 'Programming', NULL, 'Advanced', 21, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Linux / Ubuntu Environment', 'Programming', NULL, 'Advanced', 22, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Git & Collaborative CI/CD', 'Programming', NULL, 'Advanced', 23, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Data Visualization (Matplotlib/Seaborn)', 'Programming', NULL, 'Advanced', 24, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Algorithm Complexity Optimization', 'Programming', NULL, 'Advanced', 25, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, category, description, proficiency_level, display_order, publication_status, verification_status, last_verified) VALUES ('Technical Documentation', 'Programming', NULL, 'Advanced', 26, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (name, role, start_date, end_date, is_current, location, description, official_url, display_order, publication_status, verification_status, last_verified) VALUES ('DronIQ Labs Pvt Ltd', 'Robotics and AI Engineer', 'July 2026', NULL, false, NULL, NULL, NULL, 0, 'draft', 'USER_PROVIDED', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (name, role, start_date, end_date, is_current, location, description, official_url, display_order, publication_status, verification_status, last_verified) VALUES ('FiguredoutAI', 'Co-Founder & CEO', '2024', NULL, false, NULL, 'Technology & AI venture.', NULL, 1, 'draft', 'PROBABLE', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.organizations (name, role, start_date, end_date, is_current, location, description, official_url, display_order, publication_status, verification_status, last_verified) VALUES ('Space Tech & Astro Community (STAC)', 'Technical Head', '2023', '2024', false, NULL, 'Student aerospace and astronomy technical community.', NULL, 2, 'draft', 'PROBABLE', '2026-09-06T17:49:13.221Z') ON CONFLICT DO NOTHING;

INSERT INTO public.blog_posts (slug, title, excerpt, content, tags, category, author, reading_time_minutes, seo_title, seo_description, display_order, publication_status, verification_status, last_verified) VALUES ('ros2-kinematics-closed-loop', 'Engineering Closed-Loop Proportional Kinematics in ROS 2', 'A deep technical breakdown of managing heading error singularities, velocity clamping, and asynchronous topic synchronization in multi-node robotics packages.', '
# Engineering Closed-Loop Proportional Kinematics in ROS 2

When developing autonomous tracking or pursuit systems in **Robot Operating System (ROS 2)**, coordinate transformations and heading angle normalization are frequent sources of instability.

## 1. The Discontinuity Problem

A naive implementation of a proportional heading controller computes the error angle as:

```python
error_theta = math.atan2(target_y - current_y, target_x - current_x) - current_theta
```

When the error angle crosses the $\pm \pi$ boundary (e.g. $+179^\circ$ transitioning to $-179^\circ$), the raw numerical difference jumps to $\approx 358^\circ$. This triggers sudden, violent rotational spikes in physical actuators or simulated kinematics.

## 2. Robust Quadrant Normalization

To ensure smooth asymptotic convergence, angle normalization into the $(-\pi, \pi]$ interval is mandatory:

```python
def normalize_angle(angle: float) -> float:
    while angle > math.pi:
        angle -= 2.0 * math.pi
    while angle < -math.pi:
        angle += 2.0 * math.pi
    return angle
```

## 3. Asynchronous Node Synchronization

In a decoupled multi-node ROS 2 topology, telemetry subscribers and command publishers must operate without blocking execution threads:

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose

class PursuitControllerNode(Node):
    def __init__(self):
        super().__init__(''pursuit_controller'')
        self.cmd_vel_pub = self.create_publisher(Twist, ''/turtle2/cmd_vel'', 10)
        self.pose_sub = self.create_subscription(Pose, ''/turtle1/pose'', self.on_target_pose, 10)
        self.current_pose_sub = self.create_subscription(Pose, ''/turtle2/pose'', self.on_self_pose, 10)
        
        # 60Hz control loop timer
        self.timer = self.create_timer(0.016, self.control_loop)
```

## 4. Key Takeaways
1. Always normalize rotational error before scaling by proportional gain ($K_p$).
2. Implement acceleration clamping to respect the physical torque envelope.
3. Decouple pose subscriptions from kinematic computation loops.
    ', '{"ROS 2","Kinematics","rclpy","Python","Algorithms"}', 'Engineering', 'Tanishk Singhal', 6, 'Engineering Closed-Loop Proportional Kinematics in ROS 2', 'A deep technical breakdown of managing heading error singularities, velocity clamping, and asynchronous topic synchronization in multi-node robotics packages.', 0, 'draft', 'GITHUB_VERIFIED', '2026-09-06T17:49:13.221Z') ON CONFLICT (slug) DO NOTHING;

COMMIT;