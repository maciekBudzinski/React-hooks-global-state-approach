import React, {
  useReducer,
  useState,
  useEffect,
  useContext,
  createContext
} from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const initialCount = localStorage.getItem("count", 0);

const CountContext = createContext();

function App() {
  const [state, actions] = useCountReducer();
  useLoadCount(actions.set);
  useSaveCount(state);

  return (
    <CountContext.Provider value={{ count: [state, actions] }}>
      <div className="App">
        <Setter />
        <Result />
      </div>
    </CountContext.Provider>
  );
}

function Setter() {
  const {
    count: [{}, { set }]
  } = useContext(CountContext);
  const value = useFormInput(initialCount);
  return (
    <div>
      <input {...value} />
      <button onClick={set(value.value)}>SET</button>
    </div>
  );
}

function Result() {
  const {
    count: [{ isValid, count }, { inc, dec }]
  } = useContext(CountContext);

  return (
    <div>
      <button disabled={!isValid} onClick={inc}>
        +
      </button>
      <h2>{count}</h2>
      <button disabled={!isValid} onClick={dec}>
        -
      </button>
    </div>
  );
}

const useCountReducer = (initialState = { count: 0, isValid: true }) => {
  const INC = "INC";
  const DEC = "DEC";
  const SET = "SET";
  const CLR = "CLR";

  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case INC:
        return { ...state, count: state.count + 1 };
      case DEC:
        return { ...state, count: state.count - 1 };
      case SET:
        return { ...state, count: +action.value, isValid: true };
      case CLR:
        return { ...state, count: "Put number", isValid: false };
      default:
        return state;
    }
  }, initialState);

  const actions = {
    inc: () => dispatch({ type: INC }),
    dec: () => dispatch({ type: DEC }),
    set: value => () =>
      isNaN(+value) ? dispatch({ type: CLR }) : dispatch({ type: SET, value })
  };

  return [state, actions];
};

const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);

  const onChange = event => {
    setValue(event.target.value);
  };

  return {
    value,
    onChange
  };
};

const useSaveCount = ({ count }) => {
  useEffect(() => {
    const save = () => localStorage.setItem("count", count);
    window.addEventListener("unload", save);
    return () => window.removeEventListener("unload", save);
  });
};

const useLoadCount = set => {
  let init = false;
  useEffect(
    () => {
      set(initialCount)();
      init = true;
    },
    [init]
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
