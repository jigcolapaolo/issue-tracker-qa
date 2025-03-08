const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const crypto = require('crypto')

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    const testId = crypto.randomUUID()
    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/apitest')
            .send({
                assigned_to: "John",
                status_text: "Pending",
                issue_title: "New Title",
                issue_text: "Issue Text",
                created_by: "Paul"
            })
            .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.strictEqual(res.body.assigned_to, "John")
                assert.strictEqual(res.body.status_text, "Pending")
                assert.strictEqual(res.body.open, true)
                assert.strictEqual(res.body.issue_title, "New Title")
                assert.strictEqual(res.body.issue_text, "Issue Text")
                assert.strictEqual(res.body.created_by, "Paul")
                assert.typeOf(res.body._id, "string")
                assert.typeOf(res.body.created_on, "string")
                assert.typeOf(res.body.updated_on, "string")
                done()
            })
    })

    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/apitest')
            .send({
                issue_title: "New Title",
                issue_text: "Issue Text",
                created_by: "Paul"
            })
            .end((err, res) => {
                assert.equal(res.status, 200)
                assert.equal(res.type, 'application/json')
                assert.strictEqual(res.body.open, true)
                assert.strictEqual(res.body.issue_title, "New Title")
                assert.strictEqual(res.body.issue_text, "Issue Text")
                assert.strictEqual(res.body.created_by, "Paul")
                assert.strictEqual(res.body.assigned_to, "")
                assert.strictEqual(res.body.status_text, "")
                assert.typeOf(res.body._id, "string")
                assert.typeOf(res.body.created_on, "string")
                assert.typeOf(res.body.updated_on, "string")
                done()
            })
    })

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .post('/api/issues/apitest')
            .send({
                assigned_to: "John",
                status_text: "Pending",
            })
            .end((err, res) => {
                assert.deepEqual(res.body, { error: "required field(s) missing" })
                done()
            })
    })

    test('View issues on a project: GET request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest')
            .end((err, res) => {
                assert.equal(res.status, 200)
                res.body.forEach(issue => {
                    assert.isObject(issue)
                    assert.property(issue, 'assigned_to');
                    assert.property(issue, 'status_text');
                    assert.property(issue, 'open');
                    assert.property(issue, '_id');
                    assert.property(issue, 'issue_title');
                    assert.property(issue, 'issue_text');
                    assert.property(issue, 'created_by');
                    assert.property(issue, 'created_on');
                    assert.property(issue, 'updated_on');
                });
                done()
            })
    })

    test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest?created_by=Paul')
            .end((err, res) => {
                assert.equal(res.status, 200)
                res.body.forEach(issue => {
                    assert.isObject(issue)
                    assert.property(issue, 'assigned_to');
                    assert.property(issue, 'status_text');
                    assert.property(issue, 'open');
                    assert.property(issue, '_id');
                    assert.property(issue, 'issue_title');
                    assert.property(issue, 'issue_text');
                    assert.property(issue, 'created_by');
                    assert.property(issue, 'created_on');
                    assert.property(issue, 'updated_on');
                    assert.strictEqual(issue.created_by, "Paul")
                })
                done()
            })
    })

    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest?created_by=Paul&assigned_to=John&status_text=Pending')
            .end((err, res) => {
                assert.equal(res.status, 200)
                res.body.forEach(issue => {
                    assert.isObject(issue)
                    assert.property(issue, 'assigned_to');
                    assert.property(issue, 'status_text');
                    assert.property(issue, 'open');
                    assert.property(issue, '_id');
                    assert.property(issue, 'issue_title');
                    assert.property(issue, 'issue_text');
                    assert.property(issue, 'created_by');
                    assert.property(issue, 'created_on');
                    assert.property(issue, 'updated_on');
                    assert.strictEqual(issue.created_by, "Paul")
                    assert.strictEqual(issue.assigned_to, "John")
                    assert.strictEqual(issue.status_text, "Pending")
                })
                done()
            })
    })

    test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest')
            .end((err, res) => {

                const issueToUpdate = res.body[0]
                const issueId = issueToUpdate._id

                chai
                    .request(server)
                    .keepOpen()
                    .put('/api/issues/apitest')
                    .send({
                        _id: issueId,
                        status_text: "Finished"
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.deepEqual(res.body, { result: 'successfully updated', '_id': issueId })
                        done()
                    })
                
            })
    })

    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest')
            .end((err, res) => {

                const issueToUpdate = res.body[0]
                const issueId = issueToUpdate._id

                chai
                    .request(server)
                    .keepOpen()
                    .put('/api/issues/apitest')
                    .send({
                        _id: issueId,
                        created_by: "Mark",
                        issue_text: "Updated issue text",
                        assigned_to: "Sara"
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.deepEqual(res.body, { result: 'successfully updated', '_id': issueId })
                        done()
                    })
            })
            
    })

    test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/apitest')
            .send({
                issue_text: "Updated issue text",
                assigned_to: "Sara"
            })
            .end((err, res) => {
                assert.deepEqual(res.body, { error: "missing _id" })
                done()
            })
    })

    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest')
            .end((err, res) => {

                const issueToUpdate = res.body[0]
                const issueId = issueToUpdate._id

                chai
                    .request(server)
                    .keepOpen()
                    .put('/api/issues/apitest')
                    .send({
                        _id: issueId
                    })
                    .end((err, res) => {
                        assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': issueId })
                        done()
                    })
            })
    })

    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
        const issueTestId = "aasd123ad"

        chai
            .request(server)
            .keepOpen()
            .put('/api/issues/apitest')
            .send({
                _id: issueTestId,
                assigned_to: "Mark"
            })
            .end((err, res) => {
                assert.deepEqual(res.body, { error: 'could not update', '_id': issueTestId })
                done()
            })
    })

    test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .get('/api/issues/apitest')
            .end((err, res) => {

                const issueToDelete = res.body[0]
                const issueId = issueToDelete._id

                chai
                    .request(server)
                    .keepOpen()
                    .delete('/api/issues/apitest')
                    .send({
                        _id: issueId
                    })
                    .end((err, res) => {
                        assert.equal(res.status, 200)
                        assert.deepEqual(res.body, { result: 'successfully deleted', '_id': issueId })
                        done()
                    })
            })
    })

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
        const issueId = "asd123"

        chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/apitest')
            .send({
                _id: issueId
            })
            .end((err, res) => {
                assert.deepEqual(res.body, { error: "could not delete", _id: issueId })
                done()
            })
    })

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .keepOpen()
            .delete('/api/issues/apitest')
            .send()
            .end((err, res) => {
                assert.deepEqual(res.body, { error: "missing _id" })
                done()
            })
    })
});
