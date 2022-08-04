const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "Usarname not found!" });
  }

  request.user = user;
  return next();
  
}

// Cadastro do usuário
app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some((user) => user.username === username);

    if (userAlreadyExists) {
        return response.status(400).json({ error: "Usarname already exists!" });
    }

    const user = {
      id: uuidv4(),
      name, 
      username,
      todos: []
    }

    users.push(user);

    return response.status(201).json(user);

});


// Buscar lista de atividades 
app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    return response.json(user.todos); 

});


// Publicar tarefas
app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);

});


// Buscar tarefa pelo ID - AVALIAR
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { title, deadline } = request.body;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if(!todo) {
      return response.status(404).json({ error: "Todo not found!"})
    }

    todo.title = title;
    todo.deadline = new Date(deadline);
    
    return response.json(todo);

});


  // Alterar conclusão da tarefa por ID
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params;

    const todo = user.todos.find(todo => todo.id === id);

    if(!todo) {
      return response.status(404).json({ error: "Todo not found!"})
    }

    todo.done = true;
    return response.json(todo);

});


  // Deletar tarefa por ID
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request; 
    const { id } = request.params;

    // FindIndex para encontrar a posição do item desejado.
    const todoIndex = user.todos.findIndex(todo => todo.id === id);

    // Se todoIndex for igual a -1, então quer dizer que não foi encontrado.
    if(todoIndex === -1) {
      return response.status(404).json({ error: "Todo not found!"})
    }

    user.todos.splice(todoIndex, 1);

    return response.status(204).json();

});


module.exports = app;

app.listen(3333);