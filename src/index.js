import React from "./react";
import ReactDOM from "./react-dom";

// const element = (
//   <div id="A1" style={{ color: "red" }}>
//     A1
//     <div id="B1" style={{ color: "red" }}>
//       B1
//       <div style={{ color: "red" }}>C1</div>
//       <div style={{ color: "red" }}>C2</div>
//     </div>
//     <div id="B2" style={{ color: "red" }}>
//       B2
//     </div>
//   </div>
// );

// ReactDOM.render(element, document.getElementById("root"));

// document.getElementById("btn1").addEventListener(
//   "click",
//   () => {
//     const element2 = (
//       <div id="A1" style={{ color: "red" }}>
//         A1_new
//         <div id="B1" style={{ color: "red" }}>
//           B1_new
//           <div style={{ color: "red" }}>C1_new</div>
//           <div style={{ color: "red" }}>C2_new</div>
//         </div>
//         <div id="B2" style={{ color: "red" }}>
//           B2_new
//         </div>
//         <div id="B3">B3</div>
//       </div>
//     );
//     ReactDOM.render(element2, document.getElementById("root"));
//   },
//   false
// );

// document.getElementById("btn2").addEventListener(
//   "click",
//   () => {
//     const element2 = (
//       <div id="A1" style={{ color: "red" }}>
//         A1
//         <div id="B1" style={{ color: "red" }}>
//           B1
//           <div style={{ color: "red" }}>C1</div>
//           <div style={{ color: "red" }}>C2</div>
//         </div>
//         <div id="B2" style={{ color: "red" }}>
//           B2
//         </div>
//       </div>
//     );
//     ReactDOM.render(element2, document.getElementById("root"));
//   },
//   false
// );
class Counter extends React.Component {
  state = {
    count: 0,
  };
  handle = () => {
    this.setState({
      count: this.state.count + 1,
    });
  };
  render() {
    return (
      <div>
        <p>{this.state.count}</p>
        <button onClick={this.handle}>增加</button>
      </div>
    );
  }
}
ReactDOM.render(<Counter />, document.getElementById("root"));
