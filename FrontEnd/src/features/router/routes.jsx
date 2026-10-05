import { Route, Routes } from "react-router-dom";
import Layout from "../layout/layout";

function Routers() {
    const routers = [
    {path: "/", element: <h1>Home</h1>, layout: false},
]
  return (
    <div>
        {routers.map(route=>(
            <Routes>
                <Route path={route.path} element={route.layout ? <Layout>{route.element}</Layout> : route.element} />
            </Routes>
        ))}
    </div>
  )
}

export default Routers