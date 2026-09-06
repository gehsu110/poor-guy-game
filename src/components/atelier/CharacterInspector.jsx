import { useEffect, useRef, useState } from "react";
import PaintedCharacter from "../starpage/PaintedCharacter";
export default function CharacterInspector({ look, reduced, onClose }) {
  const dialog = useRef(null),
    [closeup, setCloseup] = useState(false),
    [greet, setGreet] = useState(0);
  useEffect(() => {
    const node = dialog.current,
      previous = document.activeElement;
    node.showModal();
    return () => {
      node.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="wind-inspector"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="wind-inspector-title"
    >
      <header>
        <div>
          <small>WIND ATELIER · 造型細節</small>
          <h2 id="wind-inspector-title">今天的搭配</h2>
        </div>
        <button onClick={onClose} aria-label="關閉人物細節">
          ×
        </button>
      </header>
      <div className="wind-inspector-stage">
        <PaintedCharacter
          look={look}
          interactive
          reduced={reduced}
          successPulse={greet}
          closeup={closeup}
        />
      </div>
      <footer>
        <button onClick={() => setCloseup(!closeup)}>
          {closeup ? "查看全身" : "近看細節"}
        </button>
        <button onClick={() => setGreet((g) => g + 1)}>和旅人說話</button>
      </footer>
    </dialog>
  );
}
