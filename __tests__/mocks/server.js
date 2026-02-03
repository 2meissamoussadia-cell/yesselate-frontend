/**
 * MSW server — Pour tests qui nécessitent des mocks API
 * Usage : importer et appeler server.listen() dans beforeAll
 */

const { setupServer } = require('msw/node');
const { handlers } = require('./handlers');

const server = setupServer(...handlers);

module.exports = { server };
