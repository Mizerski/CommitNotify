async function getCommitById() {
    const commitId = document.getElementById("commitId").value;
    const repoName = document.getElementById("repoName").value;
    if (!commitId || !repoName) {
        alert("Por favor, digite um ID de commit e nome do repositório válidos");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/commit/${repoName}/${commitId}`);


        if (response.status === 404) {
            alert('Commit não encontrado');
            return;
        }

        if (!response.ok) {
            alert('Erro ao buscar o commit');
            return;
        }

        const commitData = await response.json();
        displayCommitInfo(commitData);
    } catch (error) {
        alert('Erro ao realizar a requisição');
    }
}

function displayCommitInfo(data) {
    document.getElementById("commitInfo").innerHTML = `
        <h2>Informações do Commit</h2>
        <ul>
            <li>ID: ${data.id}</li>
            <li>SHA: ${data.sha}</li>
            <li>Mensagem: ${data.message}</li>
            <li>Autor: ${data.author}</li>
            <li>Data: ${data.date}</li>
        </ul>
    `;
}

async function getAllCommits() {
    try {
        const response = await fetch('http://localhost:3000/commits');
        if (!response.ok) {
            alert('Erro ao buscar commits');
            return;
        }

        const commitData = await response.json();
        displayAllCommits(commitData);
    } catch (error) {
        alert('Erro ao realizar a requisição');
    }
}

function displayAllCommits(data) {
    let htmlContent = '<h2>Lista de Todos os Commits</h2>';
    for (const repo in data) {
        htmlContent += `<h3>Repositório: ${repo}</h3><ul>`;
        data[repo].forEach(commit => {
            htmlContent += `
                <li>
                    ID: ${commit.id}, SHA: ${commit.sha}, Mensagem: ${commit.message},
                    Autor: ${commit.author}, Data: ${commit.date}
                </li>
            `;
        });
        htmlContent += '</ul>';
    }
    document.getElementById('allCommitInfo').innerHTML = htmlContent;
}



async function getAllRepoCommits() {
    const repoName = document.getElementById("repoName").value;
    const owner = document.getElementById("ownerName").value;
    if (!repoName || !owner) {
        alert("Por favor, digite um nome de repositório e um nome de proprietário válidos");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/all-commits/${owner}/${repoName}`);
        if (!response.ok) {
            alert('Erro ao buscar commits');
            return;
        }

        const commitData = await response.json();
        displayAllRepoCommits(commitData, repoName);
    } catch (error) {
        alert('Erro ao realizar a requisição');
    }
}


function displayAllRepoCommits(data, repoName) {
    let htmlContent = `<h2>Lista de Todos os Commits do Repositório ${repoName}</h2><ul>`;
    data.forEach(commit => {
        htmlContent += `
            <li>
                SHA: ${commit.sha}, Mensagem: ${commit.commit.message},
                Autor: ${commit.commit.author.name}, Data: ${commit.commit.author.date}
            </li>
        `;
    });
    htmlContent += '</ul>';
    document.getElementById('allCommitInfo').innerHTML = htmlContent;
}
