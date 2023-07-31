// Classe para acessar a API do GitHub e buscar informações do usuário
export class GithubUser {
    static async search(username) {
        // Cria a URL para acessar a API do GitHub com o nome de usuário fornecido
        const user = `https://api.github.com/users/${username}`;
        
        try {
            // Faz uma requisição assíncrona para a API do GitHub usando fetch
            const response = await fetch(user);

            // Se a resposta não for bem-sucedida, lança um erro
            if (!response.ok) {
                throw new Error('Erro no acesso a API');
            }

            // Converte a resposta para JSON e retorna os dados do usuário
            const data = await response.json();
            return data;
            
        } catch (error) {
            // Em caso de erro, exibe a mensagem de erro no console e retorna null
            console.error('Erro:', error.message);
            return null;
        }
    }
}

// Classe para gerenciar meus dados favoritos
export class Favorites {
    // Método construtor
    constructor(root) {
        // Seleciona o elemento raiz onde os dados serão exibidos
        this.root = document.querySelector(root);

        // Chama o método "load" para carregar os dados favoritos do localStorage
        this.load();
    }
    
    // Método para carregar os dados favoritos do localStorage
    load() {
        // Obtém os dados favoritos do localStorage com base na chave "githubFavorites:"
        // Se não houver dados, inicializa this.entries com um array vazio
        this.entries = JSON.parse(localStorage.getItem('githubFavorites:')) || [];
    }

    save() {
        localStorage.setItem('githubFavorites:', JSON.stringify(this.entries));
    }

    // Método assíncrono para adicionar um novo usuário aos favoritos
    async add(username) {
        try {

            const userExists = this.entries.find(entry =>entry.login == username);

            if(userExists) {
                throw new error('Usuário já cadastrado');
            }

            // Busca informações do usuário usando a classe GithubUser
            const userData = await GithubUser.search(username);

            if (userData) {
                // Se as informações do usuário forem encontradas, faz a desestruturação
                // e mantém apenas as informações necessárias (login, name, public_repos e followers)
                ({ login, name, public_repos, followers }) => ({
                    login,
                    name,
                    public_repos,
                    followers,
                });
            }

            // Adiciona as informações do em um novo array junto com os antigos
            // Imutabilidade
            this.entries = [userData, ...this.entries];

            // Atualiza a exibição na página
            this.update();
            this.save();
                
        } catch (error) {
            // Em caso de erro, exibe a mensagem de erro no console
            console.error('Erro:', error.message);
        }
    }
    
    // Método para remover um usuário dos favoritos
    delete(user) {
        // Filtra as entries e mantém apenas os usuários cujo login é diferente do usuário a ser removido
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login);

        // Atualiza this.entries com o novo array filtrado
        this.entries = filteredEntries;

        // Atualiza a exibição na página
        this.update();
        //Atualiza a minha lista, uma vez que eu deletei um usuário
        this.save();
    } 
}

// Classe para exibir os favoritos na página HTML
export class FavoritesView extends Favorites {
    // Método construtor
    constructor(root) {
        // Chama o método construtor da classe pai (Favorites) e passa o elemento raiz como argumento
        super(root);

        // Obtém a referência ao elemento "tbody" da tabela dentro do elemento raiz
        this.tbody = this.root.querySelector("table tbody");

        // Chama o método "update" para renderizar os dados na página HTML
        this.update();

        // Define o evento de clique para o botão de adicionar favorito
        this.onadd();
    }

    // Método para adicionar um evento de clique ao botão de adicionar favorito
    onadd() {
        const addButton = this.root.querySelector(".search button");
        
        addButton.onclick = () => {
            // Obtém o valor digitado no campo de busca
            const { value } = this.root.querySelector("#input-search");

            // Chama o método "add" para adicionar o usuário aos favoritos
            this.add(value);
        };
    }

    // Método para atualizar a exibição dos favoritos na página HTML
    update() {
        // Chama a função para deletar todas as linhas da tabela
        this.removeAllTr();

        // Itera sobre os usuários presentes em "this.entries" para exibir cada um deles na tabela
        this.entries.forEach(user => {
            // Cria uma nova linha da tabela usando os dados do usuário atual
            const row = this.createRow();

            // Define a imagem de perfil do usuário usando seu login do GitHub
            row.querySelector(".user img").src = `https://github.com/${user.login}.png`;

            // Define o link do githug da pessoa
            row.querySelector("a").href = `https://github.com/${user.login}`

            // Define o login e o nome do usuário na linha da tabela
            row.querySelector("a p").textContent = `${user.login}`;
            row.querySelector("a span").textContent = `${user.name}`;

            // Define a quantidade de repositórios e seguidores do usuário na linha da tabela
            row.querySelector(".repositories").textContent = `${user.public_repos}`;
            row.querySelector(".follower").textContent = `${user.followers}`;

            // Define o evento de clique para o botão de remover
            row.querySelector("button").onclick = () => { 
                const isOK = confirm('Tem certeza que deseja deletar essa linha?');

                if (isOK) {
                    // Chama o método "delete" para remover o usuário dos favoritos
                    this.delete(user);
                }
            };

            // Adiciona a nova linha criada à tabela
            this.tbody.append(row);
        });
    }

    // Método para criar uma nova linha da tabela com base nos dados do usuário
    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="user">
                <img src="https://github.com/maykbrito.png" alt="Imagem do mayk">
                <a href="https://github.com/maykbrito" target="_blank">
                    <p>vinicius</p>
                    <span>Vitaedoca</span>
                </a>
            </td>
            <td class="repositories">
                76
            </td>
            <td class="follower">
                9589
            </td>
            <td>
                <button class="remove">Remover</button class="remove">
            </td>
        `;

        return tr;
    }

    // Método para deletar todas as linhas da tabela
    removeAllTr() {
        // Seleciona todas as linhas da tabela e as remove
        this.tbody.querySelectorAll('tr')
            .forEach((tr) => {
                tr.remove();
        });
    }
}
