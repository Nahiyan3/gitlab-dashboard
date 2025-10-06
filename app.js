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
        const projectResponse = await axios.get(`https://gitlab.com/api/v4/projects/${projectId}`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });

        const commitsResponse = await axios.get(`https://gitlab.com/api/v4/projects/${projectId}/repository/commits`, {
            headers: { 'Private-Token': GITLAB_TOKEN }
        });

        const project = projectResponse.data;
        const commits = commitsResponse.data;
        const totalCommits = commits.length; // Total number of commits

        res.render('project', { project, totalCommits });
    } catch (error) {
        console.error(error.message);
        res.send("Error fetching project details");
    }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
