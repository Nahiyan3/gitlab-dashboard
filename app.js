require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public')); 

const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const GITLAB_USERNAME = process.env.GITLAB_USERNAME;

// Home route - fetch GitLab projects
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`https://gitlab.com/api/v4/users/${GITLAB_USERNAME}/projects`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });
        const projects = response.data;
        res.render('index', { projects });
    } catch (error) {
        console.error(error.message);
        res.send("Error fetching projects from GitLab");
    }
});




app.get('/project/:id', async (req, res) => {
    const projectId = req.params.id;
    try {
        // Fetch project info
        const projectResponse = await axios.get(`https://gitlab.com/api/v4/projects/${projectId}`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });

        // Fetch commits
        const commitsResponse = await axios.get(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });

        // Fetch all issues
        const issuesResponse = await axios.get(`https://gitlab.com/api/v4/projects/${projectId}/issues?per_page=100`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });

        // Fetch branches
        const branchesResponse = await axios.get(`https://gitlab.com/api/v4/projects/${projectId}/repository/branches`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });
        // Fetch merge requests
         const [openMRs, closedMRs, mergedMRs] = await Promise.all([
            axios.get(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=opened&per_page=100`, {
                headers: { 'Private-Token': GITLAB_TOKEN }
            }),
            axios.get(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=closed&per_page=100`, {
                headers: { 'Private-Token': GITLAB_TOKEN }
            }),
            axios.get(`https://gitlab.com/api/v4/projects/${projectId}/merge_requests?state=merged&per_page=100`, {
                headers: { 'Private-Token': GITLAB_TOKEN }
            })
        ]);

        const project = projectResponse.data;
        const commits = commitsResponse.data;
        const totalCommits = commits.length;
        const branches = branchesResponse.data;

        const totalIssues = issuesResponse.data.length;
        const openIssues = issuesResponse.data.filter(issue => issue.state === 'opened').length;
        const closedIssues = issuesResponse.data.filter(issue => issue.state === 'closed').length;
        const totalBranches = branches.length;
        const openMR = openMRs.data.length;
        const closedMR = closedMRs.data.length;
        const mergedMR = mergedMRs.data.length;

        res.render('project', { project, totalCommits, totalIssues, openIssues, closedIssues, totalBranches, openMR, closedMR, mergedMR });
    } catch (error) {
        console.error(error.message);
        res.send("Error fetching project details");
    }
});



const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
