import { SUBSYSTEMS, SubsystemId } from '../src/components/3d/types';

console.log('--- 3D ROBOT DIGITAL TWIN ARCHITECTURE & SUBSYSTEM TESTS ---');

// 1. Verify Subsystem Registry
const expectedSubsystems: SubsystemId[] = ['chassis', 'drive', 'lidar', 'camera', 'imu', 'compute'];

if (Object.keys(SUBSYSTEMS).length === 6) {
  console.log('✅ TEST 1 PASSED: Exactly 6 core robotics subsystems defined');
} else {
  throw new Error(`Expected 6 subsystems, found ${Object.keys(SUBSYSTEMS).length}`);
}

expectedSubsystems.forEach((id, index) => {
  const subsystem = SUBSYSTEMS[id];
  if (subsystem && subsystem.id === id && subsystem.name && subsystem.category && subsystem.description) {
    console.log(`✅ TEST ${index + 2} PASSED: Subsystem [${id}] contains canonical name, category, and description`);
  } else {
    throw new Error(`Subsystem ${id} is malformed or missing fields`);
  }
});

// 8. Verify Non-Fabricated Categories & Technical Scope
const categories = Object.values(SUBSYSTEMS).map(s => s.category);
const expectedCategories = ['STRUCTURE', 'ACTUATION', 'PERCEPTION', 'VISION', 'ODOMETRY', 'COMPUTE'];

const allCategoriesPresent = expectedCategories.every(cat => categories.includes(cat));
if (allCategoriesPresent) {
  console.log('✅ TEST 8 PASSED: Subsystem categories strictly reflect engineering taxonomy (Structure, Actuation, Perception, Vision, Odometry, Compute)');
} else {
  throw new Error('Subsystem categories mismatch expected engineering taxonomy');
}

console.log('================================================================');
console.log(' ALL 8 DIGITAL TWIN COMPONENT & DATA TESTS PASSED (100%)');
console.log('================================================================');
