import container from "./lib/container"
import Layout from "./components/Layout"
import http from "./lib/http"

export {
    container,
    Layout,
    http,
}

export const Form = () => import("./components/Form")
export const Table = () => import("./components/Table")
export const Tabs = () => import("./components/Tabs")