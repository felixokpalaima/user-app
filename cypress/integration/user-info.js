describe('User API Tests', () => {
    const baseUrl = 'http://localhost:3000';

    it('Creates a new user', () => {
        const newUser = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
    
        cy.request('POST', `${Cypress.config('baseUrl')}/users`, newUser)
          .then((response) => {
              expect(response.status).to.eq(201);
              expect(response.body).to.have.property('message', 'User created');
              expect(response.body.user).to.deep.equal({
                  id: newUser.id,
                  name: newUser.name,
                  email: newUser.email
              });
          });
    });
    

    it('Gets a single user', () => {
        cy.request(`${baseUrl}/users/1`)
          .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property('id', 1);
              expect(response.body).to.have.property('name', 'John Doe');
              expect(response.body).to.have.property('email', 'john.doe@example.com');
          });
    });

    it('Gets all users', () => {
        cy.request(`${baseUrl}/users`)
          .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.length).to.be.at.least(1);
              expect(response.body[0]).to.have.property('id', 1);
              expect(response.body[0]).to.have.property('name', 'John Doe');
              expect(response.body[0]).to.have.property('email', 'john.doe@example.com');
          });
    });

    it('Deletes all users', () => {
        cy.request('DELETE', `${Cypress.config('baseUrl')}/users`)
          .then((response) => {
              expect(response.status).to.eq(204);
          });
        cy.request(`${baseUrl}/users`)
        .then((response) => {
            expect(response.body.length).to.eql(0);
        });
    });
});
