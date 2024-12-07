import logo from "./logo.svg";
import "./App.css";
import { useQuery, gql } from "@apollo/client";

const query = gql`
  query GetTodosWithUser {
    getTodos {
      id
      title
      completed
      user {
        id
        name
      }
    }
  }
`;

function App() {
  const { data, loading } = useQuery(query);

  if (loading) return <h1>Is Loading...</h1>;

  return <div className="App">{JSON.stringify(data)}</div>;
}

export default App;
