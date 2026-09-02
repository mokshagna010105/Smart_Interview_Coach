import { INTERVIEW_TYPES } from '../../../../shared/constants/interviewTypes.js';
import { DIFFICULTY_LEVELS } from '../../../../shared/constants/difficultyLevels.js';

const QUESTION_BANK = {
  [INTERVIEW_TYPES.TECHNICAL]: {
    [DIFFICULTY_LEVELS.BEGINNER]: [
      {
        questionText: 'Can you explain the difference between `var`, `let`, and `const` in JavaScript, and how scoping rules apply to each?',
        category: 'JavaScript Fundamentals',
        expectedTopics: ['Block Scope', 'Function Scope', 'Hoisting', 'Re-assignment vs Mutation'],
        rubricGuide: 'Clear explanation of lexical block vs function scope, temporal dead zone, and const reference immutability.'
      },
      {
        questionText: 'How does the Document Object Model (DOM) work, and how does React Virtual DOM optimize DOM manipulation?',
        category: 'Frontend Core',
        expectedTopics: ['DOM Tree', 'Virtual DOM', 'Reconciliation', 'Diffing Algorithm'],
        rubricGuide: 'Understands why direct DOM manipulations are costly and how React batches batched reconciliation updates.'
      },
      {
        questionText: 'What are HTTP status codes, and what is the key difference between 2xx, 4xx, and 5xx response categories?',
        category: 'Web Protocols & APIs',
        expectedTopics: ['200 OK vs 201 Created', '400 vs 401 vs 403 vs 404', '500 Server Errors', 'REST conventions'],
        rubricGuide: 'Identifies client-side vs server-side errors and correct REST status code conventions.'
      },
      {
        questionText: 'Explain the difference between an Array and an Object in JavaScript, including time complexities for lookups and insertions.',
        category: 'Data Structures',
        expectedTopics: ['O(1) Hash Map lookup', 'Index-based access', 'Memory layout', 'Key-value mapping'],
        rubricGuide: 'Mentions O(1) average lookup for object keys vs sequential array operations.'
      }
    ],
    [DIFFICULTY_LEVELS.INTERMEDIATE]: [
      {
        questionText: 'How does the JavaScript Event Loop work under the hood? Walk through the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout).',
        category: 'JavaScript Concurrency',
        expectedTopics: ['Call Stack', 'Microtask Queue', 'Macrotask Queue', 'Event Loop Tick', 'Async/Await execution order'],
        rubricGuide: 'Accurately traces order of execution between microtasks and macrotasks in the runtime.'
      },
      {
        questionText: 'Explain how indexing works in MongoDB or relational databases. When would you use a compound index versus a single-field index?',
        category: 'Database Design & Optimization',
        expectedTopics: ['B-Tree / WiredTiger', 'Index Scan vs Collection Scan', 'Compound Index Prefix Rule', 'Write Performance Tradeoffs'],
        rubricGuide: 'Explains query execution plans (explain), prefix rule in compound indexes, and indexing cost on write operations.'
      },
      {
        questionText: 'How would you design a rate-limiting middleware for an Express.js REST API to prevent denial-of-service and brute-force attacks?',
        category: 'API Architecture & Security',
        expectedTopics: ['Token Bucket / Leaky Bucket', 'IP / User Token Tracking', 'Redis / In-memory storage', 'HTTP 429 Headers'],
        rubricGuide: 'Describes algorithm (sliding window or token bucket), header conventions (Retry-After), and distributed state handling.'
      },
      {
        questionText: 'What is the difference between SQL and NoSQL databases, and what architectural criteria guide your decision when choosing one over the other?',
        category: 'System Architecture',
        expectedTopics: ['ACID vs BASE', 'Schema flexibility', 'Horizontal vs Vertical Scaling', 'Join overhead vs Document embedding'],
        rubricGuide: 'Balances consistency requirements, transactional complexity, and data access patterns.'
      }
    ],
    [DIFFICULTY_LEVELS.ADVANCED]: [
      {
        questionText: 'Design a high-throughput, distributed URL shortening service (like Bitly) handling 100M daily active writes and 1B reads. How do you partition data, generate unique short keys, and handle caching?',
        category: 'System Design & Scalability',
        expectedTopics: ['Base62 Encoding vs MD5/SHA-256', 'Distributed ID Generation (Snowflake)', 'LRU Caching with Redis', 'Database Sharding by Key Hash'],
        rubricGuide: 'Addresses read/write ratio, cache eviction strategies, collision avoidance, and DB replication for high availability.'
      },
      {
        questionText: 'How would you detect and resolve a memory leak in a Node.js production service experiencing gradual RSS growth and high event loop lag?',
        category: 'Performance & Profiling',
        expectedTopics: ['Heap Snapshots (V8 Inspector)', 'Uncleaned Event Listeners / Closures', 'Global Cache Buildup', 'CPU Flamegraphs'],
        rubricGuide: 'Describes heap diffing methodologies, isolating retained objects, and monitoring event loop delay metrics.'
      },
      {
        questionText: 'Explain the CAP Theorem and PACELC theorem. In a distributed microservices ecosystem, how do you handle eventual consistency between services without distributed two-phase commit transactions?',
        category: 'Distributed Systems',
        expectedTopics: ['Saga Pattern (Orchestration vs Choreography)', 'Outbox Pattern', 'Idempotent Consumers', 'Dead Letter Queues'],
        rubricGuide: 'Details asynchronous reconciliation using transactional outbox and saga coordinators instead of 2PC.'
      }
    ],
    [DIFFICULTY_LEVELS.EXPERT]: [
      {
        questionText: 'How would you architect a globally distributed, real-time collaborative workspace (like Google Docs or Figma) supporting concurrent edits, offline writes, and sub-50ms sync latency?',
        category: 'Distributed Real-Time Systems',
        expectedTopics: ['CRDTs (Conflict-free Replicated Data Types)', 'Operational Transformation (OT)', 'WebSocket edge routing', 'Vector Clocks'],
        rubricGuide: 'Compares state-based vs operation-based CRDTs, edge server fan-out, and conflict resolution guarantees.'
      },
      {
        questionText: 'Discuss zero-downtime database migration strategies when refactoring a high-traffic table with 500 million records from a monolithic schema to a sharded multi-tenant schema.',
        category: 'Database Engineering',
        expectedTopics: ['Dual Writing / Shadow Writes', 'Backfill Background Jobs', 'Data Verification Reconciler', 'Feature Flag Cutover'],
        rubricGuide: 'Outlines 4-step dual-write migration with continuous consistency verification and instant rollback capability.'
      }
    ]
  },
  [INTERVIEW_TYPES.BEHAVIORAL]: {
    [DIFFICULTY_LEVELS.BEGINNER]: [
      {
        questionText: 'Tell me about a time when you faced a difficult technical bug in a project. How did you diagnose the problem and what was the outcome?',
        category: 'Problem Solving (STAR)',
        expectedTopics: ['Situation Context', 'Debugging Technique', 'Action Taken', 'Lessons Learned'],
        rubricGuide: 'Uses STAR framework to articulate root-cause analysis, persistence, and verification.'
      },
      {
        questionText: 'Describe a situation where you had to learn a new programming language, framework, or tool under a tight deadline. How did you approach it?',
        category: 'Adaptability & Learning',
        expectedTopics: ['Resource Selection', 'Time Management', 'Practical Application', 'Delivered Result'],
        rubricGuide: 'Highlights proactive learning strategies and practical project execution.'
      }
    ],
    [DIFFICULTY_LEVELS.INTERMEDIATE]: [
      {
        questionText: 'Describe a time when you had a technical disagreement with a teammate or lead regarding software architecture or code design. How did you resolve it?',
        category: 'Collaboration & Conflict Resolution',
        expectedTopics: ['Objective Evaluation', 'Data-driven Debate', 'Compromise / Alignment', 'Team Cohesion'],
        rubricGuide: 'Demonstrates professional empathy, focusing on facts/benchmarks rather than ego, and driving consensus.'
      },
      {
        questionText: 'Tell me about a project you delivered where the requirements changed significantly halfway through development. How did you handle the shift?',
        category: 'Agility & Execution',
        expectedTopics: ['Impact Assessment', 'Stakeholder Communication', 'Reprioritization', 'Timely Delivery'],
        rubricGuide: 'Shows calm adaptability, trade-off communication, and agile scoping.'
      }
    ],
    [DIFFICULTY_LEVELS.ADVANCED]: [
      {
        questionText: 'Give an example of a time when a production incident or severe outage occurred on a service you managed. How did you lead the triage, resolution, and post-mortem?',
        category: 'Incident Management & Ownership',
        expectedTopics: ['Blast Radius Containment', 'Root Cause Analysis (RCA)', 'Actionable Post-Mortem', 'Preventative Safeguards'],
        rubricGuide: 'Demonstrates blameless post-mortem culture, effective communication during crisis, and systemic preventive measures.'
      },
      {
        questionText: 'Tell me about a time when you mentored a junior engineer or championed a significant engineering practice across your organization.',
        category: 'Leadership & Mentorship',
        expectedTopics: ['Knowledge Sharing', 'Code Review Practices', 'Measuring Growth', 'Engineering Culture'],
        rubricGuide: 'Focuses on team multiplier effects, empathy, and sustainable engineering excellence.'
      }
    ],
    [DIFFICULTY_LEVELS.EXPERT]: [
      {
        questionText: 'Describe a situation where you made a critical architectural decision with incomplete information and significant business stakes. How did you navigate the trade-offs and what was the long-term impact?',
        category: 'Executive Decision Making',
        expectedTopics: ['Risk Assessment', 'One-way vs Two-way Doors', 'Stakeholder Buy-in', 'Long-term Resilience'],
        rubricGuide: 'Illustrates high-stakes strategic reasoning, mitigation of downside risk, and clear retrospection.'
      }
    ]
  },
  [INTERVIEW_TYPES.HR]: {
    [DIFFICULTY_LEVELS.BEGINNER]: [
      {
        questionText: 'Why are you interested in this role and what excites you about building software at our target company?',
        category: 'Motivation & Role Fit',
        expectedTopics: ['Company Mission', 'Career Aspirations', 'Alignment with Tech Stack'],
        rubricGuide: 'Authentic interest in company products, culture, and alignment with personal growth goals.'
      },
      {
        questionText: 'Where do you see your software engineering career progressing over the next 2 to 3 years?',
        category: 'Career Vision',
        expectedTopics: ['Skill Mastery', 'Impact Ownership', 'Professional Development'],
        rubricGuide: 'Clear, grounded vision for professional development and continuous improvement.'
      }
    ],
    [DIFFICULTY_LEVELS.INTERMEDIATE]: [
      {
        questionText: 'How do you prioritize competing deadlines and manage context-switching when handling multiple project deliverables simultaneously?',
        category: 'Time & Priority Management',
        expectedTopics: ['Eisenhower Matrix / Priority Frameworks', 'Communication of Blockers', 'Focus Management'],
        rubricGuide: 'Structured methodology for managing work bandwidth and transparent stakeholder communication.'
      },
      {
        questionText: 'What type of engineering culture and team environment brings out your most productive and innovative work?',
        category: 'Culture Fit & Working Style',
        expectedTopics: ['Collaboration Style', 'Autonomy vs Guidance', 'Feedback Openness'],
        rubricGuide: 'Articulates positive teamwork values, constructive feedback reception, and psychological safety.'
      }
    ],
    [DIFFICULTY_LEVELS.ADVANCED]: [
      {
        questionText: 'How do you foster diversity of thought, psychological safety, and high-performance standards within cross-functional product teams?',
        category: 'Team Leadership & Culture',
        expectedTopics: ['Inclusive Collaboration', 'Constructive Challenge', 'High Standards'],
        rubricGuide: 'Demonstrates ability to inspire and elevate team dynamics while maintaining high delivery velocity.'
      }
    ],
    [DIFFICULTY_LEVELS.EXPERT]: [
      {
        questionText: 'How do you align long-term engineering health (refactoring, technical debt reduction) with immediate business revenue drivers and executive milestones?',
        category: 'Strategic Alignment',
        expectedTopics: ['Business Translation of Tech Debt', 'Incremental Modernization', 'Executive Communication'],
        rubricGuide: 'Demonstrates translating engineering investments into business value (velocity, risk reduction, uptime).'
      }
    ]
  },
  [INTERVIEW_TYPES.CASE_STUDY]: {
    [DIFFICULTY_LEVELS.BEGINNER]: [
      {
        questionText: 'A user reports that your web application takes over 8 seconds to load on mobile devices. Walk through your step-by-step diagnostic process to identify and fix the bottleneck.',
        category: 'Performance Case Study',
        expectedTopics: ['Lighthouse / Network Waterfall', 'Bundle Size / Code Splitting', 'Image Optimization & CDN', 'Critical Rendering Path'],
        rubricGuide: 'Structured diagnostic framework: measure -> locate bottleneck -> implement targeted fix -> verify.'
      }
    ],
    [DIFFICULTY_LEVELS.INTERMEDIATE]: [
      {
        questionText: 'Your e-commerce checkout service experiences a sudden spike in failed transactions during a flash sale. How do you isolate whether the issue is in the payment gateway, database locking, or API concurrency?',
        category: 'System Diagnostics & Reliability',
        expectedTopics: ['Log Aggregation & Trace IDs', 'Database Connection Pool & Lock Contention', 'Circuit Breakers', 'Graceful Degradation'],
        rubricGuide: 'Structured troubleshooting using distributed tracing, metric dashboards, and isolating dependencies.'
      }
    ],
    [DIFFICULTY_LEVELS.ADVANCED]: [
      {
        questionText: 'Design a fault-tolerant notification engine capable of sending 50 million personalized push notifications, SMS, and emails with delivery priority queues and deduplication.',
        category: 'Distributed Architecture Case Study',
        expectedTopics: ['Message Broker (Kafka/RabbitMQ)', 'Worker Pool Auto-scaling', 'Idempotency Keys', 'Rate Limiters per Provider'],
        rubricGuide: 'Addresses fan-out architecture, backpressure management, delivery tracking, and dead-letter retries.'
      }
    ],
    [DIFFICULTY_LEVELS.EXPERT]: [
      {
        questionText: 'Your company needs to migrate its core payments processing pipeline to support multi-region active-active deployment across US, EU, and APAC while strictly adhering to data sovereignty laws (GDPR) and sub-second global consistency. How do you design this?',
        category: 'Global Distributed Architecture',
        expectedTopics: ['Multi-Region DB Replication', 'Geographic Sharding', 'Data Residency Routing', 'Cross-Region Latency Mitigation'],
        rubricGuide: 'Comprehensive breakdown of data isolation, local settlement vs global reconciliation, and regulatory compliance.'
      }
    ]
  }
};

export class DeterministicQuestionGenerator {
  /**
   * Generate realistic structured questions
   * @param {object} config
   * @returns {Array<object>}
   */
  static generate(config) {
    const {
      type = INTERVIEW_TYPES.TECHNICAL,
      difficulty = DIFFICULTY_LEVELS.INTERMEDIATE,
      targetRole = 'Software Engineer',
      targetCompany = 'Generic',
      skillsFocus = [],
      questionCount = 5
    } = config;

    // Retrieve base questions for selected type & difficulty
    const typePool = QUESTION_BANK[type] || QUESTION_BANK[INTERVIEW_TYPES.TECHNICAL];
    let candidatePool = [...(typePool[difficulty] || [])];

    // If pool is smaller than requested, add from adjacent difficulties
    if (candidatePool.length < questionCount) {
      const allDifficulties = Object.values(DIFFICULTY_LEVELS);
      for (const diff of allDifficulties) {
        if (diff !== difficulty && typePool[diff]) {
          candidatePool.push(...typePool[diff]);
        }
      }
    }

    // If still need more, add questions from other types
    if (candidatePool.length < questionCount) {
      for (const t of Object.values(INTERVIEW_TYPES)) {
        if (t !== type && QUESTION_BANK[t]?.[difficulty]) {
          candidatePool.push(...QUESTION_BANK[t][difficulty]);
        }
      }
    }

    // Shuffle pool
    const shuffled = [...candidatePool].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // Customize question text slightly based on target company & skills where appropriate
    return selected.map((q, index) => {
      let customizedText = q.questionText;

      // If user specified skills and it is a technical interview, inject skill relevance into 1-2 questions
      if (skillsFocus.length > 0 && type === INTERVIEW_TYPES.TECHNICAL && index === 0) {
        const topSkill = skillsFocus[0];
        customizedText = `Considering your experience with ${topSkill} for the ${targetRole} role: ${q.questionText}`;
      } else if (targetCompany && targetCompany !== 'Generic' && index === 1) {
        customizedText = `At ${targetCompany}, scale and quality are top priorities. ${q.questionText}`;
      }

      return {
        questionText: customizedText,
        category: q.category || 'General Engineering',
        difficulty: q.difficulty || difficulty,
        expectedTopics: q.expectedTopics || ['Core Principles', 'Practical Application'],
        rubricGuide: q.rubricGuide || 'Evaluates depth of knowledge, clarity of communication, and structured thinking.'
      };
    });
  }
}

export default DeterministicQuestionGenerator;
