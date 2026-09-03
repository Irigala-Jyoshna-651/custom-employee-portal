const APPS = {
  people: {
    key: 'people',
    name: 'Zoho People',
    permission: 'zoho.people.access',
    // allowed endpoints keys map to relative paths on the API domain
    endpoints: {
      info: { method: 'GET', path: '/people/v2/records' }
    }
  },
  crm: {
    key: 'crm',
    name: 'Zoho CRM',
    permission: 'zoho.crm.access',
    endpoints: {
      info: { method: 'GET', path: '/crm/v2/Leads' }
    }
  },
  desk: {
    key: 'desk',
    name: 'Zoho Desk',
    permission: 'zoho.desk.access',
    endpoints: {
      info: { method: 'GET', path: '/desk/v1/tickets' }
    }
  },
  books: {
    key: 'books',
    name: 'Zoho Books',
    permission: 'zoho.books.access',
    endpoints: {
      info: { method: 'GET', path: '/books/v3/companies' }
    }
  }
};

module.exports = APPS;
