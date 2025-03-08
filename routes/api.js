'use strict';
const crypto = require('crypto')

let projects = [
  {
    name: "apitest",
    issues: []
  }
]

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const { project } = req.params
      const {
        assigned_to,
        status_text,
        open,
        _id,
        issue_title,
        issue_text,
        created_by,
        created_on,
        updated_on
      } = req.query

      const selectedProject = projects.find(p => p.name === project) 
      if (!selectedProject) return res.json([])

      const filteredIssues = selectedProject.issues.filter(i => {
        return (
          (assigned_to ? i.assigned_to === assigned_to : true) &&
          (status_text ? i.status_text === status_text : true) &&
          (open ? i.open === open : true) &&
          (_id ? i._id === _id : true) &&
          (issue_title ? i.issue_title === issue_title : true) &&
          (issue_text ? i.issue_text === issue_text : true) &&
          (created_by ? i.created_by === created_by : true) &&
          (created_on ? i.created_on === created_on : true) &&
          (updated_on ? i.updated_on === updated_on : true)
        )
      })

      res.json(filteredIssues)

    })

    .post(function (req, res){
      const { project } = req.params
      const { 
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body

      if (!issue_title || !issue_text || !created_by)
        return res.json({ error: "required field(s) missing" })

      const newIssue = {
        "assigned_to": assigned_to || "",
        "status_text": status_text || "",
        "open": true,
        "_id": crypto.randomUUID(),
        "issue_title": issue_title,
        "issue_text": issue_text,
        "created_by": created_by,
        "created_on": new Date(),
        "updated_on": new Date()
      }

      const selectedProject = projects.find(p => p.name === project)

      if(selectedProject) {
        selectedProject.issues.push(newIssue)
      } else {
        projects.push({
          name: project,
          issues: [ newIssue ]
        })
      } 

      res.json(newIssue)
    })
    
    .put(function (req, res){
      const { project } = req.params
      /*   
      updates:
        issue_text
        created_by
        assigned_to
        status_text
      */
      const { 
        _id,
        ...updates
      } = req.body
      
      if (!_id) return res.json({ error: "missing _id" })
      if (Object.keys(updates).length === 0) return res.json({ error: 'no update field(s) sent', '_id': _id })

      const selectedProject = projects.find(p => p.name === project)
      const selectedIssues = selectedProject.issues

      let issue = selectedIssues.find(i => i._id === _id)
      if (!issue) return res.json({ error: 'could not update', '_id': _id })

      Object.assign(issue, updates, { "updated_on": new Date() })
      
      res.json({ result: 'successfully updated', '_id': _id })
    })
    
    .delete(function (req, res){
      const { project } = req.params
      const { _id } = req.body

      if (!_id) return res.json({ error: "missing _id" })
      
      const selectedProject = projects.find(p => p.name === project)
      const selectedIssues = selectedProject.issues

      const indexToDelete = selectedIssues.findIndex(i => i._id === _id)
      if (indexToDelete === -1) return res.json({ error: "could not delete", _id });

      selectedIssues.splice(indexToDelete, 1)

      res.json({ result: 'successfully deleted', '_id': _id })


    });
    
};
