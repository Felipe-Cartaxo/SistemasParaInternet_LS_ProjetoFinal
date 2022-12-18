// 1) npm install
// 2) npm run server (deixe-o rodando)
// 3) abra outro terminal e dê um npm start

import './App.css';

import { useState, useEffect } from "react"; // importação dos hooks que utilizaremos no projeto
import { BsTrash, BsBookmarkCheck, BsBookmarkCheckFill } from "react-icons/bs"; // importação dos ícones do pacote react-icons

const API = "http://localhost:5000"; // ip da API que utilizaremos

function App() {
  const [title, setTitle] = useState("") // consultar o título da tarefa e atualizar o título da mesma, respectivamente
  const [time, setTime] = useState("") // consultar a duração da tarefa e atualizar a duração da mesma
  const [todos, setTodos] = useState([]) // array contendo as próprias tarefas e inserir as tarefas contidas no array
  const [loading, setLoading] = useState(false) // carregar e exibir os dados para o usuário durante o carregamento da página

  useEffect(() => { // carregar na página as tarefas contidas no array todos

    const loadData = async() => { // função que carrega os dados do array todos, que será executada quando a página carregar
      
      setLoading(true)

      const res = await fetch(API + "/todos") // vai carregar os dados diretamente da nossa API
        .then((res) => res.json())            // o primeiro then vai esperar uma resposta e transformá-la em JSON
        .then((data) => data)                 // o segundo pegará essa resposta em JSON e irá retornar esses dados
        .catch((err) => console.log(err));    // retornará um erro no console caso aconteça algum problema na requisição

      setLoading(false); // aqui a página já acabou de carregar

      setTodos(res); // resposta convertidas de JSON para um array de objetos
    }

    loadData() // espera os dados virem do backend
  }, []) // o segundo parâmetro [] é executa a função loadData quando a página carrega

  const handleSubmit = async (e) => { // para o envio do formulário e não quebra o fluxo do SPA / transforma o handleSubmit numa função assíncrona - para esperar a resposta do fetch
    e.preventDefault();

    const todo = {
      id: Math.random(), // cria um id aleatório para o item
      title,
      time,
      done: false, // propriedade inicial da tarefa, ou seja, ainda não foi concluída
    };

    // envio pada a API
    await fetch(API + "/todos", {
      method: "POST",
      body: JSON.stringify(todo), // converte para texto para tratar no backend (porque o backend não vai entender um dado de objeto JS)
      headers: { // padrão JSON de se comunicar
        "Content-type": "application/json",
      },
    })

    setTodos ((prevState) => [...prevState, todo]) // inclui uma nova tarefa na página sem a necessidade de atualizar a página inteira - pega o estado anterior do todos e adiciona no novo todo (lista de tarefas atual) 

    setTitle("");
    setTime("");
  }

  const handleDelete = async(id) => { //
    await fetch(API + "/todos/" + id, {
      method: "DELETE"
    });

    setTodos((prevState) => prevState.filter((todo) => todo.id !== id)); // compara todos os itens de TODO, e caso seja diferente, esse item será removido
  }

  const handleEdit = async(todo) => {
    todo.done = !todo.done; // ao clicar no botão, se a tarefa estiver marcada como concluída, ela será desmarcada (e vice-versa)

    const data = await fetch(API + "/todos/" + todo.id, { // pega os dados do banco
      method: "PUT",
      body: JSON.stringify(todo), // converte para texto para tratar no backend (porque o backend não vai entender um dado de objeto JS)
      headers: { // padrão JSON de se comunicar
        "Content-type": "application/json",
      },
    });

    setTodos((prevState) =>
      prevState.map((t) => (t.id === data.id ? (t = data) : t)) // vai atualizar todo objeto com o que veio do backend
    );
  }

  if(loading) { // evita que apareça a mensagem "Não há tarefas cadastradas" ao carregar a página
    return <p>Carregando...</p>
  }

  return (
    <div className="App">
      <div className='todo-header'>
        <h1>React ToDo App</h1>
      </div>

      <div className="form-todo">
        <h2>Insira a sua próxima tarefa: </h2>
        <form onSubmit={handleSubmit}> {/* evento que chama a função handleSubmit, que nesse caso envia os dados da tarefa para o servidor */}
          <div className="form-control">
            <label htmlFor="title">O que você vai fazer?</label>
            <input
              type="text"
              name="title"
              placeholder="Título da tarefa"
              onChange={(e) => setTitle(e.target.value)} // evento para captar a mudança do state a cada tecla que o usuário pressiona
              value={title || ""} // o title pode começar com o valor vazio, mas ao existir um valor para title, ele será mostrado
              pattern= "^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$" // permite que apenas letras, números e espaços sejam inseridos no input
            />
          </div>
          <div className="form-control">
            <label htmlFor="time">Duração:</label>
            <input
              type="text"
              name="time"
              placeholder="Tempo estimado (em horas)"
              onChange={(e) => setTime(e.target.value)} // evento para captar a mudança do state a cada tecla que o usuário pressiona
              value={time || ""} // o time pode começar com o valor vazio, mas ao existir um valor para title, ele será mostrado
              pattern="^(0|[1-9][0-9]*)$" // permite que apenas números sejam inseridos no input
              required
            />
          </div>
          <input
            type="submit"
            value="Criar tarefa"
          />
        </form>
      </div>

      <div className="list-todo">
        <h2>Lista de tarefas: </h2>
        {todos.length === 0 && <p>Não há tarefas cadastradas!</p>} {/* Se não houver tarefas cadastradas, será então mostrada a mensagem da renderização condicional*/}
        {todos.map((todo) => ( // percorre cada um dos itens de todo
          <div className="todo" key={todo.id}> {/*ao percorrer, utiliza o id (key) como chave única dos itens*/}
            <h3 className={todo.done ? "todo-done" : ""}>{todo.title}</h3> {/* incluirá então o título do objeto como título da tarefa*/}
            <p>Duração: {todo.time} h</p>
            <div className="actions">
              <span onClick={() => handleEdit(todo)}> {/* ao clicar no botão, a tarefa será marcada/desmarcada*/}
                {!todo.done ? <BsBookmarkCheck /> : <BsBookmarkCheckFill />} {/* se a tarefa não estiver pronta, será exibido o ícone para validar a tarefa, caso contrário será exibido o ícone de tarefa concluída*/}
              </span>
              <BsTrash onClick={() => handleDelete(todo.id)} /> {/* ao clicar no botão de lixeira, chama a função handleDelete*/}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}

export default App;