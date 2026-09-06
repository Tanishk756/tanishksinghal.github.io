import { BlogPost } from '../types/content';
import { filterProductionVerified } from './provenance';

export const blogPostsData: BlogPost[] = [
  {
    id: "ros2-kinematics-closed-loop",
    slug: "ros2-kinematics-closed-loop",
    title: "Engineering Closed-Loop Proportional Kinematics in ROS 2",
    excerpt: "A deep technical breakdown of managing heading error singularities, velocity clamping, and asynchronous topic synchronization in multi-node robotics packages.",
    author: "Tanishk Singhal",
    publishedDate: "2024-11-15",
    readingTimeMinutes: 6,
    categories: ["Robotics", "ROS 2", "Control Systems"],
    tags: ["ROS 2", "Kinematics", "rclpy", "Python", "Algorithms"],
    content: `
# Engineering Closed-Loop Proportional Kinematics in ROS 2

When developing autonomous tracking or pursuit systems in **Robot Operating System (ROS 2)**, coordinate transformations and heading angle normalization are frequent sources of instability.

## 1. The Discontinuity Problem

A naive implementation of a proportional heading controller computes the error angle as:

\`\`\`python
error_theta = math.atan2(target_y - current_y, target_x - current_x) - current_theta
\`\`\`

When the error angle crosses the $\\pm \\pi$ boundary (e.g. $+179^\\circ$ transitioning to $-179^\\circ$), the raw numerical difference jumps to $\\approx 358^\\circ$. This triggers sudden, violent rotational spikes in physical actuators or simulated kinematics.

## 2. Robust Quadrant Normalization

To ensure smooth asymptotic convergence, angle normalization into the $(-\\pi, \\pi]$ interval is mandatory:

\`\`\`python
def normalize_angle(angle: float) -> float:
    while angle > math.pi:
        angle -= 2.0 * math.pi
    while angle < -math.pi:
        angle += 2.0 * math.pi
    return angle
\`\`\`

## 3. Asynchronous Node Synchronization

In a decoupled multi-node ROS 2 topology, telemetry subscribers and command publishers must operate without blocking execution threads:

\`\`\`python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from turtlesim.msg import Pose

class PursuitControllerNode(Node):
    def __init__(self):
        super().__init__('pursuit_controller')
        self.cmd_vel_pub = self.create_publisher(Twist, '/turtle2/cmd_vel', 10)
        self.pose_sub = self.create_subscription(Pose, '/turtle1/pose', self.on_target_pose, 10)
        self.current_pose_sub = self.create_subscription(Pose, '/turtle2/pose', self.on_self_pose, 10)
        
        # 60Hz control loop timer
        self.timer = self.create_timer(0.016, self.control_loop)
\`\`\`

## 4. Key Takeaways
1. Always normalize rotational error before scaling by proportional gain ($K_p$).
2. Implement acceleration clamping to respect the physical torque envelope.
3. Decouple pose subscriptions from kinematic computation loops.
    `,
    relatedProjectSlugs: ["turtle-chase"],
    source: "GitHub Verified Code Implementation (turtle_chase)",
    sourceUrl: "https://github.com/tanishk756/turtle_chase",
    verificationStatus: "GITHUB_VERIFIED",
    lastVerified: "2026-09-05"
  }
];

export function getProductionBlogPosts(): BlogPost[] {
  return filterProductionVerified(blogPostsData);
}

export function getAllCandidateBlogPosts(): BlogPost[] {
  return blogPostsData;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPostsData.find((b) => b.slug === slug || b.id === slug);
}

