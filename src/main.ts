import axios from 'axios';
import fs from 'fs';
import express from 'express';

const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const getLatestCommit = async (owner: string, repo: string) => {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
        const response = await axios.get(url);
        const latestCommit = response.data[0];

        if (latestCommit) {
            const commitData = {
                id: 0,
                sha: latestCommit.sha,
                message: latestCommit.commit.message,
                author: latestCommit.commit.author.name,
                date: latestCommit.commit.author.date,
            };

            fs.readFile('commitHistory.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                let commitHistory = JSON.parse(data);
                let repoCommit = commitHistory[repo] || [];
                commitData.id = repoCommit.length;
                repoCommit.push(commitData);
                commitHistory[repo] = repoCommit;

                fs.writeFile('commitHistory.json', JSON.stringify(commitHistory, null, 2), (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Dados de commit atualizados em commitHistory.json');
                    }
                });
            });
        } else {
            console.log('Nenhum commit encontrado');
        }
    } catch (error) {
        console.error(error);
    }
};

    const getLatestCommitsForRepos = async(repos: Array<{ owner: string; repo: string; }>) => {
        for(const {owner, repo } of repos) {
            await getLatestCommit(owner, repo);
        }
    }

const getAllCommits = async (owner: string, repo: string) => {
    let allCommits: any[] = [];
    let page = 1;
    const per_page = 100;

    while (true) {
        const url = `https://api.github.com/repos/${owner}/${repo}/commits?page=${page}&per_page=${per_page}`;
        const response = await axios.get(url);

        if (response.data.length === 0) {
            break;
        }

        allCommits = allCommits.concat(response.data);
        page++;
    }

    return allCommits;
};

app.get('/commit/:repoName/:id', (req, res) => {
    const repoName = req.params.repoName;
    const id = parseInt(req.params.id);

    fs.readFile('commitHistory.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erro ao ler o arquivo');
            return;
        }

        const commitHistory = JSON.parse(data);
        const commitData = commitHistory[repoName] && commitHistory[repoName].find((commit: { id: number; }) => commit.id === id);

        if (commitData) {
            res.json(commitData);
        } else {
            res.status(404).send('Commit não encontrado');
        }
    });
});

app.get('/commits', (req, res) => {
    fs.readFile('commitHistory.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Erro ao ler o arquivo');
            return;
        }

        const commitHistory = JSON.parse(data);
        res.json(commitHistory);
    });
});
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    getLatestCommitsForRepos([
        { owner: 'Mizerski', repo: 'Git' },
        { owner: 'vVuc', repo: 'Repository_Update_Notification_System' },

    ])
});

app.get('/all-commits/:owner/:repo', async (req, res) => {
    const { owner, repo } = req.params;

    try {
        const commits = await getAllCommits(owner, repo);
        res.json(commits);
    } catch (error) {
        res.status(500).send('Erro ao buscar todos os commits');
    }
});
