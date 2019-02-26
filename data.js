exports.projects = [
    {
      name: 'Project A',
      versions: [{content: 'aaaa', approved: true}, {content: 'bbbb', approved: false}],
      pendingVersion: {content: 'ddddd', approved: null}
    },
    {      
      name: 'Project B',
      versions: [{content: 'xxxxx', approved: true}],
      pendingVersion: null
    }
  ];

exports.users = [
  { 
    name: 'Mike Dwyer',
    email: 'brianmichaeldwyer@gmail.com',
    googleId: '105071105568043566196',
  },
  { 
    name: 'John Smith',
    email: 'js5907658@gmail.com',
    googleId: '103208053237588678337',
  }
];