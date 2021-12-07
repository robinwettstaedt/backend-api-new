// the login variables for the user that is used for all major testing
// This user creates instances and is therefore the one that should
// have access to them
export const userWithAccess = {
    email: 'testuser@testuser.com',
    password: 'thisisthetestpw',
    firstName: 'Tester',
    username: 'Tester',
};

// the login variables for the user that is needed for testing access
// to resources that the was invited to
export const secondUserWithAccess = {
    email: 'testuser2@testuser.com',
    password: 'thisisthetestpw2',
    firstName: 'Tester2',
    username: 'Tester2',
};

// the login variables for the user that is supposed to have no access
// to any of the resources created
export const userWithNoAccess = {
    email: 'noaccessuser@testuser.com',
    password: 'thisisthetestpw3',
    firstName: 'TesterWithNoAccess',
    username: 'TesterWithNoAccess',
};
