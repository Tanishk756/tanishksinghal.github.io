import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MarkdownRenderer } from '../src/components/blog/MarkdownRenderer';

console.log('--- TECHNICAL BLOG MARKDOWN RENDERER UNIT TESTS ---');

const sampleMarkdown = `
# Main Heading
Normal paragraph text.

## Section Heading
This contains **bold text**, *italic text*, and \`inline code\`.

### Smaller Heading
- First item
- Second item
- Third item

1. First ordered item
2. Second ordered item
3. Third ordered item

> This is an engineering note presented as a blockquote.

\`\`\`python
def track_target(state, observation):
    prediction = state.predict()
    return state.update(observation)
\`\`\`

---

Another section after a horizontal rule with [Link](https://example.com).
`;

const renderedHtml = ReactDOMServer.renderToStaticMarkup(
  React.createElement(MarkdownRenderer, { content: sampleMarkdown })
);

// 1. H1
if (renderedHtml.includes('<h1') && renderedHtml.includes('Main Heading</h1>')) {
  console.log('✅ TEST 1 PASSED: H1 is rendered as semantic <h1> element');
} else {
  throw new Error('H1 failed to render as semantic <h1>');
}

// 2. H2
if (renderedHtml.includes('<h2') && renderedHtml.includes('Section Heading</h2>')) {
  console.log('✅ TEST 2 PASSED: H2 is rendered as semantic <h2> element');
} else {
  throw new Error('H2 failed to render as semantic <h2>');
}

// 3. H3
if (renderedHtml.includes('<h3') && renderedHtml.includes('Smaller Heading</h3>')) {
  console.log('✅ TEST 3 PASSED: H3 is rendered as semantic <h3> element');
} else {
  throw new Error('H3 failed to render as semantic <h3>');
}

// 4. Bold
if (renderedHtml.includes('<strong') && renderedHtml.includes('bold text</strong>')) {
  console.log('✅ TEST 4 PASSED: Bold text is rendered as semantic <strong> element');
} else {
  throw new Error('Bold text failed to render as <strong>');
}

// 5. Italic
if (renderedHtml.includes('<em') && renderedHtml.includes('italic text</em>')) {
  console.log('✅ TEST 5 PASSED: Italic text is rendered as semantic <em> element');
} else {
  throw new Error('Italic text failed to render as <em>');
}

// 6. Inline code
if (renderedHtml.includes('<code') && renderedHtml.includes('inline code</code>')) {
  console.log('✅ TEST 6 PASSED: Inline code is rendered as <code> element');
} else {
  throw new Error('Inline code failed to render as <code>');
}

// 7. Unordered list
if (renderedHtml.includes('<ul') && renderedHtml.includes('<li') && renderedHtml.includes('First item</li>')) {
  console.log('✅ TEST 7 PASSED: Unordered list is rendered as semantic <ul> with <li>');
} else {
  throw new Error('Unordered list failed to render as <ul> with <li>');
}

// 8. Ordered list
if (renderedHtml.includes('<ol') && renderedHtml.includes('<li') && renderedHtml.includes('First ordered item</li>')) {
  console.log('✅ TEST 8 PASSED: Ordered list is rendered as semantic <ol> with <li>');
} else {
  throw new Error('Ordered list failed to render as <ol> with <li>');
}

// 9. Blockquote
if (renderedHtml.includes('<blockquote') && renderedHtml.includes('engineering note presented as a blockquote.')) {
  console.log('✅ TEST 9 PASSED: Blockquote is rendered as semantic <blockquote> element');
} else {
  throw new Error('Blockquote failed to render as <blockquote>');
}

// 10. Fenced code block
if (renderedHtml.includes('<pre') && renderedHtml.includes('def track_target(state, observation):')) {
  console.log('✅ TEST 10 PASSED: Fenced code block is rendered as semantic <pre> element');
} else {
  throw new Error('Fenced code block failed to render as <pre>');
}

// 11. Horizontal rule
if (renderedHtml.includes('<hr')) {
  console.log('✅ TEST 11 PASSED: Horizontal rule is rendered as <hr> element');
} else {
  throw new Error('Horizontal rule failed to render as <hr>');
}

// 12. Link
if (renderedHtml.includes('<a') && renderedHtml.includes('href="https://example.com"')) {
  console.log('✅ TEST 12 PASSED: Link is rendered as semantic <a> element');
} else {
  throw new Error('Link failed to render as <a>');
}

// 13. Paragraph
if (renderedHtml.includes('<p') && renderedHtml.includes('Normal paragraph text.</p>')) {
  console.log('✅ TEST 13 PASSED: Paragraphs are rendered as semantic <p> elements');
} else {
  throw new Error('Paragraphs failed to render as <p>');
}

// 14. APEX-Track Article Mock Rendering Test
const apexTrackMarkdown = `
# Building APEX-Track: Engineering a Modular Perception and Persistent Tracking System

I have always found the gap between a computer-vision demo and a dependable autonomous system more interesting than the demo itself.

## The Idea Behind the System

A detector can identify an object, but a persistent autonomous system needs to maintain state over time.

**Detection is not tracking.** APEX-Track is built around that distinction.

> The interesting engineering problem begins after the first successful detection.

### Multi-Model Perception

The system integrates multiple perception backends:

- YOLOv8-seg
- RT-DETR
- YOLO11

\`\`\`text
Detector -> Fusion -> Tracker -> State Estimation
\`\`\`
`;

const renderedApex = ReactDOMServer.renderToStaticMarkup(
  React.createElement(MarkdownRenderer, { content: apexTrackMarkdown })
);

if (
  renderedApex.includes('<h1') &&
  renderedApex.includes('Building APEX-Track:') &&
  renderedApex.includes('<h2') &&
  renderedApex.includes('The Idea Behind the System</h2>') &&
  renderedApex.includes('<strong') &&
  renderedApex.includes('Detection is not tracking.</strong>') &&
  renderedApex.includes('<blockquote') &&
  renderedApex.includes('<h3') &&
  renderedApex.includes('Multi-Model Perception</h3>') &&
  renderedApex.includes('YOLOv8-seg</li>') &&
  renderedApex.includes('<pre') &&
  renderedApex.includes('Detector -&gt; Fusion -&gt; Tracker')
) {
  console.log('✅ TEST 14 PASSED: APEX-Track article renders all semantic sections without raw markdown syntax leaks');
} else {
  throw new Error('APEX-Track article failed rendering validation');
}

console.log('================================================================');
console.log(' ALL 14 MARKDOWN RENDERER TESTS PASSED SUCCESSFULLY (100%)');
console.log('================================================================');
