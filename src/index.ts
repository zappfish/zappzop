import { h, render } from "preact";
import Main from "./components/Main";

const el = document.getElementById("application")!;
render(h(Main, null), el);
