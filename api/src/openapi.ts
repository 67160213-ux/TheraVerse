const patientSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    hn: { type: 'string' },
    name: { type: 'string' },
    age: { type: 'integer' },
    condition: { type: 'string' },
    targetHrLow: { type: 'integer' },
    targetHrHigh: { type: 'integer' },
    dailyDistanceGoalM: { type: 'integer' },
    consentGiven: { type: 'boolean' },
    consentAt: { type: 'string', format: 'date-time', nullable: true },
  },
}

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Gamified Diabetes Therapeutics API',
    version: '1.0.0',
    description:
      'Backend for the walking-therapy SaMD prototype — patients, device pairing, vitals, sessions, battles, clinical reports, and rewards.',
  },
  servers: [{ url: '/api' }],
  components: {
    schemas: {
      Patient: patientSchema,
    },
  },
  paths: {
    '/patients': {
      post: {
        summary: 'Look up or register a patient by HN',
        tags: ['patients'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['hn'],
                properties: {
                  hn: { type: 'string', example: '6501234' },
                  name: { type: 'string', example: 'ลุงสมศักดิ์' },
                  age: { type: 'integer', example: 62 },
                  condition: { type: 'string', example: 'เบาหวานชนิดที่ 2 และไขมันในเลือดสูง' },
                  targetHrLow: { type: 'integer', example: 90 },
                  targetHrHigh: { type: 'integer', example: 128 },
                  dailyDistanceGoalM: { type: 'integer', example: 2000 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Patient found or created', content: { 'application/json': { schema: patientSchema } } } },
      },
    },
    '/patients/{hn}': {
      get: {
        summary: 'Get patient by HN',
        tags: ['patients'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        responses: { '200': { description: 'Patient', content: { 'application/json': { schema: patientSchema } } } },
      },
    },
    '/patients/{hn}/consent': {
      patch: {
        summary: 'Record PDPA consent',
        tags: ['patients'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', required: ['agreed'], properties: { agreed: { type: 'boolean', enum: [true], example: true } } },
            },
          },
        },
        responses: { '200': { description: 'Updated patient', content: { 'application/json': { schema: patientSchema } } } },
      },
    },
    '/patients/{hn}/devices/pair': {
      post: {
        summary: 'Record Web Bluetooth device pairing state',
        tags: ['devices'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['deviceType'],
                properties: {
                  deviceType: { type: 'string', enum: ['WATCH', 'CGM'], example: 'WATCH' },
                  connected: { type: 'boolean', default: true, example: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Device link state' } },
      },
    },
    '/patients/{hn}/devices': {
      get: {
        summary: 'List device link status',
        tags: ['devices'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        responses: { '200': { description: 'List of device links' } },
      },
    },
    '/patients/{hn}/sessions': {
      post: {
        summary: 'Start a walk session (requires consent + both devices connected)',
        tags: ['sessions'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        responses: { '201': { description: 'Created session' } },
      },
    },
    '/sessions/{id}': {
      get: {
        summary: 'Get session detail',
        tags: ['sessions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Session detail with battle result and clinical report' } },
      },
    },
    '/sessions/{id}/progress': {
      post: {
        summary: 'Ingest one vitals + distance tick from the device stream',
        tags: ['sessions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['heartRateBpm', 'glucoseMgDl'],
                properties: {
                  heartRateBpm: { type: 'integer', example: 110 },
                  glucoseMgDl: { type: 'integer', example: 115 },
                  deltaDistanceM: { type: 'number', example: 16, default: 0 },
                  gpsLost: { type: 'boolean', example: false, default: false },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Updated session, computed zone, and the stored reading' } },
      },
    },
    '/sessions/{id}/complete': {
      post: {
        summary: 'End a walk session',
        tags: ['sessions'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['COMPLETED', 'ABORTED_CRITICAL'], default: 'COMPLETED' } },
              },
            },
          },
        },
        responses: { '200': { description: 'Completed session' } },
      },
    },
    '/sessions/{id}/battle': {
      post: {
        summary: 'Record boss battle outcome, issue reward token if clinical goal met',
        tags: ['battles'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['outcome'],
                properties: {
                  outcome: { type: 'string', enum: ['VICTORY', 'DEFEAT'], example: 'DEFEAT' },
                  bossLevel: { type: 'integer', example: 3, default: 3 },
                  comboMax: { type: 'integer', example: 12, default: 0 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Battle result, whether the clinical goal was met, and any reward token issued' } },
      },
    },
    '/sessions/{id}/clinical-report': {
      post: {
        summary: 'Submit the session vitals profile to the hospital backend',
        tags: ['clinical-reports'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '201': { description: 'Stored clinical report' } },
      },
    },
    '/patients/{hn}/clinical-reports': {
      get: {
        summary: 'List clinical reports for a patient',
        tags: ['clinical-reports'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        responses: { '200': { description: 'List of clinical reports' } },
      },
    },
    '/patients/{hn}/rewards': {
      get: {
        summary: 'Get token balance and vouchers',
        tags: ['rewards'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        responses: { '200': { description: 'Token balance, tokens, and vouchers' } },
      },
    },
    '/patients/{hn}/rewards/redeem': {
      post: {
        summary: 'Redeem one token for a 15% pharmacy discount voucher',
        tags: ['rewards'],
        parameters: [{ name: 'hn', in: 'path', required: true, schema: { type: 'string' }, example: '6501234' }],
        responses: { '201': { description: 'Newly issued voucher' } },
      },
    },
    '/health': {
      get: { summary: 'Liveness/readiness probe', tags: ['ops'], responses: { '200': { description: 'ok' } } },
    },
  },
}
