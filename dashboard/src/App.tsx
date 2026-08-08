import { Provider } from 'react-redux';
import { store } from './store';
import Dashboard from './Dashboard';
import './styles.css';

// Obs.: o Design System (web components) é registrado UMA vez, pelo shell.
// Custom elements são globais na página, então o remote apenas usa os <bb-*>
// já definidos — importar o DS aqui causaria "bb-button already defined".
// (Para rodar o remote isolado, o DS é carregado em standalone.tsx.)
export default function App() {
  return (
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
}
