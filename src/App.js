import "./App.css";
import { useEffect, useState, useRef } from "react";

function App() {
  const [playing, setPlaying] = useState(false);
  const [pitch, setPitch] = useState(0.5);
  const [tune, setTune] = useState(0.035);
  const [ilower, setIlower] = useState(0.35);
  const [irandomeness, setIrandomeness] = useState(0.3);
  const state = useRef({ v: -2, w: 0, pitch, tune, ilower, irandomeness });
  const canvas = useRef(null);

  useEffect(() => {
    state.current.pitch = pitch;
    state.current.tune = tune;
    state.current.ilower = ilower;
    state.current.irandomeness = irandomeness;
  }, [pitch, tune, ilower, irandomeness]);

  useEffect(() => {
    if (playing) {
      const ac = new AudioContext();
      const sn = ac.createScriptProcessor(4096, 1, 1);
      sn.onaudioprocess = (e) => {
        const buf = e.outputBuffer.getChannelData(0);
        let { v, w, pitch, tune, ilower, irandomeness } = state.current;
        const timestep = 2 ** pitch * tune;
        for (let i = 0; i < buf.length; ++i) {
          const dv =
            timestep *
            (v -
              (v * v * v) / 3 -
              w +
              ilower +
              Math.random() * irandomeness -
              irandomeness / 2);
          const dw = timestep * (0.08 * (v + 0.7 - 0.8 * w));
          v += dv;
          w += dw;
          buf[i] = v * 0.05;
        }
        state.current.v = isNaN(v) ? 0 : v;
        state.current.w = isNaN(w) ? 0 : w;

        const ctx = canvas.current.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 320, 240);
        ctx.fillStyle = "white";
        for (let i = 0; i < buf.length; ++i) {
          ctx.fillRect(i, 120 - buf[i * 4] * 120, 1, 1);
        }
      };
      sn.connect(ac.destination);
      return () => sn.disconnect();
    }
  }, [playing]);

  return (
    <div className="App">
      <button onClick={() => setPlaying((b) => !b)}>
        {playing ? "stop" : "play"}
      </button>
      <table style={{ margin: "0 auto" }}>
        <thead>
          <tr>
            <td>parameter</td>
            <td>value</td>
            <td>current value</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>pitch</td>
            <td>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
              ></input>
            </td>
            <td>{pitch}</td>
          </tr>
          <tr>
            <td>input</td>
            <td>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={ilower}
                onChange={(e) => setIlower(+e.target.value)}
              ></input>
            </td>
            <td>{ilower}</td>
          </tr>
          <tr>
            <td>input randomness</td>
            <td>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={irandomeness}
                onChange={(e) => setIrandomeness(e.target.value)}
              ></input>
            </td>
            <td>{irandomeness}</td>
          </tr>
        </tbody>
      </table>
      <canvas ref={canvas} width="320" height="240" />
    </div>
  );
}

export default App;
