import { PublicationItem } from '../types/content';
import { filterProductionVerified } from './provenance';

export const publicationsData: PublicationItem[] = [
  {
    id: "uav-wireless-power-harvesting",
    slug: "uav-wireless-power-harvesting",
    title: "Framework for UAV-based wireless power harvesting",
    authors: ["MK Shukla", "HS Bedi", "YK Verma", "Tanishk Singhal"],
    venue: "Academic Research Publication",
    publisher: "Scrivener / Wiley",
    year: 2026,
    abstract: "Investigating multi-source wireless power harvesting methodologies integrating RF energy scavenging, solar absorption, and dynamic power distribution architectures to extend flight endurance and operational autonomy for unmanned aerial vehicle (UAV) networks.",
    keywords: ["UAV", "Wireless Power Harvesting", "Energy Scavenging", "Autonomous Systems"],
    status: "published",
    source: "Google Scholar (User-provided anchor user=4o_Dc0wAAAAJ) & ResearchGate",
    sourceUrl: "https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en",
    verificationStatus: "PROBABLE",
    lastVerified: "2026-09-05",
    notes: "Awaiting final user review before public rendering."
  },
  {
    id: "digital-twin-fault-diagnosis",
    slug: "digital-twin-fault-diagnosis",
    title: "Advanced fault diagnosis and prognostics using digital twin technology",
    authors: ["HS Bedi", "Tanishk Singhal"],
    venue: "Academic Research Publication",
    year: 2025,
    abstract: "Modeling cyber-physical digital twins to monitor real-time telemetry, detect telemetry anomalies, and provide prognostic indicators for robotic and automated sub-assemblies before physical hardware failure occurs.",
    keywords: ["Digital Twin", "Fault Diagnosis", "Prognostics", "Telemetry", "Robotics"],
    status: "published",
    source: "Google Scholar (User-provided anchor user=4o_Dc0wAAAAJ) & ResearchGate",
    sourceUrl: "https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en",
    verificationStatus: "PROBABLE",
    lastVerified: "2026-09-05",
    notes: "Awaiting final user review before public rendering."
  },
  {
    id: "iot-smart-polyhouse",
    slug: "iot-smart-polyhouse",
    title: "IoT-Based Smart Polyhouse Automation",
    authors: ["A Kumar", "HS Bedi", "Tanishk Singhal"],
    venue: "Academic Research Publication",
    year: 2025,
    abstract: "Architecting an IoT-driven sensing and automated environmental feedback loop for micro-climate stabilization, closed-loop actuator control, and sensor telemetry analysis.",
    keywords: ["IoT", "Embedded Sensing", "Smart Systems", "Automation"],
    status: "published",
    source: "Google Scholar (User-provided anchor user=4o_Dc0wAAAAJ) & ResearchGate",
    sourceUrl: "https://scholar.google.com/citations?user=4o_Dc0wAAAAJ&hl=en",
    verificationStatus: "PROBABLE",
    lastVerified: "2026-09-05",
    notes: "Awaiting final user review before public rendering."
  }
];

export function getProductionPublications(): PublicationItem[] {
  return filterProductionVerified(publicationsData);
}

export function getAllCandidatePublications(): PublicationItem[] {
  return publicationsData;
}

export function getPublicationBySlug(slug: string): PublicationItem | undefined {
  return publicationsData.find((p) => p.slug === slug || p.id === slug);
}

